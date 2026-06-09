import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Zap, CheckCircle2, AlertCircle, Clock, ChevronRight, Sparkles, Bot, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Speech-to-Text hook (Web Speech API) ──────────────────────────────────
function useSpeechToText(onResult) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop };
}

// ── Text-to-Speech helper ─────────────────────────────────────────────────
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Strip markdown symbols for cleaner speech
  const clean = text.replace(/[#*`_~>\[\]]/g, "").replace(/\n+/g, ". ").trim();
  const utt = new SpeechSynthesisUtterance(clean);
  utt.rate = 1.05;
  utt.pitch = 1.0;
  // Prefer a female voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => /samantha|google us english|zira|victoria/i.test(v.name));
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

// ── Tool call display ──────────────────────────────────────────────────────
function ToolCall({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || "Function";
  const status = toolCall?.status || "pending";

  const statusConfig = {
    pending:     { icon: Clock,        color: "text-slate-400",  text: "Pending" },
    running:     { icon: Loader2,      color: "text-blue-400",   text: "Running…", spin: true },
    in_progress: { icon: Loader2,      color: "text-blue-400",   text: "Running…", spin: true },
    completed:   { icon: CheckCircle2, color: "text-green-400",  text: "Done" },
    success:     { icon: CheckCircle2, color: "text-green-400",  text: "Done" },
    failed:      { icon: AlertCircle,  color: "text-red-400",    text: "Failed" },
    error:       { icon: AlertCircle,  color: "text-red-400",    text: "Failed" },
  }[status] || { icon: Zap, color: "text-slate-400", text: "" };

  const Icon = statusConfig.icon;
  const label = name.replace(/_/g, " ").replace(/\./g, " › ");

  const parsedResults = (() => {
    if (!toolCall?.results) return null;
    try { return JSON.parse(toolCall.results); } catch { return toolCall.results; }
  })();

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
          "border-gray-700 hover:bg-gray-800/60",
          expanded ? "bg-gray-800/60" : "bg-gray-900/40"
        )}
      >
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-gray-300 capitalize">{label}</span>
        {statusConfig.text && (
          <span className={cn("ml-1", statusConfig.color)}>• {statusConfig.text}</span>
        )}
        {parsedResults && (
          <ChevronRight className={cn("h-3 w-3 text-gray-500 ml-auto transition-transform", expanded && "rotate-90")} />
        )}
      </button>
      {expanded && parsedResults && (
        <div className="mt-1.5 ml-3 pl-3 border-l border-gray-700">
          <pre className="bg-gray-900 rounded p-2 text-gray-400 whitespace-pre-wrap text-xs max-h-40 overflow-auto">
            {typeof parsedResults === "object" ? JSON.stringify(parsedResults, null, 2) : parsedResults}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ message, ttsEnabled }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn("max-w-[80%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-[#2E3192] to-[#3D43C4] text-white"
              : "bg-gray-800/80 border border-gray-700/60 text-gray-100"
          )}>
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                  li: ({ children }) => <li className="my-0">{children}</li>,
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-gray-200">{children}</h3>,
                  code: ({ inline, children }) => inline
                    ? <code className="px-1 py-0.5 rounded bg-gray-700 text-[#FF6B35] text-xs">{children}</code>
                    : <pre className="bg-gray-900 rounded-lg p-3 overflow-auto text-xs text-gray-300 my-2"><code>{children}</code></pre>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1 mt-1">
            {message.tool_calls.map((tc, i) => <ToolCall key={i} toolCall={tc} />)}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-4 h-4 text-gray-300" />
        </div>
      )}
    </div>
  );
}

// ── Quick prompts ──────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "Give me today's business briefing",
  "What projects are currently in production?",
  "Which clients need attention right now?",
  "Show me the pending production queue",
  "Create a social media post idea for Instagram",
  "What are our most recent leads?",
];

const FOUNDER_EMAILS = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];
const isAuthorized = (user) =>
  user && (user.role === "admin" || user.custom_role === "founder" || user.custom_role === "super_admin" || FOUNDER_EMAILS.includes(user.email));

