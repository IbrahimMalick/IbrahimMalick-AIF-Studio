import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Target,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WORKFLOWS = {
  "ctv_campaign_setup": {
    name: "CTV Campaign Setup",
    description: "Complete setup for Connected TV content publishing",
    estimatedTime: 15,
    steps: [
      {
        id: "connect_platforms",
        title: "Connect CTV Platforms",
        description: "Link your Roku, Apple TV, or Fire TV channels",
        type: "platform_connection",
        requiredFields: ["platforms"],
        aiGuidance: "Which CTV platforms do you want to publish to? I recommend starting with Roku (largest user base) and Fire TV (easiest integration)."
      },
      {
        id: "create_project",
        title: "Create CTV Project",
        description: "Set up your first Connected TV project",
        type: "form",
        requiredFields: ["project_name", "content_type", "target_platforms"],
        aiGuidance: "Let's create your first CTV project. What type of content are you creating?"
      },
      {
        id: "generate_script",
        title: "Generate TV-Optimized Script",
        description: "AI creates a script optimized for lean-back viewing",
        type: "ai_generation",
        requiredFields: ["topic", "target_audience", "duration"],
        aiGuidance: "CTV viewers watch from 6-10 feet away and use remote controls. I'll optimize your script with attention hooks every 15-30 seconds."
      },
      {
        id: "create_intro",
        title: "Design Branded Intro",
        description: "Create professional intro animation",
        type: "ai_generation",
        requiredFields: ["style", "duration", "tagline"],
        aiGuidance: "Your intro sets the tone for your channel. Pick a style that matches your brand."
      },
      {
        id: "optimize_assets",
        title: "Optimize for Platforms",
        description: "Platform-specific transcoding and optimization",
        type: "automation",
        requiredFields: [],
        aiGuidance: "I'll automatically optimize your video for each platform's requirements (Roku 3GB, Apple TV 4GB, Fire TV 5GB)."
      },
      {
        id: "publish",
        title: "Publish to Channels",
        description: "Deploy content to your connected CTV platforms",
        type: "deployment",
        requiredFields: ["publish_targets"],
        aiGuidance: "Ready to go live! Select which platforms to publish to first."
      }
    ]
  },
  "first_video_creation": {
    name: "Create Your First Video",
    description: "Step-by-step video creation for beginners",
    estimatedTime: 10,
    steps: [
      {
        id: "choose_template",
        title: "Pick a Template",
        description: "Select a video style that matches your goal",
        type: "selection",
        options: ["Social Media Reel", "Explainer Video", "Product Demo", "Tutorial"],
        aiGuidance: "What type of video do you want to create? I recommend starting with a Social Media Reel - it's quick and highly engaging."
      },
      {
        id: "generate_script",
        title: "Generate Script",
        description: "AI writes your video script",
        type: "ai_generation",
        requiredFields: ["topic", "duration"],
        aiGuidance: "Tell me what your video is about, and I'll write a compelling script with a strong hook and clear call-to-action."
      },
      {
        id: "select_assets",
        title: "Choose Visuals & Music",
        description: "Pick stock footage and background music",
        type: "asset_selection",
        requiredFields: [],
        aiGuidance: "I'll suggest stock footage and music that matches your script. You can also upload your own media."
      },
      {
        id: "customize",
        title: "Customize & Brand",
        description: "Add your branding and style",
        type: "customization",
        requiredFields: [],
        aiGuidance: "Add your logo, brand colors, and any captions. I can auto-generate captions for you."
      },
      {
        id: "render",
        title: "Render Video",
        description: "AI renders your final video",
        type: "automation",
        requiredFields: [],
        aiGuidance: "I'll render your video in high quality. This usually takes 2-5 minutes depending on length."
      },
      {
        id: "publish",
        title: "Publish & Share",
        description: "Share to social media or download",
        type: "deployment",
        requiredFields: ["platforms"],
        aiGuidance: "Your video is ready! Where do you want to publish it?"
      }
    ]
  },
  "campaign_optimization": {
    name: "Optimize Underperforming Campaign",
    description: "AI-guided campaign rescue and optimization",
    estimatedTime: 8,
    steps: [
      {
        id: "diagnose",
        title: "Diagnose Issues",
        description: "AI analyzes what's wrong with your campaign",
        type: "analysis",
        aiGuidance: "Let me analyze your campaign metrics and identify the bottlenecks..."
      },
      {
        id: "review_creative",
        title: "Review Ad Creatives",
        description: "Check if ad fatigue or poor creatives are the issue",
        type: "review",
        aiGuidance: "I'm checking your ad creatives for fatigue, policy issues, and performance..."
      },
      {
        id: "fix_targeting",
        title: "Optimize Targeting",
        description: "Refine audience targeting",
        type: "adjustment",
        requiredFields: [],
        aiGuidance: "Your current targeting might be too broad/narrow. Here's what I recommend..."
      },
      {
        id: "adjust_budget",
        title: "Rebalance Budget",
        description: "Shift budget to winning ad sets",
        type: "budget_adjustment",
        aiGuidance: "I'll pause underperformers and scale winners automatically."
      },
      {
        id: "test_variations",
        title: "Launch New Variations",
        description: "Test fresh creatives and copy",
        type: "creation",
        requiredFields: [],
        aiGuidance: "Let's create 3 new ad variations to test against your current ads."
      },
      {
        id: "monitor",
        title: "Set Up Monitoring",
        description: "Enable auto-optimization rules",
        type: "configuration",
        aiGuidance: "I'll monitor your campaign 24/7 and auto-optimize based on performance."
      }
    ]
  },
  "offer_creation": {
    name: "Build High-Converting Offer",
    description: "Create offer with belief-alignment scoring",
    estimatedTime: 12,
    steps: [
      {
        id: "define_product",
        title: "Define Your Product",
        description: "What are you selling?",
        type: "form",
        requiredFields: ["product", "price", "delivery"],
        aiGuidance: "Describe your product/service. The more specific, the better I can optimize your offer."
      },
      {
        id: "identify_audience",
        title: "Identify Target Audience",
        description: "Who is your ideal customer?",
        type: "form",
        requiredFields: ["audience", "buyer_type"],
        aiGuidance: "Are they Visionaries (early adopters), Analysts (need proof), or Skeptics (need guarantees)? This changes how we position the offer."
      },
      {
        id: "generate_offer",
        title: "Generate Offer Copy",
        description: "AI writes your offer with belief-alignment",
        type: "ai_generation",
        aiGuidance: "I'm generating your offer using the 8-factor belief-alignment framework..."
      },
      {
        id: "score_offer",
        title: "Score & Improve",
        description: "Get belief-alignment score and improvements",
        type: "scoring",
        aiGuidance: "Your offer scores [X]/100 on belief alignment. Here's how to improve..."
      },
      {
        id: "create_variations",
        title: "Create Buyer-Type Variations",
        description: "Different versions for different buyer types",
        type: "ai_generation",
        aiGuidance: "I'm creating 5 variations - one for each buyer archetype (Visionary, Analyst, Skeptic, Follower, Emotional)."
      },
      {
        id: "build_sequence",
        title: "Build Follow-Up Sequence",
        description: "10-touch multi-channel nurture sequence",
        type: "ai_generation",
        aiGuidance: "I'll create a 14-day, 10-touch sequence across Email, SMS, DM, and Voice with branching logic."
      }
    ]
  }
};

