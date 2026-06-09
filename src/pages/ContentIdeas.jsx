import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Lightbulb,
  Sparkles,
  Loader2,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Trash2,
  RefreshCw,
  Video,
  FileText,
  Image,
  Mic,
  Copy,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CONTENT_TYPES = [
  { value: "all", label: "All Types", icon: Sparkles },
  { value: "short_video", label: "Short Video", icon: Video },
  { value: "long_video", label: "Long Video", icon: Video },
  { value: "blog_post", label: "Blog Post", icon: FileText },
  { value: "social_post", label: "Social Post", icon: Image },
  { value: "podcast", label: "Podcast", icon: Mic },
];

const NICHES = [
  "Business & Entrepreneurship", "Marketing & Sales", "Technology & AI",
  "Health & Wellness", "Finance & Investing", "Lifestyle & Travel",
  "Education & Tutorials", "Entertainment", "Food & Cooking", "Fitness"
];

export default function ContentIdeas() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [niche, setNiche] = useState("");
  const [contentType, setContentType] = useState("all");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: ideas = [] } = useQuery({
    queryKey: ["contentIdeas", user?.email],
    queryFn: () => base44.entities.ContentIdea.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentIdea.create(data),
    onSuccess: () => queryClient.invalidateQueries(["contentIdeas"]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContentIdea.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(["contentIdeas"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentIdea.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["contentIdeas"]),
  });

  const generateIdeas = async () => {
    if (!niche.trim()) {
      alert("Please enter a niche or topic");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 10 creative and high-performing content ideas for someone in the "${niche}" niche.
${keywords ? `Focus on these keywords/topics: ${keywords}` : ""}
${contentType !== "all" ? `Content format: ${contentType}` : "Mix of different content formats"}

For each idea, provide:
- A compelling title
- Brief description (2-3 sentences)  
- Target audience
- Estimated virality potential (low/medium/high)
- Content format (short_video, long_video, blog_post, social_post, podcast)
- 3-5 relevant hashtags
- Key talking points (3-4 bullet points)

Make the ideas timely, trend-aware, and highly actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  target_audience: { type: "string" },
                  viral_potential: { type: "string" },
                  content_format: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  key_points: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Save all generated ideas
      await Promise.all(result.ideas.map(idea =>
        createMutation.mutateAsync({
          title: idea.title,
          description: idea.description,
          niche: niche,
          content_type: idea.content_format,
          target_audience: idea.target_audience,
          viral_potential: idea.viral_potential,
          hashtags: idea.hashtags,
          key_points: idea.key_points,
          status: "draft",
          is_saved: false
        })
      ));
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Failed to generate ideas. Please try again.");
    }
    setIsGenerating(false);
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesType = filterType === "all" || idea.content_type === filterType;
    const matchesSearch = !searchQuery ||
      idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const viralColors = {
    high: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-gray-500/20 text-gray-400"
  };

  const typeIcons = {
    short_video: Video,
    long_video: Video,
    blog_post: FileText,
    social_post: Image,
    podcast: Mic,
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-[#FFD700]" />
            Content Ideas Generator
          </h1>
          <p className="text-gray-400">AI-powered content ideas tailored to your niche</p>
        </div>

        {/* Generator Card */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              Generate New Ideas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Your Niche / Topic *</label>
                <Input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="E.g., AI Marketing, Personal Finance, Fitness..."
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {NICHES.slice(0, 5).map(n => (
                    <button
                      key={n}
                      onClick={() => setNiche(n)}
                      className="text-xs px-2 py-1 rounded-full bg-[#0B0B0C] border border-gray-700 text-gray-400 hover:border-[#FFD700] hover:text-[#FFD700] transition-all"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Keywords (optional)</label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="E.g., automation, passive income, beginners..."
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <div className="mt-2">
                  <label className="text-sm text-gray-400 mb-1 block">Content Format</label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button
              onClick={generateIdeas}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold rounded-xl px-8"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating 10 ideas...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate 10 Ideas</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Filter & Search Bar */}
        {ideas.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas..."
                className="pl-10 bg-[#111317] border-gray-700 text-white rounded-xl"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CONTENT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setFilterType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === t.value
                      ? "bg-[#FFD700] text-black"
                      : "bg-[#111317] text-gray-400 border border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Badge className="bg-gray-800 text-gray-300">
              {filteredIdeas.length} ideas
            </Badge>
          </div>
        )}

        {/* Ideas Grid */}
        <AnimatePresence>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredIdeas.map((idea, idx) => {
              const TypeIcon = typeIcons[idea.content_type] || Lightbulb;
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/40 transition-all h-full flex flex-col">
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-4 h-4 text-black" />
                          </div>
                          <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs capitalize">
                            {idea.content_type?.replace("_", " ") || "idea"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {idea.viral_potential && (
                            <Badge className={`text-xs ${viralColors[idea.viral_potential] || viralColors.medium}`}>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {idea.viral_potential}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-white font-bold text-base mb-2 leading-snug">{idea.title}</h3>

                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-3 flex-1">{idea.description}</p>

                      {/* Target audience */}
                      {idea.target_audience && (
                        <p className="text-xs text-gray-500 mb-3">
                          👤 {idea.target_audience}
                        </p>
                      )}

                      {/* Key points */}
                      {idea.key_points?.length > 0 && (
                        <div className="mb-3">
                          {idea.key_points.slice(0, 3).map((point, i) => (
                            <div key={i} className="flex items-start gap-1.5 mb-1">
                              <span className="text-[#FFD700] text-xs mt-0.5">•</span>
                              <span className="text-gray-300 text-xs">{point}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Hashtags */}
                      {idea.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {idea.hashtags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="text-xs text-[#00D4C9] bg-[#00D4C9]/10 px-2 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-800 mt-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateMutation.mutate({ id: idea.id, data: { is_saved: !idea.is_saved } })}
                          className={`flex-1 rounded-lg text-xs ${idea.is_saved ? "text-[#FFD700]" : "text-gray-400"}`}
                        >
                          {idea.is_saved ? <BookmarkCheck className="w-3.5 h-3.5 mr-1" /> : <Bookmark className="w-3.5 h-3.5 mr-1" />}
                          {idea.is_saved ? "Saved" : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(`${idea.title}\n\n${idea.description}`)}
                          className="flex-1 rounded-lg text-gray-400 text-xs"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(idea.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {filteredIdeas.length === 0 && !isGenerating && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2 text-lg">No content ideas yet</p>
              <p className="text-gray-500 text-sm">Enter your niche above and click "Generate Ideas" to get started</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}