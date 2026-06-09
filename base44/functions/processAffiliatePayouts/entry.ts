// deno-lint-ignore-file no-undef
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Supports two modes:
    // 1. Triggered by entity automation (event.type = "create/update", data = PaymentHistory record)
    // 2. Manual trigger with { payment_id, manual: true } for admin use
    let payment = body.data || null;
    const isManual = body.manual === true;

    if (isManual && body.payment_id) {
      const results = await base44.asServiceRole.entities.PaymentHistory.filter({ id: body.payment_id });
      payment = results[0] || null;
    }

    if (!payment) {
      return Response.json({ error: 'No payment record provided' }, { status: 400 });
    }

    // Only process succeeded payments
    if (payment.status !== 'succeeded') {
      return Response.json({ skipped: true, reason: `Payment status is ${payment.status}` });
    }

    // Check if commissions already exist for this payment to avoid duplicates
    const existingCommissions = await base44.asServiceRole.entities.AffiliateCommission.filter({
      payment_id: payment.id
    });
    if (existingCommissions.length > 0) {
      return Response.json({ skipped: true, reason: 'Commissions already processed for this payment' });
    }

    // Find the affiliate referral for this subscriber (via metadata.affiliate_code or AffiliateLink)
    const affiliateCode = payment.metadata?.affiliate_code || null;
    if (!affiliateCode) {
      return Response.json({ skipped: true, reason: 'No affiliate code on this payment' });
    }

    // Look up the active affiliate by code
    const affiliates = await base44.asServiceRole.entities.Affiliate.filter({
      affiliate_code: affiliateCode,
      status: 'active'
    });

    if (affiliates.length === 0) {
      return Response.json({ skipped: true, reason: `No active affiliate found for code: ${affiliateCode}` });
    }

    const affiliate = affiliates[0];
    const commissionRate = affiliate.commission_rate || 30; // default 30%
    const saleAmount = payment.amount_usd;
    const commissionAmount = parseFloat(((saleAmount * commissionRate) / 100).toFixed(2));

    // Create the commission record
    const commission = await base44.asServiceRole.entities.AffiliateCommission.create({
      affiliate_email: affiliate.user_email,
      customer_email: payment.user_email,
      payment_id: payment.id,
      sale_amount_usd: saleAmount,
      commission_rate: commissionRate,
      commission_amount_usd: commissionAmount,
      status: 'approved',
      approved_at: new Date().toISOString()
    });

    // Update affiliate totals
    const newPendingBalance = parseFloat(((affiliate.pending_balance_usd || 0) + commissionAmount).toFixed(2));
    const newTotalEarned = parseFloat(((affiliate.total_earned_usd || 0) + commissionAmount).toFixed(2));
    const newTotalConversions = (affiliate.total_conversions || 0) + 1;

    await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
      pending_balance_usd: newPendingBalance,
      total_earned_usd: newTotalEarned,
      total_conversions: newTotalConversions
    });

    // Auto-payout if affiliate has a configured payment method and balance >= $50 threshold
    let payoutResult = null;
    if (affiliate.payment_method && newPendingBalance >= 50) {
      // Collect all approved (unpaid) commissions for this affiliate
      const pendingCommissions = await base44.asServiceRole.entities.AffiliateCommission.filter({
        affiliate_email: affiliate.user_email,
        status: 'approved'
      });

      const totalPayout = pendingCommissions.reduce((sum, c) => sum + (c.commission_amount_usd || 0), 0);
      const commissionIds = pendingCommissions.map(c => c.id);

      // Create payout record
      const payout = await base44.asServiceRole.entities.PartnerPayout.create({
        partner_id: affiliate.id,
        payout_period: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString(),
          month: new Date().toISOString().slice(0, 7)
        },
        total_amount_usd: parseFloat(totalPayout.toFixed(2)),
        commission_count: commissionIds.length,
        commission_ids: commissionIds,
        payment_method: affiliate.payment_method,
        payment_details: affiliate.payment_details || {},
        status: 'processing',
        notes: `Auto-payout triggered after $${newPendingBalance} balance reached threshold`
      });

      // Mark all commissions as paid
      for (const cId of commissionIds) {
        await base44.asServiceRole.entities.AffiliateCommission.update(cId, {
          status: 'paid',
          paid_at: new Date().toISOString()
        });
      }

      // Reset affiliate pending balance, update total paid
      await base44.asServiceRole.entities.Affiliate.update(affiliate.id, {
        pending_balance_usd: 0,
        total_paid_usd: parseFloat(((affiliate.total_paid_usd || 0) + totalPayout).toFixed(2))
      });

      // Notify via Slack
      try {
        await base44.asServiceRole.functions.invoke('postSlackUpdate', {
          message: `💸 Auto-payout of $${totalPayout.toFixed(2)} queued for affiliate ${affiliate.user_email} via ${affiliate.payment_method}`
        });
      } catch (_) { /* non-fatal */ }

      payoutResult = { payout_id: payout.id, amount: totalPayout, method: affiliate.payment_method };
    }

    return Response.json({
      success: true,
      commission_id: commission.id,
      affiliate_email: affiliate.user_email,
      commission_amount: commissionAmount,
      commission_rate: commissionRate,
      payout_triggered: !!payoutResult,
      payout: payoutResult
    });

  } catch (error) {
    console.error('Payout processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});