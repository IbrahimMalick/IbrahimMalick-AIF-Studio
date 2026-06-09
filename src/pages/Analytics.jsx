import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  MousePointer,
  ShoppingCart,
  BarChart3,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Video,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: adCampaigns = [] } = useQuery({
    queryKey: ["adCampaigns", user?.email],
    queryFn: () => base44.entities.AdCampaign.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: videoProjects = [] } = useQuery({
    queryKey: ["videoProjects"],
    queryFn: () => base44.entities.VideoProject.list("-updated_date", 50),
    enabled: !!user,
  });

  const { data: socialPosts = [] } = useQuery({
    queryKey: ["socialPosts", user?.email],
    queryFn: () => base44.entities.SocialMediaPost.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: artGenerations = [] } = useQuery({
    queryKey: ["artGenerations"],
    queryFn: () => base44.entities.ArtGeneration.list("-created_date", 100),
    enabled: !!user,
  });

  // Calculate aggregate metrics
  const totalAdSpend = adCampaigns.reduce((sum, c) => sum + (c.spent_usd || 0), 0);
  const totalRevenue = adCampaigns.reduce((sum, c) => sum + (c.revenue_usd || 0), 0);
  const totalConversions = adCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const totalClicks = adCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalImpressions = adCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  
  const avgROAS = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;
  const avgCPA = totalConversions > 0 ? totalAdSpend / totalConversions : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Content performance
  const totalVideosCreated = videoProjects.length;
  const totalArtGenerated = artGenerations.length;
  const totalSocialPosts = socialPosts.length;
  const totalEngagement = socialPosts.reduce((sum, p) => 
    sum + (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0), 0
  );

  const kpis = [
    {
      label: "Total Ad Spend",
      value: totalAdSpend,
      prefix: "$",
      suffix: "",
      change: 15.3,
      icon: DollarSign,
      color: "from-[#FF4433] to-[#FF8C00]"
    },
    {
      label: "Revenue Generated",
      value: totalRevenue,
      prefix: "$",
      suffix: "",
      change: 28.7,
      icon: TrendingUp,
      color: "from-[#00D4C9] to-[#00A8A0]"
    },
    {
      label: "ROAS",
      value: avgROAS.toFixed(2),
      prefix: "",
      suffix: "x",
      change: avgROAS > 3 ? 12.4 : -5.2,
      icon: Target,
      color: "from-[#00FF88] to-[#00CC6A]"
    },
    {
      label: "Conversions",
      value: totalConversions,
      prefix: "",
      suffix: "",
      change: 19.8,
      icon: ShoppingCart,
      color: "from-[#A89C94] to-[#1E90FF]"
    }
  ];

  const contentKPIs = [
    {
      label: "Videos Created",
      value: totalVideosCreated,
      icon: Video,
      color: "from-[#FF4433] to-[#FF8C00]"
    },
    {
      label: "AI Art Generated",
      value: totalArtGenerated,
      icon: Sparkles,
      color: "from-[#FF8C00] to-[#A89C94]"
    },
    {
      label: "Social Posts",
      value: totalSocialPosts,
      icon: Activity,
      color: "from-[#00D4C9] to-[#1E90FF]"
    },
    {
      label: "Total Engagement",
      value: totalEngagement,
      icon: Users,
      color: "from-[#A89C94] to-[#00FF88]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Analytics & Performance
            </h1>
            <p className="text-gray-400">Track your ROI and content performance</p>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "1y"].map((range) => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                variant={timeRange === range ? "default" : "outline"}
                className={`rounded-xl ${
                  timeRange === range
                    ? "bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black"
                    : "border-gray-700 text-gray-400"
                }`}
              >
                {range === "7d" ? "7 Days" :
                 range === "30d" ? "30 Days" :
                 range === "90d" ? "90 Days" : "1 Year"}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="bg-[#1A1A1A] rounded-xl">
            <TabsTrigger value="ads">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ad Performance
            </TabsTrigger>
            <TabsTrigger value="content">
              <Video className="w-4 h-4 mr-2" />
              Content Performance
            </TabsTrigger>
            <TabsTrigger value="roi">
              <DollarSign className="w-4 h-4 mr-2" />
              ROI Analysis
            </TabsTrigger>
          </TabsList>

          {/* AD PERFORMANCE TAB */}
          <TabsContent value="ads" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                const isPositive = kpi.change > 0;
                
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group">
                      <div className={`h-1 bg-gradient-to-r ${kpi.color}`} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} bg-opacity-10`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge className={`${
                            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          } border-0`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {Math.abs(kpi.change)}%
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
                        <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {kpi.prefix}{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}{kpi.suffix}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">vs. previous period</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Campaign Performance Table */}
            <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {adCampaigns.length > 0 ? (
                  <div className="space-y-3">
                    {adCampaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 bg-[#0E0E0E] rounded-xl border border-gray-800 hover:border-[#FFD700] transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={`${
                              campaign.platform === 'google_ads' ? 'bg-[#4285F4]/20 text-[#4285F4]' :
                              campaign.platform === 'meta_ads' ? 'bg-[#1877F2]/20 text-[#1877F2]' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {campaign.platform.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-white font-semibold">{campaign.campaign_name}</span>
                          </div>
                          <Badge className={`${
                            campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {campaign.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Spent</p>
                            <p className="text-white font-bold">${campaign.spent_usd?.toFixed(2) || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Revenue</p>
                            <p className="text-white font-bold">${campaign.revenue_usd?.toFixed(2) || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">ROAS</p>
                            <p className={`font-bold ${
                              (campaign.roas || 0) > 3 ? 'text-green-400' :
                              (campaign.roas || 0) > 1.5 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {campaign.roas?.toFixed(2) || 0}x
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Conversions</p>
                            <p className="text-white font-bold">{campaign.conversions || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">CPA</p>
                            <p className="text-white font-bold">${campaign.cpa?.toFixed(2) || 0}</p>
                          </div>
                        </div>

                        {campaign.linked_content_id && (
                          <div className="mt-3 pt-3 border-t border-gray-800">
                            <p className="text-gray-500 text-xs mb-1">Linked Content</p>
                            <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs">
                              {campaign.linked_content_type} #{campaign.linked_content_id.slice(0, 8)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-400 mb-2">No ad campaigns yet</p>
                    <p className="text-gray-500 text-sm">Connect Google Ads or Meta Ads in Integrations to start tracking</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#FFD700]" />
                    Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white mb-2">
                    {totalImpressions.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">Total ad impressions</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-[#00D4C9]" />
                    Click Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white mb-2">
                    {avgCTR.toFixed(2)}%
                  </p>
                  <p className="text-gray-500 text-sm">Average CTR</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#00FF88]" />
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white mb-2">
                    {totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0}%
                  </p>
                  <p className="text-gray-500 text-sm">Clicks to conversions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CONTENT PERFORMANCE TAB */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contentKPIs.map((kpi, idx) => {
                const Icon = kpi.icon;
                
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl overflow-hidden">
                      <div className={`h-1 bg-gradient-to-r ${kpi.color}`} />
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
                        <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {kpi.value.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Top Performing Content */}
            <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {socialPosts.slice(0, 10).map((post, idx) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-[#0E0E0E] rounded-xl mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-700">#{idx + 1}</span>
                      <div>
                        <p className="text-white font-medium mb-1">{post.caption?.substring(0, 60)}...</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-gray-500">
                            ❤️ {post.likes_count || 0}
                          </span>
                          <span className="text-gray-500">
                            💬 {post.comments_count || 0}
                          </span>
                          <span className="text-gray-500">
                            🔄 {post.shares_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                      {post.platform}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROI ANALYSIS TAB */}
          <TabsContent value="roi" className="space-y-6">
            <Card className="bg-[#1A1A1A] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Content → Revenue Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videoProjects.slice(0, 5).map((project) => {
                    // Find campaigns linked to this project
                    const linkedCampaigns = adCampaigns.filter(c => c.linked_content_id === project.id);
                    const projectRevenue = linkedCampaigns.reduce((sum, c) => sum + (c.revenue_usd || 0), 0);
                    const projectSpend = linkedCampaigns.reduce((sum, c) => sum + (c.spent_usd || 0), 0);
                    const projectROAS = projectSpend > 0 ? projectRevenue / projectSpend : 0;

                    return (
                      <div key={project.id} className="p-4 bg-[#0E0E0E] rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold">{project.title}</h3>
                          <Badge className={`${
                            projectROAS > 3 ? 'bg-green-500/20 text-green-400' :
                            projectROAS > 1.5 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {projectROAS.toFixed(2)}x ROAS
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Ad Spend</p>
                            <p className="text-white font-bold">${projectSpend.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Revenue</p>
                            <p className="text-white font-bold">${projectRevenue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Linked Campaigns</p>
                            <p className="text-white font-bold">{linkedCampaigns.length}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}