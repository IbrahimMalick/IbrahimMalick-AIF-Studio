import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wand2,
  Sparkles,
  Copy,
  Download,
  Save,
  Zap,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function ScriptWriter() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    topic: "",
    script_type: "short_form",
    target_duration_seconds: 60,
    tone: "professional",
    target_audience: "",
    key_points: []
  });

  const [generatedScript, setGeneratedScript] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: savedScripts = [] } = useQuery({
    queryKey: ["scripts", user?.email],
    queryFn: () => base44.entities.ScriptGeneration.list("-created_date", 20),
    enabled: !!user
  });

  const generateScript = async () => {
    if (!formData.topic.trim()) {
      showToast("Please enter a topic", "error");
      return;
    }

    setGenerating(true);

    try {
      // Generate script using AI
      const scriptPrompt = `Create a ${formData.script_type} video script on the topic: "${formData.topic}".
      
Target duration: ${formData.target_duration_seconds} seconds
Tone: ${formData.tone}
Target audience: ${formData.target_audience || "general"}
Key points to include: ${formData.key_points.join(", ") || "none specified"}

Provide:
1. A powerful hook (first 3-5 seconds)
2. Full script with scene descriptions
3. Visual directions
4. Call to action
5. On-screen text suggestions

Format as JSON with:
- hook (string)
- full_script (string)
- scenes (array of {scene_number, duration_seconds, visual_description, voiceover_text, on_screen_text})
- cta (string)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: scriptPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            hook: { type: "string" },
            full_script: { type: "string" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_number: { type: "number" },
                  duration_seconds: { type: "number" },
                  visual_description: { type: "string" },
                  voiceover_text: { type: "string" },
                  on_screen_text: { type: "string" }
                }
              }
            },
            cta: { type: "string" }
          }
        }
      });

      // Calculate viral score
      const viralAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video script for viral potential. Rate 0-100 based on: hook strength, pacing, emotional appeal, shareability, trending alignment.

Script: ${result.full_script}`,
        response_json_schema: {
          type: "object",
          properties: {
            viral_score: { type: "number" },
            analysis: { type: "string" },
            improvements: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Save to database
      const scriptRecord = await base44.entities.ScriptGeneration.create({
        user_email: user.email,
        topic: formData.topic,
        script_type: formData.script_type,
        target_duration_seconds: formData.target_duration_seconds,
        tone: formData.tone,
        target_audience: formData.target_audience,
        key_points: formData.key_points,
        generated_script: result.full_script,
        scene_breakdown: result.scenes,
        hooks: [result.hook],
        cta: result.cta,
        estimated_word_count: result.full_script.split(/\s+/).length,
        viral_score: viralAnalysis.viral_score
      });

      setGeneratedScript({
        ...scriptRecord,
        ...result,
        viral_analysis: viralAnalysis
      });

      queryClient.invalidateQueries(["scripts"]);
      showToast("Script generated! 🎬", "success");
    } catch (error) {
      console.error("Error generating script:", error);
      showToast("Failed to generate script", "error");
    }

    setGenerating(false);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript.full_script);
    showToast("Script copied to clipboard!", "success");
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-[#FFD700]" />
            AI Video Script Writer
          </h1>
          <p className="text-gray-400">Generate professional video scripts in seconds</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Input Form */}
          <Card className="lg:col-span-1 bg-[#111] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Script Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <Label className="text-gray-300">Video Topic *</Label>
                <Textarea
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="E.g., How to use AI for content creation"
                  className="mt-2 bg-[#0C0C0C] border-gray-700 text-white rounded-xl h-24"
                />
              </div>

              <div>
                <Label className="text-gray-300">Script Type</Label>
                <Select
                  value={formData.script_type}
                  onValueChange={(value) => setFormData({...formData, script_type: value})}
                >
                  <SelectTrigger className="mt-2 bg-[#0C0C0C] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_form">Short Form (15-60s)</SelectItem>
                    <SelectItem value="long_form">Long Form (3-10min)</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="sales">Sales/Promo</SelectItem>
                    <SelectItem value="story">Storytelling</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Target Duration (seconds)</Label>
                <Input
                  type="number"
                  value={formData.target_duration_seconds}
                  onChange={(e) => setFormData({...formData, target_duration_seconds: parseInt(e.target.value)})}
                  className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Tone</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => setFormData({...formData, tone: value})}
                >
                  <SelectTrigger className="mt-2 bg-[#0C0C0C] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Target Audience (Optional)</Label>
                <Input
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  placeholder="E.g., Small business owners"
                  className="mt-2 bg-[#0C0C0C] border-gray-700 text-white"
                />
              </div>

              <Button
                onClick={generateScript}
                disabled={generating}
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold rounded-xl h-12"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Script
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Output */}
          <div className="lg:col-span-2 space-y-6">
            
            {generatedScript ? (
              <>
                <Card className="bg-[#111] border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Generated Script</CardTitle>
                      <div className="flex gap-2">
                        <Badge className="bg-[#FFD700]/20 text-[#FFD700] flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Viral Score: {generatedScript.viral_score || generatedScript.viral_analysis?.viral_score}/100
                        </Badge>
                        <Button variant="outline" size="sm" onClick={copyScript}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="full">
                      <TabsList className="bg-[#0C0C0C]">
                        <TabsTrigger value="full">Full Script</TabsTrigger>
                        <TabsTrigger value="scenes">Scene Breakdown</TabsTrigger>
                        <TabsTrigger value="analysis">Viral Analysis</TabsTrigger>
                      </TabsList>

                      <TabsContent value="full" className="space-y-4">
                        <div className="p-4 bg-[#0C0C0C] rounded-lg border border-gray-800">
                          <h4 className="text-[#FFD700] font-semibold mb-2">Hook:</h4>
                          <p className="text-white">{generatedScript.hook}</p>
                        </div>

                        <div className="p-4 bg-[#0C0C0C] rounded-lg border border-gray-800">
                          <h4 className="text-[#00D4C9] font-semibold mb-2">Full Script:</h4>
                          <p className="text-white whitespace-pre-wrap">{generatedScript.full_script}</p>
                        </div>

                        <div className="p-4 bg-[#0C0C0C] rounded-lg border border-gray-800">
                          <h4 className="text-[#FF8C00] font-semibold mb-2">Call to Action:</h4>
                          <p className="text-white">{generatedScript.cta}</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="scenes">
                        <div className="space-y-4">
                          {generatedScript.scenes?.map((scene, idx) => (
                            <Card key={idx} className="bg-[#0C0C0C] border-gray-800">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge>Scene {scene.scene_number}</Badge>
                                  <span className="text-gray-500 text-sm">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {scene.duration_seconds}s
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-gray-400 text-xs font-semibold mb-1">VISUAL:</p>
                                    <p className="text-white text-sm">{scene.visual_description}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400 text-xs font-semibold mb-1">VOICEOVER:</p>
                                    <p className="text-white text-sm">{scene.voiceover_text}</p>
                                  </div>
                                  {scene.on_screen_text && (
                                    <div>
                                      <p className="text-gray-400 text-xs font-semibold mb-1">ON-SCREEN TEXT:</p>
                                      <p className="text-[#FFD700] text-sm">{scene.on_screen_text}</p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="analysis">
                        <div className="space-y-4">
                          <Card className="bg-[#0C0C0C] border-gray-800">
                            <CardContent className="p-6">
                              <div className="text-center mb-4">
                                <div className="text-5xl font-bold text-[#FFD700] mb-2">
                                  {generatedScript.viral_score || generatedScript.viral_analysis?.viral_score}/100
                                </div>
                                <p className="text-gray-400">Viral Potential Score</p>
                              </div>
                              <p className="text-white mb-4">{generatedScript.viral_analysis?.analysis}</p>
                              
                              {generatedScript.viral_analysis?.improvements && (
                                <div>
                                  <h4 className="text-white font-semibold mb-2">Improvement Suggestions:</h4>
                                  <ul className="space-y-2">
                                    {generatedScript.viral_analysis.improvements.map((imp, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <Zap className="w-4 h-4 text-[#FF8C00] mt-0.5 flex-shrink-0" />
                                        {imp}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-[#111] border-gray-800">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Fill in the parameters and click "Generate Script" to create your video script</p>
                </CardContent>
              </Card>
            )}

            {/* Saved Scripts */}
            {savedScripts.length > 0 && (
              <Card className="bg-[#111] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Scripts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedScripts.slice(0, 5).map((script) => (
                      <div
                        key={script.id}
                        onClick={() => setGeneratedScript(script)}
                        className="p-4 bg-[#0C0C0C] rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium">{script.topic}</p>
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                            {script.viral_score}/100
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {new Date(script.created_date).toLocaleDateString()} • {script.script_type}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}