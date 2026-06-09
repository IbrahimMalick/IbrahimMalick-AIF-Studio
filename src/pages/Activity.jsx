import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Activity as ActivityIcon,
  Video,
  Sparkles,
  FileText,
  Download,
  Share2,
  LogIn,
  Search,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Activity() {
  const [user, setUser] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: activities = [] } = useQuery({
    queryKey: ["activityLog"],
    queryFn: () => base44.entities.ActivityLog.list("-created_date", 100),
  });

  const filteredActivities = activities.filter((activity) => {
    const matchesType = filterType === "all" || activity.action_type === filterType;
    const matchesSearch = !searchQuery ||
      activity.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action_type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const actionIcons = {
    create: Video,
    update: Sparkles,
    delete: FileText,
    render: Video,
    export: Download,
    share: Share2,
    login: LogIn,
  };

  const actionColors = {
    create: "bg-green-500/20 text-green-400 border-green-500/30",
    update: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    delete: "bg-red-500/20 text-red-400 border-red-500/30",
    render: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    export: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    share: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    login: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Activity Log</h1>
          <p className="text-gray-400">Track all actions and changes in your account</p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="pl-10 bg-[#111317] border-gray-700 text-white rounded-xl"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 bg-[#111317] border-gray-700 text-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="render">Render</SelectItem>
              <SelectItem value="export">Export</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-6">
            {filteredActivities.length > 0 ? (
              <div className="space-y-3">
                {filteredActivities.map((activity) => {
                  const Icon = actionIcons[activity.action_type] || ActivityIcon;
                  return (
                    <div
                      key={activity.id}
                      className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 flex items-start gap-4"
                    >
                      <div className={`p-2 rounded-lg ${actionColors[activity.action_type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">
                            {activity.action_type.charAt(0).toUpperCase() + activity.action_type.slice(1)}
                          </p>
                          {activity.entity_type && (
                            <Badge className="bg-gray-700 text-gray-300 text-xs">
                              {activity.entity_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {activity.entity_name || 'No name'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span>{activity.user_email}</span>
                          <span>•</span>
                          <span>{new Date(activity.created_date).toLocaleString()}</span>
                          {activity.ip_address && (
                            <>
                              <span>•</span>
                              <span>{activity.ip_address}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <ActivityIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No activity found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}