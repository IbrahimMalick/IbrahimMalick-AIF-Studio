import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Upload, BarChart2, Users, Eye, ThumbsUp, MessageSquare, CheckCircle, AlertCircle, Loader2, LogOut, Video, RefreshCw } from "lucide-react";

const REDIRECT_URI = `${window.location.origin}/YouTubeStudio`;

export default function YouTubeStudio() {
  const [tokens, setTokens] = useState(() => {
    try { return JSON.parse(localStorage.getItem("yt_tokens") || "null"); } catch { return null; }
  });
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [uploadForm, setUploadForm] = useState({ video_url: "", title: "", description: "", tags: "", privacy_status: "private" });
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && !tokens) {
      handleOAuthCallback(code);
    }
  }, []);

  // Auto-load analytics when connected
  useEffect(() => {
    if (tokens?.access_token) fetchAnalytics();
  }, [tokens]);

  const handleConnect = async () => {
    setError(null);
    const res = await base44.functions.invoke("youtubeAuth", { action: "get_auth_url", redirect_uri: REDIRECT_URI });
    window.location.href = res.data.url;
  };

  const handleOAuthCallback = async (code) => {
    setError(null);
    const res = await base44.functions.invoke("youtubeAuth", { action: "exchange_code", code, redirect_uri: REDIRECT_URI });
    if (res.data.error) { setError(res.data.error); return; }
    const t = res.data.tokens;
    localStorage.setItem("yt_tokens", JSON.stringify(t));
    setTokens(t);
    // Clean URL
    window.history.replaceState({}, "", window.location.pathname);
  };

  const getValidAccessToken = async () => {
    if (!tokens) return null;
    // Refresh if expired (tokens expire after ~1hr, we refresh proactively)
    if (tokens.refresh_token) {
      const res = await base44.functions.invoke("youtubeAuth", { action: "refresh_token", refresh_token: tokens.refresh_token });
      if (res.data.tokens) {
        const updated = { ...tokens, ...res.data.tokens };
        localStorage.setItem("yt_tokens", JSON.stringify(updated));
        setTokens(updated);
        return updated.access_token;
      }
    }
    return tokens.access_token;
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    setError(null);
    const access_token = await getValidAccessToken();
    const res = await base44.functions.invoke("youtubeAnalytics", { access_token });
    setLoadingAnalytics(false);
    if (res.data.error) { setError(res.data.error); return; }
    setAnalytics(res.data);
  };

  const handleUpload = async () => {
    if (!uploadForm.video_url || !uploadForm.title) { setError("Video URL and title are required."); return; }
    setUploading(true);
    setUploadResult(null);
    setError(null);
    const access_token = await getValidAccessToken();
    const res = await base44.functions.invoke("youtubeUpload", {
      access_token,
      video_url: uploadForm.video_url,
      title: uploadForm.title,
      description: uploadForm.description,
      tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      privacy_status: uploadForm.privacy_status,
    });
    setUploading(false);
    if (res.data.error) { setError(res.data.error); return; }
    setUploadResult(res.data);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("yt_tokens");
    setTokens(null);
    setAnalytics(null);
    setUploadResult(null);
  };

  const formatNumber = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : n?.toString() || "0";

  if (!tokens) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] flex items-center justify-center p-6">
        <Card className="bg-slate-900/80 border-slate-700 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Youtube className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect YouTube</h1>
          <p className="text-slate-400 mb-8">Link your YouTube channel to upload videos and view analytics directly from AI Freedom Studios.</p>
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <Button onClick={handleConnect} className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold">
            <Youtube className="w-5 h-5 mr-2" /> Connect with YouTube
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">YouTube Studio</h1>
              <p className="text-slate-400 text-sm">Upload videos & track analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {analytics?.channel && (
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                {analytics.channel.thumbnail && (
                  <img src={analytics.channel.thumbnail} alt="channel" className="w-6 h-6 rounded-full" />
                )}
                <span className="text-white text-sm font-medium">{analytics.channel.name}</span>
                <Badge className="bg-red-600/20 text-red-400 text-xs">Connected</Badge>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleDisconnect} className="border-slate-700 text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-1" /> Disconnect
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Tabs defaultValue="analytics">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400">
              <BarChart2 className="w-4 h-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400">
              <Upload className="w-4 h-4 mr-2" /> Upload Video
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loadingAnalytics} className="border-slate-700 text-slate-400 hover:text-white">
                {loadingAnalytics ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>

            {loadingAnalytics && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            )}

            {analytics && !loadingAnalytics && (
              <>
                {/* Channel Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Subscribers", value: formatNumber(analytics.channel.subscribers), icon: Users, color: "text-red-400" },
                    { label: "Total Views", value: formatNumber(analytics.channel.total_views), icon: Eye, color: "text-blue-400" },
                    { label: "Videos", value: analytics.channel.video_count, icon: Video, color: "text-purple-400" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="bg-slate-800/60 border-slate-700 p-5">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${color}`} />
                        <div>
                          <p className="text-slate-400 text-xs">{label}</p>
                          <p className="text-white text-2xl font-bold">{value}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Recent Videos */}
                <h2 className="text-white font-semibold mb-4">Recent Videos</h2>
                <div className="space-y-3">
                  {analytics.recent_videos.map((video) => (
                    <Card key={video.id} className="bg-slate-800/60 border-slate-700 p-4 flex items-center gap-4">
                      {video.thumbnail && (
                        <img src={video.thumbnail} alt={video.title} className="w-24 h-14 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium hover:text-red-400 truncate block"
                        >
                          {video.title}
                        </a>
                        <p className="text-slate-500 text-xs mt-1">{new Date(video.published_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Eye className="w-4 h-4" /> {formatNumber(video.views)}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <ThumbsUp className="w-4 h-4" /> {formatNumber(video.likes)}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <MessageSquare className="w-4 h-4" /> {formatNumber(video.comments)}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {analytics.recent_videos.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No videos found on this channel.</p>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card className="bg-slate-800/60 border-slate-700 p-6 max-w-2xl">
              <h2 className="text-white font-semibold text-lg mb-6">Upload Video to YouTube</h2>

              {uploadResult ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Upload Successful!</h3>
                  <a
                    href={uploadResult.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline break-all"
                  >
                    {uploadResult.youtube_url}
                  </a>
                  <p className="text-slate-400 text-sm mt-2">Note: It may take a few minutes for YouTube to process the video.</p>
                  <Button onClick={() => { setUploadResult(null); setUploadForm({ video_url: "", title: "", description: "", tags: "", privacy_status: "private" }); }}
                    className="mt-6 bg-red-600 hover:bg-red-700">
                    Upload Another
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Video URL *</label>
                    <Input
                      placeholder="https://... (paste video URL from Video Studio or any direct video link)"
                      value={uploadForm.video_url}
                      onChange={e => setUploadForm(f => ({ ...f, video_url: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Title *</label>
                    <Input
                      placeholder="Video title"
                      value={uploadForm.title}
                      onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Description</label>
                    <Textarea
                      placeholder="Video description..."
                      value={uploadForm.description}
                      onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 h-24"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Tags (comma-separated)</label>
                    <Input
                      placeholder="ai, video, studio, marketing"
                      value={uploadForm.tags}
                      onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Privacy</label>
                    <Select value={uploadForm.privacy_status} onValueChange={v => setUploadForm(f => ({ ...f, privacy_status: v }))}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="private">🔒 Private</SelectItem>
                        <SelectItem value="unlisted">🔗 Unlisted</SelectItem>
                        <SelectItem value="public">🌍 Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button onClick={handleUpload} disabled={uploading} className="w-full bg-red-600 hover:bg-red-700 text-white h-11">
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Upload to YouTube</>
                    )}
                  </Button>
                  <p className="text-slate-500 text-xs text-center">Large videos may take a few minutes to upload.</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}