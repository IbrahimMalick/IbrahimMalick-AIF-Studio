import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Wand2,
  Volume2,
  Split,
  History,
  Copy,
  Loader2,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function EnhancedScriptEditor({ initialScript, onScriptComplete, projectDetails }) {
  const [script, setScript] = useState(initialScript || "");
  const [tone, setTone] = useState("friendly");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneBreakdown, setSceneBreakdown] = useState([]);
  const [versions, setVersions] = useState([{ version: 1, script: initialScript, timestamp: new Date() }]);

  const toneOptions = [
    { value: "friendly", label: "😊 Friendly", description: "Warm and approachable" },
    { value: "authoritative", label: "🎓 Authoritative", description: "Expert and professional" },
    { value: "inspirational", label: "✨ Inspirational", description: "Motivating and uplifting" },
    { value: "sales", label: "💰 Sales", description: "Persuasive and direct" },
    { value: "casual", label: "😎 Casual", description: "Relaxed and conversational" },
    { value: "energetic", label: "⚡ Energetic", description: "High energy and exciting" }
  ];

  // Generate full script with tone
  const generateScript = async () => {
    if (!projectDetails?.title) {
      alert("Please provide project details first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete video script:

Project: ${projectDetails.title}
Description: ${projectDetails.description || 'Not provided'}
Duration: ${projectDetails.duration_seconds} seconds
Tone: ${tone}
Type: ${projectDetails.type || 'general'}

Create a ${tone} script that includes:

1. OPENING HOOK (3-5 seconds):
   - Attention-grabbing statement/question
   - [PAUSE] tags for dramatic effect
   - [EMPHASIS] tags for key words

2. INTRODUCTION (10-15 seconds):
   - Context setting
   - Value proposition
   - Credibility builder

3. MAIN CONTENT (split into 3-5 sections):
   - Each section: 10-20 seconds
   - Clear talking points
   - [SFX: description] suggestions
   - Smooth transitions

4. CALL-TO-ACTION (5-10 seconds):
   - Clear next step
   - Urgency element
   - Memorable closing

Add voice direction tags:
- [PAUSE] for dramatic pauses
- [EMPHASIS: word] for important words
- [SPEED UP] or [SLOW DOWN] for pacing
- [SFX: sound effect description]
- [MUSIC: mood change]

Make it natural, conversational, and engaging.`,
      });

      const newVersion = {
        version: versions.length + 1,
        script: response,
        timestamp: new Date(),
        tone: tone
      };
      setVersions([newVersion, ...versions]);
      setScript(response);
    } catch (error) {
      console.error("Error generating script:", error);
      alert("Failed to generate script. Please try again.");
    }
    setIsGenerating(false);
  };

  // Break script into scenes
  const breakIntoScenes = async () => {
    if (!script) return;

    setIsGenerating(true);
    try {
      const breakdown = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video script and break it into optimal scenes:

SCRIPT:
${script}

Duration Target: ${projectDetails?.duration_seconds || 60} seconds

For each scene, provide:
1. Scene number
2. Voiceover text (what will be said)
3. Duration in seconds
4. Visual description (what should be shown)
5. Camera suggestion (close-up, wide shot, b-roll, etc.)
6. Text overlay suggestion
7. Transition to next scene

Ensure total duration matches target.`,
        response_json_schema: {
          type: "object",
          properties: {
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_number: { type: "number" },
                  voiceover: { type: "string" },
                  duration_seconds: { type: "number" },
                  visual_description: { type: "string" },
                  camera_suggestion: { type: "string" },
                  text_overlay: { type: "string" },
                  transition: { type: "string" }
                }
              }
            },
            total_duration: { type: "number" },
            pacing: { type: "string" }
          }
        }
      });

      setSceneBreakdown(breakdown.scenes || []);
    } catch (error) {
      console.error("Error breaking into scenes:", error);
      alert("Failed to create scene breakdown. Please try again.");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard!");
  };

  const saveVersion = () => {
    const newVersion = {
      version: versions.length + 1,
      script: script,
      timestamp: new Date(),
      tone: tone
    };
    setVersions([newVersion, ...versions]);
    alert("✅ Version saved!");
  };

  return (
    <div className="space-y-6">
      
      {/* Script Editor */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00D4C9]" />
                Enhanced Script Editor
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">AI-powered scriptwriting with voice direction</p>
            </div>
            <div className="flex gap-2">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-48 bg-[#0B0B0C] border-gray-700 text-white rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={generateScript}
                disabled={isGenerating}
                size="sm"
                className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-lg"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-1" />
                )}
                Generate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Voice Direction Legend */}
          <div className="p-3 bg-[#0B0B0C] rounded-lg">
            <p className="text-gray-400 text-xs mb-2">VOICE DIRECTION TAGS:</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-purple-500/20 text-purple-400 text-xs">[PAUSE]</Badge>
              <Badge className="bg-blue-500/20 text-blue-400 text-xs">[EMPHASIS: word]</Badge>
              <Badge className="bg-green-500/20 text-green-400 text-xs">[SPEED UP]</Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">[SFX: description]</Badge>
              <Badge className="bg-pink-500/20 text-pink-400 text-xs">[MUSIC: mood]</Badge>
            </div>
          </div>

          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Your script will appear here, or start typing..."
            className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[400px] font-mono text-sm leading-relaxed"
          />

          <div className="flex gap-3">
            <Button
              onClick={saveVersion}
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
            >
              <History className="w-4 h-4 mr-1" />
              Save Version
            </Button>
            <Button
              onClick={breakIntoScenes}
              disabled={!script || isGenerating}
              size="sm"
              variant="outline"
              className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
            >
              <Split className="w-4 h-4 mr-1" />
              Break Into Scenes
            </Button>
            <Button
              onClick={() => copyToClipboard(script)}
              size="sm"
              variant="outline"
              className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              onClick={() => onScriptComplete(script, sceneBreakdown)}
              disabled={!script}
              size="sm"
              className="bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] text-black rounded-lg ml-auto"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Continue to Voice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scene Breakdown */}
      {sceneBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Split className="w-5 h-5 text-[#9D4EDD]" />
                Scene Breakdown ({sceneBreakdown.length} scenes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sceneBreakdown.map((scene) => (
                  <div key={scene.scene_number} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                          Scene {scene.scene_number}
                        </Badge>
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          {scene.duration_seconds}s
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          {scene.camera_suggestion}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">VOICEOVER:</p>
                        <p className="text-white">{scene.voiceover}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">VISUAL:</p>
                        <p className="text-gray-400">{scene.visual_description}</p>
                      </div>
                      {scene.text_overlay && (
                        <div>
                          <p className="text-gray-500 text-xs">TEXT OVERLAY:</p>
                          <p className="text-[#FFD700]">"{scene.text_overlay}"</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <p className="text-gray-500 text-xs">
                          Transition: <span className="text-[#00D4C9]">{scene.transition}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Version History */}
      {versions.length > 1 && (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              Version History ({versions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {versions.slice(0, 5).map((version, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 cursor-pointer hover:border-[#00D4C9] transition-all"
                  onClick={() => setScript(version.script)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-gray-700 text-gray-300 text-xs mb-1">
                        Version {version.version}
                      </Badge>
                      {version.tone && (
                        <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs ml-1">
                          {version.tone}
                        </Badge>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {version.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScript(version.script);
                      }}
                    >
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}