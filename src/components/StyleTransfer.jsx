import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Upload,
  Sparkles,
  Brain,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Wand2,
  Eye,
  Download,
  RefreshCw,
  Sliders,
  Sun,
  Contrast,
  Droplet,
  Lightbulb,
  Film,
  Zap,
  Target,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StyleTransfer({ project, currentUser, onStyleApplied }) {
  const queryClient = useQueryClient();
  const [referenceFile, setReferenceFile] = useState(null);
  const [referenceUrl, setReferenceUrl] = useState(null);
  const [referenceType, setReferenceType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [analyzedStyle, setAnalyzedStyle] = useState(null);
  const [styleIntensity, setStyleIntensity] = useState(70);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Preset styles
  const stylePresets = [
    {
      name: "Cinematic",
      description: "Film-like look with rich colors and depth",
      colors: ["#1a1a2e", "#16213e", "#0f3460", "#e94560"],
      mood: "dramatic",
      icon: Film
    },
    {
      name: "Vintage",
      description: "Retro aesthetic with warm tones",
      colors: ["#f4a261", "#e76f51", "#264653", "#2a9d8f"],
      mood: "nostalgic",
      icon: Sun
    },
    {
      name: "Cyberpunk",
      description: "Neon colors and high contrast",
      colors: ["#ff006e", "#8338ec", "#3a86ff", "#fb5607"],
      mood: "futuristic",
      icon: Zap
    },
    {
      name: "Minimal",
      description: "Clean, muted colors and simplicity",
      colors: ["#f8f9fa", "#e9ecef", "#495057", "#212529"],
      mood: "professional",
      icon: Layers
    },
    {
      name: "Vibrant",
      description: "Bold, saturated colors and energy",
      colors: ["#ff0a54", "#ff477e", "#ff5c8a", "#ff7096"],
      mood: "energetic",
      icon: Sparkles
    },
    {
      name: "Moody",
      description: "Dark, atmospheric tones",
      colors: ["#1b1b2f", "#162447", "#1f4068", "#1b1b2f"],
      mood: "mysterious",
      icon: Contrast
    }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    setReferenceType(fileType);
    setReferenceFile(file);

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setReferenceUrl(file_url);
      alert("✅ Reference uploaded! Click 'Analyze Style' to continue.");
    } catch (error) {
      alert("Error uploading file. Please try again.");
    }
    setIsUploading(false);
  };

  const handleAnalyzeStyle = async () => {
    if (!referenceUrl) return;

    setIsAnalyzing(true);
    try {
      const styleAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the artistic style of this reference ${referenceType} and extract comprehensive style characteristics:

Reference URL: ${referenceUrl}

Analyze and extract:

1. DOMINANT COLORS (5-7 colors):
   - Extract hex codes
   - Identify primary, secondary, accent colors
   - Color temperature (warm/cool/neutral)

2. COLOR PALETTE:
   - Overall palette description
   - Color harmony type (complementary, analogous, triadic, etc.)
   - Saturation level (high/medium/low)
   - Contrast level (high/medium/low)
   - Brightness range

3. MOOD & ATMOSPHERE:
   - Emotional tone (dramatic, cheerful, calm, intense, etc.)
   - Energy level (high/medium/low)
   - Warmth (warm/cool/neutral)

4. ARTISTIC STYLE:
   - Style category (cinematic, vintage, modern, painterly, etc.)
   - Art movement influence (if any)
   - Visual aesthetic

5. TEXTURE & DETAIL:
   - Texture type (smooth, grainy, sharp, soft)
   - Detail level (high/medium/low)
   - Film grain presence

6. LIGHTING STYLE:
   - Lighting type (natural, dramatic, soft, hard)
   - Shadow intensity
   - Highlight handling

Provide specific, applicable characteristics for video style transfer.`,
        response_json_schema: {
          type: "object",
          properties: {
            dominant_colors: {
              type: "array",
              items: { type: "string" }
            },
            color_palette: {
              type: "array",
              items: { type: "string" }
            },
            mood: { type: "string" },
            artistic_style: { type: "string" },
            texture_type: { type: "string" },
            lighting_style: { type: "string" },
            saturation_level: { type: "string" },
            contrast_level: { type: "string" },
            color_temperature: { type: "string" },
            energy_level: { type: "string" },
            detail_level: { type: "string" },
            film_grain: { type: "boolean" },
            color_harmony: { type: "string" },
            brightness: { type: "string" }
          }
        }
      });

      setAnalyzedStyle(styleAnalysis);

      alert(`✅ Style Analysis Complete!

🎨 STYLE: ${styleAnalysis.artistic_style}
🌈 MOOD: ${styleAnalysis.mood}
💡 LIGHTING: ${styleAnalysis.lighting_style}
🎭 CONTRAST: ${styleAnalysis.contrast_level}

Ready to apply to your video!`);

    } catch (error) {
      alert("Error analyzing style. Please try again.");
    }
    setIsAnalyzing(false);
  };

  const handleGeneratePreview = async () => {
    if (!analyzedStyle) {
      alert("Please analyze style first!");
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const previewPrompt = `Generate a preview image showing the style transfer effect:

SOURCE VIDEO: ${project.title}
STYLE: ${analyzedStyle.artistic_style}
MOOD: ${analyzedStyle.mood}
COLORS: ${analyzedStyle.color_palette.join(', ')}
INTENSITY: ${styleIntensity}%

Create a cinematic preview showing the transformed look with these style characteristics applied.`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: previewPrompt
      });

      setPreviewUrl(url);
      alert("✅ Preview generated! Check the before/after comparison below.");

    } catch (error) {
      alert("Error generating preview. Please try again.");
    }
    setIsGeneratingPreview(false);
  };

  const applyStyleMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.VideoProject.update(project.id, {
        style_transfer_applied: true,
        style_transfer_data: {
          reference_url: referenceUrl,
          reference_type: referenceType,
          style_intensity: styleIntensity / 100,
          analyzed_style: analyzedStyle,
          preview_url: previewUrl,
          applied_at: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["videoProjects"]);
      if (onStyleApplied) onStyleApplied();
      alert("✅ Style Transfer applied to video project! The style will be rendered when you export.");
    },
  });

  const handleApplyPreset = async (preset) => {
    setIsAnalyzing(true);
    try {
      const presetStyle = {
        dominant_colors: preset.colors,
        color_palette: preset.colors,
        mood: preset.mood,
        artistic_style: preset.name,
        texture_type: preset.name === 'Vintage' ? 'grainy' : preset.name === 'Minimal' ? 'smooth' : 'sharp',
        lighting_style: preset.name === 'Cinematic' ? 'dramatic' : preset.name === 'Cyberpunk' ? 'neon' : 'natural',
        saturation_level: preset.name === 'Vibrant' ? 'high' : preset.name === 'Minimal' ? 'low' : 'medium',
        contrast_level: preset.name === 'Cyberpunk' ? 'high' : preset.name === 'Minimal' ? 'low' : 'medium',
        color_temperature: preset.name === 'Vintage' ? 'warm' : preset.name === 'Cyberpunk' ? 'cool' : 'neutral',
        energy_level: preset.mood,
        detail_level: 'high',
        film_grain: preset.name === 'Vintage',
        color_harmony: 'complementary',
        brightness: 'medium'
      };

      setAnalyzedStyle(presetStyle);
      setReferenceUrl(`preset_${preset.name.toLowerCase()}`);
      setReferenceType('preset');

      alert(`✅ ${preset.name} style preset loaded! Adjust intensity and preview.`);

    } catch (error) {
      alert("Error loading preset.");
    }
    setIsAnalyzing(false);
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#FF69B4]" />
          AI Video Style Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="bg-[#0B0B0C] rounded-xl">
            <TabsTrigger value="upload">Upload Reference</TabsTrigger>
            <TabsTrigger value="presets">Style Presets</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gradient-to-br from-[#FF69B4]/10 to-[#9D4EDD]/10 border border-[#FF69B4]/30 rounded-xl">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Style Reference
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  Upload an image or video whose artistic style you want to transfer to your video
                </p>
                
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="styleUpload"
                />
                
                <label htmlFor="styleUpload">
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-[#FF69B4] transition-all">
                    {referenceUrl ? (
                      <div>
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                        <p className="text-white font-semibold mb-1">Reference Uploaded!</p>
                        <p className="text-gray-400 text-sm">Click to change</p>
                        {referenceType === 'image' && (
                          <img src={referenceUrl} alt="Reference" className="mt-3 max-h-32 mx-auto rounded-lg" />
                        )}
                      </div>
                    ) : isUploading ? (
                      <div>
                        <Loader2 className="w-12 h-12 mx-auto mb-3 text-[#FF69B4] animate-spin" />
                        <p className="text-white">Uploading...</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-white font-semibold mb-1">Drop file or click to upload</p>
                        <p className="text-gray-400 text-sm">Image or video file</p>
                      </div>
                    )}
                  </div>
                </label>

                {referenceUrl && !analyzedStyle && (
                  <Button
                    onClick={handleAnalyzeStyle}
                    disabled={isAnalyzing}
                    className="w-full mt-3 bg-gradient-to-r from-[#FF69B4] to-[#9D4EDD] text-white rounded-lg font-semibold"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Analyze Style
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {stylePresets.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FF69B4] transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF69B4] to-[#9D4EDD] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold">{preset.name}</h5>
                        <p className="text-gray-500 text-xs capitalize">{preset.mood}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-xs mb-3">{preset.description}</p>
                    
                    <div className="flex gap-1">
                      {preset.colors.map((color, cIdx) => (
                        <div
                          key={cIdx}
                          className="w-8 h-8 rounded border border-gray-700"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Style Analysis Results */}
        {analyzedStyle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
                Analyzed Style Profile
              </h4>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-xs mb-2">ARTISTIC STYLE</p>
                  <p className="text-white text-lg font-semibold">{analyzedStyle.artistic_style}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">MOOD</p>
                  <p className="text-white text-lg font-semibold capitalize">{analyzedStyle.mood}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-2 bg-[#0B0B0C] rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Droplet className="w-3 h-3 text-[#00D4C9]" />
                    <p className="text-gray-500 text-xs">Saturation</p>
                  </div>
                  <p className="text-white text-sm font-semibold capitalize">{analyzedStyle.saturation_level}</p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Contrast className="w-3 h-3 text-[#FFD700]" />
                    <p className="text-gray-500 text-xs">Contrast</p>
                  </div>
                  <p className="text-white text-sm font-semibold capitalize">{analyzedStyle.contrast_level}</p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Lightbulb className="w-3 h-3 text-[#FF8C00]" />
                    <p className="text-gray-500 text-xs">Lighting</p>
                  </div>
                  <p className="text-white text-sm font-semibold capitalize">{analyzedStyle.lighting_style}</p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Layers className="w-3 h-3 text-[#9D4EDD]" />
                    <p className="text-gray-500 text-xs">Texture</p>
                  </div>
                  <p className="text-white text-sm font-semibold capitalize">{analyzedStyle.texture_type}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs mb-2">COLOR PALETTE</p>
                <div className="flex gap-2">
                  {analyzedStyle.dominant_colors?.map((color, idx) => (
                    <div key={idx} className="flex-1">
                      <div
                        className="w-full h-12 rounded-lg border border-gray-700 mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-gray-500 text-xs text-center">{color}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Style Intensity Control */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-white font-semibold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00D4C9]" />
                  Style Intensity
                </h5>
                <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                  {styleIntensity}%
                </Badge>
              </div>
              
              <Slider
                value={[styleIntensity]}
                onValueChange={(value) => setStyleIntensity(value[0])}
                min={0}
                max={100}
                step={5}
                className="mb-3"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtle (0%)</span>
                <span>Balanced (50%)</span>
                <span>Bold (100%)</span>
              </div>

              <p className="text-gray-400 text-xs mt-3">
                {styleIntensity < 30 ? "⚪ Subtle style application - slight color and mood adjustments" :
                 styleIntensity < 70 ? "🟡 Balanced application - noticeable but natural style transfer" :
                 "🔴 Bold application - dramatic transformation with full style characteristics"}
              </p>
            </div>

            {/* Preview Controls */}
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                onClick={handleGeneratePreview}
                disabled={isGeneratingPreview}
                className="bg-[#00D4C9] text-black hover:bg-[#00BFBB] rounded-lg font-semibold"
              >
                {isGeneratingPreview ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Generate Preview
              </Button>

              <Button
                onClick={() => applyStyleMutation.mutate()}
                disabled={applyStyleMutation.isLoading || !analyzedStyle}
                className="bg-gradient-to-r from-[#FF69B4] to-[#9D4EDD] text-white rounded-lg font-semibold"
              >
                {applyStyleMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Apply to Video
              </Button>
            </div>

            {/* Before/After Preview */}
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
              >
                <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#00D4C9]" />
                  Style Preview
                </h5>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-2">BEFORE (Original)</p>
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2">AFTER (Style Applied)</p>
                    <div className="aspect-video rounded-lg overflow-hidden border-2 border-[#FF69B4]">
                      <img src={previewUrl} alt="Style Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✓ Preview shows style application at <strong>{styleIntensity}%</strong> intensity
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Applied Style Status */}
        {project.style_transfer_applied && (
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-[#06D6A0]/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <h5 className="text-white font-bold">Style Transfer Active</h5>
                  <p className="text-gray-400 text-sm">
                    {project.style_transfer_data?.analyzed_style?.artistic_style} style applied at {Math.round((project.style_transfer_data?.style_intensity || 0.7) * 100)}% intensity
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAnalyzedStyle(project.style_transfer_data?.analyzed_style);
                  setReferenceUrl(project.style_transfer_data?.reference_url);
                  setReferenceType(project.style_transfer_data?.reference_type);
                  setStyleIntensity(Math.round((project.style_transfer_data?.style_intensity || 0.7) * 100));
                  setPreviewUrl(project.style_transfer_data?.preview_url);
                }}
                className="border-gray-700 hover:bg-[#111317] rounded-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Modify
              </Button>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
          <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FFD700]" />
            How Style Transfer Works
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge className="bg-[#FF69B4]/20 text-[#FF69B4] text-xs h-fit">1</Badge>
              <p className="text-gray-300">Upload a reference image/video or choose a preset</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs h-fit">2</Badge>
              <p className="text-gray-300">AI analyzes colors, textures, mood, and lighting</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs h-fit">3</Badge>
              <p className="text-gray-300">Adjust intensity slider to control style strength</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] text-xs h-fit">4</Badge>
              <p className="text-gray-300">Generate preview to see before/after comparison</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs h-fit">5</Badge>
              <p className="text-gray-300">Apply style - will be rendered when you export video</p>
            </div>
          </div>
        </div>

        {/* Style Transfer Examples */}
        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
          <h5 className="text-white font-semibold mb-3">💡 Style Transfer Examples</h5>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <p className="text-[#00D4C9] text-sm font-medium mb-1">🎨 Artistic Transfer</p>
              <p className="text-gray-400 text-xs">Apply Van Gogh-style painting effects to your video</p>
            </div>
            <div>
              <p className="text-[#FFD700] text-sm font-medium mb-1">🎬 Film Look</p>
              <p className="text-gray-400 text-xs">Transfer cinematic color grading from movies</p>
            </div>
            <div>
              <p className="text-[#FF69B4] text-sm font-medium mb-1">📸 Photo Style</p>
              <p className="text-gray-400 text-xs">Match the aesthetic of professional photography</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}