
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  Target,
  Zap,
  TrendingUp,
  Video,
  Brain,
  Tv
} from "lucide-react";
import { useI18n } from "@/components/I18nProvider";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      
      {/* Comparison Matrix Hero */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#FFD700]/5 via-[#0C0C0C] to-[#00D4C9]/5 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-[#FFD700]/20 text-[#FFD700] mb-4 text-sm px-4 py-2">
              <Target className="w-3 h-3 mr-1" />
              Competitive Analysis
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-4">
              {t('hero_title')}
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('hero_sub')}
            </p>
          </div>

          {/* Comparison Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-[#111317] rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-[#FFD700]/20 to-[#FF8C00]/20 border-b border-gray-700">
                  <th className="p-4 text-left text-white font-bold text-sm">Feature</th>
                  <th className="p-4 text-center bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-sm">
                    AI Freedom
                  </th>
                  <th className="p-4 text-center text-gray-400 font-semibold text-sm">Synthesia</th>
                  <th className="p-4 text-center text-gray-400 font-semibold text-sm">ClickFunnels</th>
                  <th className="p-4 text-center text-gray-400 font-semibold text-sm">HubSpot</th>
                  <th className="p-4 text-center text-gray-400 font-semibold text-sm">Descript</th>
                  <th className="p-4 text-center text-gray-400 font-semibold text-sm">Jasper</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI Avatar Videos", "✅ Full", "✅ Core", "❌", "❌", "⚠️ Overdub", "❌"],
                  ["Marketing Funnels", "✅ Full", "❌", "✅ Core", "✅ Advanced", "❌", "❌"],
                  ["AI Copywriting", "✅ Full", "⚠️ Basic", "⚠️ Basic", "⚠️ Basic", "❌", "✅ Core"],
                  ["Belief Scoring", "✅ Unique", "❌", "❌", "❌", "❌", "❌"],
                  ["Multi-Channel Sequences", "✅ 10-touch", "❌", "⚠️ Email", "✅ Advanced", "❌", "❌"],
                  ["Ad Deployment", "✅ Meta/TikTok/YouTube", "❌", "❌", "⚠️ Limited", "❌", "❌"],
                  ["Budget Optimization", "✅ AI-powered", "❌", "❌", "❌", "❌", "❌"],
                  ["CTV Publishing", "✅ 6 platforms", "❌", "❌", "❌", "❌", "❌"],
                  ["White-Label", "✅ $297–$997/mo", "✅ $10k+/yr", "✅ $297/mo", "❌", "❌", "❌"],
                  ["GHL Integration", "✅ Bi-directional", "❌", "⚠️ Zapier", "✅ Native", "❌", "⚠️ Zapier"],
                  ["AI Copilot", "✅ Intent-based", "❌", "❌", "⚠️ ChatSpot", "❌", "⚠️ Chat"]
                ].map((row, idx) => {
                  const getCellContent = (cell, colIdx) => {
                    if (cell === "❌") return <X className="w-5 h-5 text-red-400 mx-auto" />;
                    if (cell.startsWith("✅")) {
                      const text = cell.replace("✅ ", "");
                      return (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className={colIdx === 1 ? "text-white font-bold" : "text-gray-300 text-sm"}>
                            {text}
                          </span>
                        </div>
                      );
                    }
                    if (cell.startsWith("⚠️")) {
                      const text = cell.replace("⚠️ ", "");
                      return (
                        <div className="flex items-center justify-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          <span className="text-gray-300 text-sm">{text}</span>
                        </div>
                      );
                    }
                    return <span className="text-white">{cell}</span>;
                  };

                  return (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-[#0B0B0C] transition-colors">
                      <td className="p-4 text-white font-medium text-sm">{row[0]}</td>
                      {row.slice(1).map((cell, colIdx) => (
                        <td 
                          key={colIdx} 
                          className={`p-4 text-center ${colIdx === 0 ? 'bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10' : ''}`}
                        >
                          {getCellContent(cell, colIdx)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            ⚖️ Comparisons reflect feature scope, not brand value. Logos/trademarks belong to their respective owners.
          </p>

          <div className="flex justify-center gap-4 mt-8">
            <Link to={createPageUrl("MarketingSuite")}>
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg px-8 py-6 h-auto rounded-xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Marketing Suite
              </Button>
            </Link>
            <Link to={createPageUrl("AgencyAccelerator")}>
              <Button variant="outline" className="border-gray-700 text-white text-lg px-8 py-6 h-auto rounded-xl">
                <TrendingUp className="w-5 h-5 mr-2" />
                Agency Accelerator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Complete Marketing Operating System
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to scale from $0 to $50k/mo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Content Creation */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700] transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Content Creation</h3>
                <p className="text-gray-400 text-sm mb-4">
                  AI videos, avatars, scripts, art, voice cloning, and CTV content
                </p>
                <div className="space-y-2">
                  <Link to={createPageUrl("VideoStudio")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      Video Studio
                    </Button>
                  </Link>
                  <Link to={createPageUrl("CTVStudio")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      <Tv className="w-4 h-4 mr-2" />
                      CTV Studio
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Avatars")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      Avatar Videos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Marketing & Sales */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#00D4C9] transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Marketing & Sales</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Offers, funnels, sequences, ads, and budget automation
                </p>
                <div className="space-y-2">
                  <Link to={createPageUrl("OfferBuilder")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      Offer Builder
                    </Button>
                  </Link>
                  <Link to={createPageUrl("FollowUpBuilder")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      Follow-Up Sequences
                    </Button>
                  </Link>
                  <Link to={createPageUrl("CampaignExecution")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      Campaign Execution
                    </Button>
                  </Link>
                  <Link to={createPageUrl("BudgetManager")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      Budget Manager
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* AI Automation */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#9D4EDD] transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">AI Automation</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Copilot, analytics, NBA suggestions, and optimization
                </p>
                <div className="space-y-2">
                  <Link to={createPageUrl("AICopilot")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      AI Copilot
                    </Button>
                  </Link>
                  <Link to={createPageUrl("FunnelAnalyticsNBA")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      Funnel Analytics & NBA
                    </Button>
                  </Link>
                  <Link to={createPageUrl("AIOptimization")}>
                    <Button variant="outline" className="w-full border-gray-700 text-white justify-start">
                      AI Optimization
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Unique Advantages */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              🏆 What Makes Us Different
            </h2>
            <p className="text-gray-400 text-lg">
              Features no competitor has
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-white font-bold mb-2">Belief-Alignment Scoring</h3>
                <p className="text-gray-400 text-sm">
                  Proprietary 8-factor framework scores offers 0-100 with specific improvements
                </p>
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] mt-3 text-xs">
                  Patent Pending
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 border-2 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">10-Touch Multi-Channel</h3>
                <p className="text-gray-400 text-sm">
                  Email, SMS, DM, and Voice sequences with smart branching logic
                </p>
                <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] mt-3 text-xs">
                  GHL Compatible
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#6F1AB1]/10 to-[#A64EE7]/10 border-[#6F1AB1]/30 border-2 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] flex items-center justify-center mx-auto mb-4">
                  <Tv className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">CTV Publishing</h3>
                <p className="text-gray-400 text-sm">
                  Publish to Roku, Apple TV, Fire TV, Android TV, Samsung, Vizio
                </p>
                <Badge className="bg-[#6F1AB1]/20 text-[#A64EE7] mt-3 text-xs">
                  Industry First
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 border-2 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">Next Best Action AI</h3>
                <p className="text-gray-400 text-sm">
                  AI analyzes funnels and provides ranked optimization actions
                </p>
                <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] mt-3 text-xs">
                  Auto-Optimization
                </Badge>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-16 px-4 bg-[#111317]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              💰 Pricing That Actually Makes Sense
            </h2>
            <p className="text-gray-400 text-lg">
              All-in-one platform vs buying 8+ separate tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            {/* Competitor Stack Cost */}
            <Card className="bg-[#0B0B0C] border-red-500/30 border-2 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-400" />
                  Traditional Tool Stack
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">Synthesia (Avatar Videos)</span>
                    <span className="text-white font-bold">$89/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">ClickFunnels (Funnels)</span>
                    <span className="text-white font-bold">$147/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">Jasper (AI Copy)</span>
                    <span className="text-white font-bold">$59/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">ActiveCampaign (Email)</span>
                    <span className="text-white font-bold">$49/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">Hootsuite (Social)</span>
                    <span className="text-white font-bold">$99/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">Descript (Video Editor)</span>
                    <span className="text-white font-bold">$24/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">Zapier (Automation)</span>
                    <span className="text-white font-bold">$29/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#111317] rounded-lg">
                    <span className="text-gray-300 text-sm">GoHighLevel (CRM)</span>
                    <span className="text-white font-bold">$97/mo</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-bold text-lg">Total Monthly Cost:</span>
                    <span className="text-red-400 font-bold text-3xl">$593/mo</span>
                  </div>
                  <p className="text-red-400/60 text-xs mt-2">Plus integration headaches & data silos</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Freedom Studios */}
            <Card className="bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 border-[#FFD700] border-2 rounded-2xl">
              <CardContent className="p-6">
                <Badge className="bg-[#FFD700] text-black mb-4">RECOMMENDED</Badge>
                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  AI Freedom Studios
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Everything in Traditional Stack</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Belief-Alignment Scoring (Unique)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">CTV Publishing (6 platforms)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">AI Copilot with Intent Detection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Smart Budget Allocation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">White-Label Agency Platform</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">GHL Bi-Directional Sync</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">All future updates included</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[#FFD700]/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-bold text-lg">Your Price:</span>
                    <div className="text-right">
                      <span className="text-green-400 font-bold text-4xl">$297</span>
                      <span className="text-gray-400 text-sm">/mo</span>
                    </div>
                  </div>
                  <p className="text-green-400/60 text-xs text-right">
                    Save $296/mo (50% less)
                  </p>
                </div>
                <Link to={createPageUrl("Dashboard")}>
                  <Button className="w-full mt-4 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold h-12 text-lg rounded-xl">
                    Get Started Now →
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              💡 <strong className="text-gray-400">Agency Pricing:</strong> Base $297/mo + 15% of ad spend (typical: $500-$3,000/mo total)
            </p>
            <Link to={createPageUrl("AgencyAccelerator")}>
              <Button variant="link" className="text-[#00D4C9] mt-2">
                View Agency Revenue Calculator →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Backend Integration Notes */}
      <section className="py-16 px-4 bg-[#111317]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              🛠️ Backend Integration Ready
            </h2>
            <p className="text-gray-400 text-lg">
              RESTful APIs for headless deployment
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {[
              {
                title: "Offer Scoring API",
                endpoint: "POST /api/v1/offer/score",
                desc: "Score marketing offers with 8-factor belief alignment",
                example: { product: "AI Video Studio", buyer_type: "Analyst" }
              },
              {
                title: "Follow-Up Generator",
                endpoint: "POST /api/v1/followup/generate",
                desc: "Create 10-touch sequences with branching logic",
                example: { offer_id: "off_123", voice: "mentor", days: 14 }
              },
              {
                title: "Ad Creative Generator",
                endpoint: "POST /api/v1/ads/generate",
                desc: "Generate Meta/TikTok/YouTube ad variants",
                example: { offer_id: "off_123", metric: "CPL" }
              },
              {
                title: "Funnel Deployment",
                endpoint: "POST /api/v1/funnel/deploy",
                desc: "Deploy landing pages + sequences to GHL",
                example: { offer_id: "off_123", platforms: ["meta"], budget: 500 }
              },
              {
                title: "NBA Analytics",
                endpoint: "POST /api/v1/analytics/nba",
                desc: "Get AI next-best-action suggestions",
                example: { funnel_run_id: "fr_55" }
              },
              {
                title: "Budget Optimization",
                endpoint: "POST /api/v1/budget/optimize",
                desc: "AI rebalances budget based on ROAS",
                example: { plan_id: "bp_123", metrics: { roas: 2.5, cpl: 30 } }
              }
            ].map((api, idx) => (
              <Card key={idx} className="bg-[#0B0B0C] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <Badge className="bg-green-500/20 text-green-400 text-xs mb-3">
                    {api.endpoint.split(" ")[0]}
                  </Badge>
                  <h3 className="text-white font-bold mb-2">{api.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{api.desc}</p>
                  <code className="block text-xs bg-black/40 border border-gray-800 rounded p-2 text-[#00D4C9] font-mono">
                    {api.endpoint}
                  </code>
                  <pre className="text-xs bg-black/40 border border-gray-800 rounded p-2 mt-2 text-gray-300 font-mono overflow-x-auto">
                    {JSON.stringify(api.example, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}

          </div>

          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
            <p className="text-blue-400 text-sm mb-4">
              🔐 <strong>Authentication:</strong> Include JWT token in Authorization header: <code className="bg-black/30 px-2 py-1 rounded text-[#00D4C9]">Bearer YOUR_TOKEN</code>
            </p>
            <p className="text-gray-400 text-xs">
              Rate Limits: 100 req/min (Standard), 1000 req/min (Enterprise)
            </p>
            <Link to={createPageUrl("CopilotGuide")}>
              <Button className="mt-4 bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black font-bold">
                View Complete API Documentation →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Scale?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join creators and agencies generating $10k-$50k/mo with AI automation
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg px-8 py-6 h-auto rounded-xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link to={createPageUrl("AgencyAccelerator")}>
              <Button variant="outline" className="border-gray-700 text-white text-lg px-8 py-6 h-auto rounded-xl">
                <TrendingUp className="w-5 h-5 mr-2" />
                Agency Program
              </Button>
            </Link>
            <Link to={createPageUrl("MarketingSuite")}>
              <Button variant="outline" className="border-gray-700 text-white text-lg px-8 py-6 h-auto rounded-xl">
                View All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
