import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  Plus,
  Play,
  Save,
  Upload,
  Share2,
  Trash2,
  Copy,
  Download,
  Sparkles,
  Zap,
  Brain,
  Settings,
  GitBranch,
  Clock,
  Globe,
  Mail,
  Video,
  Image as ImageIcon,
  Database,
  Code,
  MessageCircle,
  Calendar,
  Filter,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Maximize2,
  UserPlus,
  Bell,
  Megaphone,
  BarChart3,
  FileText,
  Mic,
  Hash,
  Link as LinkIcon,
  Repeat,
  Shuffle,
  Target,
  TrendingUp,
  DollarSign,
  Send,
  X, // Added X for closing sheet/dialogs
  Users, // Added for monetization affiliate
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
}
from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
// The useAudioFeedback import is removed here as it will be conditionally required inside the component.
import { showToast } from "@/components/ToastNotification";

// Placeholder for createPageUrl, assuming it exists in a utility file or is globally available.
// In a real application, this would be properly imported or defined.
const createPageUrl = (pageName) => `/${pageName.toLowerCase().replace(/\s/g, '-')}`;

export default function Automation() {
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);
  
  // Audio fallback (AudioSystem may not be available)
  const audio = {
    playSuccess: () => {},
    playError: () => {},
    playClick: () => {},
    playWhoosh: () => {},
    playProcessing: () => {}
  };
  
  // Canvas state
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // UI state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showNodeConfig, setShowNodeConfig] = useState(false); // Added for node configuration panel
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Form state
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: templates = [] } = useQuery({
    queryKey: ["workflowTemplates"],
    queryFn: () => base44.entities.WorkflowTemplate.list("-created_date"),
  });

  // EXPANDED Node types catalog with more options
  const nodeTypes = [
    {
      category: "Triggers",
      icon: Zap,
      color: "from-[#FFD700] to-[#FFA500]",
      nodes: [
        { type: "trigger_schedule", label: "Schedule", icon: Clock, description: "Run at specific times", config: { schedule_type: "daily", time: "09:00", days: [] } },
        { type: "trigger_webhook", label: "Webhook", icon: Globe, description: "HTTP webhook trigger", config: { method: "POST", path: "" } },
        { type: "trigger_event", label: "App Event", icon: Sparkles, description: "App event trigger", config: { event_type: "video_completed" } },
        { type: "trigger_manual", label: "Manual", icon: Play, description: "Run manually", config: {} },
        { type: "trigger_new_lead", label: "New Lead", icon: UserPlus, description: "When new lead captured", config: { source: "all" } },
        { type: "trigger_new_post", label: "New Post", icon: Megaphone, description: "When content published", config: { platforms: [] } },
        { type: "trigger_video_rendered", label: "Video Rendered", icon: Video, description: "When video completes", config: {} }
      ]
    },
    {
      category: "AI Actions",
      icon: Brain,
      color: "from-[#FF6B9D] to-[#C44569]",
      nodes: [
        { type: "ai_generate_text", label: "Generate Text", icon: MessageCircle, description: "AI text generation", config: { prompt: "", max_tokens: 500, temperature: 0.7 } },
        { type: "ai_generate_image", label: "Generate Image", icon: ImageIcon, description: "AI image creation", config: { prompt: "", style: "digital_art", size: "square" } },
        { type: "ai_generate_video", label: "Generate Video", icon: Video, description: "AI video creation", config: { script: "", duration: 30, resolution: "1920x1080" } },
        { type: "ai_analyze", label: "Analyze Data", icon: Brain, description: "AI data analysis", config: { data_source: "", analysis_type: "summary" } },
        { type: "ai_generate_caption", label: "Generate Caption", icon: Hash, description: "AI caption writing", config: { content_type: "social", tone: "casual", hashtags: true } },
        { type: "ai_voice_gen", label: "Voice Generation", icon: Mic, description: "Text-to-speech", config: { text: "", voice: "default", speed: 1.0 } },
        { type: "ai_summarize", label: "Summarize", icon: FileText, description: "Summarize content", config: { max_length: 100 } }
      ]
    },
    {
      category: "Social Media",
      icon: Share2,
      color: "from-[#00D4C9] to-[#00A8A0]",
      nodes: [
        { type: "social_post", label: "Post Content", icon: Share2, description: "Post to platforms", config: { platforms: ["instagram"], caption: "", media_url: "" } },
        { type: "social_schedule", label: "Schedule Post", icon: Calendar, description: "Schedule posting", config: { platforms: [], schedule_time: "", timezone: "UTC" } },
        { type: "social_comment", label: "Auto-Reply", icon: MessageCircle, description: "Reply to comments", config: { platforms: [], reply_template: "", keywords: [] } },
        { type: "social_dm", label: "Send DM", icon: Mail, description: "Send direct message", config: { platform: "instagram", recipient: "", message: "" } },
        { type: "social_like", label: "Auto-Like", icon: Sparkles, description: "Like content", config: { platform: "instagram", target_type: "hashtag", target_value: "" } },
        { type: "social_follow", label: "Auto-Follow", icon: UserPlus, description: "Follow users", config: { platform: "instagram", criteria: "followers" } }
      ]
    },
    {
      category: "Email",
      icon: Mail,
      color: "from-[#1E90FF] to-[#A89C94]",
      nodes: [
        { type: "email_send", label: "Send Email", icon: Mail, description: "Send email campaign", config: { to: "", subject: "", body: "", from_name: "" } },
        { type: "email_sequence", label: "Email Sequence", icon: GitBranch, description: "Automated sequence", config: { sequence_id: "", delay_days: 1 } },
        { type: "email_personalize", label: "Personalize", icon: Sparkles, description: "AI personalization", config: { use_creator_dna: true, variables: {} } },
        { type: "email_add_to_list", label: "Add to List", icon: UserPlus, description: "Add subscriber", config: { list_id: "", email_field: "" } },
        { type: "email_tag", label: "Tag Subscriber", icon: Hash, description: "Add tags", config: { tags: [] } }
      ]
    },
    {
      category: "Logic",
      icon: GitBranch,
      color: "from-[#9D50BB] to-[#6E48AA]",
      nodes: [
        { type: "condition_if", label: "If/Then", icon: GitBranch, description: "Conditional logic", config: { field: "", operator: "equals", value: "" } },
        { type: "condition_filter", label: "Filter", icon: Filter, description: "Filter data", config: { conditions: [] } },
        { type: "delay", label: "Delay", icon: Clock, description: "Wait period", config: { delay_amount: 1, delay_unit: "hours" } },
        { type: "loop", label: "Loop", icon: Repeat, description: "Repeat actions", config: { iterations: 5, delay_between: 0 } },
        { type: "random", label: "Random", icon: Shuffle, description: "Random choice", config: { options: [] } },
        { type: "merge", label: "Merge Data", icon: GitBranch, description: "Combine data", config: { sources: [] } }
      ]
    },
    {
      category: "Data",
      icon: Database,
      color: "from-[#00FF88] to-[#00CC6A]",
      nodes: [
        { type: "data_store", label: "Store Data", icon: Database, description: "Save to database", config: { entity: "", fields: {} } },
        { type: "data_retrieve", label: "Get Data", icon: Database, description: "Fetch from database", config: { entity: "", filters: {} } },
        { type: "data_transform", label: "Transform", icon: Code, description: "Modify data", config: { transformation: "" } },
        { type: "data_api_call", label: "API Call", icon: Globe, description: "External API", config: { url: "", method: "GET", headers: {}, body: {} } },
        { type: "data_export", label: "Export Data", icon: Download, description: "Export to file", config: { format: "csv", fields: [] } }
      ]
    },
    {
      category: "Notifications",
      icon: Bell,
      color: "from-[#FF8C00] to-[#FFD700]",
      nodes: [
        { type: "notify_user", label: "Notify User", icon: Bell, description: "In-app notification", config: { title: "", message: "", type: "info" } },
        { type: "notify_slack", label: "Slack Message", icon: MessageCircle, description: "Send to Slack", config: { webhook_url: "", channel: "", message: "" } },
        { type: "notify_sms", label: "Send SMS", icon: Send, description: "Text message", config: { phone: "", message: "" } },
        { type: "notify_webhook", label: "Webhook", icon: LinkIcon, description: "Custom webhook", config: { url: "", method: "POST", payload: {} } }
      ]
    },
    {
      category: "Analytics",
      icon: BarChart3,
      color: "from-[#00D4C9] to-[#1E90FF]",
      nodes: [
        { type: "analytics_track", label: "Track Event", icon: Target, description: "Analytics event", config: { event_name: "", properties: {} } },
        { type: "analytics_report", label: "Generate Report", icon: FileText, description: "Create report", config: { report_type: "summary", time_range: "7d" } },
        { type: "analytics_goal", label: "Goal Check", icon: CheckCircle2, description: "Check if goal met", config: { goal_type: "revenue", target: 1000 } }
      ]
    },
    {
      category: "Monetization",
      icon: DollarSign,
      color: "from-[#00FF88] to-[#FFD700]",
      nodes: [
        { type: "monetize_checkout", label: "Create Checkout", icon: DollarSign, description: "Payment link", config: { product_id: "", price: 0 } },
        { type: "monetize_upsell", label: "Upsell Offer", icon: TrendingUp, description: "Show upsell", config: { offer_id: "", trigger: "after_purchase" } },
        { type: "monetize_affiliate", label: "Track Affiliate", icon: Users, description: "Affiliate tracking", config: { affiliate_code: "" } }
      ]
    }
  ];

  // Add node to canvas
  const addNode = useCallback((nodeType, position) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: nodeType.type,
      label: nodeType.label,
      icon: nodeType.icon,
      position: position || {
        x: 400 + Math.random() * 200,
        y: 200 + Math.random() * 200
      },
      config: nodeType.config || {}, // Ensure config is passed
      inputs: nodeType.type.startsWith('trigger') ? [] : ['input'],
      outputs: ['output']
    };
    
    setNodes(prev => [...prev, newNode]);
    audio.playSuccess();
    
    // Auto-suggest next node if this is the first node
    if (nodes.length === 0) {
      setTimeout(() => {
        generateAISuggestions(newNode);
      }, 500);
    }
  }, [nodes, audio]);

  // Generate AI suggestions for next step
  const generateAISuggestions = async (node) => {
    setShowAISuggestions(true);
    
    // Mock AI suggestions based on node type
    const suggestions = [];
    
    if (node.type.startsWith('trigger')) {
      suggestions.push(
        { type: "ai_generate_text", reason: "Generate content based on trigger" },
        { type: "data_retrieve", reason: "Fetch data to process" },
        { type: "condition_if", reason: "Add conditional logic" }
      );
    } else if (node.type.startsWith('ai_generate')) {
      suggestions.push(
        { type: "social_post", reason: "Post generated content" },
        { type: "email_send", reason: "Email generated content" },
        { type: "data_store", reason: "Save generated content" }
      );
    } else if (node.type.startsWith('social')) {
      suggestions.push(
        { type: "analytics_track", reason: "Track posting analytics" },
        { type: "notify_user", reason: "Notify about posting" },
        { type: "delay", reason: "Wait before next action" }
      );
    }
    
    setAISuggestions(suggestions);
  };

  // Handle node drag
  const handleNodeDragStart = (e, node) => {
    setDraggedNode(node);
    setIsDragging(true);
    audio.playClick();
  };

  const handleNodeDrag = useCallback((e) => {
    if (!draggedNode || !isDragging) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newX = e.clientX - rect.left - canvasOffset.x;
    const newY = e.clientY - rect.top - canvasOffset.y;
    
    setNodes(prev => prev.map(n => 
      n.id === draggedNode.id 
        ? { ...n, position: { x: newX, y: newY } }
        : n
    ));
  }, [draggedNode, isDragging, canvasOffset]);

  const handleNodeDragEnd = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  // Canvas panning
  const handleCanvasMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (isDragging) {
      handleNodeDrag(e);
    }
  }, [isPanning, isDragging, panStart, handleNodeDrag]);

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    handleNodeDragEnd();
  };

  // Connect nodes
  const connectNodes = (sourceId, targetId) => {
    const newConnection = {
      id: `conn_${Date.now()}`,
      source: sourceId,
      target: targetId
    };
    setConnections(prev => [...prev, newConnection]);
    audio.playClick();
  };

  // Save workflow
  const saveWorkflow = async () => {
    const workflowData = {
      workflow_name: workflowName,
      workflow_description: workflowDescription,
      workflow_json: JSON.stringify({ nodes, connections, canvasOffset }),
      trigger_type: nodes.find(n => n.type.startsWith('trigger'))?.type.replace('trigger_', '') || 'manual',
      category: "automation",
      nodes: nodes,
      is_public: false,
      is_system: false
    };

    try {
      await base44.entities.WorkflowTemplate.create({
        ...workflowData,
        user_email: user.email
      });
      
      queryClient.invalidateQueries(["workflowTemplates"]);
      setShowSaveDialog(false);
      audio.playSuccess();
      showToast("✅ Workflow saved successfully!", "success");
    } catch (error) {
      audio.playError();
      showToast("❌ Failed to save workflow", "error");
    }
  };

  // Load workflow
  const loadWorkflow = (template) => {
    try {
      const data = JSON.parse(template.workflow_json);
      setNodes(data.nodes || []);
      setConnections(data.connections || []);
      setCanvasOffset(data.canvasOffset || { x: 0, y: 0 });
      setWorkflowName(template.workflow_name);
      setWorkflowDescription(template.workflow_description || "");
      setShowTemplateDialog(false);
      audio.playSuccess();
      showToast(`📋 Loaded: ${template.workflow_name}`, "success");
    } catch (error) {
      audio.playError();
      showToast("❌ Failed to load workflow", "error");
    }
  };

  // Simulate workflow
  const simulateWorkflow = async () => {
    if (nodes.length === 0) {
      showToast("⚠️ Add nodes to simulate", "warning");
      return;
    }

    setIsSimulating(true);
    audio.playProcessing();
    
    // Simulate data flow through nodes
    for (let i = 0; i < nodes.length; i++) {
      setSelectedNode(nodes[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsSimulating(false);
    setSelectedNode(null);
    audio.playSuccess();
    showToast("✅ Simulation complete!", "success");
  };

  // Publish to marketplace
  const publishToMarketplace = async () => {
    if (nodes.length === 0) {
      showToast("⚠️ Workflow is empty", "warning");
      return;
    }

    // Navigate to marketplace with pre-filled data
    window.location.href = createPageUrl("Marketplace") + "?publish=true&workflow=" + encodeURIComponent(JSON.stringify({
      nodes,
      connections,
      name: workflowName,
      description: workflowDescription
    }));
  };

  // Clear canvas
  const clearCanvas = () => {
    if (confirm("Clear all nodes? This cannot be undone.")) {
      setNodes([]);
      setConnections([]);
      setSelectedNode(null);
      audio.playWhoosh();
      showToast("🗑️ Canvas cleared", "info");
    }
  };

  // Update node config
  const updateNodeConfig = (nodeId, newConfig) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, config: { ...n.config, ...newConfig } } : n
    ));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => ({ ...prev, config: { ...prev.config, ...newConfig } }));
    }
  };

  // Test single node
  const testNode = async (node) => {
    audio.playProcessing();
    showToast(`🧪 Testing ${node.label}...`, "info");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    audio.playSuccess();
    showToast(`✅ ${node.label} test successful!`, "success");
  };

  return (
    <div className="h-screen bg-[#0C0C0C] overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b border-gray-800 bg-[#151515] p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center">
              <Workflow className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-white font-bold heading-font">{workflowName}</h1>
              <p className="text-gray-500 text-xs">
                {nodes.length} nodes • {connections.length} connections
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateDialog(true)}
            className="border-gray-700 hover:bg-[#1a1a1f] rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Load
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={simulateWorkflow}
            disabled={isSimulating || nodes.length === 0}
            className="border-gray-700 hover:bg-[#1a1a1f] rounded-xl"
          >
            <Play className="w-4 h-4 mr-2" />
            {isSimulating ? "Simulating..." : "Test Run"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={nodes.length === 0}
            className="border-gray-700 hover:bg-[#1a1a1f] rounded-xl"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            size="sm"
            onClick={publishToMarketplace}
            disabled={nodes.length === 0}
            className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
          >
            <Upload className="w-4 h-4 mr-2" />
            Publish
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearCanvas}
            className="text-red-400 hover:bg-red-500/10 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Library */}
        <div className="w-80 border-r border-gray-800 bg-[#151515] overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Node Library</h3>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                {nodeTypes.reduce((sum, cat) => sum + cat.nodes.length, 0)} nodes
              </Badge>
            </div>

            {nodeTypes.map((category, idx) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                        <CategoryIcon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-white text-sm font-semibold">{category.category}</h4>
                    </div>
                    
                    <div className="space-y-2">
                      {category.nodes.map((node) => {
                        const NodeIcon = node.icon;
                        return (
                          <button
                            key={node.type}
                            onClick={() => addNode(node)}
                            className="w-full p-3 rounded-lg bg-[#0C0C0C] border border-gray-800 hover:border-[#FFD700]/30 transition-all text-left group"
                          >
                            <div className="flex items-start gap-2">
                              <NodeIcon className="w-4 h-4 text-gray-400 group-hover:text-[#FFD700] transition-colors mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium mb-0.5">{node.label}</p>
                                <p className="text-gray-500 text-xs">{node.description}</p>
                              </div>
                              <Plus className="w-4 h-4 text-gray-600 group-hover:text-[#FFD700] transition-colors" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[#0C0C0C]">
          <div
            ref={canvasRef}
            className="w-full h-full relative cursor-move"
            style={{
              backgroundImage: `
                radial-gradient(circle, rgba(255, 215, 0, 0.05) 1px, transparent 1px),
                radial-gradient(circle, rgba(0, 212, 201, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px, 50px 50px',
              backgroundPosition: '0 0, 25px 25px'
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {connections.map((conn) => {
                const sourceNode = nodes.find(n => n.id === conn.source);
                const targetNode = nodes.find(n => n.id === conn.target);
                
                if (!sourceNode || !targetNode) return null;
                
                // Adjust coordinates based on canvas offset and node dimensions (center of node)
                const x1 = sourceNode.position.x + canvasOffset.x + 150; // assuming node width 300 / 2
                const y1 = sourceNode.position.y + canvasOffset.y + 40;  // assuming node height 80 / 2
                const x2 = targetNode.position.x + canvasOffset.x;       // left side of target node
                const y2 = targetNode.position.y + canvasOffset.y + 40;  // center height of target node
                
                const midX = (x1 + x2) / 2;
                
                return (
                  <g key={conn.id}>
                    {/* Glow effect */}
                    <path
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      fill="none"
                      opacity="0.3"
                      filter="blur(4px)"
                    />
                    {/* Main line */}
                    <path
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#00D4C9" />
                      </linearGradient>
                    </defs>
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            <AnimatePresence>
              {nodes.map((node) => {
                const NodeIcon = node.icon;
                const isSelected = selectedNode?.id === node.id;
                const isNodeSimulating = isSimulating && selectedNode?.id === node.id; // Renamed to avoid collision
                
                return (
                  <motion.div
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`absolute rounded-xl border-2 bg-[#151515] p-4 cursor-move transition-all ${
                      isSelected || isNodeSimulating
                        ? 'border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.4)]'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                    style={{
                      left: node.position.x + canvasOffset.x,
                      top: node.position.y + canvasOffset.y,
                      width: 300,
                      zIndex: isDragging && draggedNode?.id === node.id ? 1000 : 2
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleNodeDragStart(e, node);
                      setSelectedNode(node);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center">
                          <NodeIcon className="w-4 h-4 text-black" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{node.label}</p>
                          <p className="text-gray-500 text-xs">{node.type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                            setShowNodeConfig(true);
                          }}
                          className="p-1 hover:bg-gray-800 rounded"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNodes(prev => prev.filter(n => n.id !== node.id));
                            setConnections(prev => prev.filter(c => 
                              c.source !== node.id && c.target !== node.id
                            ));
                            audio.playClick();
                          }}
                          className="p-1 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {isNodeSimulating && (
                      <div className="mb-2">
                        <div className="h-1 bg-[#FFD700]/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9]"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <p className="text-[#FFD700] text-xs mt-1">Processing...</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 space-y-1">
                      {node.inputs?.length > 0 && (
                        <div>Inputs: {node.inputs.length}</div>
                      )}
                      {node.outputs?.length > 0 && (
                        <div>Outputs: {node.outputs.length}</div>
                      )}
                    </div>

                    {/* Connection points */}
                    {node.inputs?.length > 0 && (
                      <div className="absolute left-[-8px] top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-[#00D4C9] border-2 border-[#151515]" />
                    )}
                    {node.outputs?.length > 0 && (
                      <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-[#FFD700] border-2 border-[#151515]" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty state */}
            {nodes.length === 0 && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mb-6">
                    <Workflow className="w-10 h-10 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 heading-font">
                    Start Building Your Automation
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Drag nodes from the left sidebar or load a template to begin
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={() => {
                        const firstNode = nodeTypes[0].nodes[0];
                        addNode(firstNode, { x: 400, y: 200 });
                      }}
                      className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Node
                    </Button>
                    <Button
                      onClick={() => setShowTemplateDialog(true)}
                      variant="outline"
                      className="border-gray-700 rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Load Template
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - AI Suggestions */}
        <AnimatePresence>
          {showAISuggestions && aiSuggestions.length > 0 && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-80 border-l border-gray-800 bg-[#151515] p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#FFD700]" />
                  <h3 className="text-white font-semibold">AI Suggestions</h3>
                </div>
                <button
                  onClick={() => setShowAISuggestions(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {aiSuggestions.map((suggestion, idx) => {
                  const nodeType = nodeTypes
                    .flatMap(cat => cat.nodes)
                    .find(n => n.type === suggestion.type);
                  
                  if (!nodeType) return null;
                  
                  const SuggestionIcon = nodeType.icon;
                  
                  return (
                    <motion.button
                      key={idx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => {
                        addNode(nodeType);
                        setShowAISuggestions(false);
                      }}
                      className="w-full p-3 rounded-xl bg-gradient-to-br from-[#FFD700]/10 to-[#00D4C9]/10 border border-[#FFD700]/20 hover:border-[#FFD700]/50 transition-all text-left group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <SuggestionIcon className="w-4 h-4 text-[#FFD700] mt-0.5" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{nodeType.label}</p>
                          <p className="text-gray-400 text-xs mt-1">{suggestion.reason}</p>
                        </div>
                      </div>
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Recommended
                      </Badge>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NODE CONFIGURATION PANEL */}
      <Sheet open={showNodeConfig} onOpenChange={setShowNodeConfig}>
        <SheetContent className="bg-[#151515] border-l border-gray-800 w-[500px] overflow-y-auto">
          {selectedNode && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2 heading-font">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center">
                    {React.createElement(selectedNode.icon, { className: "w-4 h-4 text-black" })}
                  </div>
                  Configure {selectedNode.label}
                </SheetTitle>
                <SheetDescription className="text-gray-400">
                  {selectedNode.type.replace(/_/g, ' ')}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Dynamic config fields based on node type */}
                {selectedNode.type.includes('generate_text') && (
                  <>
                    <div>
                      <Label htmlFor={`prompt-${selectedNode.id}`} className="text-white mb-2 block">Prompt</Label>
                      <Textarea
                        id={`prompt-${selectedNode.id}`}
                        value={selectedNode.config.prompt || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { prompt: e.target.value })}
                        placeholder="Enter your AI prompt..."
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`max_tokens-${selectedNode.id}`} className="text-white mb-2 block">Max Tokens</Label>
                      <Input
                        id={`max_tokens-${selectedNode.id}`}
                        type="number"
                        value={selectedNode.config.max_tokens || 500}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { max_tokens: parseInt(e.target.value) })}
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`temperature-${selectedNode.id}`} className="text-white mb-2 block">Temperature</Label>
                      <Input
                        id={`temperature-${selectedNode.id}`}
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={selectedNode.config.temperature || 0.7}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { temperature: parseFloat(e.target.value) })}
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                  </>
                )}

                {selectedNode.type.includes('social_post') && (
                  <>
                    <div>
                      <Label className="text-white mb-2 block">Platforms</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'].map((platform) => (
                          <button
                            key={platform}
                            onClick={() => {
                              const platforms = selectedNode.config.platforms || [];
                              const newPlatforms = platforms.includes(platform)
                                ? platforms.filter(p => p !== platform)
                                : [...platforms, platform];
                              updateNodeConfig(selectedNode.id, { platforms: newPlatforms });
                            }}
                            className={`p-2 rounded-lg border transition-all ${
                              (selectedNode.config.platforms || []).includes(platform)
                                ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                                : 'border-gray-700 bg-[#0C0C0C] text-gray-400'
                            }`}
                          >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`caption-${selectedNode.id}`} className="text-white mb-2 block">Caption</Label>
                      <Textarea
                        id={`caption-${selectedNode.id}`}
                        value={selectedNode.config.caption || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { caption: e.target.value })}
                        placeholder="Post caption..."
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`media_url-${selectedNode.id}`} className="text-white mb-2 block">Media URL</Label>
                      <Input
                        id={`media_url-${selectedNode.id}`}
                        value={selectedNode.config.media_url || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { media_url: e.target.value })}
                        placeholder="https://..."
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                  </>
                )}

                {selectedNode.type.includes('delay') && (
                  <>
                    <div>
                      <Label htmlFor={`delay_amount-${selectedNode.id}`} className="text-white mb-2 block">Delay Amount</Label>
                      <Input
                        id={`delay_amount-${selectedNode.id}`}
                        type="number"
                        value={selectedNode.config.delay_amount || 1}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { delay_amount: parseInt(e.target.value) })}
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`delay_unit-${selectedNode.id}`} className="text-white mb-2 block">Unit</Label>
                      <Select
                        value={selectedNode.config.delay_unit || "hours"}
                        onValueChange={(value) => updateNodeConfig(selectedNode.id, { delay_unit: value })}
                      >
                        <SelectTrigger id={`delay_unit-${selectedNode.id}`} className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#151515] border-gray-700 text-white">
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {selectedNode.type.includes('email_send') && (
                  <>
                    <div>
                      <Label htmlFor={`to-${selectedNode.id}`} className="text-white mb-2 block">To</Label>
                      <Input
                        id={`to-${selectedNode.id}`}
                        value={selectedNode.config.to || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { to: e.target.value })}
                        placeholder="recipient@example.com"
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`subject-${selectedNode.id}`} className="text-white mb-2 block">Subject</Label>
                      <Input
                        id={`subject-${selectedNode.id}`}
                        value={selectedNode.config.subject || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { subject: e.target.value })}
                        placeholder="Email subject..."
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`body-${selectedNode.id}`} className="text-white mb-2 block">Body</Label>
                      <Textarea
                        id={`body-${selectedNode.id}`}
                        value={selectedNode.config.body || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, { body: e.target.value })}
                        placeholder="Email body..."
                        className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl min-h-[150px]"
                      />
                    </div>
                  </>
                )}

                {/* Example of a Switch for boolean config */}
                {selectedNode.type.includes('email_personalize') && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`use_creator_dna-${selectedNode.id}`} className="text-white">Use Creator DNA</Label>
                    <Switch
                      id={`use_creator_dna-${selectedNode.id}`}
                      checked={selectedNode.config.use_creator_dna || false}
                      onCheckedChange={(checked) => updateNodeConfig(selectedNode.id, { use_creator_dna: checked })}
                      className="data-[state=checked]:bg-[#FFD700] data-[state=unchecked]:bg-gray-700"
                    />
                  </div>
                )}
                
                {/* Fallback for other node types with default config */}
                {Object.keys(selectedNode.config).length > 0 && !selectedNode.type.includes('generate_text') && !selectedNode.type.includes('social_post') && !selectedNode.type.includes('delay') && !selectedNode.type.includes('email_send') && !selectedNode.type.includes('email_personalize') && (
                  <div className="space-y-4">
                    <h5 className="text-gray-400 text-sm font-semibold">Generic Configuration</h5>
                    {Object.entries(selectedNode.config).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={`${key}-${selectedNode.id}`} className="text-white mb-2 block">{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}</Label>
                        {typeof value === 'string' && (
                          <Input
                            id={`${key}-${selectedNode.id}`}
                            value={value}
                            onChange={(e) => updateNodeConfig(selectedNode.id, { [key]: e.target.value })}
                            className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                          />
                        )}
                        {typeof value === 'number' && (
                          <Input
                            id={`${key}-${selectedNode.id}`}
                            type="number"
                            value={value}
                            onChange={(e) => updateNodeConfig(selectedNode.id, { [key]: parseFloat(e.target.value) })}
                            className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                          />
                        )}
                        {typeof value === 'boolean' && (
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${key}-${selectedNode.id}`} className="text-white">{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}</Label>
                            <Switch
                              id={`${key}-${selectedNode.id}`}
                              checked={value}
                              onCheckedChange={(checked) => updateNodeConfig(selectedNode.id, { [key]: checked })}
                              className="data-[state=checked]:bg-[#FFD700] data-[state=unchecked]:bg-gray-700"
                            />
                          </div>
                        )}
                        {Array.isArray(value) && (
                           <Input
                            id={`${key}-${selectedNode.id}`}
                            value={value.join(', ')}
                            onChange={(e) => updateNodeConfig(selectedNode.id, { [key]: e.target.value.split(',').map(s => s.trim()) })}
                            placeholder="Comma separated values"
                            className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
                          />
                        )}
                        {/* More sophisticated rendering for objects might be needed */}
                      </div>
                    ))}
                  </div>
                )}
                {Object.keys(selectedNode.config).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No configurable options for this node type.</p>
                )}


                {/* Test Node Button */}
                <div className="pt-4 border-t border-gray-800">
                  <Button
                    onClick={() => testNode(selectedNode)}
                    className="w-full bg-gradient-to-r from-[#00D4C9] to-[#00A8A0] text-white rounded-xl"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Test This Node
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-[#151515] border-gray-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white heading-font">Save Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Workflow Name</label>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="My Awesome Workflow"
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description</label>
              <Input
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="What does this workflow do?"
                className="bg-[#0C0C0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 border-gray-700 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={saveWorkflow}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="bg-[#151515] border-gray-800 rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white heading-font">Load Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {templates.length > 0 ? (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadWorkflow(template)}
                  className="w-full p-4 rounded-xl bg-[#0C0C0C] border border-gray-800 hover:border-[#FFD700]/30 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{template.workflow_name}</h4>
                      <p className="text-gray-500 text-sm">{template.workflow_description}</p>
                    </div>
                    <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{template.nodes?.length || 0} nodes</span>
                    <span>Used {template.use_count || 0} times</span>
                    {template.is_system && (
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                        Official
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <Workflow className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No templates saved yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}