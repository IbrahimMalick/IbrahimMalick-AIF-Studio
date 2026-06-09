import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  Shield,
  Zap,
  BarChart3,
  MessageSquare,
  Hash
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompetitorReportViewer({ report, user }) {
  const { data: competitorProfile } = useQuery({
    queryKey: ['competitorProfile', report.competitor_profile_id],
    queryFn: () => base44.entities.CompetitorProfile.filter(
      { id: report.competitor_profile_id }
    ).then(profiles => profiles[0]),
    enabled: !!report.competitor_profile_id
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-red-500/10 to-rose-500/10 border-red-500/30';
    if (score >= 60) return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30';
    return 'from-green-500/10 to-emerald-500/10 border-green-500/30';
  };

  const effortColors = {
    minimal: 'bg-green-500/20 text-green-400',
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400'
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white mb-2">
              {competitorProfile?.competitor_name || 'Competitor Analysis'}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#FF69B4]/20 text-[#FF69B4]">
                Strategy Score: {report.overall_strategy_score}/100
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400">
                {report.data_sources_count} posts analyzed
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400">
                {report.ai_confidence_score}% confident
              </Badge>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            {new Date(report.analysis_date).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        
        <Tabs defaultValue="overview">
          <TabsList className="bg-[#0B0B0C] grid grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content">
              <TrendingUp className="w-4 h-4 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="swot">
              <Shield className="w-4 h-4 mr-1" />
              SWOT
            </TabsTrigger>
            <TabsTrigger value="gaps">
              <Lightbulb className="w-4 h-4 mr-1" />
              Gaps
            </TabsTrigger>
            <TabsTrigger value="strategies">
              <Target className="w-4 h-4 mr-1" />
              Counter
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            
            <Card className={`bg-gradient-to-br ${getScoreBg(report.overall_strategy_score)} border-2 rounded-xl`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Competitor Strategy Strength</h3>
                    <p className="text-gray-400 text-sm">
                      {report.overall_strategy_score >= 80 ? 'Strong competitor - requires strategic differentiation' :
                       report.overall_strategy_score >= 60 ? 'Moderate competitor - has exploitable weaknesses' :
                       'Weak competitor - significant opportunities to dominate'}
                    </p>
                  </div>
                  <p className={`text-6xl font-bold ${getScoreColor(report.overall_strategy_score)}`}>
                    {report.overall_strategy_score}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-gray-400 text-xs mb-2">Posting Frequency</h5>
                <p className="text-white font-bold text-lg">
                  {report.content_analysis?.posting_patterns?.posts_per_week || 0} posts/week
                </p>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-gray-400 text-xs mb-2">Top Content Type</h5>
                <p className="text-white font-bold text-lg capitalize">
                  {report.content_analysis?.posting_patterns?.content_mix && 
                    Object.entries(report.content_analysis.posting_patterns.content_mix)
                      .sort(([,a], [,b]) => b - a)[0][0].replace('_percent', '')
                  }
                </p>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-gray-400 text-xs mb-2">Market Gaps Found</h5>
                <p className="text-green-400 font-bold text-lg">
                  {report.market_gaps?.length || 0} opportunities
                </p>
              </div>
            </div>

          </TabsContent>

          {/* Content Analysis */}
          <TabsContent value="content" className="space-y-4 mt-4">
            
            {/* Top Performers */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Top Performing Content
              </h4>
              <div className="space-y-3">
                {report.content_analysis?.top_performing_content?.slice(0, 5).map((content, idx) => (
                  <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] capitalize text-xs">
                            {content.platform}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs capitalize">
                            {content.content_type}
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            {(content.engagement_rate * 100).toFixed(1)}% engage
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                          {content.caption}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-green-400">
                          <strong>Hook:</strong> {content.hook_used}
                        </p>
                      </div>
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-blue-400">
                          <strong>CTA:</strong> {content.cta_used}
                        </p>
                      </div>
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-purple-400">
                          <strong>Why it worked:</strong> {content.why_it_worked}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messaging Patterns */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-white font-semibold mb-3">Top Hooks</h5>
                <div className="space-y-2">
                  {report.messaging_analysis?.top_hooks?.slice(0, 5).map((hook, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-white text-sm mb-1">"{hook.hook_text}"</p>
                      <p className="text-gray-500 text-xs">Pattern: {hook.hook_pattern}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-white font-semibold mb-3">Top CTAs</h5>
                <div className="space-y-2">
                  {report.messaging_analysis?.top_ctas?.slice(0, 5).map((cta, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-white text-sm">"{cta.cta_text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hashtag Strategy */}
            {report.messaging_analysis?.hashtag_strategy && (
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-[#00D4C9]" />
                  Hashtag Strategy
                </h5>
                <p className="text-gray-400 text-sm mb-2">
                  Avg {report.messaging_analysis.hashtag_strategy.avg_hashtags_per_post} hashtags per post
                </p>
                <div className="flex flex-wrap gap-1">
                  {report.messaging_analysis.hashtag_strategy.most_used_hashtags?.slice(0, 15).map((tag, idx) => (
                    <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                      {tag.hashtag} ({tag.usage_count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          </TabsContent>

          {/* SWOT */}
          <TabsContent value="swot" className="space-y-4 mt-4">
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {report.competitor_strengths?.map((strength, idx) => (
                    <div key={idx} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-white font-medium text-sm flex-1">{strength.strength}</p>
                        <Badge className={
                          strength.impact_level === 'high' ? 'bg-red-500/20 text-red-400' :
                          strength.impact_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }>
                          {strength.impact_level}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs mb-1">{strength.evidence}</p>
                      <Badge className="bg-gray-700 text-gray-300 text-xs capitalize">
                        {strength.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Weaknesses (Your Opportunities)
                </h4>
                <div className="space-y-2">
                  {report.competitor_weaknesses?.map((weakness, idx) => (
                    <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-white font-medium text-sm flex-1">{weakness.weakness}</p>
                        <Badge className={
                          weakness.opportunity_level === 'high' ? 'bg-green-500/20 text-green-400' :
                          weakness.opportunity_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>
                          {weakness.opportunity_level}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{weakness.evidence}</p>
                      <div className="p-2 bg-green-500/10 rounded mt-2">
                        <p className="text-green-400 text-xs">
                          <strong>Exploit:</strong> {weakness.how_to_exploit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </TabsContent>

          {/* Market Gaps */}
          <TabsContent value="gaps" className="space-y-4 mt-4">
            
            {report.market_gaps?.map((gap, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="text-white font-bold text-sm mb-1 capitalize">{gap.gap_type}</h5>
                    <p className="text-gray-300 text-sm mb-2">{gap.description}</p>
                    <div className="flex gap-2 mb-2">
                      <Badge className={
                        gap.opportunity_size === 'massive' ? 'bg-green-500/20 text-green-400' :
                        gap.opportunity_size === 'large' ? 'bg-blue-500/20 text-blue-400' :
                        gap.opportunity_size === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {gap.opportunity_size} opportunity
                      </Badge>
                      <Badge className={
                        gap.competition_level === 'low' ? 'bg-green-500/20 text-green-400' :
                        gap.competition_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {gap.competition_level} competition
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#0B0B0C] rounded-lg mb-3">
                  <p className="text-[#00D4C9] text-xs font-semibold mb-1">Suggested Approach:</p>
                  <p className="text-gray-300 text-sm">{gap.suggested_approach}</p>
                </div>

                {gap.content_ideas && gap.content_ideas.length > 0 && (
                  <div className="p-3 bg-[#111317] rounded-lg">
                    <p className="text-gray-400 text-xs mb-2">Content Ideas:</p>
                    <ul className="space-y-1">
                      {gap.content_ideas.map((idea, iIdx) => (
                        <li key={iIdx} className="text-gray-300 text-xs flex items-start gap-2">
                          <Lightbulb className="w-3 h-3 text-[#FFD700] flex-shrink-0 mt-0.5" />
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {gap.expected_impact && (
                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-green-400 text-xs">
                      <strong>Expected Impact:</strong> {gap.expected_impact}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}

          </TabsContent>

          {/* Differentiation Strategies */}
          <TabsContent value="strategies" className="space-y-4 mt-4">
            
            {report.differentiation_strategies?.map((strategy, idx) => (
              <Card key={idx} className="bg-[#0B0B0C] border-gray-800 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm">{strategy.strategy_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 text-sm">{strategy.description}</p>
                  
                  <div className="p-3 bg-[#111317] rounded-lg">
                    <p className="text-[#FFD700] text-xs font-semibold mb-1">How to Position:</p>
                    <p className="text-gray-300 text-sm">{strategy.how_to_position}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-xs mb-2">Messaging Angles:</p>
                    <div className="space-y-1">
                      {strategy.messaging_angles?.map((angle, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-2 p-2 bg-[#111317] rounded">
                          <MessageSquare className="w-3 h-3 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-xs flex-1">{angle}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-green-400 text-xs">
                      <strong>Expected Advantage:</strong> {strategy.expected_advantage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Counter-Strategy Recommendations */}
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FFD700]" />
                Actionable Counter-Strategies
              </h4>
              {report.counterstrategy_recommendations?.sort((a, b) => b.roi_score - a.roi_score).map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 mb-3"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-semibold text-sm mb-1">{rec.title}</h5>
                      <p className="text-gray-400 text-xs mb-2">{rec.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs capitalize">
                          {rec.category?.replace('_', ' ')}
                        </Badge>
                        <Badge className={effortColors[rec.effort_required] || 'bg-gray-500/20 text-gray-400 text-xs'}>
                          {rec.effort_required} effort
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          ROI: {rec.roi_score}/100
                        </Badge>
                        {rec.time_to_impact_days && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {rec.time_to_impact_days} days to impact
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {rec.specific_tactics && rec.specific_tactics.length > 0 && (
                    <div className="p-3 bg-[#111317] rounded-lg mb-3">
                      <p className="text-gray-400 text-xs font-semibold mb-2">Specific Tactics:</p>
                      <div className="space-y-2">
                        {rec.specific_tactics.map((tactic, tIdx) => (
                          <div key={tIdx} className="space-y-1">
                            <p className="text-white text-xs font-medium">{tactic.tactic}</p>
                            <p className="text-gray-400 text-xs">{tactic.implementation}</p>
                            {tactic.example && (
                              <p className="text-[#00D4C9] text-xs italic">Example: {tactic.example}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.expected_results && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-xs font-semibold mb-1">Expected Results:</p>
                      {rec.expected_results.engagement_lift && (
                        <p className="text-gray-300 text-xs">• Engagement: {rec.expected_results.engagement_lift}</p>
                      )}
                      {rec.expected_results.competitive_advantage && (
                        <p className="text-gray-300 text-xs">• Advantage: {rec.expected_results.competitive_advantage}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

          </TabsContent>

        </Tabs>

      </CardContent>
    </Card>
  );
}