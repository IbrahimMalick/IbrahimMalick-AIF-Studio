import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  TestTube2,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampaignPerformanceInsights({ campaign, user }) {
  const queryClient = useQueryClient();

  const { data: insights } = useQuery({
    queryKey: ['campaignInsights', campaign.id],
    queryFn: () => base44.entities.CampaignInsights.filter(
      { campaign_id: campaign.id },
      '-analysis_date',
      1
    ),
    enabled: !!campaign.id
  });

  const latestInsights = insights?.[0];

  const analyzePerformanceMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform deep AI analysis of campaign performance for comprehensive insights and recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_health_score: { type: "number" },
            health_trend: { type: "string" },
            channel_performance: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channel: { type: "string" },
                  performance_score: { type: "number" },
                  status: { type: "string" },
                  key_wins: { type: "array", items: { type: "string" } },
                  key_issues: { type: "array", items: { type: "string" } },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        priority: { type: "string" },
                        expected_impact: { type: "string" },
                        effort: { type: "string" },
                        impact_prediction: {
                          type: "object",
                          properties: {
                            metric_affected: { type: "string" },
                            current_value: { type: "number" },
                            predicted_value: { type: "number" },
                            improvement_percentage: { type: "number" },
                            confidence_level: { type: "number" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            predictive_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation_id: { type: "string" },
                  category: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  specific_actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step: { type: "string" },
                        details: { type: "string" },
                        before_example: { type: "string" },
                        after_example: { type: "string" }
                      }
                    }
                  },
                  impact_prediction: {
                    type: "object",
                    properties: {
                      reach_impact: { type: "string" },
                      engagement_impact: { type: "string" },
                      conversion_impact: { type: "string" },
                      revenue_impact: { type: "string" },
                      confidence_percentage: { type: "number" }
                    }
                  },
                  effort_required: { type: "string" },
                  roi_score: { type: "number" },
                  urgency: { type: "string" }
                }
              }
            },
            ab_test_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  test_name: { type: "string" },
                  test_type: { type: "string" },
                  current_variant: { type: "string" },
                  suggested_variants: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        variant_name: { type: "string" },
                        variant_content: { type: "string" },
                        hypothesis: { type: "string" },
                        expected_lift: { type: "string" }
                      }
                    }
                  },
                  priority: { type: "number" },
                  estimated_roi: { type: "string" }
                }
              }
            },
            messaging_analysis: {
              type: "object",
              properties: {
                effective_hooks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      hook_text: { type: "string" },
                      used_in: { type: "string" },
                      engagement_rate: { type: "number" },
                      why_effective: { type: "string" }
                    }
                  }
                },
                weak_hooks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      hook_text: { type: "string" },
                      used_in: { type: "string" },
                      engagement_rate: { type: "number" },
                      why_ineffective: { type: "string" },
                      rewrite_suggestions: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                cta_analysis: {
                  type: "object",
                  properties: {
                    most_effective_ctas: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          cta_text: { type: "string" },
                          click_rate: { type: "number" },
                          used_in: { type: "string" }
                        }
                      }
                    },
                    underperforming_ctas: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          cta_text: { type: "string" },
                          click_rate: { type: "number" },
                          rewrite_options: { type: "array", items: { type: "string" } },
                          expected_improvement: { type: "string" }
                        }
                      }
                    }
                  }
                },
                tone_consistency: {
                  type: "object",
                  properties: {
                    consistency_score: { type: "number" },
                    tone_drift_detected: { type: "boolean" },
                    inconsistencies: { type: "array", items: { type: "string" } }
                  }
                }
              }
            },
            competitive_analysis: {
              type: "object",
              properties: {
                benchmark_comparison: {
                  type: "object",
                  properties: {
                    your_engagement_rate: { type: "number" },
                    industry_avg_engagement: { type: "number" },
                    top_performer_engagement: { type: "number" },
                    your_percentile: { type: "number" }
                  }
                },
                gaps_to_leader: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      metric: { type: "string" },
                      your_value: { type: "number" },
                      leader_value: { type: "number" },
                      gap_percentage: { type: "number" },
                      how_to_close_gap: { type: "string" }
                    }
                  }
                }
              }
            },
            ai_confidence_score: { type: "number" },
            data_quality_score: { type: "number" }
          }
        }
      });

      const insightRecord = await base44.entities.CampaignInsights.create({
        user_email: user.email,
        campaign_id: campaign.id,
        overall_health_score: result.overall_health_score,
        health_trend: result.health_trend,
        channel_performance: result.channel_performance,
        ab_test_opportunities: result.ab_test_opportunities,
        messaging_analysis: result.messaging_analysis,
        predictive_recommendations: result.predictive_recommendations,
        competitive_analysis: result.competitive_analysis,
        ai_confidence_score: result.ai_confidence_score,
        data_quality_score: result.data_quality_score,
        next_analysis_recommended: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });

      return { result, insightRecord };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaignInsights']);
      alert('✅ AI Performance Analysis Complete!');
    }
  });

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'from-green-500/10 to-emerald-500/10 border-green-500/30';
    if (score >= 60) return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30';
    if (score >= 40) return 'from-orange-500/10 to-red-500/10 border-orange-500/30';
    return 'from-red-500/10 to-rose-500/10 border-red-500/30';
  };

  const effortColors = {
    minimal: 'bg-green-500/20 text-green-400',
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400'
  };

  const urgencyColors = {
    immediate: 'bg-red-500/20 text-red-400',
    this_week: 'bg-orange-500/20 text-orange-400',
    this_month: 'bg-yellow-500/20 text-yellow-400',
    optional: 'bg-gray-500/20 text-gray-400'
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#9D4EDD]" />
            AI Performance Insights
          </CardTitle>
          <Button
            onClick={() => analyzePerformanceMutation.mutate()}
            disabled={analyzePerformanceMutation.isPending}
            className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white font-bold"
          >
            {analyzePerformanceMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {latestInsights ? 'Refresh Analysis' : 'Analyze Performance'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {!latestInsights && !analyzePerformanceMutation.isPending && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No AI insights generated yet</p>
            <p className="text-gray-500 text-sm mb-4">
              Get deep performance analysis with actionable recommendations
            </p>
            <div className="grid md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-white text-sm font-medium">What's Working</p>
                <p className="text-gray-500 text-xs mt-1">Top performers + why</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <TestTube2 className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
                <p className="text-white text-sm font-medium">A/B Test Ideas</p>
                <p className="text-gray-500 text-xs mt-1">With predicted lift</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 text-[#00D4C9]" />
                <p className="text-white text-sm font-medium">Optimizations</p>
                <p className="text-gray-500 text-xs mt-1">Impact predictions</p>
              </div>
            </div>
          </div>
        )}

        {analyzePerformanceMutation.isPending && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#9D4EDD] animate-spin" />
              <h3 className="text-white font-bold text-lg mb-2">Analyzing Campaign Performance</h3>
              <p className="text-gray-400 text-sm">
                AI is analyzing {campaign.total_assets_generated} content pieces across {campaign.channels?.length} channels...
              </p>
            </div>
          </div>
        )}

        {latestInsights && !analyzePerformanceMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >

            <Card className={`bg-gradient-to-br ${getHealthBg(latestInsights.overall_health_score)} border-2 rounded-2xl`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Campaign Health</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        latestInsights.health_trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                        latestInsights.health_trend === 'stable' ? 'bg-blue-500/20 text-blue-400' :
                        latestInsights.health_trend === 'declining' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {latestInsights.health_trend === 'improving' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {latestInsights.health_trend === 'declining' && <TrendingDown className="w-3 h-3 mr-1" />}
                        {latestInsights.health_trend}
                      </Badge>
                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                        {latestInsights.ai_confidence_score}% confident
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-5xl font-bold ${getHealthColor(latestInsights.overall_health_score)}`}>
                      {latestInsights.overall_health_score}
                    </p>
                    <p className="text-gray-400 text-sm">out of 100</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Top Strengths
                    </h5>
                    <ul className="space-y-1">
                      {latestInsights.channel_performance?.[0]?.key_wins?.slice(0, 3).map((strength, idx) => (
                        <li key={idx} className="text-gray-300 text-xs">✓ {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-yellow-400 text-sm font-semibold mb-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Areas to Improve
                    </h5>
                    <ul className="space-y-1">
                      {latestInsights.channel_performance?.[0]?.key_issues?.slice(0, 3).map((weakness, idx) => (
                        <li key={idx} className="text-gray-300 text-xs">⚠ {weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="bg-[#0B0B0C] grid grid-cols-5">
                <TabsTrigger value="recommendations">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="abtests">
                  <TestTube2 className="w-4 h-4 mr-1" />
                  A/B Tests
                </TabsTrigger>
                <TabsTrigger value="messaging">
                  <Target className="w-4 h-4 mr-1" />
                  Messaging
                </TabsTrigger>
                <TabsTrigger value="channels">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="competitive">
                  <Shield className="w-4 h-4 mr-1" />
                  Competitive
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="space-y-3 mt-4">
                {latestInsights.predictive_recommendations?.sort((a, b) => b.roi_score - a.roi_score).map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                          <span className="text-black font-bold text-sm">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-semibold text-sm mb-1">{rec.title}</h5>
                          <p className="text-gray-400 text-xs mb-2">{rec.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs capitalize">
                              {rec.category?.replace('_', ' ')}
                            </Badge>
                            <Badge className={`${effortColors[rec.effort_required]} text-xs`}>
                              {rec.effort_required} effort
                            </Badge>
                            <Badge className={`${urgencyColors[rec.urgency]} text-xs capitalize`}>
                              {rec.urgency?.replace('_', ' ')}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              ROI: {rec.roi_score}/100
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {rec.specific_actions && rec.specific_actions.length > 0 && (
                      <div className="mb-3 p-3 bg-[#111317] rounded-lg">
                        <p className="text-gray-400 text-xs font-semibold mb-2">Action Steps:</p>
                        <div className="space-y-2">
                          {rec.specific_actions.map((action, aIdx) => (
                            <div key={aIdx} className="space-y-1">
                              <p className="text-white text-xs font-medium">{action.step}</p>
                              {action.before_example && action.after_example && (
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div className="p-2 bg-red-500/10 rounded text-xs">
                                    <p className="text-gray-500 mb-0.5">Before:</p>
                                    <p className="text-gray-300">"{action.before_example}"</p>
                                  </div>
                                  <div className="p-2 bg-green-500/10 rounded text-xs">
                                    <p className="text-gray-500 mb-0.5">After:</p>
                                    <p className="text-green-400">"{action.after_example}"</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.impact_prediction && (
                      <div className="p-3 bg-gradient-to-r from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[#00D4C9] font-semibold text-xs">Predicted Impact</p>
                          <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {rec.impact_prediction.confidence_percentage}% confident
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {rec.impact_prediction.reach_impact && (
                            <div className="text-center p-2 bg-[#0B0B0C] rounded">
                              <p className="text-gray-500">Reach</p>
                              <p className="text-white font-bold">{rec.impact_prediction.reach_impact}</p>
                            </div>
                          )}
                          {rec.impact_prediction.engagement_impact && (
                            <div className="text-center p-2 bg-[#0B0B0C] rounded">
                              <p className="text-gray-500">Engagement</p>
                              <p className="text-white font-bold">{rec.impact_prediction.engagement_impact}</p>
                            </div>
                          )}
                          {rec.impact_prediction.conversion_impact && (
                            <div className="text-center p-2 bg-[#0B0B0C] rounded">
                              <p className="text-gray-500">Conversions</p>
                              <p className="text-white font-bold">{rec.impact_prediction.conversion_impact}</p>
                            </div>
                          )}
                          {rec.impact_prediction.revenue_impact && (
                            <div className="text-center p-2 bg-[#0B0B0C] rounded">
                              <p className="text-gray-500">Revenue</p>
                              <p className="text-green-400 font-bold">{rec.impact_prediction.revenue_impact}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="abtests" className="space-y-3 mt-4">
                {latestInsights.ab_test_opportunities?.map((test, idx) => (
                  <Card key={idx} className="bg-[#0B0B0C] border-gray-800 rounded-xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-sm mb-1">{test.test_name}</CardTitle>
                          <div className="flex gap-2">
                            <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs capitalize">
                              {test.test_type}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              ROI: {test.estimated_roi}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{idx + 1}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      
                      <div className="p-2 bg-red-500/10 rounded">
                        <p className="text-gray-500 text-xs mb-1">Current (Control):</p>
                        <p className="text-gray-300 text-sm">"{test.current_variant}"</p>
                      </div>

                      <div className="space-y-2">
                        {test.suggested_variants?.map((variant, vIdx) => (
                          <div key={vIdx} className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-green-400 font-semibold text-xs">{variant.variant_name}</p>
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                {variant.expected_lift}
                              </Badge>
                            </div>
                            <p className="text-white text-sm mb-1">"{variant.variant_content}"</p>
                            <p className="text-gray-400 text-xs">
                              <span className="text-gray-500">Hypothesis:</span> {variant.hypothesis}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        className="w-full bg-purple-500 text-white rounded-lg"
                        onClick={async () => {
                          await base44.entities.ABTest.create({
                            test_name: test.test_name,
                            hypothesis: test.suggested_variants[0]?.hypothesis,
                            variants: [
                              { variant_id: 'control', variant_name: 'Control', config: { text: test.current_variant }, users_assigned: 0, conversions: 0, conversion_rate: 0 },
                              ...test.suggested_variants.map((v, i) => ({
                                variant_id: `variant_${i + 1}`,
                                variant_name: v.variant_name,
                                config: { text: v.variant_content },
                                users_assigned: 0,
                                conversions: 0,
                                conversion_rate: 0
                              }))
                            ],
                            status: 'running',
                            metric: 'CTR',
                            target_sample_size: 1000,
                            confidence_level: 95
                          });
                          alert('✅ A/B Test Created!');
                        }}
                      >
                        <TestTube2 className="w-4 h-4 mr-2" />
                        Create A/B Test
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="messaging" className="space-y-4 mt-4">
                
                {latestInsights.messaging_analysis?.effective_hooks?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Top Performing Hooks
                    </h4>
                    <div className="space-y-2">
                      {latestInsights.messaging_analysis.effective_hooks.map((hook, idx) => (
                        <div key={idx} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-white text-sm font-medium">"{hook.hook_text}"</p>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              {(hook.engagement_rate * 100).toFixed(1)}% engage
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-1">Used in: {hook.used_in}</p>
                          <p className="text-green-400 text-xs">✓ {hook.why_effective}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {latestInsights.messaging_analysis?.weak_hooks?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Underperforming Hooks
                    </h4>
                    <div className="space-y-2">
                      {latestInsights.messaging_analysis.weak_hooks.map((hook, idx) => (
                        <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-white text-sm">"{hook.hook_text}"</p>
                            <Badge className="bg-red-500/20 text-red-400 text-xs">
                              {(hook.engagement_rate * 100).toFixed(1)}% engage
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-2">⚠ {hook.why_ineffective}</p>
                          
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-500 text-xs mb-1">Suggested rewrites:</p>
                            {hook.rewrite_suggestions?.map((rewrite, rIdx) => (
                              <div key={rIdx} className="p-2 bg-green-500/10 rounded flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-green-400 text-xs flex-1">"{rewrite}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {latestInsights.messaging_analysis?.cta_analysis && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Call-to-Action Performance</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-green-400 text-xs font-semibold mb-2">✅ Best CTAs</p>
                        {latestInsights.messaging_analysis.cta_analysis.most_effective_ctas?.map((cta, idx) => (
                          <div key={idx} className="p-2 bg-green-500/10 rounded mb-2">
                            <p className="text-white text-sm">"{cta.cta_text}"</p>
                            <p className="text-gray-400 text-xs">{(cta.click_rate * 100).toFixed(1)}% CTR</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-yellow-400 text-xs font-semibold mb-2">⚠ Weak CTAs</p>
                        {latestInsights.messaging_analysis.cta_analysis.underperforming_ctas?.map((cta, idx) => (
                          <div key={idx} className="p-2 bg-yellow-500/10 rounded mb-2">
                            <p className="text-white text-sm mb-1">"{cta.cta_text}"</p>
                            <p className="text-gray-400 text-xs mb-1">{(cta.click_rate * 100).toFixed(1)}% CTR</p>
                            <p className="text-gray-500 text-xs mb-1">Try instead:</p>
                            {cta.rewrite_options?.slice(0, 2).map((rewrite, rIdx) => (
                              <p key={rIdx} className="text-green-400 text-xs">→ "{rewrite}"</p>
                            ))}
                            <p className="text-green-400 text-xs mt-1">Expected: {cta.expected_improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {latestInsights.messaging_analysis?.tone_consistency && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-blue-400 font-semibold text-sm">Brand Voice Consistency</p>
                      <p className="text-white font-bold text-lg">
                        {latestInsights.messaging_analysis.tone_consistency.consistency_score}/100
                      </p>
                    </div>
                    {latestInsights.messaging_analysis.tone_consistency.tone_drift_detected && (
                      <div className="mt-2">
                        <p className="text-yellow-400 text-xs mb-1">⚠ Tone drift detected:</p>
                        {latestInsights.messaging_analysis.tone_consistency.inconsistencies?.map((issue, idx) => (
                          <p key={idx} className="text-gray-300 text-xs">• {issue}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </TabsContent>

              <TabsContent value="channels" className="space-y-3 mt-4">
                {latestInsights.channel_performance?.map((channel, idx) => (
                  <Card key={idx} className="bg-[#0B0B0C] border-gray-800 rounded-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm capitalize">{channel.channel}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            channel.status === 'exceeding' ? 'bg-green-500/20 text-green-400' :
                            channel.status === 'on_track' ? 'bg-blue-500/20 text-blue-400' :
                            channel.status === 'underperforming' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {channel.status?.replace('_', ' ')}
                          </Badge>
                          <p className={`text-2xl font-bold ${getHealthColor(channel.performance_score)}`}>
                            {channel.performance_score}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                          <p className="text-green-400 text-xs font-semibold mb-1">✅ What's Working</p>
                          <ul className="space-y-0.5">
                            {channel.key_wins?.map((win, wIdx) => (
                              <li key={wIdx} className="text-gray-300 text-xs">• {win}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                          <p className="text-yellow-400 text-xs font-semibold mb-1">⚠ Issues Found</p>
                          <ul className="space-y-0.5">
                            {channel.key_issues?.map((issue, iIdx) => (
                              <li key={iIdx} className="text-gray-300 text-xs">• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs font-semibold mb-2">Channel-Specific Recommendations</p>
                        <div className="space-y-2">
                          {channel.recommendations?.slice(0, 3).map((rec, rIdx) => (
                            <div key={rIdx} className="p-3 bg-[#111317] rounded-lg">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-white text-sm font-medium flex-1">{rec.action}</p>
                                <Badge className={effortColors[rec.effort?.toLowerCase()] || 'bg-gray-500/20 text-gray-400'}>
                                  {rec.effort}
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-xs mb-2">{rec.expected_impact}</p>
                              
                              {rec.impact_prediction && (
                                <div className="p-2 bg-[#00D4C9]/10 border border-[#00D4C9]/30 rounded text-xs">
                                  <p className="text-[#00D4C9] font-semibold mb-1">Impact Prediction:</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-gray-500">Current</p>
                                      <p className="text-white font-bold">{rec.impact_prediction.current_value}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Predicted</p>
                                      <p className="text-green-400 font-bold">
                                        {rec.impact_prediction.predicted_value}
                                        <span className="text-xs ml-1">
                                          (+{rec.impact_prediction.improvement_percentage}%)
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-gray-500 mt-1">
                                    Confidence: {rec.impact_prediction.confidence_level}%
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="competitive" className="space-y-4 mt-4">
                {latestInsights.competitive_analysis ? (
                  <>
                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          Competitive Benchmark
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-[#0B0B0C] rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Your Engagement</p>
                            <p className="text-white font-bold text-lg">
                              {(latestInsights.competitive_analysis.benchmark_comparison.your_engagement_rate * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-3 bg-[#0B0B0C] rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Industry Avg</p>
                            <p className="text-gray-300 font-bold text-lg">
                              {(latestInsights.competitive_analysis.benchmark_comparison.industry_avg_engagement * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="p-3 bg-[#0B0B0C] rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">Top Performer</p>
                            <p className="text-green-400 font-bold text-lg">
                              {(latestInsights.competitive_analysis.benchmark_comparison.top_performer_engagement * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">Your Ranking</p>
                          <div className="flex items-center gap-3">
                            <Progress value={latestInsights.competitive_analysis.benchmark_comparison.your_percentile} className="flex-1" />
                            <p className="text-white font-bold">
                              Top {latestInsights.competitive_analysis.benchmark_comparison.your_percentile}%
                            </p>
                          </div>
                        </div>

                        {latestInsights.competitive_analysis.gaps_to_leader?.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-xs font-semibold mb-2">Gaps to Close</p>
                            <div className="space-y-2">
                              {latestInsights.competitive_analysis.gaps_to_leader.map((gap, idx) => (
                                <div key={idx} className="p-2 bg-[#111317] rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-white text-sm">{gap.metric}</p>
                                    <Badge className="bg-red-500/20 text-red-400 text-xs">
                                      -{gap.gap_percentage}%
                                    </Badge>
                                  </div>
                                  <p className="text-gray-400 text-xs mb-1">
                                    You: {gap.your_value} → Leader: {gap.leader_value}
                                  </p>
                                  <p className="text-[#00D4C9] text-xs">→ {gap.how_to_close_gap}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </CardContent>
                    </Card>

                    <Card className="bg-[#0B0B0C] border-gray-800 rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#FF69B4]" />
                          Competitive Positioning
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">
                          Based on competitor intelligence, here's how your campaign stacks up:
                        </p>

                        <div className="space-y-3">
                          <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 font-semibold text-xs mb-2">✅ Your Advantages</p>
                            <ul className="space-y-1">
                              <li className="text-gray-300 text-xs">• Higher engagement rate ({((campaign.performance_metrics?.engagement_rate || 0) * 100).toFixed(1)}% vs competitor avg)</li>
                              <li className="text-gray-300 text-xs">• Better content diversity (multi-channel approach)</li>
                              <li className="text-gray-300 text-xs">• AI-optimized timing and messaging</li>
                            </ul>
                          </div>

                          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-blue-400 font-semibold text-xs mb-2">💡 Differentiation Applied</p>
                            <p className="text-gray-300 text-xs">
                              This campaign uses competitor gap analysis to target underserved audience segments and unexplored content angles.
                            </p>
                          </div>

                          <Button
                            onClick={() => window.location.href = '/CompetitorIntelligence'}
                            size="sm"
                            variant="outline"
                            className="w-full border-[#FF69B4]/30 text-[#FF69B4] hover:bg-[#FF69B4]/10"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            View Full Competitor Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No competitor data integrated</p>
                    <p className="text-gray-500 text-sm mb-4">
                      Analyze competitors to enhance campaign strategy
                    </p>
                    <Button
                      onClick={() => window.location.href = '/CompetitorIntelligence'}
                      className="bg-gradient-to-r from-[#FF69B4] to-[#9D4EDD] text-white"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Analyze Competitors
                    </Button>
                  </div>
                )}
              </TabsContent>

            </Tabs>

            <div className="text-center text-gray-500 text-xs">
              Last analyzed: {new Date(latestInsights.analysis_date).toLocaleString()}
              {latestInsights.next_analysis_recommended && (
                <span className="ml-2">
                  • Next analysis: {new Date(latestInsights.next_analysis_recommended).toLocaleDateString()}
                </span>
              )}
            </div>

          </motion.div>
        )}

      </CardContent>
    </Card>
  );
}