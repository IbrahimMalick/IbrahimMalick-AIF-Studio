import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, ChevronDown, ChevronUp, MessageSquare, ThumbsUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const CHECK_TYPE_LABELS = {
  daily_standup: "Daily Standup",
  weekly_review: "Weekly Review",
  goal_progress: "Goal Progress",
  habit_check: "Habit Check",
  milestone_review: "Milestone Review",
};

export default function CheckRow({ check, selected, onSelect }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(check.coach_feedback || "");
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const needsFeedback = check.completed && !check.coach_feedback;
  const hasFeedback = !!check.coach_feedback;

  const handleSaveFeedback = async () => {
    setSaving(true);
    await base44.entities.AccountabilityCheck.update(check.id, { coach_feedback: feedback });
    queryClient.invalidateQueries({ queryKey: ["coachChecks"] });
    setSaving(false);
  };

  const handleApprove = async () => {
    setApproving(true);
    const updates = { approved_by_coach: true };
    if (feedback && feedback !== check.coach_feedback) {
      updates.coach_feedback = feedback;
    }
    await base44.entities.AccountabilityCheck.update(check.id, updates);
    queryClient.invalidateQueries({ queryKey: ["coachChecks"] });
    setApproving(false);
  };

  return (
    <div className={`border rounded-xl transition-all ${
      selected ? "border-[#00D4C9]/60 bg-[#00D4C9]/5" : "border-gray-800 bg-[#111317]"
    }`}>
      {/* Row header */}
      <div className="flex items-center gap-3 p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(check.id)}
          className="w-4 h-4 rounded accent-[#00D4C9] cursor-pointer"
        />

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
          <div>
            <p className="text-white font-medium text-sm truncate">{check.user_email}</p>
            <p className="text-gray-500 text-xs">{CHECK_TYPE_LABELS[check.check_type] || check.check_type}</p>
          </div>

          <div className="text-sm text-gray-400">
            {check.scheduled_time ? new Date(check.scheduled_time).toLocaleDateString() : "—"}
          </div>

          <div className="flex items-center gap-2">
            {check.completed ? (
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                <Clock className="w-3 h-3 mr-1" /> Pending
              </Badge>
            )}
            {needsFeedback && (
              <Badge className="bg-orange-500/20 text-orange-400 text-xs">Needs Feedback</Badge>
            )}
            {hasFeedback && (
              <Badge className="bg-blue-500/20 text-blue-400 text-xs">Feedback Given</Badge>
            )}
            {check.approved_by_coach && (
              <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                <ThumbsUp className="w-3 h-3 mr-1" /> Approved
              </Badge>
            )}
          </div>

          <div className="text-sm text-gray-400">
            {check.mood_score ? `😊 ${check.mood_score}/10` : "—"}
            {check.productivity_score ? ` · ⚡ ${check.productivity_score}/10` : ""}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800/60 pt-4 space-y-4">
          {/* User response */}
          {check.user_response && Object.keys(check.user_response).length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(check.user_response).map(([key, val]) => val && (
                <div key={key} className="bg-[#0B0B0C] rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-gray-300 text-sm">{val}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm italic">No user response submitted yet.</p>
          )}

          {/* Coach feedback */}
          <div>
            <label className="text-gray-400 text-sm flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" /> Coach Feedback
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback for this user..."
              className="bg-[#0B0B0C] border-gray-700 text-white text-sm rounded-lg resize-none h-24"
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-gray-300 rounded-lg"
                disabled={saving || !feedback || feedback === check.coach_feedback}
                onClick={handleSaveFeedback}
              >
                {saving ? "Saving..." : "Save Feedback"}
              </Button>
              <Button
                size="sm"
                className="bg-[#00D4C9] hover:bg-[#00b8ae] text-black font-semibold rounded-lg"
                disabled={approving || check.approved_by_coach}
                onClick={handleApprove}
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                {approving ? "Approving..." : check.approved_by_coach ? "Approved" : "Approve Progress"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}