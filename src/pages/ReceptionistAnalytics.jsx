import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Phone,
  MessageSquare,
  Target,
  Zap,
  Brain,
  FileText
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import AutoReportGenerator from "@/components/AutoReportGenerator";
import ConversionPredictor from "@/components/ConversionPredictor";
import InteractiveMetricsCharts from "@/components/InteractiveMetricsCharts";
import { showToast } from "@/components/ToastNotification";

export default function ReceptionistAnalytics() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Get date range
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case "24h":
        start.setHours(start.getHours() - 24);
        break;
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setDate(start.getDate() - 90);
        break;
    }
    
    return { start, end };
  };

  // Load data
  const { data: calls = [] } = useQuery({
    queryKey: ["analytics_calls", user?.email, dateRange],
    queryFn: async () => {
      const range = getDateRange();
      const allCalls = await base44.entities.CallSession.filter({
        created_by: user.email
      }, '-created_date', 500);
      
      return allCalls.filter(c => {
        const callDate = new Date(c.created_date);
        return callDate >= range.start && callDate <= range.end;
      });
    },
    enabled: !!user,
    initialData: []
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["analytics_leads", user?.email, dateRange],
    queryFn: async () => {
      const range = getDateRange();
      const allLeads = await base44.entities.Lead.filter({
        created_by: user.email
      }, '-created_date', 500);
      
      return allLeads.filter(l => {
        const leadDate = new Date(l.created_date);
        return leadDate >= range.start && leadDate <= range.end;
      });
    },
    enabled: !!user,
    initialData: []
  });

  const { data: sequences = [] } = useQuery({
    queryKey: ["analytics_sequences", user?.email, dateRange],
    queryFn: () => base44.entities.LeadNurtureSequence.list('-created_date', 500),
    enabled: !!user,
    initialData: []
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["analytics_responses", user?.email, dateRange],
    queryFn: () => base44.entities.LeadResponse.list('-created_date', 500),
    enabled: !!user,
    initialData: []
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ["lead_predictions", user?.email],
    queryFn: () => base44.entities.LeadConversionPrediction.list('-prediction_date', 100),
    enabled: !!user,
    initialData: []
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["ai_reports", user?.email],
    queryFn: () => base44.entities.AIAnalyticsReport.filter({
      user_email: user.email
    }, '-generated_at', 20),
    enabled: !!user,
    initialData: []
  });

  // Calculate metrics
  const metrics = {
    totalCalls: calls.length,
    completedCalls: calls.filter(c => c.status === 'completed').length,
    avgDuration: calls.length > 0 
      ? calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / calls.length
      : 0,
    qualifiedCalls: calls.filter(c => c.disposition === 'qualified' || c.disposition === 'booked').length,
    
    totalLeads: leads.length,
    qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
    convertedLeads: leads.filter(l => l.converted).length,
    avgLeadScore: leads.length > 0
      ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length
      : 0,
    
    activeSequences: sequences.filter(s => s.sequence_status === 'active').length,
    completedSequences: sequences.filter(s => s.sequence_status === 'completed').length,
    convertedSequences: sequences.filter(s => s.qualified_during_sequence).length,
    avgEngagement: sequences.length > 0
      ? sequences.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / sequences.length
      : 0,
    
    totalResponses: responses.length,
    positiveResponses: responses.filter(r => r.sentiment > 0.3).length,
    highIntentResponses: responses.filter(r => r.intent === 'ready_to_buy' || r.intent === 'interested').length,
    
    highProbabilityLeads: predictions.filter(p => p.probability_category === 'very_high' || p.probability_category === 'high').length
  };

  const conversionRate = metrics.totalLeads > 0 
    ? (metrics.convertedLeads / metrics.totalLeads) * 100 
    : 0;

  const qualificationRate = metrics.totalLeads > 0
    ? (metrics.qualifiedLeads / metrics.totalLeads) * 100
    : 0;

  const responseRate = sequences.filter(s => s.total_touchpoints > 0).length > 0
    ? (sequences.filter(s => s.lead_responded).length / sequences.filter(s => s.total_touchpoints > 0).length) * 100
    : 0;

  if (!user) return <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin"></div></div>;

  return (
    <PermissionGate
      user={user}
      minimumRole="admin"
      showLockMessage={true}
      lockMessage="Only administrators can access analytics"
    >
      <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-[#FFD700]" />
                AI-Powered Analytics
              </h1>
              <p className="text-gray-400">
                Automated insights, predictions, and recommendations
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex gap-2 bg-[#111317] rounded-xl p-1">
                {['24h', '7d', '30d', '90d'].map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      dateRange === range
                        ? 'bg-[#FFD700] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {metrics.completedCalls} calls
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {qualificationRate.toFixed(1)}%
                </p>
                <p className="text-gray-500 text-sm">Qualification Rate</p>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  {qualificationRate > 50 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Above average</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">Below average</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {metrics.activeSequences} active
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {responseRate.toFixed(1)}%
                </p>
                <p className="text-gray-500 text-sm">Response Rate</p>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="text-gray-400">
                    Avg engagement: {metrics.avgEngagement.toFixed(0)}/100
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <Badge className="bg-green-500/20 text-green-400">
                    {metrics.convertedLeads} won
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {conversionRate.toFixed(1)}%
                </p>
                <p className="text-gray-500 text-sm">Conversion Rate</p>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="text-gray-400">
                    {metrics.qualifiedLeads} qualified
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-5 h-5 text-yellow-400" />
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    AI Powered
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {metrics.highProbabilityLeads}
                </p>
                <p className="text-gray-500 text-sm">High-Prob Leads</p>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <span className="text-yellow-400">
                    Ready to close
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="reports">
            <TabsList className="bg-[#111317] rounded-xl">
              <TabsTrigger value="reports">
                <FileText className="w-4 h-4 mr-2" />
                Auto Reports ({reports.length})
              </TabsTrigger>
              <TabsTrigger value="predictions">
                <Brain className="w-4 h-4 mr-2" />
                Predictions
              </TabsTrigger>
              <TabsTrigger value="charts">
                <BarChart3 className="w-4 h-4 mr-2" />
                Visualizations
              </TabsTrigger>
            </TabsList>

            {/* Auto Reports Tab */}
            <TabsContent value="reports">
              {user && (
                <AutoReportGenerator 
                  user={user}
                  calls={calls}
                  leads={leads}
                  sequences={sequences}
                  responses={responses}
                  dateRange={dateRange}
                />
              )}
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions">
              {user && (
                <ConversionPredictor 
                  user={user}
                  leads={leads}
                  calls={calls}
                  sequences={sequences}
                  responses={responses}
                />
              )}
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts">
              {user && (
                <InteractiveMetricsCharts 
                  calls={calls}
                  leads={leads}
                  sequences={sequences}
                  responses={responses}
                  dateRange={dateRange}
                />
              )}
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </PermissionGate>
  );
}