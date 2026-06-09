
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Crown,
  Award,
  Users,
  Video,
  Gauge,
  RefreshCw,
  X,
  Play,
  Pause,
  Ban,
  ArrowUp,
  Calendar,
  Timer,
  Activity,
  Server,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BACKEND INTEGRATION POINTS:
 * 
 * 1. Real Queue System (BullMQ + Redis):
 *    - Replace base44.entities.RenderJob with API calls to /api/v1/jobs/:id
 *    - GET /api/v1/queue/status - Get queue state
 *    - POST /api/v1/jobs - Submit new render job
 *    - DELETE /api/v1/jobs/:id - Cancel job
 *    - POST /api/v1/jobs/:id/boost - Priority boost
 * 
 * 2. WebSocket for Real-time Updates:
 *    - Connect to ws://backend/queue-updates
 *    - Listen for: job-progress, job-completed, queue-position-changed
 * 
 * 3. Render Providers:
 *    - HeyGen API for avatar synthesis
 *    - ElevenLabs for voice generation
 *    - FFmpeg for video assembly
 *    - S3/R2 for storage
 */

export default function RenderQueue({ currentUser, currentProject }) {
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [queueStats, setQueueStats] = useState({
    activeWorkers: 3,
    queuedJobs: 0,
    processingJobs: 0,
    avgWaitTime: 0,
    successRate: 0,
    totalCompleted: 0,
    totalFailed: 0
  });

  // Fetch all render jobs
  const { data: allJobs = [] } = useQuery({
    queryKey: ["renderQueue"],
    queryFn: () => base44.entities.RenderJob.list("-priority_score"),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // User's jobs only
  const { data: userJobs = [] } = useQuery({
    queryKey: ["userRenderJobs", currentUser?.email],
    queryFn: () => base44.entities.RenderJob.filter({
      user_email: currentUser.email
    }, "-created_date"),
    enabled: !!currentUser,
    refetchInterval: autoRefresh ? 3000 : false,
  });

  // Simulate realistic render progress
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      const processingJobs = allJobs.filter(j => j.status === 'processing');
      
      for (const job of processingJobs) {
        if (job.progress < 100) {
          // Simulate realistic progress increments
          const increment = job.job_type === 'video_render' ? 
            Math.random() * 5 : Math.random() * 8;
          
          const newProgress = Math.min(100, (job.progress || 0) + increment);
          
          await base44.entities.RenderJob.update(job.id, {
            progress: Math.round(newProgress)
          });

          // Mark as completed when reaching 100%
          if (newProgress >= 100) {
            await base44.entities.RenderJob.update(job.id, {
              status: 'completed',
              completed_at: new Date().toISOString(),
              progress: 100,
              processing_time_seconds: job.estimated_render_time_seconds || 300,
              output_url: `https://cdn.example.com/render-${job.id}.mp4`
            });

            // Create success notification
            await base44.entities.Notification.create({
              user_email: job.user_email,
              title: "Render Complete! 🎉",
              message: `Your ${job.job_type.replace(/_/g, ' ')} is ready`,
              type: "success",
              category: "render_complete",
              action_url: job.output_url,
              action_label: "Download Video"
            });
          }
        }
      }

      // Auto-start next queued job if capacity available
      const queuedJobs = allJobs.filter(j => j.status === 'queued')
        .sort((a, b) => b.priority_score - a.priority_score);
      
      if (processingJobs.length < 3 && queuedJobs.length > 0) {
        const nextJob = queuedJobs[0];
        await base44.entities.RenderJob.update(nextJob.id, {
          status: 'processing',
          started_at: new Date().toISOString(),
          progress: 5
        });
      }

      queryClient.invalidateQueries(["renderQueue"]);
      queryClient.invalidateQueries(["userRenderJobs"]);

    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh, allJobs, queryClient]);

  // Enhanced stats calculation
  useEffect(() => {
    const queued = allJobs.filter(j => j.status === 'queued');
    const processing = allJobs.filter(j => j.status === 'processing');
    const completed = allJobs.filter(j => j.status === 'completed');
    const failed = allJobs.filter(j => j.status === 'failed');
    const avgWait = queued.reduce((sum, j) => sum + (j.estimated_wait_time_seconds || 0), 0) / (queued.length || 1);

    const total = completed.length + failed.length;
    const successRate = total > 0 ? ((completed.length / total) * 100).toFixed(1) : 100;

    setQueueStats({
      activeWorkers: processing.length,
      queuedJobs: queued.length,
      processingJobs: processing.length,
      avgWaitTime: Math.round(avgWait),
      successRate: parseFloat(successRate),
      totalCompleted: completed.length,
      totalFailed: failed.length
    });
  }, [allJobs]);

  const cancelJobMutation = useMutation({
    mutationFn: (jobId) => base44.entities.RenderJob.update(jobId, { 
      status: "cancelled" 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["renderQueue"]);
      queryClient.invalidateQueries(["userRenderJobs"]);
    },
  });

  const boostJobMutation = useMutation({
    mutationFn: async (jobId) => {
      const job = allJobs.find(j => j.id === jobId);
      if (!job) return;

      const newPriority = job.priority_score + 50;
      
      await base44.entities.RenderJob.update(jobId, {
        boosted: true,
        boost_amount_usd: 5.00,
        priority_score: newPriority
      });

      await recalculateQueue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["renderQueue"]);
      queryClient.invalidateQueries(["userRenderJobs"]);
      alert("✅ Job boosted! Moved higher in queue.");
    },
  });

  const submitRenderJobMutation = useMutation({
    mutationFn: async (project) => {
      // Calculate complexity and priority using AI
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this avatar video project and calculate rendering metrics:

PROJECT:
- Duration: ${project.duration_target_seconds || 30}s
- Format: ${project.format}
- Script Type: ${project.script_type}
- Languages: ${[project.language, ...(project.additional_languages || [])].join(', ')}
- Render Mode: ${project.render_quality || 'standard'}

USER:
- Subscription Tier: ${currentUser.plan_tier || 'free'}

FEATURES ENABLED:
- Multilingual: ${project.additional_languages?.length > 0}
- Auto-Captions: ${project.caption_config?.enabled}
- Lower Thirds: ${project.lower_thirds_config?.enabled}
- CTA Overlay: ${project.cta_config?.enabled}

Calculate:
1. Complexity score (0-100) based on:
   - Duration
   - Multi-language (adds 30% per language)
   - Quality mode (fast=50, standard=70, high=100)
   - Graphics overlays

2. Estimated render time in seconds

3. Priority score (0-100) based on:
   - Subscription tier (enterprise=100, studio=75, creator=50, free=25)
   - Project complexity
   - Queue position

Provide detailed breakdown.`,
        response_json_schema: {
          type: "object",
          properties: {
            complexity_score: { type: "number" },
            estimated_render_time_seconds: { type: "number" },
            base_priority_score: { type: "number" },
            complexity_factors: {
              type: "object",
              properties: {
                duration_factor: { type: "number" },
                quality_factor: { type: "number" },
                language_factor: { type: "number" },
                graphics_factor: { type: "number" }
              }
            }
          }
        }
      });

      // Calculate queue position
      const queuedJobs = allJobs.filter(j => j.status === 'queued' || j.status === 'processing');
      const higherPriorityJobs = queuedJobs.filter(j => j.priority_score > analysis.base_priority_score);
      const queuePosition = higherPriorityJobs.length + 1;
      
      const estimatedWaitTime = higherPriorityJobs.reduce((sum, j) => 
        sum + (j.estimated_render_time_seconds || 60), 0
      );

      // Create render job
      return await base44.entities.RenderJob.create({
        job_type: "video_render",
        project_id: project.id,
        user_email: currentUser.email,
        user_subscription_tier: currentUser.plan_tier || 'free',
        status: "queued",
        priority_score: analysis.base_priority_score,
        queue_position: queuePosition,
        estimated_render_time_seconds: analysis.estimated_render_time_seconds,
        estimated_wait_time_seconds: estimatedWaitTime,
        complexity_score: analysis.complexity_score,
        complexity_factors: {
          duration_seconds: project.duration_target_seconds,
          quality_mode: project.render_quality,
          language_count: 1 + (project.additional_languages?.length || 0),
          has_captions: project.caption_config?.enabled || false,
          has_lower_thirds: project.lower_thirds_config?.enabled || false,
          has_cta: project.cta_config?.enabled || false
        },
        render_settings: {
          quality_mode: project.render_quality || 'standard',
          format: project.format,
          languages: [project.language, ...(project.additional_languages || [])]
        },
        progress: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["renderQueue"]);
      queryClient.invalidateQueries(["userRenderJobs"]);
      alert("✅ Render job submitted to AI-powered queue!");
    },
  });

  const recalculateQueue = async () => {
    queryClient.invalidateQueries(["renderQueue"]);
    queryClient.invalidateQueries(["userRenderJobs"]);
  };

  const queuedJobs = allJobs.filter(j => j.status === 'queued');
  const processingJobs = allJobs.filter(j => j.status === 'processing');
  const completedJobs = allJobs.filter(j => j.status === 'completed').slice(0, 10);
  const failedJobs = allJobs.filter(j => j.status === 'failed');

  const userQueuedJobs = userJobs.filter(j => j.status === 'queued' || j.status === 'processing');
  const userCompletedJobs = userJobs.filter(j => j.status === 'completed');

  const getTierColor = (tier) => {
    const colors = {
      enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      studio: "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30",
      creator: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      free: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return colors[tier] || colors.free;
  };

  const getTierIcon = (tier) => {
    const icons = {
      enterprise: Crown,
      studio: Award,
      creator: TrendingUp,
      free: Users
    };
    const Icon = icons[tier] || Users;
    return <Icon className="w-3 h-3" />;
  };

  const formatTime = (seconds) => {
    if (!seconds) return "Calculating...";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getProgressStage = (progress) => {
    if (progress < 25) return { label: "Voice Generation", color: "text-blue-400" };
    if (progress < 50) return { label: "Avatar Synthesis", color: "text-purple-400" };
    if (progress < 70) return { label: "Adding Graphics", color: "text-yellow-400" };
    if (progress < 90) return { label: "Final Render", color: "text-orange-400" };
    return { label: "Finalizing", color: "text-green-400" };
  };

  return (
    <div className="space-y-6">
      
      {/* Enhanced System Status Dashboard */}
      <Card className="bg-gradient-to-r from-[#111317] to-[#1a1a1f] border-gray-800 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Render System Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs">All Systems Operational</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className={autoRefresh ? "bg-[#00D4C9] text-black" : "border-gray-700"}
              >
                {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {autoRefresh ? "Live" : "Paused"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-xs">Active Workers</p>
              </div>
              <p className="text-3xl font-bold text-white">{queueStats.activeWorkers}</p>
              <p className="text-green-400 text-xs mt-1">
                {queueStats.processingJobs} rendering now
              </p>
            </div>

            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <p className="text-gray-400 text-xs">In Queue</p>
              </div>
              <p className="text-3xl font-bold text-white">{queueStats.queuedJobs}</p>
              <p className="text-blue-400 text-xs mt-1">
                Avg: {formatTime(queueStats.avgWaitTime)}
              </p>
            </div>

            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-xs">Completed</p>
              </div>
              <p className="text-3xl font-bold text-white">{queueStats.totalCompleted}</p>
              <p className="text-gray-400 text-xs mt-1">
                Total renders
              </p>
            </div>

            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-[#FFD700]" />
                <p className="text-gray-400 text-xs">Success Rate</p>
              </div>
              <p className="text-3xl font-bold text-white">{queueStats.successRate}%</p>
              <p className="text-green-400 text-xs mt-1">
                {queueStats.totalFailed} failed
              </p>
            </div>

            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-[#00D4C9]" />
                <p className="text-gray-400 text-xs">Your Active</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {allJobs.filter(j => j.user_email === currentUser?.email && 
                  (j.status === 'queued' || j.status === 'processing')).length}
              </p>
              <p className="text-[#00D4C9] text-xs mt-1">
                In progress
              </p>
            </div>
          </div>

          {/* Retry Statistics */}
          <div className="mt-4 p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <h4 className="text-white font-semibold text-sm mb-3">🔄 Retry System (Simulated)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Render Jobs</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">5 attempts</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">Exponential</Badge>
                </div>
                <p className="text-gray-500 text-xs mt-1">2s → 4s → 8s → 16s → 32s</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Batch Items</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">3 attempts</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">Fixed</Badge>
                </div>
                <p className="text-gray-500 text-xs mt-1">3s → 3s → 3s</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Dub Jobs</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">4 attempts</Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">Exponential</Badge>
                </div>
                <p className="text-gray-500 text-xs mt-1">3s → 6s → 12s → 24s</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Render Job */}
      {currentProject && !userQueuedJobs.find(j => j.project_id === currentProject.id) && (
        <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-[#00D4C9]/10 border-2 border-[#00D4C9] rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06D6A0] to-[#00D4C9] flex items-center justify-center">
                  <Video className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Ready to Render</h3>
                  <p className="text-gray-400 text-sm">Project: {currentProject.project_name || currentProject.title}</p>
                </div>
              </div>
              <Button
                onClick={() => submitRenderJobMutation.mutate(currentProject)}
                disabled={submitRenderJobMutation.isLoading}
                className="bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black rounded-xl font-semibold"
              >
                {submitRenderJobMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Add to Queue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Active Jobs */}
      {userQueuedJobs.length > 0 && (
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-[#FFD700]" />
              Your Active Renders ({userQueuedJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userQueuedJobs.map((job) => {
              const stage = getProgressStage(job.progress || 0);
              
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-semibold">
                          {job.job_type.replace(/_/g, ' ')}
                        </h4>
                        {job.boosted && (
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Boosted
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`${getTierColor(job.user_subscription_tier)} text-xs`}>
                          {getTierIcon(job.user_subscription_tier)}
                          <span className="ml-1 capitalize">{job.user_subscription_tier}</span>
                        </Badge>
                        <Badge className={`text-xs ${
                          job.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          job.status === 'queued' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {job.status}
                        </Badge>
                        <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                          <Gauge className="w-3 h-3 mr-1" />
                          Complexity: {job.complexity_score}/100
                        </Badge>
                      </div>
                    </div>
                    {job.status === 'queued' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("Cancel this render job?")) {
                            cancelJobMutation.mutate(job.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {job.status === 'processing' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                          <span className={`text-sm font-medium ${stage.color}`}>{stage.label}</span>
                        </div>
                        <span className="text-sm text-white font-semibold">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-3" />
                      
                      {/* Stage Indicators */}
                      <div className="grid grid-cols-5 gap-2 mt-3">
                        {[
                          { label: "Voice", threshold: 25, icon: "🎙️" },
                          { label: "Avatar", threshold: 50, icon: "🎭" },
                          { label: "Graphics", threshold: 70, icon: "🎨" },
                          { label: "Render", threshold: 90, icon: "🎬" },
                          { label: "Done", threshold: 100, icon: "✅" }
                        ].map((s, idx) => (
                          <div key={idx} className="text-center">
                            <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-xs ${
                              job.progress >= s.threshold ? 'bg-green-500' :
                              job.progress >= s.threshold - 10 ? 'bg-yellow-500' :
                              'bg-gray-700'
                            }`}>
                              {s.icon}
                            </div>
                            <p className="text-gray-500 text-xs">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 bg-[#111317] rounded text-center">
                      <p className="text-xs text-gray-500 mb-1">Queue Position</p>
                      <p className="text-lg font-bold text-white">#{job.queue_position || '?'}</p>
                    </div>
                    <div className="p-2 bg-[#111317] rounded text-center">
                      <p className="text-xs text-gray-500 mb-1">Est. Wait</p>
                      <p className="text-lg font-bold text-[#00D4C9]">
                        {formatTime(job.estimated_wait_time_seconds)}
                      </p>
                    </div>
                    <div className="p-2 bg-[#111317] rounded text-center">
                      <p className="text-xs text-gray-500 mb-1">Render Time</p>
                      <p className="text-lg font-bold text-[#06D6A0]">
                        {formatTime(job.estimated_render_time_seconds)}
                      </p>
                    </div>
                  </div>

                  {job.status === 'queued' && !job.boosted && (
                    <div className="mt-3 p-3 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">Skip the wait?</p>
                          <p className="text-gray-400 text-xs">Priority boost available for $5</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm("Boost this job to high priority for $5?")) {
                              boostJobMutation.mutate(job.id);
                            }
                          }}
                          className="bg-[#FFD700] text-black hover:bg-[#FFC700]"
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Boost
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Global Queue View */}
      <Card className="bg-[#111317] border-gray-800 rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00D4C9]" />
              Global Render Queue
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          
          {/* Currently Processing */}
          {processingJobs.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                Now Rendering ({processingJobs.length}/{queueStats.activeWorkers} workers)
              </h4>
              <div className="space-y-3">
                {processingJobs.map((job) => {
                  const stage = getProgressStage(job.progress || 0);
                  
                  return (
                    <div key={job.id} className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTierColor(job.user_subscription_tier)} text-xs`}>
                            {getTierIcon(job.user_subscription_tier)}
                            <span className="ml-1 capitalize">{job.user_subscription_tier}</span>
                          </Badge>
                          <span className="text-white text-sm">
                            {job.user_email === currentUser?.email ? '🟢 Your project' : job.user_email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${stage.color}`}>{stage.label}</span>
                          <span className="text-white font-bold">{job.progress}%</span>
                        </div>
                      </div>
                      <Progress value={job.progress} className="h-3 mb-2" />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Complexity: {job.complexity_score}/100</span>
                        <span>Est. {formatTime(job.estimated_render_time_seconds)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Queued Jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Waiting in Queue ({queuedJobs.length})
              </h4>
              <p className="text-xs text-gray-500">Sorted by AI priority</p>
            </div>

            {queuedJobs.length > 0 ? (
              <div className="space-y-2">
                {queuedJobs.slice(0, 10).map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-lg border ${
                      job.user_email === currentUser?.email
                        ? 'bg-[#00D4C9]/5 border-[#00D4C9]/30'
                        : 'bg-[#0B0B0C] border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#111317] border border-gray-700 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{idx + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getTierColor(job.user_subscription_tier)} text-xs`}>
                              {getTierIcon(job.user_subscription_tier)}
                              <span className="ml-1 capitalize">{job.user_subscription_tier}</span>
                            </Badge>
                            {job.boosted && (
                              <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Boosted
                              </Badge>
                            )}
                            <span className="text-gray-400 text-xs">
                              Priority: {job.priority_score}
                            </span>
                          </div>
                          <p className="text-white text-sm">
                            {job.user_email === currentUser?.email ? '🟢 Your project' : job.user_email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Wait Time</p>
                        <p className="text-white font-semibold">{formatTime(job.estimated_wait_time_seconds)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-800 text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Gauge className="w-3 h-3" />
                        Complexity: {job.complexity_score}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Timer className="w-3 h-3" />
                        Render: {formatTime(job.estimated_render_time_seconds)}
                      </div>
                      {job.complexity_factors?.language_count > 1 && (
                        <div className="flex items-center gap-1 text-[#9D4EDD]">
                          <span>🌍</span>
                          {job.complexity_factors.language_count} languages
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-sm">Queue is empty</p>
                <p className="text-xs mt-1">All renders are processing or complete</p>
              </div>
            )}
          </div>

          {/* Priority Explanation */}
          <div className="mt-6 p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FFD700]" />
              How AI Prioritizes Renders
            </h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h6 className="text-sm text-gray-400 mb-2">Subscription Tier Bonuses:</h6>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-400 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Enterprise
                    </span>
                    <span className="text-white font-semibold">+100 priority</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#FFD700] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Studio
                    </span>
                    <span className="text-white font-semibold">+75 priority</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Creator
                    </span>
                    <span className="text-white font-semibold">+50 priority</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Free
                    </span>
                    <span className="text-white font-semibold">+25 priority</span>
                  </div>
                </div>
              </div>
              <div>
                <h6 className="text-sm text-gray-400 mb-2">Additional Factors:</h6>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li>• Project complexity (higher = bonus)</li>
                  <li>• Time in queue (longer = bonus)</li>
                  <li>• Priority boost ($5 = +50 points)</li>
                  <li>• Fair usage balancing</li>
                </ul>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Recently Completed */}
      {completedJobs.length > 0 && (
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Recently Completed ({completedJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedJobs.map((job) => (
                <div key={job.id} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-all">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white text-sm">
                        {job.user_email === currentUser?.email ? 'Your project' : job.user_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Completed {new Date(job.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Render Time</p>
                      <p className="text-white font-semibold text-sm">
                        {formatTime(job.processing_time_seconds)}
                      </p>
                    </div>
                    {job.output_url && (
                      <Button size="sm" className="bg-[#1E90FF] text-white rounded-lg">
                        <Play className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backend Integration Documentation */}
      <Card className="bg-[#0B0B0C] border-[#FFD700]/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-[#FFD700] text-sm flex items-center gap-2">
            <Server className="w-4 h-4" />
            Backend Integration Points (Development Notes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-[#111317] rounded-lg">
            <p className="text-[#00D4C9] text-xs font-semibold mb-1">📡 API Endpoints Needed:</p>
            <code className="text-gray-300 text-xs block">
              POST /api/v1/avatar/render → Submit job<br/>
              GET /api/v1/jobs/:id → Get status<br/>
              POST /api/v1/jobs/:id/cancel → Cancel job<br/>
              POST /api/v1/jobs/:id/boost → Priority boost<br/>
              GET /api/v1/queue/status → Queue stats
            </code>
          </div>
          <div className="p-3 bg-[#111317] rounded-lg">
            <p className="text-[#00D4C9] text-xs font-semibold mb-1">🔌 WebSocket Events:</p>
            <code className="text-gray-300 text-xs block">
              queue-updated → Refresh queue display<br/>
              job-progress → Update progress bar<br/>
              job-completed → Show notification<br/>
              worker-status → Update worker count
            </code>
          </div>
          <div className="p-3 bg-[#111317] rounded-lg">
            <p className="text-[#00D4C9] text-xs font-semibold mb-1">🎬 Render Providers:</p>
            <code className="text-gray-300 text-xs block">
              HeyGen API → Avatar synthesis<br/>
              ElevenLabs API → Voice generation<br/>
              FFmpeg → Video assembly<br/>
              S3/R2 → CDN storage
            </code>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
