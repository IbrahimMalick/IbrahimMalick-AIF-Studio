import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const BADGE_COLORS = {
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default function VideoModelRail({ models, selectedModel, onSelect }) {
  return (
    <div className="w-56 border-r border-gray-800 bg-[#0d0d0f] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Video Models</p>
        <p className="text-gray-600 text-xs mt-0.5">{models.length} available</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => onSelect(model)}
            className={`w-full text-left p-3 rounded-xl border transition-all group ${
              selectedModel.id === model.id
                ? "border-cyan-500/50 bg-cyan-500/8 shadow-glow-cyan"
                : "border-transparent hover:border-gray-700 hover:bg-[#111317]"
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-semibold truncate ${
                    selectedModel.id === model.id ? "text-cyan-300" : "text-gray-300 group-hover:text-white"
                  }`}>
                    {model.name}
                  </p>
                  {selectedModel.id === model.id && (
                    <CheckCircle className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5 truncate">{model.provider}</p>
              </div>
              {model.badge && (
                <Badge className={`text-[10px] px-1.5 py-0.5 border flex-shrink-0 ${BADGE_COLORS[model.badgeColor] || "bg-gray-700 text-gray-400"}`}>
                  {model.badge}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}