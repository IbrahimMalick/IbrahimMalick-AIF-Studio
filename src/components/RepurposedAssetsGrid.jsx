import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Scissors,
  Share2,
  Mail,
  FileText,
  Image as ImageIcon,
  Music,
  Film,
  Download,
  Send,
  Copy,
  CheckCircle2,
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RepurposedAssetsGrid({ job, user }) {
  const queryClient = useQueryClient();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedClip, setSelectedClip] = useState(null);

  const assets = job.generated_assets || {};
  const assetCounts = {
    clips: assets.short_clips?.length || 0,
    posts: assets.social_posts?.length || 0,
    emails: assets.email_sequences?.length || 0,
    blog: assets.blog_post ? 1 : 0,
    quotes: assets.quote_graphics?.length || 0,
    audiograms: assets.audiograms?.length || 0,
    trailers: assets.teaser_trailers?.length || 0
  };

  const deployClipMutation = useMutation({
    mutationFn: async ({ clip, platform }) => {
      const scheduledPost = await base44.entities.ScheduledPost.create({
        user_email: user.email,
        content_type: 'short',
        content_url: clip.video_url,
        title: clip.title,
        caption: clip.hook,
        platforms: [platform],
        status: 'draft',
        source_entity_type: 'ContentRepurposing',
        source_entity_id: job.id
      });

      return scheduledPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts']);
      alert('✅ Clip saved to Social Media! Add final touches and publish.');
    }
  });

  const deployPostMutation = useMutation({
    mutationFn: async (post) => {
      const scheduledPost = await base44.entities.ScheduledPost.create({
        user_email: user.email,
        content_type: 'post',
        content_url: '',
        caption: post.copy,
        hashtags: post.hashtags,
        platforms: [post.platform],
        status: 'draft',
        source_entity_type: 'ContentRepurposing',
        source_entity_id: job.id
      });

      return scheduledPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts']);
      alert('✅ Post saved to Social Media!');
    }
  });

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white mb-2">{job.source_title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={
                job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }>
                {job.status.replace(/_/g, ' ')}
              </Badge>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                {job.total_assets_generated} assets
              </Badge>
              <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                {job.total_deployed} deployed
              </Badge>
              {job.time_saved_hours && (
                <Badge className="bg-blue-500/20 text-blue-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.round(job.time_saved_hours)}h saved
                </Badge>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            {new Date(job.created_date).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        
        {job.status === 'completed' ? (
          <Tabs defaultValue="clips">
            <TabsList className="bg-[#0B0B0C]">
              <TabsTrigger value="clips">
                <Scissors className="w-4 h-4 mr-1" />
                Clips ({assetCounts.clips})
              </TabsTrigger>
              <TabsTrigger value="posts">
                <Share2 className="w-4 h-4 mr-1" />
                Posts ({assetCounts.posts})
              </TabsTrigger>
              <TabsTrigger value="emails">
                <Mail className="w-4 h-4 mr-1" />
                Emails ({assetCounts.emails})
              </TabsTrigger>
              <TabsTrigger value="blog">
                <FileText className="w-4 h-4 mr-1" />
                Blog ({assetCounts.blog})
              </TabsTrigger>
              <TabsTrigger value="more">
                More ({assetCounts.quotes + assetCounts.audiograms + assetCounts.trailers})
              </TabsTrigger>
            </TabsList>

            {/* Short Clips Tab */}
            <TabsContent value="clips" className="space-y-3 mt-4">
              <div className="grid md:grid-cols-2 gap-3">
                {assets.short_clips?.map((clip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="text-white font-semibold text-sm mb-1">{clip.title}</h5>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {clip.duration_seconds}s
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs capitalize">
                            {clip.platform_optimized_for}
                          </Badge>
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                            {clip.aspect_ratio}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedClip(clip)}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-400 text-xs mb-3">{clip.hook}</p>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-2 bg-[#111317] rounded">
                        <p className="text-green-400 font-bold text-sm">{clip.viral_score}</p>
                        <p className="text-gray-500 text-xs">Viral Score</p>
                      </div>
                      <div className="text-center p-2 bg-[#111317] rounded">
                        <p className="text-blue-400 font-bold text-sm">
                          {(clip.engagement_prediction || 0).toFixed(1)}%
                        </p>
                        <p className="text-gray-500 text-xs">Pred. Engage</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => deployClipMutation.mutate({ clip, platform: clip.platform_optimized_for })}
                        className="bg-[#00D4C9] hover:bg-[#00D4C9]/80 text-black text-xs rounded-lg"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Deploy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(clip.video_url, '_blank')}
                        className="border-gray-700 text-xs rounded-lg"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Social Posts Tab */}
            <TabsContent value="posts" className="space-y-3 mt-4">
              {assets.social_posts?.map((post, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] capitalize text-xs">
                      {post.platform}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(post.copy + '\n\n' + post.hashtags.join(' '), `post-${idx}`)}
                        className="h-7 w-7 p-0"
                      >
                        {copiedIndex === `post-${idx}` ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => deployPostMutation.mutate(post)}
                        className="bg-green-500 hover:bg-green-600 text-white h-7 px-2 text-xs"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Deploy
                      </Button>
                    </div>
                  </div>

                  <p className="text-white text-sm mb-2 leading-relaxed whitespace-pre-wrap">
                    {post.copy}
                  </p>

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.hashtags.map((tag, tagIdx) => (
                        <Badge key={tagIdx} className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {post.optimal_time && (
                    <p className="text-gray-500 text-xs">
                      ⏰ Best time: {post.optimal_time}
                    </p>
                  )}
                </motion.div>
              ))}
            </TabsContent>

            {/* Email Sequences Tab */}
            <TabsContent value="emails" className="space-y-3 mt-4">
              {assets.email_sequences?.map((email, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs mb-2">
                        Day {email.day_in_sequence}
                      </Badge>
                      <h5 className="text-white font-semibold">{email.subject_line}</h5>
                      <p className="text-gray-500 text-xs mt-1">{email.preview_text}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(email.body_text, `email-${idx}`)}
                      className="h-7 w-7 p-0"
                    >
                      {copiedIndex === `email-${idx}` ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>

                  <div className="p-3 bg-[#111317] rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-gray-300 text-xs whitespace-pre-wrap">
                      {email.body_text}
                    </p>
                  </div>

                  {email.cta_text && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                      <p className="text-green-400 text-xs font-medium">
                        CTA: {email.cta_text}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </TabsContent>

            {/* Blog Post Tab */}
            <TabsContent value="blog" className="mt-4">
              {assets.blog_post ? (
                <div className="space-y-4">
                  <Card className="bg-[#0B0B0C] border-gray-800 rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {assets.blog_post.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">
                            {assets.blog_post.meta_description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-purple-500/20 text-purple-400">
                              SEO Score: {assets.blog_post.seo_score}/100
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400">
                              {assets.blog_post.reading_time_minutes} min read
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400">
                              Focus: {assets.blog_post.focus_keyword}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(assets.blog_post.content_markdown, 'blog')}
                        >
                          {copiedIndex === 'blog' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-500 text-xs mb-2">SEO Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {assets.blog_post.seo_keywords?.map((keyword, idx) => (
                            <Badge key={idx} className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="prose prose-sm prose-invert max-w-none max-h-96 overflow-y-auto p-4 bg-[#111317] rounded-lg">
                        <div dangerouslySetInnerHTML={{ __html: assets.blog_post.content_html }} />
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                          onClick={() => copyToClipboard(assets.blog_post.content_markdown, 'blog-md')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Markdown
                        </Button>
                        <Button
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          onClick={async () => {
                            await base44.entities.SEOMetadata.create({
                              page_path: `/blog/${assets.blog_post.title.toLowerCase().replace(/\s+/g, '-')}`,
                              title: assets.blog_post.title,
                              description: assets.blog_post.meta_description,
                              keywords: assets.blog_post.seo_keywords,
                              og_title: assets.blog_post.title,
                              og_description: assets.blog_post.meta_description
                            });
                            alert('✅ Blog SEO metadata saved!');
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Save SEO
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Blog post generation was disabled</p>
              )}
            </TabsContent>

            {/* More Assets Tab */}
            <TabsContent value="more" className="space-y-4 mt-4">
              
              {/* Quote Graphics */}
              {assets.quote_graphics && assets.quote_graphics.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    Quote Graphics ({assets.quote_graphics.length})
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {assets.quote_graphics.map((quote, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <p className="text-white italic mb-2">"{quote.quote_text}"</p>
                        <p className="text-gray-500 text-xs mb-2">— {quote.speaker}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-700 text-xs rounded-lg"
                            onClick={() => copyToClipboard(quote.quote_text, `quote-${idx}`)}
                          >
                            {copiedIndex === `quote-${idx}` ? (
                              <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 mr-1" />
                            )}
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-pink-500 text-white text-xs rounded-lg"
                            onClick={() => alert('Generate graphic using AI Art → Create quote graphic')}
                          >
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Design
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audiograms */}
              {assets.audiograms && assets.audiograms.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Music className="w-5 h-5 text-green-400" />
                    Audiograms ({assets.audiograms.length})
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {assets.audiograms.map((audio, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 text-center">
                        <Music className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <p className="text-white font-medium text-sm mb-1">Audiogram {idx + 1}</p>
                        <p className="text-gray-400 text-xs mb-3">{audio.duration_seconds}s</p>
                        <Button
                          size="sm"
                          className="w-full bg-green-500 text-white text-xs rounded-lg"
                        >
                          Generate Waveform
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teaser Trailers */}
              {assets.teaser_trailers && assets.teaser_trailers.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-[#FFD700]" />
                    Teaser Trailers ({assets.teaser_trailers.length})
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {assets.teaser_trailers.map((trailer, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] capitalize text-xs">
                            {trailer.trailer_type}
                          </Badge>
                          <Badge className="bg-gray-700 text-gray-300 text-xs">
                            {trailer.duration_seconds}s
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs mb-3 capitalize">
                          Hook: {trailer.hook_style}
                        </p>
                        <Button
                          size="sm"
                          className="w-full bg-[#FFD700] text-black text-xs rounded-lg"
                        >
                          <Film className="w-3 h-3 mr-1" />
                          Generate
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </TabsContent>

          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {job.status === 'failed' ? '❌ Repurposing failed' : '⏳ Processing...'}
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}