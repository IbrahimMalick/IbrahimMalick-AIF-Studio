import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Wand2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function AvatarScriptBuilder({ onScriptReady, initialData = {} }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);

  const [scriptData, setScriptData] = useState({
    topic: initialData.topic || "",
    audience: initialData.audience || "",
    length: initialData.length || "30s",
    format: initialData.format || "reel",
    tone: initialData.tone || "friendly",
    script: initialData.script || "",
    hook: "",
    scenes: [],
    cta: ""
  });

  const [complianceResult, setComplianceResult] = useState(null);

  const lengthPresets = [
    { value: "15s", label: "15 seconds", description: "Quick hook" },
    { value: "30s", label: "30 seconds", description: "Short reel" },
    { value: "60s", label: "60 seconds", description: "Full reel/short" },
    { value: "2m", label: "2 minutes", description: "Explainer" },
    { value: "5m", label: "5 minutes", description: "Deep dive/VSL" }
  ];

  const formatPresets = [
    { value: "reel", label: "📱 Reel/Short", description: "Fast, punchy, hook-first" },
    { value: "explainer", label: "💡 Explainer", description: "Educational, structured" },
    { value: "vsl", label: "💰 VSL", description: "Sales video letter" },
    { value: "onboarding", label: "🎓 Onboarding", description: "Welcome/tutorial" },
    { value: "faq", label: "❓ FAQ", description: "Answer questions" },
    { value: "testimonial", label: "⭐ Testimonial", description: "Customer success" }
  ];

  const tonePresets = [
    { value: "mentor", label: "🧘 Mentor", description: "Calm, educational" },
    { value: "analyst", label: "🧠 Analyst", description: "Data-driven, precise" },
    { value: "hype", label: "🔥 Hype", description: "Energetic, exciting" },
    { value: "luxury", label: "💎 Luxury", description: "Premium, sophisticated" },
    { value: "friendly", label: "😊 Friendly", description: "Approachable, warm" },
    { value: "authoritative", label: "🎓 Authoritative", description: "Expert, confident" },
    { value: "casual", label: "😎 Casual", description: "Relaxed, conversational" }
  ];

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a ${scriptData.length} ${scriptData.format} script for ${scriptData.audience} about ${scriptData.topic}.

Requirements:
- Opening hook within 3 seconds
- Maximum 3 scenes
- Clear CTA at the end
- Tone: ${scriptData.tone}

Insert prosody tags:
- [PAUSE 300ms] for dramatic pauses
- [EMPHASIS: word] for important words
- [SMILE] for warm moments
- [WHISPER] for intimate moments

Structure:
1. HOOK (0-3s): Attention grabber
2. MAIN CONTENT (2-3 scenes): Value delivery
3. CTA (last 5s): Clear next step

