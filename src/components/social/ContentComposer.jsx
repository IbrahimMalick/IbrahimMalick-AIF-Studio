import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Hash, Smile, Calendar, Send, X, Upload } from "lucide-react";

const PLATFORM_META = {
  instagram:    { label: "Instagram",   color: "bg-pink-500",  limit: 2200 },
  facebook_page:{ label: "Facebook",    color: "bg-blue-600",  limit: 63206 },
  twitter:      { label: "X / Twitter", color: "bg-sky-400",   limit: 280 },
  linkedin:     { label: "LinkedIn",    color: "bg-blue-700",  limit: 3000 },
  tiktok:       { label: "TikTok",      color: "bg-pink-400",  limit: 2200 },
  youtube:      { label: "YouTube",     color: "bg-red-500",   limit: 5000 },
  netflix:      { label: "Netflix Ads", color: "bg-red-700",   limit: 5000 },
  disney_plus:  { label: "Disney+",     color: "bg-blue-900",  limit: 5000 },
  max_hbo:      { label: "Max Ads",     color: "bg-blue-800",  limit: 5000 },
  amazon_prime: { label: "Prime Video", color: "bg-cyan-600",  limit: 5000 },
  paramount_plus:{ label: "Paramount+", color: "bg-blue-600",  limit: 5000 },
};

export default function ContentComposer({ connectedAccounts = [], onSchedule, onClose }) {
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  // selectedAccounts is a Set of account IDs (not platform IDs)
  const [selectedAccounts, setSelectedAccounts] = useState(new Set());
  const [hashtags, setHashtags] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Group accounts by platform
  const accountsByPlatform = connectedAccounts.reduce((acc, acct) => {
    if (!acc[acct.platform]) acc[acct.platform] = [];
    acc[acct.platform].push(acct);
    return acc;
  }, {});

  const toggleAccount = (acctId) => {
    setSelectedAccounts(prev => {
      const next = new Set(prev);
      next.has(acctId) ? next.delete(acctId) : next.add(acctId);
      return next;
    });
  };

  const toggleAllForPlatform = (platform) => {
    const platformAccounts = accountsByPlatform[platform] || [];
    const allSelected = platformAccounts.every(a => selectedAccounts.has(a.id));
    setSelectedAccounts(prev => {
      const next = new Set(prev);
      platformAccounts.forEach(a => allSelected ? next.delete(a.id) : next.add(a.id));
      return next;
    });
  };

  const selectAll = () => {
    setSelectedAccounts(new Set(connectedAccounts.map(a => a.id)));
  };

  const clearAll = () => setSelectedAccounts(new Set());

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setMediaUrl(file_url);
    setUploading(false);
  };

  const handleSave = async (status) => {
    if (!caption || selectedAccounts.size === 0) return;
    setSaving(true);
    const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;
    const chosen = connectedAccounts.filter(a => selectedAccounts.has(a.id));
    for (const acct of chosen) {
      await base44.entities.ScheduledPost.create({
        platform: acct.platform,
        account_id: acct.id,
        account_name: acct.platform_username || acct.account_name,
        content: fullCaption,
        media_url: mediaUrl || null,
        status,
        scheduled_date: scheduleDate || null,
        created_date: new Date().toISOString(),
      });
    }
    setSaving(false);
    if (onSchedule) onSchedule();
    if (onClose) onClose();
  };

  const charCount = caption.length;
  const selectedPlatforms = [...new Set(
    connectedAccounts.filter(a => selectedAccounts.has(a.id)).map(a => a.platform)
  )];
  const minLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map(p => PLATFORM_META[p]?.limit || 9999))
    : 2200;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Create Post</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Account selector — grouped by platform */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Post To Accounts</p>
              {connectedAccounts.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-blue-400 hover:text-blue-300">Select All</button>
                  <span className="text-slate-600 text-xs">|</span>
                  <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-300">Clear</button>
                </div>
              )}
            </div>
            {connectedAccounts.length === 0 ? (
              <p className="text-xs text-slate-500">No connected accounts. Connect platforms first.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(accountsByPlatform).map(([platform, accts]) => {
                  const meta = PLATFORM_META[platform] || { label: platform, color: "bg-slate-600" };
                  const allSelected = accts.every(a => selectedAccounts.has(a.id));
                  return (
                    <div key={platform} className="border border-slate-700 rounded-xl overflow-hidden">
                      {/* Platform header */}
                      <button
                        onClick={() => toggleAllForPlatform(platform)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                          allSelected ? `${meta.color} text-white` : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <span>{meta.label}</span>
                        <span className="opacity-70">{allSelected ? "Deselect All" : `Select All (${accts.length})`}</span>
                      </button>
                      {/* Individual accounts */}
                      <div className="divide-y divide-slate-700/50">
                        {accts.map(acct => (
                          <label key={acct.id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                            selectedAccounts.has(acct.id) ? "bg-slate-700/50" : "bg-slate-800/40 hover:bg-slate-700/30"
                          }`}>
                            <input
                              type="checkbox"
                              checked={selectedAccounts.has(acct.id)}
                              onChange={() => toggleAccount(acct.id)}
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span className="text-sm text-white flex-1">{acct.platform_username || acct.account_name}</span>
                            {acct.followers_count > 0 && (
                              <span className="text-xs text-slate-500">{acct.followers_count.toLocaleString()} followers</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {selectedAccounts.size > 0 && (
              <p className="text-xs text-blue-400 mt-2">{selectedAccounts.size} account{selectedAccounts.size > 1 ? "s" : ""} selected</p>
            )}
          </div>

          {/* Caption */}
          <div>
            <Textarea
              placeholder="Write your caption..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[120px] resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-500">Characters</span>
              <span className={`text-xs ${charCount > minLimit ? "text-red-400" : "text-slate-400"}`}>
                {charCount} / {minLimit}
              </span>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Hashtags</p>
            </div>
            <Input
              placeholder="#socialmedia #marketing #content"
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Media upload */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Media</p>
            </div>
            {mediaUrl ? (
              <div className="relative inline-block">
                <img src={mediaUrl} alt="preview" className="w-40 h-40 object-cover rounded-lg border border-slate-600" />
                <button
                  onClick={() => setMediaUrl("")}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-slate-400 transition-colors w-fit">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">{uploading ? "Uploading..." : "Upload image or video"}</span>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
              </label>
            )}
          </div>

          {/* Schedule date */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Schedule Date (optional)</p>
            </div>
            <Input
              type="datetime-local"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white w-auto"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={saving || !caption || selectedAccounts.size === 0}
            className="border-slate-600 text-slate-300"
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(scheduleDate ? "scheduled" : "published")}
            disabled={saving || !caption || selectedAccounts.size === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            {saving ? "Posting..." : scheduleDate ? `Schedule to ${selectedAccounts.size} Account${selectedAccounts.size !== 1 ? "s" : ""}` : `Post to ${selectedAccounts.size} Account${selectedAccounts.size !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}