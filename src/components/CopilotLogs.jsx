import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Undo,
  Eye,
  DollarSign,
  Zap,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";

export default function CopilotLogs({ user }) {
  const queryClient = useQueryClient();

  const { data: actions = [] } = useQuery({
    queryKey: ["copilotActions", user?.email],
    queryFn: () => base44.entities.CopilotAction.filter({
      user_email: user.email
    }, "-created_date", 100),
    enabled: !!user,
  });

  const undoActionMutation = useMutation({
    mutationFn: async (actionId) => {
      const action = actions.find(a => a.id === actionId);
      
      // Delete created entity if exists
      if (action.entity_created_id && action.entity_created_type) {
        try {
          await base44.entities[action.entity_created_type].delete(action.entity_created_id);
        } catch (error) {
          console.log("Entity may already be deleted:", error);
        }
      }

      // Mark action as cancelled
      await base44.entities.CopilotAction.update(actionId, {
        status: "cancelled"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["copilotActions"]);
      alert("✅ Action undone successfully!");
    }
  });

  const getStatusBadge = (status) => {
    const badges = {
      queued: { color: "bg-gray-500/20 text-gray-400", icon: Clock, label: "Queued" },
      running: { color: "bg-yellow-500/20 text-yellow-400", icon: Loader2, label: "Running" },
      success: { color: "bg-green-500/20 text-green-400", icon: CheckCircle2, label: "Success" },
      failed: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Failed" },
      cancelled: { color: "bg-orange-500/20 text-orange-400", icon: XCircle, label: "Cancelled" },
      pending_confirmation: { color: "bg-blue-500/20 text-blue-400", icon: Clock, label: "Pending" }
    };
    return badges[status] || badges.queued;
  };

  const getPersonalityBadge = (personality) => {
    const badges = {
      mentor: { emoji: "🧘", color: "bg-blue-500/20 text-blue-400" },
      hustler: { emoji: "⚡", color: "bg-yellow-500/20 text-yellow-400" },
      analyst: { emoji: "🧠", color: "bg-purple-500/20 text-purple-400" },
      creator: { emoji: "🎨", color: "bg-pink-500/20 text-pink-400" }
    };
    return badges[personality] || badges.mentor;
  };

  const totalCost = actions.reduce((sum, a) => sum + (a.cost_usd || 0), 0);
  const totalActions = actions.length;
  const successRate = totalActions > 0 
    ? ((actions.filter(a => a.status === 'success').length / totalActions) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-[#00D4C9]" />
            <p className="text-2xl font-bold text-white">{totalActions}</p>
            <p className="text-xs text-gray-400">Total Actions</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">{successRate}%</p>
            <p className="text-xs text-gray-400">Success Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-[#FFD700]" />
            <p className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</p>
            <p className="text-xs text-gray-400">AI Cost</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-[#FF8C00]" />
            <p className="text-2xl font-bold text-white">
              {actions.filter(a => a.mode === 'proactive').length}
            </p>
            <p className="text-xs text-gray-400">Proactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Log */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D4C9]" />
            All Copilot Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {actions.map((action) => {
              const statusBadge = getStatusBadge(action.status);
              const StatusIcon = statusBadge.icon;
              const personalityBadge = getPersonalityBadge(action.personality);

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#111317] flex items-center justify-center flex-shrink-0">
                      <StatusIcon className={`w-5 h-5 ${action.status === 'running' ? 'animate-spin' : ''}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold text-sm truncate">
                          {action.command}
                        </p>
                        <Badge className={statusBadge.color}>
                          {statusBadge.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          {action.intent?.replace(/_/g, ' ')}
                        </Badge>
                        {action.personality && (
                          <Badge className={`${personalityBadge.color} text-xs`}>
                            {personalityBadge.emoji} {action.personality}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${
                          action.mode === 'proactive' ? 'bg-green-500/20 text-green-400' :
                          action.mode === 'planner' ? 'bg-purple-500/20 text-purple-400' :
                          action.mode === 'analyst' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {action.mode}
                        </Badge>
                        {action.confidence && (
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                            {(action.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-500 text-xs mb-2">
                        {new Date(action.created_date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {action.execution_time_ms && (
                          <span className="ml-2">
                            • {(action.execution_time_ms / 1000).toFixed(1)}s
                          </span>
                        )}
                        {action.cost_usd && (
                          <span className="ml-2 text-[#FFD700]">
                            • ${action.cost_usd.toFixed(4)}
                          </span>
                        )}
                      </p>

                      {action.entity_created_type && (
                        <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg mb-2">
                          <p className="text-green-400 text-xs">
                            ✓ Created: {action.entity_created_type}
                            {action.entity_created_id && (
                              <span className="text-gray-400 ml-1">#{action.entity_created_id.slice(0, 8)}</span>
                            )}
                          </p>
                        </div>
                      )}

                      {action.error && (
                        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg mb-2">
                          <p className="text-red-400 text-xs">
                            ✗ Error: {action.error.message}
                          </p>
                        </div>
                      )}

                      {action.suggested_next_actions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {action.suggested_next_actions.slice(0, 2).map((suggestion, idx) => (
                            <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                              💡 {suggestion}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {action.status === 'success' && action.entity_created_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => undoActionMutation.mutate(action.id)}
                        disabled={undoActionMutation.isLoading}
                        className="text-orange-400 hover:text-orange-300"
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {actions.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No copilot actions yet</p>
                <p className="text-gray-500 text-sm">Start giving commands to see activity here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}