import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Film, Loader2, Sparkles, Download, Play, AlertCircle,
  Clock, CheckCircle, Image as ImageIcon, Clapperboard,
  BookOpen, RefreshCw, ChevronRight, Zap
} from "lucide-react";
import VideoModelRail from "@/components/videostudio/VideoModelRail";
import VideoSettingsPanel from "@/components/videostudio/VideoSettingsPanel";
import VideoPreviewRail from "@/components/videostudio/VideoPreviewRail";
import VideoLibrary from "@/components/videostudio/VideoLibrary";
import VideoModelsCatalog from "@/components/videostudio/VideoModelsCatalog";

const QUICK_PROMPTS = [
  "Cinematic drone shot of a neon-lit city at night, rain reflections",
  "Slow-motion ocean waves crashing on volcanic black rocks at golden hour",
  "A lone astronaut walking on the surface of Mars, dust storm in background",
  "Hyperlapsse of blooming flowers in a sun-drenched meadow",
  "Abstract liquid metal morphing into geometric shapes, studio lighting",
  "Aerial flyover of ancient ruins in a jungle at sunrise",
];

const VIDEO_MODELS = [
  { id: "veo-3", name: "Veo 3", provider: "Google", badge: "Top", badgeColor: "green", description: "Google's flagship video model with exceptional quality & realism." },
  { id: "kling-v3", name: "Kling V3", provider: "Kuaishou", badge: "Pro", badgeColor: "blue", description: "High-fidelity motion synthesis with cinematic camera controls." },
  { id: "runway-gen-4.5", name: "Runway Gen-4.5", provider: "RunwayML", badge: "Popular", badgeColor: "purple", description: "Industry-standard for professional video generation." },
  { id: "Wan-2.7", name: "Wan 2.7", provider: "Alibaba", badge: "New", badgeColor: "cyan", description: "Multimodal video from text, images, or video references with strong motion control." },
  { id: "Sora-2-Pro", name: "Sora 2 Pro", provider: "OpenAI", badge: "Premium", badgeColor: "yellow", description: "OpenAI's state-of-the-art video model with synchronized audio generation." },
  { id: "Kling-O3", name: "Kling O3", provider: "Kuaishou", badge: "", badgeColor: "", description: "Versatile model with multi-scene transitions and native sound generation." },
  { id: "Kling-v3-Pro", name: "Kling v3 Pro", provider: "Kuaishou", badge: "", badgeColor: "", description: "High-quality text-to-video and image-to-video with start/end frame support." },
];

const DURATIONS = ["3s", "5s", "8s", "10s", "15s"];
const RESOLUTIONS = ["720p", "1080p", "4K", "9:16 (Vertical)", "1:1 (Square)"];

