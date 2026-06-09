import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Lightbulb,
  Target,
  Clock,
  Zap,
  Eye,
  ThumbsUp,
  DollarSign,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "@/components/ToastNotification";
import { useAudioFeedback } from "@/components/AudioSystem";
import LoadingState from "@/components/LoadingState";
import UsageTrendsChart from "@/components/UsageTrendsChart";

export default function AIInsights() {
  const [user, setUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audio = useAudioFeedback();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: recommendations = [], isLoading: loadingRecs } = useQuery({
    queryKey: ["recommendations", user?.email],
    queryFn: () => base44.entities.ContentRecommendation.filter({
      user_email: user.email,
      status: "new"
    }, "-created_date", 20),
    enabled: !!user?.email
  });

  const { data: predictions = [], isLoading: loadingPreds } = useQuery({
    queryKey: ["predictions", user?.email],
    queryFn: () => base44.entities.PredictiveAnalytics.filter({
      user_email: user.email
    }, "-prediction_date", 10),
    enabled: !!user?.email
  });

  const { data: contentIdeas = [], isLoading: loadingIdeas } = useQuery({
    queryKey: ["contentIdeas", user?.email],
    queryFn: () => base44.entities.ContentIdea.filter({
      user_email: user.email,
      status: "idea"
    }, "-created_date", 20),
    enabled: !!user?.email
  });

  const { data: trends = [], isLoading: loadingTrends } = useQuery({
    queryKey: ["trendingTopics"],
    queryFn: () => base44.entities.TrendingTopic.list("-trend_score", 10),
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Generate AI recommendations
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI content strategy expert. Analyze the current trends and generate 5 actionable content recommendations for a content creator. 

        Consider:
        - Current trending topics
        - Best posting times
        - Content formats that perform well
        - Audience engagement patterns
        - Revenue opportunities

        Return as JSON with this structure:
        {
          "recommendations": [
            {
              "title": "Create a video about [topic]",
              "description": "Detailed reasoning",
              "type": "trending_topic",
              "confidence": 0.85,
              "potential_views": 10000,
              "potential_engagement": 500,
              "action_items": ["Step 1", "Step 2"]
            }
          ]
        }`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string" },
                  confidence: { type: "number" },
                  potential_views: { type: "number" },
                  potential_engagement: { type: "number" },
                  action_items: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Save recommendations
      for (const rec of aiResponse.recommendations) {
        await base44.entities.ContentRecommendation.create({
          user_email: user.email,
          recommendation_type: rec.type || "content_idea",
          title: rec.title,
          description: rec.description,
          confidence_score: rec.confidence,
          potential_impact: {
            estimated_views: rec.potential_views,
            estimated_engagement: rec.potential_engagement
          },
          action_items: rec.action_items,
          data_sources: ["ai_analysis", "trending_topics", "historical_performance"]
        });
      }

      setIsGenerating(false);
      return aiResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recommendations"]);
      audio.playProsperityChime();
      showToast("AI insights generated! Check your recommendations 🚀", "success");
    },
    onError: () => {
      setIsGenerating(false);
      audio.playError();
      showToast("Failed to generate insights", "error");
    }
  });

  const dismissRecommendationMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.ContentRecommendation.update(id, {
      status: "dismissed"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["recommendations"]);
      audio.playClick();
    }
  });

  const actOnRecommendationMutation = useMutation({
    mutationFn: async ({ recommendation }) => {
      // Mark as acted on
      await base44.entities.ContentRecommendation.update(recommendation.id, {
        status: "acted_on"
      });

      // Create content idea from recommendation
      await base44.entities.ContentIdea.create({
        user_email: user.email,
        idea_title: recommendation.title,
        description: recommendation.description,
        content_type: "video",
        source: "ai_generated",
        viral_potential: Math.round(recommendation.confidence_score * 100),
        script_outline: recommendation.action_items?.join("\n")
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recommendations"]);
      queryClient.invalidateQueries(["contentIdeas"]);
      audio.playSuccess();
      showToast("Content idea created! Check your Ideas tab 💡", "success");
    }
  });

  if (!user) {
    return <LoadingState message="Loading AI insights..." />;
  }

  const isLoading = loadingRecs || loadingPreds || loadingIdeas || loadingTrends;

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-[#FFD700]" />
              AI-Powered Insights
            </h1>
            <p className="text-gray-400">
              Smart recommendations to boost your content performance
            </p>
          </div>
          
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold px-6"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                </motion.div>
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Generate Fresh Insights
              </>
            )}
          </Button>
        </div>

        {/* Usage Trends Chart */}
        <UsageTrendsChart user={user} />

        {isLoading ? (
          <LoadingState message="Loading insights..." />
        ) : (
          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className="bg-[#111317] border border-gray-800">
              <TabsTrigger value="recommendations">
                <Lightbulb className="w-4 h-4 mr-2" />
                Recommendations ({recommendations.length})
              </TabsTrigger>
              <TabsTrigger value="predictions">
                <TrendingUp className="w-4 h-4 mr-2" />
                Predictions
              </TabsTrigger>
              <TabsTrigger value="trends">
                <Zap className="w-4 h-4 mr-2" />
                Trending Topics ({trends.length})
              </TabsTrigger>
              <TabsTrigger value="ideas">
                <Target className="w-4 h-4 mr-2" />
                Content Ideas ({contentIdeas.length})
              </TabsTrigger>
            </TabsList>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              {recommendations.length === 0 ? (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                    <h3 className="text-white font-semibold text-lg mb-2">
                      No recommendations yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Click "Generate Fresh Insights" to get AI-powered recommendations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="w-5 h-5 text-black" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-1">
                                  {rec.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {rec.description}
                                </p>
                              </div>
                            </div>

                            {/* Potential Impact */}
                            {rec.potential_impact && (
                              <div className="grid grid-cols-3 gap-4 mt-4 p-4 rounded-xl bg-[#0B0B0C]">
                                {rec.potential_impact.estimated_views && (
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Est. Views</p>
                                    <p className="text-[#FFD700] font-bold flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      {rec.potential_impact.estimated_views.toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                {rec.potential_impact.estimated_engagement && (
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Est. Engagement</p>
                                    <p className="text-[#00D4C9] font-bold flex items-center gap-1">
                                      <ThumbsUp className="w-4 h-4" />
                                      {rec.potential_impact.estimated_engagement.toLocaleString()}
                                    </p>
                                  </div>
                                )}
                                {rec.confidence_score && (
                                  <div>
                                    <p className="text-gray-500 text-xs mb-1">Confidence</p>
                                    <p className="text-green-400 font-bold">
                                      {Math.round(rec.confidence_score * 100)}%
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Items */}
                            {rec.action_items && rec.action_items.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-semibold text-gray-400 mb-2">
                                  Action Steps:
                                </p>
                                <ul className="space-y-1">
                                  {rec.action_items.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                      <span className="text-[#FFD700] mt-1">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Badge className="bg-blue-500/20 text-blue-400 whitespace-nowrap">
                              {rec.recommendation_type}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <Button
                            onClick={() => actOnRecommendationMutation.mutate({ recommendation: rec })}
                            className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
                          >
                            <Target className="w-4 h-4 mr-2" />
                            Create Content Idea
                          </Button>
                          <Button
                            onClick={() => dismissRecommendationMutation.mutate({ id: rec.id })}
                            variant="outline"
                            className="border-gray-700 text-gray-400"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-4">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#00D4C9]" />
                    Performance Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {predictions.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                      <p className="text-gray-400 text-sm">
                        Predictions will appear as you create more content
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {predictions.map((pred, idx) => (
                        <motion.div
                          key={pred.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold capitalize">
                              {pred.prediction_type.replace(/_/g, " ")}
                            </p>
                            <Badge className="bg-purple-500/20 text-purple-400">
                              {pred.confidence_interval?.confidence_level ? 
                                `${Math.round(pred.confidence_interval.confidence_level * 100)}% confidence` :
                                "High confidence"
                              }
                            </Badge>
                          </div>
                          <p className="text-3xl font-bold text-[#FFD700] mb-2">
                            {pred.predicted_value.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Predicted for {new Date(pred.prediction_target_date).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trending Topics Tab */}
            <TabsContent value="trends" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {trends.map((trend, idx) => (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-bold text-lg mb-2">
                              {trend.topic_name}
                            </h3>
                            <div className="flex gap-2">
                              <Badge className="bg-red-500/20 text-red-400">
                                {trend.trend_velocity}
                              </Badge>
                              <Badge className="bg-gray-700 text-gray-300">
                                {trend.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-[#FFD700]">
                              {trend.trend_score}
                            </p>
                            <p className="text-xs text-gray-500">Heat Score</p>
                          </div>
                        </div>

                        {trend.search_volume && (
                          <div className="mb-4 p-3 rounded-lg bg-[#0B0B0C]">
                            <p className="text-xs text-gray-500 mb-1">Monthly Searches</p>
                            <p className="text-xl font-bold text-white">
                              {trend.search_volume.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {trend.related_keywords && trend.related_keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {trend.related_keywords.slice(0, 5).map((kw, i) => (
                              <Badge key={i} className="bg-gray-800 text-gray-300 text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          onClick={async () => {
                            await base44.entities.ContentIdea.create({
                              user_email: user.email,
                              idea_title: `Content about: ${trend.topic_name}`,
                              description: `Trending topic with ${trend.search_volume?.toLocaleString() || 'high'} monthly searches`,
                              content_type: "video",
                              source: "trending_topic",
                              viral_potential: trend.trend_score,
                              target_keywords: trend.related_keywords || [],
                              related_trends: [trend.topic_name]
                            });
                            audio.playSuccess();
                            showToast("Idea added! Check your Ideas tab 💡", "success");
                            queryClient.invalidateQueries(["contentIdeas"]);
                          }}
                          className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Create Content Idea
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {trends.length === 0 && (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Zap className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                    <h3 className="text-white font-semibold text-lg mb-2">
                      No trending topics yet
                    </h3>
                    <p className="text-gray-400">
                      Trending topics will be automatically detected and displayed here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Content Ideas Tab */}
            <TabsContent value="ideas" className="space-y-4">
              {contentIdeas.length === 0 ? (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                    <h3 className="text-white font-semibold text-lg mb-2">
                      No content ideas yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Generate AI insights or capture trending topics to build your idea backlog
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {contentIdeas.map((idea, idx) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-bold">{idea.idea_title}</h3>
                            {idea.viral_potential && (
                              <Badge className={`${
                                idea.viral_potential >= 70 ? 'bg-green-500/20 text-green-400' :
                                idea.viral_potential >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {idea.viral_potential}% viral
                              </Badge>
                            )}
                          </div>
                          {idea.description && (
                            <p className="text-gray-400 text-sm mb-3">{idea.description}</p>
                          )}
                          <div className="flex gap-2 mb-4">
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {idea.content_type}
                            </Badge>
                            <Badge className="bg-gray-700 text-gray-300 text-xs">
                              {idea.source}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => {
                              // Navigate to video studio with pre-filled idea
                              window.location.href = `/VideoStudio?idea=${idea.id}`;
                            }}
                            className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
                          >
                            Start Creating
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

      </div>
    </div>
  );
}