import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Bot,
  User,
  Scissors,
  Palette,
  Music,
  Type,
  Layers,
  Target,
  Film,
  ChevronDown,
  ChevronUp,
  Move,
  Volume2,
  Lightbulb,
  TrendingUp,
  Clock,
  Bell,
  X,
  Play,
  Video,
  Headphones,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoAIAssistant({ 
  project, 
  onApplyEffect, 
  onGenerateClip,
  currentUser 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [proactiveSuggestions, setProactiveSuggestions] = useState([]);
  const [showProactiveSuggestions, setShowProactiveSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch comments for feedback summarization
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", project?.id],
    queryFn: () => base44.entities.ProjectComment.filter({ project_id: project.id }),
    enabled: !!project?.id,
  });

  // Fetch transcript data for AI analysis
  const { data: transcript } = useQuery({
    queryKey: ["transcript", project?.id],
    queryFn: () => base44.entities.VideoTranscript.filter({ video_project_id: project.id }),
    enabled: !!project?.id,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize assistant with welcome message
  useEffect(() => {
    if (project && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hi ${currentUser?.full_name || 'there'}! 👋 I'm your AI Video Assistant for "${project.title}". 

I can help you with:

🎬 **Editing Suggestions:**
- Smart cuts and transitions
- Optimal scene timing
- Effect recommendations
- Color grading tips
- Audio optimization

✂️ **Auto Clip Generation:**
- Create highlight reels
- Extract engaging moments
- Generate topic-specific clips
- Social media snippets

🎵 **Music & Sound:**
- Background music suggestions
- Sound effect recommendations
- Audio mood matching
- Soundtrack curation

🧠 **AI Analysis:**
- Deep video analysis
- Transcript-based insights
- Performance predictions
- Content optimization

🤝 **Collaboration:**
- Summarize feedback
- Extract action items
- Team priorities

💡 **Proactive Help:**
I'll monitor your project and offer suggestions as you work!

What would you like to do first?`,
        timestamp: new Date(),
        type: "welcome"
      }]);
      
      // Generate proactive suggestions after a brief delay
      setTimeout(() => generateProactiveSuggestions(), 2000);
    }
  }, [project, currentUser]);

  // Generate Proactive Suggestions
  const generateProactiveSuggestions = async () => {
    if (!project) return;

    try {
      const transcriptData = transcript?.[0];
      
      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `As an AI video editing assistant, analyze this project and provide proactive editing suggestions:

PROJECT:
- Title: ${project.title}
- Description: ${project.description || 'N/A'}
- Duration: ${project.duration_seconds || 0}s
- Resolution: ${project.resolution}
- FPS: ${project.fps}

TRANSCRIPT AVAILABLE: ${transcriptData ? 'Yes' : 'No'}
${transcriptData ? `
CHAPTERS: ${transcriptData.ai_generated_chapters?.length || 0}
TOPICS: ${transcriptData.searchable_index?.length || 0}
CONTENT SUMMARY: ${transcriptData.content_summary?.brief_summary || 'N/A'}
` : ''}

ANALYSIS (if available):
- Deep Analysis: ${project.deep_analysis_complete ? 'Yes' : 'No'}
- Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'Unknown'}
- Mood: ${project.deep_analysis_data?.emotional_tone?.primary_mood || 'Unknown'}
- Pacing: ${project.deep_analysis_data?.pacing_analysis?.overall_pace || 'Unknown'}

APPLIED FEATURES:
- Stabilization: ${project.stabilization_applied ? 'Yes' : 'No'}
- Color Correction: ${project.color_correction_applied ? 'Yes' : 'No'}
- Audio Enhancement: ${project.audio_enhancement_applied ? 'Yes' : 'No'}
- Style Transfer: ${project.style_transfer_applied ? 'Yes' : 'No'}

TEAM FEEDBACK:
- Comments: ${comments.length} total
- Open Issues: ${comments.filter(c => c.status === 'open').length}

Based on this, provide 3-5 PROACTIVE suggestions focusing on:
1. Cuts and transitions recommendations
2. Highlight reel opportunities
3. Music and sound suggestions
4. Other improvements

Each suggestion should be:
- Specific and actionable
- Prioritized (high/medium/low)
- Include expected impact
- Include which feature to use`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  impact: { type: "string" },
                  action_type: { type: "string" },
                  icon: { type: "string" }
                }
              }
            }
          }
        }
      });

      setProactiveSuggestions(suggestions.suggestions);
    } catch (error) {
      console.error("Error generating proactive suggestions:", error);
    }
  };

  // Handle proactive suggestion click
  const handleProactiveSuggestionClick = (suggestion) => {
    setInput(suggestion.description);
    setTimeout(() => handleSendMessage(), 100);
  };

  const processMutation = useMutation({
    mutationFn: async (command) => {
      const transcriptData = transcript?.[0];
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI video editing assistant. Analyze this command and determine what the user wants to do.

Current Project:
- Title: ${project?.title}
- Description: ${project?.description || 'N/A'}
- Duration: ${project?.duration_seconds || 0}s
- Has Video: ${project?.video_url ? 'Yes' : 'No'}
- Deep Analysis Done: ${project?.deep_analysis_complete ? 'Yes' : 'No'}
- Has Transcript: ${transcriptData ? 'Yes' : 'No'}

${transcriptData ? `
TRANSCRIPT DATA:
- Chapters: ${transcriptData.ai_generated_chapters?.length || 0}
- Topics: ${transcriptData.searchable_index?.length || 0}
- Content Summary: ${transcriptData.content_summary?.brief_summary}
- Main Topics: ${transcriptData.content_summary?.main_topics?.join(', ')}
` : ''}

User Command: "${command}"

Determine:
1. Primary intent (suggestCuts, suggestTransitions, createHighlightReel, suggestMusic, suggestSoundEffects, etc.)
2. Specific actions to take
3. Parameters needed
4. Confidence level (0-1)
5. Whether you need more information from user

Be specific about:
- Timing and placement for cuts/transitions
- Criteria for highlight reels (engaging moments, topics, etc.)
- Music genre, mood, and tempo suggestions
- Sound effect types and placement`,
        response_json_schema: {
          type: "object",
          properties: {
            intent: { type: "string" },
            confidence: { type: "number" },
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action_type: { type: "string" },
                  description: { type: "string" },
                  parameters: { type: "object" },
                  can_execute_now: { type: "boolean" }
                }
              }
            },
            response_message: { type: "string" },
            requires_confirmation: { type: "boolean" },
            missing_info: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return result;
    },
  });

  const executeActionMutation = useMutation({
    mutationFn: async (action) => {
      const transcriptData = transcript?.[0];
      
      const actionHandlers = {
        // NEW: Suggest Cuts
        suggestCuts: async () => {
          const cuts = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyze this video project and suggest strategic cuts:

Project: ${project.title}
Duration: ${project.duration_seconds}s
Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'General'}
Pacing: ${project.deep_analysis_data?.pacing_analysis?.overall_pace || 'Moderate'}
Mood: ${project.deep_analysis_data?.emotional_tone?.primary_mood || 'Neutral'}

${transcriptData ? `
TRANSCRIPT ANALYSIS:
Chapters: ${transcriptData.ai_generated_chapters?.length || 0}
${transcriptData.ai_generated_chapters?.map(ch => `
- Chapter ${ch.chapter_number}: ${ch.title} (${Math.floor(ch.start_time/60)}:${String(ch.start_time%60).padStart(2,'0')} - ${Math.floor(ch.end_time/60)}:${String(ch.end_time%60).padStart(2,'0')})
  Topics: ${ch.key_topics?.join(', ')}
  Importance: ${ch.importance_score}/100
`).join('\n')}
` : ''}

Suggest 5-8 strategic cuts that would:
1. Improve pacing
2. Remove unnecessary content
3. Increase engagement
4. Maintain story flow
5. Enhance message clarity

For each cut, specify:
- Timestamp (seconds)
- Duration to cut
- Reason for cutting
- Expected impact
- Alternative: what to show instead (if applicable)`,
            response_json_schema: {
              type: "object",
              properties: {
                cuts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp: { type: "number" },
                      duration: { type: "number" },
                      reason: { type: "string" },
                      impact: { type: "string" },
                      alternative: { type: "string" }
                    }
                  }
                },
                overall_time_saved: { type: "number" },
                pacing_improvement: { type: "string" }
              }
            }
          });

          return `✂️ **Suggested Cuts (Save ${cuts.overall_time_saved}s):**\n\n${cuts.cuts.map((cut, i) => 
            `${i + 1}. **${Math.floor(cut.timestamp / 60)}:${String(cut.timestamp % 60).padStart(2, '0')}** - Cut ${cut.duration}s\n   📝 ${cut.reason}\n   💡 Impact: ${cut.impact}\n   ${cut.alternative ? `🔄 Alternative: ${cut.alternative}` : ''}`
          ).join('\n\n')}\n\n**Pacing Improvement:** ${cuts.pacing_improvement}`;
        },

        // NEW: Suggest Transitions
        suggestTransitions: async () => {
          const transitions = await base44.integrations.Core.InvokeLLM({
            prompt: `Suggest optimal transitions for this video:

Project: ${project.title}
Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'General'}
Mood: ${project.deep_analysis_data?.emotional_tone?.primary_mood || 'Neutral'}
Duration: ${project.duration_seconds}s

${transcriptData ? `
CHAPTER TRANSITIONS:
${transcriptData.ai_generated_chapters?.map((ch, idx, arr) => {
  if (idx < arr.length - 1) {
    return `Between Chapter ${ch.chapter_number} (${ch.title}) and Chapter ${arr[idx+1].chapter_number} (${arr[idx+1].title}) at ${Math.floor(ch.end_time/60)}:${String(ch.end_time%60).padStart(2,'0')}`;
  }
  return null;
}).filter(Boolean).join('\n')}
` : ''}

Suggest 5-8 transition placements with:
- Timestamp
- Transition type (fade, dissolve, wipe, zoom, slide, etc.)
- Duration
- Reason for this transition
- Mood/pacing consideration`,
            response_json_schema: {
              type: "object",
              properties: {
                transitions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp: { type: "number" },
                      type: { type: "string" },
                      duration: { type: "number" },
                      reason: { type: "string" },
                      mood: { type: "string" }
                    }
                  }
                }
              }
            }
          });

          return `🎬 **Suggested Transitions:**\n\n${transitions.transitions.map((t, i) => 
            `${i + 1}. **${Math.floor(t.timestamp / 60)}:${String(t.timestamp % 60).padStart(2, '0')}** - ${t.type} (${t.duration}s)\n   📝 ${t.reason}\n   🎭 Mood: ${t.mood}`
          ).join('\n\n')}`;
        },

        // NEW: Create Highlight Reel
        createHighlightReel: async () => {
          const params = action.parameters || {};
          const duration = params.target_duration || 60; // default 60s highlight
          const criteria = params.criteria || 'most engaging';
          
          const highlights = await base44.integrations.Core.InvokeLLM({
            prompt: `Create a ${duration}-second highlight reel from this video:

Project: ${project.title}
Full Duration: ${project.duration_seconds}s
Target Duration: ${duration}s
Criteria: ${criteria}

${transcriptData ? `
CONTENT ANALYSIS:
Summary: ${transcriptData.content_summary?.brief_summary}
Key Points: ${transcriptData.content_summary?.key_points?.join(', ')}
Main Topics: ${transcriptData.content_summary?.main_topics?.join(', ')}

CHAPTERS WITH IMPORTANCE:
${transcriptData.ai_generated_chapters?.map(ch => `
- ${ch.title} (${Math.floor(ch.start_time/60)}:${String(ch.start_time%60).padStart(2,'0')} - ${Math.floor(ch.end_time/60)}:${String(ch.end_time%60).padStart(2,'0')})
  Importance: ${ch.importance_score}/100
  Topics: ${ch.key_topics?.join(', ')}
`).join('\n')}

KEY QUOTES:
${transcriptData.content_summary?.key_quotes?.map(q => `
- "${q.quote}" at ${Math.floor(q.timestamp/60)}:${String(q.timestamp%60).padStart(2,'0')}
`).join('\n')}
` : ''}

Based on "${criteria}", select 3-6 clips that:
1. Represent the best/most engaging moments
2. Tell a cohesive story
3. Total approximately ${duration} seconds
4. Include variety (different topics/moods)
5. Hook viewers immediately

For each clip:
- Start time
- End time
- Duration
- Why it's included
- Engagement score (0-100)
- Order in highlight reel`,
            response_json_schema: {
              type: "object",
              properties: {
                clips: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      start_time: { type: "number" },
                      end_time: { type: "number" },
                      duration: { type: "number" },
                      reason: { type: "string" },
                      engagement_score: { type: "number" },
                      order: { type: "number" }
                    }
                  }
                },
                total_duration: { type: "number" },
                hook_strategy: { type: "string" },
                recommended_music: { type: "string" }
              }
            }
          });

          // Sort clips by order
          const sortedClips = highlights.clips.sort((a, b) => a.order - b.order);

          return `🎥 **${duration}s Highlight Reel Created!**\n\n**Hook Strategy:** ${highlights.hook_strategy}\n\n**Clips Selected (${highlights.clips.length} clips, ${highlights.total_duration}s total):**\n\n${sortedClips.map((clip, i) => 
            `${i + 1}. **Clip ${i + 1}** (${clip.duration}s) - Score: ${clip.engagement_score}/100\n   ⏰ ${Math.floor(clip.start_time / 60)}:${String(clip.start_time % 60).padStart(2, '0')} → ${Math.floor(clip.end_time / 60)}:${String(clip.end_time % 60).padStart(2, '0')}\n   📝 ${clip.reason}`
          ).join('\n\n')}\n\n🎵 **Recommended Music:** ${highlights.recommended_music}\n\n✅ Ready to export this highlight reel!`;
        },

        // NEW: Suggest Background Music
        suggestMusic: async () => {
          const musicSuggestions = await base44.integrations.Core.InvokeLLM({
            prompt: `Suggest background music for this video:

Project: ${project.title}
Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'General'}
Mood: ${project.deep_analysis_data?.emotional_tone?.primary_mood || 'Neutral'}
Pacing: ${project.deep_analysis_data?.pacing_analysis?.overall_pace || 'Moderate'}
Duration: ${project.duration_seconds}s

${transcriptData ? `
CONTENT SUMMARY:
${transcriptData.content_summary?.brief_summary}

MOOD ANALYSIS:
Sentiment: ${transcriptData.content_summary?.sentiment}
Content Type: ${transcriptData.content_summary?.content_type}
` : ''}

Suggest 5-7 music tracks with:
1. Track name/description
2. Genre
3. Mood/energy level
4. Tempo (BPM)
5. Why it fits
6. When to use (specific sections if applicable)
7. Volume suggestions (background/foreground)
8. Copyright-free source suggestions

Consider:
- Video pacing and mood
- Target audience
- Platform (YouTube, Instagram, etc.)
- Voice-over presence
- Emotional arc`,
            response_json_schema: {
              type: "object",
              properties: {
                tracks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      track_name: { type: "string" },
                      genre: { type: "string" },
                      mood: { type: "string" },
                      tempo_bpm: { type: "number" },
                      why_it_fits: { type: "string" },
                      usage: { type: "string" },
                      volume_level: { type: "string" },
                      source: { type: "string" }
                    }
                  }
                },
                overall_recommendation: { type: "string" }
              }
            }
          });

          return `🎵 **Background Music Suggestions:**\n\n${musicSuggestions.tracks.map((track, i) => 
            `${i + 1}. **${track.track_name}**\n   🎸 Genre: ${track.genre} | 🎭 Mood: ${track.mood}\n   ⏱️ Tempo: ${track.tempo_bpm} BPM | 🔊 Volume: ${track.volume_level}\n   📝 ${track.why_it_fits}\n   🎯 Usage: ${track.usage}\n   📚 Source: ${track.source}`
          ).join('\n\n')}\n\n**Overall Recommendation:**\n${musicSuggestions.overall_recommendation}`;
        },

        // NEW: Suggest Sound Effects
        suggestSoundEffects: async () => {
          const sfxSuggestions = await base44.integrations.Core.InvokeLLM({
            prompt: `Suggest sound effects for this video:

Project: ${project.title}
Genre: ${project.deep_analysis_data?.genre_classification?.primary_genre || 'General'}
Content Type: ${transcriptData?.content_summary?.content_type || 'General'}

${transcriptData ? `
CHAPTERS:
${transcriptData.ai_generated_chapters?.map(ch => `
- ${ch.title} (${Math.floor(ch.start_time/60)}:${String(ch.start_time%60).padStart(2,'0')} - ${Math.floor(ch.end_time/60)}:${String(ch.end_time%60).padStart(2,'0')})
  Topics: ${ch.key_topics?.join(', ')}
`).join('\n')}

KEY MOMENTS:
${transcriptData.content_summary?.key_quotes?.map(q => `
- "${q.quote}" at ${Math.floor(q.timestamp/60)}:${String(q.timestamp%60).padStart(2,'0')}
  Context: ${q.context}
`).join('\n')}
` : ''}

Suggest 5-10 sound effects with:
1. SFX type (whoosh, impact, ambient, etc.)
2. Timestamp where it should be placed
3. Purpose/reason
4. Volume level (subtle/prominent)
5. Duration
6. Alternative options

Focus on:
- Transitions between sections
- Emphasis on key points
- Mood enhancement
- Professional polish`,
            response_json_schema: {
              type: "object",
              properties: {
                sound_effects: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sfx_type: { type: "string" },
                      timestamp: { type: "number" },
                      purpose: { type: "string" },
                      volume_level: { type: "string" },
                      duration: { type: "number" },
                      alternatives: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                mixing_tips: { type: "string" }
              }
            }
          });

          return `🔊 **Sound Effects Suggestions:**\n\n${sfxSuggestions.sound_effects.map((sfx, i) => 
            `${i + 1}. **${sfx.sfx_type}** at ${Math.floor(sfx.timestamp / 60)}:${String(sfx.timestamp % 60).padStart(2, '0')}\n   📝 ${sfx.purpose}\n   🔊 Volume: ${sfx.volume_level} | ⏱️ Duration: ${sfx.duration}s\n   🔄 Alternatives: ${sfx.alternatives.join(', ')}`
          ).join('\n\n')}\n\n**Mixing Tips:**\n${sfxSuggestions.mixing_tips}`;
        },

        // Existing handlers...
        summarizeFeedback: async () => {
          if (comments.length === 0) {
            return "No feedback comments to summarize yet.";
          }

          const summary = await base44.integrations.Core.InvokeLLM({
            prompt: `Summarize this feedback thread concisely:

${comments.map(c => `- ${c.user_name}: ${c.comment_text}`).join('\n')}

Provide:
1. Overall sentiment
2. Main themes (3-5 points)
3. Critical issues (if any)
4. Team consensus`,
            response_json_schema: {
              type: "object",
              properties: {
                sentiment: { type: "string" },
                themes: { type: "array", items: { type: "string" } },
                critical_issues: { type: "array", items: { type: "string" } },
                consensus: { type: "string" }
              }
            }
          });

          return `📊 **Feedback Summary:**\n\nSentiment: ${summary.sentiment}\n\n**Main Themes:**\n${summary.themes.map(t => `• ${t}`).join('\n')}\n\n${summary.critical_issues.length > 0 ? `**Critical Issues:**\n${summary.critical_issues.map(i => `⚠️ ${i}`).join('\n')}\n\n` : ''}**Team Consensus:**\n${summary.consensus}`;
        },

        extractActionItems: async () => {
          if (comments.length === 0) {
            return "No feedback comments to extract action items from.";
          }

          const actionItems = await base44.integrations.Core.InvokeLLM({
            prompt: `Extract clear action items from this feedback:

${comments.map(c => `- ${c.user_name}: ${c.comment_text}`).join('\n')}

For each action item, provide:
- Description
- Suggested assignee (based on nature of task)
- Priority (high/medium/low)
- Estimated effort`,
            response_json_schema: {
              type: "object",
              properties: {
                action_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      assignee: { type: "string" },
                      priority: { type: "string" },
                      effort: { type: "string" }
                    }
                  }
                }
              }
            }
          });

          return `✅ **Action Items:**\n\n${actionItems.action_items.map((item, i) => 
            `${i + 1}. [${item.priority.toUpperCase()}] ${item.description}\n   Assignee: ${item.assignee}\n   Effort: ${item.effort}`
          ).join('\n\n')}`;
        },
      };

      const handler = actionHandlers[action.action_type];
      if (handler) {
        return await handler();
      }

      return "Action not yet implemented.";
    },
  });

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const result = await processMutation.mutateAsync(input);

      const assistantMessage = {
        role: "assistant",
        content: result.response_message,
        actions: result.actions,
        confidence: result.confidence,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-execute high confidence actions
      if (result.confidence > 0.8 && !result.requires_confirmation && result.actions.length > 0) {
        for (const action of result.actions.filter(a => a.can_execute_now)) {
          const executionResult = await executeActionMutation.mutateAsync(action);

          setMessages(prev => [...prev, {
            role: "assistant",
            content: executionResult,
            timestamp: new Date(),
            type: "result"
          }]);
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        type: "error"
      }]);
    }

    setIsProcessing(false);
  };

  const handleQuickAction = async (command) => {
    setInput(command);
    setTimeout(() => handleSendMessage(), 100);
  };

  const quickActions = [
    { label: "Suggest Cuts", icon: Scissors, command: "Suggest strategic cuts to improve pacing", color: "bg-[#FF8C00]" },
    { label: "Add Transitions", icon: Film, command: "Recommend transitions between scenes", color: "bg-[#9D4EDD]" },
    { label: "Create Highlight", icon: Video, command: "Create a 60-second highlight reel of the most engaging moments", color: "bg-[#00D4C9]" },
    { label: "Suggest Music", icon: Music, command: "Suggest background music that matches the mood", color: "bg-[#06D6A0]" },
    { label: "Sound Effects", icon: Headphones, command: "Recommend sound effects for key moments", color: "bg-[#FFD700]" },
    { label: "Analyze Content", icon: Target, command: "Perform deep analysis of this video", color: "bg-[#FF69B4]" }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#111317] border-2 border-[#FFD700] rounded-2xl shadow-2xl w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">AI Video Assistant</h3>
                  <p className="text-gray-400 text-xs">Powered by GPT-4</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Proactive Suggestions */}
            {proactiveSuggestions.length > 0 && showProactiveSuggestions && (
              <div className="p-4 border-b border-gray-800 bg-gradient-to-br from-[#FFD700]/5 to-[#FF8C00]/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white text-xs font-semibold flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-[#FFD700]" />
                    Proactive Suggestions
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowProactiveSuggestions(false)}
                    className="h-5 w-5 p-0 text-gray-400"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {proactiveSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleProactiveSuggestionClick(suggestion)}
                      className="w-full text-left p-2 rounded-lg bg-[#0B0B0C] border border-gray-800 hover:border-[#FFD700] transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <Badge className={`${
                          suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        } h-fit text-xs flex-shrink-0`}>
                          {suggestion.priority}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{suggestion.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{suggestion.impact}</p>
                        </div>
                        <TrendingUp className="w-3 h-3 text-[#FFD700] flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-gray-400 text-xs mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.command)}
                      disabled={isProcessing}
                      className={`p-2 rounded-lg ${action.color} hover:opacity-80 transition-all text-left disabled:opacity-50 border border-transparent hover:border-white/20`}
                    >
                      <Icon className="w-4 h-4 text-white mb-1" />
                      <p className="text-white text-xs font-medium">{action.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {messages.map((message, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-black" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`p-3 rounded-xl ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-[#FFD700] to-[#FF8C00] text-black' 
                        : message.type === 'result'
                        ? 'bg-gradient-to-br from-[#06D6A0]/20 to-[#00D4C9]/20 text-white border border-[#00D4C9]/30'
                        : 'bg-[#0B0B0C] text-white border border-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {message.confidence && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-green-400 h-1.5 rounded-full" 
                                style={{ width: `${message.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(message.confidence * 100)}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.actions.map((action, actionIdx) => (
                          <button
                            key={actionIdx}
                            onClick={async () => {
                              setIsProcessing(true);
                              try {
                                const result = await executeActionMutation.mutateAsync(action);
                                setMessages(prev => [...prev, {
                                  role: "assistant",
                                  content: result,
                                  timestamp: new Date(),
                                  type: "result"
                                }]);
                              } catch (error) {
                                setMessages(prev => [...prev, {
                                  role: "assistant",
                                  content: "❌ Error executing action. Please try again.",
                                  timestamp: new Date(),
                                  type: "error"
                                }]);
                              }
                              setIsProcessing(false);
                            }}
                            disabled={!action.can_execute_now || isProcessing}
                            className="w-full p-2 rounded-lg bg-[#111317] border border-gray-700 hover:border-[#FFD700] transition-all text-left disabled:opacity-50"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white text-xs font-medium">{action.description}</p>
                                {!action.can_execute_now && (
                                  <p className="text-yellow-400 text-xs mt-1">⚠️ Requires confirmation</p>
                                )}
                              </div>
                              <Zap className="w-4 h-4 text-[#FFD700]" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-gray-500 text-xs mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#0B0B0C] border border-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-black animate-spin" />
                  </div>
                  <div className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-3">
                    <p className="text-gray-400 text-sm">Analyzing your request...</p>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  disabled={isProcessing}
                  className="flex-1 bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isProcessing}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="relative bg-gradient-to-br from-[#FFD700] to-[#FF8C00] text-black rounded-full shadow-2xl w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bot className="w-8 h-8" />
            {proactiveSuggestions.length > 0 && showProactiveSuggestions && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <Bell className="w-3 h-3 text-white animate-pulse" />
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}