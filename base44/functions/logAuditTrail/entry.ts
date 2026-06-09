import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      action,
      resource_type,
      resource_id,
      resource_name,
      changes,
      status = 'success',
      error_reason
    } = await req.json();

    if (!action || !resource_type) {
      return Response.json({ error: 'action and resource_type required' }, { status: 400 });
    }

    const log = await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action,
      resource_type,
      resource_id,
      resource_name,
      changes,
      status,
      error_reason,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true, log_id: log.id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});