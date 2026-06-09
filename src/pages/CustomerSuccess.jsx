import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CustomerSuccessDashboard from "@/components/CustomerSuccessDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, MessageSquare, Target } from "lucide-react";
import SEOHead from "@/components/SEOHead";

export default function CustomerSuccess() {
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
    <>
      <SEOHead
        title="Customer Success"
        description="Track your account health and success metrics"
        keywords={["customer success", "account health", "usage tracking"]}
      />

      <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#FFD700]" />
              Customer Success Hub
            </h1>
            <p className="text-gray-400">Monitor your account health and optimize your success</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#111317] border border-gray-800">
              <TabsTrigger value="overview">
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="goals">
                <Target className="w-4 h-4 mr-2" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <MessageSquare className="w-4 h-4 mr-2" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <CustomerSuccessDashboard user={user} />
            </TabsContent>

            <TabsContent value="goals">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-400">Goals tracking coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-400">Feedback system coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </>
  );
}