import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Search, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function AuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      try {
        const response = await base44.entities.AuditLog.list('-created_date', 100);
        return response;
      } catch {
        return [];
      }
    },
    refetchInterval: 30000
  });

  const actionColors = {
    create: 'bg-green-500/20 text-green-400',
    update: 'bg-blue-500/20 text-blue-400',
    delete: 'bg-red-500/20 text-red-400',
    read: 'bg-gray-500/20 text-gray-400',
    execute: 'bg-purple-500/20 text-purple-400',
    api_call: 'bg-cyan-500/20 text-cyan-400'
  };

  const statusIcons = {
    success: '✓',
    failed: '✗',
    denied: '⛔'
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_id?.includes(searchTerm);
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const exportAuditLog = async () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name', 'Status', 'IP Address'].join(','),
      ...filteredLogs.map(l => [
        l.timestamp,
        l.user_email,
        l.action,
        l.resource_type,
        l.resource_name,
        l.status,
        l.ip_address
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
        <button
          onClick={exportAuditLog}
          className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by user, resource, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/30 border-gray-700 text-white pl-10"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-black/30 border border-gray-700 text-white px-3 py-2 rounded"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="api_call">API Call</option>
        </select>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Loading audit logs...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-gray-400 text-sm p-4 text-center">No logs found</p>
        ) : (
          filteredLogs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className="bg-[#0B0B0C] border-gray-800 cursor-pointer hover:border-gray-700 transition-all"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`text-lg ${
                        log.status === 'success' ? 'text-green-400' :
                        log.status === 'denied' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {statusIcons[log.status]}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={actionColors[log.action] || 'bg-gray-500/20 text-gray-400'}>
                            {log.action}
                          </Badge>
                          <Badge className="bg-gray-500/20 text-gray-400">{log.resource_type}</Badge>
                          <span className="text-sm text-gray-300 truncate">{log.resource_name}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {log.user_email} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedId === log.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedId === log.id && (
                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400 mb-1">IP Address</p>
                          <code className="text-cyan-400 bg-black/50 px-2 py-1 rounded block">{log.ip_address}</code>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">User Agent</p>
                          <code className="text-cyan-400 bg-black/50 px-2 py-1 rounded block truncate">{log.user_agent}</code>
                        </div>
                      </div>

                      {log.error_reason && (
                        <div>
                          <p className="text-gray-400 mb-1 text-xs">Error Reason</p>
                          <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">{log.error_reason}</p>
                        </div>
                      )}

                      {log.changes && (
                        <div>
                          <p className="text-gray-400 mb-1 text-xs">Changes</p>
                          <pre className="text-gray-300 text-xs bg-black/50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}