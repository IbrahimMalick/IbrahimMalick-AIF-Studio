import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Brain,
  Loader2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Target,
  Sparkles,
  BarChart3
} from "lucide-react";

export default function AutoABTestEngine({ user, campaigns }) {
  const [isScanning, setIsScanning] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [autoTestsRunning, setAutoTestsRunning] = useState(0);

  const { data: activeTests = [] } = useQuery({
    queryKey: ["abTests", user.email],
    queryFn: () => base44.entities.ABTest.filter({
      status: { $in: ["draft", "running"] }
    }, "-created_date"),
    enabled: !!user
  });

  useEffect(() => {
    setAutoTestsRunning(activeTests.filter(t => t.test_name?.includes("[AUTO]")).length);
  }, [activeTests]);

  const scanForTestOpportunities = async () => {
    setIsScanning(true);
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze active campaigns and identify A/B testing opportunities:

ACTIVE CAMPAIGNS: ${campaigns.length}

${campaigns.map((c, i) => `
Campaign ${i + 1}: ${c.campaign_name}
- Status: ${c.status}
- Objective: ${c.objective}
- Daily Budget: $${c.daily_budget_cents / 100}
- Total Spend: $${c.total_spend_cents / 100}
- Revenue: $${c.total_revenue_cents / 100}
- ROAS: ${((c.total_revenue_cents / c.total_spend_cents) || 0).toFixed(2)}x
- Learning Phase: ${c.learning_phase}
- Ad Sets: ${c.ad_set_ids?.length || 0}
`).join('\n---\n')}

Identify A/B testing opportunities:

1. UNDERPERFORMING CAMPAIGNS:
   - Low CTR, high CPA, stuck in learning
   - What to test to improve

2. SCALING CANDIDATES:
   - Good performance but untested assumptions
   - What to test before scaling budget

3. STALE CREATIVES:
   - Campaigns running > 7 days with same creative
   - Need fresh variants

4. TARGETING OPTIMIZATION:
   - Broad targeting that could be refined
   - Narrow targeting that could expand

5. OFFER POSITIONING:
   - Single offer angle that could be tested
   - Pricing that hasn't been validated

For each opportunity provide:
- Campaign name
- Issue detected
- Test type to run (creative/targeting/offer)
- Hypothesis to test
- Expected impact
- Priority (high/medium/low)
- Auto-test feasibility (can AI auto-generate variants?)`,
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campaign_name: { type: "string" },
                  campaign_id: { type: "string" },
                  issue: { type: "string" },
                  test_type: { type: "string" },
                  hypothesis: { type: "string" },
                  expected_impact: { type: "string" },
                  priority: { type: "string" },
                  auto_test_feasible: { type: "boolean" },
                  variants_to_test: { type: "number" },
                  estimated_test_duration_days: { type: "number" }
                }
              }
            },
            overall_testing_health: {
              type: "object",
              properties: {
                score: { type: "number" },
                status: { type: "string" },
                recommendations: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setOpportunities(analysis.opportunities);

      alert(`🔍 Test Opportunity Scan Complete!

📊 TESTING HEALTH: ${analysis.overall_testing_health.score}/100 (${analysis.overall_testing_health.status})

🎯 OPPORTUNITIES FOUND: ${analysis.opportunities.length}
• High Priority: ${analysis.opportunities.filter(o => o.priority === 'high').length}
• Medium Priority: ${analysis.opportunities.filter(o => o.priority === 'medium').length}
• Auto-Test Ready: ${analysis.opportunities.filter(o => o.auto_test_feasible).length}

📋 TOP RECOMMENDATIONS:
${analysis.overall_testing_health.recommendations.slice(0, 3).map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

Review opportunities below!`);

    } catch (error) {
      alert("Error scanning for opportunities. Please try again.");
      console.error(error);
    }
    setIsScanning(false);
  };

  const launchAutoTest = async (opportunity) => {
    if (!confirm(`Launch auto A/B test for "${opportunity.campaign_name}"?\n\nThis will:\n1. Generate ${opportunity.variants_to_test} AI variants\n2. Split traffic evenly\n3. Run for ~${opportunity.estimated_test_duration_days} days\n4. Auto-declare winner at 95% confidence`)) {
      return;
    }

    try {
      // Generate variants using AI
      const variantsResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ${opportunity.variants_to_test} A/B test variants for:

CAMPAIGN: ${opportunity.campaign_name}
TEST TYPE: ${opportunity.test_type}
HYPOTHESIS: ${opportunity.hypothesis}
ISSUE: ${opportunity.issue}

Create distinct, high-impact variants that test the hypothesis.`,
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
                  config: { type: "object" }
                }
              }
            }
          }
        }
      });

      // Create A/B test
      const test = await base44.entities.ABTest.create({
        test_name: `[AUTO] ${opportunity.campaign_name} - ${opportunity.test_type}`,
        hypothesis: opportunity.hypothesis,
        variants: [
          { variant_name: "Control", description: "Current configuration", config: {}, users_assigned: 0, conversions: 0 },
          ...variantsResult.variants.map((v, idx) => ({
            variant_id: `variant_${idx + 1}`,
            ...v,
            users_assigned: 0,
            conversions: 0,
            conversion_rate: 0
          }))
        ],
        status: "running",
        metric: opportunity.test_type === 'creative' ? 'CTR' : opportunity.test_type === 'targeting' ? 'CPA' : 'CVR',
        target_sample_size: 1000,
        confidence_level: 95
      });

      // Remove from opportunities
      setOpportunities(opportunities.filter(o => o.campaign_id !== opportunity.campaign_id));

      alert(`✅ Auto A/B Test Launched!

🧪 TEST: ${opportunity.test_type}
📊 VARIANTS: ${variantsResult.variants.length + 1}
⏱️ DURATION: ~${opportunity.estimated_test_duration_days} days
⚡ AUTO-WINNER: Enabled

AI will monitor and optimize automatically.`);

    } catch (error) {
      alert("Error launching auto test. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">

      {/* Auto-Test Status */}
      <Card className="bg-gradient-to-br from-[#6F1AB1]/10 to-[#A64EE7]/10 border-[#6F1AB1]/30 border-2 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                <Brain className="w-6 h-6 text-[#FFD700]" />
                Auto A/B Test Engine
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                AI automatically identifies testing opportunities and generates variants
              </p>
              <div className="flex gap-2">
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {autoTestsRunning} auto-tests running
                </Badge>
                <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                  {opportunities.length} opportunities found
                </Badge>
              </div>
            </div>
            <Button
              onClick={scanForTestOpportunities}
              disabled={isScanning}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold h-12"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Scan for Opportunities
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Opportunities */}
      {opportunities.length > 0 && (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Test Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${
                  opp.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
                  opp.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
                  'border-blue-500/30 bg-blue-500/5'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-semibold">{opp.campaign_name}</h4>
                        <Badge className={`text-xs ${
                          opp.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          opp.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {opp.priority} priority
                        </Badge>
                        {opp.auto_test_feasible && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Auto-Test Ready
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 bg-[#0B0B0C] rounded">
                          <p className="text-gray-400 text-xs mb-1">Issue:</p>
                          <p className="text-gray-300 text-sm">{opp.issue}</p>
                        </div>
                        <div className="p-2 bg-[#0B0B0C] rounded">
                          <p className="text-gray-400 text-xs mb-1">Hypothesis to Test:</p>
                          <p className="text-white text-sm">{opp.hypothesis}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Test Type: <span className="text-white font-medium capitalize">{opp.test_type}</span></span>
                          <span className="text-gray-400">Duration: <span className="text-white font-medium">~{opp.estimated_test_duration_days} days</span></span>
                          <span className="text-[#00D4C9]">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {opp.expected_impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {opp.auto_test_feasible ? (
                      <Button
                        onClick={() => launchAutoTest(opp)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black font-semibold"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Launch Auto-Test
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-700 text-white"
                      >
                        <Target className="w-4 h-4 mr-1" />
                        Create Manual Test
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-400"
                      onClick={() => setOpportunities(opportunities.filter((_, i) => i !== idx))}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Test Best Practices */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-sm">🧪 Auto A/B Testing Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h5 className="text-white font-semibold text-sm mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Test One Thing
              </h5>
              <p className="text-gray-400 text-xs">
                Change only one variable (creative OR targeting OR offer) per test for clear results
              </p>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h5 className="text-white font-semibold text-sm mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Adequate Sample
              </h5>
              <p className="text-gray-400 text-xs">
                Wait for 95%+ statistical confidence before declaring winner. Typically 1,000-5,000 users minimum
              </p>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h5 className="text-white font-semibold text-sm mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Meaningful Variants
              </h5>
              <p className="text-gray-400 text-xs">
                Test big differences (different hooks, visuals, angles) not minor tweaks
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs">
              💡 <strong>Pro Tip:</strong> Run 2-3 A/B tests simultaneously (on different campaigns) to learn faster. 
              AI will automatically pause losing variants and scale winners.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}