import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  Download,
  PlayCircle,
  User,
  Bot,
  Clock,
  CheckCircle2,
  Phone
} from "lucide-react";

export default function TranscriptViewer({ calls }) {
  const [searchQuery, setSearchQuery] = useState("");

  const callsWithTranscripts = calls.filter(c => c.transcript);

  const filteredCalls = callsWithTranscripts.filter(call => 
    call.transcript?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.from_number?.includes(searchQuery) ||
    call.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadTranscript = (call) => {
    const content = `CALL TRANSCRIPT
ID: ${call.id}
From: ${call.from_number}
Date: ${new Date(call.created_date).toLocaleString()}
Duration: ${call.duration_seconds}s
Intent: ${call.intent || 'Unknown'}
Disposition: ${call.disposition || 'Unknown'}

SUMMARY:
${call.summary || 'No summary available'}

TRANSCRIPT:
${call.transcript}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${call.call_sid}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Search */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcripts, phone numbers, summaries..."
              className="pl-10 bg-[#0B0B0C] border-gray-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transcripts List */}
      {filteredCalls.length === 0 ? (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">
              {searchQuery ? 'No matching transcripts found' : 'No transcripts yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCalls.map((call) => (
            <Card key={call.id} className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-blue-400" />
                      <p className="text-white font-bold">{call.from_number}</p>
                      {call.entities_extracted?.name && (
                        <span className="text-gray-400">• {call.entities_extracted.name}</span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(call.created_date).toLocaleString()}
                      </Badge>
                      {call.duration_seconds && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          {Math.floor(call.duration_seconds / 60)}:{(call.duration_seconds % 60).toString().padStart(2, '0')}
                        </Badge>
                      )}
                      {call.intent && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                          {call.intent.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      {call.disposition && (
                        <Badge className={`text-xs ${
                          call.disposition === 'booked' || call.disposition === 'qualified' ? 'bg-green-500/20 text-green-400' :
                          call.disposition === 'spam' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {call.disposition}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {call.recording_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(call.recording_url, '_blank')}
                        className="border-gray-700 text-white hover:bg-gray-800"
                      >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadTranscript(call)}
                      className="border-gray-700 text-white hover:bg-gray-800"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Summary */}
                {call.summary && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-xs font-semibold mb-1">📝 SUMMARY</p>
                    <p className="text-gray-300 text-sm">{call.summary}</p>
                  </div>
                )}

                {/* Next Best Action */}
                {call.next_best_action && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-xs font-semibold mb-1">✅ NEXT ACTION</p>
                    <p className="text-gray-300 text-sm">{call.next_best_action}</p>
                  </div>
                )}

                {/* Extracted Entities */}
                {call.entities_extracted && Object.keys(call.entities_extracted).length > 0 && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-400 text-xs font-semibold mb-2">🔍 EXTRACTED INFO</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {Object.entries(call.entities_extracted).map(([key, value]) => value && (
                        <div key={key} className="text-sm">
                          <span className="text-gray-500 capitalize">{key}:</span>{' '}
                          <span className="text-gray-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Transcript */}
                <details className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <summary className="text-white font-semibold cursor-pointer hover:text-[#00D4C9]">
                    View Full Transcript
                  </summary>
                  <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                    {call.ai_turns && call.ai_turns.length > 0 ? (
                      call.ai_turns.map((turn, idx) => (
                        <div key={idx} className="flex gap-2">
                          {turn.speaker === 'caller' ? (
                            <User className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                          ) : (
                            <Bot className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm ${
                              turn.speaker === 'caller' ? 'text-blue-400' : 'text-green-400'
                            } font-semibold mb-1`}>
                              {turn.speaker === 'caller' ? 'Caller' : 'AI Receptionist'}
                            </p>
                            <p className="text-gray-300 text-sm">{turn.text}</p>
                            {turn.confidence && (
                              <p className="text-gray-500 text-xs mt-1">
                                Confidence: {Math.round(turn.confidence * 100)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">{call.transcript}</p>
                    )}
                  </div>
                </details>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}