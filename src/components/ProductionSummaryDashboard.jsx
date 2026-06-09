import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Film, CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

export default function ProductionSummaryDashboard() {
  const { data: renderJobs = [] } = useQuery({
    queryKey: ['renderJobsSummary'],
    queryFn: () => base44.entities.RenderJob.list('-created_date', 100),
    refetchInterval: 30000
  });

  const { data: videoProjects = [] } = useQuery({
    queryKey: ['videoProjectsSummary'],
    queryFn: () => base44.entities.VideoProject.list('-created_date', 50),
    refetchInterval: 30000
  });

  const totalRenders = renderJobs.length;
  const activeProjects = videoProjects.filter(p => p.status === 'rendering' || p.status === 'draft').length;
  const completedRenders = renderJobs.filter(j => j.status === 'completed').length;
  const processingRenders = renderJobs.filter(j => j.status === 'processing').length;

  const now = new Date();
  const upcomingDeadlines = videoProjects
    .filter(p => p.target_delivery && p.status !== 'completed')
    .map(p => ({ ...p, daysLeft: differenceInDays(new Date(p.target_delivery), now) }))
    .filter(p => p.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  const urgentCount = upcomingDeadlines.filter(p => p.daysLeft <= 3).length;

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Renders', value: totalRenders, icon: Film, color: 'text-[#FFD700]' },
          { label: 'Completed', value: completedRenders, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Processing', value: processingRenders, icon: Clock, color: 'text-blue-400' },
          { label: 'Active Projects', value: activeProjects, icon: Layers, color: 'text-[#00D4C9]' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="bg-[#111317] border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Deadlines */}
      <Card className="bg-[#111317] border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${urgentCount > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
            Upcoming Production Deadlines
            {urgentCount > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 text-xs ml-1">
                {urgentCount} urgent
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingDeadlines.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No upcoming deadlines</p>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0B0B0C] border border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">{project.title}</p>
                      <p className="text-gray-500 text-xs">{format(new Date(project.target_delivery), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <Badge className={
                    project.daysLeft === 0 ? 'bg-red-500/20 text-red-400' :
                    project.daysLeft <= 3 ? 'bg-orange-500/20 text-orange-400' :
                    project.daysLeft <= 7 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-700 text-gray-400'
                  }>
                    {project.daysLeft === 0 ? 'Today' : `${project.daysLeft}d left`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}