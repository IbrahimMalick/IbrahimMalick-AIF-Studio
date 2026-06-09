import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Phone
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function CampaignTriggerManager({ user, campaigns }) {
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: triggers = [] } = useQuery({
    queryKey: ["campaignTriggers", user?.email],
    queryFn: () => base44.entities.CampaignTrigger.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: []
  });

  const createTriggerMutation = useMutation({
    mutationFn: (data) => base44.entities.CampaignTrigger.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["campaignTriggers"]);
      setShowForm(false);
      setEditingTrigger(null);
      showToast("Campaign trigger created! ⚡", "success");
    }
  });

  const updateTriggerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CampaignTrigger.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["campaignTriggers"]);
      setEditingTrigger(null);
      showToast("Trigger updated! ✅", "success");
    }
  });

  const deleteTriggerMutation = useMutation({
    mutationFn: (id) => base44.entities.CampaignTrigger.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["campaignTriggers"]);
      showToast("Trigger deleted", "info");
    }
  });

  const [formData, setFormData] = useState({
    trigger_name: "",
    campaign_id: "",
    event_type: "call_completed",
    event_filters: {},
    conditions: [],
    is_active: true,
    cooldown_period_days: 30
  });

  const eventTypeLabels = {
    call_completed: "📞 Call Completed",
    call_missed: "📞 Call Missed",
    sms_received: "💬 SMS Received",
    email_opened: "📧 Email Opened",
    email_clicked: "📧 Email Link Clicked",
    link_clicked: "🔗 Link Clicked",
    form_submitted: "📝 Form Submitted",
    appointment_booked: "📅 Appointment Booked",
    appointment_no_show: "❌ Appointment No-Show",
    lead_score_increased: "📈 Score Increased",
    lead_score_decreased: "📉 Score Decreased",
    tag_added: "🏷️ Tag Added",
    status_changed: "🔄 Status Changed",
    ghl_opportunity_created: "🎯 GHL Opportunity Created",
    ghl_stage_changed: "🔄 GHL Stage Changed",
    inactivity_detected: "⏰ Inactivity Detected",
    high_engagement_detected: "🔥 High Engagement",
    objection_detected: "⚠️ Objection Detected",
    buying_signal_detected: "💰 Buying Signal"
  };

  const handleSubmit = () => {
    if (editingTrigger) {
      updateTriggerMutation.mutate({
        id: editingTrigger.id,
        data: { ...formData, user_email: user.email }
      });
    } else {
      createTriggerMutation.mutate({ ...formData, user_email: user.email });
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Campaign Triggers
          </h3>
          <p className="text-gray-400 text-sm">Automatically start campaigns based on lead actions</p>
        </div>
        <Button
          onClick={() => {
            setEditingTrigger(null);
            setFormData({
              trigger_name: "",
              campaign_id: "",
              event_type: "call_completed",
              event_filters: {},
              conditions: [],
              is_active: true,
              cooldown_period_days: 30
            });
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Trigger
        </Button>
      </div>

      {/* Triggers List */}
      <div className="grid md:grid-cols-2 gap-4">
        {triggers.map((trigger) => {
          const campaign = campaigns.find(c => c.id === trigger.campaign_id);
          
          return (
            <Card key={trigger.id} className="bg-[#111317] border-gray-800 rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    {trigger.is_active ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-500" />
                    )}
                    {trigger.trigger_name}
                  </CardTitle>
                  <Badge className={trigger.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                    {trigger.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">When:</p>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {eventTypeLabels[trigger.event_type] || trigger.event_type}
                  </Badge>
                </div>

                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Starts Campaign:</p>
                  <p className="text-white">{campaign?.campaign_name || 'Unknown'}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                    <p className="text-gray-500">Triggered</p>
                    <p className="text-white font-bold">{trigger.trigger_count || 0}</p>
                  </div>
                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                    <p className="text-gray-500">Success</p>
                    <p className="text-green-400 font-bold">{trigger.success_count || 0}</p>
                  </div>
                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                    <p className="text-gray-500">Cooldown</p>
                    <p className="text-white font-bold">{trigger.cooldown_period_days}d</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTrigger(trigger);
                      setFormData(trigger);
                      setShowForm(true);
                    }}
                    className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Delete trigger "${trigger.trigger_name}"?`)) {
                        deleteTriggerMutation.mutate(trigger.id);
                      }
                    }}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      {triggers.length === 0 && (
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 mb-2">No campaign triggers configured</p>
            <p className="text-gray-500 text-sm">
              Create triggers to automatically start campaigns based on lead behavior
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-2xl w-full my-8">
            <CardHeader>
              <CardTitle className="text-white">
                {editingTrigger ? 'Edit Trigger' : 'Create Campaign Trigger'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <Label className="text-gray-300">Trigger Name</Label>
                <Input
                  value={formData.trigger_name}
                  onChange={(e) => setFormData({...formData, trigger_name: e.target.value})}
                  placeholder="e.g., High-Score Call Follow-Up"
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Start Campaign</Label>
                <Select
                  value={formData.campaign_id}
                  onValueChange={(value) => setFormData({...formData, campaign_id: value})}
                >
                  <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.campaign_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Trigger Event</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({...formData, event_type: value})}
                >
                  <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Cooldown Period (Days)</Label>
                <Input
                  type="number"
                  value={formData.cooldown_period_days}
                  onChange={(e) => setFormData({...formData, cooldown_period_days: parseInt(e.target.value)})}
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                  min="0"
                />
                <p className="text-gray-600 text-xs mt-1">
                  Prevent re-triggering for same lead within this period
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
                <div>
                  <Label className="text-gray-300">Trigger Active</Label>
                  <p className="text-gray-500 text-sm mt-1">Enable/disable this trigger</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTrigger(null);
                  }}
                  className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.trigger_name || !formData.campaign_id || createTriggerMutation.isLoading}
                  className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                >
                  {editingTrigger ? 'Update Trigger' : 'Create Trigger'}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}