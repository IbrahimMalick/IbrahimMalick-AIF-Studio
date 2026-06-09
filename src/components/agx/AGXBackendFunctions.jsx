import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  Code,
  Cpu,
  Zap,
  DollarSign,
  Brain,
  Image,
  Video,
  Music,
  Mic,
  Users,
  Sparkles,
  ExternalLink
} from "lucide-react";

const QUICK_START_CODE = `// ═══════════════════════════════════════════════════════════════
// AG-X COMMAND CENTER - QUICK START
// ═══════════════════════════════════════════════════════════════

const API_KEY = "YOUR_POE_API_KEY_HERE"; // poe.com/api_key

// 💬 CHAT with cost-aware routing
async function chat(msg, model = "Claude-Sonnet-4") {
  const r = await fetch("https://api.poe.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${API_KEY}\` },
    body: JSON.stringify({ model, messages: [{ role: "user", content: msg }] })
  });
  return (await r.json()).choices[0].message.content;
}

// 🤖 ARIA - Executive AI Assistant
async function aria(query) {
  return await chat(\`As ARIA executive AI, provide strategic insights: \${query}\`, "Claude-Opus-4");
}

// 🖼️ IMAGE | 🎬 VIDEO | 🎵 MUSIC | 🔊 SPEECH
async function image(prompt) { return await chat(prompt, "GPT-Image-1"); }
async function video(prompt) { return await chat(prompt, "Veo-3"); }
async function music(prompt) { return await chat(prompt, "Suno-V4"); }
async function speech(text) { return await chat(text, "ElevenLabs"); }

module.exports = { chat, aria, image, video, music, speech };`;

const MODEL_REGISTRY = {
  llm: [
    { key: "claude-opus-4", name: "Claude-Opus-4", provider: "Anthropic", tier: "premium", cost: "75 pts/1k", context: "200K", useCase: "Complex reasoning" },
    { key: "claude-sonnet-4", name: "Claude-Sonnet-4", provider: "Anthropic", tier: "premium", cost: "15 pts/1k", context: "200K", useCase: "General purpose" },
    { key: "gpt-4o", name: "GPT-4o", provider: "OpenAI", tier: "mid", cost: "10 pts/1k", context: "128K", useCase: "Multimodal, fast" },
    { key: "gemini-2.5-flash", name: "Gemini-2.5-Flash", provider: "Google", tier: "economy", cost: "0.3 pts/1k", context: "1M", useCase: "Real-time" },
    { key: "deepseek-v3", name: "DeepSeek-V3", provider: "DeepSeek", tier: "economy", cost: "0.07 pts/1k", context: "64K", useCase: "Highest savings" }
  ],
  image: [
    { key: "gpt-image-1", name: "GPT-Image-1", provider: "OpenAI", tier: "premium", cost: "50 pts/gen", useCase: "Best quality" },
    { key: "flux-pro", name: "Flux-Pro", provider: "Black Forest", tier: "mid", cost: "25 pts/gen", useCase: "Professional" },
    { key: "stable-diffusion-xl", name: "StableDiffusionXL", provider: "Stability", tier: "economy", cost: "5 pts/gen", useCase: "Budget" }
  ],
  video: [
    { key: "veo-3", name: "Veo-3", provider: "Google", tier: "premium", cost: "100 pts/sec", useCase: "Cinematic" },
    { key: "sora", name: "Sora", provider: "OpenAI", tier: "premium", cost: "120 pts/sec", useCase: "Creative" },
    { key: "kling-2.1", name: "Kling-2.1", provider: "Kuaishou", tier: "mid", cost: "40 pts/sec", useCase: "Realistic" }
  ],
  audio: [
    { key: "elevenlabs", name: "ElevenLabs", provider: "ElevenLabs", tier: "premium", cost: "0.3 pts/char", useCase: "Premium TTS" },
    { key: "suno-v4", name: "Suno-V4", provider: "Suno", tier: "mid", cost: "200 pts/song", useCase: "AI music" }
  ]
};

const TIER_COLORS = {
  premium: "bg-purple-500/20 text-purple-400",
  mid: "bg-blue-500/20 text-blue-400",
  economy: "bg-green-500/20 text-green-400"
};

const API_FUNCTIONS = [
  { name: "chat(message, options)", desc: "AI chat with cost-aware routing", params: "message, { model?, system?, budgetMode? }", returns: "{ content, model, latency }" },
  { name: "aria(query)", desc: "Executive AI assistant", params: "query: string", returns: "{ content, model, latency }" },
  { name: "generateImage(prompt, options)", desc: "Image generation", params: "prompt, { model?, style? }", returns: "{ content, model, cost }" },
  { name: "generateVideo(prompt, options)", desc: "Video generation", params: "prompt, { model?, duration? }", returns: "{ content, model, cost }" },
  { name: "generateMusic(prompt, options)", desc: "Music generation", params: "prompt, { genre?, mood? }", returns: "{ content, model, cost }" },
  { name: "textToSpeech(text, options)", desc: "Text-to-speech", params: "text, { voice?, model? }", returns: "{ content, model, cost }" },
  { name: "generate(type, prompt, options)", desc: "Unified generation", params: "type, prompt, options", returns: "Type-specific result" },
  { name: "conversation(history, newMessage)", desc: "Multi-turn chat", params: "history[], newMessage", returns: "{ reply, history }" },
  { name: "compareModels(prompt, models[])", desc: "Model comparison", params: "prompt, models[]", returns: "Results per model" },
  { name: "selectOptimalProvider(task)", desc: "Cost-aware selection", params: "task, { type?, budgetMode? }", returns: "Model info" }
];

