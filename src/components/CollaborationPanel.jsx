import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit3,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  Crown
} from "lucide-react";

export default function CollaborationPanel({ project, currentUser }) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [isInviting, setIsInviting] = useState(false);

  const { data: collaborators = [] } = useQuery({
    queryKey: ["collaborators", project.id],
    queryFn: () => base44.entities.ProjectCollaborator.filter({ project_id: project.id }),
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ProjectCollaborator.create(data);
      await base44.integrations.Core.SendEmail({
        to: data.user_email,
        subject: `You've been invited to collaborate on "${project.title}"`,
        body: `${currentUser.full_name || currentUser.email} has invited you to collaborate on the video project "${project.title}".\n\nRole: ${data.role}\n\nClick here to accept: ${window.location.origin}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["collaborators"]);
      setInviteEmail("");
      alert("✅ Invitation sent!");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => 
      base44.entities.ProjectCollaborator.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(["collaborators"]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => 
      base44.entities.ProjectCollaborator.update(id, { status: "removed" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["collaborators"]);
    },
  });

  const handleInvite = async () => {
    if (!inviteEmail) {
      alert("Please enter an email address");
      return;
    }

    if (inviteEmail === currentUser.email) {
      alert("You can't invite yourself!");
      return;
    }

    if (collaborators.some(c => c.user_email === inviteEmail && c.status !== "removed")) {
      alert("User already has access to this project");
      return;
    }

    setIsInviting(true);
    await inviteMutation.mutateAsync({
      project_id: project.id,
      user_email: inviteEmail,
      role: inviteRole,
      invited_by: currentUser.email,
      status: "invited",
      permissions: getRolePermissions(inviteRole)
    });
    setIsInviting(false);
  };

  const getRolePermissions = (role) => {
    const permissions = {
      owner: ["view", "edit", "comment", "delete", "invite", "manage_versions", "export"],
      editor: ["view", "edit", "comment", "manage_versions", "export"],
      reviewer: ["view", "comment"],
      viewer: ["view"]
    };
    return permissions[role] || permissions.viewer;
  };

  const getRoleIcon = (role) => {
    const icons = {
      owner: <Crown className="w-4 h-4 text-[#FFD700]" />,
      editor: <Edit3 className="w-4 h-4 text-[#00D4C9]" />,
      reviewer: <MessageSquare className="w-4 h-4 text-[#9D4EDD]" />,
      viewer: <Eye className="w-4 h-4 text-gray-400" />
    };
    return icons[role] || icons.viewer;
  };

  const activeCollaborators = collaborators.filter(c => c.status === "active");
  const currentlyEditing = activeCollaborators.filter(c => c.is_currently_editing);

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[#FFD700]" />
          Collaboration ({collaborators.filter(c => c.status !== "removed").length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Currently Editing Indicator */}
        {currentlyEditing.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
            <p className="text-green-400 text-sm font-medium mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Currently Editing:
            </p>
            <div className="flex flex-wrap gap-2">
              {currentlyEditing.map((collab) => (
                <Badge key={collab.id} className="bg-green-500/20 text-green-400">
                  {collab.user_email}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Invite New Collaborator */}
        <div className="space-y-3">
          <h4 className="text-white text-sm font-semibold">Invite Collaborator</h4>
          <div className="flex gap-2">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="collaborator@email.com"
              className="flex-1 bg-[#0B0B0C] border-gray-700 text-white rounded-lg"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-32 bg-[#0B0B0C] border-gray-700 text-white rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail}
              className="bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            <Shield className="w-3 h-3 inline mr-1" />
            {inviteRole === "viewer" && "Can only view the project"}
            {inviteRole === "reviewer" && "Can view and comment"}
            {inviteRole === "editor" && "Can edit, comment, and export"}
          </p>
        </div>

        {/* Collaborators List */}
        <div className="space-y-2">
          <h4 className="text-white text-sm font-semibold">Team Members</h4>
          <div className="space-y-2">
            {collaborators.filter(c => c.status !== "removed").map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getRoleIcon(collab.role)}
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {collab.user_email}
                      {collab.user_email === project.created_by && (
                        <Badge className="ml-2 bg-[#FFD700]/20 text-[#FFD700] text-xs">Owner</Badge>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs capitalize">
                      {collab.status === "invited" ? (
                        <span className="text-yellow-400">Pending invitation</span>
                      ) : (
                        <>
                          {collab.role} • Last active {collab.last_active ? new Date(collab.last_active).toLocaleDateString() : 'Never'}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {collab.user_email !== project.created_by && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={collab.role}
                      onValueChange={(role) => updateRoleMutation.mutate({ id: collab.id, role })}
                      disabled={currentUser.email !== project.created_by}
                    >
                      <SelectTrigger className="w-28 h-8 bg-[#111317] border-gray-700 text-white rounded-lg text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Remove ${collab.user_email} from this project?`)) {
                          removeMutation.mutate(collab.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      disabled={currentUser.email !== project.created_by}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {collaborators.filter(c => c.status !== "removed").length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p>No collaborators yet</p>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}