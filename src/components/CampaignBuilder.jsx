
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Loader2,
  Target,
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  CheckCircle2,
  Share2, // Added for channels
  Mail, // Added for channels
  FileText // Added for channels
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CampaignBuilder({ user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_goal: 'product_launch',
    description: '',
    target_audience: '',
    key_message: '',
    duration_days: 14,
    start_date: '',
    channels: ['social', 'email'],
    platforms: ['instagram', 'facebook', 'linkedin'],
    budget_usd: 1000,
    content_plan: {
      social_posts_count: 20,
      emails_count: 5,
      blog_posts_count: 2,
      ad_creatives_count: 10
    }
  });

  const [orchestrationProgress, setOrchestrationProgress] = useState(null);

  const { data: brandVoiceProfiles = [] } = useQuery({
    queryKey: ['brandVoiceProfiles', user?.email],
    queryFn: () => base44.entities.BrandVoiceProfile.filter(
      { user_email: user.email }
    ),
    enabled: !!user
  });

  const { data: competitorReports = [] } = useQuery({
    queryKey: ['competitorReports', user?.email],
    queryFn: () => base44.entities.CompetitorAnalysisReport.filter(
      { user_email: user.email },
      '-analysis_date',
      5 // Limit to 5 most recent reports
    ),
    enabled: !!user
  });

  const defaultBrandVoice = brandVoiceProfiles.find(p => p.is_default);
  const latestCompetitorReport = competitorReports[0];

  const orchestrateCampaignMutation = useMutation({
    mutationFn: async (data) => {
      setOrchestrationProgress({ stage: 'planning', progress: 5 });

      // Step 1: Create campaign
      const campaign = await base44.entities.Campaign.create({
        ...data,
        user_email: user.email,
        brand_voice_profile_id: defaultBrandVoice?.id,
        status: 'generating_content',
        generation_progress: 5
      });

      setOrchestrationProgress({ stage: 'planning', progress: 10, campaignId: campaign.id });

      // Step 2: AI generates campaign strategy (with competitor insights)
      const strategyResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a campaign orchestration AI. Design a complete ${data.duration_days}-day ${data.campaign_goal} campaign.

CAMPAIGN BRIEF:
• Goal: ${data.campaign_goal}
• Product/Service: ${data.campaign_name}
• Description: ${data.description}
• Target Audience: ${data.target_audience}
• Key Message: ${data.key_message}
• Duration: ${data.duration_days} days
• Channels: ${data.channels.join(', ')}
• Platforms: ${data.platforms.join(', ')}
• Budget: $${data.budget_usd}

CONTENT PLAN:
• Social Posts: ${data.content_plan.social_posts_count}
• Emails: ${data.content_plan.emails_count}
• Blog Posts: ${data.content_plan.blog_posts_count}
• Ad Creatives: ${data.content_plan.ad_creatives_count}

${latestCompetitorReport ? `
COMPETITOR INTELLIGENCE:
• Competitor Strategy Score: ${latestCompetitorReport.overall_strategy_score}/100

${latestCompetitorReport.competitor_strengths?.length > 0 ? `COMPETITOR STRENGTHS TO AVOID:
${latestCompetitorReport.competitor_strengths?.slice(0, 3).map(s => `• ${s.strength} (${s.category})`).join('\n')}` : ''}

${latestCompetitorReport.competitor_weaknesses?.length > 0 ? `COMPETITOR WEAKNESSES TO EXPLOIT:
${latestCompetitorReport.competitor_weaknesses?.slice(0, 3).map(w => `• ${w.weakness} - HOW: ${w.how_to_exploit}`).join('\n')}` : ''}

${latestCompetitorReport.market_gaps?.length > 0 ? `MARKET GAPS TO FILL:
${latestCompetitorReport.market_gaps?.slice(0, 3).map(g => `• ${g.gap_type}: ${g.description}\n  Approach: ${g.suggested_approach}`).join('\n')}` : ''}

${latestCompetitorReport.differentiation_strategies?.length > 0 ? `DIFFERENTIATION STRATEGIES TO USE:
${latestCompetitorReport.differentiation_strategies?.slice(0, 2).map(d => `• ${d.strategy_name}: ${d.how_to_position}\n  Angles: ${d.messaging_angles?.join(', ')}`).join('\n')}` : ''}

${latestCompetitorReport.messaging_analysis?.top_hooks?.length > 0 ? `THEIR TOP HOOKS (AVOID COPYING, BEAT THEM):
${latestCompetitorReport.messaging_analysis?.top_hooks?.slice(0, 3).map(h => `• ${h.hook_text}`).join('\n')}` : ''}

${latestCompetitorReport.messaging_analysis?.top_ctas?.length > 0 ? `THEIR TOP CTAS (DIFFERENTIATE FROM THESE):
${latestCompetitorReport.messaging_analysis?.top_ctas?.slice(0, 3).map(c => `• ${c.cta_text}`).join('\n')}` : ''}

**IMPORTANT**: Use competitor insights to create a SUPERIOR campaign that:
1. Fills their gaps
2. Exploits their weaknesses
3. Differentiates messaging
4. Takes different angles
5. Provides more value
` : ''}

TASKS:

1. CAMPAIGN PHASES:
   Break campaign into 3-4 strategic phases (e.g., Awareness, Consideration, Conversion)
   ${latestCompetitorReport ? 'INCORPORATE: Differentiation strategies from competitor analysis' : ''}
   For each phase:
   - Start/end days
   - Primary objective
   - Tactics (incorporate gap-filling and differentiation)
   - KPIs

2. CONTENT THEMES:
   Generate 5-7 content themes for variety across campaign
   ${latestCompetitorReport ? 'ENSURE: Themes address competitor weaknesses and market gaps' : ''}

3. HOOKS & ANGLES:
   Create 10 different hooks/angles to test across content
   ${latestCompetitorReport ? 'REQUIREMENT: Hooks must be DIFFERENT from competitor top hooks, but better' : ''}

4. ORCHESTRATION SCHEDULE:
   Map out exactly when each piece of content should go live
   - Day number
   - Channel (social/email/blog/ads)
   - Content type
   - Platform
   - Optimal posting time
   - Strategic reasoning
   ${latestCompetitorReport ? '- Competitive advantage (how this beats competitor)' : ''}

5. KPIs:
   Set specific targets for:
   - Reach
   - Engagement rate ${latestCompetitorReport?.content_analysis?.posting_patterns?.content_mix ? `(target HIGHER than competitor's average)` : `(target high)`}
   - Leads/conversions
   - Revenue (if applicable)

Format as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            campaign_phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase_name: { type: "string" },
                  start_day: { type: "number" },
                  end_day: { type: "number" },
                  objective: { type: "string" },
                  tactics: { type: "array", items: { type: "string" } },
                  kpis: { type: "array", items: { type: "string" } }
                }
              }
            },
            content_themes: { type: "array", items: { type: "string" } },
            hooks_and_angles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hook: { type: "string" },
                  angle: { type: "string" },
                  target_segment: { type: "string" }
                }
              }
            },
            orchestration_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  channel: { type: "string" },
                  content_type: { type: "string" },
                  platform: { type: "string" },
                  scheduled_time: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            },
            kpis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric_name: { type: "string" },
                  target_value: { type: "number" },
                  unit: { type: "string" }
                }
              }
            },
            competitive_advantages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  advantage: { type: "string" },
                  how_it_beats_competitor: { type: "string" }
                }
              }
            }
          }
        }
      });

      await base44.entities.Campaign.update(campaign.id, {
        campaign_phases: strategyResult.campaign_phases,
        content_themes: strategyResult.content_themes,
        hooks_and_angles: strategyResult.hooks_and_angles,
        orchestration_schedule: strategyResult.orchestration_schedule,
        kpis: strategyResult.kpis,
        generation_progress: 20
      });

      setOrchestrationProgress({ stage: 'generating_social', progress: 20, campaignId: campaign.id });

      // Step 3: Generate all social posts
      const socialPostsPromises = [];
      const scheduleItems = strategyResult.orchestration_schedule.filter(item =>
        item.channel === 'social' && data.platforms.includes(item.platform)
      );

      for (const scheduleItem of scheduleItems) {
        const theme = strategyResult.content_themes[Math.floor(Math.random() * strategyResult.content_themes.length)];
        const hook = strategyResult.hooks_and_angles[Math.floor(Math.random() * strategyResult.hooks_and_angles.length)];

        const postGeneration = base44.integrations.Core.InvokeLLM({
          prompt: `Create a ${scheduleItem.platform} post for day ${scheduleItem.day} of campaign.

CAMPAIGN: ${data.campaign_name}
GOAL: ${data.campaign_goal}
PHASE: ${strategyResult.campaign_phases.find(p => scheduleItem.day >= p.start_day && scheduleItem.day <= p.end_day)?.phase_name}
THEME: ${theme}
HOOK: ${hook.hook}
KEY MESSAGE: ${data.key_message}

${defaultBrandVoice ? `BRAND VOICE: ${defaultBrandVoice.profile_name}` : ''}

Create:
- Engaging copy (${scheduleItem.platform} optimized)
- 5-7 relevant hashtags
- Optimal posting time
- CTA
- Engagement prediction

Tone: Match campaign goal and phase.`,
          response_json_schema: {
            type: "object",
            properties: {
              copy: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              optimal_time: { type: "string" },
              cta: { type: "string" },
              engagement_prediction: { type: "number" }
            }
          }
        });

        socialPostsPromises.push(postGeneration.then(async (result) => {
          const scheduledDate = new Date(data.start_date);
          scheduledDate.setDate(scheduledDate.getDate() + scheduleItem.day);
          const [hours, minutes] = result.optimal_time.split(':');
          scheduledDate.setHours(parseInt(hours), parseInt(minutes));

          // Create scheduled post
          const scheduledPost = await base44.entities.ScheduledPost.create({
            user_email: user.email,
            content_type: 'post',
            content_url: '',
            caption: result.copy,
            hashtags: result.hashtags,
            platforms: [scheduleItem.platform],
            schedule_time: scheduledDate.toISOString(),
            status: 'scheduled',
            source_entity_type: 'Campaign',
            source_entity_id: campaign.id
          });

          // Add to calendar
          const calendarEvent = await base44.entities.ContentCalendarEvent.create({
            user_email: user.email,
            event_type: 'social_post',
            title: `${data.campaign_name} - ${scheduleItem.platform}`,
            description: result.copy.substring(0, 100) + '...',
            scheduled_date: scheduledDate.toISOString(),
            scheduled_time_optimal: true,
            platforms: [scheduleItem.platform],
            content_preview: result.copy,
            status: 'scheduled',
            source_entity_type: 'ScheduledPost',
            source_entity_id: scheduledPost.id,
            campaign_id: campaign.id,
            campaign_name: data.campaign_name,
            ai_generated: true,
            engagement_prediction: {
              estimated_engagement_rate: result.engagement_prediction / 100
            }
          });

          return { scheduledPost, calendarEvent, platform: scheduleItem.platform };
        }));
      }

      const socialPosts = await Promise.all(socialPostsPromises);
      setOrchestrationProgress({ stage: 'generating_emails', progress: 50, campaignId: campaign.id });

      // Step 4: Generate email sequence
      const emailResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Create ${data.content_plan.emails_count}-email campaign for:

