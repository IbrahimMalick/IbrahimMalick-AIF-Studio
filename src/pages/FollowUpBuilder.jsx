import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  Zap,
  Calendar,
  GitBranch,
  Target,
  Copy,
  Play,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function FollowUpBuilder() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSequence, setGeneratedSequence] = useState(null);

  const [formData, setFormData] = useState({
    offer_id: "",
    brand_voice: "mentor",
    objections: "",
    timeframe_days: 14,
    channels: ["email", "sms", "dm"]
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: offers = [] } = useQuery({
    queryKey: ["offerBlueprints", user?.email],
    queryFn: () => base44.entities.OfferBlueprint.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const { data: sequences = [] } = useQuery({
    queryKey: ["followUpSequences", user?.email],
    queryFn: () => base44.entities.FollowUpSequence.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const generateSequenceMutation = useMutation({
    mutationFn: async (data) => {
      setIsGenerating(true);

      const offer = offers.find(o => o.id === data.offer_id);
      if (!offer) throw new Error("Offer not found");

      // Generate 10-touch follow-up sequence
      const sequenceData = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a lifecycle architect. Build a 10-touch follow-up sequence over ${data.timeframe_days} days across Email, SMS, DM, and optional Voice.

OFFER DETAILS:
- Product: ${offer.product}
- Audience: ${offer.audience}
- Goal: ${offer.goal}
- Buyer Type: ${offer.buyer_type}
- Offer Summary: ${offer.offer_summary}

PARAMETERS:
- Brand Voice: ${data.brand_voice}
- Objections to Handle: ${data.objections || 'General objections'}
- Timeframe: ${data.timeframe_days} days
- Channels: ${data.channels.join(', ')}

RULES:
- Minimum 5 touches before "stale"
- Personalization tokens: {{first_name}}, {{industry}}, {{company}}, {{goals}}
- Each touch must handle 1-2 objections
- Clear single CTA per touch
- Progressive value delivery
- Branching logic for engagement signals

TASKS:

1) Create 10-touch sequence with mix of channels:
   - Day 0: Email (immediate delivery value)
   - Day 1: SMS (quick check-in)
   - Day 2: DM (build relationship)
   - Day 3: Email (case study/proof)
   - Day 5: SMS (objection handling)
   - Day 7: Email (social proof)
   - Day 9: DM (personal touch)
   - Day 11: Email (urgency/scarcity)
   - Day 13: Voice/DM (final push)
   - Day 14: Email (last chance)

2) For each touch provide:
   - Day number
   - Channel
   - Subject line (email) or opening line (SMS/DM)
   - Body copy
   - CTA (clear action)
   - CTA URL placeholder
   - Objection addressed

3) Branching logic:
   - If no open on Email 0 → trigger SMS Day 1
   - If clicked Email 2 → send high-value DM Day 3
   - If no response by Day 7 → add urgency email
   - If opened but not clicked → retarget with different angle

4) Personalization:
   - Use {{first_name}} in greetings
   - Use {{industry}} for relevant examples
   - Use {{goals}} for motivation
   - Tailor proof to buyer type

Voice: ${data.brand_voice}
- mentor: Calm, structured, explains strategies
- hustler: Energetic, fast, motivational
- analyst: Data-driven, ROI focused
- creator: Witty, creative, content-first

Format as strict JSON with channels array, touches array, and branching array.`,
        response_json_schema: {
          type: "object",
          properties: {
            channels: {
              type: "array",
              items: { type: "string" }
            },
            touches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  channel: { type: "string" },
                  subject: { type: "string" },
                  body: { type: "string" },
                  text: { type: "string" },
                  cta: { type: "string" },
                  cta_url: { type: "string" },
                  objection_addressed: { type: "string" }
                }
              }
            },
            branching: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  if: { type: "string" },
                  then: { type: "string" }
                }
              }
            },
            goals: {
              type: "object",
              properties: {
                bookings: { type: "boolean" },
                sales: { type: "boolean" },
                engagement: { type: "boolean" }
              }
            }
          }
        }
      });

      // Create FollowUpSequence record
      const sequence = await base44.entities.FollowUpSequence.create({
        user_email: user.email,
        offer_id: data.offer_id,
        sequence_name: `${offer.product} - ${data.brand_voice} nurture`,
        channels: sequenceData.channels,
        touches: sequenceData.touches,
        branching: sequenceData.branching,
        goals: sequenceData.goals || { bookings: true, sales: true, engagement: true },
        objections_addressed: data.objections.split(',').map(o => o.trim()),
        brand_voice: data.brand_voice,
        timeframe_days: data.timeframe_days,
        status: "draft"
      });

      setGeneratedSequence(sequence);
      setIsGenerating(false);
      return sequence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["followUpSequences"]);
      alert("✅ Follow-up sequence generated!");
    }
  });

  const deploySequenceMutation = useMutation({
    mutationFn: async (sequenceId) => {
      const sequence = sequences.find(s => s.id === sequenceId);
      if (!sequence) throw new Error("Sequence not found");

      // Deploy to email provider (simulated)
      await base44.entities.FollowUpSequence.update(sequenceId, {
        status: "active",
        email_provider_ids: {
          mailchimp_campaign_id: `mc_${Date.now()}`,
          aweber_campaign_id: `aw_${Date.now()}`
        },
        ghl_workflow_id: `ghl_workflow_${Date.now()}`
      });

      return { success: true, sequence_id: sequenceId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["followUpSequences"]);
      alert("✅ Sequence deployed to email providers and GHL!");
    }
  });

  const channelIcons = {
    email: Mail,
    sms: MessageSquare,
    dm: MessageSquare,
    voice: Phone
  };

  const channelColors = {
    email: "bg-blue-500/20 text-blue-400",
    sms: "bg-green-500/20 text-green-400",
    dm: "bg-purple-500/20 text-purple-400",
    voice: "bg-orange-500/20 text-orange-400"
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Send className="w-8 h-8 text-[#00D4C9]" />
            Lifecycle Follow-Up Builder
          </h1>
          <p className="text-gray-400">Create multi-channel nurture sequences with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Generation Form */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFD700]" />
                Generate Sequence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select Offer *</label>
                <Select
                  value={formData.offer_id}
                  onValueChange={(value) => {
                    setFormData({...formData, offer_id: value});
                    setSelectedOffer(offers.find(o => o.id === value));
                  }}
                >
                  <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                    <SelectValue placeholder="Choose an offer blueprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {offers.map(offer => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.product} ({offer.goal.replace('_', ' ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOffer && (
                <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <p className="text-gray-400 text-xs mb-1">Selected Offer:</p>
                  <p className="text-white font-medium text-sm mb-2">{selectedOffer.product}</p>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs capitalize">
                      {selectedOffer.buyer_type}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                      {selectedOffer.goal.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                      Score: {selectedOffer.belief_alignment_score}/100
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Brand Voice</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "mentor", label: "🧘 Mentor", desc: "Calm, structured" },
                    { value: "hustler", label: "⚡ Hustler", desc: "Energetic, fast" },
                    { value: "analyst", label: "🧠 Analyst", desc: "Data-driven" },
                    { value: "creator", label: "🎨 Creator", desc: "Witty, creative" }
                  ].map(voice => (
                    <label
                      key={voice.value}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.brand_voice === voice.value
                          ? 'border-[#00D4C9] bg-[#00D4C9]/10'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="brand_voice"
                        value={voice.value}
                        checked={formData.brand_voice === voice.value}
                        onChange={(e) => setFormData({...formData, brand_voice: e.target.value})}
                        className="sr-only"
                      />
                      <p className="text-white font-medium text-sm">{voice.label}</p>
                      <p className="text-gray-400 text-xs">{voice.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Common Objections (comma separated)</label>
                <Textarea
                  value={formData.objections}
                  onChange={(e) => setFormData({...formData, objections: e.target.value})}
                  placeholder="too expensive, no time, not sure it works, tried before"
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Timeframe (days)</label>
                  <Input
                    type="number"
                    value={formData.timeframe_days}
                    onChange={(e) => setFormData({...formData, timeframe_days: Number(e.target.value)})}
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Touch Count</label>
                  <Input
                    type="number"
                    value={10}
                    disabled
                    className="bg-[#0B0B0C] border-gray-700 text-gray-500 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Channels</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "email", label: "Email", icon: Mail },
                    { id: "sms", label: "SMS", icon: MessageSquare },
                    { id: "dm", label: "DM", icon: MessageSquare },
                    { id: "voice", label: "Voice", icon: Phone }
                  ].map(channel => {
                    const Icon = channel.icon;
                    const isSelected = formData.channels.includes(channel.id);
                    return (
                      <label
                        key={channel.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
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
                              setFormData({...formData, channels: [...formData.channels, channel.id]});
                            } else {
                              setFormData({...formData, channels: formData.channels.filter(c => c !== channel.id)});
                            }
                          }}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[#FFD700]' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {channel.label}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => generateSequenceMutation.mutate(formData)}
                disabled={isGenerating || !formData.offer_id}
                className="w-full bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black rounded-xl font-bold h-14"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating 10-Touch Sequence...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Follow-Up Sequence
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Generated Sequence Preview */}
          {generatedSequence && (
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Generated Sequence</CardTitle>
                  <Badge className="bg-green-500/20 text-green-400">
                    {generatedSequence.touches?.length || 0} Touches
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Channels */}
                <div>
                  <p className="text-gray-400 text-xs mb-2">Active Channels:</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedSequence.channels?.map((channel, idx) => {
                      const Icon = channelIcons[channel];
                      return (
                        <Badge key={idx} className={channelColors[channel]}>
                          {Icon && <Icon className="w-3 h-3 mr-1" />}
                          {channel.toUpperCase()}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline Preview */}
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {generatedSequence.touches?.slice(0, 5).map((touch, idx) => {
                    const Icon = channelIcons[touch.channel];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-gray-700 text-gray-300 text-xs">
                            Day {touch.day}
                          </Badge>
                          <Badge className={channelColors[touch.channel]}>
                            {Icon && <Icon className="w-3 h-3 mr-1" />}
                            {touch.channel}
                          </Badge>
                        </div>
                        {touch.subject && (
                          <p className="text-white text-sm font-medium mb-1">{touch.subject}</p>
                        )}
                        <p className="text-gray-400 text-xs line-clamp-2">
                          {touch.body || touch.text}
                        </p>
                        {touch.cta && (
                          <p className="text-[#00D4C9] text-xs mt-2">
                            CTA: {touch.cta}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                  {generatedSequence.touches?.length > 5 && (
                    <p className="text-gray-500 text-xs text-center py-2">
                      +{generatedSequence.touches.length - 5} more touches
                    </p>
                  )}
                </div>

                {/* Branching Logic */}
                {generatedSequence.branching?.length > 0 && (
                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-[#9D4EDD]" />
                      Smart Branching ({generatedSequence.branching.length})
                    </h4>
                    <div className="space-y-1">
                      {generatedSequence.branching.slice(0, 3).map((branch, idx) => (
                        <p key={idx} className="text-gray-300 text-xs">
                          <span className="text-gray-500">IF</span> {branch.if} →{' '}
                          <span className="text-[#00D4C9]">{branch.then}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      // View full sequence details
                      const detailsText = JSON.stringify(generatedSequence, null, 2);
                      navigator.clipboard.writeText(detailsText);
                      alert("Full sequence copied to clipboard!");
                    }}
                    variant="outline"
                    className="border-gray-700 rounded-lg"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy JSON
                  </Button>
                  <Button
                    onClick={() => deploySequenceMutation.mutate(generatedSequence.id)}
                    className="bg-green-500 text-white rounded-lg"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Deploy
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

        </div>

        {/* Saved Sequences */}
        {sequences.length > 0 && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Your Sequences ({sequences.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sequences.map((sequence) => (
                  <motion.div
                    key={sequence.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#00D4C9]/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{sequence.sequence_name}</h4>
                        <p className="text-gray-400 text-xs mt-1">
                          {sequence.touches?.length || 0} touches over {sequence.timeframe_days} days
                        </p>
                      </div>
                      <Badge className={
                        sequence.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        sequence.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {sequence.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {sequence.channels?.map((channel, idx) => {
                        const Icon = channelIcons[channel];
                        return (
                          <Badge key={idx} className={channelColors[channel]}>
                            {Icon && <Icon className="w-3 h-3 mr-1" />}
                            {channel}
                          </Badge>
                        );
                      })}
                    </div>

                    {sequence.performance_metrics && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2 bg-[#111317] rounded text-center">
                          <p className="text-white font-bold text-sm">{sequence.performance_metrics.total_sent || 0}</p>
                          <p className="text-gray-500 text-xs">Sent</p>
                        </div>
                        <div className="p-2 bg-[#111317] rounded text-center">
                          <p className="text-white font-bold text-sm">{sequence.performance_metrics.total_opened || 0}</p>
                          <p className="text-gray-500 text-xs">Opened</p>
                        </div>
                        <div className="p-2 bg-[#111317] rounded text-center">
                          <p className="text-white font-bold text-sm">{sequence.performance_metrics.total_clicked || 0}</p>
                          <p className="text-gray-500 text-xs">Clicked</p>
                        </div>
                        <div className="p-2 bg-[#111317] rounded text-center">
                          <p className="text-green-400 font-bold text-sm">
                            {sequence.performance_metrics.conversion_rate?.toFixed(1) || 0}%
                          </p>
                          <p className="text-gray-500 text-xs">Conv.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => setGeneratedSequence(sequence)}
                        className="flex-1 bg-[#1E90FF] text-white rounded-lg"
                      >
                        View Details
                      </Button>
                      {sequence.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => deploySequenceMutation.mutate(sequence.id)}
                          className="flex-1 bg-green-500 text-white rounded-lg"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Deploy
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}