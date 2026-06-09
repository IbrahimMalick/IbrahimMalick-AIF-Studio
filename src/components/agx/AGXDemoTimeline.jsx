import React from "react";
import { Badge } from "@/components/ui/badge";

const TIMELINE = [
  { time: "0:00", agent: "ARIA", title: "Morning Briefing Begins", desc: "ARIA summarizes overnight metrics from Stripe, Mixpanel, and HubSpot" },
  { time: "0:45", agent: "ARIA", title: "Anomaly Detected", desc: "ARIA flags 23% churn spike in Enterprise tier, traces to API latency issues" },
  { time: "1:30", agent: "AG-TECH", title: "Root Cause Analysis", desc: "AG-TECH correlates with Datadog metrics, identifies database bottleneck" },
  { time: "2:15", agent: "AG-APEX", title: "Strategy Formulation", desc: "AG-APEX develops retention strategy: credits + personal outreach + hotfix" },
  { time: "3:00", agent: "AG-CREATIVE", title: "Content Generation", desc: "AG-CREATIVE drafts personalized apology emails and social posts" },
  { time: "4:00", agent: "AG-DELIVERY", title: "Workflow Triggered", desc: "n8n automation sends emails, creates Slack alerts, schedules calls" },
  { time: "5:00", agent: "AG-CREATIVE", title: "Video Generation", desc: "AG-CREATIVE produces CEO apology video using HeyGen integration" },
  { time: "6:30", agent: "AG-DELIVERY", title: "Campaign Launch", desc: "Multi-channel retention campaign goes live across email, in-app, social" },
  { time: "7:30", agent: "ARIA", title: "Executive Summary", desc: "ARIA presents full incident report with metrics and projections" }
];

const AGENT_COLORS = {
  "ARIA": "bg-violet-500",
  "AG-TECH": "bg-cyan-500",
  "AG-APEX": "bg-orange-500",
  "AG-CREATIVE": "bg-pink-500",
  "AG-DELIVERY": "bg-amber-500"
};

export default function AGXDemoTimeline() {
  return (
    <div className="relative">
      <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-gray-800" />
      <div className="space-y-4">
        {TIMELINE.map((item, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="w-14 text-right">
              <span className="text-orange-400 font-mono text-sm">{item.time}</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${AGENT_COLORS[item.agent] || "bg-gray-500"} mt-1.5 ring-4 ring-[#0B0B0C] z-10`} />
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${AGENT_COLORS[item.agent]} text-white text-xs`}>{item.agent}</Badge>
                <span className="text-white font-semibold text-sm">{item.title}</span>
              </div>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}