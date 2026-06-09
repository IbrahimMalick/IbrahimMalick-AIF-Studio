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
  Target,
  DollarSign,
  TrendingUp,
  Plus,
  Play,
  Pause,
  BarChart3,
  Zap,
  CheckCircle2,
  Activity,
  Search,
  Settings,
  Link as LinkIcon,
  ExternalLink,
  Facebook,
  Palette
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";
import MetaAdsComposer from "@/components/MetaAdsComposer";
import ABTestManager from "@/components/ABTestManager";

export default function AdsManager() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMetaComposer, setShowMetaComposer] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Meta Ads Queries
  const { data: metaCampaigns = [] } = useQuery({
    queryKey: ["campaignRuns", user?.email],
    queryFn: () => base44.entities.CampaignRun.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: metaConnection } = useQuery({
    queryKey: ["adAccountConnection", user?.email],
    queryFn: async () => {
      const connections = await base44.entities.AdAccountConnection.filter({ user_email: user.email });
      return connections[0] || null;
    },
    enabled: !!user
  });

  // Google Ads Queries
  const { data: googleConfig } = useQuery({
    queryKey: ["googleAdsConfig", user?.email],
    queryFn: async () => {
      const configs = await base44.entities.GoogleAdsConfig.filter({ user_email: user.email });
      return configs[0] || null;
    },
    enabled: !!user
  });

  const { data: googleCampaigns = [] } = useQuery({
    queryKey: ["googleAdsCampaigns", googleConfig?.id],
    queryFn: () => base44.entities.GoogleAdsCampaign.filter({
      google_ads_config_id: googleConfig.id
    }, "-created_date"),
    enabled: !!googleConfig
  });

  // States for Google Ads connection
  const [googleConnectionForm, setGoogleConnectionForm] = useState({
    customer_id: "",
    developer_token: ""
  });

  const [googleCampaignForm, setGoogleCampaignForm] = useState({
    campaign_name: "",
    campaign_type: "search",
    objective: "leads",
    budget_amount: 50,
    bidding_strategy: "maximize_conversions",
    keywords: "",
    locations: "United States",
    daily_budget: true
  });

  // Google Ads Mutations
  const connectGoogleMutation = useMutation({
    mutationFn: async (data) => {
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
      showToast("Google Ads connected! 🎉", "success");
    }
  });

  const createGoogleCampaignMutation = useMutation({
    mutationFn: async (data) => {
      const keywords = data.keywords.split('\n').filter(k => k.trim()).map(k => ({
        text: k.trim(),
        match_type: "broad",
        max_cpc_micros: 5000000
      }));

      return await base44.entities.GoogleAdsCampaign.create({
        user_email: user.email,
        google_ads_config_id: googleConfig.id,
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
      setShowGoogleForm(false);
      setGoogleCampaignForm({
        campaign_name: "",
        campaign_type: "search",
        objective: "leads",
        budget_amount: 50,
        bidding_strategy: "maximize_conversions",
        keywords: "",
        locations: "United States",
        daily_budget: true
      });
      showToast("Google campaign created! 🚀", "success");
    }
  });

  const toggleGoogleCampaignStatus = async (campaignId, currentStatus) => {
    const newStatus = currentStatus === "enabled" ? "paused" : "enabled";
    await base44.entities.GoogleAdsCampaign.update(campaignId, { status: newStatus });
    queryClient.invalidateQueries(["googleAdsCampaigns"]);
    showToast(`Campaign ${newStatus}!`, "success");
  };

  // Calculate totals across all platforms
  const metaSpend = metaCampaigns.reduce((sum, c) => sum + ((c.total_spend_cents || 0) / 100), 0);
  const metaRevenue = metaCampaigns.reduce((sum, c) => sum + ((c.total_revenue_cents || 0) / 100), 0);
  
  const googleSpend = googleCampaigns.reduce((sum, c) => sum + ((c.metrics?.cost_micros || 0) / 1000000), 0);
  const googleConversions = googleCampaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0);
  const googleRevenue = googleCampaigns.reduce((sum, c) => sum + ((c.metrics?.conversion_value_micros || 0) / 1000000), 0);

  const totalSpend = metaSpend + googleSpend;
  const totalRevenue = metaRevenue + googleRevenue;
  const overallROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 0;
  const totalCampaigns = metaCampaigns.length + googleCampaigns.length;
  const activeCampaigns = metaCampaigns.filter(c => ['ACTIVE', 'LEARNING', 'SCALING'].includes(c.status)).length + 
                          googleCampaigns.filter(c => c.status === 'enabled').length;

  const activeMetaCampaigns = metaCampaigns.filter(c => ['ACTIVE', 'LEARNING', 'SCALING', 'LAUNCHED'].includes(c.status));

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { color: "bg-gray-500/20 text-gray-400", icon: Target },
      LAUNCHED: { color: "bg-blue-500/20 text-blue-400", icon: Play },
      LEARNING: { color: "bg-yellow-500/20 text-yellow-400", icon: Activity },
      SCALING: { color: "bg-green-500/20 text-green-400", icon: TrendingUp },
      PAUSED: { color: "bg-orange-500/20 text-orange-400", icon: Pause },
      COMPLETED: { color: "bg-purple-500/20 text-purple-400", icon: CheckCircle2 },
      ERROR: { color: "bg-red-500/20 text-red-400", icon: Target }
    };
    return badges[status] || badges.DRAFT;
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              Unified Ads Manager
            </h1>
            <p className="text-gray-400">Manage Meta & Google Ads from one dashboard</p>
          </div>
          <Link to={createPageUrl("BudgetManager")}>
            <Button variant="outline" className="border-gray-700 text-white">
              <DollarSign className="w-4 h-4 mr-2" />
              Budget Manager
            </Button>
          </Link>
        </div>

        {/* Unified Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Total Spend</p>
                <DollarSign className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400">${totalSpend.toFixed(2)}</p>
              <p className="text-gray-500 text-xs mt-1">Meta: ${metaSpend.toFixed(0)} • Google: ${googleSpend.toFixed(0)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Revenue</p>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Overall ROAS</p>
                <BarChart3 className="w-4 h-4 text-[#FFD700]" />
              </div>
              <p className="text-2xl font-bold text-[#FFD700]">{overallROAS}x</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Campaigns</p>
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400">{totalCampaigns}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Active</p>
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">{activeCampaigns}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Platform Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="meta">
              <Facebook className="w-4 h-4 mr-2" />
              Meta Ads ({metaCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="google">
              <Search className="w-4 h-4 mr-2" />
              Google Ads ({googleCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="composer">
              <Palette className="w-4 h-4 mr-2" />
              Create Campaign
            </TabsTrigger>
            <TabsTrigger value="abtesting">
              <Target className="w-4 h-4 mr-2" />
              A/B Testing
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            
            {/* Platform Comparison */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  
                  {/* Meta Stats */}
                  <div className="p-4 bg-gradient-to-br from-[#1E90FF]/10 to-[#00D4C9]/10 border border-[#1E90FF]/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Facebook className="w-6 h-6 text-[#1E90FF]" />
                      <h3 className="text-white font-bold">Meta Ads (FB/IG)</h3>
                      <Badge className={metaConnection?.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {metaConnection?.status || 'Not Connected'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Campaigns</p>
                        <p className="text-white font-bold text-lg">{metaCampaigns.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Spend</p>
                        <p className="text-white font-bold text-lg">${metaSpend.toFixed(0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">ROAS</p>
                        <p className="text-[#FFD700] font-bold text-lg">
                          {metaSpend > 0 ? (metaRevenue / metaSpend).toFixed(1) : 0}x
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveTab("meta")}
                      className="w-full bg-[#1E90FF]/20 text-[#1E90FF] hover:bg-[#1E90FF]/30"
                    >
                      Manage Meta Campaigns
                    </Button>
                  </div>

                  {/* Google Stats */}
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-green-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-6 h-6 text-blue-400" />
                      <h3 className="text-white font-bold">Google Ads</h3>
                      <Badge className={googleConfig?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {googleConfig?.status || 'Not Connected'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Campaigns</p>
                        <p className="text-white font-bold text-lg">{googleCampaigns.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Spend</p>
                        <p className="text-white font-bold text-lg">${googleSpend.toFixed(0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Conv.</p>
                        <p className="text-[#FFD700] font-bold text-lg">{googleConversions}</p>
                      </div>
                    </div>
                    {googleConfig ? (
                      <Button
                        onClick={() => setActiveTab("google")}
                        className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      >
                        Manage Google Campaigns
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setActiveTab("google")}
                        className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white"
                      >
                        Connect Google Ads
                      </Button>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  <Button
                    onClick={() => {
                      setShowMetaComposer(true);
                      setActiveTab("composer");
                    }}
                    className="h-20 bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-bold">New Meta Campaign</div>
                      <div className="text-xs opacity-80">FB & Instagram Ads</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => {
                      if (googleConfig) {
                        setShowGoogleForm(true);
                        setActiveTab("google");
                      } else {
                        setActiveTab("google");
                      }
                    }}
                    className="h-20 bg-gradient-to-r from-blue-500 to-green-500 text-white"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-bold">New Google Campaign</div>
                      <div className="text-xs opacity-80">Search & Display Ads</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setActiveTab("abtesting")}
                    variant="outline"
                    className="h-20 border-gray-700 text-white"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-bold">A/B Testing</div>
                      <div className="text-xs text-gray-400">Optimize campaigns</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {(metaCampaigns.length > 0 || googleCampaigns.length > 0) && (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...metaCampaigns.slice(0, 3).map(c => ({...c, platform: 'meta'})),
                      ...googleCampaigns.slice(0, 2).map(c => ({...c, platform: 'google'}))]
                      .slice(0, 5)
                      .map((campaign, idx) => (
                        <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {campaign.platform === 'meta' ? (
                              <Facebook className="w-5 h-5 text-[#1E90FF]" />
                            ) : (
                              <Search className="w-5 h-5 text-blue-400" />
                            )}
                            <div>
                              <p className="text-white font-semibold text-sm">{campaign.campaign_name}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge className="bg-gray-700 text-gray-300 text-xs capitalize">
                                  {campaign.platform}
                                </Badge>
                                {campaign.status && (
                                  <Badge className={
                                    ['ACTIVE', 'enabled', 'LEARNING', 'SCALING'].includes(campaign.status)
                                      ? 'bg-green-500/20 text-green-400 text-xs'
                                      : 'bg-gray-500/20 text-gray-400 text-xs'
                                  }>
                                    {campaign.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveTab(campaign.platform)}
                            className="text-[#00D4C9]"
                          >
                            View →
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* META ADS TAB */}
          <TabsContent value="meta" className="space-y-4">
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Facebook className="w-6 h-6 text-[#1E90FF]" />
                Meta Ads Campaigns
              </h2>
              <Button
                onClick={() => {
                  setShowMetaComposer(true);
                  setActiveTab("composer");
                }}
                className="bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Meta Campaign
              </Button>
            </div>

            {metaCampaigns.length > 0 ? (
              <div className="space-y-4">
                {metaCampaigns.map((campaign) => {
                  const badge = getStatusBadge(campaign.status);
                  const StatusIcon = badge.icon;
                  const roas = campaign.total_spend_cents > 0 ?
                    (campaign.total_revenue_cents / campaign.total_spend_cents).toFixed(2) : 0;

                  return (
                    <Card key={campaign.id} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#1E90FF] transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-white">{campaign.campaign_name}</h3>
                              <Badge className={badge.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {campaign.status}
                              </Badge>
                              {campaign.learning_phase && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Learning Phase</Badge>
                              )}
                              {campaign.auto_optimize_enabled && (
                                <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                  <Zap className="w-3 h-3 mr-1" />AI Autopilot
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              {campaign.objective?.replace('OUTCOME_', '')} • ${(campaign.daily_budget_cents / 100).toFixed(2)}/day
                            </p>

                            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                              <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                                <p className="text-gray-500 text-xs mb-1">Spend</p>
                                <p className="text-red-400 font-bold text-sm">${(campaign.total_spend_cents / 100 || 0).toFixed(2)}</p>
                              </div>
                              <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                                <p className="text-gray-500 text-xs mb-1">Revenue</p>
                                <p className="text-green-400 font-bold text-sm">${(campaign.total_revenue_cents / 100 || 0).toFixed(2)}</p>
                              </div>
                              <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                                <p className="text-gray-500 text-xs mb-1">ROAS</p>
                                <p className={`font-bold text-sm ${roas >= 2 ? 'text-green-400' : roas >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {roas}x
                                </p>
                              </div>
                              <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                                <p className="text-gray-500 text-xs mb-1">Ad Sets</p>
                                <p className="text-white font-bold text-sm">{campaign.ad_set_ids?.length || 0}</p>
                              </div>
                              <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                                <p className="text-gray-500 text-xs mb-1">Creatives</p>
                                <p className="text-white font-bold text-sm">{campaign.creative_draft_ids?.length || 0}</p>
                              </div>
                              <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                                <p className="text-gray-500 text-xs mb-1">Active</p>
                                <p className="text-white font-bold text-sm">{campaign.status === 'ACTIVE' ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setActiveTab("abtesting");
                              }}
                              className="bg-[#FFD700] text-black hover:bg-[#FFC700]"
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              Optimize
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Facebook className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">No Meta campaigns yet</p>
                  <Button
                    onClick={() => {
                      setShowMetaComposer(true);
                      setActiveTab("composer");
                    }}
                    className="bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Meta Campaign
                  </Button>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* GOOGLE ADS TAB */}
          <TabsContent value="google" className="space-y-4">

            {!googleConfig ? (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Connect Google Ads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-400 font-semibold mb-2">Setup Requirements</h4>
                    <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
                      <li>Have an active Google Ads account</li>
                      <li>Note your Customer ID (top-right corner)</li>
                      <li>Have a Developer Token (apply at Google Ads API Center)</li>
                    </ol>
                  </div>

                  <div>
                    <Label className="text-gray-300">Customer ID *</Label>
                    <Input
                      value={googleConnectionForm.customer_id}
                      onChange={(e) => setGoogleConnectionForm({...googleConnectionForm, customer_id: e.target.value})}
                      placeholder="123-456-7890"
                      className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Developer Token *</Label>
                    <Input
                      type="password"
                      value={googleConnectionForm.developer_token}
                      onChange={(e) => setGoogleConnectionForm({...googleConnectionForm, developer_token: e.target.value})}
                      placeholder="Your API developer token"
                      className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>

                  <Button
                    onClick={() => connectGoogleMutation.mutate(googleConnectionForm)}
                    disabled={!googleConnectionForm.customer_id || !googleConnectionForm.developer_token || connectGoogleMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold text-lg py-6"
                  >
                    <LinkIcon className="w-5 h-5 mr-2" />
                    {connectGoogleMutation.isPending ? "Connecting..." : "Connect Google Ads"}
                  </Button>

                </CardContent>
              </Card>
            ) : (
              <>
                {/* Google Account Status */}
                <Card className={`${
                  googleConfig.status === 'active' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                } rounded-2xl`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="w-6 h-6 text-blue-400" />
                        <div>
                          <p className="text-white font-semibold">{googleConfig.account_name || "Google Ads Account"}</p>
                          <p className="text-gray-400 text-sm">Customer ID: {googleConfig.customer_id}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-white"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Campaign Form */}
                {showGoogleForm && (
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white">Create Google Campaign</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                      <div>
                        <Label className="text-gray-300">Campaign Name *</Label>
                        <Input
                          value={googleCampaignForm.campaign_name}
                          onChange={(e) => setGoogleCampaignForm({...googleCampaignForm, campaign_name: e.target.value})}
                          placeholder="Q1 Lead Generation"
                          className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Campaign Type *</Label>
                          <Select 
                            value={googleCampaignForm.campaign_type} 
                            onValueChange={(val) => setGoogleCampaignForm({...googleCampaignForm, campaign_type: val})}
                          >
                            <SelectTrigger className="mt-2 bg-[#0B0B0C] border-gray-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="search">Search (Text Ads)</SelectItem>
                              <SelectItem value="display">Display (Banner Ads)</SelectItem>
                              <SelectItem value="video">Video (YouTube)</SelectItem>
                              <SelectItem value="performance_max">Performance Max</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-gray-300">Daily Budget *</Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <Input
                              type="number"
                              value={googleCampaignForm.budget_amount}
                              onChange={(e) => setGoogleCampaignForm({...googleCampaignForm, budget_amount: parseFloat(e.target.value) || 0})}
                              className="bg-[#0B0B0C] border-gray-700 text-white pl-8"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>

                      {googleCampaignForm.campaign_type === 'search' && (
                        <div>
                          <Label className="text-gray-300">Keywords (one per line) *</Label>
                          <textarea
                            value={googleCampaignForm.keywords}
                            onChange={(e) => setGoogleCampaignForm({...googleCampaignForm, keywords: e.target.value})}
                            placeholder="ai video creation&#10;video marketing software&#10;automated video production"
                            rows={6}
                            className="mt-2 w-full p-3 bg-[#0B0B0C] border border-gray-700 rounded-lg text-white resize-none"
                          />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowGoogleForm(false)}
                          variant="outline"
                          className="flex-1 border-gray-700 text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => createGoogleCampaignMutation.mutate(googleCampaignForm)}
                          disabled={!googleCampaignForm.campaign_name || createGoogleCampaignMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold"
                        >
                          {createGoogleCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                )}

                {/* Google Campaigns List */}
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Campaigns ({googleCampaigns.length})</span>
                      {!showGoogleForm && (
                        <Button
                          onClick={() => setShowGoogleForm(true)}
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
                    {googleCampaigns.length > 0 ? (
                      <div className="space-y-3">
                        {googleCampaigns.map((campaign) => {
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
                                  <p className="text-gray-400 text-sm mb-3">
                                    {campaign.objective} • {campaign.bidding_strategy.replace('_', ' ')}
                                  </p>

                                  <div className="grid grid-cols-5 gap-3">
                                    <div className="p-2 bg-[#111317] rounded-lg text-center">
                                      <p className="text-gray-500 text-xs mb-1">Spend</p>
                                      <p className="text-white font-bold text-sm">${spend.toFixed(0)}</p>
                                    </div>
                                    <div className="p-2 bg-[#111317] rounded-lg text-center">
                                      <p className="text-gray-500 text-xs mb-1">Clicks</p>
                                      <p className="text-white font-bold text-sm">{clicks}</p>
                                    </div>
                                    <div className="p-2 bg-[#111317] rounded-lg text-center">
                                      <p className="text-gray-500 text-xs mb-1">CTR</p>
                                      <p className="text-white font-bold text-sm">{ctr.toFixed(1)}%</p>
                                    </div>
                                    <div className="p-2 bg-[#111317] rounded-lg text-center">
                                      <p className="text-gray-500 text-xs mb-1">Conv.</p>
                                      <p className="text-white font-bold text-sm">{conversions}</p>
                                    </div>
                                    <div className="p-2 bg-green-500/10 rounded-lg text-center border border-green-500/30">
                                      <p className="text-gray-400 text-xs mb-1">ROAS</p>
                                      <p className="text-green-400 font-bold">{roas.toFixed(1)}x</p>
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  onClick={() => toggleGoogleCampaignStatus(campaign.id, campaign.status)}
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
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-2">No Google campaigns yet</p>
                        <Button
                          onClick={() => setShowGoogleForm(true)}
                          className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Campaign
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

          </TabsContent>

          {/* COMPOSER TAB */}
          <TabsContent value="composer">
            {user && (
              <MetaAdsComposer
                user={user}
                onCampaignCreated={() => {
                  queryClient.invalidateQueries(["campaignRuns"]);
                  setActiveTab("meta");
                  setShowMetaComposer(false);
                }}
              />
            )}
          </TabsContent>

          {/* A/B TESTING TAB */}
          <TabsContent value="abtesting">
            <div className="space-y-6">
              {activeMetaCampaigns.length > 0 ? (
                <>
                  <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
                    <CardContent className="p-6">
                      <h3 className="text-white font-bold text-lg mb-2">AI-Driven A/B Testing</h3>
                      <p className="text-gray-400 text-sm">
                        Select a Meta campaign to set up A/B tests. AI will generate variants and declare winners automatically.
                      </p>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Select Campaign to Test</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {activeMetaCampaigns.map(campaign => (
                        <div
                          key={campaign.id}
                          onClick={() => setSelectedCampaign(campaign)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedCampaign?.id === campaign.id
                              ? 'border-[#FFD700] bg-[#FFD700]/10'
                              : 'border-gray-800 bg-[#0B0B0C] hover:border-gray-700'
                          }`}
                        >
                          <h5 className="text-white font-semibold mb-1">{campaign.campaign_name}</h5>
                          <div className="flex gap-2 mb-2">
                            <Badge className="bg-[#1E90FF]/20 text-[#1E90FF] text-xs">Meta</Badge>
                            <Badge className="bg-gray-700 text-gray-300 text-xs">{campaign.objective}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500">Spend</p>
                              <p className="text-white font-semibold">${(campaign.total_spend_cents / 100).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">ROAS</p>
                              <p className="text-white font-semibold">
                                {((campaign.total_revenue_cents / campaign.total_spend_cents) || 0).toFixed(2)}x
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCampaign && user && (
                    <ABTestManager
                      user={user}
                      campaignRun={selectedCampaign}
                      onTestCreated={() => {
                        queryClient.invalidateQueries(["abTests"]);
                        setSelectedCampaign(null);
                      }}
                    />
                  )}
                </>
              ) : (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No active campaigns to test</p>
                    <p className="text-gray-500 text-sm mb-4">Launch a Meta campaign first to enable A/B testing</p>
                    <Button
                      onClick={() => setActiveTab("composer")}
                      className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                    >
                      Create Campaign
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

        </Tabs>

        {/* Quick Links */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Ads Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-3">
              <a href="https://business.facebook.com" target="_blank" rel="noopener">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Meta Business
                </Button>
              </a>
              <a href="https://ads.google.com" target="_blank" rel="noopener">
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Google Ads
                </Button>
              </a>
              <Link to={createPageUrl("BudgetManager")}>
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget Manager
                </Button>
              </Link>
              <Link to={createPageUrl("CopilotGuide")}>
                <Button variant="outline" className="w-full border-gray-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ads Guide
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}