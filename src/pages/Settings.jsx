
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PermissionGate, { RoleBadge, PermissionBadge } from '@/components/PermissionGate';
import FeatureFlagsPanel from '@/components/FeatureFlagsPanel'; // NEW IMPORT
import {
  User,
  Mail,
  Shield,
  Bell,
  Link2,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
  Smartphone,
  Globe,
  Settings as SettingsIcon, // Renamed to avoid conflict with `Settings` component
  Trash2,
  Edit3,
  Camera,
  ExternalLink,
  Palette,
  Moon,
  Sun,
  Languages,
  DollarSign,
  Download,
  Share2,
  Database,
  Zap,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

// Helper function for permissions (NEW)
const hasPermission = (user, permissionKey) => {
  if (!user || !user.permissions) return false;
  // Assuming user.permissions is an array of strings
  return user.permissions.includes(permissionKey);
};

export default function Settings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState({ // Initializing user with default properties for new features
    full_name: "",
    bio: "",
    avatar_url: "",
    phone: "",
    timezone: "America/New_York",
    language: "en",
    email: "",
    role: "user", // Default role
    custom_role: null, // Default custom role
    permissions: [], // Default permissions
    plan_tier: "Free",
    storage_used_mb: 0,
    created_date: null,
    theme_preference: "Dark"
  });
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // Retained for controlled tabs

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    phone: "",
    timezone: "America/New_York",
    language: "en"
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [showPasswords, setShowPasswords] = useState(false);

  // 2FA Setup
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState("authenticator");
  const [twoFactorPhone, setTwoFactorPhone] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      // Ensure currentUser has default values for new properties
      setUser({
        ...currentUser,
        role: currentUser.role || 'user',
        custom_role: currentUser.custom_role || null,
        permissions: currentUser.permissions || [],
        plan_tier: currentUser.plan_tier || 'Free',
        storage_used_mb: currentUser.storage_used_mb || 0,
        created_date: currentUser.created_date || null,
        theme_preference: currentUser.theme_preference || 'Dark',
      });
      setProfileForm({
        full_name: currentUser.full_name || "",
        bio: currentUser.bio || "",
        avatar_url: currentUser.avatar_url || "",
        phone: currentUser.phone || "",
        timezone: currentUser.timezone || "America/New_York",
        language: currentUser.language || "en"
      });
    };
    loadUser();
  }, []);

  // User Preferences
  const { data: preferences } = useQuery({
    queryKey: ["userPreferences", user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
      return prefs[0] || {};
    },
    enabled: !!user?.email, // Changed to user?.email to ensure it's not null/undefined
  });

  // 2FA Settings
  const { data: twoFactorSettings } = useQuery({
    queryKey: ["twoFactor", user?.email],
    queryFn: async () => {
      const settings = await base44.entities.TwoFactorAuth.filter({ user_email: user.email });
      if (settings[0]) {
        setTwoFactorEnabled(settings[0].is_enabled);
        setTwoFactorMethod(settings[0].method || "authenticator");
        setTwoFactorPhone(settings[0].phone_number || "");
      }
      return settings[0] || {};
    },
    enabled: !!user?.email, // Changed to user?.email
  });

  // Connected Integrations
  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations", user?.email],
    queryFn: () => base44.entities.Integration.filter({ created_by: user.email }),
    enabled: !!user?.email, // Changed to user?.email
  });

  const { data: socialAccounts = [] } = useQuery({
    queryKey: ["socialAccounts", user?.email],
    queryFn: () => base44.entities.SocialMediaAccount.filter({ user_email: user.email }),
    enabled: !!user?.email, // Changed to user?.email
  });

  // Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      alert("✅ Profile updated successfully!");
    },
  });

  // Update Preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        await base44.entities.UserPreferences.update(preferences.id, data);
      } else {
        await base44.entities.UserPreferences.create({
          ...data,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userPreferences"]);
      alert("✅ Preferences updated!");
    },
  });

  // Update 2FA
  const update2FAMutation = useMutation({
    mutationFn: async (data) => {
      if (twoFactorSettings?.id) {
        await base44.entities.TwoFactorAuth.update(twoFactorSettings.id, data);
      } else {
        await base44.entities.TwoFactorAuth.create({
          ...data,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["twoFactor"]);
      alert("✅ Security settings updated!");
    },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfileForm({ ...profileForm, avatar_url: file_url });
      await updateProfileMutation.mutateAsync({ avatar_url: file_url });
    } catch (error) {
      alert("Error uploading avatar");
    }
    setIsUploading(false);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Passwords don't match!");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    alert("🔒 Password change would be processed here.\n\nIn production:\n1. Verify current password\n2. Hash new password\n3. Update in auth system\n4. Send confirmation email\n5. Invalidate existing sessions");
    
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: ""
    });
  };

  const handle2FAToggle = async (enabled) => {
    if (enabled && !twoFactorSettings?.id) {
      // Enable 2FA
      await update2FAMutation.mutateAsync({
        is_enabled: true,
        method: twoFactorMethod,
        phone_number: twoFactorPhone,
        secret_key: "encrypted_" + Math.random().toString(36),
        backup_codes: Array.from({ length: 10 }, () => 
          Math.random().toString(36).substr(2, 8).toUpperCase()
        )
      });
      
      alert("✅ 2FA Enabled!\n\n📱 Scan QR code with authenticator app\n🔑 Save backup codes in safe place\n\nIn production, this would:\n1. Generate TOTP secret\n2. Show QR code\n3. Verify first code\n4. Provide backup codes");
    } else {
      // Disable 2FA
      await update2FAMutation.mutateAsync({
        is_enabled: false
      });
      alert("⚠️ 2FA Disabled");
    }
    setTwoFactorEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-[#FFD700]" />
            Settings & Preferences
          </h1>
          <p className="text-gray-400">Manage your account, security, and integrations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111] rounded-xl"> {/* Updated class */}
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="permissions"> {/* NEW TAB TRIGGER */}
              <Shield className="w-4 h-4 mr-2" />
              Role & Permissions
            </TabsTrigger>
            <TabsTrigger value="preferences"> {/* RENAMED from notifications */}
              <SettingsIcon className="w-4 h-4 mr-2" /> {/* Changed icon */}
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security"> {/* EXISTING TAB */}
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="flags"> {/* NEW TAB TRIGGER */}
              <Sparkles className="w-4 h-4 mr-2" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="integrations"> {/* EXISTING TAB */}
              <Link2 className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="privacy"> {/* EXISTING TAB */}
              <Eye className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <div className="space-y-6">
              
              {/* Avatar & Basic Info */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {profileForm.avatar_url ? (
                        <img
                          src={profileForm.avatar_url}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#FFD700]"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                          <User className="w-12 h-12 text-black" />
                        </div>
                      )}
                      
                      <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center cursor-pointer hover:bg-[#FFC700] transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 text-black animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 text-black" />
                        )}
                      </label>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        {user?.full_name || 'User'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">{user?.email}</p>
                      <Badge className={`${
                        user?.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </Badge>
                    </div>
                  </div>

                  {/* Profile Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
                      <Input
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                        placeholder="Your full name"
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Email</label>
                      <Input
                        value={user?.email}
                        disabled
                        className="bg-[#0B0B0C] border-gray-700 text-gray-500 rounded-xl cursor-not-allowed"
                      />
                      <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Bio</label>
                      <Textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl h-24"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Timezone</label>
                        <Select
                          value={profileForm.timezone}
                          onValueChange={(value) => setProfileForm({...profileForm, timezone: value})}
                        >
                          <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                            <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Language</label>
                        <Select
                          value={profileForm.language}
                          onValueChange={(value) => setProfileForm({...profileForm, language: value})}
                        >
                          <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={() => updateProfileMutation.mutate(profileForm)}
                      disabled={updateProfileMutation.isLoading}
                      className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
                    >
                      {updateProfileMutation.isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Profile
                    </Button>
                  </div>

                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Account Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-[#0B0B0C] rounded-xl text-center">
                      <p className="text-gray-400 text-xs mb-1">Plan</p>
                      <p className="text-white font-bold capitalize">{user?.plan_tier || 'Free'}</p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-xl text-center">
                      <p className="text-gray-400 text-xs mb-1">Storage Used</p>
                      <p className="text-white font-bold">{user?.storage_used_mb || 0}MB</p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-xl text-center">
                      <p className="text-gray-400 text-xs mb-1">Member Since</p>
                      <p className="text-white font-bold text-sm">
                        {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-xl text-center">
                      <p className="text-gray-400 text-xs mb-1">Theme</p>
                      <p className="text-white font-bold capitalize">{user?.theme_preference || 'Dark'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* NEW: Role & Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card className="bg-[#111] border-gray-800 rounded-2xl"> {/* Updated class, added rounded-2xl */}
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FFD700]" />
                  Your Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Current Role */}
                <div className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Current Role</p>
                      <RoleBadge role={user?.custom_role || user?.role || 'user'} />
                    </div>
                    <Shield className="w-12 h-12 text-[#FFD700]/30" />
                  </div>
                  <p className="text-gray-300 text-sm">
                    {user?.role === 'admin' || user?.custom_role === 'super_admin' 
                      ? 'You have full administrative access to the platform' 
                      : 'Your role determines which features and data you can access'}
                  </p>
                </div>

                {/* Role Hierarchy */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Role Hierarchy</h4>
                  <div className="space-y-2">
                    {[
                      { role: 'owner', desc: 'Full platform access + billing', color: 'purple' },
                      { role: 'admin', desc: 'Manage users, settings, integrations', color: 'red' },
                      { role: 'manager', desc: 'Manage projects and team members', color: 'yellow' },
                      { role: 'user', desc: 'Create content and view analytics', color: 'blue' },
                      { role: 'viewer', desc: 'Read-only access', color: 'gray' }
                    ].map((r, idx) => {
                      const currentRole = (user?.custom_role || user?.role || 'user').toLowerCase();
                      const roleHierarchy = ['viewer', 'user', 'manager', 'admin', 'owner']; // Simplified hierarchy
                      const currentRoleIndex = roleHierarchy.indexOf(currentRole);
                      const thisRoleIndex = roleHierarchy.indexOf(r.role);
                      const hasThisRole = currentRoleIndex >= thisRoleIndex;

                      return (
                        <div key={idx} className={`p-3 rounded-lg border ${
                          hasThisRole 
                            ? `bg-${r.color}-500/10 border-${r.color}-500/30` 
                            : 'bg-[#0B0B0C] border-gray-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {hasThisRole ? (
                                <CheckCircle2 className={`w-5 h-5 text-${r.color}-400`} />
                              ) : (
                                <Lock className="w-5 h-5 text-gray-600" />
                              )}
                              <div>
                                <p className={`font-semibold text-sm capitalize ${
                                  hasThisRole ? 'text-white' : 'text-gray-500'
                                }`}>
                                  {r.role}
                                </p>
                                <p className="text-gray-400 text-xs">{r.desc}</p>
                              </div>
                            </div>
                            {currentRole === r.role && (
                              <Badge className="bg-green-500/20 text-green-400">You</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Permissions List */}
                {user?.permissions && user.permissions.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Your Permissions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {user.permissions.map((perm, idx) => (
                        <PermissionBadge key={idx} hasAccess={true} label={perm} />
                      ))}
                    </div>
                  </div>
                )}

                {/* What You Can Do */}
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <h4 className="text-white font-semibold mb-3">What You Can Do</h4>
                  <div className="space-y-2">
                    <PermissionBadge 
                      hasAccess={true} // Assuming base access for all users
                      label="Create & Edit Content" 
                    />
                    <PermissionBadge 
                      hasAccess={true} // Assuming base access for all users
                      label="View Analytics" 
                    />
                    <PermissionBadge 
                      hasAccess={hasPermission(user, 'team:manage')}
                      label="Manage Team Members" 
                    />
                    <PermissionBadge 
                      hasAccess={user?.role === 'admin' || user?.custom_role === 'super_admin'}
                      label="Manage Billing" 
                    />
                    <PermissionBadge 
                      hasAccess={user?.role === 'admin' || user?.custom_role === 'super_admin'}
                      label="Configure White-Label" 
                    />
                    <PermissionBadge 
                      hasAccess={hasPermission(user, 'integrations:manage')}
                      label="Manage Integrations" 
                    />
                  </div>
                </div>

                {/* Request Elevation */}
                {user?.role !== 'admin' && user?.custom_role !== 'super_admin' && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-blue-400 font-semibold text-sm mb-1">
                          Need Additional Access?
                        </p>
                        <p className="text-gray-300 text-xs mb-3">
                          If you need elevated permissions or role changes, contact your administrator.
                        </p>
                        <p className="text-gray-500 text-xs">
                          Try asking the AI Copilot: "Request admin access" or "Why am I blocked from billing?"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCES TAB (RENAMED from NOTIFICATIONS) */}
          <TabsContent value="preferences"> {/* Changed value from "notifications" to "preferences" */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#FFD700]" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Email Notifications */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold">Email Notifications</h4>
                      <p className="text-gray-400 text-sm">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={preferences?.email_notifications ?? true}
                      onCheckedChange={(checked) => 
                        updatePreferencesMutation.mutate({ 
                          ...preferences,
                          email_notifications: checked 
                        })
                      }
                    />
                  </div>

                  {preferences?.email_notifications && (
                    <div className="space-y-3 pl-4 border-l-2 border-gray-800">
                      {[
                        { id: 'render_complete', label: 'Video Render Complete', icon: CheckCircle2, color: 'text-green-400' },
                        { id: 'cost_alert', label: 'Budget & Cost Alerts', icon: DollarSign, color: 'text-yellow-400' },
                        { id: 'limit_reached', label: 'Usage Limit Warnings', icon: AlertCircle, color: 'text-red-400' },
                        { id: 'collaboration', label: 'Collaboration Updates', icon: User, color: 'text-blue-400' },
                        { id: 'mentions', label: 'Mentions & Comments', icon: Mail, color: 'text-purple-400' },
                        { id: 'system', label: 'System Updates', icon: SettingsIcon, color: 'text-gray-400' }
                      ].map((notif) => {
                        const Icon = notif.icon;
                        const isEnabled = preferences?.notification_types?.includes(notif.id) ?? true;
                        
                        return (
                          <div key={notif.id} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${notif.color}`} />
                              <span className="text-white text-sm">{notif.label}</span>
                            </div>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => {
                                const currentTypes = preferences?.notification_types || ['render_complete', 'cost_alert', 'limit_reached'];
                                const newTypes = checked
                                  ? [...currentTypes, notif.id]
                                  : currentTypes.filter(t => t !== notif.id);
                                
                                updatePreferencesMutation.mutate({
                                  ...preferences,
                                  notification_types: newTypes
                                });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* In-App Notifications */}
                <div className="pt-6 border-t border-gray-800">
                  <h4 className="text-white font-semibold mb-4">In-App Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-[#00D4C9]" />
                        <div>
                          <p className="text-white text-sm">Desktop Notifications</p>
                          <p className="text-gray-400 text-xs">Browser push notifications</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-[#9D4EDD]" />
                        <div>
                          <p className="text-white text-sm">Sound Alerts</p>
                          <p className="text-gray-400 text-xs">Play sound on notifications</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Daily Digest */}
                <div className="pt-6 border-t border-gray-800">
                  <h4 className="text-white font-semibold mb-4">Email Digest</h4>
                  <Select defaultValue="daily">
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (Instant)</SelectItem>
                      <SelectItem value="hourly">Hourly Summary</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <div className="space-y-6">

              {/* Password Change */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#FF8C00]" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Current Password</label>
                    <div className="relative">
                      <Input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        placeholder="Enter current password"
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl pr-12"
                      />
                      <button
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">New Password</label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      placeholder="Enter new password"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Confirm New Password</label>
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      placeholder="Confirm new password"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-xs">
                      💡 Password must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    className="w-full bg-[#FF8C00] text-white hover:bg-[#FF7700] rounded-xl font-semibold"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#06D6A0]" />
                    Two-Factor Authentication (2FA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Enable 2FA</h4>
                      <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={handle2FAToggle}
                    />
                  </div>

                  {twoFactorEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">2FA Method</label>
                        <Select
                          value={twoFactorMethod}
                          onValueChange={(value) => {
                            setTwoFactorMethod(value);
                            update2FAMutation.mutate({
                              ...twoFactorSettings,
                              method: value
                            });
                          }}
                        >
                          <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="authenticator">
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                Authenticator App (Recommended)
                              </div>
                            </SelectItem>
                            <SelectItem value="sms">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                SMS Text Message
                              </div>
                            </SelectItem>
                            <SelectItem value="email">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Code
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {twoFactorMethod === "sms" && (
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
                          <Input
                            value={twoFactorPhone}
                            onChange={(e) => setTwoFactorPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                          />
                        </div>
                      )}

                      {twoFactorMethod === "authenticator" && (
                        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h5 className="text-white font-semibold mb-3">Setup Authenticator</h5>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center">
                                <p className="text-black text-xs text-center p-4">QR Code Would Appear Here</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <p className="text-gray-300 text-sm">
                                <strong>Step 1:</strong> Install an authenticator app
                              </p>
                              <ul className="text-gray-400 text-xs space-y-1 ml-4">
                                <li>• Google Authenticator</li>
                                <li>• Authy</li>
                                <li>• Microsoft Authenticator</li>
                              </ul>
                              <p className="text-gray-300 text-sm">
                                <strong>Step 2:</strong> Scan QR code
                              </p>
                              <p className="text-gray-300 text-sm">
                                <strong>Step 3:</strong> Enter 6-digit code
                              </p>
                              <Input
                                placeholder="000000"
                                maxLength={6}
                                className="bg-[#111317] border-gray-700 text-white rounded-lg text-center text-2xl tracking-widest"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Backup Codes */}
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <h5 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Backup Codes
                        </h5>
                        <p className="text-gray-300 text-sm mb-3">
                          Save these codes in a safe place. Each can be used once if you lose access to your 2FA device.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {twoFactorSettings?.backup_codes?.slice(0, 6).map((code, idx) => (
                            <div key={idx} className="p-2 bg-[#0B0B0C] rounded text-center">
                              <code className="text-white text-sm font-mono">{code}</code>
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Backup Codes
                        </Button>
                      </div>
                    </motion.div>
                  )}

                </CardContent>
              </Card>

            </div>
          </TabsContent>
          
          {/* NEW: Feature Flags Tab */}
          <TabsContent value="flags">
            <PermissionGate
              user={user}
              minimumRole="admin"
              showLockMessage={true}
              lockMessage="Only administrators can manage feature flags"
            >
              <FeatureFlagsPanel userEmail={user?.email} />
            </PermissionGate>
          </TabsContent>

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations">
            <div className="space-y-6">

              {/* Social Media Accounts */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Social Media Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    {socialAccounts.length} platform{socialAccounts.length !== 1 ? 's' : ''} connected
                  </p>
                  
                  {socialAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {socialAccounts.map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                              <Globe className="w-5 h-5 text-black" />
                            </div>
                            <div>
                              <p className="text-white font-medium capitalize">{account.platform.replace('_', ' ')}</p>
                              <p className="text-gray-400 text-xs">{account.platform_username || account.account_name}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-sm mb-3">No social accounts connected</p>
                      <Button
                        onClick={() => window.location.href = '/SocialMedia'}
                        className="bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-xl"
                      >
                        Connect Platforms
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* API Integrations */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">API & Service Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'GoHighLevel', status: integrations.find(i => i.service_name === 'gohighlevel')?.is_active, icon: Database },
                      { name: 'OpenAI', status: integrations.find(i => i.service_name === 'openai')?.is_active, icon: Sparkles },
                      { name: 'Zapier', status: false, icon: Zap },
                      { name: 'Google Drive', status: false, icon: Database },
                      { name: 'Dropbox', status: false, icon: Database }
                    ].map((integration, idx) => {
                      const Icon = integration.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{integration.name}</p>
                              <p className="text-gray-400 text-xs">
                                {integration.status ? 'Connected and active' : 'Not connected'}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={integration.status ? "outline" : "default"}
                            className={integration.status 
                              ? "border-gray-700 hover:bg-[#111317] rounded-lg text-red-400"
                              : "bg-[#06D6A0] text-black hover:bg-[#05C090] rounded-lg"
                            }
                            onClick={() => {
                              if (integration.status) {
                                if (confirm(`Disconnect ${integration.name}?`)) {
                                  alert(`${integration.name} disconnected`);
                                }
                              } else {
                                alert(`${integration.name} connection flow would start here`);
                              }
                            }}
                          >
                            {integration.status ? 'Disconnect' : 'Connect'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      <ExternalLink className="w-4 h-4 inline mr-1" />
                      Need more integrations? Visit the <a href="/Integrations" className="underline">Integrations page</a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* API Keys */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#FFD700]" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Use these API keys to integrate AI Freedom Studios with your own applications
                  </p>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">Production API Key</p>
                        <p className="text-gray-400 text-xs">Full access to your account</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value="afds_live_••••••••••••••••"
                        disabled
                        className="bg-[#111317] border-gray-700 text-gray-500 rounded-lg font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 hover:bg-[#111317] rounded-lg"
                        onClick={() => {
                          navigator.clipboard.writeText("afds_live_" + Math.random().toString(36).substring(7));
                          alert("✅ API key copied to clipboard");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Generate New API Key
                  </Button>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* PRIVACY TAB */}
          <TabsContent value="privacy">
            <div className="space-y-6">

              {/* Data Privacy */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#00D4C9]" />
                    Data & Privacy Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Profile Visibility</h4>
                      <p className="text-gray-400 text-sm">Make your profile discoverable</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Analytics Tracking</h4>
                      <p className="text-gray-400 text-sm">Help us improve with usage data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">AI Training</h4>
                      <p className="text-gray-400 text-sm">Use my content to improve AI models</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Marketing Emails</h4>
                      <p className="text-gray-400 text-sm">Receive product updates and tips</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Third-Party Data Sharing</h4>
                      <p className="text-gray-400 text-sm">Share anonymized data with partners</p>
                    </div>
                    <Switch />
                  </div>

                </CardContent>
              </Card>

              {/* Content Privacy */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Content Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Default Project Visibility</label>
                    <Select defaultValue="private">
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Private (Only Me)
                          </div>
                        </SelectItem>
                        <SelectItem value="team">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Team Only
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Public (Anyone)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Allow Project Downloads</h4>
                      <p className="text-gray-400 text-sm">Let collaborators download project files</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Watermark Protection</h4>
                      <p className="text-gray-400 text-sm">Add watermark to shared previews</p>
                    </div>
                    <Switch />
                  </div>

                </CardContent>
              </Card>

              {/* Data Export & Deletion */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  
                  <Button
                    className="w-full bg-[#0B0B0C] border-2 border-gray-700 hover:border-[#00D4C9] text-white rounded-xl justify-start"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Export all your data? This will create a downloadable archive of all your content, projects, and settings.")) {
                        alert("📦 Export started! You'll receive an email when ready (typically 5-10 minutes).\n\nIncludes:\n• All video projects\n• Generated content\n• Settings & preferences\n• Activity logs");
                      }
                    }}
                  >
                    <Download className="w-5 h-5 mr-3 text-[#00D4C9]" />
                    <div className="text-left">
                      <p className="font-semibold">Export My Data</p>
                      <p className="text-gray-400 text-xs">Download all your content and settings</p>
                    </div>
                  </Button>

                  <Button
                    className="w-full bg-[#0B0B0C] border-2 border-red-500/30 hover:border-red-500 text-red-400 rounded-xl justify-start"
                    variant="outline"
                    onClick={() => {
                      if (confirm("⚠️ DELETE ACCOUNT?\n\nThis will:\n• Delete all your content\n• Cancel subscriptions\n• Remove all data permanently\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?")) {
                        alert("🔒 Account deletion would be processed here.\n\nIn production:\n1. 30-day grace period\n2. Export data first\n3. Cancel all subscriptions\n4. Permanent deletion after 30 days\n5. Confirmation email sent");
                      }
                    }}
                  >
                    <Trash2 className="w-5 h-5 mr-3 text-red-400" />
                    <div className="text-left">
                      <p className="font-semibold">Delete Account</p>
                      <p className="text-gray-400 text-xs">Permanently delete your account and data</p>
                    </div>
                  </Button>

                </CardContent>
              </Card>

            </div>
          </TabsContent>

        </Tabs>

        {/* Quick Settings Summary */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#FFD700]" />
              Quick Settings Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Email Notifications</p>
                <Badge className={preferences?.email_notifications ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                  {preferences?.email_notifications ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Two-Factor Auth</p>
                <Badge className={twoFactorEnabled ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                  {twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Connected Platforms</p>
                <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                  {socialAccounts.length} platforms
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