export default function AGXBackendFunctions() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("quickstart");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#0B0B0C] border border-gray-800">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
        </TabsList>

        {/* Quick Start */}
        <TabsContent value="quickstart">
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Quick Start Code
              </CardTitle>
              <Button onClick={() => copyToClipboard(QUICK_START_CODE)} variant="outline" size="sm" className="border-gray-700">
                {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0B0B0C] rounded-xl p-4 border border-gray-800 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{QUICK_START_CODE}</pre>
              </div>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Replace <code className="bg-gray-800 px-1 rounded">YOUR_POE_API_KEY_HERE</code> with your key from{" "}
                  <a href="https://poe.com/api_key" target="_blank" rel="noopener noreferrer" className="underline">
                    poe.com/api_key <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </p>
              </div>

              {/* Usage Examples */}
              <h3 className="text-purple-400 font-semibold mt-6 mb-4">Usage Examples</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: "💬", title: "Chat", code: `await chat("Explain quantum computing")` },
                  { icon: "🤖", title: "ARIA", code: `await aria("What's our growth strategy?")` },
                  { icon: "🖼️", title: "Image", code: `await image("Cyberpunk city sunset")` },
                  { icon: "🎬", title: "Video", code: `await video("Drone over mountains")` }
                ].map((ex, idx) => (
                  <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <span className="text-lg mr-2">{ex.icon}</span>
                    <span className="text-white font-medium">{ex.title}</span>
                    <code className="block text-cyan-400 text-xs mt-1">{ex.code}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models */}
        <TabsContent value="models">
          <div className="space-y-4">
            {/* Cost Tiers */}
            <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-green-500/30 text-center">
                    <Badge className="bg-green-500/20 text-green-400 mb-2">ECONOMY</Badge>
                    <p className="text-white font-bold">90% Savings</p>
                    <p className="text-gray-400 text-xs">DeepSeek, Gemini Flash</p>
                  </div>
                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-blue-500/30 text-center">
                    <Badge className="bg-blue-500/20 text-blue-400 mb-2">MID</Badge>
                    <p className="text-white font-bold">50% Savings</p>
                    <p className="text-gray-400 text-xs">GPT-4o, Gemini Pro</p>
                  </div>
                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-purple-500/30 text-center">
                    <Badge className="bg-purple-500/20 text-purple-400 mb-2">PREMIUM</Badge>
                    <p className="text-white font-bold">Best Quality</p>
                    <p className="text-gray-400 text-xs">Claude Opus, GPT-5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Tables */}
            {Object.entries(MODEL_REGISTRY).map(([category, models]) => (
              <Card key={category} className="bg-[#111317] border-gray-800">
                <CardHeader className="py-3">
                  <CardTitle className="text-orange-400 capitalize text-sm flex items-center gap-2">
                    {category === "llm" && <Brain className="w-4 h-4" />}
                    {category === "image" && <Image className="w-4 h-4" />}
                    {category === "video" && <Video className="w-4 h-4" />}
                    {category === "audio" && <Music className="w-4 h-4" />}
                    {category.toUpperCase()} Models
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-purple-600/10">
                          <th className="text-left p-2 text-purple-300">Model</th>
                          <th className="text-left p-2 text-purple-300">Provider</th>
                          <th className="text-left p-2 text-purple-300">Tier</th>
                          <th className="text-left p-2 text-purple-300">Cost</th>
                          <th className="text-left p-2 text-purple-300">Use Case</th>
                        </tr>
                      </thead>
                      <tbody>
                        {models.map((m, idx) => (
                          <tr key={idx} className="border-b border-gray-800">
                            <td className="p-2"><code className="text-cyan-400">{m.name}</code></td>
                            <td className="p-2 text-gray-300">{m.provider}</td>
                            <td className="p-2"><Badge className={`text-xs ${TIER_COLORS[m.tier]}`}>{m.tier}</Badge></td>
                            <td className="p-2 text-yellow-400 font-mono">{m.cost}</td>
                            <td className="p-2 text-gray-400">{m.useCase}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Reference */}
        <TabsContent value="api">
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-orange-400">API Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {API_FUNCTIONS.map((api, idx) => (
                  <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <code className="text-cyan-400 font-mono text-sm font-bold">{api.name}</code>
                    <p className="text-gray-300 text-xs mt-1">{api.desc}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span><span className="text-purple-400">Params:</span> <span className="text-gray-400">{api.params}</span></span>
                      <span><span className="text-green-400">Returns:</span> <span className="text-gray-400">{api.returns}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}