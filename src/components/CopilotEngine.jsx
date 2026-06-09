import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  CheckCircle2,
  Bot,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { matchIntent, executeIntent, extractParameters } from "./CopilotIntentEngine";
import { useI18n } from "./I18nProvider";

export default function CopilotEngine({ user, currentPage, pageContext }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const { t } = useI18n();

  const { data: messages = [] } = useQuery({
    queryKey: ["chatMessages", user?.email],
    queryFn: () => base44.entities.ChatMessage.filter({
      user_email: user.email
    }, "-created_date", 30),
    enabled: !!user
  });

  const createMessageMutation = useMutation({
    mutationFn: (msg) => base44.entities.ChatMessage.create(msg),
    onSuccess: () => {
      queryClient.invalidateQueries(["chatMessages"]);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for voice-input from AICopilot page
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.text) setMessage(e.detail.text);
    };
    window.addEventListener("copilot:voice-input", handler);
    return () => window.removeEventListener("copilot:voice-input", handler);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const userMessage = {
      user_email: user.email,
      message: message,
      role: "user",
      message_type: "text",
      context: {
        page_name: currentPage,
        page_data: pageContext
      }
    };

    await createMessageMutation.mutateAsync(userMessage);
    const userMsg = message;
    setMessage("");
    setIsProcessing(true);

    try {
      // 1. Try intent matching first
      const intentMatch = matchIntent(userMsg);
      
      if (intentMatch && intentMatch.confidence >= 0.6) {
        // Execute intent-based action
        const params = extractParameters(userMsg, intentMatch.intentKey);
        const result = await executeIntent(intentMatch.intentKey, params, user);

        await createMessageMutation.mutateAsync({
          user_email: user.email,
          message: result.message,
          role: "assistant",
          message_type: result.success ? "quick_action" : "text",
          context: {
            page_name: currentPage,
            intent_matched: intentMatch.intentKey,
            confidence: intentMatch.confidence
          }
        });
        window.__copilotSpeak?.(result.message);

      } else {
        // 2. Fall back to conversational AI
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert AI assistant for AI Freedom Studios platform.

User message: "${userMsg}"
Current page: ${currentPage}
Context: ${JSON.stringify(pageContext)}

Recent conversation:
${messages.slice(-3).map(m => `${m.role}: ${m.message}`).join('\n')}

Provide helpful response:
1. Direct answer to their question
2. Relevant tips for current page
3. Quick actions they can take (2-3 buttons)

Available intents you can trigger:
- offer.score - Score offers with belief framework
- followup.generate - Create 10-touch sequences
- ads.launch - Deploy campaigns
- analytics.nba - Get next-best-actions
- budget.optimize - Optimize ad spend
- video.create - Create video projects
- ctv.setup - Guided CTV workflow
- content.ideas - Trending content suggestions
- abtest.create - Create A/B tests

If user's request matches an intent, suggest they try that command.

Be conversational, helpful, and concise (2-3 sentences max).`,
          response_json_schema: {
            type: "object",
            properties: {
              response_text: { type: "string" },
              quick_actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    action: { type: "string" },
                    icon: { type: "string" }
                  }
                }
              },
              suggested_intent: { type: "string" },
              confidence: { type: "number" }
            }
          }
        });

        await createMessageMutation.mutateAsync({
          user_email: user.email,
          message: response.response_text,
          role: "assistant",
          message_type: "text",
          context: {
            page_name: currentPage
          },
          suggested_actions: response.quick_actions
        });
        window.__copilotSpeak?.(response.response_text);

        // Log copilot action
        await base44.entities.CopilotAction.create({
          user_email: user.email,
          command: userMsg,
          intent: response.suggested_intent || "general_query",
          params: { page: currentPage },
          mode: "reactive",
          personality: "mentor",
          status: "success",
          confidence: response.confidence
        });
      }

    } catch (error) {
      console.error("Copilot error:", error);
      await createMessageMutation.mutateAsync({
        user_email: user.email,
        message: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        message_type: "text"
      });
    }

    setIsProcessing(false);
  };

  const executeQuickAction = async (action) => {
    if (action.action.startsWith("intent:")) {
      const intentKey = action.action.replace("intent:", "");
      setIsProcessing(true);
      const result = await executeIntent(intentKey, {}, user);
      await createMessageMutation.mutateAsync({
        user_email: user.email,
        message: result.message,
        role: "assistant",
        message_type: "quick_action"
      });
      setIsProcessing(false);
    } else if (action.action.startsWith("navigate:")) {
      const page = action.action.replace("navigate:", "");
      window.location.href = `/#/${page}`;
    } else if (action.action === "generate_content_ideas") {
      setMessage("Give me 5 content ideas for this week");
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-white font-bold mb-2">{t('copilot_ready')}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {t('ask_copilot')}
            </p>
            <div className="space-y-2 max-w-md mx-auto">
              {[
                { label: t('intent.offer.score'), intent: "offer.score", icon: Target },
                { label: t('intent.followup.generate'), intent: "followup.generate", icon: Zap },
                { label: t('intent.content.ideas'), intent: "content.ideas", icon: Lightbulb },
                { label: t('intent.analytics.nba'), intent: "analytics.nba", icon: CheckCircle2 }
              ].map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <Button
                    key={idx}
                    onClick={() => setMessage(suggestion.label)}
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-700 text-white hover:bg-[#0B0B0C] justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2 text-[#FFD700]" />
                    {suggestion.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <AnimatePresence key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                )}
                
                <div>
                  <div
                    className={`p-3 rounded-xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] text-white"
                        : "bg-[#111317] text-gray-300 border border-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  {msg.suggested_actions?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.suggested_actions.map((action, aIdx) => (
                        <Button
                          key={aIdx}
                          onClick={() => executeQuickAction(action)}
                          size="sm"
                          variant="outline"
                          className="w-full border-[#6F1AB1]/30 text-white hover:bg-[#6F1AB1]/10 justify-start text-xs"
                        >
                          {action.icon === "zap" && <Zap className="w-3 h-3 mr-2" />}
                          {action.icon === "target" && <Target className="w-3 h-3 mr-2" />}
                          {action.icon === "sparkles" && <Sparkles className="w-3 h-3 mr-2" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <div className="bg-[#111317] border border-gray-800 p-3 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-[#6F1AB1]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-[#0B0B0C]">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t('ask_copilot')}
            className="bg-[#111317] border-gray-700 text-white"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isProcessing}
            className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-gray-500 text-xs">
            🧠 Intent recognition active • Context-aware
          </p>
          <Badge className="bg-green-500/20 text-green-400 text-xs">
            {Object.keys(window.AFS_COPILOT_INTENTS || {}).length} intents loaded
          </Badge>
        </div>
      </div>

    </div>
  );
}