import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardDrive, AlertTriangle, CheckCircle2, Database, Shield } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function DisasterRecoveryPanel() {
  const [showConfirm, setShowConfirm] = useState(null);

  const { data: drData = {}, isLoading } = useQuery({
    queryKey: ['dr-status'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('disasterRecovery', {
          action: 'get_dr_plan'
        });
        return response.data;
      } catch {
        return {};
      }
    },
    refetchInterval: 30000
  });

  const { data: backups = [] } = useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('disasterRecovery', {
          action: 'list_backups'
        });
        return response.data.backups || [];
      } catch {
        return [];
      }
    }
  });

  const createBackupMutation = useMutation({
    mutationFn: () => base44.functions.invoke('disasterRecovery', {
      action: 'create_backup'
    })
  });

  const { plan } = drData;

  if (isLoading) {
    return <p className="text-gray-400 text-sm">Loading DR status...</p>;
  }

  return (
    <div className="space-y-6">
      {/* DR Status Overview */}
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Disaster Recovery Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">RTO (Recovery Time Objective)</p>
                  <p className="text-lg font-bold text-white">{plan.rto_minutes}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">RPO (Recovery Point Objective)</p>
                  <p className="text-lg font-bold text-white">{plan.rpo_minutes}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Failover Strategy</p>
                  <Badge className="bg-blue-500/20 text-blue-400 mt-1">
                    {plan.failover_strategy}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Replication Lag</p>
                  <p className="text-lg font-bold text-green-400">{plan.replication_lag_seconds?.toFixed(1)}s</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {plan.replication_enabled ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-green-400">Real-time replication active</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm text-yellow-400">Replication paused</p>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Backup Management */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Backups
        </h3>

        <div className="mb-4">
          <Button
            onClick={() => createBackupMutation.mutate()}
            disabled={createBackupMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {createBackupMutation.isPending ? 'Creating Backup...' : 'Create Full Backup Now'}
          </Button>
        </div>

        {backups.length === 0 ? (
          <Card className="bg-[#0B0B0C] border-gray-800">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400 text-sm">No backups yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {backups.map((backup, idx) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`bg-[#0B0B0C] border-gray-800 ${
                  backup.status === 'completed' ? 'border-green-500/30' : 
                  backup.status === 'failed' ? 'border-red-500/30' : 
                  'border-blue-500/30'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="font-semibold text-white capitalize">{backup.type} Backup</p>
                          <p className="text-xs text-gray-400">{backup.size_mb}MB • {new Date(backup.created).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={
                          backup.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          backup.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {backup.status}
                        </Badge>

                        {backup.status === 'completed' && (
                          <Button
                            onClick={() => setShowConfirm(backup.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>

                    {showConfirm === backup.id && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <p className="text-xs text-yellow-400 mb-2">⚠️ This will overwrite current data. Confirm?</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-xs flex-1"
                            onClick={() => {
                              // Trigger restore
                              setShowConfirm(null);
                            }}
                          >
                            Confirm Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs flex-1"
                            onClick={() => setShowConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}