CAMPAIGN: ${data.campaign_name}
GOAL: ${data.campaign_goal}
TARGET: ${data.target_audience}
MESSAGE: ${data.key_message}
DURATION: ${data.duration_days} days

Create emails that:
- Support campaign phases
- Build on each other
- Include personalization tokens
- Drive toward goal
- Match brand voice`,
        response_json_schema: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  subject_line: { type: "string" },
                  preview_text: { type: "string" },
                  body_html: { type: "string" },
                  body_text: { type: "string" },
                  cta_text: { type: "string" },
                  predicted_open_rate: { type: "number" }
                }
              }
            }
          }
        }
      });

      const emailPromises = emailResult.emails.map(async (email) => {
        const scheduledDate = new Date(data.start_date);
        scheduledDate.setDate(scheduledDate.getDate() + email.day);
        scheduledDate.setHours(9, 0); // 9am default

        return await base44.entities.ContentCalendarEvent.create({
          user_email: user.email,
          event_type: 'email_campaign',
          title: email.subject_line,
          description: email.preview_text,
          scheduled_date: scheduledDate.toISOString(),
          scheduled_time_optimal: true,
          content_preview: email.body_text,
          status: 'scheduled',
          campaign_id: campaign.id,
          campaign_name: data.campaign_name,
          ai_generated: true,
          engagement_prediction: {
            estimated_engagement_rate: email.predicted_open_rate / 100
          }
        });
      });

      const emails = await Promise.all(emailPromises);
      setOrchestrationProgress({ stage: 'generating_blog', progress: 75, campaignId: campaign.id });

      // Step 5: Generate blog posts
      const blogPromises = [];
      for (let i = 0; i < data.content_plan.blog_posts_count; i++) {
        const theme = strategyResult.content_themes[i];

        blogPromises.push(
          base44.integrations.Core.InvokeLLM({
            prompt: `Write SEO-optimized blog post for campaign:

