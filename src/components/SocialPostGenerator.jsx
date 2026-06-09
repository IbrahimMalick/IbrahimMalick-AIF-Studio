
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles,
  Loader2,
  Copy,
  CheckCircle2,
  Send,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandVoiceChecker from '@/components/BrandVoiceChecker';

export default function SocialPostGenerator({ user, brandVoiceProfile }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    topic: '',
    product_name: '',
    key_features: '',
    target_audience: 'general audience',
    tone: 'professional',
    platforms: ['instagram', 'facebook', 'twitter'],
    include_hashtags: true,
    include_emojis: true,
    variants_count: 3
  });
  
  const [generatedPosts, setGeneratedPosts] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showVoiceCheck, setShowVoiceCheck] = useState(false);
  const [checkingPost, setCheckingPost] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ${data.variants_count} social media post variations for:

TOPIC: ${data.topic}
${data.product_name ? `PRODUCT: ${data.product_name}` : ''}
${data.key_features ? `KEY FEATURES: ${data.key_features}` : ''}

TARGET AUDIENCE: ${data.target_audience}
TONE: ${data.tone}
PLATFORMS: ${data.platforms.join(', ')}

REQUIREMENTS:
- Create ${data.variants_count} distinct variations
- Optimize character count per platform (Twitter: 280, Instagram: 2200, LinkedIn: 3000)
- ${data.include_hashtags ? 'Include 3-5 relevant hashtags per post' : 'No hashtags'}
- ${data.include_emojis ? 'Use strategic emojis to increase engagement' : 'No emojis'}
- Each variation should have a different hook or angle
- Include platform-specific best practices
- Add optimal posting time suggestion
- Predict engagement rate
${brandVoiceProfile ? `\n- Adhere to the following brand voice profile: ${brandVoiceProfile.profile_name} (details: ${brandVoiceProfile.guidelines})` : ''}

For each platform, provide:
1. Post copy (platform-optimized length)
2. Hashtags (if enabled)
3. Optimal posting time
4. Predicted engagement rate
5. Hook type (question, statistic, story, how-to, etc.)

