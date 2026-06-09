
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Plus,
  Play,
  Film,
  Globe,
  Layers,
  CheckCircle2,
  Loader2,
  Star,
  Mic,
  Palette,
  Video,
  FileText,
  Zap,
  Download,
  Server // Added Server icon
} from "lucide-react";
import { motion } from "framer-motion";
import AvatarScriptBuilder from "@/components/AvatarScriptBuilder";
import AvatarRenderer from "@/components/AvatarRenderer";
import MultilingualDubber from "@/components/MultilingualDubber";
import BatchAvatarRenderer from "@/components/BatchAvatarRenderer";
import BackendIntegrationGuide from "@/components/BackendIntegrationGuide"; // Added import

export default function Avatars() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("avatars");
  const [showCreateAvatar, setShowCreateAvatar] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [scriptData, setScriptData] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const [newAvatar, setNewAvatar] = useState({
    avatar_name: "",
    avatar_type: "photoreal_studio",
    presentation_mode: "head_shoulders",
    background_style: "studio"
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: avatars = [] } = useQuery({
    queryKey: ["avatars", user?.email],
    queryFn: () => base44.entities.Avatar.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: voiceProfiles = [] } = useQuery({
    queryKey: ["voiceProfiles", user?.email],
    queryFn: () => base44.entities.VoiceProfile.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: avatarProjects = [] } = useQuery({
    queryKey: ["avatarProjects", user?.email],
    queryFn: () => base44.entities.AvatarProject.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: avatarVideos = [] } = useQuery({
    queryKey: ["avatarVideos", user?.email],
    queryFn: () => base44.entities.AvatarVideo.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user,
  });

  const createAvatarMutation = useMutation({
    mutationFn: (data) => base44.entities.Avatar.create({
      ...data,
      user_email: user.email,
      consent_recorded: true,
      consent_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["avatars"]);
      setShowCreateAvatar(false);
      setNewAvatar({
        avatar_name: "",
        avatar_type: "photoreal_studio",
        presentation_mode: "head_shoulders",
        background_style: "studio"
      });
      alert("✅ Avatar created successfully!");
    }
  });

  const avatarTypes = [
    { value: "photoreal_studio", label: "📸 Photoreal Studio", description: "Professional presenter" },
    { value: "photoreal_professional", label: "👔 Professional", description: "Business avatar" },
    { value: "stylized_cartoon", label: "🎨 Cartoon", description: "Animated character" },
    { value: "stylized_anime", label: "✨ Anime", description: "Anime style" },
    { value: "brand_mascot", label: "🦁 Brand Mascot", description: "Custom character" },
    { value: "audio_only", label: "🎙️ Audio Only", description: "Voice + waveform" }
  ];

  const presentationModes = [
    { value: "face_only", label: "Face Only", icon: "😊" },
    { value: "head_shoulders", label: "Head & Shoulders", icon: "👤" },
    { value: "full_body", label: "Full Body", icon: "🧍" },
    { value: "greenscreen", label: "Greenscreen", icon: "🎬" },
    { value: "audio_waveform", label: "Audio Waveform", icon: "📊" }
  ];

  const startNewProject = (avatar) => {
    setSelectedAvatar(avatar);
    setSelectedVoice(voiceProfiles[0] || null); // Automatically select the first voice profile if available
    setActiveTab("create");
  };

  const handleScriptReady = (scriptDataFromBuilder) => {
    // Create AvatarProject
    base44.entities.AvatarProject.create({
      user_email: user.email,
      project_name: scriptDataFromBuilder.topic,
      avatar_id: selectedAvatar.id,
      voice_profile_id: selectedVoice?.id,
      script: scriptDataFromBuilder.script,
      script_type: scriptDataFromBuilder.format,
      language: "en", // Assuming English for initial project
      tone: scriptDataFromBuilder.tone,
      duration_target_seconds: scriptDataFromBuilder.estimated_duration || 30,
      format: "9:16", // Default format
      status: "draft"
    }).then(project => {
      setCurrentProject(project);
      setScriptData(scriptDataFromBuilder);
      queryClient.invalidateQueries(["avatarProjects"]);
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <User className="w-8 h-8 text-[#9D4EDD]" />
              AI Avatar Studio
            </h1>
            <p className="text-gray-400">Turn any script into a talking avatar video in minutes</p>
          </div>
          <Button
            onClick={() => setShowCreateAvatar(!showCreateAvatar)}
            className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Avatar
          </Button>
        </div>

        {/* Create Avatar Form */}
        {showCreateAvatar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Create New Avatar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Avatar Name (e.g., 'Professional Presenter', 'Coach Alex')"
                  value={newAvatar.avatar_name}
                  onChange={(e) => setNewAvatar({...newAvatar, avatar_name: e.target.value})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Avatar Type</label>
                  <Select
                    value={newAvatar.avatar_type}
                    onValueChange={(value) => setNewAvatar({...newAvatar, avatar_type: value})}
                  >
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Presentation Mode</label>
                  <div className="grid grid-cols-5 gap-2">
                    {presentationModes.map(mode => (
                      <label
                        key={mode.value}
                        className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${
                          newAvatar.presentation_mode === mode.value
                            ? 'border-[#9D4EDD] bg-[#9D4EDD]/10'
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="presentationMode"
                          value={mode.value}
                          checked={newAvatar.presentation_mode === mode.value}
                          onChange={(e) => setNewAvatar({...newAvatar, presentation_mode: e.target.value})}
                          className="sr-only"
                        />
                        <p className="text-2xl mb-1">{mode.icon}</p>
                        <p className="text-white text-xs">{mode.label}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCreateAvatar(false)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createAvatarMutation.mutate(newAvatar)}
                    disabled={!newAvatar.avatar_name || createAvatarMutation.isLoading}
                    className="flex-1 bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl"
                  >
                    {createAvatarMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Create Avatar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="avatars">
              <User className="w-4 h-4 mr-2" />
              My Avatars ({avatars.length})
            </TabsTrigger>
            <TabsTrigger value="create">
              <Film className="w-4 h-4 mr-2" />
              Create Video
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FileText className="w-4 h-4 mr-2" />
              Projects ({avatarProjects.length})
            </TabsTrigger>
            <TabsTrigger value="batch">
              <Layers className="w-4 h-4 mr-2" />
              Batch Render
            </TabsTrigger>
            <TabsTrigger value="library">
              <Video className="w-4 h-4 mr-2" />
              Video Library ({avatarVideos.length})
            </TabsTrigger>
            <TabsTrigger value="backend"> {/* Added Backend Trigger */}
              <Server className="w-4 h-4 mr-2" />
              Backend Guide
            </TabsTrigger>
          </TabsList>

          {/* Avatars Tab */}
          <TabsContent value="avatars">
            <div className="grid md:grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <Card key={avatar.id} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#9D4EDD] transition-all">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center text-4xl">
                        {avatar.avatar_image_url ? (
                          <img src={avatar.avatar_image_url} alt={avatar.avatar_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <h3 className="text-white font-bold mb-1">{avatar.avatar_name}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                          {avatar.avatar_type.replace(/_/g, ' ')}
                        </Badge>
                        {avatar.is_default && (
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-400 mb-4">
                      <p>Mode: {avatar.presentation_mode?.replace(/_/g, ' ')}</p>
                      <p>Used: {avatar.use_count} times</p>
                      <p>Total: {avatar.total_render_minutes?.toFixed(1) || 0} min</p>
                    </div>

                    <Button
                      onClick={() => startNewProject(avatar)}
                      className="w-full bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Create Video
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {avatars.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">No avatars created yet</p>
                  <p className="text-gray-500 text-sm mb-4">Create your first AI avatar to get started</p>
                  <Button
                    onClick={() => setShowCreateAvatar(true)}
                    className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Avatar
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Create Video Tab - ENHANCED */}
          <TabsContent value="create">
            {selectedAvatar ? (
              <div className="space-y-6">
                {/* Selected Avatar Info */}
                <Card className="bg-gradient-to-r from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9D4EDD] to-[#FF69B4] flex items-center justify-center">
                        {selectedAvatar.avatar_image_url ? (
                          <img src={selectedAvatar.avatar_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{selectedAvatar.avatar_name}</h3>
                        <p className="text-gray-400 text-sm">
                          {selectedAvatar.avatar_type.replace(/_/g, ' ')} • {selectedAvatar.presentation_mode?.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAvatar(null);
                          setScriptData(null);
                          setCurrentProject(null);
                        }}
                        className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
                      >
                        Change Avatar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 1: Script Builder */}
                {!scriptData && !currentProject && (
                  <AvatarScriptBuilder
                    onScriptReady={handleScriptReady}
                  />
                )}

                {/* Step 2: Renderer */}
                {scriptData && currentProject && (
                  <>
                    <AvatarRenderer
                      projectData={{
                        ...currentProject,
                        ...scriptData,
                        user_email: user.email,
                        avatar_id: selectedAvatar.id,
                        project_name: scriptData.topic,
                        caption_config: { enabled: true, style: "bold" },
                        lower_thirds_config: { enabled: false },
                        cta_config: { enabled: false }
                      }}
                      avatar={selectedAvatar}
                      voiceProfile={selectedVoice}
                      onRenderComplete={(video) => {
                        alert("✅ Video rendered successfully!");
                        setActiveTab("library");
                        setScriptData(null);
                        setCurrentProject(null);
                        setSelectedAvatar(null);
                      }}
                    />

                    {/* Step 3: Multilingual Dubbing (Optional) */}
                    <MultilingualDubber
                      originalVideo={{
                        duration_seconds: scriptData.estimated_duration || 30,
                        thumbnail_url: "https://images.unsplash.com/photo-1597497152358-b4a55a7c7e87?w=800"
                      }}
                      script={scriptData.script}
                      onDubbingComplete={(dubs) => {
                        alert(`✅ Generated ${dubs.length} language versions!`);
                        queryClient.invalidateQueries(["avatarVideos"]);
                      }}
                    />
                  </>
                )}
              </div>
            ) : (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Select an avatar to create a video</p>
                  <Button
                    onClick={() => setActiveTab("avatars")}
                    className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white rounded-xl"
                  >
                    Browse Avatars
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="space-y-4">
              {avatarProjects.map((project) => (
                <Card key={project.id} className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-2">{project.project_name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                            {project.script_type}
                          </Badge>
                          <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                            {project.language}
                          </Badge>
                          <Badge className="bg-gray-700 text-gray-300">
                            {project.format}
                          </Badge>
                          <Badge className={`${
                            project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'rendering' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {project.status}
                          </Badge>
                        </div>
                        {project.outputs?.length > 0 && (
                          <div className="flex gap-2">
                            {project.outputs.map((output, idx) => (
                              <Badge key={idx} className="bg-blue-500/20 text-blue-400 text-xs">
                                {output.language}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#1E90FF] text-white rounded-lg"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {avatarProjects.length === 0 && (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No projects yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Batch Render Tab */}
          <TabsContent value="batch">
            {avatars.length > 0 && voiceProfiles.length > 0 ? (
              <BatchAvatarRenderer
                avatar={avatars[0]}
                voiceProfile={voiceProfiles[0]}
                onBatchComplete={(results) => {
                  queryClient.invalidateQueries(["avatarVideos"]);
                  setActiveTab("library");
                }}
              />
            ) : (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Layers className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">Batch rendering requires an avatar and voice profile</p>
                  <p className="text-gray-500 text-sm">Create an avatar first to use batch mode</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Video Library Tab */}
          <TabsContent value="library">
            <div className="grid md:grid-cols-3 gap-4">
              {avatarVideos.map((video) => (
                <Card key={video.id} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#00D4C9] transition-all">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden relative">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#9D4EDD]/20 to-[#FF69B4]/20 flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/70 text-white text-xs">
                          {video.duration_seconds}s
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                          {video.video_type}
                        </Badge>
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          {video.language}
                        </Badge>
                        {video.lipsync_validated && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            ✓ Sync
                          </Badge>
                        )}
                      </div>

                      <p className="text-white text-sm line-clamp-2">{video.script?.substring(0, 100)}</p>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-[#1E90FF] text-white rounded-lg">
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-700 rounded-lg">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>

                      {video.engagement_metrics && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
                          <div className="text-center">
                            <p className="text-gray-500 text-xs">Views</p>
                            <p className="text-white font-bold text-sm">{video.engagement_metrics.likes || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs">Likes</p>
                            <p className="text-white font-bold text-sm">{video.engagement_metrics.likes || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs">Shares</p>
                            <p className="text-white font-bold text-sm">{video.engagement_metrics.shares || 0}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {avatarVideos.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No avatar videos yet</p>
                  <p className="text-gray-500 text-sm">Create your first avatar video to see it here</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Backend Integration Guide Tab */}
          <TabsContent value="backend"> {/* Added Backend Content */}
            <BackendIntegrationGuide />
          </TabsContent>

        </Tabs>

        {/* Feature Showcase */}
        <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-white font-bold text-lg mb-4">🚀 What You Can Do:</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[#9D4EDD]/20 flex items-center justify-center">
                  <Film className="w-6 h-6 text-[#9D4EDD]" />
                </div>
                <p className="text-white font-semibold text-sm mb-1">Any Script → Video</p>
                <p className="text-gray-400 text-xs">Idea to talking avatar in minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[#00D4C9]/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-[#00D4C9]" />
                </div>
                <p className="text-white font-semibold text-sm mb-1">50+ Languages</p>
                <p className="text-gray-400 text-xs">Auto-translate + lip-sync</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-[#FFD700]" />
                </div>
                <p className="text-white font-semibold text-sm mb-1">Batch Mode</p>
                <p className="text-gray-400 text-xs">10-50 videos from CSV</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-white font-semibold text-sm mb-1">Fast Render</p>
                <p className="text-gray-400 text-xs">Sub-60s for shorts</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
