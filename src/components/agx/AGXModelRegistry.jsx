import React from "react";
import { Badge } from "@/components/ui/badge";

const MODELS = [
  { model: "Claude Opus 4.5", provider: "Anthropic", context: "200K", cost: "$0.018 / $0.090", tier: "Enterprise" },
  { model: "Claude Opus 4", provider: "Anthropic", context: "200K", cost: "$0.015 / $0.075", tier: "Professional" },
  { model: "Claude Sonnet 4.5", provider: "Anthropic", context: "200K", cost: "$0.004 / $0.020", tier: "Professional" },
  { model: "Claude Sonnet 4", provider: "Anthropic", context: "200K", cost: "$0.003 / $0.015", tier: "Starter" },
  { model: "Claude Haiku 4.5", provider: "Anthropic", context: "100K", cost: "$0.0004 / $0.002", tier: "Starter" },
  { model: "GPT-4 Turbo", provider: "OpenAI", context: "128K", cost: "$0.010 / $0.030", tier: "Professional" },
  { model: "GPT-4o", provider: "OpenAI", context: "128K", cost: "$0.005 / $0.015", tier: "Starter" },
  { model: "GPT-4o Mini", provider: "OpenAI", context: "128K", cost: "$0.00015 / $0.0006", tier: "Free" }
];

const TIER_COLORS = {
  "Enterprise": "bg-purple-500/20 text-purple-400",
  "Professional": "bg-blue-500/20 text-blue-400",
  "Starter": "bg-green-500/20 text-green-400",
  "Free": "bg-gray-500/20 text-gray-400"
};

export default function AGXModelRegistry() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
            <th className="text-left p-3 text-purple-300 font-semibold">Model</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Provider</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Context</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Cost (1K tokens)</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Min Tier</th>
          </tr>
        </thead>
        <tbody>
          {MODELS.map((m, idx) => (
            <tr key={idx} className="border-b border-gray-800">
              <td className="p-3 text-white font-mono text-xs">{m.model}</td>
              <td className="p-3 text-gray-300">{m.provider}</td>
              <td className="p-3 text-gray-400">{m.context}</td>
              <td className="p-3 text-gray-400 font-mono text-xs">{m.cost}</td>
              <td className="p-3">
                <Badge className={`${TIER_COLORS[m.tier]} text-xs`}>{m.tier}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}