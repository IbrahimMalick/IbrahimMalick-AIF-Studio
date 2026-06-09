
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Activity,
  Database, // New: for Quotas & Storage tab
  Zap,
  Mail,
  Search,
  HardDrive, // New: for Storage Overview card title
  Settings // New: for System Health tab
} from "lucide-react";
import PermissionGate from '@/components/PermissionGate';
import StorageUsageWidget from "@/components/StorageUsageWidget"; // New import

export default function Admin() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch all data
  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  // The following data fetches for subscriptions, payments, aiUsage, videoProjects, artGenerations
  // are no longer directly rendered in the updated UI structure, as the 'Key Metrics',
  // 'Revenue Metrics', 'Subscriptions', 'Usage', and 'Payments' tabs have been removed
  // or replaced based on the provided outline.
  // We'll keep them fetched in case future updates reintroduce their usage or they are
  // indirectly used by other components (e.g., in user-specific details not shown in the outline).
  // For the purpose of this update, the outline implies these specific overview sections are replaced.

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["allSubscriptions"],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["allPayments"],
    queryFn: () => base44.entities.PaymentHistory.list("-created_date", 500),
  });

  const { data: aiUsage = [] } = useQuery({
    queryKey: ["allAIUsage"],
    queryFn: () => base44.entities.AIUsageLog.list("-created_date", 1000),
  });

  const { data: videoProjects = [] } = useQuery({
    queryKey: ["allVideoProjects"],
    queryFn: () => base44.entities.VideoProject.list(),
  });

  const { data: artGenerations = [] } = useQuery({
    queryKey: ["allArtGenerations"],
    queryFn: () => base44.entities.ArtGeneration.list(),
  });

  // Metric calculations related to the removed "Key Metrics" and "Revenue Metrics" sections,
  // and the removed "Subscriptions", "Usage", and "Payments" tabs are no longer needed
  // for the current dashboard view according to the outline.
  // If they are needed elsewhere (e.g., in a specific user's detailed view), they should be recalculated there.

  const filteredUsers = allUsers.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PermissionGate
          user={user}
          minimumRole="admin"
          showLockMessage={true}
          lockMessage="Only administrators can access the admin panel"
        >
          {/* Header - REPLACED as per outline */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">System Administration</h1>
              <p className="text-gray-400">Manage users, quotas, and system health</p>
            </div>
          </div>

          {/* Key Metrics and Revenue Metrics sections have been removed based on the outline */}

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-[#111317] rounded-xl mb-6"> {/* Updated TabsList as per outline */}
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              {/* NEW: Quotas & Storage Tab Trigger */}
              <TabsTrigger value="quotas">
                <Database className="w-4 h-4 mr-2" />
                Quotas & Storage
              </TabsTrigger>
              {/* NEW: Activity Logs Tab Trigger */}
              <TabsTrigger value="activity">
                <Activity className="w-4 h-4 mr-2" />
                Activity Logs
              </TabsTrigger>
              {/* NEW: System Health Tab Trigger */}
              <TabsTrigger value="system">
                <Settings className="w-4 h-4 mr-2" />
                System Health
              </TabsTrigger>
            </TabsList>

            {/* Users Tab - Content preserved */}
            <TabsContent value="users">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">All Users</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 bg-[#0B0B0C] border-gray-700 text-white rounded-xl w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredUsers.map((u) => {
                      const sub = subscriptions.find(s => s.user_email === u.email);
                      return (
                        <div
                          key={u.id}
                          className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF4433] to-[#1E90FF] flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {u.email[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.full_name || u.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-xs ${
                                  u.role === 'admin' ? 'bg-[#FF4433]/20 text-[#FF4433]' : 'bg-[#1E90FF]/20 text-[#1E90FF]'
                                }`}>
                                  {u.role}
                                </Badge>
                                {sub && (
                                  <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs">
                                    {sub.plan_tier}
                                  </Badge>
                                )}
                                <span className="text-gray-500 text-xs">
                                  {new Date(u.created_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-gray-400 text-xs">Storage</div>
                              <div className="text-white text-sm">{u.storage_used_mb || 0} MB</div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-400 text-xs">AI Tokens</div>
                              <div className="text-white text-sm">{u.tokens_used || 0}</div>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-lg border-gray-700">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW: Quotas & Storage Tab Content */}
            <TabsContent value="quotas">
              <div className="space-y-6">

                {/* Storage Overview */}
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-[#00D4C9]" />
                      Tenant Storage Overview
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-2">
                      Storage usage synced nightly via cron (scripts/storage_meter.js)
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allUsers.map((u) => (
                        <StorageUsageWidget
                          key={u.email}
                          tenantId={u.email} // Assuming user email is the tenant ID
                          showDetails={true}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quota Controls */}
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#FFD700]" />
                      Tenant Quotas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-sm mb-2">
                          📊 <strong>Quota Enforcement</strong>
                        </p>
                        <p className="text-gray-300 text-xs mb-3">
                          Quotas are enforced via <code className="bg-black px-1 rounded">src/limits/quota.js</code> middleware:
                        </p>
                        <ul className="text-gray-300 text-xs space-y-1 ml-4 list-disc list-inside">
                          <li><strong>Runs/Day:</strong> checkRunQuota(tenantId)</li>
                          <li><strong>Renders/Month:</strong> checkRenderQuota(tenantId)</li>
                          <li><strong>QPS:</strong> checkQps(tenantId)</li>
                          <li><strong>Storage:</strong> checkStorage(tenantId)</li>
                        </ul>
                        <p className="text-gray-400 text-xs mt-3">
                          Configure limits in <code className="bg-black px-1 rounded">TenantQuota</code> table (Prisma)
                        </p>
                      </div>

                      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <p className="text-orange-400 text-sm mb-2">
                          🔧 <strong>Setup Required</strong>
                        </p>
                        <ol className="text-gray-300 text-xs space-y-2 ml-4 list-decimal list-inside">
                          <li>Run <code className="bg-black px-1 rounded">npx prisma migrate dev</code></li>
                          <li>Add <code className="bg-black px-1 rounded">src/limits/quota.js</code></li>
                          <li>Wire middleware to <code className="bg-black px-1 rounded">POST /api/workflows/run</code></li>
                          <li>Setup nightly cron: <code className="bg-black px-1 rounded">node scripts/storage_meter.js</code></li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* NEW: Activity Logs Tab Content - Placeholder as no content was provided in outline */}
            <TabsContent value="activity">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#30D5C8]" />
                    Recent Activity Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Activity logs will be displayed here.</p>
                  {/* You can populate this with recent user actions, system events, etc. */}
                  {/* For example, by fetching from a new `Log` entity or filtering `AIUsageLog` by user. */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* NEW: System Health Tab Content - Placeholder as no content was provided in outline */}
            <TabsContent value="system">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#A89C94]" />
                    System Health & Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">System health metrics and configuration options will be displayed here.</p>
                  {/* This could include database status, API response times, environment variables, etc. */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* The original 'Subscriptions', 'Usage', and 'Payments' TabsContent blocks are removed,
                as their corresponding TabsTriggers are no longer present in the updated TabsList
                provided by the outline. This implies a structural change to the dashboard layout. */}

          </Tabs>
        </PermissionGate>
      </div>
    </div>
  );
}
