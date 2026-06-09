import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function SLATracking() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    service_name: '',
    uptime_target: 99.9,
    latency_target_ms: 200,
    error_rate_target: 0.5
  });

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['sla-configs'],
    queryFn: async () => await base44.entities.SLAConfig.list('-created_date', 100)
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['sla-compliance'],
    queryFn: async () => await base44.entities.SLACompliance.list('-period_end', 200),
    refetchInterval: 60000
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SLAConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-configs'] });
      setNewConfig({
        service_name: '',
        uptime_target: 99.9,
        latency_target_ms: 200,
        error_rate_target: 0.5
      });
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SLAConfig.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sla-configs'] })
  });

  const mockComplianceData = [
    { time: '00:00', uptime: 99.95, latency: 150, errorRate: 0.2 },
    { time: '04:00', uptime: 99.92, latency: 165, errorRate: 0.3 },
    { time: '08:00', uptime: 99.88, latency: 200, errorRate: 0.5 },
    { time: '12:00', uptime: 99.85, latency: 220, errorRate: 0.8 },
    { time: '16:00', uptime: 99.90, latency: 190, errorRate: 0.4 },
    { time: '20:00', uptime: 99.94, latency: 160, errorRate: 0.2 }
  ];

  const stats = [
    { label: 'Services Tracked', value: configs.length, color: 'text-cyan-400' },
    { label: 'Compliant', value: compliance.filter(c => c.overall_compliance === 'compliant').length, color: 'text-green-400' },
    { label: 'At Risk', value: compliance.filter(c => c.overall_compliance === 'at_risk').length, color: 'text-yellow-400' },
    { label: 'Breached', value: compliance.filter(c => c.overall_compliance === 'non_compliant').length, color: 'text-red-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">📊 SLA Tracking</h1>
          <p className="text-gray-400">Monitor service level agreements in real-time</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-[#0B0B0C] border-gray-800">
              <CardContent className="p-6">
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SLA Configs */}
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-cyan-400">Configured SLAs</CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-cyan-600 hover:bg-cyan-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New SLA
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30 space-y-3"
              >
                <Input
                  placeholder="Service Name (e.g., Video Rendering)"
                  value={newConfig.service_name}
                  onChange={(e) => setNewConfig({...newConfig, service_name: e.target.value})}
                  className="bg-slate-900 border-gray-700"
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="number"
                    placeholder="Uptime %"
                    value={newConfig.uptime_target}
                    onChange={(e) => setNewConfig({...newConfig, uptime_target: parseFloat(e.target.value)})}
                    className="bg-slate-900 border-gray-700"
                    step="0.1"
                  />
                  <Input
                    type="number"
                    placeholder="Max Latency (ms)"
                    value={newConfig.latency_target_ms}
                    onChange={(e) => setNewConfig({...newConfig, latency_target_ms: parseInt(e.target.value)})}
                    className="bg-slate-900 border-gray-700"
                  />
                  <Input
                    type="number"
                    placeholder="Error Rate %"
                    value={newConfig.error_rate_target}
                    onChange={(e) => setNewConfig({...newConfig, error_rate_target: parseFloat(e.target.value)})}
                    className="bg-slate-900 border-gray-700"
                    step="0.1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => createMutation.mutate(newConfig)}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    disabled={!newConfig.service_name || createMutation.isPending}
                  >
                    Create SLA
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {isLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : configs.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No SLA configurations yet</p>
            ) : (
              <div className="space-y-3">
                {configs.map((config) => (
                  <motion.div
                    key={config.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-800/30 rounded border border-gray-800 hover:border-cyan-500/30 transition-all flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{config.service_name}</h4>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>↑ {config.uptime_target}% uptime</span>
                        <span>⏱ {config.latency_target_ms}ms latency</span>
                        <span>❌ {config.error_rate_target}% errors</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => deleteMutation.mutate(config.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Trends */}
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardHeader>
            <CardTitle className="text-cyan-400">24h Compliance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockComplianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #444'}} />
                <Legend />
                <Line type="monotone" dataKey="uptime" stroke="#00D9FF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardHeader>
            <CardTitle className="text-cyan-400">Service Status Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {configs.length > 0 ? (
              configs.map((config) => {
                const latestCompliance = compliance.find(c => c.sla_config_id === config.id);
                return (
                  <div key={config.id} className="p-4 bg-slate-800/30 rounded border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{config.service_name}</h4>
                      {latestCompliance?.overall_compliance === 'compliant' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    {latestCompliance && (
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Uptime: <span className="text-white">{latestCompliance.actual_uptime.toFixed(2)}%</span></p>
                        <p>Downtime: <span className="text-white">{latestCompliance.total_downtime_minutes}m</span></p>
                        <p>Breaches: <span className="text-white">{latestCompliance.breach_count}</span></p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 col-span-2">No services configured</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}