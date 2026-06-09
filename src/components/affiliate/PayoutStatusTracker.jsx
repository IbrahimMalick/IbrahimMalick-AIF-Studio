import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Clock, Loader2, CheckCircle2, DollarSign, ChevronRight, AlertCircle } from "lucide-react";

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Pending",
    desc: "Commission earned, awaiting review",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
    dot: "bg-yellow-400",
  },
  {
    key: "approved",
    label: "Processing",
    desc: "Approved and queued for payout",
    icon: Loader2,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    dot: "bg-blue-400",
  },
  {
    key: "paid",
    label: "Paid Out",
    desc: "Funds sent to your account",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/40",
    dot: "bg-green-400",
  },
];

function StepIndicator({ step, isActive, isComplete }) {
  const Icon = step.icon;
  return (
    <div className="flex flex-col items-center flex-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
        isComplete ? "bg-green-500/30 border-green-500" :
        isActive  ? `${step.bg} ${step.border}` :
        "bg-slate-800 border-slate-700"
      }`}>
        <Icon className={`w-5 h-5 ${isComplete ? "text-green-400" : isActive ? step.color : "text-slate-600"} ${isActive && step.key === "approved" ? "animate-spin" : ""}`} />
      </div>
      <p className={`text-xs font-semibold mt-2 ${isComplete || isActive ? "text-white" : "text-slate-600"}`}>{step.label}</p>
      <p className="text-xs text-slate-500 text-center hidden sm:block mt-0.5">{step.desc}</p>
    </div>
  );
}

function CommissionRow({ commission }) {
  const statusStep = STATUS_STEPS.find(s => s.key === commission.status) || STATUS_STEPS[0];
  const Icon = statusStep.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${statusStep.bg}`}>
          <Icon className={`w-4 h-4 ${statusStep.color} ${commission.status === "approved" ? "animate-spin" : ""}`} />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {commission.description || "Commission"}
          </p>
          <p className="text-slate-500 text-xs">
            {commission.created_date ? format(new Date(commission.created_date), "MMM d, yyyy") : "—"}
            {commission.paid_at && <span className="ml-2 text-green-500">· Paid {format(new Date(commission.paid_at), "MMM d")}</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <span className={`text-sm font-bold ${statusStep.color}`}>
          ${(commission.amount_usd || 0).toFixed(2)}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusStep.bg} ${statusStep.color} ${statusStep.border}`}>
          {commission.status === "approved" ? "Processing" : commission.status?.charAt(0).toUpperCase() + commission.status?.slice(1)}
        </span>
      </div>
    </div>
  );
}

export default function PayoutStatusTracker({ affiliate, commissions }) {
  const pendingTotal = commissions.filter(c => c.status === "pending").reduce((s, c) => s + (c.amount_usd || 0), 0);
  const processingTotal = commissions.filter(c => c.status === "approved").reduce((s, c) => s + (c.amount_usd || 0), 0);
  const paidTotal = commissions.filter(c => c.status === "paid").reduce((s, c) => s + (c.amount_usd || 0), 0);

  const minPayout = 50;
  const currentBalance = pendingTotal + processingTotal;
  const progressPct = Math.min((currentBalance / minPayout) * 100, 100);
  const recentCommissions = [...commissions].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);

  return (
    <div className="space-y-4">
      {/* Balance + Progress */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            Payout Status
          </h3>
          <span className="text-xs text-slate-500">Min payout: $50.00</span>
        </div>

        {/* 3 Balance Buckets */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-lg font-bold">${pendingTotal.toFixed(2)}</p>
            <p className="text-yellow-500/70 text-xs mt-0.5">Pending</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400 text-lg font-bold">${processingTotal.toFixed(2)}</p>
            <p className="text-blue-500/70 text-xs mt-0.5">Processing</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-lg font-bold">${paidTotal.toFixed(2)}</p>
            <p className="text-green-500/70 text-xs mt-0.5">Paid Out</p>
          </div>
        </div>

        {/* Progress to Next Payout */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Progress to next payout</span>
            <span className="text-white font-semibold">${currentBalance.toFixed(2)} / $50.00</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {currentBalance >= minPayout ? (
            <p className="text-green-400 text-xs mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for payout — processing automatically
            </p>
          ) : (
            <p className="text-slate-500 text-xs mt-1.5">
              ${(minPayout - currentBalance).toFixed(2)} more needed to trigger payout
            </p>
          )}
        </div>
      </div>

      {/* Status Pipeline */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <h3 className="text-white font-semibold text-sm mb-5">How Payouts Work</h3>
        <div className="flex items-start gap-2">
          {STATUS_STEPS.map((step, idx) => (
            <div key={step.key} className="flex items-center flex-1">
              <StepIndicator
                step={step}
                isActive={step.key === "pending" && pendingTotal > 0 || step.key === "approved" && processingTotal > 0}
                isComplete={step.key === "paid" && paidTotal > 0}
              />
              {idx < STATUS_STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-700 flex-shrink-0 mx-1 mb-6" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Commissions */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Recent Commissions</h3>
        {recentCommissions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="text-sm">No commissions yet. Share your referral link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentCommissions.map(c => (
              <CommissionRow key={c.id} commission={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}