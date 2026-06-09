import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Target,
  TrendingUp,
  AlertCircle,
  MapPin,
  FileText,
  BarChart3,
  Zap,
  Plus,
  Search
} from 'lucide-react';
import CompetitorAnalyzer from '@/components/CompetitorAnalyzer';
import CompetitorReportViewer from '@/components/CompetitorReportViewer';

export default function CompetitorIntelligence() {
  const [user, setUser] = useState(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const queryClient = useQueryClient();

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

  const { data: competitors = [] } = useQuery({
    queryKey: ['competitorProfiles', user?.email],
    queryFn: () => base44.entities.CompetitorProfile.filter({ user_email: user.email }),
    enabled: !!user
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['competitorReports', user?.email],
    queryFn: () => base44.entities.CompetitorAnalysisReport.filter({ user_email: user.email }, '-analysis_date', 10),
    enabled: !!user
  });

  const analyzeCompetitorMutation = useMutation({
    mutationFn: async (competitorId) => {
      const competitor = competitors.find(c => c.id === competitorId);
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze competitor: ${competitor.competitor_name} (${competitor.competitor_url})
        
Platforms: ${competitor.platforms_tracked?.join(', ')}
Industry: ${competitor.industry}

Provide a comprehensive competitive analysis.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            overall_strategy_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            market_gaps: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      return await base44.entities.CompetitorAnalysisReport.create({
        user_email: user.email,
        competitor_profile_id: competitorId,
        overall_strategy_score: analysis.overall_strategy_score || 75,
        competitor_strengths: analysis.strengths?.map(s => ({ strength: s, category: 'content', impact_level: 'high' })) || [],
        competitor_weaknesses: analysis.weaknesses?.map(w => ({ weakness: w, category: 'content', opportunity_level: 'high', how_to_exploit: 'Create better content' })) || [],
        market_gaps: analysis.market_gaps?.map(g => ({ gap_type: 'content', description: g, opportunity_size: 'large', competition_level: 'low', suggested_approach: 'Create targeted content' })) || [],
        counterstrategy_recommendations: analysis.recommendations?.map((r, i) => ({
          recommendation_id: `rec_${Date.now()}_${i}`,
          priority: i + 1,
          category: 'content_strategy',
          title: r,
          description: r,
          effort_required: 'medium',
          roi_score: 85
        })) || []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitorReports'] });
    }
  });

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Eye className="w-8 h-8 text-[#9D4EDD]" />
            Competitor Intelligence
          </h1>
          <p className="text-gray-400">Deep competitive analysis and market gap discovery</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="gap_finder">
              <Target className="w-4 h-4 mr-2" />
              Gap Finder
            </TabsTrigger>
            <TabsTrigger value="market_map">
              <MapPin className="w-4 h-4 mr-2" />
              Market Map
            </TabsTrigger>
            <TabsTrigger value="spy_reports">
              <FileText className="w-4 h-4 mr-2" />
              AI Spy Reports
            </TabsTrigger>
            <TabsTrigger value="analyzer">
              <Search className="w-4 h-4 mr-2" />
              Live Analyzer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <Eye className="w-8 h-8 text-[#9D4EDD] mb-2" />
                  <p className="text-3xl font-bold text-white">{competitors.length}</p>
                  <p className="text-gray-400 text-sm">Competitors Tracked</p>
                </CardContent>
              </Card>
              
              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <FileText className="w-8 h-8 text-[#00D4C9] mb-2" />
                  <p className="text-3xl font-bold text-white">{reports.length}</p>
                  <p className="text-gray-400 text-sm">AI Reports Generated</p>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <Target className="w-8 h-8 text-[#FFD700] mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {reports.reduce((sum, r) => sum + (r.market_gaps?.length || 0), 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Market Gaps Found</p>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-xl">
                <CardContent className="p-6">
                  <Zap className="w-8 h-8 text-[#06D6A0] mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {reports.reduce((sum, r) => sum + (r.counterstrategy_recommendations?.length || 0), 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Action Items</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Tracked Competitors</CardTitle>
                  <Button
                    onClick={() => setActiveTab('analyzer')}
                    className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Competitor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#9D4EDD] transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedCompetitor(comp);
                        setActiveTab('spy_reports');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-1">{comp.competitor_name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{comp.competitor_url}</p>
                          <div className="flex gap-2 flex-wrap">
                            {comp.platforms_tracked?.map((platform, idx) => (
                              <Badge key={idx} className="bg-blue-500/20 text-blue-400 text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            analyzeCompetitorMutation.mutate(comp.id);
                          }}
                          disabled={analyzeCompetitorMutation.isPending}
                          className="bg-[#9D4EDD] hover:bg-[#9D4EDD]/80"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                  ))}

                  {competitors.length === 0 && (
                    <div className="text-center py-12">
                      <Eye className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 mb-4">No competitors tracked yet</p>
                      <Button onClick={() => setActiveTab('analyzer')}>
                        Add Your First Competitor
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="gap_finder" className="space-y-6">
            <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-[#FFD700]" />
                  Market Gap Finder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.flatMap(report => 
                    (report.market_gaps || []).map((gap, idx) => (
                      <div key={`${report.id}-${idx}`} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-green-500/20 text-green-400">
                                {gap.opportunity_size} opportunity
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400">
                                {gap.competition_level} competition
                              </Badge>
                            </div>
                            <h4 className="text-white font-bold mb-1 capitalize">{gap.gap_type} Gap</h4>
                            <p className="text-gray-300 text-sm mb-2">{gap.description}</p>
                            <div className="p-3 bg-[#111317] rounded-lg border-l-2 border-[#FFD700]">
                              <p className="text-[#FFD700] text-xs font-semibold mb-1">💡 Suggested Approach:</p>
                              <p className="text-gray-400 text-sm">{gap.suggested_approach}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {reports.length === 0 && (
                    <div className="text-center py-12">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400 mb-2">No market gaps identified yet</p>
                      <p className="text-gray-500 text-sm mb-4">Run competitor analysis to discover opportunities</p>
                      <Button onClick={() => setActiveTab('analyzer')}>
                        Start Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market_map" className="space-y-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-[#00D4C9]" />
                  Competitive Market Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4">Competitive Positioning Matrix</h3>
                  <div className="relative w-full h-96 bg-[#0B0B0C] rounded-xl border border-gray-800 p-8">
                    
                    <div className="absolute bottom-8 left-8 right-8 h-px bg-gray-700" />
                    <div className="absolute bottom-8 left-8 top-8 w-px bg-gray-700" />
                    
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs">
                      Content Quality →
                    </div>

                    {reports.map((report, idx) => {
                      const x = 20 + (report.overall_strategy_score || 50);
                      const y = 20 + Math.random() * 60;
                      
                      return (
                        <div
                          key={idx}
                          className="absolute w-3 h-3 rounded-full bg-[#9D4EDD]"
                          style={{ left: `${x}%`, bottom: `${y}%` }}
                        />
                      );
                    })}

                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Your Advantages
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-gray-300">• AI-powered automation</li>
                      <li className="text-gray-300">• Multi-platform integration</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-gray-300">• Content frequency</li>
                      <li className="text-gray-300">• Audience engagement</li>
                    </ul>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spy_reports" className="space-y-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#9D4EDD]" />
                    AI-Generated Spy Reports
                  </CardTitle>
                  <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
                    {reports.length} Reports
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                
                {selectedCompetitor ? (
                  <CompetitorReportViewer 
                    competitor={selectedCompetitor}
                    reports={reports.filter(r => r.competitor_profile_id === selectedCompetitor.id)}
                  />
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const competitor = competitors.find(c => c.id === report.competitor_profile_id);
                      
                      return (
                        <div
                          key={report.id}
                          className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#9D4EDD] transition-all cursor-pointer"
                          onClick={() => setSelectedCompetitor(competitor)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-bold mb-1">{competitor?.competitor_name}</h3>
                              <p className="text-gray-400 text-sm mb-2">
                                Analyzed: {new Date(report.analysis_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white mb-1">
                                {report.overall_strategy_score}/100
                              </div>
                              <p className="text-gray-500 text-xs">Strategy Score</p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-3">
                            <div className="p-3 bg-[#111317] rounded-lg">
                              <p className="text-green-400 text-xs mb-1">Strengths</p>
                              <p className="text-white font-bold">{report.competitor_strengths?.length || 0}</p>
                            </div>
                            <div className="p-3 bg-[#111317] rounded-lg">
                              <p className="text-yellow-400 text-xs mb-1">Weaknesses</p>
                              <p className="text-white font-bold">{report.competitor_weaknesses?.length || 0}</p>
                            </div>
                            <div className="p-3 bg-[#111317] rounded-lg">
                              <p className="text-[#00D4C9] text-xs mb-1">Opportunities</p>
                              <p className="text-white font-bold">{report.market_gaps?.length || 0}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {reports.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-2">No spy reports generated yet</p>
                        <Button onClick={() => setActiveTab('analyzer')}>
                          Start Analysis
                        </Button>
                      </div>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyzer">
            {user && <CompetitorAnalyzer user={user} />}
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}