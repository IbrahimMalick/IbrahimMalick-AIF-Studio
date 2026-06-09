import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event, channel_id, task_data } = body;

    // Get Slack connection
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slackbot');

    // Format message based on event type
    let message = '';
    const color = event === 'completed' ? '#10B981' : event === 'failed' ? '#EF4444' : '#3B82F6';
    
    const attachments = [{
      color,
      title: `Task ${event === 'completed' ? '✅ Completed' : event === 'failed' ? '❌ Failed' : '⏳ Started'}`,
      fields: [
        {
          title: 'Task Type',
          value: task_data.task_type?.replace('_', ' ').toUpperCase() || 'Unknown',
          short: true,
        },
        {
          title: 'Agent',
          value: (task_data.assigned_to || 'unknown').toUpperCase(),
          short: true,
        },
        task_data.llm_model && {
          title: 'Model',
          value: task_data.llm_model,
          short: true,
        },
        task_data.tokens_used > 0 && {
          title: 'Tokens Used',
          value: task_data.tokens_used.toLocaleString(),
          short: true,
        },
        event === 'failed' && task_data.error_message && {
          title: 'Error',
          value: task_data.error_message,
          short: false,
        },
        {
          title: 'Project',
          value: `Project ${task_data.project_id?.slice(-8) || 'N/A'}`,
          short: true,
        },
        {
          title: 'Time',
          value: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          short: true,
        },
      ].filter(Boolean),
      ts: Math.floor(Date.now() / 1000),
    }];

    // Post to Slack
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channel_id,
        text: `Agent Task ${event === 'completed' ? 'Completed' : event === 'failed' ? 'Failed' : 'Started'}`,
        attachments,
        username: 'AI Freedom Agents',
        icon_emoji: ':robot_face:',
      }),
    });

    const slackRes = await response.json();

    if (!slackRes.ok) {
      console.error('Slack error:', slackRes.error);
      return Response.json({ error: slackRes.error }, { status: 400 });
    }

    return Response.json({ success: true, ts: slackRes.ts });
  } catch (error) {
    console.error('Error posting to Slack:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});