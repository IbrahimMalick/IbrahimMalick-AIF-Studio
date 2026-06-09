import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileStack, Zap, AlertCircle } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

export default function ProjectDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // Fetch video projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['videoProjects'],
    queryFn: () => base44.entities.VideoProject.list(),
  });

  // Fetch assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list(),
  });

  // Calculate metrics
  const activeProjects = projects.filter(p => p.status !== 'archived' && p.status !== 'delivered');
  const totalAssets = assets.length;
  const upcomingDeadlines = projects
    .filter(p => p.target_delivery && !isPast(new Date(p.target_delivery)))
    .sort((a, b) => new Date(a.target_delivery) - new Date(b.target_delivery))
    .slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'discovery': return 'bg-blue-500/20 text-blue-400';
      case 'scripting': return 'bg-purple-500/20 text-purple-400';
      case 'production': return 'bg-orange-500/20 text-orange-400';
      case 'revision': return 'bg-yellow-500/20 text-yellow-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDeadlineLabel = (date) => {
    if (isToday(new Date(date))) return 'Today';
    if (isTomorrow(new Date(date))) return 'Tomorrow';
    return format(new Date(date), 'MMM d');
  };

  const isDeadlineSoon = (date) => {
    const daysUntil = Math.floor((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 3 && daysUntil >= 0;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-slate-950 to-[#0B0B0C] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Workspace Dashboard</h1>
          <p className="text-gray-400">Quick overview of your video projects and assets</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Active Projects */}
          <Card className="bg-slate-900/80 border-holographic-cyan/20 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-holographic-cyan" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-holographic-cyan mb-2">
                {activeProjects.length}
              </div>
              <p className="text-sm text-gray-400">In progress or pending</p>
            </CardContent>
          </Card>

          {/* Total Assets */}
          <Card className="bg-slate-900/80 border-holographic-purple/20 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileStack className="w-5 h-5 text-holographic-purple" />
                Total Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-holographic-purple mb-2">
                {totalAssets}
              </div>
              <p className="text-sm text-gray-400">Managed in workspace</p>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-slate-900/80 border-holographic-pink/20 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-holographic-pink" />
                Next Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-holographic-pink mb-1">
                    {getDeadlineLabel(upcomingDeadlines[0].target_delivery)}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {upcomingDeadlines[0].project_name}
                  </p>
                </>
              ) : (
                <div className="text-gray-400">No pending deadlines</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Projects List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/80 border-holographic-cyan/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Current projects in your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {activeProjects.length === 0 ? (
                  <p className="text-gray-400 text-sm">No active projects</p>
                ) : (
                  activeProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 bg-slate-800/50 rounded-lg border border-gray-800 hover:border-holographic-cyan/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white truncate">
                            {project.project_name || project.title || 'Untitled'}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {project.id.slice(0, 8)}...
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(project.status)} text-xs`}>
                          {project.status}
                        </Badge>
                      </div>
                      {project.target_delivery && (
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(project.target_delivery), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <Card className="bg-slate-900/80 border-holographic-pink/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Next 5 deadlines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-gray-400 text-sm">No upcoming deadlines</p>
                ) : (
                  upcomingDeadlines.map((project) => {
                    const isSoon = isDeadlineSoon(project.target_delivery);
                    return (
                      <div
                        key={project.id}
                        className={`p-2 rounded-lg border transition-colors ${
                          isSoon
                            ? 'bg-holographic-pink/10 border-holographic-pink/40'
                            : 'bg-slate-800/50 border-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {project.project_name || project.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {getDeadlineLabel(project.target_delivery)}
                            </p>
                          </div>
                          {isSoon && (
                            <AlertCircle className="w-4 h-4 text-holographic-pink flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}