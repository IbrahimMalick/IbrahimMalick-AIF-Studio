import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Database, Zap, BarChart3 } from "lucide-react";

export default function DatabaseMetrics() {
  const metrics = [
    {
      label: "Active Connections",
      value: "24",
      icon: Database,
      color: "text-blue-400"
    },
    {
      label: "Avg Query Time",
      value: "42ms",
      icon: Zap,
      color: "text-green-400"
    },
    {
      label: "Cache Hit Rate",
      value: "76%",
      icon: TrendingUp,
      color: "text-purple-400"
    },
    {
      label: "Indexed Queries",
      value: "94%",
      icon: BarChart3,
      color: "text-orange-400"
    }
  ];

  const optimizations = [
    { entity: "UsageMetrics", index: "user_email, period_start", improvement: "65%" },
    { entity: "AuditLog", index: "user_email, action, created_date", improvement: "48%" },
    { entity: "BackgroundJob", index: "status, priority", improvement: "52%" },
    { entity: "CacheEntry", index: "cache_key, expires_at", improvement: "71%" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="bg-[#0B0B0C] border-gray-800">
              <CardContent className="p-4">
                <Icon className={`w-6 h-6 mb-2 ${metric.color}`} />
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-gray-400">{metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-[#0B0B0C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400 text-sm">Active Optimizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizations.map((opt, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div>
                  <p className="font-semibold text-white text-sm">{opt.entity}</p>
                  <p className="text-xs text-gray-400">{opt.index}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  +{opt.improvement} faster
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}