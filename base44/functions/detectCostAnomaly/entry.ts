import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, current_cost, operation_type } = await req.json();

    if (!user_email || current_cost === undefined) {
      return Response.json({ error: 'user_email and current_cost required' }, { status: 400 });
    }

    // Get historical cost data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const historicalLogs = await base44.asServiceRole.entities.UsageMetrics.filter({
      user_email,
      period_start: thirtyDaysAgo
    });

    if (!historicalLogs || historicalLogs.length === 0) {
      return Response.json({ anomaly_detected: false, reason: 'insufficient_history' });
    }

    // Calculate average cost
    const avgCost = historicalLogs.reduce((sum, log) => sum + (log.cost_usd || 0), 0) / historicalLogs.length;
    const deviation = ((current_cost - avgCost) / avgCost) * 100;
    const threshold = 50; // Alert if 50%+ over average

    if (deviation > threshold) {
      const anomaly = await base44.asServiceRole.entities.CostAnomaly.create({
        user_email,
        detection_type: 'hourly_spike',
        expected_cost: Math.round(avgCost * 100) / 100,
        actual_cost: current_cost,
        deviation_percent: Math.round(deviation),
        contributing_operation: operation_type || 'unknown',
        alert_sent: true,
        timestamp: new Date().toISOString()
      });

      // Send alert via email/slack
      await base44.integrations.Core.SendEmail({
        to: user_email,
        subject: `⚠️ Unusual spending detected - ${Math.round(deviation)}% increase`,
        body: `Your usage costs have spiked to $${current_cost.toFixed(2)} (${Math.round(deviation)}% above average). Check your dashboard to review recent activity.`
      });

      return Response.json({
        anomaly_detected: true,
        deviation_percent: Math.round(deviation),
        expected_cost: Math.round(avgCost * 100) / 100,
        actual_cost: current_cost,
        anomaly_id: anomaly.id
      });
    }

    return Response.json({ anomaly_detected: false, deviation_percent: Math.round(deviation) });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});