
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MarketingSalesSuite() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 bg-[#0C0C0C] min-h-screen">
      <Header />
      <FeatureGrid />
      <QuickActions />
      <ApiGuide />
      <BillingModels />
      <FAQ />
    </div>
  );
}

/* ---------- Sections ---------- */

function Header() {
  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-bold text-white">AI Marketing & Sales Suite</h1>
      <p className="text-base text-gray-300">
        <strong className="text-[#FFD700]">Video Studio 2.0 + AI Copilot</strong> — Create and deploy campaigns from idea to published ad in one flow.
      </p>
      <p className="text-sm text-gray-400">
        Enterprise-grade offer creation, one-click funnel deployment, AI follow-up across Email/SMS/DM/Voice, 
        ROAS-driven budget automation, and real-time "Next Best Action" optimization.
      </p>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: "🎯",
      title: "Offer & Messaging Module",
      desc: "AI-driven copy with belief-alignment scoring and buyer-type templates (Visionary, Analyst, Skeptic, Follower, Emotional).",
      link: "OfferBuilder"
    },
    {
      icon: "🔁",
      title: "Lifecycle Follow-Up Engine",
      desc: "Multi-channel 10-touch nurtures over 14 days (Email, SMS, DM, Voice) with branching and intent detection.",
      link: "FollowUpBuilder"
    },
    {
      icon: "🚀",
      title: "Campaign Execution Pack",
      desc: "Ad creative builder, targeting presets, and one-click 'click → funnel → appointment' deployment to GHL.",
      link: "CampaignExecution"
    },
    {
      icon: "📊",
      title: "Funnel Analytics & NBA",
      desc: "Drop-off map (Ad→LP→Opt-in→Booking→Sale) + AI recommendations with impact/effort and guided fixes.",
      link: "FunnelAnalyticsNBA"
    },
    {
      icon: "💰",
      title: "Budget & Ad Spend Automation",
      desc: "Set budget; AI allocates across channels by ROAS/CPA. Supports subscription, % of spend, or hybrid with floor.",
      link: "BudgetManager"
    },
    {
      icon: "🤝",
      title: "White-Label + Affiliate",
      desc: "Custom domain/branding per client, feature toggles, referral & affiliate system with adaptive payouts.",
      link: "WhiteLabel"
    }
  ];

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link
            key={f.title}
            to={createPageUrl(f.link)}
            className="border border-gray-700 rounded-lg p-5 bg-[#111317] hover:bg-[#1a1a1f] hover:shadow-lg hover:border-[#FFD700] transition-all"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            <div className="inline-block mt-3 text-sm text-[#FFD700] font-medium">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QuickActions() {
  const actions = [
    { label: "Draft Offer", to: "OfferBuilder", tip: "Generate belief-aligned copy" },
    { label: "Build Follow-Up", to: "FollowUpBuilder", tip: "Create 10-touch multi-channel" },
    { label: "Generate Ads", to: "CampaignExecution", tip: "Meta / TikTok / YouTube variants" },
    { label: "Launch Funnel", to: "CampaignExecution", tip: "Auto-deploy to GHL" },
    { label: "Get NBA", to: "FunnelAnalyticsNBA", tip: "AI next-best action" },
    { label: "Set Budget", to: "BudgetManager", tip: "AI allocation + fee model" }
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">One-Click Actions</h2>
      <div className="flex flex-wrap gap-2">
        {actions.map(a => (
          <Link
            key={a.label}
            to={createPageUrl(a.to)}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#FFD700] hover:text-black transition-all border border-gray-700"
          >
            {a.label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        💡 Tip: use the Copilot — try "Deploy funnel for real estate offer at $50/day".
      </p>
    </section>
  );
}

function ApiGuide() {
  const [open, setOpen] = useState(false);
  return (
    <section className="border border-gray-800 rounded-lg p-5 bg-[#111317]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">API Integration Guide (Core Endpoints)</h2>
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-[#00D4C9] hover:text-[#FFD700] font-medium transition-colors"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <ApiItem
            method="POST"
            path="/api/v1/offer/generate"
            purpose="Generate offer copy + Belief Score + improvements."
            body={`{ "product": "...", "audience": "...", "buyer_type": "visionary", "goal": "lead_gen" }`}
          />
          <ApiItem
            method="POST"
            path="/api/v1/followup/generate"
            purpose="Create 10-touch multi-channel nurture (Email/SMS/DM/Voice) with branching."
            body={`{ "offer_id": "off_123", "voice": "mentor", "objections": ["too expensive", "no time"], "days": 14 }`}
          />
          <ApiItem
            method="POST"
            path="/api/v1/ads/generate"
            purpose="Return Meta/TikTok/YT ad variants + targeting hypotheses."
            body={`{ "offer_id": "off_123", "metric": "CPL" }`}
          />
          <ApiItem
            method="POST"
            path="/api/v1/funnel/deploy"
            purpose="Deploy landing + sequences to GHL and start campaigns."
            body={`{ "offer_id": "off_123", "platforms": ["meta", "tiktok"], "budget": 500, "domain": "leads.aifs.com", "path": "/offer" }`}
          />
          <ApiItem
            method="POST"
            path="/api/v1/analytics/nba"
            purpose="AI Next-Best-Action suggestions from funnel metrics."
            body={`{ "funnel_run_id": "fr_55" }`}
          />
          <ApiItem
            method="POST"
            path="/api/v1/budget/set"
            purpose="Create AI allocation plan by channel with spend target."
            body={`{ "amount": 3000, "period": "month", "goal": "leads", "channels": ["meta", "tiktok", "email"] }`}
          />
          <ApiItem
            method="POST"
            path="/api/v1/budget/optimize"
            purpose="Rebalance allocation using live CPA/ROAS metrics."
            body={`{ "plan_id": "bp_123", "metrics": { "meta": {"cpa": 18, "roas": 2.0}, "tiktok": {"cpa": 12, "roas": 2.8} } }`}
          />

          <div className="mt-5 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-400 font-semibold text-sm mb-2">🔐 Authentication:</h4>
            <p className="text-gray-300 text-sm mb-2">
              Include JWT token in Authorization header: <code className="bg-black/30 px-2 py-1 rounded text-[#00D4C9]">Bearer YOUR_TOKEN</code>
            </p>
            <p className="text-gray-400 text-xs">
              Rate Limits: 100 req/min (Standard), 1000 req/min (Enterprise)
            </p>
          </div>

          <Link to={createPageUrl("CopilotGuide")}>
            <button className="w-full mt-4 px-4 py-3 rounded-lg bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black font-bold hover:opacity-90 transition-opacity">
              View Complete Backend Integration Guide →
            </button>
          </Link>
        </div>
      )}
    </section>
  );
}

function BillingModels() {
  return (
    <>
      <section className="border border-gray-800 rounded-xl p-6 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30">
        <h2 className="text-2xl font-bold text-white mb-4">💰 Managed Ads Pricing Models</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-[#0B0B0C] rounded-xl">
            <h4 className="text-white font-bold mb-2">Subscription Only</h4>
            <p className="text-gray-400 text-sm mb-2">
              $97–$297/mo for automation platform
            </p>
            <p className="text-gray-500 text-xs">
              Fixed monthly fee, no ad spend percentage
            </p>
          </div>

          <div className="p-4 bg-[#0B0B0C] rounded-xl">
            <h4 className="text-white font-bold mb-2">Percent of Ad Spend</h4>
            <p className="text-gray-400 text-sm mb-2">
              10–35% of total ad spend
            </p>
            <p className="text-gray-500 text-xs mb-2">
              <strong className="text-[#FFD700]">Typical:</strong> 15–25%
            </p>
            <p className="text-gray-500 text-xs">
              <strong className="text-[#00D4C9]">Minimum:</strong> $249–$749/mo
            </p>
          </div>

          <div className="p-4 bg-[#0B0B0C] rounded-xl border-2 border-[#FFD700]/30">
            <div className="inline-block px-2 py-1 bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold rounded mb-2">
              RECOMMENDED
            </div>
            <h4 className="text-white font-bold mb-2">Hybrid Model</h4>
            <p className="text-gray-400 text-sm mb-2">
              Subscription + % of spend
            </p>
            <p className="text-gray-500 text-xs mb-2">
              <strong className="text-[#FFD700]">Base:</strong> $97–$297/mo
            </p>
            <p className="text-gray-500 text-xs">
              <strong className="text-[#00D4C9]">Plus:</strong> 10–20% of ad spend (min $249/mo)
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h5 className="text-blue-400 font-semibold text-sm mb-2">🏢 Enterprise Option:</h5>
          <p className="text-gray-300 text-sm">
            <strong>$997+/mo</strong> with 10–20% of spend, dedicated strategist, priority render queue, white-glove onboarding, custom SOW (Statement of Work)
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          All models supported in-app (Stripe). Visit Budget Manager page for fee preview and checkout.
        </p>
      </section>

      {/* Budget Manager CTA */}
      <div className="text-center mt-8 p-6 bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
        <Link to={createPageUrl("BudgetManager")}>
          <button className="inline-block bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl hover:from-[#FFD700] hover:to-[#FF8C00] hover:text-black transition-all">
            🚀 Open Budget Manager — Set Spend & Checkout
          </button>
        </Link>
        <p className="text-sm text-gray-400 mt-3">
          Connect your Stripe or PayPal to activate hybrid ad-spend billing.
        </p>
      </div>
    </>
  );
}

function FAQ() {
  const qa = [
    ["Do I need a media buyer?", "No. The AI allocates budget, rotates creatives, and pauses low performers. You can override at any time."],
    ["Which channels are supported?", "Meta, TikTok, YouTube/Google, Email, SMS; add more with webhooks."],
    ["Can I white-label for clients?", "Yes—custom domain, branding, and per-client feature toggles are built in."],
    ["How does AI optimization work?", "AI monitors CTR, CVR, ROAS across all channels and automatically shifts budget to winners every 6 hours."],
    ["What's the setup time?", "Most users deploy their first funnel within 10 minutes using AI-generated templates."],
    ["Do you integrate with GoHighLevel?", "Yes—bi-directional sync, workflow triggers, and snapshot deployment included."]
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">FAQ</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {qa.map(([q, a]) => (
          <div key={q} className="border border-gray-800 rounded-lg p-4 bg-[#111317] hover:border-[#FFD700]/50 transition-all">
            <div className="font-semibold text-white mb-2 text-sm">{q}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- API Item Component ---------- */
function ApiItem({ method, path, purpose, body }) {
  return (
    <div className="border border-gray-800 rounded-lg p-3 bg-[#0B0B0C]">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 font-mono text-xs font-bold">
          {method}
        </span>
        <code className="text-[#00D4C9] text-sm font-mono">{path}</code>
      </div>
      <p className="text-xs text-gray-400 mb-2">{purpose}</p>
      <pre className="text-xs bg-black/40 border border-gray-800 rounded p-2 overflow-x-auto text-gray-300 font-mono">
        {body}
      </pre>
    </div>
  );
}
