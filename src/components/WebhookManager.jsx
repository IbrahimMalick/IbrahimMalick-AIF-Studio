import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Webhook, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function WebhookManager() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    event_types: [],
    secret: ''
  });
  
  const queryClient = useQueryClient();

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const response = await base44.entities.WebhookEndpoint.filter({
          user_email: user.email
        });
        return response || [];
      } catch {
        return [];
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.WebhookEndpoint.create({
        ...data,
        user_email: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowForm(false);
      setFormData({ url: '', event_types: [], secret: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (webhookId) => base44.entities.WebhookEndpoint.delete(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  const handleCreate = async () => {
    if (!formData.url || formData.event_types.length === 0) {
      alert('Please fill all fields');
      return;
    }
    createMutation.mutate({
      ...formData,
      secret: Math.random().toString(36).substring(2, 15)
    });
  };

  const eventTypeOptions = ['job.completed', 'job.failed', 'alert.fired', 'backup.completed', 'anomaly.detected'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Webhook className="w-5 h-5" />
          Webhooks
        </h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="outline"
          size="sm"
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Webhook
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#0B0B0C] border-cyan-500/30">
          <CardContent className="p-4 space-y-3">
            <input
              type="url"
              placeholder="Webhook URL"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full bg-black/50 border border-gray-700 text-white p-2 rounded text-sm"
            />
            
            <div>
              <p className="text-xs text-gray-400 mb-2">Subscribe to events:</p>
              <div className="flex flex-wrap gap-2">
                {eventTypeOptions.map(event => (
                  <label key={event} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.event_types.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, event_types: [...formData.event_types, event]});
                        } else {
                          setFormData({...formData, event_types: formData.event_types.filter(x => x !== event)});
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-400">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                Create
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading webhooks...</p>
      ) : webhooks.length === 0 ? (
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 text-sm">No webhooks configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook, idx) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`bg-[#0B0B0C] border-gray-800 ${webhook.is_active ? 'border-green-500/30' : 'border-red-500/30'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {webhook.is_active ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <code className="text-xs text-cyan-400 bg-black/50 px-2 py-1 rounded">
                          {webhook.url.substring(0, 50)}...
                        </code>
                        <Badge className={webhook.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {webhook.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.event_types.map(event => (
                          <Badge key={event} className="bg-purple-500/20 text-purple-400 text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>

                      {webhook.delivery_success_rate && (
                        <p className="text-xs text-gray-400">
                          Success rate: <span className="text-green-400">{webhook.delivery_success_rate.toFixed(1)}%</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteMutation.mutate(webhook.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 hover:bg-red-500/10 rounded text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}