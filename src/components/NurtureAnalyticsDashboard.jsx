import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Target,
  Clock
} from "lucide-react";

export default function NurtureAnalyticsDashboard({ user }) {
  const { data: sequences = [] } = useQuery({
    queryKey: ["allSequences"],
    queryFn: () => base44.entities.LeadNurtureSequence.list("-created_date", 500),
    initialData: []
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["allResponses"],
    queryFn: () => base44.entities.LeadResponse.list("-created_date", 500),
    initialData: []
  });

  const { data: abTests = [] } = useQuery({
    queryKey: ["abTests"],
    queryFn: () => base44.entities.NurtureSequenceABTest.list("-created_date", 100),
    initialData: []
  });

  // Calculate metrics
  const metrics = {
    totalSequences: sequences.length,
    activeSequences: sequences.filter(s => s.sequence_status === 'active').length,
    completedSequences: sequences.filter(s => s.sequence_status === 'completed').length,
    convertedSequences: sequences.filter(s => s.qualified_during_sequence).length,
    
    totalResponses: responses.length,
    positiveResponses: responses.filter(r => r.sentiment > 0.3).length,
    negativeResponses: responses.filter(r => r.sentiment < -0.3).length,
    
    avgResponseTime: responses.length > 0 
      ? responses.reduce((sum, r) => sum + (r.response_time_hours || 0), 0) / responses.length
      : 0,
    
    avgEngagementScore: sequences.length > 0
      ? sequences.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / sequences.length
      : 0,

    conversionRate: sequences.length > 0
      ? (sequences.filter(s => s.qualified_during_sequence).length / sequences.length) * 100
      : 0,

    responseRate: sequences.length > 0
      ? (sequences.filter(s => s.lead_responded).length / sequences.length) * 100
      : 0,

    activeABTests: abTests.filter(t => t.status === 'running').length
  };

  // Sentiment breakdown
  const sentimentCounts = {
    very_positive: responses.filter(r => r.sentiment_label === 'very_positive').length,
    positive: responses.filter(r => r.sentiment_label === 'positive').length,
    neutral: responses.filter(r => r.sentiment_label === 'neutral').length,
    negative: responses.filter(r => r.sentiment_label === 'negative').length,
    very_negative: responses.filter(r => r.sentiment_label === 'very_negative').length
  };

  // Intent breakdown
  const intentCounts = {
    interested: responses.filter(r => r.intent === 'interested').length,
    ready_to_buy: responses.filter(r => r.intent === 'ready_to_buy').length,
    needs_more_info: responses.filter(r => r.intent === 'needs_more_info').length,
    not_interested: responses.filter(r => r.intent === 'not_interested').length,
    question: responses.filter(r => r.intent === 'question').length
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Nurture Analytics
        </h3>
        <p className="text-gray-400 text-sm">AI-powered sequence optimization insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4">
            <Target className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.conversionRate.toFixed(1)}%</p>
            <p className="text-gray-500 text-xs">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4">
            <MessageSquare className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.responseRate.toFixed(1)}%</p>
            <p className="text-gray-500 text-xs">Response Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4">
            <Clock className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.avgResponseTime.toFixed(1)}h</p>
            <p className="text-gray-500 text-xs">Avg Response Time</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.avgEngagementScore.toFixed(0)}/100</p>
            <p className="text-gray-500 text-xs">Avg Engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Analysis */}
      <Card className="bg-[#111317] border-gray-800 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white text-sm">Response Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(sentimentCounts).map(([sentiment, count]) => {
              const total = responses.length || 1;
              const percentage = (count / total) * 100;
              
              return (
                <div key={sentiment} className="flex items-center gap-3">
                  <div className="w-32">
                    <p className="text-gray-400 text-xs capitalize">{sentiment.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="flex-1 bg-[#0B0B0C] rounded-full h-6 overflow-hidden">
                    <div 
                      className={`h-full flex items-center justify-end px-2 ${
                        sentiment.includes('positive') ? 'bg-green-500/30' :
                        sentiment.includes('negative') ? 'bg-red-500/30' :
                        'bg-gray-500/30'
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-white text-xs font-bold">{count}</span>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-gray-300 text-xs">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Intent Analysis */}
      <Card className="bg-[#111317] border-gray-800 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white text-sm">Lead Intent Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {Object.entries(intentCounts).map(([intent, count]) => (
              <div key={intent} className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                <p className="text-2xl font-bold text-white mb-1">{count}</p>
                <p className="text-gray-400 text-xs capitalize">{intent.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* A/B Test Results */}
      {metrics.activeABTests > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
              🧪 Active A/B Tests
            </h3>
            <p className="text-gray-300 text-sm">
              {metrics.activeABTests} test{metrics.activeABTests > 1 ? 's' : ''} currently running to optimize conversion rates
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 border-blue-500/30 rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-blue-400 font-semibold mb-3">🤖 AI-Powered Optimization</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">Sentiment Analysis</p>
              <p className="text-gray-300 text-xs">
                AI analyzes every response to detect mood, urgency, and buying signals
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">Dynamic Adjustment</p>
              <p className="text-gray-300 text-xs">
                Sequences adapt in real-time based on engagement - accelerate hot leads, pause cold ones
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">A/B Testing</p>
              <p className="text-gray-300 text-xs">
                Automatically test messaging, timing, and channels to maximize conversion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}