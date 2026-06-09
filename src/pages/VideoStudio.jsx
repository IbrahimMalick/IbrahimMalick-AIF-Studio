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
  Film,
  Plus,
  Play,
  Share2,
  Trash2,
  Loader2,
  CheckCircle2,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Music,
  Scissors,
  Wand2,
  Copy,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import CollaborationPanel from "@/components/CollaborationPanel";
import ShareProjectModal from "@/components/ShareProjectModal";
import VersionHistory from "@/components/VersionHistory";
import VideoAIAssistant from "@/components/VideoAIAssistant";
import PerformanceAnalyticsDashboard from "@/components/PerformanceAnalyticsDashboard";
import MonetizationOptimizer from "@/components/MonetizationOptimizer";
import RenderQueue from "@/components/RenderQueue";
import TranscriptAnalyzer from "@/components/TranscriptAnalyzer";
import StyleTransfer from "@/components/StyleTransfer";
import DeepVideoAnalyzer from "@/components/DeepVideoAnalyzer";
import ExportPresets from "@/components/ExportPresets";
import AIContentAssistant from "@/components/AIContentAssistant";
import PermissionGate from "@/components/PermissionGate";

// Permission constants
const PERMISSIONS = {
  PROJECT_CREATE: 'project.create',
  PROJECT_EDIT_OWN: 'project.edit.own',
  PROJECT_EDIT_ALL: 'project.edit.all',
  PROJECT_DELETE_OWN: 'project.delete.own',
  PROJECT_DELETE_ALL: 'project.delete.all',
  PROJECT_SHARE: 'project.share',
  PROJECT_EXPORT: 'project.export',
  ANALYTICS_VIEW_OWN: 'analytics.view.own',
};

// Permission checking functions
const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.custom_role === 'super_admin' || user.custom_role === 'project_manager') return true;
  if (user.permissions?.includes(permission)) return true;
  return false;
};

const canEditProject = (user, project) => {
  if (!user || !project) return false;
  if (project.created_by === user.email) return true;
  if (hasPermission(user, PERMISSIONS.PROJECT_EDIT_ALL)) return true;
  return false;
};

const canDeleteProject = (user, project) => {
  if (!user || !project) return false;
  if (project.created_by === user.email && hasPermission(user, PERMISSIONS.PROJECT_DELETE_OWN)) {
    return true;
  }
  if (hasPermission(user, PERMISSIONS.PROJECT_DELETE_ALL)) return true;
  return false;
};

