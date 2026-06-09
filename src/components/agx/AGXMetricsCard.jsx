import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function AGXMetricsCard({ value, label, change, trend = "up" }) {
  const isPositive = trend === "up";
  return (
    <Card className="bg-gradient-to-b from-[#1a1a2e] to-[#16162a] border-t-4 border-t-purple-500 border-gray-800 p-6 text-center">
      <p className="text-4xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center justify-center gap-1 mb-2">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-green-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-400" />
        )}
        <span className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>{change}</span>
      </div>
      <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
    </Card>
  );
}