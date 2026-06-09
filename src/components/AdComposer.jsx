import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  Wand2,
  Loader2,
  Copy,
  CheckCircle2,
  Target,
  Image as ImageIcon,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdComposer({ onComplete, adAccountId }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [generatingVariants, setGeneratingVariants] = useState(false);
  const [validating, setValidating] = useState(false);

  const [campaignData, setCampaignData] = useState({
    objective: "OUTCOME_TRAFFIC",
    offer: "",
    target_audience: "",
    budget_daily: 10,
    duration_days: 7
  });

  const [creatives, setCreatives] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [guardrails, setGuardrails] = useState({
    max_cpa: 50,
    min_roas: 2,
    max_daily_spend: 100,
    pause_if_no_conversions_after_spend: 50
  });

  // AI: Generate Ad Variants
  const generateVariants = async () => {
    setGeneratingVariants(true);
    try {
      const variants = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 high-converting Meta ad creative variants:

CAMPAIGN DETAILS:
- Objective: ${campaignData.objective}
- Offer: ${campaignData.offer}
- Target Audience: ${campaignData.target_audience}
- Budget: $${campaignData.budget_daily}/day for ${campaignData.duration_days} days

For each variant, create:
1. Primary text (hook in first 3 words, 125 chars max)
2. Headline (benefit-focused, 40 chars max)
3. Description (value prop, 30 chars max)
4. Best CTA button
5. Visual concept suggestion
6. Why this will work

Make them diverse (different hooks/angles) for A/B testing.
Focus on benefits, urgency, and social proof.`,
        response_json_schema: {
          type: "object",
          properties: {
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_name: { type: "string" },
                  primary_text: { type: "string" },
                  headline: { type: "string" },
                  description: { type: "string" },
                  cta: { type: "string" },
                  visual_concept: { type: "string" },
                  hook_angle: { type: "string" },
                  why_it_works: { type: "string" },
                  predicted_ctr: { type: "number" }
                }
              }
            }
          }
        }
      });

      setCreatives(variants.variants || []);
      alert(`✅ Generated ${variants.variants.length} ad variants!`);
    } catch (error) {
      console.error("Error generating variants:", error);
      alert("❌ Failed to generate variants. Please try again.");
    }
    setGeneratingVariants(false);
  };

  // Validate & Check Policy
  const validateCreatives = async () => {
    setValidating(true);
    try {
      const validation = await base44.integrations.Core.InvokeLLM({
        prompt: `Check these Meta ad creatives for policy violations and optimization:

${creatives.map((c, i) => `
VARIANT ${i + 1}:
Primary: ${c.primary_text}
Headline: ${c.headline}
Description: ${c.description}
`).join('\n')}

For each variant, check:
1. Meta ad policy compliance (health claims, income claims, personal attributes, prohibited content)
2. Character limits (primary ≤125, headline ≤40, description ≤30)
3. Grammar and spelling
4. Call-to-action clarity
5. Prohibited words detection

Return pass/fail with specific issues and fixes.`,
        response_json_schema: {
          type: "object",
          properties: {
            variants_validation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_index: { type: "number" },
                  passes_policy: { type: "boolean" },
                  character_limit_ok: { type: "boolean" },
                  issues: { type: "array", items: { type: "string" } },
                  suggested_fixes: { type: "array", items: { type: "string" } },
                  overall_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Update creatives with validation results
      const updated = creatives.map((creative, idx) => ({
        ...creative,
        validation: validation.variants_validation[idx]
      }));
      setCreatives(updated);

      const allPass = validation.variants_validation.every(v => v.passes_policy && v.character_limit_ok);
      if (allPass) {
        alert("✅ All creatives validated successfully!");
      } else {
        alert("⚠️ Some creatives have issues. Check validation results below.");
      }
    } catch (error) {
      console.error("Error validating:", error);
      alert("❌ Validation failed. Please try again.");
    }
    setValidating(false);
  };

  // Save Drafts
  const saveDraftsMutation = useMutation({
    mutationFn: async () => {
      const drafts = await Promise.all(
        creatives.map(creative =>
          base44.entities.AdCreativeDraft.create({
            user_email: campaignData.user_email,
            draft_name: creative.variant_name,
            objective: campaignData.objective.replace('OUTCOME_', ''),
            primary_text: creative.primary_text,
            headline: creative.headline,
            description: creative.description,
            cta: creative.cta,
            asset_ids: selectedAssets,
            score_pred: creative.predicted_ctr || 0,
            ai_generated: true,
            generation_prompt: campaignData.offer,
            status: "validated"
          })
        )
      );
      return drafts;
    },
    onSuccess: (drafts) => {
      queryClient.invalidateQueries(["adCreativeDrafts"]);
      if (onComplete) onComplete({ campaignData, creatives: drafts, guardrails });
    }
  });

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Ad Campaign Composer</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded ${s <= step ? 'bg-[#1E90FF]' : 'bg-gray-700'}`}
                />
              ))}
            </div>
          </div>
          <Badge className="bg-[#1E90FF]/20 text-[#1E90FF]">
            Step {step} of 4
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Step 1: Campaign Setup */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-white font-bold text-lg">Campaign Details</h3>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Campaign Objective</label>
              <Select
                value={campaignData.objective}
                onValueChange={(value) => setCampaignData({...campaignData, objective: value})}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUTCOME_LEADS">Leads - Capture contact information</SelectItem>
                  <SelectItem value="OUTCOME_SALES">Sales - Drive purchases</SelectItem>
                  <SelectItem value="OUTCOME_TRAFFIC">Traffic - Website visits</SelectItem>
                  <SelectItem value="OUTCOME_AWARENESS">Awareness - Brand recognition</SelectItem>
                  <SelectItem value="OUTCOME_ENGAGEMENT">Engagement - Likes & comments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">What are you offering?</label>
              <Textarea
                placeholder="e.g., 50% off AI video editing software, Free trial of automation tools, Limited time course access"
                value={campaignData.offer}
                onChange={(e) => setCampaignData({...campaignData, offer: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Target Audience</label>
              <Textarea
                placeholder="e.g., Entrepreneurs 25-45 interested in AI and automation, E-commerce store owners, Content creators"
                value={campaignData.target_audience}
                onChange={(e) => setCampaignData({...campaignData, target_audience: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Daily Budget ($)</label>
                <Input
                  type="number"
                  value={campaignData.budget_daily}
                  onChange={(e) => setCampaignData({...campaignData, budget_daily: Number(e.target.value)})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Duration (days)</label>
                <Input
                  type="number"
                  value={campaignData.duration_days}
                  onChange={(e) => setCampaignData({...campaignData, duration_days: Number(e.target.value)})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!campaignData.offer || !campaignData.target_audience}
              className="w-full bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl"
            >
              Continue to Variants
            </Button>
          </motion.div>
        )}

        {/* Step 2: Generate & Review Variants */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Ad Variants</h3>
              {creatives.length === 0 && (
                <Button
                  onClick={generateVariants}
                  disabled={generatingVariants}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl"
                >
                  {generatingVariants ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Variants
                    </>
                  )}
                </Button>
              )}
            </div>

            {creatives.length > 0 && (
              <>
                <div className="space-y-3">
                  {creatives.map((creative, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className="bg-[#1E90FF]/20 text-[#1E90FF] mb-2">
                            {creative.variant_name}
                          </Badge>
                          {creative.validation && (
                            <div className="flex gap-2">
                              {creative.validation.passes_policy ? (
                                <Badge className="bg-green-500/20 text-green-400 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Policy OK
                                </Badge>
                              ) : (
                                <Badge className="bg-red-500/20 text-red-400 text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Policy Issue
                                </Badge>
                              )}
                              <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                Score: {creative.validation.overall_score}/100
                              </Badge>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyText(creative.primary_text)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">PRIMARY TEXT:</p>
                          <p className="text-white text-sm">{creative.primary_text}</p>
                          <p className="text-gray-500 text-xs mt-1">{creative.primary_text.length} chars</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">HEADLINE:</p>
                          <p className="text-[#00D4C9] font-semibold text-sm">{creative.headline}</p>
                          <p className="text-gray-500 text-xs mt-1">{creative.headline.length} chars</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">DESCRIPTION:</p>
                          <p className="text-gray-400 text-sm">{creative.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">CTA BUTTON:</p>
                            <Badge className="bg-blue-500/20 text-blue-400">{creative.cta}</Badge>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">PREDICTED CTR:</p>
                            <p className="text-[#FFD700] font-bold">{creative.predicted_ctr}%</p>
                          </div>
                        </div>
                        <div className="p-3 bg-[#111317] rounded-lg">
                          <p className="text-gray-500 text-xs mb-1">VISUAL CONCEPT:</p>
                          <p className="text-gray-300 text-sm">{creative.visual_concept}</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <p className="text-green-400 text-xs mb-1">💡 WHY IT WORKS:</p>
                          <p className="text-gray-300 text-sm">{creative.why_it_works}</p>
                        </div>

                        {creative.validation?.issues?.length > 0 && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-xs mb-2">⚠️ ISSUES FOUND:</p>
                            <ul className="space-y-1">
                              {creative.validation.issues.map((issue, iIdx) => (
                                <li key={iIdx} className="text-gray-300 text-xs">• {issue}</li>
                              ))}
                            </ul>
                            {creative.validation.suggested_fixes?.length > 0 && (
                              <>
                                <p className="text-green-400 text-xs mt-2 mb-1">✓ SUGGESTED FIXES:</p>
                                <ul className="space-y-1">
                                  {creative.validation.suggested_fixes.map((fix, fIdx) => (
                                    <li key={fIdx} className="text-gray-300 text-xs">• {fix}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={validateCreatives}
                    disabled={validating}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    {validating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Validate
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl"
                  >
                    Continue to Assets
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Step 3: Select Assets */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-white font-bold text-lg">Select Creative Assets</h3>
            
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <p className="text-gray-400 text-sm mb-3">
                Select images or videos from your ArtLab or Video Studio projects
              </p>
              <p className="text-gray-500 text-xs">
                💡 In production, this would show your Ad Assets library. For now, you can specify asset URLs manually or import from existing projects.
              </p>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <h4 className="text-yellow-400 font-semibold text-sm mb-2">📐 Asset Requirements:</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• <strong>Square (1:1):</strong> 1080x1080 - Feed posts</li>
                <li>• <strong>Portrait (4:5):</strong> 1080x1350 - Feed posts</li>
                <li>• <strong>Vertical (9:16):</strong> 1080x1920 - Reels & Stories</li>
                <li>• <strong>Videos:</strong> Max 60s for Reels, 240s for Feed</li>
                <li>• <strong>Images:</strong> JPG/PNG, max 30MB</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl"
              >
                Continue to Guardrails
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Set Guardrails */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-white font-bold text-lg">Performance Guardrails</h3>
            <p className="text-gray-400 text-sm">Set limits to protect your budget and ensure profitability</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Max CPA (Cost Per Acquisition) $</label>
                <Input
                  type="number"
                  value={guardrails.max_cpa}
                  onChange={(e) => setGuardrails({...guardrails, max_cpa: Number(e.target.value)})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <p className="text-gray-500 text-xs mt-1">AI will pause ads if CPA exceeds this</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Min ROAS (Return on Ad Spend)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={guardrails.min_roas}
                  onChange={(e) => setGuardrails({...guardrails, min_roas: Number(e.target.value)})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <p className="text-gray-500 text-xs mt-1">Target: 2x+ for profitability</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Max Daily Spend $</label>
                <Input
                  type="number"
                  value={guardrails.max_daily_spend}
                  onChange={(e) => setGuardrails({...guardrails, max_daily_spend: Number(e.target.value)})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <p className="text-gray-500 text-xs mt-1">Hard cap on daily spending</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Pause After $ Spend (No Conversions)</label>
                <Input
                  type="number"
                  value={guardrails.pause_if_no_conversions_after_spend}
                  onChange={(e) => setGuardrails({...guardrails, pause_if_no_conversions_after_spend: Number(e.target.value)})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <p className="text-gray-500 text-xs mt-1">Auto-pause if no results after this spend</p>
              </div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h4 className="text-green-400 font-semibold text-sm mb-2">✓ Auto-Optimization Rules:</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Pause variants with CTR &lt; 0.6% after 1,000 impressions</li>
                <li>• Pause if CPA exceeds ${guardrails.max_cpa} after 3 conversions</li>
                <li>• Scale budget +20% if ROAS ≥ {guardrails.min_roas}x for 24 hours</li>
                <li>• Rotate in new variant if 2+ paused in last 24 hours</li>
                <li>• Hard stop if spend &gt; ${guardrails.pause_if_no_conversions_after_spend} with zero conversions</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(3)}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={() => saveDraftsMutation.mutate()}
                disabled={saveDraftsMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
              >
                {saveDraftsMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save & Review
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

      </CardContent>
    </Card>
  );
}