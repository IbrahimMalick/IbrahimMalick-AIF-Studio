import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tag, Shield, Eye, EyeOff, X, CheckSquare, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import AssetSendToSocialModal from '@/components/AssetSendToSocialModal';

export default function AssetBulkActionsBar({ selectedIds, selectedAssets = [], onClearSelection }) {
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  const count = selectedIds.length;

  const applyBulkUpdate = async (updateData) => {
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => base44.entities.Asset.update(id, updateData)));
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success(`Updated ${count} asset${count > 1 ? 's' : ''}`);
      onClearSelection();
    } catch (err) {
      toast.error('Bulk update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyTags = async () => {
    if (!tagInput.trim()) return;
    const newTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    // Fetch each asset and merge tags
    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const asset = await base44.entities.Asset.get(id);
          const merged = Array.from(new Set([...(asset.tags || []), ...newTags]));
          await base44.entities.Asset.update(id, { tags: merged });
        })
      );
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success(`Tags applied to ${count} asset${count > 1 ? 's' : ''}`);
      setTagInput('');
      onClearSelection();
    } catch (err) {
      toast.error('Tag update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="bg-[#1A1D23] border border-[#FF8C00]/50 rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#FF8C00]" />
            <span className="text-white font-semibold text-sm">{count} asset{count > 1 ? 's' : ''} selected</span>
          </div>
          <button onClick={onClearSelection} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Tags */}
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyTags()}
                placeholder="Add tags (comma separated)"
                className="pl-8 bg-[#0B0B0C] border-gray-700 text-white text-sm h-9 rounded-lg"
              />
            </div>
            <Button
              size="sm"
              onClick={applyTags}
              disabled={loading || !tagInput.trim()}
              className="bg-[#FF8C00] hover:bg-[#FF8C00]/80 text-white h-9 text-xs px-3"
            >
              Apply
            </Button>
          </div>

          {/* License Type */}
          <div className="flex gap-2 items-center">
            <Shield className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <Select value={licenseType} onValueChange={setLicenseType}>
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white text-sm h-9 w-36 rounded-lg">
                <SelectValue placeholder="License" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1D23] border-gray-700 text-white">
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => licenseType && applyBulkUpdate({ license_type: licenseType })}
              disabled={loading || !licenseType}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs px-3"
            >
              Set
            </Button>
          </div>

          {/* Publish Status */}
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              onClick={() => applyBulkUpdate({ is_published: true })}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white h-9 text-xs px-3 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Publish
            </Button>
            <Button
              size="sm"
              onClick={() => applyBulkUpdate({ is_published: false })}
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 text-white h-9 text-xs px-3 flex items-center gap-1"
            >
              <EyeOff className="w-3.5 h-3.5" /> Unpublish
            </Button>
          </div>

          {/* Send to Social */}
          <Button
            size="sm"
            onClick={() => setShowSocialModal(true)}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white h-9 text-xs px-3 flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" /> Send to Social
          </Button>

          {loading && <Loader2 className="w-4 h-4 text-[#FF8C00] animate-spin" />}
        </div>
      </div>
      {showSocialModal && (
        <AssetSendToSocialModal
          selectedAssets={selectedAssets}
          onClose={() => setShowSocialModal(false)}
        />
      )}
    </div>
  );
}