import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, TrendingUp, Loader2, Sparkles, Copy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AIContentIdeation({ onIdeaSelected }) {
  const [niche, setNiche] = useState("");
  const [topic, setTopic] = useState("");
  const [scriptType, setScriptType] = useState("tutorial");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  const scriptTypes = [
    { value: "ad", label: "📢 Ad/Commercial", description: "Product promotion" },
    { value: "reel", label: "📱 Short Reel", description: "Quick engaging content" },
    { value: "tutorial", label: "📚 Tutorial", description: "How-to content" },
    { value: "story", label: "📖 Story", description: "Narrative content" },
    { value: "testimonial", label: "⭐ Testimonial", description: "Customer success" },
    { value: "explainer", label: "💡 Explainer", description: "Educational content" }
  ];

  const generateIdeas = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 viral video content ideas for:

Niche: ${niche}
Topic: ${topic}
Content Type: ${scriptType}

For each idea, provide:

1. HOOK (First 3 seconds):
   - Attention-grabbing opening line
   - Why it works

2. TITLE (60 chars max):
   - Click-worthy
   - SEO optimized
   - Platform specific

3. CONTENT ANGLE:
   - Unique perspective
   - Value proposition
   - Target sub-audience

4. SCRIPT OUTLINE:
   - Scene 1: Opening hook
   - Scene 2-4: Main content beats
   - Scene 5: Call-to-action

5. VISUAL STYLE:
   - B-roll suggestions
   - On-screen text ideas
   - Color/mood

6. VIRAL POTENTIAL:
   - Estimated engagement score (0-100)
   - Why it could go viral
   - Platform recommendations (YouTube/TikTok/Instagram)

Make them diverse and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  idea_number: { type: "number" },
                  hook: { type: "string" },
                  hook_rationale: { type: "string" },
                  title: { type: "string" },
                  angle: { type: "string" },
                  target_audience: { type: "string" },
                  script_outline: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        scene: { type: "number" },
                        description: { type: "string" },
                        duration_seconds: { type: "number" }
                      }
                    }
                  },
                  visual_style: {
                    type: "object",
                    properties: {
                      b_roll: { type: "array", items: { type: "string" } },
                      text_overlays: { type: "array", items: { type: "string" } },
                      mood: { type: "string" },
                      color_palette: { type: "array", items: { type: "string" } }
                    }
                  },
                  viral_score: { type: "number" },
                  viral_rationale: { type: "string" },
                  platforms: { type: "array", items: { type: "string" } },
                  estimated_duration_seconds: { type: "number" }
                }
              }
            }
          }
        }
      });

      setIdeas(response.ideas || []);
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas. Please try again.");
    }
    setIsGenerating(false);
  };

  const fetchTrendingTopics = async () => {
    setIsFetchingTrends(true);
    try {
      const trends = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the top 10 trending topics right now for ${niche || 'general content creators'}:

Use current trends from:
- YouTube trending videos
- TikTok viral hashtags
- Google Trends rising searches
- Twitter/X trending topics

For each trend, provide:
1. Topic name
2. Why it's trending
3. Search volume estimate
4. Content opportunity (how to create content around it)
5. Competition level (low/medium/high)
6. Urgency score (how fast you need to act, 0-100)`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  why_trending: { type: "string" },
                  search_volume: { type: "string" },
                  content_opportunity: { type: "string" },
                  competition: { type: "string" },
                  urgency_score: { type: "number" },
                  platforms: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setTrendingTopics(trends.trends || []);
    } catch (error) {
      console.error("Error fetching trends:", error);
      alert("Failed to fetch trending topics. Please try again.");
    }
    setIsFetchingTrends(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Ideation Form */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#FFD700]" />
            AI Content Ideation Engine
          </CardTitle>
          <p className="text-gray-400 text-sm mt-1">Generate viral video ideas powered by AI</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Your Niche (e.g., fitness, business, tech)"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
            <Input
              placeholder="Topic (e.g., productivity hacks, AI tools)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Content Type</label>
            <Select value={scriptType} onValueChange={setScriptType}>
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scriptTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateIdeas}
              disabled={!niche || !topic || isGenerating}
              className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate 5 Ideas
                </>
              )}
            </Button>
            <Button
              onClick={fetchTrendingTopics}
              disabled={isFetchingTrends}
              variant="outline"
              className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
            >
              {isFetchingTrends ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Get Trending Topics
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-[#FF8C00]/10 to-[#FFD700]/10 border-[#FF8C00]/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF8C00]" />
                Trending Right Now 🔥
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {trendingTopics.map((trend, idx) => (
                  <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FF8C00] transition-all cursor-pointer"
                       onClick={() => setTopic(trend.topic)}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">{trend.topic}</h4>
                      <Badge className={`text-xs ${
                        trend.urgency_score > 80 ? 'bg-red-500/20 text-red-400' :
                        trend.urgency_score > 50 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {trend.urgency_score}/100
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{trend.why_trending}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Volume: {trend.search_volume}</span>
                      <Badge className={`${
                        trend.competition === 'low' ? 'bg-green-500/20 text-green-400' :
                        trend.competition === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {trend.competition} competition
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Ideas */}
      {ideas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">AI-Generated Video Ideas ({ideas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <div key={idea.idea_number} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FFD700] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                            Idea #{idea.idea_number}
                          </Badge>
                          <Badge className={`text-xs ${
                            idea.viral_score > 80 ? 'bg-green-500/20 text-green-400' :
                            idea.viral_score > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            Viral Score: {idea.viral_score}/100
                          </Badge>
                          <Badge className="bg-gray-700 text-gray-300 text-xs">
                            ~{idea.estimated_duration_seconds}s
                          </Badge>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">{idea.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{idea.angle}</p>
                      </div>
                    </div>

                    {/* Hook */}
                    <div className="p-3 bg-gradient-to-r from-[#FF8C00]/10 to-[#FFD700]/10 border border-[#FF8C00]/30 rounded-lg mb-3">
                      <p className="text-[#FF8C00] text-xs mb-1">🎣 HOOK (First 3 seconds):</p>
                      <p className="text-white font-semibold text-sm mb-1">"{idea.hook}"</p>
                      <p className="text-gray-400 text-xs">{idea.hook_rationale}</p>
                    </div>

                    {/* Script Outline */}
                    <div className="mb-3">
                      <p className="text-gray-400 text-xs mb-2">SCRIPT OUTLINE:</p>
                      <div className="space-y-1">
                        {idea.script_outline?.map((scene, idx) => (
                          <div key={idx} className="flex gap-2 text-xs">
                            <Badge className="bg-gray-700 text-gray-300">
                              Scene {scene.scene}
                            </Badge>
                            <span className="text-gray-400">{scene.description}</span>
                            <span className="text-gray-600">({scene.duration_seconds}s)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visual Style */}
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div className="p-3 bg-[#111317] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">B-ROLL:</p>
                        <div className="flex flex-wrap gap-1">
                          {idea.visual_style?.b_roll?.slice(0, 3).map((item, idx) => (
                            <Badge key={idx} className="bg-blue-500/20 text-blue-400 text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-[#111317] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">MOOD:</p>
                        <p className="text-white text-sm">{idea.visual_style?.mood}</p>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {idea.platforms?.map((platform, idx) => (
                          <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onIdeaSelected(idea)}
                        className="bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-lg"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Use This Idea
                      </Button>
                    </div>

                    {/* Viral Potential */}
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-xs mb-1">💡 WHY IT COULD GO VIRAL:</p>
                      <p className="text-gray-300 text-sm">{idea.viral_rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
}