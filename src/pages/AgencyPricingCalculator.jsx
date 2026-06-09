import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Download,
  Send
} from "lucide-react";
import { motion } from "framer-motion";

export default function AgencyPricingCalculator() {
  const [clientCount, setClientCount] = useState(10);
  const [avgMonthlyPrice, setAvgMonthlyPrice] = useState(297);
  const [setupFee, setSetupFee] = useState(497);
  const [setupFeePercent, setSetupFeePercent] = useState(80); // % who pay setup
  const [churnRate, setChurnRate] = useState(10); // monthly churn %
  const [costPerClient, setCostPerClient] = useState(15); // your costs per client

  // Calculations
  const monthlyRecurring = clientCount * avgMonthlyPrice;
  const setupRevenue = (clientCount * setupFee * (setupFeePercent / 100)) / 12; // spread over year
  const monthlyRevenue = monthlyRecurring + setupRevenue;
  const annualRevenue = monthlyRevenue * 12;
  
  const monthlyCosts = clientCount * costPerClient;
  const monthlyProfit = monthlyRevenue - monthlyCosts;
  const profitMargin = ((monthlyProfit / monthlyRevenue) * 100).toFixed(1);
  
  const avgClientLifetime = 1 / (churnRate / 100); // months
  const clientLTV = (avgMonthlyPrice * avgClientLifetime) + (setupFee * (setupFeePercent / 100));
  
  // Growth projections
  const month6Clients = Math.floor(clientCount * 1.5);
  const month12Clients = Math.floor(clientCount * 2.5);
  const month6Revenue = month6Clients * avgMonthlyPrice;
  const month12Revenue = month12Clients * avgMonthlyPrice;

  const pricingTiers = [
    {
      name: "Starter",
      price: 197,
      setupFee: 297,
      features: [
        "5 videos/month",
        "Basic templates",
        "1 team member",
        "Email support",
        "GHL integration"
      ],
      idealFor: "Small businesses, solo creators"
    },
    {
      name: "Professional",
      price: 297,
      setupFee: 497,
      features: [
        "20 videos/month",
        "All templates",
        "3 team members",
        "Priority support",
        "Advanced automation",
        "White-label ready"
      ],
      idealFor: "Growing agencies, consultants",
      popular: true
    },
    {
      name: "Enterprise",
      price: 497,
      setupFee: 997,
      features: [
        "Unlimited videos",
        "Custom templates",
        "Unlimited team",
        "Dedicated success manager",
        "Custom integrations",
        "Full white-label",
        "API access"
      ],
      idealFor: "Large agencies, enterprises"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mx-auto">
            <Calculator className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white heading-font">
            Agency Pricing Calculator
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate your agency's revenue potential with AIFreedomDuane Studio
          </p>
        </div>

        {/* Revenue Calculator */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Revenue Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Client Count */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-300">Number of Clients</label>
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-lg px-4">
                  {clientCount}
                </Badge>
              </div>
              <Slider
                value={[clientCount]}
                onValueChange={(val) => setClientCount(val[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Average Monthly Price */}
            <div>
              <label className="text-gray-300 block mb-2">Average Monthly Price per Client</label>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl">$</span>
                <Input
                  type="number"
                  value={avgMonthlyPrice}
                  onChange={(e) => setAvgMonthlyPrice(Number(e.target.value))}
                  className="bg-[#0B0B0C] border-gray-700 text-white text-xl font-bold"
                />
              </div>
            </div>

            {/* Setup Fee */}
            <div>
              <label className="text-gray-300 block mb-2">One-Time Setup Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl">$</span>
                <Input
                  type="number"
                  value={setupFee}
                  onChange={(e) => setSetupFee(Number(e.target.value))}
                  className="bg-[#0B0B0C] border-gray-700 text-white text-xl font-bold"
                />
              </div>
            </div>

            {/* Setup Fee Conversion */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-300">% Clients Paying Setup Fee</label>
                <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                  {setupFeePercent}%
                </Badge>
              </div>
              <Slider
                value={[setupFeePercent]}
                onValueChange={(val) => setSetupFeePercent(val[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>

            {/* Churn Rate */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-300">Monthly Churn Rate</label>
                <Badge className="bg-red-500/20 text-red-400">
                  {churnRate}%
                </Badge>
              </div>
              <Slider
                value={[churnRate]}
                onValueChange={(val) => setChurnRate(val[0])}
                min={0}
                max={30}
                step={1}
              />
            </div>

            {/* Cost Per Client */}
            <div>
              <label className="text-gray-300 block mb-2">Your Cost per Client (monthly)</label>
              <div className="flex items-center gap-2">
                <span className="text-white text-xl">$</span>
                <Input
                  type="number"
                  value={costPerClient}
                  onChange={(e) => setCostPerClient(Number(e.target.value))}
                  className="bg-[#0B0B0C] border-gray-700 text-white text-xl font-bold"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Includes: platform costs, support, infrastructure
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Monthly Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 border-[#FFD700]/30 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-white heading-font">
                      ${monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Recurring (MRR):</span>
                    <span className="text-white font-semibold">${monthlyRecurring.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Setup Fees:</span>
                    <span className="text-white font-semibold">${setupRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Annual Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Annual Revenue (ARR)</p>
                    <p className="text-3xl font-bold text-white heading-font">
                      ${annualRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Monthly Profit:</span>
                    <span className="text-green-400 font-semibold">${monthlyProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Profit Margin:</span>
                    <span className="text-green-400 font-semibold">{profitMargin}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Client LTV */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Client Lifetime Value</p>
                    <p className="text-3xl font-bold text-white heading-font">
                      ${clientLTV.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Avg Lifetime:</span>
                    <span className="text-white font-semibold">{avgClientLifetime.toFixed(1)} months</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>CAC Ratio:</span>
                    <span className="text-white font-semibold">1:{(clientLTV / setupFee).toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Growth Projections */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00D4C9]" />
              Growth Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Current */}
              <div className="text-center p-6 rounded-xl bg-[#0B0B0C] border border-gray-800">
                <p className="text-gray-400 text-sm mb-2">Current (Month 0)</p>
                <p className="text-4xl font-bold text-white mb-2">{clientCount}</p>
                <p className="text-gray-400 text-sm">clients</p>
                <p className="text-[#FFD700] font-semibold text-xl mt-3">
                  ${monthlyRecurring.toLocaleString()}/mo
                </p>
              </div>

              {/* 6 Months */}
              <div className="text-center p-6 rounded-xl bg-[#0B0B0C] border border-[#00D4C9]/30">
                <p className="text-gray-400 text-sm mb-2">6 Months</p>
                <p className="text-4xl font-bold text-white mb-2">{month6Clients}</p>
                <p className="text-gray-400 text-sm">clients</p>
                <p className="text-[#00D4C9] font-semibold text-xl mt-3">
                  ${month6Revenue.toLocaleString()}/mo
                </p>
              </div>

              {/* 12 Months */}
              <div className="text-center p-6 rounded-xl bg-[#0B0B0C] border border-green-500/30">
                <p className="text-gray-400 text-sm mb-2">12 Months</p>
                <p className="text-4xl font-bold text-white mb-2">{month12Clients}</p>
                <p className="text-gray-400 text-sm">clients</p>
                <p className="text-green-400 font-semibold text-xl mt-3">
                  ${month12Revenue.toLocaleString()}/mo
                </p>
              </div>

            </div>

            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#FFD700]/10 to-[#00D4C9]/10 border border-[#FFD700]/30">
              <p className="text-white font-semibold mb-2">
                🎯 12-Month Revenue Potential: <span className="text-[#FFD700] text-2xl">${(month12Revenue * 12).toLocaleString()}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Based on 2.5x growth over 12 months with {churnRate}% monthly churn
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Pricing Tiers */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Suggested Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingTiers.map((tier, idx) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`p-6 rounded-2xl border-2 ${
                    tier.popular 
                      ? 'border-[#FFD700] bg-gradient-to-br from-[#FFD700]/10 to-[#00D4C9]/10' 
                      : 'border-gray-800 bg-[#0B0B0C]'
                  } relative`}
                >
                  {tier.popular && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold">
                      MOST POPULAR
                    </Badge>
                  )}
                  
                  <h3 className="text-2xl font-bold text-white mb-2 heading-font">
                    {tier.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-gray-400 text-sm">Setup: </span>
                    <span className="text-[#FFD700] font-semibold">${tier.setupFee}</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">Ideal for:</p>
                    <p className="text-sm text-white">{tier.idealFor}</p>
                  </div>

                  <Button
                    onClick={() => {
                      setAvgMonthlyPrice(tier.price);
                      setSetupFee(tier.setupFee);
                    }}
                    className={`w-full mt-4 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    Use This Pricing
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold px-8">
            <Download className="w-5 h-5 mr-2" />
            Download Business Plan
          </Button>
          <Button variant="outline" className="border-gray-700 text-white px-8">
            <Send className="w-5 h-5 mr-2" />
            Email to Team
          </Button>
        </div>

      </div>
    </div>
  );
}