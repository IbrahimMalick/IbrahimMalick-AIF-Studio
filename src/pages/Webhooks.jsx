import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Webhook,
  Plus,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Zap,
  Copy,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Webhooks() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showZapierGuide, setShowZapierGuide] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: ["video_completed", "art_generated", "research_completed"]
  });
  const [zapierFormData, setZapierFormData] = useState({
    trigger_name: "",
    trigger_event: "video_completed",
    zapier_webhook_url: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: webhooks = [] } = useQuery({
    queryKey: ["webhooks", user?.email],
    queryFn: () => base44.entities.WebhookEndpoint.filter({
      user_email: user.email
    }),
    enabled: !!user?.email,
  });

  const { data: zapierTriggers = [] } = useQuery({
    queryKey: ["zapierTriggers", user?.email],
    queryFn: () => base44.entities.ZapierTrigger.filter({
      user_email: user.email
    }),
    enabled: !!user?.email,
  });

  const { data: webhookLogs = [] } = useQuery({
    queryKey: ["webhookLogs"],
    queryFn: () => base44.entities.WebhookLog.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WebhookEndpoint.create({
      ...data,
      user_email: user.email,
      secret_key: `whsec_${Math.random().toString(36).substring(2, 15)}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["webhooks"]);
      setShowCreateForm(false);
      setFormData({ name: "", url: "", events: ["video_completed", "art_generated", "research_completed"] });
    },
  });

  const createZapierMutation = useMutation({
    mutationFn: (data) => base44.entities.ZapierTrigger.create({
      ...data,
      user_email: user.email,
      is_active: true,
      trigger_count: 0,
      success_count: 0,
      failure_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["zapierTriggers"]);
      setShowZapierGuide(false);
      setZapierFormData({ trigger_name: "", trigger_event: "video_completed", zapier_webhook_url: "" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.WebhookEndpoint.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(["webhooks"]);
    },
  });

  const toggleZapierMutation = useMutation({
    mutationFn: ({ id, is_active }) => 
      base44.entities.ZapierTrigger.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(["zapierTriggers"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WebhookEndpoint.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["webhooks"]);
    },
  });

  const deleteZapierMutation = useMutation({
    mutationFn: (id) => base44.entities.ZapierTrigger.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["zapierTriggers"]);
    },
  });

  const testWebhook = async (webhook) => {
    alert(`Testing webhook: ${webhook.name}\n\nIn production, this would send a test event to ${webhook.url}`);
  };

  const testZapierTrigger = async (trigger) => {
    alert(`Testing Zapier trigger: ${trigger.trigger_name}\n\nIn production, this would send a test payload to your Zap.`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const availableEvents = [
    { value: "video_completed", label: "Video Render Completed", color: "from-[#FF4433] to-[#FF8C00]", description: "Fires when a video finishes rendering" },
    { value: "video_failed", label: "Video Render Failed", color: "from-red-500 to-red-600", description: "Fires when a video render fails" },
    { value: "art_generated", label: "AI Art Generated", color: "from-[#FF8C00] to-[#A89C94]", description: "Fires when AI generates new artwork" },
    { value: "research_completed", label: "Research Analysis Complete", color: "from-[#A89C94] to-[#1E90FF]", description: "Fires when document analysis finishes" },
    { value: "post_published", label: "Social Post Published", color: "from-[#1E90FF] to-[#00D4C9]", description: "Fires when content is posted to social media" },
    { value: "lead_captured", label: "New Lead Captured", color: "from-[#00D4C9] to-[#00FF88]", description: "Fires when a new lead is added" },
    { value: "budget_exceeded", label: "Budget Limit Reached", color: "from-yellow-500 to-orange-500", description: "Fires when spending hits limit" },
    { value: "new_subscriber", label: "New Email Subscriber", color: "from-[#00FF88] to-[#FFD700]", description: "Fires when someone joins email list" },
  ];

  const zapierWorkflows = [
    {
      title: "Video → Email Sequence",
      description: "Send email with video link when render completes",
      steps: ["Video completes", "Trigger Zapier", "Send via Mailchimp/AWeber"]
    },
    {
      title: "Art → Social Post",
      description: "Auto-post generated art to Instagram",
      steps: ["Art generated", "Trigger Zapier", "Post to Instagram"]
    },
    {
      title: "Lead → CRM Sync",
      description: "Add new leads to your CRM automatically",
      steps: ["Lead captured", "Trigger Zapier", "Create contact in HubSpot"]
    },
    {
      title: "Budget Alert → Slack",
      description: "Get notified in Slack when budget hits limit",
      steps: ["Budget exceeded", "Trigger Zapier", "Send Slack message"]
    }
  ];

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      alert("Please fill in all fields");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleCreateZapier = () => {
    if (!zapierFormData.trigger_name.trim() || !zapierFormData.zapier_webhook_url.trim()) {
      alert("Please fill in all fields");
      return;
    }
    createZapierMutation.mutate(zapierFormData);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Webhooks & Zapier</h1>
            <p className="text-gray-400">Automate workflows and connect to 5,000+ apps</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Webhook
          </Button>
        </div>

        {/* Zapier Hero Banner */}
        <Card className="bg-gradient-to-r from-[#FF4433]/10 to-[#1E90FF]/10 border-[#FF8C00] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF4433] to-[#FF8C00] flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">Connect to Zapier</h2>
                <p className="text-gray-300">Automate workflows with 5,000+ apps. No code required.</p>
              </div>
              <Button
                onClick={() => setShowZapierGuide(true)}
                className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-black font-semibold rounded-xl"
              >
                <Zap className="w-4 h-4 mr-2" />
                Setup Zapier
              </Button>
            </div>
            
            <div className="grid md:grid-cols-4 gap-3">
              {zapierWorkflows.map((workflow, idx) => (
                <div key={idx} className="p-3 bg-[#0B0B0C]/50 rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold text-sm mb-1">{workflow.title}</h4>
                  <p className="text-gray-400 text-xs mb-2">{workflow.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {workflow.steps.map((step, i) => (
                      <React.Fragment key={i}>
                        <span>{step}</span>
                        {i < workflow.steps.length - 1 && <span>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="zapier">
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="zapier">
              <Zap className="w-4 h-4 mr-2" />
              Zapier Triggers
            </TabsTrigger>
            <TabsTrigger value="endpoints">
              <Webhook className="w-4 h-4 mr-2" />
              Custom Webhooks
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Clock className="w-4 h-4 mr-2" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="docs">
              <Code className="w-4 h-4 mr-2" />
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* ZAPIER TRIGGERS TAB */}
          <TabsContent value="zapier">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {zapierTriggers.length > 0 ? (
                  <div className="space-y-4">
                    {zapierTriggers.map((trigger) => {
                      const eventConfig = availableEvents.find(e => e.value === trigger.trigger_event);
                      
                      return (
                        <div
                          key={trigger.id}
                          className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 hover:border-[#FF8C00] transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-[#FF8C00]" />
                                <h3 className="text-white font-semibold">{trigger.trigger_name}</h3>
                                <Badge className={trigger.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                  {trigger.is_active ? 'Active' : 'Paused'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className={`bg-gradient-to-r ${eventConfig?.color} text-white text-xs`}>
                                  {eventConfig?.label || trigger.trigger_event}
                                </Badge>
                                <span className="text-gray-500 text-xs">{eventConfig?.description}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <code className="text-xs bg-[#111317] px-3 py-1 rounded text-gray-400 flex-1">
                                  {trigger.zapier_webhook_url.substring(0, 60)}...
                                </code>
                                <Button
                                  onClick={() => copyToClipboard(trigger.zapier_webhook_url)}
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-lg"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => toggleZapierMutation.mutate({ id: trigger.id, is_active: !trigger.is_active })}
                                variant="outline"
                                size="icon"
                                className="rounded-lg border-gray-700"
                              >
                                {trigger.is_active ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                onClick={() => testZapierTrigger(trigger)}
                                variant="outline"
                                size="icon"
                                className="rounded-lg border-gray-700"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  if (confirm(`Delete trigger "${trigger.trigger_name}"?`)) {
                                    deleteZapierMutation.mutate(trigger.id);
                                  }
                                }}
                                variant="outline"
                                size="icon"
                                className="rounded-lg border-red-500 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-800">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Total Triggers</p>
                              <p className="text-white font-medium">{trigger.trigger_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Success Rate</p>
                              <p className="text-white font-medium">
                                {trigger.trigger_count > 0
                                  ? Math.round((trigger.success_count / trigger.trigger_count) * 100)
                                  : 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Last Triggered</p>
                              <p className="text-white font-medium text-sm">
                                {trigger.last_triggered
                                  ? new Date(trigger.last_triggered).toLocaleDateString()
                                  : 'Never'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FFD700] flex items-center justify-center mb-4">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">No Zapier Triggers Yet</h3>
                    <p className="text-gray-400 mb-6">Connect your first Zap to automate workflows</p>
                    <Button
                      onClick={() => setShowZapierGuide(true)}
                      className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-black font-semibold rounded-xl"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Setup Zapier Integration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CUSTOM WEBHOOKS TAB */}
          <TabsContent value="endpoints">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {webhooks.length > 0 ? (
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div
                        key={webhook.id}
                        className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-semibold">{webhook.name}</h3>
                              <Badge className={webhook.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                {webhook.is_active ? 'Active' : 'Paused'}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm font-mono mb-3">{webhook.url}</p>
                            <div className="flex flex-wrap gap-2">
                              {webhook.events?.map((event) => (
                                <Badge key={event} className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => toggleMutation.mutate({ id: webhook.id, is_active: !webhook.is_active })}
                              variant="outline"
                              size="icon"
                              className="rounded-lg border-gray-700"
                            >
                              {webhook.is_active ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => testWebhook(webhook)}
                              variant="outline"
                              size="icon"
                              className="rounded-lg border-gray-700"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Delete webhook "${webhook.name}"?`)) {
                                  deleteMutation.mutate(webhook.id);
                                }
                              }}
                              variant="outline"
                              size="icon"
                              className="rounded-lg border-red-500 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-800">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Success Rate</p>
                            <p className="text-white font-medium">
                              {webhook.success_count + webhook.failure_count > 0
                                ? Math.round((webhook.success_count / (webhook.success_count + webhook.failure_count)) * 100)
                                : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Total Deliveries</p>
                            <p className="text-white font-medium">{webhook.success_count + webhook.failure_count}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Last Triggered</p>
                            <p className="text-white font-medium text-sm">
                              {webhook.last_triggered
                                ? new Date(webhook.last_triggered).toLocaleDateString()
                                : 'Never'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-[#111317] rounded-lg">
                          <p className="text-gray-500 text-xs mb-1">Secret Key (for signature verification)</p>
                          <div className="flex items-center gap-2">
                            <code className="text-white text-xs font-mono flex-1">{webhook.secret_key}</code>
                            <Button
                              onClick={() => copyToClipboard(webhook.secret_key)}
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Webhook className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">No custom webhooks configured yet</p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Webhook
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITY LOGS TAB */}
          <TabsContent value="logs">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Recent Webhook Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {webhookLogs.length > 0 ? (
                  <div className="space-y-2">
                    {webhookLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            log.success ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {log.success ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{log.event_type}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-gray-500 text-xs">
                                {new Date(log.created_date).toLocaleString()}
                              </span>
                              {log.status_code && (
                                <Badge className="bg-gray-700 text-gray-300 text-xs">
                                  {log.status_code}
                                </Badge>
                              )}
                              {log.duration_ms && (
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {log.duration_ms}ms
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No webhook deliveries yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENTATION TAB */}
          <TabsContent value="docs">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Webhook Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">Payload Format</h3>
                  <div className="bg-[#0B0B0C] rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-300 text-sm font-mono">
{`{
  "event": "video_completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "project_id": "uuid-123",
    "title": "My Video",
    "output_url": "https://...",
    "duration_seconds": 30,
    "resolution": "1920x1080"
  },
  "user": {
    "email": "user@example.com",
    "plan_tier": "creator"
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Available Events</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {availableEvents.map((event) => (
                      <div key={event.value} className="p-3 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${event.color} text-white text-xs font-semibold mb-2`}>
                          {event.value}
                        </div>
                        <p className="text-white font-medium text-sm mb-1">{event.label}</p>
                        <p className="text-gray-500 text-xs">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Signature Verification</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    All webhooks include an `X-Webhook-Signature` header with an HMAC-SHA256 signature of the payload.
                  </p>
                  <div className="bg-[#0B0B0C] rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-300 text-sm font-mono">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Retry Policy</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Failed deliveries are retried 3 times</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Retry delays: 60s, 5m, 30m</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Webhooks must respond with 2xx status within 10 seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>Consecutive failures will automatically pause the webhook</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Zapier Setup Dialog */}
      <Dialog open={showZapierGuide} onOpenChange={setShowZapierGuide}>
        <DialogContent className="bg-[#111317] border-gray-800 rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#FF8C00]" />
              Setup Zapier Integration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step-by-step guide */}
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FFD700] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Create a Zap in Zapier</h4>
                    <p className="text-gray-400 text-sm">Go to zapier.com and click "Create Zap"</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FFD700] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Choose "Webhooks by Zapier"</h4>
                    <p className="text-gray-400 text-sm mb-2">Select it as the trigger app, then choose "Catch Hook"</p>
                    <Button
                      onClick={() => window.open("https://zapier.com/apps/webhook/integrations", "_blank")}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 hover:bg-[#1a1a1f] rounded-lg text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open Zapier Webhooks
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FFD700] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-3">Copy your Zapier Webhook URL</h4>
                    <p className="text-gray-400 text-sm mb-3">Zapier will show you a unique webhook URL. Copy it and paste below:</p>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="Trigger name (e.g., 'Send email on video complete')"
                        value={zapierFormData.trigger_name}
                        onChange={(e) => setZapierFormData({...zapierFormData, trigger_name: e.target.value})}
                        className="bg-[#111317] border-gray-700 text-white rounded-xl"
                      />
                      
                      <Select
                        value={zapierFormData.trigger_event}
                        onValueChange={(value) => setZapierFormData({...zapierFormData, trigger_event: value})}
                      >
                        <SelectTrigger className="bg-[#111317] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEvents.map((event) => (
                            <SelectItem key={event.value} value={event.value}>
                              {event.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                        value={zapierFormData.zapier_webhook_url}
                        onChange={(e) => setZapierFormData({...zapierFormData, zapier_webhook_url: e.target.value})}
                        className="bg-[#111317] border-gray-700 text-white rounded-xl font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FFD700] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Test & Activate</h4>
                    <p className="text-gray-400 text-sm">After creating the trigger, test it to make sure it works!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <Button
                onClick={() => setShowZapierGuide(false)}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateZapier}
                disabled={!zapierFormData.trigger_name.trim() || !zapierFormData.zapier_webhook_url.trim()}
                className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-black font-semibold rounded-xl hover:opacity-90"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Zapier Trigger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      {showCreateForm && (
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="bg-[#111317] border-gray-800 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Create New Webhook</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Webhook Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="My Production Webhook"
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Endpoint URL</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://your-server.com/webhooks/aifreedom"
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be a valid HTTPS URL that can receive POST requests
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Events to Listen</label>
                <div className="grid md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {availableEvents.map((event) => (
                    <label
                      key={event.value}
                      className={`p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                        formData.events.includes(event.value)
                          ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                          : 'border-gray-800 bg-[#0B0B0C] hover:border-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event.value)}
                        onChange={() => {
                          setFormData({
                            ...formData,
                            events: formData.events.includes(event.value)
                              ? formData.events.filter(e => e !== event.value)
                              : [...formData.events, event.value]
                          });
                        }}
                        className="mr-2"
                      />
                      <span className="text-white font-medium">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreate}
                  className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white rounded-xl"
                  disabled={createMutation.isLoading}
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Webhook'}
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}