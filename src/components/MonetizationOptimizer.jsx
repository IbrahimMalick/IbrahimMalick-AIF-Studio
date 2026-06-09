import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  TrendingUp,
  Target,
  Sparkles,
  Brain,
  Loader2,
  CheckCircle2,
  PlayCircle,
  Clock,
  Users,
  Zap,
  AlertCircle,
  Award,
  BarChart3,
  Package,
  Eye,
  ThumbsUp,
  Star,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MonetizationOptimizer({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [monetizationData, setMonetizationData] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const { data: existingMonetization } = useQuery({
    queryKey: ["monetization", project.id],
    queryFn: () => base44.entities.VideoMonetization.filter({
      video_project_id: project.id
    }),
  });

  const createMonetizationMutation = useMutation({
    mutationFn: (data) => base44.entities.VideoMonetization.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["monetization"]);
    },
  });

  const handleGenerateMonetization = async () => {
    setIsGenerating(true);
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video project and generate comprehensive monetization strategy:

PROJECT:
- Title: ${project.title}
- Description: ${project.description || 'N/A'}
- Duration: ${project.duration_seconds || 0}s

ANALYSIS DATA (if available):
- Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'Unknown'}
- Target Audience: ${project.deep_analysis_data?.genre_classification?.target_audience || 'Unknown'}
- Mood: ${project.deep_analysis_data?.emotional_tone?.primary_mood || 'Unknown'}
- Pacing: ${project.deep_analysis_data?.pacing_analysis?.overall_pace || 'Unknown'}
- Quality Score: ${project.deep_analysis_data?.quality_scores?.overall_production_value || 'N/A'}/100

Generate comprehensive monetization recommendations:

1. AD PLACEMENT OPTIMIZATION:
   - Optimal number of ads based on duration and pacing
   - Specific timestamps for ad placements
   - Ad type for each placement (pre-roll, mid-roll, post-roll, overlay, sponsored segment)
   - Duration of each ad
   - Reason for placement (natural break, scene change, low engagement point)
   - Engagement score for each placement (0-100)
   - Skip probability (0-1)
   - Revenue potential (high/medium/low)
   - Engagement prediction with/without ads
   - Estimated revenue per 1000 views

2. DYNAMIC PRICING MODEL:
   - Content value score (0-100) based on quality, uniqueness, production value
   - Recommended pricing strategy (free_with_ads, premium_only, freemium, pay_per_view, subscription, sponsored)
   - Specific price recommendations:
     * Pay-per-view price
     * Rental price (24-48 hours)
     * Purchase price (permanent access)
     * Sponsorship minimum and maximum
   - Market analysis:
     * Competitor average pricing
     * Demand level (high/medium/low)
     * Price sensitivity (high/medium/low)
   - Revenue projections for each model

3. SUBSCRIPTION TIER RECOMMENDATIONS:
   - Optimal number of tiers (2-4)
   - For each tier:
     * Tier name (descriptive and appealing)
     * Monthly price
     * Annual price (with discount)
     * Features included
     * Content access level
     * Ad experience (none/limited/standard)
     * Target audience for this tier
     * Expected conversion rate
     * Value proposition
   - Feature gating strategy
   - Bundle opportunities

4. AUDIENCE SEGMENTATION:
   - Identify 3-5 audience segments
   - For each segment:
     * Segment name
     * Size percentage
     * Willingness to pay (high/medium/low)
     * Preferred monetization model
     * Key characteristics

