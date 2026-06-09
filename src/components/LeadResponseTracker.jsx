import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Tracks lead responses from various channels
 * Simulates webhook receivers for:
 * - Email replies (via email service webhooks)
 * - SMS replies (via Twilio webhooks)
 * - Link clicks (via UTM tracking)
 * - Form submissions
 */
export default function LeadResponseTracker({ user }) {
  
  useEffect(() => {
    if (!user) return;

    // Listen for webhook events (simulated via custom events)
    const handleEmailReply = async (event) => {
      const { leadId, sequenceId, message, email } = event.detail;

      await base44.entities.LeadResponse.create({
        lead_id: leadId,
        sequence_id: sequenceId,
        touchpoint_number: event.detail.touchpoint_number || 0,
        channel: 'email',
        response_text: message,
        response_type: 'direct_reply',
        processed: false
      });

      console.log('📧 Email reply tracked:', leadId);
    };

    const handleSMSReply = async (event) => {
      const { leadId, sequenceId, message } = event.detail;

      await base44.entities.LeadResponse.create({
        lead_id: leadId,
        sequence_id: sequenceId,
        touchpoint_number: event.detail.touchpoint_number || 0,
        channel: 'sms',
        response_text: message,
        response_type: 'direct_reply',
        processed: false
      });

      console.log('💬 SMS reply tracked:', leadId);
    };

    const handleLinkClick = async (event) => {
      const { leadId, sequenceId, url } = event.detail;

      await base44.entities.LeadResponse.create({
        lead_id: leadId,
        sequence_id: sequenceId,
        touchpoint_number: event.detail.touchpoint_number || 0,
        channel: 'web',
        response_text: `Clicked: ${url}`,
        response_type: 'link_click',
        processed: false
      });

      // Update OutboundJob tracking
      if (event.detail.jobId) {
        const job = (await base44.entities.OutboundJob.filter({ id: event.detail.jobId }))[0];
        if (job) {
          await base44.entities.OutboundJob.update(job.id, {
            payload: {
              ...job.payload,
              tracking_data: {
                ...(job.payload.tracking_data || {}),
                link_clicked: true,
                clicked_url: url,
                clicked_at: new Date().toISOString()
              }
            }
          });
        }
      }

      console.log('🔗 Link click tracked:', leadId, url);
    };

    const handleFormSubmit = async (event) => {
      const { leadId, sequenceId, formData } = event.detail;

      await base44.entities.LeadResponse.create({
        lead_id: leadId,
        sequence_id: sequenceId,
        channel: 'web',
        response_text: `Form submitted: ${JSON.stringify(formData)}`,
        response_type: 'form_submit',
        processed: false
      });

      console.log('📝 Form submit tracked:', leadId);
    };

    // Register event listeners
    window.addEventListener('lead:email:reply', handleEmailReply);
    window.addEventListener('lead:sms:reply', handleSMSReply);
    window.addEventListener('lead:link:click', handleLinkClick);
    window.addEventListener('lead:form:submit', handleFormSubmit);

    return () => {
      window.removeEventListener('lead:email:reply', handleEmailReply);
      window.removeEventListener('lead:sms:reply', handleSMSReply);
      window.removeEventListener('lead:link:click', handleLinkClick);
      window.removeEventListener('lead:form:submit', handleFormSubmit);
    };
  }, [user]);

  return null; // Headless component
}