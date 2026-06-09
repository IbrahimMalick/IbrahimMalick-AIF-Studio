import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

const NAV_GROUPS = [
  {
    label: "🏠 Home",
    items: [
      { name: "Dashboard", path: "Dashboard" },
      { name: "AI Copilot", path: "AICopilot" },
      { name: "⚡ Poe AI Studio", path: "PoeChat" },
      { name: "Pricing", path: "Pricing" },
    ]
  },
  {
    label: "🎬 Content Creation",
    items: [
      { name: "AI Content Hub", path: "AIContentHub" },
      { name: "🎬 Video Studio", path: "VideoStudioPage" },
      { name: "▶️ YouTube Studio", path: "YouTubeStudio" },
      { name: "AI Art Lab", path: "ArtLab" },
      { name: "Script Writer", path: "ScriptWriter" },
      { name: "Content Repurposing", path: "ContentRepurposingStudio" },
      { name: "Auto Captions", path: "AutoCaptions" },
      { name: "Voice Cloning", path: "VoiceCloning" },
      { name: "Avatars", path: "Avatars" },
    ]
  },
  {
    label: "📱 Marketing & Social",
    items: [
      { name: "Social Media", path: "SocialMedia" },
      { name: "Content Calendar", path: "UnifiedContentCalendar" },
      { name: "Campaign Orchestrator", path: "CampaignOrchestrator" },
      { name: "Multi-Channel Campaigns", path: "MultiChannelCampaignBuilder" },
      { name: "Ads Manager", path: "AdsManager" },
      { name: "Marketing Suite", path: "MarketingSuite" },
      { name: "Lead Magnet Generator", path: "LeadMagnetGenerator" },
      { name: "Competitor Intel", path: "CompetitorIntelligence" },
    ]
  },
  {
    label: "🔄 Automation & Workflows",
    items: [
      { name: "Workflow Designer", path: "WorkflowDesigner" },
      { name: "Workflow Templates", path: "WorkflowTemplates" },
      { name: "Workflow Runs", path: "WorkflowRuns" },
      { name: "Workflow Metrics", path: "WorkflowMetrics" },
    ]
  },
  {
    label: "📞 AI Receptionist",
    items: [
      { name: "Receptionist Console", path: "ReceptionistConsole" },
      { name: "Receptionist Analytics", path: "ReceptionistAnalytics" },
    ]
  },
  {
    label: "🚀 Agency & Partners",
    items: [
      { name: "Agency Accelerator", path: "AgencyAccelerator" },
      { name: "Partner Hub", path: "Partners" },
      { name: "Partner Training", path: "PartnerTraining" },
    ]
  },
  {
    label: "📊 Analytics & Research",
    items: [
      { name: "Analytics", path: "Analytics" },
      { name: "Research Hub", path: "ResearchHub" },
    ]
  },
  {
    label: "👥 Team & Workspace",
    items: [
      { name: "Team Members", path: "Team" },
      { name: "Billing & Plans", path: "Billing" },
    ]
  },
  {
    label: "💡 Content Ideas",
    items: [
      { name: "Content Ideas", path: "ContentIdeas" },
      { name: "Trending Topics", path: "CompetitorIntelligence" },
    ]
  },
  {
    label: "⚙️ Settings & Tools",
    items: [
      { name: "Settings", path: "Settings" },
      { name: "Provider Settings", path: "ProviderSettings" },
      { name: "Language Settings", path: "LanguageSettings" },
      { name: "Security Docs", path: "SecurityDocs" },
      { name: "Copilot Guide", path: "CopilotGuide" },
    ]
  },
];

const ADMIN_GROUP = {
  label: "👑 Admin / Founder",
  items: [
    { name: "AG-X Command Center", path: "AGXCommandCenter" },
    { name: "Founder Command", path: "FounderCommandCenter" },
    { name: "✨ ARIA — AI Executive", path: "ARIAConsole" },
    { name: "🤖 Agent Monitor", path: "AgentMonitor" },
  ]
};

export default function SidebarNav({ isAdminOrFounder, collapsed }) {
  const location = useLocation();

  // Determine which group is active on load so it auto-opens
  const getInitialOpen = () => {
    const open = {};
    const allGroups = isAdminOrFounder ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;
    allGroups.forEach((group) => {
      const active = group.items.some(item => location.pathname.includes(item.path));
      if (active) open[group.label] = true;
    });
    // Default: open first group
    if (Object.keys(open).length === 0) open[NAV_GROUPS[0].label] = true;
    return open;
  };

  const [openGroups, setOpenGroups] = useState(getInitialOpen);

  const toggleGroup = (label) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => location.pathname.includes(path);

  const groups = isAdminOrFounder ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;

  if (collapsed) {
    // Collapsed: show only active item icons / dots
    return (
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {groups.map(group =>
          group.items.map(item => (
            <Link
              key={item.path}
              to={createPageUrl(item.path)}
              title={item.name}
              className={`flex items-center justify-center w-9 h-9 rounded-lg mx-auto transition-all ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00]"
                  : "hover:bg-gray-800/60"
              }`}
            >
              <span className="text-sm">{group.label.split(" ")[0]}</span>
            </Link>
          ))
        )}
      </nav>
    );
  }

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {groups.map((group) => {
        const isOpen = !!openGroups[group.label];
        const hasActive = group.items.some(item => isActive(item.path));

        return (
          <div key={group.label} className="mb-1">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.label)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                hasActive
                  ? "text-[#FFD700] bg-[#FFD700]/5"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
              }`}
            >
              <span>{group.label}</span>
              {isOpen
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronRight className="w-3.5 h-3.5" />
              }
            </button>

            {/* Group Items */}
            {isOpen && (
              <div className="mt-1 ml-2 pl-3 border-l border-gray-800 space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={`block px-2 py-2 rounded-lg text-sm transition-all ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold shadow"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}