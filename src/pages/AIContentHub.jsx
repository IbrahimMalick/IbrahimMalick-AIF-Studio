import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles,
  Mail,
  Share2,
  Search,
  Copy,
  CheckCircle2,
  Loader2,
  Download,
  FileDown,
  Send,
  TrendingUp,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Globe,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocialPostGenerator from '@/components/SocialPostGenerator';
import EmailCopyGenerator from '@/components/EmailCopyGenerator';
import SEOMetadataGenerator from '@/components/SEOMetadataGenerator';
import BrandVoiceManager from '@/components/BrandVoiceManager';
import ProductionSummaryDashboard from '@/components/ProductionSummaryDashboard';
import ContentTemplateLibrary from '@/components/ContentTemplateLibrary';
import ContentPDFExport from '@/components/ContentPDFExport';
import ShareContentModal from '@/components/ShareContentModal';

export default function AIContentHub() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('social');
  const [shareCollection, setShareCollection] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: generations = [] } = useQuery({
    queryKey: ['aiContentGenerations', user?.email],
    queryFn: () => base44.entities.AIContentGeneration.filter(
      { user_email: user.email },
      '-created_date',
      50
    ),
    enabled: !!user
  });

  // Added query for brand voice profiles
  const { data: brandVoiceProfiles = [] } = useQuery({
    queryKey: ['brandVoiceProfiles', user?.email],
    queryFn: () => base44.entities.BrandVoiceProfile.filter(
      { user_email: user.email },
      '-created_date'
    ),
    enabled: !!user
  });

  const defaultProfile = brandVoiceProfiles.find(p => p.is_default);

  const { data: assets = [] } = useQuery({
    queryKey: ['assetsForExport'],
    queryFn: () => base44.entities.Asset.list('-created_date', 500),
  });

  const exportAssetsCSV = useCallback(() => {
    const headers = ['Title', 'Type', 'License', 'Published', 'Price', 'Tags', 'File URL', 'Created'];
    const rows = assets.map(a => [
      a.title || '',
      a.file_type || '',
      a.license_type || '',
      a.is_published ? 'Yes' : 'No',
      a.price ?? 0,
      (a.tags || []).join('; '),
      a.file_url || '',
      a.created_date ? new Date(a.created_date).toLocaleDateString() : ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-library-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [assets]);

  const stats = {
    total: generations.length,
    deployed: generations.filter(g => g.status === 'deployed').length,
    social: generations.filter(g => g.generation_type === 'social_post').length,
    email: generations.filter(g => g.generation_type === 'email_copy').length,
    seo: generations.filter(g => g.generation_type === 'seo_metadata').length
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#FFD700]" />
            AI Content Generation Hub
          </h1>
          <p className="text-gray-400">
            Auto-generate social posts, email campaigns, and SEO metadata with AI
          </p>
          </div>
        <Button
          onClick={exportAssetsCSV}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:text-white hover:border-[#FFD700] gap-2 shrink-0"
        >
          <FileDown className="w-4 h-4" />
          Export Assets CSV
        </Button>
        </div>

        {/* Production Summary Dashboard */}
        <ProductionSummaryDashboard />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Generated', value: stats.total, icon: Sparkles, color: 'text-[#FFD700]' },
            { label: 'Deployed', value: stats.deployed, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Social Posts', value: stats.social, icon: Share2, color: 'text-[#00D4C9]' },
            { label: 'Email Copy', value: stats.email, icon: Mail, color: 'text-blue-400' },
            { label: 'SEO Content', value: stats.seo, icon: Search, color: 'text-purple-400' }
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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] border border-gray-800 rounded-xl">
            <TabsTrigger value="social">
              <Share2 className="w-4 h-4 mr-2" />
              Social Posts
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email Copy
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="w-4 h-4 mr-2" />
              SEO Metadata
            </TabsTrigger>
            <TabsTrigger value="brand-voice"> {/* Added Brand Voice tab */}
              <Sparkles className="w-4 h-4 mr-2" />
              Brand Voice
            </TabsTrigger>
            <TabsTrigger value="templates">
              <BookOpen className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history">
              <TrendingUp className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-6 mt-6">
            <SocialPostGenerator user={user} brandVoiceProfile={defaultProfile} /> {/* Passed brandVoiceProfile */}
          </TabsContent>

          <TabsContent value="email" className="space-y-6 mt-6">
            <EmailCopyGenerator user={user} brandVoiceProfile={defaultProfile} /> {/* Passed brandVoiceProfile */}
          </TabsContent>

          <TabsContent value="seo" className="space-y-6 mt-6">
            <SEOMetadataGenerator user={user} brandVoiceProfile={defaultProfile} /> {/* Passed brandVoiceProfile */}
          </TabsContent>

          <TabsContent value="brand-voice" className="space-y-6 mt-6"> {/* Added Brand Voice tab content */}
            <BrandVoiceManager user={user} />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-6">
            <ContentTemplateLibrary
              user={user}
              brandVoiceProfiles={brandVoiceProfiles}
              onApplyTemplate={(template) => {
                setActiveTab(template.generation_type === 'social_post' ? 'social' : template.generation_type === 'email_copy' ? 'email' : template.generation_type === 'seo_metadata' ? 'seo' : 'social');
              }}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-white">Generation History</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShareCollection(true)}
                    disabled={generations.length === 0}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:text-white hover:border-[#00D4C9] gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Collection
                  </Button>
                  <ContentPDFExport generations={generations} user={user} />
                </div>
              </div>
              </CardHeader>
              <CardContent>
                
                {generations.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No content generated yet</p>
                    <p className="text-gray-500 text-sm">
                      Generate your first AI content to see it here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generations.map((gen) => (
                      <motion.div
                        key={gen.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                gen.generation_type === 'social_post' ? 'bg-[#00D4C9]/20 text-[#00D4C9]' :
                                gen.generation_type === 'email_copy' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                              }>
                                {gen.generation_type.replace('_', ' ')}
                              </Badge>
                              <Badge className={
                                gen.status === 'deployed' ? 'bg-green-500/20 text-green-400' :
                                gen.status === 'reviewed' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }>
                                {gen.status}
                              </Badge>
                            </div>
                            <p className="text-white font-medium text-sm">
                              {gen.input_data?.topic || gen.input_data?.product_name || 'Untitled'}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              Generated {new Date(gen.created_date).toLocaleString()}
                            </p>
                          </div>
                          {gen.quality_score && (
                            <div className="text-right">
                              <p className="text-[#FFD700] font-bold text-xl">{gen.quality_score}</p>
                              <p className="text-gray-500 text-xs">Quality</p>
                            </div>
                          )}
                        </div>
                        
                        {gen.engagement_prediction && (
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-800">
                            <div className="text-center">
                              <p className="text-white font-semibold text-sm">
                                {gen.engagement_prediction.estimated_reach?.toLocaleString() || 0}
                              </p>
                              <p className="text-gray-500 text-xs">Est. Reach</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-semibold text-sm">
                                {(gen.engagement_prediction.estimated_engagement_rate * 100)?.toFixed(1) || 0}%
                              </p>
                              <p className="text-gray-500 text-xs">Engagement</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-semibold text-sm">
                                {(gen.engagement_prediction.viral_probability * 100)?.toFixed(0) || 0}%
                              </p>
                              <p className="text-gray-500 text-xs">Viral Prob.</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>

      {shareCollection && user && (
        <ShareContentModal
          user={user}
          resourceId={`collection-${user.email}`}
          resourceName="AI Content Collection"
          shareType="collection"
          onClose={() => setShareCollection(false)}
        />
      )}
    </div>
  );
}