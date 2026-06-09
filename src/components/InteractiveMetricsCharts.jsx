import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  Phone,
  MessageSquare,
  Users,
  Target
} from "lucide-react";

export default function InteractiveMetricsCharts({ calls, leads, sequences, responses, dateRange }) {
  
  // Prepare chart data
  const prepareTimeSeriesData = () => {
    const data = [];
    const days = dateRange === '24h' ? 24 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = dateRange === '24h' 
        ? `${date.getHours()}:00`
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayCalls = calls.filter(c => {
        const callDate = new Date(c.created_date);
        if (dateRange === '24h') {
          return callDate.getHours() === date.getHours() && 
                 callDate.toDateString() === date.toDateString();
        }
        return callDate.toDateString() === date.toDateString();
      });

      const dayLeads = leads.filter(l => {
        const leadDate = new Date(l.created_date);
        if (dateRange === '24h') {
          return leadDate.getHours() === date.getHours() && 
                 leadDate.toDateString() === date.toDateString();
        }
        return leadDate.toDateString() === date.toDateString();
      });

      data.push({
        date: dayStr,
        calls: dayCalls.length,
        leads: dayLeads.length,
        qualified: dayLeads.filter(l => l.status === 'qualified').length,
        converted: dayLeads.filter(l => l.converted).length
      });
    }

    return data;
  };

  const prepareDispositionData = () => {
    const dispositions = {};
    calls.forEach(c => {
      if (c.disposition) {
        dispositions[c.disposition] = (dispositions[c.disposition] || 0) + 1;
      }
    });

    return Object.entries(dispositions).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value
    }));
  };

  const prepareIntentData = () => {
    const intents = {};
    calls.forEach(c => {
      if (c.intent) {
        intents[c.intent] = (intents[c.intent] || 0) + 1;
      }
    });

    return Object.entries(intents).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  };

  const prepareSentimentTrendData = () => {
    const data = [];
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayCalls = calls.filter(c => {
        const callDate = new Date(c.created_date);
        return callDate.toDateString() === date.toDateString();
      });

      const avgSentiment = dayCalls.length > 0
        ? dayCalls.reduce((sum, c) => sum + (c.sentiment || 0), 0) / dayCalls.length
        : 0;

      data.push({
        date: dayStr,
        sentiment: avgSentiment * 100, // Convert to -100 to +100 scale
        positive: dayCalls.filter(c => c.sentiment > 0.3).length,
        negative: dayCalls.filter(c => c.sentiment < -0.3).length
      });
    }

    return data;
  };

  const prepareEngagementData = () => {
    return sequences
      .filter(s => s.engagement_score > 0)
      .slice(0, 20)
      .map((s, idx) => {
        const lead = leads.find(l => l.id === s.lead_id);
        return {
          name: `Lead ${idx + 1}`,
          engagement: s.engagement_score,
          responded: s.lead_responded ? s.engagement_score : 0
        };
      });
  };

  const timeSeriesData = prepareTimeSeriesData();
  const dispositionData = prepareDispositionData();
  const intentData = prepareIntentData();
  const sentimentTrendData = prepareSentimentTrendData();
  const engagementData = prepareEngagementData();

  const COLORS = ['#FFD700', '#00D4C9', '#9D4EDD', '#FF8C00', '#06D6A0', '#FF4433', '#1E90FF', '#FF69B4'];

  return (
    <div className="space-y-6">
      
      {/* Calls & Leads Over Time */}
      <Card className="bg-[#111317] border-gray-800 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Activity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4C9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D4C9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06D6A0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111317', 
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#FFF' }}
              />
              <Legend />
              <Area type="monotone" dataKey="calls" stroke="#FFD700" fillOpacity={1} fill="url(#colorCalls)" />
              <Area type="monotone" dataKey="leads" stroke="#00D4C9" fillOpacity={1} fill="url(#colorLeads)" />
              <Area type="monotone" dataKey="converted" stroke="#06D6A0" fillOpacity={1} fill="url(#colorConverted)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Call Disposition Breakdown */}
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              Call Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dispositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dispositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111317', 
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#FFF'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Intent Distribution */}
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Caller Intent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={intentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888" 
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111317', 
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#FFF'
                  }}
                />
                <Bar dataKey="value" fill="#9D4EDD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Sentiment Trend */}
      <Card className="bg-[#111317] border-gray-800 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-yellow-400" />
            Sentiment Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111317', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#FFF'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="sentiment" stroke="#FFD700" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="positive" stroke="#06D6A0" strokeWidth={2} />
              <Line type="monotone" dataKey="negative" stroke="#FF4433" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Nurture Engagement */}
      {engagementData.length > 0 && (
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              Nurture Engagement Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" style={{ fontSize: '12px' }} />
                <YAxis stroke="#888" style={{ fontSize: '12px' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111317', 
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#FFF'
                  }}
                />
                <Legend />
                <Bar dataKey="engagement" fill="#00D4C9" radius={[8, 8, 0, 0]} />
                <Bar dataKey="responded" fill="#06D6A0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

    </div>
  );
}