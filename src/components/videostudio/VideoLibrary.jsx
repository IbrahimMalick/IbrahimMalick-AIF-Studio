import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Film, Loader2, AlertCircle, CheckCircle, Download,
  Trash2, Play, Clock, Monitor
} from "lucide-react";

const STATUS_CONFIG = {
  processing: { icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30", label: "Processing", spin: true },
  completed:  { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/15 border-green-500/30", label: "Completed", spin: false },
  failed:     { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", label: "Failed", spin: false },
};

export default function VideoLibrary({ library, onOpen, onClear }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? library : library.filter(v => v.status === filter);

  const handleDownload = (e, entry) => {
    e.stopPropagation();
    if (!entry.videoUrl) return;
    const a = document.createElement("a");
    a.href = entry.videoUrl;
    a.download = `video-${entry.id}.mp4`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Video Library</h2>
          <p className="text-gray-500 text-sm mt-0.5">{library.length} generation{library.length !== 1 ? "s" : ""} saved locally</p>
        </div>
        {library.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-gray-600 hover:text-red-400 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "completed", "processing", "failed"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              filter === f
                ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                : "border-gray-700 bg-[#111317] text-gray-500 hover:text-gray-300"
            }`}
          >
            {f === "all" ? `All (${library.length})` : `${f} (${library.filter(v => v.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No videos yet</p>
          <p className="text-gray-600 text-sm mt-1">Generated videos will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(entry => {
            const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.processing;
            return (
              <div
                key={entry.id}
                onClick={() => onOpen(entry)}
                className="bg-[#111317] border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                {/* Thumbnail / Preview */}
                <div className="aspect-video bg-[#0B0B0C] flex items-center justify-center relative overflow-hidden">
                  {entry.status === "completed" && entry.videoUrl ? (
                    <>
                      <video src={entry.videoUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : entry.status === "processing" ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-2" />
                      <p className="text-yellow-400 text-xs">Processing…</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 text-xs">Failed</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-white text-sm font-medium line-clamp-2 leading-snug">{entry.title}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => { const SI = cfg.icon; return (
                      <Badge className={`text-xs border ${cfg.bg} ${cfg.color}`}>
                        <SI className={`w-3 h-3 mr-1 ${cfg.spin ? "animate-spin" : ""}`} />
                        {cfg.label}
                      </Badge>
                    ); })()}
                    <Badge className="bg-transparent border border-gray-700 text-gray-500 text-xs">{entry.modelName}</Badge>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 text-xs">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.duration}</span>
                    <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{entry.resolution}</span>
                  </div>

                  {entry.status === "failed" && entry.error && (
                    <div className="p-2 bg-red-500/8 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs line-clamp-2">{entry.error}</p>
                    </div>
                  )}

                  {entry.status === "completed" && entry.videoUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDownload(e, entry)}
                      className="w-full text-gray-500 hover:text-cyan-400 border border-gray-700 hover:border-cyan-500/40 rounded-lg text-xs h-8"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}