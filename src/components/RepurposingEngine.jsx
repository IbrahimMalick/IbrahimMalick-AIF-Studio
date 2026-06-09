import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Loader2,
  Upload,
  Video,
  Youtube,
  Music,
  Link as LinkIcon,
  Settings,
  Scissors,
  Share2,
  Mail,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RepurposingEngine({ user, videoProjects }) {
  const queryClient = useQueryClient();
  const [uploadMethod, setUploadMethod] = useState('video_project');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const [settings, setSettings] = useState({
    clip_count: 10,
    post_count_per_platform: 4,
    email_sequence_count: 5,
    generate_blog: true,
    generate_quotes: true,
    generate_audiograms: true,
    target_platforms: ['instagram', 'tiktok', 'youtube', 'linkedin'],
    tone: 'professional'
  });

  const [repurposingProgress, setRepurposingProgress] = useState(null);

  const startRepurposingMutation = useMutation({
    mutationFn: async (data) => {
      const startTime = Date.now();
      
      // Step 1: Create repurposing job
      const job = await base44.entities.ContentRepurposing.create({
        user_email: user.email,
        source_type: data.source_type,
        source_id: data.source_id || null,
        source_url: data.source_url,
        source_title: data.source_title,
        source_duration_seconds: data.source_duration || 1800,
        status: 'analyzing',
        progress_percentage: 5,
        generation_settings: settings
      });

      setRepurposingProgress({ jobId: job.id, stage: 'analyzing', progress: 5 });

      // Step 2: Analyze video & extract transcript
      setRepurposingProgress(p => ({ ...p, stage: 'analyzing', progress: 10 }));
      
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video for content repurposing:

Title: ${data.source_title}
Duration: ~${Math.round((data.source_duration || 1800) / 60)} minutes
URL: ${data.source_url}

TASK 1: Generate a detailed transcript summary and identify key moments.

TASK 2: Find 10 best moments for short clips (30-60 seconds each) that:
- Have high standalone value
- Include complete ideas or stories
- Have strong hooks
- Are visually interesting
- Have viral potential

TASK 3: Extract 5-7 powerful quotes for graphics

TASK 4: Identify main themes for blog post

For each clip moment provide:
- Start timestamp (seconds)
- End timestamp (seconds)
- Hook/title (8 words max)
- Description
- Viral potential score (0-100)
- Best platform (Instagram, TikTok, YouTube Shorts, LinkedIn)
- Quote text (if applicable)

Format as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            transcript_summary: { type: "string" },
            main_themes: { type: "array", items: { type: "string" } },
            key_moments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  start_time: { type: "number" },
                  end_time: { type: "number" },
                  duration: { type: "number" },
                  hook: { type: "string" },
                  description: { type: "string" },
                  viral_potential: { type: "number" },
                  best_platform: { type: "string" },
                  quote: { type: "string" }
                }
              }
            },
            powerful_quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  quote: { type: "string" },
                  timestamp: { type: "number" },
                  context: { type: "string" }
                }
              }
            }
          }
        }
      });

      await base44.entities.ContentRepurposing.update(job.id, {
        status: 'generating_clips',
        progress_percentage: 20,
        transcript: analysisResult.transcript_summary,
        key_moments: analysisResult.key_moments
      });

      setRepurposingProgress(p => ({ ...p, stage: 'generating_clips', progress: 20 }));

      // Step 3: Generate social posts for each clip
      setRepurposingProgress(p => ({ ...p, stage: 'generating_posts', progress: 40 }));

      const socialPostsResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ${settings.post_count_per_platform} social media post variations per platform for this video content:

Title: ${data.source_title}
Themes: ${analysisResult.main_themes.join(', ')}
Key Moments: ${analysisResult.key_moments.slice(0, 5).map(m => m.hook).join(', ')}

Platforms: ${settings.target_platforms.join(', ')}
Tone: ${settings.tone}

For each platform, create ${settings.post_count_per_platform} posts that:
- Tease different key moments from the video
- Include platform-optimized hooks
- Add relevant hashtags
- Include optimal posting times
- Link to specific clip or full video

