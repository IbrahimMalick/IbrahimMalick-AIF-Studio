import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Flag, Zap, Users, AlertTriangle, CheckCircle2, TrendingUp, Settings } from "lucide-react";

export default function FeatureFlagsPanel({ userEmail }) {
  const queryClient = useQueryClient();
  const [selectedFlag, setSelectedFlag] = useState(null);

  const { data: flags = [] } = useQuery({
    queryKey: ["featureFlags"],
    queryFn: () => base44.entities.FeatureFlag.list(),
    initialData: []
  });

  const updateFlagMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureFlag.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["featureFlags"]);
    }
  });

  const createFlagMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureFlag.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["featureFlags"]);
      setSelectedFlag(null);
    }
  });

  const [newFlag, setNewFlag] = useState({
    flag_key: "",
    flag_name: "",
    description: "",
    rollout_percentage: 0,
    is_enabled: false
  });

  const handleRolloutChange = (flag, percentage) => {
    updateFlagMutation.mutate({
      id: flag.id,
      data: { rollout_percentage: percentage }
    });
  };

  const handleToggle = (flag, enabled) => {
    updateFlagMutation.mutate({
      id: flag.id,
      data: { is_enabled: enabled }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0B0B0C] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <Flag className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">{flags.length}</p>
            <p className="text-gray-500 text-xs">Total Flags</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0B0B0C] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">
              {flags.filter(f => f.is_enabled).length}
            </p>
            <p className="text-gray-500 text-xs">Active</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0B0B0C] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-white">
              {flags.filter(f => f.rollout_percentage > 0 && f.rollout_percentage < 100).length}
            </p>
            <p className="text-gray-500 text-xs">Gradual Rollout</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0B0B0C] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-white">
              {Math.round(flags.reduce((sum, f) => sum + (f.rollout_percentage || 0), 0) / Math.max(flags.length, 1))}%
            </p>
            <p className="text-gray-500 text-xs">Avg Rollout</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags List */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-[#FFD700]" />
            Feature Flags & Canary Releases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          
          {flags.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm mb-4">No feature flags configured</p>
              <p className="text-gray-500 text-xs mb-4">
                Feature flags enable gradual rollouts, A/B testing, and safe deployments
              </p>
            </div>
          ) : (
            flags.map((flag) => {
              const rollout = flag.rollout_percentage || 0;
              const isFullRollout = rollout === 100;
              const isCanary = rollout > 0 && rollout < 100;
              const isDisabled = rollout === 0 || !flag.is_enabled;

              return (
                <div key={flag.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold">{flag.flag_name}</p>
                        {isCanary && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            Canary {rollout}%
                          </Badge>
                        )}
                        {isFullRollout && flag.is_enabled && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            Live 100%
                          </Badge>
                        )}
                        {isDisabled && (
                          <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{flag.description || "No description"}</p>
                      <code className="text-gray-500 text-xs font-mono bg-black px-2 py-1 rounded">
                        {flag.flag_key}
                      </code>
                    </div>

                    <Switch
                      checked={flag.is_enabled}
                      onCheckedChange={(checked) => handleToggle(flag, checked)}
                    />
                  </div>

                  {flag.is_enabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Rollout Percentage</span>
                        <span className={rollout >= 90 ? "text-green-400" : "text-yellow-400"}>
                          {rollout}%
                        </span>
                      </div>
                      <Progress value={rollout} className="h-2" />
                      
                      <div className="flex gap-2 mt-3">
                        {[5, 10, 25, 50, 75, 100].map(percent => (
                          <Button
                            key={percent}
                            size="sm"
                            variant={rollout === percent ? "default" : "outline"}
                            onClick={() => handleRolloutChange(flag, percent)}
                            className={`text-xs ${
                              rollout === percent 
                                ? "bg-[#FFD700] text-black"
                                : "border-gray-700 text-gray-400 hover:bg-gray-800"
                            }`}
                          >
                            {percent}%
                          </Button>
                        ))}
                      </div>

                      {isCanary && (
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Gradual rollout active - monitor error rates before scaling to 100%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Feature Flag Best Practices
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">🎯 Canary Strategy</p>
              <p className="text-gray-300 text-xs">
                Start at 5-10% → Monitor errors → Scale to 25% → 50% → 100% over days
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">⚠️ Error Threshold</p>
              <p className="text-gray-300 text-xs">
                If error rate {'>'} 1%, pause rollout and investigate before continuing
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">📊 Monitor Metrics</p>
              <p className="text-gray-300 text-xs">
                Watch queue depth, DLQ, latency, and user feedback during rollout
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}