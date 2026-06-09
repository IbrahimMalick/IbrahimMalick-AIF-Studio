import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentManagement from "@/components/PaymentManagement";
import { CreditCard, Receipt, TrendingUp } from "lucide-react";

export default function BillingV2Page() {
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
            <CreditCard className="w-8 h-8 text-[#FFD700]" />
            Billing & Subscription
          </h1>
          <p className="text-gray-400">Manage your subscription, payments, and invoices</p>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="bg-[#111317] border border-gray-800">
            <TabsTrigger value="subscription">
              <TrendingUp className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <Receipt className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <PaymentManagement user={user} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement user={user} />
          </TabsContent>

          <TabsContent value="invoices">
            <PaymentManagement user={user} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}