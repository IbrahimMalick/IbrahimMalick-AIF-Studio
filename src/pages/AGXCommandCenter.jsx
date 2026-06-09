import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Shield, Server, Cpu, Code, Zap, CheckCircle2, Clock, Users,
  BarChart3, Lock, Globe, Database, FileText, Play, Mail, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

import AGXMetricsCard from "@/components/agx/AGXMetricsCard";
import AGXAgentCard from "@/components/agx/AGXAgentCard";
import AGXComplianceTable from "@/components/agx/AGXComplianceTable";
import AGXSecurityLayers from "@/components/agx/AGXSecurityLayers";
import AGXModelRegistry from "@/components/agx/AGXModelRegistry";
import AGXDemoTimeline from "@/components/agx/AGXDemoTimeline";
import AGXIntegrations from "@/components/agx/AGXIntegrations";
import AGXRateLimits from "@/components/agx/AGXRateLimits";
import AGXUniversalGateway from "@/components/agx/AGXUniversalGateway";
import FounderSecurePortal from "@/components/FounderSecurePortal";
import AppInventoryContent from "@/components/agx/AppInventoryContent.jsx";
import AGXBackendFunctions from "@/components/agx/AGXBackendFunctions";
import AGXMarketOffensive from "@/components/agx/AGXMarketOffensive";
import AIAgentWorkforce from "@/components/agx/AIAgentWorkforce";
import AGXToolRegistry from "@/components/agx/AGXToolRegistry";
import PaymentConnections from "@/components/PaymentConnections";
import AGXPayoutDashboard from "@/components/agx/AGXPayoutDashboard";
import UserManagement from "@/components/agx/UserManagement";

const AGENTS = [
  { name: "AG-X", title: "Executive Orchestrator", model: "Claude Opus 4.5", access: "Founder Only", description: "The conductor of the AI orchestra. Decomposes complex goals into agent tasks, maintains strategic context across sessions.", capabilities: ["Multi-agent coordination", "Task decomposition", "Strategic synthesis", "Voice commands"] },
  { name: "AG-APEX", title: "Strategic Visionary", model: "Claude Opus 4", access: "Professional+", description: "Your AI executive strategist. Analyzes market dynamics, identifies growth opportunities.", capabilities: ["Business strategy", "Market analysis", "Competitive intelligence", "Growth forecasting"] },
  { name: "AG-CREATIVE", title: "Content Perfectionist", model: "GPT-4 Vision", access: "Starter+", description: "Multi-modal creative engine. Generates images, writes copy, produces videos.", capabilities: ["Image generation", "Copywriting", "Video production", "Brand storytelling"] },
  { name: "AG-TECH", title: "Infrastructure Master", model: "Claude Sonnet 4.5", access: "Enterprise", description: "Your AI technical architect. Designs systems, reviews code, manages DevOps.", capabilities: ["Architecture design", "Code review", "DevOps automation", "Security analysis"] },
  { name: "AG-DELIVERY", title: "Execution Machine", model: "GPT-4 Turbo", access: "Business+", description: "Campaign execution specialist. Automates marketing, manages A/B tests.", capabilities: ["Campaign automation", "A/B testing", "Funnel optimization", "Analytics"] },
  { name: "AG-SPECIALIST", title: "Market Dominator", model: "Claude Opus 4", access: "Starter+", description: "Deep domain researcher. Conducts exhaustive research, tracks trends.", capabilities: ["Deep research", "Trend analysis", "Domain expertise", "Competitive tracking"] }
];

const SLA_TIERS = [
  { tier: "Starter", uptime: "99.5%", rpo: "24 hours", rto: "4 hours", support: "Email" },
  { tier: "Professional", uptime: "99.9%", rpo: "4 hours", rto: "1 hour", support: "Priority" },
  { tier: "Business", uptime: "99.95%", rpo: "1 hour", rto: "15 min", support: "24/7 Chat" },
  { tier: "Enterprise", uptime: "99.99%", rpo: "15 min", rto: "5 min", support: "Dedicated CSM" }
];

