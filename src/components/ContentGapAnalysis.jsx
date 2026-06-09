import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  TrendingUp,
  Sparkles,
  Loader2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentGapAnalysis({ user, events, currentDate }) {
  const [analysis, setAnalysis] = useState(null);

  const analyzeGapsMutation = useMutation({
    mutationFn: async () => {
      // Analyze content distribution
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Count events by type in next 30 days
      const upcomingEvents = events.filter(e => {
        const eventDate = new Date(e.scheduled_date);
        return eventDate >= today && eventDate <= nextMonth;
      });

      const socialPosts = upcomingEvents.filter(e => e.event_type === 'social_post');
      const emails = upcomingEvents.filter(e => e.event_type === 'email_campaign');
      const blogs = upcomingEvents.filter(e => e.event_type === 'blog_post');
      const videos = upcomingEvents.filter(e => e.event_type === 'video_publish');

      // Analyze past performance
      const pastEvents = events.filter(e => {
        const eventDate = new Date(e.scheduled_date);
        return eventDate < today && e.actual_performance;
      });

      const avgEngagement = pastEvents.length > 0
        ? pastEvents.reduce((sum, e) => sum + (e.actual_performance?.actual_engagement_rate || 0), 0) / pastEvents.length
        : 0;

      // Get AI recommendations
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this content calendar for gaps and opportunities:

UPCOMING CONTENT (Next 30 days):
- Social Posts: ${socialPosts.length}
- Email Campaigns: ${emails.length}
- Blog Posts: ${blogs.length}
- Video Publishes: ${videos.length}
- Total: ${upcomingEvents.length}

HISTORICAL PERFORMANCE:
- Past events analyzed: ${pastEvents.length}
- Average engagement rate: ${(avgEngagement * 100).toFixed(1)}%

CURRENT DATE: ${today.toISOString().split('T')[0]}

ANALYZE:

1. CONTENT GAPS:
   - Which content types are underrepresented?
   - Which days/times have no content scheduled?
   - Which platforms are being neglected?
   - Are there long gaps between posts?

2. RECOMMENDATIONS (prioritized):
   - What content to create
   - When to schedule it
   - Which platforms to target
   - Expected impact

3. OPTIMAL MIX:
   - Recommended posts per week by type
   - Ideal posting frequency per platform
   - Content diversity score (0-100)

4. RISKS:
   - Over-saturation on specific days
   - Under-posting periods
   - Platform imbalance

Format as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap_type: { type: "string" },
                  severity: { type: "string", "enum": ["low", "medium", "high", "critical"] },
                  description: { type: "string" },
                  affected_period: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  action: { type: "string" },
                  content_type: { type: "string" },
                  platforms: { type: "array", items: { type: "string" } },
                  suggested_date: { type: "string" },
                  expected_impact: { type: "string" },
                  effort: { type: "string" }
                }
              }
            },
            optimal_mix: {
              type: "object",
              properties: {
                social_posts_per_week: { type: "number" },
                emails_per_week: { type: "number" },
                blogs_per_week: { type: "number" },
                videos_per_week: { type: "number" },
                diversity_score: { type: "number" }
              }
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk_type: { type: "string" },
                  description: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            content_balance: {
              type: "object",
              properties: {
                current_social_percentage: { type: "number" },
                current_email_percentage: { type: "number" },
                current_blog_percentage: { type: "number" },
                ideal_social_percentage: { type: "number" },
                ideal_email_percentage: { type: "number" },
                ideal_blog_percentage: { type: "number" }
              }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (result) => {
      setAnalysis(result);
    }
  });

  useEffect(() => {
    if (user && events.length > 0 && !analysis) {
      analyzeGapsMutation.mutate();
    }
  }, [user, events.length]);

  if (!analysis && !analyzeGapsMutation.isPending) {
    return (
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 text-sm mb-3">Analyze your content calendar for gaps</p>
          <Button
            onClick={() => analyzeGapsMutation.mutate()}
            size="sm"
            className="bg-[#00D4C9] text-black"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Gaps
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (analyzeGapsMutation.isPending) {
    return (
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-[#00D4C9] animate-spin" />
          <p className="text-gray-400 text-sm">Analyzing your calendar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          Content Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Diversity Score */}
        {analysis.optimal_mix && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">Content Diversity</p>
              <p className="text-white font-bold">{analysis.optimal_mix.diversity_score}/100</p>
            </div>
            <Progress value={analysis.optimal_mix.diversity_score} className="h-2" />
          </div>
        )}

        {/* Critical Gaps */}
        {analysis.gaps && analysis.gaps.filter(g => g.severity === 'high' || g.severity === 'critical').length > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-semibold text-xs mb-2">⚠️ Critical Gaps</p>
            <div className="space-y-2">
              {analysis.gaps.filter(g => g.severity === 'high' || g.severity === 'critical').slice(0, 3).map((gap, idx) => (
                <div key={idx} className="text-xs">
                  <p className="text-white font-medium">{gap.gap_type}</p>
                  <p className="text-gray-400">{gap.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Recommendations */}
        {analysis.recommendations && (
          <div>
            <p className="text-gray-400 text-xs mb-2">Top Recommendations</p>
            <div className="space-y-2">
              {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-xs">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-medium mb-1">{rec.action}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs capitalize">
                          {rec.content_type?.replace('_', ' ')}
                        </Badge>
                        <Badge className={
                          rec.effort === 'low' ? 'bg-green-500/20 text-green-400 text-xs' :
                          rec.effort === 'medium' ? 'bg-yellow-500/20 text-yellow-400 text-xs' :
                          'bg-red-500/20 text-red-400 text-xs'
                        }>
                          {rec.effort} effort
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-xs">{rec.expected_impact}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Optimal Mix */}
        {analysis.optimal_mix && (
          <div className="p-3 bg-[#00D4C9]/10 border border-[#00D4C9]/30 rounded-lg">
            <p className="text-[#00D4C9] font-semibold text-xs mb-2">📊 Recommended Weekly Mix</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-400">Social Posts</p>
                <p className="text-white font-bold">{analysis.optimal_mix.social_posts_per_week}/week</p>
              </div>
              <div>
                <p className="text-gray-400">Emails</p>
                <p className="text-white font-bold">{analysis.optimal_mix.emails_per_week}/week</p>
              </div>
              <div>
                <p className="text-gray-400">Blog Posts</p>
                <p className="text-white font-bold">{analysis.optimal_mix.blogs_per_week}/week</p>
              </div>
              <div>
                <p className="text-gray-400">Videos</p>
                <p className="text-white font-bold">{analysis.optimal_mix.videos_per_week}/week</p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={() => analyzeGapsMutation.mutate()}
          size="sm"
          variant="outline"
          className="w-full border-gray-700 text-xs"
        >
          Refresh Analysis
        </Button>

      </CardContent>
    </Card>
  );
}