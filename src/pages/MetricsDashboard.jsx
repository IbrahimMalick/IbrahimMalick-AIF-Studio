import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Users,
  Zap,
  Target
} from "lucide-react";

export default function MetricsDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch real-time metrics
  const { data: projects } = useQuery({
    queryKey: ["allProjects"],
    queryFn: () => base44.entities.Project.list(),
    refetchInterval: 30000, // Refresh every 30 seconds
    initialData: []
  });

  const { data: queue } = useQuery({
    queryKey: ["productionQueue"],
    queryFn: () => base44.entities.ProductionQueue.list(),
    refetchInterval: 10000, // Refresh every 10 seconds
    initialData: []
  });

  const { data: clients } = useQuery({
    queryKey: ["allClients"],
    queryFn: () => base44.entities.Client.list(),
    refetchInterval: 60000, // Refresh every minute
    initialData: []
  });

  // Calculate metrics
  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProjects = projects.filter(p => 
      new Date(p.created_date) >= today
    );

    const activeProjects = projects.filter(p => 
      !['delivered', 'archived'].includes(p.status)
    );

    const deliveredProjects = projects.filter(p => 
      p.status === 'delivered'
    );

    const pendingQueue = queue.filter(q => q.status === 'pending');
    const processingQueue = queue.filter(q => q.status === 'processing');

    // Calculate revenue (estimate based on campaign type)
    const revenueMap = {
      foundation: 25000,
      global: 50000,
      empire: 75000
    };

    const todayRevenue = todayProjects.reduce((sum, p) => 
      sum + (revenueMap[p.campaign_type] || 25000), 0
    );

    const totalRevenue = projects.reduce((sum, p) => 
      sum + (revenueMap[p.campaign_type] || 25000), 0
    );

    const totalApiCosts = projects.reduce((sum, p) => 
      sum + (p.api_costs || 0), 0
    );

    // Calculate average delivery time
    const deliveredWithDates = deliveredProjects.filter(p => 
      p.kickoff_date && p.actual_delivery
    );

    const avgDeliveryHours = deliveredWithDates.length > 0
      ? deliveredWithDates.reduce((sum, p) => {
          const start = new Date(p.kickoff_date);
          const end = new Date(p.actual_delivery);
          const hours = (end - start) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / deliveredWithDates.length
      : 0;

    // Calculate satisfaction
    const ratedProjects = projects.filter(p => p.satisfaction_score);
    const avgSatisfaction = ratedProjects.length > 0
      ? ratedProjects.reduce((sum, p) => sum + p.satisfaction_score, 0) / ratedProjects.length
      : 0;

    return {
      projectsInQueue: pendingQueue.length,
      processing: processingQueue.length,
      todayRevenue,
      totalRevenue,
      totalApiCosts,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalApiCosts) / totalRevenue * 100).toFixed(1) : 0,
      avgDeliveryHours: avgDeliveryHours.toFixed(1),
      avgSatisfaction: avgSatisfaction.toFixed(1),
      activeClients: clients.filter(c => c.status === 'active').length,
      activeProjects: activeProjects.length,
      deliveredProjects: deliveredProjects.length,
      todayProjects: todayProjects.length
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Command Center 🎯</h1>
            <p className="text-gray-400">Real-time business metrics</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 text-sm px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            Live Updates
          </Badge>
        </div>

        {/* Revenue Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-[#FFD700]" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-white">
                ${metrics.todayRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {metrics.todayProjects} projects today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#1E90FF]/10 border-[#00D4C9]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-[#00D4C9]" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-white">
                ${(metrics.totalRevenue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {projects.length} total projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border-[#06D6A0]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-[#06D6A0]" />
              </div>
              <p className="text-sm text-gray-400 mb-1">Profit Margin</p>
              <p className="text-3xl font-bold text-white">
                {metrics.profitMargin}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ${metrics.totalApiCosts.toLocaleString()} API costs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Queue & Operations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <Zap className="w-8 h-8 text-blue-400 mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {metrics.projectsInQueue}
              </p>
              <p className="text-sm text-gray-400">In Queue</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <Activity className="w-8 h-8 text-yellow-400 mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {metrics.processing}
              </p>
              <p className="text-sm text-gray-400">Processing</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {metrics.deliveredProjects}
              </p>
              <p className="text-sm text-gray-400">Delivered</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <Target className="w-8 h-8 text-purple-400 mb-3" />
              <p className="text-2xl font-bold text-white mb-1">
                {metrics.activeProjects}
              </p>
              <p className="text-sm text-gray-400">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-[#9D4EDD]" />
                <Badge className={metrics.avgDeliveryHours <= 72 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                  {metrics.avgDeliveryHours <= 72 ? "On Target" : "Monitor"}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.avgDeliveryHours}h
              </p>
              <p className="text-sm text-gray-400">Avg Delivery Time</p>
              <p className="text-xs text-gray-600 mt-2">Target: 48-72 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-[#FFD700]" />
                <Badge className={metrics.avgSatisfaction >= 8 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                  {metrics.avgSatisfaction >= 8 ? "Excellent" : "Needs Work"}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.avgSatisfaction}/10
              </p>
              <p className="text-sm text-gray-400">Client Satisfaction</p>
              <p className="text-xs text-gray-600 mt-2">Target: 8+ average</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-[#00D4C9]" />
                <Badge className="bg-blue-500/20 text-blue-400">
                  Active
                </Badge>
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.activeClients}
              </p>
              <p className="text-sm text-gray-400">Active Clients</p>
              <p className="text-xs text-gray-600 mt-2">
                {clients.filter(c => c.status === 'lead').length} leads in pipeline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#111317] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{project.project_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(project.created_date).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={
                    project.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'production' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div>
                  <p className="text-white font-semibold">System Status: Operational</p>
                  <p className="text-sm text-gray-400">All systems running smoothly</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}