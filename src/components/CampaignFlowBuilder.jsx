import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  GitBranch,
  Zap,
  Tag,
  TrendingUp,
  Webhook,
  Plus,
  Trash2,
  Copy,
  Play,
  Settings
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const NODE_TYPES = {
  sms: {
    icon: MessageSquare,
    label: "Send SMS",
    color: "bg-blue-500",
    fields: ["message", "delay"]
  },
  email: {
    icon: Mail,
    label: "Send Email",
    color: "bg-purple-500",
    fields: ["subject", "message", "delay"]
  },
  call: {
    icon: Phone,
    label: "Schedule Call",
    color: "bg-green-500",
    fields: ["delay", "duration"]
  },
  wait: {
    icon: Clock,
    label: "Wait/Delay",
    color: "bg-yellow-500",
    fields: ["delay"]
  },
  condition: {
    icon: GitBranch,
    label: "If/Then Branch",
    color: "bg-orange-500",
    fields: ["condition"]
  },
  ab_split: {
    icon: TrendingUp,
    label: "A/B Split",
    color: "bg-pink-500",
    fields: ["variants"]
  },
  ghl_action: {
    icon: Zap,
    label: "GHL Action",
    color: "bg-teal-500",
    fields: ["action_type"]
  },
  tag_update: {
    icon: Tag,
    label: "Update Tags",
    color: "bg-indigo-500",
    fields: ["tags"]
  },
  webhook: {
    icon: Webhook,
    label: "Webhook",
    color: "bg-red-500",
    fields: ["url"]
  }
};

