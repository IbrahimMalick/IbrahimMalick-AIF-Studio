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
  Loader2,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart3,
  Copy
} from "lucide-react";

export default function ABTestManager({ user, campaignRun, onTestCreated }) {
  const queryClient = useQueryClient();
  const [testConfig, setTestConfig] = useState({
    test_name: "",
    test_type: "creative",
    hypothesis: "",
    metric: "CTR",
    target_sample_size: 1000,
    confidence_level: 95,
    auto_winner_enabled: true,
    auto_winner_threshold: 95
  });
  const [variants, setVariants] = useState([
    { variant_name: "Control", description: "", config: {} },
    { variant_name: "Variant A", description: "", config: {} }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIVariants = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate A/B test variants for ${testConfig.test_type} testing:

CAMPAIGN: ${campaignRun?.campaign_name || "New Campaign"}
OBJECTIVE: ${campaignRun?.objective || "LEADS"}
CURRENT PERFORMANCE: ${campaignRun ? `Spend: $${campaignRun.total_spend_cents / 100}, ROAS: ${((campaignRun.total_revenue_cents / campaignRun.total_spend_cents) || 0).toFixed(2)}x` : "No data yet"}

TEST TYPE: ${testConfig.test_type}
HYPOTHESIS: ${testConfig.hypothesis}
METRIC TO OPTIMIZE: ${testConfig.metric}

Generate 4 distinct test variants:

${testConfig.test_type === 'creative' ? `
CREATIVE TESTING (Ad Copy, Images, Videos):
- Test different hooks (pattern interrupts, questions, bold statements)
- Test different visuals (lifestyle vs product, bright vs dark, people vs objects)
- Test different CTAs (Learn More, Get Started, Sign Up, Download)
- Test different copywriting styles (short vs long, benefits vs features)

For each variant provide:
1. Primary text (ad copy)
2. Headline
3. Description
4. Visual concept (what the image/video should show)
5. CTA button
6. What hypothesis this tests
` : testConfig.test_type === 'targeting' ? `
TARGETING TESTING (Audience, Placements, Demographics):
- Test different age ranges
- Test different interest combinations
- Test different placements (feed vs stories vs reels)
- Test broad vs narrow targeting

For each variant provide:
1. Target age range
2. Target interests/behaviors
3. Geographic focus
4. Placements to use
5. What hypothesis this tests
` : testConfig.test_type === 'offer' ? `
OFFER TESTING (Pricing, Positioning, Value Prop):
- Test different price points
- Test different guarantees/risk reversals
- Test different bonus structures
- Test different positioning (pain vs gain)

For each variant provide:
1. Price point
2. Main value proposition
3. Guarantee/risk reversal
4. Bonuses included
5. Positioning angle (what problem it solves)
6. What hypothesis this tests
` : `
FULL FUNNEL TESTING (Landing Pages, Sequences, Flows):
- Test different landing page layouts
- Test different headline formulas
- Test different video placements
- Test different form lengths

For each variant provide:
1. Landing page structure
2. Headline formula
3. Form configuration
4. Follow-up sequence
5. What hypothesis this tests
`}

Make variants MEANINGFULLY DIFFERENT - we want to test real hypotheses, not minor tweaks.`,
        response_json_schema: {
          type: "object",
          properties: {
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variant_name: { type: "string" },
                  description: { type: "string" },
                  hypothesis: { type: "string" },
                  config: {
                    type: "object",
                    properties: {
                      primary_text: { type: "string" },
                      headline: { type: "string" },
                      description_text: { type: "string" },
                      visual_concept: { type: "string" },
                      cta: { type: "string" },
                      targeting: { type: "object" },
                      offer_details: { type: "object" },
                      landing_page_config: { type: "object" }
                    }
                  },
                  expected_impact: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            },
            test_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            statistical_notes: { type: "string" }
          }
        }
      });

      setVariants([
        { variant_name: "Control", description: "Original/current configuration", config: {}, users_assigned: 0, conversions: 0 },
        ...result.variants.map((v, idx) => ({
          variant_id: `variant_${idx + 1}`,
          variant_name: v.variant_name,
          description: v.description,
          hypothesis: v.hypothesis,
          config: v.config,
          expected_impact: v.expected_impact,
          users_assigned: 0,
          conversions: 0,
          conversion_rate: 0
        }))
      ]);

      alert(`✅ AI Generated ${result.variants.length + 1} Test Variants!

🎯 TEST RECOMMENDATIONS:
${result.test_recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

📊 STATISTICAL NOTES:
${result.statistical_notes}

Review variants below and click "Launch Test" when ready.`);

    } catch (error) {
      alert("Error generating variants. Please try again.");
      console.error(error);
    }
    setIsGenerating(false);
  };

  const createABTest = async () => {
    if (!testConfig.test_name || !testConfig.hypothesis) {
      alert("Please fill in test name and hypothesis");
      return;
    }

    if (variants.length < 2) {
      alert("Need at least 2 variants (control + 1 test)");
      return;
    }

    try {
      const test = await base44.entities.ABTest.create({
        test_name: testConfig.test_name,
        hypothesis: testConfig.hypothesis,
        variants: variants,
        status: "running",
        metric: testConfig.metric,
        target_sample_size: testConfig.target_sample_size,
        confidence_level: testConfig.confidence_level
      });

      // Log copilot action
      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `create_ab_test_${testConfig.test_type}`,
        intent: "optimize_ad",
        params: {
          test_type: testConfig.test_type,
          variants_count: variants.length,
          metric: testConfig.metric
        },
        mode: "planner",
        status: "success"
      });

      queryClient.invalidateQueries(["abTests"]);
      
      if (onTestCreated) onTestCreated(test);

      alert(`✅ A/B Test Created!

🧪 TEST: ${testConfig.test_name}
📊 VARIANTS: ${variants.length}
🎯 OPTIMIZING FOR: ${testConfig.metric}
👥 TARGET SAMPLE: ${testConfig.target_sample_size} users

${testConfig.auto_winner_enabled ? `\n⚡ AUTO-WINNER: Enabled (at ${testConfig.auto_winner_threshold}% confidence)\n` : ''}
Test is now running. Check results in 24-48 hours.`);

    } catch (error) {
      alert("Error creating test. Please try again.");
      console.error(error);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        variant_name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
        description: "",
        config: {},
        users_assigned: 0,
        conversions: 0
      }
    ]);
  };

  const updateVariant = (idx, field, value) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

  const testTypes = [
    { value: "creative", label: "Ad Creative", desc: "Test copy, images, videos, hooks" },
    { value: "targeting", label: "Audience Targeting", desc: "Test demographics, interests, placements" },
    { value: "offer", label: "Offer Positioning", desc: "Test pricing, guarantees, bonuses" },
    { value: "landing_page", label: "Landing Page", desc: "Test layouts, headlines, forms" },
    { value: "sequence", label: "Follow-Up Sequence", desc: "Test email/SMS timing and copy" }
  ];

  const metrics = [
    { value: "CTR", label: "Click-Through Rate", desc: "Ad engagement" },
    { value: "CVR", label: "Conversion Rate", desc: "Landing page performance" },
    { value: "CPA", label: "Cost Per Acquisition", desc: "Efficiency" },
    { value: "ROAS", label: "Return on Ad Spend", desc: "Profitability" },
    { value: "CPL", label: "Cost Per Lead", desc: "Lead gen efficiency" },
    { value: "Engagement", label: "Engagement Rate", desc: "Social engagement" }
  ];

  return (
    <div className="space-y-6">

      {/* Test Configuration */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#FFD700]" />
            A/B Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Test Name</label>
              <Input
                value={testConfig.test_name}
                onChange={(e) => setTestConfig({...testConfig, test_name: e.target.value})}
                placeholder="e.g., Hook Variations Test"
                className="bg-[#0B0B0C] border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Test Type</label>
              <Select value={testConfig.test_type} onValueChange={(val) => setTestConfig({...testConfig, test_type: val})}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-gray-500 text-xs mt-1">
                {testTypes.find(t => t.value === testConfig.test_type)?.desc}
              </p>
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Hypothesis (What are we testing?)</label>
            <Textarea
              value={testConfig.hypothesis}
              onChange={(e) => setTestConfig({...testConfig, hypothesis: e.target.value})}
              placeholder="e.g., Question-based hooks will outperform statement-based hooks"
              className="bg-[#0B0B0C] border-gray-700 text-white h-20"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Primary Metric</label>
              <Select value={testConfig.metric} onValueChange={(val) => setTestConfig({...testConfig, metric: val})}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map(metric => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Sample Size</label>
              <Input
                type="number"
                value={testConfig.target_sample_size}
                onChange={(e) => setTestConfig({...testConfig, target_sample_size: parseInt(e.target.value) || 1000})}
                className="bg-[#0B0B0C] border-gray-700 text-white"
                min="100"
                max="100000"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Confidence Level</label>
              <Select value={testConfig.confidence_level.toString()} onValueChange={(val) => setTestConfig({...testConfig, confidence_level: parseInt(val)})}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90% Confidence</SelectItem>
                  <SelectItem value="95">95% Confidence</SelectItem>
                  <SelectItem value="99">99% Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">⚡ Auto-Winner Selection</p>
                <p className="text-gray-400 text-xs">
                  Automatically declare winner when confidence reaches {testConfig.auto_winner_threshold}%
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={testConfig.auto_winner_enabled}
                  onChange={(e) => setTestConfig({...testConfig, auto_winner_enabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#00D4C9] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>

          <Button
            onClick={generateAIVariants}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] text-white font-bold h-12"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating AI Variants...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Test Variants
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Variant Editor */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Test Variants ({variants.length})</CardTitle>
            <Button
              onClick={addVariant}
              size="sm"
              variant="outline"
              className="border-gray-700 text-white"
            >
              + Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variants.map((variant, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-2 ${
                idx === 0 
                  ? 'border-blue-500/30 bg-blue-500/5' 
                  : 'border-gray-800 bg-[#0B0B0C]'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {idx === 0 && (
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        Control
                      </Badge>
                    )}
                    <Input
                      value={variant.variant_name}
                      onChange={(e) => updateVariant(idx, 'variant_name', e.target.value)}
                      className="bg-[#111317] border-gray-700 text-white w-48"
                      placeholder="Variant name"
                    />
                  </div>
                  {idx > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Description</label>
                    <Input
                      value={variant.description}
                      onChange={(e) => updateVariant(idx, 'description', e.target.value)}
                      className="bg-[#111317] border-gray-700 text-white"
                      placeholder="What makes this variant different?"
                    />
                  </div>

                  {variant.hypothesis && (
                    <div className="p-2 bg-[#111317] rounded border border-gray-800">
                      <p className="text-gray-400 text-xs mb-1">Hypothesis:</p>
                      <p className="text-gray-300 text-xs">{variant.hypothesis}</p>
                    </div>
                  )}

                  {testConfig.test_type === 'creative' && variant.config?.primary_text && (
                    <div className="space-y-2">
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-gray-400 text-xs mb-1">Primary Text:</p>
                        <p className="text-white text-sm">{variant.config.primary_text}</p>
                      </div>
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-gray-400 text-xs mb-1">Headline:</p>
                        <p className="text-white text-sm font-bold">{variant.config.headline}</p>
                      </div>
                      {variant.config.visual_concept && (
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-400 text-xs mb-1">Visual Concept:</p>
                          <p className="text-gray-300 text-xs">{variant.config.visual_concept}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {variant.expected_impact && (
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Expected: {variant.expected_impact}</span>
                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                        {Math.round(variant.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Split */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-sm">Traffic Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {variants.map((variant, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm mb-1">{variant.variant_name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] h-2 rounded-full transition-all"
                        style={{ width: `${100 / variants.length}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs w-12 text-right">
                      {(100 / variants.length).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Traffic is split evenly. AI will automatically adjust allocation to winning variants after statistical significance is reached.
          </p>
        </CardContent>
      </Card>

      {/* Launch Button */}
      <Card className="bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-black font-bold text-xl mb-1">Ready to Launch?</h3>
              <p className="text-black/80 text-sm">
                Test will run until statistical significance is reached
              </p>
            </div>
            <Button
              onClick={createABTest}
              className="bg-black text-white font-bold hover:bg-gray-900 h-12 px-8"
            >
              <Zap className="w-4 h-4 mr-2" />
              Launch A/B Test
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}