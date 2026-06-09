import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus, Trash2, Edit2, Check, X, Zap, AlertCircle, 
  Eye, EyeOff, Copy, CheckCircle2, Clock, Server
} from "lucide-react";
import { motion } from "framer-motion";

// Default tool registry - easily extensible
const DEFAULT_TOOLS = [
  {
    id: "anthropic",
    name: "Anthropic",
    category: "LLM",
    type: "provider",
    envVar: "ANTHROPIC_API_KEY",
    models: ["Claude Opus 4.5", "Claude Sonnet 4.5", "Claude Haiku 3.5"],
    status: "active",
    priority: 1,
    cost: "$$ (High quality)",
    fallbackOrder: 1
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "LLM",
    type: "provider",
    envVar: "OPENAI_API_KEY",
    models: ["GPT-4o", "GPT-4 Turbo", "o1-mini"],
    status: "active",
    priority: 2,
    cost: "$$$ (Premium)",
    fallbackOrder: 2
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    category: "LLM",
    type: "provider",
    envVar: "DEEPSEEK_API_KEY",
    models: ["V3.2", "R1"],
    status: "optional",
    priority: 3,
    cost: "$ (90% cheaper!)",
    fallbackOrder: 3
  },
  {
    id: "google_ai",
    name: "Google AI",
    category: "LLM",
    type: "provider",
    envVar: "GOOGLE_AI_KEY",
    models: ["Gemini 2.0 Flash", "Gemini 1.5 Pro"],
    status: "optional",
    priority: 4,
    cost: "$$ (Competitive)",
    fallbackOrder: 4
  },
  {
    id: "fal",
    name: "fal.ai",
    category: "Video/Image",
    type: "provider",
    envVar: "FAL_API_KEY",
    models: ["Veo 3", "Sora 2", "Kling", "Flux (600+ models)"],
    status: "optional",
    priority: 5,
    cost: "$$$ (Enterprise)",
    fallbackOrder: null
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "Audio",
    type: "provider",
    envVar: "ELEVENLABS_API_KEY",
    models: ["TTS", "Voice Cloning", "Multilingual"],
    status: "optional",
    priority: 6,
    cost: "$$ (Scalable)",
    fallbackOrder: null
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Business",
    type: "integration",
    envVar: "STRIPE_SECRET_KEY",
    models: ["Payments", "Billing", "Webhooks"],
    status: "optional",
    priority: 7,
    cost: "2.9% + $0.30",
    fallbackOrder: null
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    type: "integration",
    envVar: "HUBSPOT_API_KEY",
    models: ["Contacts", "Deals", "Automation"],
    status: "optional",
    priority: 8,
    cost: "$ (Free tier)",
    fallbackOrder: null
  }
];

