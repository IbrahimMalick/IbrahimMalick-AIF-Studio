import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  CheckCircle2,
  Globe,
  Mail,
  Share2,
  Link as LinkIcon,
  Copy,
  Loader2,
  ExternalLink
} from "lucide-react";

export default function LeadMagnetDeployment({ magnet, currentUser }) {
  const queryClient = useQueryClient();
  const [deployChannels, setDeployChannels] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const [config, setConfig] = useState({
    landing_page: {
      headline: magnet.magnet_name,
      subheadline: magnet.topic,
      cta_text: "Get Your Free Guide"
    },
    popup: {
      trigger: "exit_intent",
      delay_seconds: 5,
      scroll_percentage: 50
    },
    email: {
      provider: "mailchimp",
      list_id: "",
      tag: "lead_magnet_download",
      autoresponder: true
    },
    ghl: {
      workflow_id: "",
      tag_contacts: true
    },
    social: {
      platforms: ["instagram", "facebook", "linkedin"],
      post_now: false
    }
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      setIsDeploying(true);

      const updates = {
        deployment_channels: deployChannels,
        status: "published"
      };

      // Landing Page
      if (deployChannels.includes("landing_page")) {
        updates.landing_page_url = `https://app.aifreedomstudios.com/download/${magnet.id}`;
      }

      // Popup
      if (deployChannels.includes("popup")) {
        updates.popup_enabled = true;
        updates.popup_trigger = config.popup;
      }

      // Email Integration
      if (deployChannels.includes("email")) {
        updates.email_integration = {
          provider: config.email.provider,
          list_id: config.email.list_id,
          tag_on_download: config.email.tag,
          autoresponder_enabled: config.email.autoresponder
        };
      }

      // GHL
      if (deployChannels.includes("ghl")) {
        updates.ghl_integrated = true;
        updates.ghl_form_url = `https://app.gohighlevel.com/v2/location/forms/${config.ghl.workflow_id}`;
        updates.ghl_workflow_id = config.ghl.workflow_id;
      }

      // Social Media
      if (deployChannels.includes("social")) {
        const post = await base44.entities.ScheduledPost.create({
          user_email: currentUser.email,
          content_type: "image",
          content_url: magnet.cover_image_url || "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=800",
          thumbnail_url: magnet.cover_image_url,
          title: magnet.magnet_name,
          caption: `🎁 FREE ${magnet.magnet_type.toUpperCase()}: "${magnet.magnet_name}"\n\n✨ ${magnet.topic}\n\n📥 Download now! Link in bio`,
          hashtags: ["free", "download", "guide", magnet.magnet_type, ...magnet.keywords.slice(0, 5)],
          platforms: config.social.platforms,
          status: config.social.post_now ? "posting" : "scheduled",
          source_entity_type: "LeadMagnet",
          source_entity_id: magnet.id
        });

        updates.social_posts = [post.id];
      }

      await base44.entities.LeadMagnet.update(magnet.id, updates);

      setIsDeploying(false);
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leadMagnets"]);
      alert(`✅ Lead Magnet Deployed!

📍 Active Channels: ${deployChannels.join(', ')}

${deployChannels.includes("landing_page") ? '🔗 Landing Page: Created\n' : ''}${deployChannels.includes("popup") ? '💬 Popup: Activated\n' : ''}${deployChannels.includes("email") ? '📧 Email: Integrated\n' : ''}${deployChannels.includes("ghl") ? '🎯 GHL: Connected\n' : ''}${deployChannels.includes("social") ? '📱 Social: Posted\n' : ''}
Your lead magnet is now live!`);
    }
  });

  const channels = [
    { id: "landing_page", name: "Landing Page", icon: LinkIcon, color: "bg-blue-500" },
    { id: "popup", name: "Website Popup", icon: Globe, color: "bg-purple-500" },
    { id: "email", name: "Email Autoresponder", icon: Mail, color: "bg-green-500" },
    { id: "ghl", name: "GoHighLevel", icon: Zap, color: "bg-orange-500" },
    { id: "social", name: "Social Media", icon: Share2, color: "bg-pink-500" }
  ];

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#FFD700]" />
          Deploy Lead Magnet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Channel Selection */}
        <div>
          <h4 className="text-white font-semibold mb-3">Select Deployment Channels</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {channels.map(channel => {
              const Icon = channel.icon;
              const isSelected = deployChannels.includes(channel.id);
              
              return (
                <label
                  key={channel.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FFD700] bg-[#FFD700]/10'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDeployChannels([...deployChannels, channel.id]);
                      } else {
                        setDeployChannels(deployChannels.filter(c => c !== channel.id));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${channel.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{channel.name}</p>
                      {isSelected && (
                        <p className="text-green-400 text-xs">✓ Selected</p>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Channel-specific configs */}
        {deployChannels.map(channel => (
          <div key={channel} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <h5 className="text-white font-semibold mb-3 capitalize">{channel.replace('_', ' ')} Configuration</h5>
            
            {channel === "landing_page" && (
              <div className="space-y-3">
                <Input
                  value={config.landing_page.headline}
                  onChange={(e) => setConfig({...config, landing_page: {...config.landing_page, headline: e.target.value}})}
                  placeholder="Headline"
                  className="bg-[#111317] border-gray-700 text-white"
                />
                <Input
                  value={config.landing_page.subheadline}
                  onChange={(e) => setConfig({...config, landing_page: {...config.landing_page, subheadline: e.target.value}})}
                  placeholder="Subheadline"
                  className="bg-[#111317] border-gray-700 text-white"
                />
              </div>
            )}

            {channel === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Email Provider</label>
                  <select
                    value={config.email.provider}
                    onChange={(e) => setConfig({...config, email: {...config.email, provider: e.target.value}})}
                    className="w-full p-2 bg-[#111317] border border-gray-700 text-white rounded"
                  >
                    <option value="mailchimp">Mailchimp</option>
                    <option value="aweber">AWeber</option>
                    <option value="convertkit">ConvertKit</option>
                  </select>
                </div>
                <Input
                  value={config.email.list_id}
                  onChange={(e) => setConfig({...config, email: {...config.email, list_id: e.target.value}})}
                  placeholder="List ID"
                  className="bg-[#111317] border-gray-700 text-white"
                />
              </div>
            )}

            {channel === "ghl" && (
              <div className="space-y-3">
                <Input
                  value={config.ghl.workflow_id}
                  onChange={(e) => setConfig({...config, ghl: {...config.ghl, workflow_id: e.target.value}})}
                  placeholder="GHL Workflow ID"
                  className="bg-[#111317] border-gray-700 text-white"
                />
              </div>
            )}

          </div>
        ))}

        {/* Deploy Button */}
        <Button
          onClick={() => deployMutation.mutate()}
          disabled={isDeploying || deployChannels.length === 0}
          className="w-full bg-gradient-to-r from-[#06D6A0] to-[#00D4C9] text-black rounded-xl font-bold h-14"
        >
          {isDeploying ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Deploy to {deployChannels.length} Channel{deployChannels.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

      </CardContent>
    </Card>
  );
}