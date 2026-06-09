import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecuritySettings from "@/components/SecuritySettings";
import { Shield, Lock, Key, AlertTriangle } from "lucide-react";

export default function SecurityPage() {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#FFD700]" />
            Security & Privacy
          </h1>
          <p className="text-gray-400">Protect your account and manage your security settings</p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="bg-[#111317] border border-gray-800">
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Key className="w-4 h-4 mr-2" />
              Active Sessions
            </TabsTrigger>
            <TabsTrigger value="audit">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <SecuritySettings user={user} />
          </TabsContent>

          <TabsContent value="sessions">
            <SecuritySettings user={user} />
          </TabsContent>

          <TabsContent value="audit">
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>Audit log coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}