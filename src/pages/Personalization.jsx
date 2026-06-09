
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User as UserIcon,
  Mic,
  Video,
  Sparkles,
  Upload,
  Play,
  Download,
  Settings,
  Wand2,
  MessageCircle,
  Send,
  Eye,
  Trash2,
  Copy,
  Share2,
  Bot,
  Palette,
  Volume2,
  Film,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "@/components/AudioSystem";
import { showToast } from "@/components/ToastNotification";
import { Label } from "@/components/ui/label";

export default function Personalization() {
  const queryClient = useQueryClient();
  const audio = useAudioFeedback();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("avatars");
  
  // Avatar creation state
  const [avatarFormData, setAvatarFormData] = useState({
    avatar_name: "",
    avatar_type: "2d_animated",
    personality_traits: [],
    greeting_script: "",
    background_color: "#000000"
  });
  const [voiceFiles, setVoiceFiles] = useState([]);
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);
  
  // Video generation state
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [videoScript, setVideoScript] = useState("");
  const [videoType, setVideoType] = useState("greeting");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

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

  const { data: avatarVideos = [] } = useQuery({
    queryKey: ["avatarVideos", user?.email],
    queryFn: () => base44.entities.AvatarVideo.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      // Save to UserPreferences entity
      const prefs = await base44.entities.UserPreferences.filter({
        user_email: user.email
      });

      if (prefs.length > 0) {
        return await base44.entities.UserPreferences.update(prefs[0].id, data);
      } else {
        return await base44.entities.UserPreferences.create({
          user_email: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userPreferences"]);
      audio?.playSuccess();
      alert("Preferences saved! Your AI Copilot will now use these defaults when creating actions.");
    },
  });

  const createAvatarMutation = useMutation({
    mutationFn: async (avatarData) => {
      setIsCreatingAvatar(true);
      
      // Upload voice samples if provided
      let voiceSampleUrls = [];
      if (voiceFiles.length > 0) {
        for (const file of voiceFiles) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          voiceSampleUrls.push(file_url);
        }
      }

      // Generate avatar image with AI
      const avatarImageResult = await base44.integrations.Core.GenerateImage({
        prompt: `Professional ${avatarData.avatar_type} avatar portrait, clean background, high quality, ${avatarData.personality_traits.join(', ')}`
      });

      // Create voice clone ID (in production, integrate with ElevenLabs or similar)
      const voiceCloneId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const avatar = await base44.entities.Avatar.create({
        ...avatarData,
        user_email: user.email,
        avatar_image_url: avatarImageResult.url,
        voice_clone_id: voiceCloneId,
        voice_sample_urls: voiceSampleUrls,
        voice_characteristics: {
          pitch: "medium",
          tone: "friendly",
          accent: "neutral",
          speaking_rate: "normal"
        }
      });

      setIsCreatingAvatar(false);
      return avatar;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["avatars"]);
      audio.playSuccess();
      showToast("Avatar created successfully!", "success");
      setAvatarFormData({
        avatar_name: "",
        avatar_type: "2d_animated",
        personality_traits: [],
        greeting_script: "",
        background_color: "#000000"
      });
      setVoiceFiles([]);
    },
  });

  const generateVideoMutation = useMutation({
    mutationFn: async ({ avatarId, script, type }) => {
      setIsGeneratingVideo(true);

      const avatar = avatars.find(a => a.id === avatarId);
      if (!avatar) throw new Error("Avatar not found");

      // Generate audio using AI (in production, use voice cloning service)
      // For now, we'll simulate the process
      
      // Generate avatar video with AI
      const videoPrompt = `Create a ${avatar.avatar_type} avatar video saying: "${script}". Background: ${avatar.background_color}. Duration: ${Math.ceil(script.length / 15)} seconds.`;
      
      // Simulate video generation (in production, use video synthesis API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const videoUrl = `https://example.com/avatar_videos/${Date.now()}.mp4`; // Placeholder

      const video = await base44.entities.AvatarVideo.create({
        user_email: user.email,
        avatar_id: avatarId,
        script,
        video_url: videoUrl,
        audio_url: videoUrl,
        duration_seconds: Math.ceil(script.length / 15),
        status: "completed",
        video_type: type,
        thumbnail_url: avatar.avatar_image_url
      });

      // Update avatar usage
      await base44.entities.Avatar.update(avatarId, {
        use_count: (avatar.use_count || 0) + 1,
        last_used: new Date().toISOString()
      });

      setIsGeneratingVideo(false);
      return video;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["avatarVideos"]);
      audio.playLevelUp();
      showToast("Avatar video generated!", "success");
      setVideoScript("");
    },
  });

  const handleVoiceFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setVoiceFiles([...voiceFiles, ...files]);
  };

  const handleCreateAvatar = () => {
    if (!avatarFormData.avatar_name) {
      showToast("Please enter an avatar name", "error");
      return;
    }
    createAvatarMutation.mutate(avatarFormData);
  };

  const handleGenerateVideo = () => {
    if (!selectedAvatar || !videoScript) {
      showToast("Please select an avatar and enter a script", "error");
      return;
    }
    generateVideoMutation.mutate({
      avatarId: selectedAvatar.id,
      script: videoScript,
      type: videoType
    });
  };

  const personalityTraits = [
    "Professional", "Friendly", "Energetic", "Calm", "Humorous",
    "Authoritative", "Warm", "Confident", "Casual", "Inspiring"
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 heading-font flex items-center gap-3">
              <Bot className="w-8 h-8 text-[#FFD700]" />
              AI Personalization
            </h1>
            <p className="text-gray-400">Create your digital twin with custom avatars and cloned voice</p>
          </div>
          <Badge className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black px-4 py-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Next-Gen AI
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#151515] rounded-xl">
            <TabsTrigger value="avatars" className="rounded-xl">
              <UserIcon className="w-4 h-4 mr-2" />
              My Avatars
            </TabsTrigger>
            <TabsTrigger value="create" className="rounded-xl">
              <Wand2 className="w-4 h-4 mr-2" />
              Create Avatar
            </TabsTrigger>
            <TabsTrigger value="videos" className="rounded-xl">
              <Video className="w-4 h-4 mr-2" />
              Generated Videos
            </TabsTrigger>
          </TabsList>

          {/* My Avatars Tab */}
          <TabsContent value="avatars" className="mt-6">
            {avatars.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {avatars.map((avatar) => (
                  <motion.div
                    key={avatar.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="frosted-card border-[#FFD700]/20 rounded-2xl overflow-hidden group cursor-pointer"
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        setActiveTab("create");
                      }}
                    >
                      <div className="aspect-square bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 relative">
                        {avatar.avatar_image_url ? (
                          <img src={avatar.avatar_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Bot className="w-24 h-24 text-[#FFD700]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold">
                            <Play className="w-4 h-4 mr-2" />
                            Use Avatar
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-white font-semibold mb-2">{avatar.avatar_name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {avatar.avatar_type}
                          </Badge>
                          {avatar.is_active && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Used {avatar.use_count || 0} times</span>
                          {avatar.voice_clone_id && (
                            <span className="flex items-center gap-1">
                              <Mic className="w-3 h-3" />
                              Voice Cloned
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="frosted-card border-[#FFD700]/20 rounded-2xl p-12">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mb-4">
                    <Bot className="w-10 h-10 text-black" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">No avatars yet</h3>
                  <p className="text-gray-400 mb-6">Create your first digital twin to get started</p>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Create First Avatar
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Create Avatar Tab */}
          <TabsContent value="create" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Avatar Configuration */}
              <Card className="frosted-card border-[#FFD700]/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">
                    {selectedAvatar ? `Use ${selectedAvatar.avatar_name}` : "Create New Avatar"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedAvatar ? (
                    <>
                      <div>
                        <Label className="text-gray-300 mb-2 block">Avatar Name</Label>
                        <Input
                          value={avatarFormData.avatar_name}
                          onChange={(e) => setAvatarFormData({...avatarFormData, avatar_name: e.target.value})}
                          placeholder="My Digital Twin"
                          className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">Avatar Style</Label>
                        <Select
                          value={avatarFormData.avatar_type}
                          onValueChange={(value) => setAvatarFormData({...avatarFormData, avatar_type: value})}
                        >
                          <SelectTrigger className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2d_animated">2D Animated</SelectItem>
                            <SelectItem value="3d_realistic">3D Realistic</SelectItem>
                            <SelectItem value="cartoon">Cartoon</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">Personality Traits</Label>
                        <div className="flex flex-wrap gap-2">
                          {personalityTraits.map((trait) => (
                            <Badge
                              key={trait}
                              className={`cursor-pointer transition-all ${
                                avatarFormData.personality_traits.includes(trait)
                                  ? "bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black"
                                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                              }`}
                              onClick={() => {
                                const traits = avatarFormData.personality_traits.includes(trait)
                                  ? avatarFormData.personality_traits.filter(t => t !== trait)
                                  : [...avatarFormData.personality_traits, trait];
                                setAvatarFormData({...avatarFormData, personality_traits: traits});
                              }}
                            >
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">Default Greeting</Label>
                        <Textarea
                          value={avatarFormData.greeting_script}
                          onChange={(e) => setAvatarFormData({...avatarFormData, greeting_script: e.target.value})}
                          placeholder="Hi! I'm your AI assistant..."
                          className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl min-h-[100px]"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          Voice Samples (Optional)
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">Upload 3-5 audio samples (30s each) for voice cloning</p>
                        <input
                          type="file"
                          accept="audio/*"
                          multiple
                          onChange={handleVoiceFileUpload}
                          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#FFD700] file:to-[#00D4C9] file:text-black hover:file:opacity-80"
                        />
                        {voiceFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {voiceFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-gray-400 bg-[#0C0C0C] p-2 rounded">
                                <span>{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setVoiceFiles(voiceFiles.filter((_, i) => i !== idx))}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleCreateAvatar}
                        disabled={isCreatingAvatar}
                        className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl h-12"
                      >
                        {isCreatingAvatar ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Avatar...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Create Avatar
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="aspect-square bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 rounded-xl overflow-hidden">
                        {selectedAvatar.avatar_image_url ? (
                          <img src={selectedAvatar.avatar_image_url} alt={selectedAvatar.avatar_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Bot className="w-24 h-24 text-[#FFD700]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">Video Type</Label>
                        <Select value={videoType} onValueChange={setVideoType}>
                          <SelectTrigger className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="greeting">Greeting</SelectItem>
                            <SelectItem value="coaching">Coaching</SelectItem>
                            <SelectItem value="reply">Reply</SelectItem>
                            <SelectItem value="presentation">Presentation</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-2 block">Script</Label>
                        <Textarea
                          value={videoScript}
                          onChange={(e) => setVideoScript(e.target.value)}
                          placeholder="What should your avatar say?"
                          className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl min-h-[150px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ~{Math.ceil(videoScript.length / 15)} seconds
                        </p>
                      </div>

                      <Button
                        onClick={handleGenerateVideo}
                        disabled={isGeneratingVideo}
                        className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl h-12"
                      >
                        {isGeneratingVideo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Video...
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4 mr-2" />
                            Generate Avatar Video
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setSelectedAvatar(null)}
                        className="w-full border-gray-700 text-gray-400 hover:bg-[#0C0C0C] rounded-xl"
                      >
                        Choose Different Avatar
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Preview / Info */}
              <Card className="frosted-card border-[#FFD700]/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Preview & Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-[#0C0C0C] rounded-xl border border-gray-800 flex items-center justify-center">
                    {selectedAvatar && selectedAvatar.avatar_image_url ? (
                      <div className="relative w-full h-full">
                        <img
                          src={selectedAvatar.avatar_image_url}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Avatar preview will appear here</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-[#0C0C0C] rounded-xl">
                      <Sparkles className="w-5 h-5 text-[#FFD700] mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium text-sm mb-1">Use Cases</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>• Personalized video replies</li>
                          <li>• Coaching sessions</li>
                          <li>• Course content</li>
                          <li>• Sales presentations</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#0C0C0C] rounded-xl">
                      <Mic className="w-5 h-5 text-[#00D4C9] mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium text-sm mb-1">Voice Cloning</h4>
                        <p className="text-xs text-gray-400">
                          Upload audio samples to clone your voice. Your avatar will speak in your exact tone and style.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#0C0C0C] rounded-xl">
                      <Video className="w-5 h-5 text-[#FF6B9D] mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium text-sm mb-1">Video Generation</h4>
                        <p className="text-xs text-gray-400">
                          Generate unlimited videos with your avatar. Perfect for scaling your content.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generated Videos Tab */}
          <TabsContent value="videos" className="mt-6">
            {avatarVideos.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {avatarVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="frosted-card border-[#FFD700]/20 rounded-2xl overflow-hidden group">
                      <div className="aspect-video bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 relative">
                        {video.thumbnail_url ? (
                          <img src={video.thumbnail_url} alt="Video thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-16 h-16 text-[#FFD700]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button className="bg-white/20 backdrop-blur-sm text-white rounded-full w-16 h-16">
                            <Play className="w-8 h-8" />
                          </Button>
                        </div>
                        <Badge className={`absolute top-3 right-3 ${
                          video.status === 'completed' ? 'bg-green-500' :
                          video.status === 'generating' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}>
                          {video.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-white text-sm mb-2 line-clamp-2">{video.script}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {video.view_count || 0}
                            </span>
                            <span>{video.duration_seconds}s</span>
                          </div>
                          <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {video.video_type}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1 border-gray-700 rounded-lg">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 border-gray-700 rounded-lg">
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="frosted-card border-[#FFD700]/20 rounded-2xl p-12">
                <div className="text-center">
                  <Video className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">No videos yet</h3>
                  <p className="text-gray-400 mb-6">Generate your first avatar video</p>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Create Video
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
