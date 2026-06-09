import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  Code,
  Download,
  Upload,
  Wand2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function JsonStudio() {
  const queryClient = useQueryClient();
  const [activeProject, setActiveProject] = useState(null);
  const [jsonContent, setJsonContent] = useState("");
  const [projectName, setProjectName] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [isValid, setIsValid] = useState(true);

  const { data: projects = [] } = useQuery({
    queryKey: ["jsonProjects"],
    queryFn: () => base44.entities.JsonProject.list("-updated_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JsonProject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["jsonProjects"]);
      setProjectName("");
      setJsonContent("");
      setActiveProject(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JsonProject.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["jsonProjects"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JsonProject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["jsonProjects"]);
      setActiveProject(null);
      setJsonContent("");
    },
  });

  const validateJson = (text) => {
    try {
      JSON.parse(text);
      setIsValid(true);
      setValidationError(null);
      return true;
    } catch (error) {
      setIsValid(false);
      setValidationError(error.message);
      return false;
    }
  };

  const formatJson = () => {
    if (validateJson(jsonContent)) {
      const formatted = JSON.stringify(JSON.parse(jsonContent), null, 2);
      setJsonContent(formatted);
    }
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    const valid = validateJson(jsonContent);
    
    const data = {
      name: projectName,
      content: jsonContent,
      is_valid: valid,
      last_error: valid ? null : validationError,
    };

    if (activeProject) {
      await updateMutation.mutateAsync({ id: activeProject.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const loadProject = (project) => {
    setActiveProject(project);
    setProjectName(project.name);
    setJsonContent(project.content);
    validateJson(project.content);
  };

  const newProject = () => {
    setActiveProject(null);
    setProjectName("");
    setJsonContent("{\n  \n}");
    setIsValid(true);
    setValidationError(null);
  };

  const downloadJson = () => {
    if (!validateJson(jsonContent)) return;
    
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleJson = () => {
    const sample = {
      user: {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        interests: ["coding", "design", "music"]
      },
      settings: {
        theme: "dark",
        notifications: true
      }
    };
    setJsonContent(JSON.stringify(sample, null, 2));
    setProjectName("Sample Project");
    validateJson(JSON.stringify(sample));
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">JSON Studio</h1>
            <p className="text-gray-400">Validate, format, and transform JSON data with ease</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadSampleJson}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-[#111317] rounded-xl"
            >
              <Code className="w-4 h-4 mr-2" />
              Load Sample
            </Button>
            <Button
              onClick={newProject}
              className="bg-gradient-to-r from-[#FF4433] to-[#FF8C00] text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => loadProject(project)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        activeProject?.id === project.id
                          ? "bg-gradient-to-r from-[#FF4433] to-[#FF8C00]"
                          : "bg-[#0B0B0C] hover:bg-[#1a1a1f]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white truncate">{project.name}</p>
                        {project.is_valid ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(project.updated_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm">No projects yet.</p>
                  <p className="text-gray-500 text-xs mt-1">Create one to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="max-w-md bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={formatJson}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Format
                  </Button>
                  <Button
                    onClick={downloadJson}
                    variant="outline"
                    size="sm"
                    disabled={!isValid}
                    className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="bg-gradient-to-r from-[#A89C94] to-[#1E90FF] text-white rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  {activeProject && (
                    <Button
                      onClick={() => deleteMutation.mutate(activeProject.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationError && (
                <Alert variant="destructive" className="border-red-500 bg-red-500/10 rounded-xl">
                  <XCircle className="w-4 h-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              {isValid && jsonContent && (
                <Alert className="border-green-500 bg-green-500/10 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <AlertDescription className="text-green-500">Valid JSON</AlertDescription>
                </Alert>
              )}
              
              <Textarea
                value={jsonContent}
                onChange={(e) => {
                  setJsonContent(e.target.value);
                  validateJson(e.target.value);
                }}
                placeholder='Paste JSON here or click "Load Sample"...'
                className="font-mono min-h-[500px] bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}