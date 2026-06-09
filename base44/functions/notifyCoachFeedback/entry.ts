/* eslint-disable no-undef */
// deno-lint-ignore-file
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data, old_data } = payload;

    // Only notify when coach_feedback was just added (wasn't set before, is set now)
    const hadFeedback = old_data?.coach_feedback && old_data.coach_feedback.trim().length > 0;
    const hasFeedback = data?.coach_feedback && data.coach_feedback.trim().length > 0;

    if (hadFeedback || !hasFeedback) {
      return Response.json({ success: true, skipped: true, reason: "No new feedback to notify." });
    }

    const userEmail = data.user_email;
    const checkType = (data.check_type || "check-in").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    const feedback = data.coach_feedback;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: `💬 Your Coach Has Responded to Your ${checkType}`,
      body: `Hi there,\n\nYour coach has left feedback on your recent ${checkType}:\n\n"${feedback}"\n\nLog in to review your check-in, take action on the guidance, and keep building momentum!\n\nYour AI Freedom Studios Coaching Team`,
    });

    return Response.json({ success: true, notified: userEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});