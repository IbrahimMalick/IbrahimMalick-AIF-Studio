import React from "react";
import { base44 } from "@/api/base44Client";
import { Globe } from "lucide-react";
import I18nProvider from "@/components/I18nProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/components/I18nProvider";

import HeroSection from "@/components/landing/HeroSection";
import ProblemSolution from "@/components/landing/ProblemSolution";
import AgentNetwork from "@/components/landing/AgentNetwork";
import MissionSection from "@/components/landing/MissionSection";
import FinalCTA from "@/components/landing/FinalCTA";

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

function PublicHomeContent() {
  const { lang, setLang } = useI18n();
  const isRTL = lang === 'ar';

  const handleLogin = () => base44.auth.redirectToLogin(window.location.origin + "/Dashboard");
  const handleWaitlist = () => window.open("mailto:hello@aifreedomstudios.com?subject=Waitlist%20Request", "_blank");
  const handleCall = () => window.open("https://calendly.com/aifreedomstudios", "_blank");

  return (
    <div className="min-h-screen bg-[#050505] text-white" dir={isRTL ? "rtl" : "ltr"} lang={lang}>

      {/* ─── Sticky Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #00D9FF, #8338EC)" }}
            >
              AF
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight leading-tight">AIFREEDOMSTUDIOS</div>
              <div className="text-[10px] text-gray-500 tracking-widest uppercase">Intelligent Growth Ecosystem</div>
            </div>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="hidden md:flex items-center gap-1">
              <Globe className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger className="w-32 h-8 text-xs bg-transparent border-gray-800 text-gray-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <a href="/privacy" className="text-xs text-gray-500 hover:text-white transition-colors hidden md:block">Privacy</a>
            <a href="/terms"   className="text-xs text-gray-500 hover:text-white transition-colors hidden md:block">Terms</a>
            <button
              onClick={handleLogin}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ─── Page spacer for fixed header ─── */}
      <div className="h-[73px]" />

      {/* ─── Sections ─── */}
      <HeroSection onWaitlist={handleWaitlist} onCall={handleCall} />

      {/* ─── Why section ─── */}
      <section className="py-20 px-6 bg-[#07070A]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#FFB703] text-sm font-semibold tracking-widest uppercase mb-6">Why AIFREEDOMSTUDIOS?</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
            Because <span className="text-[#FFB703]">Attention</span> Is the<br />
            Most Valuable Asset in Today's Economy.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left mt-12">
            {[
              { icon: "🎯", title: "The brands that capture attention win.",   color: "#00D9FF" },
              { icon: "⚡", title: "The businesses that adapt win.",            color: "#8338EC" },
              { icon: "🚀", title: "Entrepreneurs who leverage AI gain an unfair advantage.", color: "#FF006E" },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className="text-3xl mb-4">{item.icon}</div>
                <p className="text-white font-semibold text-lg leading-snug">{item.title}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 mt-10 text-base">
            We're building the systems that make that advantage{" "}
            <span className="text-white font-semibold">accessible to everyone.</span>
          </p>
        </div>
      </section>

      <ProblemSolution />
      <AgentNetwork />
      <MissionSection />
      <FinalCTA onWaitlist={handleWaitlist} onCall={handleCall} />

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-10 px-6 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #00D9FF, #8338EC)" }}
              >
                AF
              </div>
              <div>
                <div className="font-black text-white text-sm tracking-tight">AIFREEDOMSTUDIOS</div>
                <div className="text-[10px] text-gray-600 tracking-widest uppercase">Intelligent Growth Ecosystem</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <a href="/privacy"  className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms"    className="hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:hello@aifreedomstudios.com" className="hover:text-white transition-colors">Contact</a>
              <button onClick={handleLogin} className="hover:text-white transition-colors">Sign In</button>
            </div>
          </div>
          <div className="text-center text-xs text-gray-700 pt-6 border-t border-white/[0.03]">
            © {new Date().getFullYear()} AI Freedom Studios. All Rights Reserved. &nbsp;|&nbsp;
            <a href="/privacy" className="hover:text-gray-500 transition-colors">Privacy</a>
            &nbsp;|&nbsp;
            <a href="/terms" className="hover:text-gray-500 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PublicHome() {
  return (
    <I18nProvider>
      <PublicHomeContent />
    </I18nProvider>
  );
}