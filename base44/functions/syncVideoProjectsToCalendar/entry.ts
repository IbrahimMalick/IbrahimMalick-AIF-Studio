// deno-lint-ignore-file no-undef
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all video projects (service role — runs as scheduled automation)
    const projects = await base44.asServiceRole.entities.VideoProject.list();

    // Get Google Calendar access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    const authHeader = { Authorization: `Bearer ${accessToken}` };
    const syncedEvents = [];

    for (const project of projects) {
      // Only sync projects with a title and target_delivery date
      if (!project.title || !project.target_delivery) continue;

      const releaseDate = new Date(project.target_delivery);

      const eventBody = {
        summary: `📹 ${project.title} - Release`,
        description: `Video project release date\nProject ID: ${project.id}`,
        start: {
          date: releaseDate.toISOString().split('T')[0],
          timeZone: 'UTC'
        },
        end: {
          date: new Date(releaseDate.getTime() + 86400000).toISOString().split('T')[0],
          timeZone: 'UTC'
        },
        reminders: { useDefault: true }
      };

      const searchRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?q=${encodeURIComponent(project.id)}&maxResults=1`,
        { headers: authHeader }
      );
      const searchData = await searchRes.json();
      const existingEvent = searchData.items?.[0];

      if (existingEvent) {
        const updateRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEvent.id}`,
          {
            method: 'PUT',
            headers: { ...authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify(eventBody)
          }
        );
        if (updateRes.ok) syncedEvents.push({ id: project.id, action: 'updated' });
      } else {
        const createRes = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: { ...authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify(eventBody)
          }
        );
        if (createRes.ok) syncedEvents.push({ id: project.id, action: 'created' });
      }
    }

    return Response.json({
      success: true,
      synced: syncedEvents.length,
      events: syncedEvents
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});