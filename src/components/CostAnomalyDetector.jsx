import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function CostAnomalyDetector() {
  const { data: anomalies = [], isLoading } = useQuery({
    queryKey: ['cost-anomalies'],
    queryFn: async () => {
      try {
        const response = await base44.entities.CostAnomaly.filter(
          { detected_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } },
          '-detected_at',
          50
        );
        return response;
      } catch {
        return [];
      }
    },
    refetchInterval: 60000
  });

  const unresolvedAnomalies = anomalies.filter(a => a.action_taken === 'none');
  const severityLevel = (deviation) => {
    if (deviation > 200) return { label: 'Critical', color: 'bg-red-500/20 text-red-400', icon: '🔴' };
    if (deviation > 100) return { label: 'High', color: 'bg-orange-500/20 text-orange-400', icon: '🟠' };
    return { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400', icon: '🟡' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Cost Anomalies</h3>
        {unresolvedAnomalies.length > 0 && (
          <Badge className="bg-red-500/20 text-red-400 animate-pulse">
            {unresolvedAnomalies.length} Unresolved
          </Badge>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading anomalies...</p>
      ) : anomalies.length === 0 ? (
        <Card className="bg-[#111317] border-green-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-green-400 text-sm">✓ No cost anomalies detected</p>
            <p className="text-gray-400 text-xs mt-2">Your spending is within expected ranges</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {anomalies.map((anomaly, idx) => {
            const severity = severityLevel(anomaly.deviation_percent);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`bg-[#0B0B0C] border-gray-800 ${
                  anomaly.action_taken === 'none' ? 'border-red-500/30' : 'border-green-500/30'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-1">{severity.icon}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{anomaly.user_email}</h4>
                          <Badge className={severity.color}>{severity.label}</Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {anomaly.detection_type}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-400">Expected Cost</p>
                            <p className="text-green-400 font-mono">${anomaly.expected_cost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Actual Cost</p>
                            <p className="text-red-400 font-mono">${anomaly.actual_cost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Deviation</p>
                            <p className="text-orange-400 font-mono">+{anomaly.deviation_percent}%</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-gray-500" />
                            <p className="text-xs text-gray-400">
                              Caused by: <span className="text-cyan-400">{anomaly.contributing_operation}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {anomaly.action_taken !== 'none' && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                ✓ {anomaly.action_taken}
                              </Badge>
                            )}
                            <Badge className={anomaly.alert_sent ? 'bg-blue-500/20 text-blue-400 text-xs' : 'bg-gray-500/20 text-gray-400 text-xs'}>
                              {anomaly.alert_sent ? '📧 Alert sent' : 'Silent'}
                            </Badge>
                          </div>
                        </div>

                        {anomaly.resolution_notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">Resolution: {anomaly.resolution_notes}</p>
                        )}
                      </div>
                    </div>
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