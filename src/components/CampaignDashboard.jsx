
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Users,
  MousePointer,
  DollarSign,
  Target,
  Calendar,
  Share2,
  Mail,
  FileText,
  BarChart3,
  CheckCircle2,
  Sparkles // Added Sparkles import for AI Recommendations
} from 'lucide-react';
import { motion } from 'framer-motion';
import CampaignPerformanceInsights from '@/components/CampaignPerformanceInsights';

export default function CampaignDashboard({ campaign, user }) {
  const metrics = campaign.performance_metrics || {};
  const assets = campaign.generated_assets || {};

  const kpiProgress = campaign.kpis?.map(kpi => ({
    ...kpi,
    progress: Math.min(100, (kpi.current_value / kpi.target_value) * 100)
  }));

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-white">{campaign.campaign_name}</CardTitle>
              <Badge className={
                campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-gray-400 text-sm mb-3">{campaign.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] capitalize">
                {campaign.campaign_goal.replace('_', ' ')}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400">
                Day {Math.floor((new Date() - new Date(campaign.start_date)) / (1000 * 60 * 60 * 24))} / {campaign.duration_days}
              </Badge>
              <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                {campaign.total_assets_generated} assets
              </Badge>
              <Badge className="bg-green-500/20 text-green-400">
                {campaign.total_assets_deployed} published
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Reach', value: (metrics.total_reach / 1000 || 0).toFixed(1) + 'K', icon: Users, color: 'text-purple-400' },
            { label: 'Engagement', value: ((metrics.engagement_rate || 0) * 100).toFixed(1) + '%', icon: TrendingUp, color: 'text-[#00D4C9]' },
            { label: 'Clicks', value: metrics.total_clicks || 0, icon: MousePointer, color: 'text-blue-400' },
            { label: 'Conversions', value: metrics.total_conversions || 0, icon: Target, color: 'text-green-400' },
            { label: 'ROAS', value: (metrics.roas || 0).toFixed(1) + 'x', icon: DollarSign, color: 'text-[#FFD700]' }
          ].map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
                <p className="text-gray-400 text-xs">{metric.label}</p>
              </div>
            );
          })}
        </div>

        {/* KPI Progress */}
        {kpiProgress && kpiProgress.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3">Campaign KPIs</h4>
            <div className="space-y-3">
              {kpiProgress.map((kpi, idx) => (
                <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm">{kpi.metric_name}</p>
                    <p className="text-gray-400 text-sm">
                      {kpi.current_value || 0} / {kpi.target_value} {kpi.unit}
                    </p>
                  </div>
                  <Progress value={kpi.progress} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Performance Insights - NEW */}
        {campaign.status === 'active' || campaign.status === 'completed' ? (
          <CampaignPerformanceInsights campaign={campaign} user={user} />
        ) : null}

        {/* Content Breakdown */}
        <div>
          <h4 className="text-white font-semibold mb-3">Content Assets</h4>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: 'Social Posts', count: assets.social_posts?.length || 0, icon: Share2, color: 'bg-[#00D4C9]/20 text-[#00D4C9]' },
              { label: 'Emails', count: assets.emails?.length || 0, icon: Mail, color: 'bg-blue-500/20 text-blue-400' },
              { label: 'Blog Posts', count: assets.blogs?.length || 0, icon: FileText, color: 'bg-purple-500/20 text-purple-400' },
              { label: 'Ad Creatives', count: assets.ads?.length || 0, icon: Target, color: 'bg-green-500/20 text-green-400' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.color.split(' ')[1]}`} />
                  <div>
                    <p className="text-white font-bold text-lg">{item.count}</p>
                    <p className="text-gray-400 text-xs">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Phases */}
        {campaign.campaign_phases && campaign.campaign_phases.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3">Campaign Phases</h4>
            <div className="space-y-2">
              {campaign.campaign_phases.map((phase, idx) => {
                const currentDay = Math.floor((new Date() - new Date(campaign.start_date)) / (1000 * 60 * 60 * 24));
                const isActive = currentDay >= phase.start_day && currentDay <= phase.end_day;
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      isActive
                        ? 'bg-[#FFD700]/10 border-[#FFD700]'
                        : 'bg-[#0B0B0C] border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold text-sm ${isActive ? 'text-[#FFD700]' : 'text-white'}`}>
                        {phase.phase_name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Day {phase.start_day}-{phase.end_day}
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs">{phase.objective}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {campaign.ai_recommendations && campaign.ai_recommendations.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 rounded-xl">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {campaign.ai_recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-xs">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{rec.recommendation}</p>
                    <p className="text-gray-500 text-xs">Impact: {rec.expected_impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => window.location.href = '/UnifiedContentCalendar'}
            className="flex-1 bg-[#00D4C9] text-black rounded-xl"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View in Calendar
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-gray-700 rounded-xl"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