// ── Main ARIA Console ──────────────────────────────────────────────────────
export default function ARIAConsole() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const prevMsgCount = useRef(0);
  const bottomRef = useRef(null);

  // Auth check
  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setAuthChecked(true); }).catch(() => setAuthChecked(true));
  }, []);

  // Create conversation on mount
  useEffect(() => {
    if (!authChecked || !isAuthorized(user)) return;
    (async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "aria",
          metadata: { name: "ARIA Session — " + new Date().toLocaleString() },
        });
        setConversation(conv);
      } catch (e) {
        console.error("Failed to start ARIA conversation", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Subscribe to live updates + auto-speak new ARIA messages
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const newMsgs = data.messages || [];
      setMessages(newMsgs);
      // Speak the latest assistant message if TTS is on and it's newly arrived
      if (ttsEnabled && newMsgs.length > prevMsgCount.current) {
        const latest = newMsgs[newMsgs.length - 1];
        if (latest?.role === "assistant" && latest?.content) {
          speakText(latest.content);
        }
      }
      prevMsgCount.current = newMsgs.length;
    });
    return unsub;
  }, [conversation?.id, ttsEnabled]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || !conversation || sending) return;
    setSending(true);
    setInput("");
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: text.trim() });
    } catch (e) {
      console.error("Send failed", e);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // STT: when transcript arrives, set input and auto-send
  const handleTranscript = useCallback((text) => {
    setInput(text);
    sendMessage(text);
  }, [conversation, sending]);

  const { listening, start: startListening, stop: stopListening } = useSpeechToText(handleTranscript);

  const toggleTts = () => {
    if (ttsEnabled) window.speechSynthesis?.cancel();
    setTtsEnabled(v => !v);
  };

  if (!authChecked) return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2E3192] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthorized(user)) return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center text-center px-6">
      <div>
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-sm">ARIA Console is only available to Super Admins & Founders.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#111317]/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center shadow-lg shadow-[#2E3192]/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              ARIA
              <span className="text-xs font-normal px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                ● Live
              </span>
            </h1>
            <p className="text-sm text-gray-400">AI Executive Assistant — AI Freedom Studios</p>
          </div>
          {/* TTS Toggle */}
          <button
            onClick={toggleTts}
            title={ttsEnabled ? "Mute ARIA voice" : "Enable ARIA voice"}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
              ttsEnabled
                ? "border-[#2E3192]/60 bg-[#2E3192]/20 text-blue-300"
                : "border-gray-700 bg-gray-800/40 text-gray-500"
            )}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{ttsEnabled ? "Voice On" : "Voice Off"}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm">Initializing ARIA…</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#2E3192]/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Good day. I'm ARIA.</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Your AI executive assistant. I have full access to your clients, projects, campaigns, and production queue. Ask me anything or take action.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left px-4 py-3 rounded-xl border border-gray-700 bg-gray-800/40 hover:bg-gray-800/80 hover:border-[#2E3192]/60 text-gray-300 text-sm transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {/* Typing indicator */}
              {sending && (
                <div className="flex gap-3 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl px-4 py-3 flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 bg-[#111317]/80 backdrop-blur-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          {/* Mic button — Speech to Text */}
          <button
            onClick={listening ? stopListening : startListening}
            disabled={loading || sending}
            title={listening ? "Stop listening" : "Speak to ARIA"}
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border",
              listening
                ? "bg-red-500/20 border-red-500/60 text-red-400 animate-pulse"
                : "bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500",
              (loading || sending) && "opacity-40 cursor-not-allowed"
            )}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <textarea
            className="flex-1 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-[#2E3192]/70 focus:ring-1 focus:ring-[#2E3192]/40 transition-all"
            placeholder={listening ? "🎤 Listening… speak now" : "Ask ARIA anything… or tell her what to do"}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading || sending || listening}
            style={{ minHeight: "48px", maxHeight: "160px" }}
          />

          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || sending}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2E3192] to-[#FF6B35] flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          🎤 Speak · ⌨️ Type · 🔊 Voice replies — ARIA has access to Clients · Projects · Campaigns · Leads
        </p>
      </div>
    </div>
  );
}