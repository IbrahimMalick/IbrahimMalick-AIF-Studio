import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle2,
  Activity,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdOptimizationEngine({ campaignRun, user }) {
  const queryClient = useQueryClient();
  const [autoOptimize, setAutoOptimize] = useState(campaignRun?.auto_optimize_enabled || true);

  const { data: optimizationLogs = [] } = useQuery({
    queryKey: ["adOptimizationLogs", campaignRun?.id],
    queryFn: () => base44.entities.AdOptimizationLog.filter({
      campaign_run_id: campaignRun.id
    }, "-created_date", 20),
    enabled: !!campaignRun,
  });

  const { data: adVariants = [] } = useQuery({
    queryKey: ["adVariants", campaignRun?.id],
    queryFn: () => base44.entities.AdVariant.filter({
      campaign_run_id: campaignRun.id
    }),
    enabled: !!campaignRun,
  });

  // Run optimization manually
  const runOptimizationMutation = useMutation({
    mutationFn: async () => {
      const actions = [];

      // Rule 1: Pause low performers
      for (const variant of adVariants) {
        const metrics = variant.metrics_snapshot || {};
        
        if (metrics.impressions > 1000) {
          // Pause if CTR < 0.6% AND CPC > $2.50
          if (metrics.ctr < 0.6 && metrics.cpc > 250) {
            await base44.entities.AdVariant.update(variant.id, {
              state: "PAUSED",
              paused_by_ai: true,
              pause_reason: "Low CTR + High CPC"
            });

            await base44.entities.AdOptimizationLog.create({
              campaign_run_id: campaignRun.id,
              action: "PAUSE_VARIANT",
              action_target: variant.id,
              reason: `CTR ${metrics.ctr}% < 0.6% AND CPC $${(metrics.cpc / 100).toFixed(2)} > $2.50`,
              trigger_rule: "low_ctr_high_cpc",
              metric_before: metrics,
              automated: true
            });

            actions.push({ type: "PAUSE", variant: variant.variant_name, reason: "Low CTR + High CPC" });
          }

          // Pause if CPA too high (after 3+ conversions)
          if (metrics.conversions >= 3 && metrics.cpa > campaignRun.guardrails?.max_cpa) {
            await base44.entities.AdVariant.update(variant.id, {
              state: "PAUSED",
              paused_by_ai: true,
              pause_reason: "CPA exceeds guardrail"
            });

            await base44.entities.AdOptimizationLog.create({
              campaign_run_id: campaignRun.id,
              action: "PAUSE_VARIANT",
              action_target: variant.id,
              reason: `CPA $${(metrics.cpa / 100).toFixed(2)} > Max $${(campaignRun.guardrails.max_cpa / 100).toFixed(2)}`,
              trigger_rule: "high_cpa",
              metric_before: metrics,
              automated: true
            });

            actions.push({ type: "PAUSE", variant: variant.variant_name, reason: "CPA too high" });
          }
        }

        // Rule 2: Scale winners
        if (metrics.conversions >= 5 && metrics.roas >= (campaignRun.guardrails?.min_roas || 2.0)) {
          const currentBudget = campaignRun.daily_budget_cents;
          const newBudget = Math.min(currentBudget * 1.2, campaignRun.guardrails?.max_daily_spend || currentBudget * 1.6);
          
          if (newBudget > currentBudget) {
            await base44.entities.CampaignRun.update(campaignRun.id, {
              daily_budget_cents: newBudget
            });

            await base44.entities.AdOptimizationLog.create({
              campaign_run_id: campaignRun.id,
              action: "SCALE_BUDGET",
              action_target: variant.id,
              reason: `ROAS ${metrics.roas.toFixed(2)}x >= ${campaignRun.guardrails.min_roas}x with ${metrics.conversions} conversions`,
              trigger_rule: "scale_winner",
              metric_before: { budget: currentBudget },
              metric_after: { budget: newBudget },
              automated: true
            });

            actions.push({ 
              type: "SCALE", 
              variant: variant.variant_name, 
              from: `$${currentBudget / 100}`, 
              to: `$${newBudget / 100}` 
            });
          }

          // Mark as winner
          await base44.entities.AdVariant.update(variant.id, { is_winner: true });
        }
      }

      // Update last optimization time
      await base44.entities.CampaignRun.update(campaignRun.id, {
        last_optimized: new Date().toISOString()
      });

      queryClient.invalidateQueries(["adVariants"]);
      queryClient.invalidateQueries(["adOptimizationLogs"]);
      queryClient.invalidateQueries(["campaignRuns"]);

      return actions;
    },
    onSuccess: (actions) => {
      if (actions.length > 0) {
        alert(`✅ Optimization complete! ${actions.length} actions taken.`);
      } else {
        alert("✅ All ads performing within targets. No changes needed.");
      }
    }
  });

  const getActionIcon = (action) => {
    const icons = {
      PAUSE_VARIANT: Pause,
      ACTIVATE_VARIANT: Play,
      SCALE_BUDGET: TrendingUp,
      REDUCE_BUDGET: TrendingDown,
      SWAP_CREATIVE: RefreshCw
    };
    return icons[action] || Activity;
  };

  const getActionColor = (action) => {
    const colors = {
      PAUSE_VARIANT: "text-red-400",
      ACTIVATE_VARIANT: "text-green-400",
      SCALE_BUDGET: "text-green-400",
      REDUCE_BUDGET: "text-yellow-400",
      SWAP_CREATIVE: "text-blue-400"
    };
    return colors[action] || "text-gray-400";
  };

  return (
    <div className="space-y-6">
      
      {/* Auto-Optimization Control */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FFD700]" />
                AI Optimization Autopilot
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">
                Automatically optimize campaigns every {campaignRun?.optimization_frequency_hours || 6} hours
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={autoOptimize}
                onCheckedChange={setAutoOptimize}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={`text-sm font-semibold ${autoOptimize ? 'text-green-400' : 'text-gray-500'}`}>
                {autoOptimize ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1">OPTIMIZATION RULES</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Pause if CTR &lt; 0.6% &amp; CPC &gt; $2.50 (after 1K impressions)</li>
                <li>• Pause if CPA &gt; ${(campaignRun?.guardrails?.max_cpa || 5000) / 100} (after 3 conversions)</li>
                <li>• Scale +20% if ROAS ≥ {campaignRun?.guardrails?.min_roas || 2}x (max +60%/day)</li>
                <li>• Rotate new variant if 2+ paused in 24h</li>
              </ul>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1">GUARDRAILS</p>
              <div className="space-y-1 text-xs">
                <p className="text-gray-300">Max CPA: <span className="text-[#FFD700]">${(campaignRun?.guardrails?.max_cpa || 5000) / 100}</span></p>
                <p className="text-gray-300">Min ROAS: <span className="text-[#00D4C9]">{campaignRun?.guardrails?.min_roas || 2.0}x</span></p>
                <p className="text-gray-300">Max Daily Spend: <span className="text-[#FF8C00]">${(campaignRun?.guardrails?.max_daily_spend || 10000) / 100}</span></p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => runOptimizationMutation.mutate()}
            disabled={runOptimizationMutation.isLoading}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
          >
            {runOptimizationMutation.isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Optimization Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ad Variants Performance */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Variant Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adVariants.map((variant) => {
              const metrics = variant.metrics_snapshot || {};
              return (
                <div key={variant.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold">{variant.variant_name}</h4>
                        <Badge className={
                          variant.state === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                          variant.state === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>
                          {variant.state}
                        </Badge>
                        {variant.is_winner && (
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                            🏆 Winner
                          </Badge>
                        )}
                      </div>
                      {variant.pause_reason && (
                        <p className="text-gray-500 text-xs">Paused: {variant.pause_reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">Impressions</p>
                      <p className="text-white font-bold text-sm">{metrics.impressions?.toLocaleString() || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">Clicks</p>
                      <p className="text-white font-bold text-sm">{metrics.clicks || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">CTR</p>
                      <p className={`font-bold text-sm ${metrics.ctr >= 1 ? 'text-green-400' : metrics.ctr >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {metrics.ctr?.toFixed(2) || 0}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">CPC</p>
                      <p className="text-white font-bold text-sm">${(metrics.cpc / 100 || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">Spend</p>
                      <p className="text-red-400 font-bold text-sm">${(metrics.spend_cents / 100 || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">Conv.</p>
                      <p className="text-white font-bold text-sm">{metrics.conversions || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">CPA</p>
                      <p className="text-white font-bold text-sm">${(metrics.cpa / 100 || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-[#111317] rounded">
                      <p className="text-gray-500 text-xs mb-1">ROAS</p>
                      <p className={`font-bold text-sm ${metrics.roas >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {metrics.roas?.toFixed(2) || 0}x
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {adVariants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No ad variants found for this campaign</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Log */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D4C9]" />
            Optimization Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {optimizationLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-[#111317] flex items-center justify-center ${getActionColor(log.action)}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold text-sm">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          {log.automated ? 'AI Autopilot' : 'Manual'}
                        </Badge>
                        {new Date(log.created_date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) && (
                          <span className="text-gray-500 text-xs">
                            {new Date(log.created_date).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{log.reason}</p>
                      {log.trigger_rule && (
                        <p className="text-gray-600 text-xs mt-1">Rule: {log.trigger_rule}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {optimizationLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No optimization actions yet</p>
                <p className="text-xs mt-1">Run optimization to see AI actions here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}