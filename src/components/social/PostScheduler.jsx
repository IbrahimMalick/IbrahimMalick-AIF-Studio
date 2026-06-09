import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trash2, Edit, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-slate-600", icon: FileText },
  scheduled: { label: "Scheduled", color: "bg-blue-600", icon: Clock },
  published: { label: "Published", color: "bg-green-600", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-red-600", icon: AlertCircle },
};

const PLATFORM_COLORS = {
  instagram: "text-pink-400",
  facebook_page: "text-blue-400",
  twitter: "text-sky-400",
  linkedin: "text-blue-300",
  tiktok: "text-pink-300",
  youtube: "text-red-400",
};

export default function PostScheduler() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["scheduled_posts"],
    queryFn: () => base44.entities.ScheduledPost.list("-created_date", 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scheduled_posts"] }),
  });

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "draft", "scheduled", "published", "failed"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {s === "all" ? "All Posts" : s}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => {
            const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
            const StatusIcon = status.icon;
            return (
              <div key={post.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex gap-4">
                {/* Platform badge */}
                <div className={`text-xs font-bold uppercase pt-1 w-20 flex-shrink-0 ${PLATFORM_COLORS[post.platform] || "text-slate-400"}`}>
                  {post.platform?.replace("_", " ")}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 line-clamp-2">{post.content}</p>
                  {post.media_url && (
                    <img src={post.media_url} alt="" className="w-16 h-16 object-cover rounded mt-2 border border-slate-600" />
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    {post.scheduled_date && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(post.scheduled_date), "MMM d, yyyy h:mm a")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => deleteMutation.mutate(post.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}