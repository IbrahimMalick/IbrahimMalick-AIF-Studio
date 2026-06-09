import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Activity,
  BarChart3,
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Server,
  Database,
  Gauge
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE = "http://localhost:8787/api";

export default function WorkflowMetrics() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: metricsData, isLoading, refetch } = useQuery({
    queryKey: ["prometheusMetrics"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/metrics`);
        const text = await response.text();
        
        // Parse Prometheus metrics format
        const parsed = parsePrometheusMetrics(text);
        return parsed;
      } catch (error) {
        console.error("Metrics fetch error:", error);
        return null;
      }
    },
    refetchInterval: autoRefresh ? 10000 : false,
    initialData: null
  });

  const parsePrometheusMetrics = (text) => {
    const lines = text.split('\n');
    const metrics = {};
    
    lines.forEach(line => {
      if (line.startsWith('#') || !line.trim()) return;
      
      const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\{?([^}]*)\}?\s+([0-9.e+-]+)/);
      if (match) {
        const [, name, labels, value] = match;
        if (!metrics[name]) metrics[name] = [];
        
        const labelObj = {};
        if (labels) {
          labels.split(',').forEach(labelPair => {
            const [key, val] = labelPair.split('=');
            if (key && val) {
              labelObj[key.trim()] = val.trim().replace(/"/g, '');
            }
          });
        }
        
        metrics[name].push({
          labels: labelObj,
          value: parseFloat(value)
        });
      }
    });
    
    return metrics;
  };

  const getMetricValue = (metricName, labels = {}) => {
    if (!metricsData || !metricsData[metricName]) return 0;
    
    const matching = metricsData[metricName].filter(m => {
      return Object.entries(labels).every(([key, val]) => m.labels[key] === val);
    });
    
    if (matching.length === 0) return 0;
    return matching.reduce((sum, m) => sum + m.value, 0);
  };

  const getMetricSeries = (metricName) => {
    if (!metricsData || !metricsData[metricName]) return [];
    return metricsData[metricName];
  };

  // Calculate key metrics
  const queueDepth = getMetricValue('afs_queue_depth');
  const dlqDepth = getMetricValue('afs_dlq_depth');
  const totalStarted = getMetricValue('afs_workflow_runs_started_total');
  const totalCompleted = getMetricValue('afs_workflow_runs_completed_total');
  const totalFailed = getMetricValue('afs_workflow_runs_failed_total');
  const rateLimited = getMetricValue('afs_provider_rate_limited_total');

  const successRate = totalStarted > 0 ? ((totalCompleted / totalStarted) * 100).toFixed(1) : 0;

  // Duration histogram buckets
  const durationBuckets = getMetricSeries('afs_workflow_run_duration_seconds_bucket');
  const durationData = durationBuckets
    .filter(m => m.labels.le && m.labels.le !== '+Inf')
    .map(m => ({
      bucket: `${m.labels.le}s`,
      count: m.value
    }));

  // Step errors by type
  const stepErrors = getMetricSeries('afs_step_errors_total');
  const errorData = stepErrors.map(m => ({
    step_type: m.labels.step_type || 'unknown',
    errors: m.value
  }));

  // Rate limit hits by provider
  const rateLimitData = getMetricSeries('afs_provider_rate_limited_total').map(m => ({
    provider: m.labels.provider || 'unknown',
    hits: m.value
  }));

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Live System Metrics</h1>
              <p className="text-gray-400 text-sm">Prometheus metrics • Real-time observability</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center flex-wrap">
            <Link to={createPageUrl("WorkflowRuns")}>
              <Button variant="outline" size="sm" className="border-gray-700 text-white hover:bg-gray-800">
                <Activity className="w-4 h-4 mr-2" />
                Back to Runs
              </Button>
            </Link>

            <div className="flex items-center gap-2 p-2 bg-[#111317] border border-gray-800 rounded-lg">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                  autoRefresh
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {autoRefresh ? '⚡ Live (10s)' : '⏸ Paused'}
              </button>
            </div>

            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 text-purple-400 animate-spin" />
            <p className="text-gray-400">Loading metrics from Prometheus...</p>
          </div>
        ) : !metricsData ? (
          <Card className="bg-[#111317] border-red-500/30 rounded-xl">
            <CardContent className="p-12 text-center">
              <Server className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <p className="text-red-400 font-semibold mb-2">Cannot Connect to Metrics Endpoint</p>
              <p className="text-gray-400 text-sm mb-4">
                Make sure your Express server is running with Prometheus metrics enabled at {API_BASE}/metrics
              </p>
              <Button onClick={() => refetch()} className="bg-purple-500 hover:bg-purple-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Queue Health */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-sm">Queue Depth</p>
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-4xl font-bold text-blue-400">{Math.round(queueDepth)}</p>
                  <p className="text-gray-500 text-xs mt-1">Jobs waiting</p>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-sm">DLQ Depth</p>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-4xl font-bold text-red-400">{Math.round(dlqDepth)}</p>
                  <p className="text-gray-500 text-xs mt-1">Failed jobs</p>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-4xl font-bold text-green-400">{successRate}%</p>
                  <p className="text-gray-500 text-xs mt-1">{totalCompleted} / {totalStarted} runs</p>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-sm">Rate Limited</p>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-4xl font-bold text-yellow-400">{Math.round(rateLimited)}</p>
                  <p className="text-gray-500 text-xs mt-1">Provider hits</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Duration Distribution */}
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duration Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {durationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={durationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="bucket" stroke="#888" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#111317', 
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="count" fill="#9D4EDD" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      No duration data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step Errors */}
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Step Errors by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {errorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={errorData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#888" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="step_type" type="category" stroke="#888" tick={{ fontSize: 12 }} width={100} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#111317', 
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="errors" fill="#EF4444" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500">
                      No errors tracked yet
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Rate Limit Tracking */}
            {rateLimitData.length > 0 && (
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Provider Rate Limit Hits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {rateLimitData.map((provider, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-lg border border-yellow-500/30">
                        <p className="text-gray-400 text-xs mb-1">{provider.provider}</p>
                        <p className="text-2xl font-bold text-yellow-400">{provider.hits}</p>
                        <p className="text-gray-500 text-xs">Rate limit hits</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Metrics Raw View */}
            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  All Prometheus Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {Object.entries(metricsData || {}).map(([metricName, values]) => (
                      <div key={metricName} className="border-b border-gray-800 pb-2">
                        <p className="text-purple-400 font-mono text-xs font-semibold mb-1">
                          {metricName}
                        </p>
                        {values.slice(0, 5).map((v, idx) => (
                          <div key={idx} className="text-gray-400 font-mono text-xs ml-4">
                            {Object.keys(v.labels).length > 0 && (
                              <span className="text-blue-400">
                                {'{'}
                                {Object.entries(v.labels).map(([k, val], i) => 
                                  `${k}="${val}"${i < Object.keys(v.labels).length - 1 ? ', ' : ''}`
                                ).join('')}
                                {'}'}
                              </span>
                            )}
                            <span className="text-green-400 ml-2">{v.value}</span>
                          </div>
                        ))}
                        {values.length > 5 && (
                          <p className="text-gray-600 text-xs ml-4">... and {values.length - 5} more</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  About These Metrics
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  This page displays live Prometheus metrics from your workflow automation backend. 
                  Metrics auto-refresh every 10 seconds.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0B0B0C] rounded-lg">
                    <p className="text-gray-400 text-xs mb-1 font-semibold">📊 What's Tracked</p>
                    <ul className="text-gray-300 text-xs space-y-1">
                      <li>• Workflow run counts & durations</li>
                      <li>• Queue & DLQ depths</li>
                      <li>• Step-level error rates</li>
                      <li>• Provider rate limit hits</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-[#0B0B0C] rounded-lg">
                    <p className="text-gray-400 text-xs mb-1 font-semibold">🔧 Setup Required</p>
                    <ul className="text-gray-300 text-xs space-y-1">
                      <li>• Install: npm i prom-client</li>
                      <li>• Add src/metrics/index.js</li>
                      <li>• Expose GET /metrics endpoint</li>
                      <li>• Optional: Connect Grafana</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

          </>
        )}

      </div>
    </div>
  );
}