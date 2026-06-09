import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Brain, Mic, DollarSign, Users, Zap, Activity, Video, Image, AudioLines,
  UserCircle, MessageSquare, Bell, TrendingUp, TrendingDown, CheckCircle2,
  AlertTriangle, Clock, Command, Keyboard, Send, Sparkles, Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import FounderSecurePortal from "@/components/FounderSecurePortal";

// KPI Card Component
const KPICard = ({ label, value, change, trend, color = "cyan" }) => (
  <div className="text-center p-4 bg-white rounded-xl border border-gray-100">
    <p className={`text-${color}-500 font-semibold text-sm mb-1`}>{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className={`text-sm ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
      {change}
    </p>
  </div>
);

// Provider Status Card
const ProviderCard = ({ name, status, category }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div>
      <p className="font-semibold text-gray-800 text-sm">{name}</p>
      <p className="text-xs text-gray-500">{category}</p>
    </div>
    <Badge className={status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
      {status === 'healthy' ? '● Online' : '● Degraded'}
    </Badge>
  </div>
);

export default function FounderCommandCenter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("aria");
  const [securityCleared, setSecurityCleared] = useState(false);
  const [ariaMessage, setAriaMessage] = useState("");
  const [ariaChat, setAriaChat] = useState([
    { role: 'aria', message: "Good morning, Founder. All systems operational. You have 3 priorities today and $2,847 in new revenue. How may I assist you?" }
  ]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleAriaSend = () => {
    if (!ariaMessage.trim()) return;
    setAriaChat(prev => [...prev, { role: 'user', message: ariaMessage }]);
    
    // Simulate ARIA response
    setTimeout(() => {
      let response = "I'm analyzing your request...";
      const lower = ariaMessage.toLowerCase();
      if (lower.includes('briefing') || lower.includes('morning')) {
        response = "Here's your daily briefing:\n\n📊 Revenue: $52,847 MRR (+18.5%)\n👥 Users: 3,847 (+12.3%)\n🔥 API Calls: 284,729 (+24.7%)\n✅ Uptime: 99.97%\n\nTop priorities today:\n1. Review enterprise demo request from Acme Corp\n2. Approve new pricing tier rollout\n3. Check Q4 roadmap alignment";
      } else if (lower.includes('revenue') || lower.includes('money')) {
        response = "📈 Revenue Analysis:\n\nMRR: $52,847 (+18.5% MoM)\nARR: $634,164\nLTV:CAC Ratio: 4.2x\nNet Revenue Retention: 118%\n\nTop revenue drivers this month:\n• Enterprise tier upgrades: +$8,200\n• New subscriptions: +$4,100\n• Usage overages: +$1,200";
      } else if (lower.includes('video') || lower.includes('generate')) {
        response = "🎬 I'll generate that video for you using Kling 2.5 Pro. This will take approximately 2-3 minutes.\n\nSettings:\n• Model: Kling 2.5 Pro\n• Duration: 10 seconds\n• Quality: 1080p\n• Style: Professional\n\nStarting generation now...";
      } else if (lower.includes('problem') || lower.includes('alert')) {
        response = "🔔 Current Alerts:\n\n⚠️ WARNING: fal.ai experiencing 15% slower response times\n→ Auto-failover to Runway enabled\n\n✅ RESOLVED: Payment processing delay (fixed 2h ago)\n\n📊 INFO: API rate limit at 67% of daily quota\n\nNo critical issues requiring immediate attention.";
      }
      setAriaChat(prev => [...prev, { role: 'aria', message: response }]);
    }, 1000);
    
    setAriaMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex items-center justify-center">
        <Brain className="w-12 h-12 animate-pulse text-cyan-500" />
      </div>
    );
  }

  // Access control: Only founder/admin can access
  if (!user || (user.role !== 'admin' && user.custom_role !== 'founder' && user.custom_role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 flex items-center justify-center text-center p-6">
        <div>
          <Brain className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-500">You do not have permission to view the Founder Command Center.</p>
        </div>
      </div>
    );
  }

  // Security gate - require additional verification
  if (!securityCleared) {
    return <FounderSecurePortal onAccessGranted={() => setSecurityCleared(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                AG-X COMMAND CENTER
              </h1>
              <p className="text-purple-500 font-medium">Founder's Executive Guide</p>
            </div>
            <Badge className="bg-cyan-100 text-cyan-700 px-4 py-2">
              <Bot className="w-4 h-4 mr-2 inline" />
              ARIA Online
            </Badge>
          </div>
          
          {/* Hero Banner */}
          <div className="mt-6 p-6 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-2xl text-white">
            <p className="text-lg font-semibold text-center">
              Your Genius AI Executive Assistant & Operations Headquarters
            </p>
          </div>

          {/* Top KPIs */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <KPICard label="MRR" value="$52,847" change="+18.5%" trend="up" color="cyan" />
            <KPICard label="Users" value="3,847" change="+12.3%" trend="up" color="purple" />
            <KPICard label="AI Models" value="600+" change="" trend="stable" color="cyan" />
            <KPICard label="Cost Saved" value="90%" change="" trend="up" color="green" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-gray-200 mb-6">
            <TabsTrigger value="aria">🤖 ARIA</TabsTrigger>
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="content">🎬 AI Content</TabsTrigger>
            <TabsTrigger value="cost">💰 Cost Intel</TabsTrigger>
            <TabsTrigger value="providers">🔌 Providers</TabsTrigger>
            <TabsTrigger value="alerts">🔔 Alerts</TabsTrigger>
            <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
            <TabsTrigger value="reference">📚 Reference</TabsTrigger>
          </TabsList>

          {/* ARIA Tab */}
          <TabsContent value="aria">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Chat Interface */}
              <Card className="bg-white border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-cyan-600 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    ARIA - Your Executive AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {ariaChat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-cyan-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 flex gap-2">
                    <Input
                      value={ariaMessage}
                      onChange={(e) => setAriaMessage(e.target.value)}
                      placeholder="Ask ARIA anything..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAriaSend()}
                    />
                    <Button onClick={() => setIsListening(!isListening)} variant="outline" className={isListening ? 'bg-red-100' : ''}>
                      <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : ''}`} />
                    </Button>
                    <Button onClick={handleAriaSend} className="bg-cyan-500 hover:bg-cyan-600">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* What Makes ARIA Special */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-purple-600">What Makes ARIA Special</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Strategic Partner", desc: "Not just a chatbot - a trusted advisor who understands business context" },
                    { title: "Natural Language", desc: "Talk like you're talking to a human executive assistant" },
                    { title: "Voice Enabled", desc: "Speak commands naturally - no memorization required" },
                    { title: "Proactive", desc: "Alerts you before problems escalate, suggests actions before you ask" },
                    { title: "Data-Driven", desc: "Every recommendation backed by real-time platform metrics" },
                    { title: "Action-Oriented", desc: "Doesn't just inform - executes tasks directly" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Example Conversations */}
              <Card className="bg-white border-gray-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-cyan-600">Example Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cyan-50">
                        <th className="text-left p-3 text-cyan-700">You Say</th>
                        <th className="text-left p-3 text-purple-700">ARIA Does</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { say: '"Give me my daily briefing"', does: 'Full executive summary: revenue, users, alerts, priorities' },
                        { say: '"How\'s revenue looking?"', does: 'Deep financial analysis with MRR, growth trends, LTV:CAC' },
                        { say: '"Generate a product demo video"', does: 'Creates video using Kling 2.5 Pro and delivers link' },
                        { say: '"Any problems I should know about?"', does: 'System alerts with severity and auto-fix recommendations' },
                        { say: '"Should we raise prices?"', does: 'Strategic analysis with data-backed recommendation' },
                        { say: '"Prepare me for my investor call"', does: 'Talking points, key metrics, anticipated questions' }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3 text-gray-700">{row.say}</td>
                          <td className="p-3 text-gray-600">{row.does}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-cyan-600">Top-Level KPIs (Always Visible)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-6 border border-gray-200 rounded-xl">
                      <p className="text-gray-500 font-medium">MRR</p>
                      <p className="text-3xl font-bold text-gray-800">$52,847</p>
                      <p className="text-green-500 font-semibold">+18.5%</p>
                    </div>
                    <div className="text-center p-6 border border-gray-200 rounded-xl">
                      <p className="text-gray-500 font-medium">Users</p>
                      <p className="text-3xl font-bold text-gray-800">3,847</p>
                      <p className="text-green-500 font-semibold">+12.3%</p>
                    </div>
                    <div className="text-center p-6 border border-gray-200 rounded-xl">
                      <p className="text-gray-500 font-medium">API Calls</p>
                      <p className="text-3xl font-bold text-gray-800">284,729</p>
                      <p className="text-green-500 font-semibold">+24.7%</p>
                    </div>
                    <div className="text-center p-6 border border-gray-200 rounded-xl">
                      <p className="text-gray-500 font-medium">Uptime</p>
                      <p className="text-3xl font-bold text-gray-800">99.97%</p>
                      <p className="text-green-500 font-semibold">Healthy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-purple-600">AI Generation Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { icon: Video, label: "Videos Generated", value: "12,847 this month" },
                      { icon: Image, label: "Images Created", value: "48,293 this month" },
                      { icon: AudioLines, label: "Audio Minutes", value: "8,472 minutes" },
                      { icon: UserCircle, label: "Avatar Videos", value: "1,293 videos" },
                      { icon: MessageSquare, label: "LLM Tokens", value: "847M tokens processed" },
                      { icon: DollarSign, label: "Cost Saved", value: "$6,188 (DeepSeek + Caching)" }
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <stat.icon className="w-8 h-8 text-cyan-500" />
                        <div>
                          <p className="text-sm text-gray-500">{stat.label}</p>
                          <p className="font-semibold text-gray-800">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-cyan-600">Dashboard Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: "Provider Status Grid", desc: "Real-time health of all 12+ AI providers" },
                      { title: "Alert Center", desc: "Critical alerts, warnings, and smart recommendations" },
                      { title: "Quick Actions Panel", desc: "One-click access to common tasks" },
                      { title: "Today's Priorities", desc: "Prioritized task list with deadlines" },
                      { title: "Notification Feed", desc: "Revenue milestones, user growth, events" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Content Tab */}
          <TabsContent value="content">
            <div className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-cyan-600">Video Generation Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cyan-50">
                        <th className="text-left p-3 text-cyan-700">Model</th>
                        <th className="text-left p-3 text-cyan-700">Best For</th>
                        <th className="text-left p-3 text-cyan-700">Via</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { model: "Veo 3", best: "Cinematic quality with native audio", via: "fal.ai" },
                        { model: "Sora 2", best: "Narrative storytelling", via: "fal.ai" },
                        { model: "Kling 2.5 Pro", best: "Product demos, human motion", via: "fal.ai" },
                        { model: "Runway Gen-4", best: "Character consistency", via: "Direct" },
                        { model: "Luma Dream", best: "Quick iterations", via: "fal.ai" },
                        { model: "MiniMax Hailuo", best: "Smooth motion", via: "fal.ai" }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3 font-medium text-gray-800">{row.model}</td>
                          <td className="p-3 text-gray-600">{row.best}</td>
                          <td className="p-3"><Badge className="bg-purple-100 text-purple-700">{row.via}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-purple-600">Image Generation Models</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-purple-50">
                          <th className="text-left p-3 text-purple-700">Model</th>
                          <th className="text-left p-3 text-purple-700">Strength</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { model: "Flux Pro Ultra", strength: "Highest quality, photorealistic" },
                          { model: "DALL-E 3", strength: "Versatile, great for concepts" },
                          { model: "Recraft v3", strength: "Design assets, clean graphics" },
                          { model: "Ideogram v2", strength: "Text in images, logos" },
                          { model: "Stable Diffusion 3", strength: "Open-source, customizable" }
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="p-3 font-medium text-gray-800">{row.model}</td>
                            <td className="p-3 text-gray-600">{row.strength}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-cyan-600">Audio & Avatars</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: "ElevenLabs", desc: "Premium TTS, voice cloning, multilingual" },
                      { name: "OpenAI TTS", desc: "Fast, affordable text-to-speech" },
                      { name: "HeyGen", desc: "AI avatars with best-in-class lip-sync" },
                      { name: "Synthesia", desc: "Enterprise avatars, 120+ languages" },
                      { name: "JSON2Video", desc: "Programmatic video composition" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-cyan-600">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cost Intelligence Tab */}
          <TabsContent value="cost">
            <div className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-green-600">DeepSeek Integration: 90% Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="text-left p-3 text-green-700">Provider</th>
                        <th className="text-left p-3 text-green-700">Cost/1M Tokens</th>
                        <th className="text-left p-3 text-green-700">Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-gray-800">GPT-4o</td>
                        <td className="p-3 text-gray-600">$2.50</td>
                        <td className="p-3 text-gray-500">baseline</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 text-gray-800">Claude Sonnet 4.5</td>
                        <td className="p-3 text-gray-600">$3.00</td>
                        <td className="p-3 text-red-500">-20%</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-green-50">
                        <td className="p-3 font-bold text-green-700">DeepSeek V3.2</td>
                        <td className="p-3 font-bold text-green-700">$0.27</td>
                        <td className="p-3 font-bold text-green-700">+90% !!</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-purple-600">Smart Routing Logic</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { query: "Simple queries", route: "DeepSeek (cheap, fast)" },
                      { query: "Code generation", route: "DeepSeek (excellent at code)" },
                      { query: "Complex reasoning", route: "Claude Opus (highest quality)" },
                      { query: "Creative writing", route: "Claude or GPT (nuanced output)" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-800">{item.query}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-purple-600">{item.route}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-cyan-600">Other Cost Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { title: "Semantic Caching", desc: "60-80% reduction on similar queries" },
                      { title: "Budget Controls", desc: "Per-request, hourly, daily, monthly limits" },
                      { title: "Real-time Tracking", desc: "See spend as it happens" },
                      { title: "Alert Thresholds", desc: "Notifications at 80% of limits" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-cyan-600">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-cyan-600">Provider Network (15+ Providers, 600+ Models)</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full mb-6">
                  <thead>
                    <tr className="bg-cyan-50">
                      <th className="text-left p-3 text-cyan-700">Provider</th>
                      <th className="text-left p-3 text-cyan-700">Category</th>
                      <th className="text-left p-3 text-cyan-700">Key Models</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { provider: "Anthropic", category: "LLM", models: "Claude Opus 4.5, Sonnet 4.5, Haiku 4.5" },
                      { provider: "OpenAI", category: "LLM", models: "GPT-5.1 Pro, GPT-5.1, Codex" },
                      { provider: "DeepSeek", category: "LLM", models: "V3.2, R1 (90% cheaper!)" },
                      { provider: "fal.ai", category: "Video/Image", models: "600+ models - Veo 3, Sora 2, Kling, Flux" },
                      { provider: "ElevenLabs", category: "Audio", models: "Multilingual v2, Turbo v2.5" },
                      { provider: "HeyGen", category: "Avatars", models: "Avatar v2, custom avatars" },
                      { provider: "Synthesia", category: "Avatars", models: "Enterprise avatars, 120+ languages" },
                      { provider: "Runway", category: "Video", models: "Gen-4, Gen-4 Turbo" },
                      { provider: "JSON2Video", category: "Compositor", models: "Programmatic video editing" }
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="p-3 font-semibold text-gray-800">{row.provider}</td>
                        <td className="p-3"><Badge className="bg-purple-100 text-purple-700">{row.category}</Badge></td>
                        <td className="p-3 text-gray-600">{row.models}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Automatic Failover", desc: "If any provider fails, AG-X routes to alternatives automatically" },
                    { title: "Health Monitoring", desc: "Real-time status of all providers on your dashboard" },
                    { title: "Custom Providers", desc: "Add ANY AI API with simple JSON configuration" },
                    { title: "One API Key Per Provider", desc: "Just add keys, AG-X handles the rest" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-cyan-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-cyan-600">Business Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Revenue milestones: 'You just hit $50K MRR!'",
                    "Growth spikes: '127 new users today (3x normal)'",
                    "Enterprise activity: 'Enterprise Corp started their trial'",
                    "Churn risk: '15 users showing churn signals'"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-purple-600">Technical Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Provider outages: 'fal.ai experiencing degraded performance'",
                    "Rate limits: 'API rate limit at 87%'",
                    "Traffic anomalies: 'Unusual spike in API errors'",
                    "Auto-resolved: 'Payment processing delay fixed'"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-purple-600">ARIA's Smart Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Automatically enables failover to backup providers",
                      "Notifies affected users with status updates",
                      "Opens support tickets with providers",
                      "Recommends optimal fixes based on the situation"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <p className="text-gray-700 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-cyan-600">Example Voice Commands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    '"ARIA, give me my daily briefing"',
                    '"What\'s our revenue this month?"',
                    '"Generate a video of our product in action"',
                    '"Are there any problems I should know about?"',
                    '"Create an image for our social media post"',
                    '"What should I focus on today?"',
                    '"Draft an email to investors about Q1 results"',
                    '"Schedule 2 hours of deep work for tomorrow"'
                  ].map((cmd, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
                      <Mic className="w-4 h-4 text-cyan-600" />
                      <p className="text-gray-700 text-sm">{cmd}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-purple-600">Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Be natural", desc: "ARIA understands conversational language" },
                    { title: "Add context", desc: "'Generate a video like the one we made last week'" },
                    { title: "Chain requests", desc: "'Create an image and then use it for a video'" },
                    { title: "Ask for help", desc: "'What can you do?' or 'How do I...'" }
                  ].map((tip, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-lg">
                      <p className="font-semibold text-purple-700">{tip.title}</p>
                      <p className="text-sm text-gray-600">{tip.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quick Reference Tab */}
          <TabsContent value="reference">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-purple-600">Keyboard Shortcuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="text-left p-3 text-purple-700">Shortcut</th>
                        <th className="text-left p-3 text-purple-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { shortcut: "Cmd/Ctrl + K", action: "Open command palette" },
                        { shortcut: "Cmd/Ctrl + J", action: "Toggle ARIA assistant" },
                        { shortcut: "Cmd/Ctrl + B", action: "Quick daily briefing" },
                        { shortcut: "Cmd/Ctrl + /", action: "Search anything" },
                        { shortcut: "Escape", action: "Close panels/dialogs" }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3"><code className="bg-gray-100 px-2 py-1 rounded text-sm">{row.shortcut}</code></td>
                          <td className="p-3 text-gray-600">{row.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-cyan-600">Slash Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-cyan-50">
                        <th className="text-left p-3 text-cyan-700">Command</th>
                        <th className="text-left p-3 text-cyan-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { cmd: "/brief", action: "Get daily briefing" },
                        { cmd: "/revenue", action: "Financial overview" },
                        { cmd: "/users", action: "User metrics" },
                        { cmd: "/alerts", action: "Current alerts" },
                        { cmd: "/video [prompt]", action: "Generate video" },
                        { cmd: "/image [prompt]", action: "Generate image" },
                        { cmd: "/speak [text]", action: "Generate voiceover" },
                        { cmd: "/status", action: "Platform status" }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3"><code className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-sm">{row.cmd}</code></td>
                          <td className="p-3 text-gray-600">{row.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer CTA */}
        <Card className="mt-8 bg-gradient-to-r from-gray-700 to-gray-800 border-0">
          <CardContent className="p-8 text-center text-white">
            <p className="font-bold text-lg mb-2">ARIA is ready for your command, Founder.</p>
            <p className="text-gray-300 italic mb-4">
              "Good morning. All systems operational. You have 3 priorities today and $2,847 in new revenue. How may I assist you?"
            </p>
            <p className="text-gray-400">-- ARIA</p>
            <p className="text-gray-500 text-sm mt-4">© 2025 AI Freedom Studios | State-of-the-Art | Built for Visionaries</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}