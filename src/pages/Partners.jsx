
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Link as LinkIcon,
  Users,
  TrendingUp,
  Copy,
  CheckCircle2,
  FileText,
  Target,
  Rocket,
  Gift,
  BarChart3,
  ExternalLink,
  GraduationCap // Added GraduationCap icon
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function Partners() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Load partner profile
  const { data: partner } = useQuery({
    queryKey: ["partner", user?.email],
    queryFn: async () => {
      const partners = await base44.entities.PartnerAffiliate.filter({
        user_email: user.email
      });
      return partners[0] || null;
    },
    enabled: !!user
  });

  // Load partner links
  const { data: links = [] } = useQuery({
    queryKey: ["partnerLinks", partner?.id],
    queryFn: () => base44.entities.AffiliateLink.filter({
      partner_id: partner.id
    }),
    enabled: !!partner
  });

  // Load coupons
  const { data: coupons = [] } = useQuery({
    queryKey: ["partnerCoupons", partner?.id],
    queryFn: () => base44.entities.PartnerCoupon.filter({
      partner_id: partner.id
    }),
    enabled: !!partner
  });

  // Load commissions
  const { data: commissions = [] } = useQuery({
    queryKey: ["partnerCommissions", partner?.id],
    queryFn: () => base44.entities.PartnerCommission.filter({
      partner_id: partner.id
    }, "-created_date", 50),
    enabled: !!partner
  });

  // Load payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ["partnerPayouts", partner?.id],
    queryFn: () => base44.entities.PartnerPayout.filter({
      partner_id: partner.id
    }, "-created_date", 20),
    enabled: !!partner
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  // Calculate this month's stats
  const thisMonth = commissions.filter(c => {
    const date = new Date(c.created_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const monthEarnings = thisMonth
    .filter(c => c.status !== "clawback" && c.status !== "refunded")
    .reduce((sum, c) => sum + c.commission_amount_usd, 0);

  const monthConversions = thisMonth.filter(c => c.event_type === "subscription.created").length;

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
            <CardContent className="p-12 text-center">
              <Rocket className="w-16 h-16 mx-auto mb-4 text-[#FFD700]" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Join the AI Freedom Studios Partner Program
              </h2>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                Earn 30% recurring commissions or 25-35% revenue share by referring creators, coaches, and agencies to our platform.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
                  <p className="text-2xl font-bold text-white">30%</p>
                  <p className="text-gray-400 text-sm">Recurring Commission</p>
                </div>
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 text-[#00D4C9]" />
                  <p className="text-2xl font-bold text-white">847+</p>
                  <p className="text-gray-400 text-sm">Active Partners</p>
                </div>
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#9D4EDD]" />
                  <p className="text-2xl font-bold text-white">$412</p>
                  <p className="text-gray-400 text-sm">Avg Customer MRR</p>
                </div>
              </div>

              <Button
                onClick={() => window.location.href = "mailto:partners@aifreedomduane.com?subject=Partner Program Application"}
                className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg px-12 py-6 hover:opacity-90"
              >
                Apply to Become a Partner
              </Button>

              <p className="text-gray-500 text-sm mt-4">
                Approval typically within 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const primaryLink = links[0];

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Partner Hub
            </h1>
            <p className="text-gray-400">
              Welcome back, <span className="text-[#FFD700] font-semibold">{partner.company_name || user.full_name}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("PartnerTraining")}>
              <Button variant="outline" className="border-gray-700 text-white">
                <GraduationCap className="w-4 h-4 mr-2" />
                Training
              </Button>
            </Link>
            <Link to={createPageUrl("PartnerResources")}>
              <Button variant="outline" className="border-gray-700 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Resources
              </Button>
            </Link>
            {partner.partner_type !== "affiliate" && (
              <Link to={createPageUrl("DealRegistration")}>
                <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold">
                  <Target className="w-4 h-4 mr-2" />
                  Register Deal
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Status Banner */}
        <Card className={`${
          partner.status === 'active' 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-yellow-500/10 border-yellow-500/30'
        } rounded-2xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={`${
                  partner.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {partner.status.toUpperCase()}
                </Badge>
                <span className="text-white font-semibold capitalize">
                  {partner.partner_type} Partner
                </span>
                <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                  {partner.tier.toUpperCase()} Tier
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Commission Rate</p>
                <p className="text-white font-bold">
                  {partner.partner_type === 'reseller' 
                    ? `${partner.revenue_share_percent}% Revenue Share`
                    : `${partner.commission_rate_recurring}% Recurring + ${partner.commission_rate_addon}% Add-ons`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 mb-3 text-[#FFD700]" />
              <p className="text-gray-400 text-sm mb-1">This Month</p>
              <p className="text-3xl font-bold text-white">
                ${monthEarnings.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">{monthConversions} conversions</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mb-3 text-[#00D4C9]" />
              <p className="text-gray-400 text-sm mb-1">Active Customers</p>
              <p className="text-3xl font-bold text-white">
                {partner.active_customers}
              </p>
              <p className="text-gray-500 text-xs mt-1">{partner.total_conversions} total</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-3 text-[#9D4EDD]" />
              <p className="text-gray-400 text-sm mb-1">MRR Influenced</p>
              <p className="text-3xl font-bold text-white">
                ${partner.mrr_influenced.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">Monthly recurring</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#06D6A0]/20 to-[#00D4C9]/20 border-[#06D6A0] border-2 rounded-2xl">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 mb-3 text-[#06D6A0]" />
              <p className="text-gray-400 text-sm mb-1">Pending Balance</p>
              <p className="text-3xl font-bold text-white">
                ${partner.pending_balance_usd.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Next payout: {partner.next_payout_date ? new Date(partner.next_payout_date).toLocaleDateString() : 'TBD'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="bg-[#111]">
            <TabsTrigger value="links">
              <LinkIcon className="w-4 h-4 mr-2" />
              Links & Coupons
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Commissions
            </TabsTrigger>
            <TabsTrigger value="payouts">
              <BarChart3 className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
            {partner.partner_type !== "affiliate" && (
              <TabsTrigger value="deals">
                <Target className="w-4 h-4 mr-2" />
                Deal Registration
              </TabsTrigger>
            )}
          </TabsList>

          {/* Links & Coupons Tab */}
          <TabsContent value="links">
            <div className="space-y-6">
              
              {/* Primary Referral Link */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Your Referral Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {primaryLink ? (
                    <>
                      <div className="p-4 bg-[#0B0B0C] rounded-xl flex items-center justify-between">
                        <code className="text-[#00D4C9] text-sm flex-1">
                          {primaryLink.full_url}
                        </code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(primaryLink.full_url)}
                          className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">{primaryLink.click_count}</p>
                          <p className="text-gray-500 text-xs">Clicks</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">{primaryLink.signups}</p>
                          <p className="text-gray-500 text-xs">Signups</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">{primaryLink.conversions}</p>
                          <p className="text-gray-500 text-xs">Paid</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-400">
                            {primaryLink.conversion_rate ? primaryLink.conversion_rate.toFixed(1) : 0}%
                          </p>
                          <p className="text-gray-500 text-xs">CVR</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <LinkIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 mb-4">No referral links yet</p>
                      <Button className="bg-[#FFD700] text-black font-bold">
                        Generate Link
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coupon Codes */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Coupon Codes</CardTitle>
                    <Button size="sm" className="bg-[#00D4C9]/20 text-[#00D4C9]">
                      <Gift className="w-4 h-4 mr-2" />
                      Request Coupon
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {coupons.length > 0 ? (
                    <div className="space-y-3">
                      {coupons.map((coupon) => (
                        <div key={coupon.id} className="p-4 bg-[#0B0B0C] rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <code className="px-3 py-2 bg-[#FFD700]/20 border border-[#FFD700]/30 rounded-lg text-[#FFD700] font-bold text-lg">
                              {coupon.coupon_code}
                            </code>
                            <div>
                              <p className="text-white font-semibold">
                                {coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : '$'} Off
                              </p>
                              <p className="text-gray-500 text-xs">
                                {coupon.redemptions_count} / {coupon.max_redemptions === -1 ? '∞' : coupon.max_redemptions} used
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={coupon.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                              {coupon.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(coupon.coupon_code)}
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 text-sm">No coupon codes yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                {commissions.length > 0 ? (
                  <div className="space-y-2">
                    {commissions.map((commission) => (
                      <div key={commission.id} className="p-4 bg-[#0B0B0C] rounded-xl flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-semibold text-sm">{commission.customer_email}</p>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs capitalize">
                              {commission.commission_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-500 text-xs">
                            {new Date(commission.created_date).toLocaleDateString()} • {commission.event_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#FFD700]">
                            ${commission.commission_amount_usd.toFixed(2)}
                          </p>
                          <Badge className={`text-xs ${
                            commission.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            commission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            commission.status === 'clawback' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {commission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 text-sm">No commissions yet</p>
                    <p className="text-gray-500 text-xs mt-1">Start referring customers to earn commissions!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length > 0 ? (
                  <div className="space-y-3">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="p-4 bg-[#0B0B0C] rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">
                              {payout.payout_period.month}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {payout.commission_count} commissions
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#FFD700]">
                              ${payout.total_amount_usd.toLocaleString()}
                            </p>
                            <Badge className={`text-xs ${
                              payout.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                              payout.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                              payout.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {payout.status}
                            </Badge>
                          </div>
                        </div>

                        {payout.breakdown && (
                          <div className="grid grid-cols-4 gap-2">
                            {Object.entries(payout.breakdown).map(([type, amount]) => (
                              amount > 0 && (
                                <div key={type} className="p-2 bg-[#111317] rounded text-center">
                                  <p className="text-white font-bold text-sm">
                                    ${amount.toFixed(0)}
                                  </p>
                                  <p className="text-gray-500 text-xs capitalize">
                                    {type.replace('_', ' ')}
                                  </p>
                                </div>
                              )
                            ))}
                          </div>
                        )}

                        {payout.invoice_url && (
                          <a href={payout.invoice_url} target="_blank" rel="noopener">
                            <Button size="sm" variant="outline" className="w-full mt-3 border-gray-700 text-white">
                              <FileText className="w-4 h-4 mr-2" />
                              View Invoice
                            </Button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 text-sm">No payouts yet</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Minimum payout: $50 • Frequency: Monthly NET-15
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deal Registration Tab (Resellers Only) */}
          {partner.partner_type !== "affiliate" && (
            <TabsContent value="deals">
              <Link to={createPageUrl("DealRegistration")}>
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Register Your Deals
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Protect your enterprise opportunities with deal registration (60-90 day exclusivity)
                    </p>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Go to Deal Registration
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </TabsContent>
          )}

        </Tabs>

        {/* Program Details */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Program Details & Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-semibold mb-2 text-sm">Attribution Model</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>1️⃣ Coupon code (strongest)</li>
                  <li>2️⃣ Last click (90-day window)</li>
                  <li>3️⃣ First click (fallback)</li>
                </ul>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-semibold mb-2 text-sm">Payout Terms</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>💰 Monthly, NET-15</li>
                  <li>📊 $50 minimum threshold</li>
                  <li>🔄 45-day refund clawback</li>
                </ul>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-semibold mb-2 text-sm">Tier Benefits</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>🥉 Bronze: Standard rates</li>
                  <li>🥈 Silver: +2% bonus (&gt;$3k MRR)</li>
                  <li>🥇 Gold: +5% bonus (&gt;$10k MRR)</li>
                  <li>👑 Premier: +10% (&gt;$25k MRR) + MDF</li>
                </ul>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-semibold mb-2 text-sm">Compliance</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>🚫 No brand bidding</li>
                  <li>✅ FTC disclosure required</li>
                  <li>📧 No spam/fake urgency</li>
                  <li>🔐 W-9/tax docs required</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to={createPageUrl("PartnerResources")} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold">
                  <FileText className="w-4 h-4 mr-2" />
                  Marketing Resources
                </Button>
              </Link>
              <a href="/docs/partner-agreement.pdf" target="_blank" className="flex-1">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Partner Agreement
                </Button>
              </a>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
