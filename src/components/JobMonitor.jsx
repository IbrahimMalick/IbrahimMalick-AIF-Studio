import React, { useState, useEffect } from "react";
import { jobQueue } from "@/lib/jobQueueClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader, AlertCircle, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function JobMonitor() {
  const { data: jobs = [], isLoading, refetch } = useQuery({
    queryKey: ['user-jobs'],
    queryFn: () => jobQueue.listUserJobs(),
    refetchInterval: 5000
  });

  const statusIcons = {
    queued: <Loader className="w-5 h-5 text-yellow-400 animate-spin" />,
    processing: <Loader className="w-5 h-5 text-blue-400 animate-spin" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    failed: <AlertCircle className="w-5 h-5 text-red-400" />
  };

  const statusColors = {
    queued: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Background Jobs</h3>
        <Badge className="bg-gray-700 text-gray-300">{jobs.length} Active</Badge>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 text-sm">No background jobs</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-[#0B0B0C] border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {statusIcons[job.status]}
                      <div className="min-w-0">
                        <p className="font-medium text-white capitalize">{job.type}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="w-24 bg-black/50 rounded-full h-2 mb-1">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400">{job.progress}%</p>
                      </div>
                      <Badge className={statusColors[job.status]}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}