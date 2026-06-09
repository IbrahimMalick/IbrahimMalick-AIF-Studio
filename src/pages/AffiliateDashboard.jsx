import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, Link2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import AffiliateStatsCards from "@/components/affiliate/AffiliateStatsCards";
import AffiliateCommissionsTable from "@/components/affiliate/AffiliateCommissionsTable";
import AffiliateTrendsChart from "@/components/affiliate/AffiliateTrendsChart";
import PayoutStatusTracker from "@/components/affiliate/PayoutStatusTracker";
import MonthlySummary from "@/components/affiliate/MonthlySummary";
import AffiliateExportButton from "@/components/affiliate/AffiliateExportButton";

export default function AffiliateDashboard() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: affiliates = [] } = useQuery({
    queryKey: ["affiliate", user?.email],
    queryFn: () => base44.entities.Affiliate.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const affiliate = affiliates[0] || null;

  const { data: commissions = [] } = useQuery({
    queryKey: ["commissions", user?.email],
    queryFn: () =>
      base44.entities.AffiliateCommission.filter({ affiliate_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: links = [] } = useQuery({
    queryKey: ["affiliateLinks", affiliate?.id],
    queryFn: () => base44.entities.AffiliateLink.filter({ partner_id: affiliate.id }),
    enabled: !!affiliate?.id,
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ["affiliateClicks", affiliate?.affiliate_code],
    queryFn: () =>
      base44.entities.AffiliateClick.filter({ affiliate_code: affiliate.affiliate_code }, "-created_date", 50),
    enabled: !!affiliate?.affiliate_code,
  });

  const pendingCommissions = commissions.filter((c) => c.status === "pending");
  const approvedCommissions = commissions.filter((c) => c.status === "approved");
  const paidCommissions = commissions.filter((c) => c.status === "paid");

  const referralUrl = affiliate
    ? `${window.location.origin}/?ref=${affiliate.affiliate_code}`
    : null;

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Affiliate Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Track your referrals, commissions, and payouts
            </p>
          </div>
          <div className="flex items-center gap-3">
            {affiliate && <AffiliateExportButton commissions={commissions} clicks={clicks} links={links} />}
            {affiliate && (
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                affiliate.status === "active"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : affiliate.status === "pending"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}>
                {affiliate.status?.toUpperCase()}
              </span>
              <span className="text-slate-400 text-sm">Code: <span className="text-white font-mono font-bold">{affiliate.affiliate_code}</span></span>
            </div>
            )}
          </div>
        </div>

        {/* No affiliate account yet */}
        {!affiliate && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-semibold">No Affiliate Account Found</p>
              <p className="text-yellow-400/70 text-sm mt-1">
                Your affiliate account is not set up yet. Contact support or apply through the Partner Hub to get started.
              </p>
            </div>
          </div>
        )}

        {affiliate && (
          <>
            {/* Stats */}
            <AffiliateStatsCards affiliate={affiliate} />

            {/* Monthly Summary */}
            <MonthlySummary commissions={commissions} links={links} />

            {/* Referral Link */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-semibold text-sm">Your Referral Link</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 font-mono text-sm text-cyan-300 truncate">
                  {referralUrl}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white flex-shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Commission rate: <span className="text-cyan-400 font-bold">{affiliate.commission_rate}%</span> · 
                Min payout: <span className="text-cyan-400 font-bold">$50.00</span> · 
                Payment via: <span className="text-cyan-400 font-bold capitalize">{affiliate.payment_method || "not set"}</span>
              </p>
            </div>

            {/* Payout Status Tracker */}
            <PayoutStatusTracker affiliate={affiliate} commissions={commissions} />

            {/* Trends Chart */}
            <AffiliateTrendsChart commissions={commissions} clicks={clicks} />

            {/* Tabs */}
            <Tabs defaultValue="commissions">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="commissions" className="data-[state=active]:bg-slate-700">
                  All Commissions ({commissions.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
                  Pending ({pendingCommissions.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-slate-700">
                  Approved ({approvedCommissions.length})
                </TabsTrigger>
                <TabsTrigger value="paid" className="data-[state=active]:bg-slate-700">
                  Paid ({paidCommissions.length})
                </TabsTrigger>
                <TabsTrigger value="links" className="data-[state=active]:bg-slate-700">
                  My Links ({links.length})
                </TabsTrigger>
                <TabsTrigger value="clicks" className="data-[state=active]:bg-slate-700">
                  Click History
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-5">
                <TabsContent value="commissions">
                  <AffiliateCommissionsTable commissions={commissions} />
                </TabsContent>
                <TabsContent value="pending">
                  <AffiliateCommissionsTable commissions={pendingCommissions} />
                </TabsContent>
                <TabsContent value="approved">
                  <AffiliateCommissionsTable commissions={approvedCommissions} />
                </TabsContent>
                <TabsContent value="paid">
                  <AffiliateCommissionsTable commissions={paidCommissions} />
                </TabsContent>

                {/* Links Tab */}
                <TabsContent value="links">
                  {links.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">No tracking links found.</p>
                  ) : (
                    <div className="space-y-3">
                      {links.map((link) => (
                        <div key={link.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-slate-800/60 border border-slate-700">
                          <div>
                            <p className="text-white font-medium text-sm">{link.campaign_name || "Default Campaign"}</p>
                            <p className="text-slate-400 text-xs mt-0.5 truncate max-w-sm">{link.full_url}</p>
                          </div>
                          <div className="flex items-center gap-6 text-center text-xs shrink-0">
                            <div>
                              <p className="text-slate-400">Clicks</p>
                              <p className="text-white font-bold">{link.click_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Signups</p>
                              <p className="text-white font-bold">{link.signups || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Conversions</p>
                              <p className="text-green-400 font-bold">{link.conversions || 0}</p>
                            </div>
                            <a
                              href={link.full_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-300" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Clicks Tab */}
                <TabsContent value="clicks">
                  {clicks.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">No click history yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700 text-slate-400 text-left">
                            <th className="pb-3 pr-4 font-medium">Date</th>
                            <th className="pb-3 pr-4 font-medium">Landing Page</th>
                            <th className="pb-3 pr-4 font-medium">Referrer</th>
                            <th className="pb-3 font-medium">Converted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clicks.map((click) => (
                            <tr key={click.id} className="border-b border-slate-800 hover:bg-white/5 transition-colors">
                              <td className="py-3 pr-4 text-slate-400 text-xs">
                                {click.created_date ? format(new Date(click.created_date), "MMM d, yyyy HH:mm") : "—"}
                              </td>
                              <td className="py-3 pr-4 text-slate-300 text-xs truncate max-w-xs">{click.landing_page || "/"}</td>
                              <td className="py-3 pr-4 text-slate-500 text-xs truncate max-w-xs">{click.referrer_url || "Direct"}</td>
                              <td className="py-3">
                                {click.converted ? (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">Yes</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-400 border border-slate-600">No</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>


          </>
        )}
      </div>
    </div>
  );
}