export default function VideoStudio() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [currentProject, setCurrentProject] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // AI Feature states
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [stockSuggestions, setStockSuggestions] = useState({ footage: [], music: [] });
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [editingSuggestions, setEditingSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    resolution: "1920x1080",
    frame_rate: 30,
    duration_seconds: 60
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ["videoProjects", user?.email],
    queryFn: () => base44.entities.VideoProject.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: (projectData) => base44.entities.VideoProject.create(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries(["videoProjects"]);
      setShowNewProject(false);
      setNewProject({
        title: "",
        description: "",
        resolution: "1920x1080",
        frame_rate: 30,
        duration_seconds: 60
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => base44.entities.VideoProject.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries(["videoProjects"]);
      if (currentProject) setCurrentProject(null);
    },
  });

  const handleCreateProject = async () => {
    if (!newProject.title) {
      alert("Please enter a project title");
      return;
    }
    await createProjectMutation.mutateAsync(newProject);
  };

  const handleDeleteProject = async (projectId) => {
    if (confirm("Delete this project? This action cannot be undone.")) {
      await deleteProjectMutation.mutateAsync(projectId);
    }
  };

  // AI Feature: Generate Script
  const handleGenerateScript = async () => {
    if (!currentProject) return;
    
    setIsGeneratingScript(true);
    try {
      const script = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional video script for a video project with the following details:

Title: ${currentProject.title}
Description: ${currentProject.description || 'No description provided'}
Duration: ${currentProject.duration_seconds} seconds
Resolution: ${currentProject.resolution}

Create a detailed video script that includes:
1. Opening hook (first 5 seconds)
2. Introduction
3. Main content sections with scene descriptions
4. Visual cues and camera directions
5. Call-to-action
6. Closing

Format the script with timestamps and scene numbers.`,
      });

      setGeneratedScript(script);
    } catch (error) {
      console.error("Error generating script:", error);
      alert("Failed to generate script. Please try again.");
    }
    setIsGeneratingScript(false);
  };

  // AI Feature: Suggest Stock Media
  const handleSuggestStockMedia = async () => {
    if (!currentProject) return;
    
    setIsLoadingStock(true);
    try {
      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this video project, suggest relevant stock footage and music:

Title: ${currentProject.title}
Description: ${currentProject.description || 'No description provided'}

Provide 5 stock footage keywords and 5 music/audio keywords that would be relevant.`,
        response_json_schema: {
          type: "object",
          properties: {
            footage_keywords: {
              type: "array",
              items: { type: "string" }
            },
            music_keywords: {
              type: "array",
              items: { type: "string" }
            },
            footage_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  url: { type: "string" }
                }
              }
            },
            music_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  genre: { type: "string" }
                }
              }
            }
          }
        }
      });

      setStockSuggestions({
        footage: suggestions.footage_suggestions || [],
        music: suggestions.music_suggestions || [],
        footageKeywords: suggestions.footage_keywords || [],
        musicKeywords: suggestions.music_keywords || []
      });
    } catch (error) {
      console.error("Error suggesting stock media:", error);
      alert("Failed to generate suggestions. Please try again.");
    }
    setIsLoadingStock(false);
  };

  // AI Feature: Editing Suggestions
  const handleGetEditingSuggestions = async () => {
    if (!currentProject) return;
    
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video project and provide AI-powered editing suggestions:

Title: ${currentProject.title}
Description: ${currentProject.description || 'No description provided'}
Duration: ${currentProject.duration_seconds} seconds
Resolution: ${currentProject.resolution}
Frame Rate: ${currentProject.frame_rate} fps

Provide detailed editing suggestions for:
1. Pacing recommendations (how to structure the ${currentProject.duration_seconds} seconds)
2. Transition suggestions between scenes
3. Visual effects recommendations
4. Color grading suggestions
5. Audio mixing tips
6. Thumbnail ideas`,
        response_json_schema: {
          type: "object",
          properties: {
            pacing: {
              type: "object",
              properties: {
                opening_seconds: { type: "number" },
                main_content_seconds: { type: "number" },
                closing_seconds: { type: "number" },
                recommended_cuts: { type: "number" },
                tempo: { type: "string" }
              }
            },
            transitions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from_scene: { type: "string" },
                  to_scene: { type: "string" },
                  transition_type: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            visual_effects: {
              type: "array",
              items: { type: "string" }
            },
            color_grading: {
              type: "object",
              properties: {
                mood: { type: "string" },
                color_palette: { type: "array", items: { type: "string" } },
                contrast: { type: "string" },
                saturation: { type: "string" }
              }
            },
            audio_mixing: {
              type: "array",
              items: { type: "string" }
            },
            thumbnail_ideas: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setEditingSuggestions(suggestions);
    } catch (error) {
      console.error("Error getting editing suggestions:", error);
      alert("Failed to generate suggestions. Please try again.");
    }
    setIsLoadingSuggestions(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Film className="w-8 h-8 text-[#FFD700]" />
              AI Video Studio
            </h1>
            <p className="text-gray-400">Professional video creation with AI-powered features</p>
          </div>
          <PermissionGate user={user} permission={PERMISSIONS.PROJECT_CREATE}>
            <Button
              onClick={() => setShowNewProject(!showNewProject)}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </PermissionGate>
        </div>

        {showNewProject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Create New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <Select
                    value={newProject.resolution}
                    onValueChange={(value) => setNewProject({...newProject, resolution: value})}
                  >
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                      <SelectItem value="1920x1080">Full HD (1920x1080)</SelectItem>
                      <SelectItem value="1280x720">HD (1280x720)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(newProject.frame_rate)}
                    onValueChange={(value) => setNewProject({...newProject, frame_rate: Number(value)})}
                  >
                    <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps</SelectItem>
                      <SelectItem value="30">30 fps</SelectItem>
                      <SelectItem value="60">60 fps</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Duration (seconds)"
                    value={newProject.duration_seconds}
                    onChange={(e) => setNewProject({...newProject, duration_seconds: Number(e.target.value)})}
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowNewProject(false)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={createProjectMutation.isLoading}
                    className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
                  >
                    {createProjectMutation.isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Projects Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="ai_script" disabled={!currentProject}>
              <FileText className="w-4 h-4 mr-1" />
              AI Script
            </TabsTrigger>
            <TabsTrigger value="stock_media" disabled={!currentProject}>
              <ImageIcon className="w-4 h-4 mr-1" />
              Stock Media
            </TabsTrigger>
            <TabsTrigger value="editing_ai" disabled={!currentProject}>
              <Scissors className="w-4 h-4 mr-1" />
              Editing AI
            </TabsTrigger>
            <TabsTrigger value="content" disabled={!currentProject || !canEditProject(user, currentProject)}>
              ✨ AI Content
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={!currentProject}>🧠 AI Analysis</TabsTrigger>
            <TabsTrigger value="export" disabled={!currentProject || !hasPermission(user, PERMISSIONS.PROJECT_EXPORT)}>
              📥 Export
            </TabsTrigger>
            <TabsTrigger value="queue">🚀 Render Queue</TabsTrigger>
            <TabsTrigger value="transcript" disabled={!currentProject}>📝 Transcript</TabsTrigger>
            <TabsTrigger value="style" disabled={!currentProject || !canEditProject(user, currentProject)}>
              🎨 Style Transfer
            </TabsTrigger>
            <TabsTrigger value="collaboration" disabled={!currentProject}>Collaboration</TabsTrigger>
            <TabsTrigger value="analytics" disabled={!currentProject || !hasPermission(user, PERMISSIONS.ANALYTICS_VIEW_OWN)}>
              Analytics
            </TabsTrigger>
            <TabsTrigger value="monetization" disabled={!currentProject}>💰 Monetization</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{project.description || 'No description'}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                            {project.resolution}
                          </Badge>
                          <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                            {project.frame_rate} fps
                          </Badge>
                          <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                            {project.duration_seconds}s
                          </Badge>
                          {project.status && (
                            <Badge className="bg-blue-500/20 text-blue-400">
                              {project.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setCurrentProject(project);
                            setActiveTab("ai_script");
                          }}
                          className="bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-lg"
                          disabled={!canEditProject(user, project)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentProject(project);
                            setShowShareModal(true);
                          }}
                          className="border-gray-700 hover:bg-[#111317] rounded-lg"
                          disabled={!hasPermission(user, PERMISSIONS.PROJECT_SHARE)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        {canDeleteProject(user, project) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProject(project.id)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">No projects yet</p>
                  <PermissionGate user={user} permission={PERMISSIONS.PROJECT_CREATE}>
                    <Button
                      onClick={() => setShowNewProject(true)}
                      className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </PermissionGate>
                </div>
              )}
            </div>
          </TabsContent>

          {/* AI Script Generator Tab */}
          <TabsContent value="ai_script">
            {currentProject && (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#FFD700]" />
                        AI Script Generator
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        Generate a professional video script based on your project
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerateScript}
                      disabled={isGeneratingScript}
                      className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl"
                    >
                      {isGeneratingScript ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Script
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-2">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-400"><span className="text-white">Title:</span> {currentProject.title}</p>
                        <p className="text-gray-400"><span className="text-white">Description:</span> {currentProject.description || 'No description'}</p>
                        <p className="text-gray-400"><span className="text-white">Duration:</span> {currentProject.duration_seconds} seconds</p>
                      </div>
                    </div>

                    {generatedScript && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold">Generated Script</h4>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generatedScript)}
                              className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleGenerateScript}
                              className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Regenerate
                            </Button>
                          </div>
                        </div>
                        <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800 max-h-96 overflow-y-auto">
                          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                            {generatedScript}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Stock Media Suggestions Tab */}
          <TabsContent value="stock_media">
            {currentProject && (
              <div className="space-y-6">
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-[#00D4C9]" />
                          AI Stock Media Suggestions
                        </CardTitle>
                        <p className="text-gray-400 text-sm mt-1">
                          Get AI-powered suggestions for stock footage and music
                        </p>
                      </div>
                      <Button
                        onClick={handleSuggestStockMedia}
                        disabled={isLoadingStock}
                        className="bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black rounded-xl"
                      >
                        {isLoadingStock ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get Suggestions
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stockSuggestions.footage.length > 0 || stockSuggestions.music.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <ImageIcon className="w-5 h-5 text-[#FFD700]" />
                            <h3 className="text-white font-bold text-lg">Stock Footage</h3>
                          </div>
                          {stockSuggestions.footageKeywords && (
                            <div className="mb-4">
                              <p className="text-gray-400 text-sm mb-2">Search Keywords:</p>
                              <div className="flex flex-wrap gap-2">
                                {stockSuggestions.footageKeywords.map((keyword, idx) => (
                                  <Badge key={idx} className="bg-[#FFD700]/20 text-[#FFD700]">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="space-y-3">
                            {stockSuggestions.footage.map((item, idx) => (
                              <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                                <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                                {item.url && (
                                  <a 
                                    href={item.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#00D4C9] text-sm hover:underline"
                                  >
                                    View Source →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Music className="w-5 h-5 text-[#9D4EDD]" />
                            <h3 className="text-white font-bold text-lg">Music & Audio</h3>
                          </div>
                          {stockSuggestions.musicKeywords && (
                            <div className="mb-4">
                              <p className="text-gray-400 text-sm mb-2">Search Keywords:</p>
                              <div className="flex flex-wrap gap-2">
                                {stockSuggestions.musicKeywords.map((keyword, idx) => (
                                  <Badge key={idx} className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="space-y-3">
                            {stockSuggestions.music.map((item, idx) => (
                              <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-white font-semibold">{item.title}</h4>
                                  <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                                    {item.genre}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p>Click "Get Suggestions" to see AI-powered stock media recommendations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* AI Editing Suggestions Tab */}
          <TabsContent value="editing_ai">
            {currentProject && (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-[#FF8C00]" />
                        AI Editing Suggestions
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        Get AI-powered recommendations for pacing, transitions, and editing
                      </p>
                    </div>
                    <Button
                      onClick={handleGetEditingSuggestions}
                      disabled={isLoadingSuggestions}
                      className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-black rounded-xl"
                    >
                      {isLoadingSuggestions ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Analyze Project
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSuggestions ? (
                    <div className="space-y-6">
                      {editingSuggestions.pacing && (
                        <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#FFD700]" />
                            Pacing Recommendations
                          </h3>
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-[#111317] rounded-lg">
                              <p className="text-gray-400 text-sm mb-1">Opening</p>
                              <p className="text-2xl font-bold text-[#FFD700]">
                                {editingSuggestions.pacing.opening_seconds}s
                              </p>
                            </div>
                            <div className="text-center p-4 bg-[#111317] rounded-lg">
                              <p className="text-gray-400 text-sm mb-1">Main Content</p>
                              <p className="text-2xl font-bold text-[#00D4C9]">
                                {editingSuggestions.pacing.main_content_seconds}s
                              </p>
                            </div>
                            <div className="text-center p-4 bg-[#111317] rounded-lg">
                              <p className="text-gray-400 text-sm mb-1">Closing</p>
                              <p className="text-2xl font-bold text-[#9D4EDD]">
                                {editingSuggestions.pacing.closing_seconds}s
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-gray-400 text-sm">
                              <span className="text-white font-semibold">Recommended Cuts:</span> {editingSuggestions.pacing.recommended_cuts}
                            </p>
                            <p className="text-gray-400 text-sm">
                              <span className="text-white font-semibold">Tempo:</span> {editingSuggestions.pacing.tempo}
                            </p>
                          </div>
                        </div>
                      )}

                      {editingSuggestions.transitions && editingSuggestions.transitions.length > 0 && (
                        <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h3 className="text-white font-bold mb-4">Transition Suggestions</h3>
                          <div className="space-y-3">
                            {editingSuggestions.transitions.map((transition, idx) => (
                              <div key={idx} className="p-4 bg-[#111317] rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                                    {transition.transition_type}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">
                                  <span className="text-white">From:</span> {transition.from_scene} 
                                  <span className="text-gray-600 mx-2">→</span>
                                  <span className="text-white">To:</span> {transition.to_scene}
                                </p>
                                <p className="text-gray-500 text-sm">{transition.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {editingSuggestions.visual_effects && editingSuggestions.visual_effects.length > 0 && (
                        <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h3 className="text-white font-bold mb-4">Visual Effects</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {editingSuggestions.visual_effects.map((effect, idx) => (
                              <div key={idx} className="p-3 bg-[#111317] rounded-lg">
                                <p className="text-gray-300 text-sm">{effect}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {editingSuggestions.color_grading && (
                        <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h3 className="text-white font-bold mb-4">Color Grading</h3>
                          <div className="space-y-3">
                            <p className="text-gray-400 text-sm">
                              <span className="text-white font-semibold">Mood:</span> {editingSuggestions.color_grading.mood}
                            </p>
                            <div>
                              <p className="text-white font-semibold text-sm mb-2">Color Palette:</p>
                              <div className="flex gap-2">
                                {editingSuggestions.color_grading.color_palette?.map((color, idx) => (
                                  <div 
                                    key={idx}
                                    className="w-12 h-12 rounded-lg border border-gray-700"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm">
                              <span className="text-white font-semibold">Contrast:</span> {editingSuggestions.color_grading.contrast}
                            </p>
                            <p className="text-gray-400 text-sm">
                              <span className="text-white font-semibold">Saturation:</span> {editingSuggestions.color_grading.saturation}
                            </p>
                          </div>
                        </div>
                      )}

                      {editingSuggestions.audio_mixing && editingSuggestions.audio_mixing.length > 0 && (
                        <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h3 className="text-white font-bold mb-4">Audio Mixing Tips</h3>
                          <div className="space-y-2">
                            {editingSuggestions.audio_mixing.map((tip, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                                <p className="text-gray-300 text-sm">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {editingSuggestions.thumbnail_ideas && editingSuggestions.thumbnail_ideas.length > 0 && (
                        <div className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <h3 className="text-white font-bold mb-4">Thumbnail Ideas</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {editingSuggestions.thumbnail_ideas.map((idea, idx) => (
                              <div key={idx} className="p-3 bg-[#111317] rounded-lg">
                                <p className="text-gray-300 text-sm">{idea}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Scissors className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p>Click "Analyze Project" to get AI-powered editing suggestions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="content">
            {currentProject && user && (
              <AIContentAssistant 
                project={currentProject} 
                currentUser={user}
              />
            )}
          </TabsContent>

          <TabsContent value="analysis">
            {currentProject && <DeepVideoAnalyzer project={currentProject} />}
          </TabsContent>

          <TabsContent value="export">
            {currentProject && <ExportPresets project={currentProject} />}
          </TabsContent>

          <TabsContent value="queue">
            {user && <RenderQueue currentUser={user} />}
          </TabsContent>

          <TabsContent value="transcript">
            {currentProject && <TranscriptAnalyzer project={currentProject} />}
          </TabsContent>

          <TabsContent value="style">
            {currentProject && <StyleTransfer project={currentProject} />}
          </TabsContent>

          <TabsContent value="collaboration">
            {currentProject && (
              <div className="space-y-6">
                <CollaborationPanel project={currentProject} />
                <VersionHistory project={currentProject} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {currentProject && <PerformanceAnalyticsDashboard project={currentProject} />}
          </TabsContent>

          <TabsContent value="monetization">
            {currentProject && user && (
              <MonetizationOptimizer project={currentProject} currentUser={user} />
            )}
          </TabsContent>

        </Tabs>

        {showShareModal && currentProject && (
          <ShareProjectModal
            project={currentProject}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {currentProject && (
          <VideoAIAssistant project={currentProject} />
        )}

      </div>
    </div>
  );
}