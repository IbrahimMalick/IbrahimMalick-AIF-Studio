import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Zap
} from "lucide-react";
import BudgetManagerBlock from "@/components/BudgetManagerBlock";

export default function BudgetManager() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: budgetPlans = [] } = useQuery({
    queryKey: ["budgetPlans", user?.email],
    queryFn: () => base44.entities.BudgetPlan.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const activePlan = budgetPlans.find(p => p.status === "active");

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <Tabs defaultValue="create">
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="create">
              <Target className="w-4 h-4 mr-2" />
              Create Budget
            </TabsTrigger>
            <TabsTrigger value="active">
              <BarChart3 className="w-4 h-4 mr-2" />
              Active Plans ({budgetPlans.filter(p => p.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <TrendingUp className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create">
            {user && <BudgetManagerBlock user={user} />}
          </TabsContent>

          {/* Active Plans Tab */}
          <TabsContent value="active">
            <div className="space-y-4">
              {budgetPlans.filter(p => p.status === 'active').length > 0 ? (
                budgetPlans.filter(p => p.status === 'active').map((plan) => (
                  <Card key={plan.id} className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{plan.plan_name}</CardTitle>
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      
                      {/* Budget Overview */}
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <DollarSign className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                          <p className="text-2xl font-bold text-white">${plan.amount.toLocaleString()}</p>
                          <p className="text-gray-500 text-xs">{plan.period} budget</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <Target className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                          <p className="text-2xl font-bold text-white">${plan.spend_tracking?.total_spent?.toLocaleString() || 0}</p>
                          <p className="text-gray-500 text-xs">Spent</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                          <p className="text-2xl font-bold text-green-400">
                            {plan.performance?.roas?.toFixed(1) || 0}x
                          </p>
                          <p className="text-gray-500 text-xs">ROAS</p>
                        </div>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          <BarChart3 className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                          <p className="text-2xl font-bold text-white">
                            {plan.performance?.total_leads || 0}
                          </p>
                          <p className="text-gray-500 text-xs">Leads</p>
                        </div>
                      </div>

                      {/* Budget Allocation */}
                      <div className="p-4 bg-[#0B0B0C] rounded-xl mb-4">
                        <h4 className="text-white font-semibold mb-3">Channel Allocation</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(plan.allocation || {}).map(([channel, percent]) => {
                            const spent = plan.spend_tracking?.[`${channel}_spent`] || 0;
                            const allocated = (plan.amount * (percent / 100));
                            return (
                              <div key={channel} className="p-2 bg-[#111317] rounded">
                                <p className="text-gray-400 text-xs capitalize">{channel}</p>
                                <p className="text-white font-bold">{percent}%</p>
                                <p className="text-gray-500 text-xs">
                                  ${spent.toFixed(0)} / ${allocated.toFixed(0)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Optimization Rules */}
                      {plan.optimization_rules?.length > 0 && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                          <h4 className="text-yellow-400 font-semibold text-sm mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Auto-Optimization Rules ({plan.optimization_rules.length})
                          </h4>
                          <div className="space-y-1">
                            {plan.optimization_rules.map((rule, idx) => (
                              <div key={idx} className="text-xs text-gray-300">
                                <strong className="text-yellow-400">{rule.rule_name}:</strong> {rule.condition} → {rule.action}
                                {rule.enabled && <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">Active</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No active budget plans</p>
                    <p className="text-gray-500 text-sm">Create your first AI-managed budget</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                {budgetPlans.length > 0 ? (
                  <div className="space-y-3">
                    {budgetPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">{plan.plan_name}</h3>
                          <Badge className={
                            plan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            plan.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                            plan.status === 'exceeded' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }>
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs">Budget</p>
                            <p className="text-white">${plan.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Spent</p>
                            <p className="text-white">${plan.spend_tracking?.total_spent?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Leads</p>
                            <p className="text-white">{plan.performance?.total_leads || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">ROAS</p>
                            <p className="text-green-400 font-bold">
                              {plan.performance?.roas?.toFixed(1) || 0}x
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 text-sm">No budget history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Pricing Information Card */}
        <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">💰 Pricing Models Explained</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2">% of Ad Spend</h4>
                <p className="text-gray-400 text-sm mb-2">
                  10–35% of total ad spend
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  <strong className="text-[#FFD700]">Typical:</strong> 15–25%
                </p>
                <p className="text-gray-500 text-xs">
                  <strong className="text-[#00D4C9]">Minimum:</strong> $249–$749/mo
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h4 className="text-white font-bold mb-2">Subscription Only</h4>
                <p className="text-gray-400 text-sm mb-2">
                  Fixed monthly fee
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  <strong className="text-[#FFD700]">Range:</strong> $97–$497/mo
                </p>
                <p className="text-gray-500 text-xs">
                  Includes AI automation, no ad spend %
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl border-2 border-[#FFD700]/30">
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] mb-2">Recommended</Badge>
                <h4 className="text-white font-bold mb-2">Hybrid Model</h4>
                <p className="text-gray-400 text-sm mb-2">
                  Subscription + % of spend
                </p>
                <p className="text-gray-500 text-xs mb-2">
                  <strong className="text-[#FFD700]">Base:</strong> $97–$297/mo
                </p>
                <p className="text-gray-500 text-xs">
                  <strong className="text-[#00D4C9]">Plus:</strong> 10–20% of ad spend (min floor)
                </p>
              </div>

            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h5 className="text-blue-400 font-semibold text-xs mb-2">💡 Enterprise Option:</h5>
              <p className="text-gray-300 text-xs">
                Custom SOW (Statement of Work), dedicated strategist, priority render queue, white-glove onboarding
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}