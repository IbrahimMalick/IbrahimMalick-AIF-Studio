import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Music,
  Tv,
  MonitorPlay,
  Cast,
  Star,
  Eye,
  EyeOff
} from "lucide-react";

export default function PlatformSelector({ preferences, onSave }) {
  const [localPrefs, setLocalPrefs] = useState({
    preferred_platforms: [],
    hidden_platforms: [],
    default_post_platforms: [],
    ...preferences
  });

  useEffect(() => {
    setLocalPrefs({
      preferred_platforms: [],
      hidden_platforms: [],
      default_post_platforms: [],
      ...preferences
    });
  }, [preferences]);

  const allPlatforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, category: "social", color: "from-[#FF4433] to-[#FF8C00]" },
    { id: "facebook_page", name: "Facebook", icon: Facebook, category: "social", color: "from-[#1E90FF] to-[#A89C94]" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, category: "social", color: "from-[#000000] to-[#1DA1F2]" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, category: "social", color: "from-[#0077B5] to-[#00A0DC]" },
    { id: "tiktok", name: "TikTok", icon: Music, category: "social", color: "from-[#FF0050] to-[#00F2EA]" },
    { id: "youtube", name: "YouTube", icon: Youtube, category: "social", color: "from-[#FF0000] to-[#CC0000]" },
    { id: "roku", name: "Roku", icon: Tv, category: "ctv", color: "from-[#6F1AB1] to-[#A64EE7]" },
    { id: "apple_tv", name: "Apple TV", icon: MonitorPlay, category: "ctv", color: "from-[#000000] to-[#555555]" },
    { id: "fire_tv", name: "Fire TV", icon: Tv, category: "ctv", color: "from-[#FF9900] to-[#FF6600]" },
    { id: "android_tv", name: "Android TV", icon: Cast, category: "ctv", color: "from-[#3DDC84] to-[#34A853]" },
    { id: "samsung_tv", name: "Samsung TV", icon: MonitorPlay, category: "ctv", color: "from-[#1428A0] to-[#034EA2]" },
    { id: "vizio", name: "Vizio", icon: Tv, category: "ctv", color: "from-[#FF6B00] to-[#FF8C42]" }
  ];

  const togglePreferred = (platformId) => {
    setLocalPrefs(prev => ({
      ...prev,
      preferred_platforms: prev.preferred_platforms.includes(platformId)
        ? prev.preferred_platforms.filter(p => p !== platformId)
        : [...prev.preferred_platforms, platformId]
    }));
  };

  const toggleHidden = (platformId) => {
    setLocalPrefs(prev => ({
      ...prev,
      hidden_platforms: prev.hidden_platforms.includes(platformId)
        ? prev.hidden_platforms.filter(p => p !== platformId)
        : [...prev.hidden_platforms, platformId]
    }));
  };

  const toggleDefault = (platformId) => {
    setLocalPrefs(prev => ({
      ...prev,
      default_post_platforms: prev.default_post_platforms.includes(platformId)
        ? prev.default_post_platforms.filter(p => p !== platformId)
        : [...prev.default_post_platforms, platformId]
    }));
  };

  const handleSave = () => {
    onSave(localPrefs);
  };

  const socialPlatforms = allPlatforms.filter(p => p.category === "social");
  const ctvPlatforms = allPlatforms.filter(p => p.category === "ctv");

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white">Platform Preferences</CardTitle>
        <p className="text-gray-400 text-sm mt-2">
          Choose which platforms to focus on, hide ones you don't use, and set defaults for posting.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Media Platforms */}
        <div>
          <h3 className="text-white font-semibold mb-4">Social Media Platforms</h3>
          <div className="space-y-3">
            {socialPlatforms.map((platform) => {
              const PlatformIcon = platform.icon;
              const isPreferred = localPrefs.preferred_platforms?.includes(platform.id);
              const isHidden = localPrefs.hidden_platforms?.includes(platform.id);
              const isDefault = localPrefs.default_post_platforms?.includes(platform.id);

              return (
                <div
                  key={platform.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isHidden ? 'opacity-50 border-gray-800 bg-[#0B0B0C]' : 'border-gray-700 bg-[#0B0B0C]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center`}>
                        <PlatformIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-medium">{platform.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPreferred && <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Priority</Badge>}
                      {isDefault && <Badge className="bg-green-500/20 text-green-400 text-xs">Auto-Select</Badge>}
                      {isHidden && <Badge className="bg-gray-500/20 text-gray-400 text-xs">Hidden</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => togglePreferred(platform.id)}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        isPreferred
                          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                          : 'border-gray-700 text-gray-400 hover:border-yellow-500/50'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      <span className="text-xs">Priority</span>
                    </button>

                    <button
                      onClick={() => toggleDefault(platform.id)}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        isDefault
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-gray-700 text-gray-400 hover:border-green-500/50'
                      }`}
                    >
                      <span className="text-xs">Auto-Select</span>
                    </button>

                    <button
                      onClick={() => toggleHidden(platform.id)}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        isHidden
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-gray-700 text-gray-400 hover:border-red-500/50'
                      }`}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="text-xs">{isHidden ? 'Hidden' : 'Hide'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTV Platforms */}
        <div>
          <h3 className="text-white font-semibold mb-4">Connected TV Platforms</h3>
          <div className="space-y-3">
            {ctvPlatforms.map((platform) => {
              const PlatformIcon = platform.icon;
              const isPreferred = localPrefs.preferred_platforms?.includes(platform.id);
              const isHidden = localPrefs.hidden_platforms?.includes(platform.id);
              const isDefault = localPrefs.default_post_platforms?.includes(platform.id);

              return (
                <div
                  key={platform.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isHidden ? 'opacity-50 border-gray-800 bg-[#0B0B0C]' : 'border-gray-700 bg-[#0B0B0C]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center`}>
                        <PlatformIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-medium">{platform.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPreferred && <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Priority</Badge>}
                      {isDefault && <Badge className="bg-green-500/20 text-green-400 text-xs">Auto-Select</Badge>}
                      {isHidden && <Badge className="bg-gray-500/20 text-gray-400 text-xs">Hidden</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => togglePreferred(platform.id)}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        isPreferred
                          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                          : 'border-gray-700 text-gray-400 hover:border-yellow-500/50'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                      <span className="text-xs">Priority</span>
                    </button>

                    <button
                      onClick={() => toggleDefault(platform.id)}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        isDefault
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-gray-700 text-gray-400 hover:border-green-500/50'
                      }`}
                    >
                      <span className="text-xs">Auto-Select</span>
                    </button>

                    <button
                      onClick={() => toggleHidden(platform.id)}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
                        isHidden
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-gray-700 text-gray-400 hover:border-red-500/50'
                      }`}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="text-xs">{isHidden ? 'Hidden' : 'Hide'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
          <h4 className="text-white font-semibold mb-3 text-sm">What do these mean?</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-medium">Priority:</span> Show these platforms first in lists
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-medium">Auto-Select:</span> Automatically selected when creating new posts
              </div>
            </div>
            <div className="flex items-start gap-2">
              <EyeOff className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-medium">Hidden:</span> Don't show these platforms in your dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl"
        >
          Save Platform Preferences
        </Button>
      </CardContent>
    </Card>
  );
}