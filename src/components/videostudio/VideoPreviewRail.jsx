import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Film, Loader2, AlertCircle, CheckCircle, Download,
  Clock, Monitor, Cpu, FileText
} from "lucide-react";

function MetaRow({ icon: IconComp, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <IconComp className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-gray-600 text-xs">{label}</p>
        <p className="text-gray-300 text-xs font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  processing: { icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "Processing", spin: true },
  completed:  { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", label: "Completed", spin: false },
  failed:     { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "Failed", spin: false },
};

export default function VideoPreviewRail({ activeVideo, selectedModel, prompt, duration, resolution, isGenerating }) {
  const status = activeVideo?.status;
  const cfg = STATUS_CONFIG[status];

  const handleDownload = () => {
    if (!activeVideo?.videoUrl) return;
    const a = document.createElement("a");
    a.href = activeVideo.videoUrl;
    a.download = `video-${activeVideo.id}.mp4`;
    a.click();
  };

  return (
    <div className="w-80 border-l border-gray-800 bg-[#0d0d0f] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Preview</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Video Player / Status */}
        <div className="aspect-video bg-[#111317] border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center relative">
          {!activeVideo && !isGenerating && (
            <div className="text-center p-4">
              <Film className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-xs">Generate a video to preview</p>
            </div>
          )}

          {(isGenerating || activeVideo?.status === "processing") && (
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
              <p className="text-cyan-400 text-xs font-medium">Generating…</p>
              <p className="text-gray-600 text-xs mt-1">This may take up to 2 min</p>
            </div>
          )}

          {activeVideo?.status === "completed" && activeVideo.videoUrl && (
            <video
              src={activeVideo.videoUrl}
              controls
              className="w-full h-full object-cover"
            />
          )}

          {activeVideo?.status === "failed" && (
            <div className="text-center p-4">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 text-xs font-medium">Generation Failed</p>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {activeVideo && cfg && (() => {
          const StatusIcon = cfg.icon;
          return (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg}`}>
              <StatusIcon className={`w-4 h-4 ${cfg.color} ${cfg.spin ? "animate-spin" : ""}`} />
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
          );
        })()}

        {/* Error */}
        {activeVideo?.status === "failed" && activeVideo.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-xs font-semibold mb-1">Error</p>
            <p className="text-red-300 text-xs leading-relaxed">{activeVideo.error}</p>
          </div>
        )}

        {/* Download */}
        {activeVideo?.status === "completed" && activeVideo.videoUrl && (
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl h-9 text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Video
          </Button>
        )}

        {/* Metadata */}
        <div className="space-y-3 pt-2 border-t border-gray-800">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Details</p>

          <MetaRow
            icon={Cpu}
            label="Model"
            value={activeVideo?.modelName || selectedModel?.name}
          />
          <MetaRow
            icon={Clock}
            label="Duration"
            value={activeVideo?.duration || duration}
          />
          <MetaRow
            icon={Monitor}
            label="Resolution"
            value={activeVideo?.resolution || resolution}
          />
          {(activeVideo?.prompt || prompt) && (
            <div className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-600 text-xs">Prompt</p>
                <p className="text-gray-300 text-xs font-medium mt-0.5 leading-relaxed line-clamp-4">
                  {activeVideo?.prompt || prompt}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}