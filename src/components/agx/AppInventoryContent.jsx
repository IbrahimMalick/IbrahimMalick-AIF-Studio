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

export default function AppInventoryContent() {
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

    // COMPLETE FEATURES LIST
    allFeatures: {
      aiAssistants: [
        { name: "ARIA Executive AI", desc: "24/7 proactive AI assistant for founders - monitors KPIs, alerts, suggests actions", tier: "Founder" },
        { name: "AI Copilot", desc: "Conversational AI with 50+ intents - create content, run campaigns, analyze data", tier: "All" },
        { name: "Proactive Copilot", desc: "AI that suggests actions before you ask - detects patterns & opportunities", tier: "Pro+" },
        { name: "Voice Commands", desc: "Speak naturally to control the platform - hands-free operation", tier: "Pro+" },
        { name: "Guided Workflows", desc: "Step-by-step AI guidance for complex tasks", tier: "All" }
      ],
      contentCreation: [
        { name: "AI Video Studio", desc: "Create videos with 600+ AI models - Veo 3, Sora 2, Kling, Runway Gen-4", tier: "All" },
        { name: "AI Image Generation", desc: "DALL-E 3, Flux Pro Ultra, Recraft v3, Ideogram v2, Stable Diffusion 3", tier: "All" },
        { name: "AI Art Lab", desc: "8 artistic styles - photorealistic, digital art, oil painting, anime, 3D render", tier: "All" },
        { name: "AI Script Writer", desc: "Generate video scripts, ad copy, blog posts with brand voice", tier: "All" },
        { name: "AI Avatar Videos", desc: "HeyGen & Synthesia integration - 120+ languages, custom avatars", tier: "Pro+" },
        { name: "Voice Cloning", desc: "ElevenLabs integration - clone any voice, 29+ languages", tier: "Pro+" },
        { name: "Auto Captions", desc: "Automatic caption generation with styling and translation", tier: "All" },
        { name: "Style Transfer", desc: "Apply artistic styles to videos - analyze reference images/videos", tier: "Pro+" },
        { name: "CTV Studio", desc: "Connected TV ad creation optimized for streaming platforms", tier: "Business+" },
        { name: "Content Repurposing", desc: "Transform 1 piece into 10+ - blog to social, video to podcast", tier: "All" }
      ],
      marketingAutomation: [
        { name: "Campaign Orchestrator", desc: "Multi-channel campaign automation with AI optimization", tier: "All" },
        { name: "Email Campaigns", desc: "AI Email Writer FREE, unlimited sends, 99% deliverability", tier: "All" },
        { name: "SMS Campaigns", desc: "SMS marketing included - no per-message fees", tier: "Pro+" },
        { name: "Social Media Scheduler", desc: "Schedule to 6+ platforms - auto-optimize posting times", tier: "All" },
        { name: "Content Calendar", desc: "Unified calendar for all content types with AI suggestions", tier: "All" },
        { name: "A/B Testing", desc: "Automatic A/B testing with AI winner selection", tier: "Pro+" },
        { name: "Lead Magnets", desc: "AI-generated lead magnets - ebooks, checklists, guides", tier: "All" },
        { name: "Follow-Up Sequences", desc: "Automated email/SMS sequences with branching logic", tier: "Pro+" },
        { name: "Brand Voice Manager", desc: "Define and enforce brand voice across all AI content", tier: "Pro+" },
        { name: "Funnel Analytics", desc: "Track conversion funnels with next-best-action AI", tier: "All" }
      ],
      adsManagement: [
        { name: "Meta Ads Manager", desc: "Facebook & Instagram ads - AI creative generation", tier: "All" },
        { name: "Google Ads Manager", desc: "Search, Display, YouTube ads management", tier: "All" },
        { name: "TikTok Ads", desc: "TikTok ad creation and optimization", tier: "Pro+" },
        { name: "Ad Creative AI", desc: "Generate ad images, videos, copy with AI", tier: "All" },
        { name: "Budget Optimizer", desc: "AI budget allocation across campaigns", tier: "Pro+" },
        { name: "Audience Builder", desc: "AI-powered audience segmentation", tier: "All" },
        { name: "Ad Performance AI", desc: "Predictive performance scoring", tier: "Pro+" }
      ],
      crmAndSales: [
        { name: "Unlimited Contacts", desc: "No contact limits - scales infinitely", tier: "All" },
        { name: "AI Lead Scoring", desc: "Automatic lead qualification with conversion prediction", tier: "All" },
        { name: "Pipeline Management", desc: "Visual sales pipeline with AI forecasting", tier: "All" },
        { name: "Smart Segmentation", desc: "AI-powered audience segmentation", tier: "All" },
        { name: "Activity Tracking", desc: "Complete history of all interactions", tier: "All" },
        { name: "Deal Management", desc: "Track deals with probability scoring", tier: "Pro+" },
        { name: "Custom Fields", desc: "Unlimited custom fields per contact", tier: "All" },
        { name: "Tags & Lists", desc: "Organize contacts with tags and lists", tier: "All" }
      ],
      formsAndSurveys: [
        { name: "Unlimited Forms", desc: "Create unlimited forms - no limits", tier: "All" },
        { name: "CAPTCHA Free", desc: "Bot protection included FREE (vs Typeform $199/mo)", tier: "All" },
        { name: "Conditional Logic", desc: "Show/hide fields based on answers", tier: "All" },
        { name: "File Uploads", desc: "Accept file uploads in forms", tier: "All" },
        { name: "14+ Field Types", desc: "Text, email, phone, date, dropdown, rating, etc.", tier: "All" },
        { name: "Unlimited Responses", desc: "No response limits", tier: "All" },
        { name: "Form Analytics", desc: "Completion rates, drop-off analysis", tier: "All" }
      ],
      calendarAndBooking: [
        { name: "Unlimited Event Types", desc: "Create unlimited booking types (vs Calendly 1)", tier: "All" },
        { name: "Team Scheduling", desc: "Round-robin, collective, managed events", tier: "Pro+" },
        { name: "Paid Bookings", desc: "Charge for appointments with Stripe", tier: "Pro+" },
        { name: "Buffer Times", desc: "Set buffer between appointments", tier: "All" },
        { name: "Custom Availability", desc: "Set complex availability rules", tier: "All" },
        { name: "Auto Reminders", desc: "Email & SMS reminders", tier: "All" },
        { name: "Cal.com Integration", desc: "Native Cal.com support", tier: "All" }
      ],
      coursesAndLearning: [
        { name: "Unlimited Courses", desc: "Create unlimited courses", tier: "All" },
        { name: "Unlimited Students", desc: "No student caps (vs Kajabi $499/mo)", tier: "All" },
        { name: "Video Hosting", desc: "Host course videos directly", tier: "All" },
        { name: "Progress Tracking", desc: "Track student progress", tier: "All" },
        { name: "Certificates", desc: "Auto-generate completion certificates", tier: "Pro+" },
        { name: "Quizzes", desc: "Add quizzes to courses", tier: "All" },
        { name: "Drip Content", desc: "Release content on schedule", tier: "Pro+" }
      ],
      community: [
        { name: "Community Spaces", desc: "Skool-style community platform", tier: "Pro+" },
        { name: "Gamification", desc: "Points, badges, levels", tier: "Pro+" },
        { name: "Leaderboards", desc: "Rank members by engagement", tier: "Pro+" },
        { name: "Direct Messaging", desc: "Member-to-member DMs", tier: "Pro+" },
        { name: "Categories", desc: "Organize posts by topic", tier: "Pro+" },
        { name: "Moderation", desc: "Content moderation tools", tier: "Pro+" }
      ],
      aiReceptionist: [
        { name: "24/7 AI Phone Agent", desc: "Answer calls with AI - never miss a lead", tier: "Business+" },
        { name: "Call Transcripts", desc: "Full transcription of all calls", tier: "Business+" },
        { name: "Live Call Monitor", desc: "Monitor calls in real-time", tier: "Business+" },
        { name: "Lead Qualification", desc: "AI qualifies leads on the call", tier: "Business+" },
        { name: "Appointment Booking", desc: "AI books appointments during calls", tier: "Business+" },
        { name: "Call Analytics", desc: "Sentiment analysis, call metrics", tier: "Business+" },
        { name: "Custom Scripts", desc: "Configure AI behavior", tier: "Business+" },
        { name: "Call Transfer", desc: "Transfer to human when needed", tier: "Business+" }
      ],
      workflowAutomation: [
        { name: "Visual Workflow Builder", desc: "Drag-and-drop workflow designer", tier: "All" },
        { name: "Workflow Templates", desc: "Pre-built workflow templates", tier: "All" },
        { name: "Multi-Step Sequences", desc: "Complex automation chains", tier: "All" },
        { name: "Conditional Logic", desc: "If/then branching", tier: "All" },
        { name: "Workflow Metrics", desc: "Track workflow performance", tier: "All" },
        { name: "Dead Letter Queue", desc: "Failed action recovery", tier: "Pro+" },
        { name: "Webhook Triggers", desc: "Trigger from external events", tier: "All" }
      ],
      analyticsAndInsights: [
        { name: "Analytics Dashboard", desc: "Comprehensive business analytics", tier: "All" },
        { name: "AI Insights", desc: "AI-generated insights and recommendations", tier: "All" },
        { name: "Competitor Intelligence", desc: "Track competitor activity and content", tier: "Pro+" },
        { name: "Competitor Spy", desc: "Deep competitor content analysis", tier: "Pro+" },
        { name: "Revenue Tracking", desc: "Track revenue and LTV", tier: "All" },
        { name: "Funnel Analytics", desc: "Conversion funnel visualization", tier: "All" },
        { name: "Custom Reports", desc: "Build custom reports", tier: "Pro+" },
        { name: "Export Data", desc: "Export all data", tier: "All" }
      ],
      agencyTools: [
        { name: "Agency Accelerator", desc: "Complete agency growth toolkit", tier: "Agency" },
        { name: "White Label", desc: "Rebrand platform as your own", tier: "Agency" },
        { name: "Client Portal", desc: "Dedicated client dashboards", tier: "Agency" },
        { name: "Partner Program", desc: "Affiliate/partner management", tier: "Agency" },
        { name: "Deal Registration", desc: "Register and track partner deals", tier: "Agency" },
        { name: "Partner Training", desc: "Training materials for partners", tier: "Agency" },
        { name: "Client Onboarding", desc: "Automated client onboarding", tier: "Agency" },
        { name: "Multi-Client Management", desc: "Manage multiple clients", tier: "Agency" }
      ],
      securityAndCompliance: [
        { name: "SOC 2 Type II", desc: "Enterprise security certification", tier: "All" },
        { name: "GDPR Compliant", desc: "Full GDPR compliance", tier: "All" },
        { name: "Two-Factor Auth", desc: "2FA for all accounts", tier: "All" },
        { name: "Audit Logs", desc: "Complete activity audit trail", tier: "All" },
        { name: "Role-Based Access", desc: "Granular permissions", tier: "All" },
        { name: "Data Encryption", desc: "End-to-end encryption", tier: "All" },
        { name: "SSO Support", desc: "Single sign-on (Enterprise)", tier: "Enterprise" }
      ],
      internationalization: [
        { name: "9 Languages", desc: "EN, ES, FR, PT, DE, IT, AR, JA, ZH", tier: "All" },
        { name: "Auto Translation", desc: "AI-powered translation", tier: "All" },
        { name: "RTL Support", desc: "Right-to-left languages", tier: "All" },
        { name: "Multi-Language Content", desc: "Create content in any language", tier: "All" }
      ],
      integrations: [
        { name: "GoHighLevel", desc: "Full GHL CRM sync", tier: "All" },
        { name: "Stripe", desc: "Payments & subscriptions", tier: "All" },
        { name: "HubSpot", desc: "CRM integration", tier: "Pro+" },
        { name: "Salesforce", desc: "Enterprise CRM sync", tier: "Enterprise" },
        { name: "Slack", desc: "Team notifications", tier: "All" },
        { name: "Twilio", desc: "SMS & voice", tier: "Pro+" },
        { name: "Zapier", desc: "5000+ app integrations", tier: "All" },
        { name: "Webhooks", desc: "Custom integrations", tier: "All" },
        { name: "REST API", desc: "Full API access", tier: "Pro+" }
      ]
    },

    // AI TOOLS COMPLETE LIST
    aiTools: {
      textGeneration: [
        { name: "Claude Opus 4.5", provider: "Anthropic", use: "Complex reasoning, strategy", cost: "Premium" },
        { name: "Claude Sonnet 4.5", provider: "Anthropic", use: "Balanced quality/speed", cost: "Standard" },
        { name: "Claude Haiku 4.5", provider: "Anthropic", use: "Fast responses", cost: "Budget" },
        { name: "GPT-4o", provider: "OpenAI", use: "General purpose, vision", cost: "Standard" },
        { name: "GPT-4o Mini", provider: "OpenAI", use: "Fast, affordable", cost: "Budget" },
        { name: "O1", provider: "OpenAI", use: "Deep reasoning", cost: "Premium" },
        { name: "O1 Mini", provider: "OpenAI", use: "Fast reasoning", cost: "Standard" },
        { name: "DeepSeek V3.2", provider: "DeepSeek", use: "90% cost savings", cost: "Ultra-Budget" },
        { name: "DeepSeek R1", provider: "DeepSeek", use: "Reasoning, code", cost: "Budget" },
        { name: "Gemini 2.0 Flash", provider: "Google", use: "Multimodal, fast", cost: "Standard" },
        { name: "Gemini 1.5 Pro", provider: "Google", use: "Long context", cost: "Standard" },
        { name: "Llama 3.3 70B", provider: "Groq", use: "Open source, fast", cost: "Budget" },
        { name: "Mixtral 8x7B", provider: "Groq", use: "MoE efficiency", cost: "Budget" },
        { name: "Mistral Large", provider: "Mistral", use: "European, multilingual", cost: "Standard" }
      ],
      imageGeneration: [
        { name: "DALL-E 3", provider: "OpenAI", use: "Versatile, concepts", cost: "Standard" },
        { name: "Flux Pro Ultra", provider: "fal.ai", use: "Highest quality", cost: "Premium" },
        { name: "Flux Pro", provider: "fal.ai", use: "Professional quality", cost: "Standard" },
        { name: "Flux Dev", provider: "fal.ai", use: "Fast iterations", cost: "Budget" },
        { name: "Recraft v3", provider: "fal.ai", use: "Design assets, graphics", cost: "Standard" },
        { name: "Ideogram v2", provider: "fal.ai", use: "Text in images, logos", cost: "Standard" },
        { name: "Stable Diffusion 3", provider: "Stability AI", use: "Customizable", cost: "Budget" },
        { name: "Midjourney", provider: "Midjourney", use: "Artistic styles", cost: "Standard" }
      ],
      videoGeneration: [
        { name: "Veo 3", provider: "fal.ai/Google", use: "Cinematic + native audio", cost: "Premium" },
        { name: "Sora 2", provider: "fal.ai/OpenAI", use: "Narrative storytelling", cost: "Premium" },
        { name: "Kling 2.5 Pro", provider: "fal.ai", use: "Product demos, motion", cost: "Standard" },
        { name: "Runway Gen-4", provider: "Runway", use: "Character consistency", cost: "Standard" },
        { name: "Runway Gen-4 Turbo", provider: "Runway", use: "Fast video", cost: "Standard" },
        { name: "Luma Dream Machine", provider: "fal.ai", use: "Quick iterations", cost: "Budget" },
        { name: "MiniMax Hailuo", provider: "fal.ai", use: "Smooth motion", cost: "Standard" },
        { name: "Pika 2.0", provider: "fal.ai", use: "Creative effects", cost: "Standard" },
        { name: "Wan 2.1", provider: "fal.ai", use: "Realistic humans", cost: "Standard" }
      ],
      audioGeneration: [
        { name: "ElevenLabs Multilingual v2", provider: "ElevenLabs", use: "Best quality TTS", cost: "Premium" },
        { name: "ElevenLabs Turbo v2.5", provider: "ElevenLabs", use: "Fast TTS", cost: "Standard" },
        { name: "Voice Cloning", provider: "ElevenLabs", use: "Clone any voice", cost: "Premium" },
        { name: "OpenAI TTS", provider: "OpenAI", use: "Affordable TTS", cost: "Budget" },
        { name: "OpenAI TTS HD", provider: "OpenAI", use: "High quality", cost: "Standard" },
        { name: "Whisper", provider: "OpenAI", use: "Speech-to-text", cost: "Budget" }
      ],
      avatarGeneration: [
        { name: "HeyGen Avatars", provider: "HeyGen", use: "Best lip-sync", cost: "Standard" },
        { name: "HeyGen Custom", provider: "HeyGen", use: "Custom avatars", cost: "Premium" },
        { name: "Synthesia Avatars", provider: "Synthesia", use: "Enterprise, 120+ languages", cost: "Premium" },
        { name: "D-ID", provider: "D-ID", use: "Photo-to-video", cost: "Standard" }
      ],
      videoEditing: [
        { name: "JSON2Video", provider: "JSON2Video", use: "Programmatic editing", cost: "Standard" },
        { name: "Auto Captions", provider: "Internal", use: "Caption generation", cost: "Included" },
        { name: "Style Transfer", provider: "Internal", use: "Apply visual styles", cost: "Included" },
        { name: "Video Stabilization", provider: "Internal", use: "Stabilize footage", cost: "Included" },
        { name: "Color Correction", provider: "Internal", use: "Color grading", cost: "Included" }
      ],
      specializedAI: [
        { name: "ARIA", provider: "Internal", use: "Executive AI assistant", cost: "Founder" },
        { name: "AI Receptionist", provider: "Internal", use: "24/7 phone agent", cost: "Business+" },
        { name: "AI Lead Scoring", provider: "Internal", use: "Predict conversions", cost: "Included" },
        { name: "AI Email Writer", provider: "Internal", use: "Write emails", cost: "FREE" },
        { name: "AI Campaign Optimizer", provider: "Internal", use: "Optimize campaigns", cost: "Included" },
        { name: "AI Content Repurposer", provider: "Internal", use: "Transform content", cost: "Included" },
        { name: "AI Brand Voice", provider: "Internal", use: "Enforce brand tone", cost: "Included" },
        { name: "AI Competitor Analysis", provider: "Internal", use: "Track competitors", cost: "Pro+" },
        { name: "AI Viral Predictor", provider: "Internal", use: "Predict virality", cost: "Pro+" },
        { name: "Cost-Aware Router", provider: "Internal", use: "90% AI cost savings", cost: "Included" }
      ]
    },

    agxSuiteModules: [
      { name: "Dashboard", description: "KPIs, activity feed, pipeline overview, quick actions", features: ["Revenue tracking", "Contact metrics", "Email stats", "Conversion rates"] },
      { name: "Contacts & CRM", description: "Unlimited contacts with AI lead scoring", features: ["AI Lead Scoring", "Unlimited contacts", "Smart segmentation", "Activity tracking"] },
      { name: "Email & SMS Campaigns", description: "AI-powered email writing + SMS", features: ["AI Email Writer (FREE)", "SMS included", "99% deliverability", "Unlimited sends"] },
      { name: "Forms & Surveys", description: "CAPTCHA protection FREE (vs Typeform $199/mo)", features: ["CAPTCHA FREE", "Unlimited forms", "Unlimited responses", "Conditional logic"] },
      { name: "Calendar & Scheduling", description: "Unlimited event types (vs Calendly limits)", features: ["Unlimited events", "Team scheduling", "Paid bookings", "Buffer times"] },
      { name: "Courses & Learning", description: "Unlimited students (vs Kajabi $499/mo cap)", features: ["Unlimited students", "Unlimited courses", "Video hosting", "Progress tracking"] },
      { name: "Community", description: "Skool-style community with more features", features: ["Gamification", "Leaderboards", "Direct messaging", "Video hosting"] }
    ],

    keyDifferentiators: [
      { feature: "AI Included at Every Tier", competitors: "vs HubSpot, Klaviyo charging extra for AI", savings: "$890+/mo" },
      { feature: "Unlimited Contacts", competitors: "vs Mailchimp, ActiveCampaign contact-based billing", savings: "Scales infinitely" },
      { feature: "CAPTCHA Free", competitors: "vs Typeform $199+/mo paywall", savings: "$2,388/year" },
      { feature: "90% Cost Savings", competitors: "DeepSeek vs GPT-4o/Claude", savings: "$6,000+/mo on AI" },
      { feature: "600+ AI Models", competitors: "vs single-provider lock-in", savings: "Flexibility" }
    ],

    totalSavings: { annual: "$25,000+" },

    aiCapabilities: {
      llmProviders: [
        "Anthropic (Claude Opus/Sonnet/Haiku 4.5)",
        "OpenAI (GPT-4o, O1, O1-mini)",
        "DeepSeek (V3.2, R1 - 90% cost savings)",
        "Google AI (Gemini 2.0 Flash, 1.5 Pro)"
      ],
      videoGeneration: [
        "fal.ai (600+ models: Veo 3, Sora 2, Kling, Flux)",
        "Runway (Gen-4, Gen-4 Turbo)",
        "Replicate (Open-source models)"
      ],
      audioAndAvatars: [
        "ElevenLabs (Premium TTS, voice cloning)",
        "HeyGen (AI avatars, best-in-class lip-sync)",
        "Synthesia (Enterprise avatars, 120+ languages)"
      ],
      aiFeatures: [
        "AI Email Writer (included free)",
        "AI Lead Scoring",
        "AI Content Generation",
        "AI Image Generation",
        "AI Video Generation",
        "AI Receptionist (voice calls)",
        "ARIA - Executive AI Assistant",
        "Cost-Aware Routing (saves 90%)"
      ]
    },

    entities: [
      { name: "Client", description: "Client management" },
      { name: "Project", description: "Project tracking" },
      { name: "ClientSubscription", description: "Subscription management" },
      { name: "VideoProject", description: "Video projects" },
      { name: "ArtGeneration", description: "AI art generations" },
      { name: "SocialMediaPost", description: "Social posts" },
      { name: "AdCampaign", description: "Ad campaigns" },
      { name: "EmailCampaign", description: "Email campaigns" },
      { name: "Lead", description: "Lead management" },
      { name: "Campaign", description: "Marketing campaigns" }
    ],

    integrationCapabilities: [
      { category: "CRM & Sales", integrations: ["HubSpot", "Salesforce", "GoHighLevel", "Stripe"] },
      { category: "Communication", integrations: ["Slack", "Twilio", "SendGrid"] },
      { category: "Social Media", integrations: ["Facebook", "Instagram", "Twitter/X", "LinkedIn", "TikTok", "YouTube"] },
      { category: "Ads", integrations: ["Meta Ads", "Google Ads", "TikTok Ads"] }
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

## CORE PAGES
${inventory.corePages.map(p => `- **${p.name}** ${p.new ? '🆕' : ''} (${p.path})
  ${p.description}`).join('\n')}

## AG-X BUSINESS SUITE MODULES
${inventory.agxSuiteModules.map(m => `### ${m.name}
${m.description}
Features: ${m.features.join(', ')}`).join('\n\n')}

## KEY COMPETITIVE DIFFERENTIATORS
${inventory.keyDifferentiators.map(d => `- ${d.feature}: ${d.savings}`).join('\n')}

## TOTAL COMPETITIVE SAVINGS: ${inventory.totalSavings.annual}/year

## AI CAPABILITIES
### LLM Providers
${inventory.aiCapabilities.llmProviders.map(p => `- ${p}`).join('\n')}

### Video Generation
${inventory.aiCapabilities.videoGeneration.map(p => `- ${p}`).join('\n')}

### Audio & Avatars
${inventory.aiCapabilities.audioAndAvatars.map(p => `- ${p}`).join('\n')}

### AI Features
${inventory.aiCapabilities.aiFeatures.map(f => `- ${f}`).join('\n')}

## INTEGRATION CAPABILITIES
${inventory.integrationCapabilities.map(cat => `
### ${cat.category}
${cat.integrations.map(i => `- ${i}`).join('\n')}`).join('\n')}

---
**© 2024-2025 AI Freedom Studios. All Rights Reserved.**
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
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-cyan-400 text-2xl">Complete Platform Inventory</CardTitle>
              <p className="text-gray-400 mt-1">Comprehensive list of everything in AI Freedom Studios</p>
            </div>
            <Button onClick={exportData} className="bg-gradient-to-r from-cyan-500 to-purple-500">
              <Download className="w-4 h-4 mr-2" />
              Export Markdown
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overview Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
              <FileText className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
              <div className="text-2xl font-bold text-white">{inventory.overview.totalPages}+</div>
              <div className="text-sm text-gray-400">Pages</div>
            </div>
            <div className="text-center p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
              <Database className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-white">{inventory.overview.totalEntities}+</div>
              <div className="text-sm text-gray-400">Entities</div>
            </div>
            <div className="text-center p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
              <Layers className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-white">{inventory.overview.totalComponents}+</div>
              <div className="text-sm text-gray-400">Components</div>
            </div>
            <div className="text-center p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
              <Puzzle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-white">{inventory.overview.totalIntegrations}</div>
              <div className="text-sm text-gray-400">Integrations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Differentiators */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Key Competitive Advantages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {inventory.totalSavings.annual}/year
            </div>
            <div className="text-sm text-green-300">Total Competitive Savings</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            {inventory.keyDifferentiators.map((diff, idx) => (
              <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white">{diff.feature}</h3>
                  <Badge className="bg-green-500/20 text-green-400">{diff.savings}</Badge>
                </div>
                <p className="text-sm text-gray-400">{diff.competitors}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AG-X Business Suite */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Package className="w-5 h-5" />
            AG-X Business Suite Modules ({inventory.agxSuiteModules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {inventory.agxSuiteModules.map((module, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                <h3 className="font-bold text-purple-300 mb-2">{module.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{module.description}</p>
                <div className="flex flex-wrap gap-2">
                  {module.features.map((f, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-300">{f}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Features List */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Complete Features List ({Object.values(inventory.allFeatures).flat().length}+ Features)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="aiAssistants" className="w-full">
            <TabsList className="bg-[#0B0B0C] border border-gray-800 mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="aiAssistants">AI Assistants</TabsTrigger>
              <TabsTrigger value="contentCreation">Content</TabsTrigger>
              <TabsTrigger value="marketingAutomation">Marketing</TabsTrigger>
              <TabsTrigger value="crmAndSales">CRM</TabsTrigger>
              <TabsTrigger value="adsManagement">Ads</TabsTrigger>
              <TabsTrigger value="aiReceptionist">AI Phone</TabsTrigger>
              <TabsTrigger value="workflowAutomation">Workflows</TabsTrigger>
              <TabsTrigger value="agencyTools">Agency</TabsTrigger>
            </TabsList>
            
            {Object.entries(inventory.allFeatures).map(([key, features]) => (
              <TabsContent key={key} value={key}>
                <div className="grid md:grid-cols-2 gap-2">
                  {features.map((f, i) => (
                    <div key={i} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white text-sm">{f.name}</span>
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">{f.tier}</Badge>
                      </div>
                      <p className="text-gray-400 text-xs">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Tools Complete List */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Tools & Models ({Object.values(inventory.aiTools).flat().length}+ Models)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="textGeneration" className="w-full">
            <TabsList className="bg-[#0B0B0C] border border-gray-800 mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="textGeneration">LLMs ({inventory.aiTools.textGeneration.length})</TabsTrigger>
              <TabsTrigger value="imageGeneration">Images ({inventory.aiTools.imageGeneration.length})</TabsTrigger>
              <TabsTrigger value="videoGeneration">Video ({inventory.aiTools.videoGeneration.length})</TabsTrigger>
              <TabsTrigger value="audioGeneration">Audio ({inventory.aiTools.audioGeneration.length})</TabsTrigger>
              <TabsTrigger value="avatarGeneration">Avatars ({inventory.aiTools.avatarGeneration.length})</TabsTrigger>
              <TabsTrigger value="specializedAI">Specialized ({inventory.aiTools.specializedAI.length})</TabsTrigger>
            </TabsList>
            
            {Object.entries(inventory.aiTools).map(([key, tools]) => (
              <TabsContent key={key} value={key}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-purple-500/10 border-b border-gray-800">
                        <th className="text-left p-2 text-purple-300">Model</th>
                        <th className="text-left p-2 text-purple-300">Provider</th>
                        <th className="text-left p-2 text-purple-300">Best For</th>
                        <th className="text-left p-2 text-purple-300">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tools.map((t, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="p-2 text-white font-medium">{t.name}</td>
                          <td className="p-2 text-gray-400">{t.provider}</td>
                          <td className="p-2 text-gray-300">{t.use}</td>
                          <td className="p-2">
                            <Badge className={
                              t.cost === 'Premium' ? 'bg-purple-500/20 text-purple-400' :
                              t.cost === 'Standard' ? 'bg-blue-500/20 text-blue-400' :
                              t.cost === 'Budget' || t.cost === 'Ultra-Budget' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }>
                              {t.cost}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Puzzle className="w-5 h-5" />
            Integration Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.integrationCapabilities.map((cat, idx) => (
              <div key={idx} className="p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
                <h3 className="font-semibold text-white mb-3">{cat.category}</h3>
                <ul className="space-y-1">
                  {cat.integrations.map((int, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
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

      {/* Footer */}
      <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl text-center">
        <p className="text-gray-400 mb-4">
          AI Freedom Studios replaces 10+ expensive SaaS tools with a single, modern, AI-first solution.
        </p>
        <Button onClick={exportData} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
          <Download className="w-4 h-4 mr-2" />
          Export Full Inventory
        </Button>
      </div>
    </div>
  );
}