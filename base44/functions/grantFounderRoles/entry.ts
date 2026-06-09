import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOUNDER_EMAILS = {
  "dptrini@gmail.com": { role: "admin", custom_role: "super_admin" },
  "aifreedomstudios.@gmail.com": { role: "admin", custom_role: "founder" }
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleConfig = FOUNDER_EMAILS[user.email];
  if (!roleConfig) {
    return Response.json({ message: "No role update needed", email: user.email });
  }

  await base44.asServiceRole.entities.User.update(user.id, roleConfig);

  return Response.json({
    success: true,
    message: `Roles granted: role=${roleConfig.role}, custom_role=${roleConfig.custom_role}`,
    email: user.email
  });
});