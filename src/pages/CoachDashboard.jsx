import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Search, ThumbsUp, Loader2 } from "lucide-react";
import CoachStatsBar from "@/components/coach/CoachStatsBar";
import CheckRow from "@/components/coach/CheckRow";

const CHECK_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "daily_standup", label: "Daily Standup" },
  { value: "weekly_review", label: "Weekly Review" },
  { value: "goal_progress", label: "Goal Progress" },
  { value: "habit_check", label: "Habit Check" },
  { value: "milestone_review", label: "Milestone Review" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending (Not Completed)" },
  { value: "needs_feedback", label: "Needs Feedback" },
  { value: "completed", label: "Completed" },
  { value: "approved", label: "Approved" },
];

export default function CoachDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);

  const { data: checks = [], isLoading } = useQuery({
    queryKey: ["coachChecks"],
    queryFn: () => base44.entities.AccountabilityCheck.list("-scheduled_time", 200),
  });

  const filtered = checks.filter((c) => {
    if (search && !c.user_email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && c.check_type !== typeFilter) return false;
    if (statusFilter === "pending" && c.completed) return false;
    if (statusFilter === "needs_feedback" && (!c.completed || c.coach_feedback)) return false;
    if (statusFilter === "completed" && !c.completed) return false;
    if (statusFilter === "approved" && !c.approved_by_coach) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    setBulkApproving(true);
    await Promise.all(
      selectedIds.map(id =>
        base44.entities.AccountabilityCheck.update(id, { approved_by_coach: true })
      )
    );
    queryClient.invalidateQueries({ queryKey: ["coachChecks"] });
    setSelectedIds([]);
    setBulkApproving(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-[#00D4C9]" />
              Coach Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Review accountability check-ins, leave feedback, and approve progress</p>
          </div>

          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkApprove}
              disabled={bulkApproving}
              className="bg-[#00D4C9] hover:bg-[#00b8ae] text-black font-bold rounded-xl"
            >
              {bulkApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              Bulk Approve ({selectedIds.length})
            </Button>
          )}
        </div>

        {/* Stats */}
        {!isLoading && <CoachStatsBar checks={checks} />}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#111317] border-gray-700 text-white rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-52 bg-[#111317] border-gray-700 text-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111317] border-gray-700 text-white">
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-52 bg-[#111317] border-gray-700 text-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111317] border-gray-700 text-white">
              {CHECK_TYPE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table header + select all */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-[#111317] border border-gray-800 rounded-xl">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded accent-[#00D4C9] cursor-pointer"
            />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 uppercase tracking-wide">
              <span>User / Type</span>
              <span>Date</span>
              <span>Status</span>
              <span>Scores</span>
            </div>
            <div className="w-8" />
          </div>
        )}

        {/* Check list */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00D4C9] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl">
            <Brain className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500">No accountability checks match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((check) => (
              <CheckRow
                key={check.id}
                check={check}
                selected={selectedIds.includes(check.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}