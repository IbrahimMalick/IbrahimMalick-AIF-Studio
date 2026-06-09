import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [agentName, setAgentName] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    {
      title: "Welcome to AG-X",
      subtitle: "Let's create your first AI agent in 5 minutes",
      content: (
        <div className="space-y-4">
          <p className="text-gray-400">AG-X powers your business with autonomous AI agents.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">No-code agent builder</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">Multi-provider LLM support</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">Deploy to production instantly</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Create Your First Agent",
      subtitle: "Give your agent a name and purpose",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Agent Name</label>
            <Input
              placeholder="e.g., Customer Support Bot"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="bg-black/30 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">What will this agent do?</label>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 text-white p-2 rounded"
            >
              <option value="">Select a use case</option>
              <option value="support">Customer Support</option>
              <option value="sales">Sales Assistant</option>
              <option value="content">Content Creator</option>
              <option value="analytics">Data Analyst</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Connect Data Source",
      subtitle: "Where will your agent get information?",
      content: (
        <div className="space-y-3">
          {['knowledge_base', 'crm', 'api', 'docs'].map(source => (
            <button
              key={source}
              onClick={() => setDataSource(source)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                dataSource === source
                  ? 'bg-orange-500/20 border-orange-500 text-white'
                  : 'bg-black/30 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <p className="font-semibold capitalize">{source.replace('_', ' ')}</p>
              <p className="text-xs mt-1">
                {source === 'knowledge_base' && 'Upload documents and FAQs'}
                {source === 'crm' && 'Connect HubSpot, Salesforce, etc.'}
                {source === 'api' && 'Pull from custom APIs'}
                {source === 'docs' && 'Link to web pages and docs'}
              </p>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Review & Deploy",
      subtitle: "Ready to launch?",
      content: (
        <div className="space-y-4">
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-4 space-y-2">
              <div>
                <p className="text-xs text-gray-400">Agent Name</p>
                <p className="text-white font-semibold">{agentName || 'Unnamed Agent'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Use Case</p>
                <p className="text-white font-semibold capitalize">{dataSource || 'Not selected'}</p>
              </div>
            </CardContent>
          </Card>
          <p className="text-sm text-gray-400">Your agent will be live in seconds and ready to handle requests.</p>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Create agent
      setIsCreating(true);
      // Simulate agent creation
      setTimeout(() => {
        setIsCreating(false);
        alert(`Agent "${agentName}" created successfully!`);
        // Redirect or reset
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-orange-400">{currentStep.title}</CardTitle>
              <p className="text-sm text-gray-400 mt-1">{currentStep.subtitle}</p>
            </div>
            <Badge className="bg-orange-500/20 text-orange-400">
              Step {step + 1} of {steps.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800/50 rounded-full h-2">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-orange-500 rounded-full"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep.content}

          <div className="flex gap-3">
            {step > 0 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:text-white flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!agentName || !dataSource || isCreating}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white flex-1 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Creating...
                </>
              ) : step === steps.length - 1 ? (
                <>
                  <Play className="w-4 h-4" />
                  Deploy Agent
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skip Option */}
      <div className="text-center mt-4">
        <button className="text-xs text-gray-500 hover:text-gray-400 underline">
          Skip guided setup
        </button>
      </div>
    </motion.div>
  );
}