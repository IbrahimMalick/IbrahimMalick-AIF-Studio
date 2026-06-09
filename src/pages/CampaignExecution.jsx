
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
  Rocket,
  Sparkles,
  Loader2,
  CheckCircle2,
  Target,
  Zap,
  Play,
  Pause,
  BarChart3,
  DollarSign,
  TrendingUp,
  Eye,
  Globe,
  Clock // NEW import for Clock icon
} from "lucide-react";
import { motion } from "framer-motion";

// NEW imports for A/B testing components
import ABTestManager from "@/components/ABTestManager";
import ABTestResults from "@/components/ABTestResults";
import AutoABTestEngine from "@/components/AutoABTestEngine";

export default function CampaignExecution() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState("create"); // NEW state to control active tab
  const [selectedCampaign, setSelectedCampaign] = useState(null); // NEW state for selected campaign in A/B testing

  const [formData, setFormData] = useState({
    offer_id: "",
    metric: "CPL",
    platforms: ["meta"],
    budget: 500,
    daily_budget: 50,
    domain: "leads.aifreedomstudios.com",
    path: "/offer"
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: offers = [] } = useQuery({
    queryKey: ["offerBlueprints", user?.email],
    queryFn: () => base44.entities.OfferBlueprint.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  // Renamed funnelRuns to campaigns for clarity in A/B testing context
  const { data: campaigns = [] } = useQuery({
    queryKey: ["funnelRuns", user?.email], // QueryKey remains for fetching FunnelRun entities
    queryFn: () => base44.entities.FunnelRun.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  // Derived state for active campaigns count, used in tab trigger badge
  const activeCampaigns = campaigns.filter(f => f.status !== 'completed');

  // Fetch A/B Tests
  const { data: abTests = [] } = useQuery({
    queryKey: ["abTests", user?.email],
    queryFn: () => base44.entities.ABTest.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const generateAdsMutation = useMutation({
    mutationFn: async (data) => {
      setIsGenerating(true);

      const offer = offers.find(o => o.id === data.offer_id);
      if (!offer) throw new Error("Offer not found");

      // Generate ad variants for multiple platforms
      const adsData = await base44.integrations.Core.InvokeLLM({
        prompt: `Create 3 ad variants per platform for this offer.

OFFER:
- Product: ${offer.product}
- Audience: ${offer.audience}
- Goal: ${offer.goal}
- Buyer Type: ${offer.buyer_type}
- Offer Summary: ${offer.offer_summary}
- Value Stack: ${offer.value_stack?.join('; ')}
- CTAs: ${offer.ctas?.primary}

PARAMETERS:
- Target Metric: ${data.metric} (Cost Per Lead or Cost Per Acquisition)
- Platforms: ${data.platforms.join(', ')}

TASKS:

For EACH platform (Meta, TikTok, YouTube Shorts), create 3 distinct ad variants:

1) META ADS (3 variants):
   - Primary text (125 chars, attention-grabbing)
   - Headline (40 chars max, clear value prop)
   - Description (30 chars max, supportive detail)
   - Hook (first 3 words that stop scroll)
   - Creative notes (B-roll ideas, overlays, visual style)

2) TIKTOK ADS (3 variants):
   - Opening hook (3 seconds, pattern interrupt)
   - Story/value delivery (10 seconds)
   - CTA (final 5 seconds)
   - Creative notes (native style, trends, sounds)
   - Text overlay suggestions

3) YOUTUBE SHORTS (3 variants):
   - Hook (first 3 seconds)
   - Main content (20-30 seconds)
   - CTA (final 5 seconds)
   - Creative notes (editing style, music, pacing)

4) TARGETING HYPOTHESES:
   - 3-5 interest-based targeting ideas with rationale
   - 2-3 lookalike audience recommendations
   - Geographic targeting suggestions
   - Demographic filters

5) TEST PLAN:
   - Phase 1: Test which hooks perform best
   - Phase 2: Test winning hooks with different creatives
   - Phase 3: Test winning combos with different audiences
   - Budget allocation per phase

Each variant should be distinct and test different angles/emotions/approaches.`,
        response_json_schema: {
          type: "object",
          properties: {
            meta_ads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_number: { type: "number" },
                  primary_text: { type: "string" },
                  headline: { type: "string" },
                  description: { type: "string" },
                  hook: { type: "string" },
                  creative_notes: { type: "string" },
                  target_emotion: { type: "string" },
                  expected_ctr: { type: "number" }
                }
              }
            },
            tiktok_ads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_number: { type: "number" },
                  hook_3s: { type: "string" },
                  story_10s: { type: "string" },
                  cta_5s: { type: "string" },
                  creative_notes: { type: "string" },
                  text_overlays: { type: "array", items: { type: "string" } },
                  expected_watch_through: { type: "number" }
                }
              }
            },
            yt_shorts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_number: { type: "number" },
                  hook_3s: { type: "string" },
                  main_content: { type: "string" },
                  cta_5s: { type: "string" },
                  creative_notes: { type: "string" },
                  expected_retention: { type: "number" }
                }
              }
            },
            targeting_hypotheses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hypothesis_name: { type: "string" },
                  type: { type: "string" },
                  details: { type: "string" },
                  why_it_works: { type: "string" },
                  expected_cpl: { type: "number" }
                }
              }
            },
            test_plan: {
              type: "object",
              properties: {
                phase_1: { type: "string" },
                phase_2: { type: "string" },
                phase_3: { type: "string" },
                budget_allocation: {
                  type: "object",
                  properties: {
                    phase_1_percent: { type: "number" },
                    phase_2_percent: { type: "number" },
                    phase_3_percent: { type: "number" }
                  }
                }
              }
            }
          }
        }
      });

      setGeneratedAds(adsData);
      setIsGenerating(false);
      return adsData;
    }
  });

  const deployFunnelMutation = useMutation({
    mutationFn: async (data) => {
      setIsDeploying(true);

      const offer = offers.find(o => o.id === data.offer_id);
      if (!offer) throw new Error("Offer not found");

      // Create FunnelRun record
      const funnelRun = await base44.entities.FunnelRun.create({
        user_email: user.email,
        offer_id: data.offer_id,
        funnel_name: `${offer.product} - Campaign`,
        platforms: data.platforms,
        budget_total: data.budget,
        daily_budget: data.daily_budget,
        landing_url: `https://${data.domain}${data.path}`,
        landing_domain: data.domain,
        landing_path: data.path,
        status: "launching",
        metrics: {
          impressions: 0,
          clicks: 0,
          leads: 0,
          bookings: 0,
          sales: 0,
          spend: 0,
          revenue: 0
        }
      });

      // Simulate deployment
      setTimeout(async () => {
        await base44.entities.FunnelRun.update(funnelRun.id, {
          status: "learning",
          started_at: new Date().toISOString(),
          campaign_ids: {
            meta_campaign_id: `meta_${Date.now()}`,
            tiktok_campaign_id: data.platforms.includes('tiktok') ? `tt_${Date.now()}` : null
          },
          ghl_assets: {
            funnel_id: `ghl_fun_${Date.now()}`,
            workflow_id: `ghl_wf_${Date.now()}`,
            form_id: `ghl_form_${Date.now()}`
          }
        });

        queryClient.invalidateQueries(["funnelRuns"]);
        setIsDeploying(false);
        alert(`✅ Campaign Launched!

🎯 Landing Page: https://${data.domain}${data.path}
💰 Budget: $${data.daily_budget}/day ($${data.budget} total)
📱 Platforms: ${data.platforms.join(', ')}
🚀 Status: Learning Phase

Campaigns are now live and optimizing!`);
      }, 2000);

      return funnelRun;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["funnelRuns"]);
    }
  });

  const platforms = [
    { id: "meta", label: "Meta (FB + IG)", color: "bg-blue-500" },
    { id: "tiktok", label: "TikTok", color: "bg-black" },
    { id: "youtube", label: "YouTube", color: "bg-red-500" },
    { id: "google", label: "Google Ads", color: "bg-green-500" },
    { id: "linkedin", label: "LinkedIn", color: "bg-blue-700" }
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-[#FFD700]" />
            Campaign Execution
          </h1>
          <p className="text-gray-400">Generate ad variants and deploy multi-platform campaigns</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}> {/* Controlled Tabs component */}
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="create"> {/* Changed "generate" to "create" */}
              <Sparkles className="w-4 h-4 mr-2" />
              Create Campaign
            </TabsTrigger>
            <TabsTrigger value="active">
              <BarChart3 className="w-4 h-4 mr-2" />
              Active Campaigns ({activeCampaigns.length}) {/* Using activeCampaigns for count */}
            </TabsTrigger>
            <TabsTrigger value="abtesting"> {/* NEW Tab Trigger */}
              <Target className="w-4 h-4 mr-2" />
              A/B Testing
            </TabsTrigger>
            <TabsTrigger value="history"> {/* NEW Tab Trigger */}
              <Clock className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Create Campaign Tab (formerly Generate Ads Tab) */}
          <TabsContent value="create"> {/* Changed "generate" to "create" */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Form */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Generate Ad Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Select Offer *</label>
                    <Select
                      value={formData.offer_id}
                      onValueChange={(value) => {
                        setFormData({...formData, offer_id: value});
                        setSelectedOffer(offers.find(o => o.id === value));
                      }}
                    >
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue placeholder="Choose an offer" />
                      </SelectTrigger>
                      <SelectContent>
                        {offers.map(offer => (
                          <SelectItem key={offer.id} value={offer.id}>
                            {offer.product}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Optimization Metric</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "CPL", label: "Cost Per Lead" },
                        { value: "CPA", label: "Cost Per Acquisition" }
                      ].map(metric => (
                        <label
                          key={metric.value}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.metric === metric.value
                              ? 'border-[#FFD700] bg-[#FFD700]/10'
                              : 'border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="metric"
                            value={metric.value}
                            checked={formData.metric === metric.value}
                            onChange={(e) => setFormData({...formData, metric: e.target.value})}
                            className="sr-only"
                          />
                          <p className="text-white text-center font-medium text-sm">{metric.label}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Target Platforms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map(platform => {
                        const isSelected = formData.platforms.includes(platform.id);
                        return (
                          <label
                            key={platform.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#00D4C9] bg-[#00D4C9]/10'
                                : 'border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, platforms: [...formData.platforms, platform.id]});
                                } else {
                                  setFormData({...formData, platforms: formData.platforms.filter(p => p !== platform.id)});
                                }
                              }}
                              className="sr-only"
                            />
                            <p className={`text-sm text-center ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                              {platform.label}
                            </p>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => generateAdsMutation.mutate(formData)}
                    disabled={isGenerating || !formData.offer_id}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-bold h-14"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Ad Variants...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Ad Variants
                      </>
                    )}
                  </Button>

                </CardContent>
              </Card>

              {/* Generated Ads Preview */}
              {generatedAds && (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Generated Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                    
                    {/* Meta Ads */}
                    {generatedAds.meta_ads?.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400">Meta</Badge>
                          ({generatedAds.meta_ads.length} variants)
                        </h4>
                        <div className="space-y-2">
                          {generatedAds.meta_ads.map((ad, idx) => (
                            <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-gray-700 text-gray-300 text-xs">
                                  Variant {ad.variant_number}
                                </Badge>
                                <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                                  Est. CTR: {ad.expected_ctr}%
                                </Badge>
                              </div>
                              <p className="text-white text-sm font-medium mb-1">{ad.headline}</p>
                              <p className="text-gray-400 text-xs mb-2">{ad.primary_text}</p>
                              <p className="text-gray-500 text-xs">
                                <strong className="text-[#FFD700]">Hook:</strong> {ad.hook}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TikTok Ads */}
                    {generatedAds.tiktok_ads?.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Badge className="bg-gray-900 text-white border border-gray-700">TikTok</Badge>
                          ({generatedAds.tiktok_ads.length} variants)
                        </h4>
                        <div className="space-y-2">
                          {generatedAds.tiktok_ads.map((ad, idx) => (
                            <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                              <Badge className="bg-gray-700 text-gray-300 text-xs mb-2">
                                Variant {ad.variant_number}
                              </Badge>
                              <div className="space-y-1 text-xs">
                                <p className="text-white">
                                  <strong className="text-[#FFD700]">Hook (0-3s):</strong> {ad.hook_3s}
                                </p>
                                <p className="text-gray-400">
                                  <strong className="text-[#00D4C9]">Story (3-13s):</strong> {ad.story_10s}
                                </p>
                                <p className="text-gray-400">
                                  <strong className="text-green-400">CTA (13-18s):</strong> {ad.cta_5s}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Plan */}
                    {generatedAds.test_plan && (
                      <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#9D4EDD]" />
                          Test Plan
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300">
                            <strong className="text-[#FFD700]">Phase 1:</strong> {generatedAds.test_plan.phase_1}
                          </p>
                          <p className="text-gray-300">
                            <strong className="text-[#00D4C9]">Phase 2:</strong> {generatedAds.test_plan.phase_2}
                          </p>
                          <p className="text-gray-300">
                            <strong className="text-green-400">Phase 3:</strong> {generatedAds.test_plan.phase_3}
                          </p>
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              )}

            </div>
          </TabsContent>

          {/* Active Campaigns Tab */}
          <TabsContent value="active">
            <div className="space-y-4">
              {campaigns.length > 0 ? (
                campaigns.map((funnel) => (
                  <motion.div
                    key={funnel.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-bold text-lg mb-1">{funnel.funnel_name}</h3>
                            <p className="text-gray-400 text-sm">
                              <Globe className="w-3 h-3 inline mr-1" />
                              {funnel.landing_url}
                            </p>
                          </div>
                          <Badge className={
                            funnel.status === 'learning' ? 'bg-yellow-500/20 text-yellow-400' :
                            funnel.status === 'scaling' ? 'bg-green-500/20 text-green-400' :
                            funnel.status === 'paused' || funnel.status === 'completed' ? 'bg-gray-500/20 text-gray-400' : // Added completed status style
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {funnel.status}
                          </Badge>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <Eye className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-white font-bold text-sm">{funnel.metrics?.impressions?.toLocaleString() || 0}</p>
                            <p className="text-gray-500 text-xs">Impressions</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <Target className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-white font-bold text-sm">{funnel.metrics?.leads || 0}</p>
                            <p className="text-gray-500 text-xs">Leads</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <DollarSign className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-white font-bold text-sm">${funnel.metrics?.spend || 0}</p>
                            <p className="text-gray-500 text-xs">Spent</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-green-400 font-bold text-sm">
                              {funnel.metrics?.roas?.toFixed(1) || 0}x
                            </p>
                            <p className="text-gray-500 text-xs">ROAS</p>
                          </div>
                        </div>

                        {/* Funnel Metrics */}
                        {funnel.metrics && (
                          <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                            <div className="grid grid-cols-5 gap-2 text-xs text-center">
                              <div>
                                <p className="text-gray-400 mb-1">Ad CTR</p>
                                <p className="text-white font-bold">{funnel.metrics.ad_ctr?.toFixed(1) || 0}%</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-1">LP CVR</p>
                                <p className="text-white font-bold">{funnel.metrics.lp_cvr?.toFixed(1) || 0}%</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-1">Booking</p>
                                <p className="text-white font-bold">{funnel.metrics.opt_in_to_booking?.toFixed(1) || 0}%</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-1">Show</p>
                                <p className="text-white font-bold">{funnel.metrics.show_rate?.toFixed(1) || 0}%</p>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-1">Close</p>
                                <p className="text-white font-bold">{funnel.metrics.close_rate?.toFixed(1) || 0}%</p>
                              </div>
                            </div>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No campaigns launched yet.</p>
                    <p className="text-gray-500 text-sm mt-2">Deploy your first funnel to get started</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* A/B Testing Tab - NEW */}
          <TabsContent value="abtesting">
            <div className="space-y-6">
              
              {user && campaigns.length > 0 && (
                <AutoABTestEngine user={user} campaigns={campaigns} />
              )}

              {/* Active Tests */}
              {abTests.filter(t => t.status === 'running' || t.status === 'paused').length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg">Active Tests</h3>
                  {abTests.filter(t => t.status === 'running' || t.status === 'paused').map(test => (
                    <ABTestResults
                      key={test.id}
                      test={test}
                      user={user}
                      onTestUpdated={() => {
                        queryClient.invalidateQueries(["abTests"]);
                      }}
                    />
                  ))}
                </div>
              ) : null}

              {/* Create New Test */}
              {user && selectedCampaign && (
                <>
                  <h3 className="text-white font-bold text-lg">Create New A/B Test for "{selectedCampaign.funnel_name}"</h3>
                  <ABTestManager
                    user={user}
                    campaignRun={selectedCampaign}
                    onTestCreated={(test) => {
                      queryClient.invalidateQueries(["abTests"]);
                      alert("Test created successfully!");
                    }}
                  />
                </>
              )}

              {!selectedCampaign && campaigns.length > 0 && (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-4">Select a campaign to create A/B test</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {campaigns.slice(0, 5).map(campaign => (
                        <Button
                          key={campaign.id}
                          onClick={() => setSelectedCampaign(campaign)}
                          variant="outline"
                          className="border-gray-700 text-white"
                        >
                          {campaign.funnel_name} {/* Using funnel_name property */}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {campaigns.length === 0 && (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No campaigns to test</p>
                    <p className="text-gray-500 text-sm mb-4">Create your first campaign to enable A/B testing</p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                    >
                      Create Campaign
                    </Button>
                  </CardContent>
                </Card>
              )}

            </div>
          </TabsContent>

          {/* History Tab - NEW */}
          <TabsContent value="history">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Campaign history coming soon!</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for past campaign performance and insights.</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
