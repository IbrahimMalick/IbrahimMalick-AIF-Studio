import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Settings,
  Link as LinkIcon,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Zap
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function GoogleAds() {
  const [user, setUser] = useState(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: config } = useQuery({
    queryKey: ["googleAdsConfig", user?.email],
    queryFn: async () => {
      const configs = await base44.entities.GoogleAdsConfig.filter({
        user_email: user.email
      });
      return configs[0] || null;
    },
    enabled: !!user
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["googleAdsCampaigns", config?.id],
    queryFn: () => base44.entities.GoogleAdsCampaign.filter({
      google_ads_config_id: config.id
    }, "-created_date"),
    enabled: !!config
  });

  const [connectionForm, setConnectionForm] = useState({
    customer_id: "",
    developer_token: ""
  });

  const [campaignForm, setCampaignForm] = useState({
    campaign_name: "",
    campaign_type: "search",
    objective: "leads",
    budget_amount: 50,
    bidding_strategy: "maximize_conversions",
    keywords: "",
    locations: "United States",
    daily_budget: true
  });

  const connectMutation = useMutation({
    mutationFn: async (data) => {
      // In production: OAuth flow to get tokens
      return await base44.entities.GoogleAdsConfig.create({
        user_email: user.email,
        customer_id: data.customer_id,
        developer_token: data.developer_token,
        account_currency: "USD",
        is_connected: true,
        status: "active",
        auto_sync_enabled: true,
        sync_frequency_hours: 6
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["googleAdsConfig"]);
      showToast("Google Ads connected successfully! 🎉", "success");
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data) => {
      const keywords = data.keywords.split('\n').filter(k => k.trim()).map(k => ({
        text: k.trim(),
        match_type: "broad",
        max_cpc_micros: 5000000 // $5 max CPC
      }));

      return await base44.entities.GoogleAdsCampaign.create({
        user_email: user.email,
        google_ads_config_id: config.id,
        campaign_name: data.campaign_name,
        campaign_type: data.campaign_type,
        objective: data.objective,
        bidding_strategy: data.bidding_strategy,
        budget_config: {
          budget_type: data.daily_budget ? "daily" : "lifetime",
          amount_micros: data.budget_amount * 1000000,
          delivery_method: "standard"
        },
        targeting: {
          keywords,
          locations: [{ name: data.locations, type: "country" }],
          languages: ["en"],
          devices: ["desktop", "mobile", "tablet"]
        },
        status: "draft",
        optimization_settings: {
          auto_optimize_enabled: true,
          pause_low_performers: true,
          quality_score_threshold: 5,
          min_conversions_before_action: 10,
          roas_threshold: 2.0
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["googleAdsCampaigns"]);
      setShowCampaignForm(false);
      setCampaignForm({
        campaign_name: "",
        campaign_type: "search",
        objective: "leads",
        budget_amount: 50,
        bidding_strategy: "maximize_conversions",
        keywords: "",
        locations: "United States",
        daily_budget: true
      });
      showToast("Campaign created! 🚀", "success");
    }
  });

  const toggleCampaignStatus = async (campaignId, currentStatus) => {
    const newStatus = currentStatus === "enabled" ? "paused" : "enabled";
    await base44.entities.GoogleAdsCampaign.update(campaignId, {
      status: newStatus
    });
    queryClient.invalidateQueries(["googleAdsCampaigns"]);
    showToast(`Campaign ${newStatus}!`, "success");
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              Google Ads Integration
            </h1>
            <p className="text-gray-400">
              Connect your Google Ads account and launch AI-optimized campaigns
            </p>
          </div>

          {/* Connection Card */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Connect Google Ads Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Setup Requirements
                </h4>
                <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                  <li>Have an active Google Ads account</li>
                  <li>Note your Customer ID (found in Google Ads top-right corner)</li>
                  <li>Have a Developer Token (apply at Google Ads API Center)</li>
                  <li>Complete OAuth authorization (click Connect below)</li>
                </ol>
              </div>

              <div>
                <Label className="text-gray-300">Google Ads Customer ID *</Label>
                <Input
                  value={connectionForm.customer_id}
                  onChange={(e) => setConnectionForm({...connectionForm, customer_id: e.target.value})}
                  placeholder="123-456-7890"
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Find this in your Google Ads account top-right corner
                </p>
              </div>

              <div>
                <Label className="text-gray-300">Developer Token *</Label>
                <Input
                  type="password"
                  value={connectionForm.developer_token}
                  onChange={(e) => setConnectionForm({...connectionForm, developer_token: e.target.value})}
                  placeholder="Your Google Ads API developer token"
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Apply for developer token at Google Ads API Center
                </p>
              </div>

              <Button
                onClick={() => connectMutation.mutate(connectionForm)}
                disabled={!connectionForm.customer_id || !connectionForm.developer_token || connectMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold text-lg py-6"
              >
                <LinkIcon className="w-5 h-5 mr-2" />
                {connectMutation.isPending ? "Connecting..." : "Connect Google Ads"}
              </Button>

              {/* Benefits */}
              <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-gray-800">
                {[
                  { icon: Search, title: "Search Ads", desc: "Target high-intent keywords" },
                  { icon: Target, title: "Display Network", desc: "2M+ websites reach" },
                  { icon: BarChart3, title: "AI Optimization", desc: "Auto-optimize for best ROAS" },
                  { icon: Zap, title: "Performance Max", desc: "All channels, one campaign" }
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#0B0B0C] rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">{benefit.title}</h4>
                        <p className="text-gray-400 text-xs">{benefit.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    );
  }

  // Calculate totals
  const totalSpend = campaigns.reduce((sum, c) => sum + ((c.metrics?.cost_micros || 0) / 1000000), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0);
  const avgRoas = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + (c.metrics?.roas || 0), 0) / campaigns.length
    : 0;

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              Google Ads Manager
            </h1>
            <p className="text-gray-400">
              Account: <span className="text-white font-semibold">{config.customer_id}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("BudgetManager")}>
              <Button variant="outline" className="border-gray-700 text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Budget Manager
              </Button>
            </Link>
            <Button
              onClick={() => setShowCampaignForm(!showCampaignForm)}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Account Status */}
        <Card className={`${
          config.status === 'active'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        } rounded-2xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={config.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {config.status.toUpperCase()}
                </Badge>
                <span className="text-white font-semibold">
                  {config.account_name || "Google Ads Account"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Last Sync</p>
                  <p className="text-white text-sm">
                    {config.last_sync ? new Date(config.last_sync).toLocaleString() : 'Never'}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="border-gray-700 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 mb-3 text-blue-400" />
              <p className="text-gray-400 text-sm mb-1">Total Spend</p>
              <p className="text-3xl font-bold text-white">
                ${totalSpend.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <Target className="w-8 h-8 mb-3 text-green-400" />
              <p className="text-gray-400 text-sm mb-1">Conversions</p>
              <p className="text-3xl font-bold text-white">
                {totalConversions}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <Search className="w-8 h-8 mb-3 text-purple-400" />
              <p className="text-gray-400 text-sm mb-1">Total Clicks</p>
              <p className="text-3xl font-bold text-white">
                {totalClicks.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500 border-2 rounded-2xl">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-3 text-green-400" />
              <p className="text-gray-400 text-sm mb-1">Avg ROAS</p>
              <p className="text-3xl font-bold text-white">
                {avgRoas.toFixed(1)}x
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Form */}
        {showCampaignForm && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Create Google Ads Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div>
                <Label className="text-gray-300">Campaign Name *</Label>
                <Input
                  value={campaignForm.campaign_name}
                  onChange={(e) => setCampaignForm({...campaignForm, campaign_name: e.target.value})}
                  placeholder="Q1 Lead Generation"
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Campaign Type *</Label>
                  <Select 
                    value={campaignForm.campaign_type} 
                    onValueChange={(val) => setCampaignForm({...campaignForm, campaign_type: val})}
                  >
                    <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search (Text Ads)</SelectItem>
                      <SelectItem value="display">Display (Banner Ads)</SelectItem>
                      <SelectItem value="video">Video (YouTube Ads)</SelectItem>
                      <SelectItem value="performance_max">Performance Max (All Channels)</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="discovery">Discovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Objective *</Label>
                  <Select 
                    value={campaignForm.objective} 
                    onValueChange={(val) => setCampaignForm({...campaignForm, objective: val})}
                  >
                    <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="website_traffic">Website Traffic</SelectItem>
                      <SelectItem value="product_brand_consideration">Brand Consideration</SelectItem>
                      <SelectItem value="brand_awareness_reach">Brand Awareness</SelectItem>
                      <SelectItem value="app_promotion">App Promotion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Daily Budget (USD) *</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      type="number"
                      value={campaignForm.budget_amount}
                      onChange={(e) => setCampaignForm({...campaignForm, budget_amount: parseFloat(e.target.value) || 0})}
                      className="bg-[#0B0B0C] border-gray-700 text-white pl-8"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Bidding Strategy *</Label>
                  <Select 
                    value={campaignForm.bidding_strategy} 
                    onValueChange={(val) => setCampaignForm({...campaignForm, bidding_strategy: val})}
                  >
                    <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maximize_conversions">Maximize Conversions</SelectItem>
                      <SelectItem value="maximize_conversion_value">Maximize Conversion Value</SelectItem>
                      <SelectItem value="target_cpa">Target CPA</SelectItem>
                      <SelectItem value="target_roas">Target ROAS</SelectItem>
                      <SelectItem value="maximize_clicks">Maximize Clicks</SelectItem>
                      <SelectItem value="manual_cpc">Manual CPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {campaignForm.campaign_type === 'search' && (
                <div>
                  <Label className="text-gray-300">Keywords (one per line) *</Label>
                  <textarea
                    value={campaignForm.keywords}
                    onChange={(e) => setCampaignForm({...campaignForm, keywords: e.target.value})}
                    placeholder="ai video creation&#10;video marketing software&#10;automated video production"
                    rows={6}
                    className="mt-2 w-full p-3 bg-[#0B0B0C] border border-gray-700 rounded-lg text-white resize-none"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    💡 Start with 10-20 keywords, Google AI will expand to related terms
                  </p>
                </div>
              )}

              <div>
                <Label className="text-gray-300">Target Locations *</Label>
                <Input
                  value={campaignForm.locations}
                  onChange={(e) => setCampaignForm({...campaignForm, locations: e.target.value})}
                  placeholder="United States, Canada, United Kingdom"
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Comma-separated countries or cities
                </p>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <h4 className="text-yellow-400 font-semibold text-sm mb-2">⚡ AI Auto-Optimization Enabled</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Pause keywords with Quality Score below 5</li>
                  <li>• Scale budget on keywords with ROAS above 2.0x</li>
                  <li>• Auto-add negative keywords from search terms</li>
                  <li>• Optimize bids every 6 hours</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCampaignForm(false)}
                  variant="outline"
                  className="flex-1 border-gray-700 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createCampaignMutation.mutate(campaignForm)}
                  disabled={!campaignForm.campaign_name || createCampaignMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold"
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Active Campaigns ({campaigns.length})</span>
              {!showCampaignForm && (
                <Button
                  onClick={() => setShowCampaignForm(true)}
                  size="sm"
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-3">
                {campaigns.map((campaign) => {
                  const spend = (campaign.metrics?.cost_micros || 0) / 1000000;
                  const conversions = campaign.metrics?.conversions || 0;
                  const clicks = campaign.metrics?.clicks || 0;
                  const ctr = campaign.metrics?.ctr || 0;
                  const roas = campaign.metrics?.roas || 0;

                  return (
                    <div key={campaign.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-bold">{campaign.campaign_name}</h4>
                            <Badge className={
                              campaign.status === 'enabled' ? 'bg-green-500/20 text-green-400' :
                              campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }>
                              {campaign.status}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                              {campaign.campaign_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {campaign.objective} • {campaign.bidding_strategy.replace('_', ' ')}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                            className={campaign.status === 'enabled' 
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }
                          >
                            {campaign.status === 'enabled' ? (
                              <><Pause className="w-4 h-4 mr-1" /> Pause</>
                            ) : (
                              <><Play className="w-4 h-4 mr-1" /> Resume</>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-5 gap-3 mb-3">
                        <div className="p-3 bg-[#111317] rounded-lg text-center">
                          <p className="text-gray-500 text-xs mb-1">Spend</p>
                          <p className="text-white font-bold">${spend.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-[#111317] rounded-lg text-center">
                          <p className="text-gray-500 text-xs mb-1">Clicks</p>
                          <p className="text-white font-bold">{clicks.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-[#111317] rounded-lg text-center">
                          <p className="text-gray-500 text-xs mb-1">CTR</p>
                          <p className="text-white font-bold">{ctr.toFixed(2)}%</p>
                        </div>
                        <div className="p-3 bg-[#111317] rounded-lg text-center">
                          <p className="text-gray-500 text-xs mb-1">Conv.</p>
                          <p className="text-white font-bold">{conversions}</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg text-center border border-green-500/30">
                          <p className="text-gray-400 text-xs mb-1">ROAS</p>
                          <p className="text-green-400 font-bold text-lg">{roas.toFixed(1)}x</p>
                        </div>
                      </div>

                      {/* Keywords Preview */}
                      {campaign.targeting?.keywords && campaign.targeting.keywords.length > 0 && (
                        <div className="p-3 bg-[#111317] rounded-lg">
                          <p className="text-gray-400 text-xs mb-2">Keywords ({campaign.targeting.keywords.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {campaign.targeting.keywords.slice(0, 5).map((kw, idx) => (
                              <Badge key={idx} className="bg-gray-700 text-gray-300 text-xs">
                                {kw.text}
                              </Badge>
                            ))}
                            {campaign.targeting.keywords.length > 5 && (
                              <Badge className="bg-gray-700 text-gray-400 text-xs">
                                +{campaign.targeting.keywords.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">No campaigns yet</p>
                <p className="text-gray-500 text-sm mb-6">
                  Create your first Google Ads campaign to start driving traffic and conversions
                </p>
                <Button
                  onClick={() => setShowCampaignForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Campaign
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Types Guide */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Google Ads Campaign Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  type: "Search",
                  icon: Search,
                  desc: "Text ads on Google search results",
                  bestFor: "High-intent keywords, direct response"
                },
                {
                  type: "Display",
                  icon: Target,
                  desc: "Visual ads across 2M+ websites",
                  bestFor: "Brand awareness, retargeting"
                },
                {
                  type: "Video",
                  icon: Play,
                  desc: "YouTube pre-roll and in-stream ads",
                  bestFor: "Product demos, storytelling"
                },
                {
                  type: "Performance Max",
                  icon: Zap,
                  desc: "All Google channels in one campaign",
                  bestFor: "Maximum reach and conversions"
                },
                {
                  type: "Shopping",
                  icon: DollarSign,
                  desc: "Product listings with images and prices",
                  bestFor: "E-commerce, product sales"
                },
                {
                  type: "Discovery",
                  icon: TrendingUp,
                  desc: "Native ads in Gmail, YouTube, Discover",
                  bestFor: "Reaching new audiences"
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <h4 className="text-white font-bold text-sm">{item.type}</h4>
                    </div>
                    <p className="text-gray-300 text-xs mb-2">{item.desc}</p>
                    <p className="text-gray-500 text-xs">
                      <strong className="text-[#FFD700]">Best for:</strong> {item.bestFor}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Google Ads Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <a href="https://ads.google.com" target="_blank" rel="noopener">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Google Ads Dashboard
                </Button>
              </a>
              <a href="https://developers.google.com/google-ads/api" target="_blank" rel="noopener">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  API Documentation
                </Button>
              </a>
              <Link to={createPageUrl("CopilotGuide")}>
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Integration Guide
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}