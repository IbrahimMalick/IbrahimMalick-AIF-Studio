import React from "react";
import { X, CheckCircle2 } from "lucide-react";

const PROBLEMS = [
  "Inconsistent content creation",
  "Expensive production costs",
  "Low engagement and visibility",
  "Time-consuming marketing workflows",
  "Falling behind competitors embracing AI",
];

const BENEFITS = [
  "Create cinematic advertisements",
  "Scale content production",
  "Increase brand awareness",
  "Automate repetitive marketing tasks",
  "Generate more leads",
  "Improve customer engagement",
  "Build authority in your industry",
  "Operate with greater efficiency",
];

export default function ProblemSolution() {
  return (
    <>
      {/* Problem */}
      <section className="py-28 px-6 bg-[#07070A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#FF006E] text-sm font-semibold tracking-widest uppercase mb-4">The Problem</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Stop Creating Content.<br />
              <span className="text-gray-500">Start Building Attention.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Most businesses struggle with the same obstacles standing between them and real growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {PROBLEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-xl bg-[#FF006E]/5 border border-[#FF006E]/15">
                <X className="w-5 h-5 text-[#FF006E] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center space-y-3">
            <p className="text-gray-400 text-lg">The digital landscape is evolving faster than ever.</p>
            <p className="text-white font-bold text-xl">
              Businesses that leverage AI will{" "}
              <span className="text-[#00D9FF]">dominate.</span>
            </p>
            <p className="text-gray-500">Businesses that don't will struggle to compete.</p>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              <span className="text-white font-semibold">AIFreedomStudios</span> bridges that gap by combining cinematic storytelling,
              intelligent automation, and autonomous AI agents into one powerful growth ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Solution benefits */}
      <section className="py-28 px-6 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00D9FF]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#00D9FF] text-sm font-semibold tracking-widest uppercase mb-4">The Solution</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              More Than Content.<br />
              <span style={{
                background: "linear-gradient(135deg, #00D9FF, #8338EC)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>A Complete AI Growth Ecosystem.</span>
            </h2>
            <p className="text-gray-500 text-base">This isn't simply automation. It's intelligent business acceleration.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {BENEFITS.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00D9FF]/20 transition-all duration-300">
                <CheckCircle2 className="w-5 h-5 text-[#00D9FF] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}