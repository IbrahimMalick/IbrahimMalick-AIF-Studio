import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Video, Sparkles, FileText, Image as ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const { data: projects = [] } = useQuery({
    queryKey: ["videoProjects"],
    queryFn: () => base44.entities.VideoProject.list(),
    enabled: isOpen,
  });

  const { data: art = [] } = useQuery({
    queryKey: ["artGenerations"],
    queryFn: () => base44.entities.ArtGeneration.list(),
    enabled: isOpen,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ["researchDocs"],
    queryFn: () => base44.entities.ResearchDocument.list(),
    enabled: isOpen,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = [];

    // Search video projects
    projects
      .filter(p => 
        p.title?.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      )
      .forEach(p => filtered.push({
        type: 'video',
        id: p.id,
        title: p.title,
        subtitle: p.status,
        icon: Video,
        url: createPageUrl('VideoStudio'),
        color: 'from-[#FF4433] to-[#FF8C00]'
      }));

    // Search art
    art
      .filter(a => a.prompt?.toLowerCase().includes(searchTerm))
      .forEach(a => filtered.push({
        type: 'art',
        id: a.id,
        title: a.prompt,
        subtitle: a.style,
        icon: Sparkles,
        url: createPageUrl('ArtLab'),
        color: 'from-[#FF8C00] to-[#A89C94]'
      }));

    // Search documents
    docs
      .filter(d => 
        d.title?.toLowerCase().includes(searchTerm) ||
        d.extracted_text?.toLowerCase().includes(searchTerm)
      )
      .forEach(d => filtered.push({
        type: 'document',
        id: d.id,
        title: d.title,
        subtitle: d.file_type,
        icon: FileText,
        url: createPageUrl('ResearchHub'),
        color: 'from-[#A89C94] to-[#1E90FF]'
      }));

    // Search assets
    assets
      .filter(a => 
        a.title?.toLowerCase().includes(searchTerm) ||
        a.tags?.some(t => t.toLowerCase().includes(searchTerm))
      )
      .forEach(a => filtered.push({
        type: 'asset',
        id: a.id,
        title: a.title,
        subtitle: a.file_type,
        icon: ImageIcon,
        url: createPageUrl('Assets'),
        color: 'from-[#1E90FF] to-[#FF4433]'
      }));

    setResults(filtered.slice(0, 10));
  }, [query, projects, art, docs, assets]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111317] border-gray-800 rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Search Everything</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, art, documents, assets..."
            className="pl-10 bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-2 mt-4">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.url}
                  onClick={onClose}
                >
                  <div className="p-3 rounded-xl bg-[#0B0B0C] hover:bg-[#1a1a1f] transition-colors flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${result.color} flex items-center justify-center flex-shrink-0`}>
                      <result.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {result.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          {result.type}
                        </Badge>
                        <span className="text-gray-500 text-xs">
                          {result.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Start typing to search...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}