import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";

const Check = () => <CheckCircle2 className="w-5 h-5 text-green-400" />;
const XIcon = () => <X className="w-5 h-5 text-red-400" />;
const Warn = () => <AlertTriangle className="w-5 h-5 text-yellow-400" />;

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    blurb: "Creators getting serious",
    monthly: 297,
    annual: 297 * 10, // 2 months free
    cta: { label: "Start Free", href: "/signup?plan=starter" },
    features: [
      "Video renders: 30/mo (1080p)",
      "AI avatar minutes: 60/mo",
      "Voice cloning: 1 voice",
      "Auto-captions: 30 videos/mo",
      "Campaigns & funnels: 3 active",
      "Follow-up sequences: 5 steps",
      "Social publishing: 5 profiles",
      "GHL bi-directional sync",
      "Basic analytics dashboard",
      "Email support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    blurb: "Coaches & growth teams",
    monthly: 497,
    annual: 497 * 10,
    highlighted: true,
    cta: { label: "Upgrade to Pro", href: "/signup?plan=pro" },
    features: [
      "Video renders: 100/mo (1080p/9:16)",
      "AI avatar minutes: 200/mo",
      "Voice cloning: 3 voices",
      "Auto-captions: 100 videos/mo",
      "Campaigns & funnels: 10 active",
      "Follow-up sequences: 10 steps",
      "Social publishing: 10 profiles",
      "GHL bi-directional + Snapshots",
      "NBA analytics (Next Best Action)",
      "Priority support",
    ],
  },
  {
    key: "agency",
    name: "Agency",
    blurb: "Agencies & small studios",
    monthly: 997,
    annual: 997 * 10,
    cta: { label: "Get Agency", href: "/signup?plan=agency" },
    features: [
      "Video renders: 300/mo (1080p/4K mix)",
      "AI avatar minutes: 600/mo",
      "Voice cloning: 10 voices",
      "Auto-captions: 300 videos/mo",
      "Campaigns & funnels: 30 active",
      "Follow-up sequences: 12 steps",
      "Social publishing: 30 profiles",
      "Client portals (white-label ready)",
      "Full NBA analytics + A/B testing",
      "Email + chat support (SLA)",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    blurb: "Custom at scale",
    priceNote: "Custom",
    cta: { label: "Talk to Sales", href: "/book?topic=enterprise" },
    features: [
      "Unlimited workspaces",
      "Custom video/voice quotas",
      "SAML SSO & RBAC",
      "Dedicated CSM & onboarding",
      "Private model endpoints",
      "Data residency options",
      "Premium SLA & security review",
    ],
  },
];

const ADDONS = [
  {
    key: "reception",
    name: "AI Voice Receptionist",
    price: 97,
    setup: 0,
    unit: "/mo per workspace",
    note: "1,000 AI min/mo ($0.06/min overage)",
    items: [
      "24/7 call answering",
      "Appointment scheduling",
      "Lead qualification",
      "CRM sync + SMS follow-ups",
    ],
  },
  {
    key: "ctv",
    name: "CTV Publishing Suite",
    price: 147,
    setup: 0,
    unit: "/mo",
    note: "6 platforms included",
    items: [
      "Roku, Apple TV, Fire TV",
      "Samsung, Vizio, Android TV",
      "Channel wizard + feeds",
      "Auto-publish to playlists",
    ],
  },
  {
    key: "whitelabel",
    name: "White-Label Brand Pack",
    price: 197,
    setup: 0,
    unit: "/mo",
    note: "Custom domain included",
    items: [
      "Custom domain & branding",
      "Client portal access",
      "Usage-based billing",
      "Affiliate dashboard",
    ],
  },
  {
    key: "concierge",
    name: "Concierge Setup",
    price: 0,
    setup: 1497,
    unit: "one-time",
    note: "White-glove onboarding",
    items: [
      "Done-for-you integrations",
      "Offer & funnel buildout",
      "Launch checklist",
      "90-min team training",
    ],
  },
];

