import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  FileText,
  RefreshCw,
  Globe,
  MessageSquare,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NlpWorkbench() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("summarize");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: jobs = [] } = useQuery({
    queryKey: ["nlpJobs"],
    queryFn: () => base44.entities.NlpJob.list("-created_date", 10),
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => base44.entities.NlpJob.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["nlpJobs"]);
    },
  });

  const processText = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text to process");
      return;
    }

    setIsProcessing(true);
    setOutputText("");

    try {
      const prompts = {
        summarize: `Summarize the following text in a concise, factual manner:\n\n${inputText}`,
        rewrite: `Rewrite the following text to be more professional and engaging:\n\n${inputText}`,
        seo_brief: `Create an SEO brief with keywords and meta description for the following content:\n\n${inputText}`,
        social_caption: `Create 3 engaging social media captions (Twitter, Instagram, LinkedIn) for:\n\n${inputText}`,
        translate: `Translate the following text to Spanish:\n\n${inputText}`,
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[activeTab],
      });

      setOutputText(result);

      await createJobMutation.mutateAsync({
        job_type: activeTab,
        input_text: inputText,
        output_text: result,
        status: "completed",
      });
    } catch (error) {
      setOutputText("Error processing text. Please try again.");
      console.error(error);
    }

    setIsProcessing(false);
  };

  const loadJob = (job) => {
    setInputText(job.input_text);
    setOutputText(job.output_text);
    setActiveTab(job.job_type);
  };

  const tools = [
    { id: "summarize", name: "Summarize", icon: FileText, color: "from-[#FF4433] to-[#FF8C00]" },
    { id: "rewrite", name: "Rewrite", icon: RefreshCw, color: "from-[#FF8C00] to-[#A89C94]" },
    { id: "seo_brief", name: "SEO Brief", icon: Globe, color: "from-[#A89C94] to-[#1E90FF]" },
    { id: "social_caption", name: "Social Caption", icon: MessageSquare, color: "from-[#1E90FF] to-[#FF4433]" },
    { id: "translate", name: "Translate", icon: Globe, color: "from-[#FF8C00] to-[#1E90FF]" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">NLP Workbench</h1>
          <p className="text-gray-400">AI-powered text processing and generation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tools & History */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    activeTab === tool.id
                      ? `bg-gradient-to-r ${tool.color} text-white`
                      : "bg-[#0B0B0C] hover:bg-[#1a1a1f] text-gray-400"
                  }`}
                >
                  <tool.icon className="w-5 h-5" />
                  <span className="font-medium">{tool.name}</span>
                </button>
              ))}
            </CardContent>

            <CardHeader className="border-t border-gray-800 pt-6">
              <CardTitle className="text-white">Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-2">
                  {jobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      onClick={() => loadJob(job)}
                      className="p-3 rounded-xl bg-[#0B0B0C] hover:bg-[#1a1a1f] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-[#FF8C00] to-[#A89C94] text-white border-0 rounded-lg text-xs"
                        >
                          {job.job_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(job.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{job.input_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No jobs yet</p>
              )}
            </CardContent>
          </Card>

          {/* Workspace */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {tools.find((t) => t.id === activeTab)?.name} Workspace
                </CardTitle>
                <Button
                  onClick={processText}
                  disabled={isProcessing || !inputText.trim()}
                  className="bg-gradient-to-r from-[#A89C94] to-[#1E90FF] text-white rounded-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Process
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Input Text</label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter or paste your text here..."
                  className="min-h-[200px] bg-[#0B0B0C] border-gray-700 text-white rounded-xl font-mono"
                />
              </div>

              {outputText && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Output</label>
                  <div className="min-h-[200px] bg-[#0B0B0C] border border-gray-700 rounded-xl p-4">
                    <p className="text-white whitespace-pre-wrap">{outputText}</p>
                  </div>
                </div>
              )}

              {!outputText && !isProcessing && (
                <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                  <Sparkles className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">Enter text above and click Process to generate output</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}