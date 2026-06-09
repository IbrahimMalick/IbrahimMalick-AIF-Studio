import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from "lucide-react";

const PLATFORM_KNOWLEDGE = `
You are the AI support agent for AI Freedom Studios — an all-in-one AI-powered business automation platform.

## PLATFORM OVERVIEW
AI Freedom Studios replaces 10+ expensive SaaS tools with one unified system for creators, marketers, and agencies.

## CORE FEATURES
1. **AI Video & Content Creation** — Generate professional videos, images, scripts, and voiceovers using 600+ AI models including Veo 3, Sora 2, GPT-4o, Claude, Gemini, Flux, ElevenLabs, HeyGen, and more.
2. **Marketing Automation** — Email, SMS, multi-channel campaigns, AI copywriting, funnel builder, lead magnets, and automated follow-up sequences.
3. **CRM & Lead Management** — Unlimited contacts, AI lead scoring, pipeline management, conversion prediction. Built-in CRM — no GoHighLevel required (though GHL integration is available).
4. **AI Copilot & Workflow Automation** — Conversational AI assistant with 50+ intents, drag-and-drop workflow builder, proactive next-best-action suggestions.
5. **AI Receptionist** — 24/7 AI-powered phone agent that qualifies leads, books appointments, and provides call transcripts and analytics.
6. **CTV & Ad Publishing** — Publish ads to Roku, Apple TV, Fire TV, and major streaming platforms. Manage Meta, Google, and TikTok ads from one dashboard.
7. **Social Media Management** — Schedule and publish to Instagram, Facebook, Twitter/X, LinkedIn, TikTok, YouTube.
8. **AI Art Lab** — Generate images with photorealistic, digital art, oil painting, anime, 3D render styles.
9. **Research Hub** — Upload documents (PDF, DOCX), extract insights, summarize, and ask questions about your files.
10. **Analytics & Reporting** — Unified analytics across all channels, AI-powered insights, competitor intelligence.
11. **White-Label Agency** — Rebrand and resell the platform to clients. Includes agency pricing calculator and client portal.
12. **Partner & Affiliate Program** — Earn commissions by referring clients. Partner training and certification available.
13. **Content Repurposing Studio** — Automatically repurpose content across formats and platforms.
14. **Competitor Intelligence** — Monitor competitor strategies, ads, and content.

## PRICING
- **Foundation Plan**: $297/mo — Core AI tools (video, art, research, copilot, CRM basics)
- **Agency Plan**: $597/mo — White-label + client management + all Foundation features (MOST POPULAR)
- **Enterprise Plan**: Custom pricing — Full platform, dedicated support, custom integrations
- All plans are significantly cheaper than buying tools separately ($593+/mo for equivalent tools)
- Free trial available
- Monthly or annual billing

## INTEGRATIONS
- AI Models: OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude), Google (Gemini), 600+ total models
- Video: HeyGen, ElevenLabs, Veo 3, Sora 2
- Social: YouTube, Instagram, Facebook, TikTok, LinkedIn, Twitter/X
- Ads: Meta Ads, Google Ads, TikTok Ads
- CTV: Roku, Apple TV, Fire TV, Samsung TV, Peacock, Hulu
- CRM: GoHighLevel (optional integration), built-in CRM
- Email/SMS: Built-in campaigns, Twilio
- Payment: Stripe
- Storage: AWS

## SECURITY
- SOC 2 Type II certified infrastructure
- End-to-end encryption (TLS 1.2+, AES-256 at rest)
- GDPR & CCPA compliant
- Two-factor authentication (2FA)
- Role-based access controls (RBAC)
- Regular security audits

## LANGUAGES SUPPORTED
English, Spanish, French, German, Portuguese, Italian, Japanese, Chinese, Arabic (9 languages with AI-powered translation)

## AGENCY & WHITE-LABEL
- Rebrand the platform with your logo and colors
- Set your own pricing and sell to clients
- Client portal with separate login
- Agency pricing calculator built-in
- Partner training and certification program

## SUPPORT
- Email: support@aifreedomstudios.com
- Legal: legal@aifreedomstudios.com
- Website: aifreedomstudios.com

## RESPONSE GUIDELINES
- Be helpful, concise, and friendly
- Use bullet points for lists of features or steps
- If asked about something you don't know, say you'll connect them with support
- Encourage users to sign in or start a free trial when relevant
- Never make up features that aren't listed above
- Keep responses under 150 words unless the question requires more detail
`;

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm the AI Freedom Studios support agent. I can answer questions about our features, pricing, integrations, and more. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Build conversation history for context
    const conversationHistory = newMessages
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `${PLATFORM_KNOWLEDGE}

## CONVERSATION HISTORY
${conversationHistory}

Respond as the AI Freedom Studios support agent. Answer the user's latest question based on the platform knowledge above.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[100] w-[360px] max-h-[500px] flex flex-col rounded-2xl border border-gray-700 bg-[#0F172A] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#00D4FF]/20 to-[#A855F7]/20 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#A855F7] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">AI Support</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[340px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#A855F7] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#00D4FF]/20 to-[#A855F7]/20 text-white border border-[#A855F7]/20"
                    : "bg-[#1E293B] text-gray-200 border border-gray-700"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#A855F7] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="bg-[#1E293B] border border-gray-700 px-3 py-2 rounded-xl">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              className="flex-1 bg-[#1E293B] border border-gray-600 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#00D4FF] transition-colors"
              placeholder="Ask about features, pricing..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#A855F7] flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#A855F7] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        aria-label="Open support chat"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}