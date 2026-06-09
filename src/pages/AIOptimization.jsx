import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
  Database,
  Brain,
  TrendingDown
} from "lucide-react";

export default function AIOptimization() {
  const [user, setUser] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: usageLogs = [] } = useQuery({
    queryKey: ["aiUsageLogs", timeRange],
    queryFn: () => base44.entities.AIUsageLog.list("-created_date", 1000),
  });

  const { data: promptCache = [] } = useQuery({
    queryKey: ["promptCache"],
    queryFn: () => base44.entities.PromptCache.list("-hit_count", 50),
  });

  // Calculate statistics
  const totalCost = usageLogs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
  const totalTokens = usageLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
  const avgResponseTime = usageLogs.length > 0
    ? usageLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / usageLogs.length
    : 0;
  const cacheHitRate = usageLogs.length > 0
    ? (usageLogs.filter(l => l.cache_hit).length / usageLogs.length) * 100
    : 0;

  const totalCacheSavings = promptCache.reduce((sum, cache) => {
    // Estimate: each cache hit saves ~$0.02 (GPT-4 call)
    return sum + (cache.hit_count * 0.02);
  }, 0);

  const stats = [
    {
      label: "Total AI Costs",
      value: `$${totalCost.toFixed(2)}`,
      change: "-12%",
      icon: DollarSign,
      color: "from-[#FF4433] to-[#FF8C00]",
      positive: false
    },
    {
      label: "Cache Hit Rate",
      value: `${cacheHitRate.toFixed(1)}%`,
      change: "+8%",
      icon: Database,
      color: "from-[#A89C94] to-[#1E90FF]",
      positive: true
    },
    {
      label: "Avg Response Time",
      value: `${(avgResponseTime / 1000).toFixed(2)}s`,
      change: "-15%",
      icon: Clock,
      color: "from-[#FF8C00] to-[#A89C94]",
      positive: true
    },
    {
      label: "Cache Savings",
      value: `$${totalCacheSavings.toFixed(2)}`,
      change: "+23%",
      icon: TrendingUp,
      color: "from-[#1E90FF] to-[#FF4433]",
      positive: true
    },
  ];

  // Group by operation type
  const operationStats = usageLogs.reduce((acc, log) => {
    const type = log.operation_type || 'unknown';
    if (!acc[type]) {
      acc[type] = { count: 0, cost: 0, tokens: 0 };
    }
    acc[type].count++;
    acc[type].cost += log.cost_usd || 0;
    acc[type].tokens += log.tokens_used || 0;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Optimization Dashboard</h1>
          <p className="text-gray-400">Monitor costs, performance, and optimization opportunities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      stat.positive
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-400'
                    } text-xs`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="usage">
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="usage">Usage Breakdown</TabsTrigger>
            <TabsTrigger value="cache">Cache Performance</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Usage Breakdown */}
          <TabsContent value="usage" className="space-y-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">AI Operations by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(operationStats).map(([type, stats]) => (
                    <div key={type} className="p-4 bg-[#0B0B0C] rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold capitalize">
                          {type.replace(/_/g, ' ')}
                        </h4>
                        <Badge className="bg-[#FF8C00]/20 text-[#FF8C00]">
                          {stats.count} calls
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Cost</p>
                          <p className="text-white font-medium">${stats.cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tokens</p>
                          <p className="text-white font-medium">{stats.tokens.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg Cost/Call</p>
                          <p className="text-white font-medium">
                            ${(stats.cost / stats.count).toFixed(3)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cache Performance */}
          <TabsContent value="cache" className="space-y-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Most Cached Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promptCache.slice(0, 10).map((cache) => (
                    <div key={cache.id} className="p-4 bg-[#0B0B0C] rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white text-sm line-clamp-2 flex-1">
                          {cache.prompt_text?.slice(0, 100)}...
                        </p>
                        <Badge className="ml-3 bg-green-500/20 text-green-400">
                          {cache.hit_count} hits
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Saved: ${(cache.hit_count * 0.02).toFixed(2)}</span>
                        <span>Last used: {new Date(cache.last_used).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#FF8C00]" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cacheHitRate < 30 && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-yellow-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">Low Cache Hit Rate</h4>
                          <p className="text-gray-300 text-sm mb-2">
                            Your cache hit rate is {cacheHitRate.toFixed(1)}%. Implementing prompt normalization could save ~${((1 - cacheHitRate/100) * totalCost * 0.3).toFixed(2)}/month.
                          </p>
                          <p className="text-gray-400 text-xs">
                            💡 Tip: Standardize common prompts and increase cache duration
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {totalCost > 50 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-blue-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">High AI Costs Detected</h4>
                          <p className="text-gray-300 text-sm mb-2">
                            You've spent ${totalCost.toFixed(2)} on AI operations. Consider switching to GPT-3.5 for simple tasks to reduce costs by ~70%.
                          </p>
                          <p className="text-gray-400 text-xs">
                            💡 Tip: Use GPT-4 only for complex analysis and creative work
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {avgResponseTime > 5000 && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-purple-400 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-1">Slow Response Times</h4>
                          <p className="text-gray-300 text-sm mb-2">
                            Average response time is {(avgResponseTime / 1000).toFixed(2)}s. Implement request batching and use streaming responses for better UX.
                          </p>
                          <p className="text-gray-400 text-xs">
                            💡 Tip: Show loading indicators and use optimistic UI updates
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-green-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Optimization Opportunity</h4>
                        <p className="text-gray-300 text-sm mb-2">
                          Based on your usage patterns, implementing smart prompt caching could save you approximately ${(totalCost * 0.25).toFixed(2)}/month (25% reduction).
                        </p>
                        <p className="text-gray-400 text-xs">
                          💡 Tip: Enable advanced caching in Settings → Integrations → OpenAI
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}