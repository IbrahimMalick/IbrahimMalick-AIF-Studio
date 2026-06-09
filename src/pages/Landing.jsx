import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  CheckCircle2,
  X,
  Video,
  Palette,
  Calendar,
  Zap,
  Users,
  Globe,
  Shield,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  Target,
  BarChart3,
  Mail,
  Bot,
  Mic,
  Eye,
  FileText,
  Share2,
  Brain,
  Megaphone
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const allFeatures = [
    {
      category: "AI Video Creation",
      icon: Video,
      color: "from-[#FF4433] to-[#FF8C00]",
      features: [
        "AI Avatar Video Studio - Create videos with AI presenters",
        "AI Script Generation - Write compelling scripts in seconds",
        "Voice Cloning - Clone any voice with 3 samples",
        "Auto Captions - Multi-language subtitles",
        "Style Transfer - Apply artistic styles to videos",
        "Video Templates - 100+ pre-built templates",
        "Scene-by-Scene Editor - Professional editing tools",
        "4K Rendering - Export in any resolution",
        "Background Removal - Auto greenscreen",
        "Batch Rendering - Process multiple videos"
      ]
    },
    {
      category: "AI Content Generation",
      icon: Sparkles,
      color: "from-[#00D4C9] to-[#1E90FF]",
      features: [
        "Social Media Posts - Instagram, Facebook, TikTok, LinkedIn, Twitter",
        "Email Campaigns - Welcome, nurture, promotional sequences",
        "SEO Blog Posts - Optimized long-form content",
        "Ad Copy - Meta Ads, Google Ads creative",
        "Lead Magnets - eBooks, checklists, guides (auto-PDF)",
        "Product Descriptions - E-commerce optimization",
        "YouTube SEO - Titles, descriptions, tags",
        "Script Writing - VSL, explainer, tutorial scripts",
        "Brand Voice AI - Learns and matches your tone",
        "Multi-language Support - 9+ languages"
      ]
    },
    {
      category: "Content Repurposing",
      icon: Share2,
      color: "from-[#9D4EDD] to-[#FF69B4]",
      features: [
        "1-Click Repurposing - Turn 1 video into 50+ assets",
        "Auto Clip Generation - AI extracts best moments",
        "Social Post Variants - 4 platforms × 4 posts each",
        "Email Sequences - Auto-generate follow-up emails",
        "Quote Graphics - Pull viral quotes with designs",
        "Audiograms - Audio waveform videos",
        "Teaser Trailers - Hook-focused short clips",
        "Blog Post Generation - Full SEO article from video",
        "Platform Optimization - Right format per platform",
        "Viral Moment Detection - AI finds shareable clips"
      ]
    },
    {
      category: "Content Calendar & Scheduling",
      icon: Calendar,
      color: "from-[#FFD700] to-[#FFA500]",
      features: [
        "Unified Calendar - See all content across platforms",
        "AI Optimal Timing - Post when audience is most active",
        "Drag & Drop Scheduling - Visual calendar interface",
        "Multi-Platform Publishing - Schedule to all platforms at once",
        "Content Gap Analysis - AI finds missing content opportunities",
        "Bulk Scheduling - Upload CSV for mass scheduling",
        "Auto-Publish - Set it and forget it",
        "Team Collaboration - Approval workflows",
        "Campaign Grouping - Organize by campaigns",
        "Performance Predictions - AI forecasts engagement"
      ]
    },
    {
      category: "Campaign Orchestrator",
      icon: Megaphone,
      color: "from-[#06D6A0] to-[#00D4C9]",
      features: [
        "Multi-Channel Campaigns - Social, email, blog, ads unified",
        "AI Campaign Builder - Generate entire campaign from brief",
        "Strategic Phasing - Awareness → Consideration → Conversion",
        "Auto Content Generation - 20-50 pieces per campaign",
        "Smart Scheduling - AI distributes content strategically",
        "Brand Voice Consistency - All content matches your voice",
        "Performance Tracking - Real-time multi-channel analytics",
        "Budget Optimization - Auto-reallocate based on performance",
        "A/B Testing - Auto-test and pick winners",
        "Campaign Templates - Industry-specific blueprints"
      ]
    },
    {
      category: "Competitor Intelligence",
      icon: Eye,
      color: "from-[#FF6B9D] to-[#C44569]",
      features: [
        "Competitor Tracking - Monitor any competitor",
        "Content Analysis - See what works for them",
        "Market Gap Finder - Discover opportunities they miss",
        "Spy Reports - AI-generated competitive reports",
        "Positioning Matrix - Visualize competitive landscape",
        "Counter-Strategy Builder - AI recommends how to beat them",
        "Trend Detection - Catch trends before competitors",
        "Ad Monitoring - Track competitor ads",
        "Performance Benchmarking - Compare your metrics",
        "Weakness Exploitation - Turn their gaps into your wins"
      ]
    },
    {
      category: "Meta Ads Management",
      icon: Target,
      color: "from-[#1877F2] to-[#0A66C2]",
      features: [
        "Ad Campaign Manager - Full Meta Ads integration",
        "AI Ad Creative - Generate ad copy & images",
        "Auto-Optimization - AI adjusts bids and budgets",
        "A/B Testing Engine - Test everything automatically",
        "Audience Builder - Smart targeting recommendations",
        "Budget Manager - Set spend limits and alerts",
        "Performance Analytics - Real-time ROAS tracking",
        "Creative Library - Organize all ad assets",
        "Learning Phase Monitor - Track ad learning",
        "Compliance Checker - Avoid policy violations"
      ]
    },
    {
      category: "AI Copilot",
      icon: Bot,
      color: "from-[#FFD700] to-[#00D4C9]",
      features: [
        "Natural Language Commands - \"Create a video about...\"",
        "Proactive Suggestions - AI recommends next actions",
        "Multi-Mode AI - Reactive, Proactive, Planner, Analyst modes",
        "Intent Recognition - Understands what you want",
        "Workflow Automation - Chain multiple actions",
        "Context Awareness - Remembers your preferences",
        "Voice Commands - Talk to create content",
        "Visual Commands - Upload images for ideas",
        "Learning Memory - Gets smarter over time",
        "24/7 Availability - Never sleeps"
      ]
    },
    {
      category: "Analytics & Insights",
      icon: BarChart3,
      color: "from-[#00FF88] to-[#00CC6A]",
      features: [
        "Cross-Platform Analytics - All platforms in one dashboard",
        "AI Performance Insights - Why content works/doesn't work",
        "Predictive Analytics - Forecast future performance",
        "Viral Score Predictions - Before you publish",
        "Engagement Heatmaps - See exactly where viewers drop",
        "Revenue Tracking - Track every dollar",
        "ROI Calculator - Measure content ROI",
        "Custom Dashboards - Build your perfect view",
        "Competitor Benchmarking - Compare to competitors",
        "Automated Reporting - PDF reports on autopilot"
      ]
    },
    {
      category: "CTV (Connected TV)",
      icon: Globe,
      color: "from-[#9D4EDD] to-[#7209B7]",
      features: [
        "Roku Publishing - Direct upload to Roku",
        "Apple TV Integration - Publish to Apple TV",
        "Fire TV Support - Amazon Fire TV deployment",
        "TV-Optimized Scripts - Lean-back content AI",
        "Branded Intros/Outros - Professional TV branding",
        "Multi-Platform Publishing - All CTV at once",
        "CTV Analytics - Viewer data from TV platforms",
        "Ad Monetization - Integrate TV ads",
        "Content Rating System - Auto-rate for compliance",
        "Channel Management - Manage all CTV channels"
      ]
    },
    {
      category: "Agency & White-Label",
      icon: Users,
      color: "from-[#FFD700] to-[#FF8C00]",
      features: [
        "Full White-Label - Your brand, your colors, your domain",
        "Unlimited Client Deployment - No per-client fees",
        "Client Portal - Dedicated access for each client",
        "GoHighLevel Integration - Seamless GHL sync",
        "Snapshot Deployment - 1-click client setup",
        "Client Onboarding Automation - Streamlined process",
        "Usage-Based Billing - Charge clients per usage",
        "Revenue Share Program - Earn from referrals",
        "Agency Dashboard - Manage all clients",
        "Custom Pricing Tiers - Set your own prices"
      ]
    },
    {
      category: "Automation & Workflows",
      icon: Zap,
      color: "from-[#FFD700] to-[#00D4C9]",
      features: [
        "Workflow Builder - Visual automation designer",
        "Automation Marketplace - Buy/sell workflows",
        "Webhook Integrations - Connect any tool",
        "Zapier Integration - 5000+ app connections",
        "Email Sequences - Auto-nurture leads",
        "Social Auto-Posting - Publish on autopilot",
        "Content Auto-Generation - AI creates on schedule",
        "Engagement Bots - Auto-respond to comments",
        "Lead Capture Automation - Funnel leads to GHL",
        "Smart Notifications - Get alerted to opportunities"
      ]
    },
    {
      category: "Security & Compliance",
      icon: Shield,
      color: "from-[#DC2626] to-[#EF4444]",
      features: [
        "Enterprise Security - Bank-level encryption",
        "RBAC (Role-Based Access) - Granular permissions",
        "2FA Authentication - Two-factor security",
        "SOC 2 Type II - Enterprise compliance",
        "GDPR Compliant - EU data protection",
        "Audit Trails - Track all account activity",
        "Token Rotation - Auto-refresh credentials",
        "IP Whitelisting - Restrict access by IP",
        "Session Management - Control active sessions",
        "Data Export - Full account export anytime"
      ]
    },
    {
      category: "Collaboration & Teams",
      icon: Users,
      color: "from-[#06D6A0] to-[#00D4C9]",
      features: [
        "Team Workspaces - Collaborate with unlimited members",
        "Role Management - Custom roles and permissions",
        "Real-Time Collaboration - Work together live",
        "Comment System - Feedback on projects",
        "Version History - Restore previous versions",
        "Project Sharing - Share with clients/team",
        "Approval Workflows - Require approvals",
        "Activity Tracking - See who did what",
        "Team Analytics - Team performance metrics",
        "Client Feedback Portal - Collect client input"
      ]
    }
  ];

  const competitors = [
    {
      name: "AIFreedomDuane Studio",
      logo: "🚀",
      price: "$1,997 one-time",
      color: "bg-gradient-to-r from-[#FFD700] to-[#00D4C9]"
    },
    {
      name: "Synthesia",
      logo: "S",
      price: "$22/mo",
      color: "bg-blue-600"
    },
    {
      name: "Descript",
      logo: "D",
      price: "$24/mo",
      color: "bg-purple-600"
    },
    {
      name: "HeyGen",
      logo: "H",
      price: "$29/mo",
      color: "bg-green-600"
    },
    {
      name: "Pictory.ai",
      logo: "P",
      price: "$23/mo",
      color: "bg-pink-600"
    }
  ];

  const comparisonFeatures = [
    {
      category: "Core Features",
      items: [
        { feature: "AI Avatar Videos", us: true, synthesia: true, descript: false, heygen: true, pictory: false },
        { feature: "Voice Cloning", us: true, synthesia: true, descript: true, heygen: true, pictory: false },
        { feature: "Auto Captions", us: true, synthesia: true, descript: true, heygen: true, pictory: true },
        { feature: "Video Templates", us: "100+", synthesia: "60+", descript: "Limited", heygen: "50+", pictory: "Basic" },
        { feature: "Social Media AI", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Email Copy AI", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "SEO Blog Writer", us: true, synthesia: false, descript: false, heygen: false, pictory: true }
      ]
    },
    {
      category: "Advanced AI",
      items: [
        { feature: "Content Repurposing (1→50)", us: true, synthesia: false, descript: false, heygen: false, pictory: true },
        { feature: "Campaign Orchestrator", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Competitor Intelligence", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "AI Copilot Assistant", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Brand Voice Learning", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Viral Score Prediction", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Market Gap Analysis", us: true, synthesia: false, descript: false, heygen: false, pictory: false }
      ]
    },
    {
      category: "Publishing & Distribution",
      items: [
        { feature: "Multi-Platform Scheduling", us: "All", synthesia: "Limited", descript: false, heygen: "Limited", pictory: "Basic" },
        { feature: "Connected TV (Roku, Apple TV)", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Meta Ads Integration", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "GoHighLevel Integration", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Auto-Publishing", us: true, synthesia: false, descript: false, heygen: false, pictory: true },
        { feature: "Content Calendar", us: "Advanced", synthesia: "Basic", descript: false, heygen: "Basic", pictory: "Basic" }
      ]
    },
    {
      category: "Agency & White-Label",
      items: [
        { feature: "White-Label Branding", us: "Full", synthesia: "Enterprise", descript: false, heygen: "Enterprise", pictory: false },
        { feature: "Custom Domain", us: true, synthesia: "Enterprise", descript: false, heygen: "Enterprise", pictory: false },
        { feature: "Client Portal", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Unlimited Client Deployment", us: true, synthesia: "Pay per", descript: "N/A", heygen: "Pay per", pictory: "N/A" },
        { feature: "Agency Dashboard", us: true, synthesia: "Enterprise", descript: false, heygen: "Enterprise", pictory: false },
        { feature: "Per-Client Billing", us: true, synthesia: false, descript: false, heygen: false, pictory: false }
      ]
    },
    {
      category: "Analytics & Optimization",
      items: [
        { feature: "Cross-Platform Analytics", us: true, synthesia: "Basic", descript: true, heygen: "Basic", pictory: "Basic" },
        { feature: "AI Performance Insights", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "A/B Testing", us: "Auto", synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Predictive Analytics", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Revenue Tracking", us: true, synthesia: false, descript: false, heygen: false, pictory: false },
        { feature: "Next-Best-Action AI", us: true, synthesia: false, descript: false, heygen: false, pictory: false }
      ]
    },
    {
      category: "Pricing & Limits",
      items: [
        { feature: "Pricing Model", us: "One-time", synthesia: "Monthly", descript: "Monthly", heygen: "Monthly", pictory: "Monthly" },
        { feature: "Monthly Video Credits", us: "Unlimited", synthesia: "Limited", descript: "Limited", heygen: "Limited", pictory: "Limited" },
        { feature: "Storage", us: "Unlimited", synthesia: "Limited", descript: "Limited", heygen: "Limited", pictory: "Limited" },
        { feature: "Team Members", us: "Unlimited", synthesia: "Pay per", descript: "Pay per", heygen: "Pay per", pictory: "Limited" },
        { feature: "Export Quality", us: "Up to 4K", synthesia: "1080p", descript: "4K", heygen: "1080p", pictory: "1080p" },
        { feature: "Commercial License", us: "Included", synthesia: "Extra", descript: "Included", heygen: "Extra", pictory: "Extra" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-[#00D4C9]/10 to-purple-500/10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-sm px-6 py-2">
              ⚡ The Complete AI Content Empire Builder
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              <span className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] bg-clip-text text-transparent">
                140+ AI Tools
              </span>
              <br />In One Platform
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              Create videos, images, social posts, emails, blogs, ads, and more—all powered by AI. 
              From content creation to campaign orchestration to competitor intelligence.
              <span className="block mt-4 text-[#FFD700] font-semibold">
                Everything a content creator or agency needs to dominate.
              </span>
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold text-lg px-12 py-8 rounded-2xl hover:scale-105 transition-transform">
                <Rocket className="w-6 h-6 mr-3" />
                Get Started Free
              </Button>
              <Button variant="outline" className="border-2 border-white text-white font-semibold text-lg px-8 py-8 rounded-2xl hover:bg-white hover:text-black">
                <Video className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
              {[
                { value: "140+", label: "AI Tools" },
                { value: "50+", label: "Pieces from 1 video" },
                { value: "9", label: "Languages" },
                { value: "$0", label: "Monthly fees" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-4xl font-bold text-[#FFD700]">{stat.value}</p>
                  <p className="text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Complete Feature List */}
      <section className="py-20 px-4 bg-[#111317]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Every Feature You'll Ever Need
            </h2>
            <p className="text-xl text-gray-400">
              140+ tools organized into 14 powerful categories
            </p>
          </div>

          <div className="space-y-8">
            {allFeatures.map((category, idx) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-[#0B0B0C] border-gray-800 rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`bg-gradient-to-r ${category.color} p-6`}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                            <p className="text-white/80 text-sm">{category.features.length} features included</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-3">
                          {category.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-3 p-3 rounded-lg bg-[#111317] hover:bg-[#151515] transition-all">
                              <CheckCircle2 className="w-5 h-5 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12 p-8 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border border-[#FFD700]/30">
            <p className="text-white text-2xl font-bold mb-2">
              ✨ Total: 140+ AI-Powered Features
            </p>
            <p className="text-gray-300 mb-4">
              New features added monthly. All included. No hidden fees.
            </p>
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold px-8 py-6">
              See All Features In Action
            </Button>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How We Stack Up Against The Competition
            </h2>
            <p className="text-xl text-gray-400">
              We don't just compete. We dominate. Here's why.
            </p>
          </div>

          {/* Competitor Header */}
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-6 gap-4 mb-6">
                <div className="text-white font-bold text-lg">Feature</div>
                {competitors.map((comp, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`${comp.color} rounded-xl p-4 mb-2`}>
                      <div className="text-3xl font-bold mb-1">{comp.logo}</div>
                      <p className="text-white font-bold text-sm">{comp.name}</p>
                    </div>
                    <p className="text-gray-400 text-xs">{comp.price}</p>
                  </div>
                ))}
              </div>

              {comparisonFeatures.map((section, sIdx) => (
                <div key={sIdx} className="mb-8">
                  <h3 className="text-white font-bold text-xl mb-4 pb-2 border-b border-gray-800">
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="grid grid-cols-6 gap-4 p-4 rounded-lg bg-[#111317] hover:bg-[#151515] transition-all"
                      >
                        <div className="text-gray-300 font-medium text-sm flex items-center">
                          {item.feature}
                        </div>
                        
                        {/* Us */}
                        <div className="flex items-center justify-center">
                          {item.us === true ? (
                            <CheckCircle2 className="w-6 h-6 text-[#00D4C9]" />
                          ) : item.us === false ? (
                            <X className="w-6 h-6 text-gray-600" />
                          ) : (
                            <span className="text-[#FFD700] font-bold text-sm">{item.us}</span>
                          )}
                        </div>
                        
                        {/* Synthesia */}
                        <div className="flex items-center justify-center">
                          {item.synthesia === true ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : item.synthesia === false ? (
                            <X className="w-6 h-6 text-gray-600" />
                          ) : (
                            <span className="text-gray-400 text-sm">{item.synthesia}</span>
                          )}
                        </div>
                        
                        {/* Descript */}
                        <div className="flex items-center justify-center">
                          {item.descript === true ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : item.descript === false ? (
                            <X className="w-6 h-6 text-gray-600" />
                          ) : (
                            <span className="text-gray-400 text-sm">{item.descript}</span>
                          )}
                        </div>
                        
                        {/* HeyGen */}
                        <div className="flex items-center justify-center">
                          {item.heygen === true ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : item.heygen === false ? (
                            <X className="w-6 h-6 text-gray-600" />
                          ) : (
                            <span className="text-gray-400 text-sm">{item.heygen}</span>
                          )}
                        </div>
                        
                        {/* Pictory */}
                        <div className="flex items-center justify-center">
                          {item.pictory === true ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : item.pictory === false ? (
                            <X className="w-6 h-6 text-gray-600" />
                          ) : (
                            <span className="text-gray-400 text-sm">{item.pictory}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Totals */}
              <Card className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border-[#FFD700]/50 border-2 rounded-2xl mt-8">
                <CardContent className="p-6">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="text-white font-bold text-lg">
                      ✅ Total Features
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#FFD700]">140+</p>
                      <p className="text-xs text-gray-300 mt-1">Everything</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">~30</p>
                      <p className="text-xs text-gray-500 mt-1">Video only</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">~25</p>
                      <p className="text-xs text-gray-500 mt-1">Editing focus</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">~35</p>
                      <p className="text-xs text-gray-500 mt-1">Avatar focus</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">~20</p>
                      <p className="text-xs text-gray-500 mt-1">Basic tools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6 text-lg">
              💡 <span className="text-white font-semibold">The Math:</span> You'd need to subscribe to 5-7 different tools to match our features.
              <br />
              That's <span className="text-red-400 font-semibold">$150-300/month forever</span> vs our <span className="text-[#FFD700] font-semibold">$1,997 one-time</span>.
            </p>
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold text-xl px-12 py-8 rounded-2xl">
              Choose AIFreedomDuane Studio
            </Button>
          </div>
        </div>
      </section>

      {/* Full Platform Description */}
      <section className="py-20 px-4 bg-[#111317]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Exactly Is AIFreedomDuane Studio?
            </h2>
          </div>

          <Card className="bg-[#0B0B0C] border-gray-800 rounded-2xl">
            <CardContent className="p-8 md:p-12 space-y-8">
              
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed">
                  <span className="text-white font-bold">AIFreedomDuane Studio</span> is the world's most comprehensive 
                  AI-powered content creation and marketing automation platform. Built for creators, entrepreneurs, 
                  and agencies who want to dominate their markets.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="p-6 bg-[#111317] rounded-xl">
                    <h4 className="text-[#FFD700] font-bold text-lg mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      For Content Creators
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Create videos without filming (AI avatars)</li>
                      <li>• Turn 1 long video into 50+ short clips</li>
                      <li>• Auto-generate social posts for every platform</li>
                      <li>• Schedule weeks of content in minutes</li>
                      <li>• Track performance across all platforms</li>
                      <li>• Let AI suggest what to create next</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-[#111317] rounded-xl">
                    <h4 className="text-[#00D4C9] font-bold text-lg mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      For Agencies
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Deploy to unlimited clients (no per-client cost)</li>
                      <li>• Full white-label (your brand, your domain)</li>
                      <li>• Charge $297-997/month per client</li>
                      <li>• GoHighLevel integration built-in</li>
                      <li>• Client portal for each customer</li>
                      <li>• 80%+ profit margins on services</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-white font-bold text-2xl mt-8 mb-4">🎯 The Complete Workflow</h3>
                
                <div className="bg-[#111317] rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="text-white font-semibold mb-1">Content Creation</p>
                      <p className="text-gray-400 text-sm">
                        Create videos with AI avatars, generate images, write scripts, design graphics—all with AI
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="text-white font-semibold mb-1">Repurposing & Multiplication</p>
                      <p className="text-gray-400 text-sm">
                        Turn 1 video into 50+ assets: clips, posts, emails, blogs, quotes, audiograms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <p className="text-white font-semibold mb-1">Campaign Orchestration</p>
                      <p className="text-gray-400 text-sm">
                        AI builds multi-channel campaigns, schedules everything strategically across all platforms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <p className="text-white font-semibold mb-1">Publishing & Distribution</p>
                      <p className="text-gray-400 text-sm">
                        Auto-publish to Instagram, TikTok, YouTube, Facebook, LinkedIn, Twitter, Roku, Apple TV, Fire TV
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold flex-shrink-0">5</div>
                    <div>
                      <p className="text-white font-semibold mb-1">Performance Tracking</p>
                      <p className="text-gray-400 text-sm">
                        Real-time analytics, AI insights on what works, predictive analytics, ROI tracking
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center font-bold flex-shrink-0">6</div>
                    <div>
                      <p className="text-white font-semibold mb-1">AI Optimization</p>
                      <p className="text-gray-400 text-sm">
                        AI analyzes, suggests improvements, auto-optimizes campaigns, finds market gaps
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-white font-bold text-2xl mt-8 mb-4">💰 Business Model Flexibility</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-6 bg-[#111317] rounded-xl border border-gray-800">
                    <h4 className="text-[#FFD700] font-bold mb-3">Use It Yourself</h4>
                    <p className="text-gray-400 text-sm">
                      Build your personal content empire. Create unlimited content, grow your audience, monetize.
                    </p>
                  </div>

                  <div className="p-6 bg-[#111317] rounded-xl border border-gray-800">
                    <h4 className="text-[#00D4C9] font-bold mb-3">Sell as Service</h4>
                    <p className="text-gray-400 text-sm">
                      Offer content creation services. Charge per video, per campaign, or monthly retainers.
                    </p>
                  </div>

                  <div className="p-6 bg-[#111317] rounded-xl border border-gray-800">
                    <h4 className="text-[#9D4EDD] font-bold mb-3">White-Label SaaS</h4>
                    <p className="text-gray-400 text-sm">
                      Deploy to unlimited clients. Charge $297-997/month. Keep 100% after one-time license fee.
                    </p>
                  </div>
                </div>

                <h3 className="text-white font-bold text-2xl mt-8 mb-4">🚀 Why We're Different</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-[#111317] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">AI-First, Not AI-Afterthought</p>
                      <p className="text-gray-400 text-sm">
                        We didn't add AI to existing tools. We built everything from scratch around AI. Every feature is designed for maximum automation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-[#111317] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Complete Ecosystem, Not Point Solution</p>
                      <p className="text-gray-400 text-sm">
                        Most tools do one thing. We do everything. From ideation to creation to distribution to analytics. One platform, one login, one workflow.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-[#111317] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">One-Time Payment, Not Subscription Trap</p>
                      <p className="text-gray-400 text-sm">
                        Pay once, use forever. No monthly bleeding. No surprise price hikes. No feature gating. Competitors charge $20-100/month forever.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-[#111317] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Built for Scale & Revenue</p>
                      <p className="text-gray-400 text-sm">
                        White-label to unlimited clients. No per-user fees. No per-video fees. Deploy once, profit forever.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border border-[#FFD700]/30 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to 10X Your Content Output?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators and agencies using AI Freedom Studios
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold text-xl px-12 py-8 rounded-2xl hover:scale-105 transition-transform">
                <Rocket className="w-6 h-6 mr-3" />
                Start Free Trial
              </Button>
              <Button variant="outline" className="border-2 border-gray-700 text-white font-semibold text-xl px-8 py-8 rounded-2xl hover:bg-white hover:text-black">
                See Pricing
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              🔒 No credit card required • 🚀 Full access in 2 minutes • 💰 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}