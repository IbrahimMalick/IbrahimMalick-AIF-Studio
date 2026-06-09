
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Image as ImageIcon,
  Globe,
  Mail,
  Eye,
  Save,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";
import PermissionGate from '@/components/PermissionGate';

export default function WhiteLabel() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: config, isLoading } = useQuery({
    queryKey: ["whiteLabelConfig", user?.email],
    queryFn: async () => {
      const configs = await base44.entities.WhiteLabelConfig.filter({
        user_email: user.email
      });
      return configs[0] || {
        brand_name: "AIFreedomDuane Studio",
        primary_color: "#FFD700",
        secondary_color: "#FF8C00",
        accent_color: "#00D4C9",
        background_color: "#0C0C0C",
        text_color: "#FFFFFF",
        app_name: "AIFreedomDuane Studio",
        hide_powered_by: false,
        feature_flags: {
          show_video_studio: true,
          show_ai_art: true,
          show_research_hub: true,
          show_social_media: true,
          show_templates: true,
          show_analytics: true,
          show_affiliate_program: true
        }
      };
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (config?.id) {
        return await base44.entities.WhiteLabelConfig.update(config.id, data);
      } else {
        return await base44.entities.WhiteLabelConfig.create({
          ...data,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["whiteLabelConfig"]);
      showToast("White-label settings saved! 🎨", "success");
    },
    onError: () => {
      showToast("Failed to save settings", "error");
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [field]: file_url });
      showToast("Image uploaded! 📸", "success");
    } catch (error) {
      showToast("Upload failed", "error");
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <div className="text-white text-xl">Loading white-label settings...</div>
      </div>
    );
  }

  return (
    <PermissionGate
      user={user}
      minimumRole="admin"
      showLockMessage={true}
      lockMessage="Only administrators can configure white-label settings"
    >
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Palette className="w-8 h-8 text-[#FFD700]" />
                White-Label Configuration
              </h1>
              <p className="text-gray-400">Brand this platform as your own and resell to clients</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="border-gray-700 hover:bg-[#111] text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? "Exit Preview" : "Preview"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isLoading}
                className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Preview Banner */}
          {previewMode && (
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-semibold">Preview Mode Active</p>
                    <p className="text-gray-300 text-sm">You're seeing how your brand will look to clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="branding" className="space-y-6">
            <TabsList className="bg-[#111]">
              <TabsTrigger value="branding">
                <Palette className="w-4 h-4 mr-2" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="colors">
                <Sparkles className="w-4 h-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="features">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact Info
              </TabsTrigger>
              <TabsTrigger value="domain">
                <Globe className="w-4 h-4 mr-2" />
                Domain
              </TabsTrigger>
            </TabsList>

            {/* BRANDING TAB */}
            <TabsContent value="branding" className="space-y-6">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Brand Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Brand Name */}
                  <div>
                    <Label className="text-gray-300">Brand/Company Name *</Label>
                    <Input
                      value={formData.brand_name}
                      onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                      placeholder="Your Company Name"
                      className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </div>

                  {/* App Name */}
                  <div>
                    <Label className="text-gray-300">Application Name</Label>
                    <Input
                      value={formData.app_name}
                      onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                      placeholder="AI Content Studio"
                      className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                    />
                    <p className="text-gray-500 text-sm mt-1">Appears in sidebar and page titles</p>
                  </div>

                  {/* Tagline */}
                  <div>
                    <Label className="text-gray-300">Tagline</Label>
                    <Input
                      value={formData.tagline || ""}
                      onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                      placeholder="Create Amazing Content with AI"
                      className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Logo (Light Mode)</Label>
                      <div className="mt-2">
                        {formData.logo_url && (
                          <div className="mb-3 p-4 bg-white rounded-lg">
                            <img src={formData.logo_url} alt="Logo" className="h-12 object-contain" />
                          </div>
                        )}
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "logo_url")}
                            className="hidden"
                          />
                          <Button variant="outline" className="w-full border-gray-700 hover:bg-[#0C0C0C] text-white" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Logo
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300">Logo (Dark Mode)</Label>
                      <div className="mt-2">
                        {formData.logo_dark_url && (
                          <div className="mb-3 p-4 bg-[#000] rounded-lg">
                            <img src={formData.logo_dark_url} alt="Dark Logo" className="h-12 object-contain" />
                          </div>
                        )}
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "logo_dark_url")}
                            className="hidden"
                          />
                          <Button variant="outline" className="w-full border-gray-700 hover:bg-[#0C0C0C] text-white" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Dark Logo
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div>
                    <Label className="text-gray-300">Favicon</Label>
                    <div className="mt-2">
                      {formData.favicon_url && (
                        <div className="mb-3 flex items-center gap-3">
                          <img src={formData.favicon_url} alt="Favicon" className="w-8 h-8" />
                          <span className="text-gray-400 text-sm">{formData.favicon_url}</span>
                        </div>
                      )}
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "favicon_url")}
                          className="hidden"
                        />
                        <Button variant="outline" className="border-gray-700 hover:bg-[#0C0C0C] text-white" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Favicon
                          </span>
                        </Button>
                      </label>
                      <p className="text-gray-500 text-sm mt-1">Recommended: 32x32px PNG or ICO</p>
                    </div>
                  </div>

                  {/* Hide Powered By */}
                  <div className="flex items-center justify-between p-4 bg-[#0C0C0C] rounded-lg border border-gray-800">
                    <div>
                      <Label className="text-gray-300">Hide "Powered by" Branding</Label>
                      <p className="text-gray-500 text-sm mt-1">Remove AI Freedom Studios branding from footer</p>
                    </div>
                    <Switch
                      checked={formData.hide_powered_by}
                      onCheckedChange={(checked) => setFormData({...formData, hide_powered_by: checked})}
                    />
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* COLORS TAB */}
            <TabsContent value="colors" className="space-y-6">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Color Scheme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: "Primary Color", key: "primary_color", description: "Main brand color (buttons, links)" },
                      { label: "Secondary Color", key: "secondary_color", description: "Accents and highlights" },
                      { label: "Accent Color", key: "accent_color", description: "Additional emphasis" },
                      { label: "Background Color", key: "background_color", description: "Main background" },
                      { label: "Text Color", key: "text_color", description: "Primary text" }
                    ].map((color) => (
                      <div key={color.key}>
                        <Label className="text-gray-300">{color.label}</Label>
                        <div className="flex gap-3 mt-2">
                          <input
                            type="color"
                            value={formData[color.key]}
                            onChange={(e) => setFormData({...formData, [color.key]: e.target.value})}
                            className="w-16 h-16 rounded-lg cursor-pointer border border-gray-700"
                          />
                          <div className="flex-1">
                            <Input
                              value={formData[color.key]}
                              onChange={(e) => setFormData({...formData, [color.key]: e.target.value})}
                              className="bg-[#0C0C0C] border-gray-700 text-white mb-2"
                            />
                            <p className="text-gray-500 text-xs">{color.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Color Preview */}
                  <div className="p-6 rounded-lg border border-gray-800" style={{
                    backgroundColor: formData.background_color
                  }}>
                    <h3 style={{ color: formData.text_color }} className="text-xl font-bold mb-4">
                      Color Preview
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                      <Button style={{
                        backgroundColor: formData.primary_color,
                        color: "#000"
                      }}>
                        Primary Button
                      </Button>
                      <Button style={{
                        backgroundColor: formData.secondary_color,
                        color: "#000"
                      }}>
                        Secondary Button
                      </Button>
                      <Button style={{
                        backgroundColor: formData.accent_color,
                        color: "#FFF"
                      }}>
                        Accent Button
                      </Button>
                    </div>
                    <p style={{ color: formData.text_color }} className="mt-4 text-sm">
                      This is how your text will look against your chosen background color.
                    </p>
                  </div>

                  {/* Custom CSS */}
                  <div>
                    <Label className="text-gray-300">Custom CSS (Advanced)</Label>
                    <Textarea
                      value={formData.custom_css || ""}
                      onChange={(e) => setFormData({...formData, custom_css: e.target.value})}
                      placeholder=".custom-class { color: red; }"
                      className="mt-2 bg-[#0C0C0C] border-gray-700 text-white font-mono h-32"
                    />
                    <p className="text-gray-500 text-sm mt-1">Add custom CSS to override default styles</p>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* FEATURES TAB */}
            <TabsContent value="features" className="space-y-6">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Feature Toggles</CardTitle>
                  <p className="text-gray-400 text-sm mt-2">Control which features are visible to your clients</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "show_video_studio", label: "Video Studio", description: "AI video creation tools" },
                    { key: "show_ai_art", label: "AI Art Lab", description: "AI image generation" },
                    { key: "show_research_hub", label: "Research Hub", description: "Document analysis and Q&A" },
                    { key: "show_social_media", label: "Social Media Manager", description: "Multi-platform posting" },
                    { key: "show_templates", label: "Templates Library", description: "Pre-built video templates" },
                    { key: "show_analytics", label: "Analytics Dashboard", description: "Performance metrics" },
                    { key: "show_affiliate_program", label: "Affiliate Program", description: "Referral system" }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-4 bg-[#0C0C0C] rounded-lg border border-gray-800">
                      <div>
                        <Label className="text-gray-300 font-semibold">{feature.label}</Label>
                        <p className="text-gray-500 text-sm mt-1">{feature.description}</p>
                      </div>
                      <Switch
                        checked={formData.feature_flags?.[feature.key] ?? true}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          feature_flags: {
                            ...formData.feature_flags,
                            [feature.key]: checked
                          }
                        })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CONTACT INFO TAB */}
            <TabsContent value="contact" className="space-y-6">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Support Email</Label>
                      <Input
                        value={formData.support_email || ""}
                        onChange={(e) => setFormData({...formData, support_email: e.target.value})}
                        placeholder="support@yourcompany.com"
                        className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Support Phone</Label>
                      <Input
                        value={formData.support_phone || ""}
                        onChange={(e) => setFormData({...formData, support_phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Support/Help Center URL</Label>
                    <Input
                      value={formData.support_url || ""}
                      onChange={(e) => setFormData({...formData, support_url: e.target.value})}
                      placeholder="https://help.yourcompany.com"
                      className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Terms of Service URL</Label>
                      <Input
                        value={formData.terms_url || ""}
                        onChange={(e) => setFormData({...formData, terms_url: e.target.value})}
                        placeholder="https://yourcompany.com/terms"
                        className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Privacy Policy URL</Label>
                      <Input
                        value={formData.privacy_url || ""}
                        onChange={(e) => setFormData({...formData, privacy_url: e.target.value})}
                        placeholder="https://yourcompany.com/privacy"
                        className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  {/* Email Settings */}
                  <div className="border-t border-gray-800 pt-6 mt-6">
                    <h3 className="text-white font-semibold mb-4">Email Branding</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-300">Email From Name</Label>
                        <Input
                          value={formData.email_from_name || ""}
                          onChange={(e) => setFormData({...formData, email_from_name: e.target.value})}
                          placeholder="Your Company"
                          className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                        />
                        <p className="text-gray-500 text-sm mt-1">Appears as sender name in emails</p>
                      </div>

                      <div>
                        <Label className="text-gray-300">Email From Address</Label>
                        <Input
                          value={formData.email_from_address || ""}
                          onChange={(e) => setFormData({...formData, email_from_address: e.target.value})}
                          placeholder="noreply@yourcompany.com"
                          className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                        />
                        <p className="text-gray-500 text-sm mt-1">Sender email address</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-gray-300">Email Logo URL</Label>
                      <Input
                        value={formData.email_logo_url || ""}
                        onChange={(e) => setFormData({...formData, email_logo_url: e.target.value})}
                        placeholder="https://yourcompany.com/logo-email.png"
                        className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                      />
                      <p className="text-gray-500 text-sm mt-1">Logo displayed in email templates</p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* DOMAIN TAB */}
            <TabsContent value="domain" className="space-y-6">
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Custom Domain Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div>
                    <Label className="text-gray-300">Custom Domain</Label>
                    <Input
                      value={formData.custom_domain || ""}
                      onChange={(e) => setFormData({...formData, custom_domain: e.target.value})}
                      placeholder="app.yourcompany.com"
                      className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                    />
                    <p className="text-gray-500 text-sm mt-1">Your clients will access the platform at this domain</p>
                  </div>

                  {/* DNS Instructions */}
                  <div className="p-6 bg-[#0C0C0C] rounded-lg border border-gray-800">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-400" />
                      DNS Configuration Instructions
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-gray-300 font-semibold mb-2">Step 1: Add CNAME Record</p>
                        <div className="bg-[#000] p-4 rounded-lg font-mono text-gray-400">
                          <p>Type: CNAME</p>
                          <p>Name: app (or your subdomain)</p>
                          <p>Value: base44.app</p>
                          <p>TTL: 3600</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-300 font-semibold mb-2">Step 2: Wait for DNS Propagation</p>
                        <p className="text-gray-400">DNS changes can take 24-48 hours to propagate globally</p>
                      </div>

                      <div>
                        <p className="text-gray-300 font-semibold mb-2">Step 3: Verify Domain</p>
                        <Button variant="outline" className="mt-2 border-gray-700 hover:bg-[#000] text-white">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Verify DNS Configuration
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-gray-400 text-xs">
                          <strong>Note:</strong> SSL certificates are automatically provisioned once DNS is verified. Need help? Contact support at{" "}
                          <a href="mailto:support@base44.com" className="text-blue-400 hover:underline">
                            support@base44.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-gray-700 hover:bg-[#111] text-white"
            >
              Reset Changes
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isLoading}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold px-8"
            >
              <Save className="w-5 h-5 mr-2" />
              {saveMutation.isLoading ? "Saving..." : "Save All Changes"}
            </Button>
          </div>

        </div>
      </div>
    </PermissionGate>
  );
}
