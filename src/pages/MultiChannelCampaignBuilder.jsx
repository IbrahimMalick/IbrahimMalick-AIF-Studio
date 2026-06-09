
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Workflow,
  Plus,
  Play,
  Save,
  Edit2,
  Trash2,
  Zap,
  TrendingUp,
  Copy,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";
import PermissionGate from "@/components/PermissionGate";
import CampaignFlowBuilder from "@/components/CampaignFlowBuilder";
import CampaignTriggerManager from "@/components/CampaignTriggerManager";

export default function MultiChannelCampaignBuilder() {
  const [user, setUser] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: campaigns = [] } = useQuery({
    queryKey: ["multiChannelCampaigns", user?.email],
    queryFn: () => base44.entities.MultiChannelCampaign.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: []
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["campaignExecutions"],
    queryFn: () => base44.entities.CampaignExecution.list("-created_date", 100),
    refetchInterval: 30000,
    initialData: []
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.MultiChannelCampaign.create(data),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries(["multiChannelCampaigns"]);
      setSelectedCampaign(campaign);
      setShowCreateForm(false);
      showToast("Campaign created! 🎯", "success");
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MultiChannelCampaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["multiChannelCampaigns"]);
      showToast("Campaign saved! ✅", "success");
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => base44.entities.MultiChannelCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["multiChannelCampaigns"]);
      setSelectedCampaign(null);
      showToast("Campaign deleted", "info");
    }
  });

  const [newCampaignForm, setNewCampaignForm] = useState({
    campaign_name: "",
    campaign_description: "",
    campaign_type: "nurture",
    trigger_config: {
      trigger_type: "manual",
      trigger_conditions: {},
      cooldown_days: 30
    },
    flow_nodes: []
  });

  const handleCreateCampaign = () => {
    createCampaignMutation.mutate({
      ...newCampaignForm,
      user_email: user.email,
      is_active: false,
      status: "draft"
    });
  };

  const handleSaveCampaign = () => {
    if (selectedCampaign) {
      updateCampaignMutation.mutate({
        id: selectedCampaign.id,
        data: selectedCampaign
      });
    }
  };

  const duplicateCampaign = async (campaign) => {
    const duplicate = {
      ...campaign,
      campaign_name: `${campaign.campaign_name} (Copy)`,
      user_email: user.email,
      status: "draft",
      is_active: false,
      execution_count: 0,
      active_executions: 0
    };
    delete duplicate.id;
    delete duplicate.created_date;
    delete duplicate.updated_date;

    createCampaignMutation.mutate(duplicate);
  };

  const activeCampaignExecutions = executions.filter(e => e.execution_status === 'running');

  return (
    <PermissionGate
      user={user}
      minimumRole="manager"
      showLockMessage={true}
      lockMessage="Only managers and admins can build campaigns"
    >
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Workflow className="w-8 h-8 text-[#FFD700]" />
                Multi-Channel Campaign Builder
              </h1>
              <p className="text-gray-400">
                Visual workflow builder for automated multi-touch outreach with A/B testing
              </p>
            </div>
            <div className="flex gap-2">
              {selectedCampaign && (
                <Button
                  onClick={handleSaveCampaign}
                  disabled={updateCampaignMutation.isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateCampaignMutation.isLoading ? "Saving..." : "Save Campaign"}
                </Button>
              )}
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <Workflow className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">{campaigns.length}</p>
                <p className="text-gray-500 text-xs">Total Campaigns</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <Play className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
                <p className="text-gray-500 text-xs">Active Campaigns</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <TrendingUp className="w-5 h-5 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activeCampaignExecutions.length}</p>
                <p className="text-gray-500 text-xs">Leads in Campaigns</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <BarChart3 className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {campaigns.reduce((sum, c) => sum + (c.conversion_count || 0), 0)}
                </p>
                <p className="text-gray-500 text-xs">Total Conversions</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="campaigns">
            <TabsList className="bg-[#111317] rounded-xl">
              <TabsTrigger value="campaigns">
                <Workflow className="w-4 h-4 mr-2" />
                Campaigns ({campaigns.length})
              </TabsTrigger>
              <TabsTrigger value="triggers">
                <Zap className="w-4 h-4 mr-2" />
                Triggers
              </TabsTrigger>
              <TabsTrigger value="executions">
                <Play className="w-4 h-4 mr-2" />
                Active Runs ({activeCampaignExecutions.length})
              </TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              {selectedCampaign ? (
                <div className="space-y-6">
                  
                  {/* Campaign Header */}
                  <Card className="bg-[#111317] border-gray-800 rounded-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white">{selectedCampaign.campaign_name}</CardTitle>
                          <p className="text-gray-400 text-sm mt-1">{selectedCampaign.campaign_description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={selectedCampaign.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                            {selectedCampaign.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCampaign(null)}
                            className="border-gray-700 text-white"
                          >
                            ← Back
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-3">
                        <div className="p-3 bg-[#0B0B0C] rounded text-center">
                          <p className="text-gray-500 text-xs">Executions</p>
                          <p className="text-white font-bold">{selectedCampaign.execution_count || 0}</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded text-center">
                          <p className="text-gray-500 text-xs">Active</p>
                          <p className="text-yellow-400 font-bold">{selectedCampaign.active_executions || 0}</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded text-center">
                          <p className="text-gray-500 text-xs">Conversions</p>
                          <p className="text-green-400 font-bold">{selectedCampaign.conversion_count || 0}</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded text-center">
                          <p className="text-gray-500 text-xs">Conv. Rate</p>
                          <p className="text-green-400 font-bold">
                            {selectedCampaign.conversion_rate ? `${selectedCampaign.conversion_rate.toFixed(1)}%` : '—'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Flow Builder */}
                  <Card className="bg-[#111317] border-gray-800 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-white">Campaign Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CampaignFlowBuilder
                        campaign={selectedCampaign}
                        onChange={(updated) => setSelectedCampaign(updated)}
                      />
                    </CardContent>
                  </Card>

                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="bg-[#111317] border-gray-800 rounded-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-sm">{campaign.campaign_name}</CardTitle>
                          <Badge className={
                            campaign.status === 'active' ? "bg-green-500/20 text-green-400" :
                            campaign.status === 'draft' ? "bg-gray-500/20 text-gray-400" :
                            "bg-blue-500/20 text-blue-400"
                          }>
                            {campaign.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        
                        <p className="text-gray-400 text-sm">{campaign.campaign_description}</p>

                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {campaign.flow_nodes?.length || 0} Steps
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {campaign.campaign_type}
                          </Badge>
                          {campaign.ab_testing_enabled && (
                            <Badge className="bg-pink-500/20 text-pink-400 text-xs">
                              🧪 A/B Testing
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <p className="text-gray-500">Runs</p>
                            <p className="text-white font-bold">{campaign.execution_count || 0}</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <p className="text-gray-500">Active</p>
                            <p className="text-yellow-400 font-bold">{campaign.active_executions || 0}</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <p className="text-gray-500">Conv.</p>
                            <p className="text-green-400 font-bold">{campaign.conversion_count || 0}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCampaign(campaign)}
                            className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit Flow
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateCampaign(campaign)}
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Delete "${campaign.campaign_name}"?`)) {
                                deleteCampaignMutation.mutate(campaign.id);
                              }
                            }}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                      </CardContent>
                    </Card>
                  ))}

                  {campaigns.length === 0 && (
                    <Card className="bg-[#111317] border-gray-800 rounded-xl md:col-span-2">
                      <CardContent className="p-12 text-center">
                        <Workflow className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-4">No campaigns created yet</p>
                        <p className="text-gray-500 text-sm mb-6">
                          Build multi-channel outreach campaigns with visual workflow builder
                        </p>
                        <Button
                          onClick={() => setShowCreateForm(true)}
                          className="bg-[#FFD700] text-black hover:bg-[#FFC700]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Campaign
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Triggers Tab */}
            <TabsContent value="triggers">
              {user && <CampaignTriggerManager user={user} campaigns={campaigns} />}
            </TabsContent>

            {/* Active Executions Tab */}
            <TabsContent value="executions">
              <div className="space-y-4">
                {activeCampaignExecutions.length === 0 ? (
                  <Card className="bg-[#111317] border-gray-800 rounded-xl">
                    <CardContent className="p-12 text-center">
                      <Play className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">No active campaign executions</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeCampaignExecutions.map((execution) => {
                    const campaign = campaigns.find(c => c.id === execution.campaign_id);
                    
                    return (
                      <Card key={execution.id} className="bg-[#111317] border-gray-800 rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-white font-semibold">{campaign?.campaign_name || 'Unknown Campaign'}</p>
                                <Badge className="bg-green-500/20 text-green-400 text-xs">
                                  Running
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-sm mb-3">
                                Lead: {execution.lead_id}
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                  <p className="text-gray-500">Step</p>
                                  <p className="text-white font-bold">
                                    {execution.nodes_completed?.length || 0} / {campaign?.flow_nodes?.length || 0}
                                  </p>
                                </div>
                                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                  <p className="text-gray-500">Engagement</p>
                                  <p className="text-yellow-400 font-bold">{execution.engagement_score || 0}/100</p>
                                </div>
                                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                  <p className="text-gray-500">Sent</p>
                                  <p className="text-white font-bold">{execution.total_messages_sent || 0}</p>
                                </div>
                                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                  <p className="text-gray-500">Replies</p>
                                  <p className="text-green-400 font-bold">{execution.total_responses_received || 0}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

          </Tabs>

          {/* Create Campaign Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-2xl w-full my-8">
                <CardHeader>
                  <CardTitle className="text-white">Create New Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div>
                    <Label className="text-gray-300">Campaign Name</Label>
                    <Input
                      value={newCampaignForm.campaign_name}
                      onChange={(e) => setNewCampaignForm({...newCampaignForm, campaign_name: e.target.value})}
                      placeholder="e.g., High-Intent Lead Nurture"
                      className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Description</Label>
                    <Textarea
                      value={newCampaignForm.campaign_description}
                      onChange={(e) => setNewCampaignForm({...newCampaignForm, campaign_description: e.target.value})}
                      placeholder="Describe what this campaign does..."
                      className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Campaign Type</Label>
                    <Select
                      value={newCampaignForm.campaign_type}
                      onValueChange={(value) => setNewCampaignForm({...newCampaignForm, campaign_type: value})}
                    >
                      <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="nurture">Lead Nurture</SelectItem>
                        <SelectItem value="re_engagement">Re-engagement</SelectItem>
                        <SelectItem value="win_back">Win-Back</SelectItem>
                        <SelectItem value="upsell">Upsell</SelectItem>
                        <SelectItem value="retention">Retention</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-800">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCampaign}
                      disabled={!newCampaignForm.campaign_name || createCampaignMutation.isLoading}
                      className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                    >
                      Create Campaign
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-blue-400 font-semibold mb-3">🎯 How Multi-Channel Campaigns Work</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1 font-semibold">1. Build Flow</p>
                  <p className="text-gray-300 text-xs">
                    Drag & drop SMS, email, calls, delays, conditions into visual workflow
                  </p>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1 font-semibold">2. Set Triggers</p>
                  <p className="text-gray-300 text-xs">
                    Auto-start campaigns when leads take actions (call, click link, score change)
                  </p>
                </div>
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <p className="text-gray-400 text-xs mb-1 font-semibold">3. A/B Test</p>
                  <p className="text-gray-300 text-xs">
                    Test messaging, timing, channels at any step - AI picks winner
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </PermissionGate>
  );
}