Make it conversational and engaging for avatar delivery.`,
        response_json_schema: {
          type: "object",
          properties: {
            full_script: { type: "string" },
            hook: { type: "string" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scene_number: { type: "number" },
                  content: { type: "string" },
                  duration_seconds: { type: "number" },
                  visual_note: { type: "string" }
                }
              }
            },
            cta: { type: "string" },
            word_count: { type: "number" },
            estimated_duration: { type: "number" }
          }
        }
      });

      setScriptData({
        ...scriptData,
        script: response.full_script,
        hook: response.hook,
        scenes: response.scenes,
        cta: response.cta
      });

      alert("✅ Script generated successfully!");
    } catch (error) {
      console.error("Error generating script:", error);
      alert("Failed to generate script. Please try again.");
    }
    setIsGenerating(false);
  };

  const checkCompliance = async () => {
    setIsCheckingCompliance(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Check this script for Meta/YouTube ad policy compliance:

SCRIPT:
${scriptData.script}

Detect and flag:
1. Health claims (cure, treat, diagnose)
2. Income claims (get rich, guaranteed earnings)
3. Personal attributes (targeting based on race, religion, etc.)
4. Absolute claims (100%, never, always)
5. Prohibited content (tobacco, weapons, adult)
6. Missing disclaimers

If issues found, rewrite to comply while keeping persuasive tone.
Return pass/fail + issues + compliant version.`,
        response_json_schema: {
          type: "object",
          properties: {
            passes: { type: "boolean" },
            issues: { type: "array", items: { type: "string" } },
            policy_flags: { type: "array", items: { type: "string" } },
            rewritten_script: { type: "string" },
            confidence: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setComplianceResult(result);

      if (result.passes) {
        alert("✅ Script passes policy compliance!");
      } else {
        alert(`⚠️ ${result.issues.length} compliance issues found. Review suggestions.`);
      }
    } catch (error) {
      console.error("Error checking compliance:", error);
      alert("Failed to check compliance. Please try again.");
    }
    setIsCheckingCompliance(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Script Builder */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00D4C9]" />
            Avatar Script Builder 2.0
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Brief Inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Topic (e.g., 'How to start a podcast')"
              value={scriptData.topic}
              onChange={(e) => setScriptData({...scriptData, topic: e.target.value})}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
            <Input
              placeholder="Audience (e.g., 'Aspiring podcasters 25-45')"
              value={scriptData.audience}
              onChange={(e) => setScriptData({...scriptData, audience: e.target.value})}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Length</label>
              <Select value={scriptData.length} onValueChange={(value) => setScriptData({...scriptData, length: value})}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengthPresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Format</label>
              <Select value={scriptData.format} onValueChange={(value) => setScriptData({...scriptData, format: value})}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatPresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Tone</label>
              <Select value={scriptData.tone} onValueChange={(value) => setScriptData({...scriptData, tone: value})}>
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tonePresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateScript}
            disabled={isGenerating || !scriptData.topic}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Script
              </>
            )}
          </Button>

          {/* Prosody Tags Guide */}
          <div className="p-3 bg-[#0B0B0C] rounded-lg">
            <p className="text-gray-400 text-xs mb-2">PROSODY TAGS AVAILABLE:</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-purple-500/20 text-purple-400 text-xs">[PAUSE 300ms]</Badge>
              <Badge className="bg-blue-500/20 text-blue-400 text-xs">[EMPHASIS: word]</Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">[SMILE]</Badge>
              <Badge className="bg-pink-500/20 text-pink-400 text-xs">[WHISPER]</Badge>
              <Badge className="bg-green-500/20 text-green-400 text-xs">[SPEED UP]</Badge>
            </div>
          </div>

          {/* Script Editor */}
          {scriptData.script && (
            <>
              <Textarea
                value={scriptData.script}
                onChange={(e) => setScriptData({...scriptData, script: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[300px] font-mono text-sm leading-relaxed"
              />

              <div className="flex gap-3">
                <Button
                  onClick={checkCompliance}
                  disabled={isCheckingCompliance}
                  variant="outline"
                  className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                >
                  {isCheckingCompliance ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Check Compliance
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigator.clipboard.writeText(scriptData.script)}
                  variant="outline"
                  className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onScriptReady(scriptData)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Continue to Avatar
                </Button>
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Compliance Results */}
      {complianceResult && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border-2 rounded-2xl ${
            complianceResult.passes 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {complianceResult.passes ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <CardTitle className="text-white">Policy Compliant ✓</CardTitle>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <CardTitle className="text-white">Policy Issues Found</CardTitle>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {!complianceResult.passes && complianceResult.issues?.length > 0 && (
                <div>
                  <p className="text-yellow-400 text-sm font-semibold mb-2">Issues Detected:</p>
                  <ul className="space-y-1">
                    {complianceResult.issues.map((issue, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {complianceResult.policy_flags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {complianceResult.policy_flags.map((flag, idx) => (
                    <Badge key={idx} className="bg-red-500/20 text-red-400">
                      {flag}
                    </Badge>
                  ))}
                </div>
              )}

              {complianceResult.rewritten_script && !complianceResult.passes && (
                <div>
                  <p className="text-green-400 text-sm font-semibold mb-2">✓ Compliant Version:</p>
                  <Textarea
                    value={complianceResult.rewritten_script}
                    readOnly
                    className="bg-[#0B0B0C] border-green-500/30 text-white rounded-xl min-h-[200px] text-sm"
                  />
                  <Button
                    onClick={() => setScriptData({...scriptData, script: complianceResult.rewritten_script})}
                    className="w-full mt-2 bg-green-500 text-white rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Use Compliant Version
                  </Button>
                </div>
              )}

              {complianceResult.recommendations?.length > 0 && (
                <div>
                  <p className="text-[#00D4C9] text-sm font-semibold mb-2">💡 Recommendations:</p>
                  <ul className="space-y-1">
                    {complianceResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[#00D4C9] mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Scene Breakdown (if generated) */}
      {scriptData.scenes?.length > 0 && (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Scene Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scriptData.scenes.map((scene) => (
                <div key={scene.scene_number} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                      Scene {scene.scene_number}
                    </Badge>
                    <Badge className="bg-gray-700 text-gray-300 text-xs">
                      {scene.duration_seconds}s
                    </Badge>
                  </div>
                  <p className="text-white text-sm mb-1">{scene.content}</p>
                  <p className="text-gray-500 text-xs">Visual: {scene.visual_note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}