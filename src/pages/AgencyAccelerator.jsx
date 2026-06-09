
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Rocket,
  DollarSign,
  Users,
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Package,
  Crown
} from "lucide-react";

export default function AgencyAccelerator() {
  const [user, setUser] = useState(null);
  const [clientCount, setClientCount] = useState(5);
  const [avgAdSpend, setAvgAdSpend] = useState(2000);
  const [revenueCalc, setRevenueCalc] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    calculateRevenue();
  }, [clientCount, avgAdSpend]);

  const calculateRevenue = () => {
    const baseFee = 297; // per client
    const adSpendPercent = 0.15; // 15%
    const minFloor = 249;

    const monthlyBase = clientCount * baseFee;
    const monthlyAdManagement = clientCount * Math.max(avgAdSpend * adSpendPercent, minFloor);
    const totalMonthly = monthlyBase + monthlyAdManagement;

    setRevenueCalc({
      monthlyBase,
      monthlyAdManagement,
      totalMonthly,
      yearlyRevenue: totalMonthly * 12,
      revenuePerClient: (totalMonthly / clientCount),
      profitMargin: 0.65 // 65% margin
    });
  };

  const quickStartSteps = [
    {
      step: 1,
      title: "Set Up White-Label",
      desc: "Configure your brand, domain, and client portal",
      page: "WhiteLabel",
      icon: Crown,
      color: "from-[#FFD700] to-[#FF8C00]",
      time: "5 min"
    },
    {
      step: 2,
      title: "Configure Budget Manager",
      desc: "Set up hybrid billing (subscription + % ad spend)",
      page: "BudgetManager",
      icon: DollarSign,
      color: "from-[#06D6A0] to-[#00D4C9]",
      time: "3 min"
    },
    {
      step: 3,
      title: "Create Client Snapshot",
      desc: "Build deployment template with automations",
      page: "SnapshotExportGuide",
      icon: Package,
      color: "from-[#9D4EDD] to-[#FF69B4]",
      time: "10 min"
    },
    {
      step: 4,
      title: "Connect CRM Integration",
      desc: "Bi-directional sync for client management",
      page: "GoHighLevelIntegration",
      icon: Zap,
      color: "from-[#1E90FF] to-[#00D4C9]",
      time: "5 min"
    },
    {
      step: 5,
      title: "Launch First Client",
      desc: "Deploy snapshot and activate billing",
      page: "ClientPortal",
      icon: Rocket,
      color: "from-[#FF8C00] to-[#FFD700]",
      time: "15 min"
    }
  ];

  const agencyModules = [
    {
      title: "Client Management",
      features: ["White-label portal", "Custom domains", "Role-based access", "Usage limits per client"],
      link: "ClientPortal"
    },
    {
      title: "Billing Automation",
      features: ["Hybrid pricing (base + % spend)", "Usage-based billing", "Auto-invoicing", "Stripe integration"],
      link: "BudgetManager"
    },
    {
      title: "Snapshot Deployment",
      features: ["One-click client setup", "Pre-built automations", "CRM integration", "Demo content"],
      link: "SnapshotExportGuide"
    },
    {
      title: "Performance Tracking",
      features: ["Client dashboards", "ROAS monitoring", "Health scores", "ROI reporting"],
      link: "CustomerSuccess"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="bg-[#FFD700]/20 text-[#FFD700] mb-4 text-sm px-4 py-2">
            🚀 Agency Revenue Accelerator
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-4">
            Scale to $10k-$50k/mo in 30 Days
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            White-label platform + Hybrid billing + CRM integration.<br/>
            Everything you need to run a productized marketing agency.
          </p>
        </div>

        {/* Revenue Calculator */}
        <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border-[#06D6A0] border-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#06D6A0]" />
              Agency Revenue Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Number of Clients</label>
                <Input
                  type="number"
                  value={clientCount}
                  onChange={(e) => setClientCount(parseInt(e.target.value) || 0)}
                  className="bg-[#0B0B0C] border-gray-700 text-white text-2xl font-bold h-14"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Avg. Ad Spend per Client/mo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold">$</span>
                  <Input
                    type="number"
                    value={avgAdSpend}
                    onChange={(e) => setAvgAdSpend(parseInt(e.target.value) || 0)}
                    className="bg-[#0B0B0C] border-gray-700 text-white text-2xl font-bold h-14 pl-10"
                    min="0"
                    step="500"
                  />
                </div>
              </div>
            </div>

            {revenueCalc && (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#0B0B0C] rounded-xl text-center border-2 border-[#FFD700]">
                  <Users className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400 mb-1">Monthly Base</p>
                  <p className="text-3xl font-bold text-white">${revenueCalc.monthlyBase.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{clientCount} clients × $297</p>
                </div>

                <div className="p-4 bg-[#0B0B0C] rounded-xl text-center border-2 border-[#00D4C9]">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400 mb-1">Ad Management</p>
                  <p className="text-3xl font-bold text-white">${revenueCalc.monthlyAdManagement.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">15% of ad spend</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#FFD700] to-[#FF8C00] rounded-xl text-center border-2 border-[#FFD700] shadow-xl">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-black" />
                  <p className="text-sm text-black font-semibold mb-1">TOTAL MONTHLY</p>
                  <p className="text-4xl font-bold text-black">${revenueCalc.totalMonthly.toLocaleString()}</p>
                  <p className="text-xs text-black/80 mt-1 font-semibold">
                    ${revenueCalc.revenuePerClient.toLocaleString()}/client
                  </p>
                </div>

                <div className="p-4 bg-[#0B0B0C] rounded-xl text-center border-2 border-[#9D4EDD]">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400 mb-1">Yearly Revenue</p>
                  <p className="text-3xl font-bold text-[#9D4EDD]">${revenueCalc.yearlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    ${Math.round(revenueCalc.yearlyRevenue * revenueCalc.profitMargin).toLocaleString()} profit (65%)
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">
                💡 <strong>Pro Tip:</strong> Most agencies hit $10k/mo with just 3-4 clients at $2,000-$3,000 ad spend each.
                At 10 clients, you're at ${((10 * 297) + (10 * Math.max(2000 * 0.15, 249))).toLocaleString()}/mo recurring!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Path */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-[#FFD700]" />
            5-Step Agency Launch (38 minutes)
          </h2>
          
          <div className="space-y-4">
            {quickStartSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex gap-4 items-center">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  
                  <Card className="flex-1 bg-[#111317] border-gray-800 hover:border-[#FFD700] transition-all">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Icon className={`w-8 h-8 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`} style={{
                          filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))'
                        }} />
                        <div>
                          <h3 className="text-white font-bold text-lg">{step.title}</h3>
                          <p className="text-gray-400 text-sm">{step.desc}</p>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs mt-1">
                            ⏱️ {step.time}
                          </Badge>
                        </div>
                      </div>
                      <Link to={createPageUrl(step.page)}>
                        <Button className={`bg-gradient-to-r ${step.color} text-white font-bold`}>
                          Start
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agency Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Complete Agency Toolkit</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {agencyModules.map((module, idx) => (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {module.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#06D6A0]" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={createPageUrl(module.link)}>
                    <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700]">
                      Configure →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Models */}
        <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 border-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">💰 Agency Pricing Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              
              <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <h4 className="text-white font-bold text-lg mb-3">Starter</h4>
                <p className="text-4xl font-bold text-white mb-2">$297<span className="text-lg text-gray-400">/mo</span></p>
                <p className="text-gray-400 text-sm mb-4">+ 10% of ad spend</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Up to 5 clients</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Basic white-label</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Email support</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-[#FFD700]/5 to-[#FF8C00]/5 rounded-xl border-2 border-[#FFD700] relative">
                <Badge className="bg-[#FFD700] text-black font-bold mb-3">RECOMMENDED</Badge>
                <h4 className="text-white font-bold text-lg mb-3">Pro</h4>
                <p className="text-4xl font-bold text-white mb-2">$497<span className="text-lg text-gray-400">/mo</span></p>
                <p className="text-gray-400 text-sm mb-4">+ 15% of ad spend</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Up to 25 clients</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Full white-label + custom domains</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Priority support + Slack channel</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-4-00 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Client success manager</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <h4 className="text-white font-bold text-lg mb-3">Enterprise</h4>
                <p className="text-4xl font-bold text-white mb-2">$997<span className="text-lg text-gray-400">/mo</span></p>
                <p className="text-gray-400 text-sm mb-4">+ 20% of ad spend</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Unlimited clients</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Multi-brand white-label</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Dedicated strategist</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">White-glove onboarding</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">Custom SOW + NDA</span>
                  </div>
                </div>
              </div>

            </div>

            <Link to={createPageUrl("BudgetManager")}>
              <Button className="w-full mt-6 h-14 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg hover:opacity-90">
                Start Free Trial (14 Days) →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">🏆 Agency Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06D6A0] to-[#00D4C9] flex items-center justify-center">
                    <span className="text-white font-bold">SD</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Sarah D.</p>
                    <p className="text-gray-500 text-xs">Marketing Agency</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  "Hit $12k/mo in 45 days with 4 clients. The hybrid model makes scaling effortless."
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">$12k MRR</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">4 clients</Badge>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                    <span className="text-black font-bold">MK</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Mike K.</p>
                    <p className="text-gray-500 text-xs">Real Estate Coach</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  "Went from $3k/mo to $28k/mo using the deployment snapshots. Game changer."
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">$28k MRR</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">12 clients</Badge>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center">
                    <span className="text-white font-bold">JL</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Jessica L.</p>
                    <p className="text-gray-500 text-xs">SaaS Agency</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  "Closed $47k in new contracts using the offer builder + funnel templates."
                </p>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">$47k ARR</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">8 clients</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] rounded-2xl border-0">
          <CardContent className="p-8 text-center">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-black" />
            <h3 className="text-3xl font-bold text-black mb-3">
              Ready to Build Your Agency?
            </h3>
            <p className="text-black/80 text-lg mb-6 max-w-2xl mx-auto">
              Follow the 5-step path above to launch your first client in under 40 minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl("WhiteLabel")}>
                <Button className="bg-black text-white font-bold text-lg px-8 py-6 hover:bg-gray-900">
                  Start Step 1: White-Label Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("AgencySalesPage")}>
                <Button variant="outline" className="border-black text-black font-bold text-lg px-8 py-6 bg-white/10 hover:bg-white/20">
                  View Sales Page Template
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
