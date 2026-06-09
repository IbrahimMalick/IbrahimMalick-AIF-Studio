import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Sparkles, Crown, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuotaUpgradePrompt({ 
  quotaType, 
  used, 
  cap, 
  currentPlan = "Free",
  onClose 
}) {
  const quotaInfo = {
    runs: {
      icon: Zap,
      title: "Daily Workflow Runs Exceeded",
      message: `You've used all ${cap} workflow runs for today.`,
      upgrade: "Upgrade to Pro for unlimited runs"
    },
    renders: {
      icon: Sparkles,
      title: "Monthly Render Limit Reached",
      message: `You've used all ${cap} video renders this month.`,
      upgrade: "Upgrade to Studio for 10x more renders"
    },
    storage: {
      icon: Crown,
      title: "Storage Limit Exceeded",
      message: `You're using ${used}GB out of ${cap}GB available.`,
      upgrade: "Upgrade to increase storage to 500GB"
    },
    qps: {
      icon: AlertTriangle,
      title: "Rate Limit Hit",
      message: `Too many requests. Limit: ${cap} requests/second.`,
      upgrade: "Upgrade for higher rate limits"
    }
  };

  const info = quotaInfo[quotaType] || quotaInfo.runs;
  const Icon = info.icon;

  const planUpgrades = {
    "Free": { next: "Creator", price: 29, features: ["500 runs/day", "100 renders/mo", "50GB storage"] },
    "creator": { next: "Pro", price: 49, features: ["Unlimited runs", "500 renders/mo", "200GB storage"] },
    "Creator": { next: "Pro", price: 49, features: ["Unlimited runs", "500 renders/mo", "200GB storage"] },
    "Pro": { next: "Studio", price: 99, features: ["Unlimited everything", "1TB storage", "White-label"] },
    "pro": { next: "Studio", price: 99, features: ["Unlimited everything", "1TB storage", "White-label"] },
    "Studio": { next: "Enterprise", price: 299, features: ["Custom limits", "Dedicated support", "SLA"] },
    "studio": { next: "Enterprise", price: 299, features: ["Custom limits", "Dedicated support", "SLA"] }
  };

  const upgrade = planUpgrades[currentPlan] || planUpgrades["Free"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="bg-[#111317] border-red-500/50 rounded-2xl max-w-lg w-full shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">{info.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Usage */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 font-semibold mb-2">{info.message}</p>
            <p className="text-gray-400 text-sm">
              Current Plan: <Badge className="bg-blue-500/20 text-blue-400">{currentPlan}</Badge>
            </p>
          </div>

          {/* Upgrade Option */}
          <div className="p-6 bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 border-2 border-[#FFD700]/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-[#FFD700]" />
              <h3 className="text-white font-bold text-lg">Upgrade to {upgrade.next}</h3>
              <Badge className="bg-[#FFD700] text-black font-bold ml-auto">
                ${upgrade.price}/mo
              </Badge>
            </div>
            <p className="text-gray-300 text-sm mb-4">{info.upgrade}</p>
            <div className="space-y-2 mb-4">
              {upgrade.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl("Billing")} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold hover:opacity-90">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Later
              </Button>
            </div>
          </div>

          {/* Alternatives */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onClose}
              className="p-3 bg-[#0B0B0C] rounded-lg text-left hover:bg-[#151515] transition-all border border-gray-800"
            >
              <p className="text-white font-semibold text-sm mb-1">Wait Until Tomorrow</p>
              <p className="text-gray-400 text-xs">Quota resets at midnight</p>
            </button>

            <Link to={createPageUrl("Help")}>
              <button className="p-3 bg-[#0B0B0C] rounded-lg text-left hover:bg-[#151515] transition-all border border-gray-800 w-full h-full">
                <p className="text-white font-semibold text-sm mb-1 flex items-center gap-1">
                  Contact Support
                  <ExternalLink className="w-3 h-3" />
                </p>
                <p className="text-gray-400 text-xs">Need custom limits?</p>
              </button>
            </Link>
          </div>

          {/* Tip */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
            <p className="text-blue-400 text-xs">
              💡 <strong>Pro Tip:</strong> Annual plans get 20% off + priority support
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}