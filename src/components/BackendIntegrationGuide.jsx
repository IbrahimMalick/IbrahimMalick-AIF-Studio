import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Code,
  Zap,
  Bell,
  BarChart3,
  Copy,
  CheckCircle2,
  Database,
  Network,
  Shield,
  Settings,
  MonitorCheck, // New icon for Grafana
  FileText, // New icon for queries
  Target, // New icon for Funnel Automation
  Brain, // New icon for Copilot Intents
  Sparkles, // New icon for AI Prompt Library
  Globe, // New icon for API Endpoints Quick Reference
  DollarSign // New icon for Pricing & Fee Integration
} from "lucide-react";

export default function BackendIntegrationGuide() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const codeBlocks = {
    queue: `// queue.js
import { Queue, QueueEvents, Worker } from "bullmq";
import IORedis from "ioreis";

const connection = new IORedis(process["env"].REDIS_URL || "redis://127.0.0.1:6379");

export const avatarQueue = new Queue("avatar", { connection });
export const leadMagnetQueue = new Queue("leadmagnet", { connection }); // NEW: Lead Magnet Queue
export const funnelQueue = new Queue("funnel", { connection }); // NEW: Funnel Queue
export const queueEvents = new QueueEvents("avatar", { connection }); // Use 'avatar' for general events if only one worker type listens

export function startWorkers({ onComplete }) {
  // AVATAR RENDER worker
  new Worker("avatar", async (job) => {
    if (job.name !== "render") return;
    
    // TODO: Replace with real render provider
    // await heygenAPI.createAvatar({ ... });
    // await elevenLabsAPI.generateVoice({ ... });
    // await ffmpeg.assembleVideo({ ... });
    // await s3.upload({ ... });
    
    return {
      video_url: \`\${process["env"].CDN_BASE}/\${job.id}.mp4\`,
      srt_url: \`\${process["env"].CDN_BASE}/\${job.id}.srt\`,
    };
  }, { connection });

  // AVATAR DUB worker
  new Worker("avatar", async (job) => {
    if (job.name !== "dub") return;
    // Multi-language dubbing logic
    return {
      outputs: job.data.target_languages.map(lang => ({
        lang,
        video_url: \`\${process["env"].CDN_BASE}/\${job.id}_\${lang}.mp4\`
      }))
    };
  }, { connection });

  // AVATAR BATCH worker
  new Worker("avatar", async (job) => {
    if (job.name !== "batch_item") return;
    // Single batch item processing
    return { 
      video_url: \`\${process["env"].CDN_BASE}/\${job.id}.mp4\` 
    };
  }, { connection });

  queueEvents.on("completed", async ({ jobId }) => {
    if (onComplete) onComplete(jobId);
  });
}`,

    retries: `// Render job with retries
const job = await avatarQueue.add(
  "render",
  { ...req.body, type: "RENDER" },
  {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 5,                           // Total tries
    backoff: { 
      type: "exponential",                 // exponential or fixed
      delay: 2000                          // 2s, 4s, 8s, 16s, 32s
    },
    timeout: 60_000                        // Kill if worker hung (60s)
  }
);

// Batch item (simpler retry)
await avatarQueue.add(
  "batch_item",
  { ...data, type: "BATCH_ITEM" },
  {
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: "fixed", delay: 3000 }  // Always 3s between retries
  }
);

// Dub job (moderate retry)
const dubJob = await avatarQueue.add(
  "dub",
  { ...req.body, type: "DUB" },
  {
    removeOnComplete: true,
    attempts: 4,
    backoff: { type: "exponential", delay: 3000 }
  }
);`,

    notifications: `// notify.js
import nodemailer from "nodemailer";

export async function slackNotify(text) {
  const url = process["env"].SLACK_WEBHOOK_URL;
  if (!url) return;
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).catch(() => {});
}

const transporter = process["env"].SMTP_HOST ? nodemailer.createTransport({
  host: process["env"].SMTP_HOST,
  port: Number(process["env"].SMTP_PORT || 587),
  secure: false,
  auth: { 
    user: process["env"].SMTP_USER, 
    pass: process["env"].SMTP_PASS 
  }
}) : null;

export async function emailNotify(subject, body, to = process["env"].NOTIFY_EMAIL) {
  if (!transporter || !to) return;
  
  await transporter.sendMail({
    from: "AFS Bot <bot@aifreedomstudios.com>",
    to, 
    subject, 
    text: body
  }).catch(() => {});
}

// queue.js - Hook into events
queueEvents.on("completed", async ({ jobId }) => {
  const job = await avatarQueue.getJob(jobId); // Assuming avatarQueue for events
  const type = job?.data?.type || "UNKNOWN";
  const output = job?.returnvalue || {};
  
  await slackNotify(
    \`🎬 Job *\${type}* completed — \${jobId}\\n\${output.video_url || ""}\`
  );
  
  await emailNotify(
    \`AFS \${type} COMPLETED\`,
    \`Job \${jobId} completed.\\n\${output.video_url || ""}\`
  );
});

queueEvents.on("failed", async ({ jobId, failedReason }) => {
  const job = await avatarQueue.getJob(jobId); // Assuming avatarQueue for events
  const type = job?.data?.type || "UNKNOWN";
  const attempts = job?.attemptsMade ?? 0;
  
  await slackNotify(
    \`❌ Job *\${type}* failed — \${jobId}\\nAttempts: \${attempts}\\nReason: \${failedReason}\`
  );
  
  await emailNotify(
    \`AFS \${type} FAILED\`,
    \`Job \${jobId} failed.\\nAttempts: \${attempts}\\nReason: \${failedReason}\`
  );
});`,

    metrics: `// server.js - Prometheus Metrics
import client from "prom-client";

// Collect default metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: "afs_", timeout: 5000 });

// Custom metrics
const jobsCreated = new client.Counter({ 
  name: "afs_jobs_created_total", 
  help: "Jobs created", 
  labelNames: ["type"] 
});

const jobsCompleted = new client.Counter({ 
  name: "afs_jobs_completed_total", 
  help: "Jobs completed", 
  labelNames: ["type"] 
});

const jobsFailed = new client.Counter({ 
  name: "afs_jobs_failed_total", 
  help: "Jobs failed", 
  labelNames: ["type"] 
});

const jobDuration = new client.Histogram({
  name: "afs_job_duration_seconds",
  help: "Job processing duration",
  labelNames: ["type"],
  buckets: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024] // Extended buckets for longer tasks
});

// Increment on job creation
app.post("/api/v1/avatar/render", auth, async (req, res) => {
  const job = await avatarQueue.add("render", req.body, { /* options */ });
  jobsCreated.labels("RENDER").inc();
  return res.status(202).json({ job_id: job.id });
});

app.post("/api/v1/leadmagnet/generate", auth, idempotency, async (req, res) => {
  const job = await leadMagnetQueue.add("generate", { ...req.body, type: "LM_GENERATE" });
  jobsCreated.labels("LM_GENERATE").inc();
  return res.status(202).json({ job_id: job.id });
});

// NEW: Funnel metrics
app.post("/api/v1/followup/generate", auth, idempotency, async (req, res) => {
  const job = await funnelQueue.add("generate_followup", { ...req.body, type: "FOLLOWUP_GENERATION" });
  jobsCreated.labels("FOLLOWUP_GENERATION").inc();
  return res.status(202).json({ sequence_id: \`seq_\${job.id}\` });
});

app.post("/api/v1/ads/generate", auth, idempotency, async (req, res) => {
  const job = await funnelQueue.add("generate_ads", { ...req.body, type: "AD_GENERATION" });
  jobsCreated.labels("AD_GENERATION").inc();
  return res.status(202).json({ ad_set_id: \`ads_\${job.id}\` });
});


// Observe in queue events
queueEvents.on("completed", async ({ jobId }) => {
  const job = await avatarQueue.getJob(jobId); // Check avatar queue
  const lmJob = !job ? await leadMagnetQueue.getJob(jobId) : null; // Then lead magnet queue
  const funnelJob = (!job && !lmJob) ? await funnelQueue.getJob(jobId) : null; // Then funnel queue
  const targetJob = job || lmJob || funnelJob;

  const type = targetJob?.data?.type || "UNKNOWN";
  
  jobsCompleted.labels(type).inc();
  
  if (targetJob?.processedOn && targetJob?.finishedOn) {
    const seconds = (targetJob.finishedOn - targetJob.processedOn) / 1000;
    jobDuration.labels(type).observe(seconds);
  }
});

queueEvents.on("failed", async ({ jobId }) => {
  const job = await avatarQueue.getJob(jobId); // Check avatar queue
  const lmJob = !job ? await leadMagnetQueue.getJob(jobId) : null; // Then lead magnet queue
  const funnelJob = (!job && !lmJob) ? await funnelQueue.getJob(jobId) : null; // Then funnel queue
  const targetJob = job || lmJob || funnelJob;
  
  const type = targetJob?.data?.type || "UNKNOWN";
  jobsFailed.labels(type).inc();
});

// Metrics endpoint
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});`,

    api: `// server.js - Complete API Implementation

import express from "express";
import { avatarQueue, leadMagnetQueue, funnelQueue, startWorkers } from "./queue.js"; // NEW: funnelQueue
import { auth, idempotency } from "./middleware.js";

const app = express();
app.use(express.json());

// Start workers once on boot
startWorkers({
  onComplete: async (jobId) => {
    // Optional: Update database, send webhooks, etc.
  }
});

// POST /api/v1/avatar/render
app.post("/api/v1/avatar/render", auth, idempotency, async (req, res) => {
  try {
    const { avatar_id, script, voice_profile_id, quality_mode, format } = req.body;
    
    // Validation
    if (!avatar_id || !script) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const job = await avatarQueue.add(
      "render",
      { ...req.body, type: "RENDER" },
      {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 5,
        backoff: { type: "exponential", delay: 2000 },
        timeout: 60_000
      }
    );

    const payload = { 
      job_id: job.id, 
      status: "QUEUED", 
      estimate_sec: quality_mode === "high_quality" ? 7 : 4 
    };
    
    if (res.saveIdem) res.saveIdem(payload);
    return res.status(202).json(payload);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// POST /api/v1/avatar/batch
app.post("/api/v1/avatar/batch", auth, idempotency, async (req, res) => {
  const { jobs = [] } = req.body || {};
  
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ error: "Provide jobs array" });
  }

  const jobRefs = await Promise.all(
    jobs.map(data => avatarQueue.add(
      "batch_item", 
      { ...data, type: "BATCH_ITEM" },
      { 
        removeOnComplete: true,
        attempts: 3,
        backoff: { type: "fixed", delay: 3000 }
      }
    ))
  );

  const batchId = "batch_" + jobRefs[0].id;
  const payload = { 
    batch_id: batchId, 
    job_ids: jobRefs.map(j => j.id), 
    status: "QUEUED" 
  };
  
  if (res.saveIdem) res.saveIdem(payload);
  return res.status(202).json(payload);
});

// POST /api/v1/avatar/dub
app.post("/api/v1/avatar/dub", auth, idempotency, async (req, res) => {
  try {
    const { video_id, target_languages } = req.body;
    
    if (!video_id || !Array.isArray(target_languages)) {
      return res.status(400).json({ error: "Missing video_id or target_languages" });
    }

    const job = await avatarQueue.add(
      "dub",
      { ...req.body, type: "DUB" },
      {
        removeOnComplete: true,
        attempts: 4,
        backoff: { type: "exponential", delay: 3000 }
      }
    );

    const payload = { 
      job_id: job.id, 
      status: "QUEUED", 
      targets: target_languages 
    };
    
    if (res.saveIdem) res.saveIdem(payload);
    return res.status(202).json(payload);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// GET /api/v1/jobs/:job_id
app.get("/api/v1/jobs/:job_id", auth, async (req, res) => {
  const jobId = req.params.job_id;
  const job = await avatarQueue.getJob(jobId);
  const lmJob = !job ? await leadMagnetQueue.getJob(jobId) : null;
  const funnelJob = (!job && !lmJob) ? await funnelQueue.getJob(jobId) : null; // NEW: check funnel queue
  const targetJob = job || lmJob || funnelJob; // Aggregate job

  if (!targetJob) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await targetJob.getState();
  const progress = typeof targetJob.progress === "number" ? targetJob.progress : 0;
  const output = targetJob.returnvalue || null;

  return res.json({
    job_id: targetJob.id,
    type: targetJob.data?.type || "UNKNOWN",
    status: mapState(state),
    progress,
    output,
    error: state === "failed" ? (targetJob.failedReason || "Error") : null,
    attempts_made: targetJob.attemptsMade || 0,
    max_attempts: targetJob.opts?.attempts || 1,
    created_at: new Date(targetJob.timestamp).toISOString(),
    started_at: targetJob.processedOn ? new Date(targetJob.processedOn).toISOString() : null,
    completed_at: targetJob.finishedOn ? new Date(targetJob.finishedOn).toISOString() : null
  });
});

// DELETE /api/v1/jobs/:job_id
app.delete("/api/v1/jobs/:job_id", auth, async (req, res) => {
  const jobId = req.params.job_id;
  const job = await avatarQueue.getJob(jobId);
  const lmJob = !job ? await leadMagnetQueue.getJob(jobId) : null;
  const funnelJob = (!job && !lmJob) ? await funnelQueue.getJob(jobId) : null; // NEW: check funnel queue
  const targetJob = job || lmJob || funnelJob; // Aggregate job
  
  if (!targetJob) {
    return res.status(404).json({ error: "Job not found" });
  }

  await targetJob.remove();
  return res.json({ success: true });
});

// POST /api/v1/jobs/:job_id/boost
app.post("/api/v1/jobs/:job_id/boost", auth, async (req, res) => {
  const jobId = req.params.job_id;
  const job = await avatarQueue.getJob(jobId);
  const lmJob = !job ? await leadMagnetQueue.getJob(jobId) : null;
  const funnelJob = (!job && !lmJob) ? await funnelQueue.getJob(jobId) : null; // NEW: check funnel queue
  const targetJob = job || lmJob || funnelJob;
  
  if (!targetJob) {
    return res.status(404).json({ error: "Job not found" });
  }

  // Promote to higher priority
  await targetJob.changePriority({ priority: 1 }); // Lower number = higher priority
  
  return res.json({ success: true, boosted: true });
});

// GET /api/v1/queue/status
app.get("/api/v1/queue/status", auth, async (req, res) => {
  const [
    avatarWaiting, avatarActive, avatarCompleted, avatarFailed, 
    lmWaiting, lmActive, lmCompleted, lmFailed,
    funnelWaiting, funnelActive, funnelCompleted, funnelFailed // NEW: Funnel counts
  ] = await Promise.all([
    avatarQueue.getWaitingCount(),
    avatarQueue.getActiveCount(),
    avatarQueue.getCompletedCount(),
    avatarQueue.getFailedCount(),
    leadMagnetQueue.getWaitingCount(),
    leadMagnetQueue.getActiveCount(),
    leadMagnetQueue.getCompletedCount(),
    leadMagnetQueue.getFailedCount(),
    funnelQueue.getWaitingCount(), // NEW
    funnelQueue.getActiveCount(),   // NEW
    funnelQueue.getCompletedCount(),// NEW
    funnelQueue.getFailedCount()    // NEW
  ]);

  return res.json({
    workers: 3, // Or get from worker pool
    waiting: avatarWaiting + lmWaiting + funnelWaiting,
    active: avatarActive + lmActive + funnelActive,
    completed: avatarCompleted + lmCompleted + funnelCompleted,
    failed: avatarFailed + lmFailed + funnelFailed,
    avg_wait_time: (avatarWaiting + lmWaiting + funnelWaiting) * 45 // Estimate
  });
});

function mapState(state) {
  const map = {
    waiting: "QUEUED",
    active: "PROCESSING",
    completed: "COMPLETED",
    failed: "FAILED",
    delayed: "DELAYED"
  };
  return map[state] || state.toUpperCase();
}`,

    leadMagnetAPI: `// Lead Magnet API Endpoints

// 1) POST /api/v1/leadmagnet/generate
app.post("/api/v1/leadmagnet/generate", auth, idempotency, async (req, res) => {
  const {
    title_hint,
    primary_goal,
    audience,
    topics,
    length_pages,
    tone,
    language,
    brand,
    personalization,
    include_assets,
    callback_url
  } = req.body;

  const job = await leadMagnetQueue.add("generate", {
    type: "LM_GENERATE", // Type for metrics and monitoring
    title_hint,
    primary_goal,
    audience,
    topics,
    length_pages,
    tone,
    language,
    brand,
    personalization,
    include_assets,
    callback_url,
    user_email: req.user.email
  }, {
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 }
  });

  return res.status(202).json({
    job_id: job.id,
    status: "QUEUED",
    estimate_sec: 20
  });
});

// 2) POST /api/v1/leadmagnet/export
app.post("/api/v1/leadmagnet/export", auth, idempotency, async (req, res) => {
  const { leadmagnet_id, format, paper, include_toc, watermark } = req.body;

  const job = await leadMagnetQueue.add("export", {
    type: "LM_EXPORT", // Type for metrics and monitoring
    leadmagnet_id,
    format,
    paper,
    include_toc,
    watermark
  }, {
    removeOnComplete: true,
    attempts: 2
  });

  return res.status(202).json({
    job_id: job.id,
    status: "QUEUED"
  });
});

// 3) POST /api/v1/leadmagnet/deploy
app.post("/api/v1/leadmagnet/deploy", auth, async (req, res) => {
  const { leadmagnet_id, destinations, callback_url } = req.body;

  // Deploy synchronously or as job
  const results = {
    leadmagnet_id,
    landing_url: null,
    email_sequence_id: null,
    ghl_assets: null
  };

  if (destinations.landing_page?.enabled) {
    const { domain, path, utm } = destinations.landing_page;
    results.landing_url = \`https://\${domain}\${path}?utm_source=\${utm.source}&utm_campaign=\${utm.campaign}\`;
    // TODO: Create landing page in your system
  }

  if (destinations.email?.enabled) {
    const { provider, list_id, sequence_template } = destinations.email;
    // TODO: Integrate with AWeber/Mailchimp API
    results.email_sequence_id = \`\${provider}_seq_\${Date.now()}\`;
  }

  if (destinations.ghl?.enabled) {
    const { snapshot_id, pipeline_id, tag } = destinations.ghl;
    // TODO: Deploy to GoHighLevel
    results.ghl_assets = { funnel_id: \`ghl_fun_\${Date.now()}\` };
  }

  return res.json(results);
});

// 4) GET /api/v1/jobs/:job_id (reuse existing)
// Already implemented in main API section`,

    leadMagnetWorker: `// Lead Magnet Worker (queue.js)

new Worker("leadmagnet", async (job) => {
  if (job.name === "generate") {
    const {
      title_hint,
      audience,
      topics,
      length_pages,
      tone,
      language,
      brand,
      personalization,
      include_assets
    } = job.data;

    // --- Mock external APIs for demonstration ---
    const openai = {
      chat: {
        completions: {
          create: async ({ model, messages, response_format }) => {
            console.log(\`[OpenAI] Generating content for \${title_hint}...\`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate API call
            const mockContent = {
              markdown: "# " + title_hint + "\\n\\n## Introduction\\nThis is a generated lead magnet for " + audience + ".\\n\\n## Key Topics\\n" + topics.map(t => \`- \${t}\`).join("\\n") + "\\n\\n## Call to Action\\nDownload now!",
              sections: topics.map((t, i) => ({ title: t, content: \`Content for \${t}\` }))
            };
            return {
              choices: [{
                message: {
                  content: JSON.stringify(mockContent)
                }
              }]
            };
          }
        }
      },
      images: {
        generate: async ({ model, prompt, size, quality }) => {
          console(\`[DALL-E] Generating image for \${prompt}...\`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
          return { data: [{ url: \`https://picsum.photos/seed/\${Math.random()}/1024/1792\` }] };
        }
      }
    };

    const s3 = {
      upload: async (key, buffer) => {
        console(\`[S3] Uploading \${key}...\`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate S3 upload
        return \`\${process["env"].CDN_BASE}/\${key}\`;
      },
      download: async (key) => {
        console(\`[S3] Downloading \${key}...\`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate S3 download
        return \`# Downloaded Content\\nThis is the mock content for \${key}.\`;
      }
    };

    const generatePreviewPNG = async (markdown, brand) => {
      console(\`[Puppeteer] Generating preview PNG...\`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate PDF/image generation
      return \`\${process["env"].CDN_BASE}/lm_preview_\${Date.now()}.png\`;
    };

    const markdownToPDF = async (markdown, options) => {
      console(\`[PDF Gen] Converting markdown to PDF...\`);
      await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate PDF generation
      return Buffer.from("mock PDF content"); // Return a mock buffer
    };

    const generateThumbnail = async (pdfBuffer) => {
      console(\`[PDF Gen] Generating PDF thumbnail...\`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thumbnail generation
      return \`\${process["env"].CDN_BASE}/lm_thumb_\${Date.now()}.png\`;
    };

    const countPages = (pdfBuffer) => {
      return Math.floor(Math.random() * 10) + 3; // Mock page count
    };

    const crypto = {
      createHash: (algo) => ({
        update: (data) => ({
          digest: (format) => \`mock-\${algo}-\${Date.now()}\`
        })
      })
    };
    // --- End mock external APIs ---

    // Step 1: Generate content with GPT-4
    const content = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{
        role: "system",
        content: \`You are an expert copywriter creating high-converting lead magnets.
Tone: \${tone}
Audience: \${audience}
Language: \${language}\`
      }, {
        role: "user",
        content: \`Create a \${length_pages}-page lead magnet: "\${title_hint}"
Topics: \${topics.join(", ")}
Include: compelling hooks, actionable steps, strategic CTAs, social proof placeholders.
Format as detailed markdown with sections.\`
      }],
      response_format: { type: "json_object" }
    });

    const structure = JSON.parse(content.choices[0].message.content);

    // Step 2: Generate cover & section images (if include_assets)
    const images = [];
    if (include_assets) {
      const coverPrompt = \`Professional ebook cover for "\${title_hint}", \${audience}, \${brand.primary_color} color scheme\`;
      const coverImg = await openai.images.generate({
        model: "dall-e-3",
        prompt: coverPrompt,
        size: "1024x1792",
        quality: "hd"
      });
      images.push({ slot: "cover_bg", url: coverImg.data[0].url });
    }

    // Step 3: Save to S3
    const leadmagnetId = \`lm_\${Date.now()}\`;
    const contentMdUrl = await s3.upload(\`\${leadmagnetId}/content.md\`, structure.markdown);

    // Step 4: Generate preview PNG (use Puppeteer or similar)
    const previewPng = await generatePreviewPNG(structure.markdown, brand);

    return {
      leadmagnet_id: leadmagnetId,
      structure: {
        type: "ebook",
        pages: length_pages,
        sections: structure.sections
      },
      content_md_url: contentMdUrl,
      images,
      preview_png: previewPng
    };
  }

  if (job.name === "export") {
    const { leadmagnet_id, format, paper } = job.data;

    // --- Mock external APIs for demonstration ---
    const s3 = {
      upload: async (key, buffer) => {
        console(\`[S3] Uploading \${key}...\`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate S3 upload
        return \`\${process["env"].CDN_BASE}/\${key}\`;
      },
      download: async (key) => {
        console(\`[S3] Downloading \${key}...\`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate S3 download
        return \`# Downloaded Content\\nThis is the mock content for \${key}.\`;
      }
    };
    const markdownToPDF = async (markdown, options) => {
      console(\`[PDF Gen] Converting markdown to PDF...\`);
      await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate PDF generation
      return Buffer.from("mock PDF content"); // Return a mock buffer
    };

    const generateThumbnail = async (pdfBuffer) => {
      console(\`[PDF Gen] Generating PDF thumbnail...\`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thumbnail generation
      return \`\${process["env"].CDN_BASE}/lm_thumb_\${Date.now()}.png\`;
    };

    const countPages = (pdfBuffer) => {
      return Math.floor(Math.random() * 10) + 3; // Mock page count
    };

    const crypto = {
      createHash: (algo) => ({
        update: (data) => ({
          digest: (format) => \`mock-\${algo}-\${Date.now()}\`
        })
      })
    };
    // --- End mock external APIs ---

    // Fetch content from S3
    const contentMd = await s3.download(\`\${leadmagnet_id}/content.md\`);

    // Convert MD → PDF using Puppeteer + html-pdf
    const pdfBuffer = await markdownToPDF(contentMd, {
      format: paper.size,
      orientation: paper.orientation,
      margin: paper.margins_mm
    });

    // Upload to S3
    const pdfUrl = await s3.upload(\`\${leadmagnet_id}/export.pdf\`, pdfBuffer);
    const thumbUrl = await generateThumbnail(pdfBuffer);

    return {
      pdf_url: pdfUrl,
      thumb_url: thumbUrl,
      page_count: countPages(pdfBuffer),
      checksum: \`sha256:\${crypto.createHash('sha256').update(pdfBuffer).digest('hex')}\`
    };
  }
}, { connection });`,

    leadMagnetDataModels: `// Data Models (PostgreSQL / MongoDB)

// LeadMagnet
{
  id: string,                          // lm_42
  title: string,                       // "The Discipline Method"
  type: "ebook" | "guide" | "checklist" | "template" | "course",
  language: string,                    // "en"
  pages: number,                       // 8
  status: "generating" | "completed" | "failed" | "published",
  content_md_url: string,              // S3 URL to content.md
  preview_png: string,                 // Preview image URL
  brand: {
    logo_url?: string,
    primary_color: string,
    accent_color: string,
    font_heading: string,
    font_body: string
  },
  personalization: {
    fields: string[],                  // ["first_name", "industry"]
    dynamic_cta_url?: string
  },
  viral_score?: number,                // 0-100
  engagement_score?: number,           // 0-100
  created_by: string,                  // user email
  created_at: timestamp
}

// LeadMagnetExport
{
  id: string,                          // lmexp_f91b
  leadmagnet_id: string,               // lm_42
  format: "pdf" | "epub" | "html",
  pdf_url: string,
  thumb_url?: string,
  page_count: number,
  file_size_bytes: number,
  checksum: string,                    // "sha256:abc123..."
  created_at: timestamp
}

// LeadMagnetDeploy
{
  id: string,                          // lmdep_x12
  leadmagnet_id: string,               // lm_42
  landing_url?: string,                // https://leads.example.com/path
  email_sequence_id?: string,          // aw_seq_9901
  ghl_assets?: {
    funnel_id?: string,
    workflow_id?: string,
    form_id?: string
  },
  utm_params?: object,
  deployed_at: timestamp
}

// LeadMagnetDownload (analytics)
{
  id: string,
  leadmagnet_id: string,
  lead_email: string,
  lead_name?: string,
  lead_company?: string,
  personalized_fields?: object,       // Actual values used for personalization
  utm_source?: string,
  utm_campaign?: string,
  variant_id?: string,                // A/B test variant
  converted_to_customer: boolean,
  conversion_value_usd?: number,
  downloaded_at: timestamp
}`,

    websocket: `// websocket.js - Real-time Updates
import { Server } from "socket.io";
import { queueEvents } from "./queue.js";

export function setupWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process["env"].FRONTEND_URL }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send initial queue status
    socket.emit("queue-status", {
      /* ... current queue stats ... */
    });
  });

  // Broadcast progress updates
  queueEvents.on("progress", ({ jobId, data }) => {
    io.emit("job-progress", {
      job_id: jobId,
      progress: data.progress || 0,
      stage: data.stage || "Processing"
    });
  });

  // Broadcast completion
  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    io.emit("job-completed", {
      job_id: jobId,
      output: returnvalue
    });
  });

  // Broadcast failures
  queueEvents.on("failed", ({ jobId, failedReason }) => {
    io.emit("job-failed", {
      job_id: jobId,
      error: failedReason
    });
  });

  // Queue position changes
  queueEvents.on("waiting", ({ jobId }) => {
    io.emit("queue-updated", {
      /* ... refresh queue display ... */
    });
  });

  return io;
}

// Frontend connection (React)
// import { io } from "socket.io-client";
// 
// const socket = io("ws://backend.example.com");
// 
// socket.on("job-progress", (data) => {
//   setProgress(data.progress);
//   setCurrentStage(data.stage);
// });
// 
// socket.on("job-completed", (data) => {
//   setRenderedVideo(data.output);
//   playSuccessChime();
// });`,

    env: `# .env - Backend Configuration

# Redis
REDIS_URL=redis://localhost:6379

# CDN Storage
CDN_BASE=https://cdn.aifreedomstudios.com
AWS_ACCESS_KEY_ID=*********************
AWS_SECRET_ACCESS_KEY=*********************
AWS_S3_BUCKET=afs-avatar-renders
AWS_REGION=us-east-1

# Render Providers
HEYGEN_API_KEY=*********************
ELEVENLABS_API_KEY=*********************
PLAYHT_API_KEY=*********************

# AI/Lead Magnet Providers
OPENAI_API_KEY=*********************

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=*********************
NOTIFY_EMAIL=ops@aifreedomstudios.com

# Security
JWT_SECRET=*********************
IDEMPOTENCY_TTL=3600

# Monitoring
PROMETHEUS_PORT=9090

# Frontend
FRONTEND_URL=https://app.aifreedomstudios.com`,

    prometheusConfig: `# prometheus.yml - Prometheus Configuration

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'afs-production'
    env: 'prod'

# Alert rule files
rule_files:
  - 'rules/afs-avatar.yaml'

# Scrape configs
scrape_configs:
  - job_name: 'afs-avatar-api'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 15s
    scrape_timeout: 10s

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']`,

    alertRules: `# rules/afs-avatar.yaml - Prometheus Alert Rules

groups:
- name: afs-avatar-health
  interval: 30s
  rules:
  # --- Failure rate by job type (5m window) ---
  - alert: AFSJobFailureRateHigh
    expr: |
      100 *
      (sum by (type)(rate(afs_jobs_failed_total[5m])))
      /
      clamp_min(sum by (type)(rate(afs_jobs_created_total[5m])), 1e-9)
      > 5
    for: 5m
    labels:
      severity: warning
      team: afs
    annotations:
      summary: "AFS {{ $labels.type }} failure rate high ({{ $value | printf "%.1f" }}%)"
      description: "Failure% over last 5m exceeded 5%. Investigate workers, provider APIs, or quotas."

  - alert: AFSJobFailureRateSevere
    expr: |
      100 *
      (sum by (type)(rate(afs_jobs_failed_total[5m])))
      /
      clamp_min(sum by (type)(rate(afs_jobs_created_total[5m])), 1e-9)
      > 10
    for: 3m
    labels:
      severity: critical
      team: afs
    annotations:
      summary: "AFS {{ $labels.type }} failure rate SEVERE ({{ $value | printf "%.1f" }}%)"
      description: "Sustained errors >10% over 5m. Check HeyGen/ElevenLabs API status."

  # --- Duration SLO (p95) by job type ---
  - alert: AFSJobDurationP95High
    expr: |
      histogram_quantile(
        0.95,
        sum by (le, type)(rate(afs_job_duration_seconds_bucket[5m]))
      ) > 600
    for: 10m
    labels:
      severity: warning
      team: afs
      type: "{{ $labels.type }}"
    annotations:
      summary: "AFS {{ $labels.type }} p95 duration high ({{ $value | printf "%.1f" }}s)"
      description: "95th percentile render time exceeded 10 minutes. Investigate worker performance."

  - alert: AFSJobDurationP95Severe
    expr: |
      histogram_quantile(
        0.95,
        sum by (le, type)(rate(afs_job_duration_seconds_bucket[5m]))
      ) > 1200
    for: 5m
    labels:
      severity: critical
      team: afs
    annotations:
      summary: "AFS {{ $labels.type }} p95 duration SEVERE ({{ $value | printf "%.1f" }}s)"
      description: "Render times exceeding 20 minutes. Scale workers or check provider APIs."

  # --- Queue backlog ---
  - alert: AFSQueueBacklogHigh
    expr: |
      sum(afs_queue_waiting_total) > 50
    for: 10m
    labels:
      severity: warning
      team: afs
    annotations:
      summary: "AFS queue backlog high ({{ $value }} jobs waiting)"
      description: "More than 50 jobs waiting for 10+ minutes. Consider scaling workers."

  - alert: AFSQueueBacklogSevere
    expr: |
      sum(afs_queue_waiting_total) > 100
    for: 5m
    labels:
      severity: critical
      team: afs
    annotations:
      summary: "AFS queue backlog SEVERE ({{ $value }} jobs waiting)"
      description: "Queue severely backed up. Auto-scale workers immediately."

  # --- Worker availability ---
  - alert: AFSNoActiveWorkers
    expr: |
      sum(afs_queue_active_total) == 0
      and
      sum(afs_queue_waiting_total) > 0
    for: 2m
    labels:
      severity: critical
      team: afs
    annotations:
      summary: "No active workers processing queue"
      description: "Workers are down but queue has jobs. Restart workers immediately."

  - alert: AFSWorkerUtilizationLow
    expr: |
      (sum(afs_queue_active_total) / 3) < 0.3
      and
      sum(afs_queue_waiting_total) > 10
    for: 15m
    labels:
      severity: info
      team: afs
    annotations:
      summary: "Worker utilization low despite backlog"
      description: "Only {{ $value | printf "%.0f" }}% workers active with queue backlog. Check worker health."

  # --- High retry rate ---
  - alert: AFSHighRetryRate
    expr: |
      sum by (type)(rate(afs_jobs_retry_total[10m]))
      /
      clamp_min(sum by (type)(rate(afs_jobs_created_total[10m])), 1e-9)
      > 0.3
    for: 10m
    labels:
      severity: warning
      team: afs
    annotations:
      summary: "AFS {{ $labels.type }} high retry rate ({{ $value | printf "%.1f" }}%)"
      description: "More than 30% of jobs requiring retries. Check provider reliability."

  # --- API latency ---
  - alert: AFSAPILatencyHigh
    expr: |
      histogram_quantile(0.95, 
        rate(http_request_duration_seconds_bucket{job="afs-avatar-api"}[5m])
      ) > 5
    for: 5m
    labels:
      severity: warning
      team: afs
    annotations:
      summary: "AFS API p95 latency high ({{ $value | printf "%.2f" }}s)"
      description: "API response times degraded. Check database connections and rate limits."

  # --- Memory usage ---
  - alert: AFSHighMemoryUsage
    expr: |
      (process_resident_memory_bytes{job="afs-avatar-api"} / 1024 / 1024) > 2048
    for: 5m
    labels:
      severity: warning
      team: afs
    annotations:
      summary: "AFS API high memory usage ({{ $value | printf "%.0f" }} MB)"
      description: "Memory usage above 2GB. Check for memory leaks or increase container limits."

  # --- Redis connection ---
  - alert: AFSRedisConnectionFailed
    expr: |
      redis_up{job="redis-exporter"} == 0
    for: 1m
    labels:
      severity: critical
      team: afs
    annotations:
      summary: "AFS Redis connection failed"
      description: "Cannot connect to Redis. Queue system down. Check Redis container/service."

  # --- Overall success rate ---
  - alert: AFSOverallSuccessRateLow
    expr: |
      100 * (
        sum(rate(afs_jobs_completed_total[1h]))
        /
        clamp_min(sum(rate(afs_jobs_created_total[1h])), 1e-9)
      ) < 90
    for: 15m
    labels:
      severity: critical
      team: afs
    annotations:
      summary: "AFS overall success rate below 90% ({{ $value | printf "%.1f" }}%)"
      description: "System-wide success rate dropped. Major provider issue or infrastructure problem."`,

    alertmanagerConfig: `# alertmanager.yml - Alertmanager Configuration

global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

# Routes define where alerts go
route:
  receiver: 'afs-team'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    # Critical alerts -> Slack + PagerDuty
    - match:
        severity: critical
      receiver: 'afs-critical'
      repeat_interval: 1h

    # Warnings -> Slack only
    - match:
        severity: warning
      receiver: 'afs-team'
      repeat_interval: 4h

# Receivers define how to send alerts
receivers:
  - name: 'afs-team'
    slack_configs:
      - channel: '#afs-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

  - name: 'afs-critical'
    slack_configs:
      - channel: '#afs-critical'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true
    
    # Optional: PagerDuty integration
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
        description: '{{ .GroupLabels.alertname }}: {{ .GroupLabels.type }}'

# Inhibit rules (suppress lower severity if higher exists)
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'type']`,

    dockerfile: `# Dockerfile - Production Deployment

FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install FFmpeg for video processing (for Avatar workers)
RUN apk add --no-cache ffmpeg

# Install Chromium for Puppeteer (for Lead Magnet workers)
RUN apk add --no-cache chromium

# Copy application
COPY . .

# Expose ports
EXPOSE 3000 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js || exit 1

# Start server
CMD ["node", "server.js"]`,

    dockerCompose: `# docker-compose.yml

version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  avatar-api:
    build: .
    ports:
      - "3000:3000"
      - "9090:9090"
    depends_on:
      redis:
        condition: service_healthy
    environment:
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9091:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./rules:/etc/prometheus/rules
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  redis_data:
  prometheus_data:
  alertmanager_data:
  grafana_data:`,

    grafana: `{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "liveNow": false,
  "panels": [
    {
      "type": "row",
      "title": "Rates",
      "gridPos": { "h": 1, "w": 24, "x": 0, "y": 0 },
      "collapsed": false,
      "id": 1
    },
    {
      "type": "timeseries",
      "title": "Jobs Created Rate by Type",
      "id": 2,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": { "defaults": { "unit": "ops" }, "overrides": [] },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 1 },
      "options": { "legend": { "displayMode": "table", "placement": "right" } },
      "targets": [
        {
          "expr": "sum by (type)(rate(afs_jobs_created_total[$__rate_interval]))",
          "legendFormat": "{{type}}",
          "refId": "A"
        }
      ]
    },
    {
      "type": "timeseries",
      "title": "Jobs Completed Rate by Type",
      "id": 3,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": { "defaults": { "unit": "ops" } },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 1 },
      "options": { "legend": { "displayMode": "table", "placement": "right" } },
      "targets": [
        {
          "expr": "sum by (type)(rate(afs_jobs_completed_total[$__rate_interval]))",
          "legendFormat": "{{type}}",
          "refId": "A"
        }
      ]
    },
    {
      "type": "timeseries",
      "title": "Jobs Failed Rate by Type",
      "id": 4,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": { "defaults": { "unit": "ops" } },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 9 },
      "options": { "legend": { "displayMode": "table", "placement": "right" } },
      "targets": [
        {
          "expr": "sum by (type)(rate(afs_jobs_failed_total[$__rate_interval]))",
          "legendFormat": "{{type}}",
          "refId": "A"
        }
      ]
    },
    {
      "type": "timeseries",
      "title": "Error Rate % (Failed / Created) by Type",
      "id": 5,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": {
        "defaults": {
          "unit": "percent",
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "orange", "value": 5 },
              { "color": "red", "value": 10 }
            ]
          }
        }
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 9 },
      "options": { "legend": { "displayMode": "table", "placement": "right" } },
      "targets": [
        {
          "expr": "100 * (sum by (type)(rate(afs_jobs_created_total[$__rate_interval])) / clamp_min(sum by (type)(rate(afs_jobs_failed_total[$__rate_interval])), 1e-9))",
          "legendFormat": "{{type}}",
          "refId": "A"
        }
      ]
    },
    {
      "type": "row",
      "title": "Durations",
      "gridPos": { "h": 1, "w": 24, "x": 0, "y": 17 },
      "collapsed": false,
      "id": 6
    },
    {
      "type": "timeseries",
      "title": "Job Duration — p50 / p95 / p99 (s) by Type",
      "id": 7,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": { "defaults": { "unit": "s" } },
      "gridPos": { "h": 8, "w": 24, "x": 0, "y": 18 },
      "options": { "legend": { "displayMode": "table", "placement": "right" } },
      "targets": [
        {
          "expr": "histogram_quantile(0.5,  sum by (le, type)(rate(afs_job_duration_seconds_bucket[$__rate_interval])))",
          "legendFormat": "p50 — {{type}}",
          "refId": "A"
        },
        {
          "expr": "histogram_quantile(0.95, sum by (le, type)(rate(afs_job_duration_seconds_bucket[$__rate_interval])))",
          "legendFormat": "p95 — {{type}}",
          "refId": "B"
        },
        {
          "expr": "histogram_quantile(0.99, sum by (le, type)(rate(afs_job_duration_seconds_bucket[$__rate_interval])))",
          "legendFormat": "p99 — {{type}}",
          "refId": "C"
        }
      ]
    },
    {
      "type": "heatmap",
      "title": "Duration Heatmap (seconds) — by Type = $job_type",
      "id": 8,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "gridPos": { "h": 10, "w": 24, "x": 0, "y": 26 },
      "options": {
        "legend": { "show": true },
        "heatmap": {},
        "yAxis": { "format": "s" },
        "tooltip": { "show": true }
      },
      "targets": [
        {
          "expr": "sum by (le) (rate(afs_job_duration_seconds_bucket{type=\\"$job_type\\"}[$__rate_interval]))",
          "legendFormat": "{{le}}",
          "refId": "A"
        }
      ]
    },
    {
      "type": "gauge",
      "title": "Overall Success Rate %",
      "id": 9,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": {
        "defaults": {
          "min": 0,
          "max": 100,
          "unit": "percent",
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "red", "value": null },
              { "color": "yellow", "value": 90 },
              { "color": "green", "value": 97 }
            ]
          }
        }
      },
      "gridPos": { "h": 6, "w": 8, "x": 0, "y": 36 },
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] }, "showThresholdMarkers": true },
      "targets": [
        {
          "expr": "100 * (sum(rate(afs_jobs_completed_total[$__rate_interval])) / clamp_min(sum(rate(afs_jobs_created_total[$__rate_interval])), 1e-9))",
          "legendFormat": "success %",
          "refId": "A"
        }
      ]
    },
    {
      "type": "stat",
      "title": "Current Running (approx)",
      "id": 10,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": { "defaults": { "unit": "none" } },
      "gridPos": { "h": 6, "w": 8, "x": 8, "y": 36 },
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] } },
      "targets": [
        {
          "expr": "sum(rate(afs_jobs_created_total[$__rate_interval])) - sum(rate(afs_jobs_completed_total[$__rate_interval])) - sum(rate(afs_jobs_failed_total[$__rate_interval]))",
          "legendFormat": "approx in-flight",
          "refId": "A"
        }
      ]
    },
    {
      "type": "stat",
      "title": "Failure Rate % (Overall)",
      "id": 11,
      "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
      "fieldConfig": {
        "defaults": { "unit": "percent", "thresholds": { "mode": "absolute", "steps": [ { "color": "green", "value": null }, { "color": "orange", "value": 5 }, { "color": "red", "value": 10 } ] } }
      },
      "gridPos": { "h": 6, "w": 8, "x": 16, "y": 36 },
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] } },
      "targets": [
        {
          "expr": "100 * (sum(rate(afs_jobs_failed_total[$__rate_interval])) / clamp_min(sum(rate(afs_jobs_created_total[$__rate_interval])), 1e-9))",
          "legendFormat": "fail %",
          "refId": "A"
        }
      ]
    }
  ],
  "refresh": "10s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": ["AFS", "Avatar", "BullMQ", "Prometheus"],
  "templating": {
    "list": [
      {
        "name": "DS_PROM",
        "type": "datasource",
        "query": "prometheus",
        "current": { "selected": true, "text": "Prometheus", "value": "Prometheus" },
        "label": "Datasource"
      },
      {
        "name": "job_type",
        "type": "query",
        "label": "Job Type",
        "datasource": { "type": "prometheus", "uid": "\${DS_PROM}" },
        "query": "label_values(afs_jobs_created_total, type)",
        "sort": 1,
        "refresh": 1,
        "current": { "selected": true, "text": "RENDER", "value": "RENDER" }
      }
    ]
  },
  "time": { "from": "now-6h", "to": "now" },
  "timepicker": { "refresh_intervals": ["5s","10s","30s","1m","5m"] },
  "timezone": "",
  "title": "AFS Avatar Pipeline — Ops Dashboard",
  "uid": "afs-avatar-ops",
  "version": 1,
  "weekStart": ""
}`,
    grafanaQueries: `## Grafana Dashboard Queries (PromQL)

### Success Rate (Last 24h)
rate(afs_jobs_completed_total[1h]) / 
(rate(afs_jobs_completed_total[1h]) + rate(afs_jobs_failed_total[1h]))

### P95 Render Duration
histogram_quantile(0.95, 
  rate(afs_job_duration_seconds_bucket{type="RENDER"}[5m])
)

### Jobs Per Minute
sum(rate(afs_jobs_created_total[1m])) by (type)

### Error Rate %
100 * (sum by (type)(rate(afs_jobs_failed_total[5m])) / 
       clamp_min(sum by (type)(rate(afs_jobs_created_total[5m])), 1e-9))

### Worker Utilization
afs_queue_active_total / afs_workers_total * 100

### Queue Depth
afs_queue_waiting_total`,

    funnelAPIs: `// Funnel Automation APIs

// 1) POST /api/v1/followup/generate
app.post("/api/v1/followup/generate", auth, idempotency, async (req, res) => {
  const { offer_id, voice, objections, days } = req.body;

  const job = await funnelQueue.add("generate_followup", {
    type: "FOLLOWUP_GENERATION",
    offer_id,
    brand_voice: voice || "mentor",
    objections: objections || [],
    timeframe_days: days || 14,
    user_email: req.user.email
  }, {
    removeOnComplete: true,
    attempts: 2,
    backoff: { type: "fixed", delay: 3000 }
  });

  return res.status(202).json({
    sequence_id: \`seq_\${job.id}\`,
    status: "QUEUED",
    estimate_sec: 15
  });
});

// 2) POST /api/v1/ads/generate
app.post("/api/v1/ads/generate", auth, idempotency, async (req, res) => {
  const { offer_id, metric } = req.body;

  const job = await funnelQueue.add("generate_ads", {
    type: "AD_GENERATION",
    offer_id,
    metric: metric || "CPL",
    user_email: req.user.email
  }, {
    removeOnComplete: true,
    attempts: 2
  });

  return res.status(202).json({
    ad_set_id: \`ads_\${job.id}\`,
    status: "QUEUED",
    estimate_sec: 20
  });
});

// 3) POST /api/v1/funnel/deploy
app.post("/api/v1/funnel/deploy", auth, async (req, res) => {
  const { offer_id, platforms, budget, domain, path } = req.body;

  // Validation
  if (!offer_id || !platforms || !budget) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Create funnel run
  const funnelRunId = \`fr_\${Date.now()}\`;
  const landingUrl = \`https://\${domain || 'leads.aifreedomstudios.com'}\${path || '/offer'}\`;

  // Deploy components in parallel
  const [adIds, sequenceIds, ghlAssets] = await Promise.all([
    deployToPlatforms(platforms, offer_id, budget),
    deployEmailSequences(offer_id),
    deployToGHL(offer_id, funnelRunId)
  ]);

  return res.json({
    funnel_run_id: funnelRunId,
    landing_url: landingUrl,
    ad_ids: adIds,
    sequence_ids: sequenceIds,
    ghl_ids: ghlAssets
  });
});

// 4) POST /api/v1/analytics/nba
app.post("/api/v1/analytics/nba", auth, async (req, res) => {
  const { funnel_run_id } = req.body;

  // Fetch funnel metrics
  // Assume 'db' and 'openai' are available globally or imported
  const funnel = await db.funnelRuns.findOne({ id: funnel_run_id }); 
  
  if (!funnel) {
    return res.status(404).json({ error: "Funnel not found" });
  }

  // Call AI for analysis
  const analysis = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{
      role: "system",
      content: "You are a funnel optimizer. Analyze metrics and provide prioritized recommendations."
    }, {
      role: "user",
      content: \`Funnel Metrics:
- Ad CTR: \${funnel.metrics.ad_ctr}%
- LP CVR: \${funnel.metrics.lp_cvr}%
- Opt-in to Booking: \${funnel.metrics.opt_in_to_booking}%
- Show Rate: \${funnel.metrics.show_rate}%
- Close Rate: \${funnel.metrics.close_rate}%
- Spend: $\${funnel.metrics.spend}
- Revenue: $\${funnel.metrics.revenue}

Provide top 5 recommendations with: issue, hypothesis, expected_gain, effort, actionable_step.\`
    }],
    response_format: { type: "json_object" }
  });

  const recommendations = JSON.parse(analysis.choices[0].message.content).recommendations;

  return res.json({ recommendations });
});

// Helper functions
async function deployToPlatforms(platforms, offerId, budget) {
  const adIds = [];
  
  for (const platform of platforms) {
    if (platform === 'meta') {
      // Create Meta campaign
      // Assume 'metaAPI' is available globally or imported
      const campaign = await metaAPI.campaigns.create({
        name: \`Offer \${offerId}\`,
        objective: 'OUTCOME_LEADS',
        status: 'ACTIVE'
      });
      adIds.push(\`meta:\${campaign.id}\`);
    }
    
    if (platform === 'tiktok') {
      // Create TikTok campaign
      // Assume 'tiktokAPI' is available globally or imported
      const campaign = await tiktokAPI.campaign.create({
        advertiser_id: process["env"].TIKTOK_ADVERTISER_ID,
        objective_type: 'LEAD_GENERATION'
      });
      adIds.push(\`tiktok:\${campaign.campaign_id}\`);
    }
  }
  
  return adIds;
}

async function deployEmailSequences(offerId) {
  // Deploy to AWeber/Mailchimp
  // Assume 'aweberAPI' is available globally or imported
  const sequence = await aweberAPI.lists.campaigns.create({
    list_id: process["env"].AWEBER_LIST_ID,
    name: \`Offer \${offerId} Nurture\`
  });
  
  return [\`aw_\${sequence.id}\`];
}

async function deployToGHL(offerId, funnelRunId) {
  // Create GHL funnel + workflow
  // Assume 'ghlAPI' is available globally or imported
  const funnel = await ghlAPI.funnels.create({
    locationId: process["env"].GHL_LOCATION_ID,
    name: \`Funnel \${funnelRunId}\`
  });

  return {
    funnel_id: funnel.id,
    workflow_id: funnel.workflow_id
  };
}`,

    funnelWorker: `// Funnel Queue Worker (queue.js)

new Worker("funnel", async (job) => { // NEW: Funnel worker
  // Assume 'db' and 'openai' are available globally or imported
  const db = {
    offers: {
      findOne: async ({ id }) => {
        console.log(\`[DB] Fetching offer \${id}...\`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          id: id,
          product: "AI Freedom Studio Masterclass",
          audience: "Entrepreneurs and course creators",
          metrics: {
            ad_ctr: 3.5,
            lp_cvr: 15,
            opt_in_to_booking: 5,
            show_rate: 60,
            close_rate: 20,
            spend: 1000,
            revenue: 2500
          }
        };
      }
    },
    followUpSequences: {
      create: async (data) => {
        console.log(\`[DB] Creating followup sequence...\`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id: \`seq_\${Date.now()}\`, ...data };
      }
    }
  };

  const openai = {
    chat: {
      completions: {
        create: async ({ model, messages, response_format }) => {
          console.log(\`[OpenAI] Generating \${messages[0].content.includes("follow-up") ? "follow-up sequence" : "ads"}...\`);
          await new Promise(resolve => setTimeout(resolve, messages[0].content.includes("follow-up") ? 5000 : 3000)); // Simulate API call
          if (messages[0].content.includes("follow-up")) {
            return {
              choices: [{
                message: {
                  content: JSON.stringify({
                    channels: ["email", "sms"],
                    touches: [
                      { day: 1, type: "email", subject: "Your Masterclass Access", content: "..." },
                      { day: 2, type: "sms", content: "Quick reminder for the masterclass!" }
                    ]
                  })
                }
              }]
            };
          } else { // Ads generation
            return {
              choices: [{
                message: {
                  content: JSON.stringify({
                    meta_ads: [{ headline: "Ad 1 Headline", body: "Ad 1 Body" }],
                    tiktok_ads: [{ video_hook: "Video 1 Hook", caption: "Video 1 Caption" }],
                    yt_shorts: [{ script: "Shorts script 1" }]
                  })
                }
              }]
            };
          }
        }
      }
    }
  };
  // --- End mock external APIs ---

  if (job.name === "generate_followup") {
    const { offer_id, brand_voice, objections, timeframe_days } = job.data;

    // Fetch offer
    const offer = await db.offers.findOne({ id: offer_id });

    // Generate with GPT-4
    const sequence = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{
        role: "system",
        content: \`You are a lifecycle architect. Create a \${timeframe_days}-day follow-up sequence with 10 touches across Email, SMS, DM, and Voice.\`
      }, {
        role: "user",
        content: \`Offer: \${offer.product}
Audience: \${offer.audience}
Voice: \${brand_voice}
Objections: \${objections.join(', ')}

Generate strict JSON with: channels, touches, branching.\`
      }],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(sequence.choices[0].message.content);

    // Save to database
    const seqRecord = await db.followUpSequences.create({
      offer_id,
      sequence_name: \`\${offer.product} - \${brand_voice} nurture\`,
      ...data,
      user_email: job.data.user_email
    });

    return {
      sequence_id: seqRecord.id,
      ...data
    };
  }

  if (job.name === "generate_ads") {
    const { offer_id, metric } = job.data;

    // Fetch offer
    const offer = await db.offers.findOne({ id: offer_id });

    // Generate ad variants
    const ads = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{
        role: "system",
        content: "Generate 3 ad variants for Meta, TikTok, and YouTube Shorts."
      }, {
        role: "user",
        content: \`Offer: \${offer.product}
Audience: \${offer.audience}
Metric: \${metric}

Generate JSON with: meta_ads, tiktok_ads, yt_shorts, targeting_hypotheses, test_plan.\`
      }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(ads.choices[0].message.content);
  }
}, { connection });`,

    copilotIntents: `// Copilot Intent Router (copilot.js)

const INTENTS = [
  {
    intent: "create_offer",
    patterns: ["draft an offer", "write my offer", "new offer", "messaging", "create offer"],
    action: "POST /api/v1/offer/generate",
    params: ["product", "audience", "buyer_type", "goal"],
    examples: ["Create an offer for my coaching program targeting real estate agents"]
  },
  {
    intent: "build_followup",
    patterns: ["follow up sequence", "nurture", "drip", "10 touch", "email sequence", "follow up"],
    action: "POST /api/v1/followup/generate",
    params: ["offer_id", "voice", "objections", "days"],
    examples: ["Create a 10-touch nurture for offer off_123 with mentor voice"]
  },
  {
    intent: "ads_generate",
    patterns: ["make ads", "meta ads", "tiktok ads", "shorts", "ad variants", "generate ads"],
    action: "POST /api/v1/ads/generate",
    params: ["offer_id", "metric"],
    examples: ["Generate Meta and TikTok ads for off_123 to reduce CPL"]
  },
  {
    intent: "funnel_deploy",
    patterns: ["deploy funnel", "publish campaign", "go live", "launch campaign", "deploy"],
    action: "POST /api/v1/funnel/deploy",
    params: ["offer_id", "platforms", "budget", "domain", "path"],
    examples: ["Deploy off_123 at /offer with $50/day on Meta and TikTok"]
  },
  {
    intent: "analytics_advise",
    patterns: ["next best action", "why not converting", "optimize funnel", "what should we fix", "nba"],
    action: "POST /api/v1/analytics/nba",
    params: ["funnel_run_id"],
    examples: ["Give me next best action for funnel fr_55"]
  }
];

// Intent Detection
async function detectIntent(command) {
  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      if (command.toLowerCase().includes(pattern.toLowerCase())) {
        return intent;
      }
    }
  }
  return null;
}

// Enhanced with AI
async function detectIntentWithAI(command, context) {
  // Assume 'openai' is available globally or imported
  const openai = {
    chat: {
      completions: {
        create: async ({ model, messages, response_format }) => {
          console.log(\`[OpenAI] Classifying intent for: \${command}...\`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Mock response based on example
          if (command.includes("offer")) return { choices: [{ message: { content: JSON.stringify({ intent: "create_offer", confidence: 0.95, extracted_params: { product: "coaching program", audience: "real estate agents" } }) } }] };
          if (command.includes("nurture")) return { choices: [{ message: { content: JSON.stringify({ intent: "build_followup", confidence: 0.90, extracted_params: { offer_id: "off_123", voice: "mentor", days: 10 } }) } }] };
          if (command.includes("ads")) return { choices: [{ message: { content: JSON.stringify({ intent: "ads_generate", confidence: 0.92, extracted_params: { offer_id: "off_123", metric: "CPL" } }) } }] };
          if (command.includes("deploy")) return { choices: [{ message: { content: JSON.stringify({ intent: "funnel_deploy", confidence: 0.88, extracted_params: { offer_id: "off_123", budget: 50, platforms: ["Meta", "TikTok"] } }) } }] };
          if (command.includes("action")) return { choices: [{ message: { content: JSON.stringify({ intent: "analytics_advise", confidence: 0.85, extracted_params: { funnel_run_id: "fr_55" } }) } }] };
          return { choices: [{ message: { content: JSON.stringify({ intent: "unknown", confidence: 0.5, extracted_params: {} }) } }] };
        }
      }
    }
  };

  const analysis = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{
      role: "system",
      content: \`You are an AI Copilot intent classifier.

Available intents: \${INTENTS.map(i => i.intent).join(', ')}

Analyze the user command and return: intent, confidence, extracted_params.\`
    }, {
      role: "user",
      content: \`Command: "\${command}"
Context: \${JSON.stringify(context)}\`
    }],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(analysis.choices[0].message.content);
  const matchedIntent = INTENTS.find(i => i.intent === result.intent);

  return {
    ...matchedIntent,
    confidence: result.confidence,
    extracted_params: result.extracted_params
  };
}

// Execute Intent
async function executeIntent(intent, params, user) {
  // Map intent to API call
  const endpoint = intent.action;
  
  // Make API call
  // Assume 'fetch' is available
  const response = await fetch(\`https://api.example.com\${endpoint}\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${user.token}\`
    },
    body: JSON.stringify(params)
  });

  return await response.json();
}`,
    promptLibrary: `// ============================================
// AI PROMPT LIBRARY - PRODUCTION READY
// ============================================

// A1. FOLLOW-UP GENERATOR (10-touch, multi-channel)
const FOLLOWUP_GENERATOR_PROMPT = \`SYSTEM:
You are a lifecycle architect. Build a 10-touch follow-up sequence over 14 days across Email, SMS, DM, and optional Voice.

RULES:
- Minimum 5 touches before "stale"
- Personalization tokens: {{first_name}}, {{industry}}, {{company}}, {{goals}}
- Each touch must handle 1-2 objections
- Clear single CTA per touch
- Progressive value delivery
- Branching logic for engagement signals

USER INPUT:
Offer: {{offer}}
Audience: {{audience}}
Objections: {{objections}}
Brand voice: {{voice}}
Timeframe: {{days}} days

TASKS:

1) Create 10-touch sequence with mix of channels:
   - Day 0: Email (immediate delivery value)
   - Day 1: SMS (quick check-in)
   - Day 2: DM (build relationship)
   - Day 3: Email (case study/proof)
   - Day 5: SMS (objection handling)
   - Day 7: Email (social proof)
   - Day 9: DM (personal touch)
   - Day 11: Email (urgency/scarcity)
   - Day 13: Voice/DM (final push)
   - Day 14: Email (last chance)

2) For each touch provide:
   - Day number
   - Channel
   - Subject line (email) or opening line (SMS/DM)
   - Body copy
   - CTA (clear action)
   - CTA URL placeholder
   - Objection addressed

3) Branching logic:
   - If no open on Email 0 → trigger SMS Day 1
   - If clicked Email 2 → send high-value DM Day 3
   - If no response by Day 7 → add urgency email
   - If opened but not clicked → retarget with different angle

4) Personalization:
   - Use {{first_name}} in greetings
   - Use {{industry}} for relevant examples
   - Use {{goals}} for motivation
   - Tailor proof to buyer type

Voice options:
- mentor: Calm, structured, explains strategies
- hustler: Energetic, fast, motivational
- analyst: Data-driven, ROI focused
- creator: Witty, creative, content-first

OUTPUT (strict JSON):
{
  "channels": ["email","sms","dm","voice"],
  "touches": [
    { "day":0, "channel":"email", "subject":"...", "body":"...", "cta":"...", "cta_url":"...", "objection_addressed":"..." },
    { "day":1, "channel":"sms", "text":"...", "cta":"...", "objection_addressed":"..." }
  ],
  "branching": [
    { "if":"no_open_email_0", "then":"sms_day_1" },
    { "if":"clicked_email_2", "then":"dm_day_3_value" }
  ],
  "goals": {
    "bookings": true,
    "sales": true,
    "engagement": true
  }
}\`;

// A2. CAMPAIGN AD VARIANTS (Meta/TikTok/YT)
const AD_VARIANTS_PROMPT = \`SYSTEM:
Generate 3 ad variants per platform with: primary text, headline, description, hook, and creative notes. Add audience hypotheses.

USER INPUT:
Offer: {{offer}}
Audience: {{audience}}
Goal: CPL or CPA {{metric}}

TASKS:

For EACH platform (Meta, TikTok, YouTube Shorts), create 3 distinct ad variants:

1) META ADS (3 variants):
   - Primary text (125 chars, attention-grabbing)
   - Headline (40 chars max, clear value prop)
   - Description (30 chars max, supportive detail)
   - Hook (first 3 words that stop scroll)
   - Creative notes (B-roll ideas, overlays, visual style)
   - Target emotion
   - Expected CTR

2) TIKTOK ADS (3 variants):
   - Opening hook (3 seconds, pattern interrupt)
   - Story/value delivery (10 seconds)
   - CTA (final 5 seconds)
   - Creative notes (native style, trends, sounds)
   - Text overlay suggestions
   - Expected watch-through rate

3) YOUTUBE SHORTS (3 variants):
   - Hook (first 3 seconds)
   - Main content (20-30 seconds)
   - CTA (final 12 seconds)
   - Creative notes (editing style, music, pacing)
   - Expected retention rate

4) TARGETING HYPOTHESES:
   - 3-5 interest-based targeting ideas with rationale
   - 2-3 lookalike audience recommendations
   - Geographic targeting suggestions
   - Demographic filters
   - Expected CPL per hypothesis

5) TEST PLAN:
   - Phase 1: Test which hooks perform best (budget allocation)
   - Phase 2: Test winning hooks with different creatives
   - Phase 3: Test winning combos with different audiences

Each variant should test different angles/emotions/approaches.

OUTPUT JSON:
{
  "meta_ads": [
    {
      "variant_number": 1,
      "primary_text": "...",
      "headline": "...",
      "description": "...",
      "hook": "...",
      "creative_notes": "...",
      "target_emotion": "...",
      "expected_ctr": 2.3
    }
  ],
  "tiktok_ads": [...],
  "yt_shorts": [...],
  "targeting_hypotheses": [
    {
      "hypothesis_name": "...",
      "type": "interest|lookalike|geo",
      "details": "...",
      "why_it_works": "...",
      "expected_cpl": 15
    }
  ],
  "test_plan": {
    "phase_1": "...",
    "phase_2": "...",
    "phase_3": "...",
    "budget_allocation": {
      "phase_1_percent": 40,
      "phase_2_percent": 35,
      "phase_3_percent": 25
    }
  }
}\`;

// A3. ANALYTICS → NEXT-BEST-ACTION (NBA)
const NBA_PROMPT = \`SYSTEM:
You are a funnel optimizer. Given step metrics, return prioritized fixes with impact/effort and concrete actions.

USER INPUT:
Funnel: {{funnel_name}}
Ad CTR: {{ctr}}%
LP CVR: {{lpcvr}}%
Opt-in→Booking: {{book}}%
Show-rate: {{show}}%
Close-rate: {{close}}%
Spend: \${{spend}}
Revenue: \${{revenue}}
ROAS: {{roas}}x
Constraints: {{constraints}}

ANALYSIS BENCHMARKS:
- Ad CTR: >2% = good, 1-2% = okay, <1% = poor
- LP CVR: >20% = great, 10-20% = good, <10% = needs work
- Booking Rate: >30% = great, 15-30% = good, <15% = poor
- Show Rate: >75% = great, 60-75% = good, <60% = poor
- Close Rate: >25% = great, 15-25% = good, <15% = poor

ANALYZE EACH FUNNEL STEP:

1. AD PERFORMANCE:
   - Is CTR acceptable?
   - If low: Why? (targeting, creative, hook, offer mismatch)
   - Fix: Specific action to improve

2. LANDING PAGE:
   - Is CVR acceptable?
   - If low: Why? (proof, design, copy, CTA placement)
   - Fix: Specific changes to make

3. OPT-IN TO BOOKING:
   - Are leads converting to scheduled calls?
   - If low: Why? (friction, trust gap, perceived value)
   - Fix: Specific improvements

4. SHOW RATE:
   - Do people show up to calls?
   - If low: Why? (commitment, reminders, qualification)
   - Fix: Reminder strategy, requalification

5. CLOSE RATE:
   - Are calls converting to sales?
   - If low: Why? (objections, price, offer clarity, sales process)
   - Fix: Sales process or offer improvements

PROVIDE TOP 5 RECOMMENDATIONS:

For each:
- Issue: What's not working
- Hypothesis: Why it's happening
- Expected Gain: % improvement (realistic projections)
- Effort: low/medium/high
- Actionable Step: Specific, concrete action to take NOW
- Priority: 1-5 (1 = highest impact/lowest effort)
- Category: ad_creative, targeting, landing_page, follow_up, pricing, offer

Focus on highest impact/lowest effort wins first.

OUTPUT JSON:
{
  "recommendations": [
    {
      "issue": "Low LP CVR (8%)",
      "hypothesis": "Weak above-fold social proof - visitors don't trust offer",
      "expected_gain": 18,
      "effort": "low",
      "actionable_step": "Add 3 client logos + testimonial quote above CTA; move hero video to top of page",
      "priority": 1,
      "category": "landing_page"
    }
  ]
}\`;

// A4. OFFER & MESSAGING (belief-aligned copy)
const OFFER_GENERATOR_PROMPT = \`SYSTEM:
You are a senior direct-response strategist. Optimize offers using "pain → dream → vehicle → proof → CTA".

Score messaging with belief-alignment checklist:
- Desire activation
- Trust cues
- Pain resolution
- Status gain
- Social proof
- Future pacing
- Risk reversal
- CTA clarity

USER INPUT:
- Product: {{product}}
- Audience: {{audience}}
- Buyer type: {{buyer_type}}  # Visionary | Analyst | Skeptic | Follower | Emotional
- Goal: {{goal}}  # lead_gen / booked_calls / low_ticket_sale / high_ticket_sale
- Constraints (optional): {{constraints}}

TASKS:

1) OFFER SUMMARY (<=120 words):
   - Lead with pain/desire
   - Present vehicle (your solution)
   - Stack value
   - Remove risk
   - Clear CTA

2) 5 HOOKS (<=8 words each):
   - Attention-grabbing opening lines
   - Tailored to buyer type psychology

3) VALUE STACK (3 bullets):
   - Core offer benefit
   - Bonus/added value
   - Transformation promise

4) RISK REVERSALS (2 guarantees):
   - Primary guarantee
   - Bonus guarantee/promise

5) CTAs:
   - Primary CTA (action-oriented)
   - Secondary CTA (softer alternative)

6) 30-SECOND REEL SCRIPT:
   - Hook (first 3 seconds)
   - Story (15 seconds)
   - CTA (final 12 seconds)

7) LANDING PAGE SECTIONS:
   - H1 headline (clear value prop)
   - Subheadline (expand on promise)
   - 3 proof blocks (testimonial style)
   - 3 FAQ items (handle objections)

8) BELIEF ALIGNMENT SCORE (0-100):
   Score each factor 0-100:
   - Desire activation
   - Trust cues
   - Pain resolution
   - Status gain
   - Social proof
   - Future pacing
   - Risk reversal
   - CTA clarity

9) TOP 3 IMPROVEMENTS:
   Specific suggestions to boost belief alignment

OUTPUT JSON:
{
  "offer_summary": "...",
  "hooks": ["...", "...", "...", "...", "..."],
  "value_stack": ["...", "...", "..."],
  "risk_reversals": ["...", "..."],
  "ctas": {
    "primary": "...",
    "secondary": "..."
  },
  "reel_script": {
    "hook": "...",
    "story": "...",
    "cta": "..."
  },
  "landing_page_sections": {
    "h1": "...",
    "subhead": "...",
    "proof_blocks": ["...", "...", "..."],
    "faq": [
      {"question": "...", "answer": "..."}
    ]
  },
  "belief_scores": {
    "desire_activation": 85,
    "trust_cues": 78,
    "pain_resolution": 92,
    "status_gain": 73,
    "social_proof": 88,
    "future_pacing": 81,
    "risk_reversal": 95,
    "cta_clarity": 87
  },
  "belief_alignment_score": 85,
  "improvements": ["...", "...", "..."]
}\`;

// A5. BUYER-TYPE STYLE TRANSFORMS
const BUYER_TYPE_TRANSFORM_PROMPT = \`SYSTEM:
Rewrite copy for buyer archetypes while preserving meaning.

USER INPUT:
Original copy: """{{copy}}"""
Buyer types: Visionary, Analyst, Skeptic, Follower, Emotional

TRANSFORMATION RULES:

VISIONARY:
- Bold, outcome-driven language
- Future pacing ("Imagine...", "Picture this...")
- Big numbers and transformations
- Emphasize innovation and leadership
- Remove limitations

ANALYST:
- Numbers, data, mechanisms
- Step-by-step processes
- ROI calculations
- Technical details and caveats
- "Here's how it works..."

SKEPTIC:
- Address objections FIRST
- Safety and proof emphasis
- Risk mitigation
- Third-party validation
- Money-back guarantees upfront

FOLLOWER:
- Social proof dominant
- "Join 1,000+ others..."
- Simple, clear directions
- Community emphasis
- Testimonials throughout

EMOTIONAL:
- Story-driven
- Feeling and identity language
- Character transformation
- "Remember when..." / "Imagine feeling..."
- Personal connection

OUTPUT JSON:
{
  "visionary": "...",
  "analyst": "...",
  "skeptic": "...",
  "follower": "...",
  "emotional": "..."
}\`;

// USAGE EXAMPLE IN NODE.JS
async function generateFollowUpSequence(offerData, options) {
  const prompt = FOLLOWUP_GENERATOR_PROMPT
    .replace('{{offer}}', offerData.offer_summary)
    .replace('{{audience}}', offerData.audience)
    .replace('{{objections}}', options.objections.join(', '))
    .replace('{{voice}}', options.brand_voice)
    .replace('{{days}}', options.timeframe_days);

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function generateAdVariants(offerData, metric) {
  const prompt = AD_VARIANTS_PROMPT
    .replace('{{offer}}', JSON.stringify(offerData))
    .replace('{{audience}}', offerData.audience)
    .replace('{{metric}}', metric);

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function analyzeNBA(funnelMetrics, constraints) {
  const prompt = NBA_PROMPT
    .replace('{{funnel_name}}', funnelMetrics.funnel_name)
    .replace('{{ctr}}', funnelMetrics.ad_ctr)
    .replace('{{lpcvr}}', funnelMetrics.lp_cvr)
    .replace('{{book}}', funnelMetrics.opt_in_to_booking)
    .replace('{{show}}', funnelMetrics.show_rate)
    .replace('{{close}}', funnelMetrics.close_rate)
    .replace('{{spend}}', funnelMetrics.spend)
    .replace('{{revenue}}', funnelMetrics.revenue)
    .replace('{{roas}}', funnelMetrics.roas)
    .replace('{{constraints}}', constraints);

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}`
  };

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/api/v1/offer/generate",
      purpose: "Generate marketing offer & aligned copy",
      params: ["product", "audience", "buyer_type", "goal", "constraints"],
      response: "OfferBlueprint with belief scores"
    },
    {
      method: "POST",
      endpoint: "/api/v1/followup/generate",
      purpose: "Create nurture sequences",
      params: ["offer_id", "voice", "objections", "days"],
      response: "10-touch sequence with branching"
    },
    {
      method: "POST",
      endpoint: "/api/v1/ads/generate",
      purpose: "Build ad variants with targeting presets",
      params: ["offer_id", "metric"],
      response: "3 variants × 3 platforms + targeting"
    },
    {
      method: "POST",
      endpoint: "/api/v1/funnel/deploy",
      purpose: "Launch full funnel",
      params: ["offer_id", "platforms", "budget", "domain", "path"],
      response: "FunnelRun ID + landing URL + campaign IDs"
    },
    {
      method: "POST",
      endpoint: "/api/v1/analytics/nba",
      purpose: "Suggest 'Next Best Action' improvements",
      params: ["funnel_run_id"],
      response: "Top 5 prioritized recommendations"
    },
    {
      method: "POST",
      endpoint: "/api/v1/budget/set",
      purpose: "Create AI-managed budget plan",
      params: ["amount", "period", "goal", "channels"],
      response: "Budget plan with AI allocation"
    },
    {
      method: "POST",
      endpoint: "/api/v1/budget/optimize",
      purpose: "Optimize budget allocation",
      params: ["plan_id", "metrics"],
      response: "New allocation + recommendations"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
              <Code className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Backend Integration Guide</h1>
              <p className="text-gray-300 text-lg">
                Production-ready API specs, worker implementations, and deployment instructions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Quick Reference - NEW */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#FFD700]" />
              API Endpoints Quick Reference
            </CardTitle>
            <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
              {apiEndpoints.length} Endpoints
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiEndpoints.map((api, idx) => (
              <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 font-mono text-xs">
                      {api.method}
                    </Badge>
                    <code className="text-[#00D4C9] text-sm font-mono">{api.endpoint}</code>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{api.purpose}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-500 text-xs">Params:</span>
                  {api.params.map((param, pidx) => (
                    <Badge key={pidx} className="bg-blue-500/20 text-blue-400 text-xs">
                      {param}
                    </Badge>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  <strong className="text-[#FFD700]">Returns:</strong> {api.response}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <h4 className="text-yellow-400 font-semibold text-sm mb-2">💡 Implementation Note:</h4>
            <p className="text-gray-300 text-sm">
              All endpoints support standard REST conventions. Use JWT tokens for authentication.
              Rate limits: 100 req/min for standard plans, 1000 req/min for enterprise.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">📚 Complete Backend Implementation</CardTitle>
            <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
              Production Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* SECTION: Avatar Rendering */}
          <div className="space-y-4">
            <h3 className="text-[#00D4C9] font-bold text-lg flex items-center gap-2">
              <Server className="w-5 h-5" />
              Avatar Rendering APIs
            </h3>

            {/* 1. Queue Setup */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#00D4C9]" />
                  BullMQ Queue Setup (queue.js)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.queue, 'queue')}
                  className="border-gray-700"
                >
                  {copiedSection === 'queue' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
                <code>{codeBlocks.queue}</code>
              </pre>
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <code className="text-gray-300 text-xs">npm i bullmq ioredis</code>
              </div>
            </div>

            {/* 2. Retry Policies */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FFD700]" />
                  Retry & Backoff Strategies
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.retries, 'retries')}
                  className="border-gray-700"
                >
                  {copiedSection === 'retries' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
                <code>{codeBlocks.retries}</code>
              </pre>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Badge className="bg-green-500/20 text-green-400 text-xs">Render: 5 attempts, exponential</Badge>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">Batch: 3 attempts, fixed</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">Dub: 4 attempts, exponential</Badge>
              </div>
            </div>

            {/* 3. Notifications */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#9D4EDD]" />
                  Slack & Email Notifications (notify.js + queue.js)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.notifications, 'notifications')}
                  className="border-gray-700"
                >
                  {copiedSection === 'notifications' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
                <code>{codeBlocks.notifications}</code>
              </pre>
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <code className="text-gray-300 text-xs">npm i nodemailer</code>
              </div>
            </div>

            {/* 4. Prometheus Metrics */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  Prometheus Metrics (server.js)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.metrics, 'metrics')}
                  className="border-gray-700"
                >
                  {copiedSection === 'metrics' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
                <code>{codeBlocks.metrics}</code>
              </pre>
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <code className="text-gray-300 text-xs">npm i prom-client</code>
              </div>
            </div>
          </div>

          {/* SECTION: Lead Magnet APIs */}
          <div className="space-y-4">
            <h3 className="text-[#FFD700] font-bold text-lg flex items-center gap-2 border-t border-gray-800 pt-6">
              <FileText className="w-5 h-5" />
              Lead Magnet Generation APIs
            </h3>

            {/* Lead Magnet API Endpoints */}
            <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-2 border-[#FFD700]/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#FFD700]" />
                  Lead Magnet API Endpoints (server.js)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.leadMagnetAPI, 'leadMagnetAPI')}
                  className="border-[#FFD700]/30 hover:bg-[#FFD700]/10"
                >
                  {copiedSection === 'leadMagnetAPI' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <code className="text-green-400 text-xs font-bold">POST /leadmagnet/generate</code>
                  <p className="text-gray-400 text-xs mt-1">Create AI-written content</p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mt-2">~20s</Badge>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <code className="text-blue-400 text-xs font-bold">POST /leadmagnet/export</code>
                  <p className="text-gray-400 text-xs mt-1">Render PDF/EPUB/HTML</p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mt-2">~10s</Badge>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <code className="text-purple-400 text-xs font-bold">POST /leadmagnet/deploy</code>
                  <p className="text-gray-400 text-xs mt-1">Publish to channels</p>
                  <Badge className="bg-green-500/20 text-green-400 text-xs mt-2">Instant</Badge>
                </div>
              </div>

              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
                <code>{codeBlocks.leadMagnetAPI}</code>
              </pre>
            </div>

            {/* Lead Magnet Worker */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FF8C00]" />
                  Lead Magnet Worker Logic (queue.js)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.leadMagnetWorker, 'leadMagnetWorker')}
                  className="border-gray-700"
                >
                  {copiedSection === 'leadMagnetWorker' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
                <code>{codeBlocks.leadMagnetWorker}</code>
              </pre>
            </div>

            {/* Data Models */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#9D4EDD]" />
                  Data Models (PostgreSQL/MongoDB)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.leadMagnetDataModels, 'leadMagnetDataModels')}
                  className="border-gray-700"
                >
                  {copiedSection === 'leadMagnetDataModels' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
                <code>{codeBlocks.leadMagnetDataModels}</code>
              </pre>
            </div>
          </div>

          {/* SECTION: Funnel Automation APIs - NEW */}
          <div className="space-y-4">
            <h3 className="text-[#9D4EDD] font-bold text-lg flex items-center gap-2 border-t border-gray-800 pt-6">
              <Target className="w-5 h-5" />
              Funnel Automation APIs
            </h3>

            {/* Funnel API Endpoints */}
            <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-2 border-[#9D4EDD]/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#9D4EDD]" />
                  Funnel API Endpoints (4)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.funnelAPIs, 'funnelAPIs')}
                  className="border-[#9D4EDD]/30 hover:bg-[#9D4EDD]/10"
                >
                  {copiedSection === 'funnelAPIs' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <code className="text-green-400 text-xs font-bold">POST /followup/generate</code>
                  <p className="text-gray-400 text-xs mt-1">10-touch lifecycle sequence</p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mt-2">~15s</Badge>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <code className="text-green-400 text-xs font-bold">POST /ads/generate</code>
                  <p className="text-gray-400 text-xs mt-1">Multi-platform ad variants</p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mt-2">~20s</Badge>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <code className="text-blue-400 text-xs font-bold">POST /funnel/deploy</code>
                  <p className="text-gray-400 text-xs mt-1">Deploy full funnel</p>
                  <Badge className="bg-green-500/20 text-green-400 text-xs mt-2">Instant</Badge>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <code className="text-purple-400 text-xs font-bold">POST /analytics/nba</code>
                  <p className="text-400 text-xs mt-1">Next-best-action analysis</p>
                  <Badge className="bg-green-500/20 text-green-400 text-xs mt-2">~5s</Badge>
                </div>
              </div>

              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
                <code>{codeBlocks.funnelAPIs}</code>
              </pre>
            </div>

            {/* Funnel Worker */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FF8C00]" />
                  Funnel Worker Logic
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.funnelWorker, 'funnelWorker')}
                  className="border-gray-700"
                >
                  {copiedSection === 'funnelWorker' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
                <code>{codeBlocks.funnelWorker}</code>
              </pre>
            </div>

            {/* Copilot Intents */}
            <div className="p-4 bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-2 border-[#00D4C9]/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#00D4C9]" />
                  Copilot Intent Router
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.copilotIntents, 'copilotIntents')}
                  className="border-[#00D4C9]/30 hover:bg-[#00D4C9]/10"
                >
                  {copiedSection === 'copilotIntents' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-[#00D4C9] font-semibold text-xs mb-2">📋 Supported Intents (5):</h5>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• create_offer</li>
                    <li>• build_followup</li>
                    <li>• ads_generate</li>
                    <li>• funnel_deploy</li>
                    <li>• analytics_advise</li>
                  </ul>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-[#FFD700] font-semibold text-xs mb-2">💬 Example Commands:</h5>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• "Create an offer for coaches"</li>
                    <li>• "Build a 10-touch nurture"</li>
                    <li>• "Generate Meta ads"</li>
                    <li>• "Deploy the funnel"</li>
                    <li>• "What should I fix?"</li>
                  </ul>
                </div>
              </div>

              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
                <code>{codeBlocks.copilotIntents}</code>
              </pre>
            </div>
          </div>

          {/* SECTION: AI Prompt Library - NEW */}
          <div className="space-y-4">
            <h3 className="text-[#06D6A0] font-bold text-lg flex items-center gap-2 border-t border-gray-800 pt-6">
              <Sparkles className="w-5 h-5" />
              AI Prompt Library (Production Prompts)
            </h3>

            <div className="p-4 bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border-2 border-[#06D6A0]/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#06D6A0]" />
                  Complete Prompt Templates (5)
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(codeBlocks.promptLibrary, 'promptLibrary')}
                  className="border-[#06D6A0]/30 hover:bg-[#06D6A0]/10"
                >
                  {copiedSection === 'promptLibrary' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All Prompts
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-[#06D6A0] font-semibold text-xs mb-2">✅ Included Prompts:</h5>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• A1: Follow-Up Generator (10-touch, multi-channel)</li>
                    <li>• A2: Campaign Ad Variants (Meta/TikTok/YT)</li>
                    <li>• A3: Analytics NBA (funnel optimization)</li>
                    <li>• A4: Offer & Messaging (belief-aligned)</li>
                    <li>• A5: Buyer-Type Transforms (5 variations)</li>
                  </ul>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-[#FFD700] font-semibold text-xs mb-2">🎯 Features:</h5>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Strict JSON output schemas</li>
                    <li>• Personalization tokens</li>
                    <li>• Branching logic support</li>
                    <li>• Multi-platform optimization</li>
                    <li>• Belief-alignment scoring</li>
                  </ul>
                </div>
              </div>

              <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[500px]">
                <code>{codeBlocks.promptLibrary}</code>
              </pre>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h5 className="text-blue-400 font-semibold text-xs mb-2">💡 Usage Tips:</h5>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Replace placeholder variables with actual values before sending to GPT-4</li>
                  <li>• Use response_format: type: "json_object" for structured output</li>
                  <li>• Store prompts as constants for easy versioning</li>
                  <li>• Test with gpt-4-turbo for best results</li>
                  <li>• Cache responses to save API costs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION: Pricing & Fee Integration - NEW */}
          <div className="space-y-4">
            <h3 className="text-[#06D6A0] font-bold text-lg flex items-center gap-2 border-t border-gray-800 pt-6">
              <DollarSign className="w-5 h-5" />
              Pricing & Fee Integration
            </h3>

            <div className="p-4 bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border-2 border-[#06D6A0]/30 rounded-xl">
              <h4 className="text-white font-semibold mb-3">💰 Budget Manager Parameters</h4>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-[#FFD700] font-semibold text-sm mb-2">Fee Models:</h5>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• <code className="text-[#00D4C9]">fee_model</code>: "subscription" | "percent" | "hybrid"</li>
                    <li>• <code className="text-[#00D4C9]">ad_spend_pct</code>: number (10-35%)</li>
                    <li>• <code className="text-[#00D4C9]">min_fee</code>: number ($249-$749/mo)</li>
                    <li>• <code className="text-[#00D4C9]">subscription_fee</code>: number ($97-$997/mo)</li>
                  </ul>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-[#FFD700] font-semibold text-sm mb-2">Pricing Tiers:</h5>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• <strong>Basic Automation:</strong> $97–$297/mo (subscription only)</li>
                    <li>• <strong>Hybrid (Recommended):</strong> $297/mo + 15-25% ad spend (min $249)</li>
                    <li>• <strong>Enterprise:</strong> $997+/mo with dedicated strategist</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-black/30 rounded-lg">
                <code className="text-gray-300 text-xs whitespace-pre-wrap">{`// Budget Plan Schema
{
  fee_model: "subscription" | "percent" | "hybrid",
  ad_spend_pct: 15,  // 15% of ad spend
  min_fee: 249,      // Minimum monthly fee
  subscription_fee: 297,  // Base subscription
  
  // Calculation Examples:
  // 1) Subscription Only: $297/mo flat
  // 2) Percent Only: max($1000 * 0.15, $249) = $249/mo
  // 3) Hybrid: $297 + max($1000 * 0.15, 0) = $447/mo
}

// Fee Calculation Function
function calculateFee(monthlySpend, model, config) {
  const spendFee = (config.ad_spend_pct / 100) * monthlySpend;
  
  if (model === "percent") {
    return Math.max(spendFee, config.min_fee);
  }
  if (model === "subscription") {
    return config.subscription_fee;
  }
  // hybrid
  return Math.max(
    config.subscription_fee + spendFee, 
    config.min_fee
  );
}`}</code>
              </div>
            </div>
          </div>

          {/* 5. Complete API Implementation */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Code className="w-4 h-4 text-[#FFD700]" />
                Complete API (server.js)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.api, 'api')}
                className="border-gray-700"
              >
                {copiedSection === 'api' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.api}</code>
            </pre>
          </div>

          {/* 6. WebSocket Real-time Updates */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" />
                WebSocket Real-time Updates (websocket.js)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.websocket, 'websocket')}
                className="border-gray-700"
                >
                {copiedSection === 'websocket' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                    </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.websocket}</code>
            </pre>
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <code className="text-gray-300 text-xs">npm i socket.io</code>
            </div>
          </div>

          {/* 7. Environment Variables */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Environment Variables (.env)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.env, 'env')}
                className="border-gray-700"
              >
                {copiedSection === 'env' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.env}</code>
            </pre>
          </div>
          
          {/* 8. Prometheus Config */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-400" />
                Prometheus Configuration (prometheus.yml)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.prometheusConfig, 'prometheusConfig')}
                className="border-gray-700"
              >
                {copiedSection === 'prometheusConfig' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.prometheusConfig}</code>
            </pre>
          </div>

          {/* 9. Alert Rules */}
          <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                Prometheus Alert Rules (rules/afs-avatar.yaml)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.alertRules, 'alertRules')}
                className="border-red-500/30 hover:bg-red-500/10"
              >
                {copiedSection === 'alertRules' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy YAML
                  </>
                )}
              </Button>
            </div>

            {/* Alert Summary */}
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <h5 className="text-red-400 font-semibold text-xs mb-2">🚨 Critical Alerts (4):</h5>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• AFSJobFailureRateSevere (&gt;10%)</li>
                  <li>• AFSJobDurationP95Severe (&gt;20min)</li>
                  <li>• AFSNoActiveWorkers (0 workers)</li>
                  <li>• AFSOverallSuccessRateLow (&lt;90%)</li>
                </ul>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <h5 className="text-yellow-400 font-semibold text-xs mb-2">⚠️ Warning Alerts (6):</h5>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• AFSJobFailureRateHigh (&gt;5%)</li>
                  <li>• AFSJobDurationP95High (&gt;10min)</li>
                  <li>• AFSQueueBacklogHigh (&gt;50 jobs)</li>
                  <li>• AFSHighRetryRate (&gt;30%)</li>
                  <li>• AFSAPILatencyHigh (&gt;5s)</li>
                  <li>• AFSHighMemoryUsage (&gt;2GB)</li>
                </ul>
              </div>
            </div>

            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
              <code>{codeBlocks.alertRules}</code>
            </pre>

            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <p className="text-yellow-400 text-xs font-semibold mb-1">📁 Save as:</p>
              <code className="text-gray-300 text-xs">rules/afs-avatar.yaml</code>
              <p className="text-gray-400 text-xs mt-1">Then load via prometheus.yml → rule_files</p>
            </div>
          </div>

          {/* 10. Alertmanager Config */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF69B4]" />
                Alertmanager Configuration (alertmanager.yml)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.alertmanagerConfig, 'alertmanagerConfig')}
                className="border-gray-700"
              >
                {copiedSection === 'alertmanagerConfig' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.alertmanagerConfig}</code>
            </pre>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-2 bg-[#111317] rounded text-center">
                <p className="text-gray-400 text-xs">Critical → Slack + PagerDuty</p>
              </div>
              <div className="p-2 bg-[#111317] rounded text-center">
                <p className="text-gray-400 text-xs">Warning → Slack only</p>
              </div>
            </div>
          </div>

          {/* 11. Dockerfile */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                Dockerfile
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.dockerfile, 'dockerfile')}
                className="border-gray-700"
              >
                {copiedSection === 'dockerfile' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.dockerfile}</code>
            </pre>
          </div>

          {/* 12. Docker Compose (Full Stack) */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Server className="w-4 h-4 text-[#00D4C9]" />
                Docker Compose (Full Stack)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.dockerCompose, 'dockerCompose')}
                className="border-gray-700"
              >
                {copiedSection === 'dockerCompose' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[400px]">
              <code>{codeBlocks.dockerCompose}</code>
            </pre>
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
              <p className="text-green-400 text-xs font-semibold mb-2">🚀 Deploy Everything:</p>
              <code className="text-gray-300 text-xs block">docker-compose up -d</code>
              <p className="text-gray-400 text-xs mt-1">Includes: Redis, Avatar API, Prometheus, Alertmanager, Grafana</p>
            </div>
          </div>

          {/* 13. Grafana Dashboard JSON */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <MonitorCheck className="w-4 h-4 text-pink-400" />
                Grafana Dashboard JSON
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.grafana, 'grafana')}
                className="border-gray-700"
              >
                {copiedSection === 'grafana' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy JSON
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.grafana}</code>
            </pre>
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <p className="text-yellow-400 text-xs font-semibold mb-1">💡 Import this JSON into Grafana to get the dashboard.</p>
            </div>
          </div>

          {/* 14. Grafana Dashboard Queries */}
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Grafana Dashboard Queries (PromQL)
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(codeBlocks.grafanaQueries, 'grafanaQueries')}
                className="border-gray-700"
              >
                {copiedSection === 'grafanaQueries' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-[300px]">
              <code>{codeBlocks.grafanaQueries}</code>
            </pre>
          </div>

          {/* Installation Summary */}
          <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-xl">
            <h4 className="text-[#FFD700] font-bold mb-3">📦 Complete Dependency List</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400 text-xs mb-2">Core Queue:</p>
                <code className="text-gray-300 text-xs block bg-black/30 p-2 rounded">npm i bullmq ioredis</code>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-2">Notifications:</p>
                <code className="text-gray-300 text-xs block bg-black/30 p-2 rounded">npm i nodemailer</code>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-2">Metrics:</p>
                <code className="text-gray-300 text-xs block bg-black/30 p-2 rounded">npm i prom-client</code>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-2">WebSocket:</p>
                <code className="text-gray-300 text-xs block bg-black/30 p-2 rounded">npm i socket.io</code>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-2">PDF Generation (Puppeteer):</p>
                <code className="text-gray-300 text-xs block bg-black/30 p-2 rounded">npm i puppeteer html-pdf-node</code>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-2">OpenAI Integration:</p>
                <code className="text-gray-300 text-xs block bg-black/30 p-2 rounded">npm i openai</code>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Production Checklist */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Production Deployment Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-green-400 font-semibold text-sm mb-3">🔧 Infrastructure</h4>
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set REDIS_URL (reachable from workers)
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Configure AWS S3/Cloudflare R2
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set HEYGEN_API_KEY
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set ELEVENLABS_API_KEY
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set OPENAI_API_KEY
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Install FFmpeg (for avatar) & Chromium (for LM) in container
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-green-400 font-semibold text-sm mb-3">📢 Monitoring</h4>
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set SLACK_WEBHOOK_URL (optional)
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Configure SMTP settings
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Create rules/afs-avatar.yaml
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set up Alertmanager
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Create Grafana dashboards
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-green-400 font-semibold text-sm mb-3">🔐 Security</h4>
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set JWT_SECRET (32+ chars)
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Enable rate limiting
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Implement idempotency
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Add input validation
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Encrypt sensitive data
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-green-400 font-semibold text-sm mb-3">⚙️ Optimization</h4>
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Tune attempts & backoff
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set worker concurrency
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Configure job timeouts
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Enable queue autoscaling
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="rounded" />
                  Set up CDN caching
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}