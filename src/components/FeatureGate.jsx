import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FOUNDER_EMAILS = ["dptrini@gmail.com", "aifreedomstudios.@gmail.com"];

export default function FeatureGate({ featureId, children, fallback }) {
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if user is admin/super_admin first — bypass gate entirely
        const user = await base44.auth.me();
        if (
          user?.role === 'admin' ||
          user?.custom_role === 'super_admin' ||
          user?.custom_role === 'founder' ||
          FOUNDER_EMAILS.includes(user?.email)
        ) {
          setAccess({ has_access: true });
          setLoading(false);
          return;
        }

        const response = await base44.functions.invoke('checkFeatureAccess', {
          feature_id: featureId
        });
        // Default to granting access if feature is not found (404) or response is unclear
        setAccess(response.data?.has_access !== undefined ? response.data : { has_access: true });
      } catch (error) {
        console.error('Failed to check feature access:', error);
        // Default to allowing access on error to avoid false lockouts
        setAccess({ has_access: true });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [featureId]);

  if (loading) return <div className="text-gray-400 text-sm">Checking access...</div>;

  if (!access?.has_access) {
    return (
      fallback || (
        <Card className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-purple-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">Premium Feature</h4>
              <p className="text-sm text-gray-400">
                {access?.upgrade_prompt || `Upgrade to ${access?.required_tier} to unlock this feature`}
              </p>
            </div>
            <Link to={access?.upgrade_url || '/pricing'}>
              <Button className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white">
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      )
    );
  }

  return children;
}