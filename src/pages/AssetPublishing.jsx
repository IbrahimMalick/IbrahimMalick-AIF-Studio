import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AssetPublishingManager from "@/components/AssetPublishingManager";
import { Package, Zap, Tag, CheckCircle2 } from "lucide-react";

export default function AssetPublishing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">📦 Asset Publishing Pipeline</h1>
          <p className="text-gray-400">Automated approval & distribution workflow for creative assets</p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-6 h-6 text-cyan-400" />,
              title: "Auto-Publish on Approval",
              desc: "Assets published automatically when marked approved"
            },
            {
              icon: <Tag className="w-6 h-6 text-purple-400" />,
              title: "Smart Tagging",
              desc: "Auto-apply tags based on asset type & config rules"
            },
            {
              icon: <Package className="w-6 h-6 text-green-400" />,
              title: "Multi-Channel Distribution",
              desc: "Sync to library, marketplace, archive in one click"
            }
          ].map((feature, idx) => (
            <Card key={idx} className="bg-[#0B0B0C] border-gray-800">
              <CardContent className="p-6">
                <div className="mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Manager */}
        <AssetPublishingManager />

        {/* Workflow Diagram */}
        <Card className="bg-[#0B0B0C] border-gray-800">
          <CardHeader>
            <CardTitle className="text-cyan-400">Publishing Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div className="text-center flex-1">
                <Badge className="bg-yellow-500/20 text-yellow-400 mb-2 block">Pending</Badge>
                <p className="text-gray-400">Asset ready for review</p>
              </div>
              <div className="text-cyan-400 mx-4">→</div>
              <div className="text-center flex-1">
                <Badge className="bg-blue-500/20 text-blue-400 mb-2 block">Approved</Badge>
                <p className="text-gray-400">User approves asset</p>
              </div>
              <div className="text-cyan-400 mx-4">→</div>
              <div className="text-center flex-1">
                <Badge className="bg-green-500/20 text-green-400 mb-2 block">Published</Badge>
                <p className="text-gray-400">Auto-tagged & synced</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-slate-800/30 rounded border border-gray-800">
              <p className="text-sm text-gray-300 mb-2">
                <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-400" />
                Notifications sent to Slack on each stage
              </p>
              <p className="text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-400" />
                Audit logs track all publishing actions
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}