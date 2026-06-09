import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Database, AlertTriangle, CheckCircle2, TrendingUp, HardDrive, Trash2, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const API_BASE = "http://localhost:8787/api";

export default function StorageUsageWidget({ tenantId, showDetails = true }) {
  const { data: storageData, isLoading, refetch } = useQuery({
    queryKey: ["storageUsage", tenantId],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/tenant/${tenantId}/quota`);
        const data = await response.json();
        return {
          used_gb: data.storage_used_gb || 0,
          cap_gb: data.storage_limit_gb || 50,
          files_count: data.files_count || 0,
          last_updated: data.last_updated
        };
      } catch (error) {
        console.error("Storage fetch error:", error);
        return { used_gb: 0, cap_gb: 50, files_count: 0 };
      }
    },
    refetchInterval: 300000, // 5 minutes
    initialData: { used_gb: 0, cap_gb: 50, files_count: 0 }
  });

  const percentage = (storageData.used_gb / storageData.cap_gb) * 100;
  const remaining = Math.max(0, storageData.cap_gb - storageData.used_gb);

  const getStatusConfig = () => {
    if (percentage >= 95) return { 
      color: "text-red-400", 
      bg: "bg-red-500", 
      icon: AlertTriangle, 
      label: "Critical",
      message: "Storage almost full! Cleanup needed urgently."
    };
    if (percentage >= 85) return { 
      color: "text-orange-400", 
      bg: "bg-orange-500", 
      icon: TrendingUp, 
      label: "High",
      message: "Consider upgrading or cleaning up old files."
    };
    if (percentage >= 70) return { 
      color: "text-yellow-400", 
      bg: "bg-yellow-500", 
      icon: TrendingUp, 
      label: "Moderate",
      message: "Storage usage is moderate."
    };
    return { 
      color: "text-green-400", 
      bg: "bg-green-500", 
      icon: CheckCircle2, 
      label: "Healthy",
      message: "Plenty of storage available."
    };
  };

  const status = getStatusConfig();
  const Icon = status.icon;

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <HardDrive className={`w-4 h-4 ${status.color}`} />
        <span className="text-gray-300 text-sm">
          {storageData.used_gb.toFixed(2)} / {storageData.cap_gb}GB
        </span>
      </div>
    );
  }

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Storage Usage
          </CardTitle>
          <Badge className={`${status.bg}/20 ${status.color}`}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center gap-3">
          <Icon className={`w-8 h-8 ${status.color}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Used Storage</span>
              <span className={`font-bold ${status.color}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-gray-500">
                {storageData.used_gb.toFixed(2)}GB used
              </span>
              <span className={percentage >= 85 ? status.color : "text-gray-500"}>
                {remaining.toFixed(2)}GB free
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#0B0B0C] rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Total Capacity</p>
            <p className="text-white font-bold">{storageData.cap_gb}GB</p>
          </div>
          <div className="p-3 bg-[#0B0B0C] rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Files Count</p>
            <p className="text-white font-bold">{storageData.files_count?.toLocaleString() || '—'}</p>
          </div>
        </div>

        {storageData.last_updated && (
          <p className="text-gray-500 text-xs">
            Last updated: {new Date(storageData.last_updated).toLocaleString()}
          </p>
        )}

        {percentage >= 85 && (
          <div className={`p-3 ${status.bg}/10 border border-${status.bg === 'bg-red-500' ? 'red' : 'orange'}-500/30 rounded-lg`}>
            <p className={`${status.color} text-xs font-semibold mb-2`}>
              ⚠️ {status.message}
            </p>
            <div className="flex gap-2">
              <Link to={createPageUrl("Assets")} className="flex-1">
                <Button size="sm" variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cleanup Files
                </Button>
              </Link>
              <Link to={createPageUrl("Billing")} className="flex-1">
                <Button size="sm" className="w-full bg-[#FFD700] text-black hover:bg-[#FFC700]">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Storage
                </Button>
              </Link>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}