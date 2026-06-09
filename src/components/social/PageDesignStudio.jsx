import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Layout, Image, Type, Check, Wand2, Download } from "lucide-react";

const THEMES = [
  {
    id: "bold_dark",
    label: "Bold Dark",
    preview: "bg-gradient-to-br from-slate-900 to-slate-800",
    accent: "#00D9FF",
    text: "#FFFFFF",
    bg: "#0B0B0C",
  },
  {
    id: "vibrant",
    label: "Vibrant",
    preview: "bg-gradient-to-br from-purple-600 to-pink-600",
    accent: "#FF006E",
    text: "#FFFFFF",
    bg: "#1A0033",
  },
  {
    id: "clean_light",
    label: "Clean Light",
    preview: "bg-gradient-to-br from-white to-slate-100",
    accent: "#2563EB",
    text: "#111827",
    bg: "#F9FAFB",
  },
  {
    id: "earthy",
    label: "Earthy",
    preview: "bg-gradient-to-br from-amber-700 to-orange-800",
    accent: "#F59E0B",
    text: "#FFFFFF",
    bg: "#1C1007",
  },
  {
    id: "neon",
    label: "Neon Glow",
    preview: "bg-gradient-to-br from-green-400 to-cyan-400",
    accent: "#10B981",
    text: "#000000",
    bg: "#0D1F0F",
  },
  {
    id: "minimal",
    label: "Minimal",
    preview: "bg-gradient-to-br from-gray-100 to-gray-200",
    accent: "#374151",
    text: "#111827",
    bg: "#FFFFFF",
  },
];

const BIO_TEMPLATES = [
  "🚀 {niche} expert | Helping {audience} achieve {goal} | DM for collabs 👇",
  "✨ {niche} creator | {followers}K community | New content every week",
  "🎯 Founder @{brand} | {niche} tips daily | Link below 👇",
  "💡 Sharing {niche} insights | {cta} | Follow for daily value",
];

export default function PageDesignStudio() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [niche, setNiche] = useState("");

  const generateBio = async () => {
    if (!niche) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a compelling social media bio for someone in the ${niche} niche. 
      Make it engaging, include relevant emojis, a call to action, and keep it under 150 characters. 
      Format it for Instagram/LinkedIn profile. Return just the bio text.`,
    });
    setBio(result);
    setGenerating(false);
  };

  const applyTemplate = (template) => {
    setSelectedTemplate(template);
    setBio(template.replace("{niche}", niche || "your niche").replace("{audience}", "your audience").replace("{goal}", "their goals").replace("{followers}", "10").replace("{brand}", "YourBrand").replace("{cta}", "Click the link").replace("{brand}", "YourBrand"));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-6">
        {/* Theme Selector */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-holographic-cyan" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Brand Theme</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`relative rounded-xl h-20 ${theme.preview} border-2 transition-all ${
                  selectedTheme.id === theme.id ? "border-blue-400 scale-105" : "border-transparent"
                }`}
              >
                {selectedTheme.id === theme.id && (
                  <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="absolute bottom-1.5 left-0 right-0 text-center text-xs font-semibold text-white drop-shadow">
                  {theme.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-holographic-cyan" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Profile Info</h3>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="Display Name"
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Input
              placeholder="Website URL"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* AI Bio Generator */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-holographic-cyan" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">AI Bio Generator</h3>
          </div>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Your niche (e.g. fitness, SaaS, photography)"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white flex-1"
            />
            <Button
              onClick={generateBio}
              disabled={generating || !niche}
              className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap"
            >
              {generating ? "..." : "Generate"}
            </Button>
          </div>
          {/* Bio templates */}
          <p className="text-xs text-slate-500 mb-2">Or pick a template:</p>
          <div className="space-y-2">
            {BIO_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(t)}
                className="w-full text-left text-xs text-slate-400 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Your bio will appear here..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="mt-3 bg-slate-800 border-slate-600 text-white min-h-[80px] resize-none"
          />
        </div>
      </div>

      {/* Live Preview Panel */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-4 h-4 text-holographic-cyan" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Live Preview</h3>
        </div>
        <div
          className="rounded-2xl p-6 min-h-[400px] border border-slate-700"
          style={{ backgroundColor: selectedTheme.bg, color: selectedTheme.text }}
        >
          {/* Profile header */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold"
              style={{ borderColor: selectedTheme.accent, backgroundColor: selectedTheme.accent + "30" }}
            >
              {profileName ? profileName[0].toUpperCase() : "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: selectedTheme.text }}>
                {profileName || "Your Name"}
              </h2>
              {website && (
                <a className="text-xs mt-1 block" style={{ color: selectedTheme.accent }}>
                  🔗 {website}
                </a>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {["Posts", "Followers", "Following"].map(stat => (
              <div key={stat} className="text-center p-2 rounded-lg" style={{ backgroundColor: selectedTheme.accent + "20" }}>
                <div className="text-lg font-bold" style={{ color: selectedTheme.accent }}>0</div>
                <div className="text-xs opacity-70">{stat}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-sm mb-5 leading-relaxed opacity-90 whitespace-pre-wrap">{bio}</p>
          )}

          {/* CTA Button */}
          <button
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: selectedTheme.accent, color: selectedTheme.bg }}
          >
            Follow
          </button>

          {/* Content grid placeholder */}
          <div className="grid grid-cols-3 gap-1 mt-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-md opacity-20"
                style={{ backgroundColor: selectedTheme.accent }}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2 text-center">
          Preview only — apply settings in each platform's native editor
        </p>
      </div>
    </div>
  );
}