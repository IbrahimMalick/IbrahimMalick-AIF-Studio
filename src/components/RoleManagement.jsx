import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Crown,
  Edit3,
  Eye,
  Lock,
  Unlock,
  AlertCircle,
  Search,
  Filter,
  UserCog,
  Save,
  X,
  History,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

// Permission constants
const PERMISSIONS = {
  PROJECT_CREATE: 'project.create',
  PROJECT_VIEW_OWN: 'project.view.own',
  PROJECT_VIEW_ALL: 'project.view.all',
  PROJECT_EDIT_OWN: 'project.edit.own',
  PROJECT_EDIT_ALL: 'project.edit.all',
  PROJECT_DELETE_OWN: 'project.delete.own',
  PROJECT_DELETE_ALL: 'project.delete.all',
  PROJECT_SHARE: 'project.share',
  PROJECT_EXPORT: 'project.export',
  PROJECT_COLLABORATE: 'project.collaborate',
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  USER_MANAGE_ROLES: 'user.manage_roles',
  USER_INVITE: 'user.invite',
  ANALYTICS_VIEW_OWN: 'analytics.view.own',
  ANALYTICS_VIEW_ALL: 'analytics.view.all',
  ANALYTICS_EXPORT: 'analytics.export',
  CONTENT_PUBLISH: 'content.publish',
  CONTENT_SCHEDULE: 'content.schedule',
  CONTENT_MODERATE: 'content.moderate',
  AI_GENERATE: 'ai.generate',
  AI_ANALYZE: 'ai.analyze',
  AI_VOICE_CLONE: 'ai.voice_clone',
  AI_SCRIPT_GENERATE: 'ai.script_generate',
  TEAM_VIEW: 'team.view',
  TEAM_MANAGE: 'team.manage',
  TEAM_INVITE: 'team.invite',
  COLLABORATION_COMMENT: 'collaboration.comment',
  COLLABORATION_APPROVE: 'collaboration.approve',
  AUDIT_VIEW: 'audit.view',
  EXPORT_DATA: 'export.data'
};

// Role Definitions
const ROLES = {
  super_admin: {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    priority: 100,
    color: '#FF0000',
    permissions: Object.values(PERMISSIONS)
  },
  project_manager: {
    name: 'Project Manager',
    description: 'Manage projects, users, and analytics',
    priority: 80,
    color: '#FFD700',
    permissions: [
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_VIEW_ALL,
      PERMISSIONS.PROJECT_EDIT_ALL,
      PERMISSIONS.PROJECT_DELETE_OWN,
      PERMISSIONS.PROJECT_SHARE,
      PERMISSIONS.PROJECT_EXPORT,
      PERMISSIONS.PROJECT_COLLABORATE,
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_INVITE,
      PERMISSIONS.ANALYTICS_VIEW_ALL,
      PERMISSIONS.ANALYTICS_EXPORT,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.CONTENT_SCHEDULE,
      PERMISSIONS.AI_GENERATE,
      PERMISSIONS.AI_ANALYZE,
      PERMISSIONS.AI_SCRIPT_GENERATE,
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.TEAM_MANAGE,
      PERMISSIONS.TEAM_INVITE,
      PERMISSIONS.COLLABORATION_COMMENT,
      PERMISSIONS.COLLABORATION_APPROVE
    ]
  },
  editor: {
    name: 'Editor',
    description: 'Create and edit content, limited project access',
    priority: 60,
    color: '#00D4C9',
    permissions: [
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_VIEW_OWN,
      PERMISSIONS.PROJECT_EDIT_OWN,
      PERMISSIONS.PROJECT_DELETE_OWN,
      PERMISSIONS.PROJECT_SHARE,
      PERMISSIONS.PROJECT_EXPORT,
      PERMISSIONS.PROJECT_COLLABORATE,
      PERMISSIONS.ANALYTICS_VIEW_OWN,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.CONTENT_SCHEDULE,
      PERMISSIONS.AI_GENERATE,
      PERMISSIONS.AI_ANALYZE,
      PERMISSIONS.AI_SCRIPT_GENERATE,
      PERMISSIONS.COLLABORATION_COMMENT,
      PERMISSIONS.EXPORT_DATA
    ]
  },
  collaborator: {
    name: 'Collaborator',
    description: 'Contribute to projects, comment and suggest',
    priority: 40,
    color: '#9D4EDD',
    permissions: [
      PERMISSIONS.PROJECT_VIEW_OWN,
      PERMISSIONS.PROJECT_EDIT_OWN,
      PERMISSIONS.PROJECT_COLLABORATE,
      PERMISSIONS.ANALYTICS_VIEW_OWN,
      PERMISSIONS.AI_GENERATE,
      PERMISSIONS.COLLABORATION_COMMENT
    ]
  },
  viewer: {
    name: 'Viewer',
    description: 'View-only access to shared projects',
    priority: 20,
    color: '#6B7280',
    permissions: [
      PERMISSIONS.PROJECT_VIEW_OWN,
      PERMISSIONS.ANALYTICS_VIEW_OWN,
      PERMISSIONS.COLLABORATION_COMMENT
    ]
  },
  analyst: {
    name: 'Analyst',
    description: 'Access to analytics and reporting',
    priority: 50,
    color: '#06D6A0',
    permissions: [
      PERMISSIONS.PROJECT_VIEW_ALL,
      PERMISSIONS.ANALYTICS_VIEW_ALL,
      PERMISSIONS.ANALYTICS_EXPORT,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.EXPORT_DATA
    ]
  }
};

