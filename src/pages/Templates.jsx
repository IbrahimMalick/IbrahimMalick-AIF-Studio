import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles,
  Play,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Camera,
  Gift,
  Megaphone,
  Heart,
  Zap,
  Crown,
  Filter,
  Search,
  Clock,
  Eye,
  Download,
  Users,
  CheckCircle2,
  Star,
  Layers,
  Music,
  Type,
  Palette,
  Split,
  Scissors,
  Target
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function Templates() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.Template.list("-use_count"),
    initialData: [],
  });

  const { data: userTemplates = [] } = useQuery({
    queryKey: ["userTemplates", user?.email],
    queryFn: () => base44.entities.Template.filter({ created_by: user.email }),
    enabled: !!user,
    initialData: [],
  });

  const createProjectFromTemplate = useMutation({
    mutationFn: async (template) => {
      const projectData = {
        title: `${template.name} Project`,
        description: template.description,
        resolution: template.resolution,
        fps: template.fps,
        template_id: template.id,
        ai_settings: template.ai_settings,
        export_preset: template.export_preset,
        status: "draft",
        duration_seconds: template.duration_seconds || 60,
        scenes: JSON.parse(template.json_structure || "[]")
      };

      const project = await base44.entities.VideoProject.create(projectData);
      
      // Increment template use count
      await base44.entities.Template.update(template.id, {
        use_count: (template.use_count || 0) + 1
      });

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["videoProjects"]);
      queryClient.invalidateQueries(["templates"]);
      alert("✅ Project created from template!\n\nGo to Video Studio to start editing.");
    },
  });

  const categories = [
    { id: "all", name: "All Templates", icon: Sparkles },
    { id: "social_media", name: "Social Media", icon: TrendingUp },
    { id: "explainer", name: "Explainers", icon: GraduationCap },
    { id: "promo", name: "Promos & Ads", icon: Megaphone },
    { id: "tutorial", name: "Tutorials", icon: Play },
    { id: "vlog", name: "Vlogs", icon: Camera },
    { id: "event", name: "Events", icon: Gift },
    { id: "corporate", name: "Corporate", icon: Briefcase },
  ];

  const aiFeatureIcons = {
    scene_detection: { icon: Split, color: "text-[#FFD700]", label: "Scene Detection" },
    smart_trimming: { icon: Scissors, color: "text-[#FF8C00]", label: "Smart Trim" },
    auto_transitions: { icon: Zap, color: "text-[#00D4C9]", label: "Transitions" },
    auto_effects: { icon: Sparkles, color: "text-[#9D4EDD]", label: "Auto FX" },
    voiceover: { icon: Music, color: "text-[#FF6B6B]", label: "Voice AI" },
    auto_captions: { icon: Type, color: "text-[#4ECDC4]", label: "Captions" },
    background_removal: { icon: Layers, color: "text-[#06D6A0]", label: "BG Removal" },
    object_tracking: { icon: Target, color: "text-[#F72585]", label: "Tracking" },
    color_grading: { icon: Palette, color: "text-[#FFA500]", label: "Color Grade" }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const systemTemplates = filteredTemplates.filter(t => t.is_system_template);
  const customTemplates = filteredTemplates.filter(t => !t.is_system_template);

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Video Templates</h1>
          <p className="text-gray-400">Professional templates with pre-configured AI settings</p>
        </div>

        {/* Search & Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-10 bg-[#111317] border-gray-800 text-white rounded-xl"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-[#111317] border-gray-800 text-white rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black'
                    : 'bg-[#111317] text-gray-400 hover:bg-[#1a1a1f] border border-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <Tabs defaultValue="featured" className="space-y-6">
          <TabsList className="bg-[#111317] border border-gray-800">
            <TabsTrigger value="featured">
              <Star className="w-4 h-4 mr-2" />
              Featured ({systemTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="my-templates">
              <Users className="w-4 h-4 mr-2" />
              My Templates ({userTemplates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-4">
            {systemTemplates.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl overflow-hidden hover:border-[#FFD700] transition-all">
                      {/* Template Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-[#FFD700] via-[#FF8C00] to-[#A89C94] p-6 flex items-center justify-center relative">
                        {template.is_premium && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-black/50 text-[#FFD700] border-[#FFD700]">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-black mb-2">{template.name}</h3>
                          <div className="flex items-center justify-center gap-2 text-black/70 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{template.duration_seconds}s</span>
                            <span>•</span>
                            <span>{template.resolution}</span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-3">{template.description || "Professional video template"}</p>
                          
                          {/* AI Features */}
                          {template.ai_settings && (
                            <div>
                              <p className="text-gray-500 text-xs mb-2">AI Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {template.ai_settings.scene_detection && (
                                  <Badge className="bg-[#FFD700]/10 text-[#FFD700] text-xs">Scene AI</Badge>
                                )}
                                {template.ai_settings.auto_transitions && (
                                  <Badge className="bg-[#00D4C9]/10 text-[#00D4C9] text-xs">Transitions</Badge>
                                )}
                                {template.ai_settings.auto_captions && (
                                  <Badge className="bg-[#4ECDC4]/10 text-[#4ECDC4] text-xs">Captions</Badge>
                                )}
                                {template.ai_settings.voiceover && (
                                  <Badge className="bg-[#FF6B6B]/10 text-[#FF6B6B] text-xs">Voiceover</Badge>
                                )}
                                {template.ai_settings.background_removal && (
                                  <Badge className="bg-[#06D6A0]/10 text-[#06D6A0] text-xs">BG AI</Badge>
                                )}
                                {template.ai_settings.object_tracking && (
                                  <Badge className="bg-[#F72585]/10 text-[#F72585] text-xs">Tracking</Badge>
                                )}
                                {template.ai_settings.color_grading && (
                                  <Badge className="bg-[#FFA500]/10 text-[#FFA500] text-xs">Color</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{template.use_count || 0} uses</span>
                          </div>
                          {template.export_preset && (
                            <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                              {template.export_preset}
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => createProjectFromTemplate.mutate(template)}
                          disabled={createProjectFromTemplate.isLoading}
                          className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">No templates found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-templates" className="space-y-4">
            {userTemplates.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-[#111317] border-gray-800 rounded-2xl overflow-hidden hover:border-[#9D4EDD] transition-all">
                      <div className="aspect-video bg-gradient-to-br from-[#9D4EDD] to-[#6B3EDD] p-6 flex items-center justify-center relative">
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-black/50 text-white">
                            Custom
                          </Badge>
                        </div>
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-white mb-2">{template.name}</h3>
                          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{template.duration_seconds}s</span>
                            <span>•</span>
                            <span>{template.resolution}</span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-3">{template.description || "Your custom template"}</p>
                          
                          {template.ai_settings && (
                            <div>
                              <p className="text-gray-500 text-xs mb-2">AI Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {template.ai_settings.scene_detection && (
                                  <Badge className="bg-[#FFD700]/10 text-[#FFD700] text-xs">Scene AI</Badge>
                                )}
                                {template.ai_settings.auto_transitions && (
                                  <Badge className="bg-[#00D4C9]/10 text-[#00D4C9] text-xs">Transitions</Badge>
                                )}
                                {template.ai_settings.auto_captions && (
                                  <Badge className="bg-[#4ECDC4]/10 text-[#4ECDC4] text-xs">Captions</Badge>
                                )}
                                {template.ai_settings.voiceover && (
                                  <Badge className="bg-[#FF6B6B]/10 text-[#FF6B6B] text-xs">Voiceover</Badge>
                                )}
                                {template.ai_settings.background_removal && (
                                  <Badge className="bg-[#06D6A0]/10 text-[#06D6A0] text-xs">BG AI</Badge>
                                )}
                                {template.ai_settings.object_tracking && (
                                  <Badge className="bg-[#F72585]/10 text-[#F72585] text-xs">Tracking</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            <span>{template.use_count || 0} uses</span>
                          </div>
                          {template.export_preset && (
                            <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                              {template.export_preset}
                            </Badge>
                          )}
                        </div>

                        <Button
                          onClick={() => createProjectFromTemplate.mutate(template)}
                          disabled={createProjectFromTemplate.isLoading}
                          className="w-full bg-gradient-to-r from-[#9D4EDD] to-[#6B3EDD] text-white rounded-xl font-semibold"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">No custom templates yet</p>
                <p className="text-gray-500 text-sm mb-4">Create a project in Video Studio and save it as a template</p>
                <Link to={createPageUrl("VideoStudio")}>
                  <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl">
                    <Play className="w-4 h-4 mr-2" />
                    Go to Video Studio
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}