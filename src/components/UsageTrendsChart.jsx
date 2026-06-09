import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import { TrendingUp, Cpu, DollarSign } from "lucide-react";

const RANGE_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d24] border border-gray-700 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-300 capitalize">{entry.name}:</span>
          <span className="text-white font-semibold">
            {entry.name === "cost" ? `$${entry.value.toFixed(4)}` : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function UsageTrendsChart({ user }) {
  const [rangeDays, setRangeDays] = useState(14);

  const { data: usageLogs = [], isLoading } = useQuery({
    queryKey: ["aiUsageLogs", user?.email, rangeDays],
    queryFn: () => base44.entities.AIUsageLog.list("-created_date", 500),
    enabled: !!user?.email,
  });

  // Build daily buckets over the selected range
  const today = startOfDay(new Date());
  const days = Array.from({ length: rangeDays }, (_, i) => {
    const d = subDays(today, rangeDays - 1 - i);
    return { date: d, label: format(d, rangeDays <= 7 ? "EEE" : "MMM d"), tokens: 0, cost: 0, calls: 0 };
  });

  usageLogs.forEach((log) => {
    if (!log.created_date) return;
    const logDay = startOfDay(parseISO(log.created_date));
    const bucket = days.find((d) => d.date.getTime() === logDay.getTime());
    if (bucket) {
      bucket.tokens += log.tokens_used || 0;
      bucket.cost += log.cost_usd || 0;
      bucket.calls += 1;
    }
  });

  const chartData = days.map((d) => ({
    label: d.label,
    tokens: d.tokens,
    cost: parseFloat(d.cost.toFixed(4)),
    calls: d.calls,
  }));

  const totalTokens = days.reduce((s, d) => s + d.tokens, 0);
  const totalCost = days.reduce((s, d) => s + d.cost, 0);
  const totalCalls = days.reduce((s, d) => s + d.calls, 0);
  const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-[#FFD700]" />
            Platform Usage Trends
          </CardTitle>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => setRangeDays(opt.days)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  rangeDays === opt.days
                    ? "bg-[#FFD700] text-black"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-[#0B0B0C] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5 text-[#00D4C9]" />
              <span className="text-xs text-gray-500">Total Tokens</span>
            </div>
            <p className="text-white font-bold text-lg">{totalTokens.toLocaleString()}</p>
          </div>
          <div className="bg-[#0B0B0C] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="text-xs text-gray-500">Total Cost</span>
            </div>
            <p className="text-white font-bold text-lg">${totalCost.toFixed(3)}</p>
          </div>
          <div className="bg-[#0B0B0C] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-gray-500">Avg Cost/Call</span>
            </div>
            <p className="text-white font-bold text-lg">${avgCostPerCall.toFixed(4)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Tokens chart */}
            <div>
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Tokens Used</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4C9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D4C9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="#00D4C9"
                    strokeWidth={2}
                    fill="url(#tokenGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#00D4C9" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cost chart */}
            <div>
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Generation Cost (USD)</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFD700" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#FF8C00" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cost" fill="url(#costGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {totalCalls === 0 && (
              <p className="text-center text-gray-600 text-sm pb-2">
                No AI usage logged in this period yet — charts will populate as you generate content.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}