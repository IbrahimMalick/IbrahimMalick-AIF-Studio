import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Zap,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Star,
  TrendingUp,
  RefreshCw
} from "lucide-react";

const API_BASE = "http://localhost:8787/api";

const TEMPLATES = [
  {
    id: "tpl-ig-dm-to-ghl",
    title: "IG DM → GHL Lead + Auto-Reply",
    summary: "When Instagram DM contains keywords like 'demo' or 'pricing', automatically create a lead in GoHighLevel and send auto-reply.",
    icon: MessageSquare,
    color: "from-pink-500 to-purple-600",
    category: "Lead Generation",
    triggers: ["Instagram DM"],
    actions: ["GHL Lead Creation", "Auto Reply"],
    complexity: "Beginner",
    estimatedSetup: "5 min"
  },
  {
    id: "tpl-spend-alert",
    title: "Ad Spend Threshold → Slack/Email Alert",
    summary: "Notify your team via Slack and email when daily ad spend crosses a threshold.",
    icon: DollarSign,
    color: "from-yellow-500 to-orange-600",
    category: "Budget Management",
    triggers: ["Daily Spend Check"],
    actions: ["Slack Notification", "Email Alert"],
    complexity: "Beginner",
    estimatedSetup: "3 min"
  },
  {
    id: "tpl-stripe-followup",
    title: "Stripe Purchase → Follow-Up Sequence",
    summary: "After payment completes, send welcome email/DM and tag customer in GoHighLevel for nurture sequence.",
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
    category: "Customer Success",
    triggers: ["Stripe Checkout"],
    actions: ["Email Send", "GHL Tag", "DM Send"],
    complexity: "Intermediate",
    estimatedSetup: "8 min"
  },
  {
    id: "tpl-video-to-social",
    title: "Video Render → Auto-Post to Social",
    summary: "When video rendering completes, automatically post to Instagram, TikTok, and YouTube with optimized captions.",
    icon: TrendingUp,
    color: "from-green-500 to-teal-600",
    category: "Content Distribution",
    triggers: ["Video Completed"],
    actions: ["IG Post", "TikTok Post", "YouTube Upload"],
    complexity: "Intermediate",
    estimatedSetup: "10 min"
  }
];

export default function WorkflowTemplates() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const applyTemplate = async (templateId) => {
    setLoading({ ...loading, [templateId]: true });
    try {
      const response = await fetch(`${API_BASE}/workflows/from-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId })
      });
      const data = await response.json();
      
      if (data.ok) {
        setMessage(`✅ Template "${TEMPLATES.find(t => t.id === templateId).title}" created as draft!`);
        setTimeout(() => {
          setMessage("");
          window.location.href = createPageUrl("WorkflowDesigner");
        }, 2000);
      }
    } catch (error) {
      setMessage("❌ Failed to create from template: " + error.message);
    } finally {
      setLoading({ ...loading, [templateId]: false });
    }
  };

  const testTemplate = async (templateId) => {
    setLoading({ ...loading, [`test_${templateId}`]: true });
    try {
      // First create from template
      const createResponse = await fetch(`${API_BASE}/workflows/from-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId })
      });
      const createData = await createResponse.json();
      
      if (createData.ok) {
        // Then run it
        const runResponse = await fetch(`${API_BASE}/workflows/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: createData.id,
            triggerPayload: {
              source: "template-test",
              amount: 150,
              email: "test@example.com",
              sender_name: "Test User"
            }
          })
        });
        const runData = await runResponse.json();
        
        if (runData.ok) {
          setMessage(`✅ Template test run started! Check Runs page for results.`);
          setTimeout(() => setMessage(""), 4000);
        }
      }
    } catch (error) {
      setMessage("❌ Test failed: " + error.message);
    } finally {
      setLoading({ ...loading, [`test_${templateId}`]: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
              <Layers className="w-8 h-8 text-black" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white">Automation Templates</h1>
              <p className="text-gray-400">Start from proven blueprints, test instantly, and customize</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border text-center font-semibold ${
            message.includes('✅')
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/50 transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-gray-700 text-gray-300">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl group-hover:text-[#FFD700] transition-colors">
                    {template.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {template.summary}
                  </p>

                  {/* Workflow Steps */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        Trigger: {template.triggers.join(", ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.actions.map((action, idx) => (
                        <Badge key={idx} className="bg-green-500/20 text-green-400 text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>⏱️ {template.estimatedSetup}</span>
                      <span>📊 {template.complexity}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => applyTemplate(template.id)}
                      disabled={!!loading[template.id]}
                      className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold hover:opacity-90"
                    >
                      {loading[template.id] ? "Creating..." : "Use Template"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={() => testTemplate(template.id)}
                      disabled={loading[`test_${template.id}`]}
                      variant="outline"
                      className="border-[#06D6A0] text-[#06D6A0] hover:bg-[#06D6A0]/10"
                    >
                      {loading[`test_${template.id}`] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming Soon */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-2xl font-bold text-white mb-2">More Templates Coming Soon</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              We're building more automation templates for common workflows:
              Lead scoring, Content repurposing, Email sequences, Ad optimization, and more.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Badge className="bg-gray-700 text-gray-300">🎯 Lead Scoring AI</Badge>
              <Badge className="bg-gray-700 text-gray-300">📧 Email Nurture Chains</Badge>
              <Badge className="bg-gray-700 text-gray-300">🎬 Content Auto-Publisher</Badge>
              <Badge className="bg-gray-700 text-gray-300">📊 Performance Alerts</Badge>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link to={createPageUrl("WorkflowDesigner")}>
            <Button className="bg-[#FFD700] text-black font-bold hover:bg-[#FF8C00]">
              <Zap className="w-5 h-5 mr-2" />
              Build Custom Workflow
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}