import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Store,
  ShoppingCart,
  Star,
  TrendingUp,
  DollarSign,
  Package,
  Search,
  Filter,
  Play,
  Download,
  Heart,
  Share2,
  CheckCircle2,
  Zap,
  Upload,
  Eye,
  Users,
  Award,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "@/components/AudioSystem";
import { showToast } from "@/components/ToastNotification";

export default function Marketplace() {
  const queryClient = useQueryClient();
  const audio = useAudioFeedback();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showSellDialog, setShowSellDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const [sellFormData, setSellFormData] = useState({
    automation_name: "",
    automation_type: "posting_workflow",
    description: "",
    price_usd: 29,
    category: "social_media",
    tags: "",
    preview_image_url: "",
    demo_video_url: "",
    automation_json: ""
  });

  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    review_text: "",
    pros: "",
    cons: "",
    would_recommend: true
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: automations = [] } = useQuery({
    queryKey: ["marketplace", selectedCategory, searchQuery],
    queryFn: async () => {
      let results = await base44.entities.AutomationMarketplace.filter({
        is_approved: true
      });
      
      if (selectedCategory !== "all") {
        results = results.filter(a => a.category === selectedCategory);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(a => 
          a.automation_name.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.tags?.some(t => t.toLowerCase().includes(query))
        );
      }
      
      return results.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (b.sales_count || 0) - (a.sales_count || 0);
      });
    },
  });

  const { data: myPurchases = [] } = useQuery({
    queryKey: ["myPurchases", user?.email],
    queryFn: () => base44.entities.MarketplacePurchase.filter({
      buyer_email: user.email
    }),
    enabled: !!user,
  });

  const { data: mySales = [] } = useQuery({
    queryKey: ["mySales", user?.email],
    queryFn: () => base44.entities.AutomationMarketplace.filter({
      seller_email: user.email
    }),
    enabled: !!user,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", selectedAutomation?.id],
    queryFn: () => base44.entities.MarketplaceReview.filter({
      automation_id: selectedAutomation.id
    }),
    enabled: !!selectedAutomation,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (automation) => {
      const platformCommission = automation.price_usd * (automation.commission_rate / 100);
      const sellerPayout = automation.price_usd - platformCommission;

      const purchase = await base44.entities.MarketplacePurchase.create({
        buyer_email: user.email,
        seller_email: automation.seller_email,
        automation_id: automation.id,
        purchase_price: automation.price_usd,
        platform_commission: platformCommission,
        seller_payout: sellerPayout,
        transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "completed",
        installed: false
      });

      // Update automation stats
      await base44.entities.AutomationMarketplace.update(automation.id, {
        sales_count: (automation.sales_count || 0) + 1,
        revenue_generated: (automation.revenue_generated || 0) + automation.price_usd,
        installation_count: (automation.installation_count || 0) + 1
      });

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["marketplace"]);
      queryClient.invalidateQueries(["myPurchases"]);
      setShowPurchaseDialog(false);
      audio.playSuccess();
      showToast("✅ Automation purchased! Ready to install.", "success");
    },
  });

  const listAutomationMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationMarketplace.create({
      ...data,
      seller_email: user.email,
      tags: data.tags.split(",").map(t => t.trim()),
      is_approved: false,
      is_featured: false,
      sales_count: 0,
      revenue_generated: 0,
      installation_count: 0,
      review_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["mySales"]);
      setShowSellDialog(false);
      setSellFormData({
        automation_name: "",
        automation_type: "posting_workflow",
        description: "",
        price_usd: 29,
        category: "social_media",
        tags: "",
        preview_image_url: "",
        demo_video_url: "",
        automation_json: ""
      });
      audio.playSuccess();
      showToast("🎉 Automation submitted for review!", "success");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data) => base44.entities.MarketplaceReview.create({
      reviewer_email: user.email,
      automation_id: selectedAutomation.id,
      rating: data.rating,
      review_text: data.review_text,
      pros: data.pros.split(",").map(p => p.trim()).filter(Boolean),
      cons: data.cons.split(",").map(c => c.trim()).filter(Boolean),
      would_recommend: data.would_recommend,
      helpful_count: 0
    }),
    onSuccess: async () => {
      // Update automation rating
      const allReviews = await base44.entities.MarketplaceReview.filter({
        automation_id: selectedAutomation.id
      });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length + 1);
      
      await base44.entities.AutomationMarketplace.update(selectedAutomation.id, {
        rating: parseFloat(avgRating.toFixed(1)),
        review_count: (selectedAutomation.review_count || 0) + 1
      });

      queryClient.invalidateQueries(["marketplace"]);
      queryClient.invalidateQueries(["reviews"]);
      setShowReviewDialog(false);
      setReviewFormData({
        rating: 5,
        review_text: "",
        pros: "",
        cons: "",
        would_recommend: true
      });
      audio.playSuccess();
      showToast("⭐ Thank you for your review!", "success");
    },
  });

  const categories = [
    { value: "all", label: "All Categories", icon: Store },
    { value: "social_media", label: "Social Media", icon: Share2 },
    { value: "email_marketing", label: "Email Marketing", icon: Zap },
    { value: "video_creation", label: "Video Creation", icon: Play },
    { value: "ads", label: "Advertising", icon: TrendingUp },
    { value: "seo", label: "SEO", icon: Search },
    { value: "analytics", label: "Analytics", icon: Eye }
  ];

  const automationTypes = [
    { value: "funnel", label: "Complete Funnel" },
    { value: "video_script", label: "Video Script Template" },
    { value: "posting_workflow", label: "Posting Workflow" },
    { value: "email_sequence", label: "Email Sequence" },
    { value: "ad_campaign", label: "Ad Campaign Template" },
    { value: "content_calendar", label: "Content Calendar" },
    { value: "engagement_bot", label: "Engagement Bot" }
  ];

  const hasPurchased = (automationId) => {
    return myPurchases.some(p => p.automation_id === automationId);
  };

  const totalRevenue = mySales.reduce((sum, a) => sum + (a.revenue_generated || 0), 0);
  const totalSales = mySales.reduce((sum, a) => sum + (a.sales_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 heading-font flex items-center gap-3">
              <Store className="w-10 h-10 text-[#FFD700]" />
              Automation Marketplace
            </h1>
            <p className="text-gray-400">Buy & sell powerful automations created by the community</p>
          </div>
          <Button
            onClick={() => setShowSellDialog(true)}
            className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
          >
            <Upload className="w-4 h-4 mr-2" />
            Sell Your Automation
          </Button>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="purchased">My Purchases</TabsTrigger>
            <TabsTrigger value="selling">My Sales</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search & Filters */}
            <Card className="frosted-card border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search automations..."
                      className="pl-10 bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-64 bg-[#0C0C0C] border-gray-700 text-white rounded-xl">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Automations Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {automations.map((automation, idx) => (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="frosted-card border-gray-800 rounded-2xl hover:border-[#FFD700]/30 transition-all cursor-pointer h-full flex flex-col"
                      onClick={() => {
                        setSelectedAutomation(automation);
                        audio.playClick();
                      }}
                    >
                      {automation.is_featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold">
                            <Award className="w-3 h-3 mr-1" />
                            FEATURED
                          </Badge>
                        </div>
                      )}

                      {automation.preview_image_url ? (
                        <div className="h-48 bg-[#0C0C0C] rounded-t-2xl overflow-hidden">
                          <img
                            src={automation.preview_image_url}
                            alt={automation.automation_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 rounded-t-2xl flex items-center justify-center">
                          <Package className="w-16 h-16 text-[#FFD700]" />
                        </div>
                      )}

                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-2 heading-font">
                            {automation.automation_name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {automation.description}
                          </p>

                          <div className="flex items-center gap-3 mb-4">
                            {automation.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                                <span className="text-white font-semibold text-sm">
                                  {automation.rating.toFixed(1)}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  ({automation.review_count || 0})
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Download className="w-3 h-3" />
                              {automation.sales_count || 0} sales
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {automation.tags?.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-gray-700 text-gray-400">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                          <div>
                            <p className="text-3xl font-bold text-[#FFD700] heading-font">
                              ${automation.price_usd}
                            </p>
                          </div>
                          {hasPurchased(automation.id) ? (
                            <Badge className="bg-green-500/20 text-green-400 border-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Owned
                            </Badge>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAutomation(automation);
                                setShowPurchaseDialog(true);
                                audio.playWhoosh();
                              }}
                              className="bg-gradient-to-r from-[#00D4C9] to-[#00A8A0] text-white rounded-lg"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Buy Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {automations.length === 0 && (
              <Card className="frosted-card border-gray-800 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">
                    {searchQuery || selectedCategory !== "all" 
                      ? "No automations found matching your search" 
                      : "No automations available yet"}
                  </p>
                  {user?.role === 'admin' && (
                    <Button
                      onClick={() => setShowSellDialog(true)}
                      className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
                    >
                      Be the First to List
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Purchases Tab */}
          <TabsContent value="purchased">
            <Card className="frosted-card border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#00D4C9]" />
                  My Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myPurchases.length > 0 ? (
                  <div className="space-y-4">
                    {myPurchases.map((purchase) => {
                      const automation = automations.find(a => a.id === purchase.automation_id);
                      return (
                        <div
                          key={purchase.id}
                          className="p-4 rounded-xl bg-[#0C0C0C] border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 flex items-center justify-center">
                              <Package className="w-8 h-8 text-[#FFD700]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">
                                {automation?.automation_name || "Automation"}
                              </h4>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-sm">
                                  Purchased {new Date(purchase.created_date).toLocaleDateString()}
                                </span>
                                <Badge className={`text-xs ${
                                  purchase.installed ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {purchase.installed ? 'Installed' : 'Not Installed'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold text-lg">
                              ${purchase.purchase_price.toFixed(2)}
                            </span>
                            <Button
                              onClick={() => {
                                setSelectedAutomation(automation);
                                setShowReviewDialog(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-[#FFD700]/30 hover:bg-[#FFD700]/10 rounded-lg"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-[#00D4C9] to-[#00A8A0] text-white rounded-lg"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Install
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">You haven't purchased any automations yet</p>
                    <Button
                      onClick={() => document.querySelector('[value="browse"]').click()}
                      className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Sales Tab */}
          <TabsContent value="selling" className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="frosted-card border-gray-800 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FF88] to-[#00CC6A] flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-3xl font-bold text-white heading-font">
                        ${totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="frosted-card border-gray-800 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Sales</p>
                      <p className="text-3xl font-bold text-white heading-font">
                        {totalSales}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="frosted-card border-gray-800 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4C9] to-[#1E90FF] flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Listings</p>
                      <p className="text-3xl font-bold text-white heading-font">
                        {mySales.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My Listings */}
            <Card className="frosted-card border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#FFD700]" />
                  My Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mySales.length > 0 ? (
                  <div className="space-y-4">
                    {mySales.map((automation) => (
                      <div
                        key={automation.id}
                        className="p-4 rounded-xl bg-[#0C0C0C] border border-gray-800 hover:border-gray-700 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-semibold">
                                {automation.automation_name}
                              </h4>
                              <Badge className={`text-xs ${
                                automation.is_approved ? 'bg-green-500/20 text-green-400' : 
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {automation.is_approved ? 'Approved' : 'Pending Review'}
                              </Badge>
                              {automation.is_featured && (
                                <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              {automation.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#FFD700] heading-font">
                              ${automation.price_usd}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 pt-3 border-t border-gray-800">
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-1">Sales</p>
                            <p className="text-white font-semibold">
                              {automation.sales_count || 0}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-1">Revenue</p>
                            <p className="text-white font-semibold">
                              ${(automation.revenue_generated || 0).toFixed(0)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-1">Rating</p>
                            <p className="text-white font-semibold flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                              {automation.rating ? automation.rating.toFixed(1) : 'N/A'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-1">Installs</p>
                            <p className="text-white font-semibold">
                              {automation.installation_count || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">You haven't listed any automations yet</p>
                    <Button
                      onClick={() => setShowSellDialog(true)}
                      className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      List Your First Automation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="bg-[#151515] border-gray-800 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white heading-font text-2xl">
              Purchase Automation
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete your purchase to access this automation
            </DialogDescription>
          </DialogHeader>

          {selectedAutomation && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#0C0C0C] border border-gray-800">
                <h3 className="text-white font-bold mb-2">{selectedAutomation.automation_name}</h3>
                <p className="text-gray-400 text-sm mb-3">{selectedAutomation.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <span className="text-gray-400">Price</span>
                  <span className="text-3xl font-bold text-[#FFD700] heading-font">
                    ${selectedAutomation.price_usd}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Instant access after purchase</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Lifetime updates included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>

              <Button
                onClick={() => purchaseMutation.mutate(selectedAutomation)}
                disabled={purchaseMutation.isLoading}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl h-12"
              >
                {purchaseMutation.isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Complete Purchase - ${selectedAutomation.price_usd}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By purchasing, you agree to the marketplace terms and conditions
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="bg-[#151515] border-gray-800 rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white heading-font text-2xl">
              List Your Automation
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your automation with the community and earn revenue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Automation Name *</label>
              <Input
                value={sellFormData.automation_name}
                onChange={(e) => setSellFormData({...sellFormData, automation_name: e.target.value})}
                placeholder="Ultimate Social Media Posting Workflow"
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Type *</label>
                <Select 
                  value={sellFormData.automation_type}
                  onValueChange={(value) => setSellFormData({...sellFormData, automation_type: value})}
                >
                  <SelectTrigger className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {automationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Category *</label>
                <Select 
                  value={sellFormData.category}
                  onValueChange={(value) => setSellFormData({...sellFormData, category: value})}
                >
                  <SelectTrigger className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.value !== 'all').map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description *</label>
              <Textarea
                value={sellFormData.description}
                onChange={(e) => setSellFormData({...sellFormData, description: e.target.value})}
                placeholder="Describe what your automation does and what problems it solves..."
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Price (USD) *</label>
              <Input
                type="number"
                value={sellFormData.price_usd}
                onChange={(e) => setSellFormData({...sellFormData, price_usd: parseFloat(e.target.value)})}
                placeholder="29.00"
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
              <p className="text-xs text-gray-500 mt-1">
                Platform takes 15% commission. You'll earn ${(sellFormData.price_usd * 0.85).toFixed(2)} per sale.
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Tags (comma-separated)</label>
              <Input
                value={sellFormData.tags}
                onChange={(e) => setSellFormData({...sellFormData, tags: e.target.value})}
                placeholder="instagram, automation, content, scheduling"
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Preview Image URL</label>
              <Input
                value={sellFormData.preview_image_url}
                onChange={(e) => setSellFormData({...sellFormData, preview_image_url: e.target.value})}
                placeholder="https://..."
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Demo Video URL</label>
              <Input
                value={sellFormData.demo_video_url}
                onChange={(e) => setSellFormData({...sellFormData, demo_video_url: e.target.value})}
                placeholder="https://..."
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Automation JSON Config *</label>
              <Textarea
                value={sellFormData.automation_json}
                onChange={(e) => setSellFormData({...sellFormData, automation_json: e.target.value})}
                placeholder='{"nodes": [...], "connections": [...]}'
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl font-mono text-xs min-h-[150px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Export your automation configuration as JSON
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSellDialog(false)}
                className="flex-1 border-gray-700 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => listAutomationMutation.mutate(sellFormData)}
                disabled={listAutomationMutation.isLoading || !sellFormData.automation_name || !sellFormData.description || !sellFormData.automation_json}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
              >
                {listAutomationMutation.isLoading ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-[#151515] border-gray-800 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white heading-font text-2xl">
              Write a Review
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Help others by sharing your experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewFormData({...reviewFormData, rating})}
                    className="transition-all"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        rating <= reviewFormData.rating 
                          ? 'text-[#FFD700] fill-[#FFD700]' 
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Review</label>
              <Textarea
                value={reviewFormData.review_text}
                onChange={(e) => setReviewFormData({...reviewFormData, review_text: e.target.value})}
                placeholder="Share your thoughts about this automation..."
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Pros (comma-separated)</label>
              <Input
                value={reviewFormData.pros}
                onChange={(e) => setReviewFormData({...reviewFormData, pros: e.target.value})}
                placeholder="Easy to use, Great results, Time-saving"
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Cons (comma-separated)</label>
              <Input
                value={reviewFormData.cons}
                onChange={(e) => setReviewFormData({...reviewFormData, cons: e.target.value})}
                placeholder="Could use more options"
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0C0C0C] border border-gray-800">
              <input
                type="checkbox"
                checked={reviewFormData.would_recommend}
                onChange={(e) => setReviewFormData({...reviewFormData, would_recommend: e.target.checked})}
                className="w-5 h-5"
              />
              <label className="text-white">I would recommend this automation</label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                className="flex-1 border-gray-700 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => reviewMutation.mutate(reviewFormData)}
                disabled={reviewMutation.isLoading || !reviewFormData.review_text}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
              >
                {reviewMutation.isLoading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}