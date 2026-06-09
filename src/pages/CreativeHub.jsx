import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Search,
  Filter,
  X,
  Plus
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreativeHub() {
  const queryClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: "",
    description: "",
    tags: "",
    license_type: "free",
    price: 0,
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list("-created_date"),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "document";

      return base44.entities.Asset.create({
        ...uploadMetadata,
        file_url,
        file_type: fileType,
        file_size_mb: (file.size / 1024 / 1024).toFixed(2),
        tags: uploadMetadata.tags.split(",").map((t) => t.trim()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["assets"]);
      setUploadFile(null);
      setUploadMetadata({
        title: "",
        description: "",
        tags: "",
        license_type: "free",
        price: 0,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["assets"]);
      setSelectedAsset(null);
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadMetadata((prev) => ({
        ...prev,
        title: file.name.split(".")[0],
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadMetadata.title) {
      alert("Please select a file and enter a title");
      return;
    }
    await uploadMutation.mutateAsync(uploadFile);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === "all" || asset.file_type === filterType;
    const matchesSearch =
      !searchQuery ||
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Creative Hub</h1>
            <p className="text-gray-400">Upload and manage your media assets</p>
          </div>
        </div>

        {/* Upload Section */}
        {!uploadFile ? (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-12">
              <label className="block cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center hover:border-[#FF8C00] transition-colors">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#FF8C00] to-[#A89C94] flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-medium mb-2">No assets yet. Upload files or drag & drop to get started.</p>
                  <p className="text-gray-400 text-sm">We'll make previews and watermarks automatically.</p>
                  <Button className="mt-6 bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </label>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">Upload Asset</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUploadFile(null)}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Title</label>
                  <Input
                    value={uploadMetadata.title}
                    onChange={(e) =>
                      setUploadMetadata({ ...uploadMetadata, title: e.target.value })
                    }
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">License</label>
                  <select
                    value={uploadMetadata.license_type}
                    onChange={(e) =>
                      setUploadMetadata({ ...uploadMetadata, license_type: e.target.value })
                    }
                    className="w-full bg-[#0B0B0C] border border-gray-700 text-white rounded-xl px-3 py-2"
                  >
                    <option value="free">Free</option>
                    <option value="personal">Personal</option>
                    <option value="commercial">Commercial</option>
                    <option value="exclusive">Exclusive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Description</label>
                <Textarea
                  value={uploadMetadata.description}
                  onChange={(e) =>
                    setUploadMetadata({ ...uploadMetadata, description: e.target.value })
                  }
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={uploadMetadata.tags}
                  onChange={(e) =>
                    setUploadMetadata({ ...uploadMetadata, tags: e.target.value })
                  }
                  placeholder="design, branding, logo"
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setUploadFile(null)}
                  className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white rounded-xl"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload Asset"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-10 bg-[#111317] border-gray-700 text-white rounded-xl"
              />
            </div>
          </div>
          <Tabs value={filterType} onValueChange={setFilterType}>
            <TabsList className="bg-[#111317] rounded-xl">
              <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
              <TabsTrigger value="image" className="rounded-xl">Images</TabsTrigger>
              <TabsTrigger value="video" className="rounded-xl">Videos</TabsTrigger>
              <TabsTrigger value="audio" className="rounded-xl">Audio</TabsTrigger>
              <TabsTrigger value="document" className="rounded-xl">Docs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              className="bg-[#111317] border-gray-800 rounded-2xl overflow-hidden hover:border-[#FF8C00] transition-all cursor-pointer group"
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="aspect-video bg-[#0B0B0C] flex items-center justify-center">
                {asset.file_type === "image" ? (
                  <img
                    src={asset.file_url}
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#A89C94] flex items-center justify-center">
                    {getFileIcon(asset.file_type)}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-2 truncate">{asset.title}</h3>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="bg-[#0B0B0C] text-gray-400 border-0 rounded-lg"
                  >
                    {asset.file_type}
                  </Badge>
                  <span className="text-xs text-gray-500">{asset.file_size_mb} MB</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAssets.length === 0 && assets.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No assets found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}