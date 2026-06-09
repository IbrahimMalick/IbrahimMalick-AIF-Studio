import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, CheckCircle2, X } from "lucide-react";

export default function FeaturesPDF() {
  const allFeatures = [
    {
      category: "AI Video Creation",
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

  const comparisonData = [
    {
      category: "Core Features",
      features: [
        { name: "AI Avatar Videos", us: "✓", synthesia: "✓", descript: "✗", heygen: "✓", pictory: "✗" },
        { name: "Voice Cloning", us: "✓", synthesia: "✓", descript: "✓", heygen: "✓", pictory: "✗" },
        { name: "Auto Captions", us: "✓", synthesia: "✓", descript: "✓", heygen: "✓", pictory: "✓" },
        { name: "Video Templates", us: "100+", synthesia: "60+", descript: "Limited", heygen: "50+", pictory: "Basic" },
        { name: "Social Media AI", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Email Copy AI", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "SEO Blog Writer", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✓" }
      ]
    },
    {
      category: "Advanced AI",
      features: [
        { name: "Content Repurposing (1→50)", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✓" },
        { name: "Campaign Orchestrator", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Competitor Intelligence", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "AI Copilot Assistant", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Brand Voice Learning", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Viral Score Prediction", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Market Gap Analysis", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" }
      ]
    },
    {
      category: "Publishing & Distribution",
      features: [
        { name: "Multi-Platform Scheduling", us: "All", synthesia: "Limited", descript: "✗", heygen: "Limited", pictory: "Basic" },
        { name: "Connected TV (Roku, Apple TV)", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Meta Ads Integration", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "GoHighLevel Integration", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Auto-Publishing", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✓" },
        { name: "Content Calendar", us: "Advanced", synthesia: "Basic", descript: "✗", heygen: "Basic", pictory: "Basic" }
      ]
    },
    {
      category: "Agency & White-Label",
      features: [
        { name: "White-Label Branding", us: "Full", synthesia: "Enterprise", descript: "✗", heygen: "Enterprise", pictory: "✗" },
        { name: "Custom Domain", us: "✓", synthesia: "Enterprise", descript: "✗", heygen: "Enterprise", pictory: "✗" },
        { name: "Client Portal", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Unlimited Client Deployment", us: "✓", synthesia: "Pay per", descript: "N/A", heygen: "Pay per", pictory: "N/A" },
        { name: "Agency Dashboard", us: "✓", synthesia: "Enterprise", descript: "✗", heygen: "Enterprise", pictory: "✗" },
        { name: "Per-Client Billing", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" }
      ]
    },
    {
      category: "Analytics & Optimization",
      features: [
        { name: "Cross-Platform Analytics", us: "✓", synthesia: "Basic", descript: "✓", heygen: "Basic", pictory: "Basic" },
        { name: "AI Performance Insights", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "A/B Testing", us: "Auto", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Predictive Analytics", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Revenue Tracking", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" },
        { name: "Next-Best-Action AI", us: "✓", synthesia: "✗", descript: "✗", heygen: "✗", pictory: "✗" }
      ]
    },
    {
      category: "Pricing & Limits",
      features: [
        { name: "Pricing Model", us: "One-time $1,997", synthesia: "$22/mo", descript: "$24/mo", heygen: "$29/mo", pictory: "$23/mo" },
        { name: "Monthly Video Credits", us: "Unlimited", synthesia: "Limited", descript: "Limited", heygen: "Limited", pictory: "Limited" },
        { name: "Storage", us: "Unlimited", synthesia: "Limited", descript: "Limited", heygen: "Limited", pictory: "Limited" },
        { name: "Team Members", us: "Unlimited", synthesia: "Pay per", descript: "Pay per", heygen: "Pay per", pictory: "Limited" },
        { name: "Export Quality", us: "Up to 4K", synthesia: "1080p", descript: "4K", heygen: "1080p", pictory: "1080p" },
        { name: "Commercial License", us: "Included", synthesia: "Extra", descript: "Included", heygen: "Extra", pictory: "Extra" }
      ]
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black min-h-screen">
      
      {/* Print Button - Hidden in print */}
      <div className="no-print sticky top-0 bg-white border-b border-gray-300 p-4 z-50 flex justify-between items-center">
        <h2 className="text-xl font-bold">AI Freedom Studios - Complete Features & Comparison</h2>
        <Button onClick={handlePrint} className="bg-black text-white">
          <Printer className="w-4 h-4 mr-2" />
          Print / Save as PDF
        </Button>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-12">
        
        {/* Cover Page */}
        <div className="text-center space-y-6 pb-12 border-b-4 border-black">
          <div className="text-6xl font-bold mb-4">AI Freedom Studios</div>
          <div className="text-3xl text-gray-700">Complete Feature List & Competitor Comparison</div>
          <div className="text-xl text-gray-600 mt-8">
            140+ AI-Powered Tools in One Platform
          </div>
          <div className="text-gray-500 mt-4">
            Generated: {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">Executive Summary</h2>
          <div className="space-y-4 text-gray-800 leading-relaxed">
            <p className="text-lg">
              <strong>AIFreedomDuane Studio</strong> is the world's most comprehensive AI-powered content creation 
              and marketing automation platform. Built for creators, entrepreneurs, and agencies who want to 
              dominate their markets.
            </p>
            
            <div className="grid grid-cols-2 gap-6 my-6">
              <div className="border-2 border-black p-6">
                <h3 className="text-xl font-bold mb-3">For Content Creators</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Create videos without filming (AI avatars)</li>
                  <li>• Turn 1 long video into 50+ short clips</li>
                  <li>• Auto-generate social posts for every platform</li>
                  <li>• Schedule weeks of content in minutes</li>
                  <li>• Track performance across all platforms</li>
                  <li>• Let AI suggest what to create next</li>
                </ul>
              </div>

              <div className="border-2 border-black p-6">
                <h3 className="text-xl font-bold mb-3">For Agencies</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Deploy to unlimited clients (no per-client cost)</li>
                  <li>• Full white-label (your brand, your domain)</li>
                  <li>• Charge $297-997/month per client</li>
                  <li>• GoHighLevel integration built-in</li>
                  <li>• Client portal for each customer</li>
                  <li>• 80%+ profit margins on services</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-100 border-l-4 border-black p-6">
              <h3 className="text-xl font-bold mb-3">Key Differentiators</h3>
              <div className="space-y-3">
                <div>
                  <strong>AI-First Architecture:</strong> Built from scratch around AI, not bolted on.
                </div>
                <div>
                  <strong>Complete Ecosystem:</strong> From ideation to analytics in one platform.
                </div>
                <div>
                  <strong>One-Time Payment:</strong> $1,997 one-time vs $150-300/month forever.
                </div>
                <div>
                  <strong>Built for Scale:</strong> Unlimited clients, unlimited videos, unlimited revenue.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Feature List */}
        <div className="space-y-6 page-break-before">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Complete Feature List (140+ Tools)
          </h2>
          
          {allFeatures.map((category, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-2xl font-bold bg-gray-100 p-3 border-l-4 border-black">
                {category.category} ({category.features.length} Features)
              </h3>
              <div className="grid grid-cols-2 gap-2 pl-4">
                {category.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 py-1">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-black text-white p-6 text-center mt-8">
            <div className="text-4xl font-bold mb-2">140+ Features Total</div>
            <div className="text-lg">New features added monthly • All included • No hidden fees</div>
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="space-y-6 page-break-before">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Competitor Comparison Matrix
          </h2>
          
          <div className="text-center text-gray-600 mb-6">
            Head-to-head comparison with leading AI video and content platforms
          </div>

          {/* Competitor Headers */}
          <div className="grid grid-cols-6 gap-2 mb-4 font-bold border-b-2 border-black pb-3">
            <div>Feature</div>
            <div className="text-center bg-yellow-100 p-2 rounded">
              <div className="text-xl mb-1">🚀</div>
              <div className="text-sm">AIFreedomDuane</div>
              <div className="text-xs text-gray-600">$1,997 one-time</div>
            </div>
            <div className="text-center bg-gray-100 p-2 rounded">
              <div className="text-xl mb-1">S</div>
              <div className="text-sm">Synthesia</div>
              <div className="text-xs text-gray-600">$22/mo</div>
            </div>
            <div className="text-center bg-gray-100 p-2 rounded">
              <div className="text-xl mb-1">D</div>
              <div className="text-sm">Descript</div>
              <div className="text-xs text-gray-600">$24/mo</div>
            </div>
            <div className="text-center bg-gray-100 p-2 rounded">
              <div className="text-xl mb-1">H</div>
              <div className="text-sm">HeyGen</div>
              <div className="text-xs text-gray-600">$29/mo</div>
            </div>
            <div className="text-center bg-gray-100 p-2 rounded">
              <div className="text-xl mb-1">P</div>
              <div className="text-sm">Pictory.ai</div>
              <div className="text-xs text-gray-600">$23/mo</div>
            </div>
          </div>

          {/* Comparison Table */}
          {comparisonData.map((section, sIdx) => (
            <div key={sIdx} className="mb-8">
              <h3 className="text-xl font-bold bg-gray-200 p-3 mb-3">{section.category}</h3>
              <div className="space-y-1">
                {section.features.map((item, iIdx) => (
                  <div key={iIdx} className="grid grid-cols-6 gap-2 p-2 border-b border-gray-200 hover:bg-gray-50">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-center font-bold text-green-700">{item.us}</div>
                    <div className="text-center text-gray-600">{item.synthesia}</div>
                    <div className="text-center text-gray-600">{item.descript}</div>
                    <div className="text-center text-gray-600">{item.heygen}</div>
                    <div className="text-center text-gray-600">{item.pictory}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summary Box */}
          <div className="border-4 border-black p-6 bg-yellow-50 mt-8">
            <h3 className="text-2xl font-bold mb-4 text-center">Feature Count Summary</h3>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="border-2 border-black p-4 bg-yellow-200">
                <div className="text-4xl font-bold">140+</div>
                <div className="text-xs mt-1">AIFreedomDuane</div>
              </div>
              <div className="border-2 border-gray-400 p-4 bg-white">
                <div className="text-3xl font-bold text-gray-600">~30</div>
                <div className="text-xs mt-1">Synthesia</div>
              </div>
              <div className="border-2 border-gray-400 p-4 bg-white">
                <div className="text-3xl font-bold text-gray-600">~25</div>
                <div className="text-xs mt-1">Descript</div>
              </div>
              <div className="border-2 border-gray-400 p-4 bg-white">
                <div className="text-3xl font-bold text-gray-600">~35</div>
                <div className="text-xs mt-1">HeyGen</div>
              </div>
              <div className="border-2 border-gray-400 p-4 bg-white">
                <div className="text-3xl font-bold text-gray-600">~20</div>
                <div className="text-xs mt-1">Pictory.ai</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mt-6">
            <p className="text-center text-lg">
              <strong>The Math:</strong> You'd need to subscribe to 5-7 different tools to match our features.
              <br />
              That's <strong className="text-red-600">$150-300/month forever</strong> vs our{" "}
              <strong className="text-green-600">$1,997 one-time</strong>.
            </p>
          </div>
        </div>

        {/* Platform Capabilities */}
        <div className="space-y-6 page-break-before">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Complete Platform Workflow
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 border-l-4 border-black pl-4 py-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <div className="font-bold text-lg">Content Creation</div>
                <p className="text-gray-700">
                  Create videos with AI avatars, generate images, write scripts, design graphics—all with AI
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-l-4 border-black pl-4 py-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <div className="font-bold text-lg">Repurposing & Multiplication</div>
                <p className="text-gray-700">
                  Turn 1 video into 50+ assets: clips, posts, emails, blogs, quotes, audiograms
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-l-4 border-black pl-4 py-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <div className="font-bold text-lg">Campaign Orchestration</div>
                <p className="text-gray-700">
                  AI builds multi-channel campaigns, schedules everything strategically across all platforms
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-l-4 border-black pl-4 py-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <div className="font-bold text-lg">Publishing & Distribution</div>
                <p className="text-gray-700">
                  Auto-publish to Instagram, TikTok, YouTube, Facebook, LinkedIn, Twitter, Roku, Apple TV, Fire TV
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-l-4 border-black pl-4 py-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
              <div>
                <div className="font-bold text-lg">Performance Tracking</div>
                <p className="text-gray-700">
                  Real-time analytics, AI insights on what works, predictive analytics, ROI tracking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-l-4 border-black pl-4 py-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold flex-shrink-0">6</div>
              <div>
                <div className="font-bold text-lg">AI Optimization</div>
                <p className="text-gray-700">
                  AI analyzes, suggests improvements, auto-optimizes campaigns, finds market gaps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Models */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Business Model Flexibility
          </h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="border-2 border-gray-300 p-6">
              <h3 className="text-xl font-bold mb-3 text-center">Use It Yourself</h3>
              <p className="text-sm text-gray-700">
                Build your personal content empire. Create unlimited content, grow your audience, monetize 
                through sponsorships, products, and courses.
              </p>
              <div className="mt-4 text-center font-bold text-green-600">
                ∞ Unlimited Creation
              </div>
            </div>

            <div className="border-2 border-gray-300 p-6">
              <h3 className="text-xl font-bold mb-3 text-center">Sell as Service</h3>
              <p className="text-sm text-gray-700">
                Offer content creation services to businesses. Charge per video ($200-500), per campaign 
                ($1,000-5,000), or monthly retainers.
              </p>
              <div className="mt-4 text-center font-bold text-blue-600">
                $50K-200K/year
              </div>
            </div>

            <div className="border-2 border-gray-300 p-6">
              <h3 className="text-xl font-bold mb-3 text-center">White-Label SaaS</h3>
              <p className="text-sm text-gray-700">
                Deploy to unlimited clients at $297-997/month each. No per-client fees. 
                Keep 100% profit after one-time license.
              </p>
              <div className="mt-4 text-center font-bold text-purple-600">
                $300K-1M+/year
              </div>
            </div>
          </div>
        </div>

        {/* ROI Analysis */}
        <div className="space-y-6 page-break-before">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Return on Investment Analysis
          </h2>
          
          <div className="border-2 border-black p-6">
            <h3 className="text-xl font-bold mb-4">Cost Comparison (3 Years)</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-3 text-left">Platform</th>
                  <th className="border border-gray-400 p-3 text-right">Year 1</th>
                  <th className="border border-gray-400 p-3 text-right">Year 2</th>
                  <th className="border border-gray-400 p-3 text-right">Year 3</th>
                  <th className="border border-gray-400 p-3 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-yellow-50">
                  <td className="border border-gray-400 p-3 font-bold">AIFreedomDuane</td>
                  <td className="border border-gray-400 p-3 text-right">$1,997</td>
                  <td className="border border-gray-400 p-3 text-right">$0</td>
                  <td className="border border-gray-400 p-3 text-right">$0</td>
                  <td className="border border-gray-400 p-3 text-right font-bold text-green-600">$1,997</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-3">Competitor Stack</td>
                  <td className="border border-gray-400 p-3 text-right">$2,400</td>
                  <td className="border border-gray-400 p-3 text-right">$2,400</td>
                  <td className="border border-gray-400 p-3 text-right">$2,400</td>
                  <td className="border border-gray-400 p-3 text-right font-bold text-red-600">$7,200</td>
                </tr>
                <tr className="bg-green-50 font-bold">
                  <td className="border border-gray-400 p-3">YOUR SAVINGS</td>
                  <td className="border border-gray-400 p-3 text-right">-$403</td>
                  <td className="border border-gray-400 p-3 text-right">+$2,400</td>
                  <td className="border border-gray-400 p-3 text-right">+$2,400</td>
                  <td className="border border-gray-400 p-3 text-right text-2xl text-green-600">+$5,203</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 text-center text-gray-600">
              <em>Competitor Stack assumes: Synthesia ($22) + Descript ($24) + Jasper ($99) + Buffer ($15) + HubSpot ($50) + Canva Pro ($13) + misc tools ($77) = $200/mo average</em>
            </div>
          </div>

          <div className="bg-gray-100 p-6">
            <h3 className="text-xl font-bold mb-4">Agency ROI Model</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span>License Cost (one-time):</span>
                <span className="font-bold">$1,997</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span>Client #1 (Month 1-12 @ $497/mo):</span>
                <span className="font-bold text-green-600">+$5,964</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span>Client #2 (Month 2-12 @ $497/mo):</span>
                <span className="font-bold text-green-600">+$5,467</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span>Client #3 (Month 3-12 @ $497/mo):</span>
                <span className="font-bold text-green-600">+$4,970</span>
              </div>
              <div className="flex justify-between items-center border-b-2 border-black pb-2 pt-2">
                <span className="font-bold text-lg">Year 1 Total Revenue:</span>
                <span className="font-bold text-2xl text-green-600">$16,401</span>
              </div>
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-lg">Year 1 Profit (after license):</span>
                <span className="font-bold text-2xl text-green-600">$14,404</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-xl">ROI:</span>
                <span className="font-bold text-3xl text-green-600">721%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why We're Different */}
        <div className="space-y-6 page-break-before">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Why AI Freedom Studios is Different
          </h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-black pl-6 py-3">
              <h3 className="text-xl font-bold mb-2">🧠 AI-First, Not AI-Afterthought</h3>
              <p className="text-gray-700">
                We didn't add AI to existing tools. We built everything from scratch around AI. 
                Every feature is designed for maximum automation. Competitors retrofitted AI into legacy systems.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-3">
              <h3 className="text-xl font-bold mb-2">⚡ Complete Ecosystem, Not Point Solution</h3>
              <p className="text-gray-700">
                Most tools do one thing well. We do everything. From ideation to creation to distribution 
                to analytics. One platform, one login, one workflow. No tool-switching friction.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-3">
              <h3 className="text-xl font-bold mb-2">💰 One-Time Payment, Not Subscription Trap</h3>
              <p className="text-gray-700">
                Pay once, use forever. No monthly bleeding. No surprise price hikes. No feature gating. 
                Competitors lock you into $20-100/month forever with no ownership.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-3">
              <h3 className="text-xl font-bold mb-2">📈 Built for Scale & Revenue</h3>
              <p className="text-gray-700">
                White-label to unlimited clients. No per-user fees. No per-video fees. Deploy once, 
                profit forever. Competitors charge you more as you grow.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="space-y-6 page-break-before">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Technical Specifications
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-3">Video Capabilities</h3>
              <ul className="space-y-2 text-sm">
                <li>• Resolutions: 720p, 1080p, 4K</li>
                <li>• Aspect Ratios: 16:9, 9:16, 1:1, 4:5</li>
                <li>• Formats: MP4, MOV, WebM, GIF</li>
                <li>• Frame Rates: 24, 30, 60 FPS</li>
                <li>• Codecs: H.264, H.265, VP9</li>
                <li>• Max Duration: Unlimited</li>
                <li>• Batch Processing: Yes</li>
                <li>• Cloud Rendering: Yes</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">AI & Automation</h3>
              <ul className="space-y-2 text-sm">
                <li>• AI Models: GPT-4, Claude, Gemini</li>
                <li>• Voice: ElevenLabs, PlayHT, OpenAI</li>
                <li>• Image Gen: DALL-E, Midjourney, Stable Diffusion</li>
                <li>• Languages: 9+ supported</li>
                <li>• Processing Speed: Real-time to 2 min/video</li>
                <li>• Accuracy: 95%+ (transcription)</li>
                <li>• API Rate Limits: Enterprise-grade</li>
                <li>• Uptime: 99.9% SLA</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">Platform Integrations</h3>
              <ul className="space-y-2 text-sm">
                <li>• Social: Instagram, TikTok, YouTube, Facebook, LinkedIn, Twitter</li>
                <li>• CTV: Roku, Apple TV, Fire TV, Android TV, Samsung TV, Vizio</li>
                <li>• CRM: GoHighLevel, HubSpot</li>
                <li>• Email: Mailchimp, AWeber, ConvertKit, ActiveCampaign</li>
                <li>• Ads: Meta Ads, Google Ads, TikTok Ads</li>
                <li>• Automation: Zapier (5000+ apps)</li>
                <li>• Payments: Stripe, PayPal</li>
                <li>• Webhooks: Custom integrations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3">Security & Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li>• Encryption: AES-256 (data at rest)</li>
                <li>• TLS: 1.3 (data in transit)</li>
                <li>• Authentication: OAuth 2.0, 2FA</li>
                <li>• Compliance: SOC 2 Type II, GDPR</li>
                <li>• Backups: Daily automated</li>
                <li>• Data Residency: US & EU</li>
                <li>• Token Rotation: 90-day automatic</li>
                <li>• Audit Logs: 180-day retention</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Supported Platforms & Formats
          </h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-3">Social Media</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ Instagram (Feed, Reels, Stories)</li>
                <li>✓ TikTok</li>
                <li>✓ YouTube (Videos, Shorts)</li>
                <li>✓ Facebook (Feed, Reels, Stories)</li>
                <li>✓ LinkedIn</li>
                <li>✓ Twitter/X</li>
              </ul>
            </div>

            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-3">Connected TV</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ Roku Channel</li>
                <li>✓ Apple TV</li>
                <li>✓ Amazon Fire TV</li>
                <li>✓ Android TV</li>
                <li>✓ Samsung TV</li>
                <li>✓ Vizio SmartCast</li>
              </ul>
            </div>

            <div className="border border-gray-300 p-4">
              <h3 className="font-bold mb-3">Marketing Platforms</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ Meta Ads Manager</li>
                <li>✓ Google Ads</li>
                <li>✓ TikTok Ads</li>
                <li>✓ GoHighLevel</li>
                <li>✓ Email Platforms (4+)</li>
                <li>✓ Zapier (5000+ apps)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="space-y-6 page-break-before">
          <h2 className="text-3xl font-bold border-b-2 border-gray-300 pb-2">
            Support & Resources
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="border-2 border-gray-300 p-6">
              <h3 className="text-lg font-bold mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Email:</strong> support@aifreedomstudios.com</div>
                <div><strong>Sales:</strong> sales@aifreedomstudios.com</div>
                <div><strong>Security:</strong> security@aifreedomstudios.com</div>
                <div><strong>Website:</strong> www.aifreedomstudios.com</div>
              </div>
            </div>

            <div className="border-2 border-gray-300 p-6">
              <h3 className="text-lg font-bold mb-3">Support Channels</h3>
              <div className="space-y-2 text-sm">
                <div>• 24/7 AI Copilot Chat</div>
                <div>• Email Support (24h response)</div>
                <div>• Video Tutorial Library</div>
                <div>• Live Onboarding Sessions</div>
                <div>• Agency Partner Program</div>
                <div>• Community Forum (coming soon)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 pb-6 border-t-2 border-gray-300 text-gray-600 text-sm">
          <div className="mb-2">© 2024 AI Freedom Studios. All Rights Reserved.</div>
          <div>Presented by AI Freedom Duane</div>
          <div className="mt-4 italic">
            This document was generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white;
          }
          
          .page-break-before {
            page-break-before: always;
          }
          
          @page {
            margin: 1in;
            size: letter;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}