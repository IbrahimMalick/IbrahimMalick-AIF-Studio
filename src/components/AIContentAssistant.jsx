
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  FileText,
  Hash,
  Image as ImageIcon,
  Copy,
  Download,
  Wand2,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Target,
  RefreshCw,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Search,
  Eye,
  Lightbulb,
  Zap,
  MessageSquare,
  Film,
  Type,
  Palette,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIContentAssistant({ project, currentUser }) {
  const [activeTab, setActiveTab] = useState("script");
  const [isGenerating, setIsGenerating] = useState(false);

  // Script Generation
  const [scriptParams, setScriptParams] = useState({
    topic: "",
    genre: "educational",
    target_audience: "general",
    duration_target: 180,
    tone: "professional"
  });
  const [generatedScript, setGeneratedScript] = useState(null);

  // Title/Description Generation
  const [titleDescParams, setTitleDescParams] = useState({
    target_platform: "youtube",
    target_keywords: "",
    content_focus: ""
  });
  const [generatedTitles, setGeneratedTitles] = useState(null);

  // Social Media Snippets
  const [socialPlatform, setSocialPlatform] = useState("instagram");
  const [generatedSocial, setGeneratedSocial] = useState(null);

  // Thumbnail Suggestions
  const [thumbnailStyle, setThumbnailStyle] = useState("bold");
  const [generatedThumbnails, setGeneratedThumbnails] = useState(null);

  // Generate Script
  const generateScriptMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      const analysis = project.deep_analysis_data;
      
      const script = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive video script:

PARAMETERS:
- Topic: ${scriptParams.topic || project.title}
- Genre: ${scriptParams.genre}
- Target Audience: ${scriptParams.target_audience}
- Target Duration: ${scriptParams.duration_target} seconds
- Tone: ${scriptParams.tone}

${analysis ? `
VIDEO ANALYSIS DATA:
- Actual Genre: ${analysis.genre_classification?.primary_genre}
- Content Style: ${analysis.genre_classification?.content_style}
- Mood: ${analysis.emotional_tone?.primary_mood}
- Energy Level: ${analysis.emotional_tone?.energy_level}/100
- Target Audience: ${analysis.genre_classification?.target_audience?.age_range}
- Pacing: ${analysis.pacing_analysis?.overall_pace}
` : ''}

Generate a professional video script with:

1. HOOK (First 15 seconds):
   - Attention-grabbing opening
   - Question or statement
   - Set expectations

2. INTRODUCTION (Next 30 seconds):
   - Who you are
   - What they'll learn
   - Why it matters

3. MAIN CONTENT (Sections):
   - Break into 3-5 key sections
   - Each section: topic + talking points
   - Scene suggestions
   - Visual cues
   - Timing estimates

4. ENGAGEMENT POINTS:
   - Where to ask questions
   - When to add B-roll
   - Call-to-action moments

5. CONCLUSION (Last 30 seconds):
   - Summary of key points
   - Final CTA
   - Next steps

6. METADATA:
   - Estimated word count
   - Speaking pace
   - Scene count
   - Visual assets needed

Format as a production-ready script with timestamps.`,
        response_json_schema: {
          type: "object",
          properties: {
            hook: {
              type: "object",
              properties: {
                duration_seconds: { type: "number" },
                script_text: { type: "string" },
                visual_suggestion: { type: "string" }
              }
            },
            introduction: {
              type: "object",
              properties: {
                duration_seconds: { type: "number" },
                script_text: { type: "string" },
                visual_suggestion: { type: "string" }
              }
            },
            main_sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section_number: { type: "number" },
                  title: { type: "string" },
                  duration_seconds: { type: "number" },
                  script_text: { type: "string" },
                  talking_points: { type: "array", items: { type: "string" } },
                  visual_suggestions: { type: "array", items: { type: "string" } },
                  b_roll_moments: { type: "array", items: { type: "string" } }
                }
              }
            },
            conclusion: {
              type: "object",
              properties: {
                duration_seconds: { type: "number" },
                script_text: { type: "string" },
                cta_text: { type: "string" }
              }
            },
            engagement_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp_seconds: { type: "number" },
                  type: { type: "string" },
                  suggestion: { type: "string" }
                }
              }
            },
            metadata: {
              type: "object",
              properties: {
                total_word_count: { type: "number" },
                estimated_speaking_time: { type: "number" },
                scene_count: { type: "number" },
                pacing: { type: "string" },
                visual_assets_needed: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setGeneratedScript(script);
      setIsGenerating(false);
      return script;
    },
  });

  // Generate Titles & Descriptions
  const generateTitlesDescMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      const analysis = project.deep_analysis_data;
      
      const content = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate SEO-optimized titles and descriptions for this video:

VIDEO PROJECT:
- Title: ${project.title}
- Description: ${project.description || 'N/A'}

${analysis ? `
ANALYSIS:
- Genre: ${analysis.genre_classification?.primary_genre}
- Sub-genres: ${analysis.genre_classification?.sub_genres?.join(', ')}
- Target Audience: ${analysis.genre_classification?.target_audience?.age_range}
- Mood: ${analysis.emotional_tone?.primary_mood}
- Purpose: ${analysis.genre_classification?.primary_purpose}
` : ''}

PARAMETERS:
- Target Platform: ${titleDescParams.target_platform}
- Focus Keywords: ${titleDescParams.target_keywords || 'Auto-detect'}
- Content Focus: ${titleDescParams.content_focus || 'Auto-detect'}

Generate:

1. TITLES (5 variations):
   - SEO optimized with target keywords
   - Click-worthy and engaging
   - Platform-specific length (YouTube: 60-70 chars, Instagram: 30-40 chars)
   - Include power words
   - Number-based or question format where appropriate
   - Emoji usage (if platform-appropriate)

2. DESCRIPTIONS (3 variations):
   - SEO keyword density
   - Timestamps for chapters
   - CTA included
   - Link placeholders
   - Hashtag suggestions
   - Platform-optimized length

3. SEO METADATA:
   - Primary keywords (5-7)
   - Secondary keywords (10-15)
   - Hashtags (10-15)
   - Tags (YouTube specific)
   - Search terms to rank for

4. ENGAGEMENT SCORE:
   - Predicted CTR (click-through rate)
   - SEO score (0-100)
   - Engagement potential (0-100)`,
        response_json_schema: {
          type: "object",
          properties: {
            titles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  character_count: { type: "number" },
                  seo_score: { type: "number" },
                  click_potential: { type: "number" },
                  keywords_used: { type: "array", items: { type: "string" } }
                }
              }
            },
            descriptions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  word_count: { type: "number" },
                  includes_timestamps: { type: "boolean" },
                  includes_cta: { type: "boolean" },
                  seo_density: { type: "number" }
                }
              }
            },
            seo_metadata: {
              type: "object",
              properties: {
                primary_keywords: { type: "array", items: { type: "string" } },
                secondary_keywords: { type: "array", items: { type: "string" } },
                hashtags: { type: "array", items: { type: "string" } },
                youtube_tags: { type: "array", items: { type: "string" } }
              }
            },
            engagement_predictions: {
              type: "object",
              properties: {
                predicted_ctr: { type: "number" },
                overall_seo_score: { type: "number" },
                engagement_potential: { type: "number" }
              }
            }
          }
        }
      });

      setGeneratedTitles(content);
      setIsGenerating(false);
      return content;
    },
  });

  // Generate Social Media Snippets
  const generateSocialMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      const analysis = project.deep_analysis_data;
      
      const social = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate social media content for this video:

VIDEO: ${project.title}
DESCRIPTION: ${project.description || 'N/A'}

${analysis ? `
CONTENT ANALYSIS:
- Genre: ${analysis.genre_classification?.primary_genre}
- Mood: ${analysis.emotional_tone?.primary_mood}
- Target Audience: ${analysis.genre_classification?.target_audience?.interests?.join(', ')}
- Key Topics: ${analysis.genre_classification?.sub_genres?.join(', ')}
` : ''}

TARGET PLATFORM: ${socialPlatform}

Generate platform-optimized content:

FOR ${socialPlatform.toUpperCase()}:

1. CAPTIONS (5 variations):
   - Platform character limits (Instagram: 2200, Twitter: 280, etc.)
   - Emoji usage (heavy for Instagram, moderate for LinkedIn)
   - Hashtag strategy (#count varies by platform)
   - Call-to-action
   - Link placement
   - Tone matching platform culture

2. HOOKS (3 first-line options):
   - Attention-grabbing opening sentence
   - Question or bold statement
   - Pattern interrupt

3. HASHTAG SETS (3 groups):
   - High-volume hashtags (reach)
   - Medium-volume hashtags (targeted)
   - Niche hashtags (engagement)
   - Mix of sizes for each set

4. THREAD/CAROUSEL IDEAS (if applicable):
   - Multi-post sequence
   - Carousel slide topics
   - Thread structure

5. BEST POSTING TIME:
   - Optimal day/time for platform
   - Reasoning based on audience`,
        response_json_schema: {
          type: "object",
          properties: {
            captions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  caption: { type: "string" },
                  character_count: { type: "number" },
                  emoji_count: { type: "number" },
                  hashtag_count: { type: "number" },
                  engagement_score: { type: "number" }
                }
              }
            },
            hooks: { type: "array", items: { type: "string" } },
            hashtag_sets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  set_name: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  strategy: { type: "string" }
                }
              }
            },
            content_ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  slides_or_posts: { type: "array", items: { type: "string" } }
                }
              }
            },
            best_posting_time: {
              type: "object",
              properties: {
                day: { type: "string" },
                time: { type: "string" },
                timezone: { type: "string" },
                reasoning: { type: "string" }
              }
            }
          }
        }
      });

      setGeneratedSocial(social);
      setIsGenerating(false);
      return social;
    },
  });

  // Generate Thumbnail Suggestions
  const generateThumbnailsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      const analysis = project.deep_analysis_data;
      
      const thumbnails = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate thumbnail design suggestions for this video:

VIDEO: ${project.title}
GENRE: ${analysis?.genre_classification?.primary_genre || 'General'}

${analysis ? `
VISUAL ANALYSIS:
- Dominant Colors: ${analysis.visual_elements?.dominant_colors?.join(', ')}
- Color Temperature: ${analysis.visual_elements?.color_temperature}
- Lighting Style: ${analysis.visual_elements?.lighting?.style}
- Mood: ${analysis.emotional_tone?.primary_mood}
- Energy Level: ${analysis.emotional_tone?.energy_level}/100
- Visual Complexity: ${analysis.visual_elements?.visual_complexity}

TARGET AUDIENCE:
- Age: ${analysis.genre_classification?.target_audience?.age_range}
- Interests: ${analysis.genre_classification?.target_audience?.interests?.join(', ')}
` : ''}

STYLE PREFERENCE: ${thumbnailStyle}

Generate 5 thumbnail concepts with:

1. COMPOSITION:
   - Layout structure (rule of thirds, centered, dynamic)
   - Key elements placement
   - Focal point
   - Visual hierarchy

2. TEXT OVERLAY:
   - Main headline (3-5 words, bold, readable)
   - Font style recommendation
   - Text color
   - Stroke/shadow for readability
   - Text placement

3. COLOR SCHEME:
   - Background colors (2-3 colors)
   - Text colors
   - Accent colors
   - Color psychology reasoning

4. VISUAL ELEMENTS:
   - Main subject/object
   - Background style
   - Graphics/icons to add
   - Emotional expression (if face)

5. STYLE SPECIFICS:
   - Bold: High contrast, bright colors, large text
   - Minimalist: Clean, simple, single focus
   - Dramatic: Dark, cinematic, intense
   - Colorful: Vibrant, energetic, fun
   - Professional: Clean, corporate, trustworthy

6. PREDICTED PERFORMANCE:
   - Click-through rate potential
   - A/B test recommendations
   - Why this will work

Each concept should be distinct and platform-optimized.`,
        response_json_schema: {
          type: "object",
          properties: {
            concepts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  concept_number: { type: "number" },
                  concept_name: { type: "string" },
                  composition: {
                    type: "object",
                    properties: {
                      layout: { type: "string" },
                      focal_point: { type: "string" },
                      visual_hierarchy: { type: "string" }
                    }
                  },
                  text_overlay: {
                    type: "object",
                    properties: {
                      headline: { type: "string" },
                      font_style: { type: "string" },
                      text_color: { type: "string" },
                      placement: { type: "string" }
                    }
                  },
                  color_scheme: {
                    type: "object",
                    properties: {
                      background_colors: { type: "array", items: { type: "string" } },
                      text_color: { type: "string" },
                      accent_color: { type: "string" },
                      psychology: { type: "string" }
                    }
                  },
                  visual_elements: {
                    type: "array",
                    items: { type: "string" }
                  },
                  predicted_ctr: { type: "number" },
                  why_it_works: { type: "string" },
                  ab_test_variation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedThumbnails(thumbnails);
      setIsGenerating(false);
      return thumbnails;
    },
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard!");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD700]" />
            AI Content Assistant
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0B0B0C] rounded-xl grid grid-cols-4">
            <TabsTrigger value="script">
              <FileText className="w-4 h-4 mr-2" />
              Script
            </TabsTrigger>
            <TabsTrigger value="titles">
              <Type className="w-4 h-4 mr-2" />
              Titles
            </TabsTrigger>
            <TabsTrigger value="social">
              <Hash className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="thumbnails">
              <ImageIcon className="w-4 h-4 mr-2" />
              Thumbnails
            </TabsTrigger>
          </TabsList>

          {/* SCRIPT GENERATION */}
          <TabsContent value="script">
            <div className="space-y-4 mt-4">
              
              {/* Input Parameters */}
              {!generatedScript && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Topic/Subject</label>
                    <Input
                      value={scriptParams.topic}
                      onChange={(e) => setScriptParams({...scriptParams, topic: e.target.value})}
                      placeholder={`e.g., "${project.title}"`}
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Genre</label>
                      <Select
                        value={scriptParams.genre}
                        onValueChange={(value) => setScriptParams({...scriptParams, genre: value})}
                      >
                        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="educational">Educational/Tutorial</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="vlog">Vlog/Lifestyle</SelectItem>
                          <SelectItem value="review">Product Review</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="commercial">Commercial/Promo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Target Audience</label>
                      <Select
                        value={scriptParams.target_audience}
                        onValueChange={(value) => setScriptParams({...scriptParams, target_audience: value})}
                      >
                        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Audience</SelectItem>
                          <SelectItem value="beginners">Beginners</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced/Experts</SelectItem>
                          <SelectItem value="professionals">Professionals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Target Duration</label>
                      <Select
                        value={String(scriptParams.duration_target)}
                        onValueChange={(value) => setScriptParams({...scriptParams, duration_target: Number(value)})}
                      >
                        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">1 minute (Short)</SelectItem>
                          <SelectItem value="180">3 minutes (Standard)</SelectItem>
                          <SelectItem value="300">5 minutes (Medium)</SelectItem>
                          <SelectItem value="600">10 minutes (Long)</SelectItem>
                          <SelectItem value="1200">20+ minutes (Deep Dive)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Tone/Style</label>
                      <Select
                        value={scriptParams.tone}
                        onValueChange={(value) => setScriptParams({...scriptParams, tone: value})}
                      >
                        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual/Friendly</SelectItem>
                          <SelectItem value="energetic">Energetic/Exciting</SelectItem>
                          <SelectItem value="calm">Calm/Soothing</SelectItem>
                          <SelectItem value="humorous">Humorous/Fun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => generateScriptMutation.mutate()}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Generate Script
                  </Button>
                </div>
              )}

              {/* Generated Script */}
              {generatedScript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Metadata */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <FileText className="w-5 h-5 mx-auto mb-1 text-[#00D4C9]" />
                      <p className="text-white font-bold">{generatedScript.metadata.total_word_count}</p>
                      <p className="text-gray-400 text-xs">Words</p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-[#9D4EDD]" />
                      <p className="text-white font-bold">{formatTime(generatedScript.metadata.estimated_speaking_time)}</p>
                      <p className="text-gray-400 text-xs">Duration</p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <Film className="w-5 h-5 mx-auto mb-1 text-[#FFD700]" />
                      <p className="text-white font-bold">{generatedScript.metadata.scene_count}</p>
                      <p className="text-gray-400 text-xs">Scenes</p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <Zap className="w-5 h-5 mx-auto mb-1 text-[#06D6A0]" />
                      <p className="text-white font-bold capitalize">{generatedScript.metadata.pacing}</p>
                      <p className="text-gray-400 text-xs">Pacing</p>
                    </div>
                  </div>

                  {/* Hook */}
                  <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#FFD700]" />
                        Hook (0:00 - 0:{generatedScript.hook.duration_seconds})
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedScript.hook.script_text)}
                        className="border-[#FFD700]/30 hover:bg-[#FFD700]/10"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-white text-sm leading-relaxed mb-3">{generatedScript.hook.script_text}</p>
                    <div className="p-2 bg-[#0B0B0C] rounded">
                      <p className="text-gray-400 text-xs">
                        <strong className="text-[#00D4C9]">Visual:</strong> {generatedScript.hook.visual_suggestion}
                      </p>
                    </div>
                  </div>

                  {/* Introduction */}
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-bold">Introduction</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedScript.introduction.script_text)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{generatedScript.introduction.script_text}</p>
                    <p className="text-gray-400 text-xs">
                      <strong className="text-[#00D4C9]">Visual:</strong> {generatedScript.introduction.visual_suggestion}
                    </p>
                  </div>

                  {/* Main Sections */}
                  {generatedScript.main_sections.map((section, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold">
                          Section {section.section_number}: {section.title}
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(section.script_text)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">{section.script_text}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Talking Points:</p>
                          <ul className="space-y-1">
                            {section.talking_points.map((point, pIdx) => (
                              <li key={pIdx} className="text-gray-300 text-xs">• {point}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">B-Roll Suggestions:</p>
                          <div className="flex flex-wrap gap-1">
                            {section.b_roll_moments.map((broll, bIdx) => (
                              <Badge key={bIdx} className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                                {broll}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Conclusion */}
                  <div className="p-4 bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border border-[#06D6A0]/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#06D6A0]" />
                        Conclusion & CTA
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedScript.conclusion.script_text)}
                        className="border-[#06D6A0]/30 hover:bg-[#06D6A0]/10"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-white text-sm leading-relaxed mb-3">{generatedScript.conclusion.script_text}</p>
                    <div className="p-2 bg-[#0B0B0C] rounded">
                      <p className="text-[#06D6A0] text-xs font-semibold">
                        📢 CTA: {generatedScript.conclusion.cta_text}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setGeneratedScript(null)}
                      variant="outline"
                      className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate New
                    </Button>
                    <Button
                      onClick={() => {
                        const fullScript = `
HOOK (0:00-0:${generatedScript.hook.duration_seconds}):
${generatedScript.hook.script_text}

INTRODUCTION:
${generatedScript.introduction.script_text}

${generatedScript.main_sections.map(s => `
SECTION ${s.section_number}: ${s.title}
${s.script_text}
`).join('\n')}

CONCLUSION:
${generatedScript.conclusion.script_text}

CTA: ${generatedScript.conclusion.cta_text}
                        `;
                        copyToClipboard(fullScript);
                      }}
                      className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-xl"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Full Script
                    </Button>
                  </div>
                </motion.div>
              )}

            </div>
          </TabsContent>

          {/* TITLES & DESCRIPTIONS */}
          <TabsContent value="titles">
            <div className="space-y-4 mt-4">

              {!generatedTitles && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Target Platform</label>
                    <Select
                      value={titleDescParams.target_platform}
                      onValueChange={(value) => setTitleDescParams({...titleDescParams, target_platform: value})}
                    >
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Target Keywords (Optional)</label>
                    <Input
                      value={titleDescParams.target_keywords}
                      onChange={(e) => setTitleDescParams({...titleDescParams, target_keywords: e.target.value})}
                      placeholder="e.g., video editing, AI tools, tutorial"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <Button
                    onClick={() => generateTitlesDescMutation.mutate()}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl font-semibold"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Generate SEO Content
                  </Button>
                </div>
              )}

              {generatedTitles && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Predicted Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Predicted CTR</p>
                      <p className="text-2xl font-bold text-[#06D6A0]">
                        {generatedTitles.engagement_predictions.predicted_ctr}%
                      </p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">SEO Score</p>
                      <p className="text-2xl font-bold text-[#FFD700]">
                        {generatedTitles.engagement_predictions.overall_seo_score}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Engagement Potential</p>
                      <p className="text-2xl font-bold text-[#9D4EDD]">
                        {generatedTitles.engagement_predictions.engagement_potential}
                      </p>
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <h4 className="text-white font-bold mb-3">Generated Titles</h4>
                    <div className="space-y-2">
                      {generatedTitles.titles.map((title, idx) => (
                        <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FFD700] transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-white font-medium flex-1">{title.title}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(title.title)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                              {title.character_count} chars
                            </Badge>
                            <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                              SEO: {title.seo_score}/100
                            </Badge>
                            <Badge className="bg-[#06D6A0]/20 text-[#06D6A0]">
                              Click: {title.click_potential}%
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {title.keywords_used.map((kw, kIdx) => (
                              <Badge key={kIdx} className="bg-gray-800 text-gray-400 text-xs">
                                #{kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <h4 className="text-white font-bold mb-3">Generated Descriptions</h4>
                    <div className="space-y-3">
                      {generatedTitles.descriptions.map((desc, idx) => (
                        <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                              Option {idx + 1}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(desc.description)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                            {desc.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-400">{desc.word_count} words</span>
                            {desc.includes_timestamps && (
                              <Badge className="bg-green-500/20 text-green-400">✓ Timestamps</Badge>
                            )}
                            {desc.includes_cta && (
                              <Badge className="bg-blue-500/20 text-blue-400">✓ CTA</Badge>
                            )}
                            <span className="text-gray-400">SEO Density: {desc.seo_density}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEO Metadata */}
                  <div className="p-4 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Search className="w-5 h-5 text-[#00D4C9]" />
                      SEO Keywords & Tags
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Primary Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {generatedTitles.seo_metadata.primary_keywords.map((kw, idx) => (
                            <Badge key={idx} className="bg-[#FFD700]/20 text-[#FFD700]">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-2">Hashtags</p>
                        <div className="flex flex-wrap gap-1">
                          {generatedTitles.seo_metadata.hashtags.map((tag, idx) => (
                            <Badge key={idx} className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {generatedTitles.seo_metadata.youtube_tags && (
                        <div>
                          <p className="text-gray-400 text-xs mb-2">YouTube Tags</p>
                          <div className="flex flex-wrap gap-1">
                            {generatedTitles.seo_metadata.youtube_tags.slice(0, 10).map((tag, idx) => (
                              <Badge key={idx} className="bg-gray-700 text-gray-300 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatedTitles.seo_metadata.hashtags.map(h => `#${h}`).join(' '))}
                      className="w-full mt-3 bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Copy All Hashtags
                    </Button>
                  </div>

                  <Button
                    onClick={() => setGeneratedTitles(null)}
                    variant="outline"
                    className="w-full border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate New Variations
                  </Button>
                </motion.div>
              )}

            </div>
          </TabsContent>

          {/* SOCIAL MEDIA SNIPPETS */}
          <TabsContent value="social">
            <div className="space-y-4 mt-4">

              {!generatedSocial && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Platform</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
                        { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-blue-400' },
                        { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
                        { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
                        { id: 'tiktok', name: 'TikTok', icon: Film, color: 'bg-black' }
                      ].map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <button
                            key={platform.id}
                            onClick={() => setSocialPlatform(platform.id)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              socialPlatform === platform.id
                                ? 'border-[#FFD700] bg-[#FFD700]/10'
                                : 'border-gray-800 bg-[#0B0B0C] hover:border-gray-700'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-1 ${
                              socialPlatform === platform.id ? 'text-[#FFD700]' : 'text-gray-400'
                            }`} />
                            <p className={`text-xs ${
                              socialPlatform === platform.id ? 'text-white font-semibold' : 'text-gray-400'
                            }`}>
                              {platform.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => generateSocialMutation.mutate()}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-[#FF69B4] to-[#9D4EDD] text-white rounded-xl font-semibold"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Generate {socialPlatform.charAt(0).toUpperCase() + socialPlatform.slice(1)} Content
                  </Button>
                </div>
              )}

              {generatedSocial && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Best Posting Time */}
                  <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#FFD700]" />
                      Optimal Posting Time
                    </h4>
                    <p className="text-white text-lg mb-1">
                      {generatedSocial.best_posting_time.day} at {generatedSocial.best_posting_time.time}
                    </p>
                    <p className="text-gray-400 text-xs mb-2">{generatedSocial.best_posting_time.timezone}</p>
                    <p className="text-gray-300 text-sm">{generatedSocial.best_posting_time.reasoning}</p>
                  </div>

                  {/* Captions */}
                  <div>
                    <h4 className="text-white font-bold mb-3">Generated Captions</h4>
                    <div className="space-y-3">
                      {generatedSocial.captions.map((caption, idx) => (
                        <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                              Caption {idx + 1}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(caption.caption)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-white text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                            {caption.caption}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-400">{caption.character_count} chars</span>
                            <span className="text-gray-400">{caption.emoji_count} emojis</span>
                            <span className="text-gray-400">{caption.hashtag_count} hashtags</span>
                            <Badge className="bg-[#06D6A0]/20 text-[#06D6A0]">
                              Score: {caption.engagement_score}/100
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hook Options */}
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Opening Hooks</h4>
                    <div className="space-y-2">
                      {generatedSocial.hooks.map((hook, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-[#111317] rounded">
                          <Zap className="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm flex-1">{hook}</p>
                          <button
                            onClick={() => copyToClipboard(hook)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hashtag Sets */}
                  <div>
                    <h4 className="text-white font-bold mb-3">Hashtag Strategies</h4>
                    <div className="space-y-3">
                      {generatedSocial.hashtag_sets.map((set, idx) => (
                        <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">{set.set_name}</p>
                              <p className="text-gray-400 text-xs">{set.strategy}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(set.hashtags.join(' '))}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {set.hashtags.map((tag, tIdx) => (
                              <Badge key={tIdx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Ideas */}
                  {generatedSocial.content_ideas.length > 0 && (
                    <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-[#9D4EDD]" />
                        Multi-Post Ideas
                      </h4>
                      <div className="space-y-3">
                        {generatedSocial.content_ideas.map((idea, idx) => (
                          <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                            <p className="text-white font-medium mb-2">{idea.type}</p>
                            <p className="text-gray-400 text-sm mb-2">{idea.description}</p>
                            <div className="space-y-1">
                              {idea.slides_or_posts.map((item, iIdx) => (
                                <p key={iIdx} className="text-gray-300 text-xs">
                                  {iIdx + 1}. {item}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setGeneratedSocial(null)}
                    variant="outline"
                    className="w-full border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate for Different Platform
                  </Button>
                </motion.div>
              )}

            </div>
          </TabsContent>

          {/* THUMBNAIL SUGGESTIONS */}
          <TabsContent value="thumbnails">
            <div className="space-y-4 mt-4">

              {!generatedThumbnails && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Thumbnail Style</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { id: 'bold', name: 'Bold', desc: 'High contrast, bright' },
                        { id: 'minimalist', name: 'Minimalist', desc: 'Clean, simple' },
                        { id: 'dramatic', name: 'Dramatic', desc: 'Dark, cinematic' },
                        { id: 'colorful', name: 'Colorful', desc: 'Vibrant, energetic' },
                        { id: 'professional', name: 'Professional', desc: 'Clean, corporate' }
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setThumbnailStyle(style.id)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            thumbnailStyle === style.id
                              ? 'border-[#FFD700] bg-[#FFD700]/10'
                              : 'border-gray-800 bg-[#0B0B0C] hover:border-gray-700'
                          }`}
                        >
                          <Palette className={`w-5 h-5 mb-1 ${
                            thumbnailStyle === style.id ? 'text-[#FFD700]' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            thumbnailStyle === style.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {style.name}
                          </p>
                          <p className="text-gray-500 text-xs">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => generateThumbnailsMutation.mutate()}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black rounded-xl font-semibold"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    Generate Thumbnail Concepts
                  </Button>
                </div>
              )}

              {generatedThumbnails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {generatedThumbnails.concepts.map((concept, idx) => (
                    <div key={idx} className="p-5 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-bold text-lg">{concept.concept_name}</h4>
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] mt-1">
                            Predicted CTR: {concept.predicted_ctr}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-[#06D6A0]/20 text-[#06D6A0]">
                            Concept #{concept.concept_number}
                          </Badge>
                        </div>
                      </div>

                      {/* Mock Thumbnail Preview */}
                      <div 
                        className="w-full aspect-video rounded-xl mb-4 flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${concept.color_scheme.background_colors[0]}, ${concept.color_scheme.background_colors[1] || concept.color_scheme.background_colors[0]})`
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="relative z-10 text-center p-6">
                          <p 
                            className="font-black text-3xl md:text-4xl leading-tight"
                            style={{ 
                              color: concept.text_overlay.text_color,
                              textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
                            }}
                          >
                            {concept.text_overlay.headline}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {/* Composition */}
                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">COMPOSITION</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-white">
                              <span className="text-gray-500">Layout:</span> {concept.composition.layout}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-500">Focal Point:</span> {concept.composition.focal_point}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-500">Hierarchy:</span> {concept.composition.visual_hierarchy}
                            </p>
                          </div>
                        </div>

                        {/* Text Details */}
                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">TEXT OVERLAY</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-white">
                              <span className="text-gray-500">Font:</span> {concept.text_overlay.font_style}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-500">Color:</span> {concept.text_overlay.text_color}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-500">Placement:</span> {concept.text_overlay.placement}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Color Scheme */}
                      <div className="p-3 bg-[#0B0B0C] rounded-lg mb-4">
                        <p className="text-gray-400 text-xs mb-2">COLOR SCHEME</p>
                        <div className="flex gap-2 mb-2">
                          {concept.color_scheme.background_colors.map((color, cIdx) => (
                            <div key={cIdx} className="flex-1">
                              <div
                                className="w-full h-12 rounded border border-gray-700"
                                style={{ backgroundColor: color }}
                              />
                              <p className="text-gray-500 text-xs mt-1 text-center">{color}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-300 text-xs">
                          <strong className="text-[#00D4C9]">Psychology:</strong> {concept.color_scheme.psychology}
                        </p>
                      </div>

                      {/* Visual Elements */}
                      <div className="p-3 bg-[#0B0B0C] rounded-lg mb-4">
                        <p className="text-gray-400 text-xs mb-2">VISUAL ELEMENTS</p>
                        <div className="flex flex-wrap gap-1">
                          {concept.visual_elements.map((element, eIdx) => (
                            <Badge key={eIdx} className="bg-gray-700 text-gray-300 text-xs">
                              {element}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Why It Works */}
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-3">
                        <p className="text-green-400 text-sm font-semibold mb-1">💡 Why This Works:</p>
                        <p className="text-gray-300 text-sm">{concept.why_it_works}</p>
                      </div>

                      {/* A/B Test Variation */}
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-xs mb-1">A/B Test Variation:</p>
                        <p className="text-gray-300 text-sm">{concept.ab_test_variation}</p>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={() => setGeneratedThumbnails(null)}
                    variant="outline"
                    className="w-full border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate New Concepts
                  </Button>
                </motion.div>
              )}

            </div>
          </TabsContent>

        </Tabs>

      </CardContent>
    </Card>
  );
}
