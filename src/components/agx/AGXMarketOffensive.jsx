import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Rocket,
  Phone,
  Mail,
  FileText,
  Database,
  Workflow,
  Users,
  DollarSign,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Target,
  Shield,
  Clock,
  Calendar,
  Bot,
  FileCode,
  Settings,
  AlertTriangle,
  MessageSquare,
  Video,
  Share2,
  BarChart3,
  Megaphone,
  Play,
  Hash,
  Brain
} from "lucide-react";

const FILE_INVENTORY = [
  { num: 1, name: "01-core-config.js", purpose: "Core configuration & database schema", lines: 350 },
  { num: 2, name: "02-email-sequences.js", purpose: "Email templates & automated sequences", lines: 900 },
  { num: 3, name: "03-ai-receptionist-aria.js", purpose: "ARIA AI phone receptionist scripts", lines: 750 },
  { num: 4, name: "04-sales-scripts.js", purpose: "Sales call scripts & objection handling", lines: 850 },
  { num: 5, name: "05-legal-agreements.js", purpose: "MSA, SOW, NDA templates", lines: 700 },
  { num: 6, name: "06-proposal-templates.js", purpose: "Proposal & document generation", lines: 900 },
  { num: 7, name: "07-crm-workflows.js", purpose: "CRM automation rules & workflows", lines: 650 }
];

const DB_COLLECTIONS = [
  { name: "leads", purpose: "Prospect and lead data" },
  { name: "deals", purpose: "Active opportunities" },
  { name: "campaigns", purpose: "Client campaign tracking" },
  { name: "email_sequences", purpose: "Automation sequence definitions" },
  { name: "email_templates", purpose: "Email template storage" },
  { name: "call_logs", purpose: "Phone call records" },
  { name: "tasks", purpose: "Team task management" },
  { name: "activity_log", purpose: "Activity audit trail" },
  { name: "documents", purpose: "Generated documents" },
  { name: "settings", purpose: "Configuration storage" },
  { name: "active_calls", purpose: "AI receptionist call state" }
];

const EMAIL_SEQUENCES = [
  { name: "Cold Outreach", trigger: "Manual", emails: 4, duration: "7 days", templates: ["cold_email_1", "cold_email_2", "cold_email_3", "cold_email_4"] },
  { name: "Welcome Sequence", trigger: "New Lead", emails: 3, duration: "4 days", templates: ["welcome_email_1", "welcome_email_2", "welcome_email_3"] },
  { name: "Discovery Prep", trigger: "Call Scheduled", emails: 1, duration: "Immediate", templates: ["discovery_prep_email"] },
  { name: "Proposal Follow-up", trigger: "Proposal Sent", emails: 3, duration: "7 days", templates: ["proposal_email", "proposal_followup_1", "proposal_followup_2"] },
  { name: "Contract Follow-up", trigger: "Contract Sent", emails: 2, duration: "2 days", templates: ["contract_sent_email", "contract_followup_email"] },
  { name: "Onboarding", trigger: "Closed Won", emails: 2, duration: "3 days", templates: ["onboarding_welcome_email", "onboarding_day3_email"] },
  { name: "Campaign Updates", trigger: "Campaign Active", emails: "Weekly", duration: "60 days", templates: ["campaign_launch_email", "weekly_report_email"] },
  { name: "Lost Nurture", trigger: "Closed Lost", emails: 2, duration: "60 days", templates: ["lost_nurture_email_1", "lost_nurture_email_2"] }
];

const EMAIL_TEMPLATES_LIST = [
  { id: "cold_email_1", name: "Cold Outreach - Initial", subject: "{{company}}'s competitors are outspending you on CTV by 3x" },
  { id: "cold_email_2", name: "Cold Outreach - Follow Up 1", subject: "Re: {{company}}'s competitors are outspending you on CTV by 3x" },
  { id: "cold_email_3", name: "Cold Outreach - Competitor Intel", subject: "I found 3 weaknesses in {{primary_competitor}}'s ad strategy" },
  { id: "cold_email_4", name: "Cold Outreach - Breakup", subject: "Should I close your file?" },
  { id: "welcome_email_1", name: "Welcome - Immediate", subject: "{{first_name}}, your Market Annihilation strategy session is confirmed" },
  { id: "welcome_email_2", name: "Welcome - Day 2", subject: "The $400K mistake most brands make with CTV advertising" },
  { id: "welcome_email_3", name: "Welcome - Day 4 Case Study", subject: "How [Similar Company] stole 18% market share in 60 days" },
  { id: "discovery_prep_email", name: "Discovery Call Prep", subject: "Prep for our call {{call_date}} - 3 things to have ready" },
  { id: "proposal_email", name: "Proposal Delivery", subject: "{{company}}'s Market Annihilation Offensive - Custom Proposal" },
  { id: "proposal_followup_1", name: "Proposal Follow-up Day 2", subject: "Re: {{company}}'s Market Annihilation Offensive - Quick question" },
  { id: "proposal_followup_2", name: "Proposal Follow-up Day 5", subject: "{{first_name}}, your proposal expires in 48 hours" },
  { id: "contract_sent_email", name: "Contract Sent", subject: "ACTION REQUIRED: {{company}} Market Annihilation Offensive Contract" },
  { id: "contract_followup_email", name: "Contract Follow-up", subject: "Re: {{company}} contract - need anything from me?" },
  { id: "onboarding_welcome_email", name: "Onboarding Welcome", subject: "🚀 Welcome to AI Freedom Studios - Let's destroy your competition!" },
  { id: "onboarding_day3_email", name: "Onboarding Day 3", subject: "{{company}} Update: Competitive intel complete - here's what we found" },
  { id: "campaign_launch_email", name: "Campaign Launch", subject: "🚀 {{company}} IS LIVE - The annihilation begins!" },
  { id: "weekly_report_email", name: "Weekly Report", subject: "{{company}} Week {{week_number}} Report - {{headline}}" },
  { id: "campaign_complete_email", name: "Campaign Complete", subject: "🏆 {{company}} Results: {{headline_result}}" },
  { id: "lost_nurture_email_1", name: "Lost Deal - 30 Days", subject: "{{first_name}}, how's the competitive battle going?" },
  { id: "lost_nurture_email_2", name: "Lost Deal - 60 Days", subject: "New data: {{industry}} CTV advertising trends" }
];

const EMAIL_FUNCTIONS = [
  { name: "mergeEmailTemplate(templateId, leadData, customData)", desc: "Merge template with lead data, replace {{variables}}" },
  { name: "sendEmail(to, subject, body, options)", desc: "Send email via SendGrid/provider" },
  { name: "startEmailSequence(leadId, sequenceId)", desc: "Start an email sequence for a lead" },
  { name: "sendSequenceEmail(leadId, sequenceId, step)", desc: "Send specific sequence step email" },
  { name: "processScheduledEmails()", desc: "Cron job: process all scheduled sequence emails" }
];

const ARIA_SCRIPTS = [
  { id: "greeting", desc: "Main menu with 5 options" },
  { id: "campaign_overview", desc: "60-day campaign explanation" },
  { id: "campaign_details", desc: "3 phases, platforms, AI optimization" },
  { id: "pricing_overview", desc: "3 tiers summary" },
  { id: "tier_surgical_strike", desc: "$345K tier details" },
  { id: "tier_total_warfare", desc: "$690K tier details" },
  { id: "tier_nuclear_option", desc: "$2.875M tier details" },
  { id: "guarantee_details", desc: "6 KPIs, refund structure" },
  { id: "schedule_call", desc: "Collect name, company, email, phone, competitors" },
  { id: "confirm_scheduling", desc: "Confirm info, offer times" },
  { id: "send_calendar_link", desc: "Email Calendly link" },
  { id: "time_selected", desc: "Confirm booking" },
  { id: "existing_client", desc: "Verify account, route" },
  { id: "transfer_sales", desc: "Transfer to ext 1001" },
  { id: "transfer_billing", desc: "Transfer to ext 1003" },
  { id: "transfer_support", desc: "Transfer to ext 1002" },
  { id: "success_stories", desc: "ROI examples (184x, 87x, 72x)" },
  { id: "goodbye", desc: "End call, reminder" },
  { id: "voicemail", desc: "Voicemail greeting" }
];

const SALES_SCRIPTS = [
  { id: "cold_call", name: "Cold Call - Initial Outreach", duration: "3-5 min", sections: ["opener", "qualification_questions", "pivot_to_meeting", "voicemail"] },
  { id: "discovery_call", name: "Discovery Call - Full Framework", duration: "30 min", sections: ["intro", "situation", "problem", "implication", "solution", "next_steps"] },
  { id: "closing_call", name: "Proposal Review / Closing Call", duration: "20-30 min", sections: ["opener", "review_sections", "trial_close", "hard_close"] }
];