const COMPETITORS = [
  { name: "AI Freedom", price: "$297–$997", content: <Check/>, campaigns: <Check/>, crm: <Check/>, ctv: <Check/>, voice: <Check/>, wl: <Check/> },
  { name: "Synthesia", price: "$89–$1,600", content: <Check/>, campaigns: <XIcon/>, crm: <XIcon/>, ctv: <XIcon/>, voice: <Warn/>, wl: <Warn/> },
  { name: "ClickFunnels", price: "$147–$297", content: <XIcon/>, campaigns: <Check/>, crm: <Warn/>, ctv: <XIcon/>, voice: <XIcon/>, wl: <Check/> },
  { name: "HubSpot", price: "$800–$3,600", content: <XIcon/>, campaigns: <Check/>, crm: <Check/>, ctv: <XIcon/>, voice: <XIcon/>, wl: <XIcon/> },
  { name: "Descript", price: "$24–$50", content: <Warn/>, campaigns: <XIcon/>, crm: <XIcon/>, ctv: <XIcon/>, voice: <XIcon/>, wl: <XIcon/> },
  { name: "Jasper", price: "$49–$125", content: <Check/>, campaigns: <XIcon/>, crm: <XIcon/>, ctv: <XIcon/>, voice: <XIcon/>, wl: <XIcon/> },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-[#0B0B0C] text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <header className="text-center mb-12">
          <Badge className="bg-[#FFD700]/20 text-[#FFD700] mb-4">
            💰 Transparent Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple Pricing That Scales With You
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            All plans include AI content, funnels, follow-ups, social publishing, and GHL sync. Limits scale by tier.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 mt-6 bg-[#111317] border border-gray-800 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                !annual 
                  ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                annual 
                  ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Annual
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                Save 17%
              </Badge>
            </button>
          </div>
        </header>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {PLANS.map((p) => {
            const price = p.monthly ? (annual ? p.annual : p.monthly) : null;
            const priceLabel = p.priceNote || `$${price?.toLocaleString()}`;
            const priceSuffix = p.priceNote ? "" : (annual ? "/yr" : "/mo");
            const savings = annual && p.monthly ? Math.round((1 - (p.annual / (p.monthly * 12))) * 100) : 0;

            return (
              <Card
                key={p.key}
                className={`rounded-2xl overflow-hidden ${
                  p.highlighted 
                    ? "border-2 border-[#FFD700] bg-gradient-to-br from-[#FFD700]/10 to-[#00D4C9]/10 scale-105" 
                    : "border border-gray-800 bg-[#111317]"
                }`}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  {p.highlighted && (
                    <Badge className="bg-[#FFD700] text-black font-bold mb-3 w-fit">
                      ⭐ MOST POPULAR
                    </Badge>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">{p.blurb}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{p.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">{priceLabel}</span>
                      <span className="text-gray-400 ml-1">{priceSuffix}</span>
                    </div>
                    {annual && savings > 0 && (
                      <p className="text-green-400 text-xs mt-1">
                        💰 Save ${(p.monthly * 2).toLocaleString()} ({savings}% off)
                      </p>
                    )}
                  </div>

                  <ul className="text-sm text-gray-300 space-y-3 flex-1 mb-6">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a href={p.cta.href}>
                    <Button
                      className={`w-full py-6 text-base font-bold ${
                        p.highlighted
                          ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black hover:opacity-90"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                      }`}
                    >
                      {p.cta.label}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Usage Notes */}
        <div className="mb-12 p-6 bg-[#111317] border border-gray-800 rounded-2xl">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FFD700]" />
            Usage Limits & Pricing Notes
          </h3>
          <div className="text-sm text-gray-400 space-y-2">
            <div>• <strong className="text-gray-300">Managed ads available:</strong> 15% of ad spend (or custom enterprise terms)</div>
            <div>• <strong className="text-gray-300">Team seats:</strong> Starter 1, Pro 3, Agency 10, Enterprise custom • Extra seats: $15/mo each</div>
            <div>• <strong className="text-gray-300">Storage:</strong> Starter 100GB, Pro 300GB, Agency 1TB, Enterprise custom • Overage: $0.08/GB</div>
            <div>• <strong className="text-gray-300">Additional renders:</strong> $2 per video (1080p), $4 per 4K render</div>
            <div>• <strong className="text-gray-300">Setup fees:</strong> Basic wizard: Free • Pro hybrid: $497 • Enterprise concierge: $1,497</div>
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Popular Add-Ons</h3>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {ADDONS.map((addon) => (
              <Card key={addon.key} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#00D4C9]/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-white text-base flex-1">{addon.name}</h4>
                    <div className="text-right">
                      {addon.price > 0 && (
                        <div className="text-2xl font-bold text-white">${addon.price}</div>
                      )}
                      {addon.setup > 0 && (
                        <div className="text-lg font-bold text-[#FFD700]">${addon.setup}</div>
                      )}
                      <div className="text-xs text-gray-400">{addon.unit}</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-[#00D4C9] mb-3">{addon.note}</p>

                  <ul className="text-sm text-gray-300 space-y-2 mb-4">
                    {addon.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#00D4C9]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a href={`/signup?addon=${addon.key}`}>
                    <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-[#00D4C9] hover:text-black hover:border-[#00D4C9]">
                      Add to Plan
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Competitor Matrix */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">How We Compare</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#111317]">
            <table className="w-full text-sm">
              <thead className="bg-[#0B0B0C] border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-semibold">Platform</th>
                  <th className="p-4 text-gray-400 font-semibold">Price</th>
                  <th className="p-4 text-center text-gray-400 font-semibold">AI Content</th>
                  <th className="p-4 text-center text-gray-400 font-semibold">Campaigns</th>
                  <th className="p-4 text-center text-gray-400 font-semibold">CRM/GHL</th>
                  <th className="p-4 text-center text-gray-400 font-semibold">CTV</th>
                  <th className="p-4 text-center text-gray-400 font-semibold">Voice AI</th>
                  <th className="p-4 text-center text-gray-400 font-semibold">White-Label</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={c.name} className={`border-b border-gray-800 ${i === 0 ? "bg-[#FFD700]/5" : ""}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {i === 0 && (
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex-shrink-0" />
                        )}
                        <span className={`font-semibold ${i === 0 ? "text-[#FFD700]" : "text-white"}`}>
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{c.price}</td>
                    <td className="p-4 text-center">{c.content}</td>
                    <td className="p-4 text-center">{c.campaigns}</td>
                    <td className="p-4 text-center">{c.crm}</td>
                    <td className="p-4 text-center">{c.ctv}</td>
                    <td className="p-4 text-center">{c.voice}</td>
                    <td className="p-4 text-center">{c.wl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-[#FFD700]/10 to-[#00D4C9]/10 border border-[#FFD700]/30">
            <p className="text-white text-center">
              <strong>Replace 6–14 tools:</strong>{" "}
              <span className="text-gray-400 line-through">$4,000+/mo equivalent stack</span>
              {" "}→{" "}
              <span className="text-[#FFD700] text-2xl font-bold">$297–$997/mo</span>
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <h4 className="font-semibold text-white mb-3">What's included in every plan?</h4>
              <p className="text-gray-400 text-sm">
                Core studio (video, copy, art), funnel builder, 10-touch follow-ups, social scheduler, 
                GHL sync, basic analytics, and API access. Limits scale by tier.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <h4 className="font-semibold text-white mb-3">Do you offer setup or managed services?</h4>
              <p className="text-gray-400 text-sm">
                Yes. Concierge Setup is one-time <span className="text-white font-semibold">$1,497</span>. 
                Managed ads are <span className="text-white font-semibold">15% of ad spend</span>. 
                White-label agencies can resell with their own pricing.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
}