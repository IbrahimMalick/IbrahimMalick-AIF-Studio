
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tv, // New Icon
  Palette // New Icon
} from "lucide-react";
import { motion } from "framer-motion";
import MetaAdsComposer from "@/components/MetaAdsComposer";
import ABTestManager from "@/components/ABTestManager"; // New Import
import ABTestResults from "@/components/ABTestResults"; // New Import (not used in outline, but good to have if it's related)

export default function MetaAds() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showComposer, setShowComposer] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // This state now serves A/B Testing primarily

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: campaignRuns = [] } = useQuery({
    queryKey: ["campaignRuns", user?.email],
    queryFn: () => base44.entities.CampaignRun.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  // activeCampaigns for display in TabsTrigger and AB Testing section
  const activeCampaigns = campaignRuns.filter(c => ['ACTIVE', 'LEARNING', 'SCALING', 'LAUNCHED'].includes(c.status));


  // These queries are no longer directly used in visible TabsContent as per the outline changes,
  // but keeping them in case they are used elsewhere or in future analytics/composer updates.
  const { data: adCreatives = [] } = useQuery({
    queryKey: ["adCreativeDrafts", user?.email],
    queryFn: () => base44.entities.AdCreativeDraft.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: adAssets = [] } = useQuery({
    queryKey: ["adAssets", user?.email],
    queryFn: () => base44.entities.AdAsset.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const calculateTotals = () => {
    return campaignRuns.reduce((acc, campaign) => ({
      spend: acc.spend + ((campaign.total_spend_cents || 0) / 100),
      revenue: acc.revenue + ((campaign.total_revenue_cents || 0) / 100),
      campaigns: acc.campaigns + 1,
      active: acc.active + (campaign.status === 'ACTIVE' || campaign.status === 'LEARNING' || campaign.status === 'SCALING' ? 1 : 0)
    }), { spend: 0, revenue: 0, campaigns: 0, active: 0 });
  };

  const totals = calculateTotals();
  const overallROAS = totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : 0;

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { color: "bg-gray-500/20 text-gray-400", icon: Target }, // Changed from FileText to Target as FileText removed
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
              <Target className="w-8 h-8 text-[#1E90FF]" />
              AI Meta Ads Manager
            </h1>
            <p className="text-gray-400">AI-powered Facebook & Instagram advertising</p>
          </div>
          <Button
            onClick={() => {
              setShowComposer(true);
              setActiveTab("composer");
            }}
            className="bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Total Spend</p>
                <DollarSign className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400">${totals.spend.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Revenue</p>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">${totals.revenue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">ROAS</p>
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
              <p className="text-2xl font-bold text-blue-400">{totals.campaigns}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/30 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Active</p>
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">{totals.active}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="campaigns">
              <Tv className="w-4 h-4 mr-2" />
              Campaigns ({activeCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="composer">
              <Palette className="w-4 h-4 mr-2" />
              Creative Composer
            </TabsTrigger>
            <TabsTrigger value="abtesting">
              <Target className="w-4 h-4 mr-2" />
              A/B Testing
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="space-y-4">
              {campaignRuns.map((campaign) => {
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
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                Learning Phase
                              </Badge>
                            )}
                            {campaign.auto_optimize_enabled && (
                              <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                AI Autopilot
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-3">
                            {campaign.objective?.replace('OUTCOME_', '')} • ${(campaign.daily_budget_cents / 100).toFixed(2)}/day
                          </p>

                          {/* Campaign Metrics */}
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                            <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                              <p className="text-gray-500 text-xs mb-1">Spend</p>
                              <p className="text-red-400 font-bold text-sm">
                                ${(campaign.total_spend_cents / 100 || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="p-2 bg-[#0B0B0C] rounded-lg text-center">
                              <p className="text-gray-500 text-xs mb-1">Revenue</p>
                              <p className="text-green-400 font-bold text-sm">
                                ${(campaign.total_revenue_cents / 100 || 0).toFixed(2)}
                              </p>
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
                              <p className="text-gray-500 text-xs mb-1">Optimized</p>
                              <p className="text-[#00D4C9] font-bold text-xs">
                                {campaign.last_optimized ?
                                  new Date(campaign.last_optimized).toLocaleDateString() :
                                  'Never'
                                }
                              </p>
                            </div>
                          </div>

                          {campaign.learning_notes && (
                            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <p className="text-yellow-400 text-xs mb-1">📊 Learning Phase Notes:</p>
                              <p className="text-gray-300 text-sm">{campaign.learning_notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setActiveTab("abtesting"); // Changed from "optimize" to "abtesting"
                            }}
                            className="bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-lg"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Optimize
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 hover:bg-[#111317] rounded-lg"
                          >
                            {campaign.status === 'ACTIVE' || campaign.status === 'LEARNING' || campaign.status === 'SCALING' ? (
                              <>
                                <Pause className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {campaignRuns.length === 0 && (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-4">No campaigns yet</p>
                    <p className="text-gray-500 text-sm mb-6">Create your first AI-powered Meta ad campaign</p>
                    <Button
                      onClick={() => {
                        setShowComposer(true);
                        setActiveTab("composer");
                      }}
                      className="bg-gradient-to-r from-[#1E90FF] to-[#00D4C9] text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign with AI
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Composer Tab */}
          <TabsContent value="composer">
            {user && (
              <MetaAdsComposer
                user={user}
                onCampaignCreated={() => {
                  queryClient.invalidateQueries(["campaignRuns"]);
                  setActiveTab("campaigns");
                  setShowComposer(false);
                }}
              />
            )}
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="abtesting">
            <div className="space-y-6">

              {activeCampaigns.length > 0 ? (
                <>
                  <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                          <Target className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">AI-Driven A/B Testing</h3>
                          <p className="text-gray-300 text-sm">
                            Automatically test creatives, targeting, and offers
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Select a campaign below to set up A/B tests. AI will generate variants,
                        split traffic, and automatically declare winners at 95% statistical confidence.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Campaign Selector */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Select Campaign to Test</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {activeCampaigns.map(campaign => (
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
                            <Badge className="bg-gray-700 text-gray-300 text-xs">
                              {campaign.objective}
                            </Badge>
                            <Badge className={`text-xs ${
                              campaign.status === 'LAUNCHED' ? 'bg-green-500/20 text-green-400' :
                              campaign.status === 'LEARNING' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {campaign.status}
                            </Badge>
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

                  {selectedCampaign && (
                    <ABTestManager
                      user={user}
                      campaignRun={selectedCampaign}
                      onTestCreated={(test) => {
                        queryClient.invalidateQueries(["abTests"]);
                        setSelectedCampaign(null); // Clear selection after test creation
                      }}
                    />
                  )}
                </>
              ) : (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No active campaigns to test</p>
                    <p className="text-gray-500 text-sm mb-4">Launch a campaign first to enable A/B testing</p>
                    <Button
                      onClick={() => setActiveTab("campaigns")}
                      className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                    >
                      Create Campaign
                    </Button>
                  </CardContent>
                </Card>
              )}

            </div>
          </TabsContent>

          {/* Analytics Tab (empty for now as no content provided in outline) */}
          <TabsContent value="analytics">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Detailed campaign performance and insights will appear here.</p>
                <p className="text-gray-500 text-sm mt-2">Stay tuned for advanced analytics features!</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
