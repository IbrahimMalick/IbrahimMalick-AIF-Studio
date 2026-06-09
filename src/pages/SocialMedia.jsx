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
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Plus,
  CheckCircle2,
  Calendar,
  Send,
  BarChart3,
  Link as LinkIcon,
  Trash2,
  Music,
  Tv,
  Star
} from "lucide-react";
import PlatformSelector from "@/components/PlatformSelector";
import SocialPlatformVerification from "@/components/SocialPlatformVerification";
import SocialConnectModal from "@/components/SocialConnectModal";
import ContentComposer from "@/components/social/ContentComposer";
import PostScheduler from "@/components/social/PostScheduler";
import PageDesignStudio from "@/components/social/PageDesignStudio";
import SocialAnalytics from "@/components/social/SocialAnalytics";

export default function SocialMedia() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null); // New state to store user preferences

  const [postData, setPostData] = useState({
    content_type: "video",
    content_url: "",
    thumbnail_url: "",
    title: "",
    caption: "",
    description: "", // Kept for YouTube or general longer descriptions
    hashtags: [],
    tags: [],
    platforms: [],
    schedule_time: null,
    youtube_privacy: "public",
    youtube_category: "22",
    ctv_category: "entertainment",
    ctv_rating: "G"
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: userPrefs, isLoading: isLoadingPrefs } = useQuery({
    queryKey: ["userPreferences", user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({
        user_email: user.email
      });
      // Ensure we always return an object with default empty arrays if no preferences are found
      return prefs[0] || { hidden_platforms: [], preferred_platforms: [], default_post_platforms: [] };
    },
    enabled: !!user,
    onSuccess: (data) => {
      setPreferences(data);
      // Auto-select default platforms when creating new post, but only if platforms are not already set
      setPostData(prev => ({
        ...prev,
        platforms: prev.platforms.length === 0 && data?.default_post_platforms?.length > 0
            ? data.default_post_platforms
            : prev.platforms
      }));
    }
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["socialAccounts", user?.email],
    queryFn: () => base44.entities.SocialMediaAccount.filter({
      user_email: user.email
    }),
    enabled: !!user,
  });

  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ["scheduledPosts", user?.email],
    queryFn: () => base44.entities.ScheduledPost.filter({
      user_email: user.email
    }, "-created_date"),
    enabled: !!user,
  });

  const { data: publishedPosts = [] } = useQuery({
    queryKey: ["publishedPosts", user?.email],
    queryFn: () => base44.entities.SocialMediaPost.filter({
      user_email: user.email
    }, "-posted_at", 50),
    enabled: !!user,
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ScheduledPost.create({
      ...data,
      user_email: user.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["scheduledPosts"]);
      setShowPostForm(false);
      resetForm();
    },
  });

  const savePrefsMutation = useMutation({
    mutationFn: async (newPrefs) => {
      // Ensure user_email is always present for create/update
      const prefsToSave = { ...newPrefs, user_email: user.email };

      if (preferences?.id) {
        // Update existing preferences
        return await base44.entities.UserPreferences.update(preferences.id, prefsToSave);
      } else {
        // Create new preferences
        return await base44.entities.UserPreferences.create(prefsToSave);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userPreferences"]); // Re-fetch preferences after save
      setShowPreferences(false); // Close preferences form
      alert("Platform preferences saved!");
    },
    onError: (error) => {
      console.error("Failed to save preferences:", error);
      alert("Failed to save preferences. Please try again.");
    }
  });

  const resetForm = () => {
    setPostData({
      content_type: "video",
      content_url: "",
      thumbnail_url: "",
      title: "",
      caption: "",
      description: "",
      hashtags: [],
      tags: [],
      platforms: preferences?.default_post_platforms || [], // Use default post platforms on reset
      schedule_time: null,
      youtube_privacy: "public",
      youtube_category: "22",
      ctv_category: "entertainment",
      ctv_rating: "G"
    });
  };

  const platformConfigs = [
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "from-[#FF4433] to-[#FF8C00]",
      description: "Photos, Videos, Reels & Stories",
      category: "social",
      oauth: () => setConnectingPlatform({ id: "instagram", name: "Instagram", icon: Instagram, color: "from-[#FF4433] to-[#FF8C00]" })
    },
    {
      id: "facebook_page",
      name: "Facebook",
      icon: Facebook,
      color: "from-[#1E90FF] to-[#A89C94]",
      description: "Page posts, Videos & Stories",
      category: "social",
      oauth: () => setConnectingPlatform({ id: "facebook_page", name: "Facebook", icon: Facebook, color: "from-[#1E90FF] to-[#A89C94]" })
    },
    {
      id: "twitter",
      name: "Twitter / X",
      icon: Twitter,
      color: "from-[#000000] to-[#1DA1F2]",
      description: "Tweets, Threads & Videos",
      category: "social",
      oauth: () => setConnectingPlatform({ id: "twitter", name: "X (Twitter)", icon: Twitter, color: "from-[#000000] to-[#1DA1F2]" })
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "from-[#0077B5] to-[#00A0DC]",
      description: "Posts, Articles & Videos",
      category: "social",
      oauth: () => setConnectingPlatform({ id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-[#0077B5] to-[#00A0DC]" })
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: Music,
      color: "from-[#FF0050] to-[#00F2EA]",
      description: "Short-form Videos & Trends",
      category: "social",
      oauth: () => setConnectingPlatform({ id: "tiktok", name: "TikTok", icon: Music, color: "from-[#FF0050] to-[#00F2EA]" })
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: Youtube,
      color: "from-[#FF0000] to-[#CC0000]",
      description: "Long & Short-form Videos",
      category: "social",
      oauth: () => setConnectingPlatform({ id: "youtube", name: "YouTube", icon: Youtube, color: "from-[#FF0000] to-[#CC0000]" })
    },
    {
      id: "netflix",
      name: "Netflix Ads",
      icon: Tv,
      color: "from-[#E50914] to-[#B20710]",
      description: "Premium streaming advertising (260M+ subscribers)",
      category: "streaming_ads",
      oauth: () => {
        alert("Netflix Ads Setup:\n\n1. Apply for Netflix Ads Partner Program\n2. Complete advertiser verification\n3. OAuth 2.0 authorization\n4. Minimum spend: $5,000\n\nSimulating connection...");
        base44.entities.SocialMediaAccount.create({
          user_email: user.email,
          platform: "netflix",
          account_name: "Netflix Ads Account",
          account_id: "netflix_" + Date.now(),
          access_token: "token_" + Math.random(),
          is_connected: true,
          followers_count: 23000000,
          advertiser_id: "netflix_adv_" + Date.now()
        }).then(() => queryClient.invalidateQueries(["socialAccounts"]));
      }
    },
    {
      id: "disney_plus",
      name: "Disney+ Ads",
      icon: Tv,
      color: "from-[#113CCF] to-[#0D2E8A]",
      description: "Family & premium content advertising (150M+ subscribers)",
      category: "streaming_ads",
      oauth: () => {
        alert("Disney+ Ads Setup:\n\n1. Disney Advertising Sales portal\n2. Brand safety verification\n3. OAuth 2.0 authorization\n4. Minimum spend: $5,000\n\nSimulating connection...");
        base44.entities.SocialMediaAccount.create({
          user_email: user.email,
          platform: "disney_plus",
          account_name: "Disney+ Ads Account",
          account_id: "disney_" + Date.now(),
          access_token: "token_" + Math.random(),
          is_connected: true,
          followers_count: 50000000,
          advertiser_id: "disney_adv_" + Date.now()
        }).then(() => queryClient.invalidateQueries(["socialAccounts"]));
      }
    },
    {
      id: "max_hbo",
      name: "Max (HBO) Ads",
      icon: Tv,
      color: "from-[#002BE7] to-[#0018A8]",
      description: "Premium HBO content advertising (95M+ subscribers)",
      category: "streaming_ads",
      oauth: () => {
        alert("Max (HBO) Ads Setup:\n\n1. Warner Bros. Discovery Ads portal\n2. Advertiser verification\n3. OAuth 2.0 authorization\n4. Minimum spend: $7,500\n\nSimulating connection...");
        base44.entities.SocialMediaAccount.create({
          user_email: user.email,
          platform: "max_hbo",
          account_name: "Max Ads Account",
          account_id: "max_" + Date.now(),
          access_token: "token_" + Math.random(),
          is_connected: true,
          followers_count: 30000000,
          advertiser_id: "max_adv_" + Date.now()
        }).then(() => queryClient.invalidateQueries(["socialAccounts"]));
      }
    },
    {
      id: "amazon_prime",
      name: "Prime Video Ads",
      icon: Tv,
      color: "from-[#00A8E1] to-[#0066A1]",
      description: "Amazon Prime Video + shopping data (200M+ subscribers)",
      category: "streaming_ads",
      oauth: () => {
        alert("Amazon Prime Video Ads Setup:\n\n1. Amazon Advertising Console\n2. Link to Amazon Ads account\n3. OAuth 2.0 authorization\n4. Minimum spend: $5,000\n\nSimulating connection...");
        base44.entities.SocialMediaAccount.create({
          user_email: user.email,
          platform: "amazon_prime",
          account_name: "Prime Video Ads Account",
          account_id: "amazon_" + Date.now(),
          access_token: "token_" + Math.random(),
          is_connected: true,
          followers_count: 200000000,
          advertiser_id: "amazon_adv_" + Date.now()
        }).then(() => queryClient.invalidateQueries(["socialAccounts"]));
      }
    },
    {
      id: "paramount_plus",
      name: "Paramount+ Ads",
      icon: Tv,
      color: "from-[#0064FF] to-[#003D99]",
      description: "CBS, MTV, Sports advertising (67M+ subscribers)",
      category: "streaming_ads",
      oauth: () => {
        alert("Paramount+ Ads Setup:\n\n1. Paramount Advertising portal\n2. Advertiser verification\n3. OAuth 2.0 authorization\n4. Minimum spend: $3,000\n\nSimulating connection...");
        base44.entities.SocialMediaAccount.create({
          user_email: user.email,
          platform: "paramount_plus",
          account_name: "Paramount+ Ads Account",
          account_id: "paramount_" + Date.now(),
          access_token: "token_" + Math.random(),
          is_connected: true,
          followers_count: 40000000,
          advertiser_id: "paramount_adv_" + Date.now()
        }).then(() => queryClient.invalidateQueries(["socialAccounts"]));
      }
    },
    {
      id: "apple_tv_plus",
      name: "Apple TV+",
      icon: Tv,
      color: "from-[#555555] to-[#000000]",
      description: "Premium originals (No ads yet - Coming Soon)",
      category: "streaming_ads",
      comingSoon: true,
      oauth: () => {
        alert("Apple TV+ Advertising:\n\n⚠️ Apple TV+ does not currently support advertising.\n\nMonitor for future ad-supported tier announcement.");
      }
    }
    ];

  const getConnectedAccounts = (platformId) => {
    return accounts.filter(a => a.platform === platformId && a.is_connected);
  };

  // Keep singular for backward compat where needed
  const getConnectedAccount = (platformId) => {
    return accounts.find(a => a.platform === platformId && a.is_connected);
  };

  const handlePostNow = async () => {
    // Check for mandatory fields based on content type, particularly for CTV
    if (!postData.content_url || !postData.title || !postData.caption) {
      alert("Please fill in content URL, title, and description/caption.");
      return;
    }
    if (postData.content_type === "ctv_video" && (!postData.ctv_category || !postData.ctv_rating)) {
      alert("Please select CTV category and rating.");
      return;
    }

    if (postData.platforms.length === 0) {
      alert("Please select at least one platform");
      return;
    }

    await createPostMutation.mutateAsync({
      ...postData,
      status: "posting"
    });

    alert(`Post is being published to ${postData.platforms.length} platform(s)!\n\nIn production, this would:\n1. Upload media to each platform\n2. Create post with caption\n3. Return post URLs\n4. Save analytics`);
  };

  const handleSchedule = async () => {
    // Check for mandatory fields based on content type, particularly for CTV
    if (!postData.content_url || !postData.title || !postData.caption || !postData.schedule_time) {
      alert("Please fill in all fields including schedule time.");
      return;
    }
    if (postData.content_type === "ctv_video" && (!postData.ctv_category || !postData.ctv_rating)) {
      alert("Please select CTV category and rating.");
      return;
    }

    if (postData.platforms.length === 0) {
      alert("Please select at least one platform");
      return;
    }

    await createPostMutation.mutateAsync({
      ...postData,
      status: "scheduled"
    });

    alert("Post scheduled successfully!");
  };

  const togglePlatform = (platformId) => {
    setPostData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const getPlatformIcon = (platformId) => {
    const config = platformConfigs.find(p => p.id === platformId);
    return config ? config.icon : Instagram; // Default to Instagram if not found
  };

  // Filter platforms based on preferences
  const getVisiblePlatforms = (platforms) => {
    if (!preferences?.hidden_platforms) return platforms;
    return platforms.filter(p => !preferences.hidden_platforms.includes(p.id));
  };

  // Sort platforms - preferred first, then alphabetical
  const sortPlatforms = (platforms) => {
    if (!preferences?.preferred_platforms) return platforms;
    
    // Create a copy to avoid modifying the original array
    return [...platforms].sort((a, b) => {
      const aPreferred = preferences.preferred_platforms.includes(a.id);
      const bPreferred = preferences.preferred_platforms.includes(b.id);
      
      if (aPreferred && !bPreferred) return -1; // a is preferred, b is not, a comes first
      if (!aPreferred && bPreferred) return 1;  // b is preferred, a is not, b comes first
      return a.name.localeCompare(b.name); // Alphabetical sort for non-preferred or both preferred
    });
  };

  const visibleSocialPlatforms = sortPlatforms(getVisiblePlatforms(platformConfigs.filter(p => p.category === "social")));
  const visibleStreamingAdsPlatforms = sortPlatforms(getVisiblePlatforms(platformConfigs.filter(p => p.category === "streaming_ads")));

  const hasConnectedAccounts = accounts.length > 0;

  return (
    <>
    {connectingPlatform && (
      <SocialConnectModal
        platform={connectingPlatform}
        onClose={() => setConnectingPlatform(null)}
      />
    )}
    {showComposer && (
      <ContentComposer
        connectedAccounts={accounts}
        onSchedule={() => queryClient.invalidateQueries(["scheduledPosts"])}
        onClose={() => setShowComposer(false)}
      />
    )}
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Social Media Hub</h1>
            <p className="text-gray-400">Connect all your social media and streaming platforms for automated content distribution</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowComposer(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
            <Button
              onClick={() => setShowPreferences(!showPreferences)}
              variant="outline"
              className="border-gray-700 hover:bg-[#111317] rounded-xl"
            >
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Platform Preferences
            </Button>
          </div>
        </div>

        {/* Platform Preferences */}
        {showPreferences && (
          <PlatformSelector
            allPlatforms={platformConfigs} // Pass all platform configs
            currentPreferences={preferences || {}} // Pass current preferences (ensure it's an object)
            onSave={(newPrefs) => {
                if (newPrefs === null) { // User clicked 'Cancel'
                    setShowPreferences(false);
                    return;
                }
                savePrefsMutation.mutate(newPrefs);
            }}
            isLoading={savePrefsMutation.isLoading}
          />
        )}

        {/* Social Media Platforms */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Social Media Platforms</h2>
            {preferences?.hidden_platforms?.filter(pId => platformConfigs.find(pc => pc.id === pId)?.category === "social").length > 0 && (
              <Badge className="bg-gray-500/20 text-gray-400 text-sm">
                {preferences.hidden_platforms.filter(pId => platformConfigs.find(pc => pc.id === pId)?.category === "social").length} hidden
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSocialPlatforms.map((platform) => {
              const connectedAccounts = getConnectedAccounts(platform.id);
              const PlatformIcon = platform.icon;
              const isPreferred = preferences?.preferred_platforms?.includes(platform.id);

              return (
                <Card key={platform.id} className={`bg-[#111317] border-gray-800 rounded-2xl ${isPreferred ? 'ring-2 ring-yellow-500/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                          <PlatformIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-white text-base">{platform.name}</CardTitle>
                            {isPreferred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                            {connectedAccounts.length > 0 && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">{connectedAccounts.length} connected</Badge>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">{platform.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {connectedAccounts.map((acct) => (
                      <div key={acct.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0B0B0C] border border-gray-800">
                        <div>
                          <p className="text-white font-medium text-xs">{acct.platform_username || acct.account_name}</p>
                          <p className="text-gray-500 text-xs">{acct.followers_count?.toLocaleString()} followers</p>
                        </div>
                        <button
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                          onClick={() => {
                            if (confirm(`Disconnect ${acct.platform_username || acct.account_name}?`)) {
                              base44.entities.SocialMediaAccount.delete(acct.id).then(() => {
                                queryClient.invalidateQueries(["socialAccounts"]);
                              });
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <Button
                      onClick={platform.oauth}
                      size="sm"
                      className={`w-full bg-gradient-to-r ${platform.color} text-white rounded-xl text-xs h-8`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {connectedAccounts.length > 0 ? `Add Another ${platform.name}` : `Connect ${platform.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Streaming Ad Platforms */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">🎬 Streaming Advertising Platforms</h2>
              <p className="text-gray-400 text-sm mt-1">Advertise on Netflix, Disney+, Max, Prime Video & more (500M+ households)</p>
            </div>
            <div className="flex items-center gap-2">
              {preferences?.hidden_platforms?.filter(pId => platformConfigs.find(pc => pc.id === pId)?.category === "streaming_ads").length > 0 && (
                <Badge className="bg-gray-500/20 text-gray-400 text-sm">
                  {preferences.hidden_platforms.filter(pId => platformConfigs.find(pc => pc.id === pId)?.category === "streaming_ads").length} hidden
                </Badge>
              )}
              <Badge className="bg-red-500/20 text-red-400 text-sm">
                🔥 Enterprise Feature
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {visibleStreamingAdsPlatforms.map((platform) => {
              const connectedAccounts = getConnectedAccounts(platform.id);
              const PlatformIcon = platform.icon;
              const isPreferred = preferences?.preferred_platforms?.includes(platform.id);

              return (
                <Card key={platform.id} className={`bg-[#111317] border-gray-800 rounded-2xl ${isPreferred ? 'ring-2 ring-yellow-500/50' : ''} ${platform.comingSoon ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                          <PlatformIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-white text-base">{platform.name}</CardTitle>
                            {isPreferred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                            {platform.comingSoon && <Badge className="bg-gray-500/20 text-gray-400 text-xs">Soon</Badge>}
                            {connectedAccounts.length > 0 && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">{connectedAccounts.length} active</Badge>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">{platform.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {connectedAccounts.map((acct) => (
                      <div key={acct.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0B0B0C] border border-gray-800">
                        <div>
                          <p className="text-white font-medium text-xs">{acct.account_name}</p>
                          <p className="text-gray-500 text-xs">{acct.followers_count?.toLocaleString() || 'N/A'} ad-tier subscribers</p>
                        </div>
                        <button
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                          onClick={() => {
                            if (confirm(`Disconnect ${acct.account_name}?`)) {
                              base44.entities.SocialMediaAccount.delete(acct.id).then(() => {
                                queryClient.invalidateQueries(["socialAccounts"]);
                              });
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <Button
                      onClick={platform.oauth}
                      disabled={platform.comingSoon}
                      size="sm"
                      className={`w-full bg-gradient-to-r ${platform.color} text-white rounded-xl text-xs h-8 ${platform.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {platform.comingSoon ? 'Coming Soon' : connectedAccounts.length > 0 ? `Add Another Account` : 'Connect Ads Account'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Create Post */}
        {hasConnectedAccounts && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Create New Post</CardTitle>
                <Button
                  onClick={() => setShowPostForm(!showPostForm)}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                >
                  {showPostForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" />New Post</>}
                </Button>
              </div>
            </CardHeader>
            {showPostForm && (
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Content Type</label>
                  <Select
                    value={postData.content_type}
                    onValueChange={(value) => setPostData({...postData, content_type: value})}
                  >
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video (General)</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="short">Short Video (TikTok/Reels/Shorts)</SelectItem>
                      <SelectItem value="tweet">Tweet/Thread</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Media URL</label>
                  <Input
                    value={postData.content_url}
                    onChange={(e) => setPostData({...postData, content_url: e.target.value})}
                    placeholder="https://your-cdn.com/video.mp4 or image.jpg"
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                {(postData.content_type === "video" || postData.content_type === "short") && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Thumbnail URL</label>
                    <Input
                      value={postData.thumbnail_url}
                      onChange={(e) => setPostData({...postData, thumbnail_url: e.target.value})}
                      placeholder="https://your-cdn.com/thumbnail.jpg"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <Input
                    value={postData.title}
                    onChange={(e) => setPostData({...postData, title: e.target.value})}
                    placeholder="Engaging title for your content"
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Caption / Description</label>
                  <Textarea
                    value={postData.caption}
                    onChange={(e) => setPostData({...postData, caption: e.target.value})}
                    placeholder="Write your caption here (social) or detailed description (CTV)..."
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[100px]"
                  />
                </div>

                {postData.platforms.some(p => p.startsWith("youtube")) && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Description (YouTube Specific)</label>
                    <Textarea
                      value={postData.description}
                      onChange={(e) => setPostData({...postData, description: e.target.value})}
                      placeholder="Detailed video description for YouTube"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[80px]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Hashtags (comma separated)</label>
                  <Input
                    value={postData.hashtags.join(", ")}
                    onChange={(e) => setPostData({
                      ...postData,
                      hashtags: e.target.value.split(",").map(h => h.trim()).filter(Boolean)
                    })}
                    placeholder="#ai #content #creator"
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                {/* YouTube specific fields */}
                {postData.platforms.some(p => p.startsWith("youtube")) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">YouTube Privacy</label>
                      <Select
                        value={postData.youtube_privacy}
                        onValueChange={(value) => setPostData({...postData, youtube_privacy: value})}
                      >
                        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">YouTube Category</label>
                      <Select
                        value={postData.youtube_category}
                        onValueChange={(value) => setPostData({...postData, youtube_category: value})}
                      >
                        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="22">People & Blogs</SelectItem>
                          <SelectItem value="28">Science & Technology</SelectItem>
                          <SelectItem value="24">Entertainment</SelectItem>
                          <SelectItem value="27">Education</SelectItem>
                          <SelectItem value="26">Howto & Style</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Post To (select accounts)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {getVisiblePlatforms(platformConfigs).flatMap((platform) => {
                      const connAccounts = getConnectedAccounts(platform.id);
                      const PlatformIcon = platform.icon;
                      return connAccounts.map((acct) => {
                        const key = `${platform.id}::${acct.id}`;
                        const isSelected = postData.platforms.includes(key);
                        return (
                          <label
                            key={key}
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected ? 'border-[#FF8C00] bg-[#FF8C00]/10' : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => setPostData(prev => ({
                                ...prev,
                                platforms: prev.platforms.includes(key)
                                  ? prev.platforms.filter(p => p !== key)
                                  : [...prev.platforms, key]
                              }))}
                              className="w-4 h-4"
                            />
                            <PlatformIcon className="w-4 h-4 text-[#FF8C00]" />
                            <span className="text-white text-xs truncate">{acct.platform_username || acct.account_name}</span>
                          </label>
                        );
                      });
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Schedule (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={postData.schedule_time || ""}
                    onChange={(e) => setPostData({...postData, schedule_time: e.target.value})}
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handlePostNow}
                    className="flex-1 bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl"
                    disabled={createPostMutation.isLoading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Now
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                    disabled={createPostMutation.isLoading}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Posts Tabs */}
        <Tabs defaultValue="composer">
          <TabsList className="bg-[#111317] rounded-xl flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="composer">✍️ Composer</TabsTrigger>
            <TabsTrigger value="scheduled">📅 Scheduler</TabsTrigger>
            <TabsTrigger value="design">🎨 Page Design</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="verification">🔐 Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="composer">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <PostScheduler />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <PageDesignStudio />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {scheduledPosts.length > 0 ? (
                  <div className="space-y-3">
                    {scheduledPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                      >
                        <div className="flex items-start gap-4">
                          {post.content_url && (
                            <img
                              src={post.content_url}
                              alt=""
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium line-clamp-2 mb-2">{post.title || post.caption}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={`text-xs ${
                                post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                                post.status === 'posting' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {post.status}
                              </Badge>
                              {post.schedule_time && (
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(post.schedule_time).toLocaleString()}
                                </span>
                              )}
                              <div className="flex gap-1 flex-wrap">
                                {post.platforms?.map(p => {
                                  const PlatIcon = getPlatformIcon(p);
                                  return (
                                    <Badge key={p} className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs flex items-center gap-1">
                                      <PlatIcon className="w-3 h-3" />
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete scheduled post?")) {
                                base44.entities.ScheduledPost.delete(post.id).then(() => {
                                  queryClient.invalidateQueries(["scheduledPosts"]);
                                });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No scheduled posts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="published">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {publishedPosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publishedPosts.map((post) => {
                      const PlatIcon = getPlatformIcon(post.platform);
                      return (
                        <div
                          key={post.id}
                          className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                        >
                          {post.content_url && (
                            <img
                              src={post.content_url}
                              alt=""
                              className="w-full aspect-square rounded-lg object-cover mb-3"
                            />
                          )}
                          <p className="text-white text-sm mb-2 line-clamp-2">{post.title || post.caption}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-2">
                              <PlatIcon className="w-4 h-4" />
                              <span>{post.platform}</span>
                            </div>
                            <span>{new Date(post.posted_at).toLocaleDateString()}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800">
                            <div className="text-center">
                              <p className="text-white font-medium text-sm">{post.likes_count || 0}</p>
                              <p className="text-gray-500 text-xs">Likes</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-medium text-sm">{post.comments_count || 0}</p>
                              <p className="text-gray-500 text-xs">Comments</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-medium text-sm">{post.views_count || 0}</p>
                              <p className="text-gray-500 text-xs">Views</p>
                            </div>
                          </div>
                          {post.post_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3 border-gray-700 hover:bg-[#111317] rounded-lg text-xs"
                              onClick={() => window.open(post.post_url, "_blank")}
                            >
                              View Post
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm">No published posts yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <SocialPlatformVerification />
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <SocialAnalytics accounts={accounts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}