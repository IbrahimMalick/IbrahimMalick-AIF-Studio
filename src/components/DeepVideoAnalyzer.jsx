import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Sparkles,
  Loader2,
  CheckCircle2,
  Film,
  Heart,
  Zap,
  Palette,
  Sun,
  Eye,
  Target,
  TrendingUp,
  Clock,
  Video,
  BarChart3,
  Layers,
  Camera,
  Droplet,
  Contrast,
  Lightbulb,
  Hash,
  AlertCircle,
  Download,
  Share2,
  RefreshCw,
  Music,
  Scissors
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeepVideoAnalyzer({ project, currentUser, onAnalysisComplete }) {
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");

  const analyzeVideoMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setCurrentStage("Initializing analysis...");

      // Stage 1: Genre Classification
      setCurrentStage("🎬 Analyzing genre and content type...");
      setAnalysisProgress(15);
      
      const genreAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video project and classify its genre, style, and content type:

PROJECT:
- Title: ${project.title}
- Description: ${project.description || 'N/A'}
- Duration: ${project.duration_seconds || 0}s
- Resolution: ${project.resolution}

Based on the title and description, provide comprehensive genre classification:

1. PRIMARY GENRE (choose one):
   - Tutorial/Educational
   - Vlog/Lifestyle
   - Commercial/Marketing
   - Documentary
   - Entertainment
   - Product Review
   - Interview/Podcast
   - Music Video
   - Gaming
   - News/Current Events
   - Cinematic/Short Film

2. SUB-GENRES (2-3 specific categories)

3. CONTENT STYLE:
   - Professional/Corporate
   - Casual/Personal
   - Artistic/Creative
   - Technical/Informative
   - Entertaining/Fun

4. TARGET AUDIENCE:
   - Age range
   - Interests
   - Expertise level

5. PRIMARY PURPOSE:
   - Educate
   - Entertain
   - Persuade/Sell
   - Inform
   - Inspire

6. PLATFORM OPTIMIZATION:
   - Best suited platforms (YouTube, Instagram, TikTok, etc.)
   - Recommended format adjustments`,
        response_json_schema: {
          type: "object",
          properties: {
            primary_genre: { type: "string" },
            sub_genres: { type: "array", items: { type: "string" } },
            content_style: { type: "string" },
            target_audience: {
              type: "object",
              properties: {
                age_range: { type: "string" },
                interests: { type: "array", items: { type: "string" } },
                expertise_level: { type: "string" }
              }
            },
            primary_purpose: { type: "string" },
            platform_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  suitability_score: { type: "number" },
                  format_suggestions: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Stage 2: Emotional Tone Analysis
      setCurrentStage("🎭 Analyzing emotional tone and mood...");
      setAnalysisProgress(30);

      const emotionalAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the emotional tone and mood of this video project:

PROJECT: ${project.title}
DESCRIPTION: ${project.description || 'N/A'}
GENRE: ${genreAnalysis.primary_genre}

Provide comprehensive emotional analysis:

1. PRIMARY MOOD (choose one):
   - Energetic/Excited
   - Calm/Peaceful
   - Serious/Professional
   - Playful/Fun
   - Dramatic/Intense
   - Mysterious/Suspenseful
   - Inspirational/Uplifting
   - Melancholic/Reflective

2. EMOTIONAL TONE (1-3 descriptors):
   - Happy, Sad, Anxious, Confident, Curious, etc.

3. ENERGY LEVEL (0-100):
   - How intense/energetic is the content?

4. EMOTIONAL ARC:
   - Beginning mood
   - Middle mood
   - Ending mood

5. SENTIMENT SCORE:
   - Overall positive/negative/neutral

6. VIEWER EMOTION TARGET:
   - What emotion should viewers feel?`,
        response_json_schema: {
          type: "object",
          properties: {
            primary_mood: { type: "string" },
            emotional_tones: { type: "array", items: { type: "string" } },
            energy_level: { type: "number" },
            emotional_arc: {
              type: "object",
              properties: {
                beginning: { type: "string" },
                middle: { type: "string" },
                ending: { type: "string" }
              }
            },
            sentiment: { type: "string" },
            target_viewer_emotion: { type: "string" },
            mood_keywords: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Stage 3: Pacing Analysis
      setCurrentStage("⚡ Analyzing pacing and rhythm...");
      setAnalysisProgress(45);

      const pacingAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the pacing and rhythm of this video:

PROJECT: ${project.title}
DURATION: ${project.duration_seconds}s
GENRE: ${genreAnalysis.primary_genre}
MOOD: ${emotionalAnalysis.primary_mood}

Provide pacing analysis:

1. OVERALL PACE:
   - Fast (quick cuts, high energy)
   - Moderate (balanced pacing)
   - Slow (deliberate, contemplative)

2. PACING SCORE (0-100):
   - 0-30: Very slow
   - 31-50: Slow to moderate
   - 51-70: Moderate to fast
   - 71-100: Very fast

3. RECOMMENDED CUTS PER MINUTE:
   - Based on genre and content

4. SCENE VARIETY:
   - High/Medium/Low variety expected

5. IDEAL VIDEO LENGTH:
   - Recommended duration range

6. ENGAGEMENT CURVE:
   - Hook timing (first X seconds)
   - Retention strategy
   - Outro timing`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_pace: { type: "string" },
            pacing_score: { type: "number" },
            cuts_per_minute: { type: "number" },
            scene_variety: { type: "string" },
            ideal_length_range: {
              type: "object",
              properties: {
                min_seconds: { type: "number" },
                max_seconds: { type: "number" }
              }
            },
            engagement_strategy: {
              type: "object",
              properties: {
                hook_duration: { type: "number" },
                retention_technique: { type: "string" },
                outro_timing: { type: "number" }
              }
            }
          }
        }
      });

      // Stage 4: Visual Elements Analysis
      setCurrentStage("🎨 Analyzing visual style and aesthetics...");
      setAnalysisProgress(60);

      const visualAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the expected visual style and aesthetics for this video:

PROJECT: ${project.title}
GENRE: ${genreAnalysis.primary_genre}
MOOD: ${emotionalAnalysis.primary_mood}
STYLE: ${genreAnalysis.content_style}

Provide comprehensive visual analysis:

1. DOMINANT COLORS (5-7 colors):
   - Expected color palette (hex codes)
   - Color temperature (warm/cool/neutral)

2. LIGHTING STYLE:
   - Natural/Studio/Dramatic/Soft/Hard
   - Light intensity (low/medium/high)
   - Shadow presence

3. VISUAL TEXTURE:
   - Smooth/Grainy/Sharp/Soft
   - Film grain presence
   - Digital vs. cinematic feel

4. COMPOSITION STYLE:
   - Rule of thirds/Centered/Dynamic
   - Shot variety (wide/medium/close-up)
   - Camera movement (static/dynamic)

5. COLOR GRADING:
   - Warm/Cool/Neutral tones
   - Saturation level (high/medium/low)
   - Contrast level (high/medium/low)

6. VISUAL COMPLEXITY:
   - Simple/Moderate/Complex
   - Graphics overlay presence
   - Text frequency`,
        response_json_schema: {
          type: "object",
          properties: {
            dominant_colors: { type: "array", items: { type: "string" } },
            color_temperature: { type: "string" },
            lighting: {
              type: "object",
              properties: {
                style: { type: "string" },
                intensity: { type: "string" },
                shadow_presence: { type: "string" }
              }
            },
            texture: {
              type: "object",
              properties: {
                type: { type: "string" },
                film_grain: { type: "boolean" },
                feel: { type: "string" }
              }
            },
            composition: {
              type: "object",
              properties: {
                style: { type: "string" },
                shot_variety: { type: "string" },
                camera_movement: { type: "string" }
              }
            },
            color_grading: {
              type: "object",
              properties: {
                tone: { type: "string" },
                saturation: { type: "string" },
                contrast: { type: "string" }
              }
            },
            visual_complexity: { type: "string" }
          }
        }
      });

      // Stage 5: Quality Assessment
      setCurrentStage("⭐ Assessing quality and production value...");
      setAnalysisProgress(75);

      const qualityAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Assess the expected quality and production value:

PROJECT: ${project.title}
GENRE: ${genreAnalysis.primary_genre}
STYLE: ${genreAnalysis.content_style}

Provide quality assessment:

1. PRODUCTION VALUE (0-100):
   - Professional/Semi-professional/Amateur

2. TECHNICAL QUALITY:
   - Video resolution expectation
   - Audio quality expectation
   - Editing sophistication

3. CONTENT POLISH:
   - Script quality
   - Presentation quality
   - Overall coherence

4. IMPROVEMENT AREAS:
   - Top 3-5 areas to enhance

5. STRENGTHS:
   - Top 3-5 strong points`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_production_value: { type: "number" },
            production_level: { type: "string" },
            technical_scores: {
              type: "object",
              properties: {
                video_quality: { type: "number" },
                audio_quality: { type: "number" },
                editing_quality: { type: "number" }
              }
            },
            content_scores: {
              type: "object",
              properties: {
                script_quality: { type: "number" },
                presentation: { type: "number" },
                coherence: { type: "number" }
              }
            },
            improvement_areas: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Stage 6: Recommendations
      setCurrentStage("💡 Generating actionable recommendations...");
      setAnalysisProgress(90);

      const recommendations = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on all analysis, provide actionable recommendations:

GENRE: ${genreAnalysis.primary_genre}
MOOD: ${emotionalAnalysis.primary_mood}
PACE: ${pacingAnalysis.overall_pace}
PRODUCTION: ${qualityAnalysis.production_level}

Provide:
1. Music style recommendations (3-5 specific genres/moods)
2. Editing style suggestions (cuts, transitions, effects)
3. Color grading recommendations
4. Pacing adjustments needed
5. Content optimization tips (5-7 tips)`,
        response_json_schema: {
          type: "object",
          properties: {
            music_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  genre: { type: "string" },
                  mood: { type: "string" },
                  tempo_range: { type: "string" },
                  why: { type: "string" }
                }
              }
            },
            editing_suggestions: {
              type: "array",
              items: { type: "string" }
            },
            color_grading_tips: {
              type: "array",
              items: { type: "string" }
            },
            pacing_adjustments: {
              type: "array",
              items: { type: "string" }
            },
            optimization_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Compile complete analysis
      setCurrentStage("✅ Finalizing analysis...");
      setAnalysisProgress(100);

      const completeAnalysis = {
        genre_classification: genreAnalysis,
        emotional_tone: emotionalAnalysis,
        pacing_analysis: pacingAnalysis,
        visual_elements: visualAnalysis,
        quality_scores: qualityAnalysis,
        recommendations: recommendations,
        analyzed_at: new Date().toISOString()
      };

      // Save to project
      return await base44.entities.VideoProject.update(project.id, {
        deep_analysis_complete: true,
        deep_analysis_data: completeAnalysis
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["videoProjects"]);
      if (onAnalysisComplete) onAnalysisComplete();
      setIsAnalyzing(false);
      alert("✅ Deep Video Analysis Complete! Check the comprehensive report below.");
    },
    onError: () => {
      setIsAnalyzing(false);
      alert("❌ Analysis failed. Please try again.");
    }
  });

  const analysisData = project.deep_analysis_data;

  const getPaceColor = (pace) => {
    if (pace === "Fast") return "text-red-400 bg-red-500/20";
    if (pace === "Moderate") return "text-yellow-400 bg-yellow-500/20";
    return "text-blue-400 bg-blue-500/20";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#9D4EDD]" />
            Deep AI Video Analysis
          </CardTitle>
          {!project.deep_analysis_complete ? (
            <Button
              onClick={() => analyzeVideoMutation.mutate()}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-lg font-semibold"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Analyze Video
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => analyzeVideoMutation.mutate()}
                className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-analyze
              </Button>
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>

        {/* Analysis in Progress */}
        {isAnalyzing && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#9D4EDD] animate-spin" />
              <h3 className="text-white font-bold text-lg mb-2">Analyzing Your Video</h3>
              <p className="text-gray-400 text-sm mb-4">{currentStage}</p>
              <Progress value={analysisProgress} className="h-2 mb-2" />
              <p className="text-gray-500 text-xs">{analysisProgress}% complete</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: Film, label: "Genre", done: analysisProgress > 15 },
                { icon: Heart, label: "Emotion", done: analysisProgress > 30 },
                { icon: Zap, label: "Pacing", done: analysisProgress > 45 },
                { icon: Palette, label: "Visuals", done: analysisProgress > 60 },
                { icon: BarChart3, label: "Quality", done: analysisProgress > 75 },
                { icon: Lightbulb, label: "Recommendations", done: analysisProgress > 90 }
              ].map((stage, idx) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      stage.done
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-[#0B0B0C] border-gray-800'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${stage.done ? 'text-green-400' : 'text-gray-600'}`} />
                    <p className={`text-xs font-medium ${stage.done ? 'text-green-400' : 'text-gray-500'}`}>
                      {stage.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Analysis Yet */}
        {!isAnalyzing && !project.deep_analysis_complete && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No analysis performed yet</p>
            <p className="text-gray-500 text-sm mb-4">
              AI will analyze genre, mood, pacing, visuals, and more
            </p>
            <div className="grid md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <Film className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
                <p className="text-white text-sm font-medium">Genre Classification</p>
                <p className="text-gray-500 text-xs mt-1">Primary & sub-genres</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <Heart className="w-8 h-8 mx-auto mb-2 text-[#FF69B4]" />
                <p className="text-white text-sm font-medium">Emotional Analysis</p>
                <p className="text-gray-500 text-xs mt-1">Mood & tone detection</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <Zap className="w-8 h-8 mx-auto mb-2 text-[#00D4C9]" />
                <p className="text-white text-sm font-medium">Pacing Analysis</p>
                <p className="text-gray-500 text-xs mt-1">Fast/moderate/slow</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {!isAnalyzing && project.deep_analysis_complete && analysisData && (
          <div className="space-y-6">

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl text-center">
                <Film className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
                <p className="text-2xl font-bold text-white mb-1">
                  {analysisData.genre_classification?.primary_genre}
                </p>
                <p className="text-xs text-gray-400">Primary Genre</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#FF69B4]/10 to-[#9D4EDD]/10 border border-[#FF69B4]/30 rounded-xl text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-[#FF69B4]" />
                <p className="text-2xl font-bold text-white mb-1">
                  {analysisData.emotional_tone?.primary_mood}
                </p>
                <p className="text-xs text-gray-400">Mood</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-xl text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-[#00D4C9]" />
                <p className="text-2xl font-bold text-white mb-1">
                  {analysisData.pacing_analysis?.overall_pace}
                </p>
                <p className="text-xs text-gray-400">Pacing</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-[#9D4EDD]" />
                <p className={`text-2xl font-bold mb-1 ${getScoreColor(analysisData.quality_scores?.overall_production_value || 0)}`}>
                  {analysisData.quality_scores?.overall_production_value || 0}
                </p>
                <p className="text-xs text-gray-400">Quality Score</p>
              </div>
            </div>

            <Tabs defaultValue="genre" className="w-full">
              <TabsList className="bg-[#0B0B0C] rounded-xl grid grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="genre">Genre</TabsTrigger>
                <TabsTrigger value="emotion">Emotion</TabsTrigger>
                <TabsTrigger value="pacing">Pacing</TabsTrigger>
                <TabsTrigger value="visual">Visual</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="recommendations">Tips</TabsTrigger>
              </TabsList>

              {/* Genre Tab */}
              <TabsContent value="genre">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Film className="w-5 h-5 text-[#FFD700]" />
                      Genre Classification
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-2">PRIMARY GENRE</p>
                        <Badge className="bg-[#FFD700]/20 text-[#FFD700]  text-lg px-3 py-1">
                          {analysisData.genre_classification?.primary_genre}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">CONTENT STYLE</p>
                        <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] text-lg px-3 py-1">
                          {analysisData.genre_classification?.content_style}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">SUB-GENRES</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.genre_classification?.sub_genres?.map((sub, idx) => (
                          <Badge key={idx} className="bg-[#0B0B0C] text-gray-300">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">PRIMARY PURPOSE</p>
                      <Badge className="bg-green-500/20 text-green-400">
                        {analysisData.genre_classification?.primary_purpose}
                      </Badge>
                    </div>

                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs mb-2">TARGET AUDIENCE</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-white">
                          <span className="text-gray-500">Age:</span> {analysisData.genre_classification?.target_audience?.age_range}
                        </p>
                        <p className="text-white">
                          <span className="text-gray-500">Level:</span> {analysisData.genre_classification?.target_audience?.expertise_level}
                        </p>
                        <div>
                          <p className="text-gray-500 mb-1">Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {analysisData.genre_classification?.target_audience?.interests?.map((interest, idx) => (
                              <Badge key={idx} className="bg-blue-500/20 text-blue-400 text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#00D4C9]" />
                      Platform Recommendations
                    </h5>
                    <div className="space-y-2">
                      {analysisData.genre_classification?.platform_recommendations?.map((platform, idx) => (
                        <div key={idx} className="p-3 bg-[#111317] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">{platform.platform}</p>
                            <Badge className={`${
                              platform.suitability_score >= 80 ? 'bg-green-500/20 text-green-400' :
                              platform.suitability_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {platform.suitability_score}% match
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs">{platform.format_suggestions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Emotion Tab */}
              <TabsContent value="emotion">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gradient-to-br from-[#FF69B4]/10 to-[#9D4EDD]/10 border border-[#FF69B4]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#FF69B4]" />
                      Emotional Analysis
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-2">PRIMARY MOOD</p>
                        <p className="text-white text-2xl font-bold">{analysisData.emotional_tone?.primary_mood}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-2">SENTIMENT</p>
                        <Badge className={`text-lg ${
                          analysisData.emotional_tone?.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' :
                          analysisData.emotional_tone?.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {analysisData.emotional_tone?.sentiment}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">EMOTIONAL TONES</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisData.emotional_tone?.emotional_tones?.map((tone, idx) => (
                          <Badge key={idx} className="bg-[#FF69B4]/20 text-[#FF69B4]">
                            {tone}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-3">ENERGY LEVEL</p>
                      <div className="flex items-center gap-3">
                        <Progress value={analysisData.emotional_tone?.energy_level} className="flex-1 h-3" />
                        <span className="text-white font-bold">{analysisData.emotional_tone?.energy_level}%</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs mb-2">EMOTIONAL ARC</p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Beginning</p>
                          <p className="text-white text-sm font-medium">{analysisData.emotional_tone?.emotional_arc?.beginning}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Middle</p>
                          <p className="text-white text-sm font-medium">{analysisData.emotional_tone?.emotional_arc?.middle}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Ending</p>
                          <p className="text-white text-sm font-medium">{analysisData.emotional_tone?.emotional_arc?.ending}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        🎯 <strong>Target Emotion:</strong> {analysisData.emotional_tone?.target_viewer_emotion}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h5 className="text-white font-semibold mb-2">Mood Keywords</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.emotional_tone?.mood_keywords?.map((keyword, idx) => (
                        <Badge key={idx} className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Pacing Tab */}
              <TabsContent value="pacing">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#00D4C9]" />
                      Pacing Analysis
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                        <p className="text-gray-400 text-xs mb-1">Overall Pace</p>
                        <Badge className={`${getPaceColor(analysisData.pacing_analysis?.overall_pace)} text-lg`}>
                          {analysisData.pacing_analysis?.overall_pace}
                        </Badge>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                        <p className="text-gray-400 text-xs mb-1">Pacing Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analysisData.pacing_analysis?.pacing_score)}`}>
                          {analysisData.pacing_analysis?.pacing_score}
                        </p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                        <p className="text-gray-400 text-xs mb-1">Cuts/Minute</p>
                        <p className="text-2xl font-bold text-white">
                          {analysisData.pacing_analysis?.cuts_per_minute}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-2">SCENE VARIETY</p>
                        <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                          {analysisData.pacing_analysis?.scene_variety}
                        </Badge>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-2">IDEAL LENGTH</p>
                        <p className="text-white text-sm">
                          {Math.floor(analysisData.pacing_analysis?.ideal_length_range?.min_seconds / 60)}:
                          {String(analysisData.pacing_analysis?.ideal_length_range?.min_seconds % 60).padStart(2, '0')} - {' '}
                          {Math.floor(analysisData.pacing_analysis?.ideal_length_range?.max_seconds / 60)}:
                          {String(analysisData.pacing_analysis?.ideal_length_range?.max_seconds % 60).padStart(2, '0')}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs mb-3">ENGAGEMENT STRATEGY</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-white">
                          <span className="text-gray-500">Hook Duration:</span>{' '}
                          {analysisData.pacing_analysis?.engagement_strategy?.hook_duration}s
                        </p>
                        <p className="text-white">
                          <span className="text-gray-500">Retention Technique:</span>{' '}
                          {analysisData.pacing_analysis?.engagement_strategy?.retention_technique}
                        </p>
                        <p className="text-white">
                          <span className="text-gray-500">Outro Timing:</span>{' '}
                          Last {analysisData.pacing_analysis?.engagement_strategy?.outro_timing}s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Visual Tab */}
              <TabsContent value="visual">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-[#9D4EDD]" />
                      Visual Elements
                    </h4>

                    <div className="mb-4">
                      <p className="text-gray-400 text-xs mb-2">DOMINANT COLORS</p>
                      <div className="flex gap-2">
                        {analysisData.visual_elements?.dominant_colors?.map((color, idx) => (
                          <div key={idx} className="flex-1">
                            <div
                              className="w-full h-16 rounded-lg border border-gray-700 mb-1"
                              style={{ backgroundColor: color }}
                            />
                            <p className="text-gray-500 text-xs text-center">{color}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-2 bg-[#0B0B0C] rounded text-center">
                        <Sun className="w-5 h-5 mx-auto mb-1 text-[#FFD700]" />
                        <p className="text-gray-500 text-xs">Temperature</p>
                        <p className="text-white text-sm font-semibold capitalize">
                          {analysisData.visual_elements?.color_temperature}
                        </p>
                      </div>
                      <div className="p-2 bg-[#0B0B0C] rounded text-center">
                        <Droplet className="w-5 h-5 mx-auto mb-1 text-[#00D4C9]" />
                        <p className="text-gray-500 text-xs">Saturation</p>
                        <p className="text-white text-sm font-semibold capitalize">
                          {analysisData.visual_elements?.color_grading?.saturation}
                        </p>
                      </div>
                      <div className="p-2 bg-[#0B0B0C] rounded text-center">
                        <Contrast className="w-5 h-5 mx-auto mb-1 text-[#FF8C00]" />
                        <p className="text-gray-500 text-xs">Contrast</p>
                        <p className="text-white text-sm font-semibold capitalize">
                          {analysisData.visual_elements?.color_grading?.contrast}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-2">LIGHTING</p>
                        <p className="text-white text-sm">
                          <span className="text-gray-500">Style:</span> {analysisData.visual_elements?.lighting?.style}
                        </p>
                        <p className="text-white text-sm">
                          <span className="text-gray-500">Intensity:</span> {analysisData.visual_elements?.lighting?.intensity}
                        </p>
                        <p className="text-white text-sm">
                          <span className="text-gray-500">Shadows:</span> {analysisData.visual_elements?.lighting?.shadow_presence}
                        </p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-2">TEXTURE</p>
                        <p className="text-white text-sm">
                          <span className="text-gray-500">Type:</span> {analysisData.visual_elements?.texture?.type}
                        </p>
                        <p className="text-white text-sm">
                          <span className="text-gray-500">Feel:</span> {analysisData.visual_elements?.texture?.feel}
                        </p>
                        <p className="text-white text-sm">
                          <span className="text-gray-500">Film Grain:</span> {analysisData.visual_elements?.texture?.film_grain ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs mb-2">COMPOSITION</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Style</p>
                          <p className="text-white font-medium">{analysisData.visual_elements?.composition?.style}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Shots</p>
                          <p className="text-white font-medium">{analysisData.visual_elements?.composition?.shot_variety}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Camera</p>
                          <p className="text-white font-medium">{analysisData.visual_elements?.composition?.camera_movement}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Quality Tab */}
              <TabsContent value="quality">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border border-[#06D6A0]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#06D6A0]" />
                      Quality Assessment
                    </h4>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-2">Production Value</p>
                        <p className={`text-4xl font-bold ${getScoreColor(analysisData.quality_scores?.overall_production_value)}`}>
                          {analysisData.quality_scores?.overall_production_value}
                        </p>
                        <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] mt-2">
                          {analysisData.quality_scores?.production_level}
                        </Badge>
                      </div>
                      <div className="p-4 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-3">Technical Quality</p>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Video</span>
                              <span className={getScoreColor(analysisData.quality_scores?.technical_scores?.video_quality)}>
                                {analysisData.quality_scores?.technical_scores?.video_quality}%
                              </span>
                            </div>
                            <Progress value={analysisData.quality_scores?.technical_scores?.video_quality} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Audio</span>
                              <span className={getScoreColor(analysisData.quality_scores?.technical_scores?.audio_quality)}>
                                {analysisData.quality_scores?.technical_scores?.audio_quality}%
                              </span>
                            </div>
                            <Progress value={analysisData.quality_scores?.technical_scores?.audio_quality} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Editing</span>
                              <span className={getScoreColor(analysisData.quality_scores?.technical_scores?.editing_quality)}>
                                {analysisData.quality_scores?.technical_scores?.editing_quality}%
                              </span>
                            </div>
                            <Progress value={analysisData.quality_scores?.technical_scores?.editing_quality} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {analysisData.quality_scores?.strengths?.map((strength, idx) => (
                            <li key={idx} className="text-gray-300 text-xs">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 text-sm font-semibold mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Areas to Improve
                        </p>
                        <ul className="space-y-1">
                          {analysisData.quality_scores?.improvement_areas?.map((area, idx) => (
                            <li key={idx} className="text-gray-300 text-xs">• {area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-[#FFD700]" />
                      AI Recommendations
                    </h4>

                    {/* Music Recommendations */}
                    <div className="mb-4 p-3 bg-[#0B0B0C] rounded-lg">
                      <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Music className="w-4 h-4 text-[#9D4EDD]" />
                        Music Recommendations
                      </h5>
                      <div className="space-y-2">
                        {analysisData.recommendations?.music_recommendations?.map((music, idx) => (
                          <div key={idx} className="p-2 bg-[#111317] rounded">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white text-sm font-medium">{music.genre}</p>
                              <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                                {music.mood}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs mb-1">{music.tempo_range}</p>
                            <p className="text-gray-500 text-xs">{music.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Editing Suggestions */}
                    <div className="mb-4 p-3 bg-[#0B0B0C] rounded-lg">
                      <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-[#00D4C9]" />
                        Editing Suggestions
                      </h5>
                      <ul className="space-y-1">
                        {analysisData.recommendations?.editing_suggestions?.map((suggestion, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-[#00D4C9] flex-shrink-0">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Color Grading Tips */}
                    <div className="mb-4 p-3 bg-[#0B0B0C] rounded-lg">
                      <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#FF69B4]" />
                        Color Grading Tips
                      </h5>
                      <ul className="space-y-1">
                        {analysisData.recommendations?.color_grading_tips?.map((tip, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-[#FF69B4] flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pacing Adjustments */}
                    <div className="mb-4 p-3 bg-[#0B0B0C] rounded-lg">
                      <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#FFD700]" />
                        Pacing Adjustments
                      </h5>
                      <ul className="space-y-1">
                        {analysisData.recommendations?.pacing_adjustments?.map((adjustment, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-[#FFD700] flex-shrink-0">•</span>
                            <span>{adjustment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Optimization Tips */}
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#06D6A0]" />
                        Content Optimization
                      </h5>
                      <ul className="space-y-1">
                        {analysisData.recommendations?.optimization_tips?.map((tip, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-[#06D6A0] flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

            </Tabs>

            {/* Analysis Date */}
            <div className="text-center text-gray-500 text-xs">
              Analysis completed on {new Date(analysisData.analyzed_at).toLocaleString()}
            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
}