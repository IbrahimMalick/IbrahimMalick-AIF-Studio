import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Brain,
  Target,
  TrendingUp,
  Award,
  MessageCircle,
  Activity,
  Mail,
  Settings,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useAudioFeedback } from "@/components/AudioSystem";
import { showToast } from "@/components/ToastNotification";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeamCoaching() {
  const audio = useAudioFeedback();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    role: "editor",
    coaching_enabled: true,
    coaching_focus: []
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers", user?.email],
    queryFn: () => base44.entities.TeamMember.filter({
      team_owner_email: user.email
    }, "-created_date"),
    enabled: !!user?.email
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create({
      ...data,
      team_owner_email: user.email,
      status: "invited",
      joined_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["teamMembers"]);
      setIsInviteModalOpen(false);
      setNewMember({
        email: "",
        role: "editor",
        coaching_enabled: true,
        coaching_focus: []
      });
      audio?.playSuccess();
      showToast("Team member invited! 🎉", "success");
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["teamMembers"]);
      audio?.playWhoosh();
      showToast("Member updated", "success");
    },
  });

  const coachingFocusOptions = [
    "Content Creation",
    "Social Media Strategy",
    "Video Production",
    "Copywriting",
    "Analytics & Optimization",
    "Time Management",
    "Goal Setting",
    "Technical Skills"
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 heading-font">
              👥 Team Coaching
            </h1>
            <p className="text-gray-400">AI-powered coaching for your entire team</p>
          </div>
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#00D4C9] to-[#1E90FF]">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111317] border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Invite Team Member</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add someone to your team and enable AI coaching
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    className="bg-[#0B0B0C] border-gray-700 text-white"
                    placeholder="colleague@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Role</label>
                  <Select 
                    value={newMember.role} 
                    onValueChange={(value) => setNewMember({...newMember, role: value})}
                  >
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="coaching"
                    checked={newMember.coaching_enabled}
                    onChange={(e) => setNewMember({...newMember, coaching_enabled: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="coaching" className="text-sm text-gray-400">
                    Enable AI Coaching
                  </label>
                </div>
                {newMember.coaching_enabled && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Coaching Focus (select multiple)</label>
                    <div className="flex flex-wrap gap-2">
                      {coachingFocusOptions.map((focus) => (
                        <Button
                          key={focus}
                          size="sm"
                          variant={newMember.coaching_focus.includes(focus) ? "default" : "outline"}
                          onClick={() => {
                            const updated = newMember.coaching_focus.includes(focus)
                              ? newMember.coaching_focus.filter(f => f !== focus)
                              : [...newMember.coaching_focus, focus];
                            setNewMember({...newMember, coaching_focus: updated});
                          }}
                          className={newMember.coaching_focus.includes(focus) 
                            ? "bg-[#00D4C9] text-black"
                            : "border-gray-700 text-gray-400"
                          }
                        >
                          {focus}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => inviteMemberMutation.mutate(newMember)}
                  disabled={!newMember.email}
                  className="w-full bg-gradient-to-r from-[#00D4C9] to-[#1E90FF]"
                >
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Total Members", value: teamMembers.length, icon: Users, color: "from-[#00D4C9] to-[#1E90FF]" },
            { label: "Active Coaching", value: teamMembers.filter(m => m.coaching_enabled).length, icon: Brain, color: "from-[#FFD700] to-[#FFA500]" },
            { label: "Avg Performance", value: "87%", icon: TrendingUp, color: "from-[#00FF88] to-[#00D4C9]" },
            { label: "Total Sessions", value: "142", icon: MessageCircle, color: "from-purple-500 to-pink-500" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-[#111317] border-gray-800 rounded-2xl overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Team Members List */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00D4C9]" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length > 0 ? (
              <div className="space-y-4">
                {teamMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 rounded-xl bg-[#0B0B0C] border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4C9] to-[#1E90FF] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {member.member_email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-lg">{member.member_email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                              {member.role}
                            </Badge>
                            <Badge className={`${
                              member.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              member.status === 'invited' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            } capitalize`}>
                              {member.status}
                            </Badge>
                            {member.coaching_enabled && (
                              <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                                <Brain className="w-3 h-3 mr-1" />
                                AI Coaching
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>

                    {member.coaching_enabled && member.coaching_focus && member.coaching_focus.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Coaching Focus:</div>
                        <div className="flex flex-wrap gap-2">
                          {member.coaching_focus.map((focus) => (
                            <Badge key={focus} className="bg-[#00D4C9]/10 text-[#00D4C9] border border-[#00D4C9]/30">
                              {focus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.performance_metrics && (
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-800">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {member.performance_metrics.content_created || 0}
                          </div>
                          <div className="text-xs text-gray-500">Content</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#00FF88]">
                            {member.performance_metrics.quality_score || 0}%
                          </div>
                          <div className="text-xs text-gray-500">Quality</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#00D4C9]">
                            {(member.performance_metrics.engagement_generated || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#FFD700]">
                            ${(member.performance_metrics.revenue_contributed || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 mb-4">No team members yet</p>
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-gradient-to-r from-[#00D4C9] to-[#1E90FF]"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite First Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}