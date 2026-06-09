import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityActivityWidget({ user }) {
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['securityActivity', user?.email],
    queryFn: () => base44.entities.ActivityLog.filter(
      { user_email: user.email },
      '-created_date',
      10
    ),
    enabled: !!user
  });

  const { data: sessionLogs = [] } = useQuery({
    queryKey: ['sessionLogs', user?.email],
    queryFn: () => base44.entities.SessionLog.filter(
      { user_email: user.email },
      '-created_date',
      5
    ),
    enabled: !!user
  });

  const getActionIcon = (actionType) => {
    switch(actionType) {
      case 'login':
        return CheckCircle2;
      case 'create':
      case 'update':
        return Shield;
      case 'delete':
        return AlertCircle;
      default:
        return Shield;
    }
  };

  const getActionColor = (actionType) => {
    switch(actionType) {
      case 'login':
        return 'text-green-400';
      case 'create':
      case 'update':
        return 'text-blue-400';
      case 'delete':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00D4C9]" />
          Last Account Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentActivity.slice(0, 5).map((activity, idx) => {
            const ActionIcon = getActionIcon(activity.action_type);
            const colorClass = getActionColor(activity.action_type);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-2 bg-[#0B0B0C] rounded-lg hover:bg-[#0F0F14] transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ActionIcon className={`w-3 h-3 ${colorClass} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs truncate">
                      {activity.action_type === 'login' && '🔐 Login'}
                      {activity.action_type === 'create' && `✨ Created ${activity.entity_type}`}
                      {activity.action_type === 'update' && `📝 Updated ${activity.entity_type}`}
                      {activity.action_type === 'delete' && `🗑️ Deleted ${activity.entity_type}`}
                      {activity.action_type === 'render' && '🎬 Rendered video'}
                      {activity.action_type === 'export' && '📤 Exported data'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(activity.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                {activity.ip_address && (
                  <Badge className="bg-gray-700 text-gray-400 text-xs ml-2">
                    <MapPin className="w-2 h-2 mr-1" />
                    {activity.ip_address.split('.')[0]}.xxx
                  </Badge>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Active Sessions */}
        {sessionLogs.filter(s => s.is_active).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-2">Active Sessions</p>
            <div className="space-y-1">
              {sessionLogs.filter(s => s.is_active).map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-white text-xs capitalize">{session.device_type || 'Unknown'}</p>
                  </div>
                  <p className="text-gray-400 text-xs">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(session.last_activity).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentActivity.length === 0 && (
          <div className="text-center py-6">
            <Shield className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-gray-400 text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}