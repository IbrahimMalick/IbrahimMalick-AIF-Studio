import React from "react";
import { Search, Map, FileText, Film, Video, Scissors, Share2, BarChart2, Brain, Cpu } from "lucide-react";

const AGENTS = [
  { icon: Search,   name: "Research Agent",           desc: "Analyzes markets, competitors, trends, and opportunities.", color: "#00D9FF" },
  { icon: Map,      name: "Strategy Agent",           desc: "Develops campaign direction, positioning, and growth plans.", color: "#8338EC" },
  { icon: FileText, name: "Script Agent",             desc: "Creates compelling ad copy, storytelling, and content frameworks.", color: "#FF006E" },
  { icon: Film,     name: "Cinematic Director Agent", desc: "Designs scenes, visual concepts, camera movements, and creative direction.", color: "#FFB703" },
  { icon: Video,    name: "Video Production Agent",   desc: "Generates cinematic AI-powered video assets and campaigns.", color: "#00D9FF" },
  { icon: Scissors, name: "Editing Agent",            desc: "Optimizes pacing, subtitles, formatting, and audience retention.", color: "#8338EC" },
  { icon: Share2,   name: "Distribution Agent",       desc: "Publishes content across multiple platforms automatically.", color: "#FF006E" },
  { icon: BarChart2,name: "Analytics Agent",          desc: "Measures engagement, conversions, and campaign performance.", color: "#FFB703" },
  { icon: Brain,    name: "Memory Agent",             desc: "Learns your brand, audience, and customer preferences over time.", color: "#00D9FF" },
  { icon: Cpu,      name: "Orchestrator Agent",       desc: "Coordinates the entire system, ensuring every component works together seamlessly.", color: "#8338EC" },
];

export default function AgentNetwork() {
  return (
    <section className="py-28 px-6 bg-[#050505] relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#8338EC]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="text-[#00D9FF] text-sm font-semibold tracking-widest uppercase mb-4">The Agent Network</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Meet The Agents<br />
            <span style={{
              background: "linear-gradient(135deg, #00D9FF, #8338EC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Working For You 24/7</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Imagine having a complete digital production team working for your business
            around the clock. Not just one AI tool — an entire ecosystem of intelligent agents
            collaborating to create, optimize, publish, and scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {AGENTS.map((agent, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
              style={{ "--agent-color": agent.color }}
            >
              {/* corner glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: `inset 0 0 30px ${agent.color}15` }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
                style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}30` }}
              >
                <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
              </div>
              <h3 className="text-white font-bold text-sm mb-2 leading-tight">{agent.name}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{agent.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-2xl font-bold text-white mb-2">Ten intelligent agents.</p>
          <p
            className="text-2xl font-black"
            style={{
              background: "linear-gradient(135deg, #00D9FF, #FF006E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            One unified growth engine.
          </p>
        </div>
      </div>
    </section>
  );
}