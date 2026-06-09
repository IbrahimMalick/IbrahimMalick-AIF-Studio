import React from "react";
import { Badge } from "@/components/ui/badge";

const RATE_LIMITS = [
  { tier: "Free", perMin: "5", perHour: "50", perDay: "200", concurrent: "1" },
  { tier: "Starter", perMin: "20", perHour: "200", perDay: "1,000", concurrent: "3" },
  { tier: "Professional", perMin: "50", perHour: "500", perDay: "5,000", concurrent: "10" },
  { tier: "Business", perMin: "100", perHour: "1,000", perDay: "10,000", concurrent: "25" },
  { tier: "Enterprise", perMin: "500", perHour: "5,000", perDay: "50,000", concurrent: "100" },
  { tier: "Founder", perMin: "∞", perHour: "∞", perDay: "∞", concurrent: "500" }
];

const TIER_COLORS = {
  "Free": "bg-gray-500/20 text-gray-400",
  "Starter": "bg-green-500/20 text-green-400",
  "Professional": "bg-blue-500/20 text-blue-400",
  "Business": "bg-purple-500/20 text-purple-400",
  "Enterprise": "bg-orange-500/20 text-orange-400",
  "Founder": "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
};

export default function AGXRateLimits() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
            <th className="text-left p-3 text-purple-300 font-semibold">Tier</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Requests/min</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Requests/hour</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Requests/day</th>
            <th className="text-left p-3 text-purple-300 font-semibold">Concurrent</th>
          </tr>
        </thead>
        <tbody>
          {RATE_LIMITS.map((r, idx) => (
            <tr key={idx} className="border-b border-gray-800">
              <td className="p-3">
                <Badge className={`${TIER_COLORS[r.tier]} text-xs`}>{r.tier}</Badge>
              </td>
              <td className="p-3 text-gray-300 font-mono">{r.perMin}</td>
              <td className="p-3 text-gray-300 font-mono">{r.perHour}</td>
              <td className="p-3 text-gray-300 font-mono">{r.perDay}</td>
              <td className="p-3 text-gray-300 font-mono">{r.concurrent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}