Provide data-driven, actionable recommendations that maximize revenue while maintaining audience satisfaction.`,
        response_json_schema: {
          type: "object",
          properties: {
            ad_placements: {
              type: "object",
              properties: {
                optimal_ad_count: { type: "number" },
                placements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp_seconds: { type: "number" },
                      ad_type: { type: "string" },
                      duration_seconds: { type: "number" },
                      reason: { type: "string" },
                      engagement_score: { type: "number" },
                      skip_probability: { type: "number" },
                      revenue_potential: { type: "string" }
                    }
                  }
                },
                engagement_prediction: {
                  type: "object",
                  properties: {
                    with_ads: { type: "number" },
                    without_ads: { type: "number" }
                  }
                },
                estimated_revenue: {
                  type: "object",
                  properties: {
                    min_usd: { type: "number" },
                    max_usd: { type: "number" },
                    per_1000_views: { type: "number" }
                  }
                }
              }
            },
            pricing_model: {
              type: "object",
              properties: {
                content_value_score: { type: "number" },
                pricing_strategy: { type: "string" },
                recommended_prices: {
                  type: "object",
                  properties: {
                    pay_per_view_usd: { type: "number" },
                    rental_price_usd: { type: "number" },
                    purchase_price_usd: { type: "number" },
                    sponsorship_min_usd: { type: "number" },
                    sponsorship_max_usd: { type: "number" }
                  }
                },
                market_analysis: {
                  type: "object",
                  properties: {
                    competitor_avg_price: { type: "number" },
                    demand_level: { type: "string" },
                    price_sensitivity: { type: "string" }
                  }
                },
                revenue_projections: {
                  type: "object",
                  properties: {
                    monthly_free_with_ads: { type: "number" },
                    monthly_premium: { type: "number" },
                    monthly_sponsorship: { type: "number" }
                  }
                }
              }
            },
            subscription_tiers: {
              type: "object",
              properties: {
                recommended_tier_count: { type: "number" },
                tiers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      tier_name: { type: "string" },
                      monthly_price_usd: { type: "number" },
                      annual_price_usd: { type: "number" },
                      features: { type: "array", items: { type: "string" } },
                      content_access: { type: "string" },
                      ad_experience: { type: "string" },
                      target_audience: { type: "string" },
                      expected_conversion_rate: { type: "number" },
                      value_proposition: { type: "string" }
                    }
                  }
                },
                feature_gating: {
                  type: "object",
                  properties: {
                    free_tier_limits: { type: "object" },
                    premium_features: { type: "array", items: { type: "string" } },
                    exclusive_content: { type: "array", items: { type: "string" } }
                  }
                },
                bundle_opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      bundle_name: { type: "string" },
                      included_tiers: { type: "array", items: { type: "string" } },
                      bundle_price_usd: { type: "number" },
                      savings_percentage: { type: "number" }
                    }
                  }
                }
              }
            },
            audience_segmentation: {
              type: "object",
              properties: {
                segments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      segment_name: { type: "string" },
                      size_percentage: { type: "number" },
                      willingness_to_pay: { type: "string" },
                      preferred_model: { type: "string" },
                      characteristics: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Save to database
      await createMonetizationMutation.mutateAsync({
        user_email: currentUser.email,
        video_project_id: project.id,
        ad_placements: analysis.ad_placements,
        pricing_model: analysis.pricing_model,
        subscription_tiers: analysis.subscription_tiers,
        audience_segmentation: analysis.audience_segmentation,
        generated_at: new Date().toISOString()
      });

      setMonetizationData(analysis);

      alert(`✅ Monetization Strategy Generated!

💰 RECOMMENDED STRATEGY: ${analysis.pricing_model.pricing_strategy.toUpperCase().replace(/_/g, ' ')}

📊 AD PLACEMENTS:
• ${analysis.ad_placements.optimal_ad_count} optimal ad spots
• Estimated: $${analysis.ad_placements.estimated_revenue.min_usd}-$${analysis.ad_placements.estimated_revenue.max_usd} per 1K views

💵 PRICING:
• Content Value Score: ${analysis.pricing_model.content_value_score}/100
• Recommended Price: $${analysis.pricing_model.recommended_prices.pay_per_view_usd}

📦 SUBSCRIPTION TIERS:
• ${analysis.subscription_tiers.recommended_tier_count} tiers recommended
• Starting at $${analysis.subscription_tiers.tiers[0].monthly_price_usd}/month

Check below for detailed breakdown!`);

    } catch (error) {
      alert("Error generating monetization strategy. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleApplyStrategy = async (strategy) => {
    setSelectedStrategy(strategy);
    alert(`✅ Strategy "${strategy}" applied to project!

Next steps:
1. Configure payment processing
2. Set up ad networks (if using ads)
3. Create subscription tiers in payment system
4. Update video distribution settings

