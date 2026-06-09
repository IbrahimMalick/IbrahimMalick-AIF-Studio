import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  Zap,
  Plus,
  Save,
  Play,
  CheckCircle2,
  Trash2,
  Settings,
  ArrowRight,
  Clock,
  Database,
  Send,
  GitBranch,
  Download,
  Upload,
  Copy,
  Code,
  RefreshCw,
  AlertTriangle,
  PlayCircle,
  Bug
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";

const API_BASE = "http://localhost:8787/api";

const NODE_PALETTE = [
  { id: "trigger.webhook", label: "Webhook Trigger", icon: Zap, color: "from-blue-500 to-blue-600", category: "trigger" },
  { id: "trigger.schedule", label: "Schedule Trigger", icon: Clock, color: "from-purple-500 to-purple-600", category: "trigger" },
  { id: "action.http", label: "HTTP Request", icon: Send, color: "from-green-500 to-green-600", category: "action" },
  { id: "action.ghlLead", label: "GHL: Create Lead", icon: Database, color: "from-orange-500 to-orange-600", category: "action" },
  { id: "action.metaPost", label: "Meta: Create Post", icon: Send, color: "from-pink-500 to-pink-600", category: "action" },
  { id: "action.wait", label: "Wait / Delay", icon: Clock, color: "from-gray-500 to-gray-600", category: "action" },
  { id: "action.branch", label: "If / Else Branch", icon: GitBranch, color: "from-yellow-500 to-yellow-600", category: "action" },
  { id: "action.stripeEvent", label: "Stripe: On Event", icon: Database, color: "from-indigo-500 to-indigo-600", category: "trigger" }
];

// Add helper to show schema hints
const getSchemaHintForType = (type) => {
  const hints = {
    "action.http": "{ url: 'https://...', method: 'POST', headers?: {}, body?: {}, timeoutMs?: 30000 }",
    "action.wait": "{ ms: 5000 }",
    "action.branch": "{ if: 'trigger.amount', op: '>', value: 100 }",
    "action.metaPost": "{ igUserId: '...', caption: '...', imageUrl: '...' }", // Corresponds to meta.ig.post.create from old SCHEMA_HINTS
    "action.ghlLead": "{ map: { name: '...', email: '...', phone?: '...' } }", // Corresponds to ghl.contact.upsert from old SCHEMA_HINTS
    "ghl.opportunity.create": "{ pipelineId: '...', stageId: '...', contactId: '{{s1.contactId}}' }",
    "stripe.invoice.create": "{ customerId: '...', description: '...', amountCents: 1000 }",
  };
  return hints[type];
};

// Template rendering function for preview
function renderTemplate(obj, ctx = {}) {
  try {
    const json = JSON.stringify(obj);
    const out = json.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key) => {
      const path = key.trim().split(".");
      let cur = ctx;
      for (const p of path) cur = cur?.[p];
      return cur == null ? "" : String(cur);
    });
    return JSON.parse(out);
  } catch (e) {
    return obj;
  }
}

