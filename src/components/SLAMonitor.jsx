import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function SLAMonitor() {
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['sla-configs'],
    queryFn: async () => {
      try {
        return await base44.entities.SLAConfig.filter({ monitoring_enabled: true }, '-created_date', 50);
      } catch {
        return [];
      }
    }
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['sla-compliance'],
    queryFn: async () => {
      try {
        const now = new Date();
        const oneHourAgo = new Date(now - 3600000);
        return await base44.entities.SLACompliance.filter({
          period_end: { $gte: oneHourAgo.toISOString() }
        }, '-period_end', 100);
      } catch {
        return [];
      }
    },
    refetchInterval: 60000
  });

  const getComplianceIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'at_risk':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'non_compliant':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'met':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'at_risk':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'breached':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) return <p className="text-gray-400 text-sm">Loading SLA configs...</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">SLA Tracking</h3>

      {configs.length === 0 ? (
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardContent className="p-6 text-center text-gray-400 text-sm">
            No SLA configurations found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {configs.map((config, idx) => {
            const latestCompliance = compliance.find(c => c.sla_config_id === config.id);

            return (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-[#0B0B0C] border-gray-800 hover:border-cyan-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          {config.service_name}
                          {latestCompliance && getComplianceIcon(latestCompliance.overall_compliance)}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">Target: {config.uptime_target}% uptime</p>
                      </div>
                      {latestCompliance && (
                        <Badge className={getStatusColor(latestCompliance.overall_compliance)}>
                          {latestCompliance.overall_compliance}
                        </Badge>
                      )}
                    </div>

                    {latestCompliance && (
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className={`p-2 rounded border ${getStatusColor(latestCompliance.uptime_status)}`}>
                          <p className="text-gray-400 mb-1">Uptime</p>
                          <p className="font-bold">{latestCompliance.actual_uptime.toFixed(2)}%</p>
                        </div>
                        <div className={`p-2 rounded border ${getStatusColor(latestCompliance.latency_status)}`}>
                          <p className="text-gray-400 mb-1">Latency (P95)</p>
                          <p className="font-bold">{latestCompliance.actual_latency_p95.toFixed(0)}ms</p>
                        </div>
                        <div className={`p-2 rounded border ${getStatusColor(latestCompliance.error_rate_status)}`}>
                          <p className="text-gray-400 mb-1">Error Rate</p>
                          <p className="font-bold">{latestCompliance.actual_error_rate.toFixed(2)}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}