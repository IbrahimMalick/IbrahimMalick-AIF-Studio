import { useMemo } from "react";
import { startOfMonth, isAfter } from "date-fns";
import { TrendingUp, Link2, DollarSign, Trophy } from "lucide-react";

export default function MonthlySummary({ commissions = [], links = [] }) {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const monthlyCommissions = useMemo(
    () => commissions.filter((c) => c.created_date && isAfter(new Date(c.created_date), monthStart)),
    [commissions]
  );

  const monthlyEarnings = useMemo(
    () => monthlyCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    [monthlyCommissions]
  );

  // Rank links by conversions, fallback to click_count
  const topLinks = useMemo(() => {
    return [...links]
      .sort((a, b) => (b.conversions || 0) - (a.conversions || 0) || (b.click_count || 0) - (a.click_count || 0))
      .slice(0, 5);
  }, [links]);

  const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-slate-900/40 to-slate-900/60 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Trophy className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Monthly Summary</h2>
          <p className="text-slate-400 text-xs">{monthLabel}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2">
          <DollarSign className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-bold text-lg">
            ${monthlyEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-slate-400 text-xs ml-1">this month</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Earnings Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-300">Earnings Breakdown</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Commissions", value: monthlyCommissions.filter(c => c.status !== "paid").length, color: "text-yellow-400" },
              { label: "Approved", value: monthlyCommissions.filter(c => c.status === "approved").length, color: "text-green-400" },
              { label: "Paid Out", value: monthlyCommissions.filter(c => c.status === "paid").length, color: "text-cyan-400" },
              { label: "Total Transactions", value: monthlyCommissions.length, color: "text-white" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400 text-sm">{row.label}</span>
                <span className={`font-bold text-sm ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Links */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-300">Top Referral Links</span>
          </div>
          {topLinks.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">No tracking links yet.</p>
          ) : (
            <div className="space-y-2">
              {topLinks.map((link, i) => (
                <div key={link.id} className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold w-5 text-center flex-shrink-0 ${
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-500"
                    }`}>#{i + 1}</span>
                    <span className="text-slate-300 text-sm truncate">{link.campaign_name || "Default Campaign"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs flex-shrink-0 ml-2">
                    <span className="text-slate-400">{link.click_count || 0} clicks</span>
                    <span className="text-green-400 font-bold">{link.conversions || 0} conv.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}