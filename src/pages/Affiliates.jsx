import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Users,
  MousePointerClick,
  Copy,
  Check,
  Download,
  BarChart3
} from "lucide-react";

export default function Affiliates() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: affiliate } = useQuery({
    queryKey: ["myAffiliate"],
    queryFn: async () => {
      const existing = await base44.entities.Affiliate.filter({
        user_email: user.email
      });
      return existing[0] || null;
    },
    enabled: !!user,
  });

  const { data: clicks = [] } = useQuery({
    queryKey: ["affiliateClicks"],
    queryFn: () => base44.entities.AffiliateClick.filter({
      affiliate_code: affiliate?.affiliate_code
    }, "-created_date", 100),
    enabled: !!affiliate,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["affiliateCommissions"],
    queryFn: () => base44.entities.AffiliateCommission.filter({
      affiliate_email: user.email
    }, "-created_date", 100),
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const code = `AFF-${Math.random().toString(36).substr(2, 8)}`.toUpperCase();
      return await base44.entities.Affiliate.create({
        user_email: user.email,
        affiliate_code: code,
        status: 'pending',
        payment_method: paymentMethod
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myAffiliate"]);
    },
  });

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-center">Become an Affiliate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-[#FF4433] to-[#1E90FF] flex items-center justify-center mb-6">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Earn 30% Recurring Commission</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                  Join our affiliate program and earn generous commissions for every customer you refer. 
                  Get paid monthly via PayPal, Stripe, or bank transfer.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 rounded-xl bg-[#0B0B0C] border border-gray-800">
                  <TrendingUp className="w-8 h-8 text-[#FF8C00] mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">30% Commission</h3>
                  <p className="text-gray-400 text-sm">On all plans, recurring monthly</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-[#0B0B0C] border border-gray-800">
                  <Users className="w-8 h-8 text-[#1E90FF] mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">90-Day Cookie</h3>
                  <p className="text-gray-400 text-sm">Get credit for 3 months</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-[#0B0B0C] border border-gray-800">
                  <BarChart3 className="w-8 h-8 text-[#A89C94] mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Real-Time Tracking</h3>
                  <p className="text-gray-400 text-sm">Monitor clicks & conversions</p>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isLoading}
                  className="w-full bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl text-lg py-6"
                >
                  {applyMutation.isLoading ? 'Applying...' : 'Apply to Affiliate Program'}
                </Button>

                <p className="text-gray-500 text-xs text-center">
                  Applications are reviewed within 24 hours. You'll receive an email when approved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const affiliateUrl = `${window.location.origin}?aff=${affiliate.affiliate_code}`;
  const conversionRate = clicks.length > 0 
    ? ((clicks.filter(c => c.converted).length / clicks.length) * 100).toFixed(1)
    : 0;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    {
      label: "Pending Balance",
      value: `$${affiliate.pending_balance_usd?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: "from-[#FF4433] to-[#FF8C00]"
    },
    {
      label: "Total Earned",
      value: `$${affiliate.total_earned_usd?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: "from-[#FF8C00] to-[#A89C94]"
    },
    {
      label: "Total Clicks",
      value: clicks.length,
      icon: MousePointerClick,
      color: "from-[#A89C94] to-[#1E90FF]"
    },
    {
      label: "Conversions",
      value: affiliate.total_conversions || 0,
      icon: Users,
      color: "from-[#1E90FF] to-[#FF4433]"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Affiliate Dashboard</h1>
            <p className="text-gray-400">Track your affiliate performance and earnings</p>
          </div>
          <Badge className={`${
            affiliate.status === 'active' ? 'bg-green-500/20 text-green-400' :
            affiliate.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          } text-lg px-4 py-2`}>
            {affiliate.status.toUpperCase()}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Affiliate Link */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Your Affiliate Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={affiliateUrl}
                readOnly
                className="flex-1 bg-[#0B0B0C] border-gray-700 text-white rounded-xl font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-[#FF4433] to-[#FF8C00] text-white rounded-xl"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Commission Rate: <span className="font-bold text-[#FF8C00]">{affiliate.commission_rate}%</span></p>
                <p className="text-gray-500 text-xs mt-1">Conversion Rate: {conversionRate}%</p>
              </div>
              <Button variant="outline" className="border-gray-700 hover:bg-[#1a1a1f] rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Marketing Assets
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="commissions">
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="clicks">Click History</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Commission History</CardTitle>
              </CardHeader>
              <CardContent>
                {commissions.length > 0 ? (
                  <div className="space-y-3">
                    {commissions.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-medium">{comm.customer_email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-500 text-xs">
                              {new Date(comm.created_date).toLocaleDateString()}
                            </span>
                            <Badge className={`text-xs ${
                              comm.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                              comm.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {comm.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold text-lg">
                            ${comm.commission_amount_usd.toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {comm.commission_rate}% of ${comm.sale_amount_usd.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No commissions yet. Start promoting!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clicks">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Recent Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                {clicks.length > 0 ? (
                  <div className="space-y-2">
                    {clicks.slice(0, 50).map((click) => (
                      <div
                        key={click.id}
                        className="p-3 rounded-lg bg-[#0B0B0C] border border-gray-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white text-sm">{click.landing_page || '/'}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(click.created_date).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs">{click.ip_address}</span>
                          {click.converted && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              Converted
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MousePointerClick className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No clicks yet. Share your link!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Payout History</CardTitle>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Pending Balance</p>
                    <p className="text-2xl font-bold text-white">
                      ${affiliate.pending_balance_usd?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-xl bg-[#0B0B0C] border border-gray-800 text-center">
                  <p className="text-gray-400 mb-4">Minimum payout: $50.00</p>
                  <p className="text-gray-500 text-sm">
                    Payouts are processed monthly on the 1st. 
                    Payment method: <span className="text-white font-semibold capitalize">{affiliate.payment_method}</span>
                  </p>
                  {affiliate.pending_balance_usd >= 50 && (
                    <Button className="mt-4 bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl">
                      Request Payout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}