export default function WorkflowDesigner() {
  const [user, setUser] = useState(null);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [canvasNodes, setCanvasNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configJson, setConfigJson] = useState("{}");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState("");
  // New state for selected workflow, as required by the outline's testRunWorkflow
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);


  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Update config JSON when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setConfigJson(JSON.stringify(selectedNode.config || {}, null, 2));
    } else {
      setConfigJson("{}");
    }
  }, [selectedNode]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    if (result.source.droppableId === "palette" && result.destination.droppableId === "canvas") {
      const nodeType = NODE_PALETTE.find(n => n.id === result.draggableId); // Changed from NODE_PALETTE[result.source.index] to find by id
      if (!nodeType) return;
      
      const newNode = {
        id: `node_${Date.now()}`,
        type: nodeType.id,
        label: nodeType.label,
        icon: nodeType.icon,
        color: nodeType.color,
        config: {},
        retry: { // Added retry configuration
          enabled: true,
          max_attempts: 3,
          delay_seconds: 5,
          backoff_multiplier: 2
        },
        position: canvasNodes.length
      };
      setCanvasNodes([...canvasNodes, newNode]);
    } else if (result.source.droppableId === "canvas" && result.destination.droppableId === "canvas") {
      const reordered = Array.from(canvasNodes);
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, moved);
      setCanvasNodes(reordered.map((n, idx) => ({ ...n, position: idx })));
    }
  };

  const removeNode = (nodeId) => {
    setCanvasNodes(canvasNodes.filter(n => n.id !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  const updateConfigFromJson = () => {
    try {
      const parsed = JSON.parse(configJson);
      if (selectedNode) {
        setCanvasNodes(canvasNodes.map(n => 
          n.id === selectedNode.id ? { ...n, config: parsed } : n
        ));
        setSelectedNode({ ...selectedNode, config: parsed });
      }
    } catch (e) {
      setSaveMessage("❌ Invalid JSON in config editor");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const updateRetrySettings = (field, value) => {
    if (!selectedNode) return;
    
    // Ensure numeric fields are parsed correctly, 'enabled' is boolean
    const parsedValue = field === 'enabled' ? value : Number(value);

    const updatedRetry = {
      ...selectedNode.retry,
      [field]: parsedValue
    };
    
    const updatedNode = { ...selectedNode, retry: updatedRetry };
    setCanvasNodes(canvasNodes.map(n => 
      n.id === selectedNode.id ? updatedNode : n
    ));
    setSelectedNode(updatedNode); // Also update the selectedNode state
  };

  const exportWorkflow = () => {
    const workflow = {
      name: workflowName,
      trigger: canvasNodes.find(n => n.type.startsWith('trigger')) || {},
      steps: canvasNodes.filter(n => n.type.startsWith('action')).map(n => ({
        id: n.id,
        type: n.type,
        config: n.config,
        retry: n.retry // Include retry settings in export
      })),
      is_enabled: false
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSaveMessage("✅ Workflow exported!");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const importWorkflow = async () => {
    try {
      const parsed = JSON.parse(importJson);
      setWorkflowName(parsed.name || "Imported Workflow");
      
      const nodes = [];
      if (parsed.trigger) {
        const triggerType = NODE_PALETTE.find(n => n.id === parsed.trigger.type);
        if (triggerType) {
          nodes.push({
            id: `node_${Date.now()}_trigger`,
            type: triggerType.id,
            label: triggerType.label,
            icon: triggerType.icon,
            color: triggerType.color,
            config: parsed.trigger.config || {},
            position: 0,
            retry: parsed.trigger.retry // Import retry settings
          });
        }
      }
      
      if (parsed.steps) {
        parsed.steps.forEach((step, idx) => {
          const nodeType = NODE_PALETTE.find(n => n.id === step.type);
          if (nodeType) {
            nodes.push({
              id: step.id || `node_${Date.now()}_${idx}`,
              type: nodeType.id,
              label: nodeType.label,
              icon: nodeType.icon,
              color: nodeType.color,
              config: step.config || {},
              position: idx + 1,
              retry: step.retry || { enabled: true, max_attempts: 3, delay_seconds: 5, backoff_multiplier: 2 } // Default retry if not present
            });
          }
        });
      }
      
      setCanvasNodes(nodes);
      setShowImportModal(false);
      setImportJson("");
      setSaveMessage("✅ Workflow imported!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) {
      setSaveMessage("❌ Invalid workflow JSON");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const duplicateWorkflow = async () => {
    const newName = prompt("New workflow name:", `${workflowName} (Copy)`);
    if (!newName) return;
    
    await saveWorkflow(newName, false);
  };

  const validateWorkflow = async () => {
    setValidationErrors([]);
    try {
      const response = await fetch(`${API_BASE}/workflows/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          trigger: canvasNodes.find(n => n.type.startsWith('trigger')) || {},
          steps: canvasNodes.filter(n => n.type.startsWith('action')).map(n => ({
            id: n.id,
            type: n.type,
            config: n.config,
            retry: n.retry
          }))
        })
      });
      const data = await response.json();
      if (data.ok) {
        setSaveMessage("✅ Workflow validated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        // Handle Zod validation errors
        if (data.issues && Array.isArray(data.issues)) {
          setValidationErrors(data.issues);
          setSaveMessage("❌ Validation failed - check errors below");
        } else {
          setSaveMessage("❌ Validation failed: " + (data.error || "Unknown error"));
        }
      }
    } catch (error) {
      setSaveMessage("❌ Validation failed: " + error.message);
    }
  };

  const saveWorkflow = async (name = workflowName, showMsg = true) => {
    setIsSaving(true);
    setValidationErrors([]);
    try {
      const workflowData = {
        name: name,
        trigger: canvasNodes.find(n => n.type.startsWith('trigger')) || {},
        steps: canvasNodes.filter(n => n.type.startsWith('action')).map(n => ({
          id: n.id,
          type: n.type,
          config: n.config,
          retry: n.retry || { enabled: true, max_attempts: 3, delay_seconds: 5, backoff_multiplier: 2 } // Include retry
        })),
        is_enabled: false
      };

      const response = await fetch(`${API_BASE}/workflows/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflowData)
      });
      const data = await response.json();
      if (data.ok) {
        setCurrentWorkflowId(data.id);
        // Also update selectedWorkflow to be the newly saved workflow
        setSelectedWorkflow({
          id: data.id,
          name: name,
          trigger: workflowData.trigger,
          nodes: workflowData.steps, // Outline uses 'nodes' for steps
          is_enabled: workflowData.is_enabled
        });

        if (showMsg) {
          setSaveMessage("✅ Workflow saved as draft!");
          setTimeout(() => setSaveMessage(""), 3000);
        }
      } else {
        // Handle Zod validation errors
        if (data.issues && Array.isArray(data.issues)) {
          setValidationErrors(data.issues);
          setSaveMessage("❌ Save failed - check errors below");
        } else {
          setSaveMessage("❌ Save failed: " + (data.error || "Unknown error"));
        }
      }
    } catch (error) {
      setSaveMessage("❌ Save failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const publishWorkflow = async () => {
    setIsSaving(true);
    try {
      const workflowData = {
        name: workflowName,
        trigger: canvasNodes.find(n => n.type.startsWith('trigger')) || {},
        steps: canvasNodes.filter(n => n.type.startsWith('action')).map(n => ({
          id: n.id,
          type: n.type,
          config: n.config,
          retry: n.retry || { enabled: true, max_attempts: 3, delay_seconds: 5, backoff_multiplier: 2 } // Include retry
        })),
        is_enabled: true
      };

      const saveRes = await fetch(`${API_BASE}/workflows/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflowData)
      });
      const saveData = await saveRes.json();
      
      if (saveData.ok) {
        await fetch(`${API_BASE}/workflows/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: saveData.id })
        });
        
        setCurrentWorkflowId(saveData.id);
        // Also update selectedWorkflow to be the newly published workflow
        setSelectedWorkflow({
          id: saveData.id,
          name: workflowName,
          trigger: workflowData.trigger,
          nodes: workflowData.steps, // Outline uses 'nodes' for steps
          is_enabled: workflowData.is_enabled
        });

        setSaveMessage("✅ Workflow published and active!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      setSaveMessage("❌ Publish failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // REPLACED testRunWorkflow AS PER OUTLINE
  const testRunWorkflow = async () => {
    if (!selectedWorkflow) {
      alert("Please select a workflow to test");
      return;
    }

    if (confirm(`🧪 Test run workflow "${selectedWorkflow.name}"?\n\nThis will execute the workflow with mock data.`)) {
      try {
        const response = await fetch(`${API_BASE}/workflows/test-run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId: selectedWorkflow.id,
            tenantId: user?.email || "test_tenant",
            // The outline specifically states 'steps: selectedWorkflow.nodes || []'.
            // Assuming `selectedWorkflow.nodes` now directly maps to `steps` for the test-run endpoint.
            trigger: selectedWorkflow.trigger, // Include trigger for test-run
            steps: selectedWorkflow.nodes || [],
            initialContext: {
              call: { from: "+15551234567", callerName: "Test User", summary: "Test call" },
              settings: { calendarId: "primary", outboundSmsUrl: `${API_BASE}/outbound/sms` },
              secrets: { SMS_TOKEN: "test_token" }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          alert(`✅ Workflow test successful!\n\nSteps executed: ${Object.keys(data.context?.steps || {}).length}\n\nCheck browser console for full output.`);
          console.log("Workflow test result:", data);
        } else {
          const error = await response.json();
          alert(`❌ Workflow test failed:\n\n${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        alert(`❌ Test failed: ${error.message}`);
      }
    }
  };

  // Sample context for preview
  const sampleContext = {
    trigger: { amount: 150, email: "preview@example.com", sender_name: "John Doe" },
    s1: { contactId: "abc123", success: true }
  };

  const renderedConfig = selectedNode ? renderTemplate(selectedNode.config, sampleContext) : {};

  return (
    // WRAPPED ENTIRE COMPONENT CONTENT WITH PermissionGate as per outline
    // NOTE: PermissionGate component is assumed to be defined or imported elsewhere.
    // Its import path was not provided in the outline.
    <PermissionGate
      user={user}
      minimumRole="manager"
      showLockMessage={true}
      lockMessage="Only managers and admins can design workflows"
    >
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-[1800px] mx-auto space-y-6">

          {/* Header - RESTRUCTURED AND MODIFIED BUTTONS AS PER OUTLINE */}
          {/* The outline suggests combining the title/description and buttons into a single flex container directly below the outer div. */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3"> {/* This section holds title and description */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
                <Workflow className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Workflow Designer</h1>
                <p className="text-gray-400 text-sm">Build automation workflows with drag-and-drop</p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* NEW Test Run button from outline, conditional on selectedWorkflow */}
              {selectedWorkflow && (
                <>
                  <Button
                    onClick={testRunWorkflow}
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Test Run
                  </Button>
                  {/* The 'Run Now' button and its dependencies (handleRunWorkflow, runMutation) were not provided in the outline. */}
                  {/* Omitting it to avoid introducing undeclared variables/functions. */}
                  {/*
                  <Button
                    onClick={handleRunWorkflow}
                    disabled={runMutation.isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {runMutation.isLoading ? "Running..." : "Run Now"}
                  </Button>
                  */}
                </>
              )}
              {/* Existing buttons are preserved. The original 'Test Run' button is removed as it's replaced by the new conditional one. */}
              <Button
                onClick={duplicateWorkflow}
                variant="outline"
                size="sm"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                onClick={exportWorkflow}
                variant="outline"
                size="sm"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={() => setShowImportModal(true)}
                variant="outline"
                size="sm"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import JSON
              </Button>
              <Button
                onClick={validateWorkflow}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Validate
              </Button>
              <Button
                onClick={saveWorkflow}
                disabled={isSaving}
                className="bg-gray-700 text-white hover:bg-gray-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={publishWorkflow}
                disabled={isSaving || canvasNodes.length === 0}
                className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white font-bold hover:opacity-90"
              >
                <Play className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>

          {saveMessage && (
            <div className={`p-4 rounded-xl border ${
              saveMessage.includes('✅') 
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30 rounded-xl">
              <CardHeader>
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zod Validation Errors ({validationErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationErrors.map((error, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-red-500/30">
                      <div className="flex items-start gap-2">
                        <Badge className="bg-red-500/20 text-red-400 text-xs">
                          {error.path || 'Schema'}
                        </Badge>
                        <p className="text-red-300 text-sm flex-1">{error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                  <p className="text-blue-400 text-xs font-semibold mb-1">💡 Quick Fix</p>
                  <p className="text-gray-300 text-xs">
                    Select the node with errors in the canvas, then check the config JSON editor below. 
                    Schema hints are shown to guide you.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workflow Name */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-4">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow Name"
                className="bg-[#0B0B0C] border-gray-700 text-white text-xl font-bold h-12"
              />
            </CardContent>
          </Card>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-12 gap-6">

              {/* Node Palette */}
              <div className="col-span-3">
                <Card className="bg-[#111317] border-gray-800 rounded-2xl sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Node Palette</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="palette">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-2"
                        >
                          {NODE_PALETTE.map((node, index) => {
                            const Icon = node.icon;
                            return (
                              <Draggable key={node.id} draggableId={node.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 rounded-lg cursor-move transition-all ${
                                      snapshot.isDragging
                                        ? 'opacity-50 scale-105'
                                        : 'hover:scale-105'
                                    }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <div className={`bg-gradient-to-br ${node.color} p-3 rounded-lg`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Icon className="w-4 h-4 text-white" />
                                        <Badge className="bg-black/20 text-white text-xs">
                                          {node.category}
                                        </Badge>
                                      </div>
                                      <p className="text-white font-semibold text-sm">
                                        {node.label}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 text-xs font-semibold mb-1">💡 How to Use</p>
                      <p className="text-gray-400 text-xs">
                        Drag nodes here to start. Arrange them to build your workflow.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Canvas */}
              <div className="col-span-5">
                <Card className="bg-[#111317] border-gray-800 rounded-2xl min-h-[600px]">
                  <CardHeader>
                    <CardTitle className="text-white">Canvas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="canvas">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[500px] p-4 rounded-xl border-2 border-dashed transition-all ${
                            snapshot.isDraggingOver
                              ? 'border-[#FFD700] bg-[#FFD700]/5'
                              : 'border-gray-700 bg-[#0B0B0C]'
                          }`}
                        >
                          {canvasNodes.length === 0 ? (
                            <div className="flex items-center justify-center h-full py-20">
                              <div className="text-center">
                                <Workflow className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400 mb-2">Drag nodes here to start</p>
                                <p className="text-gray-600 text-sm">Build your automation workflow</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {canvasNodes.map((node, index) => {
                                const NodeIcon = node.icon;
                                return (
                                  <Draggable key={node.id} draggableId={node.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <div
                                          onClick={() => setSelectedNode(node)}
                                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            selectedNode?.id === node.id
                                              ? 'border-[#FFD700] bg-[#FFD700]/5'
                                              : 'border-gray-700 bg-[#151515] hover:border-gray-600'
                                          } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center`}>
                                                <NodeIcon className="w-5 h-5 text-white" />
                                              </div>
                                              <div>
                                                <p className="text-white font-semibold">{node.label}</p>
                                                <p className="text-gray-500 text-xs">Step {index + 1}</p>
                                              </div>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeNode(node.id);
                                              }}
                                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>

                                          {Object.keys(node.config).length > 0 && (
                                            <div className="mt-2 text-xs text-gray-400">
                                              {Object.entries(node.config).slice(0, 2).map(([key, val]) => (
                                                <div key={key}>• {key}: {String(val).substring(0, 30)}...</div>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        {index < canvasNodes.length - 1 && (
                                          <div className="flex justify-center py-2">
                                            <ArrowRight className="w-5 h-5 text-gray-600" />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>

              {/* Properties Panel + JSON Editor */}
              <div className="col-span-4">
                <Card className="bg-[#111317] border-gray-800 rounded-2xl sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Properties & Config
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedNode ? (
                      <>
                        {/* Node Info */}
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Node Type</label>
                          <Badge className={`bg-gradient-to-r ${selectedNode.color} text-white`}>
                            {selectedNode.label}
                          </Badge>
                        </div>

                        {/* Retry Configuration - Only for action nodes */}
                        {selectedNode.type.startsWith('action') && (
                          <div className="border border-orange-500/30 rounded-lg p-3 bg-orange-500/5">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                                <RefreshCw className="w-4 h-4" />
                                Error Retry Strategy
                              </label>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedNode.retry?.enabled !== false} // Default to enabled if undefined
                                  onChange={(e) => updateRetrySettings('enabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              </label>
                            </div>

                            {selectedNode.retry?.enabled !== false && ( // Only show fields if enabled
                              <div className="space-y-3">
                                <div>
                                  <label className="text-gray-400 text-xs mb-1 block">Max Attempts</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={selectedNode.retry?.max_attempts || 3}
                                    onChange={(e) => updateRetrySettings('max_attempts', e.target.value)}
                                    className="bg-[#0B0B0C] border-gray-700 text-white h-8"
                                  />
                                  <p className="text-gray-500 text-xs mt-1">Try up to this many times</p>
                                </div>

                                <div>
                                  <label className="text-gray-400 text-xs mb-1 block">Delay (seconds)</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={selectedNode.retry?.delay_seconds || 5}
                                    onChange={(e) => updateRetrySettings('delay_seconds', e.target.value)}
                                    className="bg-[#0B0B0C] border-gray-700 text-white h-8"
                                  />
                                  <p className="text-gray-500 text-xs mt-1">Wait before retrying</p>
                                </div>

                                <div>
                                  <label className="text-gray-400 text-xs mb-1 block">Backoff Multiplier</label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.5"
                                    value={selectedNode.retry?.backoff_multiplier || 2}
                                    onChange={(e) => updateRetrySettings('backoff_multiplier', e.target.value)}
                                    className="bg-[#0B0B0C] border-gray-700 text-white h-8"
                                  />
                                  <p className="text-gray-500 text-xs mt-1">
                                    Each retry waits {selectedNode.retry?.backoff_multiplier || 2}× longer
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-gray-700">
                                  <p className="text-xs text-gray-400">
                                    <strong>Example:</strong> Attempt 1 fails → wait {selectedNode.retry?.delay_seconds || 5}s → 
                                    Attempt 2 fails → wait {(selectedNode.retry?.delay_seconds || 5) * (selectedNode.retry?.backoff_multiplier || 2)}s → 
                                    Attempt 3 fails → stop
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="border-t border-gray-800 pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-400 text-xs flex items-center gap-1">
                              <Code className="w-3 h-3" />
                              Step Config (JSON)
                            </label>
                            {getSchemaHintForType(selectedNode.type) && (
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                Zod Schema
                              </Badge>
                            )}
                          </div>
                          
                          {/* Schema Hint */}
                          {getSchemaHintForType(selectedNode.type) && (
                            <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300 font-mono">
                              {getSchemaHintForType(selectedNode.type)}
                            </div>
                          )}

                          {/* JSON Editor */}
                          <Textarea
                            value={configJson}
                            onChange={(e) => setConfigJson(e.target.value)}
                            onBlur={updateConfigFromJson}
                            placeholder='{"key": "value", "field": "{{trigger.field}}"}'
                            className="bg-[#0B0B0C] border-gray-700 text-white h-48 font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={updateConfigFromJson}
                            className="w-full mt-2 bg-gray-700 text-white hover:bg-gray-600"
                          >
                            Apply Changes
                          </Button>
                        </div>

                        {/* Rendered Preview */}
                        <div className="border-t border-gray-800 pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-gray-400 text-xs">Rendered Preview</p>
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">Live</Badge>
                          </div>
                          <p className="text-gray-500 text-xs mb-2">
                            Variables resolved against sample context
                          </p>
                          <div className="p-3 bg-[#0B0B0C] rounded-lg border border-purple-500/30">
                            <pre className="text-xs text-purple-300 font-mono overflow-x-auto">
                              {JSON.stringify(renderedConfig, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                          <p className="text-gray-500 text-xs">
                            💡 Use <code className="bg-gray-800 px-1 rounded">{"{{trigger.field}}"}</code> to reference trigger data.
                            Use <code className="bg-gray-800 px-1 rounded">{"{{s1.field}}"}</code> for previous step outputs.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Settings className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-400 text-sm">Select a node to configure</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </DragDropContext>

          {/* Info Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-blue-400 font-bold mb-2">📡 Workflow Triggers</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Start workflows from webhooks, schedules, or manual triggers.
                </p>
                <p className="text-gray-500 text-xs">
                  Webhooks receive events from Meta, GHL, Stripe, and custom sources.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-green-400 font-bold mb-2">⚡ Actions</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Perform tasks like creating leads, posting content, sending emails.
                </p>
                <p className="text-gray-500 text-xs">
                  Chain multiple actions together for complex workflows.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-purple-400 font-bold mb-2">🔄 Data Mapping</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Pass data between steps using template variables.
                </p>
                <p className="text-gray-500 text-xs">
                  Use {"{{trigger.field}}"} or {"{{s1.output}}"} in configs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-orange-400 font-bold mb-2">🛡️ Reliability</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Zod validation, retry strategies, rate limiting, and DLQ protection.
                </p>
                <p className="text-gray-500 text-xs">
                  Enterprise-grade error handling built-in.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Import Workflow JSON</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='{"name": "...", "trigger": {...}, "steps": [...]}'
                  className="bg-[#0B0B0C] border-gray-700 text-white h-96 font-mono text-xs"
                />
                <Button
                  onClick={importWorkflow}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold hover:opacity-90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}