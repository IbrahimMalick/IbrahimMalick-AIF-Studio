import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  FileText,
  Download,
  MessageSquare,
  Star,
  Calendar,
  Globe,
  Film
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { showToast } from "@/components/ToastNotification";

export default function ProjectDetail() {
  const [user, setUser] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();

    // Get project ID from URL
    const params = new URLSearchParams(window.location.search);
    setProjectId(params.get('id'));
  }, []);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0] || null;
    },
    enabled: !!projectId
  });

  const { data: client } = useQuery({
    queryKey: ["projectClient", project?.client_id],
    queryFn: async () => {
      if (!project?.client_id) return null;
      const clients = await base44.entities.Client.filter({ id: project.client_id });
      return clients[0] || null;
    },
    enabled: !!project?.client_id
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ feedback, rating, requestRevision }) => {
      const updates = {
        satisfaction_score: rating,
        status: requestRevision ? 'revision' : project.status
      };
      
      if (requestRevision) {
        updates.revision_count = (project.revision_count || 0) + 1;
      }

      return await base44.entities.Project.update(project.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project"]);
      showToast("Feedback submitted successfully!", "success");
      setFeedback("");
      setRating(0);
    }
  });

  const handleSubmitFeedback = (requestRevision = false) => {
    if (!rating) {
      showToast("Please provide a rating", "warning");
      return;
    }
    feedbackMutation.mutate({ feedback, rating, requestRevision });
  };

  const statusColors = {
    discovery: "bg-blue-500/20 text-blue-400",
    scripting: "bg-purple-500/20 text-purple-400",
    production: "bg-yellow-500/20 text-yellow-400",
    revision: "bg-orange-500/20 text-orange-400",
    delivered: "bg-green-500/20 text-green-400",
    archived: "bg-gray-500/20 text-gray-400"
  };

  const getProgressPercentage = (status) => {
    const progressMap = {
      discovery: 20,
      scripting: 40,
      production: 60,
      revision: 80,
      delivered: 100,
      archived: 100
    };
    return progressMap[status] || 0;
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-white text-xl">Loading project details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back Button */}
        <Link to={createPageUrl("ClientDashboard")}>
          <Button variant="outline" className="border-gray-700 text-white mb-4">
            ← Back to Dashboard
          </Button>
        </Link>

        {/* Project Header */}
        <Card className="bg-[#111317] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{project.project_name}</h1>
                <p className="text-gray-400">{client?.company_name}</p>
              </div>
              <Badge className={statusColors[project.status]}>
                {project.status}
              </Badge>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Project Progress</span>
                <span>{getProgressPercentage(project.status)}%</span>
              </div>
              <Progress value={getProgressPercentage(project.status)} className="h-3" />
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <FileText className="w-4 h-4" />
                <span>{project.campaign_type} Campaign</span>
              </div>
              {project.num_ads && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Film className="w-4 h-4" />
                  <span>{project.num_ads} Ads</span>
                </div>
              )}
              {project.target_delivery && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(project.target_delivery).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Production Timeline */}
        <Card className="bg-[#111317] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Production Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'discovery', label: 'Discovery & Alignment', description: 'Brand requirements gathered' },
                { stage: 'scripting', label: 'Script Development', description: 'Campaign narrative created' },
                { stage: 'production', label: 'Cinematic Production', description: 'AI ad generation in progress' },
                { stage: 'revision', label: 'Review & Refinement', description: 'Final adjustments' },
                { stage: 'delivered', label: 'Delivery', description: 'Assets ready for download' }
              ].map((item, idx) => {
                const isCompleted = getProgressPercentage(project.status) >= getProgressPercentage(item.stage);
                const isCurrent = project.status === item.stage;
                
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00]' : 
                      isCurrent ? 'bg-blue-500' : 'bg-gray-700'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-black" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isCurrent ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.label}
                      </h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Campaign Type:</span>
                  <span className="text-white font-semibold">{project.campaign_type}</span>
                </div>
                {project.num_ads && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Number of Ads:</span>
                    <span className="text-white font-semibold">{project.num_ads}</span>
                  </div>
                )}
                {project.languages && project.languages.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Languages:</span>
                    <span className="text-white font-semibold">{project.languages.join(', ')}</span>
                  </div>
                )}
                {project.formats && project.formats.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Formats:</span>
                    <span className="text-white font-semibold">{project.formats.join(', ')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {project.kickoff_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Started:</span>
                    <span className="text-white">{new Date(project.kickoff_date).toLocaleDateString()}</span>
                  </div>
                )}
                {project.target_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Delivery:</span>
                    <span className="text-white">{new Date(project.target_delivery).toLocaleDateString()}</span>
                  </div>
                )}
                {project.actual_delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivered:</span>
                    <span className="text-green-400 font-semibold">{new Date(project.actual_delivery).toLocaleDateString()}</span>
                  </div>
                )}
                {project.revision_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Revisions:</span>
                    <span className="text-white">{project.revision_count}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets Section - Only show if delivered */}
        {project.status === 'delivered' && project.assets_folder_url && (
          <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Your Assets Are Ready! 🎉</h3>
                  <p className="text-gray-300">Download your complete campaign package</p>
                </div>
                <a href={project.assets_folder_url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold">
                    <Download className="w-5 h-5 mr-2" />
                    Download All Assets
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Section */}
        {(project.status === 'delivered' || project.status === 'revision') && (
          <Card className="bg-[#111317] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Share Your Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Rate Your Experience</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setRating(num)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          rating >= num
                            ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Additional Feedback (Optional)</label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your thoughts about the campaign..."
                    className="bg-[#0B0B0C] border-gray-700 text-white h-32"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSubmitFeedback(false)}
                    disabled={!rating || feedbackMutation.isLoading}
                    className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                  
                  {project.status === 'delivered' && (
                    <Button
                      onClick={() => handleSubmitFeedback(true)}
                      disabled={!rating || feedbackMutation.isLoading}
                      variant="outline"
                      className="border-gray-700 text-white"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Revision
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}