CAMPAIGN: ${data.campaign_name}
THEME: ${theme}
GOAL: ${data.campaign_goal}
TARGET: ${data.target_audience}
MESSAGE: ${data.key_message}

Requirements:
- 1200-1500 words
- SEO title (50-60 chars)
- Meta description (150-160 chars)
- H2 sections
- Include campaign CTA
- 5-10 keywords
- Engaging intro and conclusion`,
            response_json_schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                meta_description: { type: "string" },
                content_html: { type: "string" },
                content_markdown: { type: "string" },
                seo_keywords: { type: "array", items: { type: "string" } },
                focus_keyword: { type: "string" },
                reading_time_minutes: { type: "number" }
              }
            }
          }).then(async (blogResult) => {
            const publishDay = Math.floor((i + 1) * (data.duration_days / data.content_plan.blog_posts_count));
            const scheduledDate = new Date(data.start_date);
            scheduledDate.setDate(scheduledDate.getDate() + publishDay);
            scheduledDate.setHours(10, 0);

            // Create SEO metadata
            const seoMeta = await base44.entities.SEOMetadata.create({
              page_path: `/blog/${blogResult.title.toLowerCase().replace(/\s+/g, '-')}`,
              title: blogResult.title,
              description: blogResult.meta_description,
              keywords: blogResult.seo_keywords,
              og_title: blogResult.title,
              og_description: blogResult.meta_description
            });

            // Add to calendar
            return await base44.entities.ContentCalendarEvent.create({
              user_email: user.email,
              event_type: 'blog_post',
              title: blogResult.title,
              description: blogResult.meta_description,
              scheduled_date: scheduledDate.toISOString(),
              content_preview: blogResult.content_markdown.substring(0, 200) + '...',
              status: 'scheduled',
              campaign_id: campaign.id,
              campaign_name: data.campaign_name,
              ai_generated: true
            });
          })
        );
      }

      const blogs = await Promise.all(blogPromises);
      setOrchestrationProgress({ stage: 'completing', progress: 95, campaignId: campaign.id });

      // Step 6: Update campaign with all generated content
      await base44.entities.Campaign.update(campaign.id, {
        status: 'ready',
        generation_progress: 100,
        total_assets_generated: socialPosts.length + emails.length + blogs.length,
        generated_assets: {
          social_posts: socialPosts.map(p => ({
            scheduled_post_id: p.scheduledPost.id,
            calendar_event_id: p.calendarEvent.id,
            platform: p.platform,
            scheduled_date: p.calendarEvent.scheduled_date,
            status: 'scheduled'
          })),
          emails: emails.map(e => ({
            calendar_event_id: e.id,
            subject: e.title,
            scheduled_date: e.scheduled_date,
            status: 'scheduled'
          })),
          blogs: blogs.map(b => ({
            calendar_event_id: b.id,
            title: b.title,
            scheduled_date: b.scheduled_date,
            status: 'scheduled'
          }))
        },
        estimated_time_saved_hours: (socialPosts.length * 0.5) + (emails.length * 1) + (blogs.length * 3)
      });

      setOrchestrationProgress({ stage: 'complete', progress: 100, campaignId: campaign.id });

      return { campaign, totalAssets: socialPosts.length + emails.length + blogs.length };
    },
    onSuccess: ({ campaign, totalAssets }) => {
      queryClient.invalidateQueries(['campaigns']);
      queryClient.invalidateQueries(['contentCalendarEvents']);
      queryClient.invalidateQueries(['scheduledPosts']);

      setOrchestrationProgress(null);

      alert(`🎉 Campaign Orchestrated Successfully!

