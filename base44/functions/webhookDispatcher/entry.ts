import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createHmac } from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, event_type, event_data, webhook_id } = await req.json();

    if (!action) {
      return Response.json({ error: 'action required' }, { status: 400 });
    }

    switch (action) {
      case 'trigger': {
        if (!event_type || !event_data) {
          return Response.json({ error: 'event_type and event_data required' }, { status: 400 });
        }

        // Get all active webhooks subscribed to this event
        const webhooks = await base44.asServiceRole.entities.WebhookEndpoint.filter({
          event_types: { $in: [event_type] },
          is_active: true
        });

        if (!webhooks || webhooks.length === 0) {
          return Response.json({ success: true, triggered: 0 });
        }

        let triggered = 0;

        for (const webhook of webhooks) {
          // Create log entry
          const logEntry = await base44.asServiceRole.entities.WebhookLog.create({
            webhook_id: webhook.id,
            event_type,
            event_data,
            delivery_status: 'pending',
            attempt_number: 1,
            timestamp: new Date().toISOString()
          });

          // Try to deliver
          try {
            const signature = createHmac('sha256', webhook.secret)
              .update(JSON.stringify(event_data))
              .digest('hex');

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(webhook.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Event-Type': event_type,
                'X-Attempt': '1'
              },
              body: JSON.stringify(event_data),
              signal: controller.signal
            });

            clearTimeout(timeout);

            const deliveryStatus = response.ok ? 'delivered' : 'failed';
            const responseBody = await response.text();

            await base44.asServiceRole.entities.WebhookLog.update(logEntry.id, {
              status_code: response.status,
              response_body: responseBody.substring(0, 500),
              delivery_status: deliveryStatus,
              response_time_ms: Date.now() - new Date(logEntry.created_date).getTime(),
              timestamp: new Date().toISOString()
            });

            if (response.ok) {
              // Update webhook success rate
              await base44.asServiceRole.entities.WebhookEndpoint.update(webhook.id, {
                last_triggered: new Date().toISOString(),
                consecutive_failures: 0
              });
              triggered++;
            } else {
              // Schedule retry
              const retryAt = new Date(Date.now() + webhook.retry_policy.initial_delay_seconds * 1000);
              await base44.asServiceRole.entities.WebhookLog.update(logEntry.id, {
                delivery_status: 'scheduled_retry',
                next_retry_at: retryAt.toISOString()
              });

              // Update failure count
              const newFailureCount = (webhook.consecutive_failures || 0) + 1;
              if (newFailureCount >= webhook.failure_threshold) {
                await base44.asServiceRole.entities.WebhookEndpoint.update(webhook.id, {
                  is_active: false,
                  consecutive_failures: newFailureCount
                });
              } else {
                await base44.asServiceRole.entities.WebhookEndpoint.update(webhook.id, {
                  consecutive_failures: newFailureCount
                });
              }
            }
          } catch (error) {
            // Network error, schedule retry
            const retryAt = new Date(Date.now() + webhook.retry_policy.initial_delay_seconds * 1000);
            await base44.asServiceRole.entities.WebhookLog.update(logEntry.id, {
              delivery_status: 'scheduled_retry',
              next_retry_at: retryAt.toISOString(),
              error_message: error.message
            });
          }
        }

        return Response.json({ success: true, triggered });
      }

      case 'retry': {
        if (!webhook_id) {
          return Response.json({ error: 'webhook_id required' }, { status: 400 });
        }

        // Get pending logs for this webhook
        const logs = await base44.asServiceRole.entities.WebhookLog.filter(
          { webhook_id, delivery_status: 'scheduled_retry', next_retry_at: { $lte: new Date().toISOString() } },
          'created_date',
          10
        );

        let retried = 0;

        for (const log of logs) {
          if (log.attempt_number >= 5) {
            await base44.asServiceRole.entities.WebhookLog.update(log.id, {
              delivery_status: 'failed'
            });
            continue;
          }

          const webhook = (await base44.asServiceRole.entities.WebhookEndpoint.filter({ id: webhook_id }))[0];
          
          try {
            const signature = createHmac('sha256', webhook.secret)
              .update(JSON.stringify(log.event_data))
              .digest('hex');

            const response = await fetch(webhook.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Event-Type': log.event_type,
                'X-Attempt': String(log.attempt_number + 1)
              },
              body: JSON.stringify(log.event_data)
            });

            if (response.ok) {
              await base44.asServiceRole.entities.WebhookLog.update(log.id, {
                delivery_status: 'delivered',
                status_code: response.status
              });
              retried++;
            } else {
              const nextDelay = webhook.retry_policy.initial_delay_seconds * Math.pow(webhook.retry_policy.backoff_multiplier, log.attempt_number);
              const retryAt = new Date(Date.now() + nextDelay * 1000);
              await base44.asServiceRole.entities.WebhookLog.update(log.id, {
                attempt_number: log.attempt_number + 1,
                next_retry_at: retryAt.toISOString()
              });
            }
          } catch (error) {
            const nextDelay = webhook.retry_policy.initial_delay_seconds * Math.pow(webhook.retry_policy.backoff_multiplier, log.attempt_number);
            const retryAt = new Date(Date.now() + nextDelay * 1000);
            await base44.asServiceRole.entities.WebhookLog.update(log.id, {
              attempt_number: log.attempt_number + 1,
              next_retry_at: retryAt.toISOString(),
              error_message: error.message
            });
          }
        }

        return Response.json({ success: true, retried });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});