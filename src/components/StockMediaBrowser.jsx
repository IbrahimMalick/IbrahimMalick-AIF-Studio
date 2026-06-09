import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Heart, ExternalLink, Loader2, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

export default function StockMediaBrowser({ onSelect, userEmail }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSource, setActiveSource] = useState("unsplash");

  const saveMediaMutation = useMutation({
    mutationFn: (media) => base44.entities.StockMedia.create({
      ...media,
      user_email: userEmail
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["stockMedia"]);
    },
  });

  const searchMedia = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Use AI to find and structure stock media results
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Find ${activeSource === "unsplash" ? "photos" : "videos"} related to: "${searchQuery}". 
        Return 12 results with realistic Unsplash/Pexels URLs.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source_id: { type: "string" },
                  title: { type: "string" },
                  author: { type: "string" },
                  author_url: { type: "string" },
                  thumbnail_url: { type: "string" },
                  full_url: { type: "string" },
                  download_url: { type: "string" },
                  width: { type: "number" },
                  height: { type: "number" },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });
      
      setResults(response.results || []);
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveAndSelect = async (media) => {
    const savedMedia = {
      ...media,
      source: activeSource,
      media_type: activeSource === "unsplash" ? "image" : "video",
      is_favorite: false
    };
    
    await saveMediaMutation.mutateAsync(savedMedia);
    if (onSelect) onSelect(savedMedia);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Tabs value={activeSource} onValueChange={setActiveSource} className="w-full">
          <TabsList className="grid grid-cols-2 w-[300px]">
            <TabsTrigger value="unsplash">
              <ImageIcon className="w-4 h-4 mr-2" />
              Unsplash Photos
            </TabsTrigger>
            <TabsTrigger value="pexels">
              <VideoIcon className="w-4 h-4 mr-2" />
              Pexels Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={`Search ${activeSource === "unsplash" ? "photos" : "videos"}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchMedia()}
          className="flex-1"
        />
        <Button onClick={searchMedia} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveAndSelect(item)}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Use This
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.author_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">by {item.author}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results.length === 0 && !isSearching && (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Search for {activeSource === "unsplash" ? "photos" : "videos"} to get started</p>
        </div>
      )}
    </div>
  );
}