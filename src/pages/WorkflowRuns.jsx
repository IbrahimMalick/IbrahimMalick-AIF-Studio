
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  Bell,
  BellOff,
  ExternalLink,
  BarChart3
} from "lucide-react";
import WorkflowExecutionGraph from "@/components/WorkflowExecutionGraph";
import WorkflowAnalyticsDashboard from "@/components/WorkflowAnalyticsDashboard";
import DeadLetterQueueViewer from "@/components/DeadLetterQueueViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsageQuotaMeter from "@/components/UsageQuotaMeter";
import StorageUsageWidget from "@/components/StorageUsageWidget"; // Added import

const API_BASE = "http://localhost:8787/api";

export default function WorkflowRuns() {
  const [user, setUser] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [lastFailureCount, setLastFailureCount] = useState(0);
  const [grafanaUrl, setGrafanaUrl] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load alert preference
      const savedAlerts = localStorage.getItem('workflow_alerts_enabled');
      if (savedAlerts !== null) {
        setAlertsEnabled(savedAlerts === 'true');
      }

      // Load Grafana URL
      const savedGrafana = localStorage.getItem('workflow_grafana_url');
      if (savedGrafana) {
        setGrafanaUrl(savedGrafana);
      }
    };
    loadUser();
  }, []);

  const { data: runsData, isLoading, refetch } = useQuery({
    queryKey: ["workflowRuns"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/runs/list`);
        const data = await response.json();
        return data.items || [];
      } catch (error) {
        console.error("Runs fetch error:", error);
        return [];
      }
    },
    refetchInterval: autoRefresh ? 6000 : false,
    initialData: []
  });

  // Alert system - monitor for critical failures
  useEffect(() => {
    if (!alertsEnabled || !user) return;

    const currentFailures = runsData.filter(r => r.state === 'failed' || r.state === 'error').length;
    const newFailures = currentFailures - lastFailureCount;

    if (newFailures > 0 && lastFailureCount > 0) {
      // Critical: Multiple failures detected
      const recentFailures = runsData
        .filter(r => r.state === 'failed' || r.state === 'error')
        .slice(0, newFailures);

      recentFailures.forEach(async (failure) => {
        const errorMsg = failure.output?.error || failure.error || 'Unknown error';
        
        await base44.entities.Notification.create({
          user_email: user.email,
          title: '🚨 Workflow Failed',
          message: `Workflow "${failure.workflowId}" failed: ${errorMsg.substring(0, 100)}`,
          type: 'error',
          category: 'system',
          action_url: createPageUrl('WorkflowRuns'),
          action_label: 'View Details'
        });
      });
    }

    // Performance degradation alert
    if (runsData.length >= 10) {
      const recent10 = runsData.slice(0, 10);
      const recentFailures = recent10.filter(r => r.state === 'failed' || r.state === 'error').length;
      
      if (recentFailures >= 5 && lastFailureCount < 5) {
        base44.entities.Notification.create({
          user_email: user.email,
          title: '⚠️ Performance Degradation Detected',
          message: `${recentFailures} out of last 10 workflows failed. System may need attention.`,
          type: 'warning',
          category: 'system',
          action_url: createPageUrl('WorkflowRuns'),
          action_label: 'Investigate'
        });
      }
    }

    setLastFailureCount(currentFailures);
  }, [runsData, alertsEnabled, user, lastFailureCount]);

  const toggleAlerts = () => {
    const newValue = !alertsEnabled;
    setAlertsEnabled(newValue);
    localStorage.setItem('workflow_alerts_enabled', String(newValue));
  };

  // Filter runs based on status
  const filteredRuns = runsData.filter(run => {
    if (statusFilter === "all") return true;
    if (statusFilter === "failed") return run.state === "failed" || run.state === "error";
    if (statusFilter === "success") return run.state === "done" || run.state === "completed";
    if (statusFilter === "running") return run.state === "running" || run.state === "processing";
    return true;
  });

  const toggleLogExpansion = (runId) => {
    setExpandedLogs({ ...expandedLogs, [runId]: !expandedLogs[runId] });
  };

  const getStatusIcon = (state) => {
    switch (state) {
      case "done":
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "failed":
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "running":
      case "processing":
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case "queued":
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (state) => {
    const styles = {
      done: "bg-green-500/20 text-green-400",
      completed: "bg-green-500/20 text-green-400",
      failed: "bg-red-500/20 text-red-400",
      error: "bg-red-500/20 text-red-400",
      running: "bg-blue-500/20 text-blue-400",
      processing: "bg-blue-500/20 text-blue-400",
      queued: "bg-yellow-500/20 text-yellow-400",
      pending: "bg-yellow-500/20 text-yellow-400"
    };
    return styles[state] || "bg-gray-500/20 text-gray-400";
  };

  const getLogLevelColor = (level) => {
    const colors = {
      info: "text-slate-300",
      warn: "text-yellow-500",
      error: "text-red-400",
      debug: "text-gray-500"
    };
    return colors[level] || colors.info;
  };

  // Calculate usage stats
  const todayRuns = runsData.filter(r => {
    const runDate = new Date(r.started || r.created_date);
    const today = new Date();
    return runDate.toDateString() === today.toDateString();
  }).length;

  const dailyLimit = 500; // This should come from user's plan or settings

  const handleQuotaExceeded = (quotaType, used, cap) => {
    // Show upgrade modal when quota is hit
    const user_plan = user?.plan_tier || 'Free';
    // This would trigger QuotaUpgradePrompt component
    alert(`⚠️ ${quotaType} Quota Exceeded!\n\nUsed: ${used}\nLimit: ${cap}\n\nUpgrade from ${user_plan} plan to increase limits.`);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4C9] to-[#1E90FF] flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Workflow Runs & Monitoring</h1>
              <p className="text-gray-400 text-sm">Real-time analytics, execution logs, and intelligent alerts</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center flex-wrap">
            {/* Grafana Link */}
            {grafanaUrl && (
              <Button
                onClick={() => window.open(grafanaUrl, '_blank')}
                variant="outline"
                size="sm"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Grafana
              </Button>
            )}

            {/* Metrics Dashboard Link */}
            <Link to={createPageUrl("WorkflowMetrics")}>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Live Metrics
              </Button>
            </Link>

            {/* Alert Toggle */}
            <Button
              onClick={toggleAlerts}
              variant="outline"
              size="sm"
              className={`border-gray-700 hover:bg-gray-800 ${
                alertsEnabled ? 'text-[#FFD700]' : 'text-gray-400'
              }`}
            >
              {alertsEnabled ? (
                <Bell className="w-4 h-4 mr-2" />
              ) : (
                <BellOff className="w-4 h-4 mr-2" />
              )}
              {alertsEnabled ? 'Alerts On' : 'Alerts Off'}
            </Button>

            {/* Status Filter */}
            <div className="flex gap-2 p-1 bg-[#111317] border border-gray-800 rounded-lg">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? 'bg-[#FFD700] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("success")}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  statusFilter === "success"
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setStatusFilter("failed")}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  statusFilter === "failed"
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Failed
              </button>
              <button
                onClick={() => setStatusFilter("running")}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  statusFilter === "running"
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Running
              </button>
            </div>

            <div className="flex items-center gap-2 p-2 bg-[#111317] border border-gray-800 rounded-lg">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                  autoRefresh
                    ? 'bg-[#06D6A0] text-black'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {autoRefresh ? '⚡ Auto-refresh (6s)' : '⏸ Paused'}
              </button>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* Usage Quota with Storage */}
        <div className="grid md:grid-cols-4 gap-4">
          <UsageQuotaMeter 
            used={todayRuns} 
            limit={dailyLimit} 
            period="daily"
            label="Workflow Runs Today"
            onQuotaExceeded={(used, limit) => handleQuotaExceeded("Daily Runs", used, limit)}
          />
          <UsageQuotaMeter 
            used={runsData.filter(r => r.state === 'queued' || r.state === 'pending').length} 
            limit={50} 
            period="concurrent"
            label="Queued Jobs"
            onQuotaExceeded={(used, limit) => handleQuotaExceeded("Concurrent Jobs", used, limit)}
          />
          <UsageQuotaMeter 
            used={runsData.filter(r => r.state === 'failed' || r.state === 'error').length} 
            limit={10} 
            period="threshold"
            label="Failed Jobs (24h)"
            onQuotaExceeded={(used, limit) => handleQuotaExceeded("Failed Jobs", used, limit)}
          />
          <div>
            <StorageUsageWidget 
              tenantId={user?.email} 
              showDetails={false}
              onQuotaExceeded={(used, limit) => handleQuotaExceeded("Storage", used, limit)}
            />
            <p className="text-gray-500 text-xs mt-2 text-center">
              Updated nightly via cron
            </p>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <WorkflowAnalyticsDashboard runs={runsData} />

        {/* Tabs for Runs / DLQ */}
        <Tabs defaultValue="runs" className="w-full">
          <TabsList className="bg-[#111317] rounded-xl mb-4 flex">
            <TabsTrigger value="runs" className="flex-1">
              <Activity className="w-4 h-4 mr-2" />
              Active Runs
            </TabsTrigger>
            <TabsTrigger value="dlq" className="flex-1">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Dead Letter Queue
            </TabsTrigger>
          </TabsList>

          {/* Active Runs Tab */}
          <TabsContent value="runs">
            {/* Stats */}
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Total Runs", value: runsData.length, icon: Activity, color: "text-blue-400" },
                { label: "Queued", value: runsData.filter(r => r.state === 'queued' || r.state === 'pending').length, icon: Clock, color: "text-yellow-400" },
                { label: "Successful", value: runsData.filter(r => r.state === 'done' || r.state === 'completed').length, icon: CheckCircle2, color: "text-green-400" },
                { label: "Failed", value: runsData.filter(r => r.state === 'failed' || r.state === 'error').length, icon: XCircle, color: "text-red-400" },
                { label: "Running", value: runsData.filter(r => r.state === 'running' || r.state === 'processing').length, icon: Zap, color: "text-yellow-400" }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card key={idx} className="bg-[#111317] border-gray-800 rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                        <Icon className={`w-10 h-10 ${stat.color} opacity-50`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Runs Table */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Recent Executions</CardTitle>
                  {statusFilter !== "all" && (
                    <Badge className="bg-gray-700 text-gray-300">
                      Showing: {statusFilter} ({filteredRuns.length})
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-600 animate-spin" />
                    <p className="text-gray-400">Loading runs...</p>
                  </div>
                ) : filteredRuns.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">
                      {statusFilter === "all" ? "No runs yet" : `No ${statusFilter} runs`}
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      {statusFilter === "all" 
                        ? "Publish a workflow and trigger it to see execution logs here."
                        : "Change filter to see other runs."}
                    </p>
                    <Link to={createPageUrl("WorkflowDesigner")}>
                      <Button className="bg-[#FFD700] text-black font-bold hover:bg-[#FF8C00]">
                        Create First Workflow
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRuns.map((run) => {
                      const isExpanded = expandedLogs[run.id];
                      const logs = run.output?.logs || [];
                      const displayLogs = logs.slice(-200);
                      const retryInfo = run.output?.retries || [];
                      const isDuplicate = run.deduped || false;
                      
                      return (
                        <div
                          key={run.id}
                          className="rounded-xl border-2 border-gray-800 bg-[#0B0B0C] transition-all"
                        >
                          {/* Run Header */}
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                {getStatusIcon(run.state)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="text-white font-semibold">
                                      Workflow: {run.workflowId || run.workflow?.name || "Unknown"}
                                    </p>
                                    <Badge className={getStatusBadge(run.state)}>
                                      {run.state}
                                    </Badge>
                                    {isDuplicate && (
                                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                        Deduplicated
                                      </Badge>
                                    )}
                                    {logs.length > 0 && (
                                      <Badge className="bg-gray-700 text-gray-400 text-xs">
                                        {logs.length} logs
                                      </Badge>
                                    )}
                                    {retryInfo.length > 0 && (
                                      <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                                        {retryInfo.length} retries
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-500 text-sm">
                                    Started: {run.started ? new Date(run.started).toLocaleString() : "N/A"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {run.durationMs && (
                                  <div className="text-right">
                                    <p className="text-gray-400 text-xs">Duration</p>
                                    <p className="text-white font-semibold">{run.durationMs}ms</p>
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleLogExpansion(run.id)}
                                  className="text-[#00D4C9] hover:text-[#00D4C9] hover:bg-[#00D4C9]/10"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Deduplication Notice */}
                            {isDuplicate && (
                              <div className="mt-3 p-3 bg-purple-500/5 border border-purple-500/30 rounded-lg">
                                <p className="text-purple-400 text-xs font-semibold mb-1">
                                  🛡️ Duplicate Prevented
                                </p>
                                <p className="text-gray-400 text-xs">
                                  This workflow run was deduplicated by idempotency protection. 
                                  The same trigger payload was already processing.
                                </p>
                              </div>
                            )}

                            {/* Retry Information */}
                            {retryInfo.length > 0 && (
                              <div className="mt-3 p-3 bg-orange-500/5 border border-orange-500/30 rounded-lg">
                                <p className="text-orange-400 text-xs font-semibold mb-2 flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3" />
                                  Retry History
                                </p>
                                <div className="space-y-1">
                                  {retryInfo.map((retry, idx) => (
                                    <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                                      <span className="text-orange-400">Attempt {retry.attempt}:</span>
                                      <span>{retry.error}</span>
                                      {retry.waited_seconds && (
                                        <span className="text-gray-500">(waited {retry.waited_seconds}s)</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expandable Details */}
                          {isExpanded && (
                            <div className="border-t border-gray-800 p-4 bg-[#0A0A0A] space-y-4">
                              
                              {/* Execution Graph */}
                              <WorkflowExecutionGraph run={run} />

                              {/* Logs */}
                              {logs.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-4 h-4 text-gray-500" />
                                    <p className="text-gray-400 text-xs">
                                      Showing last {displayLogs.length} log entries
                                    </p>
                                  </div>
                                  <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto">
                                    <div className="space-y-1 font-mono text-xs">
                                      {displayLogs.map((log, idx) => (
                                        <div key={idx} className="flex gap-3">
                                          <span className="text-gray-600 flex-shrink-0">
                                            {log.ts ? new Date(log.ts).toLocaleTimeString() : ''}
                                          </span>
                                          <span className={`flex-shrink-0 font-semibold uppercase ${
                                            log.level === 'error' ? 'text-red-400' :
                                            log.level === 'warn' ? 'text-yellow-500' :
                                            log.level === 'info' ? 'text-slate-300' :
                                            'text-gray-500'
                                          }`}>
                                            [{log.level || 'info'}]
                                          </span>
                                          <span className={getLogLevelColor(log.level)}>
                                            {log.msg || JSON.stringify(log)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DLQ Tab */}
          <TabsContent value="dlq">
            <DeadLetterQueueViewer onRetry={() => refetch()} />
          </TabsContent>
        </Tabs>

        {/* Info */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-Time Monitoring {autoRefresh && <Badge className="bg-green-500/20 text-green-400 text-xs">Live</Badge>}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              {autoRefresh ? "This page auto-refreshes every 6 seconds." : "Auto-refresh is paused."} Monitor your automation workflows in real-time,
              inspect outputs, and debug failed runs. {alertsEnabled ? "Critical failures trigger instant notifications." : "Alerts are disabled."}
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  Success
                </p>
                <p className="text-white font-semibold text-sm">Workflow completed without errors</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Failed
                </p>
                <p className="text-white font-semibold text-sm">Error occurred, check logs</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  Running
                </p>
                <p className="text-white font-semibold text-sm">Currently executing</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
