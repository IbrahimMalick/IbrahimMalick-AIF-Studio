import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Zap,
  DollarSign,
  TrendingUp,
  Sparkles,
  Loader2,
  History
} from "lucide-react";
import { motion } from "framer-motion";

export default function CommandTimeline({ user, limit = 10 }) {
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["copilotActions", user?.email],
    queryFn: () => base44.entities.CopilotAction.filter({ user_email: user.email }, "-created_date", limit),
    enabled: !!user
  });

  const intentIcons = {
    create_offer: Target,
    build_followup: Zap,
    ads_generate: Sparkles,
    funnel_deploy: TrendingUp,
    budget_plan: DollarSign
  };

  const statusColors = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pending_confirmation: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  };

  const statusIcons = {
    success: CheckCircle2,
    failed: XCircle,
    running: Loader2,
    pending_confirmation: Clock
  };

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-gray-600" />
        <p className="text-gray-500 text-xs">Loading history...</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-6">
        <History className="w-10 h-10 mx-auto mb-2 text-gray-600" />
        <p className="text-gray-400 text-sm">No commands yet</p>
        <p className="text-gray-500 text-xs mt-1">Your command history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((action, idx) => {
        const Icon = intentIcons[action.intent] || Target;
        const StatusIcon = statusIcons[action.status] || CheckCircle2;
        
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-3 rounded-lg border ${statusColors[action.status] || "bg-[#0B0B0C] border-gray-800"}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#111317] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#FFD700]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {action.command}
                  </p>
                  <StatusIcon className={`w-4 h-4 flex-shrink-0 ml-2 ${
                    action.status === "success" ? "text-green-400" :
                    action.status === "failed" ? "text-red-400" :
                    action.status === "running" ? "text-blue-400 animate-spin" :
                    "text-yellow-400"
                  }`} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-700 text-gray-300 text-xs">
                    {action.intent.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-gray-500 text-xs">
                    {new Date(action.created_date).toLocaleDateString()}
                  </span>
                </div>
                {action.entity_created_id && (
                  <p className="text-[#00D4C9] text-xs mt-1">
                    → Created {action.entity_created_type}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}