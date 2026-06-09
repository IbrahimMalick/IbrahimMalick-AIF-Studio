import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Zap,
  Sparkles,
  Crown,
  Rocket,
  DollarSign,
  Award,
  TrendingUp,
  Shield,
  Video,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import DynamicPricingCalculator from "@/components/DynamicPricingCalculator";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const coreTiers = [
    {
      id: "starter",
      name: "STARTER",
      subtitle: "Digital Only",
      monthlyPrice: 97,
      annualPrice: 970,
      icon: Sparkles,
      color: "from-blue-500 to-cyan-500",
      features: [
        "5 videos/month",
        "1080p quality",
        "Web-quality videos",
        "Basic AI generation",
        "Social media formats",
        "MP4 delivery",
        "48 hours turnaround",
        "Email support"
      ],
      popular: false
    },
    {
      id: "pro",
      name: "PRO",
      subtitle: "Production Ready",
      monthlyPrice: 497,
      annualPrice: 4970,
      previousPrice: 147,
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      features: [
        "25 videos/month",
        "5 broadcast ads/month",
        "4K quality",
        "24 hours turnaround",
        "Topaz AI enhancement",
        "DaVinci color grading",
        "Multiple format exports",
        "Priority support",
        "API access"
      ],
      popular: true
    },
    {
      id: "elite",
      name: "ELITE",
      subtitle: "Broadcast Grade",
      monthlyPrice: 1497,
      annualPrice: 14970,
      previousPrice: 497,
      icon: Crown,
      color: "from-[#FFD700] to-[#FF8C00]",
      features: [
        "Unlimited videos/month",
        "25 broadcast ads/month",
        "8K quality",
        "Same day turnaround",
        "Full Topaz enhancement",
        "Advanced DaVinci finishing",
        "Broadcast formats (ProRes, MXF)",
        "TV & streaming ready",
        "Dedicated account manager",
        "White-label options"
      ],
      popular: false,
      recommended: true
    },
    {
      id: "enterprise",
      name: "ENTERPRISE",
      subtitle: "Hollywood Studio",
      monthlyPrice: 4997,
      annualPrice: null,
      previousPrice: 2497,
      custom: true,
      icon: Shield,
      color: "from-gray-700 to-gray-900",
      features: [
        "Everything unlimited",
        "Cinema delivery formats",
        "Dedicated render farm",
        "White-label broadcast studio",
        "Custom AI model training",
        "Network TV specifications",
        "SLA guarantees",
        "4 hours turnaround",
        "24/7 phone support"
      ],
      popular: false
    }
  ];

  const cinematicTiers = [
    {
      name: "Cinematic Broadcast Starter",
      price: 497,
      previousPrice: 297,
      adsPerMonth: 5,
      quality: "4K Broadcast",
      enhancement: "Topaz AI",
      colorGrade: "Professional",
      formats: ["MP4", "MOV", "ProRes"],
      features: ["4K Broadcast quality", "Topaz AI enhancement", "Professional color grade", "Multiple formats"]
    },
    {
      name: "Cinematic Broadcast Pro",
      price: 1497,
      previousPrice: 797,
      adsPerMonth: 20,
      quality: "8K Broadcast",
      enhancement: "Full Topaz Suite",
      colorGrade: "DaVinci Advanced",
      formats: ["ProRes", "MXF", "DNxHR", "MP4"],
      features: ["8K Broadcast quality", "Full Topaz Suite", "DaVinci Advanced grading", "All broadcast formats"],
      popular: true
    },
    {
      name: "Cinematic Broadcast Unlimited",
      price: 3997,
      previousPrice: 1997,
      adsPerMonth: "Unlimited",
      quality: "Cinema/8K",
      enhancement: "Maximum Quality",
      colorGrade: "Hollywood Standard",
      formats: ["DCP", "ProRes", "MXF", "DNxHR", "Custom"],
      features: ["Cinema/8K quality", "Maximum quality enhancement", "Hollywood standard grading", "All formats including DCP"]
    }
  ];

  const bundles = [
    {
      name: "Broadcast Agency Power Pack",
      monthlyPrice: 2997,
      totalValue: 6488,
      savings: 3491,
      includes: ["Elite tier (1497 value)", "Broadcast Pro (1497 value)", "White-Label Studio (997 value)", "All premium add-ons"],
      recommended: true
    },
    {
      name: "Creator Broadcast Bundle",
      monthlyPrice: 1797,
      totalValue: 2991,
      savings: 1194,
      includes: ["Pro tier (497 value)", "Broadcast Starter (497 value)", "Enhancement Package", "Priority rendering"]
    }
  ];

  const setupPackages = [
    {
      name: "Standard Setup",
      price: 1497,
      duration: "N/A",
      includes: [
        "Platform configuration",
        "Basic training (5 hours)",
        "Template library",
        "30-day support"
      ]
    },
    {
      name: "Professional Setup",
      price: 4997,
      duration: "N/A",
      includes: [
        "Complete configuration",
        "Advanced training (20 hours)",
        "Custom workflows",
        "First campaign creation",
        "90-day support"
      ],
      popular: true
    },
    {
      name: "Broadcast Studio Setup",
      price: 9997,
      duration: "N/A",
      includes: [
        "Full studio configuration",
        "Team training (40 hours)",
        "10 custom templates",
        "Network specifications setup",
        "First 5 broadcast ads created",
        "6-month dedicated support"
      ]
    }
  ];

  const addons = [
    { name: "Broadcast Enhancement Package", price: 297, setupFee: 0, billing: "per_video", icon: "✨", features: ["Full Topaz AI processing", "8K upscaling", "Artifact removal", "60fps smoothing"] },
    { name: "Cinema Color Grade", price: 497, setupFee: 0, billing: "per_video", icon: "🎨", features: ["Professional DaVinci colorist", "Custom LUTs", "HDR mastering"] },
    { name: "Network TV Package", price: 997, setupFee: 0, billing: "per_campaign", icon: "📺", features: ["Broadcast compliance", "Closed captions", "QC report"] },
    { name: "AI Voice Receptionist", price: 197, setupFee: 497, billing: "monthly", icon: "📞", features: ["Unlimited inbound calls", "2000 outbound minutes", "CRM integration"] },
    { name: "White-Label Broadcast Studio", price: 997, setupFee: 1997, billing: "monthly", icon: "🏢", features: ["Custom branding", "Unlimited sub-accounts", "Revenue sharing"] }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-[#00D4C9]/10 to-purple-500/10" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 mb-6">
            ⚡ Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 heading-font">
            The World's First <span className="text-[#FFD700]">AI-Powered Broadcast Production House</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            From digital videos to network TV-ready broadcast ads
          </p>
          <p className="text-lg text-gray-400 mb-8">
            Starting at <span className="text-[#00D4C9] font-semibold">$97/month</span> • Professional plans from <span className="text-[#FFD700] font-semibold">$497/month</span>
          </p>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#111317] rounded-xl p-1 inline-flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black"
                    : "text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  billingCycle === "annual"
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black"
                    : "text-gray-400"
                }`}
              >
                Annual <span className="text-green-400 ml-1">(Save 20%)</span>
              </button>
              <button
                onClick={() => setBillingCycle("lifetime")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  billingCycle === "lifetime"
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black"
                    : "text-gray-400"
                }`}
              >
                Lifetime
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pricing Tiers */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTiers.map((tier, idx) => {
              const Icon = tier.icon;
              const price = billingCycle === "monthly" 
                ? tier.monthlyPrice 
                : billingCycle === "annual" && tier.annualPrice 
                  ? tier.annualPrice 
                  : billingCycle === "lifetime" && tier.id === "pro"
                    ? 4997
                    : billingCycle === "lifetime" && tier.id === "elite"
                      ? 14997
                      : tier.monthlyPrice * 10;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-1">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  {tier.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold px-4 py-1">
                        BEST VALUE
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`${
                    tier.recommended
                      ? "bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 border-[#FFD700] border-2 scale-105"
                      : "bg-[#111317] border-gray-800"
                  } rounded-2xl h-full`}>
                    <CardContent className="p-8">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-1 heading-font">{tier.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{tier.subtitle}</p>
                      
                      <div className="mb-6">
                        {tier.previousPrice && billingCycle === "monthly" && (
                          <div className="text-gray-500 line-through text-lg mb-1">
                            ${tier.previousPrice}
                          </div>
                        )}
                        <span className="text-4xl font-bold text-white">
                          ${typeof price === 'number' ? price.toLocaleString() : price}
                        </span>
                        <span className="text-gray-400 ml-2">
                          {billingCycle === "lifetime" ? "one-time" : `/${billingCycle === "annual" ? "year" : "month"}`}
                        </span>
                        {billingCycle === "annual" && tier.annualSavings && (
                          <div className="text-green-400 text-sm mt-1">
                            Save ${tier.annualSavings}!
                          </div>
                        )}
                      </div>

                      <ul className="space-y-3 mb-8">
                        {tier.features.slice(0, 8).map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                        {tier.features.length > 8 && (
                          <li className="text-gray-500 text-sm">+ {tier.features.length - 8} more features</li>
                        )}
                      </ul>

                      <Button className={`w-full ${
                        tier.recommended
                          ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                          : tier.popular
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                            : "bg-gray-800 text-white hover:bg-gray-700"
                      } py-6`}>
                        {tier.custom ? "Contact Sales" : "Get Started"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GLOBAL CINEMATIC AI AD ENGINE Section */}
      <section className="py-20 px-4 bg-[#111317]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 heading-font">
              🎬 GLOBAL CINEMATIC AI AD ENGINE™
            </h2>
            <p className="text-xl text-gray-400">
              Create Hollywood-quality ads in hours, not weeks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {cinematicTiers.map((tier, idx) => (
              <Card key={idx} className={`${
                tier.popular ? "border-2 border-purple-500 scale-105" : "border-gray-800"
              } bg-[#0B0B0C] rounded-2xl`}>
                <CardContent className="p-6">
                  {tier.popular && (
                    <Badge className="bg-purple-500 text-white mb-3">MOST POPULAR</Badge>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    {tier.previousPrice && (
                      <div className="text-gray-500 line-through text-lg mb-1">
                        ${tier.previousPrice}
                      </div>
                    )}
                    <span className="text-3xl font-bold text-white">${tier.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-400 mb-2">
                    {tier.adsPerMonth} ads/month
                  </p>
                  <div className="mb-4 space-y-1 text-sm">
                    <p className="text-gray-500"><span className="text-white font-semibold">Quality:</span> {tier.quality}</p>
                    <p className="text-gray-500"><span className="text-white font-semibold">Enhancement:</span> {tier.enhancement}</p>
                    <p className="text-gray-500"><span className="text-white font-semibold">Color:</span> {tier.colorGrade}</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold">
                    Add to Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison */}
          <div className="bg-gradient-to-r from-red-500/10 to-green-500/10 border border-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Compare to Traditional Production:
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-gray-400 mb-2">Traditional Cost</p>
                <p className="text-3xl font-bold text-red-400">$10,000-50,000</p>
                <p className="text-sm text-gray-500">per video</p>
              </div>
              <div>
                <p className="text-gray-400 mb-2">With AI Freedom</p>
                <p className="text-3xl font-bold text-green-400">$40-200</p>
                <p className="text-sm text-gray-500">per video</p>
              </div>
              <div>
                <p className="text-gray-400 mb-2">You Save</p>
                <p className="text-3xl font-bold text-[#FFD700]">99%</p>
                <p className="text-sm text-gray-500">on production costs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle Deals */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12 heading-font">
            💎 Special Bundle Deals
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {bundles.map((bundle, idx) => (
              <Card key={idx} className={`${
                bundle.recommended ? "border-2 border-[#FFD700]" : "border-gray-800"
              } bg-[#111317] rounded-2xl`}>
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white">{bundle.name}</h3>
                    <Badge className="bg-green-500 text-white">
                      Save ${bundle.savings}/mo
                    </Badge>
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${bundle.monthlyPrice}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Total Value: ${bundle.totalValue}/month
                  </p>
                  <div className="mb-6">
                    <p className="text-white font-semibold mb-3">This bundle includes:</p>
                    <ul className="space-y-2">
                      {bundle.includes.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold py-6">
                    Get This Bundle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-16 px-4 bg-[#111317]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12 heading-font">
            🎁 Premium Add-Ons
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((addon, idx) => (
              <Card key={idx} className="bg-[#0B0B0C] border-gray-800 rounded-xl hover:border-[#00D4C9] transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{addon.icon}</div>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">{addon.billing}</Badge>
                  </div>
                  <h4 className="text-white font-semibold mb-2">{addon.name}</h4>
                  <p className="text-2xl font-bold text-[#FFD700] mb-1">${addon.price}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {addon.billing === "monthly" ? "/month" : addon.billing === "per_video" ? "/video" : "/campaign"}
                  </p>
                  {addon.setupFee > 0 && (
                    <p className="text-xs text-gray-400 mb-3">+ ${addon.setupFee} setup</p>
                  )}
                  {addon.features && (
                    <ul className="space-y-1 text-xs text-gray-400">
                      {addon.features.slice(0, 3).map((feature, fIdx) => (
                        <li key={fIdx}>• {feature}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Packages */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12 heading-font">
            🛠️ Professional Setup Packages
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Get up and running faster with expert configuration
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {setupPackages.map((pkg, idx) => (
              <Card key={idx} className={`${
                pkg.popular ? "border-2 border-blue-500 scale-105" : "border-gray-800"
              } bg-[#111317] rounded-2xl`}>
                <CardContent className="p-6">
                  {pkg.popular && (
                    <Badge className="bg-blue-500 text-white mb-3">POPULAR CHOICE</Badge>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-white mb-2">${pkg.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mb-4">{pkg.duration}</p>
                  
                  <div className="max-h-64 overflow-y-auto mb-4">
                    <ul className="space-y-2">
                      {pkg.includes.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pkg.bonus && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                      <p className="text-yellow-400 text-sm font-bold">
                        🎁 Includes $2,000 in Ad Credits!
                      </p>
                    </div>
                  )}

                  <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 py-3">
                    Select This Setup
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4 bg-[#111317]">
        <div className="max-w-5xl mx-auto">
          <DynamicPricingCalculator theme="dark" embedded={false} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12 heading-font">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What's the difference between monthly and one-time pricing?",
                a: "Monthly plans give you ongoing access with regular updates. One-time licenses give you lifetime access to current features with free updates for the tier you purchase."
              },
              {
                q: "Can I change my plan later?",
                a: "Yes! You can upgrade or downgrade anytime. Upgrades take effect immediately, downgrades at the end of your billing cycle."
              },
              {
                q: "What is the GLOBAL CINEMATIC AI AD ENGINE?",
                a: "Our revolutionary AI technology that creates Hollywood-quality video ads in hours instead of weeks, saving 99% on traditional production costs."
              },
              {
                q: "Do I need a setup package?",
                a: "Setup packages accelerate your success but aren't required. They include expert configuration, training, and done-for-you campaigns to get ROI faster."
              },
              {
                q: "Is there a free trial?",
                a: "Yes! We offer a 7-day free trial of our Elite tier so you can experience the full platform before committing."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <h4 className="text-white font-bold mb-2">{faq.q}</h4>
                  <p className="text-gray-400">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border border-[#FFD700]/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6 heading-font">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators and agencies using AI Freedom Studios
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg px-12 py-6 rounded-xl hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5 mr-2" />
                Start 7-Day Free Trial
              </Button>
              <Button variant="outline" className="border-2 border-white text-white font-semibold text-lg px-8 py-6 rounded-xl hover:bg-white hover:text-black transition-all">
                <Video className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}