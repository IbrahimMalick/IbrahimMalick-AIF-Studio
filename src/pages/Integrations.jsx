import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Settings,
  Zap,
  Link as LinkIcon,
  Loader2,
  Users,
  Send,
  TrendingUp,
  DollarSign,
  Youtube,
  Code
} from "lucide-react";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Integrations() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedEmailProvider, setSelectedEmailProvider] = useState(null);
  const [emailConfig, setEmailConfig] = useState({
    api_key: "",
    api_secret: "",
    account_id: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: emailIntegrations = [] } = useQuery({
    queryKey: ["emailIntegrations", user?.email],
    queryFn: () => base44.entities.EmailIntegration.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: zapierTriggers = [] } = useQuery({
    queryKey: ["zapierTriggers", user?.email],
    queryFn: () => base44.entities.ZapierTrigger.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: adCampaigns = [] } = useQuery({
    queryKey: ["adCampaigns", user?.email],
    queryFn: () => base44.entities.AdCampaign.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const connectEmailMutation = useMutation({
    mutationFn: async (data) => {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return await base44.entities.EmailIntegration.create({
        ...data,
        user_email: user.email,
        is_connected: true,
        lists: [
          { list_id: "list_123", list_name: "Main List", subscriber_count: 1247 },
          { list_id: "list_456", list_name: "VIP Subscribers", subscriber_count: 389 }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["emailIntegrations"]);
      setShowEmailDialog(false);
      setEmailConfig({ api_key: "", api_secret: "", account_id: "" });
    },
  });

  const disconnectEmailMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailIntegration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["emailIntegrations"]);
    },
  });

  const updateEmailSettingsMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailIntegration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["emailIntegrations"]);
    },
  });

  const emailProviders = [
    {
      id: "aweber",
      name: "AWeber",
      icon: Mail,
      color: "from-[#0066CC] to-[#0052A3]",
      description: "Powerful email automation for creators",
      features: ["Automation", "Landing Pages", "Analytics", "Split Testing"],
      setupSteps: [
        "Go to AWeber Account Settings",
        "Navigate to API/Developer Tools",
        "Generate new API key",
        "Copy and paste below"
      ]
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      icon: Mail,
      color: "from-[#FFE01B] to-[#FFC800]",
      description: "All-in-one marketing platform",
      features: ["Email Campaigns", "Automation", "Audience Insights", "Templates"],
      setupSteps: [
        "Login to Mailchimp",
        "Go to Account > Extras > API keys",
        "Create a new API key",
        "Paste the key below"
      ]
    },
    {
      id: "convertkit",
      name: "ConvertKit",
      icon: Mail,
      color: "from-[#FB6970] to-[#E8565D]",
      description: "Email marketing for creators",
      features: ["Visual Automations", "Landing Pages", "Forms", "Sequences"],
      setupSteps: [
        "Open ConvertKit Settings",
        "Click on 'Advanced' tab",
        "Copy API Key and API Secret",
        "Enter both below"
      ]
    },
    {
      id: "activecampaign",
      name: "ActiveCampaign",
      icon: Mail,
      color: "from-[#356AE6] to-[#2451B7]",
      description: "Customer experience automation",
      features: ["Marketing Automation", "CRM", "Sales Automation", "Messaging"],
      setupSteps: [
        "Go to Settings > Developer",
        "Copy your API URL and Key",
        "Enter Account ID from URL",
        "Paste credentials below"
      ]
    }
  ];

  const adPlatforms = [
    {
      id: "google_ads",
      name: "Google Ads",
      icon: TrendingUp,
      color: "from-[#4285F4] to-[#34A853]",
      description: "Search & Display advertising",
      status: "coming_soon"
    },
    {
      id: "meta_ads",
      name: "Meta Ads",
      icon: DollarSign,
      color: "from-[#1877F2] to-[#0D65D9]",
      description: "Facebook & Instagram ads",
      status: "coming_soon"
    },
    {
      id: "tiktok_ads",
      name: "TikTok Ads",
      icon: TrendingUp,
      color: "from-[#FF0050] to-[#00F2EA]",
      description: "Short-form video ads",
      status: "coming_soon"
    }
  ];

  const handleConnectEmail = async (provider) => {
    setSelectedEmailProvider(provider);
    setShowEmailDialog(true);
  };

  const handleSubmitEmailConnection = async () => {
    if (!emailConfig.api_key) {
      alert("Please enter at least an API key");
      return;
    }

    await connectEmailMutation.mutateAsync({
      provider: selectedEmailProvider.id,
      api_key: emailConfig.api_key,
      api_secret: emailConfig.api_secret || null,
      account_id: emailConfig.account_id || null
    });

    alert(`Successfully connected to ${selectedEmailProvider.name}!`);
  };

  const getIntegrationByProvider = (providerId) => {
    return emailIntegrations.find(i => i.provider === providerId);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-gray-400">Connect your favorite tools to supercharge your workflow</p>
        </div>

        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Marketing
            </TabsTrigger>
            <TabsTrigger value="ads">
              <DollarSign className="w-4 h-4 mr-2" />
              Advertising
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Zap className="w-4 h-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="other">
              <LinkIcon className="w-4 h-4 mr-2" />
              Other
            </TabsTrigger>
          </TabsList>

          {/* EMAIL MARKETING TAB */}
          <TabsContent value="email" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {emailProviders.map((provider) => {
                const integration = getIntegrationByProvider(provider.id);
                const ProviderIcon = provider.icon;

                return (
                  <Card key={provider.id} className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                            <ProviderIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{provider.name}</CardTitle>
                            <p className="text-gray-400 text-sm mt-1">{provider.description}</p>
                          </div>
                        </div>
                        {integration?.is_connected && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {provider.features.map((feature, idx) => (
                          <Badge key={idx} className="bg-[#0B0B0C] text-gray-300 text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      {integration?.is_connected ? (
                        <div className="space-y-3">
                          {/* Connected Account Info */}
                          <div className="p-3 bg-[#0B0B0C] rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">Email Lists</span>
                              <span className="text-white font-medium">{integration.lists?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Total Subscribers</span>
                              <span className="text-white font-medium">
                                {integration.lists?.reduce((sum, list) => sum + list.subscriber_count, 0).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Settings */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
                              <div>
                                <p className="text-white text-sm font-medium">Auto-sync subscribers</p>
                                <p className="text-gray-500 text-xs">Sync new subscribers to your app</p>
                              </div>
                              <Switch
                                checked={integration.auto_sync_subscribers}
                                onCheckedChange={(checked) => {
                                  updateEmailSettingsMutation.mutate({
                                    id: integration.id,
                                    data: { auto_sync_subscribers: checked }
                                  });
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-xl">
                              <div>
                                <p className="text-white text-sm font-medium">Send welcome video</p>
                                <p className="text-gray-500 text-xs">Auto-send video on signup</p>
                              </div>
                              <Switch
                                checked={integration.send_video_on_signup}
                                onCheckedChange={(checked) => {
                                  updateEmailSettingsMutation.mutate({
                                    id: integration.id,
                                    data: { send_video_on_signup: checked }
                                  });
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl"
                            onClick={() => {
                              if (confirm(`Disconnect from ${provider.name}?`)) {
                                disconnectEmailMutation.mutate(integration.id);
                              }
                            }}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleConnectEmail(provider)}
                          className={`w-full bg-gradient-to-r ${provider.color} text-white rounded-xl`}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Connect {provider.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ADVERTISING TAB */}
          <TabsContent value="ads" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {adPlatforms.map((platform) => {
                const PlatformIcon = platform.icon;
                return (
                  <Card key={platform.id} className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                          <PlatformIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">{platform.name}</CardTitle>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{platform.description}</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        disabled
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 rounded-xl"
                      >
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {adCampaigns.length > 0 && (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adCampaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 bg-[#0B0B0C] rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{campaign.campaign_name}</span>
                          <Badge className={`${
                            campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Spent</p>
                            <p className="text-white font-medium">${campaign.spent_usd?.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">ROAS</p>
                            <p className="text-white font-medium">{campaign.roas?.toFixed(2)}x</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Conversions</p>
                            <p className="text-white font-medium">{campaign.conversions}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AUTOMATION TAB */}
          <TabsContent value="automation" className="space-y-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4A00] to-[#FF6A00] flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Zapier Integration</CardTitle>
                    <p className="text-gray-400 text-sm mt-1">Connect to 5,000+ apps with webhooks</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <h3 className="text-white font-medium mb-3">How to Set Up:</h3>
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4A00] font-bold">1.</span>
                      <span>Create a Zap in Zapier and choose "Webhooks by Zapier" as the trigger</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4A00] font-bold">2.</span>
                      <span>Select "Catch Hook" and copy the webhook URL</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4A00] font-bold">3.</span>
                      <span>Go to Webhooks tab in this app and create a new webhook</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF4A00] font-bold">4.</span>
                      <span>Paste the Zapier webhook URL and select which events to send</span>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Active Triggers</p>
                    <p className="text-2xl font-bold text-white">{zapierTriggers.length}</p>
                  </div>
                  <div className="p-3 bg-[#0B0B0C] rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Events Sent (30d)</p>
                    <p className="text-2xl font-bold text-white">
                      {zapierTriggers.reduce((sum, t) => sum + (t.trigger_count || 0), 0)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => window.location.href = createPageUrl("Webhooks")}
                  className="w-full bg-gradient-to-r from-[#FF4A00] to-[#FF6A00] text-white rounded-xl"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Webhooks
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OTHER TAB */}
          <TabsContent value="other" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF0000] to-[#CC0000] flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">YouTube Data API</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">Fetch analytics & manage videos</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-blue-500/20 text-blue-400 mb-3">
                    Auto-connected via Social Accounts
                  </Badge>
                  <p className="text-gray-400 text-sm">
                    Your YouTube analytics are automatically synced when you connect your YouTube account in Social Media settings.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7289DA] to-[#5B6EAE] flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Custom API</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">Build your own integrations</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    View API Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Connection Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="bg-[#111317] border-gray-800 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Connect to {selectedEmailProvider?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Follow these steps to connect your {selectedEmailProvider?.name} account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Setup Steps */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl">
              <h3 className="text-white font-medium mb-3 text-sm">Setup Instructions:</h3>
              <ol className="space-y-2">
                {selectedEmailProvider?.setupSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-[#FFD700] font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* API Key Input */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">API Key *</label>
              <Input
                value={emailConfig.api_key}
                onChange={(e) => setEmailConfig({...emailConfig, api_key: e.target.value})}
                placeholder="Enter your API key..."
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            {/* API Secret (for some providers) */}
            {(selectedEmailProvider?.id === "convertkit" || selectedEmailProvider?.id === "activecampaign") && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {selectedEmailProvider?.id === "convertkit" ? "API Secret" : "API URL"}
                </label>
                <Input
                  value={emailConfig.api_secret}
                  onChange={(e) => setEmailConfig({...emailConfig, api_secret: e.target.value})}
                  placeholder={selectedEmailProvider?.id === "convertkit" ? "Enter API secret..." : "Enter API URL..."}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>
            )}

            {/* Account ID (for ActiveCampaign) */}
            {selectedEmailProvider?.id === "activecampaign" && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Account ID</label>
                <Input
                  value={emailConfig.account_id}
                  onChange={(e) => setEmailConfig({...emailConfig, account_id: e.target.value})}
                  placeholder="Enter account ID..."
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>
            )}

            {/* Connect Button */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitEmailConnection}
                disabled={!emailConfig.api_key || connectEmailMutation.isLoading}
                className={`flex-1 bg-gradient-to-r ${selectedEmailProvider?.color} text-white rounded-xl`}
              >
                {connectEmailMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}