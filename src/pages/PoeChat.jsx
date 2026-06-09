import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Send, Loader2, Bot, User, Sparkles, Image as ImageIcon,
  Film, Mic2, Trash2, Copy, ChevronDown, Zap
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const CATEGORIES = [
  { id: "llm", label: "💬 Chat / LLM", icon: Bot },
  { id: "image", label: "🎨 Image", icon: ImageIcon },
  { id: "video", label: "🎬 Video", icon: Film },
  { id: "audio", label: "🎵 Audio", icon: Mic2 },
];

const DEFAULT_MODELS = {
  llm: "GPT-4o",
  image: "DALL-E-3",
  video: "Veo3",
  audio: "ElevenLabs-Turbo",
};

export default function PoeChat() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("llm");
  const [models, setModels] = useState({});
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [generatedMedia, setGeneratedMedia] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
    loadModels();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadModels = async () => {
    setModelsLoading(true);
    try {
      const res = await base44.functions.invoke("poeAI", { action: "list_models" });
      setModels(res.data.models || {});
    } catch (e) {
      console.error("Failed to load models:", e);
    }
    setModelsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const history = newMessages.slice(0, -1); // exclude last user msg (sent as `message`)
      const res = await base44.functions.invoke("poeAI", {
        action: "chat",
        model: selectedModel.llm,
        message: userMsg.content,
        conversation_history: history,
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply, model: res.data.model }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}`, error: true }]);
    }
    setIsLoading(false);
  };

  const generateImage = async () => {
    if (!imagePrompt.trim() || mediaLoading) return;
    setMediaLoading(true);
    setGeneratedMedia(null);
    try {
      const res = await base44.functions.invoke("poeAI", {
        action: "generate_image",
        model: selectedModel.image,
        prompt: imagePrompt,
      });
      setGeneratedMedia({ type: "image", url: res.data.image_url, reply: res.data.reply, model: res.data.model });
    } catch (e) {
      setGeneratedMedia({ type: "error", reply: e.message });
    }
    setMediaLoading(false);
  };

  const generateVideo = async () => {
    if (!videoPrompt.trim() || mediaLoading) return;
    setMediaLoading(true);
    setGeneratedMedia(null);
    try {
      const res = await base44.functions.invoke("poeAI", {
        action: "generate_video",
        model: selectedModel.video,
        prompt: videoPrompt,
      });
      setGeneratedMedia({ type: "video", url: res.data.video_url, reply: res.data.reply, model: res.data.model });
    } catch (e) {
      setGeneratedMedia({ type: "error", reply: e.message });
    }
    setMediaLoading(false);
  };

  const copyText = (text) => navigator.clipboard.writeText(text);

  const currentModels = models[activeTab] || [];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Poe AI Studio
            </h1>
            <p className="text-gray-400 mt-1">600+ AI models via Poe.com — Chat, Image, Video & Audio</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
            Poe API Connected
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setGeneratedMedia(null); }}>
          <TabsList className="bg-[#111317] border border-gray-800 rounded-xl p-1">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-pink-500/30 data-[state=active]:text-white">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── LLM Chat Tab ── */}
          <TabsContent value="llm" className="mt-4">
            <div className="grid lg:grid-cols-4 gap-4">

              {/* Model Selector Sidebar */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm font-semibold">Select Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                  {modelsLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />Loading...
                    </div>
                  ) : (
                    (models.llm || []).map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel(prev => ({ ...prev, llm: m.id }))}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                          selectedModel.llm === m.id
                            ? "border-purple-500/50 bg-purple-500/10 text-white"
                            : "border-gray-800 bg-[#0B0B0C] text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-xs opacity-60 mt-0.5">{m.provider}</div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl lg:col-span-3 flex flex-col" style={{ height: "600px" }}>
                <CardHeader className="pb-3 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      Chat with <span className="text-purple-400">{selectedModel.llm}</span>
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setMessages([])}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Sparkles className="w-12 h-12 text-purple-400 mb-3" />
                      <p className="text-gray-400">Start a conversation with {selectedModel.llm}</p>
                      <p className="text-gray-600 text-sm mt-1">Powered by Poe.com API</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-purple-600/30 border border-purple-500/30 text-white"
                          : msg.error
                          ? "bg-red-500/10 border border-red-500/30 text-red-400"
                          : "bg-[#0B0B0C] border border-gray-800 text-gray-200"
                      }`}>
                        {msg.role === "user" ? (
                          <p className="text-sm">{msg.content}</p>
                        ) : (
                          <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none">
                            {msg.content}
                          </ReactMarkdown>
                        )}
                        {msg.model && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                            <Badge className="bg-purple-500/20 text-purple-300 text-xs">{msg.model}</Badge>
                            <button onClick={() => copyText(msg.content)} className="text-gray-600 hover:text-gray-400">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-[#0B0B0C] border border-gray-800 rounded-2xl px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder={`Message ${selectedModel.llm}...`}
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ── Image Generation Tab ── */}
          <TabsContent value="image" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    Image Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Model</label>
                    <Select value={selectedModel.image} onValueChange={v => setSelectedModel(p => ({ ...p, image: v }))}>
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(models.image || []).map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name} — {m.provider}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Prompt</label>
                    <Textarea
                      value={imagePrompt}
                      onChange={e => setImagePrompt(e.target.value)}
                      placeholder="A futuristic cityscape at sunset with neon lights reflecting on wet streets..."
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[120px]"
                    />
                  </div>
                  <Button
                    onClick={generateImage}
                    disabled={mediaLoading || !imagePrompt.trim()}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl"
                  >
                    {mediaLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Image</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-2xl flex items-center justify-center min-h-[300px]">
                {!generatedMedia && !mediaLoading && (
                  <div className="text-center text-gray-600">
                    <ImageIcon className="w-16 h-16 mx-auto mb-3" />
                    <p>Your generated image will appear here</p>
                  </div>
                )}
                {mediaLoading && (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-pink-400 mx-auto mb-3" />
                    <p className="text-gray-400">Generating with {selectedModel.image}...</p>
                  </div>
                )}
                {generatedMedia && !mediaLoading && (
                  <div className="p-4 w-full">
                    {generatedMedia.url ? (
                      <img src={generatedMedia.url} alt="Generated" className="w-full rounded-xl" />
                    ) : (
                      <div className="p-4 bg-[#0B0B0C] rounded-xl">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{generatedMedia.reply}</p>
                      </div>
                    )}
                    <Badge className="mt-2 bg-pink-500/20 text-pink-300">{generatedMedia.model}</Badge>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ── Video Generation Tab ── */}
          <TabsContent value="video" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Film className="w-5 h-5 text-cyan-400" />
                    Video Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Model</label>
                    <Select value={selectedModel.video} onValueChange={v => setSelectedModel(p => ({ ...p, video: v }))}>
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(models.video || []).map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name} — {m.provider}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Prompt</label>
                    <Textarea
                      value={videoPrompt}
                      onChange={e => setVideoPrompt(e.target.value)}
                      placeholder="A slow-motion shot of ocean waves crashing on a rocky shore at golden hour..."
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[120px]"
                    />
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-yellow-400 text-xs">⚠️ Video generation may take 30–120 seconds and uses Poe's video model credits.</p>
                  </div>
                  <Button
                    onClick={generateVideo}
                    disabled={mediaLoading || !videoPrompt.trim()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl"
                  >
                    {mediaLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Film className="w-4 h-4 mr-2" />Generate Video</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-2xl flex items-center justify-center min-h-[300px]">
                {!generatedMedia && !mediaLoading && (
                  <div className="text-center text-gray-600">
                    <Film className="w-16 h-16 mx-auto mb-3" />
                    <p>Your generated video will appear here</p>
                  </div>
                )}
                {mediaLoading && (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-3" />
                    <p className="text-gray-400">Generating with {selectedModel.video}...</p>
                    <p className="text-gray-600 text-sm mt-1">This may take up to 2 minutes...</p>
                  </div>
                )}
                {generatedMedia && !mediaLoading && (
                  <div className="p-4 w-full">
                    {generatedMedia.url ? (
                      <video src={generatedMedia.url} controls className="w-full rounded-xl" />
                    ) : (
                      <div className="p-4 bg-[#0B0B0C] rounded-xl">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{generatedMedia.reply}</p>
                      </div>
                    )}
                    {generatedMedia.model && <Badge className="mt-2 bg-cyan-500/20 text-cyan-300">{generatedMedia.model}</Badge>}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ── Audio Tab ── */}
          <TabsContent value="audio" className="mt-4">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="py-12 text-center">
                <Mic2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-white font-bold text-xl mb-2">Audio Generation</h3>
                <p className="text-gray-400 mb-4">Audio generation via Poe (ElevenLabs Turbo, Bark, MusicGen) is available — use the Chat tab to send prompts to audio models directly.</p>
                <Button
                  onClick={() => setActiveTab("llm")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
                >
                  Switch to Chat Mode
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Model Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "LLM Models", count: (models.llm || []).length || 11, color: "from-purple-500 to-pink-500" },
            { label: "Video Models", count: (models.video || []).length || 8, color: "from-cyan-500 to-blue-500" },
            { label: "Image Models", count: (models.image || []).length || 5, color: "from-pink-500 to-orange-500" },
            { label: "Audio Models", count: (models.audio || []).length || 3, color: "from-green-500 to-teal-500" },
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-[#111317] border border-gray-800 rounded-xl text-center">
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.count}
              </div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}