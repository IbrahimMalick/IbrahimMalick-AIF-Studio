import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  AlertCircle,
  Phone,
  Database,
  Mail,
  Key,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";
import PermissionGate from "@/components/PermissionGate";
import { createPageUrl } from "@/utils";

const Field = ({ label, children, hint }) => (
  <div className="mb-4">
    <Label className="text-gray-300 mb-2 block">{label}</Label>
    {children}
    {hint && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
  </div>
);

export default function ProviderSettings() {
  const [user, setUser] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Load GHL Config
  const { data: ghlConfig } = useQuery({
    queryKey: ["ghlConfig", user?.email],
    queryFn: async () => {
      const configs = await base44.entities.GoHighLevelConfig.filter({
        user_email: user.email
      });
      return configs[0] || null;
    },
    enabled: !!user
  });

  // Load Receptionist Config
  const { data: receptionistConfig } = useQuery({
    queryKey: ["receptionistConfig", user?.email],
    queryFn: async () => {
      const configs = await base44.entities.ReceptionistConfig.filter({
        user_email: user.email
      });
      return configs[0] || null;
    },
    enabled: !!user
  });

  // Load Integration Entity
  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations", user?.email],
    queryFn: () => base44.entities.Integration.filter({
      created_by: user.email
    }),
    enabled: !!user
  });

  const [ghlForm, setGhlForm] = useState({
    ghl_location_id: "",
    ghl_agency_id: "",
    api_key: "",
    webhook_url: "",
    webhook_secret: ""
  });

  const [twilioForm, setTwilioForm] = useState({
    account_sid: "",
    auth_token: "",
    phone_number: ""
  });

  const [apiForm, setApiForm] = useState({
    elevenlabs_api_key: "",
    heygen_api_key: "",
    postmark_api_key: "",
    poe_api_key: ""
  });

  useEffect(() => {
    if (ghlConfig) {
      setGhlForm({
        ghl_location_id: ghlConfig.ghl_location_id || "",
        ghl_agency_id: ghlConfig.ghl_agency_id || "",
        api_key: ghlConfig.api_key || "",
        webhook_url: ghlConfig.webhook_url || "",
        webhook_secret: ghlConfig.webhook_secret || ""
      });
    }
  }, [ghlConfig]);

  useEffect(() => {
    if (receptionistConfig) {
      setTwilioForm({
        account_sid: receptionistConfig.twilio_phone_number || "",
        auth_token: "",
        phone_number: receptionistConfig.twilio_phone_number || ""
      });
    }
  }, [receptionistConfig]);

  const saveGHLMutation = useMutation({
    mutationFn: async (data) => {
      if (ghlConfig?.id) {
        return await base44.entities.GoHighLevelConfig.update(ghlConfig.id, data);
      } else {
        return await base44.entities.GoHighLevelConfig.create({
          ...data,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ghlConfig"]);
      showToast("GoHighLevel settings saved! ✅", "success");
    }
  });

  const saveReceptionistMutation = useMutation({
    mutationFn: async (data) => {
      if (receptionistConfig?.id) {
        return await base44.entities.ReceptionistConfig.update(receptionistConfig.id, {
          ...data,
          twilio_phone_number: data.phone_number
        });
      } else {
        return await base44.entities.ReceptionistConfig.create({
          user_email: user.email,
          twilio_phone_number: data.phone_number,
          brand_name: user.full_name || "AI Freedom Studios"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receptionistConfig"]);
      showToast("Twilio settings saved! 📞", "success");
    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  const toggleSecret = (field) => {
    setShowSecrets({ ...showSecrets, [field]: !showSecrets[field] });
  };

  return (
    <PermissionGate
      user={user}
      minimumRole="admin"
      showLockMessage={true}
      lockMessage="Only administrators can configure provider settings"
    >
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Database className="w-8 h-8 text-[#00D4C9]" />
              Provider & Integration Settings
            </h1>
            <p className="text-gray-400">
              Configure external services and API connections. For production deployment, see Backend Integration Guide.
            </p>
          </div>

          {/* Important Notice */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">📋 Base44 Platform Note</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Base44 stores configuration in entities (frontend database). For full production integration with
                    OAuth flows, webhooks, and real-time processing, you'll need to deploy a separate backend API.
                  </p>
                  <div className="flex gap-3">
                    <a href={createPageUrl("BackendDeploymentGuide")}>
                      <Button size="sm" variant="outline" className="border-blue-400/30 text-blue-400">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Deployment Guide
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="apis" className="space-y-6">
            <TabsList className="bg-[#111]">
              <TabsTrigger value="ghl">
                <Database className="w-4 h-4 mr-2" />
                GoHighLevel
              </TabsTrigger>
              <TabsTrigger value="twilio">
                <Phone className="w-4 h-4 mr-2" />
                Twilio (Voice)
              </TabsTrigger>
              <TabsTrigger value="apis">
                <Key className="w-4 h-4 mr-2" />
                AI Services
              </TabsTrigger>
              <TabsTrigger value="webhooks">
                <ExternalLink className="w-4 h-4 mr-2" />
                Webhooks
              </TabsTrigger>
            </TabsList>

            {/* GoHighLevel Tab */}
            <TabsContent value="ghl">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">GoHighLevel Integration</CardTitle>
                    {ghlConfig?.is_connected && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* OAuth Instructions */}
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h4 className="text-yellow-400 font-semibold text-sm mb-2">
                      🔐 OAuth Setup Required
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      For production OAuth flow, deploy the backend API and configure:
                    </p>
                    <div className="bg-[#0B0B0C] p-3 rounded font-mono text-xs text-gray-400 space-y-1">
                      <div>Redirect URI: <span className="text-[#00D4C9]">https://studio.aifreedomduane.com/api/ghl/oauth/callback</span></div>
                      <div>Scopes: contacts.write, opportunities.write, calendars.write</div>
                    </div>
                  </div>

                  <Field 
                    label="GHL Location ID *" 
                    hint="Your GoHighLevel sub-account/location ID"
                  >
                    <Input
                      value={ghlForm.ghl_location_id}
                      onChange={(e) => setGhlForm({...ghlForm, ghl_location_id: e.target.value})}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </Field>

                  <Field label="GHL Agency ID">
                    <Input
                      value={ghlForm.ghl_agency_id}
                      onChange={(e) => setGhlForm({...ghlForm, ghl_agency_id: e.target.value})}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </Field>

                  <Field 
                    label="API Key (Legacy)" 
                    hint="Only needed if not using OAuth"
                  >
                    <div className="relative">
                      <Input
                        type={showSecrets.ghl_api ? "text" : "password"}
                        value={ghlForm.api_key}
                        onChange={(e) => setGhlForm({...ghlForm, api_key: e.target.value})}
                        placeholder="••••••••••••••••••••"
                        className="bg-[#0C0C0C] border-gray-700 text-white pr-10"
                      />
                      <button
                        onClick={() => toggleSecret('ghl_api')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-800 rounded"
                      >
                        {showSecrets.ghl_api ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field label="Webhook URL" hint="Where GHL sends events">
                    <div className="flex gap-2">
                      <Input
                        value={ghlForm.webhook_url}
                        onChange={(e) => setGhlForm({...ghlForm, webhook_url: e.target.value})}
                        placeholder="https://studio.aifreedomduane.com/api/ghl/webhook"
                        className="bg-[#0C0C0C] border-gray-700 text-white flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(ghlForm.webhook_url)}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </Field>

                  <Field label="Webhook Secret" hint="For HMAC signature verification">
                    <Input
                      type={showSecrets.ghl_webhook ? "text" : "password"}
                      value={ghlForm.webhook_secret}
                      onChange={(e) => setGhlForm({...ghlForm, webhook_secret: e.target.value})}
                      placeholder="whsec_••••••••••••••••"
                      className="bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </Field>

                  <Button
                    onClick={() => saveGHLMutation.mutate(ghlForm)}
                    disabled={!ghlForm.ghl_location_id || saveGHLMutation.isLoading}
                    className="w-full bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black font-bold"
                  >
                    {saveGHLMutation.isLoading ? "Saving..." : "Save GoHighLevel Settings"}
                  </Button>

                  {/* Quick Links */}
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-gray-400 text-sm mb-3">Quick Actions:</p>
                    <div className="flex gap-3 flex-wrap">
                      <a href="/api/ghl/oauth/start" target="_blank" rel="noopener">
                        <Button size="sm" variant="outline" className="border-gray-700 text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Start OAuth Flow
                        </Button>
                      </a>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          window.location.href = createPageUrl("GoHighLevelIntegration");
                        }}
                        className="border-gray-700 text-white"
                      >
                        GHL Integration Hub
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Twilio Tab */}
            <TabsContent value="twilio">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Twilio Voice Settings</CardTitle>
                    {receptionistConfig?.twilio_phone_number && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <Phone className="w-3 h-3 mr-1" />
                        Configured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-400 font-semibold text-sm mb-2">
                      📞 AI Receptionist Requirements
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Twilio account with purchased phone number</li>
                      <li>• Webhook endpoint at: <code className="text-[#00D4C9]">/api/voice/inbound</code></li>
                      <li>• ElevenLabs or other TTS/STT provider</li>
                    </ul>
                  </div>

                  <Field 
                    label="Twilio Phone Number *" 
                    hint="Format: +1XXXXXXXXXX"
                  >
                    <Input
                      value={twilioForm.phone_number}
                      onChange={(e) => setTwilioForm({...twilioForm, phone_number: e.target.value})}
                      placeholder="+12345678900"
                      className="bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </Field>

                  <Field label="Account SID">
                    <Input
                      type={showSecrets.twilio_sid ? "text" : "password"}
                      value={twilioForm.account_sid}
                      onChange={(e) => setTwilioForm({...twilioForm, account_sid: e.target.value})}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </Field>

                  <Field label="Auth Token">
                    <Input
                      type={showSecrets.twilio_token ? "text" : "password"}
                      value={twilioForm.auth_token}
                      onChange={(e) => setTwilioForm({...twilioForm, auth_token: e.target.value})}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </Field>

                  {/* Webhook Configuration */}
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Twilio Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Voice URL (POST):</p>
                        <div className="flex gap-2">
                          <code className="flex-1 p-2 bg-[#000] rounded text-[#00D4C9] text-xs">
                            https://studio.aifreedomduane.com/api/voice/inbound
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard("https://studio.aifreedomduane.com/api/voice/inbound")}
                            className="border-gray-700"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400">Method: <span className="text-white">POST</span></p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => saveReceptionistMutation.mutate(twilioForm)}
                    disabled={!twilioForm.phone_number || saveReceptionistMutation.isLoading}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                  >
                    {saveReceptionistMutation.isLoading ? "Saving..." : "Save Twilio Settings"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl("ReceptionistConsole")}
                    className="w-full border-gray-700 text-white"
                  >
                    Configure AI Receptionist
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Services Tab */}
            <TabsContent value="apis">
              <div className="grid gap-6">
                
                {/* ElevenLabs */}
                <Card className="bg-[#111] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">ElevenLabs (Text-to-Speech)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="API Key" hint="Get from elevenlabs.io/app/subscription">
                      <div className="relative">
                        <Input
                          type={showSecrets.elevenlabs ? "text" : "password"}
                          value={apiForm.elevenlabs_api_key}
                          onChange={(e) => setApiForm({...apiForm, elevenlabs_api_key: e.target.value})}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="bg-[#0C0C0C] border-gray-700 text-white pr-10"
                        />
                        <button
                          onClick={() => toggleSecret('elevenlabs')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-800 rounded"
                        >
                          {showSecrets.elevenlabs ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </Field>
                    <p className="text-gray-500 text-xs">
                      Used for: Voice cloning, AI receptionist, avatar voice
                    </p>
                  </CardContent>
                </Card>

                {/* HeyGen */}
                <Card className="bg-[#111] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">HeyGen (Avatar Rendering)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="API Key" hint="Get from heygen.com/api">
                      <Input
                        type={showSecrets.heygen ? "text" : "password"}
                        value={apiForm.heygen_api_key}
                        onChange={(e) => setApiForm({...apiForm, heygen_api_key: e.target.value})}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="bg-[#0C0C0C] border-gray-700 text-white"
                      />
                    </Field>
                    <p className="text-gray-500 text-xs">
                      Used for: AI avatar video generation
                    </p>
                  </CardContent>
                </Card>

                {/* Postmark */}
                <Card className="bg-[#111] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Postmark (Transactional Email)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="Server API Token" hint="Optional - for custom email sending">
                      <Input
                        type={showSecrets.postmark ? "text" : "password"}
                        value={apiForm.postmark_api_key}
                        onChange={(e) => setApiForm({...apiForm, postmark_api_key: e.target.value})}
                        placeholder="••••••••••••••••••••••••••••••••"
                        className="bg-[#0C0C0C] border-gray-700 text-white"
                      />
                    </Field>
                    <p className="text-gray-500 text-xs">
                      Used for: Transactional emails (receipts, alerts, password resets)
                    </p>
                  </CardContent>
                </Card>

                {/* Poe.com */}
                <Card className="bg-[#111] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Poe.com (AI Models & Video Generation)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Field label="API Key" hint="Get from poe.com/api_key">
                      <div className="relative">
                        <Input
                          type={showSecrets.poe ? "text" : "password"}
                          value={apiForm.poe_api_key}
                          onChange={(e) => setApiForm({...apiForm, poe_api_key: e.target.value})}
                          placeholder="••••••••••••••••••••••••••••••••"
                          className="bg-[#0C0C0C] border-gray-700 text-white pr-10"
                        />
                        <button
                          onClick={() => toggleSecret('poe')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-800 rounded"
                        >
                          {showSecrets.poe ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </Field>
                    <p className="text-gray-500 text-xs">
                      Used for: AI video generation, advanced LLM models, image generation
                    </p>
                    <Button
                      onClick={async () => {
                        if (!apiForm.poe_api_key) {
                          showToast("Please enter a Poe API key first", "error");
                          return;
                        }
                        const integ = integrations.find(i => i.service_name === 'poe');
                        if (integ) {
                          await base44.entities.Integration.update(integ.id, {
                            api_key: apiForm.poe_api_key,
                            is_active: true
                          });
                        } else {
                          await base44.entities.Integration.create({
                            service_name: 'poe',
                            api_key: apiForm.poe_api_key,
                            is_active: true
                          });
                        }
                        queryClient.invalidateQueries(['integrations']);
                        showToast("Poe.com API key saved! ✅", "success");
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold"
                    >
                      Save Poe API Key
                    </Button>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* Webhooks Tab */}
            <TabsContent value="webhooks">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Webhook Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="p-4 bg-[#0B0B0C] rounded-xl space-y-4">
                    <h4 className="text-white font-semibold text-sm mb-3">Standard Event Endpoints</h4>
                    
                    {[
                      {
                        label: "GoHighLevel Webhook",
                        url: "https://studio.aifreedomduane.com/api/ghl/webhook",
                        events: ["contact.create", "opportunity.update", "appointment.booked"]
                      },
                      {
                        label: "Twilio Voice Webhook",
                        url: "https://studio.aifreedomduane.com/api/voice/inbound",
                        events: ["call.started", "speech.detected"]
                      },
                      {
                        label: "Render Completion Webhook",
                        url: "https://studio.aifreedomduane.com/api/renders/webhook",
                        events: ["render.started", "render.ready", "render.failed"]
                      },
                      {
                        label: "Payment Webhook (Stripe)",
                        url: "https://studio.aifreedomduane.com/api/payments/webhook",
                        events: ["payment.succeeded", "subscription.updated"]
                      }
                    ].map((endpoint, idx) => (
                      <div key={idx} className="p-3 bg-[#111317] rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium text-sm">{endpoint.label}</h5>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(endpoint.url)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <code className="text-[#00D4C9] text-xs block mb-2">
                          {endpoint.url}
                        </code>
                        <div className="flex gap-2 flex-wrap">
                          {endpoint.events.map((event, eidx) => (
                            <Badge key={eidx} className="bg-blue-500/20 text-blue-400 text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Event Names Reference */}
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h4 className="text-yellow-400 font-semibold text-sm mb-3">
                      📋 Standardized Event Names
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400 mb-1">Leads:</p>
                        <code className="text-gray-300 block">lead.created, lead.updated, lead.tagged</code>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Appointments:</p>
                        <code className="text-gray-300 block">appointment.booked, appointment.noshow</code>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Deals:</p>
                        <code className="text-gray-300 block">deal.created, deal.won, deal.lost</code>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Renders:</p>
                        <code className="text-gray-300 block">render.started, render.ready, render.failed</code>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Calls:</p>
                        <code className="text-gray-300 block">call.started, call.summary_ready</code>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          {/* Backend Deployment Guide CTA */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-white font-bold mb-2">🚀 Ready for Production?</h3>
              <p className="text-gray-300 text-sm mb-4">
                Deploy the full backend API for OAuth flows, webhook handling, real-time voice processing, and production-grade integrations.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.href = createPageUrl("BackendDeploymentGuide")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Backend Deployment Guide
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = createPageUrl("SecurityDocs")}
                  className="border-gray-700 text-white"
                >
                  Security Best Practices
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </PermissionGate>
  );
}