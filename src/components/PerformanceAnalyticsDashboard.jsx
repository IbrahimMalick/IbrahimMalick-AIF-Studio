import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Brain,
  Loader2,
  Eye,
  ThumbsUp,
  Share2,
  Clock,
  Award,
  Lightbulb,
  Download,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PerformanceAnalyticsDashboard({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const { data: analyticsData = [] } = useQuery({
    queryKey: ["performanceAnalytics", project.id],
    queryFn: () => base44.entities.VideoPerformanceAnalytics.filter({
      video_project_id: project.id
    }),
  });

  const { data: allUserAnalytics = [] } = useQuery({
    queryKey: ["allAnalytics", currentUser.email],
    queryFn: () => base44.entities.VideoPerformanceAnalytics.filter({
      user_email: currentUser.email
    }, "-analysis_date"),
    enabled: !!currentUser,
  });

  // AI Performance Analysis & Recommendations
  const handleGenerateAIInsights = async () => {
    setIsAnalyzing(true);
    try {
      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze video performance data and provide comprehensive insights:

CURRENT PROJECT:
- Title: ${project.title}
- Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'Unknown'}
- Pacing: ${project.deep_analysis_data?.pacing_analysis?.overall_pace || 'Unknown'}
- Duration: ${project.duration_seconds || 0}s
- Export Preset: ${project.selected_export_preset || 'Not set'}

HISTORICAL PERFORMANCE DATA:
${allUserAnalytics.map(a => `
Video: ${a.video_project_id}
Export Preset: ${a.export_preset_used}
Platforms: ${a.platforms_published?.join(', ')}
Performance Score: ${a.performance_score}/100
Views: ${a.actual_performance?.overall_views || 0}
Engagement: ${a.actual_performance?.overall_engagement_rate || 0}%
Retention: ${a.actual_performance?.average_retention_rate || 0}%
Pacing: ${a.editing_style_data?.pacing}
`).join('\n---\n')}

Provide comprehensive analysis:

1. EXPORT PRESET PERFORMANCE:
   - Rank all export presets by engagement/quality balance
   - Best performing preset per platform
   - Codec & bitrate recommendations
   - Resolution & framerate insights
   - Quality vs file size analysis

2. AUDIENCE RETENTION PREDICTIONS:
   - Predicted retention rate for current project
   - Factors affecting retention (pacing, length, style)
   - Optimal video duration for target audience
   - Scene pacing recommendations
   - Hook effectiveness prediction

3. DROP-OFF POINT ANALYSIS:
   - Common drop-off timestamps
   - Why viewers leave (boring sections, length, pacing)
   - Content type patterns in drop-offs
   - Platform-specific drop-off behaviors
   - Critical moments to optimize

4. PLATFORM-SPECIFIC INSIGHTS:
   - Best platforms for this content type
   - Platform performance patterns
   - Optimal export settings per platform
   - Engagement patterns by platform
   - Growth opportunities

5. FUTURE RECOMMENDATIONS:
   - Top 5 actionable improvements
   - Export strategy optimization
   - Content optimization tips
   - Pacing adjustments
   - Platform targeting strategy

6. PREDICTIVE ANALYTICS:
   - Expected views range
   - Expected engagement rate
   - Viral probability score
   - Best posting time/day
   - Competition analysis

Provide data-driven, actionable insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_analysis: {
              type: "object",
              properties: {
                health_score: { type: "number" },
                trend: { type: "string" },
                key_strengths: { type: "array", items: { type: "string" } },
                key_weaknesses: { type: "array", items: { type: "string" } }
              }
            },
            export_preset_performance: {
              type: "object",
              properties: {
                best_overall_preset: { type: "string" },
                preset_rankings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      preset_name: { type: "string" },
                      engagement_score: { type: "number" },
                      quality_score: { type: "number" },
                      platforms: { type: "array", items: { type: "string" } },
                      use_cases: { type: "string" }
                    }
                  }
                },
                recommendations: { type: "array", items: { type: "string" } }
              }
            },
            retention_prediction: {
              type: "object",
              properties: {
                predicted_retention_rate: { type: "number" },
                confidence: { type: "number" },
                factors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      factor: { type: "string" },
                      impact: { type: "string" },
                      recommendation: { type: "string" }
                    }
                  }
                },
                optimal_duration_seconds: { type: "number" },
                pacing_adjustments: { type: "array", items: { type: "string" } }
              }
            },
            drop_off_analysis: {
              type: "object",
              properties: {
                critical_timestamps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time_seconds: { type: "number" },
                      reason: { type: "string" },
                      severity: { type: "string" },
                      fix: { type: "string" }
                    }
                  }
                },
                common_patterns: { type: "array", items: { type: "string" } },
                platform_specific: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      typical_drop_point: { type: "number" },
                      reason: { type: "string" }
                    }
                  }
                }
              }
            },
            platform_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  performance_score: { type: "number" },
                  best_content_types: { type: "array", items: { type: "string" } },
                  optimal_settings: {
                    type: "object",
                    properties: {
                      resolution: { type: "string" },
                      codec: { type: "string" },
                      bitrate: { type: "string" }
                    }
                  },
                  growth_potential: { type: "string" },
                  recommendations: { type: "array", items: { type: "string" } }
                }
              }
            },
            future_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  category: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            predictions: {
              type: "object",
              properties: {
                expected_views_range: {
                  type: "object",
                  properties: {
                    min: { type: "number" },
                    max: { type: "number" }
                  }
                },
                expected_engagement_rate: { type: "number" },
                viral_probability: { type: "number" },
                best_posting_time: { type: "string" },
                competition_level: { type: "string" }
              }
            }
          }
        }
      });

      setAiInsights(insights);

      alert(`✅ AI Performance Insights Generated!

📊 OVERALL HEALTH: ${insights.overall_analysis.health_score}/100
📈 TREND: ${insights.overall_analysis.trend}

🏆 BEST EXPORT PRESET:
${insights.export_preset_performance.best_overall_preset}

🎯 PREDICTED RETENTION:
${insights.retention_prediction.predicted_retention_rate}% (${insights.retention_prediction.confidence}% confident)

📅 OPTIMAL DURATION:
${Math.floor(insights.retention_prediction.optimal_duration_seconds / 60)}:${String(insights.retention_prediction.optimal_duration_seconds % 60).padStart(2, '0')}

🔮 PREDICTIONS:
• Views: ${insights.predictions.expected_views_range.min.toLocaleString()} - ${insights.predictions.expected_views_range.max.toLocaleString()}
• Engagement: ${insights.predictions.expected_engagement_rate}%
• Viral Probability: ${insights.predictions.viral_probability}%

Check below for detailed insights!`);

    } catch (error) {
      alert("Error generating AI insights. Please try again.");
    }
    setIsAnalyzing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    if (score >= 40) return "bg-orange-500/20";
    return "bg-red-500/20";
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00D4C9]" />
            AI Performance Analytics
          </CardTitle>
          <Button
            onClick={handleGenerateAIInsights}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black rounded-lg font-semibold"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-2" />
            )}
            Generate Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {!aiInsights ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No analytics insights generated yet</p>
            <p className="text-gray-500 text-sm">Click "Generate Insights" to analyze performance data</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Overall Analysis */}
            <div className="p-4 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg">Overall Performance</h3>
                <div className="flex items-center gap-2">
                  <div className={`text-4xl font-bold ${getScoreColor(aiInsights.overall_analysis.health_score)}`}>
                    {aiInsights.overall_analysis.health_score}
                  </div>
                  <div className="text-gray-400 text-sm">
                    /100<br/>
                    <Badge className={`${getScoreBg(aiInsights.overall_analysis.health_score)} ${getScoreColor(aiInsights.overall_analysis.health_score)} mt-1`}>
                      {aiInsights.overall_analysis.trend}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {aiInsights.overall_analysis.key_strengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-300 text-xs">• {strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-yellow-400 text-sm font-semibold mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {aiInsights.overall_analysis.key_weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-gray-300 text-xs">• {weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="bg-[#0B0B0C] rounded-xl">
                <TabsTrigger value="presets">Export Presets</TabsTrigger>
                <TabsTrigger value="retention">Retention</TabsTrigger>
                <TabsTrigger value="dropoff">Drop-offs</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              {/* Export Preset Performance */}
              <TabsContent value="presets">
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#FFD700]" />
                      Best Overall Preset
                    </h4>
                    <p className="text-[#FFD700] text-lg font-bold">{aiInsights.export_preset_performance.best_overall_preset}</p>
                  </div>

                  <div className="space-y-3">
                    {aiInsights.export_preset_performance.preset_rankings.map((preset, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-semibold">{preset.preset_name}</h5>
                          <div className="flex gap-2">
                            <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                              Engagement: {preset.engagement_score}%
                            </Badge>
                            <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] text-xs">
                              Quality: {preset.quality_score}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mb-2">{preset.use_cases}</p>
                        <div className="flex flex-wrap gap-1">
                          {preset.platforms.map((platform, i) => (
                            <Badge key={i} className="bg-gray-700 text-gray-300 text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-blue-400 font-semibold text-sm mb-2">💡 Recommendations:</h4>
                    <ul className="space-y-1">
                      {aiInsights.export_preset_performance.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-gray-300 text-xs">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Retention Prediction */}
              <TabsContent value="retention">
                <div className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-4 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                      <p className="text-gray-400 text-sm mb-2">Predicted Retention</p>
                      <p className={`text-4xl font-bold ${getScoreColor(aiInsights.retention_prediction.predicted_retention_rate)}`}>
                        {aiInsights.retention_prediction.predicted_retention_rate}%
                      </p>
                      <Badge className="bg-gray-700 text-gray-300 text-xs mt-2">
                        {aiInsights.retention_prediction.confidence}% confident
                      </Badge>
                    </div>
                    <div className="p-4 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                      <p className="text-gray-400 text-sm mb-2">Optimal Duration</p>
                      <p className="text-4xl font-bold text-[#00D4C9]">
                        {Math.floor(aiInsights.retention_prediction.optimal_duration_seconds / 60)}:{String(aiInsights.retention_prediction.optimal_duration_seconds % 60).padStart(2, '0')}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">minutes:seconds</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Retention Factors</h4>
                    <div className="space-y-2">
                      {aiInsights.retention_prediction.factors.map((factor, idx) => (
                        <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                          <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{factor.factor}</p>
                              <p className="text-gray-400 text-xs mt-1">Impact: {factor.impact}</p>
                              <p className="text-[#00D4C9] text-xs mt-1">→ {factor.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {aiInsights.retention_prediction.pacing_adjustments.length > 0 && (
                    <div className="p-3 bg-[#00D4C9]/10 border border-[#00D4C9]/30 rounded-lg">
                      <h4 className="text-[#00D4C9] font-semibold text-sm mb-2 flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Pacing Adjustments
                      </h4>
                      <ul className="space-y-1">
                        {aiInsights.retention_prediction.pacing_adjustments.map((adj, idx) => (
                          <li key={idx} className="text-gray-300 text-xs">• {adj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Drop-off Analysis */}
              <TabsContent value="dropoff">
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Critical Drop-off Points
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.drop_off_analysis.critical_timestamps.map((dropoff, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${
                          dropoff.severity === 'high' ? 'bg-red-500/10 border-red-500/30' :
                          dropoff.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-blue-500/10 border-blue-500/30'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge className={`${
                                dropoff.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                dropoff.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              } text-xs`}>
                                {dropoff.severity}
                              </Badge>
                              <p className="text-white text-sm mt-1">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {Math.floor(dropoff.time_seconds / 60)}:{String(dropoff.time_seconds % 60).padStart(2, '0')}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-300 text-xs mb-1">{dropoff.reason}</p>
                          <p className="text-[#00D4C9] text-xs">✓ Fix: {dropoff.fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold text-sm mb-2">Common Patterns</h4>
                    <ul className="space-y-1">
                      {aiInsights.drop_off_analysis.common_patterns.map((pattern, idx) => (
                        <li key={idx} className="text-gray-300 text-xs">• {pattern}</li>
                      ))}
                    </ul>
                  </div>

                  {aiInsights.drop_off_analysis.platform_specific.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-sm">Platform-Specific Drop-offs</h4>
                      <div className="space-y-2">
                        {aiInsights.drop_off_analysis.platform_specific.map((plat, idx) => (
                          <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg border border-gray-800">
                            <p className="text-white text-sm font-medium">{plat.platform}</p>
                            <p className="text-gray-400 text-xs">
                              Typical drop at {Math.floor(plat.typical_drop_point / 60)}:{String(plat.typical_drop_point % 60).padStart(2, '0')} - {plat.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Platform Insights */}
              <TabsContent value="platforms">
                <div className="space-y-3 mt-4">
                  {aiInsights.platform_insights.map((platform, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-[#0B0B0C] rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold text-lg">{platform.platform}</h4>
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${getScoreColor(platform.performance_score)}`}>
                            {platform.performance_score}
                          </p>
                          <p className="text-gray-500 text-xs">Performance</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Best Content Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {platform.best_content_types.map((type, i) => (
                              <Badge key={i} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-[#111317] rounded">
                            <p className="text-gray-500">Resolution</p>
                            <p className="text-white font-medium">{platform.optimal_settings.resolution}</p>
                          </div>
                          <div className="p-2 bg-[#111317] rounded">
                            <p className="text-gray-500">Codec</p>
                            <p className="text-white font-medium">{platform.optimal_settings.codec}</p>
                          </div>
                          <div className="p-2 bg-[#111317] rounded">
                            <p className="text-gray-500">Bitrate</p>
                            <p className="text-white font-medium">{platform.optimal_settings.bitrate}</p>
                          </div>
                        </div>

                        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                          <p className="text-green-400 text-xs font-semibold mb-1">Growth Potential: {platform.growth_potential}</p>
                          <ul className="space-y-0.5">
                            {platform.recommendations.map((rec, i) => (
                              <li key={i} className="text-gray-300 text-xs">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Recommendations */}
              <TabsContent value="recommendations">
                <div className="space-y-3 mt-4">
                  {/* Predictions Box */}
                  <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#FFD700]" />
                      Predictions for This Video
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Expected Views</p>
                        <p className="text-white font-bold text-lg">
                          {aiInsights.predictions.expected_views_range.min.toLocaleString()} - {aiInsights.predictions.expected_views_range.max.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Expected Engagement</p>
                        <p className="text-white font-bold text-lg">{aiInsights.predictions.expected_engagement_rate}%</p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Viral Probability</p>
                        <p className={`font-bold text-lg ${getScoreColor(aiInsights.predictions.viral_probability)}`}>
                          {aiInsights.predictions.viral_probability}%
                        </p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Best Posting Time</p>
                        <p className="text-white font-bold text-lg">{aiInsights.predictions.best_posting_time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-[#FFD700]" />
                      Top Recommendations
                    </h4>
                    <div className="space-y-2">
                      {aiInsights.future_recommendations.map((rec, idx) => (
                        <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                          <div className="flex items-start gap-2">
                            <Badge className={`${
                              rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            } h-fit text-xs`}>
                              {rec.priority}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium mb-1">{rec.recommendation}</p>
                              <p className="text-gray-400 text-xs mb-1">
                                <span className="text-gray-500">Category:</span> {rec.category}
                              </p>
                              <p className="text-[#00D4C9] text-xs mb-1">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                Impact: {rec.expected_impact}
                              </p>
                              <p className="text-gray-500 text-xs">
                                Implementation: {rec.implementation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

            </Tabs>

          </div>
        )}

      </CardContent>
    </Card>
  );
}