const OBJECTION_HANDLERS = [
  { objection: "Price too high", response: "Compare to traditional 30% fees, discuss ROI, offer lower tier" },
  { objection: "Need to think about it", response: "Uncover real concern, create urgency, set specific follow-up" },
  { objection: "Need approval", response: "Get stakeholder names, offer exec summary, schedule stakeholder call" },
  { objection: "Already have agency", response: "Position as complementary, offer 60-day pilot alongside" },
  { objection: "Guarantee skepticism", response: "Explain AI approach, aligned incentives, offer reference call" },
  { objection: "Timing not right", response: "Explore real blocker, emphasize competitor advantage, nurture" },
  { objection: "Need proof/case studies", response: "Share relevant case study, offer reference client call" },
  { objection: "Competitor might do same", response: "Non-compete policy, first-mover advantage, urgency" }
];

const CALL_OUTCOMES = {
  discovery: [
    { outcome: "qualified_scheduled", next: "Send proposal", stage: "discovery_completed" },
    { outcome: "qualified_needs_followup", next: "Schedule followup", stage: "discovery_scheduled" },
    { outcome: "not_qualified_budget", next: "Close lost", stage: "closed_lost" },
    { outcome: "not_qualified_timing", next: "Add to nurture", stage: "new_lead" },
    { outcome: "no_show", next: "Reschedule", stage: "discovery_scheduled" }
  ],
  closing: [
    { outcome: "closed_won", next: "Send contract", stage: "closed_won" },
    { outcome: "verbal_yes", next: "Send contract", stage: "contract_sent" },
    { outcome: "needs_approval", next: "Send exec summary", stage: "negotiation" },
    { outcome: "needs_time", next: "Schedule followup", stage: "proposal_sent" },
    { outcome: "objection_price", next: "Send comparison", stage: "negotiation" },
    { outcome: "lost", next: "Add to nurture", stage: "closed_lost" }
  ]
};

const NEGOTIATION_CONCESSIONS = [
  { level: 1, give: "Payment terms (50/25/25)", get: "Faster signature, case study rights" },
  { level: 2, give: "Drop to lower tier + upgrade option", get: "Commitment to upgrade if results" },
  { level: 3, give: "Custom tier at minimum scope", get: "Longer term, category exclusivity" },
  { level: 4, give: "90-day payment plan", get: "Higher total value, referral commitment" }
];

const LEGAL_TEMPLATES = [
  { id: "msa", name: "Master Services Agreement", version: "2.0", sections: ["Services", "Fees & Payment", "IP Rights", "Confidentiality", "Warranties", "Liability", "Indemnification", "Term & Termination", "Non-Compete", "Schedule A: Performance Guarantee"] },
  { id: "sow", name: "Statement of Work", version: "2.0", sections: ["Campaign Overview", "Objectives", "Scope of Services", "Platforms", "Deliverables", "Investment", "Performance Guarantee", "Client Responsibilities", "Exhibit A: Timeline", "Exhibit B: Creative Specs"] },
  { id: "nda", name: "Mutual Non-Disclosure Agreement", version: "1.0", sections: ["Definition of Confidential Info", "Obligations", "Exclusions", "No License", "Return of Information", "Term", "Remedies"] }
];

const LEGAL_MERGE_FIELDS = [
  "{{effective_date}}", "{{msa_date}}", "{{start_date}}", "{{end_date}}",
  "{{client_company_legal_name}}", "{{client_address}}", "{{client_signatory_name}}", "{{client_signatory_title}}",
  "{{agency_signatory_name}}", "{{agency_signatory_title}}", "{{sow_number}}", "{{tier_name}}",
  "{{total_investment}}", "{{ad_spend}}", "{{management_fee}}", "{{deposit_amount}}", "{{final_payment}}", "{{max_refund}}",
  "{{sov_target}}", "{{market_share_target}}", "{{households_target}}", "{{impressions_target}}",
  "{{ads_count}}", "{{variations_count}}", "{{competitors_list}}", "{{competitors_non_compete_list}}"
];

const PROPOSAL_TEMPLATES = [
  { id: "executive_summary", name: "Executive Summary - One Pager", desc: "Quick overview for decision makers" },
  { id: "full_proposal", name: "Full Campaign Proposal", desc: "8-section detailed proposal", sections: ["Cover", "Problem", "Solution", "Custom Campaign", "Advantage", "Guarantee", "ROI", "Next Steps"] },
  { id: "competitive_intelligence_report", name: "Competitive Intelligence Report", desc: "Detailed competitor analysis" }
];

const PROPOSAL_SECTIONS = {
  executive_summary: ["Opportunity", "Solution", "Investment", "Why Us", "ROI Projection", "Guarantee", "Next Steps", "Scarcity"],
  full_proposal: ["Cover Page", "The Problem", "The Solution", "Your Custom Campaign", "The Advantage", "The Guarantee", "ROI Projection", "Timeline", "Next Steps"],
  competitive_intel: ["Executive Summary", "Competitor Analysis", "Market Opportunity", "Attack Strategy"]
};

const PROPOSAL_MERGE_FIELDS = [
  // Client
  "{{client_company}}", "{{client_name}}", "{{primary_competitor}}", "{{competitors_list}}",
  // Dates
  "{{proposal_date}}", "{{expiry_date}}",
  // Investment
  "{{tier_name}}", "{{total_investment}}", "{{ad_spend}}", "{{management_fee}}", "{{deposit_amount}}",
  // Deliverables
  "{{competitors_count}}", "{{ads_count}}", "{{variations_count}}", "{{households}}", "{{impressions}}", "{{sov_target}}", "{{market_share_target}}",
  // Savings
  "{{traditional_fee}}", "{{traditional_total_fees}}", "{{savings_amount}}", "{{creative_value}}",
  // Guarantee
  "{{refund_25}}", "{{refund_50}}", "{{refund_75}}", "{{refund_90}}", "{{max_risk}}",
  // ROI
  "{{market_size}}", "{{incremental_revenue}}", "{{roi_multiple}}", "{{conservative_roi}}", "{{expected_roi}}", "{{optimistic_roi}}", "{{payback_period}}",
  // Rep
  "{{rep_name}}", "{{rep_title}}", "{{rep_email}}", "{{rep_phone}}", "{{calendly_link}}",
  // Scarcity
  "{{spots_remaining}}", "{{current_quarter}}"
];

const AUTOMATION_WORKFLOWS = [
  { id: "lead_capture", name: "New Lead Capture & Qualification", trigger: "new_lead_created", steps: 6 },
  { id: "discovery_booked", name: "Discovery Call Scheduled", trigger: "calendly_event_created", steps: 7 },
  { id: "post_discovery", name: "Post-Discovery Call Automation", trigger: "call_outcome_logged", branches: 3 },
  { id: "proposal_followup", name: "Proposal Follow-up Automation", trigger: "time_based", rules: 3 },
  { id: "contract_sent", name: "Contract Sent Automation", trigger: "docusign_envelope_sent", steps: 4 },
  { id: "contract_signed", name: "Contract Signed - Onboarding", trigger: "docusign_envelope_completed", steps: 11 },
  { id: "campaign_lifecycle", name: "Active Campaign Automation", trigger: "daily_cron", rules: 4 },
  { id: "no_show_recovery", name: "No-Show Recovery Automation", trigger: "meeting_no_show", steps: 5 },
  { id: "stale_deal_alert", name: "Stale Deal Detection", trigger: "daily_cron", rules: 2 }
];

const WEBHOOK_HANDLERS = [
  { name: "calendly", events: ["event_created", "event_canceled"], actions: ["find/create lead", "trigger automation"] },
  { name: "docusign", events: ["sent", "completed"], actions: ["update pipeline", "trigger onboarding"] },
  { name: "stripe", events: ["payment_intent.succeeded"], actions: ["mark deposit paid", "trigger campaign setup"] },
  { name: "twilio", events: ["ringing", "speech_result"], actions: ["initialize call", "process ARIA input"] }
];

const SCHEDULED_JOBS_LIST = [
  { schedule: "Every hour", job: "process_email_sequences", desc: "Send scheduled emails from sequences" },
  { schedule: "Daily 8am", job: "daily_automation_check", desc: "Process all active leads/deals/campaigns" },
  { schedule: "Daily 8am", job: "stale_deal_check", desc: "Detect and alert on stale deals" },
  { schedule: "Daily 6pm", job: "daily_summary_report", desc: "Send daily summary to Slack" },
  { schedule: "Weekly Mon 9am", job: "weekly_pipeline_review", desc: "Pipeline report to leadership" }
];

const AUTOMATION_ACTIONS = [
  "update_pipeline_stage", "start_email_sequence", "stop_email_sequence", "send_email", "send_sms",
  "create_task", "slack_notification", "calculate_lead_score", "assign_to_rep", "create_deal",
  "generate_proposal", "update_deal_status", "wait", "enrich_lead_data", "run_competitive_analysis",
  "schedule_workshop", "assign_team", "create_client_portal", "generate_invoice", "escalate_to_manager"
];

