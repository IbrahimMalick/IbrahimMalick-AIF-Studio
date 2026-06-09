import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const BADGE_COLORS = {
  green: "bg-green-500/15 text-green-400 border-green-500/30",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

const MODEL_DETAILS = {
  "veo-3": { strengths: ["Photorealism", "Complex motion", "Long-form"], useCase: "Cinematic productions, commercials, narrative scenes" },
  "kling-2.1-master": { strengths: ["Camera controls", "Motion fidelity", "Consistency"], useCase: "Product demos, character animation, branded content" },
  "runway-gen-4.5": { strengths: ["Prompt adherence", "Style versatility", "Industry standard"], useCase: "Professional video production, creative projects" },
  "minimax-video": { strengths: ["Speed", "Versatility", "Coherent motion"], useCase: "Social media content, quick iterations" },
  "pika-2.0": { strengths: ["Stylization", "Creative control", "Animated looks"], useCase: "Artistic videos, stylized content, creative experiments" },
  "luma-dream-machine": { strengths: ["Speed", "Dreamlike quality", "Fluid motion"], useCase: "Concept visualization, mood pieces, fast prototyping" },
  "stable-video-diffusion": { strengths: ["Open-source", "Customizable", "Image-to-video"], useCase: "Research, custom workflows, image animation" },
};

export default function VideoModelsCatalog({ models, onSelect }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl">Video Model Catalog</h2>
        <p className="text-gray-500 text-sm mt-0.5">{models.length} AI video models available via Poe API</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map(model => {
          const details = MODEL_DETAILS[model.id] || {};
          return (
            <div key={model.id} className="bg-[#111317] border border-gray-800 rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold">{model.name}</h3>
                    {model.badge && (
                      <Badge className={`text-xs border ${BADGE_COLORS[model.badgeColor] || ""}`}>{model.badge}</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{model.provider}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelect(model)}
                  className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded-lg text-xs h-8"
                >
                  <Zap className="w-3 h-3 mr-1" /> Use
                </Button>
              </div>

              <p className="text-gray-400 text-sm mb-4">{model.description}</p>

              {details.strengths && (
                <div className="mb-3">
                  <p className="text-gray-600 text-xs font-medium mb-1.5 uppercase tracking-wider">Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {details.strengths.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#0B0B0C] border border-gray-700 text-gray-400">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {details.useCase && (
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1 uppercase tracking-wider">Best For</p>
                  <p className="text-gray-400 text-xs">{details.useCase}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}