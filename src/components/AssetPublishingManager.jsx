import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertCircle, Package, Tag, Zap, CheckSquare, Square } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function AssetPublishingManager() {
  const queryClient = useQueryClient();
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkPublishing, setBulkPublishing] = useState(false);
  const [newConfig, setNewConfig] = useState({
    config_name: '',
    asset_types: ['video'],
    destination_channels: ['library'],
    auto_publish_on_approval: true
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['publishing-configs'],
    queryFn: async () => await base44.entities.AssetPublishingConfig.list('-created_date', 50)
  });

  const { data: queue = [] } = useQuery({
    queryKey: ['approval-queue'],
    queryFn: async () => await base44.entities.AssetApprovalQueue.list('-created_date', 100),
    refetchInterval: 30000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AssetPublishingConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishing-configs'] });
      setNewConfig({
        config_name: '',
        asset_types: ['video'],
        destination_channels: ['library'],
        auto_publish_on_approval: true
      });
      setShowCreateConfig(false);
    }
  });

  const approveMutation = useMutation({
    mutationFn: (id) => base44.entities.AssetApprovalQueue.update(id, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-queue'] })
  });

  const pendingItems = queue.filter(q => q.status === 'pending');
  const allPendingSelected = pendingItems.length > 0 && pendingItems.every(i => selectedIds.has(i.id));

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map(i => i.id)));
    }
  };

  const handleBulkPublish = async () => {
    setBulkPublishing(true);
    const ids = [...selectedIds];
    await Promise.all(ids.map(id => base44.entities.AssetApprovalQueue.update(id, { status: 'approved' })));
    setSelectedIds(new Set());
    setBulkPublishing(false);
    queryClient.invalidateQueries({ queryKey: ['approval-queue'] });
  };

  const stats = {
    total: queue.length,
    pending: queue.filter(q => q.status === 'pending').length,
    approved: queue.filter(q => q.status === 'approved').length,
    published: queue.filter(q => q.status === 'published').length
  };

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: stats.total, color: 'text-cyan-400' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Approved', value: stats.approved, color: 'text-blue-400' },
          { label: 'Published', value: stats.published, color: 'text-green-400' }
        ].map((stat, idx) => (
          <Card key={idx} className="bg-[#0B0B0C] border-gray-800">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Publishing Configs */}
      <Card className="bg-[#0B0B0C] border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Publishing Configurations
          </CardTitle>
          <Button
            onClick={() => setShowCreateConfig(!showCreateConfig)}
            className="bg-cyan-600 hover:bg-cyan-700"
            size="sm"
          >
            + New Config
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreateConfig && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-800/50 rounded border border-cyan-500/30 space-y-3"
            >
              <Input
                placeholder="Config Name"
                value={newConfig.config_name}
                onChange={(e) => setNewConfig({...newConfig, config_name: e.target.value})}
                className="bg-slate-900 border-gray-700"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => createMutation.mutate(newConfig)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!newConfig.config_name || createMutation.isPending}
                >
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreateConfig(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {configs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No publishing configs</p>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <div key={config.id} className="p-3 bg-slate-800/30 rounded border border-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{config.config_name}</h4>
                    <Badge className="bg-green-500/20 text-green-400">
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Types: {config.asset_types?.join(', ')}</p>
                    <p>Channels: {config.destination_channels?.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Queue */}
      <Card className="bg-[#0B0B0C] border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Asset Approval Queue
          </CardTitle>
          {pendingItems.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {allPendingSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {allPendingSelected ? 'Deselect All' : 'Select All Pending'}
            </button>
          )}
        </CardHeader>
        <CardContent>
          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center justify-between"
            >
              <span className="text-cyan-400 text-sm font-semibold">
                {selectedIds.size} asset{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <Button
                onClick={handleBulkPublish}
                className="bg-green-600 hover:bg-green-700 h-8 text-sm"
                disabled={bulkPublishing}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {bulkPublishing ? 'Publishing...' : `Publish All (${selectedIds.size})`}
              </Button>
            </motion.div>
          )}

          {queue.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No assets in queue</p>
          ) : (
            <div className="space-y-3">
              {queue.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded border ${statusColors[item.status]}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      {item.status === 'pending' && (
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleSelect(item.id)}
                          className="mt-0.5 border-gray-600"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.asset_title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{item.asset_type} • {item.status}</p>
                      </div>
                    </div>
                    <Badge className={statusColors[item.status]}>
                      {item.status}
                    </Badge>
                  </div>

                  {item.auto_tags && item.auto_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.auto_tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} className="bg-gray-700 text-gray-300 text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {item.auto_tags.length > 3 && (
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          +{item.auto_tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {item.status === 'pending' && (
                    <Button
                      onClick={() => approveMutation.mutate(item.id)}
                      className="w-full bg-green-600 hover:bg-green-700 h-8 text-sm"
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Approve & Publish
                    </Button>
                  )}

                  {item.status === 'published' && (
                    <p className="text-xs text-green-400">✓ Published to: {item.channels_published_to?.join(', ')}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}