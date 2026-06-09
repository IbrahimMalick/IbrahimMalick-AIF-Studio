import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Upload,
  Play,
  Pause,
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Volume2,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

export default function VoiceCloning() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const [newVoice, setNewVoice] = useState({ voice_name: "", samples: [] });
  const [testScript, setTestScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: voices = [] } = useQuery({
    queryKey: ["voices", user?.email],
    queryFn: () => base44.entities.VoiceClone.filter({ user_email: user.email }),
    enabled: !!user
  });

  const createVoiceMutation = useMutation({
    mutationFn: async (data) => {
      // Simulate voice training
      return await base44.entities.VoiceClone.create({
        ...data,
        user_email: user.email,
        status: "training",
        quality_score: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["voices"]);
      setIsCreatingVoice(false);
      setNewVoice({ voice_name: "", samples: [] });
      
      // Simulate training completion after 5 seconds
      setTimeout(async () => {
        const voices = await base44.entities.VoiceClone.filter({ user_email: user.email, status: "training" });
        if (voices.length > 0) {
          await base44.entities.VoiceClone.update(voices[0].id, {
            status: "ready",
            quality_score: 92,
            preview_url: "https://example.com/preview.mp3"
          });
          queryClient.invalidateQueries(["voices"]);
        }
      }, 5000);
    }
  });

  const generateVoiceMutation = useMutation({
    mutationFn: async ({ voiceId, script }) => {
      return await base44.entities.VoiceGeneration.create({
        user_email: user.email,
        voice_clone_id: voiceId,
        script_text: script,
        status: "generating"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["voiceGenerations"]);
      alert("✅ Voice generated! Check your downloads.");
      setTestScript("");
    }
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setNewVoice(prev => ({
      ...prev,
      samples: [...prev.samples, ...files.map(f => URL.createObjectURL(f))]
    }));
  };

  const handleCreateVoice = () => {
    if (!newVoice.voice_name || newVoice.samples.length < 3) {
      alert("Please provide a name and at least 3 audio samples (30 seconds each)");
      return;
    }
    createVoiceMutation.mutate({
      voice_name: newVoice.voice_name,
      sample_audio_urls: newVoice.samples
    });
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Voice Cloning Studio</h1>
            <p className="text-gray-400">Clone your voice once, use it unlimited times 🎙️</p>
          </div>
          <Button
            onClick={() => setIsCreatingVoice(!isCreatingVoice)}
            className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl"
          >
            <Mic className="w-4 h-4 mr-2" />
            Clone New Voice
          </Button>
        </div>

        {/* How It Works */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              How Voice Cloning Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FFD700] flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-white font-semibold mb-2">Upload Samples</h3>
                <p className="text-gray-400 text-sm">Record 3-5 audio clips (30 seconds each) in a quiet environment</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FFD700] flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-white font-semibold mb-2">AI Training</h3>
                <p className="text-gray-400 text-sm">Our AI learns your voice patterns, tone, and speaking style</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FFD700] flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-white font-semibold mb-2">Generate Unlimited</h3>
                <p className="text-gray-400 text-sm">Type any script and generate voiceovers in your cloned voice instantly</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Voice Form */}
        {isCreatingVoice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Create New Voice Clone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Voice Name</label>
                  <Input
                    value={newVoice.voice_name}
                    onChange={(e) => setNewVoice({...newVoice, voice_name: e.target.value})}
                    placeholder="e.g., 'My Professional Voice'"
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Audio Samples ({newVoice.samples.length}/5)
                  </label>
                  <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl text-center">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 mb-2">Upload 3-5 audio samples (30 seconds each)</p>
                    <p className="text-gray-600 text-sm mb-4">Supported: MP3, WAV, M4A</p>
                    <label>
                      <input
                        type="file"
                        accept="audio/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline" className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl" as="span">
                        Choose Files
                      </Button>
                    </label>
                  </div>
                  {newVoice.samples.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {newVoice.samples.map((sample, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0B0C] rounded-lg">
                          <div className="flex items-center gap-3">
                            <Volume2 className="w-4 h-4 text-[#FF8C00]" />
                            <span className="text-white text-sm">Sample {idx + 1}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setNewVoice(prev => ({
                              ...prev,
                              samples: prev.samples.filter((_, i) => i !== idx)
                            }))}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsCreatingVoice(false)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVoice}
                    disabled={createVoiceMutation.isLoading}
                    className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl"
                  >
                    {createVoiceMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Training...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Clone Voice
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Your Voices */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Your Cloned Voices</CardTitle>
          </CardHeader>
          <CardContent>
            {voices.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voices.map((voice) => (
                  <motion.div
                    key={voice.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-[#0B0B0C] rounded-xl border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold mb-1">{voice.voice_name}</h3>
                        {voice.is_default && (
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <Badge className={`${
                        voice.status === "ready" ? "bg-green-500/20 text-green-400" :
                        voice.status === "training" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {voice.status}
                      </Badge>
                    </div>

                    {voice.status === "ready" && (
                      <>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-400">Quality Score</span>
                            <span className="text-white font-semibold">{voice.quality_score}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#1a1a1f] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FF8C00] to-[#FFD700]"
                              style={{ width: `${voice.quality_score}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Textarea
                            value={testScript}
                            onChange={(e) => setTestScript(e.target.value)}
                            placeholder="Type script to generate..."
                            className="bg-[#1a1a1f] border-gray-700 text-white rounded-lg text-sm h-24"
                          />
                          <Button
                            onClick={() => generateVoiceMutation.mutate({ voiceId: voice.id, script: testScript })}
                            disabled={!testScript.trim() || generateVoiceMutation.isLoading}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-lg"
                            size="sm"
                          >
                            {generateVoiceMutation.isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Generate Voice
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}

                    {voice.status === "training" && (
                      <div className="text-center py-4">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 text-[#FF8C00] animate-spin" />
                        <p className="text-gray-400 text-sm">Training your voice...</p>
                        <p className="text-gray-600 text-xs">This usually takes 2-5 minutes</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mic className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">No voices cloned yet</p>
                <p className="text-gray-600 text-sm">Click "Clone New Voice" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-xl mb-1">💎 Premium Feature</h3>
                <p className="text-white/80">Voice Cloning available on Pro plan and above</p>
              </div>
              <Button className="bg-white text-black hover:bg-gray-100 rounded-xl font-semibold">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}