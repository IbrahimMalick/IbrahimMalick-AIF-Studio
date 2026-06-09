import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const STATUS_STYLES = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  refunded: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AffiliateCommissionsTable({ commissions }) {
  if (!commissions || commissions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg">No commissions yet.</p>
        <p className="text-sm mt-1">Share your referral link to start earning!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-left">
            <th className="pb-3 pr-4 font-medium">Customer</th>
            <th className="pb-3 pr-4 font-medium">Sale Amount</th>
            <th className="pb-3 pr-4 font-medium">Commission</th>
            <th className="pb-3 pr-4 font-medium">Rate</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((c) => (
            <tr key={c.id} className="border-b border-slate-800 hover:bg-white/5 transition-colors">
              <td className="py-3 pr-4 text-slate-300">{c.customer_email}</td>
              <td className="py-3 pr-4 text-white font-medium">
                ${(c.sale_amount_usd || 0).toFixed(2)}
              </td>
              <td className="py-3 pr-4 text-green-400 font-bold">
                +${(c.commission_amount_usd || 0).toFixed(2)}
              </td>
              <td className="py-3 pr-4 text-slate-400">{c.commission_rate}%</td>
              <td className="py-3 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[c.status] || STATUS_STYLES.pending}`}>
                  {c.status}
                </span>
              </td>
              <td className="py-3 text-slate-500 text-xs">
                {c.created_date ? format(new Date(c.created_date), "MMM d, yyyy") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}