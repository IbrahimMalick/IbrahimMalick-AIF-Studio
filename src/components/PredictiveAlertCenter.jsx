import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function PredictiveAlertCenter() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['predictive-alerts'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const response = await base44.entities.PredictiveAlert.filter({
          user_email: user.email,
          is_acknowledged: false
        }, '-confidence_percent', 20);
        return response || [];
      } catch {
        return [];
      }
    },
    refetchInterval: 60000
  });

  const severityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const severityIcons = {
    low: <AlertCircle className="w-5 h-5" />,
    medium: <AlertTriangle className="w-5 h-5" />,
    high: <AlertTriangle className="w-5 h-5" />,
    critical: <AlertTriangle className="w-5 h-5" />
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Predictive Alerts</h3>
        {alerts.length > 0 && (
          <Badge className="bg-red-500/20 text-red-400 animate-pulse">
            {alerts.length} Active
          </Badge>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <Card className="bg-[#0B0B0C] border-green-500/30">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-green-400 font-semibold">No Predictive Alerts</p>
            <p className="text-gray-400 text-sm mt-2">All systems operating within expected parameters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const daysUntil = Math.ceil(
              (new Date(alert.predicted_date) - new Date()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border ${severityColors[alert.severity]}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${severityColors[alert.severity]}`}>
                        {severityIcons[alert.severity]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white capitalize">
                            {alert.alert_type.replace(/_/g, ' ')}
                          </h4>
                          <Badge className={severityColors[alert.severity]}>
                            {alert.severity}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            {alert.confidence_percent}% confidence
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-300 mb-2">
                          {alert.recommendation}
                        </p>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400">Metric</p>
                            <p className="text-cyan-400 font-mono">{alert.metric_name}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Current</p>
                            <p className="text-white font-mono">{alert.current_value?.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Predicted</p>
                            <p className="text-orange-400 font-mono">{alert.predicted_value?.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          Predicted in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                        </div>
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