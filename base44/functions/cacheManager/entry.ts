import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, cache_key, value, entity_type, ttl_seconds = 3600, tags = [] } = await req.json();

    if (!action) {
      return Response.json({ error: 'action required' }, { status: 400 });
    }

    switch (action) {
      case 'set': {
        if (!cache_key || !value || !entity_type) {
          return Response.json({ error: 'cache_key, value, entity_type required' }, { status: 400 });
        }

        const expiresAt = new Date(Date.now() + ttl_seconds * 1000).toISOString();
        const sizeBytes = JSON.stringify(value).length;

        const entry = await base44.asServiceRole.entities.CacheEntry.create({
          cache_key,
          value: JSON.stringify(value),
          entity_type,
          ttl_seconds,
          expires_at: expiresAt,
          size_bytes: sizeBytes,
          tags,
          last_accessed: new Date().toISOString()
        });

        return Response.json({ success: true, cache_id: entry.id });
      }

      case 'get': {
        if (!cache_key) {
          return Response.json({ error: 'cache_key required' }, { status: 400 });
        }

        const entries = await base44.asServiceRole.entities.CacheEntry.filter({
          cache_key,
          expires_at: { $gt: new Date().toISOString() }
        });

        if (!entries || entries.length === 0) {
          return Response.json({ cached_value: null, hit: false });
        }

        const entry = entries[0];
        await base44.asServiceRole.entities.CacheEntry.update(entry.id, {
          hit_count: (entry.hit_count || 0) + 1,
          last_accessed: new Date().toISOString()
        });

        return Response.json({
          cached_value: JSON.parse(entry.value),
          hit: true,
          hit_count: entry.hit_count + 1
        });
      }

      case 'invalidate': {
        if (!cache_key && tags?.length === 0) {
          return Response.json({ error: 'cache_key or tags required' }, { status: 400 });
        }

        let query = {};
        if (cache_key) {
          query.cache_key = cache_key;
        } else if (tags?.length > 0) {
          query.tags = { $in: tags };
        }

        const entries = await base44.asServiceRole.entities.CacheEntry.filter(query);
        let deleted = 0;

        for (const entry of entries) {
          await base44.asServiceRole.entities.CacheEntry.delete(entry.id);
          deleted++;
        }

        return Response.json({ success: true, deleted_count: deleted });
      }

      case 'cleanup': {
        // Remove expired entries
        const expired = await base44.asServiceRole.entities.CacheEntry.filter({
          expires_at: { $lt: new Date().toISOString() }
        });

        let deleted = 0;
        for (const entry of expired) {
          await base44.asServiceRole.entities.CacheEntry.delete(entry.id);
          deleted++;
        }

        return Response.json({ success: true, cleaned_entries: deleted });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});