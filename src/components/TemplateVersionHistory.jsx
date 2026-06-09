import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, History, RotateCcw, ChevronDown, ChevronUp, Loader2, GitBranch } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const TRIGGER_META = {
  manual_save: { label: 'Manual Save', color: 'bg-blue-500/20 text-blue-400' },
  approval_rejected: { label: 'Before Rejection', color: 'bg-red-500/20 text-red-400' },
  auto_share: { label: 'Pre-Share', color: 'bg-purple-500/20 text-purple-400' },
};

function VersionCard({ version, isLatest, onRevert, isReverting }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TRIGGER_META[version.triggered_by] || TRIGGER_META.manual_save;
  const snap = version.snapshot || {};

  return (
    <div className={`border rounded-xl overflow-hidden ${isLatest ? 'border-[#6366f1]/40 bg-[#111317]' : 'border-gray-800 bg-[#0d0f11]'}`}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isLatest ? 'bg-[#6366f1]/30 text-[#a5b4fc]' : 'bg-gray-800 text-gray-400'}`}>
            v{version.version_number}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-xs font-medium">
              {version.change_summary || `Version ${version.version_number}`}
            </span>
            {isLatest && <Badge className="bg-[#6366f1]/20 text-[#a5b4fc] text-[10px] px-1.5 py-0">Current</Badge>}
            <Badge className={`text-[10px] px-1.5 py-0 ${meta.color}`}>{meta.label}</Badge>
          </div>
          <p className="text-gray-500 text-[11px] mt-0.5">
            by {version.saved_by} · {formatDistanceToNow(new Date(version.created_date), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isLatest && (
            <Button
              size="sm"
              variant="outline"
              className="border-gray-700 text-gray-400 hover:text-white h-7 px-2 text-xs"
              onClick={(e) => { e.stopPropagation(); onRevert(version); }}
              disabled={isReverting}
            >
              {isReverting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
              Revert
            </Button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-gray-800 pt-3 space-y-2 text-xs">
              {snap.name && <Row label="Name" value={snap.name} />}
              {snap.generation_type && <Row label="Type" value={snap.generation_type.replace('_', ' ')} />}
              {snap.tone && <Row label="Tone" value={snap.tone} />}
              {snap.brand_voice_name && <Row label="Brand Voice" value={snap.brand_voice_name} />}
              {snap.target_platforms?.length > 0 && <Row label="Platforms" value={snap.target_platforms.join(', ')} />}
              {snap.prompt_template && (
                <div>
                  <p className="text-gray-500 mb-1">Prompt Template</p>
                  <p className="text-gray-300 bg-[#0B0B0C] rounded-lg p-2 whitespace-pre-wrap leading-relaxed">{snap.prompt_template}</p>
                </div>
              )}
              {snap.custom_instructions && (
                <div>
                  <p className="text-gray-500 mb-1">Custom Instructions</p>
                  <p className="text-gray-400 bg-[#0B0B0C] rounded-lg p-2 whitespace-pre-wrap">{snap.custom_instructions}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 shrink-0 w-24">{label}</span>
      <span className="text-gray-300 capitalize">{value}</span>
    </div>
  );
}

export default function TemplateVersionHistory({ template, user, onClose, onReverted }) {
  const queryClient = useQueryClient();
  const [revertingId, setRevertingId] = useState(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['templateVersions', template.id],
    queryFn: () => base44.entities.TemplateVersion.filter({ template_id: template.id }, '-version_number'),
    enabled: !!template.id,
  });

  const revertMutation = useMutation({
    mutationFn: async (version) => {
      const snap = version.snapshot;
      // Save current state as a new version before reverting
      const currentVersionNum = versions[0]?.version_number || 1;
      await base44.entities.TemplateVersion.create({
        template_id: template.id,
        version_number: currentVersionNum + 1,
        saved_by: user.email,
        change_summary: `Auto-saved before revert to v${version.version_number}`,
        triggered_by: 'manual_save',
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
      // Apply the snapshot fields back to the template
      return base44.entities.ContentTemplate.update(template.id, snap);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templateVersions', template.id]);
      queryClient.invalidateQueries(['contentTemplates']);
      setRevertingId(null);
      onReverted?.();
    },
    onSettled: () => setRevertingId(null),
  });

  const handleRevert = (version) => {
    if (!confirm(`Revert to version ${version.version_number}? Current state will be auto-saved first.`)) return;
    setRevertingId(version.id);
    revertMutation.mutate(version);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#111317] border border-gray-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#6366f1]" />
            <div>
              <h2 className="text-white font-semibold text-sm">Version History</h2>
              <p className="text-gray-500 text-xs truncate max-w-[260px]">{template.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No version history yet</p>
              <p className="text-gray-600 text-xs mt-1">Versions are saved automatically when templates are shared or updated</p>
            </div>
          ) : (
            versions.map((v, i) => (
              <VersionCard
                key={v.id}
                version={v}
                isLatest={i === 0}
                onRevert={handleRevert}
                isReverting={revertingId === v.id && revertMutation.isPending}
              />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}