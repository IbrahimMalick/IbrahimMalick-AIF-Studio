import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Sparkles,
  Zap,
  Bot,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "./AudioSystem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CopilotEngine from "./CopilotEngine";

export default function ChatWidget({ user, currentPage }) {
  const queryClient = useQueryClient();
  const audio = useAudioFeedback();
  const messagesEndRef = useRef(null);
  const copilotEngineRef = useRef(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Initialize Copilot Engine
  useEffect(() => {
    if (user?.email && !copilotEngineRef.current) {
      copilotEngineRef.current = new CopilotEngine(user.email);
    }
  }, [user]);

  const { data: messages = [] } = useQuery({
    queryKey: ["chatMessages", user?.email, sessionId],
    queryFn: () => base44.entities.ChatMessage.filter({
      user_email: user.email
    }, "-created_date", 50),
    enabled: !!user?.email && isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg) => {
      const copilot = copilotEngineRef.current;
      if (!copilot) throw new Error("Copilot not initialized");

      // Create user message
      await base44.entities.ChatMessage.create({
        user_email: user.email,
        message: msg,
        role: "user",
        message_type: "text"
      });

      setIsTyping(true);

      // Parse intent
      const { intent, params, confidence } = await copilot.parseIntent(msg);

      // Validate parameters
      const validation = copilot.validateParams(intent, params);
      
      if (!validation.valid) {
        // Respond with validation errors
        await base44.entities.ChatMessage.create({
          user_email: user.email,
          message: `I couldn't execute that action. ${validation.errors.join(". ")}`,
          role: "assistant",
          message_type: "error"
        });
        setIsTyping(false);
        return;
      }

      // Check if this is an actionable command
      const actionableIntents = [
        "create_video", "generate_image", "schedule_post", "send_email",
        "analyze_data", "create_automation", "render_video", "generate_caption",
        "optimize_seo", "create_campaign"
      ];

      if (actionableIntents.includes(intent) && confidence > 0.6) {
        // Create action
        const action = await copilot.createAction(
          sessionId,
          msg,
          intent,
          params,
          confidence,
          confidence < 0.85 // Require confirmation if confidence is low
        );

        if (confidence < 0.85) {
          // Show confirmation dialog
          const confirmText = copilot.generateConfirmationText(intent, params);
          setPendingAction({ action, confirmText });
          setShowConfirmDialog(true);

          await base44.entities.ChatMessage.create({
            user_email: user.email,
            message: `${confirmText}\n\nConfidence: ${Math.round(confidence * 100)}%`,
            role: "assistant",
            message_type: "confirmation",
            metadata: { action_id: action.id, intent, params }
          });
        } else {
          // Auto-execute with high confidence
          try {
            const result = await copilot.executeAction(action.id, intent, params);
            
            await base44.entities.ChatMessage.create({
              user_email: user.email,
              message: result.message,
              role: "assistant",
              message_type: "action_result",
              metadata: { action_id: action.id, result }
            });
          } catch (error) {
            await base44.entities.ChatMessage.create({
              user_email: user.email,
              message: `Failed to execute action: ${error.message}`,
              role: "assistant",
              message_type: "error"
            });
          }
        }
      } else {
        // Regular conversational response
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are AIFreedomDuane Studio AI Assistant. Answer this question helpfully and concisely:\n\n${msg}`,
        });

        await base44.entities.ChatMessage.create({
          user_email: user.email,
          message: response,
          role: "assistant",
          message_type: "text"
        });
      }

      setIsTyping(false);
      queryClient.invalidateQueries(["chatMessages"]);
    },
  });

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      setShowConfirmDialog(false);
      setIsTyping(true);

      const copilot = copilotEngineRef.current;
      const result = await copilot.confirmAction(pendingAction.action.id);

      await base44.entities.ChatMessage.create({
        user_email: user.email,
        message: result.message,
        role: "assistant",
        message_type: "action_result",
        metadata: { action_id: pendingAction.action.id, result }
      });

      setPendingAction(null);
      setIsTyping(false);
      queryClient.invalidateQueries(["chatMessages"]);
      queryClient.invalidateQueries(["copilotActions"]); // Refresh logs
      audio?.playSuccess();
    } catch (error) {
      setIsTyping(false);
      audio?.playError();
    }
  };

  const handleCancelAction = async () => {
    if (!pendingAction) return;

    try {
      const copilot = copilotEngineRef.current;
      await copilot.cancelAction(pendingAction.action.id);

      await base44.entities.ChatMessage.create({
        user_email: user.email,
        message: "Action cancelled.",
        role: "assistant",
        message_type: "text"
      });

      setPendingAction(null);
      setShowConfirmDialog(false);
      queryClient.invalidateQueries(["chatMessages"]);
      queryClient.invalidateQueries(["copilotActions"]); // Refresh logs
    } catch (error) {
      console.error("Cancel error:", error);
    }
  };

  const handleSend = () => {
    if (!message.trim() || isTyping) return;
    sendMessageMutation.mutate(message);
    setMessage("");
    audio?.playClick();
  };

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  if (!user) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => {
                setIsOpen(true);
                audio?.playClick();
                setUnreadCount(0);
              }}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C44569] hover:scale-110 transition-transform shadow-2xl relative"
            >
              <MessageCircle className="h-7 w-7 text-white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 600
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 bg-[#151515] rounded-2xl shadow-2xl border border-[#FFD700]/20 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Copilot</h3>
                  <p className="text-xs text-white/80">Your creative assistant</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-[440px] overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#FFD700]" />
                      <p className="text-sm">Hi! I'm your AI Copilot.</p>
                      <p className="text-xs mt-2">I can help you create videos, generate images, schedule posts, and more!</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="p-2 bg-gradient-to-br from-[#FF6B9D] to-[#C44569] rounded-lg h-fit">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-[#FFD700] text-black"
                            : msg.message_type === "error"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : msg.message_type === "confirmation"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-[#1F1F1F] text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        
                        {msg.message_type === "confirmation" && msg.metadata?.action_id && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={handleConfirmAction}
                              className="bg-green-500 hover:bg-green-600 text-white flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelAction}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                        
                        {msg.message_type === "action_result" && msg.metadata?.result && (
                          <div className="mt-2 flex items-center gap-2 text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs">Action completed</span>
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="p-2 bg-[#00D4C9] rounded-lg h-fit">
                          <UserIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#FF6B9D] to-[#C44569] rounded-lg h-fit">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-[#1F1F1F] p-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin text-[#FFD700]" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-[#1F1F1F] border-t border-[#FFD700]/20">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask me anything..."
                      disabled={isTyping}
                      className="bg-[#0C0C0C] border-[#FFD700]/30 text-white placeholder:text-gray-500"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim() || isTyping}
                      className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.confirmText}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirm & Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}