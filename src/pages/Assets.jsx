import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Image as ImageIcon, Video, Music, FileText, CheckSquare, Square } from "lucide-react";
import AssetBulkActionsBar from "@/components/AssetBulkActionsBar";

export default function Assets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list("-created_date"),
    initialData: [],
  });

  const filteredAssets = assets.filter((asset) => {
    const matchesType = filterType === "all" || asset.file_type === filterType;
    const matchesSearch = !searchQuery ||
      asset.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssets.map(a => a.id));
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectMode(false);
  };

  const allSelected = filteredAssets.length > 0 && selectedIds.length === filteredAssets.length;

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Asset Library</h1>
            <p className="text-gray-400">Manage all your media files in one place</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSelectMode(s => !s); setSelectedIds([]); }}
            className={`border-gray-700 text-sm ${selectMode ? 'bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/50' : 'text-gray-400'}`}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {selectMode ? 'Exit Select' : 'Select'}
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="pl-10 bg-[#111317] border-gray-700 text-white rounded-xl"
            />
          </div>
          <Tabs value={filterType} onValueChange={setFilterType}>
            <TabsList className="bg-[#111317] rounded-xl">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Select All bar */}
        {selectMode && filteredAssets.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 hover:text-white transition-colors">
              {allSelected
                ? <CheckSquare className="w-4 h-4 text-[#FF8C00]" />
                : <Square className="w-4 h-4" />}
              {allSelected ? 'Deselect all' : `Select all (${filteredAssets.length})`}
            </button>
            {selectedIds.length > 0 && (
              <span className="text-[#FF8C00] font-medium">{selectedIds.length} selected</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            return (
              <Card
                key={asset.id}
                onClick={() => selectMode && toggleSelect(asset.id)}
                className={`bg-[#111317] border-gray-800 rounded-2xl overflow-hidden transition-all ${
                  selectMode ? 'cursor-pointer' : 'hover:border-[#FF8C00]'
                } ${isSelected ? 'border-[#FF8C00] ring-2 ring-[#FF8C00]/40' : ''}`}
              >
                <div className="aspect-square bg-[#0B0B0C] flex items-center justify-center relative">
                  {asset.file_type === "image" && asset.file_url ? (
                    <img src={asset.file_url} alt={asset.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#A89C94] flex items-center justify-center">
                      {asset.file_type === "video" && <Video className="w-8 h-8 text-white" />}
                      {asset.file_type === "audio" && <Music className="w-8 h-8 text-white" />}
                      {asset.file_type === "document" && <FileText className="w-8 h-8 text-white" />}
                    </div>
                  )}
                  {selectMode && (
                    <div className="absolute top-2 left-2">
                      {isSelected
                        ? <CheckSquare className="w-5 h-5 text-[#FF8C00] drop-shadow" />
                        : <Square className="w-5 h-5 text-white/60 drop-shadow" />}
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-white text-sm font-medium truncate">{asset.title}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Badge className="bg-[#0B0B0C] text-gray-400 text-xs">{asset.file_type}</Badge>
                    {asset.is_published && <Badge className="bg-green-500/20 text-green-400 text-xs">Published</Badge>}
                    {asset.license_type && asset.license_type !== 'free' && (
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">{asset.license_type}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No assets found</p>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <AssetBulkActionsBar
          selectedIds={selectedIds}
          selectedAssets={filteredAssets.filter(a => selectedIds.includes(a.id))}
          onClearSelection={clearSelection}
        />
      )}
    </div>
  );
}