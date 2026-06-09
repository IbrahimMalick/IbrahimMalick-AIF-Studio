import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Clock, Monitor } from "lucide-react";

export default function VideoSettingsPanel({
  duration, setDuration, resolution, setResolution,
  durations, resolutions,
  referenceImage, onUploadClick, onClearImage
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Duration */}
      <div>
        <label className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" /> Duration
        </label>
        <div className="flex flex-wrap gap-1.5">
          {durations.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                duration === d
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                  : "border-gray-700 bg-[#111317] text-gray-500 hover:border-gray-600 hover:text-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5" /> Resolution
        </label>
        <div className="flex flex-wrap gap-1.5">
          {resolutions.map(r => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                resolution === r
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                  : "border-gray-700 bg-[#111317] text-gray-500 hover:border-gray-600 hover:text-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Reference Image */}
      <div>
        <label className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <Upload className="w-3.5 h-3.5" /> Reference Image
        </label>
        {referenceImage ? (
          <div className="flex items-center gap-2 p-2 bg-[#111317] border border-gray-700 rounded-lg">
            <img src={referenceImage.url} alt="ref" className="w-10 h-10 rounded object-cover" />
            <span className="text-xs text-gray-400 truncate flex-1">{referenceImage.name}</span>
            <button onClick={onClearImage} className="text-gray-600 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onUploadClick}
            className="w-full flex items-center justify-center gap-2 p-2.5 border border-dashed border-gray-700 rounded-lg text-gray-600 hover:border-cyan-500/40 hover:text-cyan-400 transition-all text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload image (optional)
          </button>
        )}
      </div>
    </div>
  );
}