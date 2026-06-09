import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import AgentKanban from "@/components/AgentKanban";
import SlackChannelConfig from "@/components/SlackChannelConfig";
import {
  Bot, Mic, MicOff, Volume2, VolumeX, Activity, Clock,
  MessageSquare, Zap, RefreshCw, CheckCircle, AlertCircle,
  ChevronRight, Users, FileText, Megaphone, Image, Video,
  Calendar, Layers, Circle
} from "lucide-react";

// ── Agent definitions ────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "aria",
    name: "ARIA",
    role: "Executive Assistant",
    color: "from-[#2E3192] to-[#FF6B35]",
    accent: "#2E3192",
    entities: ["Client", "Project", "Campaign", "Lead", "SocialMediaPost", "ScheduledPost", "ProductionQueue", "ArtGeneration", "VideoProject", "ContentCalendarEvent"],
    icon: "🤖",
  },
];

const ENTITY_ICONS = {
  Client: Users,
  Project: FileText,
  Campaign: Megaphone,
  Lead: Users,
  SocialMediaPost: MessageSquare,
  ScheduledPost: Calendar,
  ProductionQueue: Layers,
  ArtGeneration: Image,
  VideoProject: Video,
  ContentCalendarEvent: Calendar,
};

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = "text-blue-400" }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4 flex items-center gap-4">
      <div className={cn("p-2 rounded-lg bg-gray-700/60", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ── Pulse dot ─────────────────────────────────────────────────────────────────
function PulseDot({ color = "bg-green-400" }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)} />
      <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", color)} />
    </span>
  );
}

// ── Entity row ────────────────────────────────────────────────────────────────
function EntityRow({ name, count, recent }) {
  const Icon = ENTITY_ICONS[name] || FileText;
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <Icon className="w-4 h-4 text-gray-500" />
        {name}
      </div>
      <div className="flex items-center gap-3">
        {recent > 0 && (
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            +{recent} new
          </span>
        )}
        <span className="text-sm font-semibold text-white w-8 text-right">{count}</span>
      </div>
    </div>
  );
}

// ── Conversation row ───────────────────────────────────────────────────────────
function ConversationRow({ conv }) {
  const lastMsg = conv.messages?.[conv.messages.length - 1];
  const isActive = conv.messages?.some(m => m.role === "assistant" && !m.content?.length === 0);
  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-800/60 last:border-0">
      <div className="mt-1">
        <PulseDot color={isActive ? "bg-green-400" : "bg-gray-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-300 truncate">
            {conv.metadata?.name || `Session ${conv.id?.slice(-6)}`}
          </p>
          <span className="text-xs text-gray-600 flex-shrink-0 ml-2">
            {conv.updated_date ? timeAgo(conv.updated_date) : "—"}
          </span>
        </div>
        {lastMsg && (
          <p className="text-xs text-gray-500 truncate">
            <span className={lastMsg.role === "user" ? "text-blue-400" : "text-purple-400"}>
              {lastMsg.role === "user" ? "User" : "ARIA"}:
            </span>{" "}
            {lastMsg.content?.slice(0, 80)}{lastMsg.content?.length > 80 ? "…" : ""}
          </p>
        )}
        <p className="text-xs text-gray-600 mt-0.5">
          {conv.messages?.length || 0} messages
        </p>
      </div>
    </div>
  );
}

// ── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({ agent, conversations, entityCounts, sttActive, ttsActive, refreshing }) {
  const totalConvos = conversations.length;
  const activeConvos = conversations.filter(c => {
    const last = c.messages?.[c.messages.length - 1];
    const age = (Date.now() - new Date(c.updated_date || 0).getTime()) / 1000;
    return age < 300; // active in last 5 min
  }).length;

  const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);

  return (
    <div className="bg-[#111317] border border-gray-800 rounded-2xl overflow-hidden">
      {/* Agent Header */}
      <div className={cn("bg-gradient-to-r p-5", agent.color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              {agent.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <p className="text-white/70 text-sm">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PulseDot color="bg-green-400" />
            <span className="text-white/80 text-xs font-medium">Online</span>
          </div>
        </div>

        {/* Voice Status Row */}
        <div className="flex items-center gap-3 mt-4">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            sttActive ? "bg-red-500/30 text-red-200 border border-red-400/40" : "bg-white/10 text-white/50"
          )}>
            {sttActive ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
            {sttActive ? "Listening" : "Mic Off"}
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            ttsActive ? "bg-blue-500/30 text-blue-200 border border-blue-400/40" : "bg-white/10 text-white/50"
          )}>
            {ttsActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            {ttsActive ? "Speaking" : "Voice Off"}
          </div>
          {refreshing && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/10 text-white/50">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Syncing
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 divide-x divide-gray-800 border-b border-gray-800">
        {[
          { label: "Conversations", value: totalConvos },
          { label: "Active Now", value: activeConvos },
          { label: "Total Messages", value: totalMessages },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-0 divide-x divide-gray-800">
        {/* Entity Access */}
        <div className="p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Entity Access & Counts
          </h3>
          <div>
            {agent.entities.map(name => (
              <EntityRow
                key={name}
                name={name}
                count={entityCounts[name] ?? "—"}
                recent={0}
              />
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Conversations
          </h3>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              No conversations yet
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto pr-1">
              {conversations.slice(0, 10).map(conv => (
                <ConversationRow key={conv.id} conv={conv} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Recent Activity Feed ───────────────────────────────────────────────────────
function ActivityFeed({ conversations }) {
  const events = [];
  conversations.forEach(conv => {
    (conv.messages || []).forEach(msg => {
      if (msg.role === "assistant" && msg.content) {
        events.push({
          id: `${conv.id}-${msg.id || Math.random()}`,
          agent: "ARIA",
          action: msg.content.slice(0, 100) + (msg.content.length > 100 ? "…" : ""),
          time: conv.updated_date,
          type: "response",
        });
      }
    });
  });
  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  const timeAgo = (dateStr) => {
    if (!dateStr) return "—";
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="bg-[#111317] border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Live Activity Feed</h3>
        <PulseDot color="bg-purple-400" />
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-6">No recent activity</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {events.slice(0, 20).map(ev => (
            <div key={ev.id} className="flex gap-3 items-start">
              <div className="mt-1.5 flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-purple-400/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-semibold text-purple-400">{ev.agent}</span>
                  <span className="text-xs text-gray-600">{timeAgo(ev.time)}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{ev.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Automation Log Placeholder ─────────────────────────────────────────────────
function AutomationLog() {
  const SAMPLE = [
    { id: 1, trigger: "New Lead Created", action: "ARIA notified + campaign queued", status: "success", time: "2m ago" },
    { id: 2, trigger: "Project status → delivered", action: "Client email scheduled", status: "success", time: "18m ago" },
    { id: 3, trigger: "Scheduled post time", action: "Social post published to 3 platforms", status: "success", time: "1h ago" },
    { id: 4, trigger: "Art generation complete", action: "Asset saved to library", status: "success", time: "2h ago" },
    { id: 5, trigger: "Daily briefing cron", action: "ARIA summary generated", status: "pending", time: "3h ago" },
  ];

  return (
    <div className="bg-[#111317] border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">Automated Actions</h3>
      </div>
      <div className="space-y-2">
        {SAMPLE.map(item => (
          <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
            <div className="mt-0.5">
              {item.status === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-300">{item.trigger}</p>
                <span className="text-xs text-gray-600 flex-shrink-0 ml-2">{item.time}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{item.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FOUNDER_EMAILS = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];
const isAuthorized = (user) =>
  user && (user.role === "admin" || user.custom_role === "founder" || user.custom_role === "super_admin" || FOUNDER_EMAILS.includes(user.email));

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AgentMonitor() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [entityCounts, setEntityCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Auth check
  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setAuthChecked(true); }).catch(() => setAuthChecked(true));
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      // Fetch ARIA conversations
      const convos = await base44.agents.listConversations({ agent_name: "aria" });
      // Load messages for recent convos (last 10)
      const sorted = (convos || []).sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
      const withMessages = await Promise.all(
        sorted.slice(0, 10).map(async c => {
          try {
            const full = await base44.agents.getConversation(c.id);
            return full;
          } catch {
            return c;
          }
        })
      );
      setConversations(withMessages);

      // Fetch entity counts for ARIA's accessible entities
      const counts = {};
      await Promise.all(
        AGENTS[0].entities.map(async name => {
          try {
            const items = await base44.entities[name].list(undefined, 1);
            // list returns array; use length or totalCount if available
            counts[name] = Array.isArray(items) ? items.length : "—";
          } catch {
            counts[name] = "—";
          }
        })
      );
      setEntityCounts(counts);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("AgentMonitor fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authChecked || !isAuthorized(user)) return;
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Subscribe to ARIA conversation updates in real-time
  useEffect(() => {
    // Re-fetch when a new conversation message arrives
    const handler = () => fetchData(true);
    window.addEventListener("aria:message", handler);
    return () => window.removeEventListener("aria:message", handler);
  }, [fetchData]);

  const totalMessages = conversations.reduce((s, c) => s + (c.messages?.length || 0), 0);

  if (!authChecked) return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2E3192] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthorized(user)) return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center text-center px-6">
      <div>
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-sm">Agent Monitor is only available to Super Admins & Founders.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Agent Monitor</h1>
              <PulseDot color="bg-green-400" />
            </div>
            <p className="text-gray-400 text-sm">
              Real-time dashboard for all AI agents — tasks, voice status & automated actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-xs text-gray-600">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 transition-all"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading agent data…</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Active Agents" value={AGENTS.length} icon={Bot} color="text-blue-400" />
            <StatCard label="Conversations" value={conversations.length} icon={MessageSquare} color="text-purple-400" />
            <StatCard label="Total Messages" value={totalMessages} icon={Activity} color="text-green-400" />
            <StatCard label="Automations Run" value={5} icon={Zap} color="text-yellow-400" />
          </div>

          {/* Slack Integration */}
          {user && (
            <div className="grid md:grid-cols-2 gap-6">
              <SlackChannelConfig user={user} />
            </div>
          )}

          {/* Kanban Board */}
          <AgentKanban />

          {/* Agent Cards */}
          {AGENTS.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              conversations={conversations}
              entityCounts={entityCounts}
              sttActive={false}
              ttsActive={false}
              refreshing={refreshing}
            />
          ))}

          {/* Bottom row: Activity Feed + Automation Log */}
          <div className="grid md:grid-cols-2 gap-6">
            <ActivityFeed conversations={conversations} />
            <AutomationLog />
          </div>
        </div>
      )}
    </div>
  );
}