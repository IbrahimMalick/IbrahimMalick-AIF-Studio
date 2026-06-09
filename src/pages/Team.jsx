import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, Activity, UserPlus, Mail, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import RoleManagement from "@/components/RoleManagement";
import PermissionGate from "@/components/PermissionGate";

function TeamActivity({ user }) {
  const { data: logs = [] } = useQuery({
    queryKey: ["activityLogs", user?.email],
    queryFn: () => base44.entities.ActivityLog.filter({ user_email: user.email }, "-created_date", 30),
    enabled: !!user,
  });

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00D4C9]" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4C9] to-[#9D4EDD] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  {log.action_type?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">
                    <span className="font-semibold capitalize">{log.action_type}</span>
                    {log.entity_name && <span className="text-gray-400"> — {log.entity_name}</span>}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {log.user_email} • {new Date(log.created_date).toLocaleString()}
                  </p>
                </div>
                <Badge className="bg-gray-700 text-gray-300 text-xs capitalize flex-shrink-0">
                  {log.action_type}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No activity logs yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const PERMISSIONS = {
  USER_MANAGE_ROLES: 'user.manage_roles'
};

const ROLE_COLORS = {
  admin: "bg-red-500/20 text-red-400",
  manager: "bg-yellow-500/20 text-yellow-400",
  editor: "bg-blue-500/20 text-blue-400",
  viewer: "bg-gray-500/20 text-gray-400",
  user: "bg-green-500/20 text-green-400",
};

export default function Team() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["teamMembers", user?.email],
    queryFn: () => base44.entities.TeamMember.filter({ team_owner_email: user.email }),
    enabled: !!user,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["teamMembers"]),
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    setIsInviting(true);
    try {
      // Invite the user to the platform
      await base44.users.inviteUser(inviteEmail, inviteRole);

      // Track in TeamMember entity
      await base44.entities.TeamMember.create({
        team_owner_email: user.email,
        member_email: inviteEmail,
        role: inviteRole,
        status: "invited",
        permissions: inviteRole === "admin" ? ["all"] : inviteRole === "manager" ? ["edit", "view"] : ["view"]
      });

      queryClient.invalidateQueries(["teamMembers"]);
      setInviteEmail("");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (error) {
      alert("Failed to invite user. They may already have an account or the email is invalid.");
    }
    setIsInviting(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#FFD700]" />
            Team Management
          </h1>
          <p className="text-gray-400">Manage team members, roles, and permissions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="w-4 h-4 mr-2" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <div className="space-y-4">
              {/* Invite Card */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#FFD700]" />
                    Invite Team Member
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[220px]">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teammate@company.com"
                        className="pl-10 bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                        onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                      />
                    </div>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="w-36 bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="user">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleInvite}
                      disabled={isInviting}
                      className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold rounded-xl"
                    >
                      {isInviting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : inviteSuccess ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" />Sent!</>
                      ) : (
                        <><UserPlus className="w-4 h-4 mr-2" />Invite</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Members List */}
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Team Members</span>
                    <Badge className="bg-gray-700 text-gray-300">{teamMembers.length} members</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Owner row */}
                    <div className="p-4 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center text-black font-bold text-sm">
                            {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user?.full_name || user?.email}</p>
                            <p className="text-gray-400 text-xs">{user?.email}</p>
                          </div>
                        </div>
                        <Badge className="bg-[#FFD700]/20 text-[#FFD700]">Owner</Badge>
                      </div>
                    </div>

                    {teamMembers.length > 0 ? (
                      teamMembers.map((member) => (
                        <div key={member.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-bold text-sm">
                                {member.member_email?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-white font-medium">{member.member_email}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge className={`text-xs ${ROLE_COLORS[member.role] || ROLE_COLORS.user}`}>
                                    {member.role}
                                  </Badge>
                                  <Badge className={`text-xs ${
                                    member.status === "active" ? "bg-green-500/20 text-green-400" :
                                    member.status === "invited" ? "bg-blue-500/20 text-blue-400" :
                                    "bg-gray-500/20 text-gray-400"
                                  }`}>
                                    {member.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Remove ${member.member_email} from your team?`)) {
                                  deleteMemberMutation.mutate(member.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="mb-2">No team members yet</p>
                        <p className="text-sm text-gray-600">Invite your first team member above</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roles">
            <PermissionGate
              user={user}
              permission={PERMISSIONS.USER_MANAGE_ROLES}
              showLockMessage={true}
            >
              {user && <RoleManagement currentUser={user} />}
            </PermissionGate>
          </TabsContent>

          <TabsContent value="activity">
            <TeamActivity user={user} />
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}