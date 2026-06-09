
import React, { useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // New import
import CallbackScheduler from "@/components/CallbackScheduler"; // New import
import ActiveNurtureSequences from "@/components/ActiveNurtureSequences"; // Assuming this component exists
import {
  User,
  Phone,
  Mail,
  Building,
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search
} from "lucide-react";

export default function LeadQualificationPanel({ leads }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // New state
  const [schedulingCallback, setSchedulingCallback] = useState(null); // New state
  const queryClient = useQueryClient();

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      setSelectedLead(null);
      setSchedulingCallback(null); // Ensure scheduler modal closes on success
    }
  });

  const getFilteredLeads = useCallback((statusFilter = null) => {
    return leads.filter(lead => {
      const matchesSearch =
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.includes(searchQuery) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === null || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery]);

  // filteredLeads for the 'all' tab and general stats (original functionality)
  const filteredLeads = getFilteredLeads();

  // Grouped leads by status, also applying the search filter for other tabs
  const leadsByStatus = useMemo(() => {
    return {
      new: getFilteredLeads('new'),
      qualified: getFilteredLeads('qualified'),
      won: getFilteredLeads('won'),
      lost: getFilteredLeads('lost'),
      nurture: getFilteredLeads('nurture'), // Assuming 'nurture' is a lead status
    };
  }, [getFilteredLeads]);

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle2 };
    if (score >= 60) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: AlertCircle };
    return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle };
  };

  // Helper function to render a list of leads with common actions
  const renderCommonLeadList = (leadArray, customBorderClass = "border-gray-800") => {
    return leadArray.length === 0 ? (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">
          {searchQuery ? 'No matching leads found' : 'No leads yet for this category'}
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {leadArray.map((lead) => {
          const scoreColor = getScoreColor(lead.score || 0);
          const ScoreIcon = scoreColor.icon;
          
          return (
            <div key={lead.id} className={`p-4 bg-[#0B0B0C] rounded-xl border ${customBorderClass} hover:border-gray-700 transition-all`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white font-bold">{lead.name || 'Unknown'}</p>
                    <Badge className={`${scoreColor.bg} ${scoreColor.text} text-xs`}>
                      <ScoreIcon className="w-3 h-3 mr-1" />
                      Score: {lead.score || 0}
                    </Badge>
                    <Badge className={`text-xs ${
                      lead.status === 'qualified' ? 'bg-green-500/20 text-green-400' :
                      lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                      lead.status === 'won' ? 'bg-purple-500/20 text-purple-400' :
                      lead.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                      lead.status === 'nurture' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {lead.status}
                    </Badge>
                    {lead.ghl_synced && (
                      <Badge className="bg-teal-500/20 text-teal-400 text-xs">
                        GHL Synced
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.company && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Building className="w-3 h-3" />
                        <span>{lead.company}</span>
                      </div>
                    )}
                  </div>

                  {(lead.budget || lead.timeline || lead.use_case) && (
                    <div className="grid md:grid-cols-3 gap-2 mb-3">
                      {lead.budget && (
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-500 text-xs">Budget</p>
                          <p className="text-white text-sm">{lead.budget}</p>
                        </div>
                      )}
                      {lead.timeline && (
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-500 text-xs">Timeline</p>
                          <p className="text-white text-sm">{lead.timeline}</p>
                        </div>
                      )}
                      {lead.use_case && (
                        <div className="p-2 bg-[#111317] rounded">
                          <p className="text-gray-500 text-xs">Use Case</p>
                          <p className="text-white text-sm">{lead.use_case}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {lead.tags && lead.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {lead.tags.map((tag, idx) => (
                        <Badge key={idx} className="bg-gray-700 text-gray-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {lead.notes && (
                    <div className="p-2 bg-[#111317] rounded-lg border-l-2 border-yellow-500">
                      <p className="text-gray-300 text-sm">{lead.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-4 text-xs text-gray-500 mt-3">
                    {lead.call_count > 0 && <span>📞 {lead.call_count} calls</span>}
                    {lead.sms_count > 0 && <span>💬 {lead.sms_count} SMS</span>}
                    {lead.email_count > 0 && <span>✉️ {lead.email_count} emails</span>}
                    {lead.last_contact && (
                      <span>Last: {new Date(lead.last_contact).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedLead(lead)}
                    className="bg-[#FFD700] text-black hover:bg-[#FFC700]"
                  >
                    View Details
                  </Button>
                  {lead.status === 'new' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateLeadMutation.mutate({
                        id: lead.id,
                        data: { status: 'qualified' }
                      })}
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Qualify
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="pl-10 bg-[#0B0B0C] border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <User className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold text-white">{leads.length}</p>
            <p className="text-gray-500 text-xs">Total Leads</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111317] border-gray-800 rounded-xl">
          <CardContent className="p-4 text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <p className="text-2xl font-bold text-white">
              {leads.filter(l => l.score >= 70).length}
            </p>
            <p className="text-gray-500 text-xs">High Quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 h-auto bg-[#111317] border border-gray-800 p-1 rounded-lg">
          <TabsTrigger value="all" className="py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white">All ({filteredLeads.length})</TabsTrigger>
          <TabsTrigger value="new" className="py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white">New ({leadsByStatus.new.length})</TabsTrigger>
          <TabsTrigger value="qualified" className="py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Qualified ({leadsByStatus.qualified.length})</TabsTrigger>
          <TabsTrigger value="won" className="py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Won ({leadsByStatus.won.length})</TabsTrigger>
          <TabsTrigger value="lost" className="py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Lost ({leadsByStatus.lost.length})</TabsTrigger>
          <TabsTrigger value="nurture" className="py-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Nurture ({leadsByStatus.nurture.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl mt-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" />
                All Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCommonLeadList(filteredLeads)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl mt-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                New Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCommonLeadList(leadsByStatus.new)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualified">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl mt-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Qualified Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCommonLeadList(leadsByStatus.qualified)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="won">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl mt-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Won Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCommonLeadList(leadsByStatus.won)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lost">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl mt-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Lost Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCommonLeadList(leadsByStatus.lost)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nurture">
          <div className="space-y-6 mt-4">
            <ActiveNurtureSequences leads={leads} />

            {/* Nurture Candidates */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  Leads Ready for Nurture
                </CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Leads that match nurture rule criteria but aren't in sequences yet
                </p>
              </CardHeader>
              <CardContent>
                {leadsByStatus.nurture.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">No leads in nurture status</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Leads automatically enter nurture when they match rule criteria
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leadsByStatus.nurture.map((lead) => {
                      const scoreColor = getScoreColor(lead.score || 0);
                      const ScoreIcon = scoreColor.icon;
                      
                      return (
                        <div key={lead.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-white font-bold">{lead.name || 'Unknown'}</p>
                                <Badge className={`${scoreColor.bg} ${scoreColor.text} text-xs`}>
                                  <ScoreIcon className="w-3 h-3 mr-1" />
                                  Score: {lead.score || 0}
                                </Badge>
                                <Badge className={`text-xs ${
                                  lead.status === 'qualified' ? 'bg-green-500/20 text-green-400' :
                                  lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                                  lead.status === 'won' ? 'bg-purple-500/20 text-purple-400' :
                                  lead.status === 'nurture' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {lead.status}
                                </Badge>
                                {lead.ghl_synced && (
                                  <Badge className="bg-teal-500/20 text-teal-400 text-xs">
                                    GHL Synced
                                  </Badge>
                                )}
                              </div>

                              <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                                {lead.phone && (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Phone className="w-3 h-3" />
                                    <span>{lead.phone}</span>
                                  </div>
                                )}
                                {lead.email && (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Mail className="w-3 h-3" />
                                    <span>{lead.email}</span>
                                  </div>
                                )}
                                {lead.company && (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Building className="w-3 h-3" />
                                    <span>{lead.company}</span>
                                  </div>
                                )}
                              </div>

                              {(lead.budget || lead.timeline || lead.use_case) && (
                                <div className="grid md:grid-cols-3 gap-2 mb-3">
                                  {lead.budget && (
                                    <div className="p-2 bg-[#111317] rounded">
                                      <p className="text-gray-500 text-xs">Budget</p>
                                      <p className="text-white text-sm">{lead.budget}</p>
                                    </div>
                                  )}
                                  {lead.timeline && (
                                    <div className="p-2 bg-[#111317] rounded">
                                      <p className="text-gray-500 text-xs">Timeline</p>
                                      <p className="text-white text-sm">{lead.timeline}</p>
                                    </div>
                                  )}
                                  {lead.use_case && (
                                    <div className="p-2 bg-[#111317] rounded">
                                      <p className="text-gray-500 text-xs">Use Case</p>
                                      <p className="text-white text-sm">{lead.use_case}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {lead.tags && lead.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap mb-3">
                                  {lead.tags.map((tag, idx) => (
                                    <Badge key={idx} className="bg-gray-700 text-gray-300 text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {lead.notes && (
                                <div className="p-2 bg-[#111317] rounded-lg border-l-2 border-yellow-500">
                                  <p className="text-gray-300 text-sm">{lead.notes}</p>
                                </div>
                              )}

                              <div className="flex gap-4 text-xs text-gray-500 mt-3">
                                {lead.call_count > 0 && <span>📞 {lead.call_count} calls</span>}
                                {lead.sms_count > 0 && <span>💬 {lead.sms_count} SMS</span>}
                                {lead.email_count > 0 && <span>✉️ {lead.email_count} emails</span>}
                                {lead.last_contact && (
                                  <span>Last: {new Date(lead.last_contact).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => setSelectedLead(lead)}
                                className="bg-[#FFD700] text-black hover:bg-[#FFC700]"
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSchedulingCallback(lead)}
                                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                Schedule Call
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Lead Details</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLead(null)}
                  className="border-gray-700 text-white"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <p className="text-white font-semibold">{selectedLead.name || '—'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Score</label>
                  <p className="text-white font-semibold">{selectedLead.score || 0}/100</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-white">{selectedLead.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white">{selectedLead.email || '—'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Company</label>
                  <p className="text-white">{selectedLead.company || '—'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Source</label>
                  <p className="text-white capitalize">{selectedLead.source || '—'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Budget</label>
                  <p className="text-white">{selectedLead.budget || '—'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Timeline</label>
                  <p className="text-white">{selectedLead.timeline || '—'}</p>
                </div>
              </div>

              {selectedLead.use_case && (
                <div>
                  <label className="text-gray-400 text-sm">Use Case</label>
                  <p className="text-white">{selectedLead.use_case}</p>
                </div>
              )}

              {selectedLead.pain_points && selectedLead.pain_points.length > 0 && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Pain Points</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedLead.pain_points.map((point, idx) => (
                      <Badge key={idx} className="bg-red-500/20 text-red-400">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLead.notes && (
                <div>
                  <label className="text-gray-400 text-sm">Notes</label>
                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 mt-1">
                    <p className="text-gray-300 text-sm">{selectedLead.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-800">
                <Button
                  onClick={() => updateLeadMutation.mutate({
                    id: selectedLead.id,
                    data: { status: 'qualified' }
                  })}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Qualified
                </Button>
                <Button
                  onClick={() => updateLeadMutation.mutate({
                    id: selectedLead.id,
                    data: { status: 'lost' }
                  })}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark Lost
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Callback Scheduler Modal */}
      {schedulingCallback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                onClick={() => setSchedulingCallback(null)}
                className="border-gray-700 text-white"
              >
                Close
              </Button>
            </div>
            <CallbackScheduler
              lead={schedulingCallback}
              onScheduled={(appointment) => {
                setSchedulingCallback(null);
                queryClient.invalidateQueries(["leads"]);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
