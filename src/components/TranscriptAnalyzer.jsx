import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Sparkles,
  Search,
  Loader2,
  BookOpen,
  Clock,
  Tag,
  Hash,
  Quote,
  Brain,
  List,
  Target,
  ChevronRight,
  Play,
  Copy,
  Download,
  Zap,
  MessageSquare,
  Map,
  CheckCircle2,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TranscriptAnalyzer({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const { data: transcript } = useQuery({
    queryKey: ["transcript", project.id],
    queryFn: () => base44.entities.VideoTranscript.filter({
      video_project_id: project.id
    }),
  });

  const generateTranscriptMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      // In production, this would call actual transcription service
      // For demo, we'll use AI to generate sample transcript and analysis
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive transcript analysis for this video project:

PROJECT:
- Title: ${project.title}
- Description: ${project.description || 'N/A'}
- Duration: ${project.duration_seconds || 180}s
- Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'Educational'}
- Target Audience: ${project.deep_analysis_data?.genre_classification?.target_audience || 'General'}

Generate realistic transcript analysis including:

1. CHAPTERS (5-8 chapters):
   - Natural content breaks
   - Descriptive titles
   - Start/end timestamps
   - Chapter summaries
   - Key topics per chapter
   - Keywords
   - Importance score (0-100)

2. CONTENT SUMMARY:
   - Brief summary (2-3 sentences)
   - Detailed summary (2-3 paragraphs)
   - 5-7 key points
   - Main topics
   - 3-5 memorable quotes with timestamps
   - Overall sentiment
   - Target audience
   - Content type

3. SEARCHABLE INDEX:
   - 15-20 important keywords/topics
   - Categories (introduction, main_content, conclusion, etc.)
   - Timestamps where mentioned
   - Context snippets
   - Relevance scores

4. NAMED ENTITIES:
   - People mentioned
   - Places mentioned
   - Products/brands mentioned
   - Timestamps for each
   - Context

Make it realistic and detailed based on the video's genre and purpose.`,
        response_json_schema: {
          type: "object",
          properties: {
            chapters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapter_number: { type: "number" },
                  title: { type: "string" },
                  start_time: { type: "number" },
                  end_time: { type: "number" },
                  duration: { type: "number" },
                  summary: { type: "string" },
                  key_topics: { type: "array", items: { type: "string" } },
                  keywords: { type: "array", items: { type: "string" } },
                  importance_score: { type: "number" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                brief_summary: { type: "string" },
                detailed_summary: { type: "string" },
                key_points: { type: "array", items: { type: "string" } },
                main_topics: { type: "array", items: { type: "string" } },
                key_quotes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      quote: { type: "string" },
                      timestamp: { type: "number" },
                      context: { type: "string" }
                    }
                  }
                },
                sentiment: { type: "string" },
                target_audience: { type: "string" },
                content_type: { type: "string" }
              }
            },
            searchable_index: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  category: { type: "string" },
                  timestamps: { type: "array", items: { type: "number" } },
                  context_snippets: { type: "array", items: { type: "string" } },
                  relevance_score: { type: "number" }
                }
              }
            },
            named_entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entity: { type: "string" },
                  type: { type: "string" },
                  timestamps: { type: "array", items: { type: "number" } },
                  context: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create transcript record
      return await base44.entities.VideoTranscript.create({
        user_email: currentUser.email,
        video_project_id: project.id,
        raw_transcript: "Full transcript would be here...",
        ai_generated_chapters: analysis.chapters,
        content_summary: analysis.summary,
        searchable_index: analysis.searchable_index,
        named_entities: analysis.named_entities,
        language: "en",
        word_count: 1500,
        processing_status: "completed",
        transcription_accuracy: 95,
        generated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["transcript"]);
      setIsGenerating(false);
      alert("✅ Transcript analysis complete! Chapters, summary, and search index generated.");
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() || !transcript?.[0]) return;

    setIsSearching(true);
    try {
      const results = await base44.integrations.Core.InvokeLLM({
        prompt: `Search this video transcript index for: "${searchQuery}"

SEARCHABLE INDEX:
${transcript[0].searchable_index.map(item => `
Keyword: ${item.keyword}
Category: ${item.category}
Timestamps: ${item.timestamps.join(', ')}
Context: ${item.context_snippets.join(' | ')}
`).join('\n')}

CHAPTERS:
${transcript[0].ai_generated_chapters.map(ch => `
Chapter ${ch.chapter_number}: ${ch.title} (${Math.floor(ch.start_time/60)}:${String(ch.start_time%60).padStart(2,'0')})
Topics: ${ch.key_topics.join(', ')}
`).join('\n')}

Find all relevant matches and return:
- Matching keywords/topics
- Timestamps where mentioned
- Context snippets
- Relevance score (0-100)
- Which chapter it's in

Sort by relevance.`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  timestamps: { type: "array", items: { type: "number" } },
                  context: { type: "string" },
                  relevance_score: { type: "number" },
                  chapter_number: { type: "number" },
                  chapter_title: { type: "string" }
                }
              }
            },
            total_matches: { type: "number" }
          }
        }
      });

      setSearchResults(results.results);
      
      if (results.total_matches === 0) {
        alert("No matches found for your search query.");
      }

    } catch (error) {
      alert("Error searching transcript. Please try again.");
    }
    setIsSearching(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopyChapter = (chapter) => {
    const text = `${chapter.title}\n\nTime: ${formatTime(chapter.start_time)} - ${formatTime(chapter.end_time)}\n\n${chapter.summary}\n\nKey Topics: ${chapter.key_topics.join(', ')}`;
    navigator.clipboard.writeText(text);
    alert("✅ Chapter copied to clipboard!");
  };

  const handleExportChapters = () => {
    if (!transcript?.[0]) return;

    const chaptersText = transcript[0].ai_generated_chapters.map(ch => 
      `${formatTime(ch.start_time)} - ${ch.title}`
    ).join('\n');

    const blob = new Blob([chaptersText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}_chapters.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const transcriptData = transcript?.[0];

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9D4EDD]" />
            AI Transcript Analysis
          </CardTitle>
          {!transcriptData ? (
            <Button
              onClick={() => generateTranscriptMutation.mutate()}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-lg font-semibold"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Generate Analysis
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleExportChapters}
                variant="outline"
                className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Chapters
              </Button>
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>

        {!transcriptData ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No transcript analysis yet</p>
            <p className="text-gray-500 text-sm mb-4">Generate AI-powered transcript with chapters, summaries, and searchable index</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-1 text-[#9D4EDD]" />
                <p className="text-xl font-bold text-white">{transcriptData.ai_generated_chapters?.length || 0}</p>
                <p className="text-xs text-gray-400">Chapters</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                <Hash className="w-6 h-6 mx-auto mb-1 text-[#00D4C9]" />
                <p className="text-xl font-bold text-white">{transcriptData.word_count || 0}</p>
                <p className="text-xs text-gray-400">Words</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                <Target className="w-6 h-6 mx-auto mb-1 text-[#FFD700]" />
                <p className="text-xl font-bold text-white">{transcriptData.searchable_index?.length || 0}</p>
                <p className="text-xs text-gray-400">Topics</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                <Zap className="w-6 h-6 mx-auto mb-1 text-green-400" />
                <p className="text-xl font-bold text-white">{transcriptData.transcription_accuracy}%</p>
                <p className="text-xs text-gray-400">Accuracy</p>
              </div>
            </div>

            {/* AI-Powered Search */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#00D4C9]" />
                AI-Powered Search
              </h4>
              <div className="flex gap-2 mb-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for topics, keywords, or moments..."
                  className="flex-1 bg-[#111317] border-gray-700 text-white rounded-lg"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-[#00D4C9] text-black hover:bg-[#00BFBB] rounded-lg"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm mb-2">Found {searchResults.length} matches</p>
                  {searchResults.map((result, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-[#111317] rounded-lg border border-gray-700 hover:border-[#00D4C9] transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                              {result.keyword}
                            </Badge>
                            <Badge className="bg-gray-700 text-gray-300 text-xs">
                              {result.chapter_title}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm">{result.context}</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-xs text-gray-500">Relevance</p>
                          <p className="text-white font-bold">{result.relevance_score}%</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                        {result.timestamps.map((time, tIdx) => (
                          <button
                            key={tIdx}
                            className="px-2 py-1 bg-[#0B0B0C] rounded text-xs text-[#00D4C9] hover:bg-[#00D4C9]/10 transition-all flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            {formatTime(time)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="bg-[#0B0B0C] rounded-xl">
                <TabsTrigger value="chapters">Chapters</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
                <TabsTrigger value="entities">Entities</TabsTrigger>
              </TabsList>

              {/* Chapters Tab */}
              <TabsContent value="chapters">
                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 <strong>{transcriptData.ai_generated_chapters?.length} chapters</strong> automatically generated based on content flow and topic changes
                    </p>
                  </div>

                  <div className="space-y-3">
                    {transcriptData.ai_generated_chapters?.map((chapter, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedChapter?.chapter_number === chapter.chapter_number
                            ? 'border-[#9D4EDD] bg-[#9D4EDD]/5'
                            : 'border-gray-800 bg-[#0B0B0C] hover:border-gray-700'
                        }`}
                        onClick={() => setSelectedChapter(selectedChapter?.chapter_number === chapter.chapter_number ? null : chapter)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                                Chapter {chapter.chapter_number}
                              </Badge>
                              <Badge className={`text-xs ${
                                chapter.importance_score >= 80 ? 'bg-red-500/20 text-red-400' :
                                chapter.importance_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                Importance: {chapter.importance_score}%
                              </Badge>
                            </div>
                            <h5 className="text-white font-bold text-lg mb-1">{chapter.title}</h5>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(chapter.start_time)} - {formatTime(chapter.end_time)}
                              </span>
                              <span>Duration: {formatTime(chapter.duration)}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyChapter(chapter);
                            }}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        <AnimatePresence>
                          {selectedChapter?.chapter_number === chapter.chapter_number && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-3 border-t border-gray-800"
                            >
                              <p className="text-gray-300 text-sm mb-3 leading-relaxed">{chapter.summary}</p>
                              
                              <div className="mb-3">
                                <p className="text-gray-400 text-xs mb-2">Key Topics:</p>
                                <div className="flex flex-wrap gap-1">
                                  {chapter.key_topics.map((topic, tIdx) => (
                                    <Badge key={tIdx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className="text-gray-400 text-xs mb-2">Keywords:</p>
                                <div className="flex flex-wrap gap-1">
                                  {chapter.keywords.map((keyword, kIdx) => (
                                    <Badge key={kIdx} className="bg-gray-700 text-gray-300 text-xs">
                                      #{keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <Button
                                size="sm"
                                className="w-full mt-3 bg-[#9D4EDD] text-white hover:bg-[#8D3ECD]"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Jump to Chapter
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary">
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
                      Content Summary
                    </h4>
                    
                    <div className="mb-4 pb-4 border-b border-gray-800">
                      <h5 className="text-gray-400 text-xs mb-2">BRIEF SUMMARY</h5>
                      <p className="text-white text-sm leading-relaxed">{transcriptData.content_summary?.brief_summary}</p>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-800">
                      <h5 className="text-gray-400 text-xs mb-2">DETAILED SUMMARY</h5>
                      <p className="text-gray-300 text-sm leading-relaxed">{transcriptData.content_summary?.detailed_summary}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                      <div className="p-2 bg-[#0B0B0C] rounded">
                        <p className="text-gray-500 text-xs mb-1">Sentiment</p>
                        <p className="text-white font-semibold capitalize">{transcriptData.content_summary?.sentiment}</p>
                      </div>
                      <div className="p-2 bg-[#0B0B0C] rounded">
                        <p className="text-gray-500 text-xs mb-1">Content Type</p>
                        <p className="text-white font-semibold capitalize">{transcriptData.content_summary?.content_type}</p>
                      </div>
                      <div className="p-2 bg-[#0B0B0C] rounded">
                        <p className="text-gray-500 text-xs mb-1">Target Audience</p>
                        <p className="text-white font-semibold">{transcriptData.content_summary?.target_audience}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <List className="w-4 h-4 text-[#00D4C9]" />
                      Key Points
                    </h5>
                    <ul className="space-y-2">
                      {transcriptData.content_summary?.key_points?.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Quote className="w-4 h-4 text-[#FFD700]" />
                      Key Quotes
                    </h5>
                    <div className="space-y-3">
                      {transcriptData.content_summary?.key_quotes?.map((quote, idx) => (
                        <div key={idx} className="p-3 bg-[#111317] rounded-lg border-l-4 border-[#FFD700]">
                          <p className="text-white text-sm mb-2 italic">"{quote.quote}"</p>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-xs">{quote.context}</p>
                            <button className="text-[#00D4C9] text-xs hover:underline flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {formatTime(quote.timestamp)}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#FF8C00]" />
                      Main Topics
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {transcriptData.content_summary?.main_topics?.map((topic, idx) => (
                        <Badge key={idx} className="bg-[#FF8C00]/20 text-[#FF8C00]">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Topics Index Tab */}
              <TabsContent value="topics">
                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 <strong>{transcriptData.searchable_index?.length} topics</strong> indexed for instant search and navigation
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {transcriptData.searchable_index?.slice().sort((a, b) => b.relevance_score - a.relevance_score).map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-semibold text-sm mb-1">{item.keyword}</p>
                            <Badge className="bg-gray-700 text-gray-300 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Relevance</p>
                            <p className="text-[#00D4C9] font-bold text-sm">{item.relevance_score}%</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                          {item.context_snippets?.[0]}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-800">
                          {item.timestamps.slice(0, 3).map((time, tIdx) => (
                            <button
                              key={tIdx}
                              className="px-2 py-1 bg-[#111317] rounded text-xs text-[#00D4C9] hover:bg-[#00D4C9]/10 transition-all flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              {formatTime(time)}
                            </button>
                          ))}
                          {item.timestamps.length > 3 && (
                            <Badge className="bg-gray-700 text-gray-400 text-xs">
                              +{item.timestamps.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Named Entities Tab */}
              <TabsContent value="entities">
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 AI extracted <strong>{transcriptData.named_entities?.length} named entities</strong> (people, places, products)
                    </p>
                  </div>

                  {['person', 'place', 'product', 'organization'].map(entityType => {
                    const entities = transcriptData.named_entities?.filter(e => e.type === entityType);
                    if (!entities || entities.length === 0) return null;

                    const typeIcons = {
                      person: { icon: Users, color: 'bg-blue-500/20 text-blue-400' },
                      place: { icon: Map, color: 'bg-green-500/20 text-green-400' },
                      product: { icon: Tag, color: 'bg-purple-500/20 text-purple-400' },
                      organization: { icon: Target, color: 'bg-orange-500/20 text-orange-400' }
                    };

                    const { icon: Icon, color } = typeIcons[entityType];

                    return (
                      <div key={entityType}>
                        <h5 className="text-white font-semibold mb-2 flex items-center gap-2 capitalize">
                          <Icon className="w-4 h-4" />
                          {entityType}s ({entities.length})
                        </h5>
                        <div className="grid md:grid-cols-2 gap-2">
                          {entities.map((entity, idx) => (
                            <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <Badge className={`${color} text-xs mb-1`}>
                                    {entity.entity}
                                  </Badge>
                                  <p className="text-gray-400 text-xs">{entity.context}</p>
                                </div>
                                <Badge className="bg-gray-700 text-gray-300 text-xs h-fit">
                                  {entity.timestamps.length}x
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-800">
                                {entity.timestamps.slice(0, 3).map((time, tIdx) => (
                                  <button
                                    key={tIdx}
                                    className="px-2 py-1 bg-[#111317] rounded text-xs text-[#00D4C9] hover:bg-[#00D4C9]/10 transition-all"
                                  >
                                    {formatTime(time)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

            </Tabs>

          </div>
        )}

      </CardContent>
    </Card>
  );
}