Format as structured JSON per platform.`,
        response_json_schema: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  variations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        copy: { type: "string" },
                        hashtags: { type: "array", items: { type: "string" } },
                        character_count: { type: "number" },
                        hook_type: { type: "string" },
                        optimal_posting_time: { type: "string" },
                        predicted_engagement_rate: { type: "number" }
                      }
                    }
                  }
                }
              }
            },
            overall_quality_score: { type: "number" },
            engagement_prediction: {
              type: "object",
              properties: {
                estimated_reach: { type: "number" },
                estimated_engagement_rate: { type: "number" },
                viral_probability: { type: "number" }
              }
            }
          }
        }
      });

      // Save generation
      const generation = await base44.entities.AIContentGeneration.create({
        user_email: user.email,
        generation_type: 'social_post',
        input_type: data.product_name ? 'product_update' : 'manual_prompt',
        input_data: {
          topic: data.topic,
          product_name: data.product_name,
          key_features: data.key_features?.split(',').map(f => f.trim()).filter(Boolean),
          target_audience: data.target_audience,
          tone: data.tone
        },
        generated_content: {
          social_posts: result.posts.flatMap(p => 
            p.variations.map(v => ({
              platform: p.platform,
              copy: v.copy,
              hashtags: v.hashtags,
              character_count: v.character_count,
              optimal_posting_time: v.optimal_posting_time
            }))
          )
        },
        tone: data.tone,
        target_platforms: data.platforms,
        quality_score: result.overall_quality_score,
        engagement_prediction: result.engagement_prediction,
        status: 'draft',
        variants_count: data.variants_count
      });

      return { result, generation };
    },
    onSuccess: ({ result }) => {
      setGeneratedPosts(result);
      queryClient.invalidateQueries(['aiContentGenerations']);
    }
  });

  const deployPostMutation = useMutation({
    mutationFn: async ({ post, platform }) => {
      // Create scheduled post
      const scheduledPost = await base44.entities.ScheduledPost.create({
        user_email: user.email,
        content_type: 'post',
        content_url: '', // Will be added by user
        caption: post.copy,
        title: formData.topic,
        hashtags: post.hashtags || [],
        platforms: [platform],
        status: 'draft'
      });

      return scheduledPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts']);
      alert('✅ Post saved as draft! Open Social Media page to add media and publish.');
    }
  });

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const platformIcons = {
    instagram: { icon: Instagram, color: 'from-[#FF4433] to-[#FF8C00]' },
    facebook: { icon: Facebook, color: 'from-[#1E90FF] to-[#A89C94]' },
    twitter: { icon: Twitter, color: 'from-[#000000] to-[#1DA1F2]' },
    linkedin: { icon: Linkedin, color: 'from-[#0077B5] to-[#00A0DC]' },
    tiktok: { icon: Music, color: 'from-[#FF0050] to-[#00F2EA]' },
    youtube: { icon: Youtube, color: 'from-[#FF0000] to-[#CC0000]' }
  };

  return (
    <div className="space-y-6">
      
      {/* Brand Voice Alert */}
      {brandVoiceProfile && (
        <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">
                  Brand Voice: {brandVoiceProfile.profile_name}
                </p>
                <p className="text-gray-400 text-xs">
                  All generated content will be checked for consistency
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                {brandVoiceProfile.confidence_level || 50}% confident
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Form */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD700]" />
            Generate Social Media Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Topic / Announcement *</label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                placeholder="e.g., New feature launch, Product update, Industry news"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Product Name (Optional)</label>
              <Input
                value={formData.product_name}
                onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                placeholder="e.g., AI Video Studio 2.0"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Key Features / Details (comma separated)</label>
            <Textarea
              value={formData.key_features}
              onChange={(e) => setFormData({...formData, key_features: e.target.value})}
              placeholder="e.g., AI-powered, 10x faster rendering, Multi-language support, Real-time collaboration"
              rows={3}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Target Audience</label>
              <Input
                value={formData.target_audience}
                onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                placeholder="e.g., Content creators, Marketing agencies"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Tone</label>
              <Select
                value={formData.tone}
                onValueChange={(value) => setFormData({...formData, tone: value})}
              >
                <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="witty">Witty</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Target Platforms</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'].map(platform => {
                const config = platformIcons[platform];
                const Icon = config.icon;
                const isSelected = formData.platforms.includes(platform);
                
                return (
                  <label
                    key={platform}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#FFD700] bg-[#FFD700]/10'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, platforms: [...formData.platforms, platform]});
                        } else {
                          setFormData({...formData, platforms: formData.platforms.filter(p => p !== platform)});
                        }
                      }}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mx-auto ${isSelected ? 'text-[#FFD700]' : 'text-gray-400'}`} />
                    <p className={`text-xs text-center mt-1 capitalize ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                      {platform}
                    </p>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.include_hashtags}
                onChange={(e) => setFormData({...formData, include_hashtags: e.target.checked})}
                className="w-4 h-4"
              />
              Include Hashtags
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.include_emojis}
                onChange={(e) => setFormData({...formData, include_emojis: e.target.checked})}
                className="w-4 h-4"
              />
              Include Emojis
            </label>
            <div className="ml-auto">
              <label className="text-sm text-gray-400 mr-2">Variations:</label>
              <Select
                value={String(formData.variants_count)}
                onValueChange={(value) => setFormData({...formData, variants_count: Number(value)})}
              >
                <SelectTrigger className="w-20 bg-[#0B0B0C] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateMutation.mutate(formData)}
            disabled={!formData.topic || generateMutation.isPending}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold rounded-xl h-12"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Posts...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Social Posts
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Generated Posts */}
      <AnimatePresence>
        {generatedPosts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {generatedPosts.posts.map((platformData, platformIdx) => {
              const config = platformIcons[platformData.platform];
              if (!config) return null;
              
              const Icon = config.icon;

              return (
                <Card key={platformIdx} className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white capitalize">{platformData.platform}</CardTitle>
                        <p className="text-gray-500 text-xs">{platformData.variations.length} variations</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {platformData.variations.map((variation, varIdx) => {
                      const uniqueIdx = `${platformIdx}-${varIdx}`;
                      
                      return (
                        <motion.div
                          key={varIdx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: varIdx * 0.1 }}
                          className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gray-700 text-gray-300 text-xs">
                                Variation {varIdx + 1}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                {variation.hook_type}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(variation.copy + '\n\n' + (variation.hashtags?.join(' ') || ''), uniqueIdx)}
                                className="text-gray-400 hover:text-white h-7"
                              >
                                {copiedIndex === uniqueIdx ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => deployPostMutation.mutate({ 
                                  post: variation, 
                                  platform: platformData.platform 
                                })}
                                className="bg-green-500 hover:bg-green-600 text-white h-7 px-2"
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Deploy
                              </Button>
                              
                              {brandVoiceProfile && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCheckingPost({ platform: platformData.platform, variation, idx: uniqueIdx });
                                    setShowVoiceCheck(true);
                                  }}
                                  className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 h-7 px-2"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Check Voice
                                </Button>
                              )}
                            </div>
                          </div>

                          <p className="text-white text-sm mb-3 leading-relaxed whitespace-pre-wrap">
                            {variation.copy}
                          </p>

                          {variation.hashtags && variation.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {variation.hashtags.map((tag, tagIdx) => (
                                <Badge key={tagIdx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800">
                            <div>
                              <p className="text-gray-500 text-xs">Characters</p>
                              <p className="text-white font-semibold text-sm">{variation.character_count}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Est. Engagement</p>
                              <p className="text-green-400 font-semibold text-sm">
                                {(variation.predicted_engagement_rate * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Best Time</p>
                              <p className="text-white font-semibold text-sm">{variation.optimal_posting_time}</p>
                            </div>
                          </div>

                          {/* Brand Voice Check Result */}
                          {showVoiceCheck && checkingPost?.idx === uniqueIdx && (
                            <div className="mt-4 pt-4 border-t border-gray-800">
                              <BrandVoiceChecker
                                content={variation.copy + '\n\n' + (variation.hashtags?.join(' ') || '')}
                                contentType="social_post"
                                brandVoiceProfile={brandVoiceProfile}
                                user={user}
                                onRewriteAccepted={(rewrittenContent) => {
                                  const parts = rewrittenContent.split('\n\n');
                                  const newCopy = parts[0];
                                  const newHashtagsRaw = parts[1] || '';
                                  const newHashtags = newHashtagsRaw
                                                        .split(' ')
                                                        .filter(h => h.startsWith('#'))
                                                        .map(h => h.trim());

                                  setGeneratedPosts(prevGeneratedPosts => {
                                    if (!prevGeneratedPosts) return prevGeneratedPosts;

                                    const updatedPosts = prevGeneratedPosts.posts.map(platformDataItem => {
                                      if (platformDataItem.platform === checkingPost.platform) {
                                        return {
                                          ...platformDataItem,
                                          variations: platformDataItem.variations.map(v => {
                                            if (v === checkingPost.variation) { 
                                              return {
                                                ...v,
                                                copy: newCopy,
                                                hashtags: newHashtags.length > 0 ? newHashtags : v.hashtags
                                              };
                                            }
                                            return v;
                                          })
                                        };
                                      }
                                      return platformDataItem;
                                    });

                                    return {
                                      ...prevGeneratedPosts,
                                      posts: updatedPosts
                                    };
                                  });

                                  setShowVoiceCheck(false);
                                  setCheckingPost(null);
                                  alert('✅ Content updated with brand-aligned version!');
                                }}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}

            {/* Overall Stats */}
            {generatedPosts.engagement_prediction && (
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 rounded-2xl">
                <CardContent className="p-6">
                  <h4 className="text-white font-bold mb-4">📊 Performance Prediction</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-[#0B0B0C] rounded-xl">
                      <p className="text-2xl font-bold text-[#FFD700]">
                        {generatedPosts.engagement_prediction.estimated_reach?.toLocaleString() || 0}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Estimated Reach</p>
                    </div>
                    <div className="text-center p-3 bg-[#0B0B0C] rounded-xl">
                      <p className="text-2xl font-bold text-green-400">
                        {(generatedPosts.engagement_prediction.estimated_engagement_rate * 100)?.toFixed(1) || 0}%
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Engagement Rate</p>
                    </div>
                    <div className="text-center p-3 bg-[#0B0B0C] rounded-xl">
                      <p className="text-2xl font-bold text-[#00D4C9]">
                        {(generatedPosts.engagement_prediction.viral_probability * 100)?.toFixed(0) || 0}%
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Viral Probability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
