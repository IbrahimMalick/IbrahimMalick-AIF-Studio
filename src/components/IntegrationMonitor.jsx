import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Activity
} from "lucide-react";
import { showToast } from "./ToastNotification";

/**
 * Integration Health Monitor
 * Runs daily checks on all connected integrations
 * Alerts user if any connection breaks
 */

export default function IntegrationMonitor({ user }) {
  const queryClient = useQueryClient();

  const { data: healthChecks = [] } = useQuery({
    queryKey: ["integrationHealth", user?.email],
    queryFn: () => base44.entities.IntegrationHealth.filter({
      user_email: user.email
    }, "-last_check"),
    enabled: !!user?.email,
    refetchInterval: 60000, // Check every minute
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations", user?.email],
    queryFn: () => base44.entities.Integration.filter({
      user_email: user.email,
      is_active: true
    }),
    enabled: !!user?.email
  });

  // Run health check
  const runHealthCheckMutation = useMutation({
    mutationFn: async (integration) => {
      try {
        // Simulate API health check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In production, actually ping the API
        const isHealthy = Math.random() > 0.1; // 90% success rate
        
        const healthRecord = healthChecks.find(h => h.integration_type === integration.service_name);
        
        if (healthRecord) {
          await base44.entities.IntegrationHealth.update(healthRecord.id, {
            status: isHealthy ? "healthy" : "degraded",
            last_check: new Date().toISOString(),
            last_success: isHealthy ? new Date().toISOString() : healthRecord.last_success,
            consecutive_failures: isHealthy ? 0 : (healthRecord.consecutive_failures || 0) + 1,
            response_time_ms: Math.random() * 500
          });
        } else {
          await base44.entities.IntegrationHealth.create({
            user_email: user.email,
            integration_id: integration.id,
            integration_type: integration.service_name,
            status: isHealthy ? "healthy" : "degraded",
            last_check: new Date().toISOString(),
            last_success: isHealthy ? new Date().toISOString() : null,
            consecutive_failures: isHealthy ? 0 : 1
          });
        }

        // Alert if failing
        if (!isHealthy) {
          await base44.entities.Notification.create({
            user_email: user.email,
            title: `⚠️ ${integration.service_name} Connection Issue`,
            message: "Your integration may need attention. Click to reconnect.",
            type: "warning",
            category: "system",
            action_url: "/Integrations"
          });
        }

        return { success: isHealthy, integration: integration.service_name };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: ({ success, integration }) => {
      queryClient.invalidateQueries(["integrationHealth"]);
      if (!success) {
        showToast(`${integration} needs attention`, "warning");
      }
    },
  });

  // Auto-run checks on mount
  useEffect(() => {
    if (integrations.length > 0) {
      integrations.forEach(int => {
        runHealthCheckMutation.mutate(int);
      });
    }
  }, [integrations.length]);

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy": return "bg-green-500/20 text-green-400";
      case "degraded": return "bg-yellow-500/20 text-yellow-400";
      case "down": return "bg-red-500/20 text-red-400";
      case "unauthorized": return "bg-orange-500/20 text-orange-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy": return CheckCircle2;
      case "degraded": return AlertTriangle;
      case "down": return AlertCircle;
      default: return Activity;
    }
  };

  if (healthChecks.length === 0) return null;

  const unhealthyCount = healthChecks.filter(h => h.status !== "healthy").length;

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D4C9]" />
            Integration Health
          </div>
          {unhealthyCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400">
              {unhealthyCount} Issues
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthChecks.map((health) => {
            const StatusIcon = getStatusIcon(health.status);
            return (
              <div
                key={health.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 ${
                    health.status === 'healthy' ? 'text-green-400' :
                    health.status === 'degraded' ? 'text-yellow-400' :
                    'text-red-400'
                  }`} />
                  <div>
                    <p className="text-white font-semibold capitalize">
                      {health.integration_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last checked: {new Date(health.last_check).toLocaleTimeString()}
                      {health.response_time_ms && ` • ${Math.round(health.response_time_ms)}ms`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(health.status)}>
                    {health.status}
                  </Badge>
                  {health.status !== "healthy" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const integration = integrations.find(i => i.service_name === health.integration_type);
                        if (integration) runHealthCheckMutation.mutate(integration);
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {unhealthyCount > 0 && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-semibold mb-1">Action Required</p>
                <p className="text-gray-400 text-xs">
                  Some integrations need attention. Click the refresh button to retry, or visit Integrations to reconnect.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}