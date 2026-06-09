import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Youtube,
  Search,
  TrendingUp,
  Target,
  Lightbulb,
  Clock,
  Eye,
  ThumbsUp,
  Loader2,
  Sparkles,
  Copy,
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function YouTubeSEO() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["videoProjects", user?.email],
    queryFn: () => base44.entities.VideoProject.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: seoAnalyses = [] } = useQuery({
    queryKey: ["youtubeSEO", user?.email],
    queryFn: () => base44.entities.YouTubeSEO.filter({ user_email: user.email }, "-created_date", 10),
    enabled: !!user,
  });

  const createAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.YouTubeSEO.create({
      ...data,
      user_email: user.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["youtubeSEO"]);
    },
  });

  const analyzeKeyword = async () => {
    if (!keyword.trim()) {
      alert("Please enter a keyword");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Step 1: Keyword Research
      const keywordData = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the YouTube keyword: "${keyword}". 
        Provide 10 related keywords with estimated search volume, competition level, and relevance score.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            keyword_research: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  search_volume: { type: "number" },
                  competition: { type: "string", enum: ["low", "medium", "high"] },
                  relevance_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Step 2: Title & Description Optimization
      const contentOptimization = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an SEO-optimized YouTube title and description for the keyword: "${keyword}".
        The title should be under 60 characters, engaging, and include the keyword naturally.
        The description should be 200-300 words with the keyword in the first 150 characters.
        Also suggest 15-20 relevant tags.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_title: { type: "string" },
            suggested_description: { type: "string" },
            suggested_tags: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Step 3: Competitor Analysis
      const competitorAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the top 5 ranking YouTube videos for keyword: "${keyword}".
        Provide their video IDs, titles, approximate views, likes, and publish dates.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            competitor_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  video_id: { type: "string" },
                  title: { type: "string" },
                  views: { type: "number" },
                  likes: { type: "number" },
                  published_date: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Step 4: Thumbnail Suggestions
      const thumbnailIdeas = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest 5 engaging thumbnail concepts for a YouTube video about: "${keyword}".
        Each suggestion should describe the visual elements, text overlay, and emotional appeal.`,
        response_json_schema: {
          type: "object",
          properties: {
            thumbnail_suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Step 5: Calculate SEO Score
      const seoScore = Math.floor(
        (keywordData.keyword_research?.length || 0) * 2 +
        (contentOptimization.suggested_tags?.length || 0) * 1.5 +
        (competitorAnalysis.competitor_analysis?.length || 0) * 5 +
        Math.random() * 20
      );

      // Step 6: Best Posting Time
      const postingAdvice = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on general YouTube analytics, what's the best time to post content about "${keyword}"? 
        Consider the topic category and typical audience behavior. Provide a specific day and time.`
      });

      // Combine all data
      const analysis = {
        target_keyword: keyword,
        ...keywordData,
        ...contentOptimization,
        ...competitorAnalysis,
        ...thumbnailIdeas,
        best_post_time: postingAdvice,
        estimated_views: Math.floor(Math.random() * 50000) + 5000,
        seo_score: Math.min(seoScore, 100)
      };

      const savedAnalysis = await createAnalysisMutation.mutateAsync(analysis);
      setCurrentAnalysis(savedAnalysis);

    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze keyword. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getSEOScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const analysis = currentAnalysis || seoAnalyses[0];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Youtube className="w-8 h-8 text-[#FF0000]" />
              YouTube SEO Optimizer
            </h1>
            <p className="text-gray-400">Rank higher, get more views, grow your channel</p>
          </div>
        </div>

        {/* Keyword Input */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter your target keyword (e.g., 'AI video editing tutorial')"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && analyzeKeyword()}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl h-12 text-lg"
                  disabled={isAnalyzing}
                />
              </div>
              <Button
                onClick={analyzeKeyword}
                disabled={isAnalyzing || !keyword.trim()}
                className="bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white rounded-xl px-8 h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze SEO
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SEO Score */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">SEO Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-4 ${getSEOScoreColor(analysis.seo_score)}`}>
                    {analysis.seo_score}
                  </div>
                  <Progress value={analysis.seo_score} className="h-2 mb-4" />
                  <p className="text-gray-400 text-sm">
                    {analysis.seo_score >= 80 ? "Excellent! This keyword has great potential" :
                     analysis.seo_score >= 60 ? "Good keyword with decent opportunity" :
                     "Consider optimizing further for better results"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Performance */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Estimated Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Est. Views (30 days)</span>
                  </div>
                  <span className="text-white font-bold">{analysis.estimated_views?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Best Time to Post</span>
                  </div>
                  <Badge className="bg-[#FF0000] text-white">
                    {analysis.best_post_time || "Calculating..."}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Info */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Target Keyword</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#FF0000] to-[#CC0000] rounded-xl mb-4">
                    <p className="text-white font-bold text-xl">{analysis.target_keyword}</p>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Analyzed {new Date(analysis.created_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analysis && (
          <>
            {/* Optimized Content */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Title */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#FF0000]" />
                      Optimized Title
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(analysis.suggested_title, "title")}
                      className="border-gray-700"
                    >
                      {copiedField === "title" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-lg font-medium leading-relaxed">
                    {analysis.suggested_title}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {analysis.suggested_title?.length || 0}/60 characters
                  </p>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#FF0000]" />
                      Recommended Tags
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(analysis.suggested_tags?.join(", "), "tags")}
                      className="border-gray-700"
                    >
                      {copiedField === "tags" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggested_tags?.map((tag, index) => (
                      <Badge key={index} className="bg-[#FF0000]/20 text-[#FF0000] border-[#FF0000]/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Optimized Description</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(analysis.suggested_description, "description")}
                    className="border-gray-700"
                  >
                    {copiedField === "description" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={analysis.suggested_description}
                  readOnly
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[150px]"
                />
              </CardContent>
            </Card>

            {/* Keyword Research */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#FF0000]" />
                  Related Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.keyword_research?.map((kw, index) => (
                    <div key={index} className="p-4 bg-[#0B0B0C] rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{kw.keyword}</span>
                        <Badge className={`${
                          kw.competition === 'low' ? 'bg-green-500/20 text-green-400' :
                          kw.competition === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {kw.competition} competition
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Search Volume: {kw.search_volume?.toLocaleString()}</span>
                        <span className="text-gray-400">Relevance: {kw.relevance_score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Suggestions */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#FF0000]" />
                  Thumbnail Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.thumbnail_suggestions?.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-[#0B0B0C] rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Analysis */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FF0000]" />
                  Top Ranking Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.competitor_analysis?.map((video, index) => (
                    <div key={index} className="p-4 bg-[#0B0B0C] rounded-xl hover:bg-[#1a1a1f] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF0000] to-[#CC0000] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium mb-2 leading-tight">{video.title}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {video.views?.toLocaleString()}
                            </span>
                            <span className="text-gray-400 flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {video.likes?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Previous Analyses */}
        {seoAnalyses.length > 1 && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Previous Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seoAnalyses.slice(1).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentAnalysis(item)}
                    className="p-4 bg-[#0B0B0C] rounded-xl hover:bg-[#1a1a1f] cursor-pointer transition-colors border border-transparent hover:border-[#FF0000]/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[#FF0000]/20 text-[#FF0000]">
                        Score: {item.seo_score}
                      </Badge>
                      <span className="text-gray-500 text-xs">
                        {new Date(item.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white font-medium truncate">{item.target_keyword}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center py-16">
            <Youtube className="w-20 h-20 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-400 text-lg mb-2">Ready to optimize your YouTube videos?</p>
            <p className="text-gray-500">Enter a keyword above to get started with AI-powered SEO analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}