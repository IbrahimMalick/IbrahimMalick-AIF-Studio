
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Target,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Brain,
  Rocket,
  BarChart3,
  Facebook,
  Youtube,
  Video, // Replaces TikTok icon
  Mail, // For Email
  MessageSquare, // New
  Smartphone // New
} from "lucide-react";


// NEW: Channel options with icons and colors
const channelOptions = [
  { value: "meta", label: "Meta (FB/IG)", icon: Facebook, color: "#1877F2" },
  { value: "google", label: "Google Ads", icon: Target, color: "#4285F4" },
  { value: "tiktok", label: "TikTok", icon: Video, color: "#000000" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000" },
  { value: "linkedin", label: "LinkedIn Ads", icon: MessageSquare, color: "#0A66C2" },
  { value: "email", label: "Email", icon: Mail, color: "#EA4335" },
  { value: "sms", label: "SMS", icon: Smartphone, color: "#25D366" }
];

export default function BudgetManagerBlock({ user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    plan_name: "",
    amount: 1000,
    period: "monthly",
    goal: "lead_generation",
    channels: ["meta", "tiktok"],
    allocation: {}
  });
  const [step, setStep] = useState(1);
  const [aiAllocation, setAiAllocation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pricingModel, setPricingModel] = useState("hybrid"); // NEW: subscription, percent, hybrid
  const [hybridConfig, setHybridConfig] = useState({ // NEW
    base_fee: 297,
    ad_spend_percent: 15,
    min_floor: 249
  });


  // Modified from previous planBudget, now generateAIAllocation
  const generateAIAllocation = async () => {
    setIsGenerating(true);
    setAiAllocation(null); // Clear previous allocation
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      const newAllocation = {};
      const selectedChannels = formData.channels;
      const totalChannelsCount = selectedChannels.length;

      // Simple AI logic for demo purposes: distribute, then adjust based on goal
      let basePercentage = 100 / totalChannelsCount;
      if (totalChannelsCount === 0) {
        setAiAllocation({});
        return;
      }

      selectedChannels.forEach(channel => {
        let percentage = basePercentage;

        // Adjust based on goal (example logic)
        if (formData.goal === "lead_generation") {
          if (channel === "meta") percentage += 10;
          if (channel === "google") percentage += 5;
        } else if (formData.goal === "sales") {
          if (channel === "google") percentage += 15;
          if (channel === "youtube") percentage += 5;
        } else if (formData.goal === "brand_awareness") {
          if (channel === "youtube") percentage += 10;
          if (channel === "tiktok") percentage += 5;
        }

        newAllocation[channel] = Math.max(0, percentage); // Ensure no negative percentages
      });

      // Normalize to 100%
      const currentSum = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
      if (currentSum !== 100 && currentSum > 0) {
        const adjustmentFactor = 100 / currentSum;
        Object.keys(newAllocation).forEach(channel => {
          newAllocation[channel] = Math.round(newAllocation[channel] * adjustmentFactor);
        });
      }

      // Final check for sum to 100 (due to rounding)
      let finalSum = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
      if (finalSum !== 100 && Object.keys(newAllocation).length > 0) {
        const diff = 100 - finalSum;
        const firstChannel = Object.keys(newAllocation)[0];
        newAllocation[firstChannel] += diff;
      }


      setAiAllocation(newAllocation);
    } catch (error) {
      console.error("Failed to generate AI allocation:", error);
      alert("Failed to generate AI allocation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateHybridFee = () => {
    // Convert period amount to monthly for fee calculation
    let monthlySpend = formData.amount;
    switch (formData.period) {
      case "daily":
        monthlySpend *= 30;
        break;
      case "weekly":
        monthlySpend *= 4;
        break;
      case "quarterly":
        monthlySpend /= 3;
        break;
      case "monthly":
      default:
        // Already monthly
        break;
    }

    const spendFee = (monthlySpend * (hybridConfig.ad_spend_percent / 100));

    if (pricingModel === "percent") {
      return Math.max(spendFee, hybridConfig.min_floor);
    }
    if (pricingModel === "subscription") {
      return hybridConfig.base_fee;
    }
    // hybrid
    return Math.max(
      hybridConfig.base_fee + spendFee,
      hybridConfig.min_floor
    );
  };

  const createBudgetMutation = useMutation({
    mutationFn: async (newBudget) => {
      // Simulate API call
      return new Promise(resolve => setTimeout(() => resolve(newBudget), 2000));
    },
    onSuccess: (data) => {
      console.log("Budget created:", data);
      // alert("Budget plan created successfully!");
    },
    onError: (error) => {
      console.error("Error creating budget:", error);
      alert("Failed to create budget plan.");
    },
  });

  const handleSubmit = async () => {
    if (!formData.plan_name) {
      alert("Please provide a plan name.");
      return;
    }
    if (formData.amount < 100) {
      alert("Budget amount must be at least $100.");
      return;
    }
    if (formData.channels.length === 0) {
      alert("Please select at least one channel.");
      return;
    }
    if (!aiAllocation || Object.keys(aiAllocation).length === 0) {
      alert("Please generate AI allocation first.");
      return;
    }
    if (createBudgetMutation.isPending) {
      return;
    }

    await createBudgetMutation.mutateAsync({
      user_email: user?.email || "guest@example.com", // Fallback for guest user
      plan_name: formData.plan_name,
      amount: formData.amount,
      period: formData.period,
      goal: formData.goal,
      channels: formData.channels,
      allocation: aiAllocation,
      status: "active",
      pricing_model: pricingModel, // NEW
      hybrid_config: pricingModel === "subscription" ? { base_fee: hybridConfig.base_fee, ad_spend_percent: 0, min_floor: hybridConfig.base_fee }
        : pricingModel === "percent" ? { base_fee: 0, ad_spend_percent: hybridConfig.ad_spend_percent, min_floor: hybridConfig.min_floor }
          : hybridConfig, // Ensure hybridConfig is always sent for hybrid, and adjusted for other models
      monthly_fee: calculateHybridFee(), // NEW
      optimization_rules: [
        {
          rule_name: "Pause Low Performers",
          condition: "ROAS < 2.0 after $200 spend",
          action: "Pause channel and reallocate budget",
          enabled: true
        },
        {
          rule_name: "Scale Winners",
          condition: "ROAS > 3.0 consistently",
          action: "Increase budget by 20%",
          enabled: true
        },
        {
          rule_name: "Budget Alert",
          condition: "90% of budget spent",
          action: "Send notification to user",
          enabled: true
        }
      ],
      alerts: {
        alert_at_50_percent: true,
        alert_at_75_percent: true,
        alert_at_90_percent: true,
        low_roas_threshold: 2.0
      }
    });

    alert(`✅ Budget Plan Created!

💰 BUDGET: $${formData.amount.toLocaleString()} / ${formData.period}
🎯 GOAL: ${formData.goal.replace(/_/g, ' ')}
📊 CHANNELS: ${formData.channels.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}

${pricingModel === 'hybrid' ? `
💵 HYBRID BILLING:
• Base Fee: $${hybridConfig.base_fee}/mo
• Ad Spend Fee: ${hybridConfig.ad_spend_percent}% of spend
• Minimum Floor: $${hybridConfig.min_floor}/mo
• Your Monthly Fee: $${calculateHybridFee().toLocaleString()}/mo
` : pricingModel === 'percent' ? `
💵 PERCENT OF SPEND:
• ${hybridConfig.ad_spend_percent}% of $${formData.amount.toLocaleString()} = $${Math.round((formData.amount * hybridConfig.ad_spend_percent) / 100).toLocaleString()}
• Minimum: $${hybridConfig.min_floor.toLocaleString()}/mo
• Your Monthly Fee: $${calculateHybridFee().toLocaleString()}/mo
` : `
💵 SUBSCRIPTION:
• Fixed Monthly: $${hybridConfig.base_fee.toLocaleString()}/mo
• Your Monthly Fee: $${calculateHybridFee().toLocaleString()}/mo
`}

🤖 AI ALLOCATION:
${Object.entries(aiAllocation || {}).map(([ch, pct]) => `• ${ch.charAt(0).toUpperCase() + ch.slice(1)}: ${pct}%`).join('\n')}

⚡ AUTO-OPTIMIZATION: Enabled
AI will monitor performance every 6 hours and optimize spend allocation.

Next: Connect your ad accounts in Settings → Integrations`);

    setStep(1);
    setFormData({
      plan_name: "",
      amount: 1000,
      period: "monthly",
      goal: "lead_generation",
      channels: ["meta", "tiktok"],
      allocation: {}
    });
    setAiAllocation(null);
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#06D6A0]" />
            Create AI-Managed Budget Plan
          </CardTitle>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => ( // NEW: Added step 4 for pricing
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s
                    ? 'bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black'
                    : 'bg-[#0B0B0C] text-gray-600 border border-gray-800'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Plan Name</label>
              <Input
                value={formData.plan_name}
                onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                placeholder="e.g., Q1 Lead Generation Campaign"
                className="bg-[#0B0B0C] border-gray-700 text-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Total Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                    className="bg-[#0B0B0C] border-gray-700 text-white pl-8"
                    min="100"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Period</label>
                <Select value={formData.period} onValueChange={(val) => setFormData({...formData, period: val})}>
                  <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Campaign Goal</label>
              <Select value={formData.goal} onValueChange={(val) => setFormData({...formData, goal: val})}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                  <SelectItem value="sales">Direct Sales</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.plan_name || formData.amount < 100}
              className="w-full bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black font-bold"
            >
              Next: Select Channels
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 2: Channel Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-3 block">Select Marketing Channels</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {channelOptions.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = formData.channels.includes(channel.value);
                  return (
                    <button
                      key={channel.value}
                      onClick={() => {
                        const newChannels = isSelected
                          ? formData.channels.filter(c => c !== channel.value)
                          : [...formData.channels, channel.value];
                        setFormData({...formData, channels: newChannels});
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#06D6A0]/20 to-[#00D4C9]/20 border-[#06D6A0]'
                          : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-[#06D6A0]' : 'text-gray-600'}`} />
                      <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        {channel.label}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-[#06D6A0]" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                💡 Tip: Select 2-4 channels for optimal AI allocation
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 border-gray-700 text-white"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={formData.channels.length === 0}
                className="flex-1 bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black font-bold"
              >
                Next: AI Allocation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: AI Allocation */}
        {step === 3 && (
          <div className="space-y-4">
            {!aiAllocation ? (
              <div className="text-center py-8">
                <Button
                  onClick={generateAIAllocation}
                  disabled={isGenerating || formData.channels.length === 0}
                  className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white font-bold px-8 py-4 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Best Allocation...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Generate AI Allocation
                    </>
                  )}
                </Button>
                <p className="text-gray-500 text-sm mt-3">
                  AI will analyze your goal and recommend optimal budget split across channels
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#9D4EDD]" />
                    AI-Recommended Allocation
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(aiAllocation).map(([channel, percent]) => {
                      const channelInfo = channelOptions.find(opt => opt.value === channel);
                      const Icon = channelInfo ? channelInfo.icon : null;
                      return (
                        <div key={channel} className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                          {Icon && <Icon className="w-6 h-6 mx-auto mb-1 text-gray-400" />}
                          <p className="text-gray-400 text-xs capitalize mb-1">{channelInfo ? channelInfo.label.split(' ')[0] : channel}</p>
                          <p className="text-2xl font-bold text-white">{percent}%</p>
                          <p className="text-gray-500 text-xs mt-1">
                            ${((formData.amount * percent) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* The PieChart and its related components are removed as per the outline */}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setAiAllocation(null);
                      setStep(2);
                    }}
                    variant="outline"
                    className="flex-1 border-gray-700 text-white"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="flex-1 bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black font-bold"
                  >
                    Next: Choose Pricing Model
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: Pricing Model - NEW */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-3 block font-semibold">Select Your Pricing Model</label>

              <div className="grid md:grid-cols-3 gap-4 mb-6">

                {/* Subscription Only */}
                <button
                  type="button"
                  onClick={() => setPricingModel("subscription")}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    pricingModel === "subscription"
                      ? 'bg-gradient-to-br from-[#9D4EDD]/20 to-[#FF69B4]/20 border-[#9D4EDD]'
                      : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <h4 className="text-white font-bold mb-2">Subscription Only</h4>
                  <p className="text-gray-400 text-sm mb-3">Fixed monthly fee</p>
                  <div className="mb-3">
                    <label className="text-gray-500 text-xs block mb-1">Base Fee ($)</label>
                    <Input
                      type="number"
                      value={hybridConfig.base_fee}
                      onChange={(e) => setHybridConfig({...hybridConfig, base_fee: parseInt(e.target.value) || 0})}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#111317] border-gray-700 text-white"
                      min="97"
                      step="50"
                    />
                  </div>
                  {pricingModel === "subscription" && (
                    <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                      <p className="text-green-400 text-xs font-semibold">
                        Your Fee: ${calculateHybridFee().toLocaleString()}/mo
                      </p>
                    </div>
                  )}
                </button>

                {/* Percent of Ad Spend */}
                <button
                  type="button"
                  onClick={() => setPricingModel("percent")}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    pricingModel === "percent"
                      ? 'bg-gradient-to-br from-[#00D4C9]/20 to-[#06D6A0]/20 border-[#00D4C9]'
                      : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <h4 className="text-white font-bold mb-2">% of Ad Spend</h4>
                  <p className="text-gray-400 text-sm mb-3">Performance-based</p>
                  <div className="space-y-2 mb-3">
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Percentage (%)</label>
                      <Input
                        type="number"
                        value={hybridConfig.ad_spend_percent}
                        onChange={(e) => setHybridConfig({...hybridConfig, ad_spend_percent: parseInt(e.target.value) || 0})}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#111317] border-gray-700 text-white"
                        min="10"
                        max="35"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Minimum Floor ($)</label>
                      <Input
                        type="number"
                        value={hybridConfig.min_floor}
                        onChange={(e) => setHybridConfig({...hybridConfig, min_floor: parseInt(e.target.value) || 0})}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#111317] border-gray-700 text-white"
                        min="249"
                        step="50"
                      />
                    </div>
                  </div>
                  {pricingModel === "percent" && (
                    <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                      <p className="text-green-400 text-xs font-semibold">
                        Your Fee: ${calculateHybridFee().toLocaleString()}/mo
                      </p>
                      <p className="text-gray-400 text-xs">
                        {hybridConfig.ad_spend_percent}% of ${formData.amount.toLocaleString()} (min ${hybridConfig.min_floor.toLocaleString()})
                      </p>
                    </div>
                  )}
                </button>

                {/* Hybrid - RECOMMENDED */}
                <button
                  type="button"
                  onClick={() => setPricingModel("hybrid")}
                  className={`p-5 rounded-xl border-2 transition-all text-left relative ${
                    pricingModel === "hybrid"
                      ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 border-[#FFD700]'
                      : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <Badge className="bg-[#FFD700] text-black text-xs font-bold mb-2 absolute -top-3 -right-3">RECOMMENDED</Badge>
                  <h4 className="text-white font-bold mb-2">Hybrid Model</h4>
                  <p className="text-gray-400 text-sm mb-3">Base + % of spend</p>
                  <div className="space-y-2 mb-3">
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Base Fee ($)</label>
                      <Input
                        type="number"
                        value={hybridConfig.base_fee}
                        onChange={(e) => setHybridConfig({...hybridConfig, base_fee: parseInt(e.target.value) || 0})}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#111317] border-gray-700 text-white"
                        min="97"
                        step="50"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">% of Spend (%)</label>
                      <Input
                        type="number"
                        value={hybridConfig.ad_spend_percent}
                        onChange={(e) => setHybridConfig({...hybridConfig, ad_spend_percent: parseInt(e.target.value) || 0})}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#111317] border-gray-700 text-white"
                        min="10"
                        max="25"
                      />
                    </div>
                  </div>
                  {pricingModel === "hybrid" && (
                    <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                      <p className="text-green-400 text-xs font-semibold">
                        Your Fee: ${calculateHybridFee().toLocaleString()}/mo
                      </p>
                      <p className="text-gray-400 text-xs">
                        ${hybridConfig.base_fee.toLocaleString()} + {hybridConfig.ad_spend_percent}% of ${formData.amount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </button>

              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 text-sm">
                  💡 <strong>Hybrid model recommended:</strong> Guarantees minimum revenue while scaling with client success.
                  Most agencies charge $297-$497 base + 15-20% of ad spend.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(3)}
                variant="outline"
                className="flex-1 border-gray-700 text-white"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createBudgetMutation.isPending}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
              >
                {createBudgetMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Budget Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
