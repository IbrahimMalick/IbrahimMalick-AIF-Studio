import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, UserPlus, Trash2, Eye, Edit, CheckCircle2, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ShareContentModal
 * Props:
 *   user          – current user object
 *   resourceId    – ID of the item being shared
 *   resourceName  – display name
 *   shareType     – "template" | "collection" | "brand_voice"
 *   onClose       – callback to close the modal
 */
export default function ShareContentModal({ user, resourceId, resourceName, shareType, onClose }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ['templateShares', resourceId],
    queryFn: () => base44.entities.TemplateShare.filter({ resource_id: resourceId, owner_email: user.email }),
    enabled: !!resourceId && !!user,
  });

  const shareMutation = useMutation({
    mutationFn: () => base44.entities.TemplateShare.create({
      owner_email: user.email,
      shared_with_email: email.trim().toLowerCase(),
      share_type: shareType,
      resource_id: resourceId,
      resource_name: resourceName,
      permission,
      message: message.trim(),
      accepted: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['templateShares', resourceId]);
      setEmail('');
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ id, permission }) => base44.entities.TemplateShare.update(id, { permission }),
    onSuccess: () => queryClient.invalidateQueries(['templateShares', resourceId]),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.TemplateShare.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['templateShares', resourceId]),
  });

  const shareTypeLabel = shareType === 'brand_voice' ? 'Brand Voice' : shareType === 'collection' ? 'Collection' : 'Template';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#111317] border border-gray-700 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#00D4C9]" />
            <div>
              <h2 className="text-white font-semibold text-sm">Share {shareTypeLabel}</h2>
              <p className="text-gray-500 text-xs truncate max-w-[220px]">{resourceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Invite Form */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Invite team member by email</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && shareMutation.mutate()}
                placeholder="teammate@example.com"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl flex-1"
              />
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111317] border-gray-700 text-white">
                  <SelectItem value="view">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> View</span>
                  </SelectItem>
                  <SelectItem value="edit">
                    <span className="flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)"
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl text-sm"
            />
          </div>

          <Button
            onClick={() => shareMutation.mutate()}
            disabled={!email.trim() || shareMutation.isPending}
            className="w-full bg-[#00D4C9] text-black font-semibold rounded-xl hover:bg-[#00b8ad]"
          >
            {shareMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : success ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-700" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {success ? 'Invite Sent!' : 'Send Invite'}
          </Button>

          {/* Current shares */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              Shared with ({shares.length})
            </p>
            {isLoading ? (
              <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-500 mx-auto" /></div>
            ) : shares.length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-4">No one else has access yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between gap-2 p-2.5 bg-[#0B0B0C] rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{share.shared_with_email}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge className={`text-[10px] px-1.5 py-0 ${share.accepted ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                          {share.accepted ? '✓ Accepted' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    <Select
                      value={share.permission}
                      onValueChange={(v) => updatePermissionMutation.mutate({ id: share.id, permission: v })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg h-7 text-xs w-20 px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111317] border-gray-700 text-white">
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removeMutation.mutate(share.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500/60 hover:text-red-400 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}