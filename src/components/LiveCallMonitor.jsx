import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  PhoneIncoming,
  PhoneOff,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Mail,
  PlayCircle,
  DollarSign,
  TrendingDown
} from "lucide-react";

const API_BASE = "http://localhost:8787/api";

export default function LiveCallMonitor({ calls, allCalls }) {
  const queryClient = base44.queryClient || { invalidateQueries: () => {} };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntentIcon = (intent) => {
    const icons = {
      schedule_meeting: Calendar,
      qualify_lead: User,
      faq_answer: MessageSquare,
      take_message: Mail,
      escalate_to_human: AlertTriangle,
      pricing_inquiry: DollarSign,
      demo_request: PlayCircle,
      ready_to_buy: CheckCircle2,
      price_concern: TrendingDown
    };
    return icons[intent] || Phone;
  };

  // Auto-sync completed calls to GHL
  React.useEffect(() => {
    const syncCompletedCalls = async () => {
      const completedCalls = allCalls.filter(c => 
        c.status === 'completed' && 
        !c.ghl_synced &&
        c.intent
      );

      for (const call of completedCalls.slice(0, 5)) {
        try {
          // Trigger GHL sync via webhook simulation
          await fetch(`${API_BASE}/receptionist/sync-call-to-ghl`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              call_id: call.id,
              call_sid: call.call_sid,
              from: call.from_number,
              intent: call.intent,
              summary: call.summary,
              sentiment: call.sentiment,
              entities: call.entities_extracted,
              disposition: call.disposition
            })
          });

          // Mark as synced
          await base44.entities.CallSession.update(call.id, {
            ghl_synced: true
          });

          console.log(`✅ Call ${call.id} synced to GHL`);
        } catch (error) {
          console.error(`Error syncing call ${call.id}:`, error);
        }
      }
    };

    // Run every 30 seconds
    const interval = setInterval(syncCompletedCalls, 30000);
    syncCompletedCalls(); // Run immediately

    return () => clearInterval(interval);
  }, [allCalls]);

  return (
    <div className="space-y-6">
      
      {/* Live Calls */}
      <Card className="bg-[#111317] border-green-500/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PhoneIncoming className="w-5 h-5 text-green-400" />
            Live Calls ({calls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">No active calls</p>
              <p className="text-gray-500 text-sm mt-1">Calls will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => {
                const IntentIcon = getIntentIcon(call.intent);
                const callDuration = call.duration_seconds || 
                  Math.floor((new Date() - new Date(call.created_date)) / 1000);
                
                return (
                  <div key={call.id} className="p-4 bg-[#0B0B0C] rounded-xl border-2 border-green-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                          <PhoneIncoming className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold mb-1">{call.from_number}</p>
                          <div className="flex gap-2 flex-wrap mb-2">
                            <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">
                              {call.status === 'ringing' ? 'RINGING' : 'IN PROGRESS'}
                            </Badge>
                            {call.intent && (
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                <IntentIcon className="w-3 h-3 mr-1" />
                                {call.intent.replace(/_/g, ' ')}
                              </Badge>
                            )}
                            {call.sentiment !== undefined && (
                              <Badge className={`text-xs ${
                                call.sentiment > 0.3 ? 'bg-green-500/20 text-green-400' :
                                call.sentiment < -0.3 ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {call.sentiment > 0.3 ? '😊 Positive' :
                                 call.sentiment < -0.3 ? '😞 Negative' :
                                 '😐 Neutral'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(callDuration)}</span>
                            <span className="text-gray-600">•</span>
                            <span>{new Date(call.created_date).toLocaleTimeString()}</span>
                          </div>
                          {call.entities_extracted?.name && (
                            <p className="text-gray-400 text-sm mt-2">
                              <User className="w-3 h-3 inline mr-1" />
                              {call.entities_extracted.name}
                              {call.entities_extracted.company && ` • ${call.entities_extracted.company}`}
                            </p>
                          )}
                        </div>
                      </div>
                      {call.escalated && (
                        <Badge className="bg-red-500/20 text-red-400">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Escalated
                        </Badge>
                      )}
                    </div>

                    {/* Live Transcript */}
                    {call.ai_turns && call.ai_turns.length > 0 && (
                      <div className="mt-4 p-3 bg-[#111317] rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-gray-500 text-xs mb-2">LIVE TRANSCRIPT:</p>
                        <div className="space-y-2">
                          {call.ai_turns.slice(-5).map((turn, idx) => (
                            <p key={idx} className={`text-sm ${
                              turn.speaker === 'caller' ? 'text-blue-400' : 'text-green-400'
                            }`}>
                              <span className="font-semibold">{turn.speaker}:</span> {turn.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completed Calls */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Recent Completed Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {allCalls.filter(c => c.status === 'completed').slice(0, 10).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No completed calls yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allCalls.filter(c => c.status === 'completed').slice(0, 10).map((call) => (
                <div key={call.id} className="p-3 bg-[#0B0B0C] rounded-lg flex items-center justify-between hover:bg-[#151515] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      call.disposition === 'booked' ? 'bg-green-500/20' :
                      call.disposition === 'qualified' ? 'bg-yellow-500/20' :
                      call.disposition === 'spam' ? 'bg-red-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      {call.disposition === 'booked' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                       call.disposition === 'qualified' ? <User className="w-4 h-4 text-yellow-400" /> :
                       call.disposition === 'spam' ? <PhoneOff className="w-4 h-4 text-red-400" /> :
                       <Phone className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{call.from_number}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(call.created_date).toLocaleString()} • {formatDuration(call.duration_seconds || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {call.disposition && (
                      <Badge className={`text-xs ${
                        call.disposition === 'booked' ? 'bg-green-500/20 text-green-400' :
                        call.disposition === 'qualified' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {call.disposition}
                      </Badge>
                    )}
                    {call.recording_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(call.recording_url, '_blank')}
                        className="border-gray-700 text-gray-400 hover:bg-gray-800"
                      >
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}