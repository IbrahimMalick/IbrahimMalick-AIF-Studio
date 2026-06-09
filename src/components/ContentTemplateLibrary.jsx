import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, Star, BookOpen, Zap, Search, Tag, X,
  ChevronDown, ChevronUp, Copy, CheckCircle2, Share2, History
} from "lucide-react";
import ShareContentModal from "@/components/ShareContentModal";
import TemplateVersionHistory from "@/components/TemplateVersionHistory";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const GENERATION_TYPES = [
  { value: "social_post", label: "Social Post", color: "bg-cyan-500/20 text-cyan-400" },
  { value: "email_copy", label: "Email Copy", color: "bg-blue-500/20 text-blue-400" },
  { value: "seo_metadata", label: "SEO Metadata", color: "bg-purple-500/20 text-purple-400" },
  { value: "blog_post", label: "Blog Post", color: "bg-green-500/20 text-green-400" },
  { value: "ad_copy", label: "Ad Copy", color: "bg-orange-500/20 text-orange-400" },
];

const TONES = ["professional", "casual", "enthusiastic", "educational", "witty", "luxury", "urgent", "friendly"];

const PLATFORMS = ["instagram", "facebook", "twitter", "linkedin", "tiktok", "youtube", "email", "blog"];

const EMPTY_FORM = {
  name: "",
  description: "",
  generation_type: "social_post",
  tone: "professional",
  brand_voice_id: "",
  brand_voice_name: "",
  target_platforms: [],
  prompt_template: "",
  custom_instructions: "",
  tags: [],
};

