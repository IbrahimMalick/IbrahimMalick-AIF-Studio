import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Copy,
  CheckCircle2,
  Server,
  DollarSign,
  Link as LinkIcon,
  Gift,
  Target,
  Shield,
  AlertTriangle
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function PartnerAPISpec() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyCode = (code, section) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const serverJS = `// src/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import partners from "./routes/partners.js";
import ghl from "./routes/ghl.js";
import voice from "./routes/voice.js";
import renders from "./routes/renders.js";
import events from "./routes/events.js";
import alerts from "./routes/alerts.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGINS || "").split(",") }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("tiny"));

app.get("/health", (_, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/partners", partners);
app.use("/api/ghl", ghl);
app.use("/api/voice", voice);
app.use("/api/renders", renders);
app.use("/api/events", events);
app.use("/api/alerts", alerts);

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(\`[AFS] API listening on :\${port}\`));`;

  const partnersRoutes = `// src/routes/partners.js
import express from "express";
import { trackClick, resolveAttribution } from "../lib/attribution.js";
import { createCommission, processPayouts } from "../lib/commissions.js";
import { validateDealReg, checkDuplicateDeal } from "../lib/dealreg.js";
import { detectFraud } from "../lib/fraud.js";
const router = express.Router();

// ============= TRACKING & ATTRIBUTION =============

/**
 * POST /api/partners/track-click
 * Track affiliate link click
 * Body: { affiliateCode, clickId, referer, userAgent, ipAddress, landingPage }
 */
router.post("/track-click", async (req, res) => {
  const { affiliateCode, clickId, referer, userAgent, ipAddress, landingPage } = req.body;
  
  try {
    const attribution = await trackClick({
      affiliateCode,
      clickId,
      referer,
      userAgent,
      ipAddress,
      landingPage,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    });
    
    res.json({ ok: true, attribution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/partners/resolve-attribution
 * Determine partner for new signup
 * Body: { userEmail, couponCode?, clickId?, referer? }
 */
router.post("/resolve-attribution", async (req, res) => {
  const { userEmail, couponCode, clickId, referer } = req.body;
  
  try {
    const attribution = await resolveAttribution({
      userEmail,
      couponCode,
      clickId,
      referer
    });
    
    res.json({ ok: true, attribution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= COMMISSIONS =============

/**
 * POST /api/partners/commission/create
 * Create commission record
 * Body: { partnerId, customerEmail, eventType, baseAmountUsd, commissionRate }
 */
router.post("/commission/create", async (req, res) => {
  const { partnerId, customerEmail, eventType, baseAmountUsd, commissionRate } = req.body;
  
  try {
    // Fraud check
    const fraudCheck = await detectFraud({
      subjectType: "transaction",
      partnerId,
      customerEmail,
      amount: baseAmountUsd
    });
    
    if (fraudCheck.blocked) {
      return res.status(403).json({ error: "Transaction blocked", reason: fraudCheck.reason });
    }
    
    const commission = await createCommission({
      partnerId,
      customerEmail,
      commissionType: eventType.includes("recurring") ? "recurring" : 
                      eventType.includes("addon") ? "addon" : 
                      eventType.includes("setup") ? "setup_fee" : "bounty",
      eventType,
      baseAmountUsd,
      commissionRate,
      status: "pending"
    });
    
    res.json({ ok: true, commission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/partners/commission/approve
 * Approve pending commissions
 * Body: { commissionIds: string[] }
 */
router.post("/commission/approve", async (req, res) => {
  const { commissionIds } = req.body;
  
  try {
    // TODO: Update commissions to approved status
    // await db.PartnerCommission.updateMany({ id: { $in: commissionIds } }, { status: "approved" });
    
    res.json({ ok: true, approved: commissionIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/partners/commission/clawback
 * Clawback refunded commission
 * Body: { commissionId, reason }
 */
router.post("/commission/clawback", async (req, res) => {
  const { commissionId, reason } = req.body;
  
  try {
    // TODO: Mark commission as clawback, update partner balance
    // await db.PartnerCommission.update(commissionId, { status: "clawback", refund_reason: reason });
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= PAYOUTS =============

/**
 * POST /api/partners/payout/process
 * Process monthly payouts (cron job)
 * Body: { periodStart, periodEnd, minimumAmount? }
 */
router.post("/payout/process", async (req, res) => {
  const { periodStart, periodEnd, minimumAmount = 50 } = req.body;
  
  try {
    const payouts = await processPayouts({
      periodStart,
      periodEnd,
      minimumAmount
    });
    
    res.json({ ok: true, payouts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/partners/payout/execute
 * Execute single payout (PayPal/Stripe)
 * Body: { payoutId, method }
 */
router.post("/payout/execute", async (req, res) => {
  const { payoutId, method } = req.body;
  
  try {
    // TODO: Execute payment via PayPal/Stripe
    // const result = await paymentProvider.payout({ ... });
    
    res.json({ ok: true, transactionId: "txn_xxx" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= DEAL REGISTRATION =============

/**
 * POST /api/partners/deal/register
 * Register enterprise deal
 * Body: { partnerId, companyName, contactEmail, estimatedValue, ... }
 */
router.post("/deal/register", async (req, res) => {
  const { partnerId, companyName, contactEmail, estimatedValue } = req.body;
  
  try {
    // Check for duplicate
    const duplicate = await checkDuplicateDeal({ companyName, contactEmail });
    if (duplicate) {
      return res.status(409).json({ 
        error: "Duplicate deal", 
        existingDeal: duplicate,
        message: "This deal is already registered by another partner"
      });
    }
    
    // Validate deal
    const validation = await validateDealReg({ partnerId, estimatedValue });
    if (!validation.eligible) {
      return res.status(403).json({ error: validation.reason });
    }
    
    // TODO: Create deal registration
    // const deal = await db.DealRegistration.create({ ... });
    
    res.json({ ok: true, dealId: "deal_xxx" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/partners/deal/update
 * Update deal status/stage
 * Body: { dealId, status?, stage?, actualValue?, notes? }
 */
router.post("/deal/update", async (req, res) => {
  const { dealId, status, stage, actualValue, notes } = req.body;
  
  try {
    // TODO: Update deal
    // await db.DealRegistration.update(dealId, { status, stage, actual_value_usd: actualValue, notes });
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= COUPONS =============

/**
 * POST /api/partners/coupon/validate
 * Validate coupon code at checkout
 * Body: { couponCode, userEmail, planTier }
 */
router.post("/coupon/validate", async (req, res) => {
  const { couponCode, userEmail, planTier } = req.body;
  
  try {
    // TODO: Fetch coupon from db
    // const coupon = await db.PartnerCoupon.findOne({ coupon_code: couponCode, is_active: true });
    
    // Validate expiration, redemption limits, plan eligibility
    const isValid = true; // Replace with actual validation
    const partnerId = "partner_xxx"; // Get from coupon
    
    if (!isValid) {
      return res.status(400).json({ error: "Invalid coupon" });
    }
    
    res.json({
      ok: true,
      valid: true,
      partnerId,
      discountType: "percentage",
      discountValue: 30,
      duration: "once"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/partners/coupon/redeem
 * Increment redemption count
 * Body: { couponCode, userEmail }
 */
router.post("/coupon/redeem", async (req, res) => {
  const { couponCode, userEmail } = req.body;
  
  try {
    // TODO: Increment redemptions_count
    // await db.PartnerCoupon.update({ coupon_code: couponCode }, { $inc: { redemptions_count: 1 } });
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= FRAUD DETECTION =============

/**
 * POST /api/partners/fraud/check
 * Run fraud checks
 * Body: { signalType, subjectType, subjectId, details }
 */
router.post("/fraud/check", async (req, res) => {
  const { signalType, subjectType, subjectId, details } = req.body;
  
  try {
    const fraudCheck = await detectFraud({
      signalType,
      subjectType,
      subjectId,
      details
    });
    
    res.json({ ok: true, fraudCheck });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= WEBHOOKS =============

/**
 * POST /api/partners/webhook/stripe
 * Stripe webhook for subscription events
 * Body: Stripe event payload
 */
router.post("/webhook/stripe", async (req, res) => {
  const event = req.body;
  
  try {
    // Verify Stripe signature
    // const signature = req.headers['stripe-signature'];
    // const webhookEvent = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    switch (event.type) {
      case "invoice.payment_succeeded":
        // Create recurring commission
        const { customer, subscription, amount_paid, invoice_pdf } = event.data.object;
        // TODO: Look up attribution, create commission
        break;
        
      case "customer.subscription.created":
        // First payment, create bounty commission
        break;
        
      case "customer.subscription.deleted":
        // Stop recurring commissions
        break;
        
      case "charge.refunded":
        // Clawback commission
        break;
        
      default:
        console.log(\`Unhandled event: \${event.type}\`);
    }
    
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;`;

  const attributionLib = `// src/lib/attribution.js
import crypto from "crypto";

/**
 * Track affiliate click
 */
export async function trackClick({ affiliateCode, clickId, referer, userAgent, ipAddress, landingPage, expiresAt }) {
  // TODO: Store in database (PartnerAttribution entity)
  
  // Generate device fingerprint
  const deviceFingerprint = crypto
    .createHash('md5')
    .update(\`\${userAgent}-\${ipAddress}\`)
    .digest('hex');
  
  // TODO: Check for suspicious patterns (same device, many emails)
  
  const attribution = {
    clickId,
    affiliateCode,
    referer,
    landingPage,
    deviceFingerprint,
    ipAddress,
    userAgent,
    expiresAt
  };
  
  // await db.PartnerAttribution.create(attribution);
  
  return attribution;
}

/**
 * Resolve attribution for signup
 * Priority: Coupon > Last Click > First Click
 */
export async function resolveAttribution({ userEmail, couponCode, clickId, referer }) {
  let partnerId = null;
  let model = null;
  
  // 1. Coupon code (highest priority)
  if (couponCode) {
    // const coupon = await db.PartnerCoupon.findOne({ coupon_code: couponCode });
    // if (coupon) {
    //   partnerId = coupon.partner_id;
    //   model = "coupon";
    // }
  }
  
  // 2. Last click (90-day window)
  if (!partnerId && clickId) {
    // const lastClick = await db.PartnerAttribution.findOne({
    //   click_id: clickId,
    //   expires_at: { $gt: new Date() }
    // }).sort({ created_date: -1 });
    // if (lastClick) {
    //   partnerId = lastClick.affiliate_code; // Map to partner ID
    //   model = "last_click";
    // }
  }
  
  // 3. First click (fallback)
  if (!partnerId && referer) {
    // const firstClick = await db.PartnerAttribution.findOne({
    //   user_email: userEmail
    // }).sort({ created_date: 1 });
    // if (firstClick) {
    //   partnerId = firstClick.affiliate_code;
    //   model = "first_click";
    // }
  }
  
  // 4. Deal registration
  if (!partnerId) {
    // const dealReg = await db.DealRegistration.findOne({
    //   contact_email: userEmail,
    //   status: "active",
    //   expires_at: { $gt: new Date() }
    // });
    // if (dealReg) {
    //   partnerId = dealReg.partner_id;
    //   model = "deal_reg";
    // }
  }
  
  // Store attribution
  if (partnerId) {
    // await db.PartnerAttribution.create({
    //   user_email: userEmail,
    //   partner_id: partnerId,
    //   attribution_model: model,
    //   coupon_code: couponCode,
    //   click_id: clickId,
    //   referrer_url: referer
    // });
  }
  
  return { partnerId, model };
}

/**
 * Cross-device attribution
 * Match user by email even if different device
 */
export async function matchCrossDevice({ userEmail, deviceFingerprint }) {
  // TODO: Check if email was seen with different fingerprint in last 90 days
  // const existingAttribution = await db.PartnerAttribution.findOne({
  //   user_email: userEmail,
  //   expires_at: { $gt: new Date() }
  // });
  // return existingAttribution;
}`;

  const commissionsLib = `// src/lib/commissions.js

/**
 * Create commission record
 */
export async function createCommission({
  partnerId,
  customerEmail,
  commissionType,
  eventType,
  baseAmountUsd,
  commissionRate,
  status = "pending"
}) {
  const commissionAmountUsd = (baseAmountUsd * commissionRate) / 100;
  
  const commission = {
    partner_id: partnerId,
    customer_email: customerEmail,
    commission_type: commissionType,
    event_type: eventType,
    base_amount_usd: baseAmountUsd,
    commission_rate: commissionRate,
    commission_amount_usd: commissionAmountUsd,
    status,
    period_start: new Date(),
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
  
  // await db.PartnerCommission.create(commission);
  
  // Update partner stats
  // await db.PartnerAffiliate.update(partnerId, {
  //   $inc: { pending_balance_usd: commissionAmountUsd }
  // });
  
  return commission;
}

/**
 * Process monthly payouts
 */
export async function processPayouts({ periodStart, periodEnd, minimumAmount = 50 }) {
  // 1. Get all approved commissions in period
  // const commissions = await db.PartnerCommission.find({
  //   status: "approved",
  //   created_date: { $gte: periodStart, $lte: periodEnd }
  // });
  
  // 2. Group by partner
  // const grouped = commissions.reduce((acc, c) => {
  //   if (!acc[c.partner_id]) acc[c.partner_id] = [];
  //   acc[c.partner_id].push(c);
  //   return acc;
  // }, {});
  
  // 3. Create payouts for partners above threshold
  const payouts = [];
  // for (const [partnerId, partnerCommissions] of Object.entries(grouped)) {
  //   const totalAmount = partnerCommissions.reduce((sum, c) => sum + c.commission_amount_usd, 0);
  //   
  //   if (totalAmount >= minimumAmount) {
  //     const payout = await db.PartnerPayout.create({
  //       partner_id: partnerId,
  //       payout_period: { start_date: periodStart, end_date: periodEnd, month: "2025-01" },
  //       total_amount_usd: totalAmount,
  //       commission_count: partnerCommissions.length,
  //       commission_ids: partnerCommissions.map(c => c.id),
  //       status: "pending",
  //       payment_method: "paypal" // Get from partner profile
  //     });
  //     
  //     payouts.push(payout);
  //   }
  // }
  
  return payouts;
}

/**
 * Execute payout via PayPal
 */
export async function executePayPalPayout({ payoutId, recipientEmail, amount }) {
  // const paypal = require('paypal-rest-sdk');
  // 
  // const batch = {
  //   sender_batch_header: {
  //     sender_batch_id: payoutId,
  //     email_subject: "Your AI Freedom Studios Commission Payout"
  //   },
  //   items: [{
  //     recipient_type: "EMAIL",
  //     amount: { value: amount, currency: "USD" },
  //     receiver: recipientEmail,
  //     note: \`Commission payout for \${payoutId}\`
  //   }]
  // };
  // 
  // return new Promise((resolve, reject) => {
  //   paypal.payout.create(batch, (error, payout) => {
  //     if (error) reject(error);
  //     else resolve(payout);
  //   });
  // });
}

/**
 * Execute payout via Stripe Connect
 */
export async function executeStripePayout({ payoutId, stripeConnectId, amount }) {
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // 
  // const transfer = await stripe.transfers.create({
  //   amount: Math.round(amount * 100), // cents
  //   currency: "usd",
  //   destination: stripeConnectId,
  //   description: \`Commission payout for \${payoutId}\`
  // });
  // 
  // return transfer;
}`;

  const dealRegLib = `// src/lib/dealreg.js

/**
 * Check for duplicate deal registration
 */
export async function checkDuplicateDeal({ companyName, contactEmail }) {
  // TODO: Query database
  // const existing = await db.DealRegistration.findOne({
  //   $or: [
  //     { company_name: companyName },
  //     { contact_email: contactEmail }
  //   ],
  //   status: { $in: ["active", "won"] },
  //   expires_at: { $gt: new Date() }
  // });
  // 
  // return existing;
  
  return null;
}

/**
 * Validate partner can register deals
 */
export async function validateDealReg({ partnerId, estimatedValue }) {
  // TODO: Check partner status and eligibility
  // const partner = await db.PartnerAffiliate.findOne({ id: partnerId });
  // 
  // if (!partner) {
  //   return { eligible: false, reason: "Partner not found" };
  // }
  // 
  // if (!partner.deal_reg_enabled) {
  //   return { eligible: false, reason: "Deal registration not enabled for this partner" };
  // }
  // 
  // if (partner.status !== "active") {
  //   return { eligible: false, reason: "Partner account is not active" };
  // }
  
  return { eligible: true };
}

/**
 * Extend deal protection window
 */
export async function extendDealProtection({ dealId, additionalDays }) {
  // TODO: Update expiration
  // const deal = await db.DealRegistration.findOne({ id: dealId });
  // const newExpiration = new Date(deal.expires_at);
  // newExpiration.setDate(newExpiration.getDate() + additionalDays);
  // 
  // await db.DealRegistration.update(dealId, { 
  //   expires_at: newExpiration,
  //   protection_window_days: deal.protection_window_days + additionalDays
  // });
  
  return { ok: true };
}`;

  const fraudLib = `// src/lib/fraud.js

/**
 * Detect fraud patterns
 */
export async function detectFraud({ signalType, subjectType, subjectId, partnerId, customerEmail, amount, details }) {
  const signals = [];
  
  // 1. Velocity spike check
  if (partnerId) {
    // const recentSignups = await db.PartnerAttribution.count({
    //   partner_id: partnerId,
    //   created_date: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    // });
    // 
    // if (recentSignups > 50) {
    //   signals.push({
    //     signal_type: "velocity_spike",
    //     severity: "high",
    //     details: { signups_24h: recentSignups }
    //   });
    // }
  }
  
  // 2. Geo mismatch (IP vs billing)
  // TODO: Compare IP geolocation to billing address
  
  // 3. Refund cluster
  // const recentRefunds = await db.PartnerCommission.count({
  //   partner_id: partnerId,
  //   status: "clawback",
  //   created_date: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  // });
  // 
  // if (recentRefunds > 3) {
  //   signals.push({
  //     signal_type: "refund_cluster",
  //     severity: "critical",
  //     details: { refunds_7d: recentRefunds }
  //   });
  // }
  
  // 4. Coupon abuse (same device, many emails)
  // TODO: Check device fingerprint reuse
  
  // 5. Suspicious email patterns
  if (customerEmail) {
    const suspiciousPatterns = [
      /^\w{1,3}@/, // Very short username
      /@temp/, // Temporary email
      /@guerrilla/, // Guerrilla mail
      /\+\d{3,}@/ // Email with many +aliases
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(customerEmail))) {
      signals.push({
        signal_type: "suspicious_email",
        severity: "medium",
        details: { email: customerEmail }
      });
    }
  }
  
  // Determine auto-action
  const highSeverity = signals.some(s => s.severity === "critical" || s.severity === "high");
  const autoAction = highSeverity ? "pause_partner" : 
                      signals.length > 0 ? "flag_for_review" : "none";
  
  // Store signals
  for (const signal of signals) {
    // await db.PartnerFraudSignal.create({
    //   signal_type: signal.signal_type,
    //   subject_type: subjectType,
    //   subject_id: subjectId,
    //   severity: signal.severity,
    //   details: signal.details,
    //   auto_action_taken: autoAction
    // });
  }
  
  return {
    blocked: autoAction === "pause_partner" || autoAction === "suspend_partner",
    signals,
    autoAction,
    reason: signals.map(s => s.signal_type).join(", ")
  };
}`;

  const webhooksCode = `// Stripe Webhook Handler (Complete Example)

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe webhook endpoint
 */
router.post("/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  // Handle events
  switch (event.type) {
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      
      // Get customer & subscription
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;
      
      // Look up customer email
      const customer = await stripe.customers.retrieve(customerId);
      const customerEmail = customer.email;
      
      // Resolve attribution
      const attribution = await db.PartnerAttribution.findOne({
        user_email: customerEmail,
        converted_to_paid: true
      });
      
      if (attribution) {
        // Get partner
        const partner = await db.PartnerAffiliate.findOne({ id: attribution.partner_id });
        
        // Calculate commission
        const baseAmount = invoice.amount_paid / 100; // Convert cents to dollars
        const rate = partner.partner_type === 'reseller' 
          ? partner.revenue_share_percent 
          : partner.commission_rate_recurring;
        
        // Create commission
        await createCommission({
          partnerId: partner.id,
          customerEmail,
          commissionType: "recurring",
          eventType: "subscription.payment_succeeded",
          transactionId: invoice.id,
          subscriptionId,
          baseAmountUsd: baseAmount,
          commissionRate: rate,
          status: "approved" // Auto-approve recurring
        });
        
        // Update partner stats
        await db.PartnerAffiliate.update(attribution.partner_id, {
          $inc: { 
            pending_balance_usd: (baseAmount * rate) / 100,
            total_earned_usd: (baseAmount * rate) / 100
          }
        });
      }
      
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object;
      
      // Get customer
      const customer = await stripe.customers.retrieve(subscription.customer);
      const customerEmail = customer.email;
      
      // Resolve attribution
      const attribution = await resolveAttribution({
        userEmail: customerEmail,
        couponCode: subscription.discount?.coupon?.id
      });
      
      if (attribution.partnerId) {
        const partner = await db.PartnerAffiliate.findOne({ id: attribution.partnerId });
        
        // Mark attribution as converted
        await db.PartnerAttribution.update({
          user_email: customerEmail,
          partner_id: attribution.partnerId
        }, {
          converted_to_paid: true,
          converted_at: new Date(),
          plan_tier: subscription.items.data[0].price.lookup_key,
          subscription_value_usd: subscription.items.data[0].price.unit_amount / 100,
          subscription_id: subscription.id
        });
        
        // Update partner stats
        await db.PartnerAffiliate.update(attribution.partnerId, {
          $inc: { 
            total_conversions: 1,
            active_customers: 1,
            mrr_influenced: subscription.items.data[0].price.unit_amount / 100
          }
        });
      }
      
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      
      // Find attribution
      const attribution = await db.PartnerAttribution.findOne({
        user_email: customer.email,
        subscription_id: subscription.id
      });
      
      if (attribution) {
        // Decrease active customers & MRR
        await db.PartnerAffiliate.update(attribution.partner_id, {
          $inc: { 
            active_customers: -1,
            mrr_influenced: -(subscription.items.data[0].price.unit_amount / 100)
          }
        });
        
        // Stop future recurring commissions
        // (Don't clawback past commissions unless refund)
      }
      
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const refundAmount = charge.amount_refunded / 100;
      
      // Find related commission
      const commission = await db.PartnerCommission.findOne({
        transaction_id: charge.id,
        status: { $in: ["approved", "paid"] }
      });
      
      if (commission) {
        // Check if within 45-day clawback window
        const daysSinceCommission = (Date.now() - new Date(commission.created_date)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCommission <= 45) {
          // Clawback commission
          await db.PartnerCommission.update(commission.id, {
            status: "clawback",
            refund_reason: "Customer refund within 45 days"
          });
          
          // Update partner balance
          await db.PartnerAffiliate.update(commission.partner_id, {
            $inc: { 
              pending_balance_usd: -commission.commission_amount_usd,
              total_earned_usd: -commission.commission_amount_usd
            }
          });
        }
      }
      
      break;
    }

    default:
      console.log(\`Unhandled event type: \${event.type}\`);
  }

  res.json({ received: true });
});`;

  const cronJobs = `// Automated Cron Jobs (Node-Cron)

import cron from "node-cron";
import { processPayouts } from "./lib/commissions.js";
import { updatePartnerTiers } from "./lib/partners.js";
import { detectFraud } from "./lib/fraud.js";

/**
 * Monthly payout processing (1st of month at 3am)
 */
cron.schedule('0 3 1 * *', async () => {
  console.log('[CRON] Running monthly payout processing...');
  
  const now = new Date();
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of previous month
  
  try {
    const payouts = await processPayouts({
      periodStart,
      periodEnd,
      minimumAmount: 50
    });
    
    console.log(\`[CRON] Created \${payouts.length} payouts\`);
    
    // Send notification to finance team
    // await sendEmail({
    //   to: "finance@aifreedomduane.com",
    //   subject: "Monthly Partner Payouts Ready",
    //   html: \`<p>\${payouts.length} payouts totaling $\${payouts.reduce((sum, p) => sum + p.total_amount_usd, 0)} are ready for processing.</p>\`
    // });
  } catch (err) {
    console.error('[CRON] Payout processing failed:', err);
  }
});

/**
 * Update partner tiers (daily at 2am)
 */
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Updating partner tiers...');
  
  try {
    await updatePartnerTiers();
    console.log('[CRON] Partner tiers updated');
  } catch (err) {
    console.error('[CRON] Tier update failed:', err);
  }
});

/**
 * Fraud detection sweep (every 6 hours)
 */
cron.schedule('0 */6 * * *', async () => {
  console.log('[CRON] Running fraud detection sweep...');
  
  try {
    // Check for velocity spikes
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // const partners = await db.PartnerAffiliate.find({ status: "active" });
    
    // for (const partner of partners) {
    //   const signups = await db.PartnerAttribution.count({
    //     partner_id: partner.id,
    //     created_date: { $gt: last24h }
    //   });
    //   
    //   if (signups > 100) {
    //     await detectFraud({
    //       signalType: "velocity_spike",
    //       subjectType: "partner",
    //       subjectId: partner.id,
    //       details: { signups_24h: signups }
    //     });
    //   }
    // }
    
    console.log('[CRON] Fraud check complete');
  } catch (err) {
    console.error('[CRON] Fraud check failed:', err);
  }
});

/**
 * Expire old deal registrations (daily at 1am)
 */
cron.schedule('0 1 * * *', async () => {
  console.log('[CRON] Expiring old deal registrations...');
  
  try {
    // await db.DealRegistration.updateMany({
    //   status: "active",
    //   expires_at: { $lt: new Date() }
    // }, {
    //   status: "expired"
    // });
    
    console.log('[CRON] Deal expirations processed');
  } catch (err) {
    console.error('[CRON] Deal expiration failed:', err);
  }
});`;

  const envVars = `# ===== Partner Program =====
PARTNER_MIN_PAYOUT_USD=50
PARTNER_PAYOUT_NET_DAYS=15
PARTNER_ATTRIBUTION_WINDOW_DAYS=90
PARTNER_CLAWBACK_WINDOW_DAYS=45
PARTNER_DEAL_REG_PROTECTION_DAYS=60

# ===== Fraud Detection =====
FRAUD_VELOCITY_THRESHOLD=50
FRAUD_AUTO_PAUSE_ENABLED=true
FRAUD_ALERT_EMAIL=fraud@aifreedomduane.com

# ===== Payment Processing =====
PAYPAL_CLIENT_ID=xxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxxxxx
PAYPAL_MODE=live
STRIPE_CONNECT_CLIENT_ID=ca_xxxxxxxxxxxxxxxx

# ===== Webhooks =====
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`;

  const testingGuide = `// Testing Partner API

/**
 * 1. Test Attribution Flow
 */

// Step 1: Track click
POST http://localhost:8787/api/partners/track-click
Content-Type: application/json

{
  "affiliateCode": "DUANE2024",
  "clickId": "click_123456",
  "referer": "https://youtube.com/@duanepersad",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "landingPage": "https://studio.aifreedomduane.com/pricing"
}

// Step 2: Resolve attribution on signup
POST http://localhost:8787/api/partners/resolve-attribution
Content-Type: application/json

{
  "userEmail": "newuser@example.com",
  "couponCode": "DUANE30",
  "clickId": "click_123456",
  "referer": "https://youtube.com/@duanepersad"
}

// Expected: Returns { partnerId: "partner_xxx", model: "coupon" }

/**
 * 2. Test Commission Creation
 */

POST http://localhost:8787/api/partners/commission/create
Content-Type: application/json

{
  "partnerId": "partner_xxx",
  "customerEmail": "customer@example.com",
  "eventType": "subscription.payment_succeeded",
  "baseAmountUsd": 297,
  "commissionRate": 30
}

// Expected: Creates commission worth $89.10 (30% of $297)

/**
 * 3. Test Deal Registration
 */

POST http://localhost:8787/api/partners/deal/register
Content-Type: application/json

{
  "partnerId": "partner_xxx",
  "companyName": "Acme Corp",
  "contactEmail": "john@acme.com",
  "contactName": "John Smith",
  "estimatedValue": 10000,
  "estimatedUsers": 25,
  "industry": "SaaS"
}

// Expected: { ok: true, dealId: "deal_xxx" }

/**
 * 4. Test Coupon Validation
 */

POST http://localhost:8787/api/partners/coupon/validate
Content-Type: application/json

{
  "couponCode": "DUANE30",
  "userEmail": "test@example.com",
  "planTier": "creator"
}

// Expected: { valid: true, partnerId: "partner_xxx", discountValue: 30 }

/**
 * 5. Test Fraud Detection
 */

POST http://localhost:8787/api/partners/fraud/check
Content-Type: application/json

{
  "signalType": "velocity_spike",
  "subjectType": "partner",
  "subjectId": "partner_xxx",
  "details": {
    "signups_24h": 150
  }
}

// Expected: Fraud signal created, partner flagged for review

/**
 * 6. Test Payout Processing
 */

POST http://localhost:8787/api/partners/payout/process
Content-Type: application/json

{
  "periodStart": "2025-01-01T00:00:00Z",
  "periodEnd": "2025-01-31T23:59:59Z",
  "minimumAmount": 50
}

// Expected: Creates payouts for partners with >$50 balance`;

  const integrationChecklist = `# Partner Program Integration Checklist

## Phase 1: Database Setup (Day 1)
- [ ] Create PartnerAffiliate table
- [ ] Create AffiliateLink table  
- [ ] Create PartnerCoupon table
- [ ] Create PartnerAttribution table
- [ ] Create PartnerCommission table
- [ ] Create PartnerPayout table
- [ ] Create DealRegistration table
- [ ] Create PartnerFraudSignal table
- [ ] Create PartnerContent table

## Phase 2: Core API Routes (Days 2-3)
- [ ] POST /track-click - Track affiliate clicks
- [ ] POST /resolve-attribution - Determine partner credit
- [ ] POST /commission/create - Create commission records
- [ ] POST /commission/approve - Approve commissions
- [ ] POST /commission/clawback - Handle refunds
- [ ] POST /coupon/validate - Validate coupon codes
- [ ] POST /coupon/redeem - Increment redemption count
- [ ] POST /deal/register - Register enterprise deals
- [ ] POST /deal/update - Update deal status

## Phase 3: Webhooks (Days 3-4)
- [ ] POST /webhook/stripe - Stripe events
  - [ ] invoice.payment_succeeded - Recurring commissions
  - [ ] customer.subscription.created - New customer
  - [ ] customer.subscription.deleted - Churned customer
  - [ ] charge.refunded - Clawback commissions
- [ ] Verify webhook signatures
- [ ] Add retry logic for failed webhooks

## Phase 4: Attribution Logic (Day 4)
- [ ] Implement coupon-based attribution
- [ ] Implement last-click attribution (90-day window)
- [ ] Implement first-click fallback
- [ ] Implement deal-reg attribution
- [ ] Cross-device matching by email
- [ ] Device fingerprinting

## Phase 5: Fraud Detection (Day 5)
- [ ] Velocity spike detection
- [ ] Geo mismatch validation
- [ ] Refund cluster alerts
- [ ] Coupon abuse detection
- [ ] Duplicate device detection
- [ ] Suspicious email patterns
- [ ] Auto-pause rules

## Phase 6: Payout Processing (Days 6-7)
- [ ] Monthly payout calculation
- [ ] PayPal batch payout integration
- [ ] Stripe Connect payout integration
- [ ] Payout invoice generation (PDF)
- [ ] Email notifications
- [ ] Payment failure handling
- [ ] Retry logic

## Phase 7: Tier Management (Day 7)
- [ ] Auto-tier advancement (Bronze → Silver → Gold → Premier)
- [ ] MRR threshold checks
- [ ] Commission rate updates on tier change
- [ ] Tier achievement notifications

## Phase 8: Cron Jobs (Day 8)
- [ ] Monthly payout processing (1st at 3am)
- [ ] Daily tier updates (2am)
- [ ] Fraud detection sweep (every 6h)
- [ ] Deal expiration (daily 1am)
- [ ] Attribution window expiration cleanup

## Phase 9: Testing (Days 9-10)
- [ ] Unit tests for attribution logic
- [ ] Integration tests for webhooks
- [ ] Load testing for click tracking
- [ ] Fraud detection accuracy testing
- [ ] Payout calculation validation
- [ ] End-to-end flow testing

## Phase 10: Monitoring & Alerts (Day 10)
- [ ] Prometheus metrics
  - [ ] partner_signups_total
  - [ ] partner_commissions_total
  - [ ] partner_payout_total
  - [ ] fraud_signals_total
- [ ] Slack alerts for fraud
- [ ] Email alerts for payouts
- [ ] Dashboard for finance team

## Security Requirements
- [ ] Encrypt API keys in database
- [ ] Hash device fingerprints
- [ ] Verify webhook signatures
- [ ] Rate limit attribution endpoints
- [ ] Audit log for commission changes
- [ ] HTTPS only
- [ ] JWT auth for admin endpoints`;

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Badge className="bg-[#FFD700]/20 text-[#FFD700] mb-4">
            🤝 Partner Program API
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-3">
            Partner API Specification
          </h1>
          <p className="text-gray-400 text-lg">
            Complete backend API implementation for affiliate & reseller program
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-4 text-center">
              <Server className="w-6 h-6 mx-auto mb-2 text-[#FFD700]" />
              <p className="text-2xl font-bold text-white">9</p>
              <p className="text-gray-400 text-xs">API Endpoints</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-4 text-center">
              <Code className="w-6 h-6 mx-auto mb-2 text-[#00D4C9]" />
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-gray-400 text-xs">Helper Libraries</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-[#9D4EDD]" />
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-gray-400 text-xs">Fraud Signals</p>
            </CardContent>
          </Card>
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold text-white">10</p>
              <p className="text-gray-400 text-xs">Days to Deploy</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="routes" className="space-y-6">
          <TabsList className="bg-[#111]">
            <TabsTrigger value="routes">API Routes</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="cron">Cron Jobs</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          {/* API Routes Tab */}
          <TabsContent value="routes">
            <div className="space-y-6">

              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Express Server Setup</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(serverJS, 'server')}
                      className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'server' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                    {serverJS}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Partner Routes</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => copyCode(partnersRoutes, 'routes')}
                      className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedSection === 'routes' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-blue-400 font-semibold text-sm mb-2">
                      📋 9 API Endpoints
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2 text-xs">
                      {[
                        "POST /track-click - Track affiliate clicks",
                        "POST /resolve-attribution - Determine partner",
                        "POST /commission/create - Create commission",
                        "POST /commission/approve - Approve commissions",
                        "POST /commission/clawback - Handle refunds",
                        "POST /coupon/validate - Validate coupons",
                        "POST /coupon/redeem - Redeem coupon",
                        "POST /deal/register - Register deal",
                        "POST /deal/update - Update deal status"
                      ].map((endpoint, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{endpoint}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800 max-h-96">
                    {partnersRoutes}
                  </pre>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-[#00D4C9]" />
                    Attribution Logic
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => copyCode(attributionLib, 'attribution')}
                    className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'attribution' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <h4 className="text-yellow-400 font-semibold text-sm mb-2">
                    🎯 Attribution Priority
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400">1st</Badge>
                      <span className="text-white font-medium">Coupon Code</span>
                      <span className="text-gray-400">- Strongest signal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400">2nd</Badge>
                      <span className="text-white font-medium">Last Click</span>
                      <span className="text-gray-400">- 90-day window</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400">3rd</Badge>
                      <span className="text-white font-medium">First Click</span>
                      <span className="text-gray-400">- Fallback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-pink-500/20 text-pink-400">4th</Badge>
                      <span className="text-white font-medium">Deal Registration</span>
                      <span className="text-gray-400">- Resellers only</span>
                    </div>
                  </div>
                </div>

                <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                  {attributionLib}
                </pre>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Key Features</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>• Device fingerprinting</div>
                      <div>• 90-day attribution window</div>
                      <div>• Cross-device matching</div>
                      <div>• Multi-model fallback</div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Anti-Gaming</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>• Duplicate device detection</div>
                      <div>• Suspicious email patterns</div>
                      <div>• Velocity spike alerts</div>
                      <div>• Manual review queue</div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#FFD700]" />
                    Commission Processing
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => copyCode(commissionsLib, 'commissions')}
                    className="bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'commissions' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h4 className="text-green-400 font-semibold text-sm mb-2">
                    💰 Commission Types
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-white font-medium mb-1">Affiliates:</p>
                      <div className="text-gray-400 space-y-0.5">
                        <div>• 30% recurring (lifetime)</div>
                        <div>• 10% add-ons</div>
                        <div>• Tier bonuses (+2-5%)</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Resellers:</p>
                      <div className="text-gray-400 space-y-0.5">
                        <div>• 25-35% revenue share</div>
                        <div>• Setup fees (100%)</div>
                        <div>• Tiered by MRR managed</div>
                      </div>
                    </div>
                  </div>
                </div>

                <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                  {commissionsLib}
                </pre>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Payout Terms</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-400">Frequency:</span>
                        <span className="text-white ml-1">Monthly, NET-15</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Minimum:</span>
                        <span className="text-white ml-1">$50 USD</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Clawback:</span>
                        <span className="text-white ml-1">45-day window</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Methods:</span>
                        <span className="text-white ml-1">PayPal, Stripe, Wire</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Status Lifecycle</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                        <span className="text-gray-400">→ 15 days after sale</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-400">Approved</Badge>
                        <span className="text-gray-400">→ No refund</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">Paid</Badge>
                        <span className="text-gray-400">→ Payout sent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500/20 text-red-400">Clawback</Badge>
                        <span className="text-gray-400">→ Refunded</span>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Detection Tab */}
          <TabsContent value="fraud">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    Fraud Detection System
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => copyCode(fraudLib, 'fraud')}
                    className="bg-red-400/20 text-red-400 hover:bg-red-400/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'fraud' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h4 className="text-red-400 font-semibold text-sm mb-3">
                    🚨 8 Fraud Signals
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { signal: "Velocity Spike", desc: ">50 signups/24h", severity: "high" },
                      { signal: "Geo Mismatch", desc: "IP ≠ billing country", severity: "medium" },
                      { signal: "Refund Cluster", desc: ">3 refunds/7d", severity: "critical" },
                      { signal: "Coupon Abuse", desc: "Same device, many emails", severity: "high" },
                      { signal: "Duplicate Device", desc: "Fingerprint reuse", severity: "medium" },
                      { signal: "Suspicious Email", desc: "Temp email domains", severity: "medium" },
                      { signal: "BIN Mismatch", desc: "Card validation fails", severity: "high" },
                      { signal: "Chargeback", desc: "Customer disputes", severity: "critical" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-medium text-xs">{item.signal}</p>
                          <Badge className={`text-xs ${
                            item.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            item.severity === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                  {fraudLib}
                </pre>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Auto-Actions</h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-red-400">🔴 Suspend Partner:</span>
                        <span className="text-gray-400"> Critical fraud</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">🟡 Pause Partner:</span>
                        <span className="text-gray-400"> High severity</span>
                      </div>
                      <div>
                        <span className="text-blue-400">🔵 Flag for Review:</span>
                        <span className="text-gray-400"> Medium severity</span>
                      </div>
                      <div>
                        <span className="text-gray-400">⚪ None:</span>
                        <span className="text-gray-400"> No signals</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Thresholds</h4>
                    <div className="space-y-1 text-xs">
                      <code className="text-[#00D4C9] block">FRAUD_VELOCITY_THRESHOLD=50</code>
                      <code className="text-[#00D4C9] block">FRAUD_REFUND_CLUSTER=3</code>
                      <code className="text-[#00D4C9] block">FRAUD_AUTO_PAUSE=true</code>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#9D4EDD]" />
                    Stripe Webhook Integration
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => copyCode(webhooksCode, 'webhooks')}
                    className="bg-[#9D4EDD]/20 text-[#9D4EDD] hover:bg-[#9D4EDD]/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'webhooks' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h4 className="text-purple-400 font-semibold text-sm mb-2">
                    ⚡ 4 Stripe Events
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { event: "invoice.payment_succeeded", action: "Create recurring commission" },
                      { event: "customer.subscription.created", action: "First payment, update stats" },
                      { event: "customer.subscription.deleted", action: "Decrease MRR, stop recurring" },
                      { event: "charge.refunded", action: "Clawback if <45 days" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <code className="text-[#00D4C9]">{item.event}</code>
                          <p className="text-gray-400">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800 max-h-96">
                  {webhooksCode}
                </pre>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <h4 className="text-yellow-400 font-semibold text-sm mb-2">
                    🔐 Security Requirements
                  </h4>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div>✅ Verify webhook signature using Stripe SDK</div>
                    <div>✅ Use express.raw() middleware for signature verification</div>
                    <div>✅ Set STRIPE_WEBHOOK_SECRET in .env</div>
                    <div>✅ Return 200 immediately, process async</div>
                    <div>✅ Implement idempotency (check event.id)</div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Cron Jobs Tab */}
          <TabsContent value="cron">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Automated Jobs</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => copyCode(cronJobs, 'cron')}
                    className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'cron' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <h4 className="text-blue-400 font-semibold text-sm mb-3">
                    ⏰ 4 Scheduled Jobs
                  </h4>
                  <div className="space-y-2">
                    {[
                      { job: "Monthly Payouts", schedule: "1st at 3am", desc: "Process approved commissions" },
                      { job: "Tier Updates", schedule: "Daily at 2am", desc: "Check MRR thresholds, advance tiers" },
                      { job: "Fraud Sweep", schedule: "Every 6 hours", desc: "Detect velocity spikes, patterns" },
                      { job: "Deal Expiration", schedule: "Daily at 1am", desc: "Expire old deal registrations" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-medium text-xs">{item.job}</p>
                          <code className="text-[#00D4C9] text-xs">{item.schedule}</code>
                        </div>
                        <p className="text-gray-400 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
                  {cronJobs}
                </pre>

                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-3 text-sm">Installation</h4>
                  <code className="text-[#00D4C9] text-xs block mb-2">npm install node-cron</code>
                  <p className="text-gray-400 text-xs">
                    Add cron jobs to your server.js or separate worker process
                  </p>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing">
            <Card className="bg-[#111] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">API Testing Guide</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => copyCode(testingGuide, 'testing')}
                    className="bg-green-400/20 text-green-400 hover:bg-green-400/30"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedSection === 'testing' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h4 className="text-green-400 font-semibold text-sm mb-2">
                    ✅ 6 Test Scenarios
                  </h4>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div>1. Track affiliate click → Verify attribution record</div>
                    <div>2. Resolve attribution → Test coupon &gt; last-click &gt; first-click</div>
                    <div>3. Create commission → Verify amount calculation</div>
                    <div>4. Register deal → Check duplicate detection</div>
                    <div>5. Validate coupon → Test expiration, limits</div>
                    <div>6. Detect fraud → Trigger velocity spike</div>
                  </div>
                </div>

                <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800 max-h-96">
                  {testingGuide}
                </pre>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Tools Needed</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>• Postman or Insomnia (API testing)</div>
                      <div>• Stripe CLI (webhook testing)</div>
                      <div>• Jest (unit tests)</div>
                      <div>• Supertest (integration tests)</div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <h4 className="text-white font-semibold mb-3 text-sm">Test Stripe Webhooks</h4>
                    <code className="text-[#00D4C9] text-xs block mb-1">
                      stripe listen --forward-to localhost:8787/api/partners/webhook/stripe
                    </code>
                    <code className="text-[#00D4C9] text-xs block">
                      stripe trigger invoice.payment_succeeded
                    </code>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Implementation Checklist */}
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              10-Day Implementation Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { phase: "Day 1", tasks: "Database schema setup (9 entities)" },
                { phase: "Days 2-3", tasks: "Core API routes (tracking, attribution, commissions)" },
                { phase: "Days 3-4", tasks: "Webhook handlers (Stripe events)" },
                { phase: "Day 4", tasks: "Attribution logic (coupon > last-click > first-click)" },
                { phase: "Day 5", tasks: "Fraud detection system" },
                { phase: "Days 6-7", tasks: "Payout processing (PayPal/Stripe)" },
                { phase: "Day 7", tasks: "Tier management & advancement" },
                { phase: "Day 8", tasks: "Cron jobs (payouts, fraud, tiers)" },
                { phase: "Days 9-10", tasks: "Testing & monitoring" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <div className="w-16 h-10 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-sm">{item.phase}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{item.tasks}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="bg-[#111] border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Environment Variables</CardTitle>
              <Button
                size="sm"
                onClick={() => copyCode(envVars, 'env')}
                className="bg-[#00D4C9]/20 text-[#00D4C9] hover:bg-[#00D4C9]/30"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copiedSection === 'env' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800">
              {envVars}
            </pre>
          </CardContent>
        </Card>

        {/* Integration Checklist */}
        <Card className="bg-[#111] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Complete Integration Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-[#000] p-4 rounded-xl overflow-x-auto text-xs text-gray-300 border border-gray-800 max-h-96 whitespace-pre-wrap">
              {integrationChecklist}
            </pre>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Important Notes for Developer
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Replace all <code className="text-[#00D4C9]">// TODO</code> comments with actual database calls</div>
              <div>• Use Base44 SDK or direct database queries for entity operations</div>
              <div>• Encrypt sensitive fields (api_key, access_token) before storing</div>
              <div>• Add rate limiting to prevent abuse (express-rate-limit)</div>
              <div>• Log all commission/payout operations for audit trail</div>
              <div>• Test webhook flows with Stripe CLI before production</div>
              <div>• Set up monitoring for payout failures</div>
              <div>• Create admin dashboard for fraud review queue</div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}