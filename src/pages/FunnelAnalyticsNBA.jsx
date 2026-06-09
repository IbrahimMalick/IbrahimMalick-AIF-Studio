import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Zap,
  Target,
  Loader2,
  RefreshCw,
  Eye,
  MousePointer,
  Users,
  Phone,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function FunnelAnalyticsNBA() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nbaSuggestions, setNbaSuggestions] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: funnelRuns = [] } = useQuery({
    queryKey: ["funnelRuns", user?.email],
    queryFn: () => base44.entities.FunnelRun.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const { data: existingSuggestions = [] } = useQuery({
    queryKey: ["nbaSuggestions", user?.email],
    queryFn: () => base44.entities.NBASuggestion.filter({ user_email: user.email }, "-created_date", 20),
    enabled: !!user
  });

  const analyzeNBAMutation = useMutation({
    mutationFn: async (funnelRunId) => {
      setIsAnalyzing(true);

      const funnel = funnelRuns.find(f => f.id === funnelRunId);
      if (!funnel) throw new Error("Funnel not found");

      // AI-powered next-best-action analysis
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a funnel optimizer. Given step metrics, propose prioritized fixes with impact/effort scores.

FUNNEL: ${funnel.funnel_name}
STATUS: ${funnel.status}

CURRENT METRICS:
- Ad CTR: ${funnel.metrics?.ad_ctr || 0}%
- Landing Page CVR: ${funnel.metrics?.lp_cvr || 0}%
- Opt-in → Booking: ${funnel.metrics?.opt_in_to_booking || 0}%
- Show Rate: ${funnel.metrics?.show_rate || 0}%
- Close Rate: ${funnel.metrics?.close_rate || 0}%
- Total Spend: $${funnel.metrics?.spend || 0}
- Total Revenue: $${funnel.metrics?.revenue || 0}
- ROAS: ${funnel.metrics?.roas || 0}x

CONSTRAINTS:
- Budget: $${funnel.daily_budget}/day
- Platforms: ${funnel.platforms?.join(', ')}
- Current Status: ${funnel.status}

ANALYZE EACH FUNNEL STEP:

1. AD PERFORMANCE (CTR):
   - Is CTR acceptable? (>2% = good, 1-2% = okay, <1% = poor)
   - If low: Why? (targeting, creative, hook, offer)
   - Fix: Specific action to improve

2. LANDING PAGE (CVR):
   - Is CVR acceptable? (>20% = great, 10-20% = good, <10% = needs work)
   - If low: Why? (proof, design, copy, CTA)
   - Fix: Specific changes to make

3. OPT-IN TO BOOKING:
   - Conversion from lead to scheduled call
   - If low: Why? (friction, trust, perceived value)
   - Fix: Specific improvements

4. SHOW RATE:
   - Do people show up to calls?
   - If low: Why? (commitment, reminders, qualification)
   - Fix: Reminder strategy, requalification

5. CLOSE RATE:
   - Sales conversion on calls
   - If low: Why? (objections, price, offer clarity)
   - Fix: Sales process or offer improvements

PROVIDE TOP 5 RECOMMENDATIONS:

For each recommendation:
- Issue: What's not working
- Hypothesis: Why it's not working
- Expected Gain: % improvement (realistic, e.g., "+15% means 15% relative improvement)
- Effort: low/medium/high (implementation difficulty)
- Actionable Step: Specific, concrete action to take NOW
- Priority: 1-5 (1 = do first)
- Category: ad_creative, targeting, landing_page, follow_up, pricing, offer

Focus on highest impact/lowest effort wins first.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  hypothesis: { type: "string" },
                  expected_gain: { type: "number" },
                  effort: { type: "string" },
                  actionable_step: { type: "string" },
                  priority: { type: "number" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save suggestions to database
      const savedSuggestions = await Promise.all(
        analysis.recommendations.map(rec =>
          base44.entities.NBASuggestion.create({
            user_email: user.email,
            funnel_run_id: funnelRunId,
            issue: rec.issue,
            hypothesis: rec.hypothesis,
            expected_gain: rec.expected_gain,
            effort: rec.effort,
            actionable_step: rec.actionable_step,
            priority: rec.priority,
            category: rec.category
          })
        )
      );

      setNbaSuggestions(savedSuggestions);
      setIsAnalyzing(false);
      return savedSuggestions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["nbaSuggestions"]);
      alert("✅ Next-Best-Action analysis complete!");
    }
  });

  const acceptSuggestionMutation = useMutation({
    mutationFn: async (suggestionId) => {
      await base44.entities.NBASuggestion.update(suggestionId, {
        accepted: true,
        applied_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["nbaSuggestions"]);
      alert("✅ Suggestion accepted! Track results in the dashboard.");
    }
  });

  const effortColors = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400"
  };

  const categoryIcons = {
    ad_creative: Zap,
    targeting: Target,
    landing_page: Eye,
    follow_up: Phone,
    pricing: DollarSign,
    offer: CheckCircle2
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-[#FFD700]" />
            Analytics → Next Best Action
          </h1>
          <p className="text-gray-400">AI-powered funnel optimization with prioritized recommendations</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Funnel Selection */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Select Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <Select
                value={selectedFunnel?.id || ""}
                onValueChange={(value) => {
                  const funnel = funnelRuns.find(f => f.id === value);
                  setSelectedFunnel(funnel);
                  setNbaSuggestions([]);
                }}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue placeholder="Choose a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {funnelRuns.map(funnel => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.funnel_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedFunnel && (
                <>
                  <div className="p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Current Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Ad CTR</span>
                        <span className="text-white font-bold">{selectedFunnel.metrics?.ad_ctr?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">LP CVR</span>
                        <span className="text-white font-bold">{selectedFunnel.metrics?.lp_cvr?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Booking Rate</span>
                        <span className="text-white font-bold">{selectedFunnel.metrics?.opt_in_to_booking?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Show Rate</span>
                        <span className="text-white font-bold">{selectedFunnel.metrics?.show_rate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Close Rate</span>
                        <span className="text-white font-bold">{selectedFunnel.metrics?.close_rate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <span className="text-gray-400">ROAS</span>
                        <span className={`font-bold ${
                          (selectedFunnel.metrics?.roas || 0) >= 3 ? 'text-green-400' :
                          (selectedFunnel.metrics?.roas || 0) >= 2 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {selectedFunnel.metrics?.roas?.toFixed(1) || 0}x
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => analyzeNBAMutation.mutate(selectedFunnel.id)}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-bold h-12"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Get NBA
                      </>
                    )}
                  </Button>
                </>
              )}

            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="lg:col-span-2 space-y-4">
            {nbaSuggestions.length > 0 ? (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#FFD700]" />
                    Next-Best-Actions ({nbaSuggestions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {nbaSuggestions.map((suggestion, idx) => {
                    const CategoryIcon = categoryIcons[suggestion.category] || Target;
                    const isPriorityHigh = suggestion.priority <= 2;

                    return (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border-2 ${
                          isPriorityHigh
                            ? 'bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30'
                            : 'bg-[#0B0B0C] border-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          
                          {/* Priority Badge */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            suggestion.priority === 1 ? 'bg-red-500/20' :
                            suggestion.priority === 2 ? 'bg-orange-500/20' :
                            suggestion.priority === 3 ? 'bg-yellow-500/20' :
                            'bg-gray-500/20'
                          }`}>
                            <span className={`font-bold ${
                              suggestion.priority === 1 ? 'text-red-400' :
                              suggestion.priority === 2 ? 'text-orange-400' :
                              suggestion.priority === 3 ? 'text-yellow-400' :
                              'text-gray-400'
                            }`}>
                              {suggestion.priority}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-white font-bold text-lg mb-1">{suggestion.issue}</h4>
                                <div className="flex gap-2 mb-2">
                                  <Badge className={effortColors[suggestion.effort]}>
                                    {suggestion.effort} effort
                                  </Badge>
                                  <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                                    <CategoryIcon className="w-3 h-3 mr-1" />
                                    {suggestion.category.replace(/_/g, ' ')}
                                  </Badge>
                                  <Badge className="bg-green-500/20 text-green-400">
                                    +{suggestion.expected_gain}%
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-3">
                              <strong className="text-gray-300">Why:</strong> {suggestion.hypothesis}
                            </p>

                            <div className="p-3 bg-[#111317] rounded-lg mb-3">
                              <p className="text-[#00D4C9] text-sm font-semibold mb-1">✅ Action Step:</p>
                              <p className="text-white text-sm">{suggestion.actionable_step}</p>
                            </div>

                            <div className="flex gap-2">
                              {!suggestion.accepted && (
                                <Button
                                  size="sm"
                                  onClick={() => acceptSuggestionMutation.mutate(suggestion.id)}
                                  className="bg-green-500 text-white rounded-lg"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Accept & Track
                                </Button>
                              )}
                              {suggestion.accepted && (
                                <Badge className="bg-green-500/20 text-green-400">
                                  ✓ Accepted - {new Date(suggestion.applied_at).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>

                            {/* Result Impact (if tracked) */}
                            {suggestion.result_impact && (
                              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="text-green-400 text-xs font-semibold mb-1">📊 Results:</p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <p className="text-gray-400">Before</p>
                                    <p className="text-white font-bold">{suggestion.result_impact.metric_before}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">After</p>
                                    <p className="text-white font-bold">{suggestion.result_impact.metric_after}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Gain</p>
                                    <p className="text-green-400 font-bold">
                                      +{suggestion.result_impact.actual_gain_percentage}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">No analysis yet</p>
                  <p className="text-gray-500 text-sm">
                    Select a funnel and click "Get NBA" to receive AI-powered optimization recommendations
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

        </div>

        {/* Recent Suggestions */}
        {existingSuggestions.length > 0 && !nbaSuggestions.length && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {existingSuggestions.slice(0, 6).map((suggestion) => (
                  <div key={suggestion.id} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <p className="text-white text-sm font-medium mb-1">{suggestion.issue}</p>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">{suggestion.actionable_step}</p>
                    <div className="flex gap-2">
                      <Badge className={effortColors[suggestion.effort]}>
                        {suggestion.effort}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400">
                        +{suggestion.expected_gain}%
                      </Badge>
                      {suggestion.accepted && (
                        <Badge className="bg-blue-500/20 text-blue-400">Applied</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}