import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditLogViewer from "@/components/AuditLogViewer";
import CostAnomalyDetector from "@/components/CostAnomalyDetector";
import RBACManager from "@/components/RBACManager";
import WebhookManager from "@/components/WebhookManager";
import DisasterRecoveryPanel from "@/components/DisasterRecoveryPanel";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import PredictiveAlertCenter from "@/components/PredictiveAlertCenter";
import CostOptimizationCenter from "@/components/CostOptimizationCenter";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BarChart3, FileText, Settings, Webhook, HardDrive, LineChart, AlertCircle, TrendingDown } from "lucide-react";
import { useEffect, useState as useStateHook } from "react";

export default function EnterpriseAdmin() {
  const [user, setUser] = useStateHook(null);
  const [isAuthorized, setIsAuthorized] = useStateHook(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const isAdmin = currentUser?.role === 'admin' || currentUser?.custom_role === 'super_admin';
        setIsAuthorized(isAdmin);
      } catch {
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] flex items-center justify-center">
        <Card className="bg-red-500/10 border-red-500/30 max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-white font-bold mb-2">Access Denied</h2>
              <p className="text-gray-400 text-sm">
                Only admins can access the Enterprise Admin panel.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-orange-400" />
            Enterprise Admin Panel
          </h1>
          <p className="text-gray-400">Manage security, compliance, and system health</p>
        </div>

        <Tabs defaultValue="audit" className="space-y-6">
          <TabsList className="bg-[#111317] border-b border-gray-800 overflow-x-auto">
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="rbac" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              RBAC
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="dr" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              DR
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="costs">
            <CostAnomalyDetector />
          </TabsContent>

          <TabsContent value="rbac">
            <RBACManager />
          </TabsContent>

          <TabsContent value="webhooks">
            <WebhookManager />
          </TabsContent>

          <TabsContent value="dr">
            <DisasterRecoveryPanel />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="alerts">
            <PredictiveAlertCenter />
          </TabsContent>

          <TabsContent value="optimization">
            <CostOptimizationCenter />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-[#111317] border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-400">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="text-sm text-gray-300 mb-2">Session Timeout</p>
                  <input type="number" defaultValue={30} className="w-full bg-black/50 border border-gray-700 text-white p-2 rounded text-sm" placeholder="Minutes" />
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="text-sm text-gray-300 mb-2">Rate Limit Threshold</p>
                  <input type="number" defaultValue={100} className="w-full bg-black/50 border border-gray-700 text-white p-2 rounded text-sm" placeholder="Requests per minute" />
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="text-sm text-gray-300 mb-2">Cost Alert Threshold (%)</p>
                  <input type="number" defaultValue={50} className="w-full bg-black/50 border border-gray-700 text-white p-2 rounded text-sm" placeholder="Percentage increase" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}