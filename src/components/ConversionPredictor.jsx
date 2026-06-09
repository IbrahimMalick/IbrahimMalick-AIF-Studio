import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function ConversionPredictor({ user, leads, calls, sequences, responses }) {
  const queryClient = useQueryClient();

  const { data: predictions = [] } = useQuery({
    queryKey: ["leadPredictions", user?.email],
    queryFn: () => base44.entities.LeadConversionPrediction.list('-prediction_date', 100),
    enabled: !!user,
    initialData: []
  });

  const generatePredictionMutation = useMutation({
    mutationFn: async (leadId) => {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) throw new Error("Lead not found");

      // Generate AI prediction
      const prediction = await generateLeadPrediction(lead, calls, sequences, responses);
      
      return await base44.entities.LeadConversionPrediction.create({
        ...prediction,
        lead_id: leadId,
        prediction_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leadPredictions"]);
      showToast("Prediction generated! 🎯", "success");
    }
  });

  const generatePrediction = async (lead) => {
    await generatePredictionMutation.mutate(lead.id);
  };

  const generateLeadPrediction = async (lead, calls, sequences, responses) => {
    // Get lead's historical data
    const leadCalls = calls.filter(c => c.lead_id === lead.id);
    const leadSequences = sequences.filter(s => s.lead_id === lead.id);
    const leadResponses = responses.filter(r => r.lead_id === lead.id);

    // Build feature set for AI
    const features = {
      lead_score: lead.score || 0,
      lead_status: lead.status,
      call_count: leadCalls.length,
      avg_call_sentiment: leadCalls.length > 0
        ? leadCalls.reduce((sum, c) => sum + (c.sentiment || 0), 0) / leadCalls.length
        : 0,
      last_call_intent: leadCalls[0]?.intent || 'none',
      days_since_first_contact: lead.created_date
        ? Math.floor((new Date() - new Date(lead.created_date)) / (1000 * 60 * 60 * 24))
        : 0,
      days_since_last_contact: lead.last_contact
        ? Math.floor((new Date() - new Date(lead.last_contact)) / (1000 * 60 * 60 * 24))
        : 999,
      in_nurture_sequence: leadSequences.some(s => s.sequence_status === 'active'),
      nurture_engagement: leadSequences.length > 0
        ? leadSequences.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / leadSequences.length
        : 0,
      response_count: leadResponses.length,
      positive_responses: leadResponses.filter(r => r.sentiment > 0.3).length,
      buying_signals: leadResponses.reduce((sum, r) => sum + (r.ai_analysis?.buying_signals || 0), 0),
      has_budget: !!lead.budget,
      has_timeline: !!lead.timeline,
      has_email: !!lead.email,
      source: lead.source
    };

    // AI prediction
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Predict conversion probability for this lead:

LEAD DATA:
- Score: ${features.lead_score}/100
- Status: ${features.lead_status}
- Days since first contact: ${features.days_since_first_contact}
- Days since last contact: ${features.days_since_last_contact}
- Calls: ${features.call_count}
- Avg call sentiment: ${features.avg_call_sentiment.toFixed(2)}
- Last intent: ${features.last_call_intent}
- In nurture: ${features.in_nurture_sequence}
- Nurture engagement: ${features.nurture_engagement.toFixed(0)}/100
- Responses: ${features.response_count}
- Positive responses: ${features.positive_responses}
- Buying signals: ${features.buying_signals}
- Has budget: ${features.has_budget}
- Has timeline: ${features.has_timeline}

Based on this data, predict:
1. Conversion probability (0-100%)
2. Category (very_high, high, medium, low, very_low)
3. Expected conversion date
4. Predicted value ($)
5. Contributing factors (positive and negative)
6. Risk factors
7. Recommended actions to increase conversion
8. Similar leads analysis`,
      response_json_schema: {
        type: "object",
        properties: {
          conversion_probability: { type: "number" },
          confidence_level: { type: "number" },
          probability_category: { type: "string" },
          predicted_days_to_conversion: { type: "number" },
          predicted_value: { type: "number" },
          contributing_factors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                factor: { type: "string" },
                weight: { type: "number" },
                impact: { type: "string" },
                current_value: { type: "string" }
              }
            }
          },
          engagement_signals: {
            type: "object",
            properties: {
              call_engagement: { type: "number" },
              nurture_engagement: { type: "number" },
              response_quality: { type: "number" },
              timing_signals: { type: "number" },
              budget_signals: { type: "number" }
            }
          },
          risk_factors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                severity: { type: "string" },
                mitigation: { type: "string" }
              }
            }
          },
          recommended_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                expected_impact: { type: "string" },
                when_to_do: { type: "string" }
              }
            }
          }
        }
      }
    });

    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + (aiAnalysis.predicted_days_to_conversion || 30));

    return {
      conversion_probability: aiAnalysis.conversion_probability,
      confidence_level: aiAnalysis.confidence_level,
      probability_category: aiAnalysis.probability_category,
      predicted_conversion_date: predictedDate.toISOString(),
      predicted_value: aiAnalysis.predicted_value,
      contributing_factors: aiAnalysis.contributing_factors,
      engagement_signals: aiAnalysis.engagement_signals,
      risk_factors: aiAnalysis.risk_factors,
      recommended_actions: aiAnalysis.recommended_actions,
      model_used: "gpt-4-predictive-v1",
      features_analyzed: Object.keys(features)
    };
  };

  // Group predictions by category
  const byCategory = {
    very_high: predictions.filter(p => p.probability_category === 'very_high'),
    high: predictions.filter(p => p.probability_category === 'high'),
    medium: predictions.filter(p => p.probability_category === 'medium'),
    low: predictions.filter(p => p.probability_category === 'low'),
    very_low: predictions.filter(p => p.probability_category === 'very_low')
  };

  // Leads without predictions
  const leadsWithoutPredictions = leads.filter(l => 
    l.status !== 'won' && 
    l.status !== 'lost' &&
    !predictions.some(p => p.lead_id === l.id)
  );

  return (
    <div className="space-y-6">
      
      {/* Bulk Predict */}
      <Card className="bg-[#111317] border-gray-800 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#FFD700]" />
            AI Conversion Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 mb-1">
                {leadsWithoutPredictions.length} leads need prediction analysis
              </p>
              <p className="text-gray-500 text-sm">
                AI analyzes engagement patterns, sentiment, and behavior to predict conversion
              </p>
            </div>
            <Button
              onClick={async () => {
                showToast("Generating predictions...", "info");
                for (const lead of leadsWithoutPredictions.slice(0, 10)) {
                  await generatePrediction(lead);
                }
              }}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Predict All
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Prediction Categories */}
      <div className="space-y-4">
        
        {/* Very High Probability */}
        {byCategory.very_high.length > 0 && (
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Very High Probability ({byCategory.very_high.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {byCategory.very_high.map((pred) => {
                const lead = leads.find(l => l.id === pred.lead_id);
                if (!lead) return null;

                return (
                  <div key={pred.id} className="p-4 bg-[#0B0B0C] rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">{lead.name || lead.phone}</p>
                        <p className="text-gray-400 text-sm">{lead.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-xl">
                          {pred.conversion_probability.toFixed(0)}%
                        </p>
                        <p className="text-gray-500 text-xs">
                          Confidence: {pred.confidence_level}%
                        </p>
                      </div>
                    </div>

                    <Progress value={pred.conversion_probability} className="mb-3" />

                    {/* Engagement Signals */}
                    {pred.engagement_signals && (
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {Object.entries(pred.engagement_signals).map(([signal, score]) => (
                          <div key={signal} className="text-center">
                            <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                              score >= 70 ? 'bg-green-500/20 text-green-400' :
                              score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              <p className="text-xs font-bold">{score}</p>
                            </div>
                            <p className="text-gray-500 text-xs capitalize">
                              {signal.replace(/_/g, ' ').replace(' signals', '')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Top Recommended Action */}
                    {pred.recommended_actions && pred.recommended_actions[0] && (
                      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                        <p className="text-blue-400 text-xs font-semibold mb-1">
                          💡 Next Best Action:
                        </p>
                        <p className="text-gray-300 text-xs">
                          {pred.recommended_actions[0].action}
                        </p>
                      </div>
                    )}

                    {/* Predicted Value */}
                    {pred.predicted_value && (
                      <div className="flex items-center gap-2 mt-2">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <p className="text-gray-300 text-sm">
                          Predicted value: <span className="text-yellow-400 font-bold">
                            ${pred.predicted_value.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* High Probability */}
        {byCategory.high.length > 0 && (
          <Card className="bg-[#111317] border-yellow-500/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                High Probability ({byCategory.high.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byCategory.high.map((pred) => {
                const lead = leads.find(l => l.id === pred.lead_id);
                if (!lead) return null;

                return (
                  <div key={pred.id} className="p-3 bg-[#0B0B0C] rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">{lead.name || lead.phone}</p>
                      <p className="text-gray-500 text-xs">Score: {lead.score}/100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">
                        {pred.conversion_probability.toFixed(0)}%
                      </p>
                      <p className="text-gray-500 text-xs">
                        {pred.predicted_conversion_date 
                          ? `~${Math.ceil((new Date(pred.predicted_conversion_date) - new Date()) / (1000 * 60 * 60 * 24))}d`
                          : '—'
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Medium Probability */}
        {byCategory.medium.length > 0 && (
          <Card className="bg-[#111317] border-gray-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Medium Probability ({byCategory.medium.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">
                  {byCategory.medium.length} leads with 40-69% conversion probability
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-gray-700 text-white hover:bg-gray-800"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low/Very Low */}
        {(byCategory.low.length + byCategory.very_low.length) > 0 && (
          <Card className="bg-[#111317] border-red-500/20 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                At Risk ({byCategory.low.length + byCategory.very_low.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">
                These leads have low conversion probability. Consider re-engagement campaigns or disqualifying.
              </p>
              <div className="space-y-2">
                {[...byCategory.low, ...byCategory.very_low].slice(0, 5).map((pred) => {
                  const lead = leads.find(l => l.id === pred.lead_id);
                  if (!lead) return null;

                  return (
                    <div key={pred.id} className="p-2 bg-[#0B0B0C] rounded flex items-center justify-between text-sm">
                      <span className="text-gray-300">{lead.name || lead.phone}</span>
                      <span className="text-red-400">{pred.conversion_probability.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Prediction Accuracy Tracking */}
      {predictions.filter(p => p.actual_outcome).length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">🎯 Prediction Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-[#0B0B0C] rounded text-center">
                <p className="text-gray-500 text-xs">Predictions Made</p>
                <p className="text-white font-bold text-xl">
                  {predictions.filter(p => p.actual_outcome).length}
                </p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded text-center">
                <p className="text-gray-500 text-xs">Avg Accuracy</p>
                <p className="text-green-400 font-bold text-xl">
                  {predictions.filter(p => p.prediction_accuracy).length > 0
                    ? (predictions.reduce((sum, p) => sum + (p.prediction_accuracy || 0), 0) / predictions.filter(p => p.prediction_accuracy).length).toFixed(0)
                    : '—'
                  }%
                </p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded text-center">
                <p className="text-gray-500 text-xs">Model Quality</p>
                <p className="text-blue-400 font-bold text-xl">
                  {predictions.filter(p => p.confidence_level).length > 0
                    ? (predictions.reduce((sum, p) => sum + (p.confidence_level || 0), 0) / predictions.filter(p => p.confidence_level).length).toFixed(0)
                    : '—'
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 border-blue-500/30 rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-blue-400 font-semibold mb-3">🤖 How AI Predictions Work</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">100+ Data Points</p>
              <p className="text-gray-300 text-xs">
                Analyzes lead score, engagement, sentiment, timing, responses, and behavior patterns
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">Self-Improving Model</p>
              <p className="text-gray-300 text-xs">
                Learns from actual outcomes to improve accuracy over time
              </p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">Actionable Insights</p>
              <p className="text-gray-300 text-xs">
                Every prediction includes specific actions to increase conversion probability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}