import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  X,
  CheckCircle2,
  Zap,
  Target,
  HelpCircle,
  ArrowRight,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProactiveCopilot({ user, currentPage, pageContext }) {
  const [suggestions, setSuggestions] = useState([]);
  const [struggleDetected, setStruggleDetected] = useState(null);
  const [abandonIntent, setAbandonIntent] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [interactionTracking, setInteractionTracking] = useState({
    timeOnPage: 0,
    clicks: 0,
    formAttempts: 0,
    errorEncounters: 0,
    backButtonClicks: 0,
    idleTime: 0,
    lastAction: Date.now()
  });

  // Track user behavior for struggle detection
  useEffect(() => {
    let idleTimer;
    let pageTimer;

    const trackClick = () => {
      setInteractionTracking(prev => ({
        ...prev,
        clicks: prev.clicks + 1,
        lastAction: Date.now(),
        idleTime: 0
      }));
    };

    const trackMouseMove = () => {
      setInteractionTracking(prev => ({
        ...prev,
        lastAction: Date.now(),
        idleTime: 0
      }));
    };

    const trackBeforeUnload = (e) => {
      // Detect potential abandon
      if (interactionTracking.timeOnPage < 30 || interactionTracking.clicks < 3) {
        detectAbandonIntent();
      }
    };

    // Track page time
    pageTimer = setInterval(() => {
      setInteractionTracking(prev => ({
        ...prev,
        timeOnPage: prev.timeOnPage + 1,
        idleTime: (Date.now() - prev.lastAction) / 1000
      }));
    }, 1000);

    // Idle detection
    idleTimer = setInterval(() => {
      const idleSeconds = (Date.now() - interactionTracking.lastAction) / 1000;
      if (idleSeconds > 30 && interactionTracking.timeOnPage > 60) {
        checkForStruggle();
      }
    }, 5000);

    document.addEventListener('click', trackClick);
    document.addEventListener('mousemove', trackMouseMove);
    window.addEventListener('beforeunload', trackBeforeUnload);

    return () => {
      clearInterval(idleTimer);
      clearInterval(pageTimer);
      document.removeEventListener('click', trackClick);
      document.removeEventListener('mousemove', trackMouseMove);
      window.removeEventListener('beforeunload', trackBeforeUnload);
    };
  }, [interactionTracking.lastAction]);

  // Struggle Detection Algorithm
  const checkForStruggle = async () => {
    const indicators = {
      longIdleTime: interactionTracking.idleTime > 30,
      fewClicks: interactionTracking.clicks < 5 && interactionTracking.timeOnPage > 120,
      multipleFormAttempts: interactionTracking.formAttempts > 2,
      errors: interactionTracking.errorEncounters > 1,
      backButtonSpam: interactionTracking.backButtonClicks > 3
    };

    const struggleScore = Object.values(indicators).filter(Boolean).length;

    if (struggleScore >= 2 && !struggleDetected) {
      try {
        const helpSuggestion = await base44.integrations.Core.InvokeLLM({
          prompt: `User appears to be struggling on ${currentPage} page.

User behavior signals:
- Time on page: ${interactionTracking.timeOnPage}s
- Clicks: ${interactionTracking.clicks}
- Idle time: ${interactionTracking.idleTime}s
- Form attempts: ${interactionTracking.formAttempts}
- Errors: ${interactionTracking.errorEncounters}
- Back button clicks: ${interactionTracking.backButtonClicks}

Page context: ${JSON.stringify(pageContext)}

Provide:
1. What the user is likely struggling with
2. A helpful, empathetic message (conversational, 2-3 sentences)
3. 3 specific quick actions to help them succeed
4. Whether to offer guided walkthrough

Be friendly and encouraging, not condescending.`,
          response_json_schema: {
            type: "object",
            properties: {
              struggle_diagnosis: { type: "string" },
              helpful_message: { type: "string" },
              quick_actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    action: { type: "string" },
                    icon: { type: "string" }
                  }
                }
              },
              offer_guided_mode: { type: "boolean" },
              guided_workflow_name: { type: "string" },
              empathy_level: { type: "string" }
            }
          }
        });

        setStruggleDetected(helpSuggestion);
        
        // Log the intervention
        await base44.entities.CopilotAction.create({
          user_email: user.email,
          command: "struggle_detection_triggered",
          intent: "suggest_content",
          params: {
            page: currentPage,
            struggle_indicators: indicators,
            suggestion: helpSuggestion
          },
          mode: "proactive",
          status: "success",
          confidence: 0.8
        });

      } catch (error) {
        console.error("Error detecting struggle:", error);
      }
    }
  };

  // Abandon Intent Detection
  const detectAbandonIntent = async () => {
    if (abandonIntent) return;

    try {
      const retention = await base44.integrations.Core.InvokeLLM({
        prompt: `User is about to leave ${currentPage} page.

Session data:
- Time spent: ${interactionTracking.timeOnPage}s
- Actions taken: ${interactionTracking.clicks}
- Page: ${currentPage}

Generate an intervention to keep them engaged:
1. Quick win they can achieve right now (< 2 minutes)
2. Value reminder (what they'll miss if they leave)
3. Specific next step to take
4. Offer to save progress/bookmark

Make it urgent but not pushy.`,
        response_json_schema: {
          type: "object",
          properties: {
            intervention_message: { type: "string" },
            quick_win: { type: "string" },
            value_reminder: { type: "string" },
            next_step: { type: "string" },
            offer_bookmark: { type: "boolean" },
            urgency_level: { type: "string" }
          }
        }
      });

      setAbandonIntent(retention);
    } catch (error) {
      console.error("Error with abandon detection:", error);
    }
  };

  // Proactive Content Suggestions
  const { data: trendingTopics = [] } = useQuery({
    queryKey: ["trendingTopics"],
    queryFn: () => base44.entities.TrendingTopic.filter({}, "-trend_score", 5),
    enabled: currentPage === "VideoStudio" || currentPage === "CTVStudio" || currentPage === "OfferBuilder",
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const { data: recentProjects = [] } = useQuery({
    queryKey: ["recentProjects", user?.email],
    queryFn: () => base44.entities.VideoProject.filter({ created_by: user.email }, "-created_date", 3),
    enabled: !!user
  });

  useEffect(() => {
    if (currentPage === "VideoStudio" || currentPage === "CTVStudio") {
      generateContentSuggestions();
    }
  }, [currentPage, trendingTopics, recentProjects]);

  const generateContentSuggestions = async () => {
    if (suggestions.length > 0) return; // Don't re-generate

    try {
      const contentIdeas = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate proactive content suggestions for user on ${currentPage}.

User context:
- Recent projects: ${recentProjects.map(p => p.title).join(', ')}
- Current page: ${currentPage}

Trending topics right now:
${trendingTopics.map(t => `- ${t.topic_name} (score: ${t.trend_score}, ${t.trend_velocity})`).join('\n')}

Provide 3 content ideas that:
1. Align with trending topics
2. Build on user's past content themes
3. Are actionable right now (can start in < 5 minutes)
4. Have high viral potential

For each idea include:
- Compelling title
- Why it's timely (trend alignment)
- Expected performance (views estimate)
- Quick-start template to use
- Target platform`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  trend_alignment: { type: "string" },
                  viral_score: { type: "number" },
                  expected_views: { type: "number" },
                  quick_start_template: { type: "string" },
                  target_platform: { type: "string" },
                  time_to_create_minutes: { type: "number" },
                  why_now: { type: "string" }
                }
              }
            },
            personalization_note: { type: "string" }
          }
        }
      });

      setSuggestions(contentIdeas.suggestions || []);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  // Auto Campaign Analysis (runs every 6 hours for active campaigns)
  const { data: activeCampaigns = [] } = useQuery({
    queryKey: ["activeCampaigns", user?.email],
    queryFn: () => base44.entities.CampaignRun.filter({
      user_email: user.email,
      status: { $in: ["LAUNCHED", "LEARNING", "SCALING"] }
    }),
    enabled: !!user && currentPage === "CampaignExecution",
    refetchInterval: 21600000 // 6 hours
  });

  const analyzeCampaignPerformance = async (campaign) => {
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze campaign performance and provide optimization recommendations:

Campaign: ${campaign.campaign_name}
Status: ${campaign.status}
Objective: ${campaign.objective}
Budget: $${campaign.daily_budget_cents / 100}/day
Learning Phase: ${campaign.learning_phase ? "Yes" : "No"}

Current Metrics:
- Total Spend: $${campaign.total_spend_cents / 100}
- Revenue: $${campaign.total_revenue_cents / 100}
- ROAS: ${((campaign.total_revenue_cents / campaign.total_spend_cents) || 0).toFixed(2)}x

Guardrails:
- Max CPA: $${campaign.guardrails?.max_cpa / 100 || "Not set"}
- Min ROAS: ${campaign.guardrails?.min_roas || "Not set"}x

Analyze and provide:
1. PERFORMANCE HEALTH (0-100 score)
2. IMMEDIATE ISSUES (what's broken right now)
3. OPPORTUNITIES (what's working and should be scaled)
4. TOP 3 OPTIMIZATIONS (ranked by impact)
   - What to change
   - Expected improvement
   - Implementation difficulty
   - Urgency (critical/high/medium/low)
5. BUDGET RECOMMENDATIONS (increase/decrease/reallocate)
6. CREATIVE FATIGUE ANALYSIS (should creatives be refreshed?)
7. NEXT 24 HOURS ACTION PLAN`,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            health_status: { type: "string" },
            immediate_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string" },
                  fix: { type: "string" }
                }
              }
            },
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  opportunity: { type: "string" },
                  scale_suggestion: { type: "string" },
                  expected_roi: { type: "string" }
                }
              }
            },
            optimizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rank: { type: "number" },
                  change: { type: "string" },
                  expected_improvement: { type: "string" },
                  difficulty: { type: "string" },
                  urgency: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            budget_recommendation: {
              type: "object",
              properties: {
                action: { type: "string" },
                current_daily: { type: "number" },
                recommended_daily: { type: "number" },
                reason: { type: "string" }
              }
            },
            creative_fatigue: {
              type: "object",
              properties: {
                detected: { type: "boolean" },
                severity: { type: "string" },
                recommendation: { type: "string" }
              }
            },
            next_24h_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hour: { type: "number" },
                  action: { type: "string" },
                  automated: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      // Create NBA suggestions from analysis
      for (const opt of analysis.optimizations.slice(0, 3)) {
        await base44.entities.NBASuggestion.create({
          user_email: user.email,
          funnel_run_id: campaign.id,
          issue: opt.change,
          hypothesis: `Campaign analysis suggests: ${opt.expected_improvement}`,
          expected_gain: parseFloat(opt.expected_improvement.match(/\d+/)?.[0] || 10),
          effort: opt.difficulty,
          actionable_step: opt.implementation,
          priority: opt.rank,
          category: "ad_creative"
        });
      }

      // Create copilot action log
      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `auto_analyze_campaign_${campaign.id}`,
        intent: "analyze_performance",
        params: {
          campaign_id: campaign.id,
          health_score: analysis.health_score
        },
        mode: "proactive",
        status: "success",
        result: analysis
      });

      return analysis;
    } catch (error) {
      console.error("Campaign analysis error:", error);
      return null;
    }
  };

  // Auto-analyze campaigns on mount if on campaign page
  useEffect(() => {
    if (currentPage === "CampaignExecution" && activeCampaigns.length > 0) {
      activeCampaigns.forEach(campaign => {
        const lastOptimized = new Date(campaign.last_optimized || 0);
        const hoursSince = (Date.now() - lastOptimized) / (1000 * 60 * 60);
        
        if (hoursSince >= 6) {
          analyzeCampaignPerformance(campaign);
        }
      });
    }
  }, [activeCampaigns, currentPage]);

  const dismissSuggestion = (id) => {
    setSuggestions(prev => prev.filter((_, idx) => idx !== id));
  };

  const acceptStruggleHelp = async (action) => {
    if (action === "guided_mode") {
      // Trigger guided workflow (handled by GuidedWorkflow component)
      window.dispatchEvent(new CustomEvent('start-guided-workflow', {
        detail: { workflow: struggleDetected.guided_workflow_name }
      }));
    }
    setStruggleDetected(null);
  };

  return (
    <>
      {/* Struggle Detection Alert */}
      <AnimatePresence>
        {struggleDetected && showSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 max-w-md"
          >
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500 border-2 rounded-2xl shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-bold">Need a hand?</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStruggleDetected(null)}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {struggleDetected.helpful_message}
                </p>

                <div className="space-y-2 mb-4">
                  {struggleDetected.quick_actions?.map((action, idx) => (
                    <Button
                      key={idx}
                      onClick={() => acceptStruggleHelp(action.action)}
                      variant="outline"
                      className="w-full border-orange-500/30 text-white hover:bg-orange-500/10 justify-start"
                    >
                      <Zap className="w-4 h-4 mr-2 text-orange-400" />
                      {action.label}
                    </Button>
                  ))}
                </div>

                {struggleDetected.offer_guided_mode && (
                  <Button
                    onClick={() => acceptStruggleHelp("guided_mode")}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Start Guided Walkthrough
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Abandon Intent Prevention */}
      <AnimatePresence>
        {abandonIntent && showSuggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 max-w-md"
          >
            <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500 border-2 rounded-2xl shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="text-white font-bold">Before you go...</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAbandonIntent(null)}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-300 text-sm mb-3">
                  {abandonIntent.intervention_message}
                </p>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-1">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Quick Win (2 mins):
                  </p>
                  <p className="text-gray-300 text-sm">{abandonIntent.quick_win}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setAbandonIntent(null)}
                    variant="outline"
                    className="flex-1 border-gray-700 text-white"
                  >
                    I'll come back
                  </Button>
                  <Button
                    onClick={() => {
                      // Execute quick win
                      setAbandonIntent(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold"
                  >
                    Let's do it!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proactive Content Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && showSuggestion && !struggleDetected && !abandonIntent && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-40 max-w-md"
          >
            <Card className="bg-gradient-to-br from-[#00D4C9]/20 to-[#06D6A0]/20 border-[#00D4C9] border-2 rounded-2xl shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="text-white font-bold">Trending Content Ideas</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSuggestion(false)}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-400 text-xs mb-4">
                  <Brain className="w-3 h-3 inline mr-1" />
                  Based on trending topics and your content history
                </p>

                <div className="space-y-3">
                  {suggestions.slice(0, 2).map((suggestion, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-semibold text-sm flex-1">
                          {suggestion.title}
                        </h4>
                        <Badge className="bg-green-500/20 text-green-400 text-xs ml-2">
                          {suggestion.viral_score}/100
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {suggestion.expected_views.toLocaleString()} views
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {suggestion.time_to_create_minutes} min
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            // Create content idea entity
                            base44.entities.ContentIdea.create({
                              user_email: user.email,
                              idea_title: suggestion.title,
                              description: suggestion.description,
                              content_type: "video",
                              source: "ai_generated",
                              target_platforms: [suggestion.target_platform],
                              viral_potential: suggestion.viral_score,
                              script_outline: suggestion.why_now
                            });
                            dismissSuggestion(idx);
                          }}
                          className="bg-[#00D4C9] hover:bg-[#06D6A0] text-black h-7 text-xs rounded-lg"
                        >
                          Create
                        </Button>
                      </div>
                      <p className="text-[#00D4C9] text-xs mt-2">
                        <Target className="w-3 h-3 inline mr-1" />
                        {suggestion.why_now}
                      </p>
                    </div>
                  ))}
                </div>

                {suggestions.length > 2 && (
                  <Button
                    onClick={() => {
                      window.location.href = "/#/AIInsights";
                    }}
                    variant="outline"
                    className="w-full mt-3 border-[#00D4C9]/30 text-[#00D4C9] text-xs"
                  >
                    View All {suggestions.length} Suggestions →
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Performance Alerts (auto-generated) */}
      {activeCampaigns.length > 0 && currentPage === "CampaignExecution" && (
        <AutoCampaignAnalyzer campaigns={activeCampaigns} user={user} />
      )}
    </>
  );
}

// Auto Campaign Analyzer Sub-component
function AutoCampaignAnalyzer({ campaigns, user }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const runAnalysis = async () => {
      if (campaigns.length === 0 || isAnalyzing) return;

      setIsAnalyzing(true);

      try {
        const campaignAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze all active campaigns and identify critical issues:

Active Campaigns: ${campaigns.length}

${campaigns.map((c, i) => `
Campaign ${i + 1}: ${c.campaign_name}
- Status: ${c.status}
- Daily Budget: $${c.daily_budget_cents / 100}
- Total Spend: $${c.total_spend_cents / 100}
- Revenue: $${c.total_revenue_cents / 100}
- ROAS: ${((c.total_revenue_cents / c.total_spend_cents) || 0).toFixed(2)}x
- Learning Phase: ${c.learning_phase}
`).join('\n---\n')}

Identify:
1. Any campaigns in critical condition (low ROAS, high CPA, stuck in learning)
2. Campaigns ready to scale (good ROAS, passed learning phase)
3. Budget reallocation opportunities
4. Cross-campaign insights

Provide actionable alerts only if there's something urgent.`,
          response_json_schema: {
            type: "object",
            properties: {
              critical_alerts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    campaign_name: { type: "string" },
                    alert_type: { type: "string" },
                    message: { type: "string" },
                    recommended_action: { type: "string" },
                    urgency: { type: "string" }
                  }
                }
              },
              scale_opportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    campaign_name: { type: "string" },
                    current_daily_budget: { type: "number" },
                    recommended_daily_budget: { type: "number" },
                    expected_roas: { type: "number" },
                    confidence: { type: "number" }
                  }
                }
              },
              budget_reallocation: {
                type: "object",
                properties: {
                  recommended: { type: "boolean" },
                  from_campaign: { type: "string" },
                  to_campaign: { type: "string" },
                  amount_daily: { type: "number" },
                  reason: { type: "string" }
                }
              },
              overall_health: { type: "string" }
            }
          }
        });

        setAnalysis(campaignAnalysis);
      } catch (error) {
        console.error("Auto analysis error:", error);
      }

      setIsAnalyzing(false);
    };

    // Run analysis once when campaigns load
    if (campaigns.length > 0 && !analysis) {
      runAnalysis();
    }
  }, [campaigns]);

  if (!analysis || analysis.critical_alerts?.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-6 z-50 max-w-sm"
    >
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500 border-2 rounded-2xl shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-bold">Campaign Alerts</h3>
            <Badge className="bg-red-500/20 text-red-400 text-xs">
              {analysis.critical_alerts.length}
            </Badge>
          </div>

          <div className="space-y-2">
            {analysis.critical_alerts.slice(0, 2).map((alert, idx) => (
              <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-red-500/30">
                <p className="text-white font-semibold text-sm mb-1">
                  {alert.campaign_name}
                </p>
                <Badge className={`text-xs mb-2 ${
                  alert.urgency === "critical" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {alert.alert_type}
                </Badge>
                <p className="text-gray-300 text-xs mb-2">{alert.message}</p>
                <p className="text-[#00D4C9] text-xs">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  {alert.recommended_action}
                </p>
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              window.location.href = "/#/CampaignExecution";
            }}
            className="w-full mt-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold"
          >
            Fix Issues Now →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}