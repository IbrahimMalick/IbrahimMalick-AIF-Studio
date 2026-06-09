
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  Video,
  Zap,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Rocket
} from "lucide-react";
import { motion } from "framer-motion";
import PricingSection from "@/components/PricingSection";

const Section = ({ id, title, subtitle, children, className = "" }) => (
  <section id={id} className={`py-12 md:py-20 ${className}`}>
    {title && (
      <header className="mb-8 md:mb-12 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white heading-font">{title}</h2>
        {subtitle && <p className="text-gray-400 mt-3 text-lg md:text-xl max-w-3xl mx-auto">{subtitle}</p>}
      </header>
    )}
    {children}
  </section>
);

const Stat = ({ k, v, icon: Icon }) => (
  <div className="rounded-xl border border-gray-800 bg-[#111317] p-5 text-center hover:border-[#FFD700]/50 transition-all">
    {Icon && <Icon className="w-6 h-6 mx-auto mb-2 text-[#FFD700]" />}
    <div className="text-3xl font-bold text-white">{v}</div>
    <div className="text-sm text-gray-400 mt-1">{k}</div>
  </div>
);

const Feature = ({ title, desc, icon }) => (
  <div className="rounded-xl border border-gray-800 bg-[#111317] p-6 hover:border-[#FFD700]/50 transition-all">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{desc}</p>
  </div>
);

const Testimonial = ({ quote, name, role, revenue }) => (
  <Card className="bg-[#111317] border-gray-800 hover:border-[#00D4C9]/50 transition-all">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center text-black font-bold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{name}</p>
          <p className="text-gray-400 text-xs">{role}</p>
        </div>
      </div>
      <p className="text-gray-300 text-sm italic mb-3">"{quote}"</p>
      {revenue && (
        <Badge className="bg-green-500/20 text-green-400">
          💰 {revenue}
        </Badge>
      )}
    </CardContent>
  </Card>
);

const Check = () => <CheckCircle2 className="w-5 h-5 text-green-400" />;
const Warn = () => <AlertTriangle className="w-5 h-5 text-yellow-400" />;
const XIcon = () => <X className="w-5 h-5 text-red-400" />;

