import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, Zap, CheckCircle2, AlertCircle } from "lucide-react";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "bg-pink-500" },
  { id: "facebook_page", label: "Facebook Page", color: "bg-blue-600" },
  { id: "twitter", label: "Twitter / X", color: "bg-sky-500" },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-700" },
  { id: "tiktok", label: "TikTok", color: "bg-black" },
  { id: "youtube", label: "YouTube", color: "bg-red-600" },
];

export default function AutoPostScheduler() {
  const [user, setUser] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testAssetId, setTestAssetId] = useState("");

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const existing = await base44.entities.PlatformScheduleConfig.filter({ user_email: me.email });
      setConfigs(existing);
      setLoading(false);
    };
    init();
  }, []);

  const addPlatform = (platform) => {
    if (configs.find(c => c.platform === platform)) return;
    setConfigs(prev => [...prev, {
      _new: true,
      user_email: user.email,
      platform,
      is_active: true,
      preferred_time: "09:00",
      day_offset: 0,
      default_caption_template: "{{title}} {{tags}}",
      allowed_file_types: ["image", "video"]
    }]);
  };

  const updateConfig = (idx, field, value) => {
    setConfigs(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const saveConfig = async (idx) => {
    setSaving(idx);
    const c = configs[idx];
    let saved;
    if (c._new) {
      const { _new, ...data } = c;
      saved = await base44.entities.PlatformScheduleConfig.create(data);
    } else {
      saved = await base44.entities.PlatformScheduleConfig.update(c.id, {
        is_active: c.is_active,
        preferred_time: c.preferred_time,
        day_offset: c.day_offset,
        default_caption_template: c.default_caption_template,
        allowed_file_types: c.allowed_file_types
      });
    }
    setConfigs(prev => prev.map((c2, i) => i === idx ? saved : c2));
    setSaving(null);
  };

  const deleteConfig = async (idx) => {
    const c = configs[idx];
    if (!c._new) {
      await base44.entities.PlatformScheduleConfig.delete(c.id);
    }
    setConfigs(prev => prev.filter((_, i) => i !== idx));
  };

  const runTest = async () => {
    if (!testAssetId.trim()) return;
    setTestResult(null);
    const res = await base44.functions.invoke("autoScheduleAssetToSocial", { asset_id: testAssetId.trim() });
    setTestResult(res.data);
  };

  const usedPlatforms = configs.map(c => c.platform);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-7 h-7 text-cyan-400" />
            <h1 className="text-3xl font-bold">Auto-Post Scheduler</h1>
          </div>
          <p className="text-slate-400">
            When an asset is marked as <strong className="text-white">published</strong>, it will automatically be scheduled to your connected social accounts based on these rules.
          </p>
        </div>

        {/* Add Platform Buttons */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400 mb-3">Add a platform schedule rule:</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <Button
                key={p.id}
                size="sm"
                variant="outline"
                disabled={usedPlatforms.includes(p.id)}
                onClick={() => addPlatform(p.id)}
                className={`border-slate-600 text-slate-300 hover:text-white ${usedPlatforms.includes(p.id) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Plus className="w-3 h-3 mr-1" /> {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Config Cards */}
        {configs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No platform schedules configured yet.</p>
            <p className="text-sm">Add a platform above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {configs.map((config, idx) => {
              const platform = PLATFORMS.find(p => p.id === config.platform);
              return (
                <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${platform?.color || 'bg-slate-500'}`} />
                      <span className="font-semibold text-lg">{platform?.label || config.platform}</span>
                      {config._new && <Badge className="bg-amber-500/20 text-amber-300 text-xs">Unsaved</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={v => updateConfig(idx, 'is_active', v)}
                        />
                        <span className="text-sm text-slate-400">{config.is_active ? 'Active' : 'Paused'}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteConfig(idx)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Post Time (UTC)</label>
                      <Input
                        type="time"
                        value={config.preferred_time || "09:00"}
                        onChange={e => updateConfig(idx, 'preferred_time', e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Days from now</label>
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        value={config.day_offset ?? 0}
                        onChange={e => updateConfig(idx, 'day_offset', parseInt(e.target.value) || 0)}
                        className="bg-slate-900 border-slate-600 text-white"
                        placeholder="0 = today, 1 = tomorrow…"
                      />
                    </div>
                    <div className="flex items-end">
                      <p className="text-xs text-slate-400">
                        Schedules <strong className="text-white">{config.day_offset || 0}</strong> day(s) from publish at <strong className="text-white">{config.preferred_time || "09:00"} UTC</strong>
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-slate-400 mb-1 block">Caption Template</label>
                    <Textarea
                      value={config.default_caption_template || ""}
                      onChange={e => updateConfig(idx, 'default_caption_template', e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white text-sm h-20 resize-none"
                      placeholder="Use {{title}} and {{tags}} as placeholders"
                    />
                    <p className="text-xs text-slate-500 mt-1">Placeholders: <code className="text-cyan-400">{"{{title}}"}</code> <code className="text-cyan-400">{"{{tags}}"}</code></p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => saveConfig(idx)}
                    disabled={saving === idx}
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                  >
                    {saving === idx ? "Saving…" : "Save Rule"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Test Panel */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
          <h2 className="font-semibold mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> Test Auto-Schedule
          </h2>
          <p className="text-sm text-slate-400 mb-3">Paste a published Asset ID to manually trigger the auto-schedule workflow.</p>
          <div className="flex gap-3">
            <Input
              value={testAssetId}
              onChange={e => setTestAssetId(e.target.value)}
              placeholder="Asset ID…"
              className="bg-slate-900 border-slate-600 text-white flex-1"
            />
            <Button onClick={runTest} className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
              Run Test
            </Button>
          </div>
          {testResult && (
            <div className="mt-4 p-4 rounded-lg bg-slate-900 text-sm">
              {testResult.success ? (
                <div className="flex items-start gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Created {testResult.posts_created} scheduled post(s)</p>
                    <ul className="mt-2 space-y-1 text-slate-300">
                      {(testResult.posts || []).map((p, i) => (
                        <li key={i}>• {p.platform} → {new Date(p.scheduled_for).toLocaleString()}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{testResult.error || testResult.reason || JSON.stringify(testResult)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}