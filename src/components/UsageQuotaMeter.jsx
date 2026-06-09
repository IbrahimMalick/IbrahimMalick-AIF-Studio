import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

export default function UsageQuotaMeter({ used, limit, period = "daily", label = "Workflow Runs", showDetails = true }) {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const remaining = Math.max(0, limit - used);
  
  const getStatusColor = () => {
    if (percentage >= 90) return { bg: "bg-red-500", text: "text-red-400", icon: AlertTriangle };
    if (percentage >= 75) return { bg: "bg-yellow-500", text: "text-yellow-400", icon: TrendingUp };
    return { bg: "bg-green-500", text: "text-green-400", icon: CheckCircle2 };
  };

  const status = getStatusColor();
  const Icon = status.icon;

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${status.text}`} />
        <span className="text-gray-300 text-sm">
          {used}/{limit} {period}
        </span>
      </div>
    );
  }

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${status.text}`} />
            <div>
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-gray-500 text-xs capitalize">{period} limit</p>
            </div>
          </div>
          <Badge className={`${status.bg}/20 ${status.text}`}>
            {percentage.toFixed(0)}%
          </Badge>
        </div>

        <Progress value={percentage} className="h-2 mb-2" />

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {used.toLocaleString()} used
          </span>
          <span className={percentage >= 90 ? status.text : "text-gray-400"}>
            {remaining.toLocaleString()} remaining
          </span>
        </div>

        {percentage >= 90 && (
          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
            ⚠️ Approaching {period} limit! Consider upgrading your plan.
          </div>
        )}
      </CardContent>
    </Card>
  );
}