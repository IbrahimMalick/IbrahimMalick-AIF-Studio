import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Film,
  Loader2,
  CheckCircle2,
  Play,
  Download,
  Share2,
  Zap,
  Clock,
  Eye,
  Mic,
  User as UserIcon,
  Palette,
  FileText,
  Sparkles,
  Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BACKEND INTEGRATION:
 * 
 * Replace simulation with real API calls:
 * 
 * const response = await fetch('/api/v1/avatar/render', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     avatar_id: avatar.id,
 *     script: projectData.script,
 *     voice_profile_id: voiceProfile.id,
 *     quality_mode: renderMode,
 *     format: projectData.format,
 *     captions: projectData.caption_config,
 *     lower_thirds: projectData.lower_thirds_config,
 *     cta: projectData.cta_config
 *   })
 * });
 * 
 * const { job_id } = await response.json();
 * 
 * // Then poll or use WebSocket for progress:
 * const ws = new WebSocket(`ws://backend/jobs/${job_id}`);
 * ws.onmessage = (event) => {
 *   const { progress, stage } = JSON.parse(event.data);
 *   setProgress(progress);
 *   setCurrentStage(stage);
 * };
 */

export default function AvatarRenderer({ projectData, avatar, voiceProfile, onRenderComplete }) {
  const queryClient = useQueryClient();
  const [renderMode, setRenderMode] = useState("standard");
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [stageDetails, setStageDetails] = useState("");
  const [autoPublish, setAutoPublish] = useState(false);
  const [publishPlatforms, setPublishPlatforms] = useState([]);
  const [renderedVideo, setRenderedVideo] = useState(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  const renderModes = [
    { 
      value: "fast_path", 
      label: "⚡ Fast Path",
      description: "Sub-60s render, lower compute",
      time: "< 60 seconds",
      quality: "Good for shorts/reels",
      cost: 0.10
    },
    { 
      value: "standard", 
      label: "🎬 Standard",
      description: "Balanced quality & speed",
      time: "2-5 minutes",
      quality: "Great for social/ads",
      cost: 0.25
    },
    { 
      value: "high_quality", 
      label: "💎 High Quality",
      description: "Premium lip-sync & gestures",
      time: "5-10 minutes",
      quality: "Perfect for VSLs/web",
      cost: 0.50
    }
  ];

  // Realistic stage progression with detailed substages
  const renderStages = [
    {
      name: "Script Analysis",
      progress: 0,
      duration: 2,
      details: "Parsing prosody tags and scene breaks"
    },
    {
      name: "Voice Generation",
      progress: 15,
      duration: renderMode === 'fast_path' ? 8 : 15,
      details: "Synthesizing speech with emotion controls"
    },
    {
      name: "Avatar Synthesis",
      progress: 40,
      duration: renderMode === 'fast_path' ? 15 : renderMode === 'standard' ? 45 : 90,
      details: "Generating avatar with lip-sync alignment"
    },
    {
      name: "Graphics Overlay",
      progress: 70,
      duration: renderMode === 'fast_path' ? 10 : 20,
      details: "Adding captions, lower thirds, CTA"
    },
    {
      name: "Final Encoding",
      progress: 85,
      duration: renderMode === 'fast_path' ? 15 : 30,
      details: "Encoding video for optimal delivery"
    },
    {
      name: "Quality Validation",
      progress: 95,
      duration: 5,
      details: "Checking lip-sync, audio normalization"
    },
    {
      name: "Upload & Processing",
      progress: 98,
      duration: 5,
      details: "Uploading to CDN"
    }
  ];

  const renderVideoMutation = useMutation({
    mutationFn: async () => {
      setIsRendering(true);
      setProgress(0);
      
      const totalDuration = renderStages.reduce((sum, stage) => sum + stage.duration, 0);
      let elapsed = 0;

      // Simulate realistic multi-stage rendering
      for (const stage of renderStages) {
        setCurrentStage(stage.name);
        setStageDetails(stage.details);
        
        const stageDuration = stage.duration * 1000;
        const steps = 10;
        const stepDuration = stageDuration / steps;
        
        for (let i = 0; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          const stageProgress = (i / steps) * (renderStages[renderStages.indexOf(stage) + 1]?.progress || 100 - stage.progress);
          setProgress(Math.min(100, stage.progress + stageProgress));
          
          elapsed += stepDuration / 1000;
          setEstimatedTimeRemaining(Math.max(0, totalDuration - elapsed));
        }
      }

      // Create final video record
      const avatarVideo = await base44.entities.AvatarVideo.create({
        user_email: projectData.user_email,
        project_id: projectData.id,
        avatar_id: avatar.id,
        language: projectData.language,
        script: projectData.script,
        video_url: `https://cdn.example.com/avatar-${Date.now()}.mp4`,
        audio_url: `https://cdn.example.com/voice-${Date.now()}.mp3`,
        thumbnail_url: `https://cdn.example.com/thumb-${Date.now()}.jpg`,
        srt_url: `https://cdn.example.com/captions-${Date.now()}.srt`,
        vtt_url: `https://cdn.example.com/captions-${Date.now()}.vtt`,
        duration_seconds: projectData.duration_target_seconds || 30,
        aspect_ratio: projectData.format,
        resolution: renderMode === 'ultra_4k' ? '4K' : '1080p',
        status: "completed",
        video_type: projectData.script_type || "reel",
        render_mode: renderMode,
        lipsync_offset_ms: 85,
        lipsync_validated: true,
        file_size_mb: renderMode === 'fast_path' ? 8.5 : renderMode === 'standard' ? 12.5 : 25.0,
        cost_usd: renderModes.find(m => m.value === renderMode).cost,
        render_time_seconds: totalDuration
      });

      // Update project
      await base44.entities.AvatarProject.update(projectData.id, {
        status: "completed",
        outputs: [
          {
            language: projectData.language,
            video_url: avatarVideo.video_url,
            audio_url: avatarVideo.audio_url,
            srt_url: avatarVideo.srt_url,
            thumbnail_url: avatarVideo.thumbnail_url,
            duration_seconds: avatarVideo.duration_seconds,
            file_size_mb: avatarVideo.file_size_mb
          }
        ]
      });

      // Auto-publish if enabled
      if (autoPublish && publishPlatforms.length > 0) {
        await base44.entities.ScheduledPost.create({
          user_email: projectData.user_email,
          content_type: "video",
          content_url: avatarVideo.video_url,
          thumbnail_url: avatarVideo.thumbnail_url,
          title: projectData.project_name,
          caption: projectData.script.substring(0, 200),
          platforms: publishPlatforms,
          status: "posting",
          auto_generated: true,
          source_entity_type: "AvatarVideo",
          source_entity_id: avatarVideo.id
        });
      }

      return avatarVideo;
    },
    onSuccess: (video) => {
      setRenderedVideo(video);
      queryClient.invalidateQueries(["avatarVideos"]);
      queryClient.invalidateQueries(["avatarProjects"]);
      
      // Create notification
      base44.entities.Notification.create({
        user_email: projectData.user_email,
        title: "Avatar Video Ready! 🎉",
        message: `"${projectData.project_name}" has finished rendering`,
        type: "success",
        category: "render_complete",
        action_url: video.video_url,
        action_label: "View Video"
      });

      if (onRenderComplete) onRenderComplete(video);
      setIsRendering(false);
    },
    onError: (error) => {
      console.error("Render error:", error);
      alert("❌ Render failed. Please try again.");
      setIsRendering(false);
    }
  });

  const selectedMode = renderModes.find(m => m.value === renderMode);

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-[#FFD700]" />
          Render Avatar Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Project Summary */}
        <div className="p-4 bg-gradient-to-r from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9D4EDD]" />
            Project Configuration
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2 bg-[#0B0B0C] rounded text-center">
              <UserIcon className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-500">Avatar</p>
              <p className="text-white text-xs font-semibold truncate">{avatar?.avatar_name}</p>
            </div>
            <div className="p-2 bg-[#0B0B0C] rounded text-center">
              <Mic className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-500">Voice</p>
              <p className="text-white text-xs font-semibold truncate">{voiceProfile?.profile_name || 'Default'}</p>
            </div>
            <div className="p-2 bg-[#0B0B0C] rounded text-center">
              <Film className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-500">Format</p>
              <p className="text-white text-xs font-semibold">{projectData.format}</p>
            </div>
            <div className="p-2 bg-[#0B0B0C] rounded text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-white text-xs font-semibold">{projectData.duration_target_seconds}s</p>
            </div>
          </div>
        </div>

        {/* Render Mode Selection */}
        <div>
          <label className="text-sm text-gray-400 mb-3 block">Render Quality</label>
          <div className="grid gap-3">
            {renderModes.map(mode => (
              <label
                key={mode.value}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  renderMode === mode.value
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="renderMode"
                  value={mode.value}
                  checked={renderMode === mode.value}
                  onChange={(e) => setRenderMode(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{mode.label}</h4>
                    <p className="text-gray-400 text-xs">{mode.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {mode.time}
                    </Badge>
                    <p className="text-[#FFD700] text-xs font-bold">${mode.cost.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">{mode.quality}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Auto-Publish Toggle */}
        <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Auto-Publish After Render</h4>
              <p className="text-gray-400 text-xs">Automatically post to selected platforms</p>
            </div>
            <Switch
              checked={autoPublish}
              onCheckedChange={setAutoPublish}
            />
          </div>

          {autoPublish && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {["instagram", "facebook", "tiktok", "youtube"].map(platform => (
                <label
                  key={platform}
                  className={`p-2 rounded-lg border cursor-pointer text-center transition-all ${
                    publishPlatforms.includes(platform)
                      ? 'border-[#00D4C9] bg-[#00D4C9]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={publishPlatforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPublishPlatforms([...publishPlatforms, platform]);
                      } else {
                        setPublishPlatforms(publishPlatforms.filter(p => p !== platform));
                      }
                    }}
                    className="sr-only"
                  />
                  <p className="text-white text-xs capitalize">{platform}</p>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Render Progress */}
        {isRendering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Main Progress */}
            <div className="p-5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                  <div>
                    <h4 className="text-white font-bold">{currentStage}</h4>
                    <p className="text-gray-400 text-xs">{stageDetails}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{progress}%</p>
                  <p className="text-gray-400 text-xs">
                    {estimatedTimeRemaining > 0 ? `~${Math.round(estimatedTimeRemaining)}s left` : 'Almost done'}
                  </p>
                </div>
              </div>
              <Progress value={progress} className="h-4 mb-3" />
              
              {/* Stage Timeline */}
              <div className="grid grid-cols-7 gap-1 mt-4">
                {renderStages.map((stage, idx) => {
                  const isActive = progress >= stage.progress && progress < (renderStages[idx + 1]?.progress || 100);
                  const isComplete = progress > stage.progress;
                  
                  return (
                    <div key={idx} className="text-center">
                      <div className={`w-full h-2 rounded-full mb-1 transition-all ${
                        isComplete ? 'bg-green-500' :
                        isActive ? 'bg-yellow-400 animate-pulse' :
                        'bg-gray-700'
                      }`} />
                      <p className={`text-xs truncate ${
                        isActive ? 'text-yellow-400 font-semibold' :
                        isComplete ? 'text-green-400' :
                        'text-gray-600'
                      }`}>
                        {stage.name.split(' ')[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Render Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                <Gauge className="w-5 h-5 mx-auto mb-1 text-[#FFD700]" />
                <p className="text-xs text-gray-500">Quality Mode</p>
                <p className="text-white font-semibold text-sm capitalize">{renderMode.replace('_', ' ')}</p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                <Palette className="w-5 h-5 mx-auto mb-1 text-[#9D4EDD]" />
                <p className="text-xs text-gray-500">Graphics</p>
                <p className="text-white font-semibold text-sm">
                  {[
                    projectData.caption_config?.enabled,
                    projectData.lower_thirds_config?.enabled,
                    projectData.cta_config?.enabled
                  ].filter(Boolean).length} overlays
                </p>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg text-center">
                <FileText className="w-5 h-5 mx-auto mb-1 text-[#00D4C9]" />
                <p className="text-xs text-gray-500">Format</p>
                <p className="text-white font-semibold text-sm">{projectData.format}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rendered Video Preview */}
        <AnimatePresence>
          {renderedVideo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <h4 className="text-white font-bold text-lg">Video Ready!</h4>
                <Badge className="bg-green-500/20 text-green-400 ml-auto">
                  {renderedVideo.duration_seconds}s • {renderedVideo.file_size_mb}MB
                </Badge>
              </div>

              <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                {renderedVideo.thumbnail_url ? (
                  <img 
                    src={renderedVideo.thumbnail_url} 
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#9D4EDD]/20 to-[#FF69B4]/20 flex items-center justify-center">
                    <Film className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                  <p className="text-xs text-gray-500">Lip-sync</p>
                  <p className="text-green-400 font-bold text-sm">{renderedVideo.lipsync_offset_ms}ms</p>
                  <p className="text-xs text-gray-600">Target: &lt;120ms</p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                  <p className="text-xs text-gray-500">Resolution</p>
                  <p className="text-white font-bold text-sm">{renderedVideo.resolution}</p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                  <p className="text-xs text-gray-500">Cost</p>
                  <p className="text-[#FFD700] font-bold text-sm">${renderedVideo.cost_usd.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-[#0B0B0C] rounded text-center">
                  <p className="text-xs text-gray-500">Render Time</p>
                  <p className="text-white font-bold text-sm">{Math.round(renderedVideo.render_time_seconds)}s</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  className="bg-[#1E90FF] text-white rounded-lg"
                  onClick={() => window.open(renderedVideo.video_url, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-700 rounded-lg"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = renderedVideo.video_url;
                    a.download = `avatar-video-${renderedVideo.id}.mp4`;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  className="bg-green-500 text-white rounded-lg"
                  onClick={() => {
                    // Navigate to social media scheduler
                    alert("Opening Social Media Publisher...");
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Publish
                </Button>
              </div>

              {autoPublish && publishPlatforms.length > 0 && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Auto-publishing to: {publishPlatforms.join(', ')}
                  </p>
                </div>
              )}

              {/* Caption Files */}
              {renderedVideo.srt_url && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-700 rounded-lg text-xs"
                    onClick={() => window.open(renderedVideo.srt_url, '_blank')}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Download SRT
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-700 rounded-lg text-xs"
                    onClick={() => window.open(renderedVideo.vtt_url, '_blank')}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Download VTT
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Button */}
        {!renderedVideo && !isRendering && (
          <>
            <Button
              onClick={() => renderVideoMutation.mutate()}
              disabled={isRendering}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-bold h-14 text-lg"
            >
              <Zap className="w-6 h-6 mr-2" />
              Render Avatar Video
            </Button>

            {/* Estimate Summary */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl text-center border border-gray-800">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estimated Time</p>
                  <p className="text-[#FFD700] font-bold text-lg">{selectedMode?.time}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cost</p>
                  <p className="text-[#00D4C9] font-bold text-lg">${selectedMode?.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Quality</p>
                  <p className="text-white font-bold text-sm capitalize">{renderMode.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}