This would integrate with your payment processor in production.`);
  };

  const getRevenuePotentialColor = (potential) => {
    const colors = {
      high: "text-green-400 bg-green-500/20",
      medium: "text-yellow-400 bg-yellow-500/20",
      low: "text-blue-400 bg-blue-500/20"
    };
    return colors[potential] || "text-gray-400 bg-gray-500/20";
  };

  const getPriceStrategyIcon = (strategy) => {
    const icons = {
      free_with_ads: Eye,
      premium_only: Award,
      freemium: Gift,
      pay_per_view: PlayCircle,
      subscription: Package,
      sponsored: TrendingUp
    };
    return icons[strategy] || DollarSign;
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#06D6A0]" />
            AI Monetization Optimizer
          </CardTitle>
          <Button
            onClick={handleGenerateMonetization}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black rounded-lg font-semibold"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Generate Strategy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!monetizationData && !existingMonetization?.[0] ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No monetization strategy generated yet</p>
            <p className="text-gray-500 text-sm">Click "Generate Strategy" to create AI-powered monetization recommendations</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              const data = monetizationData || existingMonetization[0];
              
              return (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border border-[#06D6A0]/30 rounded-xl text-center">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-[#06D6A0]" />
                      <p className="text-2xl font-bold text-white">${data.ad_placements?.estimated_revenue?.per_1000_views || 0}</p>
                      <p className="text-xs text-gray-400">Per 1K Views</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl text-center">
                      <Award className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
                      <p className="text-2xl font-bold text-white">{data.pricing_model?.content_value_score || 0}</p>
                      <p className="text-xs text-gray-400">Value Score</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-[#9D4EDD]" />
                      <p className="text-2xl font-bold text-white">{data.subscription_tiers?.recommended_tier_count || 0}</p>
                      <p className="text-xs text-gray-400">Tiers</p>
                    </div>
                  </div>

                  <Tabs defaultValue="ads" className="w-full">
                    <TabsList className="bg-[#0B0B0C] rounded-xl">
                      <TabsTrigger value="ads">Ad Placements</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                      <TabsTrigger value="tiers">Subscription Tiers</TabsTrigger>
                      <TabsTrigger value="audience">Audience</TabsTrigger>
                    </TabsList>

                    {/* Ad Placements Tab */}
                    <TabsContent value="ads">
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-[#06D6A0]" />
                            Ad Strategy Overview
                          </h4>
                          <div className="grid md:grid-cols-3 gap-3">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Optimal Ad Count</p>
                              <p className="text-white text-lg font-bold">{data.ad_placements?.optimal_ad_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Engagement Impact</p>
                              <p className="text-white text-lg font-bold">
                                {data.ad_placements?.engagement_prediction?.with_ads || 0}%
                                <span className="text-sm text-gray-500 ml-1">
                                  (vs {data.ad_placements?.engagement_prediction?.without_ads || 0}%)
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Revenue Range</p>
                              <p className="text-white text-lg font-bold">
                                ${data.ad_placements?.estimated_revenue?.min_usd || 0}-${data.ad_placements?.estimated_revenue?.max_usd || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-semibold mb-3">Recommended Ad Placements</h4>
                          <div className="space-y-3">
                            {data.ad_placements?.placements?.map((placement, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                                        {placement.ad_type.replace(/_/g, ' ').toUpperCase()}
                                      </Badge>
                                      <Badge className={`${getRevenuePotentialColor(placement.revenue_potential)} text-xs`}>
                                        {placement.revenue_potential} revenue
                                      </Badge>
                                      <Clock className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-400 text-xs">
                                        {Math.floor(placement.timestamp_seconds / 60)}:{String(placement.timestamp_seconds % 60).padStart(2, '0')}
                                      </span>
                                    </div>
                                    <p className="text-white text-sm font-medium">{placement.reason}</p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="text-xs text-gray-400">Duration</p>
                                    <p className="text-white text-sm font-bold">{placement.duration_seconds}s</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-800">
                                  <div>
                                    <p className="text-xs text-gray-500">Engagement Score</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                        <div 
                                          className="bg-[#06D6A0] h-1.5 rounded-full" 
                                          style={{ width: `${placement.engagement_score}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-white">{placement.engagement_score}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Skip Probability</p>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                        <div 
                                          className="bg-yellow-400 h-1.5 rounded-full" 
                                          style={{ width: `${placement.skip_probability * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-white">{Math.round(placement.skip_probability * 100)}%</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing">
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-bold flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-[#FFD700]" />
                              Recommended Strategy
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => handleApplyStrategy(data.pricing_model?.pricing_strategy)}
                              className="bg-[#FFD700] text-black hover:bg-[#FFC700]"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Apply Strategy
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            {(() => {
                              const StrategyIcon = getPriceStrategyIcon(data.pricing_model?.pricing_strategy);
                              return <StrategyIcon className="w-8 h-8 text-[#FFD700]" />;
                            })()}
                            <div>
                              <p className="text-2xl font-bold text-white capitalize">
                                {data.pricing_model?.pricing_strategy?.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-gray-400">Optimal for your content type and audience</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#06D6A0]" />
                              Recommended Prices
                            </h5>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-[#111317] rounded">
                                <span className="text-gray-400 text-sm">Pay-Per-View</span>
                                <span className="text-white font-bold">${data.pricing_model?.recommended_prices?.pay_per_view_usd}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-[#111317] rounded">
                                <span className="text-gray-400 text-sm">Rental (24-48h)</span>
                                <span className="text-white font-bold">${data.pricing_model?.recommended_prices?.rental_price_usd}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-[#111317] rounded">
                                <span className="text-gray-400 text-sm">Purchase</span>
                                <span className="text-white font-bold">${data.pricing_model?.recommended_prices?.purchase_price_usd}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-[#111317] rounded">
                                <span className="text-gray-400 text-sm">Sponsorship</span>
                                <span className="text-white font-bold">
                                  ${data.pricing_model?.recommended_prices?.sponsorship_min_usd}-${data.pricing_model?.recommended_prices?.sponsorship_max_usd}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-[#9D4EDD]" />
                              Market Analysis
                            </h5>
                            <div className="space-y-3">
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Competitor Avg Price</p>
                                <p className="text-white text-lg font-bold">${data.pricing_model?.market_analysis?.competitor_avg_price}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Demand Level</p>
                                <Badge className={`${
                                  data.pricing_model?.market_analysis?.demand_level === 'high' ? 'bg-green-500/20 text-green-400' :
                                  data.pricing_model?.market_analysis?.demand_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {data.pricing_model?.market_analysis?.demand_level}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Price Sensitivity</p>
                                <Badge className={`${
                                  data.pricing_model?.market_analysis?.price_sensitivity === 'high' ? 'bg-red-500/20 text-red-400' :
                                  data.pricing_model?.market_analysis?.price_sensitivity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {data.pricing_model?.market_analysis?.price_sensitivity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#00D4C9]" />
                            Monthly Revenue Projections
                          </h5>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-[#111317] rounded-lg text-center">
                              <p className="text-gray-400 text-xs mb-1">Free + Ads</p>
                              <p className="text-white text-xl font-bold">${data.pricing_model?.revenue_projections?.monthly_free_with_ads || 0}</p>
                            </div>
                            <div className="p-3 bg-[#111317] rounded-lg text-center">
                              <p className="text-gray-400 text-xs mb-1">Premium</p>
                              <p className="text-white text-xl font-bold">${data.pricing_model?.revenue_projections?.monthly_premium || 0}</p>
                            </div>
                            <div className="p-3 bg-[#111317] rounded-lg text-center">
                              <p className="text-gray-400 text-xs mb-1">Sponsorship</p>
                              <p className="text-white text-xl font-bold">${data.pricing_model?.revenue_projections?.monthly_sponsorship || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Subscription Tiers Tab */}
                    <TabsContent value="tiers">
                      <div className="space-y-4 mt-4">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-400 text-sm">
                            💡 <strong>{data.subscription_tiers?.recommended_tier_count} subscription tiers</strong> recommended for optimal conversion
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.subscription_tiers?.tiers?.map((tier, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`p-4 rounded-xl border-2 ${
                                idx === 1 ? 'border-[#FFD700] bg-gradient-to-br from-[#FFD700]/5 to-[#FF8C00]/5' : 'border-gray-800 bg-[#0B0B0C]'
                              }`}
                            >
                              {idx === 1 && (
                                <Badge className="bg-[#FFD700] text-black text-xs mb-2">
                                  <Star className="w-3 h-3 mr-1" />
                                  Most Popular
                                </Badge>
                              )}
                              
                              <h5 className="text-white font-bold text-lg mb-1">{tier.tier_name}</h5>
                              <p className="text-gray-400 text-xs mb-3">{tier.value_proposition}</p>
                              
                              <div className="mb-3">
                                <p className="text-3xl font-bold text-white mb-1">
                                  ${tier.monthly_price_usd}
                                  <span className="text-sm text-gray-400">/month</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  or ${tier.annual_price_usd}/year ({Math.round((1 - (tier.annual_price_usd / (tier.monthly_price_usd * 12))) * 100)}% off)
                                </p>
                              </div>

                              <div className="mb-3 pb-3 border-b border-gray-800">
                                <p className="text-gray-400 text-xs mb-1">Target Audience</p>
                                <p className="text-white text-sm">{tier.target_audience}</p>
                              </div>

                              <div className="space-y-2 mb-3">
                                {tier.features.map((feature, fIdx) => (
                                  <div key={fIdx} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[#06D6A0] flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-300 text-xs">{feature}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-gray-800">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Ads</span>
                                  <span className="text-white">{tier.ad_experience}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                  <span className="text-gray-500">Content Access</span>
                                  <span className="text-white">{tier.content_access}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                  <span className="text-gray-500">Expected Conversion</span>
                                  <span className="text-[#06D6A0] font-semibold">{tier.expected_conversion_rate}%</span>
                                </div>
                              </div>

                              <Button
                                className={`w-full mt-3 ${
                                  idx === 1 
                                    ? 'bg-[#FFD700] text-black hover:bg-[#FFC700]' 
                                    : 'bg-[#111317] text-white hover:bg-[#1a1a1f] border border-gray-700'
                                }`}
                                onClick={() => handleApplyStrategy(`${tier.tier_name} Tier`)}
                              >
                                Select {tier.tier_name}
                              </Button>
                            </motion.div>
                          ))}
                        </div>

                        {data.subscription_tiers?.bundle_opportunities?.length > 0 && (
                          <div>
                            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <Gift className="w-4 h-4 text-[#FF69B4]" />
                              Bundle Opportunities
                            </h5>
                            <div className="space-y-2">
                              {data.subscription_tiers.bundle_opportunities.map((bundle, idx) => (
                                <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-medium">{bundle.bundle_name}</p>
                                    <p className="text-gray-400 text-xs">Includes: {bundle.included_tiers.join(', ')}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white font-bold">${bundle.bundle_price_usd}</p>
                                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                                      Save {bundle.savings_percentage}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Audience Segmentation Tab */}
                    <TabsContent value="audience">
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#9D4EDD]" />
                            Audience Segments
                          </h5>
                          <p className="text-gray-400 text-sm mb-4">
                            Target different audience segments with tailored monetization strategies
                          </p>
                        </div>

                        <div className="space-y-3">
                          {data.audience_segmentation?.segments?.map((segment, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h6 className="text-white font-semibold text-lg mb-1">{segment.segment_name}</h6>
                                  <div className="flex gap-2 flex-wrap">
                                    <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                                      {segment.size_percentage}% of audience
                                    </Badge>
                                    <Badge className={`text-xs ${
                                      segment.willingness_to_pay === 'high' ? 'bg-green-500/20 text-green-400' :
                                      segment.willingness_to_pay === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {segment.willingness_to_pay} willingness to pay
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-3">
                                <p className="text-gray-400 text-xs mb-1">Preferred Model:</p>
                                <p className="text-white font-medium capitalize">{segment.preferred_model.replace(/_/g, ' ')}</p>
                              </div>

                              <div>
                                <p className="text-gray-400 text-xs mb-2">Characteristics:</p>
                                <div className="flex flex-wrap gap-1">
                                  {segment.characteristics.map((char, cIdx) => (
                                    <Badge key={cIdx} className="bg-[#111317] text-gray-300 text-xs">
                                      {char}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                  </Tabs>
                </>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}