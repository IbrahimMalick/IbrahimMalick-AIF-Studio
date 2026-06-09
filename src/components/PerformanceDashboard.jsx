import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

const mockData = [
  { time: '00:00', latency: 120, errorRate: 0.2, cacheHit: 65 },
  { time: '04:00', latency: 115, errorRate: 0.1, cacheHit: 68 },
  { time: '08:00', latency: 145, errorRate: 0.3, cacheHit: 62 },
  { time: '12:00', latency: 160, errorRate: 0.5, cacheHit: 55 },
  { time: '16:00', latency: 155, errorRate: 0.4, cacheHit: 58 },
  { time: '20:00', latency: 130, errorRate: 0.2, cacheHit: 70 }
];

export default function PerformanceDashboard() {
  const metrics = [
    { label: 'Avg API Latency', value: '127ms', trend: 'up', change: '+8%', color: 'text-yellow-400' },
    { label: 'Cache Hit Rate', value: '68%', trend: 'down', change: '-5%', color: 'text-blue-400' },
    { label: 'Error Rate', value: '0.3%', trend: 'stable', change: '→', color: 'text-green-400' },
    { label: 'Throughput', value: '2.1k/sec', trend: 'up', change: '+12%', color: 'text-purple-400' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="bg-[#0B0B0C] border-gray-800">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-2">{metric.label}</p>
              <p className={`text-2xl font-bold ${metric.color} mb-2`}>{metric.value}</p>
              <div className="flex items-center gap-1">
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                ) : (
                  <span className="text-xs text-gray-500">→</span>
                )}
                <span className={metric.trend === 'up' ? 'text-red-400' : metric.trend === 'down' ? 'text-green-400' : 'text-gray-400'} style={{fontSize: '10px'}}>
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#0B0B0C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-sm text-cyan-400">API Latency Trend (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#999" style={{fontSize: '12px'}} />
              <YAxis stroke="#999" style={{fontSize: '12px'}} />
              <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #444'}} />
              <Line type="monotone" dataKey="latency" stroke="#FFA500" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-[#0B0B0C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-sm text-purple-400">Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#999" style={{fontSize: '12px'}} />
              <YAxis stroke="#999" style={{fontSize: '12px'}} />
              <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #444'}} />
              <Legend />
              <Bar dataKey="cacheHit" fill="#00D4C9" />
              <Bar dataKey="errorRate" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✓ Cache hit rate stable at 68%, up 12% from last week</li>
            <li>⚠ API latency spiked at 12:00 - investigate database load</li>
            <li>✓ Error rate within SLA at 0.3%</li>
            <li>→ Throughput consistent at 2.1k ops/sec</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}