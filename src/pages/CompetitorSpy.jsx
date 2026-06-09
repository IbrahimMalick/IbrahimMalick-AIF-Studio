import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  AlertCircle,
  Zap,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

export default function CompetitorSpy() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    competitor_name: "",
    competitor_url: "",
    industry: ""
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: competitors = [] } = useQuery({
    queryKey: ["competitors", user?.email],
    queryFn: () => base44.entities.CompetitorProfile.filter({ user_email: user.email }),
    enabled: !!user
  });

  const { data: competitorPosts = [] } = useQuery({
    queryKey: ["competitorPosts"],
    queryFn: () => base44.entities.CompetitorPost.list("-posted_at", 50),
    enabled: competitors.length > 0
  });

  const addCompetitorMutation = useMutation({
    mutationFn: (data) => base44.entities.CompetitorProfile.create({
      ...data,
      user_email: user.email,
      monitoring_enabled: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["competitors"]);
      setShowAddForm(false);
      setNewCompetitor({ competitor_name: "", competitor_url: "", industry: "" });
      
      // Simulate fetching posts
      alert("✅ Competitor added! We're now tracking their content...");
    }
  });

  const viralPosts = competitorPosts.filter(p => p.is_viral);
  const adPosts = competitorPosts.filter(p => p.is_ad);

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Competitor Spy Tool</h1>
            <p className="text-gray-400">Track competitors and get alerts when they post 🕵️</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Track Competitor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Competitors Tracked</span>
                <Eye className="w-5 h-5 text-[#FF8C00]" />
              </div>
              <p className="text-3xl font-bold text-white">{competitors.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Posts This Week</span>
                <BarChart3 className="w-5 h-5 text-[#00D4C9]" />
              </div>
              <p className="text-3xl font-bold text-white">{competitorPosts.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Viral Content</span>
                <TrendingUp className="w-5 h-5 text-[#FFD700]" />
              </div>
              <p className="text-3xl font-bold text-white">{viralPosts.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Ads Detected</span>
                <Zap className="w-5 h-5 text-[#FF4433]" />
              </div>
              <p className="text-3xl font-bold text-white">{adPosts.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Competitor Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Add New Competitor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Business Name</label>
                    <Input
                      value={newCompetitor.competitor_name}
                      onChange={(e) => setNewCompetitor({...newCompetitor, competitor_name: e.target.value})}
                      placeholder="e.g., Acme Realty"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Website URL</label>
                    <Input
                      value={newCompetitor.competitor_url}
                      onChange={(e) => setNewCompetitor({...newCompetitor, competitor_url: e.target.value})}
                      placeholder="https://competitor.com"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Industry</label>
                  <Input
                    value={newCompetitor.industry}
                    onChange={(e) => setNewCompetitor({...newCompetitor, industry: e.target.value})}
                    placeholder="e.g., Real Estate, Fitness, Coaching"
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => addCompetitorMutation.mutate(newCompetitor)}
                    disabled={!newCompetitor.competitor_name || addCompetitorMutation.isLoading}
                    className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl"
                  >
                    Start Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Competitors List & Posts */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-[#111317] border border-gray-800 rounded-xl">
            <TabsTrigger value="posts">Latest Posts</TabsTrigger>
            <TabsTrigger value="viral">Viral Content</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {competitorPosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {competitorPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FF8C00] transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs">
                            {post.platform}
                          </Badge>
                          {post.is_viral && (
                            <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Viral
                            </Badge>
                          )}
                        </div>
                        <p className="text-white text-sm mb-3 line-clamp-3">{post.post_text}</p>
                        <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                          <div className="text-center">
                            <Heart className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <span className="text-gray-400">{post.likes_count}</span>
                          </div>
                          <div className="text-center">
                            <MessageSquare className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <span className="text-gray-400">{post.comments_count}</span>
                          </div>
                          <div className="text-center">
                            <Share2 className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <span className="text-gray-400">{post.shares_count}</span>
                          </div>
                        </div>
                        {post.insights && (
                          <div className="p-3 bg-[#1a1a1f] rounded-lg mb-3">
                            <p className="text-xs text-gray-400">{post.insights}</p>
                          </div>
                        )}
                        <Button
                          onClick={() => window.open(post.post_url, "_blank")}
                          variant="outline"
                          size="sm"
                          className="w-full border-gray-700 hover:bg-[#1a1a1f] rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Post
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No posts tracked yet</p>
                    <p className="text-gray-600 text-sm">Add a competitor to start tracking their content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viral">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {viralPosts.length > 0 ? (
                  <div className="space-y-4">
                    {viralPosts.map((post) => (
                      <div key={post.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-[#FFD700]/30">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-[#FFD700]" />
                              <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                Viral - {post.engagement_rate}% engagement
                              </Badge>
                            </div>
                            <p className="text-white mb-3">{post.post_text}</p>
                            {post.insights && (
                              <div className="p-3 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg">
                                <p className="text-sm text-gray-300"><strong>Why it went viral:</strong> {post.insights}</p>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => window.open(post.post_url, "_blank")}
                            size="sm"
                            className="bg-[#FFD700] text-black hover:bg-[#FFE55C] rounded-lg"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No viral content detected yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {adPosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {adPosts.map((post) => (
                      <div key={post.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-[#FF4433]/30">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-[#FF4433]/20 text-[#FF4433] text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Paid Ad
                          </Badge>
                          <span className="text-gray-500 text-xs">{post.platform}</span>
                        </div>
                        <p className="text-white mb-3">{post.post_text}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => window.open(post.post_url, "_blank")}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-700 hover:bg-[#1a1a1f] rounded-lg"
                          >
                            View Ad
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#FF4433] text-white hover:bg-[#FF5544] rounded-lg"
                          >
                            Analyze
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No ads detected yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {competitors.length > 0 ? (
                  <div className="space-y-4">
                    {competitors.map((comp) => (
                      <div key={comp.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold mb-1">{comp.competitor_name}</h3>
                            <p className="text-gray-400 text-sm mb-2">{comp.industry}</p>
                            <div className="flex flex-wrap gap-2">
                              {comp.platforms_tracked?.map(platform => (
                                <Badge key={platform} className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge className={`${
                            comp.monitoring_enabled 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {comp.monitoring_enabled ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No competitors tracked</p>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl"
                    >
                      Add Your First Competitor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}