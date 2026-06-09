import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Target,
  Brain,
  Loader2,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Copy,
  Download,
  Rocket
} from "lucide-react";

function getBuyerTypeProfile(type) {
  const profiles = {
    visionary: "Future-focused, innovation-driven. Responds to: transformation, vision, possibilities, being first/unique.",
    analyst: "Data-driven, logical. Needs: statistics, case studies, ROI calculations, detailed breakdowns.",
    skeptic: "Risk-averse, cautious. Requires: proof, guarantees, testimonials, detailed FAQ, risk reversals.",
    follower: "Social validation-driven. Responds to: social proof, authority figures, 'everyone's doing it', testimonials.",
    emotional: "Feeling-driven, empathetic. Connects with: stories, emotions, personal transformation, community."
  };
  return profiles[type] || profiles.visionary;
}

export default function OfferBuilder() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    product: "",
    audience: "",
    buyer_type: "visionary",
    goal: "lead_gen",
    constraints: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOffer, setGeneratedOffer] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: offers = [] } = useQuery({
    queryKey: ["offers", user?.email],
    queryFn: () => base44.entities.OfferBlueprint.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const createOfferMutation = useMutation({
    mutationFn: (data) => base44.entities.OfferBlueprint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["offers"]);
    }
  });

  const generateOffer = async () => {
    if (!formData.product || !formData.audience) {
      alert("Please fill in product and audience");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert copywriter and marketing strategist. Create a high-converting offer using the Pain → Dream → Vehicle → Proof → CTA framework.

INPUT:
• Product/Service: ${formData.product}
• Target Audience: ${formData.audience}
• Buyer Type: ${formData.buyer_type}
• Goal: ${formData.goal}
• Constraints: ${formData.constraints || 'None'}

BUYER TYPE PROFILE:
${getBuyerTypeProfile(formData.buyer_type)}

Generate a complete offer blueprint with:

1. OFFER SUMMARY (120 words max)
   - Clear, compelling summary of the offer
   - Emphasize transformation, not features

2. HOOKS (5 variations, 8 words each)
   - Attention-grabbing opening lines
   - Tailored to ${formData.buyer_type} archetype
   - Use pattern interrupts

3. VALUE STACK (3 core benefits)
   - What they get
   - Transformation promised
   - Quantifiable results

4. RISK REVERSALS (2 guarantees)
   - Eliminate purchase anxiety
   - Make it a no-brainer

5. CTAs (Primary + Secondary)
   - Clear, action-oriented
   - Urgency without pressure

6. 30-SECOND REEL SCRIPT
   - Hook (3 seconds)
   - Story/Problem (12 seconds)
   - Solution (10 seconds)
   - CTA (5 seconds)

7. LANDING PAGE SECTIONS
   - H1 Headline
   - Subheadline
   - 3 Proof Blocks
   - 3 FAQ items

8. BUYER TYPE VARIATIONS
   - Customized copy for all 5 archetypes
   - Same offer, different positioning

9. BELIEF ALIGNMENT SCORES (0-100)
   - Desire Activation
   - Trust Cues
   - Pain Resolution
   - Status Gain
   - Social Proof
   - Future Pacing
   - Risk Reversal
   - CTA Clarity

10. TOP 3 IMPROVEMENTS
    - Specific recommendations to increase conversion`,
        response_json_schema: {
          type: "object",
          properties: {
            offer_summary: { type: "string" },
            hooks: { type: "array", items: { type: "string" } },
            value_stack: { type: "array", items: { type: "string" } },
            risk_reversals: { type: "array", items: { type: "string" } },
            ctas: {
              type: "object",
              properties: {
                primary: { type: "string" },
                secondary: { type: "string" }
              }
            },
            reel_script: {
              type: "object",
              properties: {
                hook: { type: "string" },
                story: { type: "string" },
                cta: { type: "string" },
                duration_seconds: { type: "number" }
              }
            },
            landing_page_sections: {
              type: "object",
              properties: {
                h1: { type: "string" },
                subhead: { type: "string" },
                proof_blocks: { type: "array", items: { type: "string" } },
                faq: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" }
                    }
                  }
                }
              }
            },
            buyer_type_variations: {
              type: "object",
              properties: {
                visionary: { type: "string" },
                analyst: { type: "string" },
                skeptic: { type: "string" },
                follower: { type: "string" },
                emotional: { type: "string" }
              }
            },
            belief_scores: {
              type: "object",
              properties: {
                desire_activation: { type: "number" },
                trust_cues: { type: "number" },
                pain_resolution: { type: "number" },
                status_gain: { type: "number" },
                social_proof: { type: "number" },
                future_pacing: { type: "number" },
                risk_reversal: { type: "number" },
                cta_clarity: { type: "number" }
              }
            },
            improvements: { type: "array", items: { type: "string" } }
          }
        }
      });

      const totalScore = Object.values(result.belief_scores).reduce((sum, score) => sum + score, 0) / 8;

      const offer = await createOfferMutation.mutateAsync({
        user_email: user.email,
        product: formData.product,
        audience: formData.audience,
        buyer_type: formData.buyer_type,
        goal: formData.goal,
        constraints: formData.constraints,
        offer_summary: result.offer_summary,
        hooks: result.hooks,
        value_stack: result.value_stack,
        risk_reversals: result.risk_reversals,
        ctas: result.ctas,
        reel_script: result.reel_script,
        landing_page_sections: result.landing_page_sections,
        buyer_type_variations: result.buyer_type_variations,
        belief_alignment_score: Math.round(totalScore),
        belief_scores: result.belief_scores,
        improvements: result.improvements,
        status: "optimized"
      });

      setGeneratedOffer(offer);

      alert(`✅ Offer Generated!

📊 BELIEF ALIGNMENT SCORE: ${Math.round(totalScore)}/100

✨ TOP 3 IMPROVEMENTS:
${result.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

🎯 NEXT STEPS:
1. Review generated copy below
2. Build follow-up sequence
3. Deploy funnel with Meta ads
4. Track in Funnel Analytics

Your offer is ready to deploy!`);

    } catch (error) {
      alert("Error generating offer. Please try again.");
      console.error(error);
    }

    setIsGenerating(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Offer & Messaging Module</h1>
            <p className="text-gray-400">AI-driven copy with belief-alignment scoring</p>
          </div>
          {generatedOffer && (
            <Badge className="bg-green-500/20 text-green-400 text-sm px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Offer Ready
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Input Form */}
          <Card className="lg:col-span-1 bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FFD700]" />
                Create Offer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Product/Service</label>
                <Input
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  placeholder="e.g., High-ticket coaching program"
                  className="bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Target Audience</label>
                <Textarea
                  value={formData.audience}
                  onChange={(e) => setFormData({...formData, audience: e.target.value})}
                  placeholder="e.g., Real estate agents wanting 10+ listings/month"
                  className="bg-[#0B0B0C] border-gray-700 text-white h-20"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Buyer Type</label>
                <Select value={formData.buyer_type} onValueChange={(val) => setFormData({...formData, buyer_type: val})}>
                  <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visionary">Visionary (Big picture, future-focused)</SelectItem>
                    <SelectItem value="analyst">Analyst (Data-driven, logical)</SelectItem>
                    <SelectItem value="skeptic">Skeptic (Risk-averse, proof-seeking)</SelectItem>
                    <SelectItem value="follower">Follower (Social proof, authority)</SelectItem>
                    <SelectItem value="emotional">Emotional (Story-driven, empathy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Conversion Goal</label>
                <Select value={formData.goal} onValueChange={(val) => setFormData({...formData, goal: val})}>
                  <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_gen">Lead Generation</SelectItem>
                    <SelectItem value="booked_calls">Booked Calls</SelectItem>
                    <SelectItem value="low_ticket_sale">Low-Ticket Sale</SelectItem>
                    <SelectItem value="high_ticket_sale">High-Ticket Sale</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Constraints (Optional)</label>
                <Input
                  value={formData.constraints}
                  onChange={(e) => setFormData({...formData, constraints: e.target.value})}
                  placeholder="e.g., $500 budget, 7-day launch"
                  className="bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>

              <Button
                onClick={generateOffer}
                disabled={isGenerating || !formData.product || !formData.audience}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Offer
                  </>
                )}
              </Button>

              <p className="text-gray-500 text-xs">
                ⚡ AI analyzes 8 belief factors and generates customized copy in ~30 seconds
              </p>

            </CardContent>
          </Card>

          {/* Generated Offer Display */}
          <div className="lg:col-span-2 space-y-6">
            
            {generatedOffer ? (
              <>
                {/* Belief Scores */}
                <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 border-2 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Belief Alignment Score</CardTitle>
                      <div className="text-right">
                        <p className="text-5xl font-bold text-white">{generatedOffer.belief_alignment_score}</p>
                        <p className="text-gray-400 text-sm">out of 100</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(generatedOffer.belief_scores || {}).map(([key, score]) => (
                        <div key={key} className="p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-400 text-xs capitalize mb-1">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] h-2 rounded-full"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-white text-sm font-bold">{score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Offer Summary & Hooks */}
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#FFD700]" />
                      Offer Summary & Hooks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">Summary</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedOffer.offer_summary)}
                          className="border-gray-700 text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{generatedOffer.offer_summary}</p>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-3">Attention Hooks</h4>
                      <div className="space-y-2">
                        {generatedOffer.hooks?.map((hook, idx) => (
                          <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg flex items-center justify-between">
                            <p className="text-gray-300 text-sm">{hook}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(hook)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reel Script */}
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">30-Second Reel Script</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg border-l-4 border-red-500">
                        <p className="text-red-400 text-xs font-semibold mb-1">HOOK (0-3s)</p>
                        <p className="text-white text-sm">{generatedOffer.reel_script?.hook}</p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg border-l-4 border-yellow-500">
                        <p className="text-yellow-400 text-xs font-semibold mb-1">STORY (3-15s)</p>
                        <p className="text-white text-sm">{generatedOffer.reel_script?.story}</p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg border-l-4 border-green-500">
                        <p className="text-green-400 text-xs font-semibold mb-1">CTA (25-30s)</p>
                        <p className="text-white text-sm">{generatedOffer.reel_script?.cta}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-[#1E90FF] to-[#9D4EDD] text-white font-bold"
                      onClick={() => copyToClipboard(`${generatedOffer.reel_script?.hook}\n\n${generatedOffer.reel_script?.story}\n\n${generatedOffer.reel_script?.cta}`)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Full Script
                    </Button>
                  </CardContent>
                </Card>

                {/* Improvements */}
                <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#FFD700]" />
                      Top 3 Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedOffer.improvements?.map((improvement, idx) => (
                        <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                            <span className="text-black font-bold text-sm">{idx + 1}</span>
                          </div>
                          <p className="text-gray-300 text-sm flex-1">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps CTA */}
                <Card className="bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] rounded-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-black font-bold text-xl mb-2">Ready to Deploy?</h3>
                        <p className="text-black/80 text-sm">Build your follow-up sequence and launch your funnel</p>
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-black text-white font-bold hover:bg-gray-900">
                          Build Follow-Up →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </>
            ) : (
              <Card className="lg:col-span-2 bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-16 text-center">
                  <Target className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">No offer generated yet</p>
                  <p className="text-gray-500 text-sm">Fill in the form and click "Generate Offer" to get started</p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {/* Previous Offers */}
        {offers.length > 0 && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Previous Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    onClick={() => setGeneratedOffer(offer)}
                    className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FFD700] cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-semibold">{offer.product}</h4>
                        <p className="text-gray-500 text-xs">{offer.audience}</p>
                      </div>
                      <Badge className={`${
                        offer.belief_alignment_score >= 80 ? 'bg-green-500/20 text-green-400' :
                        offer.belief_alignment_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {offer.belief_alignment_score}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2">{offer.offer_summary}</p>
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