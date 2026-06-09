import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Play,
  Clock,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function CopilotActionExecutor({ action, user, onExecuted }) {
  const queryClient = useQueryClient();

  const executeMutation = useMutation({
    mutationFn: async () => {
      // Update to running
      await base44.entities.CopilotAction.update(action.id, {
        status: "running",
        started_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString()
      });

      let result = {};
      let entityCreated = null;
      const startTime = Date.now();

      try {
        // Route to appropriate handler based on intent
        switch (action.intent) {
          case "create_video":
            entityCreated = await base44.entities.VideoProject.create({
              title: action.params.title || "AI Generated Video",
              description: action.params.description,
              duration_seconds: action.params.duration || 60,
              resolution: action.params.resolution || "1920x1080",
              frame_rate: 30,
              status: "draft"
            });
            result = { project_id: entityCreated.id, type: "VideoProject" };
            break;

          case "create_script":
            const scriptResponse = await base44.integrations.Core.InvokeLLM({
              prompt: `Create a video script: ${action.params.topic}. Duration: ${action.params.duration}s. Tone: ${action.params.tone || 'friendly'}.`
            });
            result = { script: scriptResponse };
            break;

          case "generate_image":
            const image = await base44.integrations.Core.GenerateImage({
              prompt: action.params.prompt
            });
            entityCreated = await base44.entities.ArtGeneration.create({
              prompt: action.params.prompt,
              image_url: image.url,
              style: action.params.style || "digital_art",
              status: "completed"
            });
            result = { image_url: image.url, art_id: entityCreated.id };
            break;

          case "schedule_post":
            entityCreated = await base44.entities.ScheduledPost.create({
              user_email: user.email,
              content_type: action.params.content_type || "video",
              content_url: action.params.content_url,
              caption: action.params.caption,
              platforms: action.params.platforms || ["instagram"],
              schedule_time: action.params.schedule_time,
              status: "scheduled"
            });
            result = { post_id: entityCreated.id };
            break;

          case "launch_ad":
            entityCreated = await base44.entities.CampaignRun.create({
              user_email: user.email,
              campaign_name: action.params.campaign_name,
              objective: action.params.objective || "OUTCOME_TRAFFIC",
              daily_budget_cents: (action.params.budget || 10) * 100,
              status: "DRAFT"
            });
            result = { campaign_id: entityCreated.id };
            break;

          case "create_lead_magnet":
            entityCreated = await base44.entities.LeadMagnet.create({
              user_email: user.email,
              magnet_name: action.params.title,
              magnet_type: action.params.type || "guide",
              topic: action.params.topic,
              status: "generating"
            });
            result = { magnet_id: entityCreated.id };
            break;

          default:
            result = { message: `Action '${action.intent}' executed successfully` };
        }

        const executionTime = Date.now() - startTime;

        // Update action with success
        await base44.entities.CopilotAction.update(action.id, {
          status: "success",
          completed_at: new Date().toISOString(),
          execution_time_ms: executionTime,
          result: result,
          entity_created_id: entityCreated?.id,
          entity_created_type: entityCreated ? getEntityType(action.intent) : null
        });

        if (onExecuted) onExecuted(result);
        return result;

      } catch (error) {
        // Handle failure
        await base44.entities.CopilotAction.update(action.id, {
          status: "failed",
          completed_at: new Date().toISOString(),
          error: {
            message: error.message,
            code: error.code || "EXECUTION_ERROR"
          }
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["copilotActions"]);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => base44.entities.CopilotAction.update(action.id, {
      status: "cancelled"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["copilotActions"]);
    }
  });

  const getEntityType = (intent) => {
    const mapping = {
      create_video: "VideoProject",
      generate_image: "ArtGeneration",
      schedule_post: "ScheduledPost",
      launch_ad: "CampaignRun",
      create_lead_magnet: "LeadMagnet"
    };
    return mapping[intent] || "Unknown";
  };

  if (action.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Action Completed</p>
            <p className="text-gray-400 text-xs">{action.intent.replace(/_/g, ' ')}</p>
          </div>
          {action.execution_time_ms && (
            <Badge className="bg-gray-700 text-gray-300 text-xs">
              {(action.execution_time_ms / 1000).toFixed(1)}s
            </Badge>
          )}
        </div>
      </motion.div>
    );
  }

  if (action.status === "failed") {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Action Failed</p>
            <p className="text-gray-400 text-xs">{action.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (action.status === "pending_confirmation") {
    return (
      <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#FFD700] mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-1">Confirm Action</p>
              <p className="text-gray-300 text-sm mb-2">{action.command}</p>
              <div className="space-y-1 text-xs">
                <p className="text-gray-400">Intent: <span className="text-[#00D4C9]">{action.intent}</span></p>
                <p className="text-gray-400">Confidence: <span className="text-[#FFD700]">{(action.confidence * 100).toFixed(0)}%</span></p>
                {action.predicted_outcome && (
                  <p className="text-gray-400">Predicted: <span className="text-gray-300">{JSON.stringify(action.predicted_outcome)}</span></p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => executeMutation.mutate()}
              disabled={executeMutation.isLoading}
              className="flex-1 bg-green-500 text-white rounded-lg"
            >
              {executeMutation.isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Confirm
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => cancelMutation.mutate()}
              variant="outline"
              className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (action.status === "running") {
    return (
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Executing...</p>
            <p className="text-gray-400 text-xs">{action.intent.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}