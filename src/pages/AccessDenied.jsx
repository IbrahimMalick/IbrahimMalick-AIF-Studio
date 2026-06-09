import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertCircle, Home, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccessDenied() {
  const [user, setUser] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const requestAccess = async () => {
    try {
      const deniedPath = sessionStorage.getItem('afs_denied_path') || 'unknown';
      
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: 'access_request',
        entity_type: 'permission',
        details: {
          requested_path: deniedPath,
          current_role: user.role || user.custom_role,
          reason: 'User requested access via 403 page'
        }
      });

      // Create notification for admins
      const admins = await base44.entities.User.filter({ role: 'admin' });
      for (const admin of admins) {
        await base44.entities.Notification.create({
          user_email: admin.email,
          title: 'Access Request',
          message: `${user.full_name || user.email} requested access to ${deniedPath}`,
          type: 'warning',
          category: 'system'
        });
      }

      setRequestSent(true);
    } catch (error) {
      console.error('Error requesting access:', error);
      alert('Failed to send access request. Please contact your administrator directly.');
    }
  };

  const roleHierarchy = ['viewer', 'user', 'manager', 'admin', 'owner'];
  const currentRole = user?.custom_role || user?.role || 'user';
  const currentRoleIndex = roleHierarchy.indexOf(currentRole.toLowerCase());

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-[#111317] border-red-500/30 rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <Lock className="w-10 h-10 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-white text-center text-3xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-4">
                You don't have permission to access this page
              </p>
              {user && (
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Badge className="bg-gray-700 text-gray-300">
                    Your Role: {currentRole}
                  </Badge>
                  {user.permissions && user.permissions.length > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {user.permissions.length} Permission{user.permissions.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Role Hierarchy Visualization */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl">
              <p className="text-gray-400 text-sm mb-3 text-center">Role Hierarchy</p>
              <div className="flex items-center justify-center gap-2">
                {roleHierarchy.map((role, idx) => (
                  <React.Fragment key={role}>
                    <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                      idx <= currentRoleIndex
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {role}
                    </div>
                    {idx < roleHierarchy.length - 1 && (
                      <div className="text-gray-600">→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* What to Do */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-blue-400 font-semibold text-sm mb-1">Need Access?</p>
                  <p className="text-gray-300 text-xs">
                    Request elevated permissions from your administrator. They'll be notified immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-400 font-semibold text-sm mb-1">Contact Admin</p>
                  <p className="text-gray-300 text-xs">
                    Email your administrator to explain why you need access to this feature.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-[#111]">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Button
                onClick={requestAccess}
                disabled={requestSent || !user}
                className="w-full bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-white font-bold"
              >
                {requestSent ? (
                  <>✓ Request Sent</>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Request Access
                  </>
                )}
              </Button>
            </div>

            {requestSent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center"
              >
                <p className="text-green-400 font-semibold mb-1">✓ Request Submitted</p>
                <p className="text-gray-300 text-sm">
                  Administrators have been notified. You'll receive an email when your access is granted.
                </p>
              </motion.div>
            )}

            {/* Security Note */}
            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs text-center">
                🔒 This platform uses role-based access control (RBAC) to protect sensitive data and features.
                Learn more in <Link to={createPageUrl('SecurityDocs')} className="text-[#00D4C9] hover:underline">Security Docs</Link>.
              </p>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}