✅ ${totalAssets} content pieces generated
📅 All scheduled on Content Calendar
🎯 Ready to launch

Campaign "${campaign.campaign_name}" is ready!

Next steps:
1. Review content in Content Calendar
2. Make any final edits
3. Activate campaign
4. Monitor performance in Campaign Dashboard`);
    }
  });

  const campaignGoals = [
    { value: 'product_launch', label: '🚀 Product Launch', desc: 'Launch new product/service' },
    { value: 'lead_generation', label: '🎯 Lead Generation', desc: 'Capture leads & grow list' },
    { value: 'brand_awareness', label: '📢 Brand Awareness', desc: 'Increase visibility & reach' },
    { value: 'event_promotion', label: '🎟️ Event Promotion', desc: 'Promote webinar/event' },
    { value: 'course_launch', label: '📚 Course Launch', desc: 'Launch online course' },
    { value: 'sales_promo', label: '💰 Sales Promo', desc: 'Drive sales with offer' },
    { value: 're_engagement', label: '🔄 Re-engagement', desc: 'Win back inactive users' },
    { value: 'seasonal_campaign', label: '🎄 Seasonal', desc: 'Holiday/seasonal campaign' }
  ];

  return (
    <div className="space-y-6">

      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#FFD700]" />
            Campaign Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Campaign Name *</label>
              <Input
                value={formData.campaign_name}
                onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                placeholder="e.g., Spring Product Launch 2025"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Campaign Goal *</label>
              <Select
                value={formData.campaign_goal}
                onValueChange={(value) => setFormData({...formData, campaign_goal: value})}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignGoals.map(goal => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="What is this campaign about? What problem does it solve?"
              rows={3}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Target Audience *</label>
            <Input
              value={formData.target_audience}
              onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
              placeholder="e.g., Content creators aged 25-40 looking to scale"
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Key Message *</label>
            <Input
              value={formData.key_message}
              onChange={(e) => setFormData({...formData, key_message: e.target.value})}
              placeholder="Core value proposition or transformation promise"
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          {/* Timeline & Budget */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Duration (days)</label>
              <Select
                value={String(formData.duration_days)}
                onValueChange={(value) => setFormData({...formData, duration_days: Number(value)})}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="21">21 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Start Date *</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Budget (USD)</label>
              <Input
                type="number"
                value={formData.budget_usd}
                onChange={(e) => setFormData({...formData, budget_usd: Number(e.target.value)})}
                placeholder="1000"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Channels</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'social', label: 'Social Media', icon: Share2 },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'blog', label: 'Blog', icon: FileText },
                { id: 'ads', label: 'Paid Ads', icon: Target }
              ].map(channel => {
                const Icon = channel.icon;
                const isSelected = formData.channels.includes(channel.id);
                return (
                  <label
                    key={channel.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00D4C9] bg-[#00D4C9]/10'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, channels: [...formData.channels, channel.id]});
                        } else {
                          setFormData({...formData, channels: formData.channels.filter(c => c !== channel.id)});
                        }
                      }}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-[#00D4C9]' : 'text-gray-400'}`} />
                    <p className={`text-xs text-center ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {channel.label}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Platforms */}
          {formData.channels.includes('social') && (
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Social Platforms</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'].map(platform => {
                  const isSelected = formData.platforms.includes(platform);
                  return (
                    <label
                      key={platform}
                      className={`p-2 rounded border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#FFD700] bg-[#FFD700]/10'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, platforms: [...formData.platforms, platform]});
                          } else {
                            setFormData({...formData, platforms: formData.platforms.filter(p => p !== platform)});
                          }
                        }}
                        className="sr-only"
                      />
                      <p className={`text-xs text-center capitalize ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {platform}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content Volume */}
          <div>
            <label className="text-gray-400 text-sm mb-3 block">Content Volume</label>
            <div className="grid md:grid-cols-4 gap-3">
              {formData.channels.includes('social') && (
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Social Posts</p>
                  <Input
                    type="number"
                    value={formData.content_plan.social_posts_count}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_plan: {...formData.content_plan, social_posts_count: Number(e.target.value)}
                    })}
                    className="bg-[#111317] border-gray-700 text-white h-9"
                  />
                </div>
              )}

              {formData.channels.includes('email') && (
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Emails</p>
                  <Input
                    type="number"
                    value={formData.content_plan.emails_count}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_plan: {...formData.content_plan, emails_count: Number(e.target.value)}
                    })}
                    className="bg-[#111317] border-gray-700 text-white h-9"
                  />
                </div>
              )}

              {formData.channels.includes('blog') && (
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Blog Posts</p>
                  <Input
                    type="number"
                    value={formData.content_plan.blog_posts_count}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_plan: {...formData.content_plan, blog_posts_count: Number(e.target.value)}
                    })}
                    className="bg-[#111317] border-gray-700 text-white h-9"
                  />
                </div>
              )}

              {formData.channels.includes('ads') && (
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Ad Creatives</p>
                  <Input
                    type="number"
                    value={formData.content_plan.ad_creatives_count}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_plan: {...formData.content_plan, ad_creatives_count: Number(e.target.value)}
                    })}
                    className="bg-[#111317] border-gray-700 text-white h-9"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Brand Voice */}
          {defaultBrandVoice && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-400 text-sm font-semibold mb-1">
                ✨ Brand Voice: {defaultBrandVoice.profile_name}
              </p>
              <p className="text-gray-400 text-xs">
                All campaign content will be generated using this brand voice profile
              </p>
            </div>
          )}

          {/* Competitor Intelligence Integration */}
          {latestCompetitorReport && (
            <Card className="bg-gradient-to-br from-[#FF69B4]/10 to-[#9D4EDD]/10 border-[#FF69B4]/30 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Target className="w-8 h-8 text-[#FF69B4] flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-lg mb-2">🎯 Competitor Intelligence Active</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      AI will use insights from competitor analysis to create a superior campaign strategy.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Market Gaps</p>
                        <p className="text-[#00D4C9] font-bold">{latestCompetitorReport.market_gaps?.length || 0} found</p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Weaknesses</p>
                        <p className="text-green-400 font-bold">{latestCompetitorReport.competitor_weaknesses?.length || 0} to exploit</p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Counter-Strategies</p>
                        <p className="text-purple-400 font-bold">{latestCompetitorReport.counterstrategy_recommendations?.length || 0} tactics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={() => orchestrateCampaignMutation.mutate(formData)}
            disabled={
              !formData.campaign_name ||
              !formData.description ||
              !formData.target_audience ||
              !formData.start_date ||
              orchestrateCampaignMutation.isPending ||
              orchestrationProgress
            }
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold rounded-xl h-14 text-lg"
          >
            {orchestrateCampaignMutation.isPending || orchestrationProgress ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Orchestrating Campaign...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Orchestrate Campaign with AI
              </>
            )}
          </Button>

          <p className="text-gray-500 text-xs text-center">
            ⚡ AI will generate {
              formData.content_plan.social_posts_count +
              formData.content_plan.emails_count +
              formData.content_plan.blog_posts_count +
              formData.content_plan.ad_creatives_count
            } pieces of content in ~3-5 minutes
          </p>

        </CardContent>
      </Card>

      {/* Progress Display */}
      <AnimatePresence>
        {orchestrationProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 rounded-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">
                      {orchestrationProgress.stage === 'planning' && '🎯 Planning Campaign Strategy...'}
                      {orchestrationProgress.stage === 'generating_social' && '📱 Generating Social Posts...'}
                      {orchestrationProgress.stage === 'generating_emails' && '📧 Creating Email Sequence...'}
                      {orchestrationProgress.stage === 'generating_blog' && '📝 Writing Blog Posts...'}
                      {orchestrationProgress.stage === 'completing' && '✅ Finalizing Campaign...'}
                      {orchestrationProgress.stage === 'complete' && '🎉 Campaign Ready!'}
                    </h4>
                    <span className="text-[#00D4C9] font-bold">{orchestrationProgress.progress}%</span>
                  </div>
                  <Progress value={orchestrationProgress.progress} className="h-3" />
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    <div className={orchestrationProgress.progress >= 10 ? 'text-green-400' : 'text-gray-500'}>
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                      Strategy
                    </div>
                    <div className={orchestrationProgress.progress >= 50 ? 'text-green-400' : 'text-gray-500'}>
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                      Social
                    </div>
                    <div className={orchestrationProgress.progress >= 75 ? 'text-green-400' : 'text-gray-500'}>
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                      Emails
                    </div>
                    <div className={orchestrationProgress.progress >= 95 ? 'text-green-400' : 'text-gray-500'}>
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                      Blogs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
