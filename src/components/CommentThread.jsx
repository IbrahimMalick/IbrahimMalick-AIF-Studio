import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  MoreVertical,
  ThumbsUp,
  Smile,
  Reply,
  Sparkles,
  Loader2,
  Brain,
  Target,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommentThread({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiRealTimeFeedback, setAiRealTimeFeedback] = useState(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", project.id],
    queryFn: () => base44.entities.ProjectComment.filter({ project_id: project.id }, "-created_date"),
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
      setNewComment("");
      setReplyTo(null);
    },
  });

  const resolveCommentMutation = useMutation({
    mutationFn: ({ id }) => 
      base44.entities.ProjectComment.update(id, {
        status: "resolved",
        resolved_by: currentUser.email,
        resolved_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: ({ commentId, emoji }) => {
      const comment = comments.find(c => c.id === commentId);
      const existingReactions = comment.reactions || [];
      const userReaction = existingReactions.find(r => r.user_email === currentUser.email);
      
      let newReactions;
      if (userReaction && userReaction.emoji === emoji) {
        newReactions = existingReactions.filter(r => r.user_email !== currentUser.email);
      } else if (userReaction) {
        newReactions = existingReactions.map(r => 
          r.user_email === currentUser.email ? { ...r, emoji } : r
        );
      } else {
        newReactions = [...existingReactions, { emoji, user_email: currentUser.email }];
      }
      
      return base44.entities.ProjectComment.update(commentId, { reactions: newReactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
    },
  });

  // AI Real-Time Feedback on Edits
  const handleGenerateAIFeedback = async () => {
    setIsGeneratingFeedback(true);
    try {
      const feedback = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video project and provide real-time AI feedback:

PROJECT:
- Title: ${project.title}
- Description: ${project.description || 'N/A'}

ANALYSIS DATA (if available):
- Deep Analysis: ${project.deep_analysis_complete ? 'Yes' : 'No'}
- Emotional Tone: ${project.deep_analysis_data?.emotional_tone?.primary_mood || 'Unknown'}
- Pacing: ${project.deep_analysis_data?.pacing_analysis?.overall_pace || 'Unknown'}
- Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'Unknown'}
- Target Audience: ${project.deep_analysis_data?.genre_classification?.target_audience || 'Unknown'}
- Quality Score: ${project.deep_analysis_data?.quality_scores?.overall_production_value || 'N/A'}/100

TEAM FEEDBACK:
${comments.map(c => `- ${c.user_name}: ${c.comment_text}`).join('\n')}

Provide comprehensive real-time feedback:

1. PACING ASSESSMENT:
   - Current pacing effectiveness
   - Suggested adjustments for engagement
   - Scene timing recommendations
   - Attention retention analysis

2. MOOD & TONE ALIGNMENT:
   - How well mood matches target audience
   - Emotional consistency throughout
   - Suggested mood adjustments
   - Music/audio alignment with mood

3. TARGET AUDIENCE OPTIMIZATION:
   - Content appropriateness for audience
   - Language/tone suitability
   - Platform optimization for audience
   - Call-to-action effectiveness

4. EDITING SUGGESTIONS:
   - Top 5 specific improvements
   - Priority order (critical/important/nice-to-have)
   - Expected impact of each change
   - Quick wins vs long-term improvements

5. TECHNICAL QUALITY:
   - Audio quality feedback
   - Visual quality assessment
   - Technical issues to address

6. COLLABORATION INSIGHTS:
   - Key themes from team feedback
   - Conflicting suggestions to resolve
   - Consensus areas
   - Action items for team`,
        response_json_schema: {
          type: "object",
          properties: {
            pacing_assessment: {
              type: "object",
              properties: {
                effectiveness_score: { type: "number" },
                current_issues: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } },
                scene_adjustments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      scene: { type: "string" },
                      current_duration: { type: "number" },
                      recommended_duration: { type: "number" },
                      reason: { type: "string" }
                    }
                  }
                }
              }
            },
            mood_alignment: {
              type: "object",
              properties: {
                alignment_score: { type: "number" },
                current_mood: { type: "string" },
                target_mood: { type: "string" },
                adjustments_needed: { type: "array", items: { type: "string" } },
                music_recommendations: { type: "array", items: { type: "string" } }
              }
            },
            audience_optimization: {
              type: "object",
              properties: {
                suitability_score: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                platform_specific_tips: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      recommendations: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            },
            editing_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "string" },
                  difficulty: { type: "string" },
                  estimated_time: { type: "string" }
                }
              }
            },
            technical_quality: {
              type: "object",
              properties: {
                audio_score: { type: "number" },
                visual_score: { type: "number" },
                issues: { type: "array", items: { type: "string" } },
                quick_fixes: { type: "array", items: { type: "string" } }
              }
            },
            collaboration_insights: {
              type: "object",
              properties: {
                key_themes: { type: "array", items: { type: "string" } },
                conflicts_to_resolve: { type: "array", items: { type: "string" } },
                consensus_areas: { type: "array", items: { type: "string" } },
                team_action_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      assigned_to: { type: "string" },
                      priority: { type: "string" },
                      deadline: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setAiRealTimeFeedback(feedback);
      alert(`✅ AI Feedback Generated!

📊 SCORES:
• Pacing Effectiveness: ${feedback.pacing_assessment.effectiveness_score}/100
• Mood Alignment: ${feedback.mood_alignment.alignment_score}/100
• Audience Suitability: ${feedback.audience_optimization.suitability_score}/100
• Audio Quality: ${feedback.technical_quality.audio_score}/100
• Visual Quality: ${feedback.technical_quality.visual_score}/100

🎯 TOP SUGGESTIONS:
${feedback.editing_suggestions.slice(0, 3).map(s => `• [${s.priority}] ${s.suggestion}`).join('\n')}

Check below for full detailed feedback!`);

    } catch (error) {
      alert("Error generating AI feedback. Please try again.");
    }
    setIsGeneratingFeedback(false);
  };

  // AI Feedback Summary & Action Items
  const handleGenerateSummary = async () => {
    if (comments.length === 0) {
      alert("No comments to summarize yet");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze and summarize this feedback thread for a video project:

PROJECT: ${project.title}

FEEDBACK COMMENTS:
${comments.map(c => `
From: ${c.user_name || c.user_email}
Type: ${c.comment_type}
Status: ${c.status}
Comment: ${c.comment_text}
${c.timestamp_seconds ? `At: ${Math.floor(c.timestamp_seconds / 60)}:${String(Math.floor(c.timestamp_seconds % 60)).padStart(2, '0')}` : ''}
`).join('\n---\n')}

Provide comprehensive summary:

1. EXECUTIVE SUMMARY:
   - Overall sentiment (positive/mixed/negative)
   - Main themes
   - Critical issues
   - Team consensus

2. KEY ACTION ITEMS:
   Prioritized list of specific tasks with:
   - Action description
   - Who should handle it
   - Priority (critical/high/medium/low)
   - Estimated effort
   - Dependencies

3. FEEDBACK THEMES:
   - Most mentioned topics
   - Common concerns
   - Praise areas
   - Improvement suggestions

4. TIMELINE-SPECIFIC FEEDBACK:
   - Organized by video timestamp
   - Scene-specific notes
   - Editing points

5. CONFLICTS & DECISIONS NEEDED:
   - Conflicting suggestions
   - Areas needing team discussion
   - Unresolved questions

6. QUICK WINS:
   - Easy improvements with high impact
   - Low-effort changes
   - Immediate action items`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: {
              type: "object",
              properties: {
                overall_sentiment: { type: "string" },
                sentiment_score: { type: "number" },
                main_themes: { type: "array", items: { type: "string" } },
                critical_issues: { type: "array", items: { type: "string" } },
                team_consensus: { type: "string" },
                total_comments: { type: "number" },
                open_issues: { type: "number" },
                resolved_issues: { type: "number" }
              }
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  suggested_assignee: { type: "string" },
                  priority: { type: "string" },
                  effort: { type: "string" },
                  dependencies: { type: "array", items: { type: "string" } },
                  expected_impact: { type: "string" }
                }
              }
            },
            feedback_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  mention_count: { type: "number" },
                  sentiment: { type: "string" },
                  key_points: { type: "array", items: { type: "string" } }
                }
              }
            },
            timeline_feedback: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  feedback: { type: "array", items: { type: "string" } }
                }
              }
            },
            conflicts_and_decisions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  conflicting_views: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  win: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiSummary(summary);
      alert(`✅ Feedback Summary Generated!

📊 OVERVIEW:
• Sentiment: ${summary.executive_summary.overall_sentiment} (${summary.executive_summary.sentiment_score}/100)
• Total Comments: ${summary.executive_summary.total_comments}
• Open Issues: ${summary.executive_summary.open_issues}
• Action Items: ${summary.action_items.length}

🎯 TOP ACTION ITEMS:
${summary.action_items.slice(0, 3).map(a => `• [${a.priority}] ${a.action}`).join('\n')}

⚡ QUICK WINS:
${summary.quick_wins.slice(0, 3).map(w => `• ${w.win} (${w.impact})`).join('\n')}

Check below for full summary!`);

    } catch (error) {
      alert("Error generating summary. Please try again.");
    }
    setIsGeneratingSummary(false);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    await createCommentMutation.mutateAsync({
      project_id: project.id,
      user_email: currentUser.email,
      user_name: currentUser.full_name || currentUser.email,
      comment_text: newComment,
      comment_type: "general",
      parent_comment_id: replyTo,
      status: "open"
    });
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId);

  const filteredComments = topLevelComments.filter(c => {
    if (filterStatus === "all") return true;
    return c.status === filterStatus;
  });

  const getReactionCount = (comment, emoji) => {
    return comment.reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  const userHasReacted = (comment, emoji) => {
    return comment.reactions?.some(r => r.user_email === currentUser.email && r.emoji === emoji);
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#FFD700]" />
            Comments & Feedback ({comments.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleGenerateAIFeedback}
              disabled={isGeneratingFeedback}
              className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-lg"
            >
              {isGeneratingFeedback ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              AI Feedback
            </Button>
            <Button
              size="sm"
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="bg-[#00D4C9] text-black rounded-lg"
            >
              {isGeneratingSummary ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Summarize
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className={filterStatus === "all" ? "bg-[#FFD700] text-black" : "border-gray-700"}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "open" ? "default" : "outline"}
              onClick={() => setFilterStatus("open")}
              className={filterStatus === "open" ? "bg-[#FFD700] text-black" : "border-gray-700"}
            >
              Open
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "resolved" ? "default" : "outline"}
              onClick={() => setFilterStatus("resolved")}
              className={filterStatus === "resolved" ? "bg-[#FFD700] text-black" : "border-gray-700"}
            >
              Resolved
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* AI Real-Time Feedback Display */}
        {aiRealTimeFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#9D4EDD]" />
                AI Real-Time Feedback
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAiRealTimeFeedback(null)}
                className="text-gray-400"
              >
                ✕
              </Button>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#00D4C9]">{aiRealTimeFeedback.pacing_assessment.effectiveness_score}</p>
                <p className="text-xs text-gray-400">Pacing</p>
              </div>
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#9D4EDD]">{aiRealTimeFeedback.mood_alignment.alignment_score}</p>
                <p className="text-xs text-gray-400">Mood</p>
              </div>
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#FFD700]">{aiRealTimeFeedback.audience_optimization.suitability_score}</p>
                <p className="text-xs text-gray-400">Audience</p>
              </div>
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#06D6A0]">{aiRealTimeFeedback.technical_quality.audio_score}</p>
                <p className="text-xs text-gray-400">Audio</p>
              </div>
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#FF8C00]">{aiRealTimeFeedback.technical_quality.visual_score}</p>
                <p className="text-xs text-gray-400">Visual</p>
              </div>
            </div>

            {/* Top Suggestions */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">🎯 Priority Suggestions:</h4>
              <div className="space-y-2">
                {aiRealTimeFeedback.editing_suggestions.slice(0, 5).map((sug, idx) => (
                  <div key={idx} className="flex gap-2 p-2 bg-[#0B0B0C] rounded-lg">
                    <Badge className={`${
                      sug.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      sug.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      sug.priority === 'important' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    } h-fit text-xs`}>
                      {sug.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-white text-sm">{sug.suggestion}</p>
                      <p className="text-gray-400 text-xs mt-1">Impact: {sug.expected_impact} • Effort: {sug.difficulty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Summary Display */}
        {aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00D4C9]" />
                Feedback Summary
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAiSummary(null)}
                className="text-gray-400"
              >
                ✕
              </Button>
            </div>

            {/* Executive Summary */}
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">📊 Overview</h4>
              <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                <div>
                  <p className="text-gray-400">Sentiment</p>
                  <p className="text-white font-medium capitalize">{aiSummary.executive_summary.overall_sentiment}</p>
                </div>
                <div>
                  <p className="text-gray-400">Open Issues</p>
                  <p className="text-white font-medium">{aiSummary.executive_summary.open_issues}</p>
                </div>
                <div>
                  <p className="text-gray-400">Action Items</p>
                  <p className="text-white font-medium">{aiSummary.action_items.length}</p>
                </div>
              </div>
              <p className="text-gray-300 text-xs">{aiSummary.executive_summary.team_consensus}</p>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Key Action Items
              </h4>
              <div className="space-y-2">
                {aiSummary.action_items.slice(0, 5).map((action, idx) => (
                  <div key={idx} className="flex gap-2 p-2 bg-[#0B0B0C] rounded-lg">
                    <Badge className={`${
                      action.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    } h-fit text-xs`}>
                      {action.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-white text-sm">{action.action}</p>
                      <p className="text-gray-400 text-xs">
                        {action.suggested_assignee} • {action.effort} • {action.expected_impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Wins */}
            {aiSummary.quick_wins?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-2">⚡ Quick Wins</h4>
                <div className="space-y-1">
                  {aiSummary.quick_wins.slice(0, 3).map((win, idx) => (
                    <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg">
                      <p className="text-green-400 text-sm">{win.win}</p>
                      <p className="text-gray-400 text-xs">Impact: {win.impact} • Effort: {win.effort}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* New Comment */}
        <div className="space-y-2">
          {replyTo && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
              <p className="text-blue-400 text-xs flex items-center gap-2">
                <Reply className="w-3 h-3" />
                Replying to comment
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyTo(null)}
                  className="ml-auto text-xs h-6 text-blue-400"
                >
                  Cancel
                </Button>
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply..." : "Add a comment or feedback..."}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg resize-none"
              rows={3}
            />
            <Button
              onClick={handlePostComment}
              disabled={!newComment.trim() || createCommentMutation.isLoading}
              className="bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-lg self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredComments.map((comment) => {
              const replies = getReplies(comment.id);
              
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className={`p-4 rounded-xl border ${
                    comment.status === "resolved" 
                      ? "bg-green-500/5 border-green-500/30" 
                      : "bg-[#0B0B0C] border-gray-800"
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white text-sm font-semibold">
                            {comment.user_name || comment.user_email}
                          </p>
                          {comment.comment_type === "approval" && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {comment.comment_type === "revision_request" && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                              Needs Changes
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(comment.created_date).toLocaleString()}
                          {comment.timestamp_seconds && (
                            <>
                              <MapPin className="w-3 h-3 ml-2" />
                              {Math.floor(comment.timestamp_seconds / 60)}:{String(Math.floor(comment.timestamp_seconds % 60)).padStart(2, '0')}
                            </>
                          )}
                        </p>
                      </div>
                      {comment.status === "open" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resolveCommentMutation.mutate({ id: comment.id })}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{comment.comment_text}</p>

                    {/* Reactions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                      {['👍', '❤️', '🎉', '💡', '✅'].map((emoji) => {
                        const count = getReactionCount(comment, emoji);
                        const hasReacted = userHasReacted(comment, emoji);
                        
                        return (
                          <button
                            key={emoji}
                            onClick={() => addReactionMutation.mutate({ commentId: comment.id, emoji })}
                            className={`px-2 py-1 rounded-lg text-sm transition-all ${
                              hasReacted 
                                ? 'bg-[#FFD700]/20 border border-[#FFD700]/50' 
                                : 'bg-[#111317] border border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            {emoji} {count > 0 && <span className="text-gray-400 ml-1">{count}</span>}
                          </button>
                        );
                      })}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyTo(comment.id)}
                        className="ml-auto text-gray-400 hover:text-white text-xs"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {replies.map((reply) => (
                        <div key={reply.id} className="p-3 rounded-lg bg-[#0B0B0C] border border-gray-800">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white text-sm font-semibold">{reply.user_name || reply.user_email}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(reply.created_date).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{reply.comment_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredComments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>No {filterStatus !== "all" ? filterStatus : ""} comments yet</p>
              <p className="text-xs mt-1">Be the first to leave feedback!</p>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}