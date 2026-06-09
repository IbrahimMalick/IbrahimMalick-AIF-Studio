import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function DeploymentProgress({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const blockedTasks = tasks.filter(t => t.status === "blocked").length;
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-green-400"
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-blue-400"
    },
    {
      label: "Blocked",
      value: blockedTasks,
      icon: AlertTriangle,
      color: "text-red-400"
    }
  ];

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">Overall Progress</span>
              <span className="text-2xl font-bold text-[#FFD700]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-4" />
            <p className="text-xs text-gray-500 mt-2">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}