export default function ContentTemplateLibrary({ user, brandVoiceProfiles = [], onApplyTemplate }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [shareTarget, setShareTarget] = useState(null); // { id, name }
  const [historyTarget, setHistoryTarget] = useState(null); // full template object

  const { data: templates = [] } = useQuery({
    queryKey: ["contentTemplates", user?.email],
    queryFn: () => base44.entities.ContentTemplate.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentTemplate.create({ ...data, user_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries(["contentTemplates"]);
      setForm(EMPTY_FORM);
      setTagInput("");
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["contentTemplates"]),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }) => base44.entities.ContentTemplate.update(id, { is_favorite }),
    onSuccess: () => queryClient.invalidateQueries(["contentTemplates"]),
  });

  const applyMutation = useMutation({
    mutationFn: ({ id, times_used }) =>
      base44.entities.ContentTemplate.update(id, { times_used: times_used + 1, last_used_at: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries(["contentTemplates"]),
  });

  const addTag = () => {
    if (!tagInput.trim() || form.tags.includes(tagInput.trim())) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
    setTagInput("");
  };

  const removeTag = (tag) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const togglePlatform = (p) => {
    setForm((f) => ({
      ...f,
      target_platforms: f.target_platforms.includes(p)
        ? f.target_platforms.filter((x) => x !== p)
        : [...f.target_platforms, p],
    }));
  };

  const snapshotTemplate = async (template, triggeredBy = 'auto_share') => {
    const versions = await base44.entities.TemplateVersion.filter({ template_id: template.id }, '-version_number');
    const nextVersion = (versions[0]?.version_number || 0) + 1;
    await base44.entities.TemplateVersion.create({
      template_id: template.id,
      version_number: nextVersion,
      saved_by: user.email,
      change_summary: triggeredBy === 'auto_share' ? `Snapshot before sharing (v${nextVersion})` : `Manual save (v${nextVersion})`,
      triggered_by: triggeredBy,
      snapshot: {
        name: template.name,
        description: template.description,
        generation_type: template.generation_type,
        tone: template.tone,
        brand_voice_id: template.brand_voice_id,
        brand_voice_name: template.brand_voice_name,
        target_platforms: template.target_platforms,
        prompt_template: template.prompt_template,
        custom_instructions: template.custom_instructions,
        tags: template.tags,
      },
    });
  };

  const handleApply = (template) => {
    applyMutation.mutate({ id: template.id, times_used: template.times_used || 0 });
    if (onApplyTemplate) onApplyTemplate(template);
  };

  const handleCopyPrompt = (template) => {
    navigator.clipboard.writeText(template.prompt_template || "");
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBrandVoiceChange = (id) => {
    const profile = brandVoiceProfiles.find((p) => p.id === id);
    setForm((f) => ({
      ...f,
      brand_voice_id: id,
      brand_voice_name: profile?.profile_name || "",
    }));
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = filterType === "all" || t.generation_type === filterType;
    return matchSearch && matchType;
  });

  const favorites = filtered.filter((t) => t.is_favorite);
  const rest = filtered.filter((t) => !t.is_favorite);
  const sorted = [...favorites, ...rest];

  const typeConfig = (type) => GENERATION_TYPES.find((g) => g.value === type) || GENERATION_TYPES[0];

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FFD700]" />
            Template Library
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Save brand voice + tone settings as reusable templates for quick generation
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FFD700] text-black font-semibold hover:bg-[#e6c200] shrink-0"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "New Template"}
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-[#111317] border-[#FFD700]/40 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-base">Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Template Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Bold LinkedIn Thought Leader"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Content Type</label>
                    <Select
                      value={form.generation_type}
                      onValueChange={(v) => setForm((f) => ({ ...f, generation_type: v }))}
                    >
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111317] border-gray-700 text-white">
                        {GENERATION_TYPES.map((g) => (
                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Tone</label>
                    <Select
                      value={form.tone}
                      onValueChange={(v) => setForm((f) => ({ ...f, tone: v }))}
                    >
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111317] border-gray-700 text-white">
                        {TONES.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Brand Voice Profile</label>
                    <Select
                      value={form.brand_voice_id}
                      onValueChange={handleBrandVoiceChange}
                    >
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue placeholder="Select profile (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111317] border-gray-700 text-white">
                        {brandVoiceProfiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.profile_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Description</label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="When should you use this template?"
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Target Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          form.target_platforms.includes(p)
                            ? "bg-[#00D4C9]/20 text-[#00D4C9] border-[#00D4C9]/40"
                            : "bg-transparent text-gray-500 border-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Prompt Template</label>
                  <Textarea
                    value={form.prompt_template}
                    onChange={(e) => setForm((f) => ({ ...f, prompt_template: e.target.value }))}
                    placeholder="Write the base prompt or creative brief for this template..."
                    rows={3}
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Custom Instructions</label>
                  <Textarea
                    value={form.custom_instructions}
                    onChange={(e) => setForm((f) => ({ ...f, custom_instructions: e.target.value }))}
                    placeholder="Additional instructions appended to every generation (e.g., 'Always end with a question')"
                    rows={2}
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add tag and press Enter"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <Button onClick={addTag} size="sm" className="bg-gray-700 hover:bg-gray-600 text-white">
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {form.tags.map((tag) => (
                      <Badge key={tag} className="bg-gray-700 text-gray-300 text-xs">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-white">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => createMutation.mutate(form)}
                  disabled={!form.name || createMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold rounded-xl h-11"
                >
                  {createMutation.isPending ? "Saving..." : "Save Template"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-9 bg-[#111317] border-gray-700 text-white rounded-xl"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-[#111317] border-gray-700 text-white rounded-xl w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-[#111317] border-gray-700 text-white">
            <SelectItem value="all">All Types</SelectItem>
            {GENERATION_TYPES.map((g) => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Cards */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-14 h-14 mx-auto mb-4 text-gray-700" />
          <p className="text-gray-400 font-medium mb-1">No templates yet</p>
          <p className="text-gray-600 text-sm">Create your first template to save brand voice and tone settings for quick reuse</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {sorted.map((template) => {
              const tc = typeConfig(template.generation_type);
              const isExpanded = expandedId === template.id;
              const isCopied = copiedId === template.id;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <Card className={`bg-[#111317] border-gray-800 rounded-2xl hover:border-gray-600 transition-colors ${template.is_favorite ? "ring-1 ring-[#FFD700]/40" : ""}`}>
                    <CardContent className="p-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className={`${tc.color} text-xs`}>{tc.label}</Badge>
                            <Badge className="bg-gray-700 text-gray-300 text-xs capitalize">{template.tone}</Badge>
                            {template.is_favorite && (
                              <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
                            )}
                          </div>
                          <h3 className="text-white font-semibold text-sm truncate">{template.name}</h3>
                          {template.description && (
                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{template.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleFavoriteMutation.mutate({ id: template.id, is_favorite: !template.is_favorite })}
                            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                            title={template.is_favorite ? "Unpin" : "Pin as favorite"}
                          >
                            <Star className={`w-4 h-4 ${template.is_favorite ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-600"}`} />
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : template.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this template?")) deleteMutation.mutate(template.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500/60 hover:text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                        {template.brand_voice_name && (
                          <span>🎙 {template.brand_voice_name}</span>
                        )}
                        {template.target_platforms?.length > 0 && (
                          <span>📱 {template.target_platforms.slice(0, 3).join(", ")}{template.target_platforms.length > 3 ? "…" : ""}</span>
                        )}
                        <span>⚡ Used {template.times_used || 0}×</span>
                      </div>

                      {/* Tags */}
                      {template.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.map((tag) => (
                            <Badge key={tag} className="bg-gray-800 text-gray-400 text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 border-t border-gray-800 space-y-3">
                              {template.prompt_template && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Prompt Template</p>
                                  <p className="text-gray-300 text-sm bg-[#0B0B0C] rounded-lg p-3 whitespace-pre-wrap">
                                    {template.prompt_template}
                                  </p>
                                </div>
                              )}
                              {template.custom_instructions && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Custom Instructions</p>
                                  <p className="text-gray-400 text-sm bg-[#0B0B0C] rounded-lg p-3 whitespace-pre-wrap">
                                    {template.custom_instructions}
                                  </p>
                                </div>
                              )}
                              {template.last_used_at && (
                                <p className="text-xs text-gray-600">
                                  Last used: {format(new Date(template.last_used_at), "MMM d, yyyy")}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        {template.prompt_template && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-400 hover:text-white flex-1"
                            onClick={() => handleCopyPrompt(template)}
                          >
                            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                            {isCopied ? "Copied!" : "Copy Prompt"}
                          </Button>
                        )}
                        <Button
                         size="sm"
                         variant="outline"
                         className="border-gray-700 text-gray-400 hover:text-[#6366f1] hover:border-[#6366f1]/50"
                         onClick={() => setHistoryTarget(template)}
                         title="Version history"
                        >
                         <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                         size="sm"
                         variant="outline"
                         className="border-gray-700 text-gray-400 hover:text-[#00D4C9] hover:border-[#00D4C9]/50"
                         onClick={async () => {
                           await snapshotTemplate(template, 'auto_share');
                           setShareTarget({ id: template.id, name: template.name });
                         }}
                         title="Share template"
                        >
                         <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#00D4C9] text-black font-semibold flex-1 hover:bg-[#00b8ad]"
                          onClick={() => handleApply(template)}
                        >
                          <Zap className="w-3.5 h-3.5 mr-1" />
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>

    {shareTarget && (
      <ShareContentModal
        user={user}
        resourceId={shareTarget.id}
        resourceName={shareTarget.name}
        shareType="template"
        onClose={() => setShareTarget(null)}
      />
    )}

    {historyTarget && (
      <TemplateVersionHistory
        template={historyTarget}
        user={user}
        onClose={() => setHistoryTarget(null)}
        onReverted={() => setHistoryTarget(null)}
      />
    )}
    </>
  );
}