export default function WebsiteLanding() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      
      {/* Navigation */}
      <header className="border-b border-gray-800 bg-[#0B0B0C]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
              <span className="text-black font-bold text-lg">AI</span>
            </div>
            <span className="font-bold text-[#FFD700] text-lg tracking-tight">AI Freedom Studios</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#compare" className="text-gray-300 hover:text-white transition-colors">Compare</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Results</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Log in
              </Button>
            </Link>
            <a href="#cta">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold hover:opacity-90">
                Start Free
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-[#00D4C9]/5 to-purple-500/5" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 mb-4">
                ⚡ AI-Powered Content Creation Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                From <span className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] bg-clip-text text-transparent">Idea</span> to{" "}
                <span className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] bg-clip-text text-transparent">Revenue</span>
                <br />in Under 40 Minutes
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
                Create videos, launch funnels, automate follow-ups, and scale across social & CTV — all powered by AI. 
                Replace 6-14 tools with one intelligent studio.
              </p>
              <div className="flex gap-4 flex-wrap">
                <a href="#cta">
                  <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg px-8 py-6 hover:scale-105 transition-transform">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </a>
                <Link to={createPageUrl("Home")}>
                  <Button variant="outline" className="border-2 border-white text-white text-lg px-8 py-6 hover:bg-white hover:text-black">
                    <Video className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-8">
                <Stat k="AI Models" v="50+" icon={Sparkles} />
                <Stat k="Platforms" v="12+" icon={Target} />
                <Stat k="Setup Time" v="<40min" icon={Zap} />
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl border-2 border-[#FFD700]/30 bg-gradient-to-br from-[#111317] to-[#0B0B0C] aspect-video overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-[#00D4C9]/10" />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <div className="text-center">
                    <Video className="w-20 h-20 mx-auto mb-4 text-[#FFD700]" />
                    <p className="text-gray-400">Dashboard Preview</p>
                    <p className="text-gray-500 text-sm mt-1">AI Avatar + Analytics Montage</p>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] opacity-20 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-gradient-to-br from-[#00D4C9] to-purple-500 opacity-20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4">
        <Section 
          id="features" 
          title="Everything You Need to Launch & Scale" 
          subtitle="Creation → Distribution → Optimization — in one place"
          className="bg-[#111317] -mx-4 px-4 md:-mx-0 md:px-0 md:rounded-3xl md:border md:border-gray-800 md:p-12"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Feature 
              title="AI Avatar Videos" 
              desc="Scripts, photoreal avatars, voice cloning, auto-captions, multilingual dubbing, and viral score prediction."
              icon="🎬"
            />
            <Feature 
              title="Smart Funnels & Automation" 
              desc="Drag-drop campaign builder with 10-touch follow-up sequences across email, SMS, DMs, and voice."
              icon="⚡"
            />
            <Feature 
              title="AI Voice Receptionist" 
              desc="24/7 call answering, appointment scheduling, lead qualification with sentiment analysis and CRM sync."
              icon="📞"
            />
            <Feature 
              title="Belief-Alignment Offer Scoring" 
              desc="8-factor psychology scoring for trust, pain resolution, status gain, and CTA clarity with AI suggestions."
              icon="🎯"
            />
            <Feature 
              title="CTV + Social Publishing" 
              desc="Publish to Roku, Apple TV, Fire TV, Instagram, YouTube, TikTok, LinkedIn — all from one dashboard."
              icon="📺"
            />
            <Feature 
              title="White-Label Agency Suite" 
              desc="Your brand, domain, pricing. Client portals, usage-based billing, affiliate program, and templates."
              icon="🏢"
            />
          </div>
        </Section>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4">
        <Section 
          id="compare" 
          title="How We Compare" 
          subtitle="Replace 6–14 tools with one integrated AI studio"
        >
          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#111317]">
            <table className="w-full text-sm">
              <thead className="bg-[#0B0B0C] border-b border-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-semibold">Feature</th>
                  <th className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FFD700] to-[#FF8C00]" />
                      <span className="text-[#FFD700] font-bold">AI Freedom</span>
                    </div>
                  </th>
                  <th className="p-4 text-center text-gray-400">Synthesia</th>
                  <th className="p-4 text-center text-gray-400">ClickFunnels</th>
                  <th className="p-4 text-center text-gray-400">HubSpot</th>
                  <th className="p-4 text-center text-gray-400">Descript</th>
                  <th className="p-4 text-center text-gray-400">Jasper</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: "AI Avatar Videos", vals: [<Check/>, <Check/>, <XIcon/>, <XIcon/>, <Warn/>, <XIcon/>] },
                  { f: "Marketing Funnels", vals: [<Check/>, <XIcon/>, <Check/>, <Check/>, <XIcon/>, <XIcon/>] },
                  { f: "AI Copywriting", vals: [<Check/>, <Warn/>, <Warn/>, <Warn/>, <XIcon/>, <Check/>] },
                  { f: "Belief Scoring", vals: [<Check/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>] },
                  { f: "10-Touch Sequences", vals: [<Check/>, <XIcon/>, <Warn/>, <Check/>, <XIcon/>, <XIcon/>] },
                  { f: "Meta/TikTok Ads", vals: [<Check/>, <XIcon/>, <XIcon/>, <Warn/>, <XIcon/>, <XIcon/>] },
                  { f: "AI Budget Optimizer", vals: [<Check/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>] },
                  { f: "CTV (6 Platforms)", vals: [<Check/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>] },
                  { f: "White-Label", vals: [<Check/>, <Warn/>, <Check/>, <XIcon/>, <XIcon/>, <XIcon/>] },
                  { f: "GoHighLevel", vals: [<Check/>, <XIcon/>, <Warn/>, <Check/>, <XIcon/>, <Warn/>] },
                  { f: "AI Copilot", vals: [<Check/>, <XIcon/>, <XIcon/>, <Warn/>, <XIcon/>, <Warn/>] },
                  { f: "Gamification", vals: [<Check/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>, <XIcon/>] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-[#0B0B0C]/50">
                    <td className="p-4 text-gray-200 font-medium">{row.f}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} className="p-4 text-center">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#FFD700]/10 to-[#00D4C9]/10 border border-[#FFD700]/30 text-center">
            <p className="text-white text-lg">
              <strong>Equivalent stack:</strong> <span className="text-gray-400 line-through">$4,000+/mo</span> 
              {" "}→ <span className="text-[#FFD700] text-2xl font-bold">$297–$997/mo</span>
            </p>
          </div>
        </Section>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4">
        <Section 
          id="testimonials" 
          title="Real Results from Real Users" 
          subtitle="Join 847+ agencies, creators, and coaches already scaling with AI"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Testimonial
              quote="We replaced 5 subscriptions and cut costs by 70%. Avatar sales videos now get 3× higher CTR than our old approach."
              name="Sarah Martinez"
              role="Marketing Director, Growth Launch Co."
              revenue="+$24k MRR"
            />
            <Testimonial
              quote="White-label suite let us productize content ops for clients under our brand. Margins are fantastic — 80% profit on every client."
              name="Anthony Rodriguez"
              role="Partner, VisionFlow Media"
              revenue="+18 Clients"
            />
            <Testimonial
              quote="The AI voice receptionist booked 8 appointments in week one. Total game-changer. No more missed calls or manual follow-ups."
              name="Laura Kim"
              role="Business Coach & Consultant"
              revenue="+$31k ARR"
            />
          </div>
        </Section>
      </div>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA */}
      <div id="cta" className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border-2 border-[#FFD700]/30 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to 10X Your Content Output?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 847 creators, coaches, and agencies already scaling with AI Freedom Studios
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-xl px-12 py-7 hover:scale-105 transition-transform">
                  <Rocket className="w-6 h-6 mr-3" />
                  Start Free Trial Now
                </Button>
              </Link>
              <Link to={createPageUrl("AgencyAccelerator")}>
                <Button variant="outline" className="border-2 border-white text-white font-semibold text-xl px-8 py-7 hover:bg-white hover:text-black">
                  <Users className="w-5 h-5 mr-2" />
                  Agency Solutions
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="p-3 bg-[#0B0B0C]/50 rounded-lg">
                <Shield className="w-6 h-6 mx-auto mb-1 text-[#00D4C9]" />
                <p className="text-white font-semibold text-sm">Enterprise Security</p>
              </div>
              <div className="p-3 bg-[#0B0B0C]/50 rounded-lg">
                <Zap className="w-6 h-6 mx-auto mb-1 text-[#FFD700]" />
                <p className="text-white font-semibold text-sm">5min Setup</p>
              </div>
              <div className="p-3 bg-[#0B0B0C]/50 rounded-lg">
                <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-400" />
                <p className="text-white font-semibold text-sm">80% Margins</p>
              </div>
              <div className="p-3 bg-[#0B0B0C]/50 rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto mb-1 text-[#00D4C9]" />
                <p className="text-white font-semibold text-sm">Unlimited Scale</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mt-6">
              No contracts. Cancel anytime. Keep 100% of what you charge clients.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#111317]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                <span className="text-black font-bold">AI</span>
              </div>
              <span>© {new Date().getFullYear()} AI Freedom Studios. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to={createPageUrl("Legal")} className="hover:text-white transition-colors">Privacy</Link>
              <Link to={createPageUrl("Legal")} className="hover:text-white transition-colors">Terms</Link>
              <Link to={createPageUrl("Help")} className="hover:text-white transition-colors">Contact</Link>
              <Link to={createPageUrl("SecurityDocs")} className="hover:text-white transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