export default function CampaignFlowBuilder({ campaign, onChange }) {
  const [nodes, setNodes] = useState(campaign?.flow_nodes || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);

  const addNode = (nodeType) => {
    const newNode = {
      node_id: `node_${Date.now()}`,
      node_type: nodeType,
      position: { x: 100, y: nodes.length * 120 + 100 },
      config: {},
      connections: []
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onChange({ ...campaign, flow_nodes: updatedNodes });
    setSelectedNode(newNode);
    setShowNodeConfig(true);
  };

  const updateNode = (nodeId, updates) => {
    const updatedNodes = nodes.map(node =>
      node.node_id === nodeId ? { ...node, ...updates } : node
    );
    setNodes(updatedNodes);
    onChange({ ...campaign, flow_nodes: updatedNodes });
  };

  const deleteNode = (nodeId) => {
    const updatedNodes = nodes.filter(n => n.node_id !== nodeId);
    setNodes(updatedNodes);
    onChange({ ...campaign, flow_nodes: updatedNodes });
    setSelectedNode(null);
  };

  const connectNodes = (fromId, toId, condition = null) => {
    const updatedNodes = nodes.map(node => {
      if (node.node_id === fromId) {
        const connections = node.connections || [];
        return {
          ...node,
          connections: [
            ...connections,
            { to_node_id: toId, condition, label: condition || 'Next' }
          ]
        };
      }
      return node;
    });
    setNodes(updatedNodes);
    onChange({ ...campaign, flow_nodes: updatedNodes });
  };

  const duplicateNode = (node) => {
    const newNode = {
      ...node,
      node_id: `node_${Date.now()}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      connections: []
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onChange({ ...campaign, flow_nodes: updatedNodes });
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 h-[600px]">
      
      {/* Node Palette */}
      <div className="md:col-span-1 bg-[#111317] rounded-xl p-4 overflow-y-auto border border-gray-800">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Step
        </h3>
        <div className="space-y-2">
          {Object.entries(NODE_TYPES).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => addNode(type)}
                className={`w-full p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-all text-left flex items-center gap-3 ${config.color}/10 hover:${config.color}/20`}
              >
                <div className={`w-8 h-8 rounded ${config.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-semibold">{config.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-400 text-xs font-semibold mb-2">💡 Pro Tip</p>
          <p className="text-gray-300 text-xs">
            Drag nodes to reorder. Click to configure. Connect nodes with arrows.
          </p>
        </div>
      </div>

      {/* Canvas */}
      <div className="md:col-span-2 bg-[#0B0B0C] rounded-xl p-6 overflow-auto border border-gray-800 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className="bg-gray-800 text-gray-300">
            {nodes.length} Steps
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm('Clear all nodes?')) {
                setNodes([]);
                onChange({ ...campaign, flow_nodes: [] });
              }
            }}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Clear All
          </Button>
        </div>

        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">No steps added yet</p>
              <p className="text-gray-500 text-sm">
                Add steps from the left panel to build your campaign flow
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 min-h-full">
            {nodes.map((node, idx) => {
              const nodeConfig = NODE_TYPES[node.node_type];
              const Icon = nodeConfig?.icon || MessageSquare;

              return (
                <div key={node.node_id}>
                  {/* Node Card */}
                  <div
                    onClick={() => {
                      setSelectedNode(node);
                      setShowNodeConfig(true);
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedNode?.node_id === node.node_id
                        ? 'border-[#FFD700] bg-[#FFD700]/10'
                        : 'border-gray-700 bg-[#111317] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${nodeConfig?.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{nodeConfig?.label}</p>
                          <p className="text-gray-500 text-xs">Step {idx + 1}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateNode(node);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this step?')) {
                              deleteNode(node.node_id);
                            }
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Node Preview */}
                    <div className="text-xs text-gray-400">
                      {node.config?.message && (
                        <p className="truncate">"{node.config.message.substring(0, 60)}..."</p>
                      )}
                      {node.config?.delay_days > 0 && (
                        <p className="mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Wait {node.config.delay_days} days
                        </p>
                      )}
                      {node.ab_test_config?.enabled && (
                        <Badge className="mt-2 bg-pink-500/20 text-pink-400 text-xs">
                          🧪 A/B Test ({node.ab_test_config.variants?.length} variants)
                        </Badge>
                      )}
                    </div>

                    {/* Connections */}
                    {node.connections && node.connections.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {node.connections.map((conn, connIdx) => (
                          <Badge key={connIdx} className="bg-gray-700 text-gray-300 text-xs">
                            → {conn.label || 'Next'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connection Arrow */}
                  {idx < nodes.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="w-0.5 h-8 bg-gray-700"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Node Configuration Panel */}
      <div className="md:col-span-1 bg-[#111317] rounded-xl p-4 overflow-y-auto border border-gray-800">
        {selectedNode ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure Step
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedNode(null);
                  setShowNodeConfig(false);
                }}
                className="text-gray-400"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              
              {/* Node Type Display */}
              <div>
                <Label className="text-gray-400 text-xs">Step Type</Label>
                <div className="mt-1 p-2 bg-[#0B0B0C] rounded-lg flex items-center gap-2">
                  {React.createElement(NODE_TYPES[selectedNode.node_type].icon, {
                    className: "w-4 h-4 text-gray-400"
                  })}
                  <span className="text-white text-sm">{NODE_TYPES[selectedNode.node_type].label}</span>
                </div>
              </div>

              {/* Message/Subject */}
              {(selectedNode.node_type === 'sms' || selectedNode.node_type === 'email') && (
                <>
                  {selectedNode.node_type === 'email' && (
                    <div>
                      <Label className="text-gray-300 text-xs">Subject Line</Label>
                      <Input
                        value={selectedNode.config?.subject || ''}
                        onChange={(e) => updateNode(selectedNode.node_id, {
                          config: { ...selectedNode.config, subject: e.target.value }
                        })}
                        placeholder="Email subject"
                        className="mt-1 bg-[#0B0B0C] border-gray-700 text-white text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-300 text-xs">Message</Label>
                    <Textarea
                      value={selectedNode.config?.message || ''}
                      onChange={(e) => updateNode(selectedNode.node_id, {
                        config: { ...selectedNode.config, message: e.target.value }
                      })}
                      placeholder="Hi {{name}}! ..."
                      className="mt-1 bg-[#0B0B0C] border-gray-700 text-white text-sm h-24"
                    />
                    <p className="text-gray-600 text-xs mt-1">
                      Use {`{{name}}`}, {`{{company}}`}, {`{{score}}`}
                    </p>
                  </div>
                </>
              )}

              {/* Delay */}
              {(selectedNode.node_type === 'sms' || selectedNode.node_type === 'email' || selectedNode.node_type === 'wait' || selectedNode.node_type === 'call') && (
                <div>
                  <Label className="text-gray-300 text-xs">Delay (Days)</Label>
                  <Input
                    type="number"
                    value={selectedNode.config?.delay_days || 0}
                    onChange={(e) => updateNode(selectedNode.node_id, {
                      config: { ...selectedNode.config, delay_days: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 bg-[#0B0B0C] border-gray-700 text-white"
                    min="0"
                  />
                </div>
              )}

              {/* Condition */}
              {selectedNode.node_type === 'condition' && (
                <div>
                  <Label className="text-gray-300 text-xs">Condition</Label>
                  <Select
                    value={selectedNode.config?.condition_path || ''}
                    onValueChange={(value) => updateNode(selectedNode.node_id, {
                      config: { ...selectedNode.config, condition_path: value }
                    })}
                  >
                    <SelectTrigger className="mt-1 bg-[#0B0B0C] border-gray-700 text-white">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead.score >= 70">Score ≥ 70</SelectItem>
                      <SelectItem value="lead.responded == true">Lead Responded</SelectItem>
                      <SelectItem value="lead.budget != null">Has Budget</SelectItem>
                      <SelectItem value="lead.status == qualified">Status = Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* GHL Action */}
              {selectedNode.node_type === 'ghl_action' && (
                <div>
                  <Label className="text-gray-300 text-xs">GHL Action</Label>
                  <Select
                    value={selectedNode.config?.action_type || ''}
                    onValueChange={(value) => updateNode(selectedNode.node_id, {
                      config: { ...selectedNode.config, action_type: value }
                    })}
                  >
                    <SelectTrigger className="mt-1 bg-[#0B0B0C] border-gray-700 text-white">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create_opportunity">Create Opportunity</SelectItem>
                      <SelectItem value="move_stage">Move Pipeline Stage</SelectItem>
                      <SelectItem value="create_task">Create Task</SelectItem>
                      <SelectItem value="trigger_workflow">Trigger Workflow</SelectItem>
                      <SelectItem value="add_note">Add Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* A/B Test Config */}
              <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-pink-400 text-xs font-semibold">A/B Testing</Label>
                  <input
                    type="checkbox"
                    checked={selectedNode.ab_test_config?.enabled || false}
                    onChange={(e) => updateNode(selectedNode.node_id, {
                      ab_test_config: {
                        enabled: e.target.checked,
                        variants: e.target.checked ? [
                          { variant_id: 'A', variant_name: 'Control', traffic_percent: 50 },
                          { variant_id: 'B', variant_name: 'Variant B', traffic_percent: 50 }
                        ] : []
                      }
                    })}
                    className="rounded"
                  />
                </div>
                {selectedNode.ab_test_config?.enabled && (
                  <p className="text-gray-400 text-xs">
                    Test 2 variants with 50/50 split
                  </p>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm">
                Click a step to configure
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}