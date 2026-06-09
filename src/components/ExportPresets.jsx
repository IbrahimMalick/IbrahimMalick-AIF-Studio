import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  Sparkles,
  Brain,
  Loader2,
  CheckCircle2,
  Settings,
  Zap,
  Clock,
  Target,
  Film,
  Gauge,
  Save,
  Wand2,
  Youtube,
  Instagram,
  Facebook,
  Smartphone,
  Monitor,
  Tv,
  Globe,
  TrendingUp,
  AlertCircle,
  Star,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportPresets({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [isGeneratingPresets, setIsGeneratingPresets] = useState(false);
  const [aiPresets, setAiPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customPresets, setCustomPresets] = useState(project.export_settings?.custom_presets || []);
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [renderTimePrediction, setRenderTimePrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const [newPreset, setNewPreset] = useState({
    name: "",
    resolution: "1920x1080",
    fps: 30,
    codec: "h264",
    bitrate_kbps: 8000,
    quality_level: "high"
  });

  // Built-in quick presets
  const quickPresets = [
    {
      id: "youtube_4k",
      name: "YouTube 4K",
      icon: Youtube,
      platform: "youtube",
      resolution: "3840x2160",
      fps: 60,
      codec: "h265",
      bitrate_kbps: 45000,
      quality_level: "ultra",
      color: "bg-red-500"
    },
    {
      id: "youtube_1080p",
      name: "YouTube HD",
      icon: Youtube,
      platform: "youtube",
      resolution: "1920x1080",
      fps: 30,
      codec: "h264",
      bitrate_kbps: 8000,
      quality_level: "high",
      color: "bg-red-500"
    },
    {
      id: "instagram_reel",
      name: "Instagram Reel",
      icon: Instagram,
      platform: "instagram",
      resolution: "1080x1920",
      fps: 30,
      codec: "h264",
      bitrate_kbps: 5000,
      quality_level: "medium",
      color: "bg-pink-500"
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: Smartphone,
      platform: "tiktok",
      resolution: "1080x1920",
      fps: 30,
      codec: "h264",
      bitrate_kbps: 4000,
      quality_level: "medium",
      color: "bg-black"
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      platform: "facebook",
      resolution: "1280x720",
      fps: 30,
      codec: "h264",
      bitrate_kbps: 4000,
      quality_level: "medium",
      color: "bg-blue-600"
    }
  ];

  const generateAIPresetsMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingPresets(true);
      
      const analysis = project.deep_analysis_data;
      
      const presetsGeneration = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate optimal rendering presets for this video project:

PROJECT:
- Title: ${project.title}
- Duration: ${project.duration_seconds || 0}s
- Current Resolution: ${project.resolution}
- Current FPS: ${project.fps}

${analysis ? `
DEEP ANALYSIS:
- Genre: ${analysis.genre_classification?.primary_genre}
- Sub-genres: ${analysis.genre_classification?.sub_genres?.join(', ')}
- Content Style: ${analysis.genre_classification?.content_style}
- Mood: ${analysis.emotional_tone?.primary_mood}
- Pacing: ${analysis.pacing_analysis?.overall_pace}
- Energy Level: ${analysis.emotional_tone?.energy_level}/100
- Visual Complexity: ${analysis.visual_elements?.visual_complexity}

PLATFORM RECOMMENDATIONS:
${analysis.genre_classification?.platform_recommendations?.map(p => 
  `- ${p.platform}: ${p.suitability_score}% match`
).join('\n')}
` : 'No analysis data available - use generic recommendations'}

APPLIED FEATURES:
- Style Transfer: ${project.style_transfer_applied ? 'Yes' : 'No'}
- Stabilization: ${project.stabilization_applied ? 'Yes' : 'No'}
- Color Correction: ${project.color_correction_applied ? 'Yes' : 'No'}
- Audio Enhancement: ${project.audio_enhancement_applied ? 'Yes' : 'No'}

Generate 4-6 AI-optimized export presets tailored to:
1. Best platforms for this content (from analysis)
2. Quality goals (balance, high quality, fast export, file size)
3. Technical requirements

For each preset provide:
- Preset name (descriptive)
- Target platform
- Resolution (1920x1080, 1280x720, 1080x1920, 3840x2160, etc.)
- FPS (24, 30, 60)
- Codec (h264, h265, vp9, av1)
- Bitrate in kbps (1000-50000)
- Quality level (low, medium, high, ultra)
- Why this preset is recommended
- Estimated file size in MB
- Best use case
- Priority (1-5, where 1 is most recommended)`,
        response_json_schema: {
          type: "object",
          properties: {
            presets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  preset_name: { type: "string" },
                  platform: { type: "string" },
                  resolution: { type: "string" },
                  fps: { type: "number" },
                  codec: { type: "string" },
                  bitrate_kbps: { type: "number" },
                  quality_level: { type: "string" },
                  why_recommended: { type: "string" },
                  estimated_file_size_mb: { type: "number" },
                  best_use_case: { type: "string" },
                  priority: { type: "number" }
                }
              }
            },
            overall_recommendation: { type: "string" }
          }
        }
      });

      return presetsGeneration.presets.sort((a, b) => a.priority - b.priority);
    },
    onSuccess: (presets) => {
      setAiPresets(presets);
      setIsGeneratingPresets(false);
      alert(`✅ Generated ${presets.length} AI-optimized export presets!`);
    },
    onError: () => {
      setIsGeneratingPresets(false);
      alert("❌ Failed to generate presets. Please try again.");
    }
  });

  const predictRenderTimeMutation = useMutation({
    mutationFn: async (preset) => {
      setIsPredicting(true);
      
      const prediction = await base44.integrations.Core.InvokeLLM({
        prompt: `Predict rendering time for this video project with selected export settings:

PROJECT COMPLEXITY:
- Duration: ${project.duration_seconds || 0}s
- Resolution: ${project.resolution}
- FPS: ${project.fps}
- Scenes: ${project.scenes?.length || 0}

APPLIED FEATURES (increase complexity):
- Style Transfer: ${project.style_transfer_applied ? 'Yes' : 'No'}
- Stabilization: ${project.stabilization_applied ? 'Yes' : 'No'}
- Color Correction: ${project.color_correction_applied ? 'Yes' : 'No'}
- Audio Enhancement: ${project.audio_enhancement_applied ? 'Yes' : 'No'}

EXPORT SETTINGS:
- Target Resolution: ${preset.resolution}
- Target FPS: ${preset.fps}
- Codec: ${preset.codec}
- Bitrate: ${preset.bitrate_kbps} kbps
- Quality: ${preset.quality_level}

Calculate:
1. Complexity Score (0-100) based on:
   - Video duration (longer = higher)
   - Resolution increase/decrease
   - FPS changes
   - Number of applied AI features
   - Codec complexity (h265/av1 > h264)
   - Bitrate requirements

2. Estimated Render Time:
   - Calculate based on complexity
   - Assume modern GPU rendering
   - Consider codec efficiency
   - Factor in AI features overhead

3. Factors breakdown:
   - Base time (duration-based)
   - Resolution multiplier
   - FPS multiplier
   - Effects overhead
   - Codec overhead

4. Confidence level (0-1) in prediction`,
        response_json_schema: {
          type: "object",
          properties: {
            complexity_score: { type: "number" },
            estimated_render_seconds: { type: "number" },
            estimated_render_formatted: { type: "string" },
            factors: {
              type: "object",
              properties: {
                base_time_seconds: { type: "number" },
                resolution_multiplier: { type: "number" },
                fps_multiplier: { type: "number" },
                effects_overhead_seconds: { type: "number" },
                codec_overhead_seconds: { type: "number" }
              }
            },
            confidence: { type: "number" },
            estimated_file_size_mb: { type: "number" },
            render_speed: { type: "string" }
          }
        }
      });

      setRenderTimePrediction(prediction);
      setIsPredicting(false);
      return prediction;
    },
  });

  const savePresetMutation = useMutation({
    mutationFn: async (presetToSave) => {
      const updatedCustomPresets = [...customPresets, {
        ...presetToSave,
        id: `custom_${Date.now()}`,
        created_at: new Date().toISOString(),
        created_by: currentUser.email
      }];

      await base44.entities.VideoProject.update(project.id, {
        export_settings: {
          ...project.export_settings,
          custom_presets: updatedCustomPresets
        }
      });

      return updatedCustomPresets;
    },
    onSuccess: (updated) => {
      setCustomPresets(updated);
      queryClient.invalidateQueries(["videoProjects"]);
      setShowCreateCustom(false);
      setNewPreset({
        name: "",
        resolution: "1920x1080",
        fps: 30,
        codec: "h264",
        bitrate_kbps: 8000,
        quality_level: "high"
      });
      alert("✅ Custom preset saved!");
    },
  });

  const applyPresetMutation = useMutation({
    mutationFn: async (preset) => {
      // Predict render time
      const prediction = await predictRenderTimeMutation.mutateAsync(preset);

      // Save selected preset to project
      await base44.entities.VideoProject.update(project.id, {
        selected_export_preset: preset.preset_name || preset.name,
        export_settings: {
          ...project.export_settings,
          resolution: preset.resolution,
          fps: preset.fps,
          codec: preset.codec,
          bitrate_kbps: preset.bitrate_kbps,
          quality_level: preset.quality_level,
          platform: preset.platform,
          predicted_render_time: prediction
        }
      });

      return prediction;
    },
    onSuccess: (prediction) => {
      queryClient.invalidateQueries(["videoProjects"]);
      alert(`✅ Export preset applied!\n\n⏱️ Estimated render time: ${prediction.estimated_render_formatted}\n📊 Complexity: ${prediction.complexity_score}/100\n📦 File size: ~${prediction.estimated_file_size_mb}MB`);
    },
  });

  const handleCreateCustomPreset = () => {
    if (!newPreset.name) {
      alert("Please provide a preset name");
      return;
    }
    savePresetMutation.mutate(newPreset);
  };

  const handleSelectPreset = async (preset) => {
    setSelectedPreset(preset);
    await applyPresetMutation.mutateAsync(preset);
  };

  const deleteCustomPresetMutation = useMutation({
    mutationFn: async (presetId) => {
      const updatedCustomPresets = customPresets.filter(p => p.id !== presetId);
      
      await base44.entities.VideoProject.update(project.id, {
        export_settings: {
          ...project.export_settings,
          custom_presets: updatedCustomPresets
        }
      });

      return updatedCustomPresets;
    },
    onSuccess: (updated) => {
      setCustomPresets(updated);
      queryClient.invalidateQueries(["videoProjects"]);
      alert("✅ Preset deleted");
    },
  });

  const getPlatformIcon = (platform) => {
    const icons = {
      youtube: Youtube,
      instagram: Instagram,
      facebook: Facebook,
      tiktok: Smartphone,
      web: Globe,
      broadcast: Tv
    };
    return icons[platform?.toLowerCase()] || Monitor;
  };

  const getQualityColor = (quality) => {
    const colors = {
      ultra: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      high: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-orange-500/20 text-orange-400 border-orange-500/30"
    };
    return colors[quality?.toLowerCase()] || colors.medium;
  };

  const formatTime = (seconds) => {
    if (!seconds) return "Calculating...";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#06D6A0]" />
            AI Export Presets
          </CardTitle>
          <Button
            onClick={() => generateAIPresetsMutation.mutate()}
            disabled={isGeneratingPresets}
            className="bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black rounded-lg font-semibold"
          >
            {isGeneratingPresets ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate AI Presets
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Current Applied Preset */}
        {project.selected_export_preset && (
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-[#06D6A0]/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <h5 className="text-white font-bold">Active Export Preset</h5>
                  <p className="text-gray-400 text-sm">{project.selected_export_preset}</p>
                </div>
              </div>
            </div>
            
            {project.export_settings?.predicted_render_time && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-[#00D4C9]" />
                  <p className="text-xs text-gray-500">Est. Time</p>
                  <p className="text-white font-bold text-sm">
                    {project.export_settings.predicted_render_time.estimated_render_formatted}
                  </p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                  <Gauge className="w-4 h-4 mx-auto mb-1 text-[#FFD700]" />
                  <p className="text-xs text-gray-500">Complexity</p>
                  <p className="text-white font-bold text-sm">
                    {project.export_settings.predicted_render_time.complexity_score}/100
                  </p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                  <Download className="w-4 h-4 mx-auto mb-1 text-[#9D4EDD]" />
                  <p className="text-xs text-gray-500">File Size</p>
                  <p className="text-white font-bold text-sm">
                    ~{project.export_settings.predicted_render_time.estimated_file_size_mb}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="bg-[#0B0B0C] rounded-xl">
            <TabsTrigger value="quick">Quick Presets</TabsTrigger>
            <TabsTrigger value="ai">🤖 AI Optimized</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* Quick Presets */}
          <TabsContent value="quick">
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {quickPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <motion.button
                    key={preset.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#06D6A0] transition-all text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${preset.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h5 className="text-white font-bold">{preset.name}</h5>
                        <p className="text-gray-500 text-xs capitalize">{preset.platform}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-gray-500">Resolution</p>
                        <p className="text-white font-semibold">{preset.resolution}</p>
                      </div>
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-gray-500">FPS</p>
                        <p className="text-white font-semibold">{preset.fps}</p>
                      </div>
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-gray-500">Codec</p>
                        <p className="text-white font-semibold uppercase">{preset.codec}</p>
                      </div>
                      <div className="p-2 bg-[#111317] rounded">
                        <p className="text-gray-500">Bitrate</p>
                        <p className="text-white font-semibold">{preset.bitrate_kbps / 1000}M</p>
                      </div>
                    </div>

                    <Badge className={`${getQualityColor(preset.quality_level)} mt-3`}>
                      {preset.quality_level} quality
                    </Badge>
                  </motion.button>
                );
              })}
            </div>
          </TabsContent>

          {/* AI Optimized Presets */}
          <TabsContent value="ai">
            <div className="space-y-4 mt-4">
              {aiPresets.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">No AI presets generated yet</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Click "Generate AI Presets" to get optimized export settings based on your video
                  </p>
                  {!project.deep_analysis_complete && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
                      <p className="text-yellow-400 text-sm">
                        💡 Tip: Run Deep Analysis first for more accurate AI recommendations
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {aiPresets.map((preset, idx) => {
                    const PlatformIcon = getPlatformIcon(preset.platform);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border border-[#06D6A0]/30 rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {preset.priority === 1 && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                                <Star className="w-4 h-4 text-black" />
                              </div>
                            )}
                            <div>
                              <h5 className="text-white font-bold flex items-center gap-2">
                                {preset.preset_name}
                                {preset.priority === 1 && (
                                  <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                    Recommended
                                  </Badge>
                                )}
                              </h5>
                              <p className="text-gray-400 text-xs capitalize flex items-center gap-1 mt-1">
                                <PlatformIcon className="w-3 h-3" />
                                {preset.platform}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSelectPreset(preset)}
                            disabled={applyPresetMutation.isLoading}
                            className="bg-[#06D6A0] text-black hover:bg-[#05C090] rounded-lg"
                          >
                            Apply
                          </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <Monitor className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-xs text-gray-500">Resolution</p>
                            <p className="text-white text-xs font-semibold">{preset.resolution}</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <Film className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-xs text-gray-500">FPS</p>
                            <p className="text-white text-xs font-semibold">{preset.fps}</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <Settings className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-xs text-gray-500">Codec</p>
                            <p className="text-white text-xs font-semibold uppercase">{preset.codec}</p>
                          </div>
                          <div className="p-2 bg-[#0B0B0C] rounded text-center">
                            <Gauge className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-xs text-gray-500">Bitrate</p>
                            <p className="text-white text-xs font-semibold">{preset.bitrate_kbps / 1000}M</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getQualityColor(preset.quality_level)}>
                            {preset.quality_level} quality
                          </Badge>
                          <Badge className="bg-[#0B0B0C] text-gray-400">
                            ~{preset.estimated_file_size_mb}MB
                          </Badge>
                        </div>

                        <div className="p-3 bg-[#0B0B0C] rounded-lg mb-2">
                          <p className="text-[#00D4C9] text-sm font-medium mb-1">💡 Why Recommended:</p>
                          <p className="text-gray-300 text-xs">{preset.why_recommended}</p>
                        </div>

                        <p className="text-gray-400 text-xs">
                          <strong className="text-gray-300">Best for:</strong> {preset.best_use_case}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Custom Presets */}
          <TabsContent value="custom">
            <div className="space-y-4 mt-4">
              
              {/* Create Custom Preset */}
              {!showCreateCustom ? (
                <Button
                  onClick={() => setShowCreateCustom(true)}
                  className="w-full bg-[#0B0B0C] border-2 border-dashed border-gray-700 hover:border-[#06D6A0] text-white rounded-xl py-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Custom Preset
                </Button>
              ) : (
                <div className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
                  <h5 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Custom Preset
                  </h5>

                  <div className="space-y-3">
                    <Input
                      value={newPreset.name}
                      onChange={(e) => setNewPreset({...newPreset, name: e.target.value})}
                      placeholder="Preset Name (e.g., 'My Instagram HD')"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Resolution</label>
                        <Select
                          value={newPreset.resolution}
                          onValueChange={(value) => setNewPreset({...newPreset, resolution: value})}
                        >
                          <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                            <SelectItem value="2560x1440">QHD (2560x1440)</SelectItem>
                            <SelectItem value="1920x1080">Full HD (1920x1080)</SelectItem>
                            <SelectItem value="1280x720">HD (1280x720)</SelectItem>
                            <SelectItem value="1080x1920">Vertical HD</SelectItem>
                            <SelectItem value="1080x1080">Square HD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">FPS</label>
                        <Select
                          value={String(newPreset.fps)}
                          onValueChange={(value) => setNewPreset({...newPreset, fps: Number(value)})}
                        >
                          <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 fps (Cinematic)</SelectItem>
                            <SelectItem value="30">30 fps (Standard)</SelectItem>
                            <SelectItem value="60">60 fps (Smooth)</SelectItem>
                            <SelectItem value="120">120 fps (Slow-mo)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Codec</label>
                        <Select
                          value={newPreset.codec}
                          onValueChange={(value) => setNewPreset({...newPreset, codec: value})}
                        >
                          <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="h264">H.264 (Most Compatible)</SelectItem>
                            <SelectItem value="h265">H.265 (Better Compression)</SelectItem>
                            <SelectItem value="vp9">VP9 (Web Optimized)</SelectItem>
                            <SelectItem value="av1">AV1 (Future Standard)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Quality</label>
                        <Select
                          value={newPreset.quality_level}
                          onValueChange={(value) => setNewPreset({...newPreset, quality_level: value})}
                        >
                          <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ultra">Ultra (Best)</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low (Fast)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Bitrate (kbps)</label>
                      <Input
                        type="number"
                        value={newPreset.bitrate_kbps}
                        onChange={(e) => setNewPreset({...newPreset, bitrate_kbps: Number(e.target.value)})}
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Recommended: 4000-8000 for HD, 15000-25000 for 4K
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowCreateCustom(false)}
                        variant="outline"
                        className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCustomPreset}
                        disabled={savePresetMutation.isLoading}
                        className="flex-1 bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-lg"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Preset
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Custom Presets */}
              {customPresets.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-white font-semibold">Your Custom Presets</h5>
                  {customPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-bold">{preset.name}</h5>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSelectPreset(preset)}
                            className="bg-[#06D6A0] text-black hover:bg-[#05C090] rounded-lg"
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this preset?")) {
                                deleteCustomPresetMutation.mutate(preset.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-500">Resolution</p>
                          <p className="text-white font-semibold">{preset.resolution}</p>
                        </div>
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-500">FPS</p>
                          <p className="text-white font-semibold">{preset.fps}</p>
                        </div>
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-500">Codec</p>
                          <p className="text-white font-semibold uppercase">{preset.codec}</p>
                        </div>
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-500">Bitrate</p>
                          <p className="text-white font-semibold">{preset.bitrate_kbps / 1000}M</p>
                        </div>
                      </div>

                      <Badge className={`${getQualityColor(preset.quality_level)} mt-2`}>
                        {preset.quality_level} quality
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {customPresets.length === 0 && !showCreateCustom && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-sm">No custom presets yet</p>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>

        {/* Render Time Prediction Details */}
        {renderTimePrediction && selectedPreset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-xl"
          >
            <h5 className="text-white font-bold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#FFD700]" />
              AI Render Time Prediction
            </h5>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-[#00D4C9]" />
                <p className="text-xs text-gray-500 mb-1">Estimated Time</p>
                <p className="text-2xl font-bold text-white">
                  {renderTimePrediction.estimated_render_formatted}
                </p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                <Gauge className="w-6 h-6 mx-auto mb-2 text-[#FFD700]" />
                <p className="text-xs text-gray-500 mb-1">Complexity</p>
                <p className="text-2xl font-bold text-white">
                  {renderTimePrediction.complexity_score}
                </p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                <Download className="w-6 h-6 mx-auto mb-2 text-[#9D4EDD]" />
                <p className="text-xs text-gray-500 mb-1">File Size</p>
                <p className="text-2xl font-bold text-white">
                  {renderTimePrediction.estimated_file_size_mb}MB
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg mb-3">
              <p className="text-gray-400 text-xs mb-2">COMPLEXITY BREAKDOWN</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">Base Time (Duration):</span>
                  <span className="text-white font-semibold">{formatTime(renderTimePrediction.factors?.base_time_seconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Resolution Factor:</span>
                  <span className="text-white font-semibold">×{renderTimePrediction.factors?.resolution_multiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">FPS Factor:</span>
                  <span className="text-white font-semibold">×{renderTimePrediction.factors?.fps_multiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Effects Overhead:</span>
                  <span className="text-white font-semibold">+{formatTime(renderTimePrediction.factors?.effects_overhead_seconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Codec Overhead:</span>
                  <span className="text-white font-semibold">+{formatTime(renderTimePrediction.factors?.codec_overhead_seconds)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <p className="text-blue-400 text-sm">
                  <strong>Render Speed:</strong> {renderTimePrediction.render_speed}
                </p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400">
                {Math.round(renderTimePrediction.confidence * 100)}% confident
              </Badge>
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
          <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00D4C9]" />
            How AI Export Presets Work
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge className="bg-[#06D6A0]/20 text-[#06D6A0] text-xs h-fit">1</Badge>
              <p className="text-gray-300">AI analyzes your video's genre, mood, pacing, and quality</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs h-fit">2</Badge>
              <p className="text-gray-300">Generates optimal presets for recommended platforms</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs h-fit">3</Badge>
              <p className="text-gray-300">Predicts render time based on project complexity</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs h-fit">4</Badge>
              <p className="text-gray-300">Balances quality, file size, and compatibility</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-[#FF69B4]/20 text-[#FF69B4] text-xs h-fit">5</Badge>
              <p className="text-gray-300">Save custom presets for future projects</p>
            </div>
          </div>
        </div>

        {/* Codec Comparison */}
        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
          <h5 className="text-white font-semibold mb-3">📊 Codec Comparison</h5>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-[#06D6A0] text-sm font-medium mb-1">H.264 (Most Compatible)</p>
              <p className="text-gray-400 text-xs">✅ Best compatibility, fast encode, larger files</p>
            </div>
            <div>
              <p className="text-[#00D4C9] text-sm font-medium mb-1">H.265 (Better Compression)</p>
              <p className="text-gray-400 text-xs">✅ 50% smaller files, slower encode, great quality</p>
            </div>
            <div>
              <p className="text-[#9D4EDD] text-sm font-medium mb-1">VP9 (Web Optimized)</p>
              <p className="text-gray-400 text-xs">✅ YouTube/web friendly, good compression</p>
            </div>
            <div>
              <p className="text-[#FFD700] text-sm font-medium mb-1">AV1 (Future Standard)</p>
              <p className="text-gray-400 text-xs">✅ Best compression, slowest encode, cutting edge</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}