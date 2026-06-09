import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await req.json();
    const userTier = user.subscription_tier || 'free';
    const now = new Date();

    if (!endpoint) {
      return Response.json({ error: 'endpoint required' }, { status: 400 });
    }

    // Define rate limits per tier
    const rateLimits = {
      free: { requests_per_minute: 10, requests_per_hour: 100 },
      starter: { requests_per_minute: 60, requests_per_hour: 1000 },
      professional: { requests_per_minute: 300, requests_per_hour: 10000 },
      enterprise: { requests_per_minute: 9999, requests_per_hour: 999999 }
    };

    const limits = rateLimits[userTier];

    // Get or create rate limit bucket
    const buckets = await base44.asServiceRole.entities.RateLimitBucket.filter({
      user_email: user.email,
      endpoint
    });

    let bucket = buckets?.[0];

    if (!bucket) {
      bucket = await base44.asServiceRole.entities.RateLimitBucket.create({
        user_email: user.email,
        endpoint,
        tier: userTier,
        requests_per_minute: limits.requests_per_minute,
        requests_per_hour: limits.requests_per_hour,
        current_minute_count: 0,
        current_hour_count: 0,
        minute_window_start: now.toISOString(),
        hour_window_start: now.toISOString()
      });
    }

    // Check if windows need to reset
    const minuteWindowStart = new Date(bucket.minute_window_start);
    const hourWindowStart = new Date(bucket.hour_window_start);
    const minuteElapsed = (now - minuteWindowStart) / 1000 / 60;
    const hourElapsed = (now - hourWindowStart) / 1000 / 60 / 60;

    let updates = {};
    if (minuteElapsed > 1) {
      updates.current_minute_count = 1;
      updates.minute_window_start = now.toISOString();
    } else {
      updates.current_minute_count = bucket.current_minute_count + 1;
    }

    if (hourElapsed > 1) {
      updates.current_hour_count = 1;
      updates.hour_window_start = now.toISOString();
    } else {
      updates.current_hour_count = bucket.current_hour_count + 1;
    }

    // Check limits
    const minuteExceeded = updates.current_minute_count > limits.requests_per_minute;
    const hourExceeded = updates.current_hour_count > limits.requests_per_hour;
    const isRateLimited = minuteExceeded || hourExceeded;

    updates.is_rate_limited = isRateLimited;
    if (isRateLimited) {
      updates.reset_at = new Date(Date.now() + 60000).toISOString(); // 1 minute
    }

    await base44.asServiceRole.entities.RateLimitBucket.update(bucket.id, updates);

    return Response.json({
      allowed: !isRateLimited,
      current_minute_usage: updates.current_minute_count,
      minute_limit: limits.requests_per_minute,
      current_hour_usage: updates.current_hour_count,
      hour_limit: limits.requests_per_hour,
      reset_at: updates.reset_at || null
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});