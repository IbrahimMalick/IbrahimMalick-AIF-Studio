// deno-lint-ignore-file no-undef
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { asset_id, asset_type, asset_title, approved_by } = await req.json();

    // Find active publishing config for this asset type
    const configs = await base44.entities.AssetPublishingConfig.filter({
      asset_types: { $in: [asset_type] },
      is_active: true
    });

    if (configs.length === 0) {
      return Response.json({ error: 'No active publishing config found' }, { status: 404 });
    }

    const config = configs[0];

    // Generate auto-tags based on templates
    const auto_tags = (config.auto_tag_templates || []).map(t => t.tag_name);
    auto_tags.push(asset_type, 'auto-published', new Date().toISOString().split('T')[0]);

    // Create approval queue entry
    const queueEntry = await base44.entities.AssetApprovalQueue.create({
      asset_id,
      asset_title,
      asset_type,
      status: 'published',
      approval_date: new Date().toISOString(),
      approved_by,
      publishing_config_id: config.id,
      auto_tags,
      channels_published_to: config.destination_channels,
      published_at: new Date().toISOString(),
      published_by_automation: true
    });

    // Send Slack notification if configured
    if (config.enable_notifications && config.slack_channel) {
      try {
        await base44.functions.invoke('postSlackUpdate', {
          channel: config.slack_channel,
          message: `✅ Asset Published: ${asset_title}`,
          details: {
            asset_type,
            tags: auto_tags.join(', '),
            channels: config.destination_channels.join(', '),
            published_by: 'Automation'
          }
        });
      } catch (slackError) {
        console.error('Slack notification failed:', slackError.message);
      }
    }

    // Log audit trail
    try {
      await base44.functions.invoke('logAuditTrail', {
        action: 'publish_asset',
        entity_type: 'AssetApprovalQueue',
        entity_id: queueEntry.id,
        details: {
          asset_id,
          asset_title,
          channels: config.destination_channels,
          tags: auto_tags
        }
      });
    } catch (auditError) {
      console.error('Audit logging failed:', auditError.message);
    }

    return Response.json({
      success: true,
      queue_entry_id: queueEntry.id,
      channels_published: config.destination_channels,
      tags_applied: auto_tags
    });
  } catch (error) {
    console.error('Publishing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});