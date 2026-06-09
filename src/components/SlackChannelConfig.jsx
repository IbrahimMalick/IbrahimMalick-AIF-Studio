import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";

export default function SlackChannelConfig({ user }) {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [config, setConfig] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user's current Slack config
  const { data: userConfig } = useQuery({
    queryKey: ["slackConfig", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const results = await base44.entities.SlackIntegration.filter(
        { user_email: user.email },
        "-last_configured",
        1
      );
      return results?.[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (userConfig) {
      setConfig(userConfig);
      setSelectedChannel(userConfig.channel_id);
    }
  }, [userConfig]);

  // Fetch available Slack channels
  const { data: channels = [], isLoading: loadingChannels } = useQuery({
    queryKey: ["slackChannels"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getSlackChannels", {});
      return res.data?.channels || [];
    },
  });

  // Save channel selection
  const saveMutation = useMutation({
    mutationFn: async (channelId) => {
      const channel = channels.find(c => c.id === channelId);
      if (!channel) throw new Error("Channel not found");

      if (config) {
        // Update existing
        await base44.entities.SlackIntegration.update(config.id, {
          channel_id: channelId,
          channel_name: channel.name,
          last_configured: new Date().toISOString(),
        });
      } else {
        // Create new
        await base44.entities.SlackIntegration.create({
          user_email: user.email,
          channel_id: channelId,
          channel_name: channel.name,
          is_active: true,
          last_configured: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackConfig"] });
    },
  });

  return (
    <div className="bg-[#111317] border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-[#36C5F0]" />
        <h3 className="text-white font-bold text-sm">Slack Channel</h3>
      </div>

      {loadingChannels ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading Slack channels…</span>
        </div>
      ) : channels.length === 0 ? (
        <p className="text-gray-600 text-sm">No Slack channels found. Make sure the bot is invited to channels.</p>
      ) : (
        <div className="space-y-3">
          <select
            value={selectedChannel || ""}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a channel…</option>
            {channels.map(ch => (
              <option key={ch.id} value={ch.id}>
                #{ch.name} {ch.is_private ? "(private)" : ""}
              </option>
            ))}
          </select>

          {config && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Configured for #{config.channel_name}</span>
            </div>
          )}

          <Button
            onClick={() => selectedChannel && saveMutation.mutate(selectedChannel)}
            disabled={!selectedChannel || saveMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Channel"
            )}
          </Button>

          {saveMutation.isError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveMutation.error?.message || "Failed to save"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}