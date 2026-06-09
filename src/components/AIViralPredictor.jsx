import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Loader2, Sparkles, Target, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function AIViralPredictor({ script, visualConcept, duration, onPredictionComplete }) {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const analyzeViralPotential = async () => {
    setIsPredicting(true);
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the viral potential of this video content:

SCRIPT:
${script}

VISUAL CONCEPT:
${visualConcept}

DURATION: ${duration} seconds

Evaluate and score (0-100) on these factors:

1. HOOK STRENGTH (0-100):
   - First 3 seconds analysis
   - Attention-grabbing power
   - Curiosity gap creation

2. PACING SCORE (0-100):
   - Scene transition flow
   - Information density
   - Viewer retention potential

3. EMOTIONAL APPEAL (0-100):
   - Emotional triggers used
   - Relatability factor
   - Shareability quotient

4. PRACTICAL VALUE (0-100):
   - Actionable insights
   - Educational value
   - Problem-solving clarity

5. VISUAL APPEAL (0-100):
   - Creative concept strength
   - Platform optimization
   - Aesthetic quality

6. SHAREABILITY (0-100):
   - Social proof elements
   - Controversy/discussion potential
   - Meme-ability

Calculate:
- Overall Viral Score (weighted average)
- Estimated views in first 7 days
- Platform recommendations
- Improvement suggestions

Be honest and data-driven.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_viral_score: { type: "number" },
            category: { type: "string", description: "viral/high potential/moderate/low" },
            factors: {
              type: "object",
              properties: {
                hook_strength: { type: "number" },
                pacing_score: { type: "number" },
                emotional_appeal: { type: "number" },
                practical_value: { type: "number" },
                visual_appeal: { type: "number" },
                shareability: { type: "number" }
              }
            },
            predictions: {
              type: "object",
              properties: {
                estimated_views_7d: { type: "number" },
                estimated_shares: { type: "number" },
                estimated_engagement_rate: { type: "number" },
                viral_probability: { type: "number" }
              }
            },
            platform_fit: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  score: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  impact: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            benchmark_comparison: { type: "string" }
          }
        }
      });

      setPrediction(analysis);
      
      if (onPredictionComplete) {
        onPredictionComplete(analysis);
      }

    } catch (error) {
      console.error("Error predicting viral potential:", error);
      alert("Failed to analyze viral potential. Please try again.");
    }
    setIsPredicting(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    if (score >= 40) return "bg-orange-500/20";
    return "bg-red-500/20";
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF8C00]" />
              AI Viral Potential Predictor
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              Analyze your video's viral potential before publishing
            </p>
          </div>
          <Button
            onClick={analyzeViralPotential}
            disabled={isPredicting || !script}
            className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-black rounded-xl"
          >
            {isPredicting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Predict Viral Score
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        
        {prediction ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-2xl">
              <p className="text-gray-400 text-sm mb-2">OVERALL VIRAL SCORE</p>
              <p className={`text-6xl font-bold ${getScoreColor(prediction.overall_viral_score)}`}>
                {prediction.overall_viral_score}
              </p>
              <Badge className={`${getScoreBg(prediction.overall_viral_score)} ${getScoreColor(prediction.overall_viral_score)} mt-2`}>
                {prediction.category?.toUpperCase()}
              </Badge>
            </div>

            {/* Factor Scores */}
            <div>
              <h4 className="text-white font-semibold mb-3">Score Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(prediction.factors || {}).map(([factor, score]) => (
                  <div key={factor}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm capitalize">
                        {factor.replace(/_/g, ' ')}
                      </span>
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    </div>
                    <Progress value={score} className="h-2 bg-[#0B0B0C]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <p className="text-gray-400 text-xs mb-1">ESTIMATED VIEWS (7 days)</p>
                <p className="text-[#00D4C9] font-bold text-2xl">
                  {prediction.predictions?.estimated_views_7d?.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <p className="text-gray-400 text-xs mb-1">VIRAL PROBABILITY</p>
                <p className="text-[#FFD700] font-bold text-2xl">
                  {prediction.predictions?.viral_probability}%
                </p>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <p className="text-gray-400 text-xs mb-1">EST. SHARES</p>
                <p className="text-[#9D4EDD] font-bold text-2xl">
                  {prediction.predictions?.estimated_shares?.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <p className="text-gray-400 text-xs mb-1">ENGAGEMENT RATE</p>
                <p className="text-[#06D6A0] font-bold text-2xl">
                  {prediction.predictions?.estimated_engagement_rate}%
                </p>
              </div>
            </div>

            {/* Platform Fit */}
            <div>
              <h4 className="text-white font-semibold mb-3">Platform Recommendations</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {prediction.platform_fit?.map((platform, idx) => (
                  <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold text-sm">{platform.platform}</p>
                      <Badge className={`${getScoreBg(platform.score)} ${getScoreColor(platform.score)} text-xs`}>
                        {platform.score}/100
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs">{platform.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <h4 className="text-green-400 font-semibold text-sm mb-2">✓ Strengths</h4>
                <ul className="space-y-1">
                  {prediction.strengths?.map((strength, idx) => (
                    <li key={idx} className="text-gray-300 text-xs flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <h4 className="text-red-400 font-semibold text-sm mb-2">⚠ Weaknesses</h4>
                <ul className="space-y-1">
                  {prediction.weaknesses?.map((weakness, idx) => (
                    <li key={idx} className="text-gray-300 text-xs flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Improvements */}
            <div>
              <h4 className="text-white font-semibold mb-3">🚀 Suggested Improvements</h4>
              <div className="space-y-2">
                {prediction.improvements?.map((improvement, idx) => (
                  <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-white text-sm flex-1">{improvement.suggestion}</p>
                      <Badge className={`ml-2 text-xs ${
                        improvement.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        improvement.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {improvement.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs">Impact: {improvement.impact}</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        ) : (
          <div className="text-center py-8">
            <Flame className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Analyze your script and visuals to predict viral potential</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}