import React from "react";
import { CheckCircle2, Clock, MessageSquare, ThumbsUp } from "lucide-react";

export default function CoachStatsBar({ checks }) {
  const total = checks.length;
  const completed = checks.filter(c => c.completed).length;
  const pendingFeedback = checks.filter(c => c.completed && !c.coach_feedback).length;
  const approved = checks.filter(c => c.approved_by_coach).length;

  const stats = [
    { label: "Total Checks", value: total, icon: Clock, color: "text-gray-300" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-400" },
    { label: "Pending Feedback", value: pendingFeedback, icon: MessageSquare, color: "text-orange-400" },
    { label: "Approved", value: approved, icon: ThumbsUp, color: "text-[#00D4C9]" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-[#111317] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}