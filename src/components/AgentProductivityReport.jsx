import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot, Zap, CheckCircle2, Clock, AlertCircle,
  Mic, Volume2, Brain, TrendingUp, Loader2, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { base44 as b44 } from "@/api/base44Client";

const COLORS = ["#00D4C9", "#FFD700", "#9D4EDD", "#FF6B35", "#06D6A0", "#FF69B4"];

const statusColor = {
  pending:    "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  completed:  "bg-green-500/20 text-green-400",
  failed:     "bg-red-500/20 text-red-400",
};

export default function AgentProductivityReport({ user }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  // Production queue tasks (all agents)
  const { data: queueTasks = [], refetch: refetchQueue } = useQuery({
    queryKey: ["productionQueue"],
    queryFn: () => base44.entities.ProductionQueue.list("-created_date", 100),
    enabled: !!user,
  });

  // Copilot actions
  const { data: copilotActions = [], refetch: refetchActions } = useQuery({
    queryKey: ["copilotActions"],
    queryFn: () => base44.entities.CopilotAction.list("-created_date", 100),
    enabled: !!user,
  });

  // AI usage logs
  const { data: usageLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ["aiUsageLogs"],
    queryFn: () => base44.entities.AIUsageLog.list("-created_date", 200),
    enabled: !!user,
  });

  const refetchAll = () => { refetchQueue(); refetchActions(); refetchLogs(); };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTasks = queueTasks.length;
  const completedTasks = queueTasks.filter(t => t.status === "completed").length;
  const failedTasks = queueTasks.filter(t => t.status === "failed").length;
  const activeTasks = queueTasks.filter(t => t.status === "processing" || t.status === "pending").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tasks by agent
  const byAgent = ["vp", "manager", "engineer", "human"].map(agent => ({
    agent,
    total: queueTasks.filter(t => t.assigned_to === agent).length,
    completed: queueTasks.filter(t => t.assigned_to === agent && t.status === "completed").length,
    failed: queueTasks.filter(t => t.assigned_to === agent && t.status === "failed").length,
  })).filter(a => a.total > 0);

  // Tasks by type
  const byType = ["discovery", "script", "video", "revision", "export"].map(type => ({
    type,
    count: queueTasks.filter(t => t.task_type === type).length,
  })).filter(t => t.count > 0);

  // ARIA voice usage: count sessions where TTS was active (proxy: copilot actions with "voice" in context)
  const ariaSessions = copilotActions.filter(a =>
    (a.action_type || "").toLowerCase().includes("voice") ||
    (a.context && JSON.stringify(a.context).toLowerCase().includes("aria"))
  ).length;

  // AI usage totals
  const totalTokens = usageLogs.reduce((s, l) => s + (l.tokens_used || 0), 0);
  const totalCost = usageLogs.reduce((s, l) => s + (l.cost_usd || 0), 0);
  const cacheHits = usageLogs.filter(l => l.cache_hit).length;
  const cacheRate = usageLogs.length > 0 ? Math.round((cacheHits / usageLogs.length) * 100) : 0;

  // Recent active tasks
  const recentActive = queueTasks
    .filter(t => t.status === "processing" || t.status === "pending")
    .slice(0, 5);

  // ── Generate AI Summary ──────────────────────────────────────────────────
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI operations analyst. Summarize the following agent productivity data in 3–4 concise sentences. Highlight completion rate, most active agent, and any issues.

Total Tasks: ${totalTasks}
Completed: ${completedTasks} (${completionRate}%)
Failed: ${failedTasks}
Active: ${activeTasks}
Agents: ${JSON.stringify(byAgent)}
ARIA Voice Sessions (estimated): ${ariaSessions}
Total AI Tokens Used: ${totalTokens.toLocaleString()}
Estimated AI Cost: $${totalCost.toFixed(2)}
Cache Hit Rate: ${cacheRate}%`,
      });
      setSummary(result);
    } catch (e) {
      setSummary("Unable to generate summary at this time.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#00D4C9]" /> AI Agent Productivity Report
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            className="border-gray-700 text-gray-300 hover:text-white rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#2E3192] to-[#FF6B35] text-white rounded-xl"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
            AI Summary
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <Card className="bg-gradient-to-br from-[#2E3192]/10 to-[#FF6B35]/10 border border-[#2E3192]/40 rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs text-[#9D4EDD] font-semibold mb-1 flex items-center gap-1">
              <Brain className="w-3 h-3" /> AI-Generated Summary
            </p>
            <p className="text-gray-200 text-sm leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: totalTasks, icon: Zap, color: "#FFD700" },
          { label: "Completed", value: `${completionRate}%`, icon: CheckCircle2, color: "#06D6A0" },
          { label: "Active Now", value: activeTasks, icon: Clock, color: "#00D4C9" },
          { label: "Failed", value: failedTasks, icon: AlertCircle, color: failedTasks > 0 ? "#FF6B35" : "#555" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-5 text-center">
              <Icon className="w-6 h-6 mx-auto mb-2" style={{ color }} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent breakdown chart */}
      {byAgent.length > 0 && (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#9D4EDD]" /> Tasks by Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byAgent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="agent" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }} />
                <Bar dataKey="completed" fill="#06D6A0" name="Completed" stackId="a" />
                <Bar dataKey="failed" fill="#FF6B35" name="Failed" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Task type breakdown + ARIA voice */}
      <div className="grid md:grid-cols-2 gap-4">
        {byType.length > 0 && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-sm">Task Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70}
                    label={({ type, count }) => `${type}: ${count}`} labelLine={false}>
                    {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* ARIA Voice Stats */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#2E3192]" /> ARIA Voice Console Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#FF6B35]" /> Voice Sessions (est.)
              </span>
              <span className="text-white font-bold text-xl">{ariaSessions}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
              <span className="text-gray-400 text-sm">Total AI Tokens</span>
              <span className="text-[#FFD700] font-bold">{totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
              <span className="text-gray-400 text-sm">Est. AI Cost</span>
              <span className="text-[#06D6A0] font-bold">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Cache Hit Rate
              </span>
              <Badge className={cacheRate >= 50 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                {cacheRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active tasks feed */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00D4C9]" /> Active Tasks
            {activeTasks > 0 && (
              <span className="ml-auto text-xs text-[#00D4C9] animate-pulse">● Live</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActive.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No active tasks right now.</p>
          ) : (
            <div className="space-y-2">
              {recentActive.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
                  <div>
                    <p className="text-white text-sm font-medium capitalize">
                      {task.task_type} — {task.assigned_to}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {task.llm_model || "No model"} · Retry #{task.retry_count || 0}
                    </p>
                  </div>
                  <Badge className={statusColor[task.status] || "bg-gray-700 text-gray-300"}>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}