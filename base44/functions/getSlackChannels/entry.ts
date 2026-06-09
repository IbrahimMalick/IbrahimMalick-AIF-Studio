import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('slackbot');

    // Fetch Slack channels
    const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=100', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const data = await response.json();

    if (!data.ok) {
      return Response.json({ error: data.error }, { status: 400 });
    }

    const channels = data.channels.map(c => ({
      id: c.id,
      name: c.name,
      is_private: c.is_private,
    }));

    return Response.json({ channels });
  } catch (error) {
    console.error('Error fetching Slack channels:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});