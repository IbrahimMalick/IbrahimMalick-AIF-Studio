import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Alert thresholds and their labels
const ALERT_THRESHOLDS = [
  { percent: 75, key: 'alert_75_sent', label: '75%', urgency: 'approaching' },
  { percent: 90, key: 'alert_90_sent', label: '90%', urgency: 'critical' },
  { percent: 100, key: 'alert_100_sent', label: '100%', urgency: 'exceeded' },
];

function formatNumber(n) {
  return n?.toLocaleString?.() ?? n;
}

function buildEmailBody(user_email, threshold, metrics) {
  const { llm_tokens_used, llm_tokens_limit, tier, cost_usd, period_end } = metrics;
  const usedPct = Math.round((llm_tokens_used / llm_tokens_limit) * 100);
  const remaining = Math.max(0, llm_tokens_limit - llm_tokens_used);
  const resetDate = period_end ? new Date(period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'end of month';

  const urgencyMap = {
    approaching: { emoji: '⚠️', color: '#F59E0B', headline: "You've used 75% of your monthly AI token limit" },
    critical: { emoji: '🔴', color: '#EF4444', headline: "You've used 90% of your monthly AI token limit — act now!" },
    exceeded: { emoji: '🚨', color: '#DC2626', headline: "You've hit 100% of your monthly AI token limit" },
  };

  const { emoji, color, headline } = urgencyMap[threshold.urgency];

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0B0B0C; color: #E2E8F0; margin: 0; padding: 0;">
  <div style="max-width: 580px; margin: 40px auto; background: #111317; border-radius: 12px; overflow: hidden; border: 1px solid #1E293B;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 32px 40px; border-bottom: 1px solid ${color}40;">
      <div style="font-size: 28px; margin-bottom: 8px;">${emoji}</div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: ${color};">${headline}</h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">
      <p style="color: #94A3B8; margin: 0 0 24px 0; font-size: 15px;">
        Hi there,<br><br>
        Your AI Freedom Studios account has used <strong style="color: #F1F5F9;">${usedPct}%</strong> of your monthly AI token quota.
      </p>

      <!-- Usage Bar -->
      <div style="background: #1E293B; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 13px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Token Usage</span>
          <span style="font-size: 13px; font-weight: 700; color: ${color};">${usedPct}%</span>
        </div>
        <div style="background: #0F172A; border-radius: 999px; height: 8px; overflow: hidden;">
          <div style="background: ${color}; width: ${Math.min(usedPct, 100)}%; height: 100%; border-radius: 999px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <span style="font-size: 12px; color: #475569;">${formatNumber(llm_tokens_used)} used</span>
          <span style="font-size: 12px; color: #475569;">${formatNumber(remaining)} remaining of ${formatNumber(llm_tokens_limit)}</span>
        </div>
      </div>

      <!-- Stats Row -->
      <div style="display: flex; gap: 12px; margin-bottom: 24px;">
        <div style="flex: 1; background: #1E293B; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">Plan Tier</div>
          <div style="font-size: 16px; font-weight: 700; color: #F1F5F9; text-transform: capitalize;">${tier || 'Free'}</div>
        </div>
        <div style="flex: 1; background: #1E293B; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">Est. Cost</div>
          <div style="font-size: 16px; font-weight: 700; color: #F1F5F9;">$${(cost_usd || 0).toFixed(2)}</div>
        </div>
        <div style="flex: 1; background: #1E293B; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">Resets On</div>
          <div style="font-size: 14px; font-weight: 700; color: #F1F5F9;">${resetDate}</div>
        </div>
      </div>

      ${threshold.urgency === 'exceeded' ? `
      <div style="background: #7F1D1D20; border: 1px solid #EF444440; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #FCA5A5; font-size: 14px;">
          🚨 <strong>Your token limit has been reached.</strong> New AI generation requests may be paused or throttled until your quota resets or you upgrade your plan.
        </p>
      </div>
      ` : `
      <div style="background: #78350F20; border: 1px solid ${color}40; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #FCD34D; font-size: 14px;">
          💡 <strong>Tip:</strong> Consider upgrading your plan or reducing AI generation frequency to avoid hitting your limit before ${resetDate}.
        </p>
      </div>
      `}

      <p style="color: #64748B; font-size: 13px; margin: 0;">
        You can monitor your full usage in the <strong>AI Insights</strong> dashboard. This alert was sent because you reached the ${threshold.label} usage threshold.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #0B0B0C; padding: 20px 40px; border-top: 1px solid #1E293B; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #334155;">© 2024 AI Freedom Studios · All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
`.trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This runs as a scheduled job — use service role
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all current-month usage metrics records
    const allMetrics = await base44.asServiceRole.entities.UsageMetrics.filter({
      period: 'monthly',
      period_start: monthStart.toISOString()
    });

    if (!allMetrics || allMetrics.length === 0) {
      return Response.json({ success: true, message: 'No metrics found', alerts_sent: 0 });
    }

    let alerts_sent = 0;
    const results = [];

    for (const metrics of allMetrics) {
      const { llm_tokens_used = 0, llm_tokens_limit = 100000, user_email } = metrics;
      if (!user_email || !llm_tokens_limit) continue;

      const usedPct = (llm_tokens_used / llm_tokens_limit) * 100;

      for (const threshold of ALERT_THRESHOLDS) {
        if (usedPct < threshold.percent) continue;

        // Check if alert already sent for this threshold this month
        if (metrics[threshold.key]) continue;

        // Send email alert
        const subject = threshold.urgency === 'exceeded'
          ? `🚨 Token Limit Reached — AI Freedom Studios`
          : `${threshold.urgency === 'critical' ? '🔴' : '⚠️'} ${threshold.label} Token Usage Alert — AI Freedom Studios`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user_email,
          subject,
          body: buildEmailBody(user_email, threshold, metrics),
          from_name: 'AI Freedom Studios'
        });

        // Mark alert as sent so we don't re-send this month
        const flagUpdate = { [threshold.key]: true, overage_alerts_sent: (metrics.overage_alerts_sent || 0) + 1 };
        await base44.asServiceRole.entities.UsageMetrics.update(metrics.id, flagUpdate);
        // Update local copy so subsequent thresholds in loop see the incremented count
        metrics.overage_alerts_sent = (metrics.overage_alerts_sent || 0) + 1;

        alerts_sent++;
        results.push({ user_email, threshold: threshold.label, sent: true });
      }
    }

    return Response.json({ success: true, alerts_sent, results });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});