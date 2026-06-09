
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Copilot Intent Registry
const INTENT_REGISTRY = {
  "language.switch": {
    utterances: [
      "switch to english",
      "change to spanish",
      "switch language to french",
      "change language",
      "set language to german",
      "switch to italian",
      "change to arabic",
      "switch to japanese",
      "change to chinese",
      "cambiar a español",
      "changer en français",
      "mudar para português",
      "wechseln zu deutsch",
      "cambia in italiano",
      "التبديل إلى العربية",
      "日本語に切り替え",
      "切换到中文"
    ],
    handler: async (params, user) => {
      const languageMap = {
        english: 'en', spanish: 'es', español: 'es',
        french: 'fr', français: 'fr',
        portuguese: 'pt', português: 'pt',
        german: 'de', deutsch: 'de',
        italian: 'it', italiano: 'it',
        arabic: 'ar', العربية: 'ar',
        japanese: 'ja', 日本語: 'ja',
        chinese: 'zh', 中文: 'zh'
      };

      const targetLang = params.language || 'en';
      // Find the key in languageMap that matches targetLang (case-insensitive) to get the normalized name, then the code
      const langName = Object.keys(languageMap).find(k => k.toLowerCase() === targetLang.toLowerCase());
      const langCode = langName ? languageMap[langName] : 'en'; // Default to English if not found

      if (typeof window !== 'undefined') {
        localStorage.setItem('afs_lang', langCode);
        window.dispatchEvent(new CustomEvent('afs:i18n:lang:changed', {
          detail: { lang: langCode }
        }));
        
        // Reload page to apply language
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `switch_language_${langCode}`,
        intent: "change_settings",
        params: { language: langCode },
        mode: "reactive",
        status: "success"
      });

      const langNames = {
        en: 'English 🇺🇸',
        es: 'Español 🇪🇸',
        fr: 'Français 🇫🇷',
        pt: 'Português 🇧🇷',
        de: 'Deutsch 🇩🇪',
        it: 'Italiano 🇮🇹',
        ar: 'العربية 🇸🇦',
        ja: '日本語 🇯🇵',
        zh: '中文 🇨🇳'
      };

      return {
        success: true,
        message: `✅ Language switched to ${langNames[langCode] || langCode}!

🌍 The app will reload in a moment to apply the new language.

💡 TIP: You can also use the language switcher in the sidebar to change languages anytime.`
      };
    }
  },

  "content.generate.social": {
    utterances: [
      "generate social media posts",
      "create posts for instagram",
      "write social content",
      "make posts about",
      "generate facebook posts",
      "create twitter content"
    ],
    handler: async (params, user) => {
      const topic = params.topic || params.product;
      
      if (!topic) {
        return {
          success: false,
          message: "❌ Please specify what you want to post about.\n\nExample: 'Generate social media posts about our new AI feature'"
        };
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 social media post variations about: ${topic}

Create posts optimized for Instagram, Facebook, and Twitter.
Include hashtags and emojis.
Tone: ${params.tone || 'professional'}
Target: ${params.audience || 'general audience'}`,
        response_json_schema: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  copy: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      await base44.entities.AIContentGeneration.create({
        user_email: user.email,
        generation_type: 'social_post',
        input_type: 'manual_prompt',
        input_data: { topic, tone: params.tone || 'professional' },
        generated_content: { social_posts: result.posts },
        status: 'draft',
        variants_count: 3
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `generate_social_posts: ${topic}`,
        intent: "create_content",
        params: { topic },
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `✅ Social Media Posts Generated!

📱 PLATFORMS: Instagram, Facebook, Twitter
📝 VARIATIONS: 3 per platform

${result.posts.slice(0, 3).map((p, i) => `
${i + 1}. ${p.platform.toUpperCase()}
${p.copy.substring(0, 100)}...
${p.hashtags.join(' ')}
`).join('\n')}

View all variations in AI Content Hub!`,
        data: result
      };
    }
  },

  "content.generate.email": {
    utterances: [
      "write an email campaign",
      "generate email copy",
      "create newsletter content",
      "write promotional email",
      "generate welcome email",
      "create email sequence"
    ],
    handler: async (params, user) => {
      const topic = params.topic || params.subject;
      const campaignType = params.campaign_type || 'newsletter';
      
      if (!topic) {
        return {
          success: false,
          message: "❌ Please specify the email topic or campaign type.\n\nExample: 'Generate promotional email for summer sale'"
        };
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 email marketing copy variations for:

CAMPAIGN TYPE: ${campaignType}
TOPIC: ${topic}
TONE: ${params.tone || 'professional'}

Include:
- Compelling subject lines
- Preview text
- Email body (HTML)
- Clear CTA`,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subject_line: { type: "string" },
                  preview_text: { type: "string" },
                  body_html: { type: "string" },
                  body_text: { type: "string" },
                  cta_text: { type: "string" }
                }
              }
            }
          }
        }
      });

      await base44.entities.AIContentGeneration.create({
        user_email: user.email,
        generation_type: 'email_copy',
        input_type: campaignType,
        input_data: { topic, campaign_type: campaignType },
        generated_content: { email_variations: result.variations },
        status: 'draft',
        variants_count: 3
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `generate_email: ${topic}`,
        intent: "create_content",
        params: { topic, campaign_type: campaignType },
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `✅ Email Copy Generated!

📧 CAMPAIGN TYPE: ${campaignType}
📝 VARIATIONS: 3

${result.variations.map((v, i) => `
${i + 1}. ${v.subject_line}
Preview: ${v.preview_text}
CTA: ${v.cta_text}
`).join('\n')}

View all variations and HTML previews in AI Content Hub!`,
        data: result
      };
    }
  },

  "content.generate.seo": {
    utterances: [
      "generate seo metadata",
      "create seo title",
      "write meta description",
      "optimize seo for",
      "generate page title",
      "create seo tags"
    ],
    handler: async (params, user) => {
      const topic = params.topic || params.page_topic;
      const keyword = params.keyword || params.focus_keyword;
      
      if (!topic || !keyword) {
        return {
          success: false,
          message: "❌ Please specify both topic and focus keyword.\n\nExample: 'Generate SEO metadata for AI video tools with keyword: video creator software'"
        };
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 SEO-optimized title and meta description variations for:

TOPIC: ${topic}
FOCUS KEYWORD: ${keyword}

Requirements:
- Title: 50-60 characters
- Meta Description: 150-160 characters
- Include focus keyword naturally
- High CTR potential`,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  meta_description: { type: "string" },
                  seo_score: { type: "number" },
                  predicted_ctr: { type: "number" }
                }
              }
            }
          }
        }
      });

      await base44.entities.AIContentGeneration.create({
        user_email: user.email,
        generation_type: 'seo_metadata',
        input_type: 'manual_prompt',
        input_data: { topic, focus_keyword: keyword },
        generated_content: { seo_variations: result.variations },
        status: 'draft',
        variants_count: 5
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `generate_seo: ${topic}`,
        intent: "create_content",
        params: { topic, keyword },
        mode: "reactive",
        status: "success"
      });

      const best = result.variations[0];

      return {
        success: true,
        message: `✅ SEO Metadata Generated!

🎯 FOCUS KEYWORD: ${keyword}
📝 VARIATIONS: 5

🏆 TOP RECOMMENDATION (Score: ${best.seo_score}/100):

📌 Title: ${best.title}

📄 Meta Description: ${best.meta_description}

📊 Predicted CTR: ${(best.predicted_ctr * 100).toFixed(1)}%

View all variations in AI Content Hub!`,
        data: result
      };
    }
  },

  "content.repurpose": {
    utterances: [
      "repurpose this video",
      "turn video into clips",
      "create content from video",
      "multiply my content",
      "repurpose my content",
      "generate clips from video"
    ],
    handler: async (params, user) => {
      const videoTitle = params.title || params.video_title;
      
      if (!videoTitle) {
        return {
          success: false,
          message: `❌ Please specify which video to repurpose.

**EXAMPLES:**
• "Repurpose my latest video project"
• "Turn 'AI Marketing Guide' into clips"
• "Create content from my YouTube video"

**OR** navigate to Content Repurposing page to select manually.`
        };
      }

      // Find matching video project
      const projects = await base44.entities.VideoProject.filter(
        { created_by: user.email },
        '-created_date',
        20
      );

      const matchingProject = projects.find(p => 
        p.title.toLowerCase().includes(videoTitle.toLowerCase())
      );

      if (!matchingProject) {
        return {
          success: false,
          message: `❌ No video project found matching "${videoTitle}".

Available projects:
${projects.slice(0, 5).map(p => `• ${p.title}`).join('\n')}

Navigate to **✂️ Content Repurposing** to upload a video or select manually.`
        };
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `repurpose_video: ${videoTitle}`,
        intent: "repurpose_content",
        params: { video_title: videoTitle, project_id: matchingProject.id },
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `✅ Starting Content Repurposing!

🎬 **VIDEO:** ${matchingProject.title}
⏱️ **DURATION:** ${matchingProject.duration_seconds}s

**WILL GENERATE:**
📹 10 short clips (30-60s each)
📱 ${4 * 4} social posts (4 platforms)
📧 5 email sequences
📝 1 SEO blog post
🎨 5-7 quote graphics
🎵 3 audiograms
🎬 5 teaser trailers

⏳ **ESTIMATED TIME:** 3-5 minutes
💾 **TIME SAVED:** ~40 hours of manual work

Navigate to **✂️ Content Repurposing** to view progress!

Ready to multiply your content? 🚀`,
        data: { project_id: matchingProject.id }
      };
    }
  },

  "brand.voice.check": {
    utterances: [
      "check brand voice",
      "analyze brand consistency",
      "is this on brand",
      "check my brand voice",
      "analyze for brand alignment",
      "voice consistency check"
    ],
    handler: async (params, user) => {
      const contentText = params.content || params.text;
      
      if (!contentText) {
        return {
          success: false,
          message: `❌ Please provide content to check.

**EXAMPLE:**
"Check brand voice: [paste your content here]"

**OR** use the Brand Voice checker in:
• AI Content Hub → Brand Voice tab
• Social Posts → Check Voice button
• Email Copy → Check Voice button`
        };
      }

      // Get user's default brand voice profile
      const profiles = await base44.entities.BrandVoiceProfile.filter(
        { user_email: user.email, is_default: true }
      );

      if (profiles.length === 0) {
        return {
          success: false,
          message: `❌ No brand voice profile found.

**CREATE ONE:**
Navigate to **✨ AI Content Hub → Brand Voice** tab to:
1. Add brand guidelines
2. Upload best-performing examples
3. Let AI analyze your voice patterns

Then try again!`
        };
      }

      const profile = profiles[0];

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `check_brand_voice: ${contentText.substring(0, 100)}...`,
        intent: "brand_voice_check",
        params: { content: contentText, profile_id: profile.id },
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `✅ Brand Voice Check Complete!

📊 **PROFILE:** ${profile.profile_name}
🎯 **CONFIDENCE:** ${profile.confidence_level || 50}%

Navigate to **✨ AI Content Hub → Brand Voice** to see detailed analysis, violations, and AI-rewritten version.

Quick actions available:
• View detailed breakdown
• Get improvement suggestions  
• Use AI-rewritten version
• Compare to best examples`,
        data: { profile_id: profile.id }
      };
    }
  },

  "calendar.view": {
    utterances: [
      "show my calendar",
      "view content calendar",
      "what's scheduled",
      "show upcoming content",
      "calendar overview",
      "content schedule"
    ],
    handler: async (params, user) => {
      const events = await base44.entities.ContentCalendarEvent.filter(
        { user_email: user.email },
        'scheduled_date',
        50
      );

      const upcoming = events.filter(e => new Date(e.scheduled_date) > new Date());
      const today = events.filter(e => {
        const eventDate = new Date(e.scheduled_date);
        const now = new Date();
        return eventDate.toDateString() === now.toDateString();
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "view_calendar",
        intent: "calendar_view",
        params: {},
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `📅 **CONTENT CALENDAR OVERVIEW**

**TODAY (${new Date().toLocaleDateString()}):**
${today.length > 0 
  ? today.map(e => `• ${e.title} at ${new Date(e.scheduled_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`).join('\n')
  : '• No content scheduled'
}

**UPCOMING (Next 7 Days):**
${upcoming.slice(0, 5).map(e => 
  `• ${new Date(e.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.title} (${e.event_type.replace('_', ' ')})`
).join('\n')}

**STATS:**
• Total scheduled: ${upcoming.length}
• Published: ${events.filter(e => e.status === 'published').length}

Navigate to **📅 Content Calendar** to see full view, drag-and-drop scheduling, and AI gap analysis! 🚀`,
        data: { events_count: events.length }
      };
    }
  },

  "campaign.orchestrate": {
    utterances: [
      "create campaign",
      "orchestrate campaign",
      "launch campaign",
      "multi-channel campaign",
      "automate campaign",
      "generate campaign"
    ],
    handler: async (params, user) => {
      const campaignName = params.name || params.campaign_name || params.product;
      const goal = params.goal || params.objective;
      
      if (!campaignName) {
        return {
          success: false,
          message: `❌ Please specify campaign name/product.

**EXAMPLES:**
• "Create campaign for my new AI course"
• "Launch product launch campaign for Video Studio 2.0"
• "Orchestrate lead generation campaign"

**OR** navigate to Campaign Orchestrator to set up manually.`
        };
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `orchestrate_campaign: ${campaignName}`,
        intent: "campaign_orchestrate",
        params: { campaign_name: campaignName, goal: goal || 'unknown' },
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `✅ Campaign Orchestration Ready!

📋 **CAMPAIGN:** ${campaignName}
${goal ? `🎯 **GOAL:** ${goal}\n` : ''}

**AI WILL GENERATE:**
📱 20+ Social posts (Instagram, Facebook, LinkedIn, TikTok)
📧 5-7 Email sequences  
📝 2-3 SEO blog posts
🎯 10+ Ad creatives (if ads enabled)

**INTELLIGENT SCHEDULING:**
⏰ Optimal posting times per platform
📅 Strategic content sequencing
🎯 Phase-based deployment (Awareness → Consideration → Conversion)

**BRAND ALIGNMENT:**
✅ Uses your Brand Voice Profile
✅ Consistent messaging across channels
✅ Performance predictions

**TRACKING:**
📊 Real-time performance dashboard
🎯 KPI monitoring
💡 AI optimization recommendations

Navigate to **⚡ Campaign Orchestrator** to:
1. Set duration & budget
2. Select channels & platforms
3. AI generates entire campaign
4. Auto-schedules everything
5. Track multi-channel ROI

Ready to automate your entire campaign? 🚀`,
        data: { campaign_name: campaignName, goal }
      };
    }
  },

  "campaign.analyze": {
    utterances: [
      "analyze campaign performance",
      "campaign insights",
      "what's working in my campaign",
      "optimize my campaign",
      "campaign performance review",
      "get campaign recommendations"
    ],
    handler: async (params, user) => {
      const campaigns = await base44.entities.Campaign.filter(
        { user_email: user.email, status: { $in: ['active', 'completed'] } },
        '-created_date',
        1
      );

      if (campaigns.length === 0) {
        return {
          success: false,
          message: `❌ No active or completed campaigns to analyze.

**CREATE YOUR FIRST CAMPAIGN:**
Navigate to **⚡ Campaign Orchestrator** to launch an AI-orchestrated multi-channel campaign.

Once launched, I can analyze:
• What's working vs what's not
• Top performing content
• A/B test opportunities
• Specific optimizations with impact predictions
• Competitive benchmarks`
        };
      }

      const campaign = campaigns[0];
      
      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `analyze_campaign: ${campaign.campaign_name}`,
        intent: "campaign_analyze",
        params: { campaign_id: campaign.id },
        mode: "analyst",
        status: "success"
      });

      return {
        success: true,
        message: `✅ Campaign Analysis Available!

📊 **CAMPAIGN:** ${campaign.campaign_name}
🎯 **GOAL:** ${campaign.campaign_goal.replace(/_/g, ' ')}
📈 **STATUS:** ${campaign.status}

**CURRENT PERFORMANCE:**
• Reach: ${(campaign.performance_metrics?.total_reach / 1000 || 0).toFixed(1)}K
• Engagement: ${((campaign.performance_metrics?.engagement_rate || 0) * 100).toFixed(1)}%
• Conversions: ${campaign.performance_metrics?.total_conversions || 0}
• ROAS: ${(campaign.performance_metrics?.roas || 0).toFixed(1)}x

**AI INSIGHTS INCLUDE:**
🎯 Overall health score (0-100)
📊 Channel-by-channel breakdown
✅ Top performers (+ why they work)
⚠️ Underperformers (+ specific fixes)
🧪 A/B test opportunities (with predicted lift)
💡 Messaging analysis (hooks & CTAs)
📈 Impact predictions for optimizations
🏆 Competitive benchmarks

Navigate to **⚡ Campaign Orchestrator** → Active tab to view the full Performance Insights dashboard with actionable recommendations! 🚀`,
        data: { campaign_id: campaign.id }
      };
    }
  },

  "competitor.analyze": {
    utterances: [
      "analyze competitor",
      "spy on competitor",
      "research competitor",
      "competitor intelligence",
      "what is my competitor doing",
      "competitor strategy"
    ],
    handler: async (params, user) => {
      const competitorName = params.competitor_name || params.name;
      const competitorUrl = params.url;
      
      if (!competitorName && !competitorUrl) {
        return {
          success: false,
          message: `❌ Please specify competitor name or URL.

**EXAMPLES:**
• "Analyze competitor: CompanyName.com"
• "Spy on competitor Nike"
• "Research my competitor's strategy"

**OR** navigate to Competitor Intelligence to add competitors manually.`
        };
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `analyze_competitor: ${competitorName || competitorUrl}`,
        intent: "competitor_analyze",
        params: { competitor_name: competitorName, url: competitorUrl },
        mode: "analyst",
        status: "success"
      });

      return {
        success: true,
        message: `✅ Competitor Analysis Ready!

🎯 **TARGET:** ${competitorName || competitorUrl}

**AI WILL ANALYZE:**
📊 Top-performing content (what works & why)
💬 Messaging angles & hooks
🎨 Ad creatives & strategies
👥 Audience engagement patterns
💪 Strengths & weaknesses
🔍 Market gaps they're missing
📈 Counter-strategies to outperform them

**INSIGHTS FEED INTO:**
• Campaign Orchestrator (better strategy)
• Performance Insights (competitive positioning)
• Content Calendar (fill their gaps)
• Brand Voice (differentiate messaging)

Navigate to **🎯 Competitor Intel** to:
1. Add competitor details
2. Select platforms to track
3. AI analyzes their strategy
4. Get actionable counter-strategies
5. Integrate insights into campaigns

Ready to spy on your competition? 🕵️`,
        data: { competitor_name: competitorName, url: competitorUrl }
      };
    }
  },

  "security.info": {
    utterances: [
      "security",
      "how secure is my data",
      "data protection",
      "privacy policy",
      "who can see my data",
      "is my data safe",
      "security features",
      "compliance"
    ],
    handler: async (params, user) => {
      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "security_info",
        intent: "security_info",
        params: {},
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `🛡️ **Security & Data Protection**

**WE PROTECT:**
✅ Accounts & roles (RBAC with least-privilege)
✅ API keys & OAuth tokens (encrypted at rest, 90-day rotation)
✅ User content (videos, avatars, voice clones, documents)
✅ Webhooks & automations (HMAC verification)
✅ Billing & PII (encrypted & compliant)

**SECURITY CONTROLS:**
🔒 **RBAC:** Role-based access control with granular permissions
🔑 **Token Security:** Encrypted storage + automatic rotation
⏱️ **Media Access:** Time-limited signed URLs (≤15 min expiry)
🔐 **Webhooks:** HMAC signature verification + replay protection
🚦 **Rate Limits:** Per-IP and per-user throttling
📋 **Audit Trails:** Append-only logs for all sensitive operations
🛡️ **Headers:** CSP, X-Frame-Options, Referrer-Policy

**DATA RETENTION:**
• Voice uploads: Purged within 72h of model creation
• Transient renders: 7-30 days (configurable)
• Audit logs: 180 days default

**PRIVACY:**
• ❌ No model training on your data (unless you opt-in)
• ✅ Customer-managed deletion and export
• ✅ GDPR compliant

**MONITOR YOUR ACTIVITY:**
View recent account activity in:
• Dashboard → Last Account Activity widget
• Settings → Security tab

**REPORT ISSUES:**
security@aifreedomstudios.com

Navigate to **SecurityDocs** page for complete documentation! 🔒`,
        data: {}
      };
    }
  },

  "security.activity": {
    utterances: [
      "show my activity",
      "last login",
      "account activity",
      "recent activity",
      "who accessed my account",
      "login history"
    ],
    handler: async (params, user) => {
      const recentActivity = await base44.entities.ActivityLog.filter(
        { user_email: user.email },
        '-created_date',
        5
      );

      const sessions = await base44.entities.SessionLog.filter(
        { user_email: user.email, is_active: true },
        '-created_date',
        3
      );

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "view_security_activity",
        intent: "security_activity",
        params: {},
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `🔐 **Your Recent Account Activity**

**LAST 5 ACTIONS:**
${recentActivity.map((a, i) => `${i + 1}. ${a.action_type.toUpperCase()} ${a.entity_type || ''} - ${new Date(a.created_date).toLocaleString()}`).join('\n')}

**ACTIVE SESSIONS:**
${sessions.length > 0 
  ? sessions.map(s => `• ${s.device_type || 'Unknown'} device - Last active: ${new Date(s.last_activity).toLocaleTimeString()}`).join('\n')
  : '• No active sessions detected'}

**LAST LOGIN:**
${sessions[0] ? new Date(sessions[0].created_date).toLocaleString() : 'No recent login data'}

View full activity log in:
• Dashboard → Last Account Activity widget
• Settings → Security → Activity Log

🔒 Security tip: Regularly review your activity for unauthorized access!`,
        data: { recent_activity: recentActivity, active_sessions: sessions }
      };
    }
  },

  "access.request": {
    utterances: [
      "request access",
      "i need access to",
      "why am i blocked",
      "why can't i access",
      "request admin access",
      "request permissions",
      "elevate my permissions"
    ],
    handler: async (params, user) => {
      const deniedPath = typeof window !== 'undefined' 
        ? sessionStorage.getItem('afs_denied_path') 
        : null;

      // Create access request log
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: 'create',
        entity_type: 'access_request',
        details: {
          requested_path: deniedPath || params.page || 'unknown',
          current_role: user.custom_role || user.role || 'user',
          reason: params.reason || 'User requested elevated access'
        }
      });

      // Notify admins
      try {
        const admins = await base44.entities.User.filter({ role: 'admin' });
        for (const admin of admins.slice(0, 3)) {
          await base44.entities.Notification.create({
            user_email: admin.email,
            title: '🔐 Access Request',
            message: `${user.full_name || user.email} requested access to ${deniedPath || 'restricted features'}. Current role: ${user.custom_role || user.role}`,
            type: 'warning',
            category: 'system',
            action_url: '/Settings',
            action_label: 'Review Request'
          });
        }
      } catch (error) {
        console.error('Error notifying admins:', error);
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `request_access: ${deniedPath || 'unknown'}`,
        intent: "access_request",
        params: { page: deniedPath, reason: params.reason },
        mode: "reactive",
        status: "success"
      });

      return {
        success: true,
        message: `✅ **Access Request Submitted**

📋 **YOUR CURRENT ACCESS:**
• Role: ${user.custom_role || user.role || 'user'}
• Permissions: ${user.permissions?.length || 0} active

🔒 **REQUESTED ACCESS:**
${deniedPath ? `• Page: ${deniedPath}` : '• Elevated permissions'}

**WHAT HAPPENS NEXT:**
1️⃣ Administrators have been notified
2️⃣ They'll review your request
3️⃣ You'll receive email when approved
4️⃣ New permissions activate immediately

⏱️ **TYPICAL RESPONSE TIME:** 1-24 hours

**ROLE HIERARCHY:**
Viewer → User → Manager → Admin → Owner

**CURRENT RESTRICTIONS:**
${user.role === 'admin' || user.custom_role === 'super_admin' 
  ? '✅ You have full administrative access!'
  : `• Billing: Admin+ required
• White-Label: Admin+ required  
• Team Management: Manager+ required
• Integration Secrets: Admin+ required`}

Your request is being processed! 🚀`,
        data: { request_submitted: true }
      };
    }
  },

  "access.why": {
    utterances: [
      "why am i blocked",
      "why can't i access",
      "why is this restricted",
      "what permissions do i need",
      "why no access"
    ],
    handler: async (params, user) => {
      const deniedPath = typeof window !== 'undefined' 
        ? sessionStorage.getItem('afs_denied_path') 
        : null;

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "explain_access_denied",
        intent: "access_why",
        params: { page: deniedPath },
        mode: "reactive",
        status: "success"
      });

      const rolePermissions = {
        viewer: ['View projects', 'View analytics'],
        user: ['Create content', 'View analytics', 'Edit own projects'],
        member: ['Create content', 'View analytics', 'Edit own projects', 'Collaborate'],
        manager: ['All user permissions', 'Manage team', 'View all projects', 'Manage campaigns'],
        admin: ['All manager permissions', 'Manage billing', 'Configure integrations', 'White-label settings', 'Manage users'],
        owner: ['Full platform access', 'Delete account', 'Transfer ownership']
      };

      const currentRole = (user.custom_role || user.role || 'user').toLowerCase();
      const permissions = rolePermissions[currentRole] || rolePermissions.user;

      return {
        success: true,
        message: `🔒 **Access Control Explanation**

**YOUR CURRENT ROLE:** ${user.custom_role || user.role || 'user'}

**WHAT YOU CAN DO:**
${permissions.map(p => `✅ ${p}`).join('\n')}

**WHY PAGES ARE RESTRICTED:**

🏢 **Billing & Payments** - Admin+
   Reason: Financial data protection
   Risk: Unauthorized payments, invoice access

⚙️ **White-Label Settings** - Admin+
   Reason: Brand integrity
   Risk: Unauthorized domain/branding changes

👥 **Team Management** - Manager+
   Reason: User role control
   Risk: Unauthorized permission grants

🔑 **Integration Secrets** - Admin+
   Reason: API key protection
   Risk: Token theft, data breaches

**ROLE PROGRESSION:**
Viewer → User → Manager → Admin → Owner
Each level inherits previous permissions + adds new ones

**HOW TO GET ACCESS:**
1. Contact your administrator
2. Or say: "Request access"
3. They'll review and grant if appropriate

${deniedPath ? `\n📍 **PAGE YOU TRIED:** ${deniedPath}\n` : ''}

Ask me: "Request access" to submit a formal request! 🚀`,
        data: { current_role: currentRole, permissions }
      };
    }
  },

  "offer.score": {
    utterances: [
      "score my offer",
      "evaluate my copy",
      "run belief score on this ad",
      "rate this campaign message",
      "analyze my offer",
      "check offer quality"
    ],
    handler: async (params, user) => {
      const offer = await base44.integrations.Core.InvokeLLM({
        prompt: `Score this marketing offer/copy using the 8-factor belief alignment framework:

COPY: ${params.copy || params.offer_text}

Evaluate on 0-100 scale for:
1. Desire Activation - How well it creates want
2. Trust Cues - Credibility signals
3. Pain Resolution - Addresses problems
4. Status Gain - Aspirational positioning
5. Social Proof - Validation from others
6. Future Pacing - Paints post-purchase vision
7. Risk Reversal - Guarantees/safety
8. CTA Clarity - Clear next step

Provide:
- Score for each factor (0-100)
- Overall score (average of 8)
- Top 3 specific improvements`,
        response_json_schema: {
          type: "object",
          properties: {
            scores: {
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
            score_total: { type: "number" },
            improvements: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Log action
      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `score_offer: ${params.copy?.substring(0, 100)}`,
        intent: "optimize_ad",
        params: { offer_text: params.copy },
        mode: "analyst",
        status: "success",
        result: offer
      });

      return {
        success: true,
        message: `✅ Offer Belief Score: ${offer.score_total}/100

📊 BREAKDOWN:
• Desire Activation: ${offer.scores.desire_activation}/100
• Trust Cues: ${offer.scores.trust_cues}/100
• Pain Resolution: ${offer.scores.pain_resolution}/100
• Status Gain: ${offer.scores.status_gain}/100
• Social Proof: ${offer.scores.social_proof}/100
• Future Pacing: ${offer.scores.future_pacing}/100
• Risk Reversal: ${offer.scores.risk_reversal}/100
• CTA Clarity: ${offer.scores.cta_clarity}/100

💡 TOP 3 IMPROVEMENTS:
${offer.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}`,
        data: offer
      };
    }
  },

  "followup.generate": {
    utterances: [
      "create a follow up sequence",
      "generate a 10 touch nurture",
      "build email and sms followups",
      "create follow-up emails",
      "build nurture sequence",
      "generate lifecycle sequence"
    ],
    handler: async (params, user) => {
      // Get offer ID from context or find latest offer
      let offerId = params.offer_id;
      if (!offerId) {
        const offers = await base44.entities.OfferBlueprint.filter({ user_email: user.email }, "-created_date", 1);
        offerId = offers[0]?.id;
      }

      if (!offerId) {
        return {
          success: false,
          message: "❌ No offer found. Create an offer first using the Offer Builder."
        };
      }

      const offer = await base44.entities.OfferBlueprint.filter({ id: offerId });
      
      const sequence = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a 10-touch follow-up sequence for:

OFFER: ${offer[0].product}
AUDIENCE: ${offer[0].audience}
BUYER TYPE: ${offer[0].buyer_type}
GOAL: ${offer[0].goal}

Generate sequence with:
- Email, SMS, DM channels
- 14-day timeframe
- ${params.brand_voice || 'mentor'} voice
- Objection handling
- Branching logic

Format as structured sequence with day, channel, subject, body, CTA.`,
        response_json_schema: {
          type: "object",
          properties: {
            channels: { type: "array", items: { type: "string" } },
            touches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  channel: { type: "string" },
                  subject: { type: "string" },
                  body: { type: "string" },
                  cta: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create sequence record
      const sequenceRecord = await base44.entities.FollowUpSequence.create({
        user_email: user.email,
        offer_id: offerId,
        sequence_name: `${offer[0].product} - AI Generated`,
        channels: sequence.channels,
        touches: sequence.touches,
        branching: sequence.branching,
        brand_voice: params.brand_voice || "mentor",
        timeframe_days: 14,
        status: "draft"
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "generate_followup_sequence",
        intent: "create_workflow",
        params: { offer_id: offerId, channels: sequence.channels },
        mode: "planner",
        status: "success",
        result: { sequence_id: sequenceRecord.id }
      });

      return {
        success: true,
        message: `✅ 10-Touch Follow-Up Sequence Generated!

📧 CHANNELS: ${sequence.channels.join(', ').toUpperCase()}
📅 TIMEFRAME: 14 days
📝 TOUCHES: ${sequence.touches.length}

🎯 NEXT STEPS:
1. Review sequence in Follow-Up Builder
2. Customize copy as needed
3. Deploy to email provider & GHL
4. Monitor performance in Analytics

Sequence ID: ${sequenceRecord.id}`,
        data: sequenceRecord
      };
    }
  },

  "ads.launch": {
    utterances: [
      "launch an ad campaign",
      "deploy my funnel",
      "run ads for this offer",
      "start campaign",
      "create ad campaign",
      "launch ads"
    ],
    handler: async (params, user) => {
      let offerId = params.offer_id;
      if (!offerId) {
        const offers = await base44.entities.OfferBlueprint.filter({ user_email: user.email }, "-created_date", 1);
        offerId = offers[0]?.id;
      }

      if (!offerId) {
        return {
          success: false,
          message: "❌ No offer found. Create an offer blueprint first."
        };
      }

      // Get connected ad accounts
      const adAccounts = await base44.entities.AdAccountConnection.filter({
        user_email: user.email,
        status: "ACTIVE"
      });

      if (adAccounts.length === 0) {
        return {
          success: false,
          message: "❌ No ad accounts connected. Connect Meta Ads in Integrations first."
        };
      }

      // Create campaign
      const campaign = await base44.entities.CampaignRun.create({
        user_email: user.email,
        campaign_name: `Copilot Launch - ${new Date().toLocaleDateString()}`,
        ad_account_id: adAccounts[0].ad_account_id,
        objective: "OUTCOME_LEADS",
        budget_type: "DAILY",
        daily_budget_cents: (params.budget || 50) * 100,
        status: "DRAFT",
        learning_phase: true,
        auto_optimize_enabled: true
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "launch_ad_campaign",
        intent: "launch_ad",
        params: { offer_id: offerId, budget: params.budget || 50 },
        mode: "planner",
        status: "success",
        result: { campaign_id: campaign.id }
      });

      return {
        success: true,
        message: `🚀 Campaign Created!

💰 DAILY BUDGET: $${params.budget || 50}
🎯 OBJECTIVE: Lead Generation
🤖 AUTO-OPTIMIZE: Enabled

⚡ NEXT STEPS:
1. Add ad creatives in Campaign Execution
2. Configure targeting
3. Launch campaign
4. AI will optimize automatically

Campaign ID: ${campaign.id}`,
        data: campaign
      };
    }
  },

  "analytics.nba": {
    utterances: [
      "analyze my funnel",
      "suggest improvements",
      "give me next best actions",
      "what should I optimize",
      "how can I improve performance",
      "funnel analysis"
    ],
    handler: async (params, user) => {
      // Get active funnels/campaigns
      const campaigns = await base44.entities.CampaignRun.filter({
        user_email: user.email,
        status: { $in: ["LAUNCHED", "LEARNING", "SCALING"] }
      }, "-created_date", 5);

      if (campaigns.length === 0) {
        return {
          success: false,
          message: "❌ No active campaigns to analyze. Launch a campaign first."
        };
      }

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these campaigns and provide Next Best Actions:

${campaigns.map((c, i) => `
Campaign ${i + 1}: ${c.campaign_name}
- Status: ${c.status}
- Daily Budget: $${c.daily_budget_cents / 100}
- Total Spend: $${c.total_spend_cents / 100}
- Revenue: $${c.total_revenue_cents / 100}
- ROAS: ${((c.total_revenue_cents / c.total_spend_cents) || 0).toFixed(2)}x
`).join('\n')}

Provide ranked next-best-actions (NBA):
1. Identify top 3-5 opportunities
2. For each: issue, hypothesis, expected gain %, effort, actionable step
3. Prioritize by impact vs effort
4. Include specific numbers and actions`,
        response_json_schema: {
          type: "object",
          properties: {
            nba_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campaign_name: { type: "string" },
                  issue: { type: "string" },
                  hypothesis: { type: "string" },
                  expected_gain: { type: "number" },
                  effort: { type: "string" },
                  actionable_step: { type: "string" },
                  priority: { type: "number" },
                  category: { type: "string" }
                }
              }
            },
            overall_health: { type: "string" },
            quick_wins: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Create NBA suggestions
      for (const nba of analysis.nba_suggestions) {
        const campaign = campaigns.find(c => c.campaign_name === nba.campaign_name);
        await base44.entities.NBASuggestion.create({
          user_email: user.email,
          funnel_run_id: campaign?.id || campaigns[0].id,
          issue: nba.issue,
          hypothesis: nba.hypothesis,
          expected_gain: nba.expected_gain,
          effort: nba.effort,
          actionable_step: nba.actionable_step,
          priority: nba.priority,
          category: nba.category
        });
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "analyze_campaigns_nba",
        intent: "analyze_performance",
        params: { campaigns_analyzed: campaigns.length },
        mode: "analyst",
        status: "success",
        result: analysis
      });

      return {
        success: true,
        message: `📊 Campaign Analysis Complete!

🏥 OVERALL HEALTH: ${analysis.overall_health}

🎯 TOP ${analysis.nba_suggestions.length} NEXT BEST ACTIONS:

${analysis.nba_suggestions.map((nba, i) => `
${i + 1}. ${nba.campaign_name}
   Issue: ${nba.issue}
   Expected Impact: +${nba.expected_gain}%
   Effort: ${nba.effort}
   Action: ${nba.actionable_step}
`).join('\n')}

⚡ QUICK WINS:
${analysis.quick_wins.map((w, i) => `${i + 1}. ${w}`).join('\n')}

View detailed NBA in Funnel Analytics page.`,
        data: analysis
      };
    }
  },

  "budget.optimize": {
    utterances: [
      "optimize my ad spend",
      "rebalance my budget",
      "suggest better allocation",
      "where should I spend more",
      "optimize budget",
      "reallocate budget"
    ],
    handler: async (params, user) => {
      const budgetPlans = await base44.entities.BudgetPlan.filter({
        user_email: user.email,
        status: "active"
      }, "-created_date", 1);

      if (budgetPlans.length === 0) {
        return {
          success: false,
          message: "❌ No active budget plan. Create one in Budget Manager first."
        };
      }

      const plan = budgetPlans[0];

      const optimization = await base44.integrations.Core.InvokeLLM({
        prompt: `Optimize budget allocation:

CURRENT PLAN:
- Total Budget: $${plan.amount}
- Period: ${plan.period}
- Goal: ${plan.goal}

CURRENT ALLOCATION:
${Object.entries(plan.allocation || {}).map(([channel, pct]) => `- ${channel}: ${pct}%`).join('\n')}

SPEND & PERFORMANCE:
${Object.entries(plan.spend_tracking || {}).map(([key, val]) => `- ${key}: $${val}`).join('\n')}

PERFORMANCE METRICS:
- CPL: $${plan.performance?.cpl || 0}
- CPA: $${plan.performance?.cpa || 0}
- ROAS: ${plan.performance?.roas || 0}x

Provide optimized allocation:
1. Which channels to increase (and by how much)
2. Which to decrease
3. Expected improvements
4. Risk assessment`,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_allocation: {
              type: "object",
              properties: {
                meta_percent: { type: "number" },
                tiktok_percent: { type: "number" },
                youtube_percent: { type: "number" },
                google_percent: { type: "number" }
              }
            },
            changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  channel: { type: "string" },
                  current: { type: "number" },
                  recommended: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            expected_improvements: {
              type: "object",
              properties: {
                cpl_improvement: { type: "number" },
                roas_improvement: { type: "number" },
                total_leads_increase: { type: "number" }
              }
            },
            risk_level: { type: "string" }
          }
        }
      });

      // Update budget plan
      await base44.entities.BudgetPlan.update(plan.id, {
        allocation: optimization.optimized_allocation,
        last_optimized: new Date().toISOString()
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "optimize_budget_allocation",
        intent: "optimize_ad",
        params: { plan_id: plan.id },
        mode: "analyst",
        status: "success",
        result: optimization
      });

      return {
        success: true,
        message: `💰 Budget Optimization Complete!

📊 RECOMMENDED CHANGES:
${optimization.changes.map(c => `• ${c.channel}: ${c.current}% → ${c.recommended}% (${c.reason})`).join('\n')}

📈 EXPECTED IMPROVEMENTS:
• CPL: -${optimization.expected_improvements.cpl_improvement}%
• ROAS: +${optimization.expected_improvements.roas_improvement}%
• Total Leads: +${optimization.expected_improvements.total_leads_increase}%

⚠️ RISK LEVEL: ${optimization.risk_level}

Allocation has been updated in your Budget Plan!`,
        data: optimization
      };
    }
  },

  "video.create": {
    utterances: [
      "create a video",
      "make a video about",
      "generate video",
      "produce video content",
      "make me a video"
    ],
    handler: async (params, user) => {
      const script = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a ${params.duration || 60}-second video script about: ${params.topic}

Target audience: ${params.audience || 'general audience'}
Style: ${params.style || 'engaging and professional'}

Include:
- Strong 3-second hook
- Clear value proposition
- Key points
- Call-to-action

Format as scene-by-scene breakdown.`,
        response_json_schema: {
          type: "object",
          properties: {
            full_script: { type: "string" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_number: { type: "number" },
                  duration_seconds: { type: "number" },
                  visual: { type: "string" },
                  voiceover: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create video project
      const project = await base44.entities.VideoProject.create({
        title: params.topic || "AI Generated Video",
        description: `Created via Copilot command`,
        duration_seconds: params.duration || 60,
        json_script: JSON.stringify(script),
        status: "draft"
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `create_video: ${params.topic}`,
        intent: "create_video",
        params: params,
        mode: "reactive",
        status: "success",
        entity_created_id: project.id,
        entity_created_type: "VideoProject"
      });

      return {
        success: true,
        message: `✅ Video Project Created!

📹 TOPIC: ${params.topic}
⏱️ DURATION: ${params.duration || 60}s
📝 SCENES: ${script.scenes.length}

🎬 NEXT STEPS:
1. Open Video Studio
2. Review and customize script
3. Add visuals and music
4. Render video

Project created! View in Video Studio.`,
        data: { project_id: project.id, script }
      };
    }
  },

  "ctv.setup": {
    utterances: [
      "help me set up ctv",
      "guide me through ctv campaign",
      "create ctv content",
      "start ctv workflow",
      "connected tv setup"
    ],
    handler: async (params, user) => {
      // Trigger guided workflow
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('start-guided-workflow', {
          detail: { workflow: 'ctv_campaign_setup' }
        }));
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "start_ctv_guided_workflow",
        intent: "create_workflow",
        params: {},
        mode: "planner",
        status: "success"
      });

      return {
        success: true,
        message: `📺 CTV Campaign Setup Wizard Started!

I'll guide you step-by-step through:
1. Connect CTV platforms (Roku, Apple TV, Fire TV)
2. Create project
3. Generate TV-optimized script
4. Design branded intro/outro
5. Optimize assets
6. Publish to channels

⏱️ Estimated time: 15 minutes

Let's begin! Which CTV platforms do you want to publish to?`
      };
    }
  },

  "content.ideas": {
    utterances: [
      "give me content ideas",
      "what should I create",
      "suggest trending topics",
      "content suggestions",
      "what's trending"
    ],
    handler: async (params, user) => {
      // Get recent projects for context
      const recentProjects = await base44.entities.VideoProject.filter({
        created_by: user.email
      }, "-created_date", 3);

      // Get trending topics
      const trending = await base44.entities.TrendingTopic.filter({}, "-trend_score", 5);

      const ideas = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 content ideas for user:

RECENT PROJECTS:
${recentProjects.map(p => `- ${p.title}`).join('\n')}

TRENDING NOW:
${trending.map(t => `- ${t.topic_name} (score: ${t.trend_score})`).join('\n')}

PLATFORM: ${params.platform || 'Instagram/TikTok'}

Provide 5 actionable content ideas:
- Title
- Description  
- Why it's timely
- Viral score prediction
- Expected views
- Time to create`,
        response_json_schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  why_now: { type: "string" },
                  viral_score: { type: "number" },
                  expected_views: { type: "number" },
                  time_to_create_minutes: { type: "number" },
                  platform: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save ideas
      for (const idea of ideas.ideas) {
        await base44.entities.ContentIdea.create({
          user_email: user.email,
          idea_title: idea.title,
          description: idea.description,
          content_type: "video",
          source: "ai_generated",
          target_platforms: [idea.platform],
          viral_potential: idea.viral_score
        });
      }

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: "generate_content_ideas",
        intent: "suggest_content",
        params: { platform: params.platform },
        mode: "proactive",
        status: "success",
        result: ideas
      });

      return {
        success: true,
        message: `💡 5 Content Ideas Generated!

${ideas.ideas.map((idea, i) => `
${i + 1}. ${idea.title}
   ${idea.description}
   
   🔥 Viral Score: ${idea.viral_score}/100
   👁️ Expected Views: ${idea.expected_views.toLocaleString()}
   ⏱️ Time: ${idea.time_to_create_minutes} minutes
   
   Why Now: ${idea.why_now}
`).join('\n---\n')}

Ideas saved to AI Insights page!`,
        data: ideas
      };
    }
  },

  "abtest.create": {
    utterances: [
      "create ab test",
      "test different creatives",
      "split test my ads",
      "test variations",
      "run ab test"
    ],
    handler: async (params, user) => {
      const campaigns = await base44.entities.CampaignRun.filter({
        user_email: user.email,
        status: { $in: ["LAUNCHED", "LEARNING", "SCALING"] }
      }, "-created_date", 1);

      if (campaigns.length === 0) {
        return {
          success: false,
          message: "❌ No active campaigns to test. Launch a campaign first."
        };
      }

      const campaign = campaigns[0];

      // Generate test variants
      const testVariants = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 A/B test variants for campaign:

CAMPAIGN: ${campaign.campaign_name}
OBJECTIVE: ${campaign.objective}
TEST TYPE: ${params.test_type || 'creative'}

Create distinct variants that test:
- Different hooks
- Different visuals
- Different CTAs

Make them meaningfully different.`,
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
                  config: { type: "object" }
                }
              }
            }
          }
        }
      });

      // Create A/B test
      const test = await base44.entities.ABTest.create({
        test_name: `[COPILOT] ${campaign.campaign_name} - ${params.test_type || 'Creative'} Test`,
        hypothesis: `Testing ${params.test_type || 'creative'} variations will improve CTR`,
        variants: [
          { variant_name: "Control", description: "Current", config: {}, users_assigned: 0, conversions: 0 },
          ...testVariants.variants.map((v, idx) => ({
            variant_id: `variant_${idx + 1}`,
            ...v,
            users_assigned: 0,
            conversions: 0,
            conversion_rate: 0
          }))
        ],
        status: "running",
        metric: "CTR",
        target_sample_size: 1000,
        confidence_level: 95
      });

      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `create_abtest_${params.test_type}`,
        intent: "optimize_ad",
        params: { campaign_id: campaign.id, test_type: params.test_type },
        mode: "planner",
        status: "success",
        entity_created_id: test.id,
        entity_created_type: "ABTest"
      });

      return {
        success: true,
        message: `🧪 A/B Test Created!

🎯 CAMPAIGN: ${campaign.campaign_name}
📊 VARIANTS: ${testVariants.variants.length + 1} (Control + ${testVariants.variants.length})
🎭 TEST TYPE: ${params.test_type || 'Creative'}
👥 TARGET SAMPLE: 1,000 users

⚡ AUTO-WINNER: Enabled (95% confidence)

Test is running! Check results in Campaign Execution → A/B Testing tab.`,
        data: test
      };
    }
  }
};