const SMS_TEMPLATES = [
  { id: "new_lead_response", name: "New Lead Auto-Response", category: "Lead Engagement" },
  { id: "missed_call_followup", name: "Missed Call Follow-up", category: "Lead Engagement" },
  { id: "discovery_reminder_24h", name: "Discovery Reminder (24hr)", category: "Meeting Reminders" },
  { id: "discovery_reminder_1h", name: "Discovery Reminder (1hr)", category: "Meeting Reminders" },
  { id: "no_show_followup", name: "No-Show Follow-up", category: "Meeting Reminders" },
  { id: "proposal_sent", name: "Proposal Sent", category: "Proposal & Contract" },
  { id: "proposal_reminder", name: "Proposal Reminder", category: "Proposal & Contract" },
  { id: "contract_sent", name: "Contract Sent", category: "Proposal & Contract" },
  { id: "contract_signed_congrats", name: "Contract Signed Congrats", category: "Proposal & Contract" },
  { id: "campaign_launch", name: "Campaign Launch Alert", category: "Campaign Updates" },
  { id: "weekly_highlight", name: "Weekly Performance", category: "Campaign Updates" },
  { id: "campaign_complete", name: "Campaign Complete", category: "Campaign Updates" }
];

const QUICK_REPLIES = [
  { trigger: "what is market annihilation", response: "60-day AI CTV campaign explanation" },
  { trigger: "pricing / cost", response: "3 tier breakdown with pricing" },
  { trigger: "guarantee / risk", response: "90% money-back guarantee explanation" },
  { trigger: "vs agency", response: "Traditional agency cost comparison" },
  { trigger: "timeline", response: "Day 0 to Day 60 breakdown" },
  { trigger: "availability / spots", response: "Scarcity + spots remaining" },
  { trigger: "too expensive", response: "Reframe + offer Surgical Strike tier" },
  { trigger: "need to think", response: "Uncover real concern + urgency" },
  { trigger: "have agency", response: "Position as complementary + pilot offer" },
  { trigger: "send info", response: "Offer materials + push for call" }
];

const LINKEDIN_TEMPLATES = [
  { id: "connection_request", name: "Connection Request", chars: 140 },
  { id: "post_connection_1", name: "Post-Connection Message", chars: 280 },
  { id: "post_connection_2", name: "Follow-up (Competitor Intel)", chars: 200 },
  { id: "cold_outreach", name: "Cold Outreach", chars: 350 },
  { id: "case_study_share", name: "Case Study Share", chars: 400 }
];

// SOCIAL MEDIA CAMPAIGN DATA
const SOCIAL_MEDIA_FILES = [
  { num: 1, name: "01-core-config.js", purpose: "Core config, brand voice, hook formulas", lines: 200 },
  { num: 2, name: "02-linkedin-templates.js", purpose: "LinkedIn posts, carousels, DM scripts", lines: 450 },
  { num: 3, name: "03-video-scripts.js", purpose: "TikTok/Reels/Shorts scripts", lines: 350 },
  { num: 4, name: "04-facebook-ads.js", purpose: "Ad copy, targeting, campaigns", lines: 300 },
  { num: 5, name: "05-email-sequences.js", purpose: "Nurture sequences", lines: 280 },
  { num: 6, name: "06-content-calendar.js", purpose: "7-day launch calendar", lines: 180 },
  { num: 7, name: "07-twitter-templates.js", purpose: "Tweets and threads", lines: 200 },
  { num: 8, name: "08-analytics-kpis.js", purpose: "KPI framework", lines: 120 },
  { num: 9, name: "09-launch-checklist.js", purpose: "Pre-launch & daily checklists", lines: 100 },
  { num: 10, name: "10-crm-automation.js", purpose: "Lead scoring, workflows", lines: 150 },
  { num: 11, name: "11-landing-pages.js", purpose: "Landing page content", lines: 180 },
  { num: 12, name: "12-campaign-data.json", purpose: "Campaign data for import", lines: 50 }
];

const SOCIAL_PLATFORMS = [
  { name: "LinkedIn", priority: 1, focus: "organic", postsWeek: 7, bestTimes: ["7:00 AM", "10:00 AM", "12:00 PM"], icon: "💼" },
  { name: "TikTok", priority: 2, focus: "organic", postsWeek: 5, bestTimes: ["6:00 PM", "7:00 PM", "9:00 PM"], icon: "🎵" },
  { name: "Facebook", priority: 3, focus: "paid", postsWeek: 3, budget: "$30/day", icon: "📘" },
  { name: "Instagram", priority: 4, focus: "organic", postsWeek: 5, bestTimes: ["11:00 AM", "2:00 PM", "7:00 PM"], icon: "📷" },
  { name: "YouTube", priority: 5, focus: "organic", postsWeek: 2, bestTimes: ["10:00 AM", "2:00 PM"], icon: "🎬" },
  { name: "Twitter/X", priority: 6, focus: "organic", postsWeek: 14, bestTimes: ["8:00 AM", "12:00 PM", "5:00 PM"], icon: "🐦" }
];

const CONTENT_PILLARS = [
  { name: "Educational", percentage: 40, examples: "How-tos, Tutorials, Tips" },
  { name: "Product Spotlight", percentage: 20, examples: "Demos, Features, Use cases" },
  { name: "Customer Stories", percentage: 15, examples: "Case studies, Testimonials" },
  { name: "Thought Leadership", percentage: 15, examples: "Predictions, Hot takes" },
  { name: "Behind The Scenes", percentage: 10, examples: "Founder journey, Team content" }
];

const HOOK_FORMULAS = [
  { type: "Contrarian", template: "Most {topic} is making things worse. Here's why..." },
  { type: "Number Promise", template: "I've {action} {number} times. These {n} patterns always {outcome}." },
  { type: "Shocking Stat", template: "Companies waste {stat} on {topic}. Here's how to stop." },
  { type: "Question", template: "What if everything you knew about {topic} was wrong?" },
  { type: "Story", template: "I almost quit {time} ago. Here's what changed." },
  { type: "Curiosity Gap", template: "The {topic} strategy nobody's talking about" }
];

const VIDEO_SCRIPTS = [
  { id: "agencies_lying", title: "Marketing Agencies Are Lying To You", duration: "45s" },
  { id: "broken_stack", title: "5 Signs Your Marketing Stack Is Broken", duration: "35s" },
  { id: "million_comparison", title: "What $1M Buys You: Agency vs AI", duration: "40s" },
  { id: "ai_workflow", title: "The AI Workflow That Replaced My Team", duration: "50s" },
  { id: "agencies_dying", title: "Why 50% of Agencies Will Die", duration: "45s" },
  { id: "sixty_day_results", title: "60 Days of AI Marketing Results", duration: "45s" },
  { id: "pov_discovering", title: "POV: You Discover AI Marketing", duration: "25s" },
  { id: "day_in_life", title: "Day In My Life Building an AI Company", duration: "60s" }
];

const AD_BUDGET_ALLOCATION = [
  { name: "Facebook Retargeting", percentage: 60, monthly: 600, daily: 20, purpose: "Convert warm leads" },
  { name: "Facebook Cold", percentage: 30, monthly: 300, daily: 10, purpose: "Build awareness" },
  { name: "Testing", percentage: 10, monthly: 100, daily: 3.33, purpose: "Test new creatives" }
];

const SOCIAL_KPIS = {
  awareness: { impressions: "50K+/week", reach: "25K+/week", follower_growth: "5%/week" },
  engagement: { linkedin: "3%+", tiktok: "5%+", instagram: "2%+", twitter: "1%+" },
  conversion: { ctr_organic: "1%+", ctr_paid: "0.5%+", leads_weekly: "20+", demos_weekly: "5+" }
};

const SOCIAL_30_DAY_GOALS = {
  impressions: 200000,
  linkedin_followers: 500,
  tiktok_followers: 1000,
  website_visits: 2000,
  leads: 50,
  demo_requests: 10
};

const MASTER_CONFIG = {
  version: "2.0",
  campaign_name: "Market Annihilation Offensive",
  company: {
    name: "AI Freedom Studios",
    tagline: "Unleash AI • Amplify Freedom • Dominate Markets",
    website: "aifreedomstudios.com",
    phone: "1-800-AI-FREEDOM"
  },
  campaign: {
    duration_days: 60,
    guarantee_percentage: 90,
    fee_percentage: 15,
    clients_per_quarter: 3
  },
  platforms: [
    { name: "Netflix", households: "260M" },
    { name: "Amazon Prime", households: "200M" },
    { name: "Disney+", households: "150M" },
    { name: "HBO Max", households: "96M" },
    { name: "Paramount+", households: "63M" },
    { name: "Roku", households: "60M" },
    { name: "Hulu", households: "48M" },
    { name: "Peacock", households: "30M" },
    { name: "Apple TV+", households: "25M" },
    { name: "YouTube TV", households: "8M" }
  ],
  total_households: "940M+",
  files_included: [
    "01-core-config.js",
    "02-email-sequences.js", 
    "03-ai-receptionist-aria.js",
    "04-sales-scripts.js",
    "05-legal-agreements.js",
    "06-proposal-templates.js",
    "07-crm-workflows.js",
    "08-sms-quick-replies.js"
  ],
  automation_coverage: 90,
  automated: ["Lead scoring", "Email sequences (8)", "Meeting reminders", "No-show follow-up", "Proposal generation", "Contract generation", "Onboarding workflow", "Campaign updates", "Weekly reporting", "Stale deal alerts"],
  human_required: ["Discovery calls", "Proposal review", "Contract negotiations", "Strategy calls", "Final presentations"]
};

