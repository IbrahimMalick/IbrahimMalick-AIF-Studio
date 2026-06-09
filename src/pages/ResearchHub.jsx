import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Search,
  Sparkles,
  Loader2,
  Download,
  MessageSquare,
  Brain,
  PackageOpen
} from "lucide-react";

export default function ResearchHub() {
  const queryClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [question, setQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const { data: documents = [] } = useQuery({
    queryKey: ["researchDocs"],
    queryFn: () => base44.entities.ResearchDocument.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ResearchDocument.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["researchDocs"]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ResearchDocument.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["researchDocs"]);
    },
  });

  const handleBulkToggle = (docId) => {
    const newSet = new Set(selectedForBulk);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedForBulk(newSet);
  };

  const handleSelectAll = () => {
    if (selectedForBulk.size === documents.length) {
      setSelectedForBulk(new Set());
    } else {
      setSelectedForBulk(new Set(documents.map(d => d.id)));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedForBulk.size === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.all(
        Array.from(selectedForBulk).map(id =>
          base44.entities.ResearchDocument.update(id, { is_archived: true })
        )
      );
      queryClient.invalidateQueries(["researchDocs"]);
      setSelectedForBulk(new Set());
      setSelectedDoc(null);
    } catch (error) {
      alert("Error archiving documents. Please try again.");
      console.error(error);
    }
    setIsBulkProcessing(false);
  };

  const handleBulkDelete = async () => {
    if (selectedForBulk.size === 0) return;
    if (!confirm(`Delete ${selectedForBulk.size} document(s)? This cannot be undone.`)) return;
    
    setIsBulkProcessing(true);
    try {
      await Promise.all(
        Array.from(selectedForBulk).map(id =>
          base44.entities.ResearchDocument.delete(id)
        )
      );
      queryClient.invalidateQueries(["researchDocs"]);
      setSelectedForBulk(new Set());
      setSelectedDoc(null);
    } catch (error) {
      alert("Error deleting documents. Please try again.");
      console.error(error);
    }
    setIsBulkProcessing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setUploadFile(file);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const fileType = file.name.endsWith('.pdf') ? 'pdf' :
                      file.name.endsWith('.docx') ? 'docx' :
                      file.name.endsWith('.md') ? 'md' : 'txt';

      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            text_content: { type: "string" }
          }
        }
      });

      const extractedText = extractResult.output?.text_content || "";

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a comprehensive summary of the following document:\n\n${extractedText.slice(0, 10000)}`
      });

      const keyPointsResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract 5-7 key points from this document:\n\n${extractedText.slice(0, 10000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            key_points: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const doc = await createMutation.mutateAsync({
        title: file.name,
        file_url,
        file_type: fileType,
        extracted_text: extractedText,
        summary,
        key_points: keyPointsResult.key_points || [],
        entities_extracted: [],
        qa_history: []
      });

      setSelectedDoc(doc);
      setUploadFile(null);
    } catch (error) {
      alert("Error analyzing document. Please try again.");
      console.error(error);
    }

    setIsAnalyzing(false);
  };

  const handleExportSummary = async () => {
    setIsExporting(true);
    try {
      // Fetch all related data
      const queueTasks = await base44.entities.ProductionQueue.list("-created_date", 200);
      const projects = await base44.entities.Project.list("-created_date", 100);
      const activityLogs = await base44.entities.ActivityLog.list("-created_date", 200);

      const lines = [];
      const divider = "─".repeat(80);
      const now = new Date().toLocaleString();

      lines.push("╔" + "═".repeat(78) + "╗");
      lines.push("║" + "AI AGENT & PROJECT ACTIVITY COMPREHENSIVE EXPORT".padEnd(79) + "║");
      lines.push("║" + `Generated: ${now}`.padEnd(79) + "║");
      lines.push("╚" + "═".repeat(78) + "╝");
      lines.push("");

      // ── Research Documents ──
      lines.push("═══ RESEARCH DOCUMENTS ═══");
      lines.push(`Total documents: ${documents.length}`);
      lines.push("");

      documents.forEach((doc, i) => {
        lines.push(`[${i + 1}] ${doc.title}`);
        lines.push(`    Type: ${doc.file_type || "unknown"} | Added: ${new Date(doc.created_date).toLocaleDateString()}`);
        if (doc.summary) {
          lines.push(`    Summary: ${doc.summary.slice(0, 200)}${doc.summary.length > 200 ? "..." : ""}`);
        }
        if (doc.key_points?.length) {
          lines.push(`    Key Points: ${doc.key_points.slice(0, 3).join(", ")}${doc.key_points.length > 3 ? "..." : ""}`);
        }
        if (doc.qa_history?.length) {
          lines.push(`    Q&A Sessions: ${doc.qa_history.length}`);
        }
        lines.push("");
      });

      // ── Projects Overview ──
      lines.push("═══ PROJECT OVERVIEW ═══");
      lines.push(`Total projects: ${projects.length}`);
      lines.push("");

      const statusGroups = {};
      projects.forEach(p => {
        const status = p.status || "unknown";
        if (!statusGroups[status]) statusGroups[status] = [];
        statusGroups[status].push(p);
      });

      Object.entries(statusGroups).forEach(([status, projs]) => {
        lines.push(`${status.toUpperCase()} (${projs.length}):`);
        projs.forEach(p => {
          lines.push(`  • ${p.project_name} | Client: ${p.client_id?.slice(-6) || "N/A"} | Delivery: ${p.target_delivery || "N/A"}`);
          lines.push(`    API Costs: $${(p.api_costs || 0).toFixed(2)} | Hours: ${p.production_hours || 0} | Revisions: ${p.revision_count || 0}`);
        });
        lines.push("");
      });

      // ── Production Queue / Agent Logs ──
      lines.push("═══ AGENT PRODUCTION QUEUE LOGS ═══");
      lines.push(`Total tasks: ${queueTasks.length}`);
      lines.push("");

      const taskStatusGroups = { completed: [], failed: [], processing: [], pending: [] };
      queueTasks.forEach(t => {
        const g = taskStatusGroups[t.status] || taskStatusGroups.pending;
        g.push(t);
      });

      const tokenStats = queueTasks.reduce((acc, t) => ({
        total: acc.total + (t.tokens_used || 0),
        count: acc.count + 1
      }), { total: 0, count: 0 });

      lines.push(`Token Usage Summary: ${tokenStats.total.toLocaleString()} tokens across ${tokenStats.count} tasks`);
      lines.push(`Average: ${(tokenStats.total / (tokenStats.count || 1)).toFixed(0)} tokens/task`);
      lines.push("");

      Object.entries(taskStatusGroups).forEach(([status, tasks]) => {
        if (!tasks.length) return;
        lines.push(`── ${status.toUpperCase()} (${tasks.length}) ──`);
        tasks.slice(0, 10).forEach(t => {
          lines.push(`  • [${t.assigned_to || "?"}] ${t.task_type} | Model: ${t.llm_model || "N/A"} | Tokens: ${t.tokens_used || 0}`);
          if (t.error_message) lines.push(`    ⚠ Error: ${t.error_message}`);
          if (t.completed_at) {
            const duration = t.started_at ? Math.round((new Date(t.completed_at) - new Date(t.started_at)) / 1000) : "?";
            lines.push(`    Duration: ${duration}s | Completed: ${new Date(t.completed_at).toLocaleString()}`);
          }
        });
        if (tasks.length > 10) lines.push(`  ... and ${tasks.length - 10} more`);
        lines.push("");
      });

      // ── Activity Audit Trail ──
      lines.push("═══ ACTIVITY AUDIT TRAIL ═══");
      lines.push(`Total activities logged: ${activityLogs.length}`);
      lines.push("");
      
      const actionCounts = {};
      activityLogs.forEach(log => {
        actionCounts[log.action_type] = (actionCounts[log.action_type] || 0) + 1;
      });
      
      Object.entries(actionCounts).forEach(([action, count]) => {
        lines.push(`  • ${action}: ${count}`);
      });
      lines.push("");

      lines.push("═" + "═".repeat(78));
      lines.push("END OF EXPORT");
      lines.push("═" + "═".repeat(78));

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-activity-export-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed. Please try again.");
      console.error(e);
    }
    setIsExporting(false);
  };

  const askQuestion = async () => {
    if (!question.trim() || !selectedDoc) return;

    setIsAsking(true);

    try {
      const answer = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the following document, answer this question: ${question}\n\nDocument:\n${selectedDoc.extracted_text?.slice(0, 15000)}`
      });

      const qaHistory = [...(selectedDoc.qa_history || []), {
        question,
        answer,
        timestamp: new Date().toISOString()
      }];

      await updateMutation.mutateAsync({
        id: selectedDoc.id,
        data: { qa_history: qaHistory }
      });

      setQuestion("");
      
      const updatedDocs = await base44.entities.ResearchDocument.list();
      const refreshedDoc = updatedDocs.find(d => d.id === selectedDoc.id);
      if (refreshedDoc) setSelectedDoc(refreshedDoc);
    } catch (error) {
      alert("Error getting answer. Please try again.");
    }

    setIsAsking(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Research Hub</h1>
            <p className="text-gray-400">Effortlessly upload documents and unlock deep insights through advanced AI analysis.</p>
          </div>
          <Button
            onClick={handleExportSummary}
            disabled={isExporting || documents.length === 0}
            className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-black font-bold rounded-xl"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <PackageOpen className="w-4 h-4 mr-2" />
            )}
            Export Summary
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  disabled={isAnalyzing}
                />
                <Button className="w-full bg-gradient-to-r from-[#A89C94] to-[#1E90FF] text-white rounded-xl" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </label>

              {documents.length > 0 && (
                <div className="space-y-2 p-3 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedForBulk.size === documents.length && documents.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs text-gray-400">Select All</span>
                    </label>
                    {selectedForBulk.size > 0 && (
                      <span className="text-xs text-gray-500">
                        {selectedForBulk.size} selected
                      </span>
                    )}
                  </div>
                  {selectedForBulk.size > 0 && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleBulkArchive}
                        disabled={isBulkProcessing}
                        size="sm"
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-7 rounded-lg"
                      >
                        {isBulkProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Archive"}
                      </Button>
                      <Button
                        onClick={handleBulkDelete}
                        disabled={isBulkProcessing}
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-7 rounded-lg"
                      >
                        {isBulkProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedForBulk.has(doc.id)}
                        onChange={() => handleBulkToggle(doc.id)}
                        className="w-4 h-4 rounded mt-2 flex-shrink-0"
                      />
                      <div
                        onClick={() => setSelectedDoc(doc)}
                        className={`flex-1 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedDoc?.id === doc.id
                            ? "bg-gradient-to-r from-[#A89C94] to-[#1E90FF]"
                            : "bg-[#0B0B0C] hover:bg-[#1a1a1f]"
                        } ${selectedForBulk.has(doc.id) ? "ring-2 ring-yellow-500" : ""}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-white" />
                          <p className="text-white text-sm font-medium truncate">{doc.title}</p>
                        </div>
                        <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs">
                          {doc.file_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No documents yet</p>
              )}
            </CardContent>
          </Card>

          {/* Document Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDoc ? (
              <>
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{selectedDoc.title}</CardTitle>
                      <Button
                        onClick={() => window.open(selectedDoc.file_url, "_blank")}
                        variant="outline"
                        size="sm"
                        className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-[#1E90FF]" />
                        Summary
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedDoc.summary}</p>
                    </div>

                    {selectedDoc.key_points && selectedDoc.key_points.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-2">Key Points</h3>
                        <ul className="space-y-2">
                          {selectedDoc.key_points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#FF8C00] mt-1">•</span>
                              <span className="text-gray-300 text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#FF8C00]" />
                      Ask Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                        placeholder="Ask anything about this document..."
                        className="flex-1 bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                      />
                      <Button
                        onClick={askQuestion}
                        disabled={isAsking || !question.trim()}
                        className="bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white rounded-xl"
                      >
                        {isAsking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {selectedDoc.qa_history && selectedDoc.qa_history.length > 0 && (
                      <div className="space-y-4">
                        {selectedDoc.qa_history.slice().reverse().map((qa, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800">
                            <p className="text-white font-medium mb-2">{qa.question}</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{qa.answer}</p>
                            <p className="text-gray-600 text-xs mt-2">
                              {new Date(qa.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#A89C94] to-[#1E90FF] flex items-center justify-center mb-4">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-400 mb-2">No document selected</p>
                    <p className="text-gray-500 text-sm">Upload or select a document to analyze</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}