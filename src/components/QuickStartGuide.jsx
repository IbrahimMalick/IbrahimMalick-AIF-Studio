import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Video,
  Sparkles,
  FileText,
  Link as LinkIcon,
  Zap,
  Play,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickStartGuide({ onClose }) {
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      id: "create_video",
      title: "Create Your First Video",
      description: "Turn a simple JSON script into a professional video",
      icon: Video,
      color: "from-[#FF4433] to-[#FF8C00]",
      link: createPageUrl("VideoStudio"),
      estimatedTime: "5 min"
    },
    {
      id: "generate_art",
      title: "Generate AI Art",
      description: "Create stunning images with a simple text prompt",
      icon: Sparkles,
      color: "from-[#FF8C00] to-[#A89C94]",
      link: createPageUrl("ArtLab"),
      estimatedTime: "2 min"
    },
    {
      id: "analyze_document",
      title: "Analyze a Document",
      description: "Upload a PDF and get AI-powered insights",
      icon: FileText,
      color: "from-[#A89C94] to-[#1E90FF]",
      link: createPageUrl("ResearchHub"),
      estimatedTime: "3 min"
    },
    {
      id: "connect_social",
      title: "Connect Social Media",
      description: "Link your Instagram, Facebook, and YouTube accounts",
      icon: LinkIcon,
      color: "from-[#1E90FF] to-[#FF4433]",
      link: createPageUrl("SocialMedia"),
      estimatedTime: "5 min"
    },
    {
      id: "setup_automation",
      title: "Set Up Automation",
      description: "Auto-post new content to all your social channels",
      icon: Zap,
      color: "from-[#FF4433] to-[#FF8C00]",
      link: createPageUrl("Automation"),
      estimatedTime: "10 min"
    }
  ];

  const toggleStep = (stepId) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-[#FF8C00]" />
              Quick Start Guide
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">Complete these steps to master the platform</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{completedSteps.length} of {steps.length} complete</span>
            <span className="text-sm font-semibold text-[#FF8C00]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#0B0B0C] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF4433] to-[#1E90FF] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <StepIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-semibold">{step.title}</h4>
                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                        {step.estimatedTime}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                    <div className="flex items-center gap-2">
                      <Link to={step.link}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white rounded-lg h-8 text-xs"
                        >
                          Start Tutorial
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStep(step.id)}
                        className={`rounded-lg h-8 text-xs ${
                          isCompleted
                            ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                            : 'border-gray-700'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Circle className="w-3 h-3 mr-1" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {completedSteps.length === steps.length && (
          <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl text-center">
            <h4 className="text-white font-bold mb-1">🎉 You're a Pro!</h4>
            <p className="text-gray-300 text-sm">
              You've completed all the quick start tutorials. Ready to create something amazing!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}