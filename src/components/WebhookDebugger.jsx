import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, Trash2, Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function WebhookDebugger() {
  const [selectedLog, setSelectedLog] = useState(null);
  const [testUrl, setTestUrl] = useState("");
  const [filterSuccess, setFilterSuccess] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('getWebhookLogs', {});
        return response.data.logs || [];
      } catch {
        return [];
      }
    },
    refetchInterval: 5000
  });

  const filteredLogs = filterSuccess === "all" 
    ? logs 
    : logs.filter(l => filterSuccess === "success" ? l.success : !l.success);

  const testWebhook = async () => {
    if (!testUrl) return;
    try {
      await base44.functions.invoke('sendTestWebhook', { url: testUrl });
    } catch (error) {
      console.error('Test webhook failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400">Test Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="https://your-webhook-endpoint.com/webhook"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="bg-black/30 border-gray-700 text-white"
            />
            <Button onClick={testWebhook} className="bg-orange-600 hover:bg-orange-700">
              Send Test
            </Button>
          </div>
          <p className="text-xs text-gray-400">Sends a sample event to test your endpoint</p>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-4">
        {['all', 'success', 'failed'].map(filter => (
          <Button
            key={filter}
            variant={filterSuccess === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterSuccess(filter)}
            className={filterSuccess === filter ? "bg-orange-600" : "border-gray-700"}
          >
            {filter === 'all' ? 'All Logs' : filter === 'success' ? '✓ Successful' : '✗ Failed'}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading logs...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Logs List */}
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <p className="text-gray-400 text-sm p-4 text-center">No webhook logs yet</p>
            ) : (
              filteredLogs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedLog === log
                      ? 'bg-orange-500/20 border border-orange-500/50'
                      : 'bg-black/30 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-xs text-gray-400 font-mono">{log.event_type}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.response_status || 'timeout'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{log.webhook_url}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {log.response_time_ms}ms • {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>

          {/* Log Detail */}
          {selectedLog ? (
            <Card className="bg-[#0B0B0C] border-gray-800 max-h-96 overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-orange-400">Request Details</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedLog(null)}
                    className="h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1 font-semibold">Endpoint</p>
                  <code className="block bg-black/30 p-2 rounded text-cyan-400 break-words">
                    {selectedLog.webhook_url}
                  </code>
                </div>

                <div>
                  <p className="text-gray-400 mb-1 font-semibold">Request Body</p>
                  <pre className="bg-black/30 p-2 rounded text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.request_body, null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-gray-400 mb-1 font-semibold">Response</p>
                  <pre className="bg-black/30 p-2 rounded text-gray-300 overflow-x-auto">
                    {selectedLog.response_body || selectedLog.error_message || 'No response'}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-400 mb-1">Response Time</p>
                    <p className="text-cyan-400 font-mono">{selectedLog.response_time_ms}ms</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Retries</p>
                    <p className="text-cyan-400 font-mono">{selectedLog.retry_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#0B0B0C] border-gray-800 flex items-center justify-center min-h-80">
              <p className="text-gray-600 text-sm">Select a log to view details</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}