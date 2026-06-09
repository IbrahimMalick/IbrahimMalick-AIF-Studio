import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Video,
  Sparkles,
  Calendar,
  Zap,
  Target,
  DollarSign,
  BarChart3,
  Shield,
  ImageIcon,
  FileText,
  Users,
  Download,
  Package
} from "lucide-react";
import UsageQuotaDashboard from "@/components/UsageQuotaDashboard";
import CostAnomalyDetector from "@/components/CostAnomalyDetector";
import JobMonitor from "@/components/JobMonitor";
import DatabaseMetrics from "@/components/DatabaseMetrics";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import PredictiveAlertCenter from "@/components/PredictiveAlertCenter";
import CostOptimizationCenter from "@/components/CostOptimizationCenter";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    projects: 0,
    renders: 0,
    content: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load basic stats
        const [videos, art, posts] = await Promise.all([
          base44.entities.VideoProject.filter({ created_by: currentUser.email }),
          base44.entities.ArtGeneration.filter({ created_by: currentUser.email }),
          base44.entities.SocialMediaPost.filter({ user_email: currentUser.email })
        ]);

        setStats({
          projects: videos.length,
          renders: art.length,
          content: posts.length,
          revenue: 0
        });
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-[#FFD700] mx-auto mb-4 animate-pulse" />
          <div className="text-white text-lg">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="mb-8">
          <Badge className="bg-[#FFD700] text-black font-bold mb-4">
            ⚡ AI FREEDOM STUDIOS
          </Badge>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFD700]">
              Welcome back, {user?.full_name || user?.email || "Creator"}! 👋
            </h1>
            {user?.role && (
              <Badge className={`${
                user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                {user.custom_role || user.role}
              </Badge>
            )}
          </div>
          <p className="text-gray-400 text-lg">
            Your AI-powered content creation command center
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Projects", value: stats.projects, icon: Video, color: "#FFD700" },
            { label: "AI Renders", value: stats.renders, icon: ImageIcon, color: "#00D4C9" },
            { label: "Content Pieces", value: stats.content, icon: BarChart3, color: "#9D4EDD" },
            { label: "Revenue Generated", value: `$${stats.revenue}`, icon: DollarSign, color: "#06D6A0" }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-6">
                  <Icon className="w-8 h-8 mb-3" style={{ color: stat.color }} />
                  <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-xs uppercase">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Start */}
        <div>
          <h2 className="text-2xl font-bold text-[#FFD700] mb-4">
            🚀 Quick Start
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "AI Video Studio", desc: "Create videos with AI avatars", icon: "🎬", path: "VideoStudio" },
              { title: "Content Repurposing", desc: "Transform content across platforms", icon: "✂️", path: "ContentRepurposingStudio" },
              { title: "Campaign Orchestrator", desc: "Multi-channel campaign automation", icon: "⚡", path: "CampaignOrchestrator" },
              { title: "AI Copilot", desc: "Your intelligent assistant", icon: "🤖", path: "AICopilot" }
            ].map((item, idx) => (
              <Link key={idx} to={createPageUrl(item.path)}>
                <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/50 transition-all h-full cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Marketing Suite */}
        <div>
          <h2 className="text-2xl font-bold text-[#00D4C9] mb-4">
            🤖 AI Marketing Suite
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: "Campaign Orchestrator", icon: Zap, path: "CampaignOrchestrator" },
              { title: "Competitor Intelligence", icon: Target, path: "CompetitorIntelligence" },
              { title: "Content Calendar", icon: Calendar, path: "UnifiedContentCalendar" },
              { title: "Ads Manager (Meta & Google)", icon: Target, path: "AdsManager" },
              { title: "Lead Magnet Generator", icon: Sparkles, path: "LeadMagnetGenerator" },
              { title: "Analytics Dashboard", icon: BarChart3, path: "Analytics" }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link key={idx} to={createPageUrl(item.path)}>
                  <Card className="bg-[#111317] border-gray-800 rounded-xl hover:bg-[#151515] transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Icon className="w-6 h-6 text-[#00D4C9]" />
                      <p className="text-white font-medium text-sm">{item.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Agency Revenue CTA */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              💰 Agency Revenue Accelerator
            </h2>
            <p className="text-gray-300 mb-6">
              Turn your content skills into a profitable agency with our complete automation suite
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to={createPageUrl("AgencyAccelerator")}>
                <Badge className="bg-white text-purple-600 font-bold px-6 py-2 text-sm cursor-pointer hover:bg-gray-100">
                  🚀 Launch Your Agency
                </Badge>
              </Link>
              <Link to={createPageUrl("WhiteLabel")}>
                <Badge className="bg-white/20 text-white font-semibold px-6 py-2 text-sm cursor-pointer hover:bg-white/30">
                  🎨 White-Label Setup
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Automation */}
        <div>
          <h2 className="text-2xl font-bold text-[#9D4EDD] mb-4">
            🔄 Workflow Automation
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: "Workflow Designer", icon: Zap, path: "WorkflowDesigner" },
              { title: "Templates", icon: FileText, path: "WorkflowTemplates" },
              { title: "Runs & Monitoring", icon: BarChart3, path: "WorkflowRuns" },
              { title: "Integrations", icon: Target, path: "WorkflowIntegrations" }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link key={idx} to={createPageUrl(item.path)}>
                  <Card className="bg-[#111317] border-gray-800 rounded-xl hover:bg-[#151515] transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[#9D4EDD]" />
                      <p className="text-white font-medium text-sm">{item.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Copilot Commands */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-[#FFD700] text-lg">
              💬 Try These Copilot Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Create a video",
                "Generate blog post",
                "Launch campaign",
                "Analyze competitor",
                "Schedule posts",
                "What's my security?"
              ].map((cmd, idx) => (
                <Badge key={idx} className="bg-[#222] text-[#00D4C9] border border-gray-700 px-3 py-1">
                  "{cmd}"
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance Section */}
        {(user?.role === 'admin' || user?.custom_role === 'super_admin') && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-orange-400 mb-4">
                🛡️ Security & Compliance
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <UsageQuotaDashboard />
                <CostAnomalyDetector />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                ⚡ Performance & Caching
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <JobMonitor />
                <DatabaseMetrics />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">
                📊 Advanced Analytics
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <PerformanceDashboard />
                <div className="space-y-6">
                  <PredictiveAlertCenter />
                  <CostOptimizationCenter />
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link to="/EnterpriseAdmin">
                <Badge className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 text-sm cursor-pointer">
                  <Shield className="w-4 h-4 mr-2 inline" />
                  View Full Admin Panel
                </Badge>
              </Link>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-[#FFD700] mb-3">
              ✨ Welcome to AI Freedom Studios
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto mb-6">
              Your complete AI-powered content creation platform. Generate videos, images, blogs, social media posts,
              and more—all powered by advanced AI. Build your agency, automate your marketing, and scale your content empire.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to={createPageUrl("AGXCommandCenter") + "?tab=inventory"}>
                <Badge className="bg-[#FFD700] text-black font-bold px-6 py-2 cursor-pointer hover:bg-[#FF8C00]">
                  <Package className="w-4 h-4 mr-2 inline" />
                  📋 View Full Inventory
                </Badge>
              </Link>
              <Link to={createPageUrl("CopilotGuide")}>
                <Badge className="bg-gray-700 text-white font-semibold px-6 py-2 cursor-pointer hover:bg-gray-600">
                  📖 Get Started Guide
                </Badge>
              </Link>
              <Link to={createPageUrl("Help")}>
                <Badge className="bg-gray-700 text-white font-semibold px-6 py-2 cursor-pointer hover:bg-gray-600">
                  ❓ Help & Support
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}