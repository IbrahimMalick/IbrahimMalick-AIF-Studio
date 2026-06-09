import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Palette,
  Type,
  Image as ImageIcon,
  Save,
  RefreshCw
} from "lucide-react";

export default function BrandSettings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const handleThemeToggle = async () => {
    const newTheme = user?.theme_preference === "dark" ? "light" : "dark";
    await base44.auth.updateMe({ theme_preference: newTheme });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Brand Settings</h1>
          <p className="text-gray-400">Customize your studio's look and feel</p>
        </div>

        {/* Color Palette */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Palette className="w-5 h-5" />
              Color Palette
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-full h-20 rounded-xl bg-gradient-to-r from-[#FF4433] to-[#FF8C00] mb-2"></div>
                <p className="text-sm text-gray-400">Primary Gradient</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 rounded-xl bg-[#FF4433] mb-2"></div>
                <p className="text-sm text-gray-400">Accent Red</p>
                <p className="text-xs text-gray-500">#FF4433</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 rounded-xl bg-[#A89C94] mb-2"></div>
                <p className="text-sm text-gray-400">Warm Gray</p>
                <p className="text-xs text-gray-500">#A89C94</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 rounded-xl bg-[#1E90FF] mb-2"></div>
                <p className="text-sm text-gray-400">Electric Blue</p>
                <p className="text-xs text-gray-500">#1E90FF</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 rounded-xl bg-[#0B0B0C] border border-gray-700 mb-2"></div>
                <p className="text-sm text-gray-400">Dark BG</p>
                <p className="text-xs text-gray-500">#0B0B0C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Type className="w-5 h-5" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-[#0B0B0C] rounded-xl">
              <h1 className="text-4xl font-bold text-white mb-2">Montserrat Bold</h1>
              <p className="text-gray-400">Used for headlines and titles</p>
            </div>
            <div className="p-6 bg-[#0B0B0C] rounded-xl">
              <p className="text-lg text-white mb-2">Inter Regular</p>
              <p className="text-gray-400">Used for body text and UI elements</p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="w-5 h-5" />
              Theme Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
              <div>
                <p className="text-white font-medium mb-1">Current Theme</p>
                <p className="text-gray-400 text-sm">Switch between dark and light modes</p>
              </div>
              <Button
                onClick={handleThemeToggle}
                className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Switch to {user?.theme_preference === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Brand Identity */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="w-5 h-5" />
              Brand Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-[#0B0B0C] rounded-xl text-center">
              <div className="brand-gradient p-6 rounded-2xl inline-block brand-glow mb-4">
                <h2 className="text-3xl font-bold text-white">AIFreedomDuane</h2>
              </div>
              <p className="text-gray-400 mb-2">Tagline</p>
              <p className="text-white text-lg">Mentorship • Systems • Freedom</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Corner Radius</p>
                <Badge className="bg-[#FF8C00] text-white border-0">16px</Badge>
              </div>
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <p className="text-gray-400 text-sm mb-2">Visual Style</p>
                <Badge className="bg-[#1E90FF] text-white border-0">Glowing, Gradient</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}