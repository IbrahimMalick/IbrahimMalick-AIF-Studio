/* eslint-disable no-undef */
// deno-lint-ignore-file
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Get today's scheduled checks that are not yet completed
    const checks = await base44.asServiceRole.entities.AccountabilityCheck.filter({
      completed: false,
    });

    const todaysChecks = checks.filter((c) => {
      if (!c.scheduled_time) return false;
      const t = new Date(c.scheduled_time);
      return t >= startOfDay && t <= endOfDay;
    });

    if (todaysChecks.length === 0) {
      return Response.json({ success: true, sent: 0, message: "No pending checks today." });
    }

    // Group by user to send one email per user
    const byUser = {};
    for (const check of todaysChecks) {
      if (!byUser[check.user_email]) byUser[check.user_email] = [];
      byUser[check.user_email].push(check);
    }

    let sent = 0;
    for (const [email, userChecks] of Object.entries(byUser)) {
      const checkList = userChecks
        .map((c) => `• ${c.check_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}`)
        .join("\n");

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "⏰ Daily Accountability Check-In Reminder",
        body: `Hi there,\n\nThis is your friendly reminder to complete today's accountability check-in.\n\nPending check-ins:\n${checkList}\n\nStaying consistent is key to your growth. Log in now to complete your check-in and keep your streak going!\n\nYour AI Freedom Studios Coaching Team`,
      });
      sent++;
    }

    return Response.json({ success: true, sent, users: Object.keys(byUser) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});