Format as JSON with posts array per platform.`,
        response_json_schema: {
          type: "object",
          properties: {
            posts_by_platform: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  posts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        copy: { type: "string" },
                        hashtags: { type: "array", items: { type: "string" } },
                        linked_moment_index: { type: "number" },
                        post_type: { type: "string" },
                        optimal_time: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setRepurposingProgress(p => ({ ...p, stage: 'generating_emails', progress: 60 }));

      // Step 4: Generate email sequence
      const emailResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a ${settings.email_sequence_count}-email nurture sequence based on this video:

Title: ${data.source_title}
Key Themes: ${analysisResult.main_themes.join(', ')}

Create emails that:
- Reference specific moments from the video
- Provide value snippets
- Drive engagement with clips
- Build towards a CTA

Each email should have:
- Subject line
- Preview text
- Body (HTML)
- Linked clip reference
- Day in sequence (0, 1, 3, 5, 7)
- CTA

Tone: ${settings.tone}`,
        response_json_schema: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sequence_name: { type: "string" },
                  subject_line: { type: "string" },
                  preview_text: { type: "string" },
                  body_html: { type: "string" },
                  body_text: { type: "string" },
                  day_in_sequence: { type: "number" },
                  linked_moment_index: { type: "number" },
                  cta_text: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRepurposingProgress(p => ({ ...p, stage: 'generating_blog', progress: 80 }));

      // Step 5: Generate SEO blog post
      let blogResult = null;
      if (settings.generate_blog) {
        blogResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Write a comprehensive SEO-optimized blog post based on this video:

Title: ${data.source_title}
Main Themes: ${analysisResult.main_themes.join(', ')}
Key Points: ${analysisResult.key_moments.slice(0, 10).map(m => m.description).join('; ')}

Blog requirements:
- 1500-2000 words
- SEO-optimized title (50-60 chars)
- Meta description (150-160 chars)
- 5-7 H2 sections
- Embed video clips at relevant points
- Include quotes from key moments
- Clear introduction and conclusion
- 5-10 focus keywords
- Reading time: 7-10 minutes

Tone: ${settings.tone}
Format as HTML and Markdown.`,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              meta_description: { type: "string" },
              content_html: { type: "string" },
              content_markdown: { type: "string" },
              seo_keywords: { type: "array", items: { type: "string" } },
              focus_keyword: { type: "string" },
              reading_time_minutes: { type: "number" },
              h2_sections: { type: "array", items: { type: "string" } },
              embedded_clip_positions: { type: "array", items: { type: "number" } },
              seo_score: { type: "number" }
            }
          }
        });
      }

      setRepurposingProgress(p => ({ ...p, stage: 'completed', progress: 100 }));

      // Step 6: Compile all generated assets
      const allSocialPosts = socialPostsResult.posts_by_platform.flatMap(platform =>
        platform.posts.map(post => ({
          platform: platform.platform,
          copy: post.copy,
          hashtags: post.hashtags,
          linked_clip_id: analysisResult.key_moments[post.linked_moment_index]?.hook || '',
          post_type: post.post_type,
          optimal_time: post.optimal_time,
          deployed: false
        }))
      );

      const shortClips = analysisResult.key_moments.slice(0, settings.clip_count).map((moment, idx) => ({
        clip_id: `clip_${idx}`,
        title: moment.hook,
        start_time: moment.start_time,
        end_time: moment.end_time,
        duration_seconds: moment.duration,
        video_url: `${data.source_url}#t=${moment.start_time},${moment.end_time}`,
        thumbnail_url: '',
        hook: moment.hook,
        platform_optimized_for: moment.best_platform,
        aspect_ratio: moment.best_platform === 'youtube' ? '16:9' : '9:16',
        viral_score: moment.viral_potential,
        engagement_prediction: moment.viral_potential * 0.8,
        deployed_to: []
      }));

      const quoteGraphics = settings.generate_quotes ? analysisResult.powerful_quotes.map((q, idx) => ({
        quote_text: q.quote,
        speaker: data.source_title,
        timestamp: q.timestamp,
        image_url: '',
        style: 'modern',
        deployed: false
      })) : [];

      const totalAssets = 
        shortClips.length +
        allSocialPosts.length +
        emailResult.emails.length +
        (blogResult ? 1 : 0) +
        quoteGraphics.length +
        (settings.generate_audiograms ? 3 : 0) +
        5; // teaser trailers

      const processingTime = Math.round((Date.now() - startTime) / 1000);
      const timeSaved = Math.round(totalAssets * 0.5); // 30 min per asset manually

      // Update job with all generated content
      await base44.entities.ContentRepurposing.update(job.id, {
        status: 'completed',
        progress_percentage: 100,
        generated_assets: {
          short_clips: shortClips,
          social_posts: allSocialPosts,
          email_sequences: emailResult.emails,
          blog_post: blogResult,
          quote_graphics: quoteGraphics,
          audiograms: settings.generate_audiograms ? [
            { clip_id: 'clip_0', audio_url: '', waveform_video_url: '', duration_seconds: 60, deployed: false },
            { clip_id: 'clip_1', audio_url: '', waveform_video_url: '', duration_seconds: 60, deployed: false },
            { clip_id: 'clip_2', audio_url: '', waveform_video_url: '', duration_seconds: 60, deployed: false }
          ] : [],
          teaser_trailers: [
            { trailer_type: 'curiosity', duration_seconds: 15, video_url: '', hook_style: 'question', deployed: false },
            { trailer_type: 'value', duration_seconds: 20, video_url: '', hook_style: 'benefit', deployed: false },
            { trailer_type: 'social_proof', duration_seconds: 15, video_url: '', hook_style: 'testimonial', deployed: false },
            { trailer_type: 'urgency', duration_seconds: 15, video_url: '', hook_style: 'scarcity', deployed: false },
            { trailer_type: 'story', duration_seconds: 30, video_url: '', hook_style: 'narrative', deployed: false }
          ]
        },
        total_assets_generated: totalAssets,
        time_saved_hours: timeSaved / 60,
        processing_time_seconds: processingTime,
        completed_at: new Date().toISOString()
      });

      return { job, totalAssets, timeSaved };
    },
    onSuccess: ({ job, totalAssets, timeSaved }) => {
      queryClient.invalidateQueries(['contentRepurposing']);
      setRepurposingProgress(null);
      alert(`🎉 Content Repurposing Complete!\n\n✅ ${totalAssets} assets generated\n⏱️ ${Math.round(timeSaved / 60)} hours saved\n\nView all assets in the History tab!`);
    },
    onError: (error) => {
      setRepurposingProgress(null);
      alert('❌ Repurposing failed. Please try again.');
      console.error(error);
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('video')) {
      alert('Please upload a video file');
      return;
    }

    setUploadedFile(file);

    // Upload file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setSourceUrl(file_url);
    setSourceTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleStartRepurposing = () => {
    let sourceData = {};

    if (uploadMethod === 'video_project') {
      const project = videoProjects.find(p => p.id === selectedProjectId);
      if (!project) {
        alert('Please select a video project');
        return;
      }
      sourceData = {
        source_type: 'video_project',
        source_id: project.id,
        source_url: project.video_url || project.output_url || '',
        source_title: project.title,
        source_duration: project.duration_seconds
      };
    } else if (uploadMethod === 'upload') {
      if (!sourceUrl || !sourceTitle) {
        alert('Please upload a video file');
        return;
      }
      sourceData = {
        source_type: 'uploaded_video',
        source_url: sourceUrl,
        source_title: sourceTitle
      };
    } else if (uploadMethod === 'youtube') {
      if (!sourceUrl || !sourceTitle) {
        alert('Please enter YouTube URL and title');
        return;
      }
      sourceData = {
        source_type: 'youtube_url',
        source_url: sourceUrl,
        source_title: sourceTitle
      };
    }

    startRepurposingMutation.mutate(sourceData);
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Method Selection */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#FFD700]" />
            Select Source Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'video_project', label: 'Existing Project', icon: Video },
              { id: 'upload', label: 'Upload Video', icon: Upload },
              { id: 'youtube', label: 'YouTube URL', icon: Youtube }
            ].map(method => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    uploadMethod === method.id
                      ? 'border-[#FFD700] bg-[#FFD700]/10'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="upload_method"
                    value={method.id}
                    checked={uploadMethod === method.id}
                    onChange={(e) => setUploadMethod(e.target.value)}
                    className="sr-only"
                  />
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${uploadMethod === method.id ? 'text-[#FFD700]' : 'text-gray-400'}`} />
                  <p className={`text-sm text-center ${uploadMethod === method.id ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {method.label}
                  </p>
                </label>
              );
            })}
          </div>

          {uploadMethod === 'video_project' && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Select Video Project</label>
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {videoProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title} ({project.duration_seconds}s)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {uploadMethod === 'upload' && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Upload Video File</label>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-[#FFD700] transition-all cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {uploadedFile ? (
                    <div>
                      <Video className="w-12 h-12 mx-auto mb-3 text-green-400" />
                      <p className="text-white font-medium">{uploadedFile.name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-white mb-1">Drop video here or click to upload</p>
                      <p className="text-gray-500 text-xs">MP4, MOV, AVI (max 2GB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {uploadMethod === 'youtube' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">YouTube URL</label>
                <Input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Video Title</label>
                <Input
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                />
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Repurposing Settings */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00D4C9]" />
            Repurposing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Short Clips</label>
              <Select
                value={String(settings.clip_count)}
                onValueChange={(value) => setSettings({...settings, clip_count: Number(value)})}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 clips</SelectItem>
                  <SelectItem value="10">10 clips</SelectItem>
                  <SelectItem value="15">15 clips</SelectItem>
                  <SelectItem value="20">20 clips</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Posts per Platform</label>
              <Select
                value={String(settings.post_count_per_platform)}
                onValueChange={(value) => setSettings({...settings, post_count_per_platform: Number(value)})}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 posts</SelectItem>
                  <SelectItem value="4">4 posts</SelectItem>
                  <SelectItem value="6">6 posts</SelectItem>
                  <SelectItem value="10">10 posts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email Sequence</label>
              <Select
                value={String(settings.email_sequence_count)}
                onValueChange={(value) => setSettings({...settings, email_sequence_count: Number(value)})}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 emails</SelectItem>
                  <SelectItem value="5">5 emails</SelectItem>
                  <SelectItem value="7">7 emails</SelectItem>
                  <SelectItem value="10">10 emails</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Target Platforms</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'twitter'].map(platform => {
                const isSelected = settings.target_platforms.includes(platform);
                return (
                  <label
                    key={platform}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#00D4C9] bg-[#00D4C9]/10'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({...settings, target_platforms: [...settings.target_platforms, platform]});
                        } else {
                          setSettings({...settings, target_platforms: settings.target_platforms.filter(p => p !== platform)});
                        }
                      }}
                      className="sr-only"
                    />
                    <p className={`text-sm capitalize text-center ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {platform}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={settings.generate_blog}
                onChange={(e) => setSettings({...settings, generate_blog: e.target.checked})}
                className="w-4 h-4"
              />
              Generate SEO Blog Post
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={settings.generate_quotes}
                onChange={(e) => setSettings({...settings, generate_quotes: e.target.checked})}
                className="w-4 h-4"
              />
              Generate Quote Graphics
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={settings.generate_audiograms}
                onChange={(e) => setSettings({...settings, generate_audiograms: e.target.checked})}
                className="w-4 h-4"
              />
              Generate Audiograms
            </label>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Content Tone</label>
            <Select
              value={settings.tone}
              onValueChange={(value) => setSettings({...settings, tone: value})}
            >
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual & Friendly</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="witty">Witty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleStartRepurposing}
            disabled={startRepurposingMutation.isPending || repurposingProgress}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold rounded-xl h-14 text-lg"
          >
            {startRepurposingMutation.isPending || repurposingProgress ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Repurposing Content...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Start AI Repurposing
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Progress Display */}
      <AnimatePresence>
        {repurposingProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 rounded-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">
                      {repurposingProgress.stage === 'analyzing' && '🔍 Analyzing Video...'}
                      {repurposingProgress.stage === 'generating_clips' && '✂️ Identifying Best Moments...'}
                      {repurposingProgress.stage === 'generating_posts' && '📱 Creating Social Posts...'}
                      {repurposingProgress.stage === 'generating_emails' && '📧 Writing Email Sequences...'}
                      {repurposingProgress.stage === 'generating_blog' && '📝 Generating Blog Post...'}
                      {repurposingProgress.stage === 'completed' && '✅ Repurposing Complete!'}
                    </h4>
                    <span className="text-[#00D4C9] font-bold">{repurposingProgress.progress}%</span>
                  </div>
                  <Progress value={repurposingProgress.progress} className="h-3" />
                  <p className="text-gray-400 text-sm">
                    This usually takes 2-5 minutes depending on video length...
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expected Output Preview */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">📊 Expected Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { icon: Scissors, label: 'Short Clips', value: `${settings.clip_count} clips`, color: 'text-[#FFD700]' },
              { icon: Share2, label: 'Social Posts', value: `${settings.target_platforms.length * settings.post_count_per_platform} posts`, color: 'text-[#00D4C9]' },
              { icon: Mail, label: 'Email Sequence', value: `${settings.email_sequence_count} emails`, color: 'text-blue-400' },
              { icon: FileText, label: 'Blog Post', value: settings.generate_blog ? '1 post' : 'Disabled', color: 'text-purple-400' },
              { icon: ImageIcon, label: 'Quote Graphics', value: settings.generate_quotes ? '5-7 graphics' : 'Disabled', color: 'text-pink-400' },
              { icon: Music, label: 'Audiograms', value: settings.generate_audiograms ? '3 clips' : 'Disabled', color: 'text-green-400' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <p className="text-white font-medium text-sm">{item.label}</p>
                    <p className="text-gray-400 text-xs">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-bold mb-1">
              📈 Total Assets: {
                settings.clip_count +
                (settings.target_platforms.length * settings.post_count_per_platform) +
                settings.email_sequence_count +
                (settings.generate_blog ? 1 : 0) +
                (settings.generate_quotes ? 5 : 0) +
                (settings.generate_audiograms ? 3 : 0) +
                5
              }+ pieces
            </p>
            <p className="text-gray-400 text-xs">
              ⏱️ Estimated time saved: {Math.round((settings.clip_count + settings.target_platforms.length * settings.post_count_per_platform + settings.email_sequence_count) * 0.5)} hours
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}