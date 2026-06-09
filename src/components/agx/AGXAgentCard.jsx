import React from "react";
import { Badge } from "@/components/ui/badge";

const AGENT_COLORS = {
  "AG-X": "from-purple-600 to-purple-800",
  "AG-APEX": "from-orange-500 to-red-600",
  "AG-CREATIVE": "from-pink-500 to-rose-600",
  "AG-TECH": "from-cyan-500 to-blue-600",
  "AG-DELIVERY": "from-amber-500 to-orange-600",
  "AG-SPECIALIST": "from-emerald-500 to-teal-600",
  "ARIA": "from-violet-500 to-purple-600"
};

export default function AGXAgentCard({ name, title, model, access, description, capabilities }) {
  const gradient = AGENT_COLORS[name] || "from-gray-600 to-gray-800";
  
  return (
    <div className="bg-[#111317] border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 transition-all">
      <div className={`h-1 w-full bg-gradient-to-r ${gradient} rounded-full mb-4`} />
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{name}</h3>
          <p className="text-gray-400 text-sm">{title}</p>
        </div>
        <Badge className="bg-gray-800 text-gray-300 text-xs">{access}</Badge>
      </div>
      <p className="text-xs text-gray-500 mb-2">Model: {model}</p>
      <p className="text-gray-300 text-sm mb-3">{description}</p>
      <div className="flex flex-wrap gap-1">
        {capabilities.map((cap, idx) => (
          <span key={idx} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">■ {cap}</span>
        ))}
      </div>
    </div>
  );
}