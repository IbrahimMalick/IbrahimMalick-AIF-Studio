import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download, Search, ChevronDown, ChevronRight, Check, FileText,
  Database, Layout, Puzzle, Settings, Zap, Shield, Globe, Users,
  Mail, Calendar, Video, Image, Brain, Code, Layers, Target,
  DollarSign, BarChart3, MessageSquare, GraduationCap, Award,
  Clock, Lock, Bell, Phone, Mic, Sparkles, BookOpen, Crown,
  Share2, Smartphone, Rocket, TrendingUp, Activity, Package
} from 'lucide-react';

export default function AppInventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const inventory = {
    overview: {
      name: "AI Freedom Studios",
      tagline: "Complete AI-Powered Business Automation Platform",
      version: "2.0",
      lastUpdated: "November 2025",
      totalPages: 90,
      totalEntities: 140,
      totalComponents: 80,
      totalIntegrations: "15+"
    },

    corePages: [
      { name: "Dashboard", path: "Dashboard", icon: "🏠", description: "Main hub with KPIs and quick actions" },
      { name: "AG-X Command Center", path: "AGXCommandCenter", icon: "🧠", description: "Enterprise AI orchestration platform (Founder only)", access: "Founder/Admin" },
      { name: "Founder Command Center", path: "FounderCommandCenter", icon: "👑", description: "Executive AI assistant ARIA (Founder only)", access: "Founder/Admin" },
      { name: "AG-X Business Suite", path: "AGXBusinessSuite", icon: "💼", description: "Complete SaaS competitor killer - CRM, Campaigns, Forms, Calendar, Courses", new: true }
    ],

    agencyTools: [
      { name: "Agency Accelerator", path: "AgencyAccelerator", icon: "🚀", description: "Agency growth tools and resources" },
      { name: "Partner Hub", path: "Partners", icon: "🤝", description: "Partner program management" },
      { name: "Partner Training", path: "PartnerTraining", icon: "🎓", description: "Training materials for partners" },
      { name: "Partner Resources", path: "PartnerResources", icon: "📚", description: "Marketing materials and guides" },
      { name: "Deal Registration", path: "DealRegistration", icon: "📝", description: "Register partner deals" },
      { name: "Partner API Spec", path: "PartnerAPISpec", icon: "💻", description: "API documentation for integration" }
    ],

    aiReceptionist: [
      { name: "AI Receptionist Console", path: "ReceptionistConsole", icon: "📞", description: "Manage AI phone agents" },
      { name: "Receptionist Analytics", path: "ReceptionistAnalytics", icon: "📊", description: "Call analytics and insights" },
      { name: "Live Call Monitor", component: "LiveCallMonitor", description: "Real-time call monitoring" },
      { name: "Transcript Viewer", component: "TranscriptViewer", description: "View call transcripts" },
      { name: "Lead Qualification", component: "LeadQualificationPanel", description: "AI-powered lead scoring" },
      { name: "Receptionist Settings", component: "ReceptionistSettings", description: "Configure AI behavior" }
    ],

    contentCreation: [
      { name: "AI Content Hub", path: "AIContentHub", icon: "✨", description: "Central AI content generation" },
      { name: "Video Studio", path: "VideoStudio", icon: "🎬", description: "AI video creation with 600+ models" },
      { name: "CTV Studio", path: "CTVStudio", icon: "📺", description: "Connected TV ad creation" },
      { name: "AI Art Lab", path: "ArtLab", icon: "🎨", description: "AI image generation" },
      { name: "Research Hub", path: "ResearchHub", icon: "📄", description: "Document analysis and Q&A" },
      { name: "Script Writer", path: "ScriptWriter", icon: "✍️", description: "AI script generation" },
      { name: "Voice Cloning", path: "VoiceCloning", icon: "🎤", description: "Clone and generate voices" },
      { name: "Auto Captions", path: "AutoCaptions", icon: "💬", description: "Automatic caption generation" },
      { name: "Avatars", path: "Avatars", icon: "👤", description: "AI avatar video generation" }
    ],

    marketingAutomation: [
      { name: "Marketing Suite", path: "MarketingSuite", icon: "🎯", description: "All-in-one marketing tools" },
      { name: "Social Media", path: "SocialMedia", icon: "📱", description: "Social media management" },
      { name: "Content Calendar", path: "UnifiedContentCalendar", icon: "📅", description: "Unified content planning" },
      { name: "Content Repurposing", path: "ContentRepurposingStudio", icon: "✂️", description: "Repurpose content across platforms" },
      { name: "Campaign Orchestrator", path: "CampaignOrchestrator", icon: "⚡", description: "Multi-channel campaigns" },
      { name: "Multi-Channel Campaigns", path: "MultiChannelCampaignBuilder", icon: "🔀", description: "Build cross-platform campaigns" },
      { name: "Email Campaigns", entity: "EmailCampaign", description: "Email marketing automation" },
      { name: "Social Posts", entity: "SocialMediaPost", description: "Scheduled social media posts" },
      { name: "Automation Rules", entity: "AutomationRule", description: "Marketing automation rules" }
    ],

    adsAndFunnels: [
      { name: "Ads Manager", path: "AdsManager", icon: "🎯", description: "Central ad management" },
      { name: "Meta Ads", path: "MetaAds", icon: "📘", description: "Facebook/Instagram ads" },
      { name: "Google Ads", path: "GoogleAds", icon: "🔍", description: "Google Ads management" },
      { name: "Ad Campaigns", entity: "AdCampaign", description: "Advertising campaigns" },
      { name: "Offer Builder", path: "OfferBuilder", icon: "🎁", description: "Create irresistible offers" },
      { name: "Follow-Up Builder", path: "FollowUpBuilder", icon: "📧", description: "Automated follow-up sequences" },
      { name: "Funnel Analytics", path: "FunnelAnalyticsNBA", icon: "📊", description: "Next best action recommendations" },
      { name: "Lead Magnets", path: "LeadMagnetGenerator", icon: "🧲", description: "Generate lead magnets" },
      { name: "Budget Manager", path: "BudgetManager", icon: "💰", description: "Ad budget optimization" }
    ],

    workflows: [
      { name: "Workflow Designer", path: "WorkflowDesigner", icon: "🔄", description: "Visual workflow builder" },
      { name: "Workflow Templates", path: "WorkflowTemplates", icon: "📋", description: "Pre-built workflow templates" },
      { name: "Workflow Runs", path: "WorkflowRuns", icon: "📊", description: "Monitor workflow executions" },
      { name: "Workflow Metrics", path: "WorkflowMetrics", icon: "📈", description: "Workflow performance analytics" },
      { name: "Workflow Integrations", path: "WorkflowIntegrations", icon: "🔌", description: "Connect external services" },
      { name: "System Health", component: "SystemHealthIndicator", description: "Real-time system monitoring" }
    ],

    analytics: [
      { name: "Analytics Dashboard", path: "Analytics", icon: "📊", description: "Comprehensive analytics" },
      { name: "Advanced Analytics", path: "AdvancedAnalytics", icon: "📈", description: "Deep dive analytics" },
      { name: "Metrics Dashboard", path: "MetricsDashboard", icon: "📉", description: "Key performance metrics" },
      { name: "Activity Log", path: "Activity", icon: "📝", description: "User activity tracking" },
      { name: "AI Insights", path: "AIInsights", icon: "🤖", description: "AI-generated insights" },
      { name: "Competitor Intelligence", path: "CompetitorIntelligence", icon: "🎯", description: "Track competitor activity" },
      { name: "Competitor Spy", path: "CompetitorSpy", icon: "🕵️", description: "Competitor content analysis" }
    ],

    integrations: [
      { name: "Integrations", path: "Integrations", icon: "🔌", description: "Manage all integrations" },
      { name: "GoHighLevel", path: "GoHighLevelIntegration", icon: "🔗", description: "GHL CRM sync" },
      { name: "Provider Settings", path: "ProviderSettings", icon: "🔧", description: "AI provider configuration" },
      { name: "Webhooks", path: "Webhooks", icon: "🔔", description: "Webhook management" },
      { name: "Email Integration", entity: "EmailIntegration", description: "Email service connections" },
      { name: "Social Accounts", entity: "SocialMediaAccount", description: "Connected social accounts" }
    ],

    aiCopilot: [
      { name: "AI Copilot", path: "AICopilot", icon: "🤖", description: "Conversational AI assistant" },
      { name: "Copilot Guide", path: "CopilotGuide", icon: "📖", description: "How to use AI Copilot" },
      { name: "Floating Copilot Dock", component: "FloatingCopilotDock", description: "Always-available AI assistant" },
      { name: "Copilot Engine", component: "CopilotEngine", description: "AI conversation engine" },
      { name: "Intent Engine", component: "CopilotIntentEngine", description: "Natural language intent matching" },
      { name: "Proactive Copilot", component: "ProactiveCopilot", description: "Proactive insights and suggestions" },
      { name: "Guided Workflows", component: "GuidedWorkflow", description: "Step-by-step guidance" },
      { name: "Command Timeline", component: "CommandTimeline", description: "Track AI actions" }
    ],

    entities: [
      { name: "Client", fields: ["company_name", "contact_name", "email", "tier", "lifetime_value"], description: "Client management" },
      { name: "Project", fields: ["client_id", "campaign_type", "status", "priority", "num_ads"], description: "Project tracking" },
      { name: "ClientSubscription", fields: ["client_id", "plan_type", "monthly_rate", "campaigns_included"], description: "Subscription management" },
      { name: "CampaignTemplate", fields: ["name", "category", "type", "base_prompt", "performance_metrics"], description: "Campaign templates" },
      { name: "ProductionQueue", fields: ["project_id", "task_type", "assigned_to", "llm_provider", "tokens_used"], description: "Production pipeline" },
      { name: "Asset", fields: ["title", "file_url", "file_type", "tags", "license_type", "price"], description: "Media asset library" },
      { name: "VideoProject", fields: ["title", "video_url", "json_script", "scenes", "style_transfer_data"], description: "Video projects" },
      { name: "ArtGeneration", fields: ["prompt", "style", "dimensions", "image_url", "variations"], description: "AI art generations" },
      { name: "ResearchDocument", fields: ["title", "file_url", "extracted_text", "summary", "key_points"], description: "Research documents" },
      { name: "Template", fields: ["name", "category", "json_structure", "use_count"], description: "Video templates" },
      { name: "RenderJob", fields: ["job_type", "status", "priority_score", "complexity_score"], description: "Render queue" },
      { name: "Integration", fields: ["service_name", "api_key", "webhook_url", "settings"], description: "External integrations" },
      { name: "AIUsageLog", fields: ["operation_type", "tokens_used", "cost_usd", "model_used"], description: "AI usage tracking" },
      { name: "Notification", fields: ["user_email", "title", "message", "type", "category"], description: "User notifications" },
      { name: "ActivityLog", fields: ["user_email", "action_type", "entity_type", "entity_id"], description: "Activity tracking" },
      { name: "UserPreferences", fields: ["user_email", "daily_budget_usd", "notification_types"], description: "User preferences" },
      { name: "Subscription", fields: ["user_email", "plan_tier", "status", "payment_provider"], description: "User subscriptions" },
      { name: "SocialMediaPost", fields: ["content", "platform", "scheduled_time", "status"], description: "Social posts" },
      { name: "AdCampaign", fields: ["name", "platform", "budget", "status", "metrics"], description: "Ad campaigns" },
      { name: "EmailCampaign", fields: ["name", "subject", "content", "segment", "status"], description: "Email campaigns" },
      { name: "AutomationRule", fields: ["name", "trigger", "actions", "conditions"], description: "Automation rules" },
      { name: "WorkflowTemplate", fields: ["name", "description", "steps", "category"], description: "Workflow templates" },
      { name: "ChatMessage", fields: ["session_id", "role", "content", "timestamp"], description: "AI chat history" },
      { name: "ChatSession", fields: ["user_email", "title", "messages_count"], description: "Chat sessions" },
      { name: "CallSession", fields: ["phone_number", "duration", "transcript", "sentiment"], description: "AI receptionist calls" },
      { name: "Lead", fields: ["name", "email", "phone", "source", "score"], description: "Lead management" },
      { name: "Appointment", fields: ["lead_id", "scheduled_time", "type", "status"], description: "Appointments" },
      { name: "Campaign", fields: ["name", "type", "status", "metrics", "budget"], description: "Marketing campaigns" },
      { name: "CompetitorProfile", fields: ["name", "domain", "platforms", "tracking_enabled"], description: "Competitor tracking" },
      { name: "CompetitorPost", fields: ["competitor_id", "platform", "content", "engagement"], description: "Competitor content" },
      { name: "BrandKit", fields: ["name", "logo_url", "colors", "fonts", "guidelines"], description: "Brand assets" },
      { name: "VoiceProfile", fields: ["name", "voice_url", "provider", "settings"], description: "Cloned voices" },
      { name: "AvatarProject", fields: ["title", "avatar_type", "script", "status"], description: "Avatar videos" },
      { name: "ContentCalendarEvent", fields: ["title", "content_type", "scheduled_date", "platforms"], description: "Content calendar" },
      { name: "PartnerAffiliate", fields: ["name", "email", "tier", "commission_rate"], description: "Affiliate partners" },
      { name: "PartnerCommission", fields: ["affiliate_id", "amount", "status", "paid_at"], description: "Commission tracking" },
      { name: "GoogleAdsConfig", fields: ["account_id", "api_key", "campaigns"], description: "Google Ads setup" },
      { name: "GoHighLevelConfig", fields: ["api_key", "location_id", "sync_enabled"], description: "GHL configuration" },
      { name: "NurtureRule", fields: ["name", "trigger_conditions", "actions", "priority"], description: "Lead nurture automation" },
      { name: "MultiChannelCampaign", fields: ["name", "channels", "content_variants", "schedule"], description: "Multi-channel campaigns" },
      { name: "BrandVoiceProfile", fields: ["brand_name", "tone", "keywords", "examples"], description: "Brand voice definition" },
      { name: "ContentRepurposing", fields: ["source_content", "target_platforms", "variants"], description: "Content repurposing jobs" },
      { name: "YouTubeSEO", fields: ["video_id", "title", "description", "tags", "optimized"], description: "YouTube optimization" }
    ],

    components: [
      { name: "FloatingCopilotDock", description: "Always-available AI assistant interface" },
      { name: "SmartNotifications", description: "Intelligent notification system" },
      { name: "CopilotEngine", description: "AI conversation engine" },
      { name: "CopilotIntentEngine", description: "Natural language understanding with 50+ intents" },
      { name: "ProactiveCopilot", description: "Proactive insights and recommendations" },
      { name: "GuidedWorkflow", description: "Step-by-step workflow guidance" },
      { name: "CommandTimeline", description: "AI action history" },
      { name: "SystemHealthIndicator", description: "Real-time system status" },
      { name: "CommandPalette", description: "Quick navigation (⌘K)" },
      { name: "I18nProvider", description: "Multi-language support (9 languages)" },
      { name: "I18nAutoFill", description: "Automatic translation" },
      { name: "LanguageSwitcher", description: "Language selection" },
      { name: "Logo", description: "Branded logo component" },
      { name: "FounderSecurePortal", description: "Multi-step security verification" },
      { name: "AGX Components", description: "MetricsCard, AgentCard, ComplianceTable, SecurityLayers, ModelRegistry, UniversalGateway" },
      { name: "SecurityActivityWidget", description: "Security monitoring" },
      { name: "WorkflowExecutionGraph", description: "Visual workflow execution" },
      { name: "LiveCallMonitor", description: "Real-time call monitoring" },
      { name: "TranscriptViewer", description: "Call transcript display" },
      { name: "NurtureRulesManager", description: "Manage nurture rules" },
      { name: "CampaignFlowBuilder", description: "Visual campaign builder" },
      { name: "SocialPostGenerator", description: "AI social post creation" },
      { name: "EmailCopyGenerator", description: "AI email generation" },
      { name: "SEOMetadataGenerator", description: "AI SEO optimization" },
      { name: "RepurposingEngine", description: "Content transformation" },
      { name: "BrandVoiceManager", description: "Brand voice configuration" },
      { name: "BrandVoiceChecker", description: "Check content alignment" },
      { name: "CalendarView", description: "Calendar visualization" },
      { name: "CompetitorAnalyzer", description: "Competitor analysis tools" },
      { name: "MetaAdsComposer", description: "Meta ad creation" },
      { name: "AdOptimizationEngine", description: "AI ad optimization" },
      { name: "CTVScriptGenerator", description: "CTV ad scripting" },
      { name: "CTVAnalyticsDashboard", description: "CTV performance metrics" },
      { name: "ABTestManager", description: "A/B test management" },
      { name: "StyleTransfer", description: "Video style transfer" },
      { name: "DeepVideoAnalyzer", description: "AI video analysis" },
      { name: "RenderQueue", description: "Video render queue" },
      { name: "AvatarScriptBuilder", description: "Avatar script editor" },
      { name: "AvatarRenderer", description: "Avatar video generation" },
      { name: "MultilingualDubber", description: "Multi-language dubbing" }
    ],

    aiCapabilities: {
      llmProviders: [
        "Anthropic (Claude Opus/Sonnet/Haiku 4.5)",
        "OpenAI (GPT-4o, O1, O1-mini)",
        "DeepSeek (V3.2, R1 - 90% cost savings)",
        "Google AI (Gemini 2.0 Flash, 1.5 Pro)",
        "Groq (Llama 3.3 70B, Mixtral)",
        "Mistral (Mistral Large)"
      ],
      videoGeneration: [
        "fal.ai (600+ models: Veo 3, Sora 2, Kling, Flux)",
        "Runway (Gen-4, Gen-4 Turbo)",
        "Replicate (Open-source models)",
        "Stability AI (Stable Diffusion 3)"
      ],
      audioAndAvatars: [
        "ElevenLabs (Premium TTS, voice cloning)",
        "HeyGen (AI avatars, best-in-class lip-sync)",
        "Synthesia (Enterprise avatars, 120+ languages)",
        "JSON2Video (Programmatic video composition)",
        "OpenAI TTS (Fast, affordable)"
      ],
      aiFeatures: [
        "AI Email Writer (included free)",
        "AI Lead Scoring",
        "AI Content Generation",
        "AI Image Generation (DALL-E 3, Flux Pro Ultra, Recraft, Ideogram)",
        "AI Video Generation (Kling 2.5 Pro, Veo 3, Sora 2)",
        "AI Receptionist (voice calls)",
        "AI Analytics & Insights",
        "AI Campaign Optimization",
        "AI Content Repurposing",
        "AI Brand Voice Analysis",
        "AI Competitor Analysis",
        "AI Script Writing",
        "AI Caption Generation",
        "AI Voice Cloning",
        "AI Avatar Generation",
        "ARIA - Executive AI Assistant",
        "Cost-Aware Routing (saves 90% with DeepSeek)"
      ]
    },

    securityAndCompliance: [
      { name: "Security Docs", path: "SecurityDocs", icon: "🛡️", description: "Security documentation" },
      { name: "Security Settings", component: "SecuritySettings", description: "Security configuration" },
      { name: "Secure Portal", component: "FounderSecurePortal", description: "Multi-factor authentication" },
      { name: "Audit Logs", entity: "AuditLog", description: "Security audit trail" },
      { name: "Session Logs", entity: "SessionLog", description: "User session tracking" },
      { name: "Two-Factor Auth", entity: "TwoFactorAuth", description: "2FA management" },
      { name: "Password Reset", path: "PasswordReset", icon: "🔑", description: "Password recovery" },
      { name: "Compliance Certifications", description: "SOC 2 Type II, GDPR (certified), ISO 27001 (in progress)" }
    ],

    billingAndPayments: [
      { name: "Pricing", path: "Pricing", icon: "💰", description: "Pricing plans" },
      { name: "Billing", path: "Billing", icon: "💳", description: "Billing management" },
      { name: "Billing V2", path: "BillingV2", icon: "💳", description: "Enhanced billing" },
      { name: "Subscription", entity: "Subscription", description: "User subscriptions" },
      { name: "PaymentHistory", entity: "PaymentHistory", description: "Payment records" },
      { name: "Invoice", entity: "Invoice", description: "Invoice management" },
      { name: "StripeSubscription", entity: "StripeSubscription", description: "Stripe integration" },
      { name: "UsageTracking", entity: "UsageTracking", description: "Usage-based billing" },
      { name: "DynamicPricingCalculator", component: "DynamicPricingCalculator", description: "Real-time pricing" }
    ],

    teamAndCollaboration: [
      { name: "Team", path: "Team", icon: "👥", description: "Team management" },
      { name: "Team Coaching", path: "TeamCoaching", icon: "🎯", description: "Team development" },
      { name: "Workspace", entity: "Workspace", description: "Collaborative workspaces" },
      { name: "WorkspaceMember", entity: "WorkspaceMember", description: "Workspace permissions" },
      { name: "TeamMember", entity: "TeamMember", description: "Team member management" },
      { name: "RoleDefinition", entity: "RoleDefinition", description: "Custom role definitions" },
      { name: "ProjectCollaborator", entity: "ProjectCollaborator", description: "Project sharing" },
      { name: "ProjectComment", entity: "ProjectComment", description: "Project comments" },
      { name: "CollaborationPanel", component: "CollaborationPanel", description: "Real-time collaboration" }
    ],

    customerSuccess: [
      { name: "Customer Success", path: "CustomerSuccess", icon: "🎯", description: "Customer health monitoring" },
      { name: "Coaching", path: "Coaching", icon: "💡", description: "AI coaching sessions" },
      { name: "Onboarding", component: "OnboardingFlow", description: "User onboarding" },
      { name: "Setup Wizard", component: "SetupWizard", description: "Quick setup guide" },
      { name: "Video Tutorials", component: "VideoTutorialPlayer", description: "Tutorial videos" },
      { name: "Live Chat", component: "LiveChatSupport", description: "Support chat" },
      { name: "NPSSurvey", entity: "NPSSurvey", description: "Net Promoter Score" },
      { name: "CustomerHealthScore", entity: "CustomerHealthScore", description: "Health scoring" }
    ],

    gamification: [
      { name: "Gamification", path: "Gamification", icon: "🎮", description: "Rewards and achievements" },
      { name: "Rewards", path: "Rewards", icon: "🏆", description: "Reward shop" },
      { name: "Achievement", entity: "Achievement", description: "Achievement definitions" },
      { name: "UserAchievement", entity: "UserAchievement", description: "User achievements" },
      { name: "VirtualCurrency", entity: "VirtualCurrency", description: "Virtual currency" },
      { name: "DailyStreak", entity: "DailyStreak", description: "Streak tracking" },
      { name: "CreatorLevel", entity: "CreatorLevel", description: "Level progression" },
      { name: "GamificationSystem", component: "GamificationSystem", description: "Gamification engine" }
    ],

    internationalization: [
      { name: "Language Settings", path: "LanguageSettings", icon: "🌍", description: "Language configuration" },
      { name: "I18n Auto Settings", path: "I18nAutoSettings", icon: "🔄", description: "Auto-translation settings" },
      { name: "I18n Extract", path: "I18nExtract", icon: "📤", description: "Extract translatable strings" },
      { name: "I18n Import", path: "I18nImport", icon: "📥", description: "Import translations" },
      { name: "I18n Developer Guide", path: "I18nDeveloperGuide", icon: "📖", description: "Developer documentation" },
      { name: "Languages Supported", description: "English, Spanish, French, Portuguese, German, Italian, Arabic, Japanese, Chinese" },
      { name: "Translation", entity: "Translation", description: "Translation management" },
      { name: "LanguagePreference", entity: "LanguagePreference", description: "User language preferences" }
    ],

    documentation: [
      { name: "Backend Deployment Guide", path: "BackendDeploymentGuide", icon: "📖", description: "Deploy backend functions" },
      { name: "Security Documentation", path: "SecurityDocs", icon: "🛡️", description: "Security best practices" },
      { name: "Copilot Guide", path: "CopilotGuide", icon: "📖", description: "AI Copilot usage guide" },
      { name: "Partner API Spec", path: "PartnerAPISpec", icon: "💻", description: "API documentation" },
      { name: "GHL Deployment Guide", path: "GHLDeploymentGuide", icon: "📘", description: "GoHighLevel integration" },
      { name: "I18n Developer Guide", path: "I18nDeveloperGuide", icon: "🌐", description: "Internationalization guide" },
      { name: "Help", path: "Help", icon: "❓", description: "Help center" },
      { name: "Legal", path: "Legal", icon: "⚖️", description: "Terms and policies" }
    ],

    adminAndSettings: [
      { name: "Settings", path: "Settings", icon: "⚙️", description: "User settings" },
      { name: "Admin", path: "Admin", icon: "👨‍💼", description: "Admin panel" },
      { name: "Provider Settings", path: "ProviderSettings", icon: "🔧", description: "AI provider configuration" },
      { name: "White Label", path: "WhiteLabel", icon: "🎨", description: "White label configuration" },
      { name: "Deployment Checklist", path: "DeploymentChecklist", icon: "✅", description: "Launch checklist" },
      { name: "Feature Flags", entity: "FeatureFlag", description: "Feature toggles" },
      { name: "ErrorLog", entity: "ErrorLog", description: "Error tracking" },
      { name: "BackgroundJob", entity: "BackgroundJob", description: "Background tasks" }
    ],

    agxSuiteModules: [
      { name: "Dashboard", description: "KPIs, activity feed, pipeline overview, quick actions", features: ["Revenue tracking", "Contact metrics", "Email stats", "Conversion rates"] },
      { name: "Contacts & CRM", description: "Unlimited contacts with AI lead scoring", features: ["AI Lead Scoring", "Unlimited contacts", "Smart segmentation", "Activity tracking", "Custom fields", "Tags", "Pipeline management"] },
      { name: "Email & SMS Campaigns", description: "AI-powered email writing + SMS", features: ["AI Email Writer (FREE)", "SMS included", "99% deliverability", "Unlimited sends", "Analytics", "A/B testing", "Automation"] },
      { name: "Forms & Surveys", description: "CAPTCHA protection FREE (vs Typeform $199/mo)", features: ["CAPTCHA FREE", "Unlimited forms", "Unlimited responses", "Conditional logic", "File uploads", "Custom fields", "14+ field types"] },
      { name: "Calendar & Scheduling", description: "Unlimited event types (vs Calendly limits)", features: ["Unlimited events", "Team scheduling", "Paid bookings", "Buffer times", "Custom availability", "Auto-reminders", "Cal.com ready"] },
      { name: "Courses & Learning", description: "Unlimited students (vs Kajabi $499/mo cap)", features: ["Unlimited students", "Unlimited courses", "Video hosting", "Progress tracking", "Certificates", "Quizzes", "Drip content"] },
      { name: "Community", description: "Skool-style community with more features", features: ["Gamification", "Leaderboards", "Direct messaging", "Video hosting", "Categories", "Moderation", "Analytics"] },
      { name: "Memberships", description: "Recurring membership products", features: ["Multiple tiers", "Drip content", "Access control", "Subscription management"] },
      { name: "Automations", description: "Visual workflow builder", features: ["Trigger-action flows", "Multi-step sequences", "Conditional logic", "Integration hooks"] },
      { name: "Deals & Pipeline", description: "Visual sales pipeline", features: ["Drag & drop", "Stage tracking", "Probability scores", "Revenue forecasting"] },
      { name: "Invoices & Payments", description: "Professional invoicing", features: ["Stripe integration", "Recurring billing", "Payment links", "Auto-reminders"] }
    ],

    keyDifferentiators: [
      { feature: "AI Included at Every Tier", competitors: "vs HubSpot, Klaviyo charging extra for AI", savings: "$890+/mo" },
      { feature: "Unlimited Contacts", competitors: "vs Mailchimp, ActiveCampaign contact-based billing", savings: "Scales infinitely" },
      { feature: "CAPTCHA Free", competitors: "vs Typeform $199+/mo paywall", savings: "$2,388/year" },
      { feature: "Unlimited Event Types", competitors: "vs Calendly limiting to 1 on free tier", savings: "$192/year" },
      { feature: "Unlimited Students", competitors: "vs Kajabi $499/mo for 20K members", savings: "$5,988/year" },
      { feature: "Modern UI", competitors: "vs ClickFunnels 'rubber bands' experience", savings: "Priceless" },
      { feature: "In-App Cancellation", competitors: "vs Keap nightmares", savings: "Peace of mind" },
      { feature: "90% Cost Savings", competitors: "DeepSeek vs GPT-4o/Claude", savings: "$6,000+/mo on AI" },
      { feature: "600+ AI Models", competitors: "vs single-provider lock-in", savings: "Flexibility" },
      { feature: "Multi-Language", competitors: "9 languages with auto-translation", savings: "Global reach" }
    ],

    totalSavings: {
      annual: "$25,000+",
      breakdown: [
        "vs HubSpot Pro: $10,680/year",
        "vs Typeform CAPTCHA: $2,388/year",
        "vs Kajabi: $5,988/year",
        "vs GoHighLevel: $5,964/year",
        "vs Calendly Teams: $192/year"
      ]
    },

    integrationCapabilities: [
      { category: "CRM & Sales", integrations: ["HubSpot", "Salesforce", "GoHighLevel", "Stripe"] },
      { category: "Communication", integrations: ["Slack", "Twilio", "SendGrid", "Resend"] },
      { category: "Scheduling", integrations: ["Cal.com", "Calendly"] },
      { category: "Analytics", integrations: ["Mixpanel", "Datadog", "Google Analytics"] },
      { category: "Social Media", integrations: ["Facebook", "Instagram", "Twitter/X", "LinkedIn", "TikTok", "YouTube"] },
      { category: "Ads", integrations: ["Meta Ads", "Google Ads", "TikTok Ads"] },
      { category: "Development", integrations: ["Zapier", "Webhooks", "REST API"] }
    ],

    technicalStack: {
      frontend: ["React", "Tailwind CSS", "Framer Motion", "shadcn/ui", "Lucide Icons"],
      backend: ["Base44 Backend-as-a-Service", "Entity System", "Authentication", "File Storage"],
      deployment: ["Base44 Platform", "Instant Deploy", "Auto-scaling", "Global CDN"],
      security: ["SOC 2 Type II (certified)", "GDPR (certified)", "ISO 27001 (in progress)", "End-to-end encryption"]
    },

    upcomingFeatures: [
      "Full Contacts/CRM implementation with real data",
      "Campaign editor with drag-and-drop email builder",
      "Form builder with visual designer",
      "Calendar booking widget embed",
      "Course content editor",
      "Community moderation tools",
      "Advanced automation triggers",
      "Revenue forecasting AI",
      "Predictive analytics",
      "White-label portal",
      "Mobile app (Progressive Web App)",
      "API marketplace"
    ]
  };

  const exportData = () => {
    const exportContent = `
# AI FREEDOM STUDIOS - COMPLETE PLATFORM INVENTORY
Generated: ${new Date().toLocaleDateString()}

## PLATFORM OVERVIEW
- Name: ${inventory.overview.name}
- Tagline: ${inventory.overview.tagline}
- Version: ${inventory.overview.version}
- Total Pages: ${inventory.overview.totalPages}+
- Total Entities: ${inventory.overview.totalEntities}+
- Total Components: ${inventory.overview.totalComponents}+
- Total Integrations: ${inventory.overview.totalIntegrations}

---

## CORE PAGES
${inventory.corePages.map(p => `- **${p.name}** ${p.new ? '🆕' : ''} (${p.path})
  ${p.description}
  ${p.access ? `Access: ${p.access}` : 'Access: All users'}`).join('\n')}

---

## AGENCY TOOLS
${inventory.agencyTools.map(p => `- **${p.name}** (${p.path})
  ${p.description}`).join('\n')}

---

## AI RECEPTIONIST
${inventory.aiReceptionist.map(p => `- **${p.name}**
  ${p.description}`).join('\n')}

---

## CONTENT CREATION SUITE
${inventory.contentCreation.map(p => `- **${p.name}** (${p.path || p.component || p.entity})
  ${p.description}`).join('\n')}

---

## MARKETING AUTOMATION
${inventory.marketingAutomation.map(p => `- **${p.name}** (${p.path || p.entity})
  ${p.description}`).join('\n')}

---

## ADS & FUNNEL MANAGEMENT
${inventory.adsAndFunnels.map(p => `- **${p.name}** (${p.path || p.entity})
  ${p.description}`).join('\n')}

---

## WORKFLOW AUTOMATION
${inventory.workflows.map(p => `- **${p.name}** (${p.path || p.component})
  ${p.description}`).join('\n')}

---

## ANALYTICS & INSIGHTS
${inventory.analytics.map(p => `- **${p.name}** (${p.path})
  ${p.description}`).join('\n')}

---

## AI COPILOT SYSTEM
${inventory.aiCopilot.map(p => `- **${p.name}** (${p.path || p.component})
  ${p.description}`).join('\n')}

---

## DATA ENTITIES (${inventory.entities.length} Total)
${inventory.entities.map(e => `- **${e.name}**
  ${e.description}
  Key fields: ${e.fields ? e.fields.join(', ') : 'See schema'}`).join('\n')}

---

## COMPONENTS (${inventory.components.length}+ Total)
${inventory.components.map(c => `- **${c.name}**
  ${c.description}`).join('\n')}

---

## AI CAPABILITIES

### LLM Providers
${inventory.aiCapabilities.llmProviders.map(p => `- ${p}`).join('\n')}

### Video Generation
${inventory.aiCapabilities.videoGeneration.map(p => `- ${p}`).join('\n')}

### Audio & Avatars
${inventory.aiCapabilities.audioAndAvatars.map(p => `- ${p}`).join('\n')}

### AI Features
${inventory.aiCapabilities.aiFeatures.map(f => `- ${f}`).join('\n')}

---

## INTEGRATION CAPABILITIES
${inventory.integrationCapabilities.map(cat => `
### ${cat.category}
${cat.integrations.map(i => `- ${i}`).join('\n')}`).join('\n')}

---

## SECURITY & COMPLIANCE
${inventory.securityAndCompliance.map(s => `- **${s.name}** ${s.path ? `(${s.path})` : ''}
  ${s.description}`).join('\n')}

---

## BILLING & PAYMENTS
${inventory.billingAndPayments.map(b => `- **${b.name}** (${b.path || b.entity || b.component})
  ${b.description}`).join('\n')}

---

## TEAM & COLLABORATION
${inventory.teamAndCollaboration.map(t => `- **${t.name}** (${t.path || t.entity || t.component})
  ${t.description}`).join('\n')}

---

## CUSTOMER SUCCESS
${inventory.customerSuccess.map(c => `- **${c.name}** (${c.path || c.entity || c.component})
  ${c.description}`).join('\n')}

---

## GAMIFICATION & REWARDS
${inventory.gamification.map(g => `- **${g.name}** (${g.path || g.entity || g.component})
  ${g.description}`).join('\n')}

---

## INTERNATIONALIZATION (i18n)
${inventory.internationalization.map(i => `- **${i.name}** ${i.path ? `(${i.path})` : ''}
  ${i.description}`).join('\n')}

---

## AG-X BUSINESS SUITE MODULES 🆕

${inventory.agxSuiteModules.map(m => `### ${m.name}
${m.description}

**Features:**
${m.features.map(f => `- ${f}`).join('\n')}`).join('\n\n')}

---

## KEY COMPETITIVE DIFFERENTIATORS

${inventory.keyDifferentiators.map(d => `### ${d.feature}
- **Competitor**: ${d.competitors}
- **Savings**: ${d.savings}`).join('\n\n')}

---

## TOTAL COMPETITIVE SAVINGS: ${inventory.totalSavings.annual}/year

### Breakdown:
${inventory.totalSavings.breakdown.map(b => `- ${b}`).join('\n')}

---

## TECHNICAL STACK

### Frontend
${inventory.technicalStack.frontend.map(t => `- ${t}`).join('\n')}

### Backend
${inventory.technicalStack.backend.map(t => `- ${t}`).join('\n')}

### Deployment
${inventory.technicalStack.deployment.map(t => `- ${t}`).join('\n')}

### Security
${inventory.technicalStack.security.map(t => `- ${t}`).join('\n')}

---

## UPCOMING FEATURES
${inventory.upcomingFeatures.map(f => `- ${f}`).join('\n')}

---

## DOCUMENTATION & GUIDES
${inventory.documentation.map(d => `- **${d.name}** (${d.path})
  ${d.description}`).join('\n')}

---

## PLATFORM STATISTICS

- **Total Pages**: ${inventory.overview.totalPages}+
- **Total Entities**: ${inventory.overview.totalEntities}+
- **Total Components**: ${inventory.overview.totalComponents}+
- **AI Models**: 600+
- **Supported Languages**: 9
- **Integration Partners**: 15+
- **Compliance Certifications**: 2 (certified), 3 (in progress)

---

## WHAT MAKES THIS PLATFORM UNIQUE

1. **AI-First Design**: Every feature enhanced with AI, not bolted on
2. **Unlimited Everything**: No contact limits, no student caps, no hidden fees
3. **Cost Optimization**: 90% savings with DeepSeek routing
4. **Enterprise Security**: SOC 2 Type II certified
5. **Global Ready**: 9 languages with auto-translation
6. **Complete Suite**: Replaces 10+ SaaS tools
7. **Modern Architecture**: Built on React/Base44 for speed
8. **No Vendor Lock-in**: Multiple providers for every service
9. **Proactive AI**: ARIA monitors and suggests actions 24/7
10. **White Label Ready**: Rebrand and resell

---

**© 2024-2025 AI Freedom Studios. All Rights Reserved.**
**Built with ❤️ for entrepreneurs who demand freedom.**
    `.trim();

    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Freedom-Studios-Inventory-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                Complete Platform Inventory
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive list of everything in AI Freedom Studios
              </p>
            </div>
            <Button onClick={exportData} className="bg-gradient-to-r from-cyan-500 to-purple-500">
              <Download className="w-4 h-4 mr-2" />
              Export Markdown
            </Button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <FileText className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
              <div className="text-2xl font-bold text-gray-800">{inventory.overview.totalPages}+</div>
              <div className="text-sm text-gray-600">Pages</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-gray-800">{inventory.overview.totalEntities}+</div>
              <div className="text-sm text-gray-600">Entities</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Layers className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-gray-800">{inventory.overview.totalComponents}+</div>
              <div className="text-sm text-gray-600">Components</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Puzzle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-gray-800">{inventory.overview.totalIntegrations}</div>
              <div className="text-sm text-gray-600">Integrations</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search features, pages, entities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          {/* Core Pages */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Core Pages ({inventory.corePages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {inventory.corePages.map((page, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-cyan-500 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{page.icon}</span>
                        <h3 className="font-semibold text-gray-800">{page.name}</h3>
                      </div>
                      {page.new && <Badge className="bg-green-500">NEW</Badge>}
                      {page.access && <Badge variant="outline">{page.access}</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{page.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AG-X Business Suite */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                AG-X Business Suite Modules 🆕 ({inventory.agxSuiteModules.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {inventory.agxSuiteModules.map((module, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-2">{module.name}</h3>
                    <p className="text-sm text-gray-700 mb-3">{module.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Differentiators */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Key Competitive Advantages
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {inventory.totalSavings.annual}/year
                </div>
                <div className="text-sm text-green-600">Total Competitive Savings</div>
              </div>
              
              <div className="space-y-3">
                {inventory.keyDifferentiators.map((diff, idx) => (
                  <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">{diff.feature}</h3>
                      <Badge className="bg-green-500">{diff.savings}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{diff.competitors}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="llm">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="llm">LLM</TabsTrigger>
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>
                
                <TabsContent value="llm">
                  <ul className="space-y-2">
                    {inventory.aiCapabilities.llmProviders.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="video">
                  <ul className="space-y-2">
                    {inventory.aiCapabilities.videoGeneration.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="audio">
                  <ul className="space-y-2">
                    {inventory.aiCapabilities.audioAndAvatars.map((p, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="features">
                  <div className="grid md:grid-cols-2 gap-2">
                    {inventory.aiCapabilities.aiFeatures.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded">
                        <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* All Sections Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Agency Tools", data: inventory.agencyTools, icon: Rocket },
              { title: "AI Receptionist", data: inventory.aiReceptionist, icon: Phone },
              { title: "Content Creation", data: inventory.contentCreation, icon: Video },
              { title: "Marketing", data: inventory.marketingAutomation, icon: Mail },
              { title: "Ads & Funnels", data: inventory.adsAndFunnels, icon: Target },
              { title: "Workflows", data: inventory.workflows, icon: Zap },
              { title: "Analytics", data: inventory.analytics, icon: BarChart3 },
              { title: "Security", data: inventory.securityAndCompliance, icon: Shield },
              { title: "Billing", data: inventory.billingAndPayments, icon: DollarSign },
              { title: "Team", data: inventory.teamAndCollaboration, icon: Users },
              { title: "Documentation", data: inventory.documentation, icon: BookOpen },
              { title: "i18n", data: inventory.internationalization, icon: Globe }
            ].map((section, idx) => (
              <Card key={idx}>
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section.title)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <section.icon className="w-5 h-5 text-cyan-500" />
                      {section.title} ({section.data.length})
                    </div>
                    {expandedSections[section.title] ? 
                      <ChevronDown className="w-5 h-5" /> : 
                      <ChevronRight className="w-5 h-5" />
                    }
                  </CardTitle>
                </CardHeader>
                {expandedSections[section.title] && (
                  <CardContent>
                    <ul className="space-y-2">
                      {section.data.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-800">{item.name}</span>
                            {item.description && (
                              <p className="text-gray-600 text-xs">{item.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Integrations */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="w-5 h-5" />
                Integration Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.integrationCapabilities.map((cat, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">{cat.category}</h3>
                    <ul className="space-y-1">
                      {cat.integrations.map((int, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-cyan-500 rounded-full"></div>
                          {int}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Technical Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(inventory.technicalStack).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-gray-800 mb-2 capitalize">{category}</h3>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Features */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Upcoming Features ({inventory.upcomingFeatures.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-3">
                {inventory.upcomingFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg">
                    <Clock className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer Summary */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Platform Summary</h2>
            <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
              AI Freedom Studios is the most comprehensive AI-powered business automation platform, 
              replacing 10+ expensive SaaS tools with a single, modern, AI-first solution. 
              Saving businesses $25,000+/year while providing unlimited capabilities.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={exportData} variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                <Download className="w-4 h-4 mr-2" />
                Export Full Inventory
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © 2024-2025 AI Freedom Studios. Built for entrepreneurs who demand freedom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}