
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Trash2, RotateCcw, Download, Layers, CheckCircle2 } from "lucide-react";

const API_BASE = "http://localhost:8787/api";

export default function DeadLetterQueueViewer({ onRetry }) {
  const [selectedJobs, setSelectedJobs] = useState([]);

  const { data: dlqJobs = [], isLoading, refetch } = useQuery({
    queryKey: ["dlqJobs"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/runs/dlq/list`);
        const data = await response.json();
        return data.jobs || [];
      } catch (error) {
        console.error("DLQ fetch error:", error);
        return [];
      }
    },
    refetchInterval: 8000,
    initialData: []
  });

  const retryJob = async (job) => {
    try {
      const response = await fetch(`${API_BASE}/runs/dlq/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id })
      });
      
      if (response.ok) {
        alert("✅ Job re-queued successfully!");
        refetch();
        if (onRetry) onRetry();
      } else {
        const error = await response.json();
        alert(`❌ Failed to retry: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert("❌ Failed to retry job: " + error.message);
    }
  };

  const deleteJob = async (job) => {
    if (!confirm(`Permanently delete job "${job.id}" from DLQ?\n\nThis cannot be undone.`)) return;
    
    try {
      const response = await fetch(`${API_BASE}/runs/dlq/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id })
      });
      
      if (response.ok) {
        alert("✅ Job deleted from DLQ");
        refetch();
        if (onRetry) onRetry();
      } else {
        const error = await response.json();
        alert(`❌ Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert("❌ Failed to delete job: " + error.message);
    }
  };

  const bulkRetryAll = async () => {
    if (!confirm(`Retry all ${dlqJobs.length} failed jobs?`)) return;

    let successCount = 0;
    for (const job of dlqJobs) {
      try {
        const response = await fetch(`${API_BASE}/runs/dlq/retry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id })
        });
        if (response.ok) successCount++;
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }

    alert(`✅ Re-queued ${successCount}/${dlqJobs.length} jobs successfully!`);
    refetch();
    if (onRetry) onRetry();
  };

  const bulkDeleteAll = async () => {
    if (!confirm(`⚠️ DANGER: Delete all ${dlqJobs.length} failed jobs from DLQ?\n\nThis will PERMANENTLY remove them. Cannot be undone!`)) return;
    
    let successCount = 0;
    for (const job of dlqJobs) {
      try {
        const response = await fetch(`${API_BASE}/runs/dlq/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id })
        });
        if (response.ok) successCount++;
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }

    alert(`✅ Deleted ${successCount}/${dlqJobs.length} jobs from DLQ`);
    refetch();
    if (onRetry) onRetry();
  };

  const exportDLQ = () => {
    const exportData = dlqJobs.map(job => ({
      job_id: job.id,
      job_name: job.name,
      failed_at: job.ts,
      failed_reason: job.failedReason,
      attempts_made: job.attemptsMade,
      payload: job.data,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dlq-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-white font-bold text-lg">Dead Letter Queue</h3>
            <p className="text-gray-400 text-sm">Failed jobs • Auto-refresh every 8s</p>
          </div>
        </div>
        <div className="flex gap-2">
          {dlqJobs.length > 0 && (
            <>
              <Button
                onClick={exportDLQ}
                variant="outline"
                size="sm"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={bulkDeleteAll}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Purge All
              </Button>
              <Button
                onClick={bulkRetryAll}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Layers className="w-4 h-4 mr-2" />
                Retry All ({dlqJobs.length})
              </Button>
            </>
          )}
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-600 animate-spin" />
          <p className="text-gray-400">Loading DLQ...</p>
        </div>
      ) : dlqJobs.length === 0 ? (
        <Card className="bg-[#111317] border-green-500/30 rounded-xl">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <p className="text-green-400 font-semibold mb-2">DLQ is Empty! 🎉</p>
            <p className="text-gray-400 text-sm">No failed jobs at the moment. Your workflow system is running smoothly.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {dlqJobs.map((job) => (
            <Card key={job.id} className="bg-[#111317] border-red-500/30 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-red-500/20 text-red-400">
                        Failed Job
                      </Badge>
                      <Badge className="bg-gray-700 text-gray-400 text-xs">
                        {job.attemptsMade || 0} attempts
                      </Badge>
                    </div>
                    
                    <p className="text-white font-semibold mb-1">
                      {job.name || `Job #${job.id}`}
                    </p>
                    
                    <p className="text-gray-400 text-sm mb-3">
                      Failed: {job.ts ? new Date(job.ts).toLocaleString() : 'Unknown'}
                    </p>

                    {job.failedReason && (
                      <div className="p-3 bg-black rounded-lg border border-red-500/30 mb-3">
                        <p className="text-red-400 text-xs font-mono">
                          {job.failedReason}
                        </p>
                      </div>
                    )}

                    {job.data && (
                      <details className="mt-3">
                        <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300">
                          View Payload
                        </summary>
                        <pre className="mt-2 p-3 bg-black rounded text-xs text-gray-400 overflow-x-auto">
                          {JSON.stringify(job.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => retryJob(job)}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                    <Button
                      onClick={() => deleteJob(job)}
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 rounded-xl">
        <CardContent className="p-6">
          <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            About the Dead Letter Queue
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Jobs land here after exhausting all retry attempts. This prevents infinite loops while preserving job data for inspection.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">⚡ Retry</p>
              <p className="text-gray-300 text-xs">Re-queues job with fresh attempts (max 3)</p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">🗑️ Delete</p>
              <p className="text-gray-300 text-xs">Permanently removes poison jobs</p>
            </div>
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 text-xs mb-1 font-semibold">📥 Export</p>
              <p className="text-gray-300 text-xs">Download for debugging in your IDE</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