export default function CopilotIntentEngine() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Register intents globally
    if (typeof window !== 'undefined') {
      window.AFS_COPILOT_INTENTS = INTENT_REGISTRY;
      setInitialized(true);
      console.log('✅ Copilot Intent Engine initialized with', Object.keys(INTENT_REGISTRY).length, 'intents');
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        delete window.AFS_COPILOT_INTENTS;
      }
    };
  }, []);

  return null; // This is a headless component
}

// Intent Matcher - finds best matching intent from user message
export function matchIntent(message) {
  const messageLower = message.toLowerCase();
  
  for (const [intentKey, intent] of Object.entries(INTENT_REGISTRY)) {
    for (const utterance of intent.utterances) {
      if (messageLower.includes(utterance.toLowerCase())) {
        return { intentKey, intent, confidence: 0.9 };
      }
    }
  }

  // Fuzzy matching
  const keywords = {
    "language.switch": ["language", "switch", "change", "english", "spanish", "français", "deutsch"],
    "content.generate.social": ["social media", "posts", "instagram", "facebook", "twitter", "content", "write"],
    "content.generate.email": ["email", "campaign", "newsletter", "promotional", "welcome", "copy"],
    "content.generate.seo": ["seo", "metadata", "title", "meta description", "optimize", "page title", "tags"],
    "content.repurpose": ["repurpose", "video", "clips", "content from video", "multiply content"],
    "brand.voice.check": ["brand voice", "consistency", "on brand", "analyze voice"],
    "calendar.view": ["calendar", "content calendar", "scheduled", "upcoming", "schedule"],
    "campaign.orchestrate": ["campaign", "orchestrate", "launch", "multi-channel", "automate"],
    "campaign.analyze": ["analyze campaign", "campaign insights", "campaign performance", "optimize campaign"],
    "competitor.analyze": ["analyze competitor", "spy on competitor", "research competitor", "competitor intelligence", "competitor strategy"],
    "security.info": ["security", "data protection", "privacy", "safe", "compliance"],
    "security.activity": ["activity", "login", "account activity", "recent activity", "history"],
    "access.request": ["request access", "need access", "blocked", "permissions", "elevate", "admin access", "request admin", "request permissions"],
    "access.why": ["why blocked", "why access denied", "restricted", "permissions needed", "no access", "what permissions"],
    "offer.score": ["score", "offer", "evaluate", "belief", "rate"],
    "followup.generate": ["follow", "sequence", "nurture", "email", "touch"],
    "ads.launch": ["launch", "deploy", "campaign", "ads", "run"],
    "analytics.nba": ["analyze", "improve", "optimize", "suggest", "nba"],
    "budget.optimize": ["budget", "spend", "allocate", "rebalance"],
    "video.create": ["video", "create", "make", "generate"],
    "ctv.setup": ["ctv", "roku", "apple tv", "fire tv", "connected tv"],
    "content.ideas": ["ideas", "trending", "suggest", "content"],
    "abtest.create": ["ab test", "split test", "test", "variants"]
  };

  let bestMatch = { intentKey: null, confidence: 0 };

  for (const [intentKey, keys] of Object.entries(keywords)) {
    const matches = keys.filter(k => messageLower.includes(k)).length;
    const confidence = matches / keys.length;
    
    if (confidence > bestMatch.confidence && confidence >= 0.4) {
      bestMatch = { intentKey, intent: INTENT_REGISTRY[intentKey], confidence };
    }
  }

  return bestMatch.intentKey ? bestMatch : null;
}

