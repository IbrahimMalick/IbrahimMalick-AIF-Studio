import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle2, Zap, Database } from "lucide-react";

const API_BASE = "http://localhost:8787/api";

export default function SystemHealthIndicator({ compact = false }) {
  const { data: health } = useQuery({
    queryKey: ["systemHealth"],
    queryFn: async () => {
      try {
        const [queueRes, metricsRes] = await Promise.all([
          fetch(`${API_BASE}/queue/stats`).catch(() => null),
          fetch(`${API_BASE}/metrics`).catch(() => null)
        ]);

        const queueData = queueRes ? await queueRes.json().catch(() => ({})) : {};
        
        return {
          queue: queueData.waiting || 0,
          dlq: queueData.dlq || 0,
          active: queueData.active || 0,
          status: queueData.dlq > 10 ? "degraded" : queueData.dlq > 0 ? "warning" : "healthy"
        };
      } catch (error) {
        return { queue: 0, dlq: 0, active: 0, status: "unknown" };
      }
    },
    refetchInterval: 30000,
    initialData: { queue: 0, dlq: 0, active: 0, status: "healthy" }
  });

  const getStatusConfig = () => {
    switch (health.status) {
      case "healthy":
        return { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20", label: "Healthy" };
      case "warning":
        return { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/20", label: "Warning" };
      case "degraded":
        return { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20", label: "Degraded" };
      default:
        return { icon: Activity, color: "text-gray-400", bg: "bg-gray-500/20", label: "Unknown" };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${statusConfig.color}`} />
        <Badge className={`${statusConfig.bg} ${statusConfig.color} text-xs`}>
          {statusConfig.label}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-[#111317] border border-gray-800 rounded-lg">
      <Icon className={`w-5 h-5 ${statusConfig.color}`} />
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 text-xs font-semibold">{health.queue}</span>
          <span className="text-gray-500 text-xs">queue</span>
        </div>

        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-semibold">{health.active}</span>
          <span className="text-gray-500 text-xs">active</span>
        </div>

        {health.dlq > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-red-400 text-xs font-semibold">{health.dlq}</span>
            <span className="text-gray-500 text-xs">DLQ</span>
          </div>
        )}
      </div>

      <Badge className={`${statusConfig.bg} ${statusConfig.color} text-xs`}>
        {statusConfig.label}
      </Badge>
    </div>
  );
}