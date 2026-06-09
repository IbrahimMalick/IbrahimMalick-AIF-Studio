import { DollarSign, Users, TrendingUp, Clock } from "lucide-react";

export default function AffiliateStatsCards({ affiliate }) {
  const stats = [
    {
      label: "Total Earned",
      value: `$${(affiliate?.total_earned_usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
    {
      label: "Pending Balance",
      value: `$${(affiliate?.pending_balance_usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/20",
    },
    {
      label: "Total Referrals",
      value: affiliate?.total_referrals || 0,
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10 border-cyan-400/20",
    },
    {
      label: "Conversions",
      value: affiliate?.total_conversions || 0,
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl border p-5 flex items-center gap-4 ${s.bg}`}>
          <div className={`p-2 rounded-lg bg-white/5`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}