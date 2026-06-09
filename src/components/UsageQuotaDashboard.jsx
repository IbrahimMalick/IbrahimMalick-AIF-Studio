import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function UsageQuotaDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await base44.functions.invoke('getUsageMetrics', {});
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-gray-400">Loading usage metrics...</div>;
  if (!metrics) return <div className="text-gray-400">No usage data</div>;

  const renderUsageBar = (label, data, icon) => {
    const isWarning = data.percent >= 80;
    const isError = data.percent >= 100;

    return (
      <motion.div
        key={label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-[#111317] border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
              <Badge className={
                isError ? 'bg-red-500/20 text-red-400' :
                isWarning ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }>
                {data.percent}%
              </Badge>
            </div>
            <Progress value={Math.min(data.percent, 100)} className="h-2" />
            <p className="text-xs text-gray-400 mt-2">
              {data.used.toLocaleString()} / {data.limit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Usage & Quotas</h3>
          <p className="text-xs text-gray-400">
            Tier: <span className="text-orange-400 font-semibold">{metrics.tier}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Estimated Cost</p>
          <p className="text-lg font-bold text-orange-400">${metrics.cost_usd.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {renderUsageBar('LLM Tokens', metrics.usage.llm_tokens, <Zap className="w-4 h-4 text-cyan-400" />)}
        {renderUsageBar('API Calls', metrics.usage.api_calls, <TrendingUp className="w-4 h-4 text-purple-400" />)}
        {renderUsageBar('Agents Created', metrics.usage.agents, <Zap className="w-4 h-4 text-blue-400" />)}
        {renderUsageBar('Storage (MB)', metrics.usage.storage_mb, <TrendingUp className="w-4 h-4 text-green-400" />)}
      </div>

      {metrics.usage.llm_tokens.percent >= 80 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">Approaching quota limits</p>
            <p className="text-xs text-gray-400 mt-1">Consider upgrading your plan to avoid service interruption.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}