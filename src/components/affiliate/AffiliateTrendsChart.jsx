import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { TrendingUp } from "lucide-react";

export default function AffiliateTrendsChart({ commissions = [], clicks = [] }) {
  const chartData = useMemo(() => {
    // Build last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return { dateKey: format(date, "yyyy-MM-dd"), label: format(date, "MMM d"), referrals: 0, commissions: 0 };
    });

    const dayMap = {};
    days.forEach((d) => { dayMap[d.dateKey] = d; });

    clicks.forEach((click) => {
      if (!click.created_date) return;
      const key = format(new Date(click.created_date), "yyyy-MM-dd");
      if (dayMap[key]) dayMap[key].referrals += 1;
    });

    commissions.forEach((c) => {
      if (!c.created_date) return;
      const key = format(new Date(c.created_date), "yyyy-MM-dd");
      if (dayMap[key]) dayMap[key].commissions += parseFloat(c.amount_usd || 0);
    });

    return days;
  }, [commissions, clicks]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 shadow-xl text-xs">
        <p className="text-slate-300 font-semibold mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "commissions"
              ? `Commissions: $${p.value.toFixed(2)}`
              : `Referral Clicks: ${p.value}`}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <span className="text-white font-semibold text-sm">Referrals & Commission Trends</span>
        <span className="ml-auto text-xs text-slate-500">Last 30 days</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }}
            formatter={(value) => value === "referrals" ? "Referral Clicks" : "Commission ($)"}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="referrals"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#gradCyan)"
            dot={false}
            activeDot={{ r: 4, fill: "#22d3ee" }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="commissions"
            stroke="#4ade80"
            strokeWidth={2}
            fill="url(#gradGreen)"
            dot={false}
            activeDot={{ r: 4, fill: "#4ade80" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}