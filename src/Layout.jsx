import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import FloatingCopilotDock from "@/components/FloatingCopilotDock";
import SmartNotifications from "@/components/SmartNotifications";
import CopilotIntentEngine from "@/components/CopilotIntentEngine";
import I18nProvider, { useI18n } from "@/components/I18nProvider";
import I18nAutoFill from "@/components/I18nAutoFill";
import I18nCollector from "@/components/I18nCollector";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import I18nOverridesPatch from "@/components/I18nOverridesPatch";
import SystemHealthIndicator from "@/components/SystemHealthIndicator";
import CommandPalette from "@/components/CommandPalette";
import Logo from "@/components/Logo";
import { Menu, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [recents, setRecents] = useState([]);
  const { t } = useI18n();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        // Auto-grant founder/super_admin roles for designated emails
        const founderEmails = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];
        if (founderEmails.includes(currentUser.email)) {
          await base44.functions.invoke("grantFounderRoles", {});
          // Reload user to get updated role
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  // Global keyboard: ⌘/Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Track recent pages
  useEffect(() => {
    const handler = (e) => {
      setRecents((r) => {
        const next = [e.detail, ...r.filter(x => x.href !== e.detail.href)];
        return next.slice(0, 10);
      });
    };
    window.addEventListener("afs:add-recent", handler);
    return () => window.removeEventListener("afs:add-recent", handler);
  }, []);

  const FOUNDER_EMAILS = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];
  const isAdminOrFounder = user && (
    user.role === 'admin' ||
    user.custom_role === 'founder' ||
    user.custom_role === 'super_admin' ||
    FOUNDER_EMAILS.includes(user.email)
  );

  // Command palette pages (flat list for search)
  const palettePages = [
    { label: "🏠 Dashboard", href: createPageUrl("Dashboard"), icon: "🏠" },
    { label: "🧠 AG-X Command Center", href: createPageUrl("AGXCommandCenter"), icon: "🧠" },
    { label: "👑 Founder Command", href: createPageUrl("FounderCommandCenter"), icon: "👑" },
    { label: "💰 Pricing", href: createPageUrl("Pricing"), icon: "💰" },
    { label: "🚀 Agency Accelerator", href: createPageUrl("AgencyAccelerator"), icon: "🚀" },
    { label: "🤝 Partner Hub", href: createPageUrl("Partners"), icon: "🤝" },
    { label: "🎓 Partner Training", href: createPageUrl("PartnerTraining"), icon: "🎓" },
    { label: "📞 AI Receptionist", href: createPageUrl("ReceptionistConsole"), icon: "📞" },
    { label: "📊 Receptionist Analytics", href: createPageUrl("ReceptionistAnalytics"), icon: "📊" },
    { label: "🤖 AI Copilot", href: createPageUrl("AICopilot"), icon: "🤖" },
    { label: "✨ AI Content Hub", href: createPageUrl("AIContentHub"), icon: "✨" },
    { label: "✂️ Content Repurposing", href: createPageUrl("ContentRepurposingStudio"), icon: "✂️" },
    { label: "📅 Content Calendar", href: createPageUrl("UnifiedContentCalendar"), icon: "📅" },
    { label: "⚡ Campaign Orchestrator", href: createPageUrl("CampaignOrchestrator"), icon: "⚡" },
    { label: "🔀 Multi-Channel Campaigns", href: createPageUrl("MultiChannelCampaignBuilder"), icon: "🔀" },
    { label: "🎯 Competitor Intel", href: createPageUrl("CompetitorIntelligence"), icon: "🎯" },
    { label: "🔄 Workflow Designer", href: createPageUrl("WorkflowDesigner"), icon: "🔄" },
    { label: "📋 Workflow Templates", href: createPageUrl("WorkflowTemplates"), icon: "📋" },
    { label: "📊 Workflow Runs", href: createPageUrl("WorkflowRuns"), icon: "📊" },
    { label: "📈 Workflow Metrics", href: createPageUrl("WorkflowMetrics"), icon: "📈" },
    { label: "🎯 Marketing Suite", href: createPageUrl("MarketingSuite"), icon: "🎯" },
    { label: "🎬 Video Studio", href: createPageUrl("VideoStudio"), icon: "🎬" },
    { label: "🎨 AI Art Lab", href: createPageUrl("ArtLab"), icon: "🎨" },
    { label: "📄 Research Hub", href: createPageUrl("ResearchHub"), icon: "📄" },
    { label: "📱 Social Media", href: createPageUrl("SocialMedia"), icon: "📱" },
    { label: "🎯 Ads Manager", href: createPageUrl("AdsManager"), icon: "🎯" },
    { label: "📊 Analytics", href: createPageUrl("Analytics"), icon: "📊" },
    { label: "🛡️ Security Docs", href: createPageUrl("SecurityDocs"), icon: "🛡️" },
    { label: "🔧 Provider Settings", href: createPageUrl("ProviderSettings"), icon: "🔧" },
    { label: "📖 Copilot Guide", href: createPageUrl("CopilotGuide"), icon: "📖" },
    { label: "🌍 Language Settings", href: createPageUrl("LanguageSettings"), icon: "🌍" },
    { label: "⚙️ Settings", href: createPageUrl("Settings"), icon: "⚙️" },
  ];

  const runCopilotIntent = (text) => {
    window.dispatchEvent(new CustomEvent("open-copilot-with-message", { 
      detail: { message: text }
    }));
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] text-white flex">
      {/* Holographic background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-holographic-cyan/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-holographic-purple/10 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-holographic-pink/5 rounded-full filter blur-3xl" />
      </div>
      <div className="relative flex-1 flex">

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-holographic-cyan/20 bg-gradient-to-b from-slate-900/80 via-slate-950/60 to-[#0B0B0C]/80 backdrop-blur-lg ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-200 shadow-holographic`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {!collapsed && (
              <Logo className="h-10 w-auto object-contain" />
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">AF</span>
              </div>
            )}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Language Switcher */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-gray-800">
            <LanguageSwitcher variant="compact" />
          </div>
        )}

        {/* Navigation */}
        <SidebarNav isAdminOrFounder={isAdminOrFounder} collapsed={collapsed} />

        {/* User Info */}
        {user && !collapsed && (
          <div className="p-3 border-t border-gray-800">
            <div className="p-3 bg-gray-800/40 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">
                {t('welcome_back')}
              </p>
              <p className="text-sm font-semibold text-white truncate mb-2">
                {user.full_name || user.email}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                  user.role === 'admin' || user.custom_role === 'super_admin'
                    ? 'bg-red-500/20 text-red-400'
                    : user.custom_role === 'manager'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  🛡️ {user.custom_role || user.role || 'user'}
                </span>
              </div>
              <button
                onClick={() => base44.auth.logout()}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Hint */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Search className="w-3 h-3" />
            {!collapsed && <span>Press ⌘/Ctrl+K for Quick Search</span>}
          </div>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-600 mb-1">
              © 2024 AI Freedom Studios
            </p>
            <p className="text-xs text-gray-700">
              All Rights Reserved
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-[#111317]/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4">
        <button
          className="p-2 rounded-lg hover:bg-gray-800"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-300" />
        </button>
        <Logo className="h-8 w-auto object-contain" />
        <button
          className="p-2 rounded-lg hover:bg-gray-800"
          onClick={() => setCmdOpen(true)}
          aria-label="Open command palette"
        >
          <Search className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-[#111317] border-r border-gray-800 overflow-y-auto">

            {/* Mobile Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-800">
              <Logo className="h-8 w-auto object-contain" />
              <button
                className="p-2 rounded-lg hover:bg-gray-800"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* Mobile Language Switcher */}
            <div className="p-3 border-b border-gray-800">
              <LanguageSwitcher variant="compact" />
            </div>

            {/* Mobile Navigation */}
            <div onClick={() => setMobileOpen(false)}>
              <SidebarNav isAdminOrFounder={isAdminOrFounder} collapsed={false} />
            </div>

            {/* Mobile User Info */}
            {user && (
              <div className="p-3 border-t border-gray-800">
                <div className="p-3 bg-gray-800/40 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">{t('welcome_back')}</p>
                  <p className="text-sm font-semibold mb-2 truncate">{user.full_name || user.email}</p>
                  <button
                    onClick={() => base44.auth.logout()}
                    className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile spacer */}
        <div className="md:hidden h-14" />

        {/* System Health Bar (Desktop Only, Admin Only) */}
        {user && (user.role === 'admin' || user.custom_role === 'super_admin') && (
          <div className="hidden md:flex items-center justify-between px-6 py-3 bg-slate-950/50 border-b border-holographic-cyan/20 backdrop-blur-sm">
            <SystemHealthIndicator />
            <div className="text-xs text-holographic-cyan/70 animate-holographic-glow">
              Workflow System • {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
      </div>

      {/* Floating Copilot Dock */}
      {user && (
        <FloatingCopilotDock
          user={user}
          currentPage={currentPageName}
          pageContext={{ location: location.pathname }}
        />
      )}

      {/* Smart Notifications */}
      {user && <SmartNotifications user={user} />}

      {/* Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        pages={palettePages}
        recents={recents}
        onFallbackIntent={runCopilotIntent}
      />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <I18nProvider>
      <CopilotIntentEngine />
      <I18nAutoFill />
      <I18nCollector />
      <I18nOverridesPatch />
      <LayoutContent children={children} currentPageName={currentPageName} />
    </I18nProvider>
  );
}