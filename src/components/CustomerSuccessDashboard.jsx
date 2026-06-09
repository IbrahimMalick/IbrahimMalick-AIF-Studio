import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Activity,
  Target,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerSuccessDashboard({ user }) {
  const [healthScore, setHealthScore] = useState(null);

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["recentActivity", user?.email],
    queryFn: () => base44.entities.ActivityLog.filter({
      user_email: user.email
    }, "-created_date", 10),
    enabled: !!user?.email
  });

  const { data: usageStats } = useQuery({
    queryKey: ["usageStats", user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UsageTracking.filter({
        user_email: user.email
      }, "-period_start", 1);
      return stats[0] || null;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (!user) return;

    const calculateHealthScore = async () => {
      const scores = await base44.entities.CustomerHealthScore.filter({
        user_email: user.email
      }, "-last_calculated", 1);

      if (scores.length > 0) {
        setHealthScore(scores[0]);
      } else {
        const mockScore = {
          overall_score: 75,
          score_category: "healthy",
          trend: "improving",
          factors: {
            login_frequency: 85,
            feature_adoption: 70,
            support_tickets: 90,
            payment_status: "current",
            engagement_rate: 65
          },
          risk_indicators: [],
          recommended_actions: [
            {
              action: "Complete video tutorial series",
              priority: "medium",
              automated: false
            }
          ]
        };
        setHealthScore(mockScore);
      }
    };

    calculateHealthScore();
  }, [user]);

  if (!user || !healthScore) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "excellent": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "healthy": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "needs_attention": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "at_risk": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "declining": return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Health Score Card */}
      <Card className="bg-gradient-to-br from-[#111317] to-[#0B0B0C] border-[#FFD700]/20 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FFD700]" />
              Account Health Score
            </CardTitle>
            <Badge className={getCategoryColor(healthScore.score_category)}>
              {healthScore.score_category.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Overall Score */}
            <div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Overall Score</p>
                  <p className={`text-5xl font-bold ${getScoreColor(healthScore.overall_score)}`}>
                    {healthScore.overall_score}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(healthScore.trend)}
                  <span className="text-sm text-gray-400 capitalize">{healthScore.trend}</span>
                </div>
              </div>
              <Progress 
                value={healthScore.overall_score} 
                className="h-3"
              />
            </div>

            {/* Factor Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(healthScore.factors).map(([key, value]) => {
                if (key === 'payment_status') return null;
                
                return (
                  <div key={key} className="bg-[#0B0B0C] rounded-xl p-4 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-2 capitalize">
                      {key.replace('_', ' ')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-bold ${getScoreColor(value)}`}>
                        {value}%
                      </span>
                      <Progress value={value} className="w-16 h-2" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk Indicators */}
            {healthScore.risk_indicators?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-semibold mb-2">Action Required</p>
                    <ul className="space-y-1">
                      {healthScore.risk_indicators.map((risk, idx) => (
                        <li key={idx} className="text-sm text-red-300">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {healthScore.recommended_actions?.length > 0 && (
              <div>
                <p className="text-white font-semibold mb-3">Recommended Actions</p>
                <div className="space-y-2">
                  {healthScore.recommended_actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#00D4C9]" />
                        <span className="text-sm text-gray-300">{action.action}</span>
                      </div>
                      <Badge className={`text-xs ${
                        action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {action.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      {usageStats && (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Current Period Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "Videos Created",
                  used: usageStats.videos_created,
                  limit: usageStats.videos_limit,
                  icon: Users
                },
                {
                  label: "AI Images",
                  used: usageStats.ai_images_generated,
                  limit: usageStats.ai_images_limit,
                  icon: Target
                },
                {
                  label: "Storage",
                  used: usageStats.storage_used_mb,
                  limit: usageStats.storage_limit_mb,
                  icon: Activity,
                  suffix: "MB"
                }
              ].map((stat) => {
                const Icon = stat.icon;
                const percentage = (stat.used / stat.limit) * 100;
                const isNearLimit = percentage >= 80;
                
                return (
                  <div key={stat.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-sm text-gray-400">{stat.label}</span>
                      </div>
                      <span className={`text-sm font-semibold ${isNearLimit ? 'text-red-400' : 'text-white'}`}>
                        {stat.used.toLocaleString()}{stat.suffix || ''} / {stat.limit.toLocaleString()}{stat.suffix || ''}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isNearLimit ? 'bg-red-500/20' : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0B0C] border border-gray-800"
                >
                  <div className="w-2 h-2 rounded-full bg-[#00D4C9] mt-2" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium capitalize">
                      {activity.action_type.replace('_', ' ')}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(activity.created_date).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}