export default function AGXCommandCenter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [securityCleared, setSecurityCleared] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <Brain className="w-8 h-8 animate-pulse" />
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.custom_role !== 'founder' && user.custom_role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center text-white text-center p-6">
        <div>
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view the AG-X Command Center.</p>
        </div>
      </div>
    );
  }

  // Security gate - require additional verification
  if (!securityCleared) {
    return <FounderSecurePortal onAccessGranted={() => setSecurityCleared(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-[#0B0B0C] via-[#1a1a2e] to-[#0B0B0C]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">COMMAND CENTER</h1>
                <p className="text-gray-400">Enterprise AI Orchestration Platform</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-1">ENTERPRISE EDITION</Badge>
              <p className="text-gray-500 text-xs">CONFIDENTIAL</p>
            </div>
          </div>
          <p className="text-orange-400 font-semibold tracking-wider text-sm">UNLEASH AI • AMPLIFY FREEDOM • SCALE EVERYTHING</p>
          <div className="flex gap-2 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ SOC 2 Type II</Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ GDPR</Badge>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">■ ISO 27001</Badge>
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">■ HIPAA</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] border border-gray-800 mb-8 flex-wrap h-auto p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inventory">App Inventory</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="reliability">Reliability</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="gateway">Gateway</TabsTrigger>
            <TabsTrigger value="backend">Backend Functions</TabsTrigger>
            <TabsTrigger value="tools">Tool Registry</TabsTrigger>
            <TabsTrigger value="offensive">Market Offensive</TabsTrigger>
            <TabsTrigger value="workforce">AI Workforce</TabsTrigger>
            <TabsTrigger value="payments">💳 Payments</TabsTrigger>
            <TabsTrigger value="payouts">💸 Payouts</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Executive Summary */}
              <Card className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-400">EXECUTIVE SUMMARY</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">
                    AG-X Command Center is an enterprise-grade AI orchestration platform that transforms how companies deploy, manage, and scale artificial intelligence. Built on battle-tested architecture principles, the platform coordinates six specialized AI agents to deliver measurable business outcomes.
                  </p>
                  <div className="grid md:grid-cols-4 gap-4">
                    <AGXMetricsCard value="99.99%" label="UPTIME SLA" change="+0.02%" trend="up" />
                    <AGXMetricsCard value="142ms" label="AVG LATENCY" change="-23ms" trend="up" />
                    <AGXMetricsCard value="47%" label="COST SAVINGS" change="+12%" trend="up" />
                    <AGXMetricsCard value="1.2M" label="TASKS/DAY" change="+340K" trend="up" />
                  </div>
                </CardContent>
              </Card>

              {/* Key Differentiators */}
              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400">Key Differentiators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Unified AI Governance", desc: "Single control plane for all AI operations with audit trails" },
                      { title: "Cost-Aware Routing", desc: "Automatic model selection optimizing for cost, latency, and capability" },
                      { title: "Enterprise Security", desc: "SOC 2 Type II certified with end-to-end encryption" },
                      { title: "Real-Time Intelligence", desc: "ARIA provides proactive insights and anomaly detection" },
                      { title: "Seamless Integration", desc: "Native connectors for Stripe, HubSpot, Slack, and 50+ platforms" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold">{item.title}</p>
                          <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ARIA Section */}
              <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30">
                <CardHeader>
                  <CardTitle className="text-violet-400">ARIA: Proactive AI Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    ARIA (Adaptive Real-time Intelligence Assistant) is the proactive layer that monitors your business 24/7, identifies opportunities and threats, and orchestrates agent responses without waiting for human commands.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { title: "Proactive Monitoring", desc: "Continuous analysis of all connected data sources for anomalies" },
                      { title: "Natural Language Queries", desc: "Ask questions like 'Why did churn increase this week?'" },
                      { title: "Multi-Agent Orchestration", desc: "ARIA assigns tasks to specialized agents automatically" },
                      { title: "Predictive Insights", desc: "Forecasts based on historical patterns and current trends" },
                      { title: "Autonomous Actions", desc: "Pre-approved workflows can execute without human approval" },
                      { title: "Learning Loop", desc: "Improves recommendations based on which actions you take" }
                    ].map((cap, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                        <p className="text-white font-semibold text-sm mb-1">{cap.title}</p>
                        <p className="text-gray-400 text-xs">{cap.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* App Inventory Tab */}
          <TabsContent value="inventory">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AppInventoryContent />
            </motion.div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">THE SIX AGENTS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AGENTS.map((agent, idx) => (
                      <AGXAgentCard key={idx} {...agent} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400">UNIFIED AI TOOL REGISTRY</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">The Tool Registry is the architectural heart of AG-X — a dynamic system that manages API keys, model selection, cost optimization, and automatic failover across all AI providers.</p>
                  <AGXModelRegistry />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">SECURITY & COMPLIANCE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-[#0B0B0C] rounded-lg border-l-4 border-purple-500 mb-6">
                    <p className="text-gray-300">Security is not a feature — it's the foundation. AG-X implements defense-in-depth with zero-trust architecture, ensuring your AI operations meet the strictest enterprise requirements.</p>
                  </div>
                  <h3 className="text-orange-400 font-semibold mb-4">Compliance Certifications</h3>
                  <AGXComplianceTable />
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400">Security Architecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <AGXSecurityLayers />
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400">Data Governance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Data Classification", desc: "Automatic PII detection and tagging with configurable retention policies" },
                      { title: "Access Control", desc: "Role-based permissions with attribute-based contextual access" },
                      { title: "Audit Logging", desc: "Comprehensive event logging with tamper-evident storage" },
                      { title: "Data Residency", desc: "Configurable geographic storage with EU/US/APAC regions" },
                      { title: "Right to Deletion", desc: "GDPR-compliant data erasure with cascade propagation" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-[#0B0B0C] rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-gray-400 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Reliability Tab */}
          <TabsContent value="reliability">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">RELIABILITY & SCALING</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">Designed for mission-critical deployments, AG-X delivers carrier-grade reliability with automatic failover, geographic redundancy, and elastic scaling.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
                          <th className="text-left p-3 text-purple-300">Tier</th>
                          <th className="text-left p-3 text-purple-300">Uptime SLA</th>
                          <th className="text-left p-3 text-purple-300">RPO</th>
                          <th className="text-left p-3 text-purple-300">RTO</th>
                          <th className="text-left p-3 text-purple-300">Support</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SLA_TIERS.map((t, idx) => (
                          <tr key={idx} className="border-b border-gray-800">
                            <td className="p-3 text-white">{t.tier}</td>
                            <td className="p-3 text-green-400 font-mono">{t.uptime}</td>
                            <td className="p-3 text-gray-300">{t.rpo}</td>
                            <td className="p-3 text-gray-300">{t.rto}</td>
                            <td className="p-3 text-gray-300">{t.support}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400">High Availability Architecture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Multi-Region Deployment", desc: "Active-active across 3+ geographic regions with <50ms failover" },
                      { title: "Database Clustering", desc: "PlanetScale with automatic sharding and read replicas" },
                      { title: "Cache Layer", desc: "Redis Cluster with sentinel for session and response caching" },
                      { title: "Load Balancing", desc: "Geographic DNS with health checks and automatic traffic shifting" },
                      { title: "Circuit Breakers", desc: "Automatic service isolation preventing cascade failures" },
                      { title: "Chaos Engineering", desc: "Regular failure injection testing with documented runbooks" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-[#0B0B0C] rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-gray-400 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">AI GOVERNANCE FRAMEWORK</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-[#0B0B0C] rounded-lg border-l-4 border-purple-500 mb-6">
                    <p className="text-gray-300">Enterprise AI requires rigorous governance. AG-X provides comprehensive controls for model evaluation, output monitoring, cost management, and ethical AI deployment — all from a unified control plane.</p>
                  </div>
                  
                  <h3 className="text-orange-400 font-semibold mb-4">Model Evaluation & Selection</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
                          <th className="text-left p-3 text-purple-300">Metric</th>
                          <th className="text-left p-3 text-purple-300">Measurement</th>
                          <th className="text-left p-3 text-purple-300">Threshold</th>
                          <th className="text-left p-3 text-purple-300">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { metric: "Accuracy", measurement: "Task-specific benchmarks", threshold: ">95%", action: "Automatic promotion" },
                          { metric: "Latency P99", measurement: "Response time distribution", threshold: "<500ms", action: "Route to faster model" },
                          { metric: "Cost/Task", measurement: "Token + compute costs", threshold: "Budget limit", action: "Fallback to cheaper" },
                          { metric: "Toxicity", measurement: "Perspective API score", threshold: "<0.3", action: "Block + review" },
                          { metric: "Hallucination", measurement: "Factual grounding check", threshold: "<5%", action: "Citation required" }
                        ].map((m, idx) => (
                          <tr key={idx} className="border-b border-gray-800">
                            <td className="p-3 text-white">{m.metric}</td>
                            <td className="p-3 text-gray-300">{m.measurement}</td>
                            <td className="p-3 text-green-400 font-mono">{m.threshold}</td>
                            <td className="p-3 text-gray-400">{m.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-orange-400 font-semibold mb-4">Real-Time Monitoring Dashboard</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Token Usage", desc: "Per-agent, per-model token consumption with budget alerts" },
                      { title: "Cost Tracking", desc: "Real-time cost attribution by team, project, and use case" },
                      { title: "Quality Scores", desc: "Automated evaluation of output quality with human feedback loop" },
                      { title: "Anomaly Detection", desc: "ARIA monitors for unusual patterns and proactively alerts" },
                      { title: "Compliance Violations", desc: "Automatic detection of PII leakage or policy violations" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-[#0B0B0C] rounded-lg">
                        <BarChart3 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-gray-400 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">INTEGRATION ARCHITECTURE</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">AG-X connects to your existing tech stack with production-grade integrations. Real-time data flows enable ARIA to provide contextual insights based on live business metrics.</p>
                  <AGXIntegrations />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Demo Tab */}
          <TabsContent value="demo">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">DEMO SCENARIO: CHURN CRISIS RESPONSE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-[#0B0B0C] rounded-lg border-l-4 border-green-500 mb-6">
                    <p className="text-gray-300">This 8-minute demo showcases AG-X's full capabilities: ARIA's proactive intelligence, multi-agent coordination, automated workflow execution, and real-time asset generation.</p>
                  </div>
                  
                  <h3 className="text-orange-400 font-semibold mb-4">Scenario Overview</h3>
                  <p className="text-gray-400 mb-6">A SaaS company experiences an unexpected churn spike. ARIA detects the anomaly, diagnoses the cause, coordinates multiple agents to develop a response, triggers automated workflows, and generates all necessary assets — all within minutes, without human intervention.</p>

                  <h3 className="text-orange-400 font-semibold mb-4">Demo Timeline</h3>
                  <AGXDemoTimeline />

                  <h3 className="text-orange-400 font-semibold mb-4 mt-8">Measurable Outcomes</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <AGXMetricsCard value="7.5 min" label="RESPONSE TIME" change="vs 4hr manual" trend="up" />
                    <AGXMetricsCard value="67%" label="CHURN SAVED" change="of at-risk" trend="up" />
                    <AGXMetricsCard value="$142K" label="COST SAVED" change="ARR retained" trend="up" />
                    <AGXMetricsCard value="+12" label="NPS IMPACT" change="post-response" trend="up" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400">API REFERENCE</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-orange-400 font-semibold mb-4">Core Endpoints</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-600/20 to-orange-500/20">
                          <th className="text-left p-3 text-purple-300">Method</th>
                          <th className="text-left p-3 text-purple-300">Endpoint</th>
                          <th className="text-left p-3 text-purple-300">Description</th>
                          <th className="text-left p-3 text-purple-300">Auth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { method: "POST", endpoint: "/api/agents/execute", desc: "Execute agent task", auth: "Bearer" },
                          { method: "GET", endpoint: "/api/agents", desc: "List available agents", auth: "Bearer" },
                          { method: "GET", endpoint: "/api/agents/:id", desc: "Agent details & capabilities", auth: "Bearer" },
                          { method: "GET", endpoint: "/api/metrics", desc: "Platform metrics", auth: "Bearer" },
                          { method: "GET", endpoint: "/api/health", desc: "Health check (liveness/readiness)", auth: "None" },
                          { method: "POST", endpoint: "/api/aria/briefing", desc: "Generate ARIA briefing", auth: "Bearer" },
                          { method: "POST", endpoint: "/api/aria/query", desc: "Natural language query", auth: "Bearer" },
                          { method: "GET", endpoint: "/api/audit", desc: "Audit log query", auth: "Admin" },
                          { method: "POST", endpoint: "/api/webhooks/stripe", desc: "Stripe webhook handler", auth: "Signature" }
                        ].map((ep, idx) => (
                          <tr key={idx} className="border-b border-gray-800">
                            <td className="p-3"><Badge className={`${ep.method === "POST" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"} text-xs font-mono`}>{ep.method}</Badge></td>
                            <td className="p-3 text-cyan-400 font-mono text-xs">{ep.endpoint}</td>
                            <td className="p-3 text-gray-300">{ep.desc}</td>
                            <td className="p-3 text-gray-400">{ep.auth}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-orange-400 font-semibold mb-4">Rate Limits</h3>
                  <AGXRateLimits />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">INTEGRATION & CREDENTIALS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">Manage API keys and credentials for all connected AI providers. One API key per provider - AG-X handles the rest.</p>
                  
                  <h3 className="text-orange-400 font-semibold mb-4">LLM Providers</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {[
                      { name: "Anthropic", env: "ANTHROPIC_API_KEY", models: "Claude Opus/Sonnet/Haiku 4.5", status: "connected" },
                      { name: "OpenAI", env: "OPENAI_API_KEY", models: "GPT-4o, O1, O1-mini", status: "connected" },
                      { name: "DeepSeek", env: "DEEPSEEK_API_KEY", models: "V3.2, R1 (90% cheaper!)", status: "optional" },
                      { name: "Google AI", env: "GOOGLE_AI_KEY", models: "Gemini 2.0 Flash, 1.5 Pro", status: "optional" },
                      { name: "Groq", env: "GROQ_API_KEY", models: "Llama 3.3 70B, Mixtral", status: "optional" },
                      { name: "Mistral", env: "MISTRAL_API_KEY", models: "Mistral Large", status: "optional" }
                    ].map((p, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">{p.name}</p>
                          <Badge className={p.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                            {p.status === 'connected' ? '● Connected' : '○ Optional'}
                          </Badge>
                        </div>
                        <code className="text-cyan-400 text-xs block mb-1">{p.env}</code>
                        <p className="text-gray-500 text-xs">{p.models}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-orange-400 font-semibold mb-4">Video & Image Generation</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {[
                      { name: "fal.ai", env: "FAL_API_KEY", models: "Veo 3, Sora 2, Kling, Flux (600+ models)", status: "optional" },
                      { name: "Runway", env: "RUNWAY_API_KEY", models: "Gen-4, Gen-4 Turbo", status: "optional" },
                      { name: "Replicate", env: "REPLICATE_API_TOKEN", models: "Open-source models", status: "optional" },
                      { name: "Stability AI", env: "STABILITY_API_KEY", models: "Stable Diffusion 3", status: "optional" }
                    ].map((p, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">{p.name}</p>
                          <Badge className="bg-gray-500/20 text-gray-400">○ Optional</Badge>
                        </div>
                        <code className="text-cyan-400 text-xs block mb-1">{p.env}</code>
                        <p className="text-gray-500 text-xs">{p.models}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-orange-400 font-semibold mb-4">Audio & Avatar Services</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {[
                      { name: "ElevenLabs", env: "ELEVENLABS_API_KEY", desc: "Premium TTS, voice cloning, multilingual" },
                      { name: "HeyGen", env: "HEYGEN_API_KEY", desc: "AI avatars with best-in-class lip-sync" },
                      { name: "Synthesia", env: "SYNTHESIA_API_KEY", desc: "Enterprise avatars, 120+ languages" },
                      { name: "JSON2Video", env: "JSON2VIDEO_API_KEY", desc: "Programmatic video composition" }
                    ].map((p, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">{p.name}</p>
                          <Badge className="bg-gray-500/20 text-gray-400">○ Optional</Badge>
                        </div>
                        <code className="text-cyan-400 text-xs block mb-1">{p.env}</code>
                        <p className="text-gray-500 text-xs">{p.desc}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-orange-400 font-semibold mb-4">Business Integrations</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { name: "Stripe", env: "STRIPE_SECRET_KEY", desc: "Payments & billing" },
                      { name: "HubSpot", env: "HUBSPOT_API_KEY", desc: "CRM & leads" },
                      { name: "Slack", env: "SLACK_WEBHOOK_URL", desc: "Notifications" },
                      { name: "Mixpanel", env: "MIXPANEL_TOKEN", desc: "Product analytics" },
                      { name: "Datadog", env: "DATADOG_API_KEY", desc: "Infrastructure monitoring" },
                      { name: "SendGrid", env: "SENDGRID_API_KEY", desc: "Email delivery" }
                    ].map((p, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                        <p className="text-white font-semibold text-sm">{p.name}</p>
                        <code className="text-cyan-400 text-xs">{p.env}</code>
                        <p className="text-gray-500 text-xs">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400">Auto-Plug Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">AG-X automatically detects and connects providers from environment variables. Just set your keys and go.</p>
                  <div className="bg-[#0B0B0C] rounded-xl p-4 border border-gray-800">
                    <pre className="text-xs text-gray-300 overflow-x-auto">
{`# .env.local - AG-X will auto-detect all keys

# Required (at least one LLM)
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx

# Cost Optimization (90% savings!)
DEEPSEEK_API_KEY=sk-xxxxx

# Video Generation
FAL_API_KEY=xxxxx
RUNWAY_API_KEY=xxxxx

# Audio & Avatars
ELEVENLABS_API_KEY=xxxxx
HEYGEN_API_KEY=xxxxx

# Business Integrations
STRIPE_SECRET_KEY=sk_live_xxxxx
HUBSPOT_API_KEY=xxxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/xxxxx`}
                    </pre>
                  </div>
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 text-sm font-semibold mb-1">✓ Automatic Failover</p>
                    <p className="text-gray-400 text-xs">If any provider fails, AG-X automatically routes to backup providers. No configuration needed.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Gateway Tab */}
          <TabsContent value="gateway">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AGXUniversalGateway />
            </motion.div>
          </TabsContent>

          {/* Backend Functions Tab */}
          <TabsContent value="backend">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AGXBackendFunctions />
            </motion.div>
          </TabsContent>

          {/* Tool Registry Tab */}
          <TabsContent value="tools">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AGXToolRegistry />
            </motion.div>
          </TabsContent>

          {/* Market Offensive Tab */}
          <TabsContent value="offensive">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AGXMarketOffensive />
            </motion.div>
          </TabsContent>

          {/* AI Workforce Tab */}
          <TabsContent value="workforce">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AIAgentWorkforce />
            </motion.div>
          </TabsContent>

          {/* Affiliate Payout Engine Tab */}
          <TabsContent value="payouts">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AGXPayoutDashboard />
            </motion.div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <UserManagement />
            </motion.div>
          </TabsContent>

          {/* Payment Gateways Tab */}
          <TabsContent value="payments">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card className="bg-gradient-to-r from-green-500/10 to-purple-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">💳 PAYMENT GATEWAY HUB</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6">
                    Connect payment providers for users, subscribers, and affiliates. All credentials are AES-256 encrypted. Automated payouts and billing are processed via the connected gateways.
                  </p>
                  <PaymentConnections userEmail={user?.email} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          </Tabs>

        {/* Footer CTA */}
        <Card className="bg-gradient-to-r from-[#1a1a2e] to-[#16162a] border-gray-800 mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">READY TO TRANSFORM YOUR BUSINESS?</h2>
            <p className="text-gray-400 mb-6">AG-X Command Center is more than software — it's a paradigm shift in how companies leverage AI.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="text-left">
                <p className="text-orange-400 text-sm font-semibold">Schedule Demo</p>
                <p className="text-gray-400 text-xs">demo@aifreedomstudios.com</p>
              </div>
              <div className="text-left">
                <p className="text-orange-400 text-sm font-semibold">Enterprise Sales</p>
                <p className="text-gray-400 text-xs">enterprise@aifreedomstudios.com</p>
              </div>
              <div className="text-left">
                <p className="text-orange-400 text-sm font-semibold">Technical Support</p>
                <p className="text-gray-400 text-xs">support@aifreedomstudios.com</p>
              </div>
            </div>
            <p className="text-orange-400 font-semibold tracking-wider text-sm mb-2">UNLEASH AI • AMPLIFY FREEDOM • SCALE EVERYTHING</p>
            <p className="text-gray-600 text-xs">© 2025 AI Freedom Studios. All rights reserved.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}