import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resource, action } = await req.json();

    if (!resource || !action) {
      return Response.json({ error: 'resource and action required' }, { status: 400 });
    }

    // Super admins and founders always have full permission
    const FOUNDER_EMAILS = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];
    const isAdminOrFounder = user.role === 'admin' ||
      user.custom_role === 'super_admin' ||
      user.custom_role === 'founder' ||
      FOUNDER_EMAILS.includes(user.email);

    if (isAdminOrFounder) {
      return Response.json({
        has_permission: true,
        user_role: user.custom_role || user.role,
        requested_action: action,
        requested_resource: resource
      });
    }

    // Get user role
    const userRole = user.custom_role || user.role || 'viewer';

    // RBAC matrix: Define default permissions per role
    const permissionMatrix = {
      owner: { agents: ['create', 'read', 'update', 'delete', 'execute'], projects: ['create', 'read', 'update', 'delete'], billing: ['read', 'update'], analytics: ['read'], team: ['create', 'read', 'update', 'delete'], integrations: ['create', 'read', 'update', 'delete'], webhooks: ['create', 'read', 'update', 'delete'], settings: ['read', 'update'] },
      admin: { agents: ['create', 'read', 'update', 'delete', 'execute'], projects: ['create', 'read', 'update', 'delete'], billing: ['read'], analytics: ['read'], team: ['read', 'update'], integrations: ['create', 'read', 'update', 'delete'], webhooks: ['read', 'update'], settings: ['read', 'update'] },
      manager: { agents: ['create', 'read', 'update', 'execute'], projects: ['read', 'update'], billing: ['read'], analytics: ['read'], team: ['read'], integrations: ['read'], webhooks: ['read'], settings: ['read'] },
      member: { agents: ['create', 'read', 'execute'], projects: ['read'], billing: [], analytics: ['read'], team: [], integrations: ['read'], webhooks: [], settings: [] },
      viewer: { agents: ['read'], projects: ['read'], billing: [], analytics: ['read'], team: [], integrations: [], webhooks: [], settings: [] }
    };

    const rolePerms = permissionMatrix[userRole] || permissionMatrix.viewer;
    const allowedActions = rolePerms[resource] || [];
    const hasPermission = allowedActions.includes(action);

    // Log audit trail
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action: 'permission_check',
      resource_type: resource,
      status: hasPermission ? 'success' : 'denied',
      error_reason: hasPermission ? null : `${userRole} role cannot ${action} ${resource}`,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      has_permission: hasPermission,
      user_role: userRole,
      requested_action: action,
      requested_resource: resource
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});