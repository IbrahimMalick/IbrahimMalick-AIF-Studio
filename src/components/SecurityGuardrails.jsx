/**
 * Security Guardrails for Copilot Actions
 * Implements rate limiting, destructive action confirmation, and safety checks
 */

export class SecurityGuardrails {
  constructor(userEmail) {
    this.userEmail = userEmail;
    this.actionCounts = new Map();
  }

  /**
   * Check if action requires confirmation (destructive actions)
   */
  requiresConfirmation(intent, params) {
    const destructiveIntents = [
      "delete_video",
      "delete_project",
      "cancel_subscription",
      "remove_team_member",
      "delete_automation",
      "bulk_delete"
    ];

    if (destructiveIntents.includes(intent)) {
      return true;
    }

    // High-spend actions
    if (intent === "create_campaign" && params.budget_usd > 100) {
      return true;
    }

    if (intent === "send_email" && params.recipient_count > 100) {
      return true;
    }

    return false;
  }

  /**
   * Rate limit check - max actions per hour
   */
  async checkRateLimit(intent) {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const key = `${this.userEmail}_${intent}`;

    if (!this.actionCounts.has(key)) {
      this.actionCounts.set(key, []);
    }

    const counts = this.actionCounts.get(key);
    // Remove timestamps older than 1 hour
    const recentCounts = counts.filter(timestamp => now - timestamp < hour);
    this.actionCounts.set(key, recentCounts);

    // Rate limits per intent
    const limits = {
      send_email: 10,
      create_campaign: 5,
      generate_image: 20,
      create_video: 15,
      default: 30
    };

    const limit = limits[intent] || limits.default;

    if (recentCounts.length >= limit) {
      throw new Error(`Rate limit exceeded for ${intent}. Max ${limit} per hour.`);
    }

    // Add current action
    recentCounts.push(now);
    this.actionCounts.set(key, recentCounts);

    return true;
  }

  /**
   * Validate sensitive parameters
   */
  validateSensitiveParams(intent, params) {
    // Email validation
    if (intent === "send_email") {
      if (!this.isValidEmail(params.to)) {
        throw new Error("Invalid email address");
      }
    }

    // URL validation
    if (params.webhook_url && !this.isValidUrl(params.webhook_url)) {
      throw new Error("Invalid webhook URL");
    }

    // Budget validation
    if (params.budget_usd && (params.budget_usd < 0 || params.budget_usd > 10000)) {
      throw new Error("Budget must be between $0 and $10,000");
    }

    // SQL injection prevention
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /DELETE\s+FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+SET/i,
      /<script>/i,
      /javascript:/i
    ];

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        for (const pattern of dangerousPatterns) {
          if (pattern.test(value)) {
            throw new Error(`Dangerous pattern detected in parameter: ${key}`);
          }
        }
      }
    }

    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has required permissions
   */
  async checkPermissions(intent, user) {
    const adminOnlyIntents = [
      "delete_workspace",
      "manage_billing",
      "invite_admin"
    ];

    if (adminOnlyIntents.includes(intent) && user.role !== 'admin') {
      throw new Error("This action requires admin permissions");
    }

    return true;
  }
}

export default SecurityGuardrails;