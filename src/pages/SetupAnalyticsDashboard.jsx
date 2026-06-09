import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  Monitor,
  Tablet,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function SetupAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: analytics = [] } = useQuery({
    queryKey: ["setupAnalytics", timeRange],
    queryFn: () => base44.entities.SetupAnalytics.list("-created_date", 100),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["setupTemplates"],
    queryFn: () => base44.entities.SetupTemplate.list(),
  });

  // Calculate metrics
  const totalSetups = analytics.length;
  const completedSetups = analytics.filter(a => a.completion_rate === 100).length;
  const abandonedSetups = analytics.filter(a => a.abandoned).length;
  const avgCompletionTime = analytics.reduce((acc, a) => acc + (a.time_to_complete_seconds || 0), 0) / analytics.length / 60;
  const completionRate = totalSetups > 0 ? (completedSetups / totalSetups * 100).toFixed(1) : 0;

  // Template popularity
  const templateStats = templates.map(template => {
    const uses = analytics.filter(a => a.template_selected === template.template_id).length;
    const completed = analytics.filter(a => a.template_selected === template.template_id && a.completion_rate === 100).length;
    
    return {
      name: template.template_name,
      uses: uses,
      completed: completed,
      completion_rate: uses > 0 ? (completed / uses * 100).toFixed(1) : 0
    };
  }).sort((a, b) => b.uses - a.uses);

  // Device breakdown
  const deviceStats = [
    { name: "Desktop", value: analytics.filter(a => a.device_type === "desktop").length, color: "#FFD700" },
    { name: "Mobile", value: analytics.filter(a => a.device_type === "mobile").length, color: "#00D4C9" },
    { name: "Tablet", value: analytics.filter(a => a.device_type === "tablet").length, color: "#FF6B9D" }
  ];

  // Abandonment points
  const abandonmentByStep = [1, 2, 3, 4].map(step => ({
    step: `Step ${step}`,
    abandoned: analytics.filter(a => a.abandoned_at_step === step).length
  }));

  // Integration success rate
  const integrationStats = ['gohighlevel', 'meta_ads', 'mailchimp', 'stripe'].map(int => {
    const attempted = analytics.filter(a => 
      a.integrations_connected?.includes(int) || a.integrations_failed?.includes(int)
    ).length;
    const successful = analytics.filter(a => a.integrations_connected?.includes(int)).length;
    
    return {
      name: int.replace(/_/g, ' ').toUpperCase(),
      success_rate: attempted > 0 ? (successful / attempted * 100).toFixed(1) : 0,
      attempts: attempted
    };
  });

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Setup Analytics</h1>
          <p className="text-gray-400">Monitor wizard performance and optimization opportunities</p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Setups", value: totalSetups, icon: Users, color: "from-[#FFD700] to-[#FFA500]" },
            { label: "Completion Rate", value: `${completionRate}%`, icon: CheckCircle2, color: "from-[#00FF88] to-[#00CC6A]" },
            { label: "Avg Time", value: `${avgCompletionTime.toFixed(1)}m`, icon: Clock, color: "from-[#00D4C9] to-[#00A8A0]" },
            { label: "Abandoned", value: abandonedSetups, icon: XCircle, color: "from-[#FF4433] to-[#CC0000]" }
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} bg-opacity-10`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
                    <p className="text-4xl font-bold text-white heading-font">{kpi.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Template Performance */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Template Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={templateStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ background: '#151515', border: '1px solid #333' }}
                  labelStyle={{ color: '#EDEDED' }}
                />
                <Legend />
                <Bar dataKey="uses" fill="#FFD700" name="Total Uses" />
                <Bar dataKey="completed" fill="#00FF88" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Device Breakdown */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Abandonment Analysis */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Abandonment Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={abandonmentByStep}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="step" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ background: '#151515', border: '1px solid #333' }}
                    labelStyle={{ color: '#EDEDED' }}
                  />
                  <Line type="monotone" dataKey="abandoned" stroke="#FF4433" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Integration Success Rates */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Integration Success Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {integrationStats.map((stat, idx) => (
                <motion.div
                  key={stat.name}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-[#FFD700]" />
                    <Badge className={`${
                      stat.success_rate > 80 ? 'bg-green-500/20 text-green-400' :
                      stat.success_rate > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {stat.success_rate}%
                    </Badge>
                  </div>
                  <p className="text-white font-semibold text-sm">{stat.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.attempts} attempts</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}