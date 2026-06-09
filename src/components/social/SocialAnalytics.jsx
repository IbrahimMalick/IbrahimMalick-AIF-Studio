import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Heart, MessageCircle, Share2, Eye, Zap } from "lucide-react";

const COLORS = ["#00D9FF", "#FF006E", "#8338EC", "#FFB703", "#10B981"];

const PLATFORM_LABELS = {
  instagram: "Instagram",
  facebook_page: "Facebook",
  twitter: "X/Twitter",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
};

function StatCard({ icon: Icon, label, value, change, color }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: color + "20" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

export default function SocialAnalytics({ accounts = [] }) {
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState(null);

  const { data: posts = [] } = useQuery({
    queryKey: ["scheduled_posts_analytics"],
    queryFn: () => base44.entities.ScheduledPost.list("-created_date", 100),
  });

  // Derived stats from posts
  const publishedPosts = posts.filter(p => p.status === "published");
  const scheduledPosts = posts.filter(p => p.status === "scheduled");
  const draftPosts = posts.filter(p => p.status === "draft");

  // Posts by platform
  const byPlatform = accounts.map(acc => ({
    name: PLATFORM_LABELS[acc.platform] || acc.platform,
    posts: posts.filter(p => p.platform === acc.platform).length,
    followers: acc.followers_count || 0,
  }));

  // Posts per day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = posts.filter(p => {
      const pd = new Date(p.created_date || p.scheduled_date || "");
      return pd.toDateString() === d.toDateString();
    }).length;
    return { label, posts: count };
  });

  const generateInsights = async () => {
    setGenerating(true);
    const summary = `
      Total posts: ${posts.length}
      Published: ${publishedPosts.length}
      Scheduled: ${scheduledPosts.length}
      Platforms used: ${[...new Set(posts.map(p => p.platform))].join(", ")}
      Connected accounts: ${accounts.length}
    `;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a social media strategist. Analyze this social media data and give 3 actionable insights:
      ${summary}
      Respond with 3 bullet points, each starting with an emoji. Keep it brief and specific.`,
    });
    setInsights(result);
    setGenerating(false);
  };

  const totalFollowers = accounts.reduce((sum, a) => sum + (a.followers_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Connected Accounts" value={accounts.length} color="#00D9FF" />
        <StatCard icon={Share2} label="Total Posts" value={posts.length} color="#8338EC" />
        <StatCard icon={Eye} label="Published" value={publishedPosts.length} color="#10B981" />
        <StatCard icon={Heart} label="Total Followers" value={totalFollowers.toLocaleString()} color="#FF006E" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts per day chart */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-holographic-cyan" /> Posts This Week
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="posts" fill="#00D9FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Posts by platform */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-holographic-cyan" /> Posts by Platform
          </h3>
          {byPlatform.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={byPlatform}
                  dataKey="posts"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}
                  labelLine={false}
                >
                  {byPlatform.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Followers by platform */}
      {byPlatform.some(p => p.followers > 0) && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-holographic-cyan" /> Followers by Platform
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byPlatform.filter(p => p.followers > 0)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              <Bar dataKey="followers" fill="#8338EC" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" /> AI Insights
          </h3>
          <button
            onClick={generateInsights}
            disabled={generating}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
          >
            {generating ? "Analyzing..." : "Generate Insights"}
          </button>
        </div>
        {insights ? (
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{insights}</p>
        ) : (
          <p className="text-sm text-slate-500">Click "Generate Insights" to get AI-powered recommendations for your social media strategy.</p>
        )}
      </div>
    </div>
  );
}