export default function GuidedWorkflow({ workflowType, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const workflow = WORKFLOWS[workflowType];

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();

    // Listen for workflow start events
    const handleWorkflowStart = (e) => {
      if (e.detail?.workflow && WORKFLOWS[e.detail.workflow]) {
        // Workflow will be shown by parent
      }
    };

    window.addEventListener('start-guided-workflow', handleWorkflowStart);
    return () => window.removeEventListener('start-guided-workflow', handleWorkflowStart);
  }, []);

  if (!workflow) return null;

  const currentStepConfig = workflow.steps[currentStep];
  const progress = ((currentStep + 1) / workflow.steps.length) * 100;

  const handleNext = async () => {
    // Validate required fields
    if (currentStepConfig.requiredFields?.length > 0) {
      const missing = currentStepConfig.requiredFields.filter(field => !stepData[field]);
      if (missing.length > 0) {
        alert(`Please fill in: ${missing.join(', ')}`);
        return;
      }
    }

    setCompletedSteps([...completedSteps, currentStep]);

    // Auto-execute AI generation steps
    if (currentStepConfig.type === "ai_generation" || currentStepConfig.type === "analysis") {
      setIsProcessing(true);
      await executeAIStep(currentStepConfig, stepData);
      setIsProcessing(false);
    }

    if (currentStep < workflow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Workflow complete
      if (onComplete) onComplete(stepData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCompletedSteps(completedSteps.filter(s => s !== currentStep - 1));
    }
  };

  const executeAIStep = async (step, data) => {
    try {
      let result;

      switch (workflowType) {
        case "ctv_campaign_setup":
          if (step.id === "generate_script") {
            const scriptResult = await base44.integrations.Core.InvokeLLM({
              prompt: `Generate CTV script for: ${data.topic}
Target: ${data.target_audience}
Duration: ${data.duration}s
Viewing mode: lean_back

Create TV-optimized script with attention hooks every 15-30 seconds.`,
              response_json_schema: {
                type: "object",
                properties: {
                  script: { type: "string" },
                  scenes_count: { type: "number" },
                  hooks_count: { type: "number" }
                }
              }
            });
            setStepData({...data, generated_script: scriptResult});
          } else if (step.id === "create_intro") {
            const introResult = await base44.integrations.Core.InvokeLLM({
              prompt: `Create ${data.style} intro animation for CTV channel.
Duration: ${data.duration}s
Tagline: ${data.tagline}

Provide animation sequence with timing.`,
              response_json_schema: {
                type: "object",
                properties: {
                  animation_description: { type: "string" },
                  sequence: { type: "array", items: { type: "object" } }
                }
              }
            });
            setStepData({...data, intro_animation: introResult});
          }
          break;

        case "first_video_creation":
          if (step.id === "generate_script") {
            const script = await base44.integrations.Core.InvokeLLM({
              prompt: `Write ${data.duration}s video script about: ${data.topic}
Include: Hook, main points, CTA
Style: Engaging for social media`,
              response_json_schema: {
                type: "object",
                properties: {
                  script: { type: "string" },
                  estimated_word_count: { type: "number" }
                }
              }
            });
            setStepData({...data, script: script.script});
          }
          break;

        case "campaign_optimization":
          if (step.id === "diagnose") {
            // Analysis happens automatically
            setStepData({...data, diagnosis_complete: true});
          }
          break;

        case "offer_creation":
          if (step.id === "generate_offer") {
            const offer = await base44.integrations.Core.InvokeLLM({
              prompt: `Create offer for: ${data.product}
Audience: ${data.audience}
Buyer Type: ${data.buyer_type}

Use belief-alignment framework to generate compelling offer copy.`,
              response_json_schema: {
                type: "object",
                properties: {
                  offer_summary: { type: "string" },
                  hooks: { type: "array", items: { type: "string" } },
                  value_stack: { type: "array", items: { type: "string" } }
                }
              }
            });
            setStepData({...data, offer: offer});
          }
          break;
      }

      // Log step completion
      await base44.entities.CopilotAction.create({
        user_email: user.email,
        command: `guided_workflow_step_${step.id}`,
        intent: "create_workflow",
        params: {
          workflow: workflowType,
          step: step.id,
          data: data
        },
        mode: "planner",
        status: "success"
      });

    } catch (error) {
      console.error("AI step error:", error);
      alert("AI processing failed. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#FFD700]" />
                {workflow.name}
              </h2>
              <p className="text-gray-400 text-sm mb-3">{workflow.description}</p>
              <div className="flex gap-2">
                <Badge className="bg-blue-500/20 text-blue-400">
                  {workflow.estimatedTime} min
                </Badge>
                <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                  Step {currentStep + 1} of {workflow.steps.length}
                </Badge>
              </div>
            </div>
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-2 bg-gray-800" />
            <div className="flex justify-between mt-2">
              {workflow.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center ${
                    idx <= currentStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  {completedSteps.includes(idx) ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : idx === currentStep ? (
                    <Circle className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-gray-500 text-xs mt-1 text-center max-w-[80px]">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-8"
            >
              <div className="p-6 bg-gradient-to-br from-[#6F1AB1]/10 to-[#A64EE7]/10 border-[#6F1AB1]/30 border-2 rounded-xl mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {currentStepConfig.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {currentStepConfig.description}
                </p>
                
                {/* AI Guidance */}
                <div className="flex items-start gap-2 p-3 bg-[#0B0B0C] rounded-lg">
                  <Sparkles className="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm italic">
                    {currentStepConfig.aiGuidance}
                  </p>
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                
                {currentStepConfig.type === "form" && (
                  <div className="space-y-4">
                    {currentStepConfig.requiredFields?.includes("project_name") && (
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Project Name</label>
                        <Input
                          value={stepData.project_name || ""}
                          onChange={(e) => setStepData({...stepData, project_name: e.target.value})}
                          placeholder="My CTV Show - Episode 1"
                          className="bg-[#0B0B0C] border-gray-700 text-white"
                        />
                      </div>
                    )}
                    {currentStepConfig.requiredFields?.includes("topic") && (
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Video Topic</label>
                        <Textarea
                          value={stepData.topic || ""}
                          onChange={(e) => setStepData({...stepData, topic: e.target.value})}
                          placeholder="What is your video about?"
                          className="bg-[#0B0B0C] border-gray-700 text-white h-24"
                        />
                      </div>
                    )}
                    {currentStepConfig.requiredFields?.includes("target_audience") && (
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Target Audience</label>
                        <Input
                          value={stepData.target_audience || ""}
                          onChange={(e) => setStepData({...stepData, target_audience: e.target.value})}
                          placeholder="e.g., Entrepreneurs aged 25-45"
                          className="bg-[#0B0B0C] border-gray-700 text-white"
                        />
                      </div>
                    )}
                    {currentStepConfig.requiredFields?.includes("duration") && (
                      <div>
                        <label className="text-gray-300 text-sm mb-2 block">Duration (seconds)</label>
                        <Input
                          type="number"
                          value={stepData.duration || 60}
                          onChange={(e) => setStepData({...stepData, duration: parseInt(e.target.value)})}
                          className="bg-[#0B0B0C] border-gray-700 text-white"
                          min="15"
                          max="600"
                        />
                      </div>
                    )}
                  </div>
                )}

                {currentStepConfig.type === "selection" && (
                  <div className="grid grid-cols-2 gap-3">
                    {currentStepConfig.options?.map((option, idx) => (
                      <Button
                        key={idx}
                        onClick={() => setStepData({...stepData, selected_option: option})}
                        variant={stepData.selected_option === option ? "default" : "outline"}
                        className={stepData.selected_option === option 
                          ? "bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] text-white border-0"
                          : "border-gray-700 text-white"}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                {currentStepConfig.type === "platform_connection" && (
                  <div className="space-y-2">
                    {["roku", "apple_tv", "fire_tv", "android_tv"].map(platform => (
                      <label
                        key={platform}
                        className="flex items-center gap-3 p-4 bg-[#0B0B0C] rounded-lg cursor-pointer hover:bg-[#111317] border border-gray-800"
                      >
                        <input
                          type="checkbox"
                          checked={stepData.platforms?.includes(platform) || false}
                          onChange={(e) => {
                            const platforms = stepData.platforms || [];
                            if (e.target.checked) {
                              setStepData({...stepData, platforms: [...platforms, platform]});
                            } else {
                              setStepData({...stepData, platforms: platforms.filter(p => p !== platform)});
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <div>
                          <p className="text-white font-semibold capitalize">
                            {platform.replace("_", " ")}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {platform === "roku" && "Largest CTV platform, 70M+ active users"}
                            {platform === "apple_tv" && "Premium audience, high engagement"}
                            {platform === "fire_tv" && "Amazon ecosystem, easy integration"}
                            {platform === "android_tv" && "Google ecosystem, wide reach"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {currentStepConfig.type === "ai_generation" && isProcessing && (
                  <div className="p-8 text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[#FFD700]" />
                    <p className="text-white font-semibold mb-2">AI is working...</p>
                    <p className="text-gray-400 text-sm">
                      {currentStepConfig.title}
                    </p>
                  </div>
                )}

                {currentStepConfig.type === "automation" && (
                  <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="text-white font-semibold mb-2">Automated Step</p>
                    <p className="text-gray-300 text-sm">
                      This step runs automatically in the background
                    </p>
                  </div>
                )}

                {currentStepConfig.type === "deployment" && (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm mb-3">
                      Select where to publish your content:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(currentStepConfig.requiredFields?.includes("publish_targets") 
                        ? ["roku", "apple_tv", "fire_tv", "youtube"]
                        : ["instagram", "tiktok", "youtube", "facebook"]
                      ).map(platform => (
                        <label
                          key={platform}
                          className="flex items-center gap-2 p-3 bg-[#0B0B0C] rounded-lg cursor-pointer hover:bg-[#111317]"
                        >
                          <input
                            type="checkbox"
                            checked={stepData.publish_targets?.includes(platform) || false}
                            onChange={(e) => {
                              const targets = stepData.publish_targets || [];
                              if (e.target.checked) {
                                setStepData({...stepData, publish_targets: [...targets, platform]});
                              } else {
                                setStepData({...stepData, publish_targets: targets.filter(p => p !== platform)});
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-white text-sm capitalize">{platform.replace("_", " ")}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outline"
              className="border-gray-700 text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (onCancel) onCancel();
                }}
                variant="outline"
                className="border-gray-700 text-gray-400"
              >
                Exit
              </Button>
              <Button
                onClick={handleNext}
                disabled={isProcessing}
                className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === workflow.steps.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Help Hint */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs">
              💡 <strong>Need help?</strong> Ask me anything in the Copilot chat below!
            </p>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}