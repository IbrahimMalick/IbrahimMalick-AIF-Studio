
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wand2,
  Download,
  Heart,
  Copy,
  Grid3x3,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ArtLab() {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("digital_art");
  const [dimensions, setDimensions] = useState("square");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: generations = [] } = useQuery({
    queryKey: ["artGenerations"],
    queryFn: () => base44.entities.ArtGeneration.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ArtGeneration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["artGenerations"]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ArtGeneration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["artGenerations"]);
    },
  });

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `${prompt}. Style: ${style}. ${negativePrompt ? `Avoid: ${negativePrompt}` : ''}`
      });

      await createMutation.mutateAsync({
        prompt,
        negative_prompt: negativePrompt,
        style,
        dimensions,
        image_url: result.url,
        status: "completed"
      });

      setPrompt("");
      setNegativePrompt("");
    } catch (error) {
      alert("Error generating image. Please try again.");
      console.error(error);
    }

    setIsGenerating(false);
  };

  const toggleFavorite = async (generation) => {
    await updateMutation.mutateAsync({
      id: generation.id,
      data: { is_favorite: !generation.is_favorite }
    });
  };

  const samplePrompts = [
    "A futuristic cityscape at sunset with flying cars",
    "Abstract geometric patterns in vibrant colors",
    "Portrait of a wise elder with glowing eyes",
    "Mystical forest with bioluminescent plants"
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Art Studio</h1>
          <p className="text-gray-400">Unleash your creativity. Generate stunning visuals with advanced AI.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Generation Panel */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#FF8C00]" />
                Create New
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Negative Prompt (Optional)</label>
                <Input
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What to avoid..."
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photorealistic">Photorealistic</SelectItem>
                    <SelectItem value="digital_art">Digital Art</SelectItem>
                    <SelectItem value="oil_painting">Oil Painting</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="3d_render">3D Render</SelectItem>
                    <SelectItem value="sketch">Sketch</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Dimensions</label>
                <Select value={dimensions} onValueChange={setDimensions}>
                  <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square (1:1)</SelectItem>
                    <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                    <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                    <SelectItem value="wide">Wide (21:9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white rounded-xl h-11"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Sample Prompts:</p>
                <div className="space-y-2">
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(sample)}
                      className="w-full text-left p-2 rounded-lg bg-[#0B0B0C] hover:bg-[#1a1a1f] text-gray-400 text-xs transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Grid3x3 className="w-5 h-5" />
                    Your Creations
                  </CardTitle>
                  <Badge className="bg-[#FF8C00]/20 text-[#FF8C00]">
                    {generations.length} images
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {generations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generations.map((gen) => (
                      <div
                        key={gen.id}
                        className="group relative rounded-xl overflow-hidden bg-[#0B0B0C] border border-gray-800 hover:border-[#FF8C00] transition-all"
                      >
                        {gen.image_url ? (
                          <img
                            src={gen.image_url}
                            alt={gen.prompt}
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-[#FF8C00] to-[#A89C94]">
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                              {gen.prompt}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-purple-500/30 text-purple-300 text-xs">
                                {gen.style}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => toggleFavorite(gen)}
                                size="sm"
                                variant="outline"
                                className={`flex-1 rounded-lg ${
                                  gen.is_favorite
                                    ? "bg-red-500/20 border-red-500 text-red-400"
                                    : "border-white/20 text-white"
                                }`}
                              >
                                <Heart className={`w-4 h-4 mr-1 ${gen.is_favorite ? "fill-current" : ""}`} />
                                {gen.is_favorite ? "Saved" : "Save"}
                              </Button>
                              {gen.image_url && (
                                <Button
                                  onClick={() => window.open(gen.image_url, "_blank")}
                                  size="sm"
                                  variant="outline"
                                  className="border-white/20 text-white rounded-lg"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FF8C00] to-[#A89C94] flex items-center justify-center mb-4">
                      <ImageIcon className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-400 mb-2">No images yet</p>
                    <p className="text-gray-500 text-sm">Create your first AI artwork to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
