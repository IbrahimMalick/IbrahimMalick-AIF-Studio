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
  User,
  Bot,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Minimize2,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "./AudioSystem";
import { showToast } from "./ToastNotification";

export default function LiveChatSupport({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const audio = useAudioFeedback();
  const queryClient = useQueryClient();

  const { data: session, refetch } = useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const sessions = await base44.entities.LiveChatSession.filter({ session_id: sessionId });
      return sessions[0] || null;
    },
    enabled: !!sessionId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (msg) => {
      let currentSession = session;

      // Create session if doesn't exist
      if (!currentSession) {
        const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        currentSession = await base44.entities.LiveChatSession.create({
          user_email: user.email,
          session_id: newSessionId,
          status: "active",
          is_ai_handled: true,
          category: "general",
          messages: [],
          started_at: new Date().toISOString()
        });
        setSessionId(newSessionId);
      }

      // Add user message
      const updatedMessages = [
        ...(currentSession.messages || []),
        {
          role: "user",
          message: msg,
          timestamp: new Date().toISOString()
        }
      ];

      await base44.entities.LiveChatSession.update(currentSession.id, {
        messages: updatedMessages
      });

      // Get AI response
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful support agent for AIFreedomDuane Studio. 
        User question: ${msg}
        
        Previous conversation: ${JSON.stringify(currentSession.messages || [])}
        
        Provide a helpful, friendly, and concise response. If the issue requires human help, say so.`
      });

      // Determine if needs human escalation
      const needsHuman = aiResponse.toLowerCase().includes("escalate") || 
                         aiResponse.toLowerCase().includes("human agent") ||
                         msg.toLowerCase().includes("speak to human");

      // Add AI response
      const finalMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          message: aiResponse,
          timestamp: new Date().toISOString()
        }
      ];

      await base44.entities.LiveChatSession.update(currentSession.id, {
        messages: finalMessages,
        escalated_to_human: needsHuman,
        ...(needsHuman && { escalation_reason: "User requested or AI determined human help needed" })
      });

      refetch();
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
    setMessage("");
    audio?.playClick();
  };

  const handleRating = async (rating) => {
    if (!session) return;

    try {
      await base44.entities.LiveChatSession.update(session.id, {
        user_satisfaction: rating,
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_time_seconds: Math.floor(
          (new Date() - new Date(session.started_at)) / 1000
        )
      });

      audio?.playSuccess();
      showToast("Thanks for your feedback!", "success");
      setIsOpen(false);
      setSessionId(null);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session?.messages, isOpen]);

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-6 z-40"
          >
            <Button
              onClick={() => {
                setIsOpen(true);
                audio?.playClick();
              }}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-[#00D4C9] to-[#00A8A0] hover:scale-110 transition-transform shadow-2xl relative"
            >
              <MessageCircle className="h-7 w-7 text-white" />
              {session && session.status === "active" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0B0B0C]" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
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
            className="fixed bottom-24 right-6 z-40 w-96 bg-[#151515] rounded-2xl shadow-2xl border border-[#00D4C9]/20 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00D4C9] to-[#00A8A0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Support Chat</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    {session?.escalated_to_human ? (
                      <>
                        <User className="w-3 h-3" />
                        Human Agent
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3" />
                        AI Assistant
                      </>
                    )}
                  </p>
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
                  {!session || session.messages?.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#00D4C9]" />
                      <p className="text-sm">Hi! How can I help you today?</p>
                      <div className="grid gap-2 mt-4">
                        {[
                          "Help with setup",
                          "Integration issue",
                          "Billing question",
                          "Feature request"
                        ].map((quick) => (
                          <Button
                            key={quick}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMessage(quick);
                              handleSend();
                            }}
                            className="border-gray-700 text-gray-300 hover:bg-[#1F1F1F] text-xs"
                          >
                            {quick}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    session.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="p-2 bg-gradient-to-br from-[#00D4C9] to-[#00A8A0] rounded-lg h-fit">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-[#00D4C9] text-black"
                              : "bg-[#1F1F1F] text-white"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {msg.role === "user" && (
                          <div className="p-2 bg-[#FFD700] rounded-lg h-fit">
                            <User className="h-4 w-4 text-black" />
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {sendMessageMutation.isPending && (
                    <div className="flex gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#00D4C9] to-[#00A8A0] rounded-lg h-fit">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-[#1F1F1F] p-3 rounded-lg">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-[#1F1F1F] border-t border-gray-800">
                  {session?.status === "resolved" ? (
                    <div className="space-y-3">
                      <p className="text-white text-sm text-center">How was your experience?</p>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant="outline"
                            size="sm"
                            onClick={() => handleRating(rating)}
                            className="border-gray-700 hover:bg-[#FFD700] hover:text-black"
                          >
                            ⭐{rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type your message..."
                        disabled={sendMessageMutation.isPending}
                        className="bg-[#0C0C0C] border-gray-700 text-white placeholder:text-gray-500"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-[#00D4C9] to-[#00A8A0] hover:opacity-90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}