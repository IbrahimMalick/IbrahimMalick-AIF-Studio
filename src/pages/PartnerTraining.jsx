
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  Video,
  FileText,
  Target,
  Sparkles,
  CheckCircle2,
  Play,
  Lock,
  Award,
  TrendingUp,
  MessageSquare,
  DollarSign,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function PartnerTraining() {
  const [user, setUser] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: partner } = useQuery({
    queryKey: ["partner", user?.email],
    queryFn: async () => {
      const partners = await base44.entities.PartnerAffiliate.filter({
        user_email: user.email
      });
      return partners[0] || null;
    },
    enabled: !!user
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["trainingProgress", partner?.id],
    queryFn: () => base44.entities.PartnerTrainingProgress.filter({
      partner_id: partner.id
    }),
    enabled: !!partner
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ moduleId, updates }) => {
      const existing = progress.find(p => p.module_id === moduleId);
      if (existing) {
        return await base44.entities.PartnerTrainingProgress.update(existing.id, updates);
      } else {
        return await base44.entities.PartnerTrainingProgress.create({
          partner_id: partner.id,
          module_id: moduleId,
          ...updates
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trainingProgress"]);
    }
  });

  const markVideoWatched = (moduleId, videoId) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    const videosWatched = moduleProgress?.videos_watched || [];
    
    const updated = [
      ...videosWatched.filter(v => v.video_id !== videoId),
      {
        video_id: videoId,
        watched_percentage: 100,
        completed: true,
        watched_at: new Date().toISOString()
      }
    ];

    updateProgressMutation.mutate({
      moduleId,
      updates: {
        videos_watched: updated,
        last_accessed: new Date().toISOString()
      }
    });

    showToast("Video marked as complete! 🎓", "success");
  };

  const markLessonComplete = (moduleId, lessonId) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    const lessonsCompleted = moduleProgress?.lessons_completed || [];
    
    if (!lessonsCompleted.includes(lessonId)) {
      updateProgressMutation.mutate({
        moduleId,
        updates: {
          lessons_completed: [...lessonsCompleted, lessonId],
          last_accessed: new Date().toISOString()
        }
      });
      showToast("Lesson completed! ✅", "success");
    }
  };

  const getModuleProgress = (moduleId) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    return moduleProgress?.progress_percentage || 0;
  };

  const isLessonComplete = (moduleId, lessonId) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    return moduleProgress?.lessons_completed?.includes(lessonId) || false;
  };

  const trainingModules = {
    onboarding: {
      id: "onboarding",
      title: "Partner Onboarding",
      category: "onboarding",
      icon: GraduationCap,
      color: "from-[#FFD700] to-[#FF8C00]",
      lessons: [
        {
          id: "welcome",
          title: "Welcome to the Partner Program",
          type: "video",
          duration: "5 min",
          description: "Program overview, commission structure, and success roadmap",
          video_url: "https://example.com/partner-welcome.mp4"
        },
        {
          id: "getting_started",
          title: "Getting Your First Link",
          type: "text",
          duration: "3 min",
          content: `**Setting Up Your Affiliate Links**

1. **Navigate to Partner Hub** → Links & Coupons tab
2. **Generate your primary link** - This is your main referral URL
3. **Add UTM parameters** (optional) for tracking campaigns
4. **Create custom landing page links** for specific campaigns

**Best Practices:**
- Use different links for different traffic sources
- Always disclose affiliate relationship (FTC compliance)
- Test your links before sharing
- Monitor click-through rates and optimize`
        },
        {
          id: "compliance",
          title: "FTC Compliance & Legal",
          type: "video",
          duration: "8 min",
          description: "Required disclosures, prohibited tactics, and staying compliant",
          video_url: "https://example.com/compliance.mp4"
        },
        {
          id: "first_promotion",
          title: "Your First Promotion",
          type: "text",
          duration: "4 min",
          content: `**Launch Your First Campaign**

**Week 1: Foundation**
- Share your referral link on social media (with disclosure)
- Email your list with personal story
- Create 3 Instagram stories about the platform

**Week 2: Content**
- Publish case study or demo video
- Write blog post or LinkedIn article
- Share results you're getting

**Week 3: Scale**
- Run small paid ad test ($50-100)
- Engage in communities/forums
- Partner with complementary creators

**Success Metrics:**
- Target: 10 signups in first month
- Expected conversion: 2-3 paid customers
- First commission: $89-$267`
        }
      ]
    },
    platform_basics: {
      id: "platform_basics",
      title: "Platform Training",
      category: "platform_basics",
      icon: Video,
      color: "from-[#00D4C9] to-[#1E90FF]",
      lessons: [
        {
          id: "platform_overview",
          title: "Platform Overview",
          type: "video",
          duration: "12 min",
          description: "Complete walkthrough of AI Freedom Studios features",
          video_url: "https://example.com/platform-overview.mp4"
        },
        {
          id: "video_studio",
          title: "AI Video Creation",
          type: "video",
          duration: "15 min",
          description: "How to create videos with AI avatars and voice cloning",
          video_url: "https://example.com/video-studio.mp4"
        },
        {
          id: "content_repurposing",
          title: "Content Repurposing Engine",
          type: "video",
          duration: "10 min",
          description: "Turn one video into 50+ pieces of content automatically",
          video_url: "https://example.com/repurposing.mp4"
        },
        {
          id: "ai_receptionist",
          title: "AI Receptionist Setup",
          type: "video",
          duration: "18 min",
          description: "Configure AI phone answering, lead qualification, and booking",
          video_url: "https://example.com/receptionist.mp4"
        },
        {
          id: "ghl_integration",
          title: "CRM Integration",
          type: "text",
          duration: "8 min",
          content: `**CRM Integration Guide**

**Why This Matters:**
Most of your prospects already use a CRM. This integration is your biggest selling point.

**Setup Steps:**
1. Connect CRM account (OAuth flow)
2. Map custom fields
3. Configure contact sync
4. Set up opportunity creation
5. Enable calendar booking
6. Configure webhooks

**Value Props to Emphasize:**
- ✅ Automatic contact creation from AI calls
- ✅ Lead qualification scores pushed to CRM
- ✅ Appointments booked directly to calendars
- ✅ Opportunity creation with notes
- ✅ Workflow triggers from AI events

**Demo Script:**
"Imagine this: AI answers your calls, qualifies the lead, books them on your calendar, creates a CRM contact with notes, and triggers your follow-up workflow - all while you're sleeping. That's what this does."`
        }
      ]
    },
    sales_training: {
      id: "sales_training",
      title: "Sales & Messaging",
      category: "sales_training",
      icon: Target,
      color: "from-[#9D4EDD] to-[#FF69B4]",
      lessons: [
        {
          id: "value_prop",
          title: "Core Value Proposition",
          type: "text",
          duration: "5 min",
          content: `**Your Elevator Pitch (30 seconds)**

"I help [coaches/agencies/creators] automate their content creation and client communication using AI. Imagine having a 24/7 receptionist that answers calls, books appointments, and creates personalized videos for every lead - all while sounding exactly like you. That's what our platform does."

**Key Benefits to Lead With:**
1. **Time Savings** - "Create a week of content in 30 minutes"
2. **Revenue** - "Never miss a lead call, even at 2am"
3. **Scale** - "One-to-many becomes one-to-one at scale"
4. **Ease** - "No technical skills required"

**Proof Points:**
- 847+ agencies using it
- Average customer adds $18K/year in revenue
- 4.8/5 star rating
- 92% renewal rate`
        },
        {
          id: "objection_handling",
          title: "Objection Handling Playbook",
          type: "text",
          duration: "12 min",
          content: `**Common Objections & Responses**

**"I already use [Synthesia/D-ID/HeyGen]"**
→ "Great! This integrates with those or replaces them entirely. The difference is we don't just make videos - we automate your entire content workflow. One video becomes 50 social posts, emails, blog posts, and ads automatically. Can [competitor] do that?"

**"It's too expensive"**
→ "I get it. Let's do the math: If you create 10 videos/month manually, that's about 40 hours at $50/hour = $2,000 in time. Our platform costs $497/month and does it in 2 hours. You're saving $1,500/month PLUS the videos are higher quality. How is that expensive?"

**"I'm not technical"**
→ "Perfect! That's exactly who we built this for. You type what you want, AI creates it. Think ChatGPT for video. If you can send a text message, you can use this. Plus, I'll personally walk you through setup."

**"I need to think about it"**
→ "Absolutely! While you think, let me send you a 3-minute demo video and our ROI calculator. Can I get your email? Also, what specific concern are you thinking about - price, features, or implementation?"

**"Will this replace me/my team?"**
→ "No, it amplifies you! Think of it as 10 assistants, not a replacement. You still provide strategy, creativity, and relationship management - AI handles the grunt work. Your team focuses on high-value activities instead of editing videos at midnight."

**"How long does setup take?"**
→ "15 minutes for basic setup. 1-2 hours if you want everything customized. Most clients are creating their first video within an hour. Plus we have onboarding specialists who do it WITH you."

**"What if my clients don't like AI content?"**
→ "They won't know it's AI unless you tell them. The avatars are photoreal, voices are cloned from real people, and you control everything. Show them the demo - they'll be shocked it's AI. Plus, you can blend AI with human-created content."`
        },
        {
          id: "discovery_questions",
          title: "Discovery Call Framework",
          type: "text",
          duration: "6 min",
          content: `**Discovery Call Script (15-20 min)**

**Opening (2 min):**
"Thanks for joining! I've got 20 minutes to understand your business and show you how AI can 10X your output. Sound good? Great - tell me about what you do and who you serve."

**Discovery Questions (8 min):**

1. **Current Process:**
   - "How do you create content now?"
   - "How many hours per week on content?"
   - "What's your biggest bottleneck?"

2. **Pain Points:**
   - "What are you NOT doing because you don't have time?"
   - "How many leads do you miss after hours?"
   - "What would change if you had 10X more content?"

3. **Goals:**
   - "Where do you want to be in 6 months?"
   - "What would make this a no-brainer investment?"

4. **Budget/Authority:**
   - "What's your monthly marketing budget?"
   - "Are you the decision maker?"

**Demo (7 min):**
- Show 1 feature that solves their biggest pain
- Create something live (AI video or social post)
- Share ROI calculator

**Close (3 min):**
"Based on what you told me, this could save you [X hours] and add [Y leads] per month. Pricing is $297-$997 depending on features. Most people in [their niche] go with the $497 plan. Want to start with a trial or just jump in?"

**Follow-Up:**
If not ready: "No problem! I'll send you a case study of [similar business]. Can we schedule 15 minutes next week to discuss?"` 
        },
        {
          id: "closing_techniques",
          title: "Closing Techniques",
          type: "video",
          duration: "14 min",
          description: "Trial closes, assumptive closes, and handling final objections",
          video_url: "https://example.com/closing.mp4"
        }
      ]
    },
    ai_features: {
      id: "ai_features",
      title: "AI Features Mastery",
      category: "ai_features",
      icon: Sparkles,
      color: "from-[#00FF88] to-[#00CC6A]",
      lessons: [
        {
          id: "ai_copilot",
          title: "AI Copilot Power User",
          type: "video",
          duration: "10 min",
          description: "Advanced copilot commands and automation",
          video_url: "https://example.com/copilot.mp4"
        },
        {
          id: "voice_cloning",
          title: "Voice Cloning Best Practices",
          type: "text",
          duration: "7 min",
          content: `**Voice Cloning Guide**

**Recording Quality Samples:**
- Use quiet room (no echo)
- Phone or USB mic is fine
- Speak naturally, conversationally
- Record 3-5 minutes of varied content
- Avoid background noise

**What Makes a Good Voice Clone:**
✅ Clear pronunciation
✅ Consistent tone
✅ Natural pacing
✅ Good microphone quality
✅ Variety of emotions

**Common Mistakes:**
❌ Recording in echoey room
❌ Speaking too fast or slow
❌ Background music/noise
❌ Only one emotional tone
❌ Reading monotonously

**Pro Tips:**
- Record multiple samples at different times
- Smile while recording (sounds warmer)
- Vary your pitch and pacing
- Pause between sentences
- Re-record if you make mistakes`
        },
        {
          id: "content_repurposing",
          title: "Repurposing Engine Mastery",
          type: "video",
          duration: "16 min",
          description: "Turn 1 video into 50+ assets across all platforms",
          video_url: "https://example.com/repurposing-advanced.mp4"
        }
      ]
    },
    resources_usage: {
      id: "resources_usage",
      title: "Marketing Resources",
      category: "resources_usage",
      icon: FileText,
      color: "from-[#FF6B9D] to-[#C44569]",
      lessons: [
        {
          id: "email_swipes",
          title: "Using Email Swipe Files",
          type: "text",
          duration: "8 min",
          content: `**Email Swipe File Strategy**

**7-Email Nurture Sequence:**

**Email 1 (Day 0) - Welcome:**
Subject: "Welcome! Here's what happens next..."
Goal: Set expectations, deliver quick win
CTA: Watch demo video

**Email 2 (Day 2) - Education:**
Subject: "How [Name] added $24K/month with this..."
Goal: Social proof, case study
CTA: Book demo call

**Email 3 (Day 4) - Objection Handler:**
Subject: "Worried about [common objection]? Read this..."
Goal: Address fears proactively
CTA: FAQ page

**Email 4 (Day 7) - Urgency:**
Subject: "Your trial ends in 48 hours"
Goal: Create FOMO
CTA: Upgrade now

**Email 5 (Day 10) - Value Stack:**
Subject: "Everything you get with [tier] plan"
Goal: Justify price
CTA: Compare plans

**Email 6 (Day 14) - Last Chance:**
Subject: "Final reminder: Trial expires tonight"
Goal: Final push
CTA: Upgrade before midnight

**Email 7 (Day 30) - Winback:**
Subject: "We miss you! Here's 30% off..."
Goal: Re-engage churned prospects
CTA: Claim discount

**Personalization Tips:**
- Use {first_name} merge tags
- Reference their industry/niche
- Include specific pain points from discovery
- Add testimonials from similar businesses`
        },
        {
          id: "ad_creatives",
          title: "Ad Creative Best Practices",
          type: "video",
          duration: "12 min",
          description: "How to use pre-made ad creatives for maximum conversions",
          video_url: "https://example.com/ad-creatives.mp4"
        },
        {
          id: "social_templates",
          title: "Social Media Templates",
          type: "text",
          duration: "6 min",
          content: `**Social Media Post Templates**

**Instagram Reel Script (30 sec):**
Hook (3 sec): "POV: You just automated your entire content creation..."
Story (20 sec): "I used to spend 40 hours/week creating content. Now AI does it in 30 minutes. Same quality. Zero effort. Here's how..."
CTA (7 sec): "Link in bio to try it free 👆"

**LinkedIn Post Formula:**
Hook: Controversial or surprising statement
Story: Personal transformation (before → after)
Proof: Specific metrics
CTA: Soft call-to-action

**Twitter Thread Structure:**
1. Hook tweet (makes them stop)
2-5. Value bombs (quick tips)
6. Social proof (testimonial or stat)
7. CTA + link

**TikTok Hook Library:**
- "If you're a [niche], you need to see this..."
- "I found a way to [benefit] in [time]..."
- "Why is nobody talking about this?"
- "This changed everything for my business..."
- "You're doing [task] wrong. Here's the right way..."`
        }
      ]
    },
    advanced_tactics: {
      id: "advanced_tactics",
      title: "Advanced Sales Tactics",
      category: "advanced_tactics",
      icon: TrendingUp,
      color: "from-[#FFD700] to-[#00D4C9]",
      lessons: [
        {
          id: "tier_advancement",
          title: "Scaling to Gold & Premier",
          type: "text",
          duration: "10 min",
          content: `**Tier Advancement Strategy**

**Current: Bronze (30% recurring)**

**Next: Silver (32% - Need >$3K MRR)**
- Goal: 8-10 paying customers
- Strategy: Focus on quality over quantity
- Timeline: 2-3 months
- Action: Convert existing signups

**Then: Gold (35% - Need >$10K MRR)**
- Goal: 25-30 paying customers
- Strategy: Scale paid ads
- Timeline: 4-6 months
- Action: Launch webinar funnel

**Finally: Premier (40% - Need >$25K MRR)**
- Goal: 60-85 paying customers
- Strategy: Partnership & affiliates
- Timeline: 6-12 months
- Benefits: +MDF, co-marketing, priority support

**Monthly Income Projections:**
- Bronze (30%): $89/customer × 5 = $445/mo
- Silver (32%): $95/customer × 10 = $950/mo
- Gold (35%): $104/customer × 30 = $3,120/mo
- Premier (40%): $119/customer × 70 = $8,330/mo`
        },
        {
          id: "webinar_funnel",
          title: "Webinar Funnel Blueprint",
          type: "video",
          duration: "25 min",
          description: "Complete webinar system for converting at scale",
          video_url: "https://example.com/webinar-funnel.mp4"
        },
        {
          id: "influencer_partnerships",
          title: "Partner with Influencers",
          type: "text",
          duration: "8 min",
          content: `**Influencer Partnership Strategy**

**Finding Partners:**
- Coaches with 10K-100K followers
- YouTube creators in business niche
- LinkedIn influencers (5K+ followers)
- Podcast hosts

**Pitch Template:**
"Hey [Name]! Love your content on [topic]. I run an affiliate program for an AI platform that helps creators like you scale content. We pay 30% recurring (so $89-$297/month per customer you refer). Interested in a quick 10-min call to discuss?"

**Commission Split Options:**
1. **Standard:** 30% to influencer
2. **Revenue Share:** 15% to you, 15% to influencer
3. **Hybrid:** Fixed fee + performance bonus

**Enablement Package:**
- Custom landing page
- Exclusive coupon code
- Done-for-you email sequence
- Social media pack
- Demo video featuring them

**Management:**
- Weekly performance reports
- Monthly strategy call
- Bonus for top performers
- Cross-promotion opportunities`
        },
        {
          id: "reseller_track",
          title: "Transitioning to Reseller",
          type: "video",
          duration: "18 min",
          description: "When and how to become a reseller partner (25-35% revenue share)",
          video_url: "https://example.com/reseller-track.mp4"
        }
      ]
    }
  };

  const getModuleStats = () => {
    const totalModules = Object.keys(trainingModules).length;
    const totalLessons = Object.values(trainingModules).reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = progress.reduce((sum, p) => sum + (p.lessons_completed?.length || 0), 0);
    const certificatesEarned = progress.filter(p => p.certificate_earned).length;
    
    return { totalModules, totalLessons, completedLessons, certificatesEarned };
  };

  const stats = getModuleStats();
  const overallProgress = stats.totalLessons > 0 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0;

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-12 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-white font-semibold mb-2">Partner Training Access Required</p>
              <p className="text-gray-400 text-sm">
                Please apply to the partner program to access training resources.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[#FFD700]" />
            Partner Training Academy
          </h1>
          <p className="text-gray-400">
            Master the platform and sales techniques to maximize your earnings
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <BookOpen className="w-8 h-8 mb-3 text-[#FFD700]" />
              <p className="text-gray-400 text-sm mb-1">Overall Progress</p>
              <p className="text-3xl font-bold text-white mb-2">{overallProgress}%</p>
              <Progress value={overallProgress} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <CheckCircle2 className="w-8 h-8 mb-3 text-[#00D4C9]" />
              <p className="text-gray-400 text-sm mb-1">Lessons Complete</p>
              <p className="text-3xl font-bold text-white">
                {stats.completedLessons}/{stats.totalLessons}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <Video className="w-8 h-8 mb-3 text-[#9D4EDD]" />
              <p className="text-gray-400 text-sm mb-1">Modules Available</p>
              <p className="text-3xl font-bold text-white">{stats.totalModules}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#06D6A0]/20 to-[#00D4C9]/20 border-[#06D6A0] border-2 rounded-2xl">
            <CardContent className="p-6">
              <Award className="w-8 h-8 mb-3 text-[#06D6A0]" />
              <p className="text-gray-400 text-sm mb-1">Certificates</p>
              <p className="text-3xl font-bold text-white">{stats.certificatesEarned}</p>
            </CardContent>
          </Card>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
              <Card className="bg-[#111317] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{selectedVideo.title}</CardTitle>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedVideo(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
                    <Play className="w-16 h-16 text-gray-600" />
                    <p className="text-gray-500 ml-3">Video player placeholder</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        markVideoWatched(selectedVideo.moduleId, selectedVideo.id);
                        setSelectedVideo(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedVideo(null)}
                      className="border-gray-700 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Training Modules */}
        <Tabs defaultValue="onboarding" className="space-y-6">
          <TabsList className="bg-[#111]">
            {Object.values(trainingModules).map((module) => {
              const Icon = module.icon;
              const moduleProgress = getModuleProgress(module.id);
              return (
                <TabsTrigger key={module.id} value={module.id}>
                  <Icon className="w-4 h-4 mr-2" />
                  {module.title}
                  {moduleProgress > 0 && (
                    <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">
                      {moduleProgress}%
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(trainingModules).map(([key, module]) => {
            const Icon = module.icon;
            return (
              <TabsContent key={key} value={key}>
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white">{module.title}</CardTitle>
                        <p className="text-gray-400 text-sm">{module.lessons.length} lessons</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{getModuleProgress(module.id)}%</p>
                        <p className="text-gray-500 text-xs">Complete</p>
                      </div>
                    </div>
                    <Progress value={getModuleProgress(module.id)} className="h-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {module.lessons.map((lesson, idx) => {
                        const isComplete = isLessonComplete(module.id, lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isComplete
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-[#0B0B0C] border-gray-800 hover:border-[#FFD700]/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isComplete
                                    ? 'bg-green-500/20'
                                    : 'bg-gray-700/50'
                                }`}>
                                  {isComplete ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                  ) : lesson.type === 'video' ? (
                                    <Video className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-semibold text-sm">{lesson.title}</h4>
                                    <Badge className="bg-gray-700 text-gray-300 text-xs">
                                      {lesson.duration}
                                    </Badge>
                                    {lesson.type === 'video' && (
                                      <Badge className="bg-red-500/20 text-red-400 text-xs">
                                        Video
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-xs">
                                    {lesson.description || lesson.content?.substring(0, 120) + '...'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {lesson.type === 'video' ? (
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedVideo({ ...lesson, moduleId: module.id })}
                                    className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Watch
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => markLessonComplete(module.id, lesson.id)}
                                    disabled={isComplete}
                                    className={isComplete 
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30'
                                    }
                                  >
                                    {isComplete ? 'Completed' : 'Read'}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Lesson Content for Text Lessons */}
                            {lesson.type === 'text' && !isComplete && lesson.content && (
                              <div className="mt-4 p-4 bg-[#111317] rounded-lg border border-gray-800 max-h-96 overflow-y-auto">
                                <div className="prose prose-invert prose-sm max-w-none">
                                  {lesson.content.split('\n').map((line, idx) => {
                                    if (line.startsWith('**') && line.endsWith('**')) {
                                      return <h4 key={idx} className="text-white font-bold mt-3 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                                    } else if (line.startsWith('# ')) {
                                      return <h3 key={idx} className="text-white font-bold text-lg mt-4 mb-2">{line.substring(2)}</h3>;
                                    } else if (line.startsWith('- ') || line.startsWith('• ')) {
                                      return <li key={idx} className="text-gray-300 ml-4">{line.substring(2)}</li>;
                                    } else if (line.trim()) {
                                      return <p key={idx} className="text-gray-300 mb-2">{line}</p>;
                                    }
                                    return <br key={idx} />;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Sales Playbooks */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              Sales Playbooks & Scripts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "30-Second Elevator Pitch",
                  desc: "Perfect intro for networking and cold outreach",
                  icon: MessageSquare,
                  content: "Quick pitch for any situation"
                },
                {
                  title: "Discovery Call Script",
                  desc: "15-20 minute qualification framework",
                  icon: BookOpen,
                  content: "Full call structure with questions"
                },
                {
                  title: "Demo Presentation",
                  desc: "7-minute platform demo that closes deals",
                  icon: Video,
                  content: "Screen share walkthrough"
                },
                {
                  title: "Email Templates",
                  desc: "Cold outreach, follow-ups, and closers",
                  icon: FileText,
                  content: "7 proven email swipes"
                },
                {
                  title: "Objection Handling Guide",
                  desc: "Responses to every common objection",
                  icon: Target,
                  content: "15+ objections covered"
                },
                {
                  title: "ROI Calculator",
                  desc: "Show prospects the math that closes deals",
                  icon: DollarSign,
                  content: "Interactive calculator"
                }
              ].map((playbook, idx) => {
                const Icon = playbook.icon;
                return (
                  <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm mb-1">{playbook.title}</h4>
                        <p className="text-gray-400 text-xs mb-2">{playbook.desc}</p>
                        <p className="text-gray-500 text-xs">📄 {playbook.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-[#00D4C9]/10 border-blue-500/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-[#FFD700]" />
              Quick Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  tip: "Focus on Transformation",
                  desc: "Don't sell features - sell the outcome. 'Save 40 hours/month' beats '50 templates'"
                },
                {
                  tip: "Use Your Own Results",
                  desc: "Best proof is YOUR success. Track your metrics and share them"
                },
                {
                  tip: "Niche Down First",
                  desc: "Easier to dominate 'AI for real estate agents' than 'AI for everyone'"
                },
                {
                  tip: "Create Value First",
                  desc: "Give away free training, templates, or audits before asking for sale"
                },
                {
                  tip: "Build in Public",
                  desc: "Share your journey, wins, and learnings. Transparency builds trust"
                },
                {
                  tip: "Follow Up Relentlessly",
                  desc: "80% of sales happen after the 5th touch. Most quit after 1-2"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <h5 className="text-white font-semibold text-sm mb-1">{item.tip}</h5>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certification */}
        {overallProgress === 100 && !progress.some(p => p.certificate_earned) && (
          <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#00D4C9]/10 border-[#FFD700]/30 rounded-2xl">
            <CardContent className="p-8 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-[#FFD700]" />
              <h3 className="text-2xl font-bold text-white mb-3">
                🎉 Congratulations! You've Completed All Training
              </h3>
              <p className="text-gray-300 mb-6">
                Claim your Partner Certification and unlock advanced benefits
              </p>
              <Button
                onClick={() => {
                  showToast("Certificate generation coming soon! 🎓", "success");
                }}
                className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold text-lg px-12 py-6"
              >
                <Award className="w-5 h-5 mr-2" />
                Claim Your Certificate
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Support */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <Button variant="outline" className="border-gray-700 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Join Partner Community
              </Button>
              <a href="mailto:partners@aifreedomduane.com">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </a>
              <Button variant="outline" className="border-gray-700 text-white">
                <Video className="w-4 h-4 mr-2" />
                Schedule 1-on-1 Call
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
