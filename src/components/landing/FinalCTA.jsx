import React from "react";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";

export default function FinalCTA({ onWaitlist, onCall }) {
  return (
    <section className="py-28 px-6 bg-[#050505] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#8338EC]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#00D9FF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <p className="text-[#00D9FF] text-sm font-semibold tracking-widest uppercase mb-6">Join the Movement</p>

        <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
          The Future Belongs to<br />
          <span style={{
            background: "linear-gradient(135deg, #00D9FF 0%, #8338EC 50%, #FF006E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Intelligent Brands.</span>
        </h2>

        <p className="text-gray-400 text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
          Be among the first to experience the future of AI-powered cinematic content creation
          and autonomous business growth.
        </p>

        <p className="text-gray-600 mb-14">
          The future isn't coming.{" "}
          <span className="text-white font-semibold">It's already here.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onWaitlist}
            className="group relative px-10 py-5 rounded-xl font-bold text-xl text-white overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #00D9FF, #8338EC)",
              boxShadow: "0 0 40px rgba(0,217,255,0.4), 0 0 80px rgba(131,56,236,0.2)",
            }}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Join the Waitlist
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button
            onClick={onCall}
            className="group px-10 py-5 rounded-xl font-bold text-xl text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-2"
          >
            <Calendar className="w-6 h-6" />
            Book a Strategy Call
          </button>
        </div>

        {/* Coming soon pill */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
          <span className="text-gray-400 text-sm font-medium tracking-wide">COMING SOON</span>
          <span className="text-gray-600 text-sm">·</span>
          <span className="text-gray-500 text-sm">AI Cinematic Ads</span>
          <span className="text-gray-600 text-sm">·</span>
          <span className="text-gray-500 text-sm">Intelligent Automation</span>
          <span className="text-gray-600 text-sm">·</span>
          <span className="text-gray-500 text-sm">Creative Freedom</span>
        </div>
      </div>
    </section>
  );
}