export default function VideoStudioPage() {
  const [selectedModel, setSelectedModel] = useState(VIDEO_MODELS[0]);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("5s");
  const [resolution, setResolution] = useState("1080p");
  const [referenceImage, setReferenceImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null); // currently previewed video
  const [library, setLibrary] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vs_library") || "[]"); } catch { return []; }
  });
  const [tab, setTab] = useState("studio");
  const fileInputRef = useRef(null);

  const saveLibrary = (items) => {
    setLibrary(items);
    localStorage.setItem("vs_library", JSON.stringify(items));
  };

  const generate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const newEntry = {
      id: Date.now().toString(),
      title: prompt.slice(0, 60) + (prompt.length > 60 ? "…" : ""),
      prompt,
      model: selectedModel.id,
      modelName: selectedModel.name,
      provider: selectedModel.provider,
      status: "processing",
      videoUrl: null,
      thumbnailUrl: null,
      duration,
      resolution,
      createdAt: new Date().toISOString(),
      error: null,
    };

    const updated = [newEntry, ...library];
    saveLibrary(updated);
    setActiveVideo(newEntry);
    setIsGenerating(true);

    try {
      const res = await base44.functions.invoke("poeAI", {
        action: "generate_video",
        model: selectedModel.id,
        prompt,
      });

      const videoUrl = res.data?.video_url || null;
      const reply = res.data?.reply || "";

      // Try extracting URL from reply if not direct
      let finalUrl = videoUrl;
      if (!finalUrl && reply) {
        // Match poecdn video paths (no extension) or standard video file URLs
        const match = reply.match(/https?:\/\/[^\s"'<>)\]]+poecdn[^\s"'<>)\]]*/i)
          || reply.match(/https?:\/\/[^\s"'<>)\]]+(?:\.mp4|\.mov|\.webm|\.avi)/i)
          || reply.match(/https?:\/\/[^\s"'<>)\]]+/i);
        finalUrl = match ? match[0].replace(/[.,;]+$/, '') : null;
      }

      const completed = {
        ...newEntry,
        status: finalUrl ? "completed" : "failed",
        videoUrl: finalUrl,
        error: finalUrl ? null : (reply || "No video URL returned by model."),
      };

      const finalLibrary = updated.map(v => v.id === newEntry.id ? completed : v);
      saveLibrary(finalLibrary);
      setActiveVideo(completed);
    } catch (err) {
      const failed = { ...newEntry, status: "failed", error: err.message };
      const finalLibrary = updated.map(v => v.id === newEntry.id ? failed : v);
      saveLibrary(finalLibrary);
      setActiveVideo(failed);
    }

    setIsGenerating(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReferenceImage({ file, url, name: file.name });
    }
  };

  const openFromLibrary = (entry) => {
    setActiveVideo(entry);
    setTab("studio");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col">
      {/* Top Header */}
      <div className="border-b border-gray-800 bg-[#0d0d0f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Clapperboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Video Studio</h1>
            <p className="text-gray-500 text-xs">AI-powered video generation via Poe</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1.5" />
            {VIDEO_MODELS.length} Models
          </Badge>
          <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 text-xs px-3 py-1">
            Poe API Live
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
          <div className="border-b border-gray-800 bg-[#0d0d0f] px-6">
            <TabsList className="bg-transparent border-0 p-0 h-12 gap-1">
              {[
                { id: "studio", label: "Studio", icon: Zap },
                { id: "library", label: `Library (${library.length})`, icon: Film },
                { id: "models", label: "Models", icon: BookOpen },
              ].map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-400 data-[state=active]:bg-transparent text-gray-500 hover:text-gray-300 transition-all px-4 h-full text-sm"
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── STUDIO TAB ── */}
          <TabsContent value="studio" className="flex-1 overflow-hidden m-0">
            <div className="h-full flex overflow-hidden">

              {/* LEFT: Model Rail */}
              <VideoModelRail
                models={VIDEO_MODELS}
                selectedModel={selectedModel}
                onSelect={setSelectedModel}
              />

              {/* CENTER: Workspace */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Quick Prompts */}
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Quick Prompts</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((qp, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(qp)}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#1a1a22] border border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-300 transition-all"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {qp.slice(0, 45)}…
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 block">Video Prompt</label>
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe your video in detail — camera movement, lighting, mood, subject, environment..."
                    className="bg-[#111317] border-gray-700 text-white rounded-xl min-h-[110px] text-sm resize-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Settings */}
                <VideoSettingsPanel
                  duration={duration}
                  setDuration={setDuration}
                  resolution={resolution}
                  setResolution={setResolution}
                  durations={DURATIONS}
                  resolutions={RESOLUTIONS}
                  referenceImage={referenceImage}
                  onUploadClick={() => fileInputRef.current?.click()}
                  onClearImage={() => setReferenceImage(null)}
                />

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                {/* Generate Button */}
                <Button
                  onClick={generate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl h-12 text-sm font-semibold disabled:opacity-40 transition-all"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating with {selectedModel.name}…</>
                  ) : (
                    <><Film className="w-4 h-4 mr-2" />Generate Video</>
                  )}
                </Button>

                {isGenerating && (
                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing with <strong>{selectedModel.name}</strong></span>
                    </div>
                    <p className="text-gray-500 text-xs">Video generation may take 30–120 seconds depending on model and settings.</p>
                    <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                )}

                {/* Recent Generations (last 3) */}
                {library.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Recent Generations</p>
                      <button onClick={() => setTab("library")} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {library.slice(0, 3).map(entry => (
                        <RecentCard key={entry.id} entry={entry} onOpen={openFromLibrary} isActive={activeVideo?.id === entry.id} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Preview Rail */}
              <VideoPreviewRail
                activeVideo={activeVideo}
                selectedModel={selectedModel}
                prompt={prompt}
                duration={duration}
                resolution={resolution}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>

          {/* ── LIBRARY TAB ── */}
          <TabsContent value="library" className="flex-1 overflow-y-auto m-0 p-6">
            <VideoLibrary library={library} onOpen={openFromLibrary} onClear={() => saveLibrary([])} />
          </TabsContent>

          {/* ── MODELS CATALOG TAB ── */}
          <TabsContent value="models" className="flex-1 overflow-y-auto m-0 p-6">
            <VideoModelsCatalog models={VIDEO_MODELS} onSelect={(m) => { setSelectedModel(m); setTab("studio"); }} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RecentCard({ entry, onOpen, isActive }) {
  const statusIcon = {
    processing: <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />,
    completed: <CheckCircle className="w-3.5 h-3.5 text-green-400" />,
    failed: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  }[entry.status];

  return (
    <button
      onClick={() => onOpen(entry)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isActive ? "border-cyan-500/50 bg-cyan-500/5" : "border-gray-800 bg-[#111317] hover:border-gray-600"
      }`}
    >
      <div className="flex items-center gap-2">
        {statusIcon}
        <span className="text-sm text-white truncate flex-1">{entry.title}</span>
        <Badge className="text-xs bg-transparent border border-gray-700 text-gray-500">{entry.modelName}</Badge>
      </div>
    </button>
  );
}