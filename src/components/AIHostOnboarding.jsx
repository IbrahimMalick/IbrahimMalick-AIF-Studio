import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Video as VideoIcon,
  User,
  Brain,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Globe,
  Languages
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "./AudioSystem";
import { showToast } from "./ToastNotification";
import VoiceEngine, { SUPPORTED_LANGUAGES } from "./VoiceEngine";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AIHostOnboarding({ user, onComplete }) {
  const queryClient = useQueryClient();
  const audio = useAudioFeedback();
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const voiceEngineRef = useRef(null);
  
  const [sessionId] = useState(`onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [collectedData, setCollectedData] = useState({});
  
  // Voice features
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Initialize Voice Engine
  useEffect(() => {
    voiceEngineRef.current = new VoiceEngine(selectedLanguage);
    
    // Auto-detect user's browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const matchingLang = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
    if (matchingLang) {
      setSelectedLanguage(matchingLang.code);
      voiceEngineRef.current.setLanguage(matchingLang.code);
    }
  }, []);

  // Update voice engine when language changes
  useEffect(() => {
    if (voiceEngineRef.current) {
      voiceEngineRef.current.setLanguage(selectedLanguage);
    }
  }, [selectedLanguage]);

  // Onboarding steps
  const steps = [
    {
      step: 1,
      hostMessage: `Hey ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI guide. This will take about 5 minutes. Ready to get started?`,
      expectedData: ["ready"],
      quickReplies: ["Yes, let's do this! 🚀", "Sure, I'm ready", "Tell me more first"]
    },
    {
      step: 2,
      hostMessage: "Awesome! First, tell me a bit about yourself. What's your name, and what brings you here today?",
      expectedData: ["name", "purpose"],
      quickReplies: []
    },
    {
      step: 3,
      hostMessage: "Got it! Now, what kind of content are you most excited to create? (Pick all that apply)",
      expectedData: ["goals"],
      quickReplies: [
        "🎥 Professional Videos",
        "🎨 AI Art & Graphics",
        "📱 Social Media Content",
        "📧 Email Campaigns",
        "🤖 Automated Workflows"
      ]
    },
    {
      step: 4,
      hostMessage: "Perfect! What's your current situation? Are you flying solo, or do you have a team?",
      expectedData: ["team_size"],
      quickReplies: [
        "Just me (Solo)",
        "Small team (2-5)",
        "Growing team (6-20)",
        "Large team (20+)"
      ]
    },
    {
      step: 5,
      hostMessage: "Great! Which platforms do you want to dominate? (Select your top 3)",
      expectedData: ["platforms"],
      quickReplies: [
        "📷 Instagram",
        "📘 Facebook",
        "🐦 Twitter/X",
        "💼 LinkedIn",
        "🎵 TikTok",
        "📺 YouTube"
      ]
    },
    {
      step: 6,
      hostMessage: "🎉 Perfect! I've set everything up for you. Here's what I created based on what you told me:",
      expectedData: [],
      quickReplies: ["Show me my dashboard!", "What's next?"]
    }
  ];

  const currentStepData = steps[currentStep - 1];

  // Load or create onboarding session
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ["onboardingSession", user?.email],
    queryFn: async () => {
      const sessions = await base44.entities.OnboardingSession.filter({
        user_email: user.email,
        status: "in_progress"
      }, "-created_date", 1);

      if (sessions.length > 0) {
        return sessions[0];
      }

      return await base44.entities.OnboardingSession.create({
        user_email: user.email,
        session_id: sessionId,
        status: "in_progress",
        current_step: 1,
        conversation_history: [],
        collected_data: {},
        started_at: new Date().toISOString()
      });
    },
    enabled: !!user?.email
  });

  // Start voice input
  const handleVoiceInput = async () => {
    if (isListening) {
      voiceEngineRef.current?.stopListening();
      setIsListening(false);
      setInterimTranscript("");
      return;
    }

    setIsListening(true);
    audio?.playClick();

    try {
      await voiceEngineRef.current?.startListening(
        // On final result
        (transcript) => {
          setMessage(transcript);
          setInterimTranscript("");
          setIsListening(false);
          audio?.playSuccess();
          
          // Auto-send if confident
          if (transcript.length > 5) {
            setTimeout(() => {
              sendMessageMutation.mutate(transcript);
              setMessage("");
            }, 300);
          }
        },
        // On interim result
        (interim) => {
          setInterimTranscript(interim);
        },
        // On error
        (error) => {
          console.error("Voice input error:", error);
          setIsListening(false);
          setInterimTranscript("");
          showToast("Voice input failed. Please try typing instead.", "error");
          audio?.playError();
        }
      );
    } catch (error) {
      setIsListening(false);
      setInterimTranscript("");
      showToast("Microphone access denied", "error");
    }
  };

  // Speak host message
  const speakHostMessage = async (text) => {
    if (!voiceEnabled || isMuted) return;

    try {
      await voiceEngineRef.current?.speak(text);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  // Send user message and get AI response
  const sendMessageMutation = useMutation({
    mutationFn: async (msg) => {
      setIsTyping(true);

      // Auto-detect language if user typed in different language
      const detectedLang = await voiceEngineRef.current?.detectLanguage(msg);
      if (detectedLang && detectedLang !== selectedLanguage.split('-')[0]) {
        const fullLangCode = SUPPORTED_LANGUAGES.find(l => 
          l.code.startsWith(detectedLang)
        )?.code || selectedLanguage;
        
        setSelectedLanguage(fullLangCode);
        voiceEngineRef.current?.setLanguage(fullLangCode);
        showToast(`Language switched to ${fullLangCode}`, "success");
      }

      // Update conversation history
      const updatedHistory = [
        ...(session.conversation_history || []),
        {
          role: "user",
          message: msg,
          timestamp: new Date().toISOString()
        }
      ];

      // Parse user response with AI
      const analysisPrompt = `You are analyzing a user's response during onboarding at step ${currentStep}.

User said: "${msg}"

Current step context: ${currentStepData.hostMessage}
Expected data to collect: ${currentStepData.expectedData.join(", ")}

Extract the following information from the user's message:
1. The data they're providing (name, goals, team size, platforms, etc.)
2. Their sentiment (excited, hesitant, confused, etc.)
3. Whether they need clarification or are ready to continue

Respond with JSON:
{
  "extracted_data": {...},
  "sentiment": "excited/neutral/hesitant/confused",
  "needs_clarification": true/false,
  "ready_to_continue": true/false,
  "suggested_response": "brief encouraging response"
}`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            extracted_data: { type: "object" },
            sentiment: { type: "string" },
            needs_clarification: { type: "boolean" },
            ready_to_continue: { type: "boolean" },
            suggested_response: { type: "string" }
          }
        }
      });

      // Merge extracted data
      const newCollectedData = {
        ...collectedData,
        ...analysis.extracted_data
      };
      setCollectedData(newCollectedData);

      // Update session
      await base44.entities.OnboardingSession.update(session.id, {
        conversation_history: updatedHistory,
        collected_data: newCollectedData,
        current_step: analysis.ready_to_continue ? currentStep + 1 : currentStep
      });

      // AI host responds
      let hostResponse = analysis.suggested_response;
      
      if (analysis.ready_to_continue && currentStep < steps.length) {
        // Move to next step
        setCurrentStep(currentStep + 1);
        hostResponse = steps[currentStep].hostMessage;
      }

      // Add host response to history
      updatedHistory.push({
        role: "assistant",
        message: hostResponse,
        timestamp: new Date().toISOString()
      });

      await base44.entities.OnboardingSession.update(session.id, {
        conversation_history: updatedHistory
      });

      // Speak the response
      await speakHostMessage(hostResponse);

      setIsTyping(false);
      refetchSession();
      audio?.playSuccess();
    }
  });

  // Handle quick reply
  const handleQuickReply = (reply) => {
    setMessage(reply);
    audio?.playClick();
    setTimeout(() => {
      sendMessageMutation.mutate(reply);
      setMessage("");
    }, 300);
  };

  // Complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      // Create user preferences
      await base44.entities.UserPreferences.create({
        user_email: user.email,
        preferred_platforms: collectedData.platforms || [],
        default_post_platforms: collectedData.platforms?.slice(0, 3) || [],
        onboarding_completed: true
      });

      // Mark complete
      await base44.entities.OnboardingSession.update(session.id, {
        status: "completed",
        completed_at: new Date().toISOString()
      });

      showToast("🎉 Onboarding complete! Welcome aboard!", "success");
      audio?.playProsperityChime();
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.conversation_history]);

  // Speak initial message
  useEffect(() => {
    if (session && currentStep === 1 && voiceEnabled) {
      speakHostMessage(currentStepData.hostMessage);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0B0B0C] via-[#111317] to-[#0B0B0C] z-50 overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FFD700] via-[#00D4C9] to-[#FF6B9D]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="max-w-6xl mx-auto h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#00D4C9]">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">AI Host Onboarding</h2>
              <p className="text-gray-400 text-sm">Step {currentStep} of {steps.length}</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-3">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48 bg-[#151515] border-gray-700 text-white">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="text-white"
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Left: AI Host Video */}
          <Card className="bg-[#151515] border-gray-800 rounded-2xl overflow-hidden flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="relative aspect-video bg-gradient-to-br from-[#FFD700]/10 to-[#00D4C9]/10 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-32 h-32 rounded-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] mx-auto mb-4 flex items-center justify-center"
                  >
                    <User className="w-16 h-16 text-black" />
                  </motion.div>
                  <p className="text-white text-lg">AI Host</p>
                </div>
              </div>

              {/* Host Message */}
              <div className="p-6 bg-[#1F1F1F]">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="p-2 bg-gradient-to-r from-[#FF6B9D] to-[#C44569] rounded-lg h-fit">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg leading-relaxed">
                      {currentStepData.hostMessage}
                    </p>
                    
                    {/* Quick Replies */}
                    {currentStepData.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {currentStepData.quickReplies.map((reply, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReply(reply)}
                            className="border-[#FFD700]/30 hover:bg-[#FFD700]/10 text-white"
                          >
                            {reply}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Conversation */}
          <Card className="bg-[#151515] border-gray-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {session.conversation_history?.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="p-2 bg-gradient-to-r from-[#FF6B9D] to-[#C44569] rounded-lg h-fit">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-4 rounded-xl ${
                        msg.role === "user"
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#1F1F1F] text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="p-2 bg-[#00D4C9] rounded-lg h-fit">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="p-2 bg-gradient-to-r from-[#FF6B9D] to-[#C44569] rounded-lg h-fit">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#1F1F1F] p-4 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#1F1F1F] border-t border-gray-800">
              {currentStep === steps.length ? (
                <Button
                  onClick={() => completeOnboardingMutation.mutate()}
                  disabled={completeOnboardingMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold h-12 rounded-xl"
                >
                  {completeOnboardingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up your account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Complete Setup & Go to Dashboard
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  {interimTranscript && (
                    <div className="text-gray-400 text-sm italic">
                      Listening: {interimTranscript}...
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVoiceInput}
                      variant="outline"
                      className={`${
                        isListening 
                          ? "bg-red-500 border-red-500 text-white animate-pulse" 
                          : "border-gray-700 text-white"
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && message.trim()) {
                          sendMessageMutation.mutate(message);
                          setMessage("");
                        }
                      }}
                      placeholder="Type or speak your response..."
                      disabled={sendMessageMutation.isPending || isListening}
                      className="flex-1 bg-[#0B0B0C] border-gray-700 text-white"
                    />
                    <Button
                      onClick={() => {
                        if (message.trim()) {
                          sendMessageMutation.mutate(message);
                          setMessage("");
                        }
                      }}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9]"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { AIHostOnboarding };