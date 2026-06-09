import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Clock, FileText, Layers, Mic2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META = {
  template: { label: 'Template', icon: FileText, color: 'bg-blue-500/20 text-blue-400' },
  collection: { label: 'Collection', icon: Layers, color: 'bg-purple-500/20 text-purple-400' },
  brand_voice: { label: 'Brand Voice', icon: Mic2, color: 'bg-pink-500/20 text-pink-400' },
};

const STATUS_META = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

function ReviewCard({ share, user, onReviewed }) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [actionPending, setActionPending] = useState(null);
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async ({ status }) => {
      // If rejecting a template, snapshot the current template state for rollback
      if (status === 'rejected' && share.share_type === 'template' && share.resource_id) {
        const template = await base44.entities.ContentTemplate.get(share.resource_id);
        if (template) {
          const versions = await base44.entities.TemplateVersion.filter({ template_id: share.resource_id }, '-version_number');
          const nextVersion = (versions[0]?.version_number || 0) + 1;
          await base44.entities.TemplateVersion.create({
            template_id: share.resource_id,
            version_number: nextVersion,
            saved_by: user.email,
            change_summary: `Snapshot on rejection by ${user.email}`,
            triggered_by: 'approval_rejected',
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
        }
      }
      return base44.entities.TemplateShare.update(share.id, {
        approval_status: status,
        approval_comment: comment.trim(),
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['approvalQueue']);
      setActionPending(null);
      onReviewed?.();
    },
  });

  const handleAction = (status) => {
    setActionPending(status);
    reviewMutation.mutate({ status });
  };

  const typeMeta = TYPE_META[share.share_type] || TYPE_META.template;
  const TypeIcon = typeMeta.icon;
  const isPending = share.approval_status === 'pending' || !share.approval_status;
  const statusMeta = STATUS_META[share.approval_status || 'pending'];
  const StatusIcon = statusMeta.icon;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isPending ? 'border-yellow-500/30 bg-[#111317]' : 'border-gray-800 bg-[#0d0f11]'
    }`}>
      {/* Card Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`p-2 rounded-lg ${typeMeta.color}`}>
          <TypeIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{share.resource_name}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            Shared by <span className="text-gray-400">{share.owner_email}</span>
            {' · '}
            {formatDistanceToNow(new Date(share.created_date), { addSuffix: true })}
          </p>
        </div>
        <Badge className={`text-[10px] px-2 py-0.5 shrink-0 ${statusMeta.color}`}>
          <StatusIcon className="w-3 h-3 mr-1 inline" />
          {statusMeta.label}
        </Badge>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
        )}
      </div>

      {/* Expanded Details & Review */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800 pt-4 space-y-4">
          {/* Info row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B0B0C] rounded-lg p-3">
              <p className="text-gray-500 mb-1">Shared With</p>
              <p className="text-white">{share.shared_with_email}</p>
            </div>
            <div className="bg-[#0B0B0C] rounded-lg p-3">
              <p className="text-gray-500 mb-1">Access Level</p>
              <p className="text-white capitalize">{share.permission}</p>
            </div>
          </div>

          {share.message && (
            <div className="bg-[#0B0B0C] rounded-lg p-3 text-xs border-l-4 border-[#6366f1]/50">
              <p className="text-gray-500 mb-1">Note from sharer</p>
              <p className="text-gray-300 italic">"{share.message}"</p>
            </div>
          )}

          {/* Existing review info (if already reviewed) */}
          {!isPending && share.reviewed_by && (
            <div className="bg-[#0B0B0C] rounded-lg p-3 text-xs space-y-1">
              <p className="text-gray-500">Reviewed by <span className="text-gray-300">{share.reviewed_by}</span></p>
              {share.approval_comment && (
                <p className="text-gray-400">"{share.approval_comment}"</p>
              )}
              {share.reviewed_at && (
                <p className="text-gray-600">{formatDistanceToNow(new Date(share.reviewed_at), { addSuffix: true })}</p>
              )}
            </div>
          )}

          {/* Review actions (only for pending) */}
          {isPending && (
            <div className="space-y-3">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)"
                className="bg-[#0B0B0C] border-gray-700 text-white text-sm rounded-xl resize-none h-20"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAction('approved')}
                  disabled={reviewMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm"
                >
                  {actionPending === 'approved' && reviewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction('rejected')}
                  disabled={reviewMutation.isPending}
                  variant="outline"
                  className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl text-sm"
                >
                  {actionPending === 'rejected' && reviewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ContentApprovalQueue() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('pending');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ['approvalQueue', user?.email],
    queryFn: () => base44.entities.TemplateShare.filter({ shared_with_email: user.email }),
    enabled: !!user,
  });

  const filtered = shares.filter((s) => {
    const status = s.approval_status || 'pending';
    if (filter === 'all') return true;
    return status === filter;
  });

  const counts = {
    pending: shares.filter((s) => !s.approval_status || s.approval_status === 'pending').length,
    approved: shares.filter((s) => s.approval_status === 'approved').length,
    rejected: shares.filter((s) => s.approval_status === 'rejected').length,
    all: shares.length,
  };

  const FILTERS = [
    { key: 'pending', label: 'Pending', color: 'text-yellow-400' },
    { key: 'approved', label: 'Approved', color: 'text-green-400' },
    { key: 'rejected', label: 'Rejected', color: 'text-red-400' },
    { key: 'all', label: 'All', color: 'text-gray-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Content Approval Queue</h1>
          <p className="text-gray-500 text-sm mt-1">Review templates, collections, and brand voices shared with you</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {FILTERS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-3 rounded-xl border text-center transition-all ${
                filter === key
                  ? 'border-[#6366f1]/60 bg-[#6366f1]/10'
                  : 'border-gray-800 bg-[#111317] hover:border-gray-700'
              }`}
            >
              <p className={`text-xl font-bold ${color}`}>{counts[key]}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-gray-800 rounded-xl bg-[#111317]">
            <CheckCircle2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} items to review</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((share) => (
              <ReviewCard
                key={share.id}
                share={share}
                user={user}
                onReviewed={() => queryClient.invalidateQueries(['approvalQueue'])}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}