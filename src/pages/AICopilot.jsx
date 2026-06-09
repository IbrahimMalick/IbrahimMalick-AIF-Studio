import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  MessageSquare,
  Sparkles,
  History,
  Zap,
  Target,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import CopilotEngine from "@/components/CopilotEngine";
import ProactiveCopilot from "@/components/ProactiveCopilot";
import CommandTimeline from "@/components/CommandTimeline";
import VoiceCommandHandler from "@/components/VoiceCommandHandler";

// ── STT Hook ──────────────────────────────────────────────────────────────────
function useSpeechToText(onResult) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported in this browser.");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => onResult(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop };
}

export default function AICopilot() {
  const [user, setUser] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Expose a global TTS speaker so CopilotEngine responses can be spoken
  useEffect(() => {
    window.__copilotTtsEnabled = ttsEnabled;
    window.__copilotSpeak = (text) => {
      if (!ttsEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const clean = text.replace(/[#*`_~>\[\]]/g, "").replace(/\n+/g, ". ").trim();
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => /samantha|google us english|zira|victoria/i.test(v.name));
      if (preferred) utt.voice = preferred;
      window.speechSynthesis.speak(utt);
    };
  }, [ttsEnabled]);

  const handleTranscript = useCallback((text) => {
    // Detect voice command intent
    const lowerText = text.toLowerCase();
    
    // Task creation triggers
    if (/^(create|add|new)\s+(task|todo|task for|to.?do)/i.test(text)) {
      const taskContent = text.replace(/^(create|add|new)\s+(task|todo|task for|to.?do)\s*/i, "").trim();
      window.dispatchEvent(new CustomEvent("voice-command:create-task", { 
        detail: { content: taskContent || "New task from voice command" } 
      }));
      return;
    }
    
    // Research search triggers
    if (/^(search|find|look up|query)\s+(research|documents?|files?|research files?)/i.test(text)) {
      const searchQuery = text.replace(/^(search|find|look up|query)\s+(research|documents?|files?|research files?)\s*/i, "").trim();
      window.dispatchEvent(new CustomEvent("voice-command:search-research", { 
        detail: { query: searchQuery || "" } 
      }));
      return;
    }
    
    // Default: send to CopilotEngine for conversation
    window.dispatchEvent(new CustomEvent("copilot:voice-input", { detail: { text } }));
  }, []);

  const { listening, start: startListening, stop: stopListening } = useSpeechToText(handleTranscript);

  const toggleTts = () => {
    if (ttsEnabled) window.speechSynthesis?.cancel();
    setTtsEnabled(v => !v);
  };

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const quickCommands = [
    {
      category: "Offer Creation",
      icon: Target,
      color: "from-[#FFD700] to-[#FF8C00]",
      examples: [
        "Create an offer for high-ticket coaching targeting entrepreneurs",
        "Draft messaging for real estate course for agents making under $100k/year",
        "Generate offer copy for fitness program (Analyst buyer type, lead gen goal)"
      ]
    },
    {
      category: "Follow-Up Sequences",
      icon: Zap,
      color: "from-[#00D4C9] to-[#06D6A0]",
      examples: [
        "Build a 10-touch sequence for off_123 with mentor voice",
        "Create follow-up for off_456 handling 'too expensive' and 'no time' objections",
        "Generate 14-day nurture across email, SMS, and DM"
      ]
    },
    {
      category: "Campaign Deployment",
      icon: Sparkles,
      color: "from-[#9D4EDD] to-[#FF69B4]",
      examples: [
        "Generate Meta and TikTok ads for off_123 optimizing for CPL",
        "Launch funnel for off_456 at $50/day on Meta",
        "Deploy campaign to leads.mysite.com/offer with $100 daily budget"
      ]
    },
    {
      category: "Budget & Optimization",
      icon: BarChart3,
      color: "from-[#06D6A0] to-[#00D4C9]",
      examples: [
        "Set $2,000 monthly budget for leads across Meta, TikTok, and Email",
        "Optimize budget for bp_123 using latest ROAS data",
        "Next best action for funnel fr_55"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <VoiceCommandHandler />
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
              <Brain className="w-8 h-8 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Freedom Copilot</h1>
          <p className="text-gray-400 text-lg">
            Your AI assistant for marketing, sales, and automation
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Online & Learning</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main Chat */}
          <div className="lg:col-span-2">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl" style={{ height: "600px" }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#FFD700]" />
                    Conversational AI
                  </CardTitle>
                  {/* Voice Controls */}
                  <div className="flex items-center gap-2">
                    {/* STT */}
                    <button
                      onClick={listening ? stopListening : startListening}
                      title={listening ? "Stop listening" : "Speak your message"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        listening
                          ? "border-red-500/60 bg-red-500/20 text-red-400 animate-pulse"
                          : "border-gray-700 bg-gray-800/60 text-gray-400 hover:text-white hover:border-gray-500"
                      }`}
                    >
                      {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{listening ? "Listening…" : "Speak"}</span>
                    </button>
                    {/* TTS */}
                    <button
                      onClick={toggleTts}
                      title={ttsEnabled ? "Mute voice replies" : "Enable voice replies"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        ttsEnabled
                          ? "border-[#FFD700]/60 bg-[#FFD700]/10 text-[#FFD700]"
                          : "border-gray-700 bg-gray-800/60 text-gray-400 hover:text-white hover:border-gray-500"
                      }`}
                    >
                      {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{ttsEnabled ? "Voice On" : "Voice Off"}</span>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {user && <CopilotEngine user={user} currentPage="AICopilot" pageContext={{}} />}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Proactive Suggestions */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00D4C9]" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {user && <ProactiveCopilot user={user} />}
              </CardContent>
            </Card>

            {/* Command History */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-400" />
                  Recent Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                {user && <CommandTimeline user={user} limit={5} />}
              </CardContent>
            </Card>

          </div>

        </div>

        {/* Quick Command Reference */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Quick Command Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {quickCommands.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-white font-bold text-sm">{category.category}</h4>
                    </div>
                    <div className="space-y-2">
                      {category.examples.map((example, eIdx) => (
                        <div key={eIdx} className="p-2 bg-[#111317] rounded-lg">
                          <p className="text-gray-300 text-xs font-mono leading-relaxed">
                            "{example}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Guided Workflows Section */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FFD700]" />
              Guided Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm mb-4">
              Step-by-step guidance for complex tasks. Perfect for beginners or learning new features.
            </p>
            
            <div className="grid md:grid-cols-2 gap-3">
              {[
                {
                  name: "CTV Campaign Setup",
                  workflow: "ctv_campaign_setup",
                  time: "15 min",
                  steps: 6,
                  icon: "📺",
                  difficulty: "Intermediate"
                },
                {
                  name: "Create Your First Video",
                  workflow: "first_video_creation",
                  time: "10 min",
                  steps: 6,
                  icon: "🎬",
                  difficulty: "Beginner"
                },
                {
                  name: "Campaign Optimization",
                  workflow: "campaign_optimization",
                  time: "8 min",
                  steps: 6,
                  icon: "🎯",
                  difficulty: "Advanced"
                },
                {
                  name: "Build High-Converting Offer",
                  workflow: "offer_creation",
                  time: "12 min",
                  steps: 6,
                  icon: "💰",
                  difficulty: "Intermediate"
                }
              ].map((wf, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FFD700] transition-all cursor-pointer"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('start-guided-workflow', {
                      detail: { workflow: wf.workflow }
                    }));
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-3xl">{wf.icon}</div>
                    <Badge className="bg-gray-700 text-gray-300 text-xs">
                      {wf.difficulty}
                    </Badge>
                  </div>
                  <h4 className="text-white font-bold mb-1">{wf.name}</h4>
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                      {wf.time}
                    </Badge>
                    <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                      {wf.steps} steps
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold"
                  >
                    Start Walkthrough →
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intent Recognition Section */}
        <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 border-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#00D4C9]" />
              Intent Recognition System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm mb-4">
              AI understands natural language commands and executes actions automatically. Just ask!
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  intent: "offer.score",
                  name: "Score Offer",
                  example: "Score my offer: 'Get 10 listings in 30 days or money back'",
                  icon: "🎯",
                  action: "Evaluates offer using 8-factor belief framework"
                },
                {
                  intent: "followup.generate",
                  name: "Generate Follow-Up",
                  example: "Create a 10-touch follow-up sequence for my offer",
                  icon: "📧",
                  action: "Builds multi-channel nurture with Email, SMS, DM"
                },
                {
                  intent: "ads.launch",
                  name: "Launch Campaign",
                  example: "Launch ad campaign with $500 budget",
                  icon: "🚀",
                  action: "Creates and deploys Meta ad campaign"
                },
                {
                  intent: "analytics.nba",
                  name: "Analyze & Suggest",
                  example: "Analyze my campaigns and suggest improvements",
                  icon: "📊",
                  action: "Generates ranked next-best-action suggestions"
                },
                {
                  intent: "budget.optimize",
                  name: "Optimize Budget",
                  example: "Optimize my ad spend allocation",
                  icon: "💰",
                  action: "AI rebalances budget across channels"
                },
                {
                  intent: "video.create",
                  name: "Create Video",
                  example: "Create a 60-second video about AI productivity hacks",
                  icon: "🎬",
                  action: "Generates script and creates video project"
                },
                {
                  intent: "ctv.setup",
                  name: "CTV Setup",
                  example: "Help me set up a CTV campaign",
                  icon: "📺",
                  action: "Launches guided workflow for Connected TV"
                },
                {
                  intent: "content.ideas",
                  name: "Content Ideas",
                  example: "Give me 5 content ideas for this week",
                  icon: "💡",
                  action: "Generates personalized content suggestions"
                },
                {
                  intent: "abtest.create",
                  name: "Create A/B Test",
                  example: "Create A/B test for creative variations",
                  icon: "🧪",
                  action: "Generates test variants and launches experiment"
                }
              ].map((intent, idx) => (
                <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{intent.icon}</span>
                      <h4 className="text-white font-semibold">{intent.name}</h4>
                    </div>
                    <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                      {intent.intent}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{intent.action}</p>
                  <div className="p-2 bg-[#111317] rounded border border-[#00D4C9]/20">
                    <p className="text-[#00D4C9] text-xs font-mono italic">
                      "{intent.example}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-400 text-sm">
                💡 <strong>Pro Tip:</strong> Just type naturally! AI understands context and can execute multi-step workflows automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Proactive Intelligence Features */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#9D4EDD]" />
              Proactive AI Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h4 className="text-white font-bold mb-2">Struggle Detection</h4>
                <p className="text-gray-400 text-sm mb-3">
                  AI detects when you're stuck and offers contextual help automatically
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Monitors user behavior
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Offers quick wins
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Suggests guided mode
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h4 className="text-white font-bold mb-2">Content Suggestions</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Real-time trending topic analysis with personalized content ideas
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Trending topics monitoring
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Viral score predictions
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Platform optimization
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h4 className="text-white font-bold mb-2">Auto Campaign Analysis</h4>
                <p className="text-gray-400 text-sm mb-3">
                  AI analyzes campaigns every 6 hours and auto-optimizes performance
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Performance health scoring
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Budget reallocation
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Creative fatigue detection
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Capabilities Grid */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Copilot Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Natural Language
                </h4>
                <p className="text-gray-400 text-sm">
                  No code or technical knowledge needed. Just tell me what you want in plain English.
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Auto-Execution
                </h4>
                <p className="text-gray-400 text-sm">
                  I handle the entire workflow - from generation to deployment - with one command.
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Smart Context
                </h4>
                <p className="text-gray-400 text-sm">
                  I remember your previous work and suggest next steps based on your performance data.
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Multi-Step Workflows
                </h4>
                <p className="text-gray-400 text-sm">
                  Chain multiple actions: "Create offer, build follow-up, launch at $50/day"
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Proactive Insights
                </h4>
                <p className="text-gray-400 text-sm">
                  I monitor your funnels and proactively suggest optimizations before you ask.
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Safety Guardrails
                </h4>
                <p className="text-gray-400 text-sm">
                  Critical actions require confirmation. Budget limits and rate limiting built-in.
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}