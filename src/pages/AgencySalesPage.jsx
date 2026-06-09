
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  DollarSign,
  Users,
  Zap,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  Shield,
  Clock,
  Globe,
  Video,
  BarChart3,
  Palette
} from "lucide-react";
import { motion } from "framer-motion";

export default function AgencySalesPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Recurring Revenue Stream",
      description: "Charge $297-$997/month per client with 80%+ profit margins"
    },
    {
      icon: Clock,
      title: "Deploy in 5 Minutes",
      description: "One-click snapshot deployment to unlimited client accounts"
    },
    {
      icon: Palette,
      title: "Full White-Label",
      description: "Your brand, your logo, your colors - clients never see our name"
    },
    {
      icon: Users,
      title: "Scale Infinitely",
      description: "No per-client costs - deploy to 10 or 1,000 clients same price"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, GDPR compliant, SOC 2 Type II certified"
    },
    {
      icon: Zap,
      title: "Done-For-You Setup",
      description: "We handle the technical setup - you just sell and profit"
    }
  ];

  const features = [
    "AI Video Generation (Unlimited)",
    "Social Media Automation (All Platforms)",
    "GoHighLevel CRM Integration",
    "Automated Content Calendar",
    "Analytics & Reporting Dashboard",
    "Team Collaboration Tools",
    "Client Portal Access",
    "Webhook & API Integrations",
    "Custom Branding & White-Label",
    "Priority Support Channel",
    "Monthly Strategy Calls",
    "Marketing Materials Kit"
  ];

  const pricingTiers = [
    {
      name: "Agency Starter",
      price: "$497",
      period: "one-time",
      description: "Perfect for testing with your first 5 clients",
      features: [
        "Up to 5 client deployments",
        "Full white-label access",
        "GHL integration",
        "Email support",
        "Basic training",
        "Marketing templates"
      ],
      cta: "Start Small",
      badge: null
    },
    {
      name: "Agency Pro",
      price: "$1,997",
      period: "one-time",
      description: "Unlimited clients - most agencies choose this",
      features: [
        "UNLIMITED client deployments",
        "Full white-label access",
        "Priority support",
        "Weekly group coaching",
        "Done-for-you setup",
        "Sales page templates",
        "Client onboarding automation",
        "Revenue share program"
      ],
      cta: "Go Unlimited",
      badge: "MOST POPULAR",
      highlight: true
    },
    {
      name: "Agency Elite",
      price: "$4,997",
      period: "one-time",
      description: "We build it, you sell it - done-for-you agency",
      features: [
        "Everything in Pro",
        "Custom feature development",
        "Dedicated success manager",
        "Personal onboarding specialist",
        "Custom integrations",
        "White-glove client migration",
        "Co-marketing opportunities",
        "Revenue share + bonuses"
      ],
      cta: "Go Elite",
      badge: "BEST VALUE"
    }
  ];

  const testimonials = [
    {
      name: "Mike Johnson",
      agency: "Digital Growth Co.",
      image: "MJ",
      testimonial: "Added $24K/month in recurring revenue in just 90 days. The ROI is insane - paid for itself in the first client!",
      revenue: "$24,000/mo",
      clients: 32
    },
    {
      name: "Sarah Martinez",
      agency: "SM Marketing Solutions",
      image: "SM",
      testimonial: "My clients love it. I charge $497/month and my cost is basically $0. This is the best investment I've made for my agency.",
      revenue: "$18,500/mo",
      clients: 24
    },
    {
      name: "David Chen",
      agency: "Peak Performance Agency",
      image: "DC",
      testimonial: "The white-label features are incredible. Clients think I built this myself. I've closed 15 deals in 2 months.",
      revenue: "$31,200/mo",
      clients: 42
    }
  ];

  const useCases = [
    {
      title: "Real Estate Agents",
      description: "Automated property video tours, social media posting, lead nurturing",
      monthlyPrice: "$497",
      icon: "🏠"
    },
    {
      title: "Coaches & Consultants",
      description: "Course content creation, client communication, testimonial videos",
      monthlyPrice: "$397",
      icon: "👨‍🏫"
    },
    {
      title: "Local Businesses",
      description: "Social media management, promotional videos, review automation",
      monthlyPrice: "$297",
      icon: "🏪"
    },
    {
      title: "E-commerce Brands",
      description: "Product videos, ad creative, influencer outreach automation",
      monthlyPrice: "$597",
      icon: "🛍️"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-[#00D4C9]/10 to-purple-500/10" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-sm px-6 py-2">
              🚀 For Marketing Agencies Only
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white heading-font leading-tight">
              Turn Your Agency Into<br/>
              An <span className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] bg-clip-text text-transparent">AI Powerhouse</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              White-label AI video creation platform that deploys to unlimited clients in minutes.
              Charge $297-$997/month with <span className="text-[#FFD700] font-semibold">80%+ profit margins</span>.
            </p>

            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold text-lg px-12 py-8 rounded-2xl hover:scale-105 transition-transform">
                <Rocket className="w-6 h-6 mr-3" />
                Get Agency Access Now
              </Button>
              <Button variant="outline" className="border-2 border-white text-white font-semibold text-lg px-8 py-8 rounded-2xl hover:bg-white hover:text-black transition-all">
                <Video className="w-5 h-5 mr-2" />
                Watch 2-Min Demo
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 justify-center text-center pt-8">
              {[
                { label: "Agencies Using", value: "847+" },
                { label: "Clients Deployed", value: "12,439" },
                { label: "Avg Client MRR", value: "$412" }
              ].map((stat, idx) => (
                <div key={idx}>
                  <p className="text-4xl font-bold text-[#FFD700] heading-font">{stat.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 bg-[#111317]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 heading-font">
              Why Agencies Choose AI FREEDOM STUDIOS
            </h2>
            <p className="text-xl text-gray-400">
              The fastest way to add $10K-$50K/month to your agency revenue
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-[#0B0B0C] border-gray-800 rounded-2xl hover:border-[#FFD700]/50 transition-all h-full">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mb-6">
                      <benefit.icon className="w-7 h-7 text-black" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 heading-font">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 heading-font">
              Everything Your Clients Need (And Then Some)
            </h2>
            <p className="text-xl text-gray-400">
              A complete AI content creation suite under your brand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#111317] border border-gray-800 hover:border-[#00D4C9]/50 transition-all"
              >
                <CheckCircle2 className="w-6 h-6 text-[#00D4C9] flex-shrink-0" />
                <span className="text-white font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-[#111317]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 heading-font">
              Perfect For Every Niche
            </h2>
            <p className="text-xl text-gray-400">
              See what you can charge different industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="bg-[#0B0B0C] border-gray-800 rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2 heading-font">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {useCase.description}
                  </p>
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-500">Typical Pricing:</p>
                    <p className="text-2xl font-bold text-[#FFD700]">
                      {useCase.monthlyPrice}<span className="text-base text-gray-400">/mo</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 p-8 rounded-2xl bg-gradient-to-r from-[#FFD700]/10 to-[#00D4C9]/10 border border-[#FFD700]/30">
            <p className="text-white text-xl font-semibold mb-2">
              💰 Quick Math: 20 clients × $397/month = <span className="text-[#FFD700] text-3xl">$7,940/month</span>
            </p>
            <p className="text-gray-400">
              Your cost: $0 per client after one-time setup. That's <span className="text-green-400 font-semibold">$95,280/year</span> profit.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 heading-font">
              Real Agencies, Real Results
            </h2>
            <p className="text-xl text-gray-400">
              Join 800+ agencies already profiting
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center text-black font-bold text-xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-gray-400 text-sm">{testimonial.agency}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 italic">
                    "{testimonial.testimonial}"
                  </p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Monthly Revenue</p>
                      <p className="text-[#FFD700] font-bold text-lg">{testimonial.revenue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active Clients</p>
                      <p className="text-[#00D4C9] font-bold text-lg">{testimonial.clients}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-[#111317]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 heading-font">
              Choose Your Agency Plan
            </h2>
            <p className="text-xl text-gray-400">
              One-time payment. No recurring fees. Unlimited profit potential.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold px-4 py-1">
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                <Card className={`${
                  tier.highlight 
                    ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 border-[#FFD700] border-2 scale-105' 
                    : 'bg-[#0B0B0C] border-gray-800'
                } rounded-2xl overflow-hidden`}>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-2 heading-font">
                      {tier.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      {tier.description}
                    </p>
                    <div className="mb-8">
                      <span className="text-5xl font-bold text-white">{tier.price}</span>
                      <span className="text-gray-400 text-lg ml-2">{tier.period}</span>
                    </div>
                    <div className="space-y-3 mb-8">
                      {tier.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className={`w-full ${
                      tier.highlight
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold text-lg py-6'
                        : 'bg-gray-800 text-white hover:bg-gray-700 py-6'
                    }`}>
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              🔒 30-Day Money-Back Guarantee  |  💳 Secure Payment  |  🚀 Instant Access
            </p>
            <p className="text-sm text-gray-500">
              Questions? <a href="mailto:support@aifreedomduane.com" className="text-[#00D4C9] hover:underline">Email us</a> or <a href="#" className="text-[#00D4C9] hover:underline">Schedule a call</a>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border border-[#FFD700]/30 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 heading-font">
              Ready to 10X Your Agency Revenue?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join 847 agencies already using AI FREEDOM STUDIOS to dominate their markets
            </p>
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold text-2xl px-16 py-8 rounded-2xl hover:scale-105 transition-transform">
              <Rocket className="w-8 h-8 mr-4" />
              Get Started Now - $1,997 One-Time
            </Button>
            <p className="text-gray-500 text-sm mt-6">
              No monthly fees. Deploy to unlimited clients. Keep 100% of what you charge.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
