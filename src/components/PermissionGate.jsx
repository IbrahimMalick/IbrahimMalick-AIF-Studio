import React from "react";
import { Lock, CheckCircle2, AlertCircle, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLE_HIERARCHY = ['viewer', 'user', 'member', 'manager', 'admin', 'owner'];
const FOUNDER_EMAILS = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];

const isSuperUser = (user) => {
  if (!user) return false;
  return user.role === 'admin' ||
    user.role === 'owner' ||
    user.custom_role === 'super_admin' ||
    user.custom_role === 'founder' ||
    user.custom_role === 'owner' ||
    FOUNDER_EMAILS.includes(user.email);
};

// Permission checking function
const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Super users have all permissions
  if (isSuperUser(user)) return true;
  
  // Check specific permissions
  if (user.permissions?.includes(permission)) return true;
  
  // Check wildcard permissions (e.g., "billing:*" grants all billing permissions)
  const permPrefix = permission.split(':')[0];
  if (user.permissions?.includes(`${permPrefix}:*`)) return true;
  
  return false;
};

const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

const hasMinimumRole = (user, minimumRole) => {
  if (!user) return false;
  
  // Super users always pass any role check
  if (isSuperUser(user)) return true;

  const userRole = (user.custom_role || user.role || 'user').toLowerCase();
  const minRoleIndex = ROLE_HIERARCHY.indexOf(minimumRole.toLowerCase());
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  
  return userRoleIndex >= minRoleIndex;
};

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions or role
 */
export default function PermissionGate({ 
  user, 
  permission,
  permissions,
  minimumRole,
  requireAll = false,
  fallback = null,
  showLockMessage = false,
  lockMessage = "You don't have permission to access this feature",
  children 
}) {
  if (!user) {
    if (showLockMessage) {
      return (
        <div className="p-8 text-center bg-[#111317] border border-gray-800 rounded-2xl">
          <Lock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 mb-2">Authentication Required</p>
          <p className="text-gray-500 text-sm">Please log in to access this feature</p>
        </div>
      );
    }
    return fallback;
  }

  let hasAccess = true;

  // Check role-based access
  if (minimumRole) {
    hasAccess = hasMinimumRole(user, minimumRole);
  }
  
  // Check permission-based access
  if (permission) {
    hasAccess = hasAccess && hasPermission(user, permission);
  } else if (permissions) {
    const permCheck = requireAll 
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions);
    hasAccess = hasAccess && permCheck;
  }

  if (!hasAccess) {
    // Store denied path for access request feature
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('afs_denied_path', window.location.pathname);
    }

    if (showLockMessage) {
      return (
        <div className="p-8 text-center bg-[#111317] border border-red-500/30 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white font-semibold mb-2">Access Restricted</p>
          <p className="text-gray-400 text-sm mb-4">{lockMessage}</p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-gray-700 text-gray-300">
              Your Role: {user.custom_role || user.role || 'user'}
            </Badge>
            {minimumRole && (
              <Badge className="bg-red-500/20 text-red-400">
                Required: {minimumRole}
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="border-[#00D4C9]/30 text-[#00D4C9] hover:bg-[#00D4C9]/10"
            onClick={() => {
              alert('Access request feature coming soon! Please contact your administrator.');
            }}
          >
            <Mail className="w-4 h-4 mr-2" />
            Request Access
          </Button>
        </div>
      );
    }
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Inline Permission Check
 * Returns boolean for conditional rendering
 */
export const usePermission = (user, permission) => {
  return hasPermission(user, permission);
};

/**
 * Role Check Hook
 */
export const useRole = (user, minimumRole) => {
  return hasMinimumRole(user, minimumRole);
};

/**
 * Permission Badge Component
 * Shows a user's permission status visually
 */
export const PermissionBadge = ({ hasAccess, label }) => {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
      hasAccess 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-red-500/20 text-red-400'
    }`}>
      {hasAccess ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <Lock className="w-3 h-3" />
      )}
      <span>{label}</span>
    </div>
  );
};

/**
 * Role Badge Component
 * Shows user's role with color coding
 */
export const RoleBadge = ({ role }) => {
  const roleColors = {
    owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    manager: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    user: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    member: 'bg-green-500/20 text-green-400 border-green-500/30',
    viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const normalizedRole = (role || 'user').toLowerCase();
  const colorClass = roleColors[normalizedRole] || roleColors.user;

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border ${colorClass} font-semibold text-xs capitalize`}>
      <Shield className="w-3 h-3" />
      {role}
    </div>
  );
};