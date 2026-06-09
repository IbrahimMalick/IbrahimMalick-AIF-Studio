import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Loader2, CheckCircle2, Sparkles, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickGenerateMode({ user, onVideoGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);

  const quickGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a video idea");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Step 1: Generate script (15%)
      setCurrentStep("Generating script...");
      setProgress(15);
      
      const script = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a 30-second video script based on this idea:

"${prompt}"

Generate a complete script with:
- Hook (first 3 seconds)
- Main message
- Call-to-action
- Voice direction tags

Make it punchy and engaging for social media.`,
      });

      // Step 2: Generate voice (35%)
      setCurrentStep("Generating voice narration...");
      setProgress(35);
      
      // Simulate voice generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const voiceUrl = "https://example.com/voice.mp3";

      // Step 3: Generate visuals (60%)
      setCurrentStep("Creating visuals with AI...");
      setProgress(60);

      const visualPrompt = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an image generation prompt for a video about: ${prompt}. Make it eye-catching and professional.`,
      });

      const image = await base44.integrations.Core.GenerateImage({
        prompt: visualPrompt
      });

      // Step 4: Assemble video (80%)
      setCurrentStep("Assembling video...");
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 5: Render (100%)
      setCurrentStep("Rendering final video...");
      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProgress(100);
      setCurrentStep("Complete!");

      const videoData = {
        title: prompt,
        script: script,
        voice_url: voiceUrl,
        thumbnail_url: image.url,
        video_url: "https://example.com/quick-video.mp4",
        duration: 30,
        created_at: new Date()
      };

      setGeneratedVideo(videoData);

      if (onVideoGenerated) {
        onVideoGenerated(videoData);
      }

    } catch (error) {
      console.error("Error in quick generate:", error);
      alert("Generation failed. Please try again.");
      setCurrentStep("Error");
    }

    setIsGenerating(false);
  };

  return (
    <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#FFD700]" />
          Quick Generate Mode
        </CardTitle>
        <p className="text-gray-400 text-sm mt-1">
          One prompt → Finished video in under 60 seconds ⚡
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your video idea... (e.g., 'Create a 30-second tutorial on using ChatGPT for content creation')"
          className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[120px]"
          disabled={isGenerating}
        />

        <div className="grid grid-cols-3 gap-2">
          {[
            "How to start a podcast",
            "5 AI productivity hacks",
            "Product demo for SaaS tool"
          ].map((example, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(example)}
              className="p-2 bg-[#0B0B0C] border border-gray-800 rounded-lg text-gray-400 text-xs hover:border-[#FFD700] hover:text-[#FFD700] transition-all"
            >
              {example}
            </button>
          ))}
        </div>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <Progress value={progress} className="h-3 bg-[#0B0B0C]" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{currentStep}</span>
              <span className="text-[#FFD700] font-bold">{progress}%</span>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "Script", progress: 15 },
                { label: "Voice", progress: 35 },
                { label: "Visuals", progress: 60 },
                { label: "Assembly", progress: 80 },
                { label: "Render", progress: 100 }
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center ${
                    progress >= step.progress ? 'bg-green-500' :
                    progress >= step.progress - 10 ? 'bg-[#FFD700]' :
                    'bg-gray-700'
                  }`}>
                    {progress >= step.progress ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white text-xs">{idx + 1}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">{step.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {generatedVideo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-bold">Video Generated!</h4>
            </div>
            <div className="aspect-video bg-black rounded-lg mb-3 flex items-center justify-center">
              <img src={generatedVideo.thumbnail_url} alt="Video thumbnail" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-[#1E90FF] text-white rounded-lg">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-gray-700 rounded-lg">
                Download
              </Button>
              <Button size="sm" className="flex-1 bg-green-500 text-white rounded-lg">
                Publish
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button
            onClick={quickGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-bold h-12"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Your Video...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Generate Video Now (60s)
              </>
            )}
          </Button>
        )}

      </CardContent>
    </Card>
  );
}