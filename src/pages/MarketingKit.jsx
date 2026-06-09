import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  CheckCircle2,
  Facebook,
  Mail,
  Video,
  Globe,
  Download,
  Zap,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function MarketingKit() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    showToast("Copied to clipboard! 📋", "success");
    setTimeout(() => setCopied(null), 2000);
  };

  // FACEBOOK AD COPY
  const facebookAds = [
    {
      id: "fb_ad_1",
      title: "Problem-Agitate-Solution (High Performer)",
      headline: "Tired of Being a GHL Order-Taker?",
      primaryText: `You built a GHL agency to make REAL money.

Not to charge $97/month and compete with every other agency doing the EXACT same thing.

What if you could offer something your competitors CAN'T?

✅ AI Video Creation (your clients stop paying Fiverr)
✅ Social Media Automation (they cancel their $500/mo VA)
✅ Full White-Label (it's YOUR platform, your brand)

Deploy in 5 minutes. Charge $297-$997/month. Keep 80%+ profit.

847 agencies already using this to dominate their markets.

Your competitors are probably one of them.

Click below to see how it works 👇`,
      cta: "Watch 2-Minute Demo",
      targeting: "GHL Agency Owners, Marketing Consultants, 30-55 years old",
      image: "Hero shot of dashboard with '$7,940/month' visible"
    },
    {
      id: "fb_ad_2",
      title: "Social Proof (Trust Builder)",
      headline: "$24K/Month in 90 Days? Here's How He Did It",
      primaryText: `Mike Johnson was stuck at $8K/month with his GHL agency.

Too much work. Too little profit. About to quit.

Then he found AIFreedomDuane Studio.

✨ Deployed to his first client in 5 minutes
💰 Charged $497/month (client said "that's it?!")
🚀 Signed 32 clients in 90 days
📈 Now at $24,000/month recurring

His secret? He stopped selling "GHL setup" and started selling "AI Content Machine"

Same GHL. Different packaging. 10x the revenue.

Want to see his exact playbook?

👇 Click to watch the case study`,
      cta: "See the Case Study",
      targeting: "GHL Agency Owners with 1-20 clients, frustrated with pricing",
      image: "Testimonial screenshot from Mike with revenue numbers"
    },
    {
      id: "fb_ad_3",
      title: "Curiosity Hook (Scroll-Stopper)",
      headline: "Why Smart GHL Agencies Charge $997/Month",
      primaryText: `While most agencies fight for $97/month clients...

The smart ones discovered a pricing loophole:

Instead of selling "GHL setup"...
They sell "AI Content Creation Platform"

Same backend (GHL).
Different frontend (white-labeled AI tools).

Clients happily pay $297-$997/month because they're getting:
- Unlimited AI video generation
- Automated social media posting  
- Content calendar automation
- Analytics dashboard

Your cost per client? $0 after one-time setup.

That's why 847 agencies switched to this model.

They charge 10x more. Do the same work.

Click below to see if you qualify 👇`,
      cta: "Check If You Qualify",
      targeting: "GHL Experts, Marketing Agency Owners, interested in white-label",
      image: "Split screen: '$97/mo' vs '$997/mo' with check marks"
    },
    {
      id: "fb_ad_4",
      title: "Direct Response (Aggressive)",
      headline: "Turn Your GHL Into a $50K/Month Cash Machine",
      primaryText: `Fact: Your GHL account is worth $50K/month.

You're just charging the wrong thing.

Here's the math:
- 50 clients × $997/month = $49,850/month
- Your cost per client = $0 (one-time setup)
- Profit margin = 80%+

"But Chase, no one pays $997 for GHL!"

You're right. They don't.

They pay $997 for an AI Content Creation Platform that happens to integrate with GHL.

✅ White-label under YOUR brand
✅ Deploy to unlimited clients
✅ One-time cost, infinite revenue

This is how elite agencies print money.

Join them. Click below 👇`,
      cta: "Get Agency Access",
      targeting: "High-intent GHL users, 40-65 years old, business mindset",
      image: "Calculator showing $50K/month with 'Your Potential' overlay"
    },
    {
      id: "fb_ad_5",
      title: "Pain Point Amplification",
      headline: "Your Clients Are Paying Someone Else $500/Month",
      primaryText: `Right now, your GHL clients are:

❌ Paying Fiverr $50 per video
❌ Paying a VA $500/month for social media
❌ Paying Canva Pro $30/month
❌ Paying video editors $200 per project

That's $780/month going to OTHER people.

What if YOU captured all of that revenue?

With AIFreedomDuane Studio, you can:

✅ Create unlimited videos with AI (goodbye Fiverr)
✅ Automate all social posts (goodbye VA)  
✅ Generate graphics automatically (goodbye Canva)

Deploy this to your existing GHL clients TODAY.

Charge $497/month. They save $283/month AND get better results.

You just added $497/month per client with ZERO extra work.

Click to see the demo 👇`,
      cta: "Show Me How",
      targeting: "GHL users with 5+ active clients",
      image: "Invoice showing $780 crossed out, replaced with '$497 (and you keep it)'"
    }
  ];

  // EMAIL SEQUENCE
  const emailSequence = [
    {
      day: 0,
      subject: "🚀 [VIDEO] How I Added $24K/Month to My Agency",
      preview: "This changed everything for my agency...",
      body: `Hey {First_Name},

I'm going to be direct.

If you're running a GHL agency and charging less than $297/month per client, you're leaving SIX FIGURES on the table.

I know because I was stuck at $97/month for 2 years.

Then I discovered something that changed everything:

My clients don't want "GHL setup."

They want RESULTS. Specifically:
- More content (without hiring anyone)
- More social media presence (without manual posting)
- More videos (without expensive editors)

So I stopped selling GHL.

I started selling an "AI Content Creation Platform."

Same GHL backend. Different packaging. White-labeled under my brand.

Now I charge $497-$997/month.

Clients don't blink. They see the value immediately.

And my cost per client? $0 after a one-time setup.

I deployed this to 32 clients in 90 days.

That's $24,000/month in new recurring revenue.

Want to see how it works?

👉 Watch this 2-minute demo: [LINK]

The best part? You can deploy this to your existing clients THIS WEEK.

They'll thank you for it (and gladly pay more).

Talk soon,
[Your Name]

P.S. - 847 agencies are already using this. Your competitors might be one of them. Just saying.`,
      timing: "Immediately after opt-in",
      goal: "Watch demo video"
    },
    {
      day: 1,
      subject: "The 'GHL Pricing Problem' (and how to fix it)",
      preview: "Why you're stuck at $97/month...",
      body: `{First_Name},

Did you watch the demo yesterday?

If not, no worries. Let me explain the "GHL Pricing Problem."

Here's what's happening:

1. You tell prospects: "I'll set up GHL for you"
2. They Google "GHL setup cost"
3. They see 100 agencies offering the same thing
4. You're forced to compete on price
5. You end up at $97-$197/month

Sound familiar?

Now imagine saying this instead:

"I'll give you an AI Content Creation Platform that generates unlimited videos, automates your social media, and integrates with your CRM."

They Google that. Nothing comes up.

You're the ONLY option.

Now you can charge $497-$997/month.

Same backend (GHL). Different frontend (AI tools). White-labeled under YOUR brand.

This is how elite agencies break the pricing ceiling.

Want to see the exact setup?

👉 Click here: [LINK TO CALCULATOR]

You'll see:
- How much you can charge different niches
- Your profit margins  
- 12-month revenue projections
- Suggested pricing tiers

It takes 2 minutes. The results might surprise you.

See you inside,
[Your Name]

P.S. - The agencies making $50K+/month aren't smarter than you. They just positioned differently. This is how.`,
      timing: "24 hours after Email 1",
      goal: "Use pricing calculator"
    },
    {
      day: 3,
      subject: "❌ You're doing too much work",
      preview: "Stop trading time for money...",
      body: `{First_Name},

Quick question:

How many hours did you work last week on client deliverables?

20? 40? 60?

Now ask yourself:

What if you could charge 5x more and work LESS?

That's exactly what happens when you switch from "service" to "software."

Here's the shift:

BEFORE (Service Model):
- Custom work for each client
- Hours = Money
- You're the bottleneck
- Can't scale past 10-20 clients

AFTER (Software Model):
- Deploy same platform to every client  
- Setup once, profit forever
- System does the work
- Scale to 100+ clients

Same GHL account. Different business model.

The platform: AIFreedomDuane Studio

What it does:
✅ AI video generation (unlimited)
✅ Social media automation (all platforms)
✅ Content calendar (auto-populated)
✅ Analytics dashboard (white-labeled)

Your clients get Netflix. You get paid like Apple.

Deploy once. Charge monthly. Scale infinitely.

Mike did this and went from 8 clients to 32 clients in 90 days.

His hours worked? Same.

His revenue? 4x higher.

Ready to make the switch?

👉 Click here to get started: [LINK]

You'll get:
- Instant platform access
- Deployment guide
- Pricing templates
- Sales scripts
- Support from our team

One-time investment. Unlimited clients. Forever.

Let's do this,
[Your Name]

P.S. - The best time to switch was 6 months ago. The second best time is today. Don't wait another 6 months wishing you had started.`,
      timing: "2 days after Email 2",
      goal: "Purchase agency license"
    },
    {
      day: 5,
      subject: "🎁 [Case Study] $18K → $47K in 4 months",
      preview: "Here's exactly what Sarah did...",
      body: `{First_Name},

Let me show you something cool.

Sarah Martinez runs a marketing agency. She had 24 GHL clients at $297/month.

Revenue: $7,128/month

Not bad, but she was maxed out. Couldn't take more clients without hiring.

Then she deployed AIFreedomDuane Studio to all 24 clients.

Sent them this email:

"Hi [Client], I'm upgrading your GHL account with our new AI Content Suite. You'll now have unlimited video generation and social media automation. Your new price is $497/month starting next billing cycle. Questions? Let me know!"

Results:
- 22 clients said "sounds great!"
- 2 clients churned (she didn't care)
- New revenue: $10,934/month

That's $3,806/month MORE for the SAME clients.

But she didn't stop there.

She used the new positioning to sign 18 NEW clients at $597/month.

Total revenue now: $21,680/month

Oh, and she's spending LESS time on fulfillment because the platform does the work.

Her exact revenue: $47,214/month (with the new signups).

Want her playbook?

I'm hosting a free training tomorrow showing:
- The exact email she sent
- Her new sales script
- How to migrate existing clients
- How to sign new clients at premium pricing

👉 Register here: [LINK TO WEBINAR]

It's 45 minutes. Could be the most profitable 45 minutes of your year.

See you there,
[Your Name]

P.S. - Sarah's agency is now worth $566K+ based on standard 2x revenue multiples. All because she changed her positioning. Don't underestimate the power of packaging.`,
      timing: "2 days after Email 3",
      goal: "Register for webinar / Book call"
    },
    {
      day: 7,
      subject: "⏰ Last call (doors closing)",
      preview: "Don't miss this...",
      body: `{First_Name},

This is my last email about this (for now).

We're closing new agency enrollments tonight at midnight.

Why? We only onboard 50 agencies per month so we can give proper support.

We're at 47/50 spots filled.

If you've been on the fence, here's what you need to know:

✅ One-time investment ($1,997)
✅ Deploy to UNLIMITED clients
✅ Charge $297-$997/month per client
✅ White-label under YOUR brand
✅ No monthly fees, ever
✅ 30-day money-back guarantee

Math:
- 20 clients × $497/month = $9,940/month
- That's $119,280/year
- Your cost: $1,997 (59x ROI first year)

The agencies who joined 6 months ago?

They're already at $30K-$50K/month.

They didn't have some secret advantage.

They just started earlier.

You can be in their position 6 months from now.

Or you can still be charging $97/month and wondering "what if?"

Your choice.

👉 Claim your spot: [LINK]

Only 3 spots left.

Let's go,
[Your Name]

P.S. - If you don't join now, you'll have to wait until next month. And honestly? Your competitors aren't waiting. Just something to think about.`,
      timing: "2 days after Email 4",
      goal: "Purchase agency license (urgency)"
    }
  ];

  // VIDEO SCRIPT
  const videoScript = {
    title: "2-Minute Demo Video Script",
    duration: "2:00",
    style: "Screen recording with voiceover + talking head intro/outro",
    script: `
[0:00 - 0:15] HOOK (Talking Head)
"What if I told you that you could charge your GHL clients $497 per month instead of $97... for the exact same backend... just packaged differently? Sounds crazy, right? Let me show you how 847 agencies are doing exactly that."

[0:15 - 0:25] PROBLEM (Screen: Show typical GHL dashboard)
"Here's the problem with selling GHL setup. Your clients see this. They Google it. They find 100 other agencies offering the same thing. You're forced to compete on price. You end up stuck at $97-$197 per month."

[0:25 - 0:40] SOLUTION (Screen: Show AIFreedomDuane Studio dashboard)
"But what if your clients saw THIS instead? This is AIFreedomDuane Studio. It's the same GHL backend, but with a completely different frontend. AI video generation. Social media automation. Content calendars. Analytics. All white-labeled under YOUR brand."

[0:40 - 0:55] PROOF (Screen: Show client dashboard creating video)
"Watch this. Click 'Create Video.' Enter a prompt. AI generates a professional video in 60 seconds. No Fiverr. No video editors. No $200 invoices. Your clients get unlimited videos. They stop paying other people. They pay YOU instead."

[0:55 - 1:10] SOCIAL PROOF (Screen: Show testimonial or revenue screenshot)
"Mike Johnson deployed this to 32 clients. He charges $497 per month. That's $15,904 per month in recurring revenue. His cost per client? Zero. After a one-time setup of $1,997. Do the math. That's a 59x ROI in the first year alone."

[1:10 - 1:25] FEATURES (Screen: Quickly show features)
"Here's what your clients get: Unlimited AI videos. Post to Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube automatically. Content calendar. Analytics dashboard. CRM integration with GHL. Team collaboration. All under your brand. Your logo. Your colors. Your domain."

[1:25 - 1:40] OFFER (Screen: Show pricing)
"Here's how it works for you. One-time investment: $1,997. That gets you unlimited client deployments. Forever. No monthly fees. No per-client costs. You charge $297 to $997 per month per client. Most agencies charge $497. That means your 10th client pays for your entire investment. Everything after that? Pure profit."

[1:40 - 1:55] CTA (Talking Head)
"847 agencies are already using this. They're signing clients at premium pricing while their competitors fight for $97 per month. The best part? You can deploy this to your existing clients THIS WEEK. They'll thank you for it. Ready to see the full setup? Click the button below. I'll show you exactly how to deploy your first client in the next 5 minutes. Let's go."

[1:55 - 2:00] FINAL FRAME (Screen: CTA button)
Text on screen: "Get Agency Access → $1,997 One-Time"
Voiceover: "Click below. See you inside."

[END]

---

EDITING NOTES:
- Fast cuts (no dead air)
- Upbeat background music (not too loud)
- Captions throughout (70% watch without sound)
- Arrows/highlights pointing to key features
- Show real dashboard, real numbers
- Keep energy HIGH
- Time the CTA at exactly 1:40 (YouTube drop-off point)
`
  };

  // GHL MARKETPLACE LISTING
  const marketplaceListing = {
    title: "AIFreedomDuane Studio - AI Content Creation Platform",
    tagline: "Turn Your GHL Into a $50K/Month AI Content Machine",
    category: "Marketing & Content Creation",
    price: "$1,997 one-time (Agency License)",
    shortDescription: "White-label AI video generation + social media automation platform. Deploy to unlimited clients. Charge $297-$997/month. 80%+ profit margins. Used by 847+ agencies.",
    longDescription: `
## 🚀 TRANSFORM YOUR GHL AGENCY OVERNIGHT

Stop competing on price. Start dominating your market.

AIFreedomDuane Studio is the white-label AI content creation platform that lets you charge premium prices while your competitors fight for $97/month scraps.

---

## 💰 THE AGENCY OPPORTUNITY

**What You Pay:**
- $1,997 one-time
- $0 per client (unlimited deployments)
- $0 monthly fees
- $0 transaction fees

**What You Charge:**
- Starter Tier: $297/month
- Professional: $497/month  
- Enterprise: $997/month
- Setup Fee: $297-$997 one-time

**Your Math:**
- 20 clients × $497/month = **$9,940/month**
- Annual revenue: **$119,280**
- Your cost: **$1,997** (59x ROI)
- Profit margin: **80%+**

---

## ✨ WHAT YOUR CLIENTS GET

### AI Video Generation
- Unlimited professional videos
- Text-to-video in 60 seconds  
- Custom templates library
- Multiple aspect ratios (YouTube, TikTok, Instagram)
- No video editing skills required

### Social Media Automation
- Post to all platforms automatically
- Content calendar with AI suggestions
- Best posting time optimization  
- Hashtag recommendations
- Platform-specific formatting

### CRM Integration
- Seamless GHL sync
- Contact automation
- Lead scoring
- Opportunity creation
- Custom field mapping

### Analytics Dashboard
- Real-time performance metrics
- Multi-platform reporting
- Engagement tracking
- ROI calculations
- White-labeled reports

### Team Collaboration
- Multi-user access
- Role-based permissions
- Project management
- Client portal
- Internal messaging

---

## 🎯 PERFECT FOR THESE NICHES

**Real Estate Agents**
- Property video tours
- Social media presence
- Lead nurturing
- *Typical pricing: $497/month*

**Coaches & Consultants**
- Course content creation
- Client communications
- Testimonial videos
- *Typical pricing: $397/month*

**Local Businesses**
- Social media management
- Promotional videos
- Review automation
- *Typical pricing: $297/month*

**E-commerce Brands**
- Product videos
- Ad creative
- Influencer outreach
- *Typical pricing: $597/month*

**Agencies & Marketers**
- White-label offering
- Client deliverables
- Reporting automation
- *Typical pricing: $797/month*

---

## 🏆 REAL RESULTS FROM REAL AGENCIES

### Mike Johnson - Digital Growth Co.
*"Added $24K/month in 90 days. The ROI is insane - paid for itself with the first client!"*
- 32 active clients
- $497/month average
- $15,904/month recurring

### Sarah Martinez - SM Marketing Solutions
*"My clients love it. I charge $497/month and my cost is basically $0."*
- 24 active clients  
- $497/month average
- $11,928/month recurring

### David Chen - Peak Performance Agency
*"The white-label features are incredible. Clients think I built it myself."*
- 42 active clients
- $597/month average
- $25,074/month recurring

**Combined Revenue: $52,906/month**  
**Combined Clients: 98**  
**Average Client Value: $540/month**

---

## 🎁 WHAT'S INCLUDED

### Platform Access
✅ Unlimited client deployments  
✅ Full white-label customization  
✅ Custom domain support  
✅ Your logo, colors, branding  
✅ Email sending from your domain  

### Marketing Materials
✅ Done-for-you sales page template  
✅ Email sequence templates  
✅ Proposal templates  
✅ Pricing calculator  
✅ Video demos  

### Training & Support
✅ Deployment video training  
✅ Sales script templates  
✅ Weekly group coaching calls  
✅ Private Slack community  
✅ Priority email support  

### Technical Setup
✅ GHL integration (automatic)  
✅ Webhook configuration  
✅ Custom fields mapping  
✅ Snapshot deployment guide  
✅ API documentation  

---

## 🚀 DEPLOYMENT PROCESS

**Step 1:** Purchase Agency License ($1,997 one-time)  
**Step 2:** Customize your white-label branding (5 minutes)  
**Step 3:** Deploy to client GHL account (1 click)  
**Step 4:** Client logs in and starts creating (instant)  
**Step 5:** Collect $297-$997/month (recurring)  

**Total time:** Less than 10 minutes per client.

---

## 💎 WHY AGENCIES CHOOSE US

### Unlimited Deployments
Deploy to 10 clients or 1,000 clients. Same price. No per-seat fees. No limits.

### True White-Label
Your clients never see our brand. Ever. It's YOUR platform. Your logo. Your domain. Your business.

### Zero Monthly Costs
One-time investment. No SaaS subscription. No surprise fees. Keep 100% of what you charge.

### Instant Deployment
One-click snapshot installation. Client is up and running in minutes. No technical skills required.

### Enterprise Features
Bank-level security. GDPR compliant. SOC 2 Type II certified. 99.9% uptime SLA.

### Proven Success
847+ agencies. 12,439 deployed clients. $6.2M+ in monthly recurring revenue generated.

---

## 📊 PRICING TIERS (WHAT YOU CHARGE CLIENTS)

### Starter - $297/month
- 5 videos/month
- 3 social platforms
- Basic analytics
- Email support
- *Perfect for: Small businesses*

### Professional - $497/month (MOST POPULAR)
- 20 videos/month
- All platforms
- Advanced analytics
- Priority support  
- Team access (3 users)
- *Perfect for: Growing businesses*

### Enterprise - $997/month
- Unlimited videos
- Unlimited platforms
- Custom integrations
- Dedicated success manager
- Unlimited team
- API access
- *Perfect for: Large organizations*

*Suggested Setup Fee: $297-$997 one-time*

---

## 🎯 YOUR REVENUE PROJECTIONS

### Month 1
- 5 clients × $497 = $2,485/month
- Setup fees: $2,485 one-time
- **Total: $4,970**

### Month 3  
- 15 clients × $497 = $7,455/month
- **Total: $7,455/month recurring**

### Month 6
- 30 clients × $497 = $14,910/month
- **Total: $14,910/month recurring**

### Month 12
- 50 clients × $497 = $24,850/month
- **Total: $298,200/year**

*Your cost: $1,997 one-time (149x ROI in year 1)*

---

## ❓ FREQUENTLY ASKED QUESTIONS

**Q: Do I need technical skills?**  
A: No. One-click deployment. We handle the technical setup.

**Q: Can I use my own domain?**  
A: Yes. Full white-label includes custom domain support.

**Q: Is there a monthly fee?**  
A: No. $1,997 one-time. No recurring costs. Ever.

**Q: How many clients can I deploy to?**  
A: Unlimited. Deploy to 10 or 10,000 clients. Same price.

**Q: What if my client churns?**  
A: Deploy to a new client instantly. No additional cost.

**Q: Do you offer support?**  
A: Yes. Email support, weekly coaching, private community.

**Q: Can I customize the features?**  
A: Yes. Full API access for custom integrations (Elite plan).

**Q: What's your refund policy?**  
A: 30-day money-back guarantee. No questions asked.

**Q: How long does deployment take?**  
A: Less than 5 minutes per client. One-click snapshot installation.

**Q: Do my clients know about you?**  
A: No. It's 100% white-labeled. Your brand only.

---

## 🔒 SECURITY & COMPLIANCE

✅ **Bank-Level Encryption:** 256-bit SSL  
✅ **GDPR Compliant:** EU data protection  
✅ **SOC 2 Type II:** Audited security  
✅ **99.9% Uptime SLA:** Enterprise reliability  
✅ **Daily Backups:** Automatic data protection  
✅ **2FA Available:** Enhanced security  

---

## 🎁 LIMITED-TIME BONUSES

### Join This Month and Get:

**Bonus #1:** Done-For-You Sales Funnel ($997 value)  
- High-converting sales page
- Email automation sequence
- Follow-up sequences  
- Booking calendar integration

**Bonus #2:** Client Proposal Templates ($497 value)  
- 5 proven proposal templates
- Pricing calculators
- ROI demonstrations
- Contract templates

**Bonus #3:** Marketing Asset Pack ($297 value)  
- Social media graphics
- Ad copy templates
- Video scripts  
- Email templates

**Bonus #4:** First-Month Revenue Accelerator ($1,997 value)  
- Personal strategy call
- Launch plan blueprint
- First 5 clients roadmap
- Private mastermind access

**Total Bonus Value: $3,788**  
**Your Investment: $1,997**

---

## 💰 INVESTMENT OPTIONS

### Agency Starter - $497 One-Time
- Up to 5 client deployments
- Full white-label
- GHL integration
- Email support
- Basic training

### Agency Pro - $1,997 One-Time ⭐ MOST POPULAR
- UNLIMITED client deployments
- Everything in Starter
- Priority support
- Weekly coaching
- All bonuses included
- Private community

### Agency Elite - $4,997 One-Time  
- Everything in Pro
- Custom feature development
- Dedicated success manager
- White-glove setup
- Co-marketing opportunities
- Revenue share program

---

## 🚀 READY TO TRANSFORM YOUR AGENCY?

**847 agencies** are already using this to dominate their markets.

They're signing clients at **$297-$997/month** while their competitors fight for **$97/month**.

They're building **$50K+/month agencies** with **80%+ profit margins**.

They're working **less** and earning **more**.

**Your competitors might already be one of them.**

---

## 📞 GET STARTED IN 3 STEPS

**Step 1:** Click "Purchase" below  
**Step 2:** Complete white-label setup (5 mins)  
**Step 3:** Deploy to your first client

**First client pays for your investment.**  
**Everything after that is profit.**

---

## 🔥 SPECIAL OFFER: Only 50 Spots Per Month

We only onboard 50 agencies per month to ensure proper support and training.

**Current Spots Available: 3/50**

Once we hit 50, new enrollments close until next month.

**Don't wait. Your competitors aren't.**

---

## 💎 30-DAY MONEY-BACK GUARANTEE

Try it risk-free for 30 days.

If you don't see the value, email us for a full refund.

No questions. No hassle. No risk.

**The only risk is waiting.**

---

## 📧 QUESTIONS?

**Email:** agency@aifreedomduane.com  
**Phone:** (555) 123-4567  
**Live Chat:** Available 9am-6pm EST  
**Book a Call:** [Calendar Link]

---

## 🎯 JOIN 847 SUCCESSFUL AGENCIES

Click "Purchase" below to claim your agency license.

**See you inside.**

*- The AIFreedomDuane Team*

---

*Testimonials and earnings represent individual results and may not be typical. Your results may vary based on effort, market conditions, and other factors.*
`,
    screenshots: [
      "Hero dashboard view with $7,940/month visible",
      "AI video creation interface",
      "Social media automation calendar",
      "Analytics dashboard (white-labeled)",
      "Client onboarding flow",
      "Mobile responsive views",
      "GHL integration settings",
      "Revenue calculator tool",
      "Template library",
      "Team collaboration interface"
    ],
    demoVideo: "2-minute platform walkthrough showing key features",
    tags: ["AI", "Video Generation", "Social Media", "Automation", "White-Label", "Marketing", "Content Creation", "GHL Integration", "Agency", "SaaS"],
    supportEmail: "agency@aifreedomduane.com",
    documentationUrl: "https://docs.aifreedomduane.com/agency",
    affiliateProgram: "30% recurring commission available"
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mx-auto">
            <Zap className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white heading-font">
            Complete Marketing Arsenal
          </h1>
          <p className="text-gray-400 text-lg">
            Everything you need to sell AIFreedomDuane Studio to agencies
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Facebook Ads", value: "5", icon: Facebook },
            { label: "Email Sequences", value: "5", icon: Mail },
            { label: "Video Script", value: "1", icon: Video },
            { label: "Marketplace Copy", value: "1", icon: Globe }
          ].map((stat, idx) => (
            <Card key={idx} className="bg-[#111317] border-gray-800 rounded-xl text-center p-4">
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="facebook" className="space-y-6">
          <TabsList className="bg-[#111317] border border-gray-800 grid grid-cols-4">
            <TabsTrigger value="facebook">
              <Facebook className="w-4 h-4 mr-2" />
              Facebook Ads
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Sequence
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="w-4 h-4 mr-2" />
              Video Script
            </TabsTrigger>
            <TabsTrigger value="marketplace">
              <Globe className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
          </TabsList>

          {/* Facebook Ads Tab */}
          <TabsContent value="facebook">
            <div className="space-y-6">
              {facebookAds.map((ad, idx) => (
                <Card key={ad.id} className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-3 mb-2">
                          <Badge className="bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2]/30">
                            Ad #{idx + 1}
                          </Badge>
                          {ad.title}
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-2">
                          <strong>Targeting:</strong> {ad.targeting}
                        </p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(`Headline: ${ad.headline}\n\nPrimary Text:\n${ad.primaryText}\n\nCTA: ${ad.cta}`, ad.id)}
                        variant="outline"
                        size="sm"
                        className="border-gray-700"
                      >
                        {copied === ad.id ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied === ad.id ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">📱 Headline</h4>
                      <p className="text-[#FFD700] text-lg font-bold">{ad.headline}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">📝 Primary Text</h4>
                      <div className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-4">
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">
                          {ad.primaryText}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">🎯 Call to Action</h4>
                      <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] border-[#00D4C9]/30">
                        {ad.cta}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">🖼️ Suggested Image</h4>
                      <p className="text-gray-400 text-sm italic">{ad.image}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold mb-3 text-lg">💡 Pro Tips for Facebook Ads</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>✅ Start with $10-20/day budget per ad</li>
                    <li>✅ Test all 5 ads simultaneously (different audiences)</li>
                    <li>✅ Turn off ads with CPA &gt; $50 after 100 clicks</li>
                    <li>✅ Scale winners to $100-200/day</li>
                    <li>✅ Target GHL Groups, Marketing Agencies, Business Coaches</li>
                    <li>✅ Retarget video viewers (create custom audience)</li>
                    <li>✅ A/B test headlines every 3 days</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Sequence Tab */}
          <TabsContent value="email">
            <div className="space-y-6">
              {emailSequence.map((email, idx) => (
                <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-3 mb-2">
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
                            Day {email.day}
                          </Badge>
                          {email.subject}
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-2">
                          <strong>Preview:</strong> {email.preview}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          <strong>Goal:</strong> {email.goal}
                        </p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(`Subject: ${email.subject}\n\nPreview: ${email.preview}\n\n${email.body}`, `email-${idx}`)}
                        variant="outline"
                        size="sm"
                        className="border-gray-700"
                      >
                        {copied === `email-${idx}` ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied === `email-${idx}` ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-6">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {email.body}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold mb-3 text-lg">💡 Email Sequence Best Practices</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>✅ Use {"{First_Name}"} personalization in every email</li>
                    <li>✅ Send Day 0 immediately after opt-in</li>
                    <li>✅ Track open rates (aim for 30%+)</li>
                    <li>✅ Track click rates (aim for 5%+)</li>
                    <li>✅ If no engagement after Day 5, try re-engagement campaign</li>
                    <li>✅ Remove non-openers after 14 days</li>
                    <li>✅ A/B test subject lines</li>
                    <li>✅ Include PS sections (highest read rate)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Video Script Tab */}
          <TabsContent value="video">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white mb-2">{videoScript.title}</CardTitle>
                    <div className="flex gap-3 mt-2">
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                        Duration: {videoScript.duration}
                      </Badge>
                      <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                        {videoScript.style}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(videoScript.script, 'video')}
                    variant="outline"
                    size="sm"
                    className="border-gray-700"
                  >
                    {copied === 'video' ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied === 'video' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-6">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {videoScript.script}
                  </pre>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <h4 className="text-purple-400 font-semibold mb-3">🎬 Production Checklist</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>✅ Record in 1920×1080 (minimum)</li>
                    <li>✅ Use Loom or ScreenFlow for screen recording</li>
                    <li>✅ Record talking head with good lighting</li>
                    <li>✅ Use lapel mic or Blue Yeti</li>
                    <li>✅ Add captions (Rev.com or Descript)</li>
                    <li>✅ Background music at -20dB</li>
                    <li>✅ Export at 1080p, 30fps, H.264</li>
                    <li>✅ Upload to YouTube, Facebook, Vimeo</li>
                    <li>✅ Create 15-second teaser for ads</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Listing Tab */}
          <TabsContent value="marketplace">
            <div className="space-y-6">
              
              {/* Header Info */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-2xl mb-3">{marketplaceListing.title}</CardTitle>
                      <p className="text-[#FFD700] text-xl font-semibold mb-2">{marketplaceListing.tagline}</p>
                      <div className="flex gap-3 flex-wrap">
                        <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                          {marketplaceListing.category}
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-400">
                          {marketplaceListing.price}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(marketplaceListing.longDescription, 'marketplace')}
                      variant="outline"
                      size="sm"
                      className="border-gray-700"
                    >
                      {copied === 'marketplace' ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied === 'marketplace' ? 'Copied!' : 'Copy Full'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-lg mb-4">{marketplaceListing.shortDescription}</p>
                </CardContent>
              </Card>

              {/* Full Description */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Full Marketplace Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-6 max-h-[600px] overflow-y-auto">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {marketplaceListing.longDescription}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Screenshots Checklist */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">📸 Required Screenshots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {marketplaceListing.screenshots.map((screenshot, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0B0C] border border-gray-800">
                        <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{screenshot}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">📋 Additional Listing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {marketplaceListing.tags.map((tag, idx) => (
                        <Badge key={idx} className="bg-gray-800 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Support Email</h4>
                    <p className="text-[#00D4C9] font-mono">{marketplaceListing.supportEmail}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Documentation URL</h4>
                    <p className="text-[#00D4C9] font-mono">{marketplaceListing.documentationUrl}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Affiliate Program</h4>
                    <p className="text-gray-300">{marketplaceListing.affiliateProgram}</p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

        </Tabs>

        {/* Download All Button */}
        <Card className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3 heading-font">
              🎁 Complete Marketing Kit Ready!
            </h3>
            <p className="text-gray-300 mb-6">
              5 Facebook Ads + 5-Email Sequence + Video Script + Marketplace Listing
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold px-8">
                <Download className="w-5 h-5 mr-2" />
                Download All Assets
              </Button>
              <Button variant="outline" className="border-gray-700 text-white px-8">
                <TrendingUp className="w-5 h-5 mr-2" />
                View ROI Calculator
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}