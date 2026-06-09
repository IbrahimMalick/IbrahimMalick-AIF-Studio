import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  Share2,
  DollarSign,
  Users,
  Globe,
  Target,
  Zap,
  Film,
  Download,
  Sparkles,
  Brain,
  Loader2,
  Play,
  AlertCircle,
  Award,
  Map,
  Calendar,
  Percent,
  Activity,
  Package,
  Filter,
  CheckCircle2,
  Settings
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { motion } from "framer-motion";
import AgentProductivityReport from "@/components/AgentProductivityReport";

export default function AdvancedAnalytics() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dateRange, setDateRange] = useState("30days");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["videoProjects", user?.email],
    queryFn: () => base44.entities.VideoProject.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: analyticsData = [] } = useQuery({
    queryKey: ["performanceAnalytics", selectedProject?.id],
    queryFn: () => base44.entities.VideoPerformanceAnalytics.filter({
      video_project_id: selectedProject.id
    }),
    enabled: !!selectedProject,
  });

  const { data: allAnalytics = [] } = useQuery({
    queryKey: ["allAnalytics", user?.email],
    queryFn: () => base44.entities.VideoPerformanceAnalytics.filter({
      user_email: user.email
    }, "-analysis_date"),
    enabled: !!user,
  });

  const { data: monetizationData = [] } = useQuery({
    queryKey: ["monetization", user?.email],
    queryFn: () => base44.entities.VideoMonetization.filter({
      user_email: user.email
    }),
    enabled: !!user,
  });

  // Agent efficiency metrics
  const { data: productionQueues = [] } = useQuery({
    queryKey: ["productionQueues", user?.email],
    queryFn: () => base44.entities.ProductionQueue.filter({}, "-created_date", 100),
    enabled: !!user,
  });

  // ARIA voice usage logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["activityLogs", user?.email],
    queryFn: () => base44.entities.ActivityLog.filter({
      user_email: user.email,
      action_type: "voice_command"
    }, "-created_date", 200),
    enabled: !!user,
  });

  // Generate AI Insights
  const handleGenerateInsights = async () => {
    if (!selectedProject) {
      alert("Please select a video project first");
      return;
    }

    setIsGeneratingInsights(true);
    try {
      const analytics = analyticsData[0];
      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze video performance and generate comprehensive insights:

VIDEO PROJECT:
- Title: ${selectedProject.title}
- Duration: ${selectedProject.duration_seconds}s
- Export Preset: ${selectedProject.selected_export_preset || 'Not set'}

PERFORMANCE DATA:
${analytics ? `
- Overall Views: ${analytics.actual_performance?.overall_views || 0}
- Engagement Rate: ${analytics.actual_performance?.overall_engagement_rate || 0}%
- Retention Rate: ${analytics.actual_performance?.average_retention_rate || 0}%
- Watch Time: ${analytics.actual_performance?.total_watch_time_minutes || 0} minutes

PLATFORM BREAKDOWN:
${Object.entries(analytics.platform_metrics || {}).map(([platform, metrics]) => `
${platform.toUpperCase()}:
  - Views: ${metrics.views || 0}
  - Engagement: ${metrics.engagement_rate || 0}%
  - Watch Time: ${metrics.watch_time_minutes || 0}m
`).join('\n')}

DROP-OFF ANALYSIS:
${analytics.drop_off_analysis?.critical_drop_points?.map(p => 
  `- ${Math.floor(p.timestamp_seconds/60)}:${String(p.timestamp_seconds%60).padStart(2,'0')} - ${p.drop_percentage}% drop (${p.reason})`
).join('\n') || 'No drop-off data'}
` : 'No performance data yet'}

Generate comprehensive insights:

1. PERFORMANCE SUMMARY:
   - Overall health score (0-100)
   - Trend (improving/stable/declining)
   - Key wins (3-5 items)
   - Concerns (3-5 items)

2. AUDIENCE INSIGHTS:
   - Who's watching (demographics)
   - When they watch (peak times)
   - How they watch (device, platform)
   - Engagement patterns

3. CONTENT OPTIMIZATION:
   - Best performing moments (timestamps)
   - Weakest sections (what to improve)
   - Retention killers (drop-off causes)
   - Hook effectiveness

4. MONETIZATION OPPORTUNITIES:
   - Revenue potential score
   - Best monetization strategy
   - Sponsorship fit score
   - Upsell opportunities

5. COMPETITIVE ANALYSIS:
   - How you compare to similar content
   - Market position
   - Growth opportunities

6. ACTION ITEMS:
   - Top 5 things to do next
   - Quick wins
   - Long-term strategies`,
        response_json_schema: {
          type: "object",
          properties: {
            performance_summary: {
              type: "object",
              properties: {
                health_score: { type: "number" },
                trend: { type: "string" },
                key_wins: { type: "array", items: { type: "string" } },
                concerns: { type: "array", items: { type: "string" } }
              }
            },
            audience_insights: {
              type: "object",
              properties: {
                primary_demographic: { type: "string" },
                peak_viewing_times: { type: "array", items: { type: "string" } },
                top_devices: { type: "array", items: { type: "string" } },
                engagement_pattern: { type: "string" }
              }
            },
            content_optimization: {
              type: "object",
              properties: {
                best_moments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp_seconds: { type: "number" },
                      reason: { type: "string" },
                      engagement_spike: { type: "number" }
                    }
                  }
                },
                weak_sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timestamp_seconds: { type: "number" },
                      issue: { type: "string" },
                      suggestion: { type: "string" }
                    }
                  }
                },
                hook_score: { type: "number" }
              }
            },
            monetization_opportunities: {
              type: "object",
              properties: {
                revenue_potential_score: { type: "number" },
                best_strategy: { type: "string" },
                sponsorship_fit: { type: "number" },
                opportunities: { type: "array", items: { type: "string" } }
              }
            },
            competitive_analysis: {
              type: "object",
              properties: {
                market_position: { type: "string" },
                vs_average: { type: "number" },
                growth_potential: { type: "string" },
                competitive_advantages: { type: "array", items: { type: "string" } }
              }
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiInsights(insights);
      alert("✅ AI Insights Generated!");
    } catch (error) {
      alert("Error generating insights");
    }
    setIsGeneratingInsights(false);
  };

  // Mock data for demonstration
  const retentionData = selectedProject && analyticsData[0]?.drop_off_analysis?.retention_curve || [
    { time: 0, retention: 100 },
    { time: 15, retention: 92 },
    { time: 30, retention: 78 },
    { time: 45, retention: 65 },
    { time: 60, retention: 58 },
    { time: 90, retention: 45 },
    { time: 120, retention: 35 },
    { time: 150, retention: 28 },
    { time: 180, retention: 22 }
  ];

  const platformData = [
    { platform: "YouTube", views: 15420, engagement: 8.5, watchTime: 2340 },
    { platform: "Instagram", views: 8230, engagement: 12.3, watchTime: 890 },
    { platform: "TikTok", views: 24500, engagement: 15.7, watchTime: 1200 },
    { platform: "Facebook", views: 5120, engagement: 5.2, watchTime: 780 }
  ];

  const demographicAge = [
    { age: "13-17", percentage: 8 },
    { age: "18-24", percentage: 28 },
    { age: "25-34", percentage: 35 },
    { age: "35-44", percentage: 18 },
    { age: "45-54", percentage: 8 },
    { age: "55+", percentage: 3 }
  ];

  const demographicLocation = [
    { country: "United States", percentage: 42, viewers: 18500 },
    { country: "United Kingdom", percentage: 15, viewers: 6600 },
    { country: "Canada", percentage: 12, viewers: 5300 },
    { country: "Australia", percentage: 10, viewers: 4400 },
    { country: "Germany", percentage: 8, viewers: 3500 },
    { country: "Other", percentage: 13, viewers: 5700 }
  ];

  const revenueByVideo = allAnalytics.slice(0, 5).map((a, idx) => ({
    title: `Video ${idx + 1}`,
    revenue: Math.random() * 500 + 50,
    cpm: Math.random() * 8 + 2,
    views: Math.random() * 10000 + 1000
  }));

  const exportPresetPerformance = [
    { preset: "YouTube 4K", avgViews: 12500, avgEngagement: 9.2, avgRetention: 68 },
    { preset: "YouTube HD", avgViews: 18200, avgEngagement: 11.5, avgRetention: 72 },
    { preset: "Instagram Reel", avgViews: 8900, avgEngagement: 15.1, avgRetention: 45 },
    { preset: "TikTok", avgViews: 22000, avgEngagement: 18.3, avgRetention: 42 }
  ];

  const COLORS = ['#FFD700', '#00D4C9', '#FF8C00', '#9D4EDD', '#06D6A0', '#FF69B4'];

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-400 bg-green-500/20";
    if (score >= 60) return "text-yellow-400 bg-yellow-500/20";
    if (score >= 40) return "text-orange-400 bg-orange-500/20";
    return "text-red-400 bg-red-500/20";
  };

  const totalViews = platformData.reduce((sum, p) => sum + p.views, 0);
  const avgEngagement = platformData.reduce((sum, p) => sum + p.engagement, 0) / platformData.length;
  const totalWatchTime = platformData.reduce((sum, p) => sum + p.watchTime, 0);
  const totalRevenue = revenueByVideo.reduce((sum, v) => sum + v.revenue, 0);

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#00D4C9]" />
              Advanced Video Analytics
            </h1>
            <p className="text-gray-400">Deep insights into your content performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-[#111317] border-gray-700 text-white rounded-xl w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights || !selectedProject}
              className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl"
            >
              {isGeneratingInsights ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              AI Insights
            </Button>
          </div>
        </div>

        {/* Project Selector */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 text-[#FFD700]" />
              <Select
                value={selectedProject?.id || ""}
                onValueChange={(id) => setSelectedProject(projects.find(p => p.id === id))}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl flex-1">
                  <SelectValue placeholder="Select a video project to analyze..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject && (
                <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                  {selectedProject.selected_export_preset || 'No preset'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedProject ? (
          <div className="text-center py-20">
            <BarChart3 className="w-20 h-20 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">Select a video project to view analytics</p>
            <p className="text-gray-500 text-sm">Choose from the dropdown above</p>
          </div>
        ) : (
          <>
            {/* Overview KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
                  <p className="text-3xl font-bold text-white mb-1">
                    {totalViews.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">Total Views</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs">+12.5%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-[#00D4C9]" />
                  <p className="text-3xl font-bold text-white mb-1">
                    {totalWatchTime.toLocaleString()}m
                  </p>
                  <p className="text-xs text-gray-400">Watch Time</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs">+8.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-[#9D4EDD]" />
                  <p className="text-3xl font-bold text-white mb-1">
                    {avgEngagement.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400">Avg Engagement</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    <span className="text-red-400 text-xs">-2.1%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border border-[#06D6A0]/30 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-[#06D6A0]" />
                  <p className="text-3xl font-bold text-white mb-1">
                    ${totalRevenue.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-400">Total Revenue</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs">+18.7%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Panel */}
            {aiInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
                      AI Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Overall Health Score</p>
                        <p className={`text-4xl font-bold ${getHealthColor(aiInsights.performance_summary.health_score).split(' ')[0]}`}>
                          {aiInsights.performance_summary.health_score}
                        </p>
                      </div>
                      <Badge className={getHealthColor(aiInsights.performance_summary.health_score)}>
                        {aiInsights.performance_summary.trend}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 font-semibold mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Key Wins
                        </p>
                        <ul className="space-y-1">
                          {aiInsights.performance_summary.key_wins.map((win, idx) => (
                            <li key={idx} className="text-gray-300 text-sm">• {win}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 font-semibold mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Areas for Improvement
                        </p>
                        <ul className="space-y-1">
                          {aiInsights.performance_summary.concerns.map((concern, idx) => (
                            <li key={idx} className="text-gray-300 text-sm">• {concern}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            )}

            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="bg-[#111317] rounded-xl">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="monetization">Monetization</TabsTrigger>
                <TabsTrigger value="content">Content Analysis</TabsTrigger>
                <TabsTrigger value="export">Export Impact</TabsTrigger>
                <TabsTrigger value="agents">🤖 Agent Efficiency</TabsTrigger>
                <TabsTrigger value="aria">🎤 ARIA Voice Usage</TabsTrigger>
                </TabsList>

              {/* PERFORMANCE TAB */}
              <TabsContent value="performance">
                <div className="space-y-6">

                  {/* Retention Curve */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#00D4C9]" />
                        Audience Retention Curve
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={retentionData}>
                          <defs>
                            <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00D4C9" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#00D4C9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#888"
                            tickFormatter={(val) => `${Math.floor(val/60)}:${String(val%60).padStart(2,'0')}`}
                          />
                          <YAxis stroke="#888" tickFormatter={(val) => `${val}%`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => [`${value}%`, 'Retention']}
                            labelFormatter={(val) => `Time: ${Math.floor(val/60)}:${String(val%60).padStart(2,'0')}`}
                          />
                          <Area type="monotone" dataKey="retention" stroke="#00D4C9" fillOpacity={1} fill="url(#retentionGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          💡 Average retention: <strong>58%</strong> - Above industry average of 45%
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Platform Performance */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#FFD700]" />
                        Platform Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={platformData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="platform" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Legend />
                          <Bar dataKey="views" fill="#FFD700" name="Views" />
                          <Bar dataKey="engagement" fill="#00D4C9" name="Engagement %" />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="grid md:grid-cols-4 gap-3 mt-4">
                        {platformData.map((platform, idx) => (
                          <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">{platform.platform}</p>
                            <p className="text-white font-bold">{platform.views.toLocaleString()}</p>
                            <p className="text-gray-500 text-xs">{platform.engagement}% engagement</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement Metrics */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-6">
                        <ThumbsUp className="w-6 h-6 mb-3 text-[#06D6A0]" />
                        <p className="text-gray-400 text-sm mb-1">Total Likes</p>
                        <p className="text-3xl font-bold text-white">2,847</p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs">+15.3%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-6">
                        <MessageSquare className="w-6 h-6 mb-3 text-[#9D4EDD]" />
                        <p className="text-gray-400 text-sm mb-1">Comments</p>
                        <p className="text-3xl font-bold text-white">1,523</p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs">+22.1%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-6">
                        <Share2 className="w-6 h-6 mb-3 text-[#FF69B4]" />
                        <p className="text-gray-400 text-sm mb-1">Shares</p>
                        <p className="text-3xl font-bold text-white">892</p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs">+31.7%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </TabsContent>

              {/* AUDIENCE TAB */}
              <TabsContent value="audience">
                <div className="space-y-6">

                  {/* Demographics Age */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#9D4EDD]" />
                        Age Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={demographicAge}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="age" stroke="#888" />
                          <YAxis stroke="#888" tickFormatter={(val) => `${val}%`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            formatter={(value) => [`${value}%`, 'Viewers']}
                          />
                          <Bar dataKey="percentage" fill="#9D4EDD" />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 p-3 bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 rounded-lg">
                        <p className="text-[#9D4EDD] text-sm">
                          🎯 <strong>Primary Audience:</strong> 25-34 years old (35%)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Geographic Distribution */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Map className="w-5 h-5 text-[#00D4C9]" />
                        Geographic Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={demographicLocation}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.percentage}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="percentage"
                            >
                              {demographicLocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="space-y-2">
                          {demographicLocation.map((loc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                />
                                <div>
                                  <p className="text-white text-sm font-medium">{loc.country}</p>
                                  <p className="text-gray-500 text-xs">{loc.viewers.toLocaleString()} viewers</p>
                                </div>
                              </div>
                              <Badge className="bg-[#0B0B0C] text-gray-300">
                                {loc.percentage}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audience Insights (AI) */}
                  {aiInsights && (
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#FFD700]" />
                          Audience Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">Primary Demographic</p>
                          <p className="text-white font-semibold">{aiInsights.audience_insights.primary_demographic}</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">Peak Viewing Times</p>
                          <div className="flex flex-wrap gap-2">
                            {aiInsights.audience_insights.peak_viewing_times.map((time, idx) => (
                              <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9]">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">Top Devices</p>
                          <div className="flex flex-wrap gap-2">
                            {aiInsights.audience_insights.top_devices.map((device, idx) => (
                              <Badge key={idx} className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                                {device}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </div>
              </TabsContent>

              {/* MONETIZATION TAB */}
              <TabsContent value="monetization">
                <div className="space-y-6">

                  {/* Revenue Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-4 text-center">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 text-[#06D6A0]" />
                        <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-4 text-center">
                        <Percent className="w-6 h-6 mx-auto mb-2 text-[#FFD700]" />
                        <p className="text-xs text-gray-400 mb-1">Avg CPM</p>
                        <p className="text-2xl font-bold text-white">$4.82</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#9D4EDD]" />
                        <p className="text-xs text-gray-400 mb-1">RPM</p>
                        <p className="text-2xl font-bold text-white">$3.25</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardContent className="p-4 text-center">
                        <Award className="w-6 h-6 mx-auto mb-2 text-[#FF69B4]" />
                        <p className="text-xs text-gray-400 mb-1">Top Earner</p>
                        <p className="text-2xl font-bold text-white">$128</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Earning Videos */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#FFD700]" />
                        Top Earning Videos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {revenueByVideo.map((video, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                                <span className="text-black font-bold text-sm">#{idx + 1}</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{video.title}</p>
                                <p className="text-gray-400 text-xs">{Math.round(video.views).toLocaleString()} views</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[#06D6A0] font-bold">${video.revenue.toFixed(2)}</p>
                              <p className="text-gray-500 text-xs">CPM: ${video.cpm.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Trend */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#06D6A0]" />
                        Revenue Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={[
                          { month: 'Jan', revenue: 245, views: 12400 },
                          { month: 'Feb', revenue: 312, views: 15800 },
                          { month: 'Mar', revenue: 428, views: 21200 },
                          { month: 'Apr', revenue: 385, views: 19500 },
                          { month: 'May', revenue: 502, views: 25600 },
                          { month: 'Jun', revenue: 678, views: 33900 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="month" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#06D6A0" strokeWidth={2} name="Revenue ($)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Monetization Insights (AI) */}
                  {aiInsights && (
                    <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border border-[#06D6A0]/30 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#06D6A0]" />
                          AI Monetization Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#0B0B0C] rounded-xl">
                            <p className="text-gray-400 text-sm mb-2">Revenue Potential</p>
                            <p className="text-4xl font-bold text-[#06D6A0]">
                              {aiInsights.monetization_opportunities.revenue_potential_score}/100
                            </p>
                          </div>
                          <div className="p-4 bg-[#0B0B0C] rounded-xl">
                            <p className="text-gray-400 text-sm mb-2">Sponsorship Fit</p>
                            <p className="text-4xl font-bold text-[#FFD700]">
                              {aiInsights.monetization_opportunities.sponsorship_fit}/100
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">Recommended Strategy</p>
                          <Badge className="bg-[#06D6A0]/20 text-[#06D6A0]">
                            {aiInsights.monetization_opportunities.best_strategy}
                          </Badge>
                        </div>

                        <div className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">Opportunities</p>
                          <ul className="space-y-1">
                            {aiInsights.monetization_opportunities.opportunities.map((opp, idx) => (
                              <li key={idx} className="text-gray-300 text-sm">• {opp}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </div>
              </TabsContent>

              {/* CONTENT ANALYSIS TAB */}
              <TabsContent value="content">
                <div className="space-y-6">

                  {/* Best Moments */}
                  {aiInsights && (
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-[#FFD700]" />
                          Top Performing Moments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aiInsights.content_optimization.best_moments.map((moment, idx) => (
                            <div key={idx} className="p-4 bg-gradient-to-r from-green-500/10 to-[#06D6A0]/10 border border-green-500/30 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-green-400" />
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">
                                      {Math.floor(moment.timestamp_seconds/60)}:{String(moment.timestamp_seconds%60).padStart(2,'0')}
                                    </p>
                                    <p className="text-gray-400 text-xs">{moment.reason}</p>
                                  </div>
                                </div>
                                <Badge className="bg-green-500/20 text-green-400">
                                  +{moment.engagement_spike}% spike
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Weak Sections */}
                  {aiInsights && (
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-[#FF8C00]" />
                          Sections to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aiInsights.content_optimization.weak_sections.map((section, idx) => (
                            <div key={idx} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                              <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <p className="text-white font-medium">
                                  {Math.floor(section.timestamp_seconds/60)}:{String(section.timestamp_seconds%60).padStart(2,'0')}
                                </p>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">
                                <strong className="text-yellow-400">Issue:</strong> {section.issue}
                              </p>
                              <p className="text-gray-300 text-sm">
                                <strong className="text-[#00D4C9]">Fix:</strong> {section.suggestion}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Hook Effectiveness */}
                  {aiInsights && (
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-[#9D4EDD]" />
                          Hook Effectiveness
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6">
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm mb-3">Opening Hook Score</p>
                            <div className="relative pt-1">
                              <div className="flex mb-2 items-center justify-between">
                                <div>
                                  <span className={`text-4xl font-bold ${
                                    aiInsights.content_optimization.hook_score >= 80 ? 'text-green-400' :
                                    aiInsights.content_optimization.hook_score >= 60 ? 'text-yellow-400' :
                                    'text-red-400'
                                  }`}>
                                    {aiInsights.content_optimization.hook_score}
                                  </span>
                                  <span className="text-gray-500">/100</span>
                                </div>
                              </div>
                              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-800">
                                <div 
                                  style={{ width: `${aiInsights.content_optimization.hook_score}%` }}
                                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                    aiInsights.content_optimization.hook_score >= 80 ? 'bg-green-500' :
                                    aiInsights.content_optimization.hook_score >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-[#0B0B0C] rounded-xl">
                            <p className="text-gray-400 text-xs mb-1">First 15s Retention</p>
                            <p className="text-white font-bold text-lg">92%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </div>
              </TabsContent>

              {/* EXPORT IMPACT TAB */}
              <TabsContent value="export">
                <div className="space-y-6">

                  {/* Preset Performance Comparison */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#00D4C9]" />
                        Export Preset Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={exportPresetPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="preset" stroke="#888" angle={-15} textAnchor="end" height={80} />
                          <YAxis stroke="#888" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Bar dataKey="avgViews" fill="#FFD700" name="Avg Views" />
                          <Bar dataKey="avgEngagement" fill="#00D4C9" name="Engagement %" />
                          <Bar dataKey="avgRetention" fill="#9D4EDD" name="Retention %" />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-sm mb-2">
                          <strong>Key Finding:</strong> YouTube HD preset shows highest engagement (+11.5%) and retention (+72%)
                        </p>
                        <p className="text-gray-300 text-xs">
                          Videos exported with YouTube HD settings perform 23% better than other presets on average
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preset Correlation Matrix */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#9D4EDD]" />
                        Platform × Preset Correlation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left p-3 text-gray-400 text-sm">Preset</th>
                              <th className="text-center p-3 text-gray-400 text-sm">YouTube</th>
                              <th className="text-center p-3 text-gray-400 text-sm">Instagram</th>
                              <th className="text-center p-3 text-gray-400 text-sm">TikTok</th>
                              <th className="text-center p-3 text-gray-400 text-sm">Facebook</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { preset: 'YouTube 4K', scores: [95, 65, 42, 58] },
                              { preset: 'YouTube HD', scores: [92, 72, 55, 68] },
                              { preset: 'Instagram Reel', scores: [48, 98, 88, 62] },
                              { preset: 'TikTok', scores: [38, 85, 95, 52] }
                            ].map((row, idx) => (
                              <tr key={idx} className="border-b border-gray-800">
                                <td className="p-3 text-white font-medium">{row.preset}</td>
                                {row.scores.map((score, sIdx) => (
                                  <td key={sIdx} className="text-center p-3">
                                    <Badge className={`${
                                      score >= 80 ? 'bg-green-500/20 text-green-400' :
                                      score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                      score >= 40 ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                      {score}%
                                    </Badge>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-gray-400 text-xs mt-4">
                        Performance scores show how well each export preset performs on each platform
                      </p>
                    </CardContent>
                  </Card>

                  {/* Quality vs Performance */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#FFD700]" />
                        Quality vs Engagement Trade-off
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-[#0B0B0C] rounded-xl">
                          <p className="text-gray-400 text-xs mb-2">Ultra Quality (4K, 60fps)</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">File Size:</span>
                              <span className="text-red-400">Large (2.5GB)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Engagement:</span>
                              <span className="text-green-400">High (9.2%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Upload Speed:</span>
                              <span className="text-red-400">Slow</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-2 border-[#FFD700] rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-[#FFD700]" />
                            <p className="text-[#FFD700] text-xs font-bold">OPTIMAL</p>
                          </div>
                          <p className="text-gray-400 text-xs mb-2">High Quality (1080p, 30fps)</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">File Size:</span>
                              <span className="text-green-400">Medium (850MB)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Engagement:</span>
                              <span className="text-green-400">Highest (11.5%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Upload Speed:</span>
                              <span className="text-green-400">Fast</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-[#0B0B0C] rounded-xl">
                          <p className="text-gray-400 text-xs mb-2">Medium Quality (720p, 30fps)</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">File Size:</span>
                              <span className="text-green-400">Small (420MB)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Engagement:</span>
                              <span className="text-yellow-400">Lower (7.8%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Upload Speed:</span>
                              <span className="text-green-400">Very Fast</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Codec Impact */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#06D6A0]" />
                        Codec Impact on Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { codec: 'H.264', quality: 85, compatibility: 100, fileSize: 'Large', engagement: 10.2 },
                          { codec: 'H.265', quality: 92, compatibility: 75, fileSize: 'Medium', engagement: 10.8 },
                          { codec: 'VP9', quality: 88, compatibility: 85, fileSize: 'Medium', engagement: 9.7 },
                          { codec: 'AV1', quality: 95, compatibility: 60, fileSize: 'Small', engagement: 9.2 }
                        ].map((codec, idx) => (
                          <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-white font-bold">{codec.codec}</h5>
                              <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                                {codec.engagement}% engagement
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <p className="text-gray-500 text-xs">Quality</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                                    <div 
                                      className="bg-[#06D6A0] h-1.5 rounded-full" 
                                      style={{ width: `${codec.quality}%` }}
                                    />
                                  </div>
                                  <span className="text-white text-xs">{codec.quality}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Compatibility</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                                    <div 
                                      className="bg-[#FFD700] h-1.5 rounded-full" 
                                      style={{ width: `${codec.compatibility}%` }}
                                    />
                                  </div>
                                  <span className="text-white text-xs">{codec.compatibility}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">File Size</p>
                                <p className="text-white text-sm mt-1">{codec.fileSize}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>

              {/* AGENT EFFICIENCY TAB */}
              <TabsContent value="agents">
                <div className="space-y-6">
                  {/* Agent Productivity Report */}
                  <AgentProductivityReport user={user} />

                  {/* Task Processing Metrics */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#FFD700]" />
                        Task Processing Efficiency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Total Tasks</p>
                          <p className="text-3xl font-bold text-white">{productionQueues.length}</p>
                        </div>
                        <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Completed</p>
                          <p className="text-3xl font-bold text-green-400">
                            {productionQueues.filter(q => q.status === 'completed').length}
                          </p>
                        </div>
                        <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Processing</p>
                          <p className="text-3xl font-bold text-blue-400">
                            {productionQueues.filter(q => q.status === 'processing').length}
                          </p>
                        </div>
                        <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Failed</p>
                          <p className="text-3xl font-bold text-red-400">
                            {productionQueues.filter(q => q.status === 'failed').length}
                          </p>
                        </div>
                      </div>

                      {/* Task Status Distribution */}
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: productionQueues.filter(q => q.status === 'completed').length },
                              { name: 'Processing', value: productionQueues.filter(q => q.status === 'processing').length },
                              { name: 'Pending', value: productionQueues.filter(q => q.status === 'pending').length },
                              { name: 'Failed', value: productionQueues.filter(q => q.status === 'failed').length }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#06D6A0" />
                            <Cell fill="#00D4C9" />
                            <Cell fill="#FFD700" />
                            <Cell fill="#FF6B6B" />
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Agent Performance Breakdown */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#9D4EDD]" />
                        Agent Performance Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['vp', 'manager', 'engineer'].map((agent) => {
                          const agentTasks = productionQueues.filter(q => q.assigned_to === agent);
                          const completedCount = agentTasks.filter(q => q.status === 'completed').length;
                          const avgTime = agentTasks.length > 0 
                            ? Math.round(agentTasks.reduce((sum, q) => sum + (q.processing_time_seconds || 0), 0) / agentTasks.length)
                            : 0;
                          const successRate = agentTasks.length > 0 
                            ? Math.round((completedCount / agentTasks.length) * 100)
                            : 0;

                          return (
                            <div key={agent} className="p-4 bg-[#0B0B0C] rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                      {agent === 'vp' ? '👑' : agent === 'manager' ? '📊' : '⚙️'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold capitalize">{agent} Agent</p>
                                    <p className="text-gray-400 text-xs">{agentTasks.length} total tasks</p>
                                  </div>
                                </div>
                                <Badge className={`${
                                  successRate >= 80 ? 'bg-green-500/20 text-green-400' :
                                  successRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {successRate}% success
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs">Completed</p>
                                  <p className="text-green-400 font-bold">{completedCount}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs">Avg Time</p>
                                  <p className="text-[#00D4C9] font-bold">{avgTime}s</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs">Efficiency</p>
                                  <p className="text-[#FFD700] font-bold">{Math.round(successRate)}%</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ARIA VOICE USAGE TAB */}
              <TabsContent value="aria">
                <div className="space-y-6">
                  {/* Voice Usage Overview */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border border-[#00D4C9]/30 rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[#00D4C9]" />
                        <p className="text-3xl font-bold text-white mb-1">{activityLogs.length}</p>
                        <p className="text-xs text-gray-400">Total Voice Commands</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-[#9D4EDD]" />
                        <p className="text-3xl font-bold text-white mb-1">
                          {Math.round(activityLogs.reduce((sum, log) => sum + (log.details?.duration_seconds || 0), 0) / 60)}m
                        </p>
                        <p className="text-xs text-gray-400">Total Voice Time</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
                        <p className="text-3xl font-bold text-white mb-1">
                          {activityLogs.length > 0 ? Math.round(activityLogs.length / 30) : 0}
                        </p>
                        <p className="text-xs text-gray-400">Avg Commands/Day</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border border-[#06D6A0]/30 rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#06D6A0]" />
                        <p className="text-3xl font-bold text-white mb-1">
                          {activityLogs.length > 0 
                            ? Math.round((activityLogs.filter(l => l.details?.success).length / activityLogs.length) * 100)
                            : 0
                          }%
                        </p>
                        <p className="text-xs text-gray-400">Success Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Voice Command Timeline */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#00D4C9]" />
                        Voice Usage Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={
                          Array.from({ length: 30 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (29 - i));
                            const dayLogs = activityLogs.filter(log => {
                              const logDate = new Date(log.created_date);
                              return logDate.toDateString() === date.toDateString();
                            });
                            return {
                              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                              commands: dayLogs.length,
                              duration: Math.round(dayLogs.reduce((sum, l) => sum + (l.details?.duration_seconds || 0), 0) / 60)
                            };
                          })
                        }>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                          <Legend />
                          <Line type="monotone" dataKey="commands" stroke="#00D4C9" strokeWidth={2} name="Commands" />
                          <Line type="monotone" dataKey="duration" stroke="#9D4EDD" strokeWidth={2} name="Duration (min)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Voice Command Types */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#FFD700]" />
                        Command Frequency by Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={
                          [
                            { type: 'Create Task', count: Math.round(activityLogs.length * 0.25) },
                            { type: 'Search Research', count: Math.round(activityLogs.length * 0.20) },
                            { type: 'View Analytics', count: Math.round(activityLogs.length * 0.15) },
                            { type: 'Generate Content', count: Math.round(activityLogs.length * 0.18) },
                            { type: 'Check Status', count: Math.round(activityLogs.length * 0.22) }
                          ]
                        }>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="type" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                          <Bar dataKey="count" fill="#FFD700" name="Command Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Recent Voice Commands */}
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#9D4EDD]" />
                        Recent Voice Commands
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {activityLogs.slice(0, 15).map((log, idx) => (
                          <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium capitalize">
                                {log.action_type?.replace(/_/g, ' ')}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {new Date(log.created_date).toLocaleString()}
                              </p>
                            </div>
                            <Badge className={`${
                              log.details?.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {log.details?.success ? '✓ Success' : '✗ Failed'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>

            {/* Action Items (AI) */}
            {aiInsights && (
              <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#FFD700]" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiInsights.action_items.map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-start gap-3">
                          <Badge className={`${
                            item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          } h-fit`}>
                            {item.priority}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-white font-medium mb-2">{item.action}</p>
                            <div className="flex gap-4 text-xs">
                              <span className="text-gray-400">
                                Impact: <span className="text-[#06D6A0]">{item.impact}</span>
                              </span>
                              <span className="text-gray-400">
                                Effort: <span className="text-[#9D4EDD]">{item.effort}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </>
        )}

      </div>
    </div>
  );
}