export default function AGXToolRegistry() {
  const [tools, setTools] = useState(DEFAULT_TOOLS);
  const [editingId, setEditingId] = useState(null);
  const [newTool, setNewTool] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [showSecrets, setShowSecrets] = useState(false);

  // Get unique categories
  const categories = ["All", ...new Set(tools.map(t => t.category))];

  // Filter tools
  const filteredTools = filterCategory === "All" 
    ? tools 
    : tools.filter(t => t.category === filterCategory);

  // Add new tool
  const handleAddTool = (toolData) => {
    const tool = {
      ...toolData,
      id: toolData.id || `tool_${Date.now()}`,
      status: toolData.status || "optional"
    };
    setTools([...tools, tool]);
    setShowAddForm(false);
    setNewTool(null);
  };

  // Update tool
  const handleUpdateTool = (id, updates) => {
    setTools(tools.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingId(null);
  };

  // Delete tool
  const handleDeleteTool = (id) => {
    if (window.confirm(`Delete ${tools.find(t => t.id === id)?.name}?`)) {
      setTools(tools.filter(t => t.id !== id));
    }
  };

  // Copy env var
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Plug & Play Tool Registry</h3>
          <p className="text-sm text-gray-400">Add, configure, and manage API integrations</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={filterCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(cat)}
            className={filterCategory === cat 
              ? "bg-orange-500 hover:bg-orange-600" 
              : "border-gray-700 text-gray-400 hover:text-white"}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredTools.map((tool, idx) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-[#0B0B0C] border-gray-800 hover:border-gray-700 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{tool.name}</h4>
                      <Badge className={
                        tool.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }>
                        {tool.status === 'active' ? '● Active' : '○ Optional'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{tool.category} • {tool.type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(editingId === tool.id ? null : tool.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTool(tool.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Edit Mode */}
                {editingId === tool.id ? (
                  <ToolEditForm
                    tool={tool}
                    onSave={(updates) => handleUpdateTool(tool.id, updates)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    {/* Display Mode */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">API Key</span>
                        <div className="flex items-center gap-1">
                          <code className="text-xs text-cyan-400 font-mono bg-black/20 px-2 py-1 rounded">
                            {showSecrets ? tool.envVar : '••••••••••'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          >
                            {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(tool.envVar)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-1">Models</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.models.map((model, i) => (
                            <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Cost</span>
                        <span className="text-xs text-orange-400">{tool.cost}</span>
                      </div>

                      {tool.fallbackOrder && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Fallback Order</span>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            #{tool.fallbackOrder}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 p-2 bg-black/30 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Ready to use</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Tool Form */}
      {showAddForm && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400">Add New Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <AddToolForm
              onSubmit={handleAddTool}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Auto-Config Guide */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Auto-Detection & Failover
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm font-semibold mb-2">✓ Automatic Detection</p>
            <p className="text-gray-400 text-sm">
              AG-X scans your environment variables and auto-initializes any detected tools. No manual configuration needed.
            </p>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm font-semibold mb-2">✓ Smart Fallback Chain</p>
            <p className="text-gray-400 text-sm">
              If your primary LLM fails, AG-X automatically routes to the next provider in the fallback order. Zero downtime.
            </p>
          </div>

          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-purple-400 text-sm font-semibold mb-2">✓ Cost Optimization</p>
            <p className="text-gray-400 text-sm">
              Configure per-task cost thresholds. AG-X chooses the best model that meets your quality + cost requirements.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Example */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400">Environment Configuration Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black/50 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">
{`# .env.local - AG-X auto-detects all keys

# LLM Providers (in fallback order)
ANTHROPIC_API_KEY=sk-ant-xxxxx          # Primary
OPENAI_API_KEY=sk-xxxxx                 # Secondary
DEEPSEEK_API_KEY=sk-xxxxx               # Tertiary (cost-optimized)

# Video & Image Generation
FAL_API_KEY=xxxxx
RUNWAY_API_KEY=xxxxx

# Audio & Avatars
ELEVENLABS_API_KEY=xxxxx
HEYGEN_API_KEY=xxxxx

# Business Integrations
STRIPE_SECRET_KEY=sk_live_xxxxx
HUBSPOT_API_KEY=xxxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/xxxxx`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

// Edit Form Component
function ToolEditForm({ tool, onSave, onCancel }) {
  const [data, setData] = useState(tool);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Name</label>
        <Input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="bg-black/30 border-gray-700 text-white text-sm"
          placeholder="Tool name"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Environment Variable</label>
        <Input
          value={data.envVar}
          onChange={(e) => setData({ ...data, envVar: e.target.value })}
          className="bg-black/30 border-gray-700 text-white text-sm"
          placeholder="ENV_VAR_NAME"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Category</label>
          <Input
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            className="bg-black/30 border-gray-700 text-white text-sm"
            placeholder="LLM, Video, etc."
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Status</label>
          <select
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            className="w-full bg-black/30 border border-gray-700 text-white text-sm rounded px-2 py-1.5"
          >
            <option value="active">Active</option>
            <option value="optional">Optional</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onSave(data)}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
        >
          <Check className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          onClick={onCancel}
          size="sm"
          variant="outline"
          className="border-gray-700 text-gray-400 hover:text-white flex-1"
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Add Tool Form Component
function AddToolForm({ onSubmit, onCancel }) {
  const [data, setData] = useState({
    name: "",
    category: "",
    envVar: "",
    status: "optional",
    type: "provider"
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Tool Name *</label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="bg-black/30 border-gray-700 text-white"
            placeholder="e.g., Custom LLM"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Category *</label>
          <Input
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            className="bg-black/30 border-gray-700 text-white"
            placeholder="e.g., LLM"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Environment Variable *</label>
        <Input
          value={data.envVar}
          onChange={(e) => setData({ ...data, envVar: e.target.value })}
          className="bg-black/30 border-gray-700 text-white"
          placeholder="CUSTOM_API_KEY"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Type</label>
          <select
            value={data.type}
            onChange={(e) => setData({ ...data, type: e.target.value })}
            className="w-full bg-black/30 border border-gray-700 text-white text-sm rounded px-2 py-1.5"
          >
            <option value="provider">Provider</option>
            <option value="integration">Integration</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Status</label>
          <select
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            className="w-full bg-black/30 border border-gray-700 text-white text-sm rounded px-2 py-1.5"
          >
            <option value="optional">Optional</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onSubmit(data)}
          disabled={!data.name || !data.category || !data.envVar}
          className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white flex-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-gray-700 text-gray-400 hover:text-white"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}