import React from "react";
import { Search, Clock } from "lucide-react";

// Lightweight fuzzy score (substring + order weighting)
function fuzzyScore(query, text) {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (t.includes(q)) return q.length * 4; // direct substring gets boost
  // ordered char match
  let qi = 0, score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { score += 2; qi++; }
  }
  return qi === q.length ? score : 0;
}

export default function CommandPalette({
  open,
  onClose,
  pages = [],
  recents = [],
  onFallbackIntent
}) {
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const items = React.useMemo(() => {
    const source = [
      ...pages.map(p => ({ ...p, _type: "page" })),
      ...(recents || []).map(r => ({ ...r, _type: "recent" })),
    ];
    if (!q) return source.slice(0, 12);
    return source
      .map(it => ({ it, s: fuzzyScore(q, `${it.label} ${it.href}`) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map(x => x.it);
  }, [q, pages, recents]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") return onClose();
    if (e.key === "ArrowDown") { 
      e.preventDefault(); 
      setActive(a => Math.min(a + 1, Math.max(items.length - 1, 0))); 
    }
    if (e.key === "ArrowUp") { 
      e.preventDefault(); 
      setActive(a => Math.max(a - 1, 0)); 
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (items.length && items[active]) {
        window.location.assign(items[active].href);
        return onClose();
      }
      // No match → treat as intent for Copilot
      if (q && onFallbackIntent) {
        onFallbackIntent(q);
        onClose();
      }
    }
  };

  const go = (href) => { 
    window.location.assign(href); 
    onClose(); 
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl rounded-2xl border border-gray-700 bg-[#111317]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500 text-lg"
            placeholder='Search pages or type a command… (e.g., "go to analytics")'
          />
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-2 py-1 rounded bg-gray-800 border border-gray-700">Esc</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto">
          {!items.length ? (
            <div className="p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">
                No matches found
              </p>
              <p className="text-gray-500 text-xs">
                Press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300">Enter</kbd> to run as Copilot command
              </p>
            </div>
          ) : (
            <ul className="p-2">
              {items.map((it, i) => (
                <li key={`${it._type}:${it.href}`}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(it.href)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                      i === active 
                        ? "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black" 
                        : "text-gray-200 hover:bg-gray-800/60"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      i === active 
                        ? "bg-black/20" 
                        : "bg-gray-800 border border-gray-700"
                    }`}>
                      {it._type === "recent" ? (
                        <Clock className={`w-4 h-4 ${i === active ? "text-black" : "text-gray-400"}`} />
                      ) : (
                        <span className={`text-xs ${i === active ? "text-black" : "text-gray-400"}`}>
                          {it.icon || "📄"}
                        </span>
                      )}
                    </div>

                    {/* Label & Type */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        i === active ? "text-black" : "text-white"
                      }`}>
                        {it.label}
                      </div>
                      <div className={`text-xs truncate ${
                        i === active ? "text-black/70" : "text-gray-400"
                      }`}>
                        {it._type === "recent" ? "Recent" : "Page"} • {it.href}
                      </div>
                    </div>

                    {/* Hint */}
                    {i === active && (
                      <div className="text-xs text-black/60 font-medium">
                        Enter ↵
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>Enter to open</span>
          </div>
          <div>
            💡 Type any command for Copilot
          </div>
        </div>
      </div>
    </div>
  );
}