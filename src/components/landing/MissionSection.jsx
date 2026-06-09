import React from "react";

export default function MissionSection() {
  return (
    <section className="py-28 px-6 bg-[#07070A] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#8338EC 1px, transparent 1px), linear-gradient(90deg, #8338EC 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8338EC]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <p className="text-[#FFB703] text-sm font-semibold tracking-widest uppercase mb-6">Our Mission</p>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-10 leading-tight">
          We Exist to Help Businesses<br />
          <span style={{
            background: "linear-gradient(135deg, #FFB703, #FF006E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Unlock the Power of AI.</span>
        </h2>

        <div className="space-y-6 text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
          <p>
            We believe every entrepreneur, creator, and organization should have access to the same
            advanced tools once reserved for large corporations and enterprise teams.
          </p>
          <p className="text-white font-medium">
            Our mission is simple: To make powerful AI systems <span className="text-[#FFB703]">accessible</span>,{" "}
            <span className="text-[#FF006E]">practical</span>, and{" "}
            <span className="text-[#00D9FF]">transformational</span> for anyone looking to
            grow their brand, expand their reach, and create more freedom in their business.
          </p>
        </div>

        <div className="mt-12 pt-12 border-t border-white/5 grid md:grid-cols-2 gap-8 text-left">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-white font-bold text-xl mb-3">Not to replace human creativity.</h3>
            <p className="text-gray-500">AI Freedom Studios augments what humans do best — it handles the volume, the repetition, and the complexity, so you can focus on vision.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-white font-bold text-xl mb-3">To amplify it.</h3>
            <p className="text-gray-500">When intelligent systems handle the heavy lifting, human creativity is freed to do what only humans can — imagine, innovate, and inspire.</p>
          </div>
        </div>
      </div>
    </section>
  );
}