
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Brain,
  History,
  Sparkles,
  Settings
} from "lucide-react";
import CopilotEngine from "./CopilotEngine";
import CommandTimeline from "./CommandTimeline";
import ProactiveCopilot from "./ProactiveCopilot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuidedWorkflow from "./GuidedWorkflow"; // Added import for GuidedWorkflow
import { useI18n } from "@/components/I18nProvider";
import { useQueryClient } from "@tanstack/react-query"; // Added useQueryClient import

export default function FloatingCopilotDock({ user, currentPage, pageContext }) {
  const queryClient = useQueryClient(); // Initialized queryClient
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadSuggestions, setUnreadSuggestions] = useState(0);
  const [activeTab, setActiveTab] = useState("chat");
  const [isAnimating, setIsAnimating] = useState(false);
  const [guidedWorkflow, setGuidedWorkflow] = useState(null); // Added state for guided workflow
  const [message, setMessage] = useState(""); // Added message state
  const [isProcessing, setIsProcessing] = useState(false); // Added isProcessing state
  const [sessionId] = useState(`session_${Date.now()}`); // Added sessionId state
  const { t } = useI18n(); // Initialized t for i18n

  // Listen for guided workflow events AND copilot open requests
  useEffect(() => {
    const handleStartWorkflow = (e) => {
      if (e.detail?.workflow) {
        setGuidedWorkflow(e.detail.workflow);
        setIsOpen(false); // Close copilot when a guided workflow starts
      }
    };

    const handleOpenCopilotWithMessage = (e) => {
      if (e.detail?.message) {
        setIsOpen(true);
        // Message will be set in CopilotEngine
        // Wait a bit for the Copilot panel to open and render the input
        setTimeout(() => {
          const input = document.querySelector('input[placeholder*="Ask anything"]');
          if (input) {
            input.value = e.detail.message;
            input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger change for React to pick up
          }
        }, 100);
      }
    };

    window.addEventListener('start-guided-workflow', handleStartWorkflow);
    window.addEventListener('open-copilot-with-message', handleOpenCopilotWithMessage);
    
    return () => {
      window.removeEventListener('start-guided-workflow', handleStartWorkflow);
      window.removeEventListener('open-copilot-with-message', handleOpenCopilotWithMessage);
    };
  }, []);

  // Pulse animation when new suggestions
  useEffect(() => {
    if (unreadSuggestions > 0 && !isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadSuggestions, isOpen]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className={`w-16 h-16 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-2xl hover:shadow-[#FFD700]/50 transition-all ${
                isAnimating ? 'animate-pulse' : ''
              }`}
            >
              <div className="relative">
                <Brain className="w-7 h-7" />
                {unreadSuggestions > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{unreadSuggestions}</span>
                  </div>
                )}
              </div>
            </Button>

            {/* 888 Hz Ripple Effect */}
            {isAnimating && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-0 rounded-full bg-[#FFD700]/30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-[#FF8C00]/20 animate-ping" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed right-6 z-50 ${
              isMinimized 
                ? 'bottom-6 w-96' 
                : 'bottom-6 top-6 w-[450px]'
            }`}
          >
            <div className="h-full flex flex-col bg-[#0B0B0C] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                    <Brain className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">AI Freedom Copilot</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-gray-400 text-xs">Online & Learning</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isMinimized ? (
                      <Maximize2 className="w-4 h-4" />
                    ) : (
                      <Minimize2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              {!isMinimized && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="px-4 pt-3 bg-[#111317]">
                    <TabsList className="w-full bg-[#0B0B0C]">
                      <TabsTrigger value="chat" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="suggestions" className="flex-1">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Insights
                      </TabsTrigger>
                      <TabsTrigger value="timeline" className="flex-1">
                        <History className="w-4 h-4 mr-1" />
                        Timeline
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="chat" className="flex-1 m-0">
                    <p className="text-gray-400 text-xs p-4">
                      💡 <strong>{t('info')}:</strong> {t('ask_copilot')}
                    </p>
                    <CopilotEngine 
                      user={user} 
                      currentPage={currentPage}
                      pageContext={pageContext}
                    />
                  </TabsContent>

                  <TabsContent value="suggestions" className="flex-1 m-0 p-4 overflow-y-auto">
                    <ProactiveCopilot user={user} />
                  </TabsContent>

                  <TabsContent value="timeline" className="flex-1 m-0 p-4 overflow-y-auto">
                    <CommandTimeline user={user} />
                  </TabsContent>
                </Tabs>
              )}

              {/* Minimized View */}
              {isMinimized && (
                <div className="p-4">
                  <p className="text-gray-400 text-sm text-center">
                    Click to expand Copilot
                  </p>
                </div>
              )}

            </div>

            {/* Voice Animation Indicator */}
            {isOpen && !isMinimized && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-[#FFD700] rounded-full"
                      animate={{
                        height: [8, 16, 8],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guided Workflow Modal */}
      <AnimatePresence>
        {guidedWorkflow && (
          <GuidedWorkflow
            workflowType={guidedWorkflow}
            onComplete={(data) => {
              setGuidedWorkflow(null);
              alert(`✅ Workflow Complete!\n\nYour ${guidedWorkflow.replace(/_/g, ' ')} is ready.`);
            }}
            onCancel={() => setGuidedWorkflow(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
