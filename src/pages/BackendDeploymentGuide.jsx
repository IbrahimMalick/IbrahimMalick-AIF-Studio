
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Code,
  CheckCircle2,
  Copy,
  ExternalLink,
  Database,
  Shield,
  Zap,
  AlertTriangle,
  Mail, // New import
  BarChart3, // New import
  TrendingUp, // New import
  MessageSquare, // New import for Slack
  AlertCircle, // New import for Prometheus Alerts
  BookOpen, // New import for Runbooks
  FileText // New import for Runbooks
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function BackendDeploymentGuide() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyCode = (code, section) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envTemplate = `# ===== Core App =====
NODE_ENV=production
PORT=8787
APP_BASE_URL=https://studio.aifreedomduane.com

# ===== Database / Queue =====
DATABASE_URL=postgresql://USER:PASS@HOST:5432/afs
REDIS_URL=redis://:PASS@HOST:6379/0

# ===== Storage (Cloudflare R2) =====
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxx
R2_BUCKET=afs-media
R2_PUBLIC_BASE=https://media.aifreedomduane.com
R2_SIGNED_URL_TTL=900

# ===== GoHighLevel =====
GHL_CLIENT_ID=xxxxxxxxxxxxxxxx
GHL_CLIENT_SECRET=xxxxxxxxxxxxxxxx
GHL_REDIRECT_URI=https://studio.aifreedomduane.com/api/ghl/oauth/callback
GHL_API_BASE=https://services.leadconnectorhq.com
GHL_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ===== Twilio (AI Receptionist) =====
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_VOICE_NUMBER=+1XXXXXXXXXX
TWILIO_WEBHOOK_URL=https://studio.aifreedomduane.com/api/voice/inbound

# ===== AI Voice =====
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxx
DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxx

# ===== Video Rendering =====
HEYGEN_API_KEY=xxxxxxxxxxxxxxxxxxxx

# ===== Email =====
POSTMARK_API_KEY=xxxxxxxxxxxxxxxxxxxx
SYSTEM_EMAIL_FROM=notifications@aifreedomduane.com

# ===== Auth / Security =====
JWT_SECRET=superlongrandomsecret
CORS_ORIGINS=https://app.base44.com,https://studio.aifreedomduane.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=90`;

  const postmarkCode = `// src/lib/mailer.js
import Postmark from "postmark";

const ENABLED = !!process.env.POSTMARK_API_KEY;
const FROM = process.env.SYSTEM_EMAIL_FROM || "no-reply@example.com";
const client = ENABLED ? new Postmark.ServerClient(process.env.POSTMARK_API_KEY) : null;

const wait = (ms) => new Promise(r => setTimeout(r, ms));

export async function sendEmail({ to, subject, html, text, messageStream = "outbound" }) {
  if (!ENABLED) {
    console.warn("[MAIL] disabled", { to, subject });
    return { ok: false, disabled: true };
  }
  let attempt = 0;
  while (attempt < 3) {
    try {
      const res = await client.sendEmail({ 
        From: FROM, 
        To: to, 
        Subject: subject, 
        HtmlBody: html, 
        TextBody: text, 
        MessageStream: messageStream 
      });
      return { ok: true, res };
    } catch (err) {
      attempt++;
      if (attempt >= 3) throw err;
      await wait(250 * attempt * attempt);
    }
  }
}

export const SystemMail = {
  async passwordReset({ to, resetUrl }) {
    const subject = "Reset your AI Freedom Studios password";
    const html = \`<p>Click to reset your password:</p><p><a href="\${resetUrl}">\${resetUrl}</a></p>\`;
    return sendEmail({ to, subject, html, text: \`Reset link: \${resetUrl}\` });
  },
  async renderFailed({ to, jobId, reason }) {
    const subject = \`Render failed — Job \${jobId}\`;
    const html = \`<p>Your video render <b>\${jobId}</b> failed.</p><p>Reason: \${reason || "Unknown"}.</p>\`;
    return sendEmail({ to, subject, html, text: \`Render failed. Job \${jobId}. \${reason || ""}\` });
  },
  async webhookAlert({ to, name, payload }) {
    const subject = \`Webhook alert — \${name}\`;
    const html = \`<p>Received webhook: <b>\${name}</b></p><pre>\${JSON.stringify(payload, null, 2)}</pre>\`;
    return sendEmail({ to, subject, html, text: \`Webhook \${name}\\n\${JSON.stringify(payload)}\` });
  }
};`;

  const prometheusCode = `// src/metrics/registry.js
import client from "prom-client";
const Registry = client.Registry;
export const registry = new Registry();
client.collectDefaultMetrics({ register: registry });

export const renderJobsTotal = new client.Counter({
  name: "afs_render_jobs_total",
  help: "Total render jobs by status",
  labelNames: ["status"],
  registers: [registry],
});

export const renderDuration = new client.Histogram({
  name: "afs_render_duration_seconds",
  help: "Render job duration in seconds",
  buckets: [2, 5, 10, 20, 30, 45, 60, 90, 120, 180, 300],
  registers: [registry],
});

export const queueLag = new client.Gauge({
  name: "afs_queue_lag_seconds",
  help: "Approx queue lag (oldest waiting job age)",
  registers: [registry],
});

// In src/server.js - add metrics endpoint
import { registry } from "./metrics/registry.js";

app.get("/metrics", async (_, res) => {
  res.set("Content-Type", registry.contentType);
  res.end(await registry.metrics());
});

// In worker - instrument jobs
import { renderJobsTotal, renderDuration } from "../metrics/registry.js";

new Worker("afs:render", async job => {
  renderJobsTotal.inc({ status: "started" }, 1);
  const start = process.hrtime.bigint();
  try {
    const out = await renderVideo(job.data);
    const dur = Number(process.hrtime.bigint() - start) / 1e9;
    renderDuration.observe(dur);
    renderJobsTotal.inc({ status: "completed" }, 1);
    return out;
  } catch (e) {
    const dur = Number(process.hrtime.bigint() - start) / 1e9;
    renderDuration.observe(dur);
    renderJobsTotal.inc({ status: "failed" }, 1);
    throw e;
  }
});`;

  const grafanaJSON = `{
  "title": "AFS — Render Pipeline",
  "panels": [
    {
      "type": "stat",
      "title": "Jobs Rate (completed/min)",
      "id": 1,
      "targets": [{
        "expr": "sum(rate(afs_render_jobs_total{status=\\"completed\\"}[5m])) * 60"
      }]
    },
    {
      "type": "stat",
      "title": "Error Rate (%)",
      "id": 2,
      "targets": [{
        "expr": "100 * (sum(rate(afs_render_jobs_total{status=\\"failed\\"}[5m])) / sum(rate(afs_render_jobs_total[5m])))"
      }],
      "fieldConfig": {
        "defaults": {
          "thresholds": {
            "steps": [
              { "color": "green", "value": 0 },
              { "color": "yellow", "value": 5 },
              { "color": "red", "value": 10 }
            ]
          }
        }
      }
    },
    {
      "type": "heatmap",
      "title": "Render Duration Heatmap",
      "id": 3,
      "targets": [{
        "expr": "sum(rate(afs_render_duration_seconds_bucket[5m])) by (le)"
      }]
    },
    {
      "type": "timeseries",
      "title": "Completed vs Failed",
      "id": 4,
      "targets": [
        {
          "expr": "sum(rate(afs_render_jobs_total{status=\\"completed\\"}[5m]))",
          "legendFormat": "completed"
        },
        {
          "expr": "sum(rate(afs_render_jobs_total{status=\\"failed\\"}[5m]))",
          "legendFormat": "failed"
        }
      ]
    }
  ],
  "refresh": "30s",
  "tags": ["afs", "renders", "queue"]
}`;

  const slackCode = `// src/lib/slack.js
import fetch from "node-fetch";

export async function slackNotify({ title, text, blocks, channel }) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return { ok: false, error: "missing SLACK_WEBHOOK_URL" };
  const payload = {
    text: title || text, // Fallback to text for compatibility
    blocks: blocks || [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: \`*<:afsstudio:123456789012345678> \${title || "Notification"}*\n\${text}\`
        }
      }
    ]
  };
  if (channel && process.env.SLACK_CHANNEL_OVERRIDE) payload.channel = process.env.SLACK_CHANNEL_OVERRIDE;
  const r = await fetch(url, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(payload) 
  });
  return { ok: r.ok };
}

// In src/routes/alerts.js
import express from "express";
import { slackNotify } from "../lib/slack.js";
const router = express.Router();

router.post("/slack", async (req, res) => {
  const { title, text, blocks } = req.body || {};
  const out = await slackNotify({ title, text, blocks });
  res.json(out);
});

export default router;

// In server.js - add route
import alerts from "./routes/alerts.js";
app.use("/api/alerts", alerts);

// In render worker - auto-alert on failure
import { slackNotify } from "../lib/slack.js";
import { Worker } from "bullmq"; // Assuming BullMQ is used and 'connection' object is available

// Assuming connection and concurrency are defined elsewhere or passed in
const connection = { /* your Redis connection config */ }; 
const concurrency = 2; // Example concurrency

new Worker("afs:render", async job => {
  const start = process.hrtime.bigint();
  try {
    const output = await renderVideo(job.data); // Assuming renderVideo is defined
    return output;
  } catch (e) {
    const dur = Number(process.hrtime.bigint() - start) / 1e9;
    await slackNotify({
      title: \`Render failed (job \${job.id})\`,
      text: \`Template: \${job.data.templateId}\\nWorkspace: \${job.data.workspaceId}\\nDuration: \${dur.toFixed(1)}s\\nError: \${e?.message || e}\`
    });
    throw e;
  }
}, { connection, concurrency });`;

  const prometheusRulesYAML = `# prometheus-rules.yml
groups:
  - name: afs.render.pipeline
    rules:
      # A) High error rate
      - alert: AFSHighErrorRate
        expr: |
          (sum(rate(afs_render_jobs_total{status="failed"}[5m])) /
           clamp_max(sum(rate(afs_render_jobs_total[5m])), 0.0000001)) > 0.10
        for: 5m
        labels:
          severity: critical
          team: afs
          service: render
        annotations:
          summary: "AFS render errors > 10%"
          description: |
            Error rate: {{ printf "%.2f" (100 * (sum(rate(afs_render_jobs_total{status="failed"}[5m])) /
              clamp_max(sum(rate(afs_render_jobs_total[5m])), 0.0000001))) }}%%

      # B) p99 > 120s
      - alert: AFSP99DurationHigh
        expr: |
          histogram_quantile(
            0.99,
            sum(rate(afs_render_duration_seconds_bucket[5m])) by (le)
          ) > 120
        for: 5m
        labels:
          severity: warning
          team: afs
          service: render
        annotations:
          summary: "AFS p99 render duration > 120s"
          description: "p99 render time over last 5m exceeded 120s."

      # C) Stalled pipeline (no completed jobs for 10m)
      - alert: AFSNoCompletedJobs
        expr: sum(rate(afs_render_jobs_total{status="completed"}[10m])) == 0
        for: 10m
        labels:
          severity: warning
          team: afs
          service: render
        annotations:
          summary: "AFS pipeline appears stalled"
          description: "No completed jobs detected for 10 minutes."

      # D) Dead-man (no metrics scrape in 10m)
      - alert: AFSMetricsMissing
        expr: absent(afs_render_jobs_total)
        for: 10m
        labels:
          severity: critical
          team: afs
          service: render
        annotations:
          summary: "AFS metrics missing (dead-man)"
          description: "Prometheus cannot find afs_render_jobs_total for 10m."`;

  const alertmanagerFullYAML = `# alertmanager.yml
route:
  receiver: slack_default
  group_by: ["alertname", "service"]
  group_wait: 15s
  group_interval: 2m
  repeat_interval: 3h
  routes:
    - matchers:
        - severity="critical"
      receiver: slack_critical
      repeat_interval: 1h

receivers:
  - name: slack_default
    slack_configs:
      - api_url: \${SLACK_WEBHOOK_URL}
        channel: "#ops-afs"
        send_resolved: true
        title: "{{ .CommonAnnotations.summary }}"
        text: |
          *Service:* {{ .CommonLabels.service | default "unknown" }}
          *Severity:* {{ .CommonLabels.severity | default "info" }}
          *Details:* {{ .CommonAnnotations.description | default "—" }}
          *Starts:* {{ .StartsAt }}
          {{ range .Alerts }}
          — *{{ .Labels.alertname }}* on *{{ .Labels.instance | default "N/A" }}*
          {{ end }}

  - name: slack_critical
    slack_configs:
      - api_url: \${SLACK_WEBHOOK_URL}
        channel: "#ops-afs-critical"
        send_resolved: true
        title: "🚨 {{ .CommonAnnotations.summary }}"
        text: |
          *Service:* {{ .CommonLabels.service | default "unknown" }}
          *Severity:* {{ .CommonLabels.severity | default "critical" }}
          *Details:* {{ .CommonAnnotations.description | default "—" }}
          *Starts:* {{ .StartsAt }}`;

  const prometheusYAML = `# prometheus.yml (snippet)
rule_files:
  - /etc/prometheus/prometheus-rules.yml

scrape_configs:
  - job_name: afs-api
    scrape_interval: 15s
    static_configs:
      - targets: ['studio.aifreedomduane.com:8787']
    metrics_path: /metrics

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']`;

  // Placeholder for createPageUrl, assuming it exists elsewhere in the app
  // This function was present in the original code, but not defined within this component.
  // For a functional file, it needs to be defined or imported.
  // Assuming it's a simple helper for linking.
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "ProviderSettings":
        return "/settings/providers"; // Example path
      case "SecurityDocs":
        return "/docs/security"; // Example path
      default:
        return "#";
    }
  };


  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Badge className="bg-purple-500/20 text-purple-400 mb-4">
            🚀 Production Backend
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-3">
            Backend API Deployment Guide
          </h1>
          <p className="text-gray-400 text-lg">
            Deploy your production backend for OAuth, webhooks, voice processing, and real-time integrations.
          </p>
        </div>

        {/* Architecture Overview */}
        <Card className="bg-gradient-to-br from-[#111317] to-[#0B0B0C] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">🏗️ Architecture Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <Server className="w-6 h-6 text-[#FFD700] mb-2" />
                <h3 className="text-white font-semibold mb-1 text-sm">Frontend (Base44)</h3>
                <p className="text-gray-400 text-xs">React UI, entity storage, user management</p>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <Code className="w-6 h-6 text-[#00D4C9] mb-2" />
                <h3 className="text-white font-semibold mb-1 text-sm">Backend API</h3>
                <p className="text-gray-400 text-xs">OAuth, webhooks, queue management, voice processing</p>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <Database className="w-6 h-6 text-[#9D4EDD] mb-2" />
                <h3 className="text-white font-semibold mb-1 text-sm">Services</h3>
                <p className="text-gray-400 text-xs">PostgreSQL, Redis, BullMQ, Cloudflare R2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="env" className="space-y-6">
          <TabsList className="bg-[#111]">
            <TabsTrigger value="env">Environment</TabsTrigger>
            <TabsTrigger value="routes">API Routes</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="email">Email System</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="alerting">Alerting</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          {/* Environment Variables */}
          <TabsContent value="env">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">.env Configuration Template</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => copyCode(envTemplate, 'env')}
                    className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'env' ? 'Copied!' : 'Copy All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                  {envTemplate}
                </pre>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Required Services", items: ["PostgreSQL 14+", "Redis 7+", "Node.js 18+", "Cloudflare R2"] },
                    { title: "External APIs", items: ["GoHighLevel", "Twilio", "ElevenLabs", "HeyGen", "Postmark"] }
                  ].map((section, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-2 text-sm">{section.title}</h4>
                      <ul className="space-y-1">
                        {section.items.map((item, iidx) => (
                          <li key={iidx} className="text-gray-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Routes */}
          <TabsContent value="routes">
            <div className="space-y-4">
              
              {[
                {
                  title: "GoHighLevel Routes",
                  endpoint: "/api/ghl/*",
                  routes: [
                    { method: "GET", path: "/oauth/start", desc: "Initiate OAuth flow" },
                    { method: "GET", path: "/oauth/callback", desc: "OAuth callback handler" },
                    { method: "POST", path: "/contact", desc: "Create/update GHL contact" },
                    { method: "POST", path: "/opportunity", desc: "Create GHL opportunity" },
                    { method: "POST", path: "/calendar/appointment", desc: "Book appointment" },
                    { method: "POST", path: "/webhook", desc: "Receive GHL webhooks" }
                  ]
                },
                {
                  title: "Voice/AI Receptionist Routes",
                  endpoint: "/api/voice/*",
                  routes: [
                    { method: "POST", path: "/inbound", desc: "Twilio voice webhook (TwiML)" },
                    { method: "POST", path: "/summary", desc: "Post-call processing" },
                    { method: "POST", path: "/stt", desc: "Speech-to-text processing" },
                    { method: "POST", path: "/tts", desc: "Text-to-speech generation" }
                  ]
                },
                {
                  title: "Render Queue Routes",
                  endpoint: "/api/renders/*",
                  routes: [
                    { method: "POST", path: "/start", desc: "Enqueue render job" },
                    { method: "GET", path: "/status/:jobId", desc: "Check job status" },
                    { method: "POST", path: "/webhook", desc: "Provider callback (HeyGen/FFmpeg)" }
                  ]
                },
                {
                  title: "Events & Analytics Routes",
                  endpoint: "/api/events/*",
                  routes: [
                    { method: "POST", path: "/", desc: "Generic event ingestion" },
                    { method: "POST", path: "/deal-won", desc: "Deal won event" },
                    { method: "POST", path: "/render-ready", desc: "Render complete event" }
                  ]
                }
              ].map((section, idx) => (
                <Card key={idx} className="bg-[#111] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Code className="w-5 h-5 text-[#00D4C9]" />
                      {section.title}
                    </CardTitle>
                    <code className="text-gray-500 text-xs">{section.endpoint}</code>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {section.routes.map((route, ridx) => (
                        <div key={ridx} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                          <div className="flex items-center gap-3">
                            <Badge className={`${
                              route.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                              route.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            } text-xs font-mono`}>
                              {route.method}
                            </Badge>
                            <code className="text-[#00D4C9] text-sm">{route.path}</code>
                          </div>
                          <p className="text-gray-400 text-xs">{route.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

            </div>
          </TabsContent>

          {/* Event Names */}
          <TabsContent value="events">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">📡 Standardized Event Schema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-3 text-sm">Event Structure</h4>
                  <pre className="bg-[#000] p-4 rounded-lg text-xs text-gray-300 overflow-x-auto">
{`{
  "type": "lead.created",
  "workspaceId": "ws_123",
  "payload": {
    "leadId": "lead_456",
    "email": "john@example.com",
    "source": "call"
  },
  "ts": 1699564800000,
  "version": "1.0"
}`}
                  </pre>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      category: "Lead Events",
                      events: [
                        { name: "lead.created", desc: "New lead captured" },
                        { name: "lead.updated", desc: "Lead data changed" },
                        { name: "lead.tagged", desc: "Tag added/removed" },
                        { name: "lead.scored", desc: "Score updated" }
                      ]
                    },
                    {
                      category: "Appointment Events",
                      events: [
                        { name: "appointment.booked", desc: "Calendar booking created" },
                        { name: "appointment.rescheduled", desc: "Time changed" },
                        { name: "appointment.noshow", desc: "Lead didn't attend" },
                        { name: "appointment.completed", desc: "Meeting finished" }
                      ]
                    },
                    {
                      category: "Deal Events",
                      events: [
                        { name: "deal.created", desc: "Opportunity created" },
                        { name: "deal.stage_changed", desc: "Pipeline movement" },
                        { name: "deal.won", desc: "Deal closed won" },
                        { name: "deal.lost", desc: "Deal closed lost" }
                      ]
                    },
                    {
                      category: "Render Events",
                      events: [
                        { name: "render.started", desc: "Job started processing" },
                        { name: "render.ready", desc: "Asset available" },
                        { name: "render.failed", desc: "Render error" },
                        { name: "render.progress", desc: "Progress update" }
                      ]
                    },
                    {
                      category: "Call Events",
                      events: [
                        { name: "call.started", desc: "Inbound/outbound initiated" },
                        { name: "call.summary_ready", desc: "Transcript & analysis done" },
                        { name: "call.followup_sent", desc: "Auto-SMS/email sent" },
                        { name: "call.escalated", desc: "Transferred to human" }
                      ]
                    },
                    {
                      category: "Campaign Events",
                      events: [
                        { name: "campaign.launched", desc: "Campaign went live" },
                        { name: "campaign.optimized", desc: "AI optimization ran" },
                        { name: "campaign.paused", desc: "Auto-paused by guardrails" },
                        { name: "campaign.completed", desc: "Campaign ended" }
                      ]
                    }
                  ].map((category, idx) => (
                    <Card key={idx} className="bg-[#0B0B0C] border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {category.events.map((event, eidx) => (
                            <div key={eidx} className="flex items-start gap-2">
                              <Zap className="w-3 h-3 text-[#FFD700] flex-shrink-0 mt-0.5" />
                              <div>
                                <code className="text-[#00D4C9] text-xs">{event.name}</code>
                                <p className="text-gray-500 text-xs">{event.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Email System Tab */}
          <TabsContent value="email">
            <div className="space-y-6">
              
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#00D4C9]" />
                      Postmark Email System
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(postmarkCode, 'postmark')}
                      className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'postmark' ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-400 font-semibold text-sm mb-2">
                      📧 Email Helper Features
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Automatic retry (3 attempts with exponential backoff)</li>
                      <li>• HTML + plain text support</li>
                      <li>• Pre-built templates for system emails</li>
                      <li>• Password reset, render failures, webhook alerts</li>
                    </ul>
                  </div>

                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                    {postmarkCode}
                  </pre>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">Installation</h4>
                      <code className="text-[#00D4C9] text-xs block mb-2">npm install postmark</code>
                      <p className="text-gray-400 text-xs">Add to package.json dependencies</p>
                    </div>

                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">Usage Example</h4>
                      <code className="text-gray-300 text-xs block">
                        {`await SystemMail.passwordReset({
  to: user.email,
  resetUrl: "https://..."
});`}
                      </code>
                    </div>
                  </div>

                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <div className="space-y-6">

              {/* Prometheus Metrics */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#FFD700]" />
                      Prometheus Metrics
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(prometheusCode, 'prometheus')}
                      className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'prometheus' ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h4 className="text-yellow-400 font-semibold text-sm mb-2">
                      📊 Metrics Tracked
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400 mb-1">Counters:</p>
                        <code className="text-gray-300 block">afs_render_jobs_total{"{status}"}</code>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Histograms:</p>
                        <code className="text-gray-300 block">afs_render_duration_seconds</code>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Gauges:</p>
                        <code className="text-gray-300 block">afs_queue_lag_seconds</code>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Default:</p>
                        <code className="text-gray-300 block">CPU, memory, event loop</code>
                      </div>
                    </div>
                  </div>

                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                    {prometheusCode}
                  </pre>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">Installation</h4>
                      <code className="text-[#00D4C9] text-xs block mb-2">npm install prom-client</code>
                    </div>

                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">Metrics Endpoint</h4>
                      <code className="text-gray-300 text-xs block">GET /metrics</code>
                      <p className="text-gray-500 text-xs mt-1">Prometheus scrape target</p>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Grafana Dashboard */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#00D4C9]" />
                      Grafana Dashboard
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(grafanaJSON, 'grafana')}
                      className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'grafana' ? 'Copied!' : 'Copy JSON'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {[
                      {
                        title: "Jobs Rate",
                        desc: "Completed renders per minute",
                        metric: "rate(afs_render_jobs_total)"
                      },
                      {
                        title: "Error Rate",
                        desc: "% of failed renders",
                        metric: "failed / total * 100"
                      },
                      {
                        title: "Duration Heatmap",
                        desc: "Render time distribution",
                        metric: "histogram_quantile(p99)"
                      },
                      {
                        title: "Time Series",
                        desc: "Completed vs failed over time",
                        metric: "rate per 5m"
                      }
                    ].map((panel, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <h4 className="text-white font-semibold mb-1 text-sm">{panel.title}</h4>
                        <p className="text-gray-400 text-xs mb-2">{panel.desc}</p>
                        <code className="text-[#00D4C9] text-xs">{panel.metric}</code>
                      </div>
                    ))}
                  </div>

                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800 max-h-64">
                    {grafanaJSON}
                  </pre>

                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-green-400 font-semibold text-sm mb-3">
                      ✅ Setup Checklist
                    </h4>
                    <div className="space-y-2 text-sm">
                      {[
                        "1. Install prom-client: npm install prom-client",
                        "2. Add metrics registry & expose /metrics endpoint",
                        "3. Instrument worker with counters/histograms",
                        "4. Configure Prometheus to scrape your API",
                        "5. Import dashboard JSON into Grafana",
                        "6. Verify metrics appear in Grafana"
                      ].map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Additional Monitoring Tools */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">🔧 Recommended Monitoring Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        tool: "Sentry",
                        purpose: "Error tracking & performance",
                        price: "Free tier available",
                        why: "Real-time error alerts, stack traces, user impact"
                      },
                      {
                        tool: "Datadog",
                        purpose: "APM & log aggregation",
                        price: "$15+/mo",
                        why: "Unified monitoring, traces, logs"
                      },
                      {
                        tool: "Pingdom",
                        purpose: "Uptime monitoring",
                        price: "$10+/mo",
                        why: "24/7 uptime checks, alerts"
                      },
                      {
                        tool: "BullMQ Board",
                        purpose: "Queue dashboard",
                        price: "Free (self-hosted)",
                        why: "Visual queue monitoring, job inspection"
                      },
                      {
                        tool: "LogRocket",
                        purpose: "Session replay",
                        price: "$99+/mo",
                        why: "See what users did before errors"
                      },
                      {
                        tool: "Cloudflare",
                        purpose: "DDoS protection",
                        price: "Free tier available",
                        why: "WAF, rate limiting, global CDN"
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-bold">{item.tool}</h4>
                          <Badge className="bg-gray-700 text-gray-300 text-xs">
                            {item.price}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs mb-2">{item.purpose}</p>
                        <p className="text-[#00D4C9] text-xs">✅ {item.why}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Alerting Tab */}
          <TabsContent value="alerting">
            <div className="space-y-6">

              {/* Prometheus Alert Rules */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#FFD700]" />
                      Prometheus Alert Rules
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(prometheusRulesYAML, 'prom_rules_full')}
                      className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'prom_rules_full' ? 'Copied!' : 'Copy Rules'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h4 className="text-yellow-400 font-semibold text-sm mb-2">
                      🚨 4 Production-Ready Alert Rules
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white font-medium">High Error Rate</span>
                          <span className="text-gray-400"> - &gt;10% fails (5m) → Critical</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white font-medium">Slow p99</span>
                          <span className="text-gray-400"> - &gt;120s (5m) → Warning</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white font-medium">Pipeline Stalled</span>
                          <span className="text-gray-400"> - No completions (10m) → Warning</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white font-medium">Dead-Man Switch</span>
                          <span className="text-gray-400"> - Metrics missing (10m) → Critical</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800 max-h-96">
                    {prometheusRulesYAML}
                  </pre>

                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-green-400 font-semibold text-sm mb-3">
                      📁 File Locations
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <code className="text-[#00D4C9] block mb-1">/etc/prometheus/prometheus-rules.yml</code>
                        <p className="text-gray-400">Save the rules file here</p>
                      </div>
                      <div>
                        <code className="text-[#00D4C9] block mb-1">rule_files: - /etc/prometheus/prometheus-rules.yml</code>
                        <p className="text-gray-400">Add to prometheus.yml</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Alertmanager Configuration */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#00D4C9]" />
                      Alertmanager → Slack Configuration
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(alertmanagerFullYAML, 'alertmanager_full')}
                      className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'alertmanager_full' ? 'Copied!' : 'Copy Config'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-400 font-semibold text-sm mb-2">
                      🔔 Multi-Channel Alerting Strategy
                    </h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>
                        <span className="text-white font-medium">#ops-afs</span>
                        <span className="text-gray-400"> - All alerts (grouped, 3h repeat)</span>
                      </div>
                      <div>
                        <span className="text-white font-medium">#ops-afs-critical</span>
                        <span className="text-gray-400"> - Critical only (1h repeat)</span>
                      </div>
                      <div>
                        <span className="text-gray-400">• Grouped by alertname + service</span>
                      </div>
                      <div>
                        <span className="text-gray-400">• 15s group wait, 2m group interval</span>
                      </div>
                      <div>
                        <span className="text-gray-400">• Sends resolved notifications</span>
                      </div>
                    </div>
                  </div>

                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800 max-h-96">
                    {alertmanagerFullYAML}
                  </pre>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">Prometheus Config</h4>
                      <Button
                        size="sm"
                        onClick={() => copyCode(prometheusYAML, 'prom_yaml_full')}
                        className="mb-3 bg-gray-700 hover:bg-gray-600 text-white"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy prometheus.yml
                      </Button>
                      <pre className="bg-[#000] p-3 rounded text-xs text-gray-300 overflow-x-auto">
                        {prometheusYAML}
                      </pre>
                    </div>

                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">Environment Variable</h4>
                      <code className="text-[#00D4C9] text-xs block mb-2">
                        SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
                      </code>
                      <p className="text-gray-400 text-xs">
                        Get from Slack → Apps → Incoming Webhooks
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Direct Node.js Slack Notifier */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#FFD700]" />
                      Direct Slack Notifier (Fast Fallback)
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(slackCode, 'slack_direct')}
                      className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'slack_direct' ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <h4 className="text-purple-400 font-semibold text-sm mb-2">
                      ⚡ Immediate Alerts from Code
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      For instant alerts without waiting for Prometheus scrapes, call Slack directly from your worker error handlers.
                    </p>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>• Bypasses Prometheus → Alertmanager flow</div>
                      <div>• Instant notification on render failures</div>
                      <div>• Includes job details, duration, error message</div>
                      <div>• Zero infrastructure dependencies</div>
                    </div>
                  </div>

                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                    {slackCode}
                  </pre>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">When to Use</h4>
                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>Critical failures needing immediate attention</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>Errors with rich context (job data, user info)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>Development/testing environments</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>Fallback if monitoring stack is down</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">Prometheus vs Direct</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-green-400">✅ Prometheus:</span>
                          <span className="text-gray-400"> Aggregated, deduplicated, threshold-based</span>
                        </div>
                        <div>
                          <span className="text-green-400">✅ Direct:</span>
                          <span className="text-gray-400"> Instant, detailed, context-rich</span>
                        </div>
                        <div>
                          <span className="text-purple-400">💡 Best:</span>
                          <span className="text-gray-300"> Use both!</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Sanity Checks & Testing */}
              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Sanity Checks & Testing (5 Minutes)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    {/* Setup Checklist */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 text-sm">✅ Setup Verification</h4>
                      <div className="space-y-2">
                        {[
                          {
                            task: "Prometheus scraping /metrics",
                            command: "curl http://localhost:8787/metrics",
                            expected: "Should return afs_render_jobs_total metrics"
                          },
                          {
                            task: "Alert rules loaded",
                            command: "Check Prometheus logs",
                            expected: "Loaded 4 rules from prometheus-rules.yml"
                          },
                          {
                            task: "Alertmanager connected",
                            command: "Check Prometheus Status → Runtime & Build",
                            expected: "Alertmanagers: 1/1 up"
                          },
                          {
                            task: "Slack webhook works",
                            command: `curl -X POST \${process.env.SLACK_WEBHOOK_URL || 'YOUR_SLACK_WEBHOOK_URL'} -d '{"text":"Test alert"}'`,
                            expected: "Slack channel receives test message"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-xs font-bold">{idx + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h5 className="text-white font-semibold text-sm mb-1">{item.task}</h5>
                                <code className="text-[#00D4C9] text-xs block mb-1 break-all">{item.command}</code>
                                <p className="text-gray-500 text-xs">✓ {item.expected}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Fire Alerts */}
                    <div>
                      <h4 className="text-white font-semibold mb-3 text-sm">🧪 Test Fire Alerts</h4>
                      <div className="space-y-2">
                        {[
                          {
                            alert: "AFSHighErrorRate",
                            method: "Return 500s in render worker",
                            howto: "Temporarily throw error in worker for 5+ minutes",
                            channel: "#ops-afs-critical"
                          },
                          {
                            alert: "AFSP99DurationHigh",
                            method: "Add artificial sleep",
                            howto: "await new Promise(r => setTimeout(r, 125000)) before rendering",
                            channel: "#ops-afs"
                          },
                          {
                            alert: "AFSNoCompletedJobs",
                            method: "Stop worker",
                            howto: "Kill worker process for 10+ minutes",
                            channel: "#ops-afs"
                          },
                          {
                            alert: "AFSMetricsMissing",
                            method: "Stop API server",
                            howto: "Kill API process for 10+ minutes",
                            channel: "#ops-afs-critical"
                          }
                        ].map((test, idx) => (
                          <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <Badge className={`${
                                test.channel.includes('critical') 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              } text-xs`}>
                                {test.alert}
                              </Badge>
                              <code className="text-gray-500 text-xs">{test.channel}</code>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div>
                                <span className="text-gray-400">Method:</span>
                                <span className="text-white ml-1">{test.method}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">How:</span>
                                <code className="text-[#00D4C9] ml-1 text-xs">{test.howto}</code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Validation Commands */}
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-3 text-sm">⚡ Quick Validation Commands</h4>
                      <div className="space-y-2">
                        {[
                          {
                            desc: "Check Prometheus scrape health",
                            cmd: "curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job, health}'"
                          },
                          {
                            desc: "List active alerts",
                            cmd: "curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | {name: .labels.alertname, state}'"
                          },
                          {
                            desc: "Check Alertmanager status",
                            cmd: "curl http://localhost:9093/api/v2/status | jq"
                          },
                          {
                            desc: "Test direct Slack notification",
                            cmd: `curl -X POST http://localhost:8787/api/alerts/slack -H "Content-Type: application/json" -d '{"text":"Test from AFS"}'`
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="p-2 bg-[#000] rounded">
                            <p className="text-gray-400 text-xs mb-1">{item.desc}</p>
                            <code className="text-[#00D4C9] text-xs block break-all">{item.cmd}</code>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Grafana Alerts Alternative */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#9D4EDD]" />
                    Grafana Alerts (Alternative)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <h4 className="text-purple-400 font-semibold text-sm mb-2">
                      📊 Grafana Native Alerting
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      If you prefer managing alerts within Grafana instead of Alertmanager:
                    </p>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">1.</span>
                        <span>Open AFS Dashboard → Click any panel → Alert → Create alert rule</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">2.</span>
                        <div>
                          <span>Use queries:</span>
                          <div className="mt-1 p-2 bg-[#000] rounded">
                            <code className="text-[#00D4C9]">Error %:</code>
                            <code className="text-gray-400 block">100 * (sum(rate(afs_render_jobs_total{"{status='failed'}"}[5m])) / sum(rate(afs_render_jobs_total[5m])))</code>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">3.</span>
                        <span>Set condition: WHEN avg() OF query(A) IS ABOVE 10 FOR 5m</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">4.</span>
                        <span>Add Slack contact point: Alerting → Contact points → Add Slack</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">5.</span>
                        <span>Configure notification policy</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-2 text-sm">Grafana vs Alertmanager</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-green-400">✅ Grafana:</span>
                          <span className="text-gray-400"> Unified UI, easier setup, built-in silences</span>
                        </div>
                        <div>
                          <span className="text-green-400">✅ Alertmanager:</span>
                          <span className="text-gray-400"> Fleet-wide, advanced routing, better deduplication</span>
                        </div>
                        <div>
                          <span className="text-purple-400">💡 Hybrid:</span>
                          <span className="text-gray-300"> Grafana for business metrics, Alertmanager for infra</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-2 text-sm">Alert Channels Supported</h4>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div>• Slack (incoming webhook or app)</div>
                        <div>• Email (SMTP)</div>
                        <div>• PagerDuty</div>
                        <div>• Webhook (custom endpoint)</div>
                        <div>• Discord, Telegram, Microsoft Teams</div>
                        <div>• OpsGenie, VictorOps</div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Alert Severity Matrix */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">🚦 Alert Severity Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        level: "Critical",
                        color: "red",
                        desc: "System down, data loss risk, security breach",
                        response: "Immediate attention, wake on-call engineer",
                        examples: ["Error rate >10%", "Metrics missing (dead-man)", "Database unreachable", "Payment system failure"],
                        repeat: "1 hour"
                      },
                      {
                        level: "Warning",
                        color: "yellow",
                        desc: "Degraded performance, elevated errors, approaching limits",
                        response: "Investigate within 30 minutes",
                        examples: ["p99 >120s", "Queue stalled", "Integration timeout", "Queue lag >3 min"],
                        repeat: "3 hours"
                      },
                      {
                        level: "Info",
                        color: "blue",
                        desc: "Notable events, successful deployments, usage milestones",
                        response: "No action required, track trends",
                        examples: ["Deployment complete", "1000th render", "Integration connected"],
                        repeat: "24 hours"
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border-l-4" style={{
                        borderLeftColor: item.color === 'red' ? '#ff4433' : item.color === 'yellow' ? '#ffd700' : '#00d4c9'
                      }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${
                            item.color === 'red' ? 'bg-red-500/20 text-red-400' :
                            item.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.level}
                          </Badge>
                          <span className="text-white font-semibold text-sm">{item.desc}</span>
                          <Badge className="bg-gray-700 text-gray-300 text-xs ml-auto">
                            Repeat: {item.repeat}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-gray-500">Response Time:</span>
                            <span className="text-white ml-1">{item.response}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Examples:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.examples.map((ex, eidx) => (
                                <Badge key={eidx} className="bg-gray-800 text-gray-300 text-xs">
                                  {ex}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alert Response Runbooks */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <CardContent className="p-6">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    📖 Alert Response Runbooks
                  </h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Create step-by-step remediation guides for each alert type:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    {[
                      { 
                        alert: "AFSHighErrorRate", 
                        steps: ["Check worker logs", "Verify HeyGen API key", "Check storage quotas", "Review recent renders", "Restart workers if needed"]
                      },
                      { 
                        alert: "AFSP99DurationHigh", 
                        steps: ["Check queue depth", "Review complex renders", "Scale workers if needed", "Optimize heavy templates", "Check network latency"]
                      },
                      { 
                        alert: "AFSNoCompletedJobs", 
                        steps: ["Check worker status", "Review error logs", "Verify queue connection", "Check Redis health", "Restart worker service"]
                      },
                      { 
                        alert: "AFSMetricsMissing", 
                        steps: ["Check API server status", "Verify /metrics endpoint", "Check Prometheus scrape config", "Review network connectivity", "Restart API if down"]
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <p className="text-white font-semibold">{item.alert}</p>
                        </div>
                        <div className="space-y-1">
                          {item.steps.map((step, sidx) => (
                            <div key={sidx} className="flex items-start gap-2">
                              <span className="text-blue-400">{sidx + 1}.</span>
                              <span className="text-gray-300">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Production Best Practices */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#00D4C9]" />
                    Production Alerting Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Alert Fatigue Prevention",
                        tips: [
                          "Set appropriate thresholds (10% error is real issue, 1% is noise)",
                          "Use grouping to batch related alerts",
                          "Increase repeat_interval for non-critical (3h+)",
                          "Auto-resolve alerts when metrics return to normal",
                          "Silence alerts during maintenance windows"
                        ]
                      },
                      {
                        title: "Response Optimization",
                        tips: [
                          "Include runbook links in alert messages",
                          "Add severity levels for triage",
                          "Route critical alerts to separate channel",
                          "Include relevant metrics in alert text",
                          "Set up PagerDuty for after-hours escalation"
                        ]
                      },
                      {
                        title: "Testing & Validation",
                        tips: [
                          "Test alert firing before production deploy",
                          "Verify Slack messages are readable",
                          "Confirm correct channels receive alerts",
                          "Test resolved notifications",
                          "Document expected alert volume"
                        ]
                      },
                      {
                        title: "Continuous Improvement",
                        tips: [
                          "Review alert history weekly",
                          "Tune thresholds based on baselines",
                          "Remove noisy alerts",
                          "Add alerts for new failure modes",
                          "Track MTTD and MTTR metrics"
                        ]
                      }
                    ].map((section, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <h4 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00D4C9]" />
                          {section.title}
                        </h4>
                        <ul className="space-y-1">
                          {section.tips.map((tip, tidx) => (
                            <li key={tidx} className="text-gray-300 text-xs flex items-start gap-2">
                              <span className="text-[#00D4C9]">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Deployment */}
          <TabsContent value="deployment">
            <div className="space-y-6">

              {/* Quick Start */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">⚡ Quick Start (5 Steps)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Copy Environment Template",
                        desc: "Fill in your actual credentials and service keys",
                        action: "Copy .env template above"
                      },
                      {
                        step: 2,
                        title: "Deploy API Server",
                        desc: "Use Vercel, Railway, Render, or your own infrastructure",
                        action: "Deploy Express app"
                      },
                      {
                        step: 3,
                        title: "Configure Webhooks",
                        desc: "Point Twilio, GHL, HeyGen webhooks to your API endpoints",
                        action: "Update provider dashboards"
                      },
                      {
                        step: 4,
                        title: "Test Connections",
                        desc: "Verify OAuth flows, voice calls, and webhook delivery",
                        action: "Run integration tests"
                      },
                      {
                        step: 5,
                        title: "Update Base44 Settings",
                        desc: "Configure provider settings in Base44 to point to your API",
                        action: "Go to Provider Settings"
                      }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
                          <span className="text-black font-bold">{item.step}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                          <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {item.action}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Options */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">🌐 Deployment Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "Vercel",
                        desc: "Serverless functions, auto-scaling, global CDN",
                        price: "Free tier available",
                        best: "Quick deploys"
                      },
                      {
                        name: "Railway",
                        desc: "Full-stack platform, PostgreSQL included, Redis add-on",
                        price: "$5+/mo",
                        best: "All-in-one"
                      },
                      {
                        name: "Render",
                        desc: "Managed services, auto-deploys from Git",
                        price: "Free tier available",
                        best: "Simplicity"
                      }
                    ].map((platform, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <h4 className="text-white font-bold mb-2">{platform.name}</h4>
                        <p className="text-gray-400 text-xs mb-3">{platform.desc}</p>
                        <div className="space-y-1 text-xs">
                          <div className="text-gray-500">
                            💰 {platform.price}
                          </div>
                          <div className="text-[#00D4C9]">
                            ✅ Best for: {platform.best}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security Checklist */}
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Security Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "🔐 Never commit .env to Git (add to .gitignore)",
                      "🔑 Encrypt API keys in database (use KMS or field-level encryption)",
                      "✅ Verify webhook signatures (Twilio, GHL, Stripe)",
                      "🛡️ Implement rate limiting on all endpoints",
                      "🔒 Use HTTPS only (no HTTP)",
                      "👤 Validate JWT tokens for authenticated routes",
                      "📝 Log security events to audit trail",
                      "⏰ Set token expiration and auto-refresh",
                      "🚨 Monitor for suspicious activity",
                      "🔄 Rotate secrets quarterly"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                        <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Production Readiness */}
              <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-bold mb-2">⚠️ Production Requirements</h3>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Database backups (automated daily)</li>
                        <li>• Error monitoring (Sentry, LogRocket)</li>
                        <li>• Uptime monitoring (Pingdom, UptimeRobot)</li>
                        <li>• Load testing (Artillery, k6)</li>
                        <li>• CI/CD pipeline (GitHub Actions, CircleCI)</li>
                        <li>• DDoS protection (Cloudflare)</li>
                        <li>• Queue monitoring (BullMQ Board)</li>
                        <li>• Log aggregation (Datadog, Logtail)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

        </Tabs>

        {/* Footer CTA */}
        <div className="flex gap-4">
          <Button
            onClick={() => window.location.href = createPageUrl("ProviderSettings")}
            className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
          >
            <Server className="w-4 h-4 mr-2" />
            Go to Provider Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = createPageUrl("SecurityDocs")}
            className="flex-1 border-gray-700 text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security Documentation
          </Button>
        </div>

      </div>
    </div>
  );
}
