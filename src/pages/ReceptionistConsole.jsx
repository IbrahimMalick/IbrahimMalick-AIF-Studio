import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  User,
  MessageSquare,
  Calendar,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Download,
  TrendingUp
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import LiveCallMonitor from "@/components/LiveCallMonitor";
import TranscriptViewer from "@/components/TranscriptViewer";
import LeadQualificationPanel from "@/components/LeadQualificationPanel";
import ReceptionistSettings from "@/components/ReceptionistSettings";
import ProactiveNurtureEngine from "@/components/ProactiveNurtureEngine";
import LeadResponseTracker from "@/components/LeadResponseTracker";

import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const API_BASE = "http://localhost:8787/api";

export default function ReceptionistConsole() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("live");
  const [showSettings, setShowSettings] = useState(false); // Added showSettings state
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Live calls (poll every 5s)
  const { data: liveCalls = [] } = useQuery({
    queryKey: ["liveCalls"],
    queryFn: async () => {
      const sessions = await base44.entities.CallSession.filter({
        status: { $in: ["ringing", "in_progress"] }
      }, "-created_date", 50);
      return sessions;
    },
    refetchInterval: 5000,
    initialData: []
  });

  // Recent calls (last 24h)
  const { data: recentCalls = [] } = useQuery({
    queryKey: ["recentCalls"],
    queryFn: async () => {
      const sessions = await base44.entities.CallSession.list("-created_date", 100);
      const last24h = sessions.filter(s => {
        const createdDate = new Date(s.created_date);
        const now = new Date();
        return (now - createdDate) < 24 * 60 * 60 * 1000;
      });
      return last24h;
    },
    refetchInterval: 10000,
    initialData: []
  });

  // Leads
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 100),
    initialData: []
  });

  // Appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.list("-start_time", 50),
    initialData: []
  });

  // Stats
  const stats = {
    totalCalls: recentCalls.length,
    activeCalls: liveCalls.length,
    bookings: recentCalls.filter(c => c.disposition === "booked").length,
    qualified: leads.filter(l => l.score >= 70).length,
    avgDuration: recentCalls.length > 0
      ? Math.round(recentCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / recentCalls.length)
      : 0,
    avgScore: leads.length > 0
      ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)
      : 0
  };

  if (!user) return <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin"></div></div>;

  return (
    <PermissionGate
      user={user}
      minimumRole="admin"
      showLockMessage={true}
      lockMessage="Only administrators can access the receptionist console"
    >
      {/* Background engines */}
      {user && <ProactiveNurtureEngine user={user} />}
      {user && <LeadResponseTracker user={user} />}

      <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Phone className="w-8 h-8 text-[#FFD700]" />
                AI Receptionist Console
              </h1>
              <p className="text-gray-400">24/7 intelligent call handling + lead nurture automation</p>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl('ReceptionistAnalytics')}>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics & Reports
                </Button>
              </Link>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-6 gap-4">
            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <Phone className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalCalls}</p>
                <p className="text-gray-500 text-xs">Calls (24h)</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <PhoneIncoming className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.activeCalls}</p>
                <p className="text-gray-500 text-xs">Live Now</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <Calendar className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.bookings}</p>
                <p className="text-gray-500 text-xs">Booked</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <CheckCircle2 className="w-5 h-5 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.qualified}</p>
                <p className="text-gray-500 text-xs">Qualified</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <Clock className="w-5 h-5 text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.avgDuration}s</p>
                <p className="text-gray-500 text-xs">Avg Duration</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4">
                <TrendingUp className="w-5 h-5 text-teal-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.avgScore}</p>
                <p className="text-gray-500 text-xs">Avg Score</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#111317] rounded-xl">
              <TabsTrigger value="live">
                <PhoneIncoming className="w-4 h-4 mr-2" />
                Live Calls
              </TabsTrigger>
              <TabsTrigger value="transcripts">
                <MessageSquare className="w-4 h-4 mr-2" />
                Transcripts
              </TabsTrigger>
              <TabsTrigger value="leads">
                <User className="w-4 h-4 mr-2" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="bookings">
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Live Calls Tab */}
            <TabsContent value="live">
              <LiveCallMonitor calls={liveCalls} allCalls={recentCalls} />
            </TabsContent>

            {/* Transcripts Tab */}
            <TabsContent value="transcripts">
              <TranscriptViewer calls={recentCalls} />
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads">
              <LeadQualificationPanel leads={leads} />
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    AI-Booked Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">No appointments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((apt) => (
                        <div key={apt.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{apt.title || "Appointment"}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(apt.start_time).toLocaleString()}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge className={`text-xs ${
                                  apt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                  apt.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {apt.status}
                                </Badge>
                                <Badge className="bg-gray-700 text-gray-300 text-xs">
                                  {apt.location}
                                </Badge>
                                {apt.booked_by === 'ai_receptionist' && (
                                  <Badge className="bg-teal-500/20 text-teal-400 text-xs">
                                    AI Booked
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {apt.meeting_url && (
                            <Button
                              size="sm"
                              onClick={() => window.open(apt.meeting_url, '_blank')}
                              className="bg-purple-500 hover:bg-purple-600 text-white"
                            >
                              Join Meeting
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">Receptionist Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Booking Rate</p>
                        <p className="text-3xl font-bold text-green-400">
                          {stats.totalCalls > 0 ? Math.round((stats.bookings / stats.totalCalls) * 100) : 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Qualification Rate</p>
                        <p className="text-3xl font-bold text-yellow-400">
                          {leads.length > 0 ? Math.round((stats.qualified / leads.length) * 100) : 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Avg Call Time</p>
                        <p className="text-3xl font-bold text-blue-400">
                          {Math.floor(stats.avgDuration / 60)}:{(stats.avgDuration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="p-4 bg-[#0B0B0C] rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Lead Score</p>
                        <p className="text-3xl font-bold text-purple-400">{stats.avgScore}/100</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/30 rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-green-400 font-semibold mb-3">📞 Receptionist Capabilities</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1 font-semibold">✅ Inbound Handling</p>
                        <ul className="text-gray-300 text-xs space-y-1">
                          <li>• Answer calls 24/7</li>
                          <li>• Qualify leads (score 0-100)</li>
                          <li>• Book appointments</li>
                          <li>• Answer FAQs</li>
                          <li>• Take messages</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1 font-semibold">🤖 AI Features</p>
                        <ul className="text-gray-300 text-xs space-y-1">
                          <li>• Real-time transcription</li>
                          <li>• Intent detection</li>
                          <li>• Sentiment analysis</li>
                          <li>• Smart escalation</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <ReceptionistSettings user={user} />
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </PermissionGate>
  );
}