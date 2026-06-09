import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle2, AlertCircle, Columns, RefreshCw } from "lucide-react";

const COLUMNS = [
  {
    id: "pending",
    label: "Waiting",
    color: "border-yellow-500/50",
    headerBg: "bg-yellow-500/10",
    textColor: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  {
    id: "processing",
    label: "In Progress",
    color: "border-blue-500/50",
    headerBg: "bg-blue-500/10",
    textColor: "text-blue-400",
    dot: "bg-blue-400",
    spin: true,
  },
  {
    id: "completed",
    label: "Completed",
    color: "border-green-500/50",
    headerBg: "bg-green-500/10",
    textColor: "text-green-400",
    dot: "bg-green-400",
  },
  {
    id: "failed",
    label: "Failed",
    color: "border-red-500/50",
    headerBg: "bg-red-500/10",
    textColor: "text-red-400",
    dot: "bg-red-400",
  },
];

const AGENT_COLORS = {
  vp:       "bg-purple-500/20 text-purple-300 border-purple-500/30",
  manager:  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  engineer: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  human:    "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

function TaskCard({ task }) {
  const agentStyle = AGENT_COLORS[task.assigned_to] || AGENT_COLORS.human;
  const timeAgo = (d) => {
    if (!d) return "";
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return `${Math.floor(s)}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <div className="bg-[#0B0B0C] border border-gray-800 rounded-xl p-3 space-y-2 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white text-xs font-semibold capitalize">{task.task_type}</span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full border capitalize", agentStyle)}>
          {task.assigned_to}
        </span>
      </div>
      {task.llm_model && (
        <p className="text-gray-500 text-xs truncate">Model: {task.llm_model}</p>
      )}
      {task.tokens_used > 0 && (
        <p className="text-gray-600 text-xs">{task.tokens_used.toLocaleString()} tokens</p>
      )}
      {task.error_message && (
        <p className="text-red-400 text-xs line-clamp-2" title={task.error_message}>
          ⚠ {task.error_message}
        </p>
      )}
      <p className="text-gray-700 text-xs">{timeAgo(task.queued_at || task.created_date)}</p>
    </div>
  );
}

function KanbanColumn({ column, tasks }) {
  return (
    <div className={cn("flex flex-col rounded-2xl border bg-[#111317] overflow-hidden", column.color)}>
      <div className={cn("flex items-center justify-between px-4 py-3", column.headerBg)}>
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", column.dot,
            column.spin && "animate-pulse"
          )} />
          <span className={cn("text-sm font-bold", column.textColor)}>{column.label}</span>
        </div>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-black/20", column.textColor)}>
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-80 min-h-24">
        {tasks.length === 0 ? (
          <p className="text-gray-700 text-xs text-center pt-6">No tasks</p>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

export default function AgentKanban() {
  const { data: tasks = [], isFetching, refetch } = useQuery({
    queryKey: ["kanbanQueue"],
    queryFn: () => base44.entities.ProductionQueue.list("-created_date", 200),
    refetchInterval: 30000,
  });

  const byStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="bg-[#111317] border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Columns className="w-5 h-5 text-[#00D4C9]" />
          <h3 className="text-white font-bold text-sm">Agent Task Board</h3>
          {isFetching && <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />}
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNS.map(col => (
          <KanbanColumn key={col.id} column={col} tasks={byStatus(col.id)} />
        ))}
      </div>

      {tasks.length === 0 && !isFetching && (
        <p className="text-gray-600 text-sm text-center py-6">No production queue tasks found.</p>
      )}
    </div>
  );
}