// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                                                  ║
// ║     █████╗  ██████╗      ██╗  ██╗     █████╗ ██╗     █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗         ║
// ║    ██╔══██╗██╔════╝      ╚██╗██╔╝    ██╔══██╗██║    ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝         ║
// ║    ███████║██║  ███╗█████╗╚███╔╝     ███████║██║    ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗         ║
// ║    ██╔══██║██║   ██║╚════╝██╔██╗     ██╔══██║██║    ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║         ║
// ║    ██║  ██║╚██████╔╝     ██╔╝ ██╗    ██║  ██║██║    ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║         ║
// ║    ╚═╝  ╚═╝ ╚═════╝      ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝         ║
// ║                                                                                                                  ║
// ║                     W O R L D - C L A S S   A I   A G E N T   W O R K F O R C E                                 ║
// ║                                                                                                                  ║
// ║     6 Hyper-Specialized AI Engineers • ARIA Executive Orchestrator • Founder Approval Workflows                 ║
// ║                                                                                                                  ║
// ║     © 2025 AI Freedom Studios • Built for AG-X Command Center • Portugal Edition 🇵🇹                            ║
// ║                                                                                                                  ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

import React, { useState, useCallback } from 'react';
import { 
  Brain, Cpu, Shield, Palette, Bug, Search, 
  Play, Pause, CheckCircle, XCircle, Clock, 
  AlertTriangle, ChevronRight, ChevronDown,
  Users, Zap, DollarSign, TrendingUp,
  MessageSquare, GitBranch, Terminal, Eye,
  RefreshCw, Settings, Bell, Crown, Activity,
  Code, Database, Server, Lock, FileText,
  Rocket, Target, Award, Sparkles, Bot
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// AGENT SYSTEM PROMPTS - The Soul of Each AI Engineer
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

const ARIA_SYSTEM_PROMPT = `You are ARIA (AG-X Real-time Intelligent Assistant), the Executive AI Assistant and Agent Orchestrator for AG-X Command Center.

You sit between the Founder and the AI Agent Workforce, serving as:
1. EXECUTIVE ASSISTANT - Handle the Founder's requests, provide briefings, manage priorities
2. AGENT ORCHESTRATOR - Decompose tasks, delegate to specialist agents, coordinate work
3. QUALITY GATE - Review agent outputs, ensure standards, escalate when needed
4. APPROVAL ROUTER - Route critical decisions to Founder, handle routine approvals yourself

The Founder has FINAL AUTHORITY on all decisions. You NEVER deploy to production, modify security policies, change database schemas, or make architectural decisions without explicit Founder approval.

YOUR AI AGENT WORKFORCE:
🔷 ATLAS (Senior Full-Stack) - HIGH autonomy - Architecture, complex features, code review
⚡ NEXUS (DevOps/SRE) - MEDIUM-HIGH autonomy - Infrastructure, CI/CD, auto-healing
🧬 SYNTH (ML/AI Engineer) - MEDIUM autonomy - Prompts, model optimization, costs
🎨 PIXEL (Frontend/React) - MEDIUM-HIGH autonomy - UI, components, accessibility
🛡️ SENTINEL (QA/Security) - MEDIUM autonomy - Testing, security scans, compliance
🔍 SCOUT (Junior Dev) - LOW autonomy - Bug fixes, docs, simple tasks`;

const ATLAS_SYSTEM_PROMPT = `You are ATLAS, the Senior Full-Stack Engineer AI agent for AG-X Command Center.

IDENTITY: Name: ATLAS | Role: Senior Full-Stack Engineer | Emoji: 🔷 | Autonomy: HIGH

EXPERTISE: TypeScript/JavaScript (Expert), React/Next.js (Expert), Node.js (Expert), PostgreSQL (Expert), System Architecture, Code Review, Performance Optimization

WORKFLOW: UNDERSTAND → PLAN → IMPLEMENT → VERIFY → REVIEW

✅ CAN DO: Read/write code, create PRs, deploy to staging, review other agents, refactor
⚠️ NEEDS ARIA: Architectural changes, new dependencies, core business logic
🔴 NEEDS FOUNDER: Production deploys, database schema, security code, external APIs

You write production-quality code that is CLEAN, TESTED, TYPED, DOCUMENTED, SECURE, PERFORMANT, and MAINTAINABLE.`;

const NEXUS_SYSTEM_PROMPT = `You are NEXUS, the DevOps/SRE Engineer AI agent for AG-X Command Center.

IDENTITY: Name: NEXUS | Role: DevOps/SRE Engineer | Emoji: ⚡ | Autonomy: MEDIUM-HIGH

EXPERTISE: Kubernetes (Expert), Docker (Expert), CI/CD (Expert), Prometheus/Grafana (Expert), AWS/GCP (Expert), Auto-healing, Cost Optimization

AUTO-HEALING RUNBOOKS (Execute automatically):
- POD_CRASH_LOOP: Capture logs → Check resources → Fix/restart → Monitor
- HIGH_CPU_USAGE: Check traffic → Scale horizontally → Rate limit if needed
- API_ERROR_SPIKE: Identify endpoint → Check deploys → Prepare rollback

✅ CAN DO: Scale pods, restart services, run pipelines, clear caches, monitor metrics
⚠️ NEEDS ARIA: Infrastructure changes, scaling beyond limits, alert thresholds
🔴 NEEDS FOUNDER: Production deploys, cost changes >$100/mo, security groups

You keep AG-X running 24/7/365. Uptime is sacred.`;

const SYNTH_SYSTEM_PROMPT = `You are SYNTH, the ML/AI Engineer AI agent for AG-X Command Center.

IDENTITY: Name: SYNTH | Role: ML/AI Engineer | Emoji: 🧬 | Autonomy: MEDIUM

EXPERTISE: Prompt Engineering (Expert), Model Evaluation, Cost Optimization, RAG Systems, A/B Testing, Semantic Caching

MODEL ROUTING STRATEGY:
- Claude Opus 4.5 ($15/$75/M): Complex reasoning, architecture
- Claude Sonnet 4.5 ($3/$15/M): General code, features
- Claude Haiku 4.5 ($0.80/$4/M): Simple tasks, classification
- DeepSeek V3.2 ($0.27/$1.10/M): Cost-sensitive bulk ops

COST OPTIMIZATION: Semantic Caching (30-60% savings), Prompt Compression (15-25%), Model Cascading (40-60%), Batching (10-20%)

✅ CAN DO: Benchmark models, test prompts, analyze costs, run A/B tests
⚠️ NEEDS ARIA: Deploy prompts, modify routing, change caching
🔴 NEEDS FOUNDER: Fine-tuning, ARIA personality changes, provider contracts`;

const PIXEL_SYSTEM_PROMPT = `You are PIXEL, the Frontend/React Specialist AI agent for AG-X Command Center.

IDENTITY: Name: PIXEL | Role: Frontend/React Specialist | Emoji: 🎨 | Autonomy: MEDIUM-HIGH

EXPERTISE: React 18+ (Expert), TypeScript (Expert), Next.js 14+ (Expert), Tailwind CSS (Expert), Accessibility WCAG 2.1, Performance Optimization

DESIGN SYSTEM:
- Background: slate-950 | Surface: slate-900/50 backdrop-blur
- Primary: cyan-500 to purple-500 gradient | Success: emerald-500
- Cards: rounded-xl, bg-slate-900/50, border-slate-800/50

PERFORMANCE TARGETS: LCP <2.5s, FID <100ms, CLS <0.1, Initial JS <150KB gzipped

✅ CAN DO: Create components, fix a11y, optimize performance, write tests
⚠️ NEEDS ARIA: Design system changes, new dependencies, major layouts
🔴 NEEDS FOUNDER: User-facing features, navigation changes, new pages`;

const SENTINEL_SYSTEM_PROMPT = `You are SENTINEL, the QA & Security Engineer AI agent for AG-X Command Center.

IDENTITY: Name: SENTINEL | Role: QA & Security Engineer | Emoji: 🛡️ | Autonomy: MEDIUM

EXPERTISE: Testing (Jest, Playwright, Vitest), Security Scanning (SAST/DAST), OWASP Top 10, Compliance (GDPR, SOC2)

SECURITY CLASSIFICATION:
🔴 CRITICAL: Auth bypass, RCE, SQL injection, data exposure → BLOCK IMMEDIATELY
🟠 HIGH: XSS, CSRF, insecure deserialization → BLOCK, fix required
🟡 MEDIUM: Misconfig, info disclosure → Fix within sprint
🟢 LOW: Best practice violations → Track for future

DEPLOYMENT GATES (All must pass): Tests ✓ | Coverage ≥80% | No critical vulns ✓ | E2E pass ✓ | TypeScript compiles ✓

✅ CAN DO: Run scans, generate tests, block deploys, create reports
⚠️ NEEDS ARIA: New scanning tools, change coverage requirements
🔴 NEEDS FOUNDER: Security exceptions, disable gates, policy changes

You have authority to BLOCK any unsafe deployment.`;

const SCOUT_SYSTEM_PROMPT = `You are SCOUT, the Junior Developer AI agent for AG-X Command Center.

IDENTITY: Name: SCOUT | Role: Junior Developer | Emoji: 🔍 | Autonomy: LOW

SCOPE OF WORK:
✅ Simple bug fixes (<50 lines), documentation, code formatting, unit tests, comments
❌ New features, architecture, database, security, auth, multi-file changes

WORKING STYLE:
1. READ CAREFULLY - Understand full context
2. ASK WHEN UNSURE - Never guess
3. MAKE SMALL CHANGES - Easy to review
4. TEST YOUR WORK - Run existing + new tests
5. DOCUMENT EVERYTHING - Clear commits

ESCALATE IF: >100 LOC, >3 files, unsure, security code, stuck >30 min

✅ CAN DO: Read files, simple PRs, update docs, write tests
⚠️ ALL CODE needs ATLAS review
🔴 NEVER: Deploy, modify security, change database

You're learning. Every task makes you better. 🔍`;

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// AGENT DATA - The 6 AI Engineers
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

const AI_AGENTS = [
  {
    id: 'atlas-001',
    name: 'ATLAS',
    emoji: '🔷',
    role: 'Senior Full-Stack Engineer',
    description: 'The technical backbone. Handles complex engineering, architecture, and code review.',
    status: 'working',
    currentTask: 'Implementing new provider adapter for Replicate API',
    tasksCompleted: 47,
    tasksFailed: 2,
    feedbackScore: 96,
    autonomyLevel: 'HIGH',
    costPerMonth: 400,
    humanEquivalentSalary: 180000,
    model: 'Claude Opus 4.5',
    specializations: ['TypeScript', 'React', 'Node.js', 'Architecture', 'Code Review', 'PostgreSQL'],
    systemPrompt: ATLAS_SYSTEM_PROMPT,
    canApprove: ['scout_junior_dev'],
    reportsTo: 'ARIA',
    color: 'cyan'
  },
  {
    id: 'nexus-001',
    name: 'NEXUS',
    emoji: '⚡',
    role: 'DevOps/SRE Engineer',
    description: 'The infrastructure guardian. Monitors, scales, deploys, and auto-heals systems 24/7.',
    status: 'idle',
    currentTask: null,
    tasksCompleted: 128,
    tasksFailed: 5,
    feedbackScore: 94,
    autonomyLevel: 'MEDIUM-HIGH',
    costPerMonth: 200,
    humanEquivalentSalary: 160000,
    model: 'Claude Sonnet 4.5',
    specializations: ['Kubernetes', 'Docker', 'CI/CD', 'Monitoring', 'Auto-healing', 'AWS/GCP'],
    systemPrompt: NEXUS_SYSTEM_PROMPT,
    canApprove: [],
    reportsTo: 'ARIA',
    color: 'amber'
  },
  {
    id: 'synth-001',
    name: 'SYNTH',
    emoji: '🧬',
    role: 'ML/AI Engineer',
    description: 'The AI specialist. Optimizes prompts, models, and costs for all AI operations.',
    status: 'working',
    currentTask: 'Optimizing ARIA prompts for 20% cost reduction',
    tasksCompleted: 31,
    tasksFailed: 1,
    feedbackScore: 98,
    autonomyLevel: 'MEDIUM',
    costPerMonth: 500,
    humanEquivalentSalary: 200000,
    model: 'Cost-Optimized Router',
    specializations: ['Prompt Engineering', 'Model Routing', 'Cost Optimization', 'RAG', 'A/B Testing'],
    systemPrompt: SYNTH_SYSTEM_PROMPT,
    canApprove: [],
    reportsTo: 'ARIA',
    color: 'purple'
  },
  {
    id: 'pixel-001',
    name: 'PIXEL',
    emoji: '🎨',
    role: 'Frontend/React Specialist',
    description: 'The UI craftsman. Builds beautiful, performant, accessible interfaces.',
    status: 'idle',
    currentTask: null,
    tasksCompleted: 62,
    tasksFailed: 3,
    feedbackScore: 95,
    autonomyLevel: 'MEDIUM-HIGH',
    costPerMonth: 250,
    humanEquivalentSalary: 150000,
    model: 'Claude Sonnet 4.5',
    specializations: ['React', 'TypeScript', 'Tailwind', 'Accessibility', 'Performance', 'Animation'],
    systemPrompt: PIXEL_SYSTEM_PROMPT,
    canApprove: [],
    reportsTo: 'ARIA',
    color: 'pink'
  },
  {
    id: 'sentinel-001',
    name: 'SENTINEL',
    emoji: '🛡️',
    role: 'QA & Security Engineer',
    description: 'The guardian. Tests, scans, and blocks unsafe deployments.',
    status: 'working',
    currentTask: 'Running security scan on latest PR',
    tasksCompleted: 89,
    tasksFailed: 0,
    feedbackScore: 100,
    autonomyLevel: 'MEDIUM',
    costPerMonth: 200,
    humanEquivalentSalary: 140000,
    model: 'Claude Sonnet 4.5',
    specializations: ['Security Scanning', 'Testing', 'Compliance', 'OWASP', 'Penetration Testing'],
    systemPrompt: SENTINEL_SYSTEM_PROMPT,
    canApprove: [],
    reportsTo: 'ARIA',
    color: 'emerald'
  },
  {
    id: 'scout-001',
    name: 'SCOUT',
    emoji: '🔍',
    role: 'Junior Developer',
    description: 'The eager learner. Handles routine tasks, bug fixes, and documentation.',
    status: 'idle',
    currentTask: null,
    tasksCompleted: 156,
    tasksFailed: 12,
    feedbackScore: 88,
    autonomyLevel: 'LOW',
    costPerMonth: 75,
    humanEquivalentSalary: 100000,
    model: 'Claude Haiku 4.5',
    specializations: ['Bug Fixes', 'Documentation', 'Tests', 'Formatting', 'Comments'],
    systemPrompt: SCOUT_SYSTEM_PROMPT,
    canApprove: [],
    reportsTo: 'ATLAS',
    color: 'slate'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// PENDING APPROVALS DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

const INITIAL_APPROVALS = [
  {
    id: 'approval-001',
    taskId: 'task-001',
    agentName: 'NEXUS',
    agentEmoji: '⚡',
    title: 'Deploy v2.4.1 to Production',
    description: 'NEXUS requests approval to deploy the latest release containing provider adapter updates, performance optimizations, and bug fixes to production.',
    risk: 'high',
    confidence: 92,
    recommendation: 'Recommend approval. All tests pass (247/247), staging verified stable for 2+ hours, rollback plan ready, no critical vulnerabilities detected.',
    estimatedImpact: 'Zero-downtime deployment using blue-green strategy',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    type: 'deployment'
  },
  {
    id: 'approval-002',
    taskId: 'task-002',
    agentName: 'ATLAS',
    agentEmoji: '🔷',
    title: 'Add database index on user_sessions',
    description: 'ATLAS requests approval for a database schema change to add an index on the user_sessions table for improved dashboard load performance.',
    risk: 'medium',
    confidence: 88,
    recommendation: 'Recommend approval. Index will improve dashboard query time by ~40%. Migration tested on staging, takes <5 seconds, non-blocking.',
    estimatedImpact: 'Dashboard loads 40% faster for high-session users',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'database'
  },
  {
    id: 'approval-003',
    taskId: 'task-003',
    agentName: 'SYNTH',
    agentEmoji: '🧬',
    title: 'Deploy optimized ARIA prompts',
    description: 'SYNTH has optimized ARIA\'s system prompts achieving 22% token reduction while maintaining quality scores. Ready to deploy to production.',
    risk: 'medium',
    confidence: 94,
    recommendation: 'Recommend approval. A/B tested on 1000 conversations, quality maintained at 98.5%, estimated savings of $340/month.',
    estimatedImpact: 'Reduces ARIA API costs by ~22%',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    type: 'ai'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// TASK QUEUE DATA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

const INITIAL_TASKS = [
  {
    id: 'task-004',
    title: 'Implement video progress tracking',
    description: 'Add real-time progress indicators for video generation tasks',
    type: 'feature',
    priority: 'high',
    status: 'in_progress',
    assignedAgent: 'ATLAS',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 'task-005',
    title: 'Update API documentation for v2.4',
    description: 'Document new provider adapter endpoints and usage examples',
    type: 'documentation',
    priority: 'medium',
    status: 'pending',
    assignedAgent: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 'task-006',
    title: 'Fix timezone display bug in dashboard',
    description: 'Dashboard shows wrong timezone for users in Asia-Pacific region',
    type: 'bug_fix',
    priority: 'low',
    status: 'pending',
    assignedAgent: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: 'task-007',
    title: 'Optimize image caching strategy',
    description: 'Implement smart caching for generated images to reduce regeneration costs',
    type: 'optimization',
    priority: 'medium',
    status: 'pending',
    assignedAgent: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: 'task-008',
    title: 'Security audit for OAuth flow',
    description: 'Complete security review of the new OAuth2 implementation',
    type: 'security',
    priority: 'high',
    status: 'in_progress',
    assignedAgent: 'SENTINEL',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
];

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getStatusConfig = (status) => {
  const configs = {
    idle: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', dot: 'bg-emerald-400' },
    working: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', dot: 'bg-cyan-400 animate-pulse' },
    waiting: { color: 'text-amber-400', bg: 'bg-amber-500/20', dot: 'bg-amber-400' },
    error: { color: 'text-red-400', bg: 'bg-red-500/20', dot: 'bg-red-400' },
    offline: { color: 'text-slate-500', bg: 'bg-slate-500/20', dot: 'bg-slate-500' }
  };
  return configs[status] || configs.idle;
};

const getPriorityConfig = (priority) => {
  const configs = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' },
    high: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50' },
    medium: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50' },
    low: { color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/50' }
  };
  return configs[priority] || configs.medium;
};

const getRiskConfig = (risk) => {
  const configs = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: '🔴' },
    high: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50', icon: '🟠' },
    medium: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', icon: '🟡' },
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', icon: '🟢' }
  };
  return configs[risk] || configs.medium;
};

const getTypeIcon = (type) => {
  const icons = {
    deployment: <Rocket className="w-4 h-4" />,
    database: <Database className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    ai: <Brain className="w-4 h-4" />,
    feature: <Sparkles className="w-4 h-4" />,
    bug_fix: <Bug className="w-4 h-4" />,
    documentation: <FileText className="w-4 h-4" />,
    optimization: <Zap className="w-4 h-4" />
  };
  return icons[type] || <Code className="w-4 h-4" />;
};

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

export default function AIAgentWorkforce() {
  // State
  const [agents, setAgents] = useState(AI_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(INITIAL_APPROVALS);
  const [taskQueue, setTaskQueue] = useState(INITIAL_TASKS);
  const [showApprovals, setShowApprovals] = useState(true);
  const [showTaskQueue, setShowTaskQueue] = useState(true);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [notification, setNotification] = useState(null);

  // Calculate stats
  const stats = {
    activeAgents: agents.filter(a => a.status === 'working').length,
    totalAgents: agents.length,
    tasksCompleted: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
    tasksPending: taskQueue.filter(t => t.status === 'pending').length,
    tasksInProgress: taskQueue.filter(t => t.status === 'in_progress').length,
    pendingApprovalsCount: pendingApprovals.length,
    totalCostPerMonth: agents.reduce((sum, a) => sum + a.costPerMonth, 0),
    humanEquivalentCost: agents.reduce((sum, a) => sum + (a.humanEquivalentSalary / 12), 0),
  };
  stats.savings = stats.humanEquivalentCost - stats.totalCostPerMonth;
  stats.savingsPercent = (stats.savings / stats.humanEquivalentCost) * 100;
  stats.annualSavings = stats.savings * 12;

  // Handlers
  const handleApprove = useCallback((id) => {
    const approval = pendingApprovals.find(a => a.id === id);
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    setNotification({
      type: 'success',
      message: `✅ Approved: ${approval?.title}`,
      agent: approval?.agentName
    });
    setTimeout(() => setNotification(null), 3000);
  }, [pendingApprovals]);

  const handleReject = useCallback((id) => {
    const approval = pendingApprovals.find(a => a.id === id);
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
    setNotification({
      type: 'error',
      message: `❌ Rejected: ${approval?.title}`,
      agent: approval?.agentName
    });
    setTimeout(() => setNotification(null), 3000);
  }, [pendingApprovals]);

  const handleAssignTask = useCallback((taskId, agentName) => {
    setTaskQueue(prev => prev.map(t => 
      t.id === taskId ? { ...t, assignedAgent: agentName, status: 'in_progress' } : t
    ));
    setNotification({
      type: 'info',
      message: `📋 Task assigned to ${agentName}`,
      agent: agentName
    });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border backdrop-blur-sm animate-pulse ${
          notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' :
          notification.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-300' :
          'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="relative max-w-[1800px] mx-auto space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/20">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Agent Workforce
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                6 AI Engineers • Orchestrated by ARIA • Approved by Founder 👑
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {pendingApprovals.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 animate-pulse">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold">{pendingApprovals.length} Approvals</span>
              </div>
            )}
            <button className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all border border-slate-700/50">
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
            <button className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all border border-slate-700/50">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        {/* STATS ROW */}
        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {/* Active Agents */}
          <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Active Agents</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeAgents}/{stats.totalAgents}</p>
            <p className="text-xs text-slate-500">Currently working</p>
          </div>

          {/* Tasks Completed */}
          <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.tasksCompleted}</p>
            <p className="text-xs text-slate-500">All time</p>
          </div>

          {/* Queue */}
          <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Queue</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.tasksPending}</p>
            <p className="text-xs text-slate-500">{stats.tasksInProgress} in progress</p>
          </div>

          {/* Monthly Cost */}
          <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">AI Cost</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalCostPerMonth)}</p>
            <p className="text-xs text-slate-500">per month</p>
          </div>

          {/* Savings % */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Savings</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.savingsPercent.toFixed(1)}%</p>
            <p className="text-xs text-emerald-500">vs human team</p>
          </div>

          {/* Annual Savings */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400">Annual Savings</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats.annualSavings)}</p>
            <p className="text-xs text-purple-500">per year 🎉</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        {/* MAIN CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
          {/* AGENT GRID (Left 2 columns) */}
          {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              AI Engineers
              <span className="text-xs text-slate-500 font-normal ml-2">Click to view details</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {agents.map(agent => {
                const statusConfig = getStatusConfig(agent.status);
                const isSelected = selectedAgent?.id === agent.id;
                
                return (
                  <div 
                    key={agent.id}
                    onClick={() => setSelectedAgent(isSelected ? null : agent)}
                    className={`
                      relative rounded-xl p-4 cursor-pointer transition-all duration-300
                      ${isSelected 
                        ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                        : 'bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 hover:bg-slate-900/80'
                      }
                    `}
                  >
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                      <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                    </div>

                    {/* Agent Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-4xl">{agent.emoji}</div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                        <p className="text-sm text-slate-400">{agent.role}</p>
                      </div>
                    </div>

                    {/* Current Task */}
                    {agent.currentTask && (
                      <div className="mb-3 p-2.5 rounded-lg bg-slate-800/60">
                        <p className="text-xs text-slate-500 mb-1">🔄 Working on:</p>
                        <p className="text-sm text-slate-300 line-clamp-2">{agent.currentTask}</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <p className="text-lg font-bold text-white">{agent.tasksCompleted}</p>
                        <p className="text-xs text-slate-500">Tasks</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <p className="text-lg font-bold text-emerald-400">{agent.feedbackScore}%</p>
                        <p className="text-xs text-slate-500">Score</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/40">
                        <p className="text-lg font-bold text-purple-400">${agent.costPerMonth}</p>
                        <p className="text-xs text-slate-500">/mo</p>
                      </div>
                    </div>

                    {/* Autonomy Badge */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Autonomy: <span className={`font-medium ${
                        agent.autonomyLevel === 'HIGH' ? 'text-emerald-400' :
                        agent.autonomyLevel === 'MEDIUM-HIGH' ? 'text-cyan-400' :
                        agent.autonomyLevel === 'MEDIUM' ? 'text-amber-400' :
                        'text-slate-400'
                      }`}>{agent.autonomyLevel}</span></span>
                      <span className="text-xs text-slate-500">{agent.model}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            {/* SELECTED AGENT DETAIL PANEL */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            
            {selectedAgent && (
              <div className="rounded-xl p-6 bg-slate-900/80 border border-slate-800/50 backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{selectedAgent.emoji}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                      <p className="text-slate-400">{selectedAgent.role}</p>
                      <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${getStatusConfig(selectedAgent.status).bg}`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusConfig(selectedAgent.status).dot}`} />
                        <span className={`text-sm font-medium ${getStatusConfig(selectedAgent.status).color}`}>
                          {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-white p-1">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-6">{selectedAgent.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-2xl font-bold text-white">{selectedAgent.tasksCompleted}</p>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-2xl font-bold text-red-400">{selectedAgent.tasksFailed}</p>
                    <p className="text-xs text-slate-500">Failed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-2xl font-bold text-emerald-400">{selectedAgent.feedbackScore}%</p>
                    <p className="text-xs text-slate-500">Score</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-2xl font-bold text-purple-400">{selectedAgent.autonomyLevel}</p>
                    <p className="text-xs text-slate-500">Autonomy</p>
                  </div>
                </div>

                {/* Current Task */}
                {selectedAgent.currentTask && (
                  <div className="mb-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-cyan-400">Currently Working On</span>
                    </div>
                    <p className="text-white">{selectedAgent.currentTask}</p>
                  </div>
                )}

                {/* Specializations */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.specializations.map((spec, index) => (
                      <span key={index} className="px-3 py-1.5 rounded-full bg-slate-800 text-sm text-slate-300 border border-slate-700/50">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cost Analysis */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 mb-6">
                  <h3 className="text-sm font-medium text-emerald-400 mb-3">💰 Cost Analysis</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">AI Cost</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(selectedAgent.costPerMonth)}/mo</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Human Equivalent</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(selectedAgent.humanEquivalentSalary / 12)}/mo</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Savings</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {Math.round(((selectedAgent.humanEquivalentSalary / 12) - selectedAgent.costPerMonth) / (selectedAgent.humanEquivalentSalary / 12) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Prompt Toggle */}
                <div className="border-t border-slate-800/50 pt-4">
                  <button 
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {showSystemPrompt ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <Code className="w-4 h-4" />
                    View System Prompt
                  </button>
                  
                  {showSystemPrompt && (
                    <div className="mt-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                        {selectedAgent.systemPrompt}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Powered by {selectedAgent.model}
                  </span>
                  <span>Reports to: {selectedAgent.reportsTo}</span>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
          {/* RIGHT SIDEBAR */}
          {/* ═══════════════════════════════════════════════════════════════════════════════════════ */}
          
          <div className="space-y-6">
            
            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            {/* PENDING APPROVALS */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            
            <div>
              <button
                onClick={() => setShowApprovals(!showApprovals)}
                className="w-full flex items-center justify-between mb-3"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Founder Approvals
                  {pendingApprovals.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold animate-pulse">
                      {pendingApprovals.length}
                    </span>
                  )}
                </h2>
                {showApprovals ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </button>
              
              {showApprovals && (
                <div className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/50 text-center">
                      <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium">All caught up!</p>
                      <p className="text-sm text-slate-500">No pending approvals</p>
                    </div>
                  ) : (
                    pendingApprovals.map(approval => {
                      const riskConfig = getRiskConfig(approval.risk);
                      
                      return (
                        <div key={approval.id} className={`rounded-xl p-4 border ${riskConfig.bg} ${riskConfig.border}`}>
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{approval.agentEmoji}</span>
                              <div>
                                <h4 className="font-semibold text-white text-sm">{approval.title}</h4>
                                <p className="text-xs text-slate-400">from {approval.agentName} • {formatTimeAgo(approval.createdAt)}</p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${riskConfig.bg} ${riskConfig.color}`}>
                              {getTypeIcon(approval.type)}
                              <span>{approval.risk.toUpperCase()}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-slate-300 mb-3">{approval.description}</p>

                          {/* Recommendation */}
                          <div className="p-3 rounded-lg bg-slate-800/60 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="w-4 h-4 text-cyan-400" />
                              <span className="text-xs text-cyan-400 font-medium">ARIA's Recommendation ({approval.confidence}% confidence)</span>
                            </div>
                            <p className="text-sm text-slate-200">{approval.recommendation}</p>
                          </div>

                          {/* Impact */}
                          <div className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                            <Target className="w-3 h-3" />
                            <span>Impact: {approval.estimatedImpact}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(approval.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all font-medium border border-emerald-500/30"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(approval.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-medium border border-red-500/30"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            {/* TASK QUEUE */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            
            <div>
              <button
                onClick={() => setShowTaskQueue(!showTaskQueue)}
                className="w-full flex items-center justify-between mb-3"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-400" />
                  Task Queue
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-sm">
                    {taskQueue.length}
                  </span>
                </h2>
                {showTaskQueue ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </button>
              
              {showTaskQueue && (
                <div className="space-y-2">
                  {taskQueue.map(task => {
                    const priorityConfig = getPriorityConfig(task.priority);
                    
                    return (
                      <div 
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors border border-slate-700/30"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                            {getTypeIcon(task.type)}
                            <span>{task.priority.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{task.title}</p>
                            <p className="text-xs text-slate-500">{task.type} • {formatTimeAgo(task.createdAt)}</p>
                          </div>
                        </div>
                        {task.assignedAgent ? (
                          <span className="text-xs text-cyan-400 whitespace-nowrap ml-2">→ {task.assignedAgent}</span>
                        ) : (
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-2">Unassigned</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            {/* QUICK COMMANDS */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Quick Commands for ARIA
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm border border-slate-700/30">
                  <span className="text-cyan-400 mr-2">→</span> "ARIA, show workforce status"
                </button>
                <button className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm border border-slate-700/30">
                  <span className="text-cyan-400 mr-2">→</span> "Assign bug fix to SCOUT"
                </button>
                <button className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm border border-slate-700/30">
                  <span className="text-cyan-400 mr-2">→</span> "ATLAS, review latest PR"
                </button>
                <button className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm border border-slate-700/30">
                  <span className="text-cyan-400 mr-2">→</span> "NEXUS, deploy to staging"
                </button>
                <button className="w-full text-left px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm border border-slate-700/30">
                  <span className="text-cyan-400 mr-2">→</span> "SENTINEL, run security scan"
                </button>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            {/* ARIA STATUS */}
            {/* ═══════════════════════════════════════════════════════════════════════════════════ */}
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">ARIA</h3>
                  <p className="text-xs text-purple-400">Executive AI Assistant</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Online</span>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                Orchestrating {stats.activeAgents} agents, {stats.tasksInProgress} tasks in progress.
              </p>
              <div className="mt-3 pt-3 border-t border-purple-500/20 text-xs text-slate-500">
                <p>Model: Claude Opus 4.5</p>
                <p>Uptime: 99.99% • Response: &lt;2s</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-slate-800/50 gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2025 AI Freedom Studios • AG-X Command Center v3.0
            </p>
            <span className="text-slate-700">|</span>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              🇵🇹 Built for Portugal
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-emerald-400 font-medium">
              💰 Saving {formatCurrency(stats.annualSavings)}/year vs human team
            </p>
            <span className="text-slate-700">|</span>
            <p className="text-sm text-purple-400">
              🤖 98.4% cost reduction
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}