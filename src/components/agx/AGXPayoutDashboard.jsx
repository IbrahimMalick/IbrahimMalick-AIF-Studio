import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Users, CheckCircle2, Clock, AlertCircle,
  RefreshCw, Zap, TrendingUp, CreditCard, Loader2
} from "lucide-react";

const statusColor = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-blue-500/20 text-blue-400",
  paid: "bg-green-500/20 text-green-400",
  refunded: "bg-red-500/20 text-red-400",
  processing: "bg-purple-500/20 text-purple-400",
  failed: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-400",
  active: "bg-green-500/20 text-green-400",
  suspended: "bg-red-500/20 text-red-400"
};

function StatCard({ icon: Icon, label, value, sub, color = "text-orange-400" }) {
  return (
    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-gray-400 text-xs">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AGXPayoutDashboard() {
  const queryClient = useQueryClient();
  const [triggeringPayment, setTriggeringPayment] = useState(null);

  const { data: affiliates = [], isLoading: loadingAffiliates } = useQuery({
    queryKey: ["affiliates-all"],
    queryFn: () => base44.entities.Affiliate.list("-created_date", 100)
  });

  const { data: commissions = [], isLoading: loadingCommissions } = useQuery({
    queryKey: ["commissions-all"],
    queryFn: () => base44.entities.AffiliateCommission.list("-created_date", 100)
  });

  const { data: payouts = [], isLoading: loadingPayouts } = useQuery({
    queryKey: ["payouts-all"],
    queryFn: () => base44.entities.PartnerPayout.list("-created_date", 50)
  });

  const { data: recentPayments = [] } = useQuery({
    queryKey: ["payments-succeeded"],
    queryFn: () => base44.entities.PaymentHistory.filter({ status: "succeeded" }, "-created_date", 20)
  });

  const manualTriggerMutation = useMutation({
    mutationFn: async (paymentId) => {
      setTriggeringPayment(paymentId);
      const res = await base44.functions.invoke("processAffiliatePayouts", {
        payment_id: paymentId,
        manual: true
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["affiliates-all"]);
      queryClient.invalidateQueries(["commissions-all"]);
      queryClient.invalidateQueries(["payouts-all"]);
      setTriggeringPayment(null);
    },
    onError: () => setTriggeringPayment(null)
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.AffiliateCommission.update(id, {
      status: "approved",
      approved_at: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries(["commissions-all"])
  });

  // Aggregated stats
  const totalPending = commissions
    .filter(c => c.status === "pending" || c.status === "approved")
    .reduce((s, c) => s + (c.commission_amount_usd || 0), 0);
  const totalPaid = commissions
    .filter(c => c.status === "paid")
    .reduce((s, c) => s + (c.commission_amount_usd || 0), 0);
  const activeAffiliates = affiliates.filter(a => a.status === "active").length;
  const processingPayouts = payouts.filter(p => p.status === "processing").length;

  const isLoading = loadingAffiliates || loadingCommissions || loadingPayouts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/30 rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Automated Payout Engine
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Commission splits fire automatically when subscriber payments clear. Threshold: <span className="text-orange-400 font-semibold">$50</span> pending balance triggers payout.
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400">● Live</Badge>
        </div>

        {/* Flow diagram */}
        <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
          {[
            { icon: CreditCard, label: "Payment Clears", color: "text-blue-400" },
            { label: "→" },
            { icon: Zap, label: "Auto-trigger", color: "text-orange-400" },
            { label: "→" },
            { icon: DollarSign, label: "Split Commission", color: "text-green-400" },
            { label: "→" },
            { icon: CheckCircle2, label: "Payout Queued", color: "text-purple-400" },
          ].map((step, i) => (
            step.label === "→" ? (
              <span key={i} className="text-gray-600 font-bold">{step.label}</span>
            ) : (
              <div key={i} className={`flex items-center gap-1 px-2 py-1 bg-[#0B0B0C] rounded-lg ${step.color}`}>
                <step.icon className="w-3 h-3" />
                <span>{step.label}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Pending Payouts" value={`$${totalPending.toFixed(2)}`} sub="awaiting payout" color="text-yellow-400" />
        <StatCard icon={CheckCircle2} label="Total Paid Out" value={`$${totalPaid.toFixed(2)}`} sub="all time" color="text-green-400" />
        <StatCard icon={Users} label="Active Affiliates" value={activeAffiliates} sub={`of ${affiliates.length} total`} color="text-blue-400" />
        <StatCard icon={RefreshCw} label="Processing" value={processingPayouts} sub="payouts in flight" color="text-purple-400" />
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList className="bg-[#111317] border border-gray-800">
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
        </TabsList>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates">
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-orange-400 text-sm">Affiliate Accounts & Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {affiliates.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No affiliates yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs">
                        <th className="text-left py-2 pr-4">Affiliate</th>
                        <th className="text-left py-2 pr-4">Code</th>
                        <th className="text-left py-2 pr-4">Rate</th>
                        <th className="text-left py-2 pr-4">Pending</th>
                        <th className="text-left py-2 pr-4">Total Earned</th>
                        <th className="text-left py-2 pr-4">Total Paid</th>
                        <th className="text-left py-2 pr-4">Method</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliates.map((a) => (
                        <tr key={a.id} className="border-b border-gray-800/50 hover:bg-[#0B0B0C]/50">
                          <td className="py-3 pr-4 text-white">{a.user_email}</td>
                          <td className="py-3 pr-4 font-mono text-cyan-400 text-xs">{a.affiliate_code}</td>
                          <td className="py-3 pr-4 text-orange-400 font-semibold">{a.commission_rate || 30}%</td>
                          <td className="py-3 pr-4 text-yellow-400 font-semibold">${(a.pending_balance_usd || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4 text-green-400">${(a.total_earned_usd || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4 text-gray-300">${(a.total_paid_usd || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4 text-gray-400 capitalize">{a.payment_method || "—"}</td>
                          <td className="py-3">
                            <Badge className={`text-xs ${statusColor[a.status] || "bg-gray-500/20 text-gray-400"}`}>
                              {a.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions">
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-orange-400 text-sm">Commission Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No commissions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs">
                        <th className="text-left py-2 pr-4">Affiliate</th>
                        <th className="text-left py-2 pr-4">Customer</th>
                        <th className="text-left py-2 pr-4">Sale</th>
                        <th className="text-left py-2 pr-4">Rate</th>
                        <th className="text-left py-2 pr-4">Commission</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c) => (
                        <tr key={c.id} className="border-b border-gray-800/50 hover:bg-[#0B0B0C]/50">
                          <td className="py-3 pr-4 text-white text-xs">{c.affiliate_email}</td>
                          <td className="py-3 pr-4 text-gray-400 text-xs">{c.customer_email}</td>
                          <td className="py-3 pr-4 text-gray-300">${(c.sale_amount_usd || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4 text-orange-400">{c.commission_rate || 0}%</td>
                          <td className="py-3 pr-4 text-green-400 font-semibold">${(c.commission_amount_usd || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${statusColor[c.status] || "bg-gray-500/20 text-gray-400"}`}>
                                {c.status}
                              </Badge>
                              {c.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500/30 text-blue-400 text-xs h-6 px-2"
                                  onClick={() => approveMutation.mutate({ id: c.id })}
                                >
                                  Approve
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-gray-500 text-xs">
                            {c.created_date ? new Date(c.created_date).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-orange-400 text-sm">Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No payouts yet — they trigger automatically when affiliate balance ≥ $50.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs">
                        <th className="text-left py-2 pr-4">Partner ID</th>
                        <th className="text-left py-2 pr-4">Period</th>
                        <th className="text-left py-2 pr-4">Amount</th>
                        <th className="text-left py-2 pr-4">Commissions</th>
                        <th className="text-left py-2 pr-4">Method</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2">Paid At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b border-gray-800/50 hover:bg-[#0B0B0C]/50">
                          <td className="py-3 pr-4 text-cyan-400 font-mono text-xs">{p.partner_id?.slice(0, 12)}...</td>
                          <td className="py-3 pr-4 text-gray-400 text-xs">{p.payout_period?.month || "—"}</td>
                          <td className="py-3 pr-4 text-green-400 font-bold">${(p.total_amount_usd || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4 text-gray-300">{p.commission_count || 0}</td>
                          <td className="py-3 pr-4 text-gray-400 capitalize">{p.payment_method || "—"}</td>
                          <td className="py-3 pr-4">
                            <Badge className={`text-xs ${statusColor[p.status] || "bg-gray-500/20 text-gray-400"}`}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-gray-500 text-xs">
                            {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Payments Tab */}
        <TabsContent value="payments">
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-orange-400 text-sm flex items-center justify-between">
                <span>Recent Cleared Payments</span>
                <span className="text-gray-500 font-normal text-xs">Click to manually trigger commission split</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No succeeded payments found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs">
                        <th className="text-left py-2 pr-4">User</th>
                        <th className="text-left py-2 pr-4">Provider</th>
                        <th className="text-left py-2 pr-4">Amount</th>
                        <th className="text-left py-2 pr-4">Affiliate Code</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((p) => (
                        <tr key={p.id} className="border-b border-gray-800/50 hover:bg-[#0B0B0C]/50">
                          <td className="py-3 pr-4 text-white text-xs">{p.user_email}</td>
                          <td className="py-3 pr-4 text-gray-400 capitalize">{p.payment_provider}</td>
                          <td className="py-3 pr-4 text-green-400 font-semibold">${(p.amount_usd || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4 font-mono text-cyan-400 text-xs">
                            {p.metadata?.affiliate_code || <span className="text-gray-600">none</span>}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge className="bg-green-500/20 text-green-400 text-xs">succeeded</Badge>
                          </td>
                          <td className="py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs h-7 px-3"
                              disabled={triggeringPayment === p.id || manualTriggerMutation.isPending}
                              onClick={() => manualTriggerMutation.mutate(p.id)}
                            >
                              {triggeringPayment === p.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <><Zap className="w-3 h-3 mr-1" />Process</>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How it works */}
      <Card className="bg-[#0B0B0C] border-gray-800">
        <CardContent className="p-4">
          <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">How Automated Payouts Work</p>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { step: "1", title: "Payment Clears", desc: "When a subscriber payment succeeds via any connected gateway, the entity automation fires processAffiliatePayouts." },
              { step: "2", title: "Commission Split", desc: "The affiliate code on the payment metadata identifies the referrer. Commission % from their profile is applied to the sale amount." },
              { step: "3", title: "Auto-Payout", desc: "When pending balance ≥ $50, a PartnerPayout is automatically created and marked processing for disbursement via their chosen method." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center flex-shrink-0 font-bold">{s.step}</div>
                <div>
                  <p className="text-white text-xs font-semibold">{s.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}