import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Video,
  BarChart3,
  Calendar,
  Package,
  Users,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ClientPortal() {
  const [user, setUser] = useState(null);
  const [portalAccess, setPortalAccess] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if user is a client with portal access
      const access = await base44.entities.ClientPortalAccess.filter({
        client_email: currentUser.email,
        is_active: true
      });
      
      if (access.length > 0) {
        setPortalAccess(access[0]);
      }
    };
    loadUser();
  }, []);

  const { data: myVideos = [] } = useQuery({
    queryKey: ["clientVideos", user?.email],
    queryFn: () => base44.entities.VideoProject.filter({
      created_by: user.email
    }, "-created_date", 20),
    enabled: !!user
  });

  const { data: myPosts = [] } = useQuery({
    queryKey: ["clientPosts", user?.email],
    queryFn: () => base44.entities.ScheduledPost.filter({
      user_email: user.email
    }, "-created_date", 20),
    enabled: !!user
  });

  const { data: billingInfo = [] } = useQuery({
    queryKey: ["clientBilling", user?.email],
    queryFn: () => base44.entities.UsageBasedBilling.filter({
      client_email: user.email
    }, "-billing_period_start", 3),
    enabled: !!user && portalAccess
  });

  if (!portalAccess) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] p-8">
        <Card className="max-w-2xl mx-auto bg-[#111] border-gray-800">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white mb-2">No Portal Access</h2>
            <p className="text-gray-400 mb-6">
              You don't have client portal access. Contact your agency administrator.
            </p>
            <Button onClick={() => window.location.href = createPageUrl("Dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBilling = billingInfo[0];
  const usagePercent = currentBilling ? {
    videos: (currentBilling.usage_charges?.videos_created / portalAccess.usage_limit?.videos_per_month) * 100,
    posts: (currentBilling.usage_charges?.posts_published / portalAccess.usage_limit?.posts_per_month) * 100
  } : { videos: 0, posts: 0 };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user?.full_name}!
          </h1>
          <p className="text-gray-400">
            {portalAccess.client_company} - Client Portal
          </p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#111] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-sm font-medium">Videos Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FFD700] mb-2">
                {currentBilling?.usage_charges?.videos_created || 0}
                <span className="text-sm text-gray-500">
                  / {portalAccess.usage_limit?.videos_per_month}
                </span>
              </div>
              <Progress value={usagePercent.videos} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(usagePercent.videos)}% used this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-sm font-medium">Posts Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#00D4C9] mb-2">
                {currentBilling?.usage_charges?.posts_published || 0}
                <span className="text-sm text-gray-500">
                  / {portalAccess.usage_limit?.posts_per_month}
                </span>
              </div>
              <Progress value={usagePercent.posts} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(usagePercent.posts)}% used this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-sm font-medium">Current Bill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">
                ${currentBilling?.total_amount?.toFixed(2) || "0.00"}
              </div>
              <Badge className={
                currentBilling?.invoice_status === "paid" ? "bg-green-500/20 text-green-400" :
                currentBilling?.invoice_status === "overdue" ? "bg-red-500/20 text-red-400" :
                "bg-yellow-500/20 text-yellow-400"
              }>
                {currentBilling?.invoice_status || "No Invoice"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {portalAccess.allowed_features?.includes("VideoStudio") && (
            <Link to={createPageUrl("VideoStudio")}>
              <Card className="bg-gradient-to-r from-[#FF4433] to-[#FF8C00] hover:opacity-90 transition-opacity cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 text-white" />
                  <p className="text-white font-semibold">Create Video</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {portalAccess.allowed_features?.includes("Analytics") && (
            <Link to={createPageUrl("Analytics")}>
              <Card className="bg-gradient-to-r from-[#00D4C9] to-[#1E90FF] hover:opacity-90 transition-opacity cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-white" />
                  <p className="text-white font-semibold">View Analytics</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {portalAccess.allowed_features?.includes("SocialMedia") && (
            <Link to={createPageUrl("SocialMedia")}>
              <Card className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 transition-opacity cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-black" />
                  <p className="text-black font-semibold">Schedule Post</p>
                </CardContent>
              </Card>
            </Link>
          )}

          <Card className="bg-[#111] border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-400 font-semibold">View Resources</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Content */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#111] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Videos</CardTitle>
            </CardHeader>
            <CardContent>
              {myVideos.length > 0 ? (
                <div className="space-y-3">
                  {myVideos.slice(0, 5).map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-3 bg-[#0C0C0C] rounded-lg">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium truncate">{video.title}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(video.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={
                        video.status === "completed" ? "bg-green-500/20 text-green-400" :
                        video.status === "rendering" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }>
                        {video.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No videos yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {myPosts.length > 0 ? (
                <div className="space-y-3">
                  {myPosts.filter(p => p.schedule_time && new Date(p.schedule_time) > new Date()).slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-[#0C0C0C] rounded-lg">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium truncate">{post.title || post.caption?.slice(0, 40)}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(post.schedule_time).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {post.platforms?.length || 0} platforms
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No scheduled posts</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}