const TIERS = [
  { name: "SURGICAL STRIKE", total: "$345,000", adSpend: "$300,000", fee: "$45,000", ads: 75, sov: "40%+", competitors: 3, variations: 300, households: "25M+", impressions: "75M+", marketShare: "5%+", deposit: "$172,500" },
  { name: "TOTAL WARFARE", total: "$690,000", adSpend: "$600,000", fee: "$90,000", ads: 175, sov: "60%+", competitors: 7, variations: 700, households: "50M+", impressions: "150M+", marketShare: "10%+", deposit: "$345,000" },
  { name: "NUCLEAR OPTION", total: "$2,875,000", adSpend: "$2,500,000", fee: "$375,000", ads: 500, sov: "85%+", competitors: 15, variations: 2000, households: "150M+", impressions: "500M+", marketShare: "25%+", deposit: "$1,437,500" }
];

const KPIS = [
  { id: "sov", name: "Share of Voice Target", metric: "share_of_voice" },
  { id: "market_share", name: "Market Share Gain", metric: "market_share_gain" },
  { id: "impressions", name: "Household Impressions (85%+)", metric: "impressions_delivered" },
  { id: "vcr", name: "Video Completion Rate (75%+)", metric: "video_completion_rate" },
  { id: "awareness", name: "Brand Awareness Increase (15%+)", metric: "brand_awareness" },
  { id: "consideration", name: "Brand Consideration vs Competitor (20%+)", metric: "brand_consideration" }
];

const REFUND_STRUCTURE = [
  { kpisMissed: 0, percentage: 0, description: "All KPIs met - Competitors annihilated!" },
  { kpisMissed: 1, percentage: 25, description: "Minor shortfall - 25% fee refund" },
  { kpisMissed: 2, percentage: 50, description: "Partial performance - 50% fee refund" },
  { kpisMissed: 3, percentage: 75, description: "Significant shortfall - 75% fee refund" },
  { kpisMissed: "4+", percentage: 90, description: "Major underperformance - 90% fee refund" }
];

const CORE_CONFIG_CODE = `const CONFIG = {
  company: {
    name: "AI Freedom Studios",
    legalName: "AI Freedom Studios LLC",
    tagline: "Unleash AI • Amplify Freedom • Dominate Markets",
    email: {
      enterprise: "enterprise@aifreedomstudios.com",
      support: "support@aifreedomstudios.com"
    },
    phone: "1-800-AI-FREEDOM"
  },
  campaign: {
    name: "Market Annihilation Offensive",
    duration: 60, // days
    guaranteePercentage: 90,
    feePercentage: 15,
    clientsPerQuarter: 3
  },
  aiReceptionist: {
    name: "ARIA",
    fullName: "AI Research & Intelligence Assistant",
    voice: "professional_female",
    maxCallDuration: 600 // 10 minutes
  },
  integrations: {
    poeApiKey: "YOUR_POE_API_KEY_HERE",
    stripeKey: "YOUR_STRIPE_KEY_HERE",
    twilioSid: "YOUR_TWILIO_SID_HERE",
    twilioToken: "YOUR_TWILIO_TOKEN_HERE",
    sendgridKey: "YOUR_SENDGRID_KEY_HERE",
    calendlyUrl: "YOUR_CALENDLY_URL_HERE",
    docusignKey: "YOUR_DOCUSIGN_KEY_HERE"
  }
};`;

const CRON_JOBS = [
  { schedule: "Every hour", job: "process_email_sequences", fn: "processScheduledEmails()" },
  { schedule: "Daily 8:00 AM", job: "daily_automation_check", fn: "processDailyAutomation()" },
  { schedule: "Daily 6:00 PM", job: "daily_summary_report", fn: "generateDailySummary()" },
  { schedule: "Monday 9:00 AM", job: "weekly_pipeline_review", fn: "generateWeeklyReport()" }
];

const WEBHOOKS = [
  { service: "Calendly", endpoint: "/webhooks/calendly", events: "invitee.created" },
  { service: "DocuSign", endpoint: "/webhooks/docusign", events: "envelope-sent, completed" },
  { service: "Stripe", endpoint: "/webhooks/stripe", events: "payment_intent.succeeded" },
  { service: "Twilio", endpoint: "/webhooks/twilio", events: "Voice calls" }
];

const DEPLOYMENT_CHECKLIST = [
  "Upload all 7 JavaScript files to Base44",
  "Create all database collections",
  "Configure API keys in 01-core-config.js",
  "Set up Calendly webhook",
  "Set up DocuSign webhook",
  "Set up Stripe webhook",
  "Set up Twilio for ARIA",
  "Configure SendGrid for email",
  "Set up scheduled cron jobs",
  "Test lead capture flow",
  "Test email sequences",
  "Test AI receptionist",
  "Test proposal generation",
  "Test contract generation",
  "Train sales team on scripts",
  "Go live! 🚀"
];

