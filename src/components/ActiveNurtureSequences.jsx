
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Pause,
  Play,
  StopCircle,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function ActiveNurtureSequences({ leads }) {
  const queryClient = useQueryClient();

  const { data: sequences = [] } = useQuery({
    queryKey: ["nurtureSequences"],
    queryFn: async () => {
      const allSequences = await base44.entities.LeadNurtureSequence.list("-created_date", 100);
      return allSequences.filter(s => s.sequence_status === 'active');
    },
    refetchInterval: 30000,
    initialData: []
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["leadResponses"],
    queryFn: () => base44.entities.LeadResponse.list("-created_date", 100),
    refetchInterval: 60000,
    initialData: []
  });

  const pauseSequenceMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.LeadNurtureSequence.update(id, { 
      sequence_status: 'paused',
      auto_paused: true,
      pause_reason: 'Manual pause by admin'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurtureSequences"]);
      showToast("Sequence paused", "info");
    }
  });

  const resumeSequenceMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.LeadNurtureSequence.update(id, { 
      sequence_status: 'active',
      auto_paused: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurtureSequences"]);
      showToast("Sequence resumed ▶️", "success");
    }
  });

  const stopSequenceMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.LeadNurtureSequence.update(id, { 
      sequence_status: 'cancelled',
      exit_reason: 'manual_stop',
      completed_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["nurtureSequences"]);
      showToast("Sequence stopped", "info");
    }
  });

  const getLeadInfo = (leadId) => {
    return leads.find(l => l.id === leadId);
  };

  const getSequenceResponses = (sequenceId) => {
    // Sort responses by created_date descending to get the latest first
    return responses
      .filter(r => r.sequence_id === sequenceId)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  };

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Active Nurture Sequences
          </h3>
          <p className="text-gray-400 text-sm">AI-powered adaptive sequences with sentiment tracking</p>
        </div>
        <Badge className="bg-green-500/20 text-green-400">
          {sequences.length} Active
        </Badge>
      </div>

      {sequences.length === 0 ? (
        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No active nurture sequences</p>
            <p className="text-gray-500 text-sm mt-1">
              Sequences will appear here when leads enter nurture rules
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sequences.map((seq) => {
            const lead = getLeadInfo(seq.lead_id);
            const channelIcons = {
              sms: MessageSquare,
              email: Mail,
              call: Phone
            };
            const seqResponses = getSequenceResponses(seq.id);
            const lastResponse = seqResponses[0];

            return (
              <Card key={seq.id} className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-bold">{lead?.name || lead?.phone || 'Unknown Lead'}</p>
                        {lead?.score && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            Score: {lead.score}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {lead?.phone} • {lead?.email}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          Step {seq.current_touchpoint + 1} of {seq.total_touchpoints}
                        </Badge>
                        {seq.lead_responded && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            ✅ Responded
                          </Badge>
                        )}
                        {seq.callback_scheduled && (
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Callback Booked
                          </Badge>
                        )}
                      </div>

                      {/* NEW: Response Analysis */}
                      {lastResponse && (
                        <div className={`mt-3 p-3 rounded-lg border-2 ${
                          lastResponse.sentiment > 0.3 ? 'border-green-500/30 bg-green-500/10' :
                          lastResponse.sentiment < -0.3 ? 'border-red-500/30 bg-red-500/10' :
                          'border-yellow-500/30 bg-yellow-500/10'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className={`w-4 h-4 ${
                              lastResponse.sentiment > 0.3 ? 'text-green-400' :
                              lastResponse.sentiment < -0.3 ? 'text-red-400' :
                              'text-yellow-400'
                            }`} />
                            <p className={`text-sm font-semibold ${
                              lastResponse.sentiment > 0.3 ? 'text-green-400' :
                              lastResponse.sentiment < -0.3 ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              Latest Response: {lastResponse.sentiment_label}
                            </p>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              Intent: {lastResponse.intent}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-xs mb-2">"{lastResponse.response_text}"</p>
                          
                          {lastResponse.ai_analysis && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">Urgency</p>
                                <p className="text-white font-bold text-sm">{lastResponse.ai_analysis.urgency_score}/100</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">Buying Signals</p>
                                <p className="text-green-400 font-bold text-sm">{lastResponse.ai_analysis.buying_signals}/100</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">Engagement</p>
                                <p className="text-blue-400 font-bold text-sm">{lastResponse.ai_analysis.engagement_level}</p>
                              </div>
                            </div>
                          )}

                          {lastResponse.ai_analysis?.next_best_action && (
                            <div className="mt-2 p-2 bg-[#111317] rounded border-l-2 border-purple-500">
                              <p className="text-purple-400 text-xs font-semibold">AI Recommendation:</p>
                              <p className="text-gray-300 text-xs">{lastResponse.ai_analysis.next_best_action}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {seq.sequence_status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pauseSequenceMutation.mutate({ id: seq.id })}
                          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resumeSequenceMutation.mutate({ id: seq.id })}
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Stop this nurture sequence?')) {
                            stopSequenceMutation.mutate({ id: seq.id });
                          }
                        }}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <StopCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Sequence Progress</span>
                      <span className="text-gray-300">{seq.progress_percentage || 0}%</span>
                    </div>
                    <Progress value={seq.progress_percentage || 0} className="h-2" />
                  </div>

                  {/* Touchpoints */}
                  <div className="flex gap-2 mb-3">
                    {seq.touchpoints_completed?.map((touch, idx) => {
                      const Icon = channelIcons[touch.channel] || MessageSquare;
                      return (
                        <div
                          key={idx}
                          className={`w-8 h-8 rounded flex items-center justify-center ${
                            touch.delivered ? 'bg-green-500/20' : 'bg-gray-800'
                          }`}
                          title={`${touch.channel} - ${touch.sent_at ? 'Sent' : 'Pending'}`}
                        >
                          <Icon className={`w-4 h-4 ${
                            touch.delivered ? 'text-green-400' : 'text-gray-500'
                          }`} />
                          {touch.replied && (
                            <CheckCircle2 className="w-3 h-3 text-green-400 absolute -top-1 -right-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Next Touchpoint */}
                  {seq.next_touchpoint_scheduled && (
                    <div className="p-2 bg-[#0B0B0C] rounded border-l-2 border-blue-500">
                      <p className="text-blue-400 text-xs font-semibold mb-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Next Message
                      </p>
                      <p className="text-gray-300 text-xs">
                        {new Date(seq.next_touchpoint_scheduled).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Engagement */}
                  {seq.engagement_score > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-semibold">
                        Engagement: {seq.engagement_score}/100
                      </span>
                    </div>
                  )}

                  {/* NEW: Response History */}
                  {seqResponses.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                        View Response History ({seqResponses.length})
                      </summary>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2"> {/* Added custom-scrollbar and pr-2 for better display */}
                        {seqResponses.map((resp, idx) => (
                          <div key={resp.id} className="p-2 bg-[#0B0B0C] rounded text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${
                                resp.sentiment > 0.3 ? 'bg-green-500/20 text-green-400' :
                                resp.sentiment < -0.3 ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              } text-xs`}>
                                {resp.sentiment_label}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                Intent: {resp.intent}
                              </Badge>
                              <span className="text-gray-500">
                                {new Date(resp.created_date).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-300">"{resp.response_text}"</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
