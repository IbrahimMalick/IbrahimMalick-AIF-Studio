import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Upload,
  Loader2,
  Video,
  Share2,
  Mail,
  FileText,
  Image as ImageIcon,
  Music,
  Scissors,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RepurposingEngine from '@/components/RepurposingEngine';
import RepurposedAssetsGrid from '@/components/RepurposedAssetsGrid';

export default function ContentRepurposingStudio() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('video_project');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: videoProjects = [] } = useQuery({
    queryKey: ['videoProjects', user?.email],
    queryFn: () => base44.entities.VideoProject.filter(
      { created_by: user.email },
      '-created_date',
      20
    ),
    enabled: !!user && uploadMethod === 'video_project'
  });

  const { data: repurposingJobs = [] } = useQuery({
    queryKey: ['contentRepurposing', user?.email],
    queryFn: () => base44.entities.ContentRepurposing.filter(
      { user_email: user.email },
      '-created_date',
      50
    ),
    enabled: !!user
  });

  const stats = {
    total_jobs: repurposingJobs.length,
    completed: repurposingJobs.filter(j => j.status === 'completed').length,
    total_assets: repurposingJobs.reduce((sum, j) => sum + (j.total_assets_generated || 0), 0),
    total_deployed: repurposingJobs.reduce((sum, j) => sum + (j.total_deployed || 0), 0),
    time_saved_hours: repurposingJobs.reduce((sum, j) => sum + (j.time_saved_hours || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Scissors className="w-8 h-8 text-[#FFD700]" />
            AI Content Repurposing Engine
          </h1>
          <p className="text-gray-400">
            Transform 1 long video into 50+ pieces of content in minutes
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Jobs', value: stats.total_jobs, icon: Zap, color: 'text-[#FFD700]' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Assets Created', value: stats.total_assets, icon: Sparkles, color: 'text-[#00D4C9]' },
            { label: 'Deployed', value: stats.total_deployed, icon: TrendingUp, color: 'text-purple-400' },
            { label: 'Hours Saved', value: Math.round(stats.time_saved_hours), icon: Clock, color: 'text-blue-400' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Value Proposition */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-white font-bold text-lg mb-3">🚀 50x Content Multiplication</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-[#00D4C9] font-semibold mb-1">📥 Input</p>
                <p className="text-gray-300 text-sm">1 long video (30-60 min)</p>
              </div>
              <div>
                <p className="text-[#FFD700] font-semibold mb-1">⚡ Processing</p>
                <p className="text-gray-300 text-sm">AI analyzes & generates</p>
              </div>
              <div>
                <p className="text-green-400 font-semibold mb-1">📤 Output</p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• 10 short clips (30-60s)</li>
                  <li>• 20 social posts</li>
                  <li>• 5 email campaigns</li>
                  <li>• 1 SEO blog post</li>
                  <li>• 5 quote graphics</li>
                  <li>• 3 audiograms</li>
                  <li>• 5 teaser trailers</li>
                  <li>• Data visualizations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="new">
          <TabsList className="bg-[#111317] border border-gray-800 rounded-xl">
            <TabsTrigger value="new">
              <Upload className="w-4 h-4 mr-2" />
              New Repurposing
            </TabsTrigger>
            <TabsTrigger value="history">
              <BarChart3 className="w-4 h-4 mr-2" />
              History ({repurposingJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-6">
            <RepurposingEngine user={user} videoProjects={videoProjects} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {repurposingJobs.length === 0 ? (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Scissors className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No repurposing jobs yet</p>
                    <p className="text-gray-500 text-sm">Upload your first video to get started</p>
                  </CardContent>
                </Card>
              ) : (
                repurposingJobs.map((job) => (
                  <RepurposedAssetsGrid key={job.id} job={job} user={user} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}