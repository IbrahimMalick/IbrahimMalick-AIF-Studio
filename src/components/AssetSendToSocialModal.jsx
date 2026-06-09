import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Send, Loader2, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORM_COLORS = {
  instagram: 'bg-pink-500',
  facebook_page: 'bg-blue-600',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-pink-400',
  youtube: 'bg-red-500',
  netflix: 'bg-red-700',
  disney_plus: 'bg-blue-900',
  max_hbo: 'bg-blue-800',
  amazon_prime: 'bg-cyan-600',
  paramount_plus: 'bg-blue-600',
};

export default function AssetSendToSocialModal({ selectedAssets, onClose }) {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState(new Set());
  const [scheduleDate, setScheduleDate] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const accounts = await base44.entities.SocialMediaAccount.filter({
        user_email: user.email,
        is_connected: true,
      });
      setConnectedAccounts(accounts);
      setLoading(false);
    };
    load();
  }, []);

  const toggle = (id) => {
    setSelectedAccountIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedAccountIds.size === connectedAccounts.length) {
      setSelectedAccountIds(new Set());
    } else {
      setSelectedAccountIds(new Set(connectedAccounts.map(a => a.id)));
    }
  };

  const handleSend = async () => {
    if (selectedAccountIds.size === 0) {
      toast.error('Select at least one account.');
      return;
    }
    setSending(true);
    const user = await base44.auth.me();
    const chosen = connectedAccounts.filter(a => selectedAccountIds.has(a.id));
    const status = scheduleDate ? 'scheduled' : 'published';

    try {
      for (const asset of selectedAssets) {
        for (const acct of chosen) {
          await base44.entities.ScheduledPost.create({
            user_email: user.email,
            platform: acct.platform,
            account_id: acct.id,
            account_name: acct.platform_username || acct.account_name,
            content: caption || asset.title || '',
            media_url: asset.file_url || null,
            status,
            scheduled_date: scheduleDate || null,
            created_date: new Date().toISOString(),
          });
        }
      }
      toast.success(`${selectedAssets.length} asset${selectedAssets.length > 1 ? 's' : ''} sent to ${chosen.length} account${chosen.length > 1 ? 's' : ''}!`);
      onClose();
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // Group accounts by platform
  const byPlatform = connectedAccounts.reduce((acc, acct) => {
    (acc[acct.platform] = acc[acct.platform] || []).push(acct);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1A1D23] border border-gray-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-white">Send to Social</h2>
            <p className="text-xs text-gray-400 mt-0.5">{selectedAssets.length} asset{selectedAssets.length > 1 ? 's' : ''} selected</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Caption */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Caption (optional)</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write a caption for these posts..."
              className="w-full bg-[#0B0B0C] border border-gray-700 text-white text-sm rounded-xl p-3 min-h-[80px] resize-none focus:outline-none focus:border-[#FF8C00]"
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Schedule Date (optional — leave blank to post now)</label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              className="bg-[#0B0B0C] border border-gray-700 text-white text-sm rounded-xl px-3 h-9 focus:outline-none focus:border-[#FF8C00]"
            />
          </div>

          {/* Account selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Select Accounts</label>
              {connectedAccounts.length > 0 && (
                <button onClick={toggleAll} className="text-xs text-[#FF8C00] hover:text-[#FF8C00]/80">
                  {selectedAccountIds.size === connectedAccounts.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading accounts...
              </div>
            ) : connectedAccounts.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No connected social accounts. Connect platforms in the Social Media Hub first.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byPlatform).map(([platform, accts]) => (
                  <div key={platform} className="border border-gray-700 rounded-xl overflow-hidden">
                    <div className={`px-3 py-1.5 text-xs font-semibold text-white uppercase tracking-wider ${PLATFORM_COLORS[platform] || 'bg-gray-600'}`}>
                      {platform.replace('_', ' ')}
                    </div>
                    {accts.map(acct => (
                      <label key={acct.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                        selectedAccountIds.has(acct.id) ? 'bg-[#FF8C00]/10' : 'bg-[#0B0B0C] hover:bg-gray-800/60'
                      }`}>
                        {selectedAccountIds.has(acct.id)
                          ? <CheckSquare className="w-4 h-4 text-[#FF8C00] flex-shrink-0" />
                          : <Square className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                        <input type="checkbox" checked={selectedAccountIds.has(acct.id)} onChange={() => toggle(acct.id)} className="hidden" />
                        <span className="text-sm text-white flex-1">{acct.platform_username || acct.account_name}</span>
                        {acct.followers_count > 0 && (
                          <span className="text-xs text-gray-500">{acct.followers_count.toLocaleString()}</span>
                        )}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-700 flex gap-3">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300">Cancel</Button>
          <Button
            onClick={handleSend}
            disabled={sending || selectedAccountIds.size === 0 || loading}
            className="flex-1 bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {scheduleDate ? `Schedule to ${selectedAccountIds.size} Account${selectedAccountIds.size !== 1 ? 's' : ''}` : `Post to ${selectedAccountIds.size} Account${selectedAccountIds.size !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}