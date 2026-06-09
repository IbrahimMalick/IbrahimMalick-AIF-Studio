import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Check,
  Zap,
  Download,
  AlertCircle,
  Calendar,
  DollarSign,
  Link2
} from "lucide-react";
import PermissionGate from '@/components/PermissionGate';
import PaymentConnections from '@/components/PaymentConnections';

export default function Billing() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: () => base44.entities.Subscription.filter({
      user_email: user.email
    }).then(subs => subs[0]),
    enabled: !!user?.email,
  });

  const { data: paymentHistory = [] } = useQuery({
    queryKey: ["paymentHistory", user?.email],
    queryFn: () => base44.entities.PaymentHistory.filter(
      { user_email: user.email },
      "-created_date",
      50
    ),
    enabled: !!user?.email,
  });

  const plans = [
    {
      name: "Free",
      tier: "free",
      price: { monthly: 0, yearly: 0 },
      features: [
        "5 video renders/month",
        "10 AI art generations/month",
        "3 document analyses/month",
        "1GB storage",
        "Community support"
      ],
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Creator",
      tier: "creator",
      price: { monthly: 29, yearly: 290 },
      features: [
        "100 video renders/month",
        "500 AI art generations/month",
        "50 document analyses/month",
        "50GB storage",
        "Priority support",
        "Custom templates",
        "Remove watermarks"
      ],
      color: "from-[#FF8C00] to-[#A89C94]",
      popular: true
    },
    {
      name: "Studio",
      tier: "studio",
      price: { monthly: 99, yearly: 990 },
      features: [
        "Unlimited video renders",
        "Unlimited AI generations",
        "Unlimited document analyses",
        "500GB storage",
        "Priority support 24/7",
        "Team collaboration (5 seats)",
        "API access",
        "Custom branding",
        "Advanced analytics"
      ],
      color: "from-[#1E90FF] to-[#FF4433]"
    }
  ];

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    // In production, this would redirect to Stripe/PayPal checkout
    alert(`Upgrading to ${plan.name} plan (${billingCycle}).\n\nIn production, this would redirect to payment processor.`);
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.")) {
      return;
    }

    // In production: API call to cancel subscription
    alert("Subscription canceled. You'll retain access until the end of your billing period.");
  };

  return (
    <PermissionGate
      user={user}
      minimumRole="admin"
      showLockMessage={true}
      lockMessage="Only administrators can access billing information"
    >
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-gray-400">Manage your plan, payment methods, and billing history</p>
        </div>

        {/* Current Plan Overview */}
        {subscription && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">
                      {subscription.plan_tier.charAt(0).toUpperCase() + subscription.plan_tier.slice(1)} Plan
                    </h3>
                    <Badge className={`${
                      subscription.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      subscription.status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                      subscription.status === 'past_due' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 mb-4">
                    ${subscription.amount_usd}/{subscription.billing_cycle}
                  </p>
                  {subscription.current_period_end && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Renews on {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                    </div>
                  )}
                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-2 text-sm text-yellow-400 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Cancels at end of period</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  {subscription.plan_tier !== 'studio' && (
                    <Button className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl">
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  )}
                  {subscription.plan_tier !== 'free' && !subscription.cancel_at_period_end && (
                    <Button
                      onClick={handleCancelSubscription}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="plans">
          <TabsList className="bg-[#111317] rounded-xl flex-wrap">
            <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="gateways">
              <Link2 className="w-3 h-3 mr-1" />
              Payment Gateways
            </TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="methods">Saved Cards</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 bg-[#111317] rounded-full transition-colors"
              >
                <div className={`absolute top-1 ${billingCycle === 'yearly' ? 'right-1' : 'left-1'} w-5 h-5 bg-gradient-to-r from-[#FF4433] to-[#1E90FF] rounded-full transition-all`} />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Yearly
              </span>
              <Badge className="bg-green-500/20 text-green-400 ml-2">Save 17%</Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.tier}
                  className={`bg-[#111317] border-gray-800 rounded-2xl relative overflow-hidden ${
                    plan.popular ? 'ring-2 ring-[#FF8C00]' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">
                        ${plan.price[billingCycle]}
                      </span>
                      <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(plan)}
                      className={`w-full rounded-xl ${
                        plan.tier === subscription?.plan_tier
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                      }`}
                      disabled={plan.tier === subscription?.plan_tier}
                    >
                      {plan.tier === subscription?.plan_tier ? 'Current Plan' : 
                       plan.tier === 'free' ? 'Downgrade' : 'Upgrade Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Accepted Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { label: "Stripe", emoji: "💳", sub: "Cards, ACH, SEPA" },
                    { label: "PayPal", emoji: "🅿️", sub: "Trusted Worldwide" },
                    { label: "Affirm", emoji: "🔵", sub: "Buy Now Pay Later" },
                    { label: "Sezzle", emoji: "🟣", sub: "4 Interest-Free" },
                    { label: "Apple Pay", emoji: "🍎", sub: "One-tap checkout" },
                    { label: "Google Pay", emoji: "🟩", sub: "Android & Chrome" },
                    { label: "Afterpay", emoji: "🟢", sub: "Pay in 4" },
                    { label: "Klarna", emoji: "🩷", sub: "Flexible financing" },
                    { label: "Cash App", emoji: "💚", sub: "Instant payment" },
                    { label: "Venmo", emoji: "💙", sub: "Social payments" },
                    { label: "Crypto", emoji: "₿", sub: "BTC, ETH, USDC" },
                    { label: "Bank Transfer", emoji: "🏦", sub: "ACH / Wire" },
                  ].map((pm) => (
                    <div key={pm.label} className="flex flex-col items-center gap-1 p-3 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-gray-600 transition-all text-center">
                      <span className="text-2xl">{pm.emoji}</span>
                      <p className="text-white text-xs font-semibold">{pm.label}</p>
                      <p className="text-gray-500 text-[10px]">{pm.sub}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-4 text-center">
                  All payments are secure and PCI-DSS compliant. Connect your payment gateways in the <strong className="text-gray-400">Payment Gateways</strong> tab.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Gateways Tab */}
          <TabsContent value="gateways">
            <PaymentConnections userEmail={user?.email} />
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                            payment.payment_provider === 'stripe' ? 'from-[#635BFF] to-[#0A2540]' :
                            payment.payment_provider === 'paypal' ? 'from-[#00457C] to-[#0079C1]' :
                            'from-gray-600 to-gray-700'
                          } flex items-center justify-center`}>
                            {payment.payment_provider === 'stripe' ? (
                              <CreditCard className="w-5 h-5 text-white" />
                            ) : (
                              <DollarSign className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{payment.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-gray-500 text-sm">
                                {new Date(payment.created_date).toLocaleDateString()}
                              </span>
                              <Badge className={`text-xs ${
                                payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400' :
                                payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                payment.status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white font-semibold text-lg">
                            ${payment.amount_usd.toFixed(2)}
                          </span>
                          {payment.receipt_url && (
                            <Button
                              onClick={() => window.open(payment.receipt_url, '_blank')}
                              variant="ghost"
                              size="sm"
                              className="rounded-lg"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No payment history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="methods">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Saved Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">No saved payment methods</p>
                  <Button className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl">
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
}