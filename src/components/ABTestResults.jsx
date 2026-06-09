import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  Sparkles,
  Loader2,
  Crown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function ABTestResults({ test, user, onTestUpdated }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze A/B test results and provide insights:

TEST: ${test.test_name}
HYPOTHESIS: ${test.hypothesis}
METRIC: ${test.metric}
STATUS: ${test.status}

VARIANTS:
${test.variants.map((v, i) => `
${v.variant_name}:
- Users Assigned: ${v.users_assigned || 0}
- Conversions: ${v.conversions || 0}
- Conversion Rate: ${v.conversion_rate || 0}%
${i > 0 ? `- vs Control: ${v.conversion_rate > test.variants[0].conversion_rate ? '+' : ''}${((v.conversion_rate - test.variants[0].conversion_rate) || 0).toFixed(2)}%` : ''}
`).join('\n')}

STATISTICAL DATA:
- Winner: ${test.winner || "Not determined yet"}
- Statistical Significance: ${test.statistical_significance || 0}%
- Sample Size: ${test.variants.reduce((sum, v) => sum + (v.users_assigned || 0), 0)} / ${test.target_sample_size}

Provide comprehensive analysis:

1. CURRENT WINNER:
   - Which variant is performing best
   - By how much (% improvement)
   - Is difference statistically significant?

2. STATISTICAL CONFIDENCE:
   - Current confidence level
   - How much more data needed for ${test.confidence_level}% confidence
   - Estimated time to significance (if not reached)

3. INSIGHTS PER VARIANT:
   - Why each variant performed the way it did
   - Unexpected patterns
   - Audience preferences revealed

4. KEY LEARNINGS:
   - What worked
   - What didn't work
   - Why (hypothesis validation)

5. RECOMMENDATIONS:
   - Should we declare winner now?
   - Should we continue testing?
   - Should we add more variants?
   - Next tests to run

6. IMPACT PROJECTION:
   - If we scale the winner, expected improvement
   - Estimated revenue impact
   - Risk assessment

7. NEXT STEPS:
   - Immediate actions (3 steps)
   - Long-term optimization opportunities`,
        response_json_schema: {
          type: "object",
          properties: {
            current_winner: {
              type: "object",
              properties: {
                variant_name: { type: "string" },
                improvement_percentage: { type: "number" },
                is_significant: { type: "boolean" },
                confidence: { type: "number" }
              }
            },
            statistical_status: {
              type: "object",
              properties: {
                current_confidence: { type: "number" },
                data_needed: { type: "number" },
                estimated_days_to_significance: { type: "number" },
                sample_size_adequate: { type: "boolean" }
              }
            },
            variant_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_name: { type: "string" },
                  performance_summary: { type: "string" },
                  unexpected_patterns: { type: "array", items: { type: "string" } },
                  audience_preferences: { type: "string" }
                }
              }
            },
            key_learnings: {
              type: "object",
              properties: {
                what_worked: { type: "array", items: { type: "string" } },
                what_didnt_work: { type: "array", items: { type: "string" } },
                hypothesis_validation: { type: "string" }
              }
            },
            recommendations: {
              type: "object",
              properties: {
                declare_winner_now: { type: "boolean" },
                continue_testing: { type: "boolean" },
                add_more_variants: { type: "boolean" },
                next_tests: { type: "array", items: { type: "string" } }
              }
            },
            impact_projection: {
              type: "object",
              properties: {
                expected_improvement: { type: "string" },
                estimated_revenue_lift: { type: "number" },
                risk_level: { type: "string" },
                scale_recommendation: { type: "string" }
              }
            },
            next_steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "string" },
                  timeframe: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiAnalysis(analysis);

      alert(`🧠 AI Analysis Complete!

🏆 CURRENT WINNER: ${analysis.current_winner.variant_name}
📈 IMPROVEMENT: ${analysis.current_winner.improvement_percentage > 0 ? '+' : ''}${analysis.current_winner.improvement_percentage}%
✅ STATISTICAL SIGNIFICANCE: ${analysis.current_winner.is_significant ? 'YES' : 'NOT YET'}
📊 CONFIDENCE: ${analysis.current_winner.confidence}%

${analysis.statistical_status.sample_size_adequate ? '✓ Sample size adequate' : `⚠️ Need ${analysis.statistical_status.data_needed} more samples (est. ${analysis.statistical_status.estimated_days_to_significance} days)`}

📋 TOP LEARNINGS:
${analysis.key_learnings.what_worked.slice(0, 3).map((w, i) => `${i + 1}. ${w}`).join('\n')}

🎯 RECOMMENDATION: ${analysis.recommendations.declare_winner_now ? 'Declare winner and scale' : 'Continue testing'}

Check detailed analysis below!`);

    } catch (error) {
      alert("Error analyzing test. Please try again.");
      console.error(error);
    }
    setIsAnalyzing(false);
  };

  const declareWinner = async (variantId) => {
    if (!confirm(`Declare "${test.variants.find(v => v.variant_id === variantId)?.variant_name}" as winner?\n\nThis will:\n1. Pause losing variants\n2. Scale winner to 100% traffic\n3. Mark test as completed`)) {
      return;
    }

    try {
      await base44.entities.ABTest.update(test.id, {
        winner: variantId,
        status: "completed",
        ended_at: new Date().toISOString()
      });

      // Log NBA suggestion to scale winner
      await base44.entities.NBASuggestion.create({
        user_email: user.email,
        funnel_run_id: test.id,
        issue: `A/B test winner identified: ${test.variants.find(v => v.variant_id === variantId)?.variant_name}`,
        hypothesis: `Scaling winning variant will improve ${test.metric} across all traffic`,
        expected_gain: aiAnalysis?.current_winner?.improvement_percentage || 10,
        effort: "low",
        actionable_step: `Update campaign to use winning variant configuration exclusively`,
        priority: 1,
        category: "ad_creative"
      });

      if (onTestUpdated) onTestUpdated();

      alert(`✅ Winner Declared!

🏆 WINNER: ${test.variants.find(v => v.variant_id === variantId)?.variant_name}
📈 IMPROVEMENT: ${aiAnalysis?.current_winner?.improvement_percentage > 0 ? '+' : ''}${aiAnalysis?.current_winner?.improvement_percentage}%

Next steps:
1. Scale winner to 100% traffic
2. Pause/archive losing variants  
3. Plan next test based on learnings`);

    } catch (error) {
      alert("Error declaring winner. Please try again.");
      console.error(error);
    }
  };

  const pauseTest = async () => {
    try {
      await base44.entities.ABTest.update(test.id, {
        status: "paused"
      });
      if (onTestUpdated) onTestUpdated();
      alert("Test paused. Resume anytime to continue collecting data.");
    } catch (error) {
      alert("Error pausing test.");
    }
  };

  const resumeTest = async () => {
    try {
      await base44.entities.ABTest.update(test.id, {
        status: "running"
      });
      if (onTestUpdated) onTestUpdated();
      alert("Test resumed.");
    } catch (error) {
      alert("Error resuming test.");
    }
  };

  const totalUsers = test.variants.reduce((sum, v) => sum + (v.users_assigned || 0), 0);
  const progress = test.target_sample_size > 0 ? (totalUsers / test.target_sample_size) * 100 : 0;

  const chartData = test.variants.map(v => ({
    name: v.variant_name,
    'Conversion Rate': v.conversion_rate || 0,
    'Users': v.users_assigned || 0,
    'Conversions': v.conversions || 0
  }));

  const currentLeader = test.variants.reduce((leader, variant) => 
    (variant.conversion_rate || 0) > (leader.conversion_rate || 0) ? variant : leader
  , test.variants[0]);

  return (
    <div className="space-y-6">

      {/* Test Overview */}
      <Card className="bg-gradient-to-br from-[#6F1AB1]/10 to-[#A64EE7]/10 border-[#6F1AB1]/30 border-2 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-xl mb-2">{test.test_name}</h3>
              <p className="text-gray-300 text-sm mb-3">{test.hypothesis}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${
                  test.status === 'running' ? 'bg-green-500/20 text-green-400' :
                  test.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {test.status}
                </Badge>
                <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                  <Target className="w-3 h-3 mr-1" />
                  {test.metric}
                </Badge>
                <Badge className="bg-gray-700 text-gray-300">
                  {test.variants.length} variants
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              {test.status === 'running' ? (
                <Button
                  onClick={pauseTest}
                  size="sm"
                  variant="outline"
                  className="border-gray-700 text-white"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              ) : test.status === 'paused' ? (
                <Button
                  onClick={resumeTest}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              ) : null}
              
              <Button
                onClick={generateAIAnalysis}
                disabled={isAnalyzing}
                size="sm"
                className="bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] text-white"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1" />
                )}
                Analyze
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Sample Size Progress</span>
              <span className="text-white font-bold">
                {totalUsers.toLocaleString()} / {test.target_sample_size.toLocaleString()}
              </span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-3" />
            <p className="text-gray-500 text-xs mt-1">
              {progress >= 100 ? '✅ Target sample size reached' : `${(100 - progress).toFixed(0)}% remaining`}
            </p>
          </div>

          {/* Current Leader */}
          {currentLeader && totalUsers > 0 && (
            <div className="p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-[#FFD700]" />
                <h4 className="text-white font-bold">Current Leader</h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-lg">{currentLeader.variant_name}</p>
                  <p className="text-gray-300 text-sm">{currentLeader.conversion_rate}% conversion rate</p>
                </div>
                {test.variants[0] && currentLeader.variant_id !== test.variants[0].variant_id && (
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-bold">
                        +{((currentLeader.conversion_rate - test.variants[0].conversion_rate) || 0).toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">vs control</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variant Performance Chart */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-sm">Variant Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" tick={{fill: '#999'}} />
              <YAxis stroke="#666" tick={{fill: '#999'}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px'}}
              />
              <Legend />
              <Bar dataKey="Conversion Rate" fill="#FFD700" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Conversions" fill="#00D4C9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Variant Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {test.variants.map((variant, idx) => {
          const isControl = idx === 0;
          const isWinner = test.winner === variant.variant_id;
          const isLeader = variant.variant_id === currentLeader?.variant_id;
          const vsControl = !isControl && test.variants[0] 
            ? ((variant.conversion_rate - test.variants[0].conversion_rate) || 0)
            : 0;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`${
                isWinner ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 border-[#FFD700] border-2' :
                isLeader ? 'bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 border-2' :
                'bg-[#111317] border-gray-800'
              } rounded-2xl`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-bold text-lg">{variant.variant_name}</h4>
                        {isControl && <Badge className="bg-blue-500/20 text-blue-400 text-xs">Control</Badge>}
                        {isWinner && <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs"><Crown className="w-3 h-3 mr-1" />Winner</Badge>}
                        {isLeader && !isWinner && <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">Leading</Badge>}
                      </div>
                      {variant.description && (
                        <p className="text-gray-400 text-sm">{variant.description}</p>
                      )}
                    </div>

                    {!isControl && !isWinner && test.status === 'running' && (
                      <Button
                        size="sm"
                        onClick={() => declareWinner(variant.variant_id)}
                        className="bg-[#FFD700] hover:bg-[#FF8C00] text-black font-semibold"
                      >
                        Declare Winner
                      </Button>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Users</p>
                      <p className="text-white font-bold text-lg">
                        {variant.users_assigned?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Conversions</p>
                      <p className="text-white font-bold text-lg">
                        {variant.conversions || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                      <p className="text-gray-400 text-xs mb-1">Conv. Rate</p>
                      <p className={`font-bold text-lg ${
                        (variant.conversion_rate || 0) > (test.variants[0]?.conversion_rate || 0) 
                          ? 'text-green-400' 
                          : 'text-white'
                      }`}>
                        {variant.conversion_rate || 0}%
                      </p>
                    </div>
                  </div>

                  {/* vs Control */}
                  {!isControl && vsControl !== 0 && (
                    <div className={`p-3 rounded-lg ${
                      vsControl > 0 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">vs Control</span>
                        <div className="flex items-center gap-1">
                          {vsControl > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`font-bold ${vsControl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {vsControl > 0 ? '+' : ''}{vsControl.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <>
          {/* Statistical Status */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00D4C9]" />
                Statistical Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <p className="text-gray-400 text-sm mb-2">Current Confidence</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-white">
                      {aiAnalysis.statistical_status.current_confidence}%
                    </p>
                    <p className="text-gray-500 text-sm">
                      / {test.confidence_level}% target
                    </p>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={(aiAnalysis.statistical_status.current_confidence / test.confidence_level) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <p className="text-gray-400 text-sm mb-2">Time to Significance</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-white">
                      {aiAnalysis.statistical_status.estimated_days_to_significance}
                    </p>
                    <p className="text-gray-500 text-sm">days</p>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Need {aiAnalysis.statistical_status.data_needed} more samples
                  </p>
                </div>
              </div>

              {aiAnalysis.statistical_status.sample_size_adequate && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 text-sm font-semibold">
                      Sample size is statistically adequate!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Learnings */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-sm">Key Learnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <h5 className="text-green-400 font-semibold text-sm mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  What Worked
                </h5>
                <ul className="space-y-1">
                  {aiAnalysis.key_learnings.what_worked.map((item, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  What Didn't Work
                </h5>
                <ul className="space-y-1">
                  {aiAnalysis.key_learnings.what_didnt_work.map((item, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h5 className="text-blue-400 font-semibold text-sm mb-1">Hypothesis Validation</h5>
                <p className="text-gray-300 text-sm">{aiAnalysis.key_learnings.hypothesis_validation}</p>
              </div>

            </CardContent>
          </Card>

          {/* Variant Insights */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-sm">Variant Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiAnalysis.variant_insights.map((insight, idx) => (
                  <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <h5 className="text-white font-semibold mb-2">{insight.variant_name}</h5>
                    <p className="text-gray-300 text-sm mb-2">{insight.performance_summary}</p>
                    {insight.unexpected_patterns?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[#00D4C9] text-xs font-semibold mb-1">Unexpected Patterns:</p>
                        <ul className="space-y-0.5">
                          {insight.unexpected_patterns.map((pattern, i) => (
                            <li key={i} className="text-gray-400 text-xs">• {pattern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-gray-500 text-xs">
                      <strong className="text-gray-400">Audience:</strong> {insight.audience_preferences}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact Projection */}
          <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 border-2 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00D4C9]" />
                Impact Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                  <p className="text-gray-400 text-xs mb-1">Expected Improvement</p>
                  <p className="text-2xl font-bold text-green-400">
                    {aiAnalysis.impact_projection.expected_improvement}
                  </p>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                  <p className="text-gray-400 text-xs mb-1">Revenue Lift</p>
                  <p className="text-2xl font-bold text-[#FFD700]">
                    ${aiAnalysis.impact_projection.estimated_revenue_lift?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                  <p className="text-gray-400 text-xs mb-1">Risk Level</p>
                  <Badge className={`${
                    aiAnalysis.impact_projection.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                    aiAnalysis.impact_projection.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {aiAnalysis.impact_projection.risk_level}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
                <h5 className="text-white font-semibold text-sm mb-2">Scale Recommendation</h5>
                <p className="text-gray-300 text-sm">{aiAnalysis.impact_projection.scale_recommendation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiAnalysis.recommendations.declare_winner_now && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-400 font-semibold text-sm mb-1">
                          Ready to Declare Winner
                        </p>
                        <p className="text-gray-300 text-xs">
                          Statistical significance reached. Safe to scale winning variant.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {aiAnalysis.recommendations.continue_testing && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-semibold text-sm mb-1">
                          Continue Testing
                        </p>
                        <p className="text-gray-300 text-xs">
                          Not enough data yet for confident decision. Run test longer.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {aiAnalysis.recommendations.next_tests?.length > 0 && (
                  <div>
                    <h5 className="text-white font-semibold text-sm mb-2">Next Tests to Run</h5>
                    <ul className="space-y-1">
                      {aiAnalysis.recommendations.next_tests.map((test, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <Target className="w-3 h-3 text-[#00D4C9] flex-shrink-0 mt-1" />
                          {test}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] rounded-2xl border-0">
            <CardContent className="p-6">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Next Steps
              </h4>
              <div className="space-y-2">
                {aiAnalysis.next_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{step.step}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-white/20 text-white text-xs">
                          {step.timeframe}
                        </Badge>
                        <Badge className={`text-xs ${
                          step.priority === 'high' ? 'bg-red-500/30 text-red-200' :
                          step.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-200' :
                          'bg-blue-500/30 text-blue-200'
                        }`}>
                          {step.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}