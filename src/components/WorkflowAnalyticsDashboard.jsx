import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function WorkflowAnalyticsDashboard({ runs }) {
  // Calculate analytics
  const totalRuns = runs.length;
  const successRuns = runs.filter(r => r.state === 'done' || r.state === 'completed').length;
  const failedRuns = runs.filter(r => r.state === 'failed' || r.state === 'error').length;
  const runningRuns = runs.filter(r => r.state === 'running' || r.state === 'processing').length;
  
  const successRate = totalRuns > 0 ? (successRuns / totalRuns) * 100 : 0;
  const failureRate = totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0;

  // Average duration
  const completedRuns = runs.filter(r => r.durationMs);
  const avgDuration = completedRuns.length > 0
    ? Math.round(completedRuns.reduce((sum, r) => sum + r.durationMs, 0) / completedRuns.length)
    : 0;

  // Success rate over time (last 30 runs)
  const recentRuns = [...runs].reverse().slice(-30);
  const successOverTime = recentRuns.map((run, idx) => {
    const precedingRuns = recentRuns.slice(0, idx + 1);
    const successes = precedingRuns.filter(r => r.state === 'done' || r.state === 'completed').length;
    const rate = precedingRuns.length > 0 ? (successes / precedingRuns.length) * 100 : 0;
    
    return {
      run: idx + 1,
      rate: Math.round(rate),
      duration: run.durationMs || 0
    };
  });

  // Common failure points
  const failureReasons = {};
  runs.filter(r => r.state === 'failed' || r.state === 'error').forEach(run => {
    const error = run.output?.error || run.error || 'Unknown Error';
    const key = error.substring(0, 50); // Truncate for grouping
    failureReasons[key] = (failureReasons[key] || 0) + 1;
  });

  const topFailures = Object.entries(failureReasons)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([error, count]) => ({ error, count }));

  // Duration distribution
  const durationBuckets = {
    '0-5s': 0,
    '5-15s': 0,
    '15-30s': 0,
    '30-60s': 0,
    '60s+': 0
  };

  completedRuns.forEach(run => {
    const seconds = run.durationMs / 1000;
    if (seconds < 5) durationBuckets['0-5s']++;
    else if (seconds < 15) durationBuckets['5-15s']++;
    else if (seconds < 30) durationBuckets['15-30s']++;
    else if (seconds < 60) durationBuckets['30-60s']++;
    else durationBuckets['60s+']++;
  });

  const durationData = Object.entries(durationBuckets).map(([range, count]) => ({
    range,
    count
  }));

  // Status distribution for pie chart
  const statusData = [
    { name: 'Success', value: successRuns, color: '#10B981' },
    { name: 'Failed', value: failedRuns, color: '#EF4444' },
    { name: 'Running', value: runningRuns, color: '#3B82F6' }
  ].filter(d => d.value > 0);

  // Recent 24h trend
  const last24h = runs.filter(r => {
    if (!r.started) return false;
    const runTime = new Date(r.started).getTime();
    const now = Date.now();
    return (now - runTime) < 24 * 60 * 60 * 1000;
  });

  const trend24h = last24h.length > 0
    ? (last24h.filter(r => r.state === 'done' || r.state === 'completed').length / last24h.length) * 100
    : 0;

  const prevTrend = runs.length > 30 
    ? (runs.slice(-60, -30).filter(r => r.state === 'done' || r.state === 'completed').length / 30) * 100
    : successRate;

  const trendChange = trend24h - prevTrend;
  const isImproving = trendChange > 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">Success Rate</p>
              {isImproving ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {Math.round(successRate)}%
            </p>
            <p className={`text-xs ${isImproving ? 'text-green-400' : 'text-red-400'}`}>
              {isImproving ? '+' : ''}{Math.round(trendChange)}% vs previous
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">Avg Duration</p>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {avgDuration}ms
            </p>
            <p className="text-xs text-gray-500">
              Across {completedRuns.length} runs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">Failure Rate</p>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {Math.round(failureRate)}%
            </p>
            <p className="text-xs text-red-400">
              {failedRuns} failed runs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">24h Activity</p>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {last24h.length}
            </p>
            <p className="text-xs text-gray-500">
              runs in last 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Success Rate Trend */}
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">Success Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {successOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={successOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="run" 
                    stroke="#888"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Run Number', position: 'insideBottom', offset: -5, style: { fill: '#888', fontSize: 12 } }}
                  />
                  <YAxis 
                    stroke="#888"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    label={{ value: 'Success %', angle: -90, position: 'insideLeft', style: { fill: '#888', fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111317', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duration Distribution */}
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">Duration Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {durationData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={durationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="range" 
                    stroke="#888"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#888"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111317', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#00D4C9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                No duration data yet
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Status Distribution & Common Failures */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Status Pie Chart */}
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111317', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                No runs yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Failure Points */}
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Common Failure Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topFailures.length > 0 ? (
              <div className="space-y-2">
                {topFailures.map((failure, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-red-500/5 border border-red-500/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-red-400 text-xs font-semibold">
                        Occurred {failure.count} times
                      </p>
                      <Badge className="bg-red-500/20 text-red-400 text-xs">
                        {Math.round((failure.count / failedRuns) * 100)}%
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-xs font-mono">
                      {failure.error}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-gray-500 text-sm">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p>No failures detected! 🎉</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Performance Insights */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Performance Insights
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Positive Insights */}
            {successRate >= 90 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-semibold text-sm mb-1">
                  ✅ Excellent Success Rate
                </p>
                <p className="text-gray-300 text-xs">
                  Your workflows are performing exceptionally well with {Math.round(successRate)}% success rate.
                </p>
              </div>
            )}

            {avgDuration < 5000 && completedRuns.length > 5 && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-semibold text-sm mb-1">
                  ⚡ Fast Execution
                </p>
                <p className="text-gray-300 text-xs">
                  Average workflow completes in just {Math.round(avgDuration / 1000)}s. Great performance!
                </p>
              </div>
            )}

            {/* Warning Insights */}
            {failureRate > 20 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-semibold text-sm mb-1">
                  ⚠️ High Failure Rate
                </p>
                <p className="text-gray-300 text-xs">
                  {Math.round(failureRate)}% of workflows are failing. Review error logs and retry settings.
                </p>
              </div>
            )}

            {avgDuration > 30000 && completedRuns.length > 5 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-semibold text-sm mb-1">
                  🐌 Slow Execution
                </p>
                <p className="text-gray-300 text-xs">
                  Average duration is {Math.round(avgDuration / 1000)}s. Consider optimizing workflow steps.
                </p>
              </div>
            )}

            {!isImproving && totalRuns > 10 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-semibold text-sm mb-1">
                  📉 Declining Performance
                </p>
                <p className="text-gray-300 text-xs">
                  Success rate is trending downward. Recent changes may need review.
                </p>
              </div>
            )}

            {totalRuns === 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg col-span-2">
                <p className="text-blue-400 font-semibold text-sm mb-1">
                  🚀 Get Started
                </p>
                <p className="text-gray-300 text-xs">
                  No workflow runs yet. Design your first workflow and test it to see analytics here!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}