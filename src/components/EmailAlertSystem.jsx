import { base44 } from "@/api/base44Client";

/**
 * Email Alert System
 * Sends beautiful, actionable alerts to users
 */

export class EmailAlertSystem {
  /**
   * Send integration failure alert
   */
  static async sendIntegrationFailureAlert(userEmail, integrationType, errorMessage) {
    const subject = `⚠️ ${integrationType} Connection Issue`;
    
    const bodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #0B0B0C; color: #EDEDED; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #151515 0%, #1A1A1A 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 215, 0, 0.2); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #FFD700, #00D4C9); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
          h1 { color: #FFD700; margin: 0; font-size: 24px; }
          .alert-box { background: rgba(255, 68, 51, 0.1); border-left: 4px solid #FF4433; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alert-box p { margin: 0; color: #EDEDED; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FFD700, #00D4C9); color: #000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .cta-button:hover { opacity: 0.9; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 215, 0, 0.2); color: #888; font-size: 12px; }
          .steps { background: rgba(255, 215, 0, 0.05); padding: 20px; border-radius: 8px; margin: 20px 0; }
          .steps ol { margin: 10px 0; padding-left: 20px; }
          .steps li { margin: 8px 0; color: #EDEDED; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚠️</div>
            <h1>Integration Alert</h1>
          </div>
          
          <div class="alert-box">
            <p><strong>Your ${integrationType} integration has stopped working.</strong></p>
            <p style="margin-top: 10px; color: #AAA;">${errorMessage || 'Connection could not be established.'}</p>
          </div>
          
          <p>Don't worry! This is usually a quick fix. Your automations are paused until reconnection.</p>
          
          <div class="steps">
            <strong>How to fix:</strong>
            <ol>
              <li>Click the button below to reconnect</li>
              <li>Re-enter your API key or re-authorize</li>
              <li>We'll test the connection automatically</li>
            </ol>
          </div>
          
          <center>
            <a href="https://app.aifreedomduane.com/Integrations" class="cta-button">
              Reconnect ${integrationType}
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #AAA; font-size: 14px;">
            Need help? Reply to this email or ask our AI coach in the app.
          </p>
          
          <div class="footer">
            <p>AIFreedomDuane Studio</p>
            <p>You're receiving this because your integration needs attention.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const bodyText = `
      ⚠️ ${integrationType} Connection Issue
      
      Your ${integrationType} integration has stopped working.
      ${errorMessage || 'Connection could not be established.'}
      
      How to fix:
      1. Visit https://app.aifreedomduane.com/Integrations
      2. Re-enter your API key or re-authorize
      3. We'll test the connection automatically
      
      Need help? Reply to this email or ask our AI coach.
      
      - AIFreedomDuane Studio
    `;

    try {
      // Send email via Base44 integration
      await base44.integrations.Core.SendEmail({
        from_name: "AIFreedomDuane Studio",
        to: userEmail,
        subject: subject,
        body: bodyHtml
      });

      // Log the alert
      await base44.entities.EmailAlert.create({
        user_email: userEmail,
        alert_type: "integration_failed",
        subject: subject,
        body_html: bodyHtml,
        body_text: bodyText,
        severity: "warning",
        action_url: "/Integrations",
        action_label: `Reconnect ${integrationType}`,
        sent_at: new Date().toISOString(),
        metadata: {
          integration_type: integrationType,
          error_message: errorMessage
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send email alert:", error);
      return { success: false, error };
    }
  }

  /**
   * Send setup incomplete reminder
   */
  static async sendSetupIncompleteReminder(userEmail, wizardId, currentStep) {
    const subject = "✨ Complete Your Setup - You're Almost There!";
    
    const bodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #0B0B0C; color: #EDEDED; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #151515 0%, #1A1A1A 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 215, 0, 0.2); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #FFD700, #00D4C9); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
          h1 { color: #FFD700; margin: 0; font-size: 24px; }
          .progress { background: #0B0B0C; height: 8px; border-radius: 4px; overflow: hidden; margin: 20px 0; }
          .progress-bar { background: linear-gradient(90deg, #FFD700, #00D4C9); height: 100%; width: ${(currentStep / 4) * 100}%; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FFD700, #00D4C9); color: #000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .benefits { background: rgba(255, 215, 0, 0.05); padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefits ul { margin: 10px 0; padding-left: 20px; }
          .benefits li { margin: 8px 0; color: #EDEDED; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 215, 0, 0.2); color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✨</div>
            <h1>Your Setup is Waiting!</h1>
          </div>
          
          <p>Hey there! You're <strong>${Math.round((currentStep / 4) * 100)}% done</strong> with your AIFreedomDuane setup.</p>
          
          <div class="progress">
            <div class="progress-bar"></div>
          </div>
          
          <p>Just <strong>${4 - currentStep} more steps</strong> and you'll unlock:</p>
          
          <div class="benefits">
            <ul>
              <li>🎬 Automated video creation</li>
              <li>🚀 One-click social posting</li>
              <li>🤖 AI-powered coaching</li>
              <li>⚡ Smart automation workflows</li>
              <li>📊 Real-time analytics</li>
            </ul>
          </div>
          
          <center>
            <a href="https://app.aifreedomduane.com/Dashboard" class="cta-button">
              Continue Setup (${4 - currentStep} min)
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #AAA; font-size: 14px;">
            Need help? Our AI coach is standing by to assist you.
          </p>
          
          <div class="footer">
            <p>AIFreedomDuane Studio</p>
            <p>Finish your setup to start automating your success.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await base44.integrations.Core.SendEmail({
        from_name: "AIFreedomDuane Studio",
        to: userEmail,
        subject: subject,
        body: bodyHtml
      });

      await base44.entities.EmailAlert.create({
        user_email: userEmail,
        alert_type: "setup_incomplete",
        subject: subject,
        body_html: bodyHtml,
        severity: "info",
        action_url: "/Dashboard",
        action_label: "Continue Setup",
        sent_at: new Date().toISOString(),
        metadata: {
          wizard_id: wizardId,
          current_step: currentStep
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to send setup reminder:", error);
      return { success: false, error };
    }
  }

  /**
   * Send critical system alert (with SMS option)
   */
  static async sendCriticalAlert(userEmail, title, message, includesSMS = false, phoneNumber = null) {
    const subject = `🚨 URGENT: ${title}`;
    
    const bodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #0B0B0C; color: #EDEDED; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A0000 0%, #330000 100%); border-radius: 16px; padding: 40px; border: 2px solid #FF4433; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { width: 60px; height: 60px; background: #FF4433; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
          h1 { color: #FF4433; margin: 0; font-size: 24px; }
          .alert-box { background: rgba(255, 68, 51, 0.2); border: 2px solid #FF4433; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alert-box p { margin: 0; color: #EDEDED; font-size: 16px; }
          .cta-button { display: inline-block; background: #FF4433; color: #FFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 68, 51, 0.3); color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚨</div>
            <h1>Critical Alert</h1>
          </div>
          
          <div class="alert-box">
            <p><strong>${title}</strong></p>
            <p style="margin-top: 10px;">${message}</p>
          </div>
          
          <p><strong>Action Required:</strong> Please address this immediately to avoid service disruption.</p>
          
          <center>
            <a href="https://app.aifreedomduane.com/Dashboard" class="cta-button">
              View Dashboard
            </a>
          </center>
          
          <div class="footer">
            <p>AIFreedomDuane Studio - Critical Alert System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      // Send email
      await base44.integrations.Core.SendEmail({
        from_name: "AIFreedomDuane Studio - URGENT",
        to: userEmail,
        subject: subject,
        body: bodyHtml
      });

      // Log email alert
      await base44.entities.EmailAlert.create({
        user_email: userEmail,
        alert_type: "security_alert",
        subject: subject,
        body_html: bodyHtml,
        severity: "critical",
        action_url: "/Dashboard",
        action_label: "View Dashboard",
        sent_at: new Date().toISOString(),
        metadata: { title, message }
      });

      // Send SMS if requested and phone available
      if (includesSMS && phoneNumber) {
        const smsMessage = `🚨 URGENT: ${title} - ${message}. Check your email or visit app.aifreedomduane.com`;
        
        await base44.entities.SMSAlert.create({
          user_email: userEmail,
          phone_number: phoneNumber,
          alert_type: "critical_error",
          message: smsMessage,
          sent_at: new Date().toISOString(),
          provider: "twilio",
          status: "queued"
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to send critical alert:", error);
      return { success: false, error };
    }
  }
}

export default EmailAlertSystem;