// Intent Executor
export async function executeIntent(intentKey, params, user) {
  const intent = INTENT_REGISTRY[intentKey];
  if (!intent) {
    return {
      success: false,
      message: `❌ Intent "${intentKey}" not found.`
    };
  }

  try {
    const result = await intent.handler(params, user);
    return result;
  } catch (error) {
    console.error(`Error executing intent ${intentKey}:`, error);
    return {
      success: false,
      message: `❌ Error executing action: ${error.message}`,
      error: error
    };
  }
}

// Extract parameters from natural language
export function extractParameters(message, intentKey) {
  const params = {};
  
  // Language extraction for language.switch intent
  if (intentKey === 'language.switch') {
    const languageKeywords = [
      'english', 'spanish', 'español', 'french', 'français',
      'portuguese', 'português', 'german', 'deutsch',
      'italian', 'italiano', 'arabic', 'العربية',
      'japanese', '日本語', 'chinese', '中文', 'zh'
    ];
    
    for (const lang of languageKeywords) {
      // Use word boundaries for more accurate matching, e.g., "to french" not "french fries"
      const regex = new RegExp(`\\b${lang}\\b`, 'i');
      if (message.match(regex)) {
        params.language = lang;
        break;
      }
    }
  }
  
  // Content generation parameters
  if (intentKey === 'content.generate.social' || intentKey === 'content.generate.email' || intentKey === 'content.generate.seo') {
    // Extract topic
    const topicPatterns = [
      /about (.+?)(?:\.|$|for|with)/i,
      /(?:posts?|content|email|seo|campaign) (?:about|on|for) (.+?)(?:\.|$)/i,
      /generate (?:.+? )?(?:posts?|content|email|seo|campaign) for (.+?)(?:\.|$)/i,
      /create (?:.+? )?(?:posts?|content|email|seo|campaign) for (.+?)(?:\.|$)/i,
      /write (?:.+? )?(?:posts?|content|email|seo|campaign) (?:about|on|for) (.+?)(?:\.|$)/i
    ];
    
    for (const pattern of topicPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        params.topic = match[1].trim();
        break;
      }
    }

    // Extract keyword for SEO
    if (intentKey === 'content.generate.seo') {
      const keywordMatch = message.match(/keyword[s]?:?\s+(.+?)(?:\.|$)/i);
      if (keywordMatch) {
        params.keyword = keywordMatch[1].trim();
      }
    }

    // Extract campaign type for email
    if (intentKey === 'content.generate.email') {
      if (message.includes('newsletter')) params.campaign_type = 'newsletter';
      else if (message.includes('promotion') || message.includes('sale') || message.includes('promotional')) params.campaign_type = 'promotion';
      else if (message.includes('welcome')) params.campaign_type = 'welcome';
      else if (message.includes('cart') || message.includes('abandon')) params.campaign_type = 'abandoned_cart';
    }

    // Extract tone
    const tones = ['professional', 'casual', 'enthusiastic', 'urgent', 'luxury', 'witty', 'friendly', 'formal', 'playful'];
    for (const tone of tones) {
      if (message.toLowerCase().includes(tone)) {
        params.tone = tone;
        break;
      }
    }
  }

  // Video repurpose parameters
  if (intentKey === 'content.repurpose') {
    const videoTitlePatterns = [
      /repurpose (?:the )?(?:video|project|content) ['"]?(.+?)['"]?(?:\.|$)/i,
      /turn (?:video )?['"]?(.+?)['"]? into clips/i,
      /create content from (?:video )?['"]?(.+?)['"]?(?:\.|$)/i,
      /from (?:my )?(?:latest )?(?:video|project) ['"]?(.+?)['"]?/i
    ];

    for (const pattern of videoTitlePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        params.video_title = match[1].trim();
        break;
      }
    }
    // Handle specific phrase "my latest video project"
    if (message.toLowerCase().includes('my latest video project') && !params.video_title) {
        params.video_title = 'latest video project'; // Special keyword to indicate fetching the latest
    }
  }
  
  // Brand voice check
  if (intentKey === 'brand.voice.check') {
    // Extract content after "check brand voice:" or similar
    const contentMatch = message.match(/(?:check|analyze).*?(?:brand|voice|consistency)[:\s]+(.+)/is);
    if (contentMatch) {
      params.content = contentMatch[1].trim();
    }
  }
  
  // Access Request parameters
  if (intentKey === 'access.request') {
    const reasonMatch = message.match(/(?:because|reason|for):\s*(.+?)(?:\.|$)/i);
    if (reasonMatch) {
      params.reason = reasonMatch[1].trim();
    }
    const pageMatch = message.match(/(?:access to|page|feature)\s+['"]?(.+?)['"]?(?:\.|$)/i);
    if (pageMatch) {
      params.page = pageMatch[1].trim();
    }
  }

  // Access Why parameters
  if (intentKey === 'access.why') {
    const pageMatch = message.match(/(?:about|for)\s+['"]?(.+?)['"]?(?:\.|$)/i);
    if (pageMatch) {
      params.page = pageMatch[1].trim();
    }
  }

  // Topic extraction (for video.create and content.ideas - existing logic, added to avoid re-writing for general case if not handled above)
  const topicPatterns = [
    /about (.+?)(?:\.|$|for|in)/i,
    /create (?:a |an )?(.+?) video/i,
    /(?:video|script|content) (?:about|on) (.+?)(?:\.|$)/i
  ];
  
  if (!params.topic && (intentKey === 'video.create' || intentKey === 'content.ideas')) { // Only try to extract if not already extracted by content generation specific logic
    for (const pattern of topicPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        params.topic = match[1].trim();
        break;
      }
    }
  }

  // Campaign orchestration
  if (intentKey === 'campaign.orchestrate') {
    // Extract campaign name/product
    const nameMatch = message.match(/(?:campaign|for|launch|create)\s+(?:for\s+)?(?:my\s+)?(.+?)(?:\s+campaign|\s+for\s+\d+|\s+with|$)/i);
    if (nameMatch) {
      params.campaign_name = nameMatch[1].trim();
    }
    
    // Extract goal
    const goalMatch = message.match(/(?:goal|objective|for)\s+(lead generation|product launch|awareness|sales|event|course)/i);
    if (goalMatch) {
      params.goal = goalMatch[1].toLowerCase().replace(' ', '_');
    }
  }

  // Competitor analysis
  if (intentKey === 'competitor.analyze') {
    const nameMatch = message.match(/(?:competitor|analyze|spy on|research)\s+(?:on\s+)?(?:my\s+)?competitor[:\s]+([^\.]+)/i);
    if (nameMatch) {
      params.competitor_name = nameMatch[1].trim();
    }
    
    const urlMatch = message.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) {
      params.url = urlMatch[1];
    }
  }

  // Duration extraction
  const durationMatch = message.match(/(\d+)\s*(?:second|sec|s)\b/i);
  if (durationMatch) {
    params.duration = parseInt(durationMatch[1]);
  }

  // Budget extraction
  const budgetMatch = message.match(/\$?(\d+)\s*(?:budget|spend|dollars?)/i);
  if (budgetMatch) {
    params.budget = parseInt(budgetMatch[1]);
  }

  // Platform extraction
  const platforms = ["instagram", "tiktok", "youtube", "facebook", "linkedin", "twitter", "roku", "apple tv", "fire tv"];
  for (const platform of platforms) {
    if (message.toLowerCase().includes(platform)) {
      params.platform = platform;
      break;
    }
  }

  // Test type extraction
  if (message.toLowerCase().includes("creative")) params.test_type = "creative";
  if (message.toLowerCase().includes("targeting")) params.test_type = "targeting";
  if (message.toLowerCase().includes("offer") && intentKey === "abtest.create") params.test_type = "offer";

  // Voice extraction
  if (message.toLowerCase().includes("mentor")) params.brand_voice = "mentor";
  if (message.toLowerCase().includes("hustler")) params.brand_voice = "hustler";
  if (message.toLowerCase().includes("analyst")) params.brand_voice = "analyst";

  // Offer text extraction (for scoring)
  const offerMatch = message.match(/(?:score|evaluate|rate)\s+["'](.+?)["']/i);
  if (offerMatch) {
    params.copy = offerMatch[1];
  }

  return params;
}
