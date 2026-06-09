import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feature_id } = await req.json();

    if (!feature_id) {
      return Response.json({ error: 'feature_id required' }, { status: 400 });
    }

    // Get feature definition
    const features = await base44.asServiceRole.entities.FeatureLock.filter({
      feature_id: feature_id,
      is_active: true
    });

    if (!features || features.length === 0) {
      return Response.json({ error: 'Feature not found' }, { status: 404 });
    }

    const feature = features[0];

    // Super admins and admins always have full access
    const FOUNDER_EMAILS = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];
    const isAdminOrFounder = user.role === 'admin' ||
      user.custom_role === 'super_admin' ||
      user.custom_role === 'founder' ||
      FOUNDER_EMAILS.includes(user.email);

    if (isAdminOrFounder) {
      return Response.json({
        feature_id: feature.feature_id,
        feature_name: feature.feature_name,
        has_access: true,
        user_tier: 'enterprise',
        required_tier: feature.min_tier,
        upgrade_prompt: null,
        upgrade_url: null
      });
    }

    const userTier = user.subscription_tier || 'free';

    // Tier hierarchy
    const tierOrder = { free: 0, starter: 1, professional: 2, enterprise: 3 };
    const minTierOrder = tierOrder[feature.min_tier];
    const userTierOrder = tierOrder[userTier];

    const hasAccess = userTierOrder >= minTierOrder;

    return Response.json({
      feature_id: feature.feature_id,
      feature_name: feature.feature_name,
      has_access: hasAccess,
      user_tier: userTier,
      required_tier: feature.min_tier,
      upgrade_prompt: feature.upgrade_prompt,
      upgrade_url: hasAccess ? null : '/pricing'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});