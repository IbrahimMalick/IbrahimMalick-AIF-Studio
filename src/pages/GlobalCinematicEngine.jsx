import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Globe,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  CheckCircle2,
  Film,
  Eye,
  Heart,
  Brain,
  Rocket
} from "lucide-react";

export default function GlobalCinematicEngine() {
  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      
      {/* SECTION 1 - HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0C] via-[#1a1a2e] to-[#0B0B0C]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD700] rounded-full filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D4C9] rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
          <Badge className="bg-[#FFD700]/20 text-[#FFD700] mb-6 text-sm px-4 py-2">
            ⚡ The Global Cinematic Ad Engine™
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-white to-[#00D4C9] bg-clip-text text-transparent leading-tight">
            The GLOBAL CINEMATIC AD ENGINE™ for Visionary Brands
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Cinematic clarity. Global precision. Spiritual creativity.
          </p>
          
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            AI Freedom Studios builds cinematic advertising systems that elevate brands beyond ordinary content.
            <br/><br/>
            Using our proprietary <strong className="text-[#FFD700]">GLOBAL CINEMATIC AD ENGINE™</strong>, we create immersive, high-impact campaigns designed for founders and companies stepping into global influence.
            <br/><br/>
            <strong className="text-white">Your message becomes unforgettable.<br/>
            Your brand becomes undeniable.</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg px-8 py-6 hover:opacity-90 transition-all transform hover:scale-105">
              <Film className="w-5 h-5 mr-2" />
              Book a Vision Call
            </Button>
            <Button variant="outline" className="border-2 border-white/30 text-white font-semibold text-lg px-8 py-6 hover:bg-white/10">
              <Eye className="w-5 h-5 mr-2" />
              View Campaign Samples
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* SECTION 2 - POSITIONING */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFD700]/5 to-transparent" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Not an Agency. Not a Tool. <span className="text-[#FFD700]">A Proprietary Cinematic Engine.</span>
            </h2>
          </div>
          
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  Most creatives make videos.<br/>
                  Most AI services generate templates.
                </p>
                <p className="text-2xl font-bold text-white">
                  We build something entirely different.
                </p>
                <p>
                  The <strong className="text-[#FFD700]">GLOBAL CINEMATIC AD ENGINE™</strong> is our proprietary cinematic system — a fusion of:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 my-8">
                  {[
                    { icon: Film, text: "Narrative intelligence" },
                    { icon: Sparkles, text: "Intuitive creative direction" },
                    { icon: Globe, text: "Private multi-model AI architecture" },
                    { icon: Heart, text: "Designed exclusively for brand elevation" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <item.icon className="w-6 h-6 text-[#00D4C9] flex-shrink-0 mt-1" />
                      <p className="text-white font-semibold">{item.text}</p>
                    </div>
                  ))}
                </div>
                
                <p className="text-xl text-white font-semibold border-l-4 border-[#FFD700] pl-6 py-2">
                  You don't get "content."<br/>
                  You get a complete cinematic advertising system custom-built for your brand.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0B0B0C] to-[#111317]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How the Engine <span className="text-[#FFD700]">Activates Your Brand</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Vision & Alignment",
                icon: Brain,
                color: "from-[#FFD700] to-[#FF8C00]",
                description: "We begin by decoding the essence of your brand — its voice, energy, depth, and impact. This becomes your Cinematic Identity Map™."
              },
              {
                step: 2,
                title: "Cinematic Ad Generation",
                icon: Film,
                color: "from-[#00D4C9] to-[#1E90FF]",
                description: "Your brand narrative is transformed into a suite of cinematic, emotionally resonant, high-conversion ads using our internal AI creative system — built privately, engineered for precision. Zero templates. Zero generic outputs. Everything is fully brand-aligned."
              },
              {
                step: 3,
                title: "Global Campaign Readiness",
                icon: Globe,
                color: "from-[#9D4EDD] to-[#FF69B4]",
                description: "Your assets are refined, structured, and optimized for global distribution across multiple platforms and media channels. You walk away with a complete cinematic advertising system."
              }
            ].map((step) => (
              <Card key={step.step} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700] transition-all group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{step.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button className="bg-gradient-to-r from-[#00D4C9] to-[#1E90FF] text-white font-bold text-lg px-8 py-6">
              See the Engine in Action
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4 - FLAGSHIP OFFER */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-[#FFD700]/10 via-[#111317] to-[#FF8C00]/10 border-[#FFD700] border-2 rounded-3xl overflow-hidden">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <Badge className="bg-[#FFD700] text-black font-bold mb-4 text-sm px-4 py-2">
                  FLAGSHIP OFFER
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  The AI Freedom Global Cinematic Campaign
                </h2>
                <p className="text-xl text-[#FFD700]">
                  Powered by the GLOBAL CINEMATIC AD ENGINE™
                </p>
              </div>
              
              <div className="mb-8">
                <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                  A <strong className="text-white">30–90 day brand transformation experience</strong> designed to build a complete cinematic advertising system for your offer, your vision, and your market.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "A suite of cinematic, brand-perfect ads",
                    "Multi-format global campaign assets",
                    "A complete narrative architecture for your brand",
                    "A private brand-spirit alignment session",
                    "A global distribution-ready folder system",
                    "Activation & scale strategy consultation"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-[#0B0B0C]/50 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                      <p className="text-white font-semibold">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-800 pt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Investment:</p>
                    <p className="text-4xl font-bold text-white mb-2">$25k–$75k</p>
                    <p className="text-gray-400 text-sm">Enterprise retainers available for ongoing campaigns.</p>
                  </div>
                  <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-lg px-10 py-7 hover:opacity-90 transition-all transform hover:scale-105">
                    <Rocket className="w-5 h-5 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 5 - WHO THIS IS FOR */}
      <section className="py-24 px-4 bg-[#111317]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For Leaders Who <span className="text-[#FFD700]">Refuse to Blend In</span>
            </h2>
          </div>
          
          <Card className="bg-[#0B0B0C] border-gray-800 rounded-2xl">
            <CardContent className="p-8 md:p-12">
              <p className="text-lg text-gray-300 mb-8">
                The <strong className="text-[#FFD700]">GLOBAL CINEMATIC AD ENGINE™</strong> is for you if you are:
              </p>
              
              <div className="space-y-4">
                {[
                  "Founders with a premium or transformative offer",
                  "Creators building a global presence",
                  "Brands tired of looking \"like everyone else\"",
                  "Visionaries who want their visual identity to reflect their true power",
                  "Agencies or media teams needing a proprietary cinematic system"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-gradient-to-r from-[#FFD700]/5 to-transparent rounded-xl border-l-4 border-[#FFD700] hover:from-[#FFD700]/10 transition-all">
                    <Target className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
                    <p className="text-white text-lg">{item}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-6 bg-gradient-to-r from-[#FFD700]/20 to-[#FF8C00]/20 rounded-xl border border-[#FFD700]/30">
                <p className="text-xl text-white font-semibold text-center">
                  This is for the chosen few who understand that visual identity determines market dominance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 6 - BENEFITS */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What This Creates for <span className="text-[#FFD700]">Your Brand</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Film,
                title: "Cinematic Presence",
                description: "A cinematic presence that elevates your perceived value",
                color: "from-[#FFD700] to-[#FF8C00]"
              },
              {
                icon: Globe,
                title: "Global Scale",
                description: "A globally scalable ad system you can use for months or years",
                color: "from-[#00D4C9] to-[#1E90FF]"
              },
              {
                icon: Heart,
                title: "Mission Alignment",
                description: "A visual identity aligned with your deeper mission and message",
                color: "from-[#9D4EDD] to-[#FF69B4]"
              },
              {
                icon: TrendingUp,
                title: "Premium Performance",
                description: "High-performance creative designed for premium offers",
                color: "from-[#FF69B4] to-[#FFD700]"
              },
              {
                icon: Target,
                title: "Narrative Clarity",
                description: "Narrative clarity that fuels paid media, organic content, and partnerships",
                color: "from-[#06D6A0] to-[#00D4C9]"
              },
              {
                icon: Sparkles,
                title: "Market Dominance",
                description: "The ability to stand out instantly in saturated markets",
                color: "from-[#1E90FF] to-[#9D4EDD]"
              }
            ].map((benefit, idx) => (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700] transition-all group">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - ABOUT / FOUNDER */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#0B0B0C] via-[#1a1a2e] to-[#0B0B0C]">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#111317]/80 backdrop-blur-sm border-gray-800 rounded-3xl overflow-hidden">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  The Vision Behind <span className="text-[#FFD700]">AI Freedom Studios</span>
                </h2>
              </div>
              
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <div className="my-8 p-6 bg-gradient-to-r from-[#FFD700]/10 to-transparent rounded-xl border-l-4 border-[#FFD700]">
                  <p className="text-white">
                    I'm <strong className="text-[#FFD700]">Duane Persad</strong>, founder of AI Freedom Studios and creator of the GLOBAL CINEMATIC AD ENGINE™.
                  </p>
                </div>
                
                <p>I fuse:</p>
                
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  {[
                    "Narrative architecture",
                    "Intuitive/spiritual creative guidance",
                    "Cinematic visual intelligence",
                    "Proprietary AI production systems"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-[#0B0B0C] rounded-xl">
                      <Sparkles className="w-5 h-5 text-[#00D4C9]" />
                      <p className="text-white font-semibold">{item}</p>
                    </div>
                  ))}
                </div>
                
                <p>
                  to build <strong className="text-[#FFD700]">cinematic AI ad engines</strong> for leaders stepping into global influence.
                </p>
                
                <p className="text-xl text-center text-[#FFD700] italic pt-6">
                  My guiding belief:
                </p>
                <p className="text-2xl text-white font-bold text-center">
                  "Your marketing should feel as powerful as your purpose."
                </p>
                <p className="text-lg text-gray-400 text-center pt-4">
                  If that resonates, you're in the right place.
                </p>
              </div>
              
              <div className="text-center mt-10">
                <Button variant="outline" className="border-2 border-[#FFD700] text-[#FFD700] font-bold text-lg px-8 py-6 hover:bg-[#FFD700]/10">
                  Meet the Creator →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 8 - FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">FAQ</h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "What tools or models do you use?",
                answer: "We use a proprietary, privately engineered multi-model system designed internally for cinematic creative production. The specifics are confidential; the results speak for themselves."
              },
              {
                question: "Do I need a team to use this?",
                answer: "No. We deliver assets ready for immediate deployment across your existing channels."
              },
              {
                question: "How long does the process take?",
                answer: "Typically 30–90 days depending on depth and scope."
              },
              {
                question: "Who owns the final assets?",
                answer: "You do. Full usage rights are included."
              },
              {
                question: "Do you work with early-stage brands?",
                answer: "If the vision is strong and the offer is real — yes."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700] transition-all">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 - FINAL CTA */}
      <section className="py-32 px-4 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#00D4C9]/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to <span className="text-[#FFD700]">Activate Your Cinematic Identity</span>?
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            If you're done with generic content and ready for a cinematic, spiritually aligned, globally scalable brand presence, the next step is simple:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-xl px-12 py-8 hover:opacity-90 transition-all transform hover:scale-105 shadow-2xl">
              <Film className="w-6 h-6 mr-2" />
              Book a Vision Call
            </Button>
            <Button variant="outline" className="border-2 border-white/50 text-white font-bold text-xl px-12 py-8 hover:bg-white/10">
              <Rocket className="w-6 h-6 mr-2" />
              Apply for a Global Cinematic Campaign
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-gray-800 bg-[#111317]">
        <div className="max-w-6xl mx-auto text-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fce6920833ed418c193f75/3325e5b30_image.png"
            alt="AI Freedom Studios"
            className="h-12 w-auto mx-auto mb-6 object-contain"
          />
          <h3 className="text-2xl font-bold text-white mb-2">
            AI Freedom Studios — The Global Cinematic Ad Engine™
          </h3>
          <p className="text-[#FFD700] text-lg mb-6">
            Cinematic AI for the New World.
          </p>
          <p className="text-gray-500 text-sm">
            © 2025. All Rights Reserved. Cinematic AI for the New World.
          </p>
        </div>
      </footer>

    </div>
  );
}