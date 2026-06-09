import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://localhost:8787/api";

/**
 * Background engine that:
 * 1. Monitors leads and triggers nurture sequences
 * 2. Analyzes lead responses for sentiment/intent
 * 3. Dynamically adjusts sequences based on engagement
 * 4. Triggers follow-up workflows on specific actions
 * 5. Runs A/B tests on sequences
 * 6. Syncs with GoHighLevel CRM
 * 7. Executes multi-channel campaign triggers
 * 
 * Runs checks every 3 minutes
 */
export default function ProactiveNurtureEngine({ user }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Main nurture loop
    const checkAndTriggerNurture = async () => {
      try {
        await Promise.all([
          checkNewLeads(user),
          analyzeLeadResponses(user),
          processLeadActions(user),
          optimizeActiveSequences(user),
          syncNurtureToGHL(user),
          processCampaignTriggers(user)
        ]);
      } catch (error) {
        console.error('Nurture engine error:', error);
      }
    };

    checkAndTriggerNurture();
    const interval = setInterval(checkAndTriggerNurture, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const checkNewLeads = async (user) => {
    const rules = await base44.entities.NurtureRule.filter({
      user_email: user.email,
      is_active: true
    });

    if (rules.length === 0) return;

    const leads = await base44.entities.Lead.filter({
      created_by: user.email
    });

    for (const lead of leads) {
      const existingSequences = await base44.entities.LeadNurtureSequence.filter({
        lead_id: lead.id,
        sequence_status: 'active'
      });

      if (existingSequences.length > 0) continue;

      for (const rule of rules) {
        const abTests = await base44.entities.NurtureSequenceABTest.filter({
          nurture_rule_id: rule.id,
          status: 'running'
        });

        if (abTests.length > 0) {
          const match = evaluateRule(lead, rule);
          if (match) {
            await assignToABTestVariant(lead, rule, abTests[0]);
            break;
          }
        } else {
          const match = evaluateRule(lead, rule);
          if (match) {
            await triggerNurtureWorkflow(lead, rule, user);
            await base44.entities.NurtureRule.update(rule.id, {
              execution_count: (rule.execution_count || 0) + 1,
              active_leads_count: (rule.active_leads_count || 0) + 1
            });
            break;
          }
        }
      }
    }
  };

  const analyzeLeadResponses = async (user) => {
    const unprocessedResponses = await base44.entities.LeadResponse.filter({
      processed: false
    });

    for (const response of unprocessedResponses) {
      try {
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this lead response:

RESPONSE: "${response.response_text}"
CHANNEL: ${response.channel}

Provide:
1. Sentiment (-1 to 1)
2. Intent (interested, needs_more_info, ready_to_buy, not_interested, bad_timing, price_concern, question, complaint)
3. Urgency score (0-100)
4. Buying signals (0-100)
5. Objection level (none, soft, hard)
6. Recommended next action
7. Recommended delay (hours)`,
          response_json_schema: {
            type: "object",
            properties: {
              sentiment: { type: "number" },
              sentiment_label: { type: "string" },
              intent: { type: "string" },
              intent_confidence: { type: "number" },
              urgency_score: { type: "number" },
              buying_signals: { type: "number" },
              objection_level: { type: "string" },
              engagement_level: { type: "string" },
              next_best_action: { type: "string" },
              recommended_follow_up: { type: "string" },
              recommended_delay_hours: { type: "number" },
              entities_extracted: {
                type: "object",
                properties: {
                  budget_mentioned: { type: "string" },
                  timeline_mentioned: { type: "string" },
                  objections: { type: "array", items: { type: "string" } },
                  questions: { type: "array", items: { type: "string" } },
                  positive_signals: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        });

        await base44.entities.LeadResponse.update(response.id, {
          sentiment: analysis.sentiment,
          sentiment_label: analysis.sentiment_label,
          intent: analysis.intent,
          intent_confidence: analysis.intent_confidence,
          urgency_score: analysis.urgency_score,
          entities_extracted: analysis.entities_extracted,
          ai_analysis: {
            buying_signals: analysis.buying_signals,
            objection_level: analysis.objection_level,
            engagement_level: analysis.engagement_level,
            next_best_action: analysis.next_best_action,
            recommended_follow_up: analysis.recommended_follow_up,
            recommended_delay_hours: analysis.recommended_delay_hours
          },
          processed: true,
          processed_at: new Date().toISOString()
        });

        await adjustSequenceBasedOnResponse(response, analysis, user);

      } catch (error) {
        console.error(`Error analyzing response ${response.id}:`, error);
      }
    }
  };

  const processLeadActions = async (user) => {
    const recentJobs = await base44.entities.OutboundJob.filter({
      status: { $in: ['delivered', 'sent'] },
      created_by: user.email
    }, '-created_date', 100);

    for (const job of recentJobs) {
      if (!job.lead_id || !job.payload?.tracking_data) continue;

      const { link_clicked, form_submitted, email_opened } = job.payload.tracking_data;

      if (link_clicked && !job.payload.link_click_processed) {
        await triggerActionWorkflow(job.lead_id, 'link_clicked', {
          link_url: job.payload.tracking_data.clicked_url,
          job_id: job.id
        }, user);

        await base44.entities.OutboundJob.update(job.id, {
          payload: {
            ...job.payload,
            link_click_processed: true
          }
        });
      }

      if (email_opened && !job.payload.email_open_processed) {
        await updateSequenceEngagement(job.lead_id, 'email_opened');
        
        await base44.entities.OutboundJob.update(job.id, {
          payload: {
            ...job.payload,
            email_open_processed: true
          }
        });
      }

      if (form_submitted && !job.payload.form_submit_processed) {
        await triggerActionWorkflow(job.lead_id, 'form_submitted', {
          form_data: job.payload.tracking_data.form_data,
          job_id: job.id
        }, user);

        await base44.entities.OutboundJob.update(job.id, {
          payload: {
            ...job.payload,
            form_submit_processed: true
          }
        });
      }
    }
  };

  const optimizeActiveSequences = async (user) => {
    const activeSequences = await base44.entities.LeadNurtureSequence.filter({
      sequence_status: 'active'
    });

    for (const seq of activeSequences) {
      if (seq.engagement_score >= 80 && !seq.lead_responded) {
        await base44.entities.LeadNurtureSequence.update(seq.id, {
          next_touchpoint_scheduled: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        });
      }

      if (seq.engagement_score < 20 && seq.current_touchpoint >= 3) {
        await base44.entities.LeadNurtureSequence.update(seq.id, {
          sequence_status: 'paused',
          auto_paused: true,
          pause_reason: 'Low engagement - prevent spam'
        });
      }

      const lead = await base44.entities.Lead.filter({ id: seq.lead_id });
      if (lead[0] && lead[0].score >= 80) {
        await base44.entities.LeadNurtureSequence.update(seq.id, {
          qualified_during_sequence: true,
          qualified_at: new Date().toISOString(),
          sequence_status: 'converted',
          exit_reason: 'converted'
        });

        await base44.entities.Lead.update(seq.lead_id, {
          status: 'qualified'
        });
      }
    }
  };

  const syncNurtureToGHL = async (user) => {
    try {
      const ghlConfigs = await base44.entities.GoHighLevelConfig.filter({
        user_email: user.email,
        is_connected: true
      });

      if (ghlConfigs.length === 0) return;
      const ghlConfig = ghlConfigs[0];

      const convertedSequences = await base44.entities.LeadNurtureSequence.filter({
        qualified_during_sequence: true,
        sequence_status: 'converted'
      }, '-qualified_at', 10);

      for (const seq of convertedSequences) {
        if (seq.ghl_synced) continue;

        const lead = (await base44.entities.Lead.filter({ id: seq.lead_id }))[0];
        if (!lead || !lead.crm_external_id) continue;

        const rule = (await base44.entities.NurtureRule.filter({ id: seq.nurture_rule_id }))[0];

        if (rule?.ghl_integration?.ghl_pipeline_stage_id) {
          await fetch(`${API_BASE}/crm/opportunity/update-stage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ghl_location_id: ghlConfig.ghl_location_id,
              ghl_contact_id: lead.crm_external_id,
              ghl_stage_id: rule.ghl_integration.ghl_pipeline_stage_id,
              notes: `Auto-qualified through nurture sequence: ${rule.rule_name}\nEngagement Score: ${seq.engagement_score}/100`
            })
          });
        }

        if (rule?.ghl_integration?.ghl_tags_to_add) {
          await fetch(`${API_BASE}/crm/add-tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ghl_location_id: ghlConfig.ghl_location_id,
              ghl_contact_id: lead.crm_external_id,
              tags: rule.ghl_integration.ghl_tags_to_add
            })
          });
        }

        if (rule?.ghl_integration?.ghl_workflow_id) {
          await fetch(`${API_BASE}/crm/trigger-workflow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ghl_location_id: ghlConfig.ghl_location_id,
              ghl_workflow_id: rule.ghl_integration.ghl_workflow_id,
              ghl_contact_id: lead.crm_external_id,
              trigger_data: {
                nurture_rule: rule.rule_name,
                engagement_score: seq.engagement_score,
                qualified_at: seq.qualified_at,
                touchpoints_completed: seq.current_touchpoint
              }
            })
          });
        }

        await base44.entities.LeadNurtureSequence.update(seq.id, {
          ghl_synced: true,
          ghl_synced_at: new Date().toISOString()
        });

        console.log(`✅ Sequence ${seq.id} synced to GHL`);
      }

      await syncABTestResultsToGHL(user, ghlConfig);

    } catch (error) {
      console.error('GHL nurture sync error:', error);
    }
  };

  const syncABTestResultsToGHL = async (user, ghlConfig) => {
    try {
      const testsWithWinners = await base44.entities.NurtureSequenceABTest.filter({
        winning_variant: { $ne: null },
        status: 'completed'
      }, '-winner_declared_at', 5);

      for (const test of testsWithWinners) {
        const sequences = await base44.entities.LeadNurtureSequence.filter({
          nurture_rule_id: test.nurture_rule_id,
          qualified_during_sequence: true
        });

        for (const seq of sequences) {
          const lead = (await base44.entities.Lead.filter({ id: seq.lead_id }))[0];
          if (!lead?.crm_external_id) continue;

          await fetch(`${API_BASE}/crm/add-tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ghl_location_id: ghlConfig.ghl_location_id,
              ghl_contact_id: lead.crm_external_id,
              tags: [
                `${ghlConfig.tag_prefix}ab_test_winner`,
                `${ghlConfig.tag_prefix}variant_${test.winning_variant}`
              ]
            })
          });
        }
      }
    } catch (error) {
      console.error('Error syncing A/B results to GHL:', error);
    }
  };

  const adjustSequenceBasedOnResponse = async (response, analysis, user) => {
    const sequence = await base44.entities.LeadNurtureSequence.filter({
      id: response.sequence_id
    });

    if (!sequence[0]) return;
    const seq = sequence[0];

    let adjustments = {};

    if (analysis.urgency_score >= 70 && analysis.buying_signals >= 70) {
      adjustments.sequence_adjustment = {
        accelerated_sequence: true,
        adjustment_reason: 'High buying intent detected - fast-tracking to sales call'
      };

      await triggerActionWorkflow(response.lead_id, 'high_intent_detected', {
        urgency_score: analysis.urgency_score,
        buying_signals: analysis.buying_signals
      }, user);
    }

    if (analysis.objection_level === 'hard' || analysis.objection_level === 'soft') {
      const objectionHandling = await generateObjectionResponse(
        response.response_text,
        analysis.entities_extracted.objections
      );

      const lead = (await base44.entities.Lead.filter({ id: response.lead_id }))[0];
      if (lead) {
        await base44.entities.OutboundJob.create({
          job_type: response.channel,
          to: response.channel === 'sms' ? lead.phone : lead.email,
          template_id: 'objection_handler',
          payload: {
            message: objectionHandling,
            lead_id: response.lead_id,
            sequence_id: response.sequence_id,
            in_response_to: response.id
          },
          scheduled_for: new Date(Date.now() + (analysis.recommended_delay_hours || 2) * 60 * 60 * 1000).toISOString(),
          lead_id: response.lead_id
        });
      }

      adjustments.sequence_adjustment = {
        added_touchpoints: [{
          day: 0,
          channel: response.channel,
          message: objectionHandling,
          triggered_by_response: true
        }],
        adjustment_reason: `Objection handling: ${analysis.entities_extracted.objections?.join(', ')}`
      };
    }

    if (analysis.intent === 'not_interested') {
      adjustments.sequence_status = 'cancelled';
      adjustments.exit_reason = 'manual_stop';
      adjustments.auto_paused = true;
      adjustments.pause_reason = 'Lead indicated not interested';

      await base44.entities.Lead.update(response.lead_id, {
        status: 'lost',
        notes: `Not interested - responded: "${response.response_text}"`
      });
    }

    if (analysis.intent === 'ready_to_buy') {
      adjustments.sequence_status = 'converted';
      adjustments.exit_reason = 'converted';
      adjustments.human_handoff_required = true;

      await base44.entities.Notification.create({
        user_email: user.email,
        title: '🔥 Hot Lead Ready to Buy!',
        message: `Lead responded with buying intent: "${response.response_text}"`,
        type: 'warning',
        category: 'system',
        action_url: `/ReceptionistConsole`,
        action_label: 'Contact Now'
      });
    }

    const lead = (await base44.entities.Lead.filter({ id: response.lead_id }))[0];
    if (lead?.crm_external_id) {
      await syncResponseToGHL(response, analysis, lead, user);
    }

    await base44.entities.LeadResponse.update(response.id, adjustments);

    if (Object.keys(adjustments).length > 0) {
      await base44.entities.LeadNurtureSequence.update(seq.id, {
        ...adjustments,
        engagement_score: Math.min(100, (seq.engagement_score || 0) + 15)
      });
    }
  };

  const syncResponseToGHL = async (response, analysis, lead, user) => {
    try {
      const ghlConfigs = await base44.entities.GoHighLevelConfig.filter({
        user_email: user.email,
        is_connected: true
      });

      if (ghlConfigs.length === 0) return;
      const ghlConfig = ghlConfigs[0];

      await fetch(`${API_BASE}/crm/add-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ghl_location_id: ghlConfig.ghl_location_id,
          ghl_contact_id: lead.crm_external_id,
          note: `📱 Lead Response (${response.channel.toUpperCase()})

Message: "${response.response_text}"

🎯 AI Analysis:
• Intent: ${analysis.intent}
• Sentiment: ${analysis.sentiment_label} (${analysis.sentiment.toFixed(2)})
• Urgency: ${analysis.urgency_score}/100
• Buying Signals: ${analysis.buying_signals}/100
• Engagement: ${analysis.engagement_level}

💡 Next Action: ${analysis.next_best_action}

Responded at: ${new Date().toLocaleString()}`
        })
      });

      if (analysis.buying_signals >= 70) {
        const newScore = Math.max(lead.score || 0, analysis.buying_signals);
        
        await fetch(`${API_BASE}/crm/lead`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ghl_contact_id: lead.crm_external_id,
            ghl_location_id: ghlConfig.ghl_location_id,
            updates: {
              customField: {
                lead_score: newScore,
                last_response_intent: analysis.intent,
                last_response_sentiment: analysis.sentiment_label,
                urgency_score: analysis.urgency_score
              }
            }
          })
        });

        await base44.entities.Lead.update(lead.id, {
          score: newScore
        });
      }

      const intentTags = [];
      if (analysis.intent === 'ready_to_buy') {
        intentTags.push(`${ghlConfig.tag_prefix}ready_to_buy`, `${ghlConfig.tag_prefix}hot_lead`);
      } else if (analysis.intent === 'interested') {
        intentTags.push(`${ghlConfig.tag_prefix}interested`);
      } else if (analysis.intent === 'not_interested') {
        intentTags.push(`${ghlConfig.tag_prefix}not_interested`);
      } else if (analysis.objection_level !== 'none') {
        intentTags.push(`${ghlConfig.tag_prefix}objection_${analysis.objection_level}`);
      }

      if (intentTags.length > 0) {
        await fetch(`${API_BASE}/crm/add-tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ghl_location_id: ghlConfig.ghl_location_id,
            ghl_contact_id: lead.crm_external_id,
            tags: intentTags
          })
        });
      }

      console.log(`✅ Response synced to GHL for lead ${lead.id}`);
    } catch (error) {
      console.error('Error syncing response to GHL:', error);
    }
  };

  const generateObjectionResponse = async (originalMessage, objections) => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate empathetic objection-handling response:

LEAD'S MESSAGE: "${originalMessage}"
OBJECTIONS: ${objections?.join(', ')}

Create response that:
- Acknowledges their concern
- Provides value/clarity
- Maintains relationship
- Gentle re-engagement
- Max 160 characters for SMS

Tone: Helpful mentor, not pushy salesperson`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" }
        }
      }
    });

    return response.message;
  };

  const processCampaignTriggers = async (user) => {
    try {
      const triggers = await base44.entities.CampaignTrigger.filter({
        user_email: user.email,
        is_active: true
      });

      if (triggers.length === 0) return;

      for (const trigger of triggers) {
        switch (trigger.event_type) {
          case 'call_completed':
            await checkCallCompletedTriggers(trigger, user);
            break;
          case 'email_opened':
          case 'email_clicked':
            await checkEmailEventTriggers(trigger, user);
            break;
          case 'link_clicked':
            await checkLinkClickTriggers(trigger, user);
            break;
          case 'lead_score_increased':
          case 'lead_score_decreased':
            await checkScoreChangeTriggers(trigger, user);
            break;
          case 'inactivity_detected':
            await checkInactivityTriggers(trigger, user);
            break;
          case 'high_engagement_detected':
            await checkEngagementTriggers(trigger, user);
            break;
          case 'buying_signal_detected':
            await checkBuyingSignalTriggers(trigger, user);
            break;
        }
      }
    } catch (error) {
      console.error('Campaign trigger processing error:', error);
    }
  };

  const checkCallCompletedTriggers = async (trigger, user) => {
    const recentCalls = await base44.entities.CallSession.filter({
      created_by: user.email,
      status: 'completed'
    }, '-completed_at', 20);

    for (const call of recentCalls) {
      if (!call.lead_id) continue;

      const existingExecution = await base44.entities.CampaignExecution.filter({
        campaign_id: trigger.campaign_id,
        lead_id: call.lead_id
      });

      if (existingExecution.length > 0) {
        const lastExecution = existingExecution[0];
        const daysSince = (new Date() - new Date(lastExecution.started_at)) / (1000 * 60 * 60 * 24);
        if (daysSince < trigger.cooldown_period_days) continue;
      }

      if (trigger.event_filters?.call_intent && call.intent !== trigger.event_filters.call_intent) {
        continue;
      }

      if (trigger.event_filters?.call_sentiment_min && call.sentiment < trigger.event_filters.call_sentiment_min) {
        continue;
      }

      await startCampaignExecution(trigger.campaign_id, call.lead_id, user, {
        triggered_by_call: call.id
      });

      await base44.entities.CampaignTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        success_count: (trigger.success_count || 0) + 1,
        last_triggered: new Date().toISOString()
      });
    }
  };

  const checkEmailEventTriggers = async (trigger, user) => {
    const recentJobs = await base44.entities.OutboundJob.filter({
      created_by: user.email,
      job_type: 'email',
      status: 'delivered'
    }, '-sent_at', 50);

    for (const job of recentJobs) {
      if (!job.lead_id) continue;

      const shouldTrigger = 
        (trigger.event_type === 'email_opened' && job.payload?.tracking_data?.email_opened) ||
        (trigger.event_type === 'email_clicked' && job.payload?.tracking_data?.link_clicked);

      if (!shouldTrigger) continue;

      if (job.payload?.campaign_triggered) continue;

      await startCampaignExecution(trigger.campaign_id, job.lead_id, user, {
        triggered_by_email: job.id
      });

      await base44.entities.OutboundJob.update(job.id, {
        payload: {
          ...job.payload,
          campaign_triggered: true
        }
      });

      await base44.entities.CampaignTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        success_count: (trigger.success_count || 0) + 1,
        last_triggered: new Date().toISOString()
      });
    }
  };

  const checkScoreChangeTriggers = async (trigger, user) => {
    const leads = await base44.entities.Lead.filter({
      created_by: user.email
    }, '-updated_date', 50);

    for (const lead of leads) {
      if (trigger.event_filters?.score_threshold) {
        if (trigger.event_type === 'lead_score_increased' && lead.score < trigger.event_filters.score_threshold) {
          continue;
        }
        if (trigger.event_type === 'lead_score_decreased' && lead.score > trigger.event_filters.score_threshold) {
          continue;
        }
      }

      const minutesSinceUpdate = (new Date() - new Date(lead.updated_date)) / (1000 * 60);
      if (minutesSinceUpdate > 5) continue;

      const existingExecutions = await base44.entities.CampaignExecution.filter({
        campaign_id: trigger.campaign_id,
        lead_id: lead.id
      }, '-started_at', 1);

      if (existingExecutions.length > 0) {
        const daysSince = (new Date() - new Date(existingExecutions[0].started_at)) / (1000 * 60 * 60 * 24);
        if (daysSince < trigger.cooldown_period_days) continue;
      }

      await startCampaignExecution(trigger.campaign_id, lead.id, user, {
        triggered_by_score_change: lead.score
      });

      await base44.entities.CampaignTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        success_count: (trigger.success_count || 0) + 1,
        last_triggered: new Date().toISOString()
      });
    }
  };

  const checkBuyingSignalTriggers = async (trigger, user) => {
    const recentResponses = await base44.entities.LeadResponse.filter({
      intent: 'ready_to_buy',
      processed: true
    }, '-processed_at', 10);

    for (const response of recentResponses) {
      const existingExecutions = await base44.entities.CampaignExecution.filter({
        campaign_id: trigger.campaign_id,
        lead_id: response.lead_id
      });

      if (existingExecutions.length > 0) continue;

      await startCampaignExecution(trigger.campaign_id, response.lead_id, user, {
        triggered_by_response: response.id,
        buying_signals: response.ai_analysis?.buying_signals
      });

      await base44.entities.CampaignTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        success_count: (trigger.success_count || 0) + 1,
        last_triggered: new Date().toISOString()
      });
    }
  };

  const checkEngagementTriggers = async (trigger, user) => {
    const activeSequences = await base44.entities.LeadNurtureSequence.filter({
      sequence_status: 'active',
      engagement_score: { $gte: trigger.event_filters?.engagement_score_min || 80 }
    });

    for (const seq of activeSequences) {
      const existingExecutions = await base44.entities.CampaignExecution.filter({
        campaign_id: trigger.campaign_id,
        lead_id: seq.lead_id
      });

      if (existingExecutions.length > 0) continue;

      await startCampaignExecution(trigger.campaign_id, seq.lead_id, user, {
        triggered_by_engagement: seq.engagement_score
      });

      await base44.entities.CampaignTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        success_count: (trigger.success_count || 0) + 1,
        last_triggered: new Date().toISOString()
      });
    }
  };

  const checkInactivityTriggers = async (trigger, user) => {
    const leads = await base44.entities.Lead.filter({
      created_by: user.email,
      status: { $in: ['contacted', 'qualified'] }
    });

    const inactiveDays = trigger.event_filters?.days_inactive || 7;

    for (const lead of leads) {
      if (!lead.last_contact) continue;

      const daysSince = (new Date() - new Date(lead.last_contact)) / (1000 * 60 * 60 * 24);
      
      if (daysSince < inactiveDays) continue;

      const existingExecutions = await base44.entities.CampaignExecution.filter({
        campaign_id: trigger.campaign_id,
        lead_id: lead.id
      }, '-started_at', 1);

      if (existingExecutions.length > 0) {
        const daysSinceCampaign = (new Date() - new Date(existingExecutions[0].started_at)) / (1000 * 60 * 60 * 24);
        if (daysSinceCampaign < trigger.cooldown_period_days) continue;
      }

      await startCampaignExecution(trigger.campaign_id, lead.id, user, {
        triggered_by_inactivity: daysSince
      });

      await base44.entities.CampaignTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        success_count: (trigger.success_count || 0) + 1,
        last_triggered: new Date().toISOString()
      });
    }
  };

  const checkLinkClickTriggers = async (trigger, user) => {
    const recentJobs = await base44.entities.OutboundJob.filter({
      created_by: user.email,
      status: 'delivered'
    }, '-delivered_at', 50);

    for (const job of recentJobs) {
      if (!job.lead_id || !job.payload?.tracking_data?.link_clicked) continue;
      if (job.payload?.campaign_triggered) continue;

      await startCampaignExecution(trigger.campaign_id, job.lead_id, user, {
        triggered_by_link_click: job.payload.tracking_data.clicked_url
      });

      await base44.entities.OutboundJob.update(job.id, {
        payload: {
          ...job.payload,
          campaign_triggered: true
        }
      });

      await base44.entities.CampaignTrigger.update(trigger.id, {
        trigger_count: (trigger.trigger_count || 0) + 1,
        success_count: (trigger.success_count || 0) + 1,
        last_triggered: new Date().toISOString()
      });
    }
  };

  const startCampaignExecution = async (campaignId, leadId, user, metadata = {}) => {
    try {
      const campaigns = await base44.entities.MultiChannelCampaign.filter({ id: campaignId });
      if (campaigns.length === 0) return;

      const campaign = campaigns[0];

      const execution = await base44.entities.CampaignExecution.create({
        campaign_id: campaignId,
        lead_id: leadId,
        execution_status: 'running',
        current_node_id: campaign.flow_nodes[0]?.node_id,
        nodes_completed: [],
        engagement_score: 0,
        started_at: new Date().toISOString()
      });

      await executeNode(campaign, campaign.flow_nodes[0], execution, user);

      await base44.entities.MultiChannelCampaign.update(campaignId, {
        execution_count: (campaign.execution_count || 0) + 1,
        active_executions: (campaign.active_executions || 0) + 1
      });

      console.log(`✅ Campaign ${campaignId} started for lead ${leadId}`);
    } catch (error) {
      console.error('Error starting campaign execution:', error);
    }
  };

  const executeNode = async (campaign, node, execution, user) => {
    if (!node) return;

    try {
      const lead = (await base44.entities.Lead.filter({ id: execution.lead_id }))[0];
      if (!lead) return;

      let variantId = null;
      if (node.ab_test_config?.enabled) {
        const variants = node.ab_test_config.variants;
        const rand = Math.random() * 100;
        let cumulative = 0;
        
        for (const variant of variants) {
          cumulative += variant.traffic_percent;
          if (rand < cumulative) {
            variantId = variant.variant_id;
            break;
          }
        }
      }

      switch (node.node_type) {
        case 'sms':
          await executeSMS(node, lead, variantId);
          break;
        case 'email':
          await executeEmail(node, lead, variantId);
          break;
        case 'call':
          await executeCall(node, lead);
          break;
        case 'wait':
          await executeWait(node, execution);
          break;
        case 'ghl_action':
          await executeGHLAction(node, lead, user);
          break;
        case 'tag_update':
          await executeTagUpdate(node, lead);
          break;
        case 'webhook':
          await executeWebhook(node, lead, execution);
          break;
      }

      const nodesCompleted = execution.nodes_completed || [];
      nodesCompleted.push({
        node_id: node.node_id,
        node_type: node.node_type,
        executed_at: new Date().toISOString(),
        success: true,
        variant_id: variantId
      });

      await base44.entities.CampaignExecution.update(execution.id, {
        nodes_completed: nodesCompleted,
        current_node_id: node.connections?.[0]?.to_node_id || null
      });

      if (node.connections && node.connections.length > 0) {
        const nextNode = campaign.flow_nodes.find(n => n.node_id === node.connections[0].to_node_id);
        if (nextNode) {
          const delay = node.config?.delay_days || 0;
          if (delay > 0) {
            const scheduledFor = new Date();
            scheduledFor.setDate(scheduledFor.getDate() + delay);
            
            await base44.entities.CampaignExecution.update(execution.id, {
              next_node_scheduled: scheduledFor.toISOString()
            });
          } else {
            await executeNode(campaign, nextNode, execution, user);
          }
        }
      }
    } catch (error) {
      console.error(`Error executing node ${node.node_id}:`, error);
    }
  };

  const executeSMS = async (node, lead, variantId) => {
    let message = node.config?.message || '';
    
    if (variantId && node.ab_test_config?.variants) {
      const variant = node.ab_test_config.variants.find(v => v.variant_id === variantId);
      if (variant?.config?.message) {
        message = variant.config.message;
      }
    }

    message = message.replace(/\{\{name\}\}/g, lead.name || 'there')
                     .replace(/\{\{company\}\}/g, lead.company || '')
                     .replace(/\{\{score\}\}/g, lead.score || 0);

    await base44.entities.OutboundJob.create({
      job_type: 'sms',
      to: lead.phone,
      template_id: node.config?.template_id || 'custom',
      payload: {
        message,
        lead_id: lead.id,
        node_id: node.node_id,
        variant_id: variantId
      },
      scheduled_for: new Date().toISOString(),
      lead_id: lead.id
    });
  };

  const executeEmail = async (node, lead, variantId) => {
    let subject = node.config?.subject || '';
    let message = node.config?.message || '';
    
    if (variantId && node.ab_test_config?.variants) {
      const variant = node.ab_test_config.variants.find(v => v.variant_id === variantId);
      if (variant?.config) {
        subject = variant.config.subject || subject;
        message = variant.config.message || message;
      }
    }

    subject = subject.replace(/\{\{name\}\}/g, lead.name || 'there');
    message = message.replace(/\{\{name\}\}/g, lead.name || 'there')
                     .replace(/\{\{company\}\}/g, lead.company || '');

    await base44.entities.OutboundJob.create({
      job_type: 'email',
      to: lead.email,
      template_id: node.config?.template_id || 'custom',
      payload: {
        subject,
        message,
        lead_id: lead.id,
        node_id: node.node_id,
        variant_id: variantId
      },
      scheduled_for: new Date().toISOString(),
      lead_id: lead.id
    });
  };

  const executeCall = async (node, lead) => {
    await base44.entities.Appointment.create({
      lead_id: lead.id,
      calendar_id: 'primary',
      title: `Callback: ${lead.name || lead.phone}`,
      start_time: new Date(Date.now() + (node.config?.delay_days || 1) * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + (node.config?.delay_days || 1) * 24 * 60 * 60 * 1000 + (node.config?.duration || 15) * 60 * 1000).toISOString(),
      location: 'phone',
      status: 'confirmed',
      booked_by: 'campaign_automation',
      notes: `Auto-scheduled by campaign flow`
    });
  };

  const executeWait = async (node, execution) => {
    const delay = node.config?.delay_days || 1;
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + delay);
    
    await base44.entities.CampaignExecution.update(execution.id, {
      next_node_scheduled: scheduledFor.toISOString()
    });
  };

  const executeGHLAction = async (node, lead, user) => {
    const ghlConfigs = await base44.entities.GoHighLevelConfig.filter({
      user_email: user.email,
      is_connected: true
    });

    if (ghlConfigs.length === 0) return;
    const ghlConfig = ghlConfigs[0];

    switch (node.config?.action_type) {
      case 'create_opportunity':
        await fetch(`${API_BASE}/crm/opportunity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ghl_location_id: ghlConfig.ghl_location_id,
            ghl_contact_id: lead.crm_external_id,
            opportunity_data: {
              name: `Campaign Lead: ${lead.name || lead.phone}`,
              monetaryValue: lead.budget ? parseFloat(lead.budget.replace(/[^0-9.]/g, '')) : 0
            }
          })
        });
        break;
      
      case 'trigger_workflow':
        if (node.config?.ghl_workflow_id) {
          await fetch(`${API_BASE}/crm/trigger-workflow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ghl_location_id: ghlConfig.ghl_location_id,
              ghl_workflow_id: node.config.ghl_workflow_id,
              ghl_contact_id: lead.crm_external_id
            })
          });
        }
        break;
      
      case 'add_note':
        await fetch(`${API_BASE}/crm/add-note`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ghl_location_id: ghlConfig.ghl_location_id,
            ghl_contact_id: lead.crm_external_id,
            note: node.config?.note_text || `Campaign action executed`
          })
        });
        break;
    }
  };

  const executeTagUpdate = async (node, lead) => {
    const tagsToAdd = node.config?.tags_to_add || [];
    const tagsToRemove = node.config?.tags_to_remove || [];

    let currentTags = lead.tags || [];
    currentTags = [...new Set([...currentTags, ...tagsToAdd])];
    currentTags = currentTags.filter(t => !tagsToRemove.includes(t));

    await base44.entities.Lead.update(lead.id, {
      tags: currentTags
    });
  };

  const executeWebhook = async (node, lead, execution) => {
    if (!node.config?.webhook_url) return;

    await fetch(node.config.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'campaign_node_executed',
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          score: lead.score
        },
        execution: {
          id: execution.id,
          campaign_id: execution.campaign_id,
          node_id: node.node_id
        },
        timestamp: new Date().toISOString()
      })
    });
  };

  const assignToABTestVariant = async (lead, rule, abTest) => {
    const rand = Math.random() * 100;
    let selectedVariant = abTest.variants[0];

    if (abTest.variants.length >= 2) {
      const split = abTest.traffic_split?.variant_a_percent || 50;
      selectedVariant = rand < split ? abTest.variants[0] : abTest.variants[1];
    }

    const updatedVariants = abTest.variants.map(v => 
      v.variant_id === selectedVariant.variant_id
        ? {
            ...v,
            leads_assigned: (v.leads_assigned || 0) + 1,
            sequences_started: (v.sequences_started || 0) + 1
          }
        : v
    );

    await base44.entities.NurtureSequenceABTest.update(abTest.id, {
      variants: updatedVariants
    });

    const customRule = {
      ...rule,
      sequence_config: selectedVariant.sequence_config
    };

    await triggerNurtureWorkflow(lead, customRule, user, {
      ab_test_id: abTest.id,
      variant_id: selectedVariant.variant_id
    });
  };

  const triggerActionWorkflow = async (leadId, actionType, actionData, user) => {
    const lead = (await base44.entities.Lead.filter({ id: leadId }))[0];
    if (!lead) return;

    const workflows = {
      link_clicked: async () => {
        const followUp = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate follow-up message for lead who clicked: ${actionData.link_url}

Lead: ${lead.name || lead.phone}
Score: ${lead.score}

Create 1-sentence personalized follow-up asking if they have questions about what they saw.`,
          response_json_schema: {
            type: "object",
            properties: {
              message: { type: "string" }
            }
          }
        });

        await base44.entities.OutboundJob.create({
          job_type: 'sms',
          to: lead.phone,
          template_id: 'link_click_followup',
          payload: {
            message: followUp.message,
            lead_id: leadId,
            triggered_by: 'link_click'
          },
          scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          lead_id: leadId
        });

        const sequences = await base44.entities.LeadNurtureSequence.filter({
          lead_id: leadId,
          sequence_status: 'active'
        });

        if (sequences[0]) {
          await base44.entities.LeadNurtureSequence.update(sequences[0].id, {
            engagement_score: Math.min(100, (sequences[0].engagement_score || 0) + 20)
          });
        }
      },

      form_submitted: async () => {
        await base44.entities.Lead.update(leadId, {
          status: 'qualified',
          score: Math.max(lead.score || 0, 85)
        });

        await fetch(`${API_BASE}/workflows/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflowId: `callback_form_submit_${leadId}`,
            tenantId: user.email,
            steps: [{
              name: 'book_callback',
              type: 'http.request',
              input: {
                method: 'POST',
                url: `${API_BASE}/appointments/book`,
                json: {
                  lead_id: leadId,
                  calendar_id: 'primary',
                  notes: 'Form submitted - high intent lead'
                }
              }
            }]
          })
        });
      },

      high_intent_detected: async () => {
        await base44.entities.Notification.create({
          user_email: user.email,
          title: '🔥 HOT LEAD ALERT',
          message: `${lead.name || lead.phone} showed high buying intent. Contact ASAP!`,
          type: 'warning',
          category: 'system'
        });
      }
    };

    if (workflows[actionType]) {
      await workflows[actionType]();
    }
  };

  const updateSequenceEngagement = async (leadId, actionType) => {
    const sequences = await base44.entities.LeadNurtureSequence.filter({
      lead_id: leadId,
      sequence_status: 'active'
    });

    if (!sequences[0]) return;

    const engagementBoost = {
      email_opened: 10,
      link_clicked: 20,
      video_watched: 25,
      form_viewed: 15
    };

    await base44.entities.LeadNurtureSequence.update(sequences[0].id, {
      engagement_score: Math.min(100, (sequences[0].engagement_score || 0) + (engagementBoost[actionType] || 5))
    });
  };

  const evaluateRule = (lead, rule) => {
    const conditions = rule.trigger_conditions;

    if (conditions.lead_status && !conditions.lead_status.includes(lead.status)) {
      return false;
    }

    if (conditions.score_min && lead.score < conditions.score_min) return false;
    if (conditions.score_max && lead.score > conditions.score_max) return false;

    if (conditions.days_since_last_contact && lead.last_contact) {
      const daysSince = (new Date() - new Date(lead.last_contact)) / (1000 * 60 * 60 * 24);
      if (daysSince < conditions.days_since_last_contact) return false;
    }

    if (conditions.has_tags && conditions.has_tags.length > 0) {
      const hasTags = conditions.has_tags.every(tag => lead.tags?.includes(tag));
      if (!hasTags) return false;
    }

    return true;
  };

  const triggerNurtureWorkflow = async (lead, rule, user, abTestMeta = null) => {
    try {
      const sequence = await base44.entities.LeadNurtureSequence.create({
        lead_id: lead.id,
        nurture_rule_id: rule.id,
        sequence_status: 'active',
        total_touchpoints: rule.sequence_config?.touchpoints?.length || 0,
        current_touchpoint: 0,
        progress_percentage: 0,
        started_at: new Date().toISOString()
      });

      const workflowSteps = rule.sequence_config?.touchpoints?.map((touch, idx) => ({
        name: `touchpoint_${idx}`,
        type: 'http.request',
        input: {
          method: 'POST',
          url: `${API_BASE}/outbound/${touch.channel}`,
          json: {
            to: touch.channel === 'sms' ? lead.phone : lead.email,
            template_id: touch.template_id || 'custom',
            payload: {
              message: touch.message?.replace(/\{\{name\}\}/g, lead.name || 'there')
                                      .replace(/\{\{company\}\}/g, lead.company || '')
                                      .replace(/\{\{use_case\}\}/g, lead.use_case || ''),
              lead_id: lead.id,
              sequence_id: sequence.id,
              subject: touch.subject,
              tracking_data: {
                touchpoint_number: idx,
                ab_test_id: abTestMeta?.ab_test_id,
                variant_id: abTestMeta?.variant_id
              }
            },
            scheduled_for: new Date(Date.now() + (touch.day || 0) * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        saveAs: `touchpoint_${idx}_result`,
        idempotent: true,
        retries: 2
      })) || [];

      if (rule.callback_config?.enabled) {
        workflowSteps.push({
          name: 'schedule_callback',
          type: 'http.request',
          input: {
            method: 'POST',
            url: `${API_BASE}/appointments/book`,
            json: {
              lead_id: lead.id,
              calendar_id: rule.callback_config.calendar_id,
              callback_delay_days: rule.callback_config.callback_delay_days,
              duration_minutes: rule.callback_config.callback_duration_minutes,
              notes: `Auto-scheduled by nurture rule: ${rule.rule_name}${abTestMeta ? ` (Variant: ${abTestMeta.variant_id})` : ''}`
            }
          },
          saveAs: 'callback_appointment',
          retries: 1
        });
      }

      await fetch(`${API_BASE}/workflows/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: `nurture_${rule.id}_${lead.id}_${Date.now()}`,
          tenantId: user.email,
          steps: workflowSteps,
          initialContext: {
            lead: {
              id: lead.id,
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              company: lead.company,
              score: lead.score,
              use_case: lead.use_case
            },
            sequence: {
              id: sequence.id,
              rule_id: rule.id
            },
            ab_test: abTestMeta
          }
        })
      });

      await base44.entities.Lead.update(lead.id, {
        status: 'nurture',
        last_contact: new Date().toISOString()
      });

      console.log(`✅ Nurture workflow triggered for lead ${lead.id}${abTestMeta ? ` (A/B Variant: ${abTestMeta.variant_id})` : ''}`);
    } catch (error) {
      console.error('Error triggering nurture workflow:', error);
    }
  };

  return null;
}