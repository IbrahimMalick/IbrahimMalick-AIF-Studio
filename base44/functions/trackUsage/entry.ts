import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation_type, amount = 1 } = await req.json();

    if (!operation_type) {
      return Response.json({ error: 'operation_type required' }, { status: 400 });
    }

    // Get or create current month metrics
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const existing = await base44.asServiceRole.entities.UsageMetrics.filter({
      user_email: user.email,
      period: 'monthly',
      period_start: monthStart.toISOString()
    });

    let metrics = existing[0];

    if (!metrics) {
      // Get user tier from User entity
      const userData = await base44.auth.me();
      const tier = userData.subscription_tier || 'free';
      
      // Define tier limits
      const tierLimits = {
        free: {
          agents_limit: 1,
          llm_tokens_limit: 10000,
          video_minutes_limit: 0,
          api_calls_limit: 100,
          storage_mb_limit: 100
        },
        starter: {
          agents_limit: 5,
          llm_tokens_limit: 500000,
          video_minutes_limit: 10,
          api_calls_limit: 10000,
          storage_mb_limit: 5000
        },
        professional: {
          agents_limit: 50,
          llm_tokens_limit: 5000000,
          video_minutes_limit: 100,
          api_calls_limit: 100000,
          storage_mb_limit: 50000
        },
        enterprise: {
          agents_limit: 999,
          llm_tokens_limit: 999999999,
          video_minutes_limit: 9999,
          api_calls_limit: 999999999,
          storage_mb_limit: 999999999
        }
      };

      const limits = tierLimits[tier] || tierLimits.free;

      metrics = await base44.asServiceRole.entities.UsageMetrics.create({
        user_email: user.email,
        tier,
        period: 'monthly',
        period_start: monthStart.toISOString(),
        period_end: monthEnd.toISOString(),
        last_reset: now.toISOString(),
        ...limits
      });
    }

    // Increment usage based on operation type
    const updates = {};
    let metric_key = null;

    switch (operation_type) {
      case 'llm_tokens':
        updates.llm_tokens_used = (metrics.llm_tokens_used || 0) + amount;
        metric_key = 'llm_tokens_used';
        break;
      case 'api_call':
        updates.api_calls_used = (metrics.api_calls_used || 0) + amount;
        metric_key = 'api_calls_used';
        break;
      case 'video_minute':
        updates.video_minutes_used = (metrics.video_minutes_used || 0) + amount;
        metric_key = 'video_minutes_used';
        break;
      case 'storage_mb':
        updates.storage_mb_used = (metrics.storage_mb_used || 0) + amount;
        metric_key = 'storage_mb_used';
        break;
      case 'agent_created':
        updates.agents_created = (metrics.agents_created || 0) + 1;
        metric_key = 'agents_created';
        break;
      default:
        return Response.json({ error: 'Unknown operation_type' }, { status: 400 });
    }

    // Update cost estimate (basic pricing)
    const costsPerOperation = {
      llm_tokens: 0.00002, // per token
      api_call: 0.001,
      video_minute: 0.10,
      storage_mb: 0.01,
      agent_created: 0
    };

    const operationCost = (costsPerOperation[operation_type] || 0) * amount;
    updates.cost_usd = (metrics.cost_usd || 0) + operationCost;

    // Check if over limit
    const limitKey = `${metric_key.replace('_used', '')}_limit`;
    const isOverLimit = updates[metric_key] > metrics[limitKey];

    const updated = await base44.asServiceRole.entities.UsageMetrics.update(metrics.id, updates);

    return Response.json({
      success: true,
      metrics: updated,
      over_limit: isOverLimit,
      usage_percent: Math.round((updated[metric_key] / metrics[limitKey]) * 100)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});