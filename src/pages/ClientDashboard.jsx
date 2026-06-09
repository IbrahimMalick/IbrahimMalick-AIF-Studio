import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Download,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Rocket
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load client record
      const clients = await base44.entities.Client.filter({
        email: currentUser.email
      });
      if (clients.length > 0) {
        setClientData(clients[0]);
      }
    };
    loadUser();
  }, []);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["clientProjects", clientData?.id],
    queryFn: async () => {
      if (!clientData?.id) return [];
      return await base44.entities.Project.filter({
        client_id: clientData.id
      });
    },
    enabled: !!clientData,
    initialData: []
  });

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

  const activeProjects = projects.filter(p => !['delivered', 'archived'].includes(p.status));
  const completedProjects = projects.filter(p => p.status === 'delivered');

  if (!user || !clientData) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {clientData.contact_name || user.full_name}! 👋
            </h1>
            <p className="text-gray-400">
              {clientData.company_name} • {clientData.tier} tier
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold px-4 py-2">
            {clientData.status === 'active' ? '✨ Active Client' : clientData.status}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Rocket className="w-8 h-8 text-[#FFD700]" />
                <span className="text-3xl font-bold text-white">{activeProjects.length}</span>
              </div>
              <p className="text-gray-400 text-sm">Active Projects</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-[#06D6A0]" />
                <span className="text-3xl font-bold text-white">{completedProjects.length}</span>
              </div>
              <p className="text-gray-400 text-sm">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-[#00D4C9]" />
                <span className="text-3xl font-bold text-white">
                  ${(clientData.lifetime_value || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Lifetime Value</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-[#9D4EDD]" />
                <span className="text-xl font-bold text-white">
                  {activeProjects[0]?.target_delivery ? 
                    new Date(activeProjects[0].target_delivery).toLocaleDateString() : 
                    'N/A'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Next Delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Active Projects</h2>
            <div className="grid gap-4">
              {activeProjects.map((project) => (
                <Card key={project.id} className="bg-[#111317] border-gray-800 hover:border-[#FFD700] transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white">{project.project_name}</h3>
                          <Badge className={statusColors[project.status]}>
                            {project.status}
                          </Badge>
                          {project.priority !== 'standard' && (
                            <Badge className="bg-red-500/20 text-red-400">
                              {project.priority}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{project.campaign_type} campaign</span>
                          </div>
                          {project.num_ads && (
                            <div className="flex items-center gap-2">
                              <span>{project.num_ads} ads</span>
                            </div>
                          )}
                          {project.target_delivery && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(project.target_delivery).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{getProgressPercentage(project.status)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(project.status)} className="h-2" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                          <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Completed Projects</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completedProjects.slice(0, 4).map((project) => (
                <Card key={project.id} className="bg-[#111317] border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{project.project_name}</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Delivered: {project.actual_delivery ? new Date(project.actual_delivery).toLocaleDateString() : 'N/A'}
                        </p>
                        {project.satisfaction_score && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-400">Your rating:</span>
                            <span className="text-[#FFD700] font-bold">{project.satisfaction_score}/10</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                          <Button variant="outline" size="sm" className="border-gray-700 text-white">
                            View
                          </Button>
                        </Link>
                        {project.assets_folder_url && (
                          <a href={project.assets_folder_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="border-gray-700 text-white w-full">
                              <Download className="w-4 h-4 mr-1" />
                              Assets
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold">
                <Rocket className="w-5 h-5 mr-2" />
                Start New Campaign
              </Button>
              <Button variant="outline" className="border-gray-700 text-white">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Call
              </Button>
              <Button variant="outline" className="border-gray-700 text-white">
                <FileText className="w-5 h-5 mr-2" />
                View All Assets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {projects.length === 0 && (
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-12 text-center">
              <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
              <p className="text-gray-400 mb-6">
                You don't have any projects yet. Let's create your first cinematic campaign!
              </p>
              <Button className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold">
                <Rocket className="w-5 h-5 mr-2" />
                Start Your First Project
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}