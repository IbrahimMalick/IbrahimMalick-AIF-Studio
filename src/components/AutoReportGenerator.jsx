import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Download,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function AutoReportGenerator({ user, calls, leads, sequences, responses, dateRange }) {
  const [selectedReportType, setSelectedReportType] = useState("weekly_summary");
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ["aiAnalyticsReports", user?.email],
    queryFn: () => base44.entities.AIAnalyticsReport.filter({
      user_email: user.email
    }, '-generated_at', 20),
    enabled: !!user,
    initialData: []
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportType) => {
      const range = getDateRange();
      
      // Generate AI-powered report
      const reportData = await generateAIReport(reportType, {
        calls,
        leads,
        sequences,
        responses,
        range
      });

      // Save report
      return await base44.entities.AIAnalyticsReport.create({
        ...reportData,
        user_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["aiAnalyticsReports"]);
      showToast("AI report generated! 📊", "success");
    }
  });

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

  const generateAIReport = async (reportType, data) => {
    const { calls, leads, sequences, responses, range } = data;

    // Calculate metrics
    const callMetrics = analyzeCallMetrics(calls);
    const nurtureMetrics = analyzeNurtureMetrics(sequences, responses);
    const leadMetrics = analyzeLeadMetrics(leads);

    // Generate AI insights
    const aiInsights = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this receptionist & lead nurture performance data and generate executive insights:

PERIOD: ${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}

CALLS:
- Total: ${calls.length}
- Completed: ${calls.filter(c => c.status === 'completed').length}
- Qualified: ${calls.filter(c => c.disposition === 'qualified').length}
- Booked: ${calls.filter(c => c.disposition === 'booked').length}
- Avg Duration: ${callMetrics.avgDuration}s

LEADS:
- Total: ${leads.length}
- Qualified: ${leads.filter(l => l.status === 'qualified').length}
- Converted: ${leads.filter(l => l.converted).length}
- Avg Score: ${leadMetrics.avgScore.toFixed(1)}

NURTURE SEQUENCES:
- Active: ${sequences.filter(s => s.sequence_status === 'active').length}
- Conversion Rate: ${nurtureMetrics.conversionRate.toFixed(1)}%
- Avg Engagement: ${nurtureMetrics.avgEngagement.toFixed(0)}/100
- Response Rate: ${nurtureMetrics.responseRate.toFixed(1)}%

Generate:
1. Executive summary (2-3 sentences)
2. Top 3 key insights (opportunities, warnings, or achievements)
3. Top 3 recommendations with expected impact
4. Trend analysis
5. Predictions for next period`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight_type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                impact_level: { type: "string" },
                recommended_action: { type: "string" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "number" },
                category: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                expected_impact: { type: "string" },
                effort_required: { type: "string" },
                action_steps: { type: "array", items: { type: "string" } }
              }
            }
          },
          trend_analysis: {
            type: "object",
            properties: {
              lead_volume_trend: { type: "string" },
              quality_trend: { type: "string" },
              conversion_trend: { type: "string" }
            }
          },
          predictions: {
            type: "object",
            properties: {
              next_7_days_leads: { type: "number" },
              next_30_days_conversions: { type: "number" },
              predicted_roi: { type: "number" }
            }
          }
        }
      }
    });

    return {
      report_type: reportType,
      report_title: `${reportType.replace(/_/g, ' ')} - ${new Date().toLocaleDateString()}`,
      report_period: {
        start_date: range.start.toISOString(),
        end_date: range.end.toISOString(),
        days_covered: Math.ceil((range.end - range.start) / (1000 * 60 * 60 * 24))
      },
      executive_summary: aiInsights.executive_summary,
      key_insights: aiInsights.key_insights,
      call_analytics: callMetrics,
      nurture_analytics: nurtureMetrics,
      roi_analysis: calculateROI(leads, calls),
      trend_analysis: aiInsights.trend_analysis,
      predictions: aiInsights.predictions,
      recommendations: aiInsights.recommendations,
      generated_at: new Date().toISOString(),
      auto_generated: false,
      schedule: reportType.includes('daily') ? 'daily' : reportType.includes('weekly') ? 'weekly' : 'monthly'
    };
  };

  const analyzeCallMetrics = (calls) => {
    const completedCalls = calls.filter(c => c.status === 'completed');
    
    const dispositionBreakdown = {
      qualified: calls.filter(c => c.disposition === 'qualified').length,
      booked: calls.filter(c => c.disposition === 'booked').length,
      callback_requested: calls.filter(c => c.disposition === 'callback_requested').length,
      not_interested: calls.filter(c => c.disposition === 'not_interested').length,
      spam: calls.filter(c => c.disposition === 'spam').length
    };

    const intentBreakdown = {};
    calls.forEach(c => {
      if (c.intent) {
        intentBreakdown[c.intent] = (intentBreakdown[c.intent] || 0) + 1;
      }
    });

    const sentimentAnalysis = {
      positive_calls: calls.filter(c => c.sentiment > 0.3).length,
      neutral_calls: calls.filter(c => c.sentiment >= -0.3 && c.sentiment <= 0.3).length,
      negative_calls: calls.filter(c => c.sentiment < -0.3).length,
      avg_sentiment: calls.length > 0
        ? calls.reduce((sum, c) => sum + (c.sentiment || 0), 0) / calls.length
        : 0
    };

    return {
      total_calls: calls.length,
      inbound_calls: calls.filter(c => c.direction === 'inbound').length,
      outbound_calls: calls.filter(c => c.direction === 'outbound').length,
      avg_duration_seconds: completedCalls.length > 0
        ? completedCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / completedCalls.length
        : 0,
      disposition_breakdown: dispositionBreakdown,
      intent_breakdown: intentBreakdown,
      sentiment_analysis: sentimentAnalysis,
      conversion_metrics: {
        calls_to_appointments: calls.filter(c => c.disposition === 'booked').length,
        conversion_rate: calls.length > 0
          ? (calls.filter(c => c.disposition === 'booked' || c.disposition === 'qualified').length / calls.length) * 100
          : 0
      }
    };
  };

  const analyzeNurtureMetrics = (sequences, responses) => {
    const activeSeqs = sequences.filter(s => s.sequence_status === 'active');
    const completedSeqs = sequences.filter(s => s.sequence_status === 'completed');
    const convertedSeqs = sequences.filter(s => s.qualified_during_sequence);

    const channelPerformance = {
      sms: {
        sent: 0,
        delivered: 0,
        response_rate: 0
      },
      email: {
        sent: 0,
        open_rate: 0,
        click_rate: 0,
        response_rate: 0
      }
    };

    // Calculate channel stats
    sequences.forEach(seq => {
      seq.touchpoints_completed?.forEach(tp => {
        if (tp.channel === 'sms') {
          channelPerformance.sms.sent++;
          if (tp.delivered) channelPerformance.sms.delivered++;
        } else if (tp.channel === 'email') {
          channelPerformance.email.sent++;
        }
      });
    });

    const respondedSeqs = sequences.filter(s => s.lead_responded);
    const responseRate = sequences.filter(s => s.total_touchpoints > 0).length > 0
      ? (respondedSeqs.length / sequences.filter(s => s.total_touchpoints > 0).length) * 100
      : 0;

    return {
      active_sequences: activeSeqs.length,
      completed_sequences: completedSeqs.length,
      conversion_rate: sequences.length > 0
        ? (convertedSeqs.length / sequences.length) * 100
        : 0,
      avg_engagement_score: sequences.length > 0
        ? sequences.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / sequences.length
        : 0,
      avg_response_time_hours: responses.length > 0
        ? responses.reduce((sum, r) => sum + (r.response_time_hours || 0), 0) / responses.length
        : 0,
      channel_performance: channelPerformance,
      top_performing_sequences: sequences
        .filter(s => s.qualified_during_sequence)
        .slice(0, 5)
        .map(s => ({
          sequence_id: s.id,
          engagement_score: s.engagement_score,
          conversion_time: s.total_duration_days
        }))
    };
  };

  const analyzeLeadMetrics = (leads) => {
    return {
      avgScore: leads.length > 0
        ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length
        : 0,
      scoreDistribution: {
        high: leads.filter(l => l.score >= 70).length,
        medium: leads.filter(l => l.score >= 40 && l.score < 70).length,
        low: leads.filter(l => l.score < 40).length
      }
    };
  };

  const calculateROI = (leads, calls) => {
    const convertedLeads = leads.filter(l => l.converted);
    const totalRevenue = convertedLeads.reduce((sum, l) => sum + (l.conversion_value || 0), 0);
    const totalCost = calls.reduce((sum, c) => sum + (c.cost_usd || 0), 0);
    
    return {
      total_investment: totalCost,
      total_revenue: totalRevenue,
      roi_percentage: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0,
      cost_per_lead: leads.length > 0 ? totalCost / leads.length : 0,
      cost_per_qualified_lead: leads.filter(l => l.status === 'qualified').length > 0
        ? totalCost / leads.filter(l => l.status === 'qualified').length
        : 0,
      cost_per_conversion: convertedLeads.length > 0
        ? totalCost / convertedLeads.length
        : 0
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Report Generator */}
      <Card className="bg-[#111317] border-gray-800 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              Generate AI Report
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex gap-4">
            <Select
              value={selectedReportType}
              onValueChange={setSelectedReportType}
            >
              <SelectTrigger className="flex-1 bg-[#0B0B0C] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily_digest">Daily Digest</SelectItem>
                <SelectItem value="weekly_summary">Weekly Summary</SelectItem>
                <SelectItem value="monthly_review">Monthly Review</SelectItem>
                <SelectItem value="call_outcomes">Call Outcomes Deep Dive</SelectItem>
                <SelectItem value="nurture_performance">Nurture Performance Report</SelectItem>
                <SelectItem value="ab_test_results">A/B Test Results</SelectItem>
                <SelectItem value="roi_analysis">ROI Analysis</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => generateReportMutation.mutate(selectedReportType)}
              disabled={generateReportMutation.isLoading}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
            >
              {generateReportMutation.isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>

          <p className="text-gray-400 text-sm">
            AI will analyze your data and generate a comprehensive report with insights and recommendations
          </p>

        </CardContent>
      </Card>

      {/* Recent Reports */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg">Recent Reports</h3>
        
        {reports.length === 0 ? (
          <Card className="bg-[#111317] border-gray-800 rounded-xl">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 mb-2">No reports generated yet</p>
              <p className="text-gray-500 text-sm">
                Generate your first AI-powered analytics report
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="bg-[#111317] border-gray-800 rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    {report.report_title}
                  </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {report.report_period?.days_covered || 0} days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Executive Summary */}
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1 font-semibold">📊 EXECUTIVE SUMMARY</p>
                  <p className="text-gray-300 text-sm">{report.executive_summary}</p>
                </div>

                {/* Key Insights */}
                {report.key_insights && report.key_insights.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-xs font-semibold">🎯 KEY INSIGHTS</p>
                    {report.key_insights.slice(0, 3).map((insight, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                        insight.insight_type === 'opportunity' ? 'bg-green-500/10 border-green-500' :
                        insight.insight_type === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                        insight.insight_type === 'achievement' ? 'bg-blue-500/10 border-blue-500' :
                        'bg-purple-500/10 border-purple-500'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {insight.insight_type === 'opportunity' && <TrendingUp className="w-4 h-4 text-green-400" />}
                          {insight.insight_type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                          {insight.insight_type === 'achievement' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                          {insight.insight_type === 'trend' && <Zap className="w-4 h-4 text-purple-400" />}
                          <p className="text-white font-semibold text-sm">{insight.title}</p>
                        </div>
                        <p className="text-gray-300 text-xs mb-2">{insight.description}</p>
                        {insight.recommended_action && (
                          <p className="text-gray-400 text-xs">
                            💡 <strong>Action:</strong> {insight.recommended_action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {report.call_analytics && (
                    <div className="p-2 bg-[#0B0B0C] rounded text-center">
                      <p className="text-gray-500 text-xs">Calls</p>
                      <p className="text-white font-bold">{report.call_analytics.total_calls}</p>
                    </div>
                  )}
                  {report.nurture_analytics && (
                    <div className="p-2 bg-[#0B0B0C] rounded text-center">
                      <p className="text-gray-500 text-xs">Conv. Rate</p>
                      <p className="text-green-400 font-bold">
                        {report.nurture_analytics.conversion_rate?.toFixed(1)}%
                      </p>
                    </div>
                  )}
                  {report.roi_analysis && (
                    <div className="p-2 bg-[#0B0B0C] rounded text-center">
                      <p className="text-gray-500 text-xs">ROI</p>
                      <p className="text-yellow-400 font-bold">
                        {report.roi_analysis.roi_percentage?.toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Open detailed view (modal or new page)
                      alert('Detailed report view coming soon!');
                    }}
                    className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                  >
                    View Details
                  </Button>
                  {report.pdf_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(report.pdf_url, '_blank')}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-blue-400 font-semibold mb-3">🤖 AI-Powered Reporting</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">Automated Analysis</p>
              <p className="text-gray-300 text-xs">
                AI analyzes 100s of data points to find patterns humans miss
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">Actionable Insights</p>
              <p className="text-gray-300 text-xs">
                Every report includes specific next steps to improve performance
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">Trend Predictions</p>
              <p className="text-gray-300 text-xs">
                Forecast future performance and identify issues before they happen
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}