export default function AGXMarketOffensive() {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState({});

  const copyConfig = () => {
    const config = `integrations: {
  poeApiKey: "YOUR_POE_API_KEY_HERE",
  stripeKey: "YOUR_STRIPE_KEY_HERE",
  twilioSid: "YOUR_TWILIO_SID_HERE",
  twilioToken: "YOUR_TWILIO_TOKEN_HERE",
  sendgridKey: "YOUR_SENDGRID_KEY_HERE",
  calendlyUrl: "YOUR_CALENDLY_URL_HERE",
  docusignKey: "YOUR_DOCUSIGN_KEY_HERE"
}`;
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleChecklist = (idx) => {
    setChecklist(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
          MARKET ANNIHILATION OFFENSIVE
        </h2>
        <p className="text-gray-400 mb-4">90% Automation Workflow • AG-X Command Center</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Badge className="bg-red-500/20 text-red-400">7 Function Files</Badge>
          <Badge className="bg-orange-500/20 text-orange-400">~5,100 Lines</Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400">90% Automated</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#0B0B0C] border border-gray-800 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="aria">ARIA Setup</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="sms">SMS & Outreach</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-4">
            {/* File Inventory */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  File Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-red-600/20 to-orange-600/20">
                        <th className="text-left p-3 text-red-300">#</th>
                        <th className="text-left p-3 text-red-300">Filename</th>
                        <th className="text-left p-3 text-red-300">Purpose</th>
                        <th className="text-left p-3 text-red-300">Lines</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FILE_INVENTORY.map((f) => (
                        <tr key={f.num} className="border-b border-gray-800">
                          <td className="p-3 text-gray-500">{f.num}</td>
                          <td className="p-3"><code className="text-cyan-400 text-xs">{f.name}</code></td>
                          <td className="p-3 text-gray-300">{f.purpose}</td>
                          <td className="p-3 text-yellow-400">~{f.lines}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Database Collections */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DB_COLLECTIONS.map((c) => (
                    <div key={c.name} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-cyan-400 text-sm">{c.name}</code>
                      <p className="text-gray-500 text-xs mt-1">{c.purpose}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integration Config */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Integration Configuration
                </CardTitle>
                <Button onClick={copyConfig} variant="outline" size="sm" className="border-gray-700">
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0B0B0C] rounded-xl p-4 border border-gray-800">
                  <pre className="text-xs text-gray-300 font-mono">{`integrations: {
  poeApiKey: "YOUR_POE_API_KEY_HERE",
  stripeKey: "YOUR_STRIPE_KEY_HERE",
  twilioSid: "YOUR_TWILIO_SID_HERE",
  twilioToken: "YOUR_TWILIO_TOKEN_HERE",
  sendgridKey: "YOUR_SENDGRID_KEY_HERE",
  calendlyUrl: "YOUR_CALENDLY_URL_HERE",
  docusignKey: "YOUR_DOCUSIGN_KEY_HERE"
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          <div className="space-y-4">
            {/* Lead Flow */}
            {[
              { title: "LEAD ACQUISITION", icon: Target, color: "from-blue-500 to-cyan-500", steps: [
                "Website Form / Phone Call (ARIA) / Referral",
                "NEW LEAD CREATED → Auto-Score → Auto-Assign",
                "Welcome Email Sequence Starts"
              ]},
              { title: "QUALIFICATION", icon: Users, color: "from-green-500 to-emerald-500", steps: [
                "Lead Score ≥ 70 → High-Priority Task → Rep Calls Within 2hrs",
                "Lead Score 50-69 → Standard Nurture → SDR Follow-up",
                "Lead Score < 50 → Long-term Nurture → Monthly Check-in"
              ]},
              { title: "DISCOVERY CALL", icon: Phone, color: "from-purple-500 to-pink-500", steps: [
                "Calendly Booking → Stop Welcome Sequence",
                "Start Discovery Prep Sequence → Create Prep Task",
                "Run Competitive Analysis",
                "Discovery Call → Rep Uses Discovery Script",
                "Log Outcome → Branch: QUALIFIED / NEEDS NURTURE / DISQUALIFIED"
              ]},
              { title: "PROPOSAL", icon: FileText, color: "from-yellow-500 to-orange-500", steps: [
                "Auto-Create Deal → Auto-Generate Proposal",
                "Send Proposal Email with Attachment",
                "Start Proposal Follow-up Sequence",
                "Day 2: Follow-up Email | Day 5: Urgency + Task | Day 7: Escalate"
              ]},
              { title: "CONTRACT", icon: Shield, color: "from-red-500 to-rose-500", steps: [
                "Generate Contracts → MSA + SOW + NDA",
                "Send via DocuSign → Auto-Track Status",
                "Contract Signed → TRIGGER: CLOSED WON AUTOMATION"
              ]},
              { title: "ONBOARDING", icon: Rocket, color: "from-indigo-500 to-violet-500", steps: [
                "Generate Invoice → Send Welcome Email",
                "Create Campaign Record → Schedule Workshop (48hrs)",
                "Assign Account Team → Create Client Portal",
                "Slack: 🎉 WIN NOTIFICATION",
                "Brand Discovery (Day 1-7) → Production (Day 8-14) → LAUNCH Day 15 🚀"
              ]},
              { title: "ACTIVE CAMPAIGN (Days 15-60)", icon: Zap, color: "from-orange-500 to-red-500", steps: [
                "Daily: AI Optimization Every 15 Minutes (2,880 cycles)",
                "Weekly: Auto-Generate Performance Report → Strategy Call Task",
                "Day 60: Final Report → KPI Results → Guarantee Status → Completion Email"
              ]}
            ].map((phase, idx) => {
              const Icon = phase.icon;
              return (
                <Card key={idx} className="bg-[#111317] border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-transparent bg-clip-text bg-gradient-to-r ${phase.color} flex items-center gap-2 text-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                      {phase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {phase.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ARIA Tab */}
        <TabsContent value="aria">
          <div className="space-y-4">
            {/* ARIA Config */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  ARIA AI Receptionist (03-ai-receptionist-aria.js)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">ARIA Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="text-cyan-400">ARIA</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Full Name:</span><span className="text-white">AI Research & Intelligence Assistant</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Voice:</span><span className="text-white">alloy (OpenAI) / nova / shimmer</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Speed:</span><span className="text-white">1.0</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Max Duration:</span><span className="text-yellow-400">10 minutes</span></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Transfer Extensions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Sales:</span><code className="text-cyan-400">1001</code></div>
                      <div className="flex justify-between"><span className="text-gray-500">Support:</span><code className="text-cyan-400">1002</code></div>
                      <div className="flex justify-between"><span className="text-gray-500">Billing:</span><code className="text-cyan-400">1003</code></div>
                      <div className="flex justify-between"><span className="text-gray-500">Executive:</span><code className="text-cyan-400">1004</code></div>
                    </div>
                  </div>
                </div>

                {/* Call Scripts */}
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-3">Call Scripts ({ARIA_SCRIPTS.length} scripts)</h4>
                  <div className="grid md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {ARIA_SCRIPTS.map((s, idx) => (
                      <div key={idx} className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                        <code className="text-purple-400 text-xs">{s.id}</code>
                        <p className="text-gray-400 text-xs mt-1">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call Flow */}
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-3">Call Flow</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <p className="text-cyan-400">📞 Incoming Call</p>
                    <p className="text-gray-500 pl-4">↓</p>
                    <p className="text-purple-400 pl-4">ARIA Greeting → Menu Options (1-4, 0)</p>
                    <p className="text-gray-500 pl-4">↓</p>
                    <p className="text-yellow-400 pl-4">Intent Recognition (keyword matching)</p>
                    <div className="pl-8 space-y-1 text-gray-400 text-xs">
                      <p>├→ <span className="text-green-400">1/Learn More</span> → campaign_overview → campaign_details → pricing</p>
                      <p>├→ <span className="text-green-400">2/Pricing</span> → pricing_overview → tier_details → schedule</p>
                      <p>├→ <span className="text-green-400">3/Schedule</span> → collect: name, company, email, phone, competitors → confirm</p>
                      <p>├→ <span className="text-green-400">4/Existing</span> → verify → route to department</p>
                      <p>└→ <span className="text-green-400">0/Rep</span> → transfer_sales (ext 1001)</p>
                    </div>
                  </div>
                </div>

                {/* Functions */}
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-3">ARIA Functions</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      { name: "initializeCall(callSid, from, to)", desc: "Start new call, return greeting" },
                      { name: "processInput(callSid, input, inputType)", desc: "Process caller speech/DTMF" },
                      { name: "recognizeIntent(transcript, currentScript)", desc: "Match keywords to intents" },
                      { name: "finalizeCall(callSid, callState)", desc: "End call, create lead, log transcript" },
                      { name: "sendCalendlyLink(email, data)", desc: "Email scheduling link to caller" }
                    ].map((fn, idx) => (
                      <div key={idx} className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                        <code className="text-cyan-400 text-xs">{fn.name}</code>
                        <p className="text-gray-500 text-xs mt-1">{fn.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Twilio Setup */}
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-3">Twilio Configuration</h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li>1. Create Twilio account at twilio.com</li>
                    <li>2. Purchase phone number (1-800-AI-FREEDOM)</li>
                    <li>3. Configure Voice webhook: <code className="text-cyan-400">/webhooks/twilio/voice</code></li>
                    <li>4. Set voice: Twilio TTS or ElevenLabs API</li>
                    <li>5. Enable speech recognition for intent detection</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails">
          <div className="space-y-4">
            {/* Email Sequences */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Sequences (02-email-sequences.js)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
                        <th className="text-left p-3 text-blue-300">Sequence</th>
                        <th className="text-left p-3 text-blue-300">Trigger</th>
                        <th className="text-left p-3 text-blue-300">Emails</th>
                        <th className="text-left p-3 text-blue-300">Duration</th>
                        <th className="text-left p-3 text-blue-300">Templates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EMAIL_SEQUENCES.map((s, idx) => (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="p-3 text-white font-medium">{s.name}</td>
                          <td className="p-3"><Badge className="bg-purple-500/20 text-purple-400 text-xs">{s.trigger}</Badge></td>
                          <td className="p-3 text-yellow-400">{s.emails}</td>
                          <td className="p-3 text-gray-400">{s.duration}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {s.templates?.slice(0, 2).map((t, i) => (
                                <code key={i} className="text-cyan-400 text-xs bg-cyan-500/10 px-1 rounded">{t}</code>
                              ))}
                              {s.templates?.length > 2 && <span className="text-gray-500 text-xs">+{s.templates.length - 2}</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Email Templates */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Email Templates ({EMAIL_TEMPLATES_LIST.length} templates)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {EMAIL_TEMPLATES_LIST.map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-cyan-400 text-xs">{t.id}</code>
                      </div>
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      <p className="text-gray-500 text-xs mt-1 truncate">{t.subject}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Functions */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400">Email Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {EMAIL_FUNCTIONS.map((fn, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-cyan-400 text-sm">{fn.name}</code>
                      <p className="text-gray-500 text-xs mt-1">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Merge Variables */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-yellow-400">Template Merge Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["{{first_name}}", "{{last_name}}", "{{company}}", "{{email}}", "{{primary_competitor}}", "{{industry}}", "{{calendly_link}}", "{{sender_name}}", "{{sender_phone}}", "{{current_quarter}}", "{{spots_remaining}}", "{{tier_name}}", "{{total_investment}}", "{{ad_spend}}", "{{management_fee}}", "{{sov_target}}", "{{market_share_target}}", "{{proposal_link}}", "{{docusign_link}}", "{{portal_link}}"].map((v, idx) => (
                    <code key={idx} className="text-yellow-400 text-xs bg-yellow-500/10 px-2 py-1 rounded">{v}</code>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers">
          <div className="space-y-4">
            {/* Tier Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {TIERS.map((t, idx) => (
                <Card key={idx} className={`bg-[#111317] border-2 ${idx === 0 ? 'border-blue-500/50' : idx === 1 ? 'border-purple-500/50' : 'border-red-500/50'}`}>
                  <CardHeader className="pb-2">
                    <Badge className={`w-fit text-xs ${idx === 0 ? 'bg-blue-500/20 text-blue-400' : idx === 1 ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                      {t.name}
                    </Badge>
                    <p className="text-3xl font-bold text-green-400">{t.total}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Ad Spend:</span><span className="text-white">{t.adSpend}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Fee (15%):</span><span className="text-yellow-400">{t.fee}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Deposit:</span><span className="text-orange-400">{t.deposit}</span></div>
                    <div className="border-t border-gray-800 my-2 pt-2" />
                    <div className="flex justify-between"><span className="text-gray-500">Competitors:</span><span className="text-white">{t.competitors}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Conquest Ads:</span><span className="text-white">{t.ads}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Variations:</span><span className="text-white">{t.variations}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Households:</span><span className="text-cyan-400">{t.households}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Impressions:</span><span className="text-cyan-400">{t.impressions}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">SOV Target:</span><span className="text-green-400 font-bold">{t.sov}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Market Share:</span><span className="text-green-400 font-bold">{t.marketShare}</span></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* KPIs */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {KPIS.map((kpi, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <p className="text-white font-medium text-sm">{kpi.name}</p>
                      <code className="text-cyan-400 text-xs">{kpi.metric}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Refund Structure */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  90% Performance Guarantee Refund Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-600/20">
                        <th className="text-left p-3 text-green-300">KPIs Missed</th>
                        <th className="text-left p-3 text-green-300">Refund %</th>
                        <th className="text-left p-3 text-green-300">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REFUND_STRUCTURE.map((r, idx) => (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="p-3 text-white font-bold">{r.kpisMissed}</td>
                          <td className="p-3 text-yellow-400 font-bold">{r.percentage}%</td>
                          <td className="p-3 text-gray-300">{r.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <div className="space-y-4">
            {/* Sales Scripts */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Sales Scripts (04-sales-scripts.js)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {SALES_SCRIPTS.map((s, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-cyan-400 text-sm">{s.id}</code>
                        <Badge className="bg-orange-500/20 text-orange-400 text-xs">{s.duration}</Badge>
                      </div>
                      <p className="text-white font-medium text-sm mb-2">{s.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {s.sections.map((sec, i) => (
                          <span key={i} className="text-gray-500 text-xs bg-gray-800 px-1.5 py-0.5 rounded">{sec}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Objection Handling */}
            <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Objection Handling Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {OBJECTION_HANDLERS.map((o, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <p className="text-red-400 font-medium text-sm mb-1">"{o.objection}"</p>
                      <p className="text-gray-400 text-xs">{o.response}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call Outcomes */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-400 text-sm">Discovery Call Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {CALL_OUTCOMES.discovery.map((o, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#0B0B0C] rounded border border-gray-800">
                        <code className="text-cyan-400 text-xs">{o.outcome}</code>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-gray-600" />
                          <span className="text-gray-400 text-xs">{o.next}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-yellow-400 text-sm">Closing Call Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {CALL_OUTCOMES.closing.map((o, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#0B0B0C] rounded border border-gray-800">
                        <code className="text-cyan-400 text-xs">{o.outcome}</code>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-gray-600" />
                          <span className="text-gray-400 text-xs">{o.next}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Negotiation Concessions */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400">Negotiation Concession Ladder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-purple-600/20">
                        <th className="text-left p-3 text-purple-300">Level</th>
                        <th className="text-left p-3 text-purple-300">What You Give</th>
                        <th className="text-left p-3 text-purple-300">What You Get</th>
                      </tr>
                    </thead>
                    <tbody>
                      {NEGOTIATION_CONCESSIONS.map((c, idx) => (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="p-3 text-yellow-400 font-bold">{c.level}</td>
                          <td className="p-3 text-gray-300">{c.give}</td>
                          <td className="p-3 text-green-400">{c.get}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Sales Functions */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-orange-400">Sales Automation Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "logCallOutcome(leadId, callType, outcome, notes)", desc: "Log call result, update pipeline stage, trigger automations" },
                    { name: "triggerNextAction(leadId, action)", desc: "Execute next action: send_proposal, send_contract, add_to_nurture, etc." },
                    { name: "createTask(leadId, title, type, priority)", desc: "Create follow-up task for sales rep" }
                  ].map((fn, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-cyan-400 text-sm">{fn.name}</code>
                      <p className="text-gray-500 text-xs mt-1">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal">
          <div className="space-y-4">
            {/* Legal Templates */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Legal Agreement Templates (05-legal-agreements.js)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {LEGAL_TEMPLATES.map((t, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-cyan-400 text-sm">{t.id}</code>
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">v{t.version}</Badge>
                      </div>
                      <p className="text-white font-medium text-sm mb-3">{t.name}</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {t.sections.map((sec, i) => (
                          <span key={i} className="block text-gray-500 text-xs">• {sec}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* MSA Key Terms */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400">MSA Key Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Payment Terms</h4>
                    <div className="text-gray-400 text-xs space-y-1">
                      <p>• 50% deposit due upon SOW execution</p>
                      <p>• 50% final payment due upon campaign launch</p>
                      <p>• Net 15 payment terms</p>
                      <p>• 1.5%/month late fee</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Performance Guarantee</h4>
                    <div className="text-gray-400 text-xs space-y-1">
                      <p>• 6 KPIs measured by third-party tools</p>
                      <p>• Up to 90% fee refund if KPIs missed</p>
                      <p>• Refund processed within 30 days</p>
                      <p>• Sole remedy for performance claims</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Liability & Indemnification</h4>
                    <div className="text-gray-400 text-xs space-y-1">
                      <p>• Cap: fees paid in 12 months</p>
                      <p>• No consequential damages</p>
                      <p>• Mutual indemnification</p>
                      <p>• Florida law, AAA arbitration</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">Non-Compete</h4>
                    <div className="text-gray-400 text-xs space-y-1">
                      <p>• No direct competitors during active SOW</p>
                      <p>• Competitors listed in each SOW</p>
                      <p>• Adjacent markets allowed</p>
                      <p>• 1-year non-solicitation of employees</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Merge Fields */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-yellow-400">Template Merge Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {LEGAL_MERGE_FIELDS.map((f, idx) => (
                    <code key={idx} className="text-yellow-400 text-xs bg-yellow-500/10 px-2 py-1 rounded">{f}</code>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Functions */}
            <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">Document Generation Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "generateDocument(templateId, data)", desc: "Generate single document from template with merge data" },
                    { name: "generateDealDocuments(dealId)", desc: "Generate all documents (NDA, MSA, SOW) for a deal" },
                    { name: "formatCurrency(amount)", desc: "Format amount as USD currency" },
                    { name: "formatDate(date)", desc: "Format date for legal documents" }
                  ].map((fn, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-cyan-400 text-sm">{fn.name}</code>
                      <p className="text-gray-500 text-xs mt-1">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* DocuSign Integration */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400">DocuSign Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li>1. Generate documents via <code className="text-cyan-400">generateDealDocuments(dealId)</code></li>
                    <li>2. Upload to DocuSign via API with envelope</li>
                    <li>3. Set signing order: NDA → MSA → SOW</li>
                    <li>4. Configure webhook: <code className="text-cyan-400">/webhooks/docusign</code></li>
                    <li>5. On <code className="text-cyan-400">envelope-completed</code> → trigger onboarding automation</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Proposals Tab */}
        <TabsContent value="proposals">
          <div className="space-y-4">
            {/* Proposal Templates */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Proposal Templates (06-proposal-templates.js)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {PROPOSAL_TEMPLATES.map((t, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <code className="text-cyan-400 text-sm">{t.id}</code>
                      <p className="text-white font-medium text-sm mt-2">{t.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
                      {t.sections && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {t.sections.map((s, i) => (
                            <span key={i} className="text-purple-400 text-xs bg-purple-500/10 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Full Proposal Sections */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">Full Proposal Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {PROPOSAL_SECTIONS.full_proposal.map((section, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <span className="text-white text-sm">{section}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Proposal Merge Fields */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-yellow-400">Proposal Merge Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Client & Dates</p>
                    <div className="flex flex-wrap gap-2">
                      {PROPOSAL_MERGE_FIELDS.slice(0, 6).map((f, idx) => (
                        <code key={idx} className="text-yellow-400 text-xs bg-yellow-500/10 px-2 py-1 rounded">{f}</code>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Investment & Deliverables</p>
                    <div className="flex flex-wrap gap-2">
                      {PROPOSAL_MERGE_FIELDS.slice(6, 17).map((f, idx) => (
                        <code key={idx} className="text-cyan-400 text-xs bg-cyan-500/10 px-2 py-1 rounded">{f}</code>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Savings & Guarantee</p>
                    <div className="flex flex-wrap gap-2">
                      {PROPOSAL_MERGE_FIELDS.slice(17, 26).map((f, idx) => (
                        <code key={idx} className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded">{f}</code>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">ROI & Rep Info</p>
                    <div className="flex flex-wrap gap-2">
                      {PROPOSAL_MERGE_FIELDS.slice(26).map((f, idx) => (
                        <code key={idx} className="text-purple-400 text-xs bg-purple-500/10 px-2 py-1 rounded">{f}</code>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proposal Functions */}
            <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400">Proposal Generation Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "generateProposalData(lead, deal, tier, rep)", desc: "Build complete merge data object from lead/deal" },
                    { name: "generateFullProposal(lead, deal, tier, rep)", desc: "Generate full 8-section proposal document" },
                    { name: "generateExecutiveSummary(lead, deal, tier, rep)", desc: "Generate one-page executive summary" },
                    { name: "parseMarketSize(sizeString)", desc: "Parse market size strings like '$500M' to numbers" },
                    { name: "getCurrentQuarter()", desc: "Get current quarter string (e.g., 'Q4 2024')" }
                  ].map((fn, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-cyan-400 text-sm">{fn.name}</code>
                      <p className="text-gray-500 text-xs mt-1">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ROI Scenarios */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-400">ROI Projection Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-xl text-center">
                    <p className="text-gray-400 text-xs uppercase mb-2">Conservative</p>
                    <p className="text-2xl font-bold text-gray-300">80%</p>
                    <p className="text-gray-500 text-xs">of target share gain</p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <p className="text-green-400 text-xs uppercase mb-2">Expected</p>
                    <p className="text-2xl font-bold text-green-400">100%</p>
                    <p className="text-gray-500 text-xs">of target share gain</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">
                    <p className="text-purple-400 text-xs uppercase mb-2">Optimistic</p>
                    <p className="text-2xl font-bold text-purple-400">150%</p>
                    <p className="text-gray-500 text-xs">of target share gain</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations">
          <div className="space-y-4">
            {/* Automation Workflows */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Automation Workflows (07-crm-workflows.js)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {AUTOMATION_WORKFLOWS.map((w, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-cyan-400 text-xs">{w.id}</code>
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                          {w.steps ? `${w.steps} steps` : w.branches ? `${w.branches} branches` : `${w.rules} rules`}
                        </Badge>
                      </div>
                      <p className="text-white font-medium text-sm">{w.name}</p>
                      <p className="text-gray-500 text-xs mt-1">Trigger: <span className="text-yellow-400">{w.trigger}</span></p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Webhook Handlers */}
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400">Webhook Handlers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {WEBHOOK_HANDLERS.map((wh, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <code className="text-yellow-400 font-bold">{wh.name}</code>
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-400 text-xs">Events: <span className="text-cyan-400">{wh.events.join(", ")}</span></p>
                        <p className="text-gray-400 text-xs">Actions: <span className="text-green-400">{wh.actions.join(" → ")}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Jobs */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduled Jobs (Cron)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-600/20">
                        <th className="text-left p-3 text-yellow-300">Schedule</th>
                        <th className="text-left p-3 text-yellow-300">Job Name</th>
                        <th className="text-left p-3 text-yellow-300">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCHEDULED_JOBS_LIST.map((j, idx) => (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="p-3 text-cyan-400 font-mono text-xs">{j.schedule}</td>
                          <td className="p-3 text-white">{j.job}</td>
                          <td className="p-3 text-gray-400">{j.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Available Actions */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400">Available Automation Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {AUTOMATION_ACTIONS.map((a, idx) => (
                    <code key={idx} className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded">{a}</code>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Automation Engine Functions */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400">Automation Engine Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "processAutomation(triggerId, context)", desc: "Main entry point - routes to correct workflow" },
                    { name: "executeSteps(steps, context)", desc: "Execute sequential workflow steps" },
                    { name: "executeAction(action, context)", desc: "Execute single action (email, task, etc.)" },
                    { name: "evaluateCondition(conditionStr, context)", desc: "Parse and evaluate condition strings" },
                    { name: "mergeTemplate(template, context)", desc: "Replace {{variables}} with context values" }
                  ].map((fn, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-cyan-400 text-sm">{fn.name}</code>
                      <p className="text-gray-500 text-xs mt-1">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Stages */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-400">Pipeline Stages Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {["new_lead", "qualified", "discovery_scheduled", "discovery_completed", "proposal_sent", "negotiation", "contract_sent", "closed_won"].map((stage, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 text-xs rounded-lg border border-orange-500/30">
                        {stage}
                      </span>
                      {idx < 7 && <ArrowRight className="w-4 h-4 text-gray-600" />}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <div className="space-y-4">
            {/* Social Media Header */}
            <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Social Media Market Annihilation (12 Files)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-pink-400">$1K</p>
                    <p className="text-gray-400 text-xs">Monthly Budget</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-purple-400">6</p>
                    <p className="text-gray-400 text-xs">Platforms</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-cyan-400">35+</p>
                    <p className="text-gray-400 text-xs">Posts/Week</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-green-400">7</p>
                    <p className="text-gray-400 text-xs">Day Launch</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Inventory */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  Social Media File Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-2">
                  {SOCIAL_MEDIA_FILES.map((f) => (
                    <div key={f.num} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <code className="text-cyan-400 text-xs">{f.name}</code>
                        <span className="text-yellow-400 text-xs">~{f.lines}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{f.purpose}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Priority */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Platform Priority & Posting Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-purple-600/20">
                        <th className="text-left p-3 text-purple-300">Priority</th>
                        <th className="text-left p-3 text-purple-300">Platform</th>
                        <th className="text-left p-3 text-purple-300">Focus</th>
                        <th className="text-left p-3 text-purple-300">Posts/Week</th>
                        <th className="text-left p-3 text-purple-300">Best Times</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SOCIAL_PLATFORMS.map((p, idx) => (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="p-3 text-yellow-400 font-bold">#{p.priority}</td>
                          <td className="p-3 text-white">{p.icon} {p.name}</td>
                          <td className="p-3">
                            <Badge className={p.focus === "paid" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                              {p.focus}
                            </Badge>
                          </td>
                          <td className="p-3 text-cyan-400">{p.postsWeek}</td>
                          <td className="p-3 text-gray-400 text-xs">{p.bestTimes?.join(", ") || p.budget}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Content Pillars */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400">Content Pillars (80/20 Rule)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-3">
                  {CONTENT_PILLARS.map((p, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-xl text-center">
                      <p className="text-2xl font-bold text-blue-400">{p.percentage}%</p>
                      <p className="text-white font-medium text-sm mt-1">{p.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{p.examples}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hook Formulas */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Hook Formulas (49% More Reach)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {HOOK_FORMULAS.map((h, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <Badge className="bg-orange-500/20 text-orange-400 mb-2">{h.type}</Badge>
                      <p className="text-gray-300 text-sm italic">"{h.template}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Video Scripts */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Short-Form Video Scripts ({VIDEO_SCRIPTS.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  {VIDEO_SCRIPTS.map((v, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <Play className="w-4 h-4 text-red-400" />
                        <Badge className="bg-gray-700 text-gray-300 text-xs">{v.duration}</Badge>
                      </div>
                      <code className="text-cyan-400 text-xs block">{v.id}</code>
                      <p className="text-white text-sm mt-1">{v.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ad Budget Allocation */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Ad Budget Allocation ($1,000/month)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {AD_BUDGET_ALLOCATION.map((a, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{a.name}</span>
                        <Badge className="bg-green-500/20 text-green-400">{a.percentage}%</Badge>
                      </div>
                      <p className="text-2xl font-bold text-green-400">${a.monthly}/mo</p>
                      <p className="text-gray-400 text-xs">${a.daily.toFixed(2)}/day • {a.purpose}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KPIs & Goals */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Weekly KPI Targets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs uppercase mb-2">Awareness</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-cyan-400">{SOCIAL_KPIS.awareness.impressions}</span><br/><span className="text-gray-500">Impressions</span></div>
                        <div><span className="text-cyan-400">{SOCIAL_KPIS.awareness.reach}</span><br/><span className="text-gray-500">Reach</span></div>
                        <div><span className="text-cyan-400">{SOCIAL_KPIS.awareness.follower_growth}</span><br/><span className="text-gray-500">Growth</span></div>
                      </div>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs uppercase mb-2">Engagement Rate</p>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div><span className="text-purple-400">{SOCIAL_KPIS.engagement.linkedin}</span><br/><span className="text-gray-500">LinkedIn</span></div>
                        <div><span className="text-purple-400">{SOCIAL_KPIS.engagement.tiktok}</span><br/><span className="text-gray-500">TikTok</span></div>
                        <div><span className="text-purple-400">{SOCIAL_KPIS.engagement.instagram}</span><br/><span className="text-gray-500">Instagram</span></div>
                        <div><span className="text-purple-400">{SOCIAL_KPIS.engagement.twitter}</span><br/><span className="text-gray-500">Twitter</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    30-Day Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(SOCIAL_30_DAY_GOALS).map(([key, val], idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                        <p className="text-xl font-bold text-yellow-400">{val.toLocaleString()}</p>
                        <p className="text-gray-400 text-xs capitalize">{key.replace(/_/g, " ")}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Engagement Routine */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-pink-400">Daily Engagement Routine (30-45 min)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  {[
                    { task: "Comment on 20 relevant posts", time: "20 min", focus: "Target audience" },
                    { task: "Respond to all comments", time: "10 min", focus: "Within 1 hour" },
                    { task: "Send 5-10 connection requests", time: "10 min", focus: "Personalized" },
                    { task: "Send 3-5 DMs to warm leads", time: "5 min", focus: "Recent engagers" }
                  ].map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <p className="text-white text-sm font-medium">{t.task}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className="bg-pink-500/20 text-pink-400 text-xs">{t.time}</Badge>
                        <span className="text-gray-500 text-xs">{t.focus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SMS & Outreach Tab */}
        <TabsContent value="sms">
          <div className="space-y-4">
            {/* SMS Templates */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  SMS Templates (BONUS: sms-templates.js)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {["Lead Engagement", "Meeting Reminders", "Proposal & Contract", "Campaign Updates"].map((cat, catIdx) => (
                    <div key={catIdx} className="space-y-2">
                      <p className="text-gray-400 text-xs uppercase tracking-wide">{cat}</p>
                      {SMS_TEMPLATES.filter(s => s.category === cat).map((s, idx) => (
                        <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg border border-gray-800">
                          <code className="text-green-400 text-xs">{s.id}</code>
                          <p className="text-white text-xs mt-1">{s.name}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Replies */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Reply Scripts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {QUICK_REPLIES.map((qr, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <p className="text-yellow-400 text-sm font-medium">"{qr.trigger}"</p>
                      <p className="text-gray-400 text-xs mt-1">{qr.response}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Templates */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-500 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  LinkedIn Message Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-3">
                  {LINKEDIN_TEMPLATES.map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center">
                      <code className="text-cyan-400 text-xs">{t.id}</code>
                      <p className="text-white text-sm mt-2">{t.name}</p>
                      <Badge className="mt-2 bg-blue-500/20 text-blue-400 text-xs">{t.chars} chars</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SMS Merge Fields */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-yellow-400">SMS Merge Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["{{first_name}}", "{{company}}", "{{rep_name}}", "{{rep_phone}}", "{{primary_competitor}}", "{{call_time}}", "{{meeting_link}}", "{{portal_link}}", "{{week_number}}", "{{impressions}}", "{{sov}}", "{{vcr}}", "{{headline_result}}", "{{current_quarter}}", "{{spots_remaining}}"].map((f, idx) => (
                    <code key={idx} className="text-yellow-400 text-xs bg-yellow-500/10 px-2 py-1 rounded">{f}</code>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="agents">
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Agent Workforce
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Full AI Agent Workforce component with 6 specialized AI engineers, ARIA orchestration, 
                  founder approval workflows, task queues, and cost analysis.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-cyan-400">6</p>
                    <p className="text-gray-400 text-xs">AI Engineers</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-emerald-400">98.4%</p>
                    <p className="text-gray-400 text-xs">Cost Reduction</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-purple-400">$1M+</p>
                    <p className="text-gray-400 text-xs">Annual Savings</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { emoji: "🔷", name: "ATLAS", role: "Senior Full-Stack", autonomy: "HIGH", model: "Claude Opus 4.5" },
                    { emoji: "⚡", name: "NEXUS", role: "DevOps/SRE", autonomy: "MEDIUM-HIGH", model: "Claude Sonnet 4.5" },
                    { emoji: "🧬", name: "SYNTH", role: "ML/AI Engineer", autonomy: "MEDIUM", model: "Cost-Optimized Router" },
                    { emoji: "🎨", name: "PIXEL", role: "Frontend/React", autonomy: "MEDIUM-HIGH", model: "Claude Sonnet 4.5" },
                    { emoji: "🛡️", name: "SENTINEL", role: "QA & Security", autonomy: "MEDIUM", model: "Claude Sonnet 4.5" },
                    { emoji: "🔍", name: "SCOUT", role: "Junior Developer", autonomy: "LOW", model: "Claude Haiku 4.5" }
                  ].map((agent, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 flex items-center gap-3">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div className="flex-1">
                        <p className="text-white font-bold">{agent.name}</p>
                        <p className="text-gray-400 text-xs">{agent.role}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${
                          agent.autonomy === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400' :
                          agent.autonomy === 'MEDIUM-HIGH' ? 'bg-cyan-500/20 text-cyan-400' :
                          agent.autonomy === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{agent.autonomy}</Badge>
                        <p className="text-gray-500 text-xs mt-1">{agent.model}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-purple-400 text-sm">
                    <strong>💡 Full Component Available:</strong> The complete AIAgentWorkforce component with interactive 
                    approval workflows, task assignment, system prompts, and cost analysis is available at 
                    <code className="mx-1 text-cyan-400">components/agx/AIAgentWorkforce.jsx</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deploy Tab */}
        <TabsContent value="deploy">
          <div className="space-y-4">
            {/* Webhooks */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cyan-600/20">
                        <th className="text-left p-3 text-cyan-300">Service</th>
                        <th className="text-left p-3 text-cyan-300">Endpoint</th>
                        <th className="text-left p-3 text-cyan-300">Events</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WEBHOOKS.map((w, idx) => (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="p-3 text-white">{w.service}</td>
                          <td className="p-3"><code className="text-cyan-400 text-xs">{w.endpoint}</code></td>
                          <td className="p-3 text-gray-400">{w.events}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cron Jobs */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduled Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-600/20">
                        <th className="text-left p-3 text-green-300">Schedule</th>
                        <th className="text-left p-3 text-green-300">Job Name</th>
                        <th className="text-left p-3 text-green-300">Function</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CRON_JOBS.map((j, idx) => (
                        <tr key={idx} className="border-b border-gray-800">
                          <td className="p-3 text-yellow-400">{j.schedule}</td>
                          <td className="p-3 text-white">{j.job}</td>
                          <td className="p-3"><code className="text-cyan-400 text-xs">{j.fn}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Deployment Checklist */}
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Deployment Checklist
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    {completedCount}/{DEPLOYMENT_CHECKLIST.length} Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {DEPLOYMENT_CHECKLIST.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        checklist[idx]
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-700'
                      }`}
                      onClick={() => toggleChecklist(idx)}
                    >
                      <Checkbox checked={checklist[idx] || false} />
                      <span className={`text-sm ${checklist[idx] ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <div className="space-y-4">
            {/* Master Overview */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Master Configuration v{MASTER_CONFIG.version}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-purple-400">{MASTER_CONFIG.campaign.duration_days}</p>
                    <p className="text-gray-400 text-xs">Campaign Days</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-green-400">{MASTER_CONFIG.campaign.guarantee_percentage}%</p>
                    <p className="text-gray-400 text-xs">Money-Back Guarantee</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-cyan-400">{MASTER_CONFIG.campaign.fee_percentage}%</p>
                    <p className="text-gray-400 text-xs">Management Fee</p>
                  </div>
                  <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-3xl font-bold text-orange-400">{MASTER_CONFIG.automation_coverage}%</p>
                    <p className="text-gray-400 text-xs">Automation Coverage</p>
                  </div>
                </div>
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <p className="text-white font-bold text-lg">{MASTER_CONFIG.company.name}</p>
                  <p className="text-orange-400 text-sm">{MASTER_CONFIG.company.tagline}</p>
                  <p className="text-gray-400 text-xs mt-2">{MASTER_CONFIG.company.website} • {MASTER_CONFIG.company.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Reach */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-cyan-400">Platform Reach: {MASTER_CONFIG.total_households} Households</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  {MASTER_CONFIG.platforms.map((p, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg text-center border border-gray-800">
                      <p className="text-white font-medium text-sm">{p.name}</p>
                      <p className="text-cyan-400 text-xs">{p.households}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Files Included */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-yellow-400">Files Included ({MASTER_CONFIG.files_included.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-2">
                  {MASTER_CONFIG.files_included.map((f, idx) => (
                    <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-yellow-400 text-xs">{f}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Automation vs Human */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 text-sm">✓ Automated ({MASTER_CONFIG.automated.length} Processes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {MASTER_CONFIG.automated.map((a, idx) => (
                      <p key={idx} className="text-gray-300 text-xs">• {a}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-400 text-sm">👤 Human Required ({MASTER_CONFIG.human_required.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {MASTER_CONFIG.human_required.map((h, idx) => (
                      <p key={idx} className="text-gray-300 text-xs">• {h}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Raw Config Code */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-purple-400">Core Configuration Code</CardTitle>
                <Button onClick={() => { navigator.clipboard.writeText(CORE_CONFIG_CODE); setCopied(true); setTimeout(() => setCopied(false), 2000); }} variant="outline" size="sm" className="border-gray-700">
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-[#0B0B0C] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 max-h-64">
                  {CORE_CONFIG_CODE}
                </pre>
              </CardContent>
            </Card>

            {/* Pipeline Stages */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-400">Pipeline Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["New Lead", "Qualified", "Discovery Scheduled", "Discovery Completed", "Proposal Sent", "Negotiation", "Contract Sent", "Closed Won", "Closed Lost", "Onboarding", "Active Campaign", "Completed"].map((stage, idx) => (
                    <Badge key={idx} className="bg-gray-700/50 text-gray-300 text-xs">
                      {idx + 1}. {stage}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Utility Functions */}
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Utility Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { name: "formatCurrency(amount)", desc: "Format USD currency" },
                    { name: "formatDate(date)", desc: "Format date to locale string" },
                    { name: "calculateRefund(fee, kpisMissed)", desc: "Calculate refund amount" },
                    { name: "getTierDetails(tierId)", desc: "Get tier configuration" },
                    { name: "generateId()", desc: "Generate UUID" },
                    { name: "calculateLeadScore(lead)", desc: "Score lead 0-100" },
                    { name: "getCampaignDay(startDate)", desc: "Get current campaign day (1-60)" }
                  ].map((fn, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <code className="text-cyan-400 text-sm">{fn.name}</code>
                      <p className="text-gray-500 text-xs mt-1">{fn.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-bold tracking-widest text-sm mb-2">
            UNLEASH AI • AMPLIFY FREEDOM • DOMINATE MARKETS
          </p>
          <p className="text-gray-500 text-xs">© 2024 AI Freedom Studios LLC</p>
        </CardContent>
      </Card>
    </div>
  );
}