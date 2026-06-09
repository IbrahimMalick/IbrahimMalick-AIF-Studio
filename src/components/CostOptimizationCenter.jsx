import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, CheckCircle2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function CostOptimizationCenter() {
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['cost-recommendations'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('analyticsEngine', {
          action: 'optimize_costs'
        });
        return response.data.recommendations || [];
      } catch {
        return [];
      }
    }
  });

  const acceptMutation = useMutation({
    mutationFn: async (recommendation) => {
      const user = await base44.auth.me();
      return base44.entities.CostOptimization.create({
        user_email: user.email,
        recommendation_type: recommendation.recommendation_type,
        current_spend_monthly: recommendation.current_spend_monthly,
        projected_savings_monthly: recommendation.projected_savings_monthly,
        savings_percentage: recommendation.savings_percentage,
        implementation_effort: recommendation.implementation_effort,
        payback_days: recommendation.payback_days,
        description: recommendation.description,
        priority: recommendation.priority,
        status: 'accepted'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-recommendations'] });
    }
  });

  const effortColors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400'
  };

  const totalPotentialSavings = recommendations.reduce((sum, r) => sum + (r.projected_savings_monthly || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cost Optimization
        </h3>
        {totalPotentialSavings > 0 && (
          <Badge className="bg-green-500/20 text-green-400">
            Save ${totalPotentialSavings.toFixed(2)}/mo
          </Badge>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Analyzing opportunities...</p>
      ) : recommendations.length === 0 ? (
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No optimization opportunities detected</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-[#0B0B0C] border-green-500/30 hover:border-green-500/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white capitalize mb-2">
                        {rec.recommendation_type.replace(/_/g, ' ')}
                      </h4>

                      <p className="text-sm text-gray-300 mb-3">
                        {rec.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-400">Monthly Savings</p>
                          <p className="text-lg font-bold text-green-400">
                            ${rec.projected_savings_monthly?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Savings %</p>
                          <p className="text-lg font-bold text-green-400">
                            {rec.savings_percentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Effort</p>
                          <Badge className={effortColors[rec.implementation_effort]}>
                            {rec.implementation_effort}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Payback</p>
                          <p className="text-white">{rec.payback_days}d</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Priority</p>
                          <Badge className="bg-purple-500/20 text-purple-400">
                            #{rec.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        ROI within {rec.payback_days} days
                      </div>
                    </div>

                    <Button
                      onClick={() => acceptMutation.mutate(rec)}
                      disabled={acceptMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 whitespace-nowrap flex-shrink-0"
                    >
                      <TrendingDown className="w-4 h-4 mr-1" />
                      Implement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}