import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Calendar,
  MessageSquare,
  Mail,
  Phone
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function NurtureRulesManager({ user }) {
  const [editingRule, setEditingRule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeRuleTab, setActiveRuleTab] = useState("rules");
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ["nurtureRules", user?.email],
    queryFn: async () => {
      const allRules = await base44.entities.NurtureRule.filter({
        user_email: user.email
      });
      return allRules;
    },
    enabled: !!user,
    initialData: []
  });

  const { data: abTests = [] } = useQuery({
    queryKey: ["nurtureABTests", user?.email],
    queryFn: async () => {
      const allTests = await base44.entities.NurtureSequenceABTest.list('-created_date', 50);
      return allTests;
    },
    enabled: !!user,
    initialData: []
  });

  const createRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.NurtureRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurtureRules"]);
      setShowForm(false);
      setEditingRule(null);
      showToast("Nurture rule created! 🎯", "success");
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NurtureRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurtureRules"]);
      setEditingRule(null);
      showToast("Rule updated! ✅", "success");
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.NurtureRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurtureRules"]);
      showToast("Rule deleted", "info");
    }
  });

  const createABTestMutation = useMutation({
    mutationFn: (data) => base44.entities.NurtureSequenceABTest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurtureABTests"]);
      showToast("A/B test created! 🧪", "success");
    }
  });

  const [formData, setFormData] = useState({
    rule_name: "",
    trigger_conditions: {
      lead_status: ["new", "contacted"],
      score_min: 40,
      score_max: 69,
      days_since_last_contact: 2
    },
    sequence_config: {
      sequence_type: "sms_email_combo",
      touchpoints: [
        { day: 0, channel: "sms", message: "Hi {{name}}! Thanks for your interest in {{company}}. Quick question - what's the best time to chat?" },
        { day: 2, channel: "email", subject: "Following up on our conversation", message: "Hey {{name}}, wanted to follow up..." },
        { day: 5, channel: "sms", message: "Still interested in {{use_case}}? Let me know!" },
        { day: 10, channel: "email", subject: "Last check-in", message: "Final follow-up..." }
      ],
      duration_days: 14,
      stop_on_reply: true
    },
    exit_conditions: {
      auto_qualify_score: 80,
      auto_lost_after_days: 30
    },
    callback_config: {
      enabled: false,
      callback_delay_days: 3,
      callback_duration_minutes: 15
    },
    ghl_integration: {
      sync_to_ghl: true,
      ghl_workflow_id: "",
      ghl_pipeline_stage_id: "",
      ghl_tags_to_add: []
    }
  });

  const createABTest = async (ruleId) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    await createABTestMutation.mutate({
      nurture_rule_id: ruleId,
      test_name: `${rule.rule_name} - Messaging Test`,
      hypothesis: "Different messaging approach will improve response rate",
      test_type: "messaging",
      variants: [
        {
          variant_id: "control",
          variant_name: "Control (Current)",
          sequence_config: rule.sequence_config,
          leads_assigned: 0,
          sequences_started: 0,
          metrics: {}
        },
        {
          variant_id: "variant_b",
          variant_name: "Variant B (More Personal)",
          sequence_config: {
            ...rule.sequence_config,
            touchpoints: rule.sequence_config.touchpoints.map(t => ({
              ...t,
              message: t.message?.replace(/Quick question/g, "Personal question")
                                 .replace(/Thanks for your interest/g, "Really appreciate you checking us out")
            }))
          },
          leads_assigned: 0,
          sequences_started: 0,
          metrics: {}
        }
      ],
      status: "running",
      traffic_split: {
        variant_a_percent: 50,
        variant_b_percent: 50
      },
      target_sample_size: 50,
      confidence_level: 95,
      auto_winner_enabled: true,
      started_at: new Date().toISOString()
    });
  };

  const handleSubmit = () => {
    if (editingRule) {
      updateRuleMutation.mutate({
        id: editingRule.id,
        data: { ...formData, user_email: user.email }
      });
    } else {
      createRuleMutation.mutate({ ...formData, user_email: user.email });
    }
  };

  return (
    <div className="space-y-6">
      
      <Tabs value={activeRuleTab} onValueChange={setActiveRuleTab}>
        <TabsList className="bg-[#111317] rounded-xl">
          <TabsTrigger value="rules">
            <Zap className="w-4 h-4 mr-2" />
            Nurture Rules
          </TabsTrigger>
          <TabsTrigger value="abtests">
            🧪 A/B Tests ({abTests.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            📊 Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Nurture Rules
                </h3>
                <p className="text-gray-400 text-sm">Auto-trigger sequences when leads match conditions</p>
              </div>
              <Button
                onClick={() => {
                  setEditingRule(null);
                  setFormData({
                    rule_name: "",
                    trigger_conditions: {
                      lead_status: ["new", "contacted"],
                      score_min: 40,
                      score_max: 69,
                      days_since_last_contact: 2
                    },
                    sequence_config: {
                      sequence_type: "sms_email_combo",
                      touchpoints: [
                        { day: 0, channel: "sms", message: "Hi {{name}}! Thanks for your interest. What's the best time to chat?" }
                      ],
                      duration_days: 14,
                      stop_on_reply: true
                    },
                    exit_conditions: {
                      auto_qualify_score: 80,
                      auto_lost_after_days: 30
                    },
                    callback_config: {
                      enabled: false,
                      callback_delay_days: 3,
                      callback_duration_minutes: 15
                    },
                    ghl_integration: {
                      sync_to_ghl: true,
                      ghl_workflow_id: "",
                      ghl_pipeline_stage_id: "",
                      ghl_tags_to_add: []
                    }
                  });
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>

            {rules.length === 0 ? (
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-12 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400 mb-2">No nurture rules configured</p>
                  <p className="text-gray-500 text-sm">
                    Create rules to automatically nurture leads based on their behavior
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className="bg-[#111317] border-gray-800 rounded-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          {rule.is_active ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
                          )}
                          {rule.rule_name}
                        </CardTitle>
                        <Badge className={rule.is_active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                          {rule.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      
                      <div className="text-sm">
                        <p className="text-gray-500 mb-1">Triggers when:</p>
                        <div className="flex gap-2 flex-wrap">
                          {rule.trigger_conditions.lead_status?.map(status => (
                            <Badge key={status} className="bg-blue-500/20 text-blue-400 text-xs">
                              {status}
                            </Badge>
                          ))}
                          {rule.trigger_conditions.score_min && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              Score {rule.trigger_conditions.score_min}-{rule.trigger_conditions.score_max}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-500 mb-1">Sequence:</p>
                        <Badge className="bg-teal-500/20 text-teal-400">
                          {rule.sequence_config?.touchpoints?.length || 0} touchpoints over {rule.sequence_config?.duration_days || 0} days
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-[#0B0B0C] rounded text-center">
                          <p className="text-gray-500">Triggered</p>
                          <p className="text-white font-bold">{rule.execution_count || 0}</p>
                        </div>
                        <div className="p-2 bg-[#0B0B0C] rounded text-center">
                          <p className="text-gray-500">Active</p>
                          <p className="text-yellow-400 font-bold">{rule.active_leads_count || 0}</p>
                        </div>
                        <div className="p-2 bg-[#0B0B0C] rounded text-center">
                          <p className="text-gray-500">Success</p>
                          <p className="text-green-400 font-bold">
                            {rule.success_rate ? `${rule.success_rate.toFixed(0)}%` : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingRule(rule);
                            setFormData(rule);
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
                          onClick={() => createABTest(rule.id)}
                          className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                        >
                          🧪 A/B Test
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Delete rule "${rule.rule_name}"?`)) {
                              deleteRuleMutation.mutate(rule.id);
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
              </div>
            )}

            {/* Create/Edit Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-3xl w-full my-8">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {editingRule ? 'Edit Nurture Rule' : 'Create Nurture Rule'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    <div>
                      <Label className="text-gray-300">Rule Name</Label>
                      <Input
                        value={formData.rule_name}
                        onChange={(e) => setFormData({...formData, rule_name: e.target.value})}
                        placeholder="e.g., Mid-Score Follow-Up"
                        className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Minimum Score</Label>
                        <Input
                          type="number"
                          value={formData.trigger_conditions?.score_min || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            trigger_conditions: {
                              ...formData.trigger_conditions,
                              score_min: parseInt(e.target.value) || 0
                            }
                          })}
                          className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Maximum Score</Label>
                        <Input
                          type="number"
                          value={formData.trigger_conditions?.score_max || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            trigger_conditions: {
                              ...formData.trigger_conditions,
                              score_max: parseInt(e.target.value) || 100
                            }
                          })}
                          className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300">Sequence Type</Label>
                      <Select
                        value={formData.sequence_config?.sequence_type}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          sequence_config: {
                            ...formData.sequence_config,
                            sequence_type: value
                          }
                        })}
                      >
                        <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sms_only">SMS Only</SelectItem>
                          <SelectItem value="email_only">Email Only</SelectItem>
                          <SelectItem value="sms_email_combo">SMS + Email Combo</SelectItem>
                          <SelectItem value="multi_channel">Multi-Channel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-purple-400">Schedule Callback</Label>
                        <Switch
                          checked={formData.callback_config?.enabled || false}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            callback_config: {
                              ...formData.callback_config,
                              enabled: checked
                            }
                          })}
                        />
                      </div>
                      {formData.callback_config?.enabled && (
                        <div>
                          <Label className="text-gray-300 text-xs">Delay (Days)</Label>
                          <Input
                            type="number"
                            value={formData.callback_config?.callback_delay_days || 3}
                            onChange={(e) => setFormData({
                              ...formData,
                              callback_config: {
                                ...formData.callback_config,
                                callback_delay_days: parseInt(e.target.value) || 3
                              }
                            })}
                            className="mt-1 bg-[#0B0B0C] border-gray-700 text-white"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-teal-400 font-semibold">GoHighLevel Integration</Label>
                          <p className="text-gray-400 text-xs mt-1">
                            Auto-sync qualified leads to GHL
                          </p>
                        </div>
                        <Switch
                          checked={formData.ghl_integration?.sync_to_ghl || false}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            ghl_integration: {
                              ...formData.ghl_integration,
                              sync_to_ghl: checked
                            }
                          })}
                        />
                      </div>

                      {formData.ghl_integration?.sync_to_ghl && (
                        <>
                          <div>
                            <Label className="text-gray-300 text-xs">GHL Workflow ID (Optional)</Label>
                            <Input
                              value={formData.ghl_integration?.ghl_workflow_id || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                ghl_integration: {
                                  ...formData.ghl_integration,
                                  ghl_workflow_id: e.target.value
                                }
                              })}
                              placeholder="workflow_abc123"
                              className="mt-1 bg-[#0B0B0C] border-gray-700 text-white text-sm"
                            />
                            <p className="text-gray-500 text-xs mt-1">
                              Trigger this workflow when lead qualifies
                            </p>
                          </div>

                          <div>
                            <Label className="text-gray-300 text-xs">GHL Pipeline Stage ID (Optional)</Label>
                            <Input
                              value={formData.ghl_integration?.ghl_pipeline_stage_id || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                ghl_integration: {
                                  ...formData.ghl_integration,
                                  ghl_pipeline_stage_id: e.target.value
                                }
                              })}
                              placeholder="stage_xyz789"
                              className="mt-1 bg-[#0B0B0C] border-gray-700 text-white text-sm"
                            />
                            <p className="text-gray-500 text-xs mt-1">
                              Move opportunity to this stage
                            </p>
                          </div>

                          <div>
                            <Label className="text-gray-300 text-xs mb-2 block">GHL Tags to Apply</Label>
                            <div className="flex gap-2 flex-wrap mb-2">
                              {(formData.ghl_integration?.ghl_tags_to_add || []).map((tag, idx) => (
                                <Badge key={idx} className="bg-teal-500/20 text-teal-400">
                                  {tag}
                                  <button
                                    onClick={() => {
                                      const newTags = (formData.ghl_integration?.ghl_tags_to_add || []).filter((_, i) => i !== idx);
                                      setFormData({
                                        ...formData,
                                        ghl_integration: {
                                          ...formData.ghl_integration,
                                          ghl_tags_to_add: newTags
                                        }
                                      });
                                    }}
                                    className="ml-1 hover:text-red-400"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newTag = prompt("Enter GHL tag:");
                                if (newTag) {
                                  setFormData({
                                    ...formData,
                                    ghl_integration: {
                                      ...formData.ghl_integration,
                                      ghl_tags_to_add: [
                                        ...(formData.ghl_integration?.ghl_tags_to_add || []),
                                        newTag
                                      ]
                                    }
                                  });
                                }
                              }}
                              className="border-gray-700 text-white text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add GHL Tag
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-800">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          setEditingRule(null);
                        }}
                        className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!formData.rule_name || createRuleMutation.isLoading}
                        className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                      >
                        {editingRule ? 'Update Rule' : 'Create Rule'}
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </TabsContent>

        <TabsContent value="abtests">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-lg">🧪 Active A/B Tests</h3>
                <p className="text-gray-400 text-sm">Optimize sequences with data-driven testing</p>
              </div>
            </div>

            {abTests.length === 0 ? (
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400 mb-2">No A/B tests running</p>
                  <p className="text-gray-500 text-sm">
                    Create A/B tests from nurture rules to optimize conversion
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {abTests.map((test) => {
                  const variantA = test.variants[0];
                  const variantB = test.variants[1];

                  return (
                    <Card key={test.id} className="bg-[#111317] border-gray-800 rounded-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-sm">{test.test_name}</CardTitle>
                          <Badge className={
                            test.status === 'running' ? "bg-green-500/20 text-green-400" :
                            test.status === 'completed' ? "bg-blue-500/20 text-blue-400" :
                            "bg-gray-500/20 text-gray-400"
                          }>
                            {test.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">{test.hypothesis}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          {test.variants.slice(0, 2).map((variant) => (
                            <div key={variant.variant_id} className={`p-4 rounded-lg border-2 ${
                              variant.variant_id === test.winning_variant 
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-gray-700 bg-[#0B0B0C]'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-white font-semibold">{variant.variant_name}</p>
                                {variant.variant_id === test.winning_variant && (
                                  <Badge className="bg-green-500/20 text-green-400">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Winner
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div className="p-2 bg-[#111317] rounded">
                                  <p className="text-gray-500">Leads</p>
                                  <p className="text-white font-bold">{variant.leads_assigned || 0}</p>
                                </div>
                                <div className="p-2 bg-[#111317] rounded">
                                  <p className="text-gray-500">Response</p>
                                  <p className="text-green-400 font-bold">
                                    {variant.metrics?.response_rate ? `${Math.round(variant.metrics.response_rate * 100)}%` : '—'}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Open Rate:</span>
                                  <span className="text-white">{variant.metrics?.open_rate ? `${Math.round(variant.metrics.open_rate * 100)}%` : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Click Rate:</span>
                                  <span className="text-white">{variant.metrics?.click_rate ? `${Math.round(variant.metrics.click_rate * 100)}%` : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Qualified:</span>
                                  <span className="text-green-400">{variant.leads_qualified || 0}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {test.statistical_significance && (
                          <div className={`p-3 rounded-lg border ${
                            test.statistical_significance < 0.05 
                              ? 'border-green-500/30 bg-green-500/10'
                              : 'border-yellow-500/30 bg-yellow-500/10'
                          }`}>
                            <p className={`text-sm font-semibold mb-1 ${
                              test.statistical_significance < 0.05 ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {test.statistical_significance < 0.05 
                                ? '✅ Statistically Significant'
                                : '⏳ Not Yet Significant'
                              }
                            </p>
                            <p className="text-gray-300 text-xs">
                              p-value: {test.statistical_significance?.toFixed(4) || '—'}
                              {test.lift_percentage && ` • Lift: +${test.lift_percentage}%`}
                            </p>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-[#111317] border-gray-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white">Nurture Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">Performance analytics coming soon</p>
                <p className="text-gray-500 text-sm mt-1">
                  Track response rates, conversion metrics, and ROI across all sequences
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

    </div>
  );
}