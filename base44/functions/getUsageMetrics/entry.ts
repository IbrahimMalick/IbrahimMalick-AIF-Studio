import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current month metrics
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const metrics = await base44.asServiceRole.entities.UsageMetrics.filter({
      user_email: user.email,
      period: 'monthly',
      period_start: monthStart.toISOString()
    });

    if (!metrics || metrics.length === 0) {
      return Response.json({
        success: false,
        message: 'No metrics found'
      }, { status: 404 });
    }

    const m = metrics[0];

    return Response.json({
      success: true,
      tier: m.tier,
      usage: {
        agents: { used: m.agents_created, limit: m.agents_limit, percent: Math.round((m.agents_created / m.agents_limit) * 100) },
        llm_tokens: { used: m.llm_tokens_used, limit: m.llm_tokens_limit, percent: Math.round((m.llm_tokens_used / m.llm_tokens_limit) * 100) },
        video_minutes: { used: m.video_minutes_used, limit: m.video_minutes_limit, percent: Math.round((m.video_minutes_used / m.video_minutes_limit) * 100) },
        api_calls: { used: m.api_calls_used, limit: m.api_calls_limit, percent: Math.round((m.api_calls_used / m.api_calls_limit) * 100) },
        storage_mb: { used: m.storage_mb_used, limit: m.storage_mb_limit, percent: Math.round((m.storage_mb_used / m.storage_mb_limit) * 100) }
      },
      cost_usd: m.cost_usd,
      period_start: m.period_start,
      period_end: m.period_end
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});