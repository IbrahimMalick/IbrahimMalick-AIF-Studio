// deno-lint-ignore-file no-undef
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Triggered when an Asset is published (is_published = true).
 * Reads per-platform schedule configs (PlatformScheduleConfig entity) for the asset owner
 * and creates ScheduledPost records for each active platform config.
 */
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // Support both direct invocation and entity automation payload
    const assetId = body.asset_id || body.event?.entity_id || body.data?.id;
    const assetData = body.data || null;

    if (!assetId) {
      return Response.json({ error: 'asset_id required' }, { status: 400 });
    }

    // Fetch the asset (use data from payload if available to avoid extra call)
    const asset = assetData?.id ? assetData : await base44.asServiceRole.entities.Asset.get(assetId);

    if (!asset || !asset.is_published) {
      return Response.json({ skipped: true, reason: 'Asset not published' });
    }

    // Only handle image and video assets
    if (!['image', 'video'].includes(asset.file_type)) {
      return Response.json({ skipped: true, reason: 'Asset type not supported for social posting' });
    }

    // Fetch platform schedule configs — look for configs belonging to whoever published it
    const configs = await base44.asServiceRole.entities.PlatformScheduleConfig.filter({
      is_active: true
    });

    if (!configs || configs.length === 0) {
      return Response.json({ skipped: true, reason: 'No active platform schedule configs found' });
    }

    const contentType = asset.file_type === 'video' ? 'video' : 'image';
    const created = [];

    for (const config of configs) {
      // Calculate next scheduled time based on platform's preferred_time and day_offset
      const now = new Date();
      const scheduledDate = new Date(now);

      // day_offset: 0 = today, 1 = tomorrow, etc.
      scheduledDate.setDate(scheduledDate.getDate() + (config.day_offset || 0));

      // preferred_time is "HH:MM" in UTC
      if (config.preferred_time) {
        const [hours, minutes] = config.preferred_time.split(':').map(Number);
        scheduledDate.setUTCHours(hours, minutes, 0, 0);
        // If the time already passed today, push to next day
        if (scheduledDate <= now && (config.day_offset || 0) === 0) {
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        }
      }

      const post = await base44.asServiceRole.entities.ScheduledPost.create({
        user_email: config.user_email,
        content_type: contentType,
        content_url: asset.file_url,
        caption: config.default_caption_template
          ? config.default_caption_template
              .replace('{{title}}', asset.title || '')
              .replace('{{tags}}', (asset.tags || []).join(' '))
          : asset.title || '',
        title: asset.title || '',
        description: asset.description || '',
        hashtags: asset.tags || [],
        platforms: [config.platform],
        schedule_time: scheduledDate.toISOString(),
        status: 'scheduled',
        source_entity_type: 'Asset',
        source_entity_id: asset.id,
        auto_generated: true
      });

      created.push({ platform: config.platform, post_id: post.id, scheduled_for: scheduledDate.toISOString() });
    }

    return Response.json({ success: true, posts_created: created.length, posts: created });
  } catch (error) {
    console.error('autoScheduleAssetToSocial error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});