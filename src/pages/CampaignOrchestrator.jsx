import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Calendar,
  Mail,
  Share2,
  FileText,
  Target,
  Zap,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CampaignBuilder from '@/components/CampaignBuilder';
import CampaignDashboard from '@/components/CampaignDashboard';
import CampaignTimeline from '@/components/CampaignTimeline';

export default function CampaignOrchestrator() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', user?.email],
    queryFn: () => base44.entities.Campaign.filter(
      { user_email: user.email },
      '-created_date',
      50
    ),
    enabled: !!user
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    planning: campaigns.filter(c => c.status === 'planning' || c.status === 'generating_content').length,
    total_assets: campaigns.reduce((sum, c) => sum + (c.total_assets_generated || 0), 0),
    total_deployed: campaigns.reduce((sum, c) => sum + (c.total_assets_deployed || 0), 0),
    total_reach: campaigns.reduce((sum, c) => sum + (c.performance_metrics?.total_reach || 0), 0),
    total_conversions: campaigns.reduce((sum, c) => sum + (c.performance_metrics?.total_conversions || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#FFD700]" />
            AI Campaign Orchestrator
          </h1>
          <p className="text-gray-400">
            Define your goal → AI generates multi-channel content → Auto-schedules → Tracks performance
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Campaigns', value: stats.total, icon: Target, color: 'text-[#FFD700]' },
            { label: 'Active', value: stats.active, icon: Zap, color: 'text-green-400' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-blue-400' },
            { label: 'Planning', value: stats.planning, icon: Calendar, color: 'text-purple-400' },
            { label: 'Assets', value: stats.total_assets, icon: FileText, color: 'text-[#00D4C9]' },
            { label: 'Published', value: stats.total_deployed, icon: Share2, color: 'text-green-400' },
            { label: 'Reach', value: (stats.total_reach / 1000).toFixed(1) + 'K', icon: TrendingUp, color: 'text-purple-400' },
            { label: 'Conversions', value: stats.total_conversions, icon: BarChart3, color: 'text-green-400' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Value Proposition */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-white font-bold text-lg mb-3">🚀 Complete Campaign Automation</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-[#00D4C9] font-semibold mb-1">1️⃣ Define Goal</p>
                <p className="text-gray-300 text-sm">Product launch, leads, awareness</p>
              </div>
              <div>
                <p className="text-[#FFD700] font-semibold mb-1">2️⃣ AI Orchestrates</p>
                <p className="text-gray-300 text-sm">Generates 50+ content pieces</p>
              </div>
              <div>
                <p className="text-purple-400 font-semibold mb-1">3️⃣ Auto-Schedule</p>
                <p className="text-gray-300 text-sm">Optimal times per platform</p>
              </div>
              <div>
                <p className="text-green-400 font-semibold mb-1">4️⃣ Track ROI</p>
                <p className="text-gray-300 text-sm">Real-time performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] border border-gray-800 rounded-xl">
            <TabsTrigger value="create">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Campaign
            </TabsTrigger>
            <TabsTrigger value="active">
              <Zap className="w-4 h-4 mr-2" />
              Active ({stats.active})
            </TabsTrigger>
            <TabsTrigger value="all">
              <Target className="w-4 h-4 mr-2" />
              All Campaigns ({stats.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <CampaignBuilder user={user} />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-4">
              {campaigns.filter(c => c.status === 'active').length > 0 ? (
                campaigns.filter(c => c.status === 'active').map((campaign) => (
                  <CampaignDashboard key={campaign.id} campaign={campaign} user={user} />
                ))
              ) : (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Zap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No active campaigns</p>
                    <p className="text-gray-500 text-sm">Create your first AI-orchestrated campaign</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700] transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white mb-2">{campaign.campaign_name}</CardTitle>
                        <p className="text-gray-400 text-sm mb-3">{campaign.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={
                            campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                            campaign.status === 'planning' || campaign.status === 'generating_content' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }>
                            {campaign.status.replace('_', ' ')}
                          </Badge>
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] capitalize">
                            {campaign.campaign_goal.replace('_', ' ')}
                          </Badge>
                          <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                            {campaign.total_assets_generated || 0} assets
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            {campaign.duration_days} days
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {new Date(campaign.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-2 bg-[#0B0B0C] rounded">
                        <p className="text-white font-bold text-sm">
                          {(campaign.performance_metrics?.total_reach / 1000 || 0).toFixed(1)}K
                        </p>
                        <p className="text-gray-500 text-xs">Reach</p>
                      </div>
                      <div className="p-2 bg-[#0B0B0C] rounded">
                        <p className="text-white font-bold text-sm">
                          {((campaign.performance_metrics?.engagement_rate || 0) * 100).toFixed(1)}%
                        </p>
                        <p className="text-gray-500 text-xs">Engage</p>
                      </div>
                      <div className="p-2 bg-[#0B0B0C] rounded">
                        <p className="text-white font-bold text-sm">
                          {campaign.performance_metrics?.total_conversions || 0}
                        </p>
                        <p className="text-gray-500 text-xs">Conv.</p>
                      </div>
                      <div className="p-2 bg-[#0B0B0C] rounded">
                        <p className="text-green-400 font-bold text-sm">
                          {(campaign.performance_metrics?.roas || 0).toFixed(1)}x
                        </p>
                        <p className="text-gray-500 text-xs">ROAS</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}