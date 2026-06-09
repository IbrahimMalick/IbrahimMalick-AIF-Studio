import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, code, redirect_uri } = body;

    const CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET');

    if (action === 'get_auth_url') {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: redirect_uri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
        access_type: 'offline',
        prompt: 'consent',
      });
      return Response.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
    }

    if (action === 'exchange_code') {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await res.json();
      if (tokens.error) return Response.json({ error: tokens.error_description }, { status: 400 });
      return Response.json({ tokens });
    }

    if (action === 'refresh_token') {
      const { refresh_token } = body;
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
        }),
      });
      const tokens = await res.json();
      if (tokens.error) return Response.json({ error: tokens.error_description }, { status: 400 });
      return Response.json({ tokens });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});