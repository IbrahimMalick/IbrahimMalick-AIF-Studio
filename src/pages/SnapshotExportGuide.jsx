import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Download,
  Upload,
  CheckCircle2,
  Copy,
  ExternalLink,
  Rocket,
  Settings,
  Palette,
  Database,
  Code,
  FileJson
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function SnapshotExportGuide() {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    showToast("Copied to clipboard! 📋", "success");
    setTimeout(() => setCopied(null), 2000);
  };

  const snapshotConfig = {
    name: "AIFreedomDuane_Studio_v1",
    description: "Complete AI Content Creation Platform with Video Generation, Social Media Automation, and CRM Integration",
    category: "Marketing & Content",
    price: "$997 one-time + $297/month support",
    features: [
      "AI Video Generation",
      "Social Media Automation",
      "GoHighLevel CRM Sync",
      "White-Label Ready",
      "Analytics Dashboard",
      "Team Collaboration",
      "Custom Branding",
      "Webhook Integrations"
    ]
  };

  const deploymentSteps = [
    {
      title: "Prepare Your Snapshot",
      steps: [
        "Log in to your GHL Agency account",
        "Go to Settings → Snapshots",
        "Click 'Create New Snapshot'",
        "Name it: 'AIFreedomDuane Studio v1.0'",
        "Select all relevant data to include"
      ]
    },
    {
      title: "Configure Snapshot Settings",
      steps: [
        "Set snapshot as 'Marketplace Ready'",
        "Add preview screenshots (5-10 images)",
        "Write compelling description",
        "Set pricing: $997 one-time + $297/mo",
        "Add demo video (optional but recommended)"
      ]
    },
    {
      title: "Include Required Components",
      steps: [
        "Funnels: Onboarding funnel, sales pages",
        "Workflows: Welcome sequence, engagement automation",
        "Forms: Lead capture, client intake",
        "Custom Fields: Map to our platform data",
        "Calendars: Onboarding calls, training sessions",
        "Emails: Welcome series, tutorials"
      ]
    },
    {
      title: "Deploy to Client",
      steps: [
        "Client must have GHL sub-account",
        "Go to Snapshots → Deploy",
        "Select client's location",
        "Configure white-label settings",
        "Run deployment (takes 2-5 minutes)",
        "Test all integrations"
      ]
    }
  ];

  const webhookEndpoints = [
    {
      name: "Platform Authentication",
      endpoint: "https://yourapp.com/api/auth/ghl",
      description: "OAuth callback for GHL SSO"
    },
    {
      name: "Webhook Receiver",
      endpoint: "https://yourapp.com/api/webhooks/ghl",
      description: "Receives GHL events (contacts, opportunities, etc.)"
    },
    {
      name: "Video Completion",
      endpoint: "https://yourapp.com/api/webhooks/video-complete",
      description: "Triggered when video rendering finishes"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white heading-font">
            GHL Snapshot Export Guide
          </h1>
          <p className="text-gray-400 text-lg">
            Package AIFreedomDuane Studio as a GHL Snapshot for unlimited deployments
          </p>
        </div>

        {/* Snapshot Overview */}
        <Card className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 heading-font">
                  {snapshotConfig.name}
                </h2>
                <p className="text-gray-300 mb-4">{snapshotConfig.description}</p>
                <div className="flex gap-3 mb-6">
                  <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
                    {snapshotConfig.category}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    White-Label Ready
                  </Badge>
                </div>
                <div className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800">
                  <p className="text-white font-semibold mb-1">Suggested Pricing:</p>
                  <p className="text-[#FFD700] text-2xl font-bold">{snapshotConfig.price}</p>
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Included Features:</h3>
                <div className="space-y-2">
                  {snapshotConfig.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Steps */}
        <Tabs defaultValue="prepare" className="space-y-6">
          <TabsList className="bg-[#111317] border border-gray-800">
            <TabsTrigger value="prepare">
              <Settings className="w-4 h-4 mr-2" />
              Prepare
            </TabsTrigger>
            <TabsTrigger value="configure">
              <Palette className="w-4 h-4 mr-2" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="deploy">
              <Rocket className="w-4 h-4 mr-2" />
              Deploy
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Code className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          {/* Prepare Tab */}
          <TabsContent value="prepare">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Snapshot Preparation Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {deploymentSteps.map((section, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center flex-shrink-0">
                        <span className="text-black font-bold text-sm">{idx + 1}</span>
                      </div>
                      <h3 className="text-white font-semibold text-lg">{section.title}</h3>
                    </div>
                    <div className="ml-11 space-y-2">
                      {section.steps.map((step, stepIdx) => (
                        <div key={stepIdx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0B0B0C] border border-gray-800">
                          <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configure Tab */}
          <TabsContent value="configure">
            <div className="space-y-6">
              
              {/* Snapshot JSON */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Snapshot Configuration JSON
                    <Button
                      onClick={() => copyToClipboard(JSON.stringify(snapshotConfig, null, 2), 'config')}
                      variant="outline"
                      size="sm"
                      className="border-gray-700"
                    >
                      {copied === 'config' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === 'config' ? ' Copied' : ' Copy'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-4 overflow-x-auto">
                    <code className="text-green-400 text-sm font-mono">
                      {JSON.stringify(snapshotConfig, null, 2)}
                    </code>
                  </pre>
                </CardContent>
              </Card>

              {/* Custom Fields Mapping */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">GHL Custom Fields Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { ghlField: "afd_user_id", ourField: "user.id", type: "text" },
                      { ghlField: "afd_plan_tier", ourField: "subscription.plan_tier", type: "dropdown" },
                      { ghlField: "afd_videos_created", ourField: "stats.videos_created", type: "number" },
                      { ghlField: "afd_last_video_date", ourField: "stats.last_video_date", type: "date" },
                      { ghlField: "afd_storage_used_mb", ourField: "usage.storage_used_mb", type: "number" }
                    ].map((mapping, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#0B0B0C] border border-gray-800">
                        <div>
                          <p className="text-white font-mono text-sm">{mapping.ghlField}</p>
                          <p className="text-gray-500 text-xs mt-1">{mapping.ourField}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {mapping.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    💡 Create these custom fields in GHL Settings → Custom Fields before deploying snapshot
                  </p>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Deploy Tab */}
          <TabsContent value="deploy">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Client Deployment Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Pre-Deployment Checklist */}
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Pre-Deployment Checklist
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Client has active GHL sub-account",
                      "Client's Location ID obtained",
                      "White-label branding assets collected",
                      "Custom domain configured (if applicable)",
                      "API keys generated",
                      "Onboarding call scheduled"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deployment Command */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Deployment Command (CLI)</h4>
                  <div className="relative">
                    <pre className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm font-mono">
{`# Deploy snapshot to client location
ghl snapshot deploy \\ 
  --snapshot-id="afd_studio_v1" \\
  --location-id="CLIENT_LOCATION_ID" \\
  --white-label="true" \\
  --brand-name="Client Agency Name" \\
  --primary-color="#FFD700" \\
  --custom-domain="app.clientdomain.com"`}
                      </code>
                    </pre>
                    <Button
                      onClick={() => copyToClipboard('ghl snapshot deploy --snapshot-id="afd_studio_v1"', 'deploy')}
                      variant="outline"
                      size="sm"
                      className="absolute top-4 right-4 border-gray-700"
                    >
                      {copied === 'deploy' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Post-Deployment */}
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <h4 className="text-green-400 font-semibold mb-3">Post-Deployment Tasks</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                    <li>Verify all workflows are active</li>
                    <li>Test webhook connections</li>
                    <li>Configure email sending domain</li>
                    <li>Create test contact to verify sync</li>
                    <li>Schedule client training session</li>
                    <li>Send welcome email with login credentials</li>
                  </ol>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Webhook Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {webhookEndpoints.map((webhook, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{webhook.name}</h4>
                        <p className="text-gray-400 text-sm mt-1">{webhook.description}</p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(webhook.endpoint, `webhook-${idx}`)}
                        variant="ghost"
                        size="sm"
                      >
                        {copied === `webhook-${idx}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="bg-[#111317] rounded-lg p-3 border border-gray-700">
                      <code className="text-[#00D4C9] text-sm font-mono break-all">
                        {webhook.endpoint}
                      </code>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <h4 className="text-blue-400 font-semibold mb-2">Webhook Security</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• All webhooks use HMAC signature verification</li>
                    <li>• Secret key is auto-generated per client</li>
                    <li>• Requests are rate-limited to prevent abuse</li>
                    <li>• Failed webhooks auto-retry with exponential backoff</li>
                  </ul>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Quick Start Video */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">📹 Video Tutorial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 rounded-xl flex items-center justify-center border border-[#FFD700]/30">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-white font-bold mb-2 heading-font">
                  Complete Snapshot Deployment Tutorial
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Watch our 15-minute guide on creating and deploying your first snapshot
                </p>
                <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Tutorial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Resources */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3 heading-font">
              Need Help with Deployment?
            </h3>
            <p className="text-gray-300 mb-6">
              Our team can handle the entire snapshot creation and deployment for you
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold px-8">
                <ExternalLink className="w-5 h-5 mr-2" />
                Schedule Setup Call
              </Button>
              <Button variant="outline" className="border-gray-700 text-white px-8">
                <FileJson className="w-5 h-5 mr-2" />
                Download Full Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}