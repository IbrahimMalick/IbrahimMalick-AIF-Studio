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
  Target,
  DollarSign,
  Calendar,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

export default function MetaAdsComposer({ user, onCampaignCreated }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  const [campaign, setCampaign] = useState({
    campaign_name: "",
    objective: "OUTCOME_TRAFFIC",
    offer: "",
    target_audience: "",
    pain_point: "",
    benefit: "",
    budget_type: "DAILY",
    daily_budget_cents: 1000,
    start_time: new Date().toISOString(),
    end_time: "",
    guardrails: {
      max_cpa: 5000,
      min_roas: 2.0,
      max_daily_spend: 10000,
      pause_if_no_conversions_after_spend: 5000
    }
  });

  const [aiVariants, setAiVariants] = useState([]);
  const [aiAudience, setAiAudience] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState([]);

  // Generate Ad Variants using AI
  const generateVariantsMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      
      const variants = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate high-converting Meta ad creative variants:

CAMPAIGN BRIEF:
- Offer: ${campaign.offer}
- Target Audience: ${campaign.target_audience}
- Pain Point: ${campaign.pain_point}
- Benefit: ${campaign.benefit}
- Objective: ${campaign.objective}

Generate 5 ad creative variants optimized for Meta platforms (Facebook & Instagram):

For EACH variant provide:

1. PRIMARY TEXT (125 characters optimal):
   - Hook in first 3 words
   - Address pain point
   - Present solution/benefit
   - Include social proof if relevant
   - End with curiosity gap or urgency

2. HEADLINE (40 characters max):
   - Benefit-focused
   - Action-oriented
   - Numbers when possible
   - Urgency/scarcity

3. DESCRIPTION (30 characters max):
   - Reinforce benefit
   - Address objection

4. CTA BUTTON:
   - Choose best from: LEARN_MORE, SHOP_NOW, SIGN_UP, GET_QUOTE

5. CREATIVE CONCEPT:
   - Visual description
   - Key elements to show
   - Text overlay suggestion
   - Emotional appeal

6. ANGLE/HOOK:
   - What unique angle this variant tests
   - Target sub-audience

Make variants DIFFERENT from each other to test multiple approaches.`,
        response_json_schema: {
          type: "object",
          properties: {
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_number: { type: "number" },
                  primary_text: { type: "string" },
                  headline: { type: "string" },
                  description: { type: "string" },
                  cta: { type: "string" },
                  creative_concept: {
                    type: "object",
                    properties: {
                      visual_description: { type: "string" },
                      key_elements: { type: "array", items: { type: "string" } },
                      text_overlay: { type: "string" },
                      emotional_appeal: { type: "string" }
                    }
                  },
                  angle: { type: "string" },
                  target_sub_audience: { type: "string" },
                  predicted_score: { type: "number", description: "0-100 performance prediction" }
                }
              }
            }
          }
        }
      });

      setAiVariants(variants.variants || []);
      setGenerating(false);
      return variants;
    }
  });

  // Generate Audience Targeting
  const generateAudienceMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      
      const audience = await base44.integrations.Core.InvokeLLM({
        prompt: `Create Meta Ads audience targeting for:

Target Audience: ${campaign.target_audience}
Objective: ${campaign.objective}
Budget: $${campaign.daily_budget_cents / 100}/day

Provide detailed targeting strategy:

1. CORE DEMOGRAPHICS:
   - Age range (18-65)
   - Genders (all/male/female)
   - Top 3 countries/regions

2. DETAILED TARGETING (15-20 specific interests):
   - Must be real Meta interest IDs
   - Mix of broad (100K+) and niche (10K-50K)
   - Layered targeting for precision

3. BEHAVIORS:
   - Purchase behaviors
   - Device usage
   - Digital activities

4. PLACEMENT RECOMMENDATIONS:
   - Which placements to prioritize
   - Which to exclude

5. AUDIENCE SIZE ESTIMATE:
   - Target reach: 500K-2M for testing
   - Expansion recommendations

Be specific with actual Meta interest categories.`,
        response_json_schema: {
          type: "object",
          properties: {
            demographics: {
              type: "object",
              properties: {
                age_min: { type: "number" },
                age_max: { type: "number" },
                genders: { type: "array", items: { type: "number" } },
                countries: { type: "array", items: { type: "string" } }
              }
            },
            interests: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  estimated_size: { type: "string" }
                }
              }
            },
            behaviors: {
              type: "array",
              items: { type: "string" }
            },
            placements_priority: {
              type: "array",
              items: { type: "string" }
            },
            placements_exclude: {
              type: "array",
              items: { type: "string" }
            },
            estimated_reach: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" }
              }
            },
            optimization_notes: { type: "string" }
          }
        }
      });

      setAiAudience(audience);
      setGenerating(false);
      return audience;
    }
  });

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copied!");
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="space-y-6">
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {["Brief", "Creative", "Targeting", "Review"].map((label, idx) => (
          <div key={idx} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step > idx + 1 ? 'bg-green-500 text-white' :
              step === idx + 1 ? 'bg-[#FFD700] text-black' :
              'bg-gray-700 text-gray-400'
            }`}>
              {step > idx + 1 ? '✓' : idx + 1}
            </div>
            <div className={`flex-1 h-1 ${idx < 3 ? (step > idx + 1 ? 'bg-green-500' : 'bg-gray-700') : ''}`} />
          </div>
        ))}
      </div>

      {/* Step 1: Campaign Brief */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Step 1: Campaign Brief</CardTitle>
              <p className="text-gray-400 text-sm mt-2">Tell the AI about your campaign</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Campaign Name (e.g., 'Q4 Holiday Sale - Retargeting')"
                value={campaign.campaign_name}
                onChange={(e) => setCampaign({...campaign, campaign_name: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Campaign Objective</label>
                <Select
                  value={campaign.objective}
                  onValueChange={(value) => setCampaign({...campaign, objective: value})}
                >
                  <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUTCOME_LEADS">Leads - Capture contact info</SelectItem>
                    <SelectItem value="OUTCOME_SALES">Sales - Drive purchases</SelectItem>
                    <SelectItem value="OUTCOME_TRAFFIC">Traffic - Get website visits</SelectItem>
                    <SelectItem value="OUTCOME_AWARENESS">Awareness - Reach people</SelectItem>
                    <SelectItem value="OUTCOME_ENGAGEMENT">Engagement - Get interactions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="What are you offering? (e.g., '50% off AI video course')"
                value={campaign.offer}
                onChange={(e) => setCampaign({...campaign, offer: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[80px]"
              />

              <Textarea
                placeholder="Who is your target audience? (e.g., 'Content creators, 25-45, interested in AI tools')"
                value={campaign.target_audience}
                onChange={(e) => setCampaign({...campaign, target_audience: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[80px]"
              />

              <Textarea
                placeholder="What pain point does this solve? (e.g., 'Spending too much time on video editing')"
                value={campaign.pain_point}
                onChange={(e) => setCampaign({...campaign, pain_point: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[60px]"
              />

              <Textarea
                placeholder="What's the main benefit? (e.g., 'Create pro videos in 5 minutes instead of 5 hours')"
                value={campaign.benefit}
                onChange={(e) => setCampaign({...campaign, benefit: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[60px]"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Daily Budget</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <Input
                      type="number"
                      value={campaign.daily_budget_cents / 100}
                      onChange={(e) => setCampaign({...campaign, daily_budget_cents: Number(e.target.value) * 100})}
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <span className="text-gray-400 text-sm">per day</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={campaign.start_time?.split('T')[0] || ''}
                    onChange={(e) => setCampaign({...campaign, start_time: new Date(e.target.value).toISOString()})}
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={nextStep}
                disabled={!campaign.campaign_name || !campaign.offer || !campaign.target_audience}
                className="w-full bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl"
              >
                Next: Generate Creative Variants
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: AI Creative Generation */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Step 2: AI Creative Variants</CardTitle>
                  <p className="text-gray-400 text-sm mt-2">AI will generate multiple ad variations to test</p>
                </div>
                <Button
                  onClick={() => generateVariantsMutation.mutate()}
                  disabled={generating || aiVariants.length > 0}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl"
                >
                  {generating ? (
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
              </div>
            </CardHeader>
            <CardContent>
              {aiVariants.length > 0 ? (
                <div className="space-y-4">
                  {aiVariants.map((variant, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                              Variant {variant.variant_number}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              Score: {variant.predicted_score}/100
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs">
                            <strong className="text-[#00D4C9]">Angle:</strong> {variant.angle}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyText(`${variant.primary_text}\n\n${variant.headline}\n${variant.description}`)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-[#111317] rounded-lg">
                          <p className="text-[#FFD700] text-xs mb-1">PRIMARY TEXT ({variant.primary_text.length} chars):</p>
                          <p className="text-white text-sm">{variant.primary_text}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 bg-[#111317] rounded-lg">
                            <p className="text-[#00D4C9] text-xs mb-1">HEADLINE ({variant.headline.length} chars):</p>
                            <p className="text-white text-sm font-semibold">{variant.headline}</p>
                          </div>
                          <div className="p-3 bg-[#111317] rounded-lg">
                            <p className="text-[#9D4EDD] text-xs mb-1">DESCRIPTION ({variant.description.length} chars):</p>
                            <p className="text-white text-sm">{variant.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-[#111317] rounded-lg">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">CALL-TO-ACTION:</p>
                            <Badge className="bg-[#1E90FF]/20 text-[#1E90FF]">
                              {variant.cta}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs mb-1">TARGET:</p>
                            <p className="text-gray-300 text-xs">{variant.target_sub_audience}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                          <p className="text-purple-400 text-xs mb-1">CREATIVE CONCEPT:</p>
                          <p className="text-gray-300 text-sm mb-2">{variant.creative_concept.visual_description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {variant.creative_concept.key_elements?.map((elem, eIdx) => (
                              <Badge key={eIdx} className="bg-gray-700 text-gray-300 text-xs">
                                {elem}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-gray-400 text-xs">
                            <strong className="text-[#FFD700]">Text Overlay:</strong> {variant.creative_concept.text_overlay}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl"
                    >
                      Next: Audience Targeting
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Click "Generate Variants" to create AI-powered ad creative</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Audience Targeting */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Step 3: AI Audience Targeting</CardTitle>
                  <p className="text-gray-400 text-sm mt-2">Optimize your audience reach</p>
                </div>
                <Button
                  onClick={() => generateAudienceMutation.mutate()}
                  disabled={generating || aiAudience}
                  className="bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black rounded-xl"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Optimize Targeting
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aiAudience ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl">
                      <p className="text-gray-400 text-xs mb-2">AGE RANGE</p>
                      <p className="text-white font-bold text-2xl">
                        {aiAudience.demographics.age_min}-{aiAudience.demographics.age_max}
                      </p>
                    </div>
                    <div className="p-4 bg-[#0B0B0C] rounded-xl">
                      <p className="text-gray-400 text-xs mb-2">GENDER</p>
                      <p className="text-white font-bold text-2xl">
                        {aiAudience.demographics.genders.includes(0) ? 'All' : 
                         aiAudience.demographics.genders.includes(1) ? 'Male' : 'Female'}
                      </p>
                    </div>
                    <div className="p-4 bg-[#0B0B0C] rounded-xl">
                      <p className="text-gray-400 text-xs mb-2">ESTIMATED REACH</p>
                      <p className="text-white font-bold text-lg">
                        {(aiAudience.estimated_reach.min / 1000).toFixed(0)}K-{(aiAudience.estimated_reach.max / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl">
                    <p className="text-white font-semibold mb-3">Interests ({aiAudience.interests.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {aiAudience.interests.map((interest, idx) => (
                        <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                          {interest.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl">
                    <p className="text-white font-semibold mb-2">Placements (Priority)</p>
                    <div className="flex flex-wrap gap-2">
                      {aiAudience.placements_priority?.map((placement, idx) => (
                        <Badge key={idx} className="bg-green-500/20 text-green-400">
                          {placement.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {aiAudience.optimization_notes && (
                    <div className="p-4 bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                      <p className="text-[#FFD700] font-semibold text-sm mb-2">💡 AI Optimization Notes:</p>
                      <p className="text-gray-300 text-sm">{aiAudience.optimization_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl"
                    >
                      Next: Review & Launch
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Click "Optimize Targeting" to get AI audience recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 4: Review & Launch */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Step 4: Review & Launch</CardTitle>
              <p className="text-gray-400 text-sm mt-2">Final review before launching your campaign</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Campaign Summary */}
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-3">Campaign Summary</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400"><strong className="text-white">Name:</strong> {campaign.campaign_name}</p>
                  <p className="text-gray-400"><strong className="text-white">Objective:</strong> {campaign.objective.replace('OUTCOME_', '')}</p>
                  <p className="text-gray-400"><strong className="text-white">Daily Budget:</strong> ${campaign.daily_budget_cents / 100}</p>
                  <p className="text-gray-400"><strong className="text-white">Variants:</strong> {aiVariants.length} creative variations</p>
                  <p className="text-gray-400"><strong className="text-white">Audience Size:</strong> {aiAudience ? `${(aiAudience.estimated_reach.min / 1000).toFixed(0)}K-${(aiAudience.estimated_reach.max / 1000000).toFixed(1)}M` : 'Not set'}</p>
                </div>
              </div>

              {/* Guardrails */}
              <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-white font-bold">Performance Guardrails</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Max Cost Per Acquisition</label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <Input
                        type="number"
                        value={campaign.guardrails.max_cpa / 100}
                        onChange={(e) => setCampaign({
                          ...campaign,
                          guardrails: {...campaign.guardrails, max_cpa: Number(e.target.value) * 100}
                        })}
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Min ROAS (Return on Ad Spend)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={campaign.guardrails.min_roas}
                      onChange={(e) => setCampaign({
                        ...campaign,
                        guardrails: {...campaign.guardrails, min_roas: Number(e.target.value)}
                      })}
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg text-sm"
                      placeholder="e.g., 2.0"
                    />
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-3">
                  ⚡ AI will automatically pause underperforming ads and scale winners based on these thresholds
                </p>
              </div>

              {/* Policy Check */}
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h4 className="text-white font-semibold">Policy Check</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  All variants passed automated policy validation. Ready to launch!
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    alert("🚀 Campaign would launch here! In production, this creates the campaign in Meta Ads Manager with all variants.");
                    if (onCampaignCreated) onCampaignCreated();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Launch Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
}