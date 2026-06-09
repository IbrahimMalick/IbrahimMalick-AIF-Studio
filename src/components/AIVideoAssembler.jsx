import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Film,
  Image as ImageIcon,
  Music,
  Type,
  Sparkles,
  Loader2,
  Play,
  Download,
  Eye,
  Wand2,
  Scissors,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function AIVideoAssembler({ script, sceneBreakdown, voiceAudioUrl, onRenderComplete }) {
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [visualAssets, setVisualAssets] = useState([]);
  const [template, setTemplate] = useState("modern_reel");
  const [captionStyle, setCaptionStyle] = useState("bold");
  const [renderProgress, setRenderProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const templates = [
    { value: "modern_reel", label: "📱 Modern Reel", aspect: "9:16", style: "Fast cuts, dynamic text" },
    { value: "youtube_short", label: "▶️ YouTube Short", aspect: "9:16", style: "Hook-focused, captions" },
    { value: "feed_post", label: "📮 Feed Post", aspect: "1:1", style: "Clean, minimal" },
    { value: "youtube_video", label: "🎬 YouTube Video", aspect: "16:9", style: "Professional, detailed" },
    { value: "ad_commercial", label: "📢 Ad/Commercial", aspect: "1:1", style: "Direct, conversion-focused" },
    { value: "podcast_clip", label: "🎙️ Podcast Clip", aspect: "16:9", style: "Waveform, minimal" }
  ];

  const captionStyles = [
    { value: "bold", label: "Bold", preview: "BOLD ALL CAPS" },
    { value: "minimal", label: "Minimal", preview: "clean lowercase" },
    { value: "outlined", label: "Outlined", preview: "Outlined Text" },
    { value: "animated", label: "Animated", preview: "Word by Word" },
    { value: "none", label: "No Captions", preview: "—" }
  ];

  // Generate visuals for each scene
  const generateVisuals = async () => {
    setIsGeneratingVisuals(true);
    try {
      const visuals = await Promise.all(
        sceneBreakdown.map(async (scene) => {
          // Generate image prompt from scene
          const imagePrompt = await base44.integrations.Core.InvokeLLM({
            prompt: `Create a detailed image generation prompt for this video scene:

Scene: ${scene.visual_description}
Mood: ${scene.camera_suggestion}
Duration: ${scene.duration_seconds}s

Generate a prompt for AI image generation that will create a perfect visual for this scene. Include:
- Main subject/action
- Style (cinematic, vibrant, minimalist, etc.)
- Lighting
- Composition
- Mood/emotion

Keep it under 500 characters, very descriptive.`,
          });

          // Generate the actual image
          const image = await base44.integrations.Core.GenerateImage({
            prompt: imagePrompt
          });

          return {
            scene_number: scene.scene_number,
            image_url: image.url,
            prompt: imagePrompt,
            duration: scene.duration_seconds
          };
        })
      );

      setVisualAssets(visuals);
      alert(`✅ Generated ${visuals.length} visual assets!`);
    } catch (error) {
      console.error("Error generating visuals:", error);
      alert("Failed to generate visuals. Please try again.");
    }
    setIsGeneratingVisuals(false);
  };

  // Render final video
  const renderVideo = async () => {
    setIsRendering(true);
    setRenderProgress(0);

    // Simulate render progress
    const progressInterval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 500);

    try {
      // In production, this would call your video rendering service
      // For now, simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 10000));

      clearInterval(progressInterval);
      setRenderProgress(100);

      const mockVideoUrl = "https://example.com/rendered-video.mp4";
      setPreviewUrl(mockVideoUrl);
      
      if (onRenderComplete) {
        onRenderComplete(mockVideoUrl);
      }

      alert("✅ Video rendered successfully!");
    } catch (error) {
      console.error("Error rendering video:", error);
      alert("Failed to render video. Please try again.");
    }
    setIsRendering(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Template Selection */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-[#FFD700]" />
            Video Assembly
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Motion Template</label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <div>
                      <p className="font-medium">{t.label}</p>
                      <p className="text-xs text-gray-500">{t.aspect} • {t.style}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Caption Style</label>
            <Select value={captionStyle} onValueChange={setCaptionStyle}>
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {captionStyles.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <p className="font-medium">{style.label}</p>
                      <p className="text-xs text-gray-500">{style.preview}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={generateVisuals}
              disabled={isGeneratingVisuals || sceneBreakdown.length === 0}
              className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl"
            >
              {isGeneratingVisuals ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Visuals ({sceneBreakdown.length})
                </>
              )}
            </Button>

            <Button
              onClick={renderVideo}
              disabled={isRendering || visualAssets.length === 0 || !voiceAudioUrl}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rendering... {renderProgress}%
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 mr-2" />
                  Render Video
                </>
              )}
            </Button>
          </div>

          {/* Render Progress */}
          {isRendering && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-[#0B0B0C] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] transition-all duration-500"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
              <p className="text-center text-gray-400 text-sm">
                {renderProgress < 30 ? 'Processing scenes...' :
                 renderProgress < 60 ? 'Adding voice & music...' :
                 renderProgress < 90 ? 'Rendering final video...' :
                 'Almost done!'}
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Visual Assets Preview */}
      {visualAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Generated Visual Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visualAssets.map((asset) => (
                  <div key={asset.scene_number} className="group relative rounded-xl overflow-hidden">
                    <img
                      src={asset.image_url}
                      alt={`Scene ${asset.scene_number}`}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/70 text-white text-xs">
                        Scene {asset.scene_number} • {asset.duration}s
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Video Preview */}
      {previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Video Ready!
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-500 text-white rounded-lg"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                <Play className="w-16 h-16 text-white/50" />
              </div>
              <p className="text-center text-gray-400 text-sm mt-3">
                Click preview to watch your AI-generated video
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
}