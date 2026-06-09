import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Download,
  Target,
  Zap,
  Eye,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAudioFeedback } from "@/components/AudioSystem";
import { showToast } from "@/components/ToastNotification";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RevenueHub() {
  const audio = useAudioFeedback();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("month");
  const [newRevenue, setNewRevenue] = useState({
    source: "affiliate",
    amount_usd: 0,
    platform: "",
    notes: "",
    is_recurring: false
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: revenues = [] } = useQuery({
    queryKey: ["revenues", user?.email],
    queryFn: () => base44.entities.RevenueTracking.filter({
      user_email: user.email
    }, "-transaction_date", 500),
    enabled: !!user?.email
  });

  const addRevenueMutation = useMutation({
    mutationFn: (data) => base44.entities.RevenueTracking.create({
      ...data,
      user_email: user.email,
      transaction_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["revenues"]);
      setIsAddModalOpen(false);
      setNewRevenue({
        source: "affiliate",
        amount_usd: 0,
        platform: "",
        notes: "",
        is_recurring: false
      });
      audio?.playSuccess();
      showToast("Revenue added! 💰", "success");
    },
  });

  // Calculate metrics
  const calculateMetrics = () => {
    const now = new Date();
    const filtered = revenues.filter(r => {
      const date = new Date(r.transaction_date);
      if (timeframe === "week") return now - date < 7 * 24 * 60 * 60 * 1000;
      if (timeframe === "month") return now - date < 30 * 24 * 60 * 60 * 1000;
      if (timeframe === "year") return now - date < 365 * 24 * 60 * 60 * 1000;
      return true;
    });

    const total = filtered.reduce((sum, r) => sum + r.amount_usd, 0);
    const recurring = filtered.filter(r => r.is_recurring).reduce((sum, r) => sum + r.amount_usd, 0);
    
    // Calculate growth
    const halfwayPoint = filtered.length / 2;
    const firstHalf = filtered.slice(0, halfwayPoint).reduce((sum, r) => sum + r.amount_usd, 0);
    const secondHalf = filtered.slice(halfwayPoint).reduce((sum, r) => sum + r.amount_usd, 0);
    const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    // By source
    const bySource = {};
    filtered.forEach(r => {
      bySource[r.source] = (bySource[r.source] || 0) + r.amount_usd;
    });

    return { total, recurring, growth, bySource, count: filtered.length };
  };

  const metrics = calculateMetrics();

  const sourceColors = {
    affiliate: "from-purple-500 to-purple-700",
    course_sales: "from-blue-500 to-blue-700",
    coaching: "from-green-500 to-green-700",
    ad_revenue: "from-yellow-500 to-yellow-700",
    sponsorship: "from-pink-500 to-pink-700",
    product_sales: "from-orange-500 to-orange-700",
    subscription: "from-cyan-500 to-cyan-700",
    other: "from-gray-500 to-gray-700"
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 heading-font">
              💰 Revenue Hub
            </h1>
            <p className="text-gray-400">Track every dollar, optimize every stream</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 bg-[#111317] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#00FF88] to-[#00D4C9]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Revenue
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111317] border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Revenue Entry</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Track your income from various sources
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Source</label>
                    <Select 
                      value={newRevenue.source} 
                      onValueChange={(value) => setNewRevenue({...newRevenue, source: value})}
                    >
                      <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="affiliate">Affiliate</SelectItem>
                        <SelectItem value="course_sales">Course Sales</SelectItem>
                        <SelectItem value="coaching">Coaching</SelectItem>
                        <SelectItem value="ad_revenue">Ad Revenue</SelectItem>
                        <SelectItem value="sponsorship">Sponsorship</SelectItem>
                        <SelectItem value="product_sales">Product Sales</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                    <Input
                      type="number"
                      value={newRevenue.amount_usd}
                      onChange={(e) => setNewRevenue({...newRevenue, amount_usd: parseFloat(e.target.value)})}
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Platform</label>
                    <Input
                      value={newRevenue.platform}
                      onChange={(e) => setNewRevenue({...newRevenue, platform: e.target.value})}
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                      placeholder="e.g. YouTube, Instagram, Website"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Notes</label>
                    <Input
                      value={newRevenue.notes}
                      onChange={(e) => setNewRevenue({...newRevenue, notes: e.target.value})}
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                      placeholder="Optional details"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={newRevenue.is_recurring}
                      onChange={(e) => setNewRevenue({...newRevenue, is_recurring: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label htmlFor="recurring" className="text-sm text-gray-400">
                      Recurring Revenue
                    </label>
                  </div>
                  <Button
                    onClick={() => addRevenueMutation.mutate(newRevenue)}
                    disabled={!newRevenue.amount_usd}
                    className="w-full bg-gradient-to-r from-[#00FF88] to-[#00D4C9]"
                  >
                    Add Revenue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Revenue",
              value: `$${metrics.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
              change: metrics.growth,
              icon: DollarSign,
              color: "from-[#00FF88] to-[#00D4C9]"
            },
            {
              label: "Recurring Revenue",
              value: `$${metrics.recurring.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
              change: null,
              icon: Zap,
              color: "from-[#FFD700] to-[#FFA500]"
            },
            {
              label: "Revenue Streams",
              value: Object.keys(metrics.bySource).length,
              change: null,
              icon: PieChart,
              color: "from-purple-500 to-pink-500"
            },
            {
              label: "Transactions",
              value: metrics.count,
              change: null,
              icon: BarChart3,
              color: "from-blue-500 to-cyan-500"
            }
          ].map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-[#111317] border-gray-800 rounded-2xl overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${metric.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color}`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    {metric.change !== null && (
                      <Badge className={`${
                        metric.change >= 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {metric.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {Math.abs(metric.change).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue by Source */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#00D4C9]" />
              Revenue by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.bySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, amount]) => {
                  const percentage = (amount / metrics.total) * 100;
                  return (
                    <div key={source} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">
                          {source.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#00FF88] font-bold">
                            ${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                          <span className="text-gray-500 text-sm w-12 text-right">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full bg-gradient-to-r ${sourceColors[source]}`}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FFD700]" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenues.length > 0 ? (
              <div className="space-y-3">
                {revenues.slice(0, 20).map((rev, idx) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${sourceColors[rev.source]}`}>
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold capitalize">
                          {rev.source.replace(/_/g, ' ')}
                        </span>
                        {rev.is_recurring && (
                          <Badge className="bg-[#00FF88]/20 text-[#00FF88] text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{rev.platform}</span>
                        {rev.notes && <span>• {rev.notes}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#00FF88] font-bold text-lg">
                        +${rev.amount_usd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(rev.transaction_date).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 mb-4">No revenue tracked yet</p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-[#00FF88] to-[#00D4C9]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}