// Helper functions
const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.custom_role) {
    const roleConfig = ROLES[user.custom_role];
    if (roleConfig?.permissions.includes(permission)) return true;
  }
  if (user.permissions?.includes(permission)) return true;
  return false;
};

const getUserRoleInfo = (user) => {
  if (!user) return null;
  if (user.custom_role && ROLES[user.custom_role]) {
    return {
      ...ROLES[user.custom_role],
      role_id: user.custom_role,
      is_admin: user.role === 'admin'
    };
  }
  if (user.role === 'admin') {
    return {
      name: 'Admin',
      description: 'System administrator',
      priority: 90,
      color: '#9D4EDD',
      permissions: Object.values(PERMISSIONS),
      role_id: 'admin',
      is_admin: true
    };
  }
  return {
    name: 'User',
    description: 'Standard user',
    priority: 10,
    color: '#6B7280',
    permissions: [
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_VIEW_OWN,
      PERMISSIONS.PROJECT_EDIT_OWN,
      PERMISSIONS.PROJECT_DELETE_OWN,
      PERMISSIONS.ANALYTICS_VIEW_OWN
    ],
    role_id: 'user',
    is_admin: false
  };
};

export default function RoleManagement({ currentUser }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Fetch all users (admin only)
  const { data: users = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: currentUser?.role === 'admin' || currentUser?.custom_role === 'super_admin',
  });

  // Fetch permission audit log
  const { data: auditLog = [] } = useQuery({
    queryKey: ["permissionAudit"],
    queryFn: () => base44.entities.PermissionAudit.list("-created_date", 50),
    enabled: hasPermission(currentUser, PERMISSIONS.AUDIT_VIEW),
  });

  // Update user role
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, roleData, reason }) => {
      const user = users.find(u => u.id === userId);
      
      // Update user
      await base44.entities.User.update(userId, roleData);

      // Log the change
      await base44.entities.PermissionAudit.create({
        user_email: user.email,
        changed_by: currentUser.email,
        action_type: "role_assigned",
        previous_role: user.custom_role || user.role,
        new_role: roleData.custom_role,
        permissions_changed: roleData.permissions || [],
        reason: reason || "Role change via admin panel"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allUsers"]);
      queryClient.invalidateQueries(["permissionAudit"]);
      setEditingUser(null);
      alert("✅ User role updated successfully!");
    },
  });

  // Toggle user active status
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }) => {
      const user = users.find(u => u.id === userId);
      
      await base44.entities.User.update(userId, { is_active: isActive });
      
      await base44.entities.PermissionAudit.create({
        user_email: user.email,
        changed_by: currentUser.email,
        action_type: isActive ? "role_assigned" : "access_denied",
        reason: isActive ? "Account reactivated" : "Account suspended"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allUsers"]);
      queryClient.invalidateQueries(["permissionAudit"]);
    },
  });

  const handleEditUser = (user) => {
    setEditingUser(user);
    setSelectedPermissions(user.permissions || []);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    const selectedRole = document.getElementById('role-select')?.value;
    const rolePermissions = ROLES[selectedRole]?.permissions || [];
    
    await updateUserRoleMutation.mutateAsync({
      userId: editingUser.id,
      roleData: {
        custom_role: selectedRole,
        permissions: [...new Set([...rolePermissions, ...selectedPermissions])]
      },
      reason: "Updated via Role Management"
    });
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.custom_role === filterRole || 
                        (filterRole === 'admin' && user.role === 'admin') ||
                        (filterRole === 'user' && !user.custom_role && user.role === 'user');
    return matchesSearch && matchesRole;
  });

  if (!hasPermission(currentUser, PERMISSIONS.USER_MANAGE_ROLES)) {
    return (
      <div className="p-8 text-center">
        <Lock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400 text-lg mb-2">Access Denied</p>
        <p className="text-gray-500 text-sm">You don't have permission to manage user roles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header & Filters */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="collaborator">Collaborator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="user">Basic User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FFD700]" />
            Users & Roles ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map((user) => {
              const roleInfo = getUserRoleInfo(user);
              const isActive = user.is_active !== false;
              
              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-[#0B0B0C] border-gray-800 hover:border-[#FFD700]'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <span className="text-black font-bold text-lg">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold truncate">
                            {user.full_name || user.email}
                          </p>
                          {user.email === currentUser.email && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">You</Badge>
                          )}
                          {!isActive && (
                            <Badge className="bg-red-500/20 text-red-400 text-xs">Suspended</Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">{user.email}</p>
                        {user.department && (
                          <p className="text-gray-500 text-xs mt-1">{user.department}</p>
                        )}
                      </div>

                      {/* Role Badge */}
                      <Badge 
                        className="text-xs font-semibold"
                        style={{ 
                          backgroundColor: `${roleInfo?.color}20`,
                          color: roleInfo?.color,
                          borderColor: `${roleInfo?.color}40`,
                          borderWidth: '1px'
                        }}
                      >
                        {roleInfo?.name || 'User'}
                      </Badge>

                      {/* Permission Count */}
                      <div className="text-center min-w-[60px]">
                        <p className="text-white font-bold">{user.permissions?.length || roleInfo?.permissions.length || 0}</p>
                        <p className="text-gray-500 text-xs">Perms</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                        className="border-gray-700 hover:bg-[#111317] rounded-lg"
                        disabled={user.email === currentUser.email}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => {
                          if (confirm(`${checked ? 'Reactivate' : 'Suspend'} ${user.email}?`)) {
                            toggleUserStatusMutation.mutate({ userId: user.id, isActive: checked });
                          }
                        }}
                        disabled={user.email === currentUser.email}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Overview */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00D4C9]" />
            Role Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ROLES).map(([roleId, role]) => (
              <div
                key={roleId}
                className="p-4 rounded-xl border-2 transition-all"
                style={{ borderColor: `${role.color}40`, backgroundColor: `${role.color}05` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${role.color}20` }}
                  >
                    <Shield className="w-5 h-5" style={{ color: role.color }} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{role.name}</h4>
                    <p className="text-gray-500 text-xs">Priority: {role.priority}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3">{role.description}</p>
                <Badge className="text-xs" style={{ backgroundColor: `${role.color}20`, color: role.color }}>
                  {role.permissions.length} permissions
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}