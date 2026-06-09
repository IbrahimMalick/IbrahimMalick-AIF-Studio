import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  DollarSign,
  Clock,
  Users,
  Video,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DynamicPricingCalculator({ 
  theme = "dark", 
  embedded = false,
  defaultCalculatorType = "agency",
  onLeadCapture = null
}) {
  const [calculatorType, setCalculatorType] = useState(defaultCalculatorType);
  const [showResults, setShowResults] = useState(false);
  const [inputs, setInputs] = useState({
    clients: 10,
    clientValue: 497,
    hoursPerClient: 10,
    currentVideoCost: 10000,
    videosPerMonth: 4,
    productionTime: 14,
    currentTools: [],
    email: "",
    name: "",
    company: ""
  });

  const toolOptions = [
    { id: "clickfunnels", name: "ClickFunnels", cost: 497 },
    { id: "hubspot", name: "HubSpot", cost: 800 },
    { id: "synthesia", name: "Synthesia", cost: 2000 },
    { id: "smith", name: "Smith.ai", cost: 600 },
    { id: "hootsuite", name: "Hootsuite", cost: 599 },
    { id: "mailchimp", name: "Mailchimp", cost: 299 },
    { id: "calendly", name: "Calendly", cost: 144 },
    { id: "zapier", name: "Zapier", cost: 599 }
  ];

  const calculateROI = () => {
    let result = {};
    
    switch(calculatorType) {
      case "agency":
        const monthlyRevenue = inputs.clients * inputs.clientValue;
        const platformCost = 1297;
        const monthlyProfit = monthlyRevenue - platformCost;
        const annualProfit = monthlyProfit * 12;
        const roi = ((monthlyProfit / platformCost) * 100).toFixed(0);
        const timesSaved = inputs.hoursPerClient * inputs.clients;
        
        result = {
          monthlyRevenue,
          platformCost,
          monthlyProfit,
          annualProfit,
          roi,
          timesSaved,
          headline: `${roi}% ROI with ${inputs.clients} clients`,
          subheadline: `Generate $${monthlyProfit.toLocaleString()} monthly profit`
        };
        break;
        
      case "video":
        const traditionalMonthlyCost = inputs.currentVideoCost * inputs.videosPerMonth;
        const aiCostPerVideo = 100;
        const aiMonthlyCost = (aiCostPerVideo * inputs.videosPerMonth) + 797;
        const monthlySavings = traditionalMonthlyCost - aiMonthlyCost;
        const annualSavings = monthlySavings * 12;
        const timeSaved = inputs.productionTime * inputs.videosPerMonth;
        const videoRoi = ((monthlySavings / aiMonthlyCost) * 100).toFixed(0);
        
        result = {
          traditionalCost: traditionalMonthlyCost,
          aiCost: aiMonthlyCost,
          monthlySavings,
          annualSavings,
          roi: videoRoi,
          timeSaved,
          headline: `Save $${monthlySavings.toLocaleString()}/month on video production`,
          subheadline: `${videoRoi}% ROI, ${timeSaved} days saved monthly`
        };
        break;
        
      case "tools":
        const currentToolsCost = inputs.currentTools.reduce((sum, toolId) => {
          const tool = toolOptions.find(t => t.id === toolId);
          return sum + (tool ? tool.cost : 0);
        }, 0);
        const freedomCost = 497;
        const toolSavings = currentToolsCost - freedomCost;
        const annualToolSavings = toolSavings * 12;
        const toolRoi = currentToolsCost > 0 ? ((toolSavings / freedomCost) * 100).toFixed(0) : 0;
        
        result = {
          currentCost: currentToolsCost,
          freedomCost,
          monthlySavings: toolSavings,
          annualSavings: annualToolSavings,
          roi: toolRoi,
          toolCount: inputs.currentTools.length,
          headline: `Replace ${inputs.currentTools.length} tools, save $${toolSavings.toLocaleString()}/month`,
          subheadline: `${toolRoi}% ROI by consolidating your tech stack`
        };
        break;
    }
    
    setShowResults(true);
    return result;
  };

  const toggleTool = (toolId) => {
    const currentTools = [...inputs.currentTools];
    const index = currentTools.indexOf(toolId);
    if (index > -1) {
      currentTools.splice(index, 1);
    } else {
      currentTools.push(toolId);
    }
    setInputs({ ...inputs, currentTools });
  };

  const results = showResults ? calculateROI() : null;

  return (
    <Card className={`${theme === "dark" ? "bg-[#111317] border-gray-800" : "bg-white"} rounded-2xl`}>
      <CardHeader>
        <CardTitle className={`${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
            <Calculator className="w-5 h-5 text-black" />
          </div>
          ROI Calculator
        </CardTitle>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          See your potential return on investment
        </p>
      </CardHeader>
      <CardContent>
        
        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { type: "agency", icon: Users, label: "Agency ROI", color: "blue" },
            { type: "video", icon: Video, label: "Video Savings", color: "purple" },
            { type: "tools", icon: DollarSign, label: "Tool Replacement", color: "green" }
          ].map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              onClick={() => { setCalculatorType(type); setShowResults(false); }}
              className={`p-4 rounded-xl border-2 transition-all ${
                calculatorType === type
                  ? `border-${color}-500 bg-${color}-500/10`
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 text-${color}-400 mx-auto`} />
              <div className="font-bold text-white text-sm">{label}</div>
            </button>
          ))}
        </div>

        {/* Inputs & Results (same as in Pricing page) */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={calculatorType}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {calculatorType === "agency" && (
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Number of clients"
                    value={inputs.clients}
                    onChange={(e) => setInputs({...inputs, clients: parseInt(e.target.value) || 0})}
                    className="bg-[#0B0B0C] border-gray-700 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Monthly value per client ($)"
                    value={inputs.clientValue}
                    onChange={(e) => setInputs({...inputs, clientValue: parseInt(e.target.value) || 0})}
                    className="bg-[#0B0B0C] border-gray-700 text-white"
                  />
                </div>
              )}

              {calculatorType === "video" && (
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Current cost per video ($)"
                    value={inputs.currentVideoCost}
                    onChange={(e) => setInputs({...inputs, currentVideoCost: parseInt(e.target.value) || 0})}
                    className="bg-[#0B0B0C] border-gray-700 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Videos per month"
                    value={inputs.videosPerMonth}
                    onChange={(e) => setInputs({...inputs, videosPerMonth: parseInt(e.target.value) || 0})}
                    className="bg-[#0B0B0C] border-gray-700 text-white"
                  />
                </div>
              )}

              {calculatorType === "tools" && (
                <div className="grid grid-cols-2 gap-2">
                  {toolOptions.slice(0, 6).map(tool => (
                    <label key={tool.id} className="flex items-center p-2 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                      <input
                        type="checkbox"
                        checked={inputs.currentTools.includes(tool.id)}
                        onChange={() => toggleTool(tool.id)}
                        className="mr-2"
                      />
                      <div className="text-sm">
                        <div className="text-white">{tool.name}</div>
                        <div className="text-gray-400 text-xs">${tool.cost}/mo</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <Button
                onClick={calculateROI}
                className="w-full mt-6 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold py-6"
              >
                Calculate ROI
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{results.headline}</h3>
                <p className="text-gray-300">{results.subheadline}</p>
              </div>
              <Button
                onClick={() => setShowResults(false)}
                variant="outline"
                className="w-full border-gray-700 text-white"
              >
                ← Try Different Values
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </CardContent>
    </Card>
  );
}