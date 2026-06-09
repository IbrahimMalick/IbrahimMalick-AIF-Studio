import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { event, data } = body;

    // Only act on new share records
    if (event?.type !== 'create') {
      return Response.json({ skipped: true });
    }

    const share = data;
    if (!share || !share.shared_with_email || !share.owner_email) {
      return Response.json({ error: 'Missing share data' }, { status: 400 });
    }

    const typeLabel = share.share_type === 'template'
      ? 'Content Template'
      : share.share_type === 'collection'
      ? 'Content Collection'
      : 'Brand Voice Profile';

    const permissionLabel = share.permission === 'edit' ? 'edit' : 'view';

    // --- 1. Send email notification ---
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: share.shared_with_email,
      subject: `📋 ${share.owner_email} shared a ${typeLabel} with you`,
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:8px;">
          <h2 style="color:#1e293b;margin-bottom:8px;">New ${typeLabel} Shared With You</h2>
          <p style="color:#475569;margin-bottom:16px;">
            <strong>${share.owner_email}</strong> has shared <strong>"${share.resource_name}"</strong> with you for <strong>${permissionLabel}</strong> access.
          </p>
          ${share.message ? `<blockquote style="border-left:4px solid #6366f1;padding:8px 16px;color:#64748b;background:#fff;border-radius:4px;margin-bottom:16px;">"${share.message}"</blockquote>` : ''}
          <p style="color:#475569;">Log in to your AI Freedom Studios account to review this ${typeLabel.toLowerCase()}.</p>
          <a href="https://app.aifreedomstudios.com/AIContentHub" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
            View ${typeLabel} →
          </a>
          <p style="margin-top:24px;font-size:12px;color:#94a3b8;">AI Freedom Studios • Automated Notification</p>
        </div>
      `,
    });

    // --- 2. Check if recipient is a manager/admin and send Slack alert ---
    const users = await base44.asServiceRole.entities.User.filter({ email: share.shared_with_email });
    const recipient = users?.[0];

    const isManager = recipient && (
      recipient.role === 'admin' ||
      recipient.custom_role === 'manager' ||
      recipient.custom_role === 'super_admin'
    );

    if (isManager) {
      // Try to get Slack integration channel for the recipient
      const slackConfigs = await base44.asServiceRole.entities.SlackIntegration.filter({
        user_email: share.shared_with_email,
        is_active: true,
      });

      if (slackConfigs && slackConfigs.length > 0) {
        const channel_id = slackConfigs[0].channel_id;

        const { accessToken } = await base44.asServiceRole.connectors.getConnection('slackbot');

        const emoji = share.share_type === 'template' ? '📋' : share.share_type === 'collection' ? '📁' : '🎙️';

        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: channel_id,
            text: `${emoji} New ${typeLabel} Shared for Review`,
            attachments: [{
              color: '#6366f1',
              fields: [
                { title: 'Resource', value: share.resource_name, short: true },
                { title: 'Shared By', value: share.owner_email, short: true },
                { title: 'Access Level', value: permissionLabel.toUpperCase(), short: true },
                { title: 'Type', value: typeLabel, short: true },
                ...(share.message ? [{ title: 'Message', value: share.message, short: false }] : []),
              ],
              footer: 'AI Freedom Studios',
              ts: Math.floor(Date.now() / 1000),
            }],
            username: 'Content Share Alerts',
            icon_emoji: ':bell:',
          }),
        });
      }
    }

    return Response.json({ success: true, email_sent: true, slack_sent: isManager });
  } catch (error) {
    console.error('notifyShareRecipient error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});