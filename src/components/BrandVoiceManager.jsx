import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Upload,
  Loader2,
  CheckCircle2,
  Brain,
  FileText,
  Plus,
  Trash2,
  Star,
  TrendingUp,
  AlertCircle,
  Share2
} from 'lucide-react';
import ShareContentModal from '@/components/ShareContentModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrandVoiceManager({ user, onProfileCreated }) {
  const queryClient = useQueryClient();
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [shareTarget, setShareTarget] = useState(null); // { id, name }
  const [newProfile, setNewProfile] = useState({
    profile_name: '',
    manual_guidelines: {
      tone: [],
      voice_attributes: [],
      dos: [],
      donts: [],
      preferred_phrases: [],
      avoid_phrases: [],
      target_audience: '',
      brand_personality: ''
    },
    example_content: []
  });
  
  const [currentExample, setCurrentExample] = useState({
    content_type: 'social_post',
    platform: 'instagram',
    content_text: '',
    performance_score: 80,
    reason_for_success: ''
  });

  const [toneInput, setToneInput] = useState('');
  const [attributeInput, setAttributeInput] = useState('');
  const [doInput, setDoInput] = useState('');
  const [dontInput, setDontInput] = useState('');
  const [phraseInput, setPhraseInput] = useState('');
  const [avoidInput, setAvoidInput] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['brandVoiceProfiles', user?.email],
    queryFn: () => base44.entities.BrandVoiceProfile.filter(
      { user_email: user.email },
      '-created_date'
    ),
    enabled: !!user
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      // First create the profile
      const profile = await base44.entities.BrandVoiceProfile.create({
        ...profileData,
        user_email: user.email,
        training_status: 'analyzing',
        sample_count: profileData.example_content.length
      });

      // Then analyze the examples with AI
      if (profileData.example_content.length > 0) {
        const analysisResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze these ${profileData.example_content.length} pieces of best-performing content to extract brand voice characteristics:

${profileData.example_content.map((ex, idx) => `
EXAMPLE ${idx + 1} (${ex.content_type} - ${ex.platform}):
Performance Score: ${ex.performance_score}/100
Content: ${ex.content_text}
Why it worked: ${ex.reason_for_success}
`).join('\n')}

MANUAL GUIDELINES PROVIDED:
Tone: ${profileData.manual_guidelines.tone.join(', ')}
Attributes: ${profileData.manual_guidelines.voice_attributes.join(', ')}
Target Audience: ${profileData.manual_guidelines.target_audience}
Personality: ${profileData.manual_guidelines.brand_personality}

EXTRACT:
1. Linguistic patterns (sentence length, complexity, formality, readability)
2. Common words and phrases used
3. Emoji usage patterns
4. Punctuation style
5. CTA patterns
6. Storytelling elements
7. Emotional tone distribution
8. Active vs passive voice ratio

Provide a comprehensive voice fingerprint that can be used to check future content for consistency.`,
          response_json_schema: {
            type: "object",
            properties: {
              linguistic_patterns: {
                type: "object",
                properties: {
                  avg_sentence_length: { type: "number" },
                  vocabulary_complexity: { type: "number" },
                  formality_score: { type: "number" },
                  emotional_tone_scores: {
                    type: "object",
                    properties: {
                      joy: { type: "number" },
                      trust: { type: "number" },
                      anticipation: { type: "number" },
                      surprise: { type: "number" },
                      analytical: { type: "number" },
                      confident: { type: "number" },
                      tentative: { type: "number" }
                    }
                  },
                  readability_grade: { type: "number" },
                  active_voice_percentage: { type: "number" }
                }
              },
              common_words: { type: "array", items: { type: "string" } },
              common_phrases: { type: "array", items: { type: "string" } },
              emoji_usage: {
                type: "object",
                properties: {
                  frequency: { type: "number" },
                  common_emojis: { type: "array", items: { type: "string" } }
                }
              },
              punctuation_style: {
                type: "object",
                properties: {
                  exclamation_frequency: { type: "number" },
                  question_frequency: { type: "number" },
                  ellipsis_usage: { type: "boolean" }
                }
              },
              call_to_action_patterns: { type: "array", items: { type: "string" } },
              storytelling_elements: { type: "array", items: { type: "string" } },
              confidence_level: { type: "number" }
            }
          }
        });

        // Update profile with AI analysis
        await base44.entities.BrandVoiceProfile.update(profile.id, {
          ai_analyzed_voice: analysisResult,
          training_status: 'trained',
          confidence_level: analysisResult.confidence_level
        });
      } else {
        // No examples, mark as trained with manual guidelines only
        await base44.entities.BrandVoiceProfile.update(profile.id, {
          training_status: 'trained',
          confidence_level: 50
        });
      }

      return profile;
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries(['brandVoiceProfiles']);
      setShowNewProfile(false);
      setNewProfile({
        profile_name: '',
        manual_guidelines: {
          tone: [],
          voice_attributes: [],
          dos: [],
          donts: [],
          preferred_phrases: [],
          avoid_phrases: [],
          target_audience: '',
          brand_personality: ''
        },
        example_content: []
      });
      if (onProfileCreated) onProfileCreated(profile);
      alert('✅ Brand Voice Profile created and analyzed!');
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (profileId) => base44.entities.BrandVoiceProfile.delete(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries(['brandVoiceProfiles']);
    }
  });

  const addToList = (field, value, input, setInput) => {
    if (!value.trim()) return;
    setNewProfile(prev => ({
      ...prev,
      manual_guidelines: {
        ...prev.manual_guidelines,
        [field]: [...prev.manual_guidelines[field], value.trim()]
      }
    }));
    setInput('');
  };

  const removeFromList = (field, index) => {
    setNewProfile(prev => ({
      ...prev,
      manual_guidelines: {
        ...prev.manual_guidelines,
        [field]: prev.manual_guidelines[field].filter((_, i) => i !== index)
      }
    }));
  };

  const addExample = () => {
    if (!currentExample.content_text.trim()) {
      alert('Please add content text');
      return;
    }

    setNewProfile(prev => ({
      ...prev,
      example_content: [...prev.example_content, { ...currentExample }]
    }));

    setCurrentExample({
      content_type: 'social_post',
      platform: 'instagram',
      content_text: '',
      performance_score: 80,
      reason_for_success: ''
    });
  };

  const removeExample = (index) => {
    setNewProfile(prev => ({
      ...prev,
      example_content: prev.example_content.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
    <div className="space-y-6">

      {/* Existing Profiles */}
      {profiles.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {profiles.map(profile => (
            <Card key={profile.id} className={`bg-[#111317] border-gray-800 rounded-2xl ${profile.is_default ? 'ring-2 ring-[#FFD700]' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-white">{profile.profile_name}</CardTitle>
                      {profile.is_default && (
                        <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={
                        profile.training_status === 'trained' ? 'bg-green-500/20 text-green-400' :
                        profile.training_status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {profile.training_status}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {profile.sample_count} examples
                      </Badge>
                      {profile.confidence_level && (
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {profile.confidence_level}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShareTarget({ id: profile.id, name: profile.profile_name })}
                      title="Share brand voice profile"
                    >
                      <Share2 className="w-4 h-4 text-[#00D4C9]" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Delete this brand voice profile?')) {
                          deleteProfileMutation.mutate(profile.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.manual_guidelines?.tone?.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Tone:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.manual_guidelines.tone.map((t, idx) => (
                          <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.avg_consistency_score && (
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs">Avg Consistency</p>
                        <p className="text-white font-bold text-lg">{profile.avg_consistency_score}%</p>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-[#00D4C9] h-2 rounded-full"
                          style={{ width: `${profile.avg_consistency_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-gray-500 text-xs">
                    Used {profile.analysis_count || 0} times
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create New Profile */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#FFD700]" />
              {showNewProfile ? 'Create Brand Voice Profile' : 'Brand Voice Profiles'}
            </CardTitle>
            <Button
              onClick={() => setShowNewProfile(!showNewProfile)}
              variant="outline"
              size="sm"
              className="border-gray-700 hover:bg-[#0B0B0C]"
            >
              {showNewProfile ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" />New Profile</>}
            </Button>
          </div>
        </CardHeader>
        
        {showNewProfile && (
          <CardContent className="space-y-6">
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Profile Name *</label>
              <Input
                value={newProfile.profile_name}
                onChange={(e) => setNewProfile({...newProfile, profile_name: e.target.value})}
                placeholder="e.g., AI Freedom Studios Voice"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>

            <Tabs defaultValue="guidelines">
              <TabsList className="bg-[#0B0B0C]">
                <TabsTrigger value="guidelines">
                  <FileText className="w-4 h-4 mr-2" />
                  Guidelines
                </TabsTrigger>
                <TabsTrigger value="examples">
                  <Star className="w-4 h-4 mr-2" />
                  Examples ({newProfile.example_content.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="guidelines" className="space-y-4 mt-4">
                
                {/* Tone */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Tone (e.g., professional, witty, empathetic)</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={toneInput}
                      onChange={(e) => setToneInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('tone', toneInput, toneInput, setToneInput)}
                      placeholder="Add tone descriptor"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <Button
                      onClick={() => addToList('tone', toneInput, toneInput, setToneInput)}
                      size="sm"
                      className="bg-[#00D4C9] text-black"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newProfile.manual_guidelines.tone.map((t, idx) => (
                      <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9]">
                        {t}
                        <button onClick={() => removeFromList('tone', idx)} className="ml-2">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Voice Attributes */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Voice Attributes (e.g., concise, storytelling, data-driven)</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={attributeInput}
                      onChange={(e) => setAttributeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('voice_attributes', attributeInput, attributeInput, setAttributeInput)}
                      placeholder="Add voice attribute"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <Button
                      onClick={() => addToList('voice_attributes', attributeInput, attributeInput, setAttributeInput)}
                      size="sm"
                      className="bg-[#00D4C9] text-black"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newProfile.manual_guidelines.voice_attributes.map((attr, idx) => (
                      <Badge key={idx} className="bg-purple-500/20 text-purple-400">
                        {attr}
                        <button onClick={() => removeFromList('voice_attributes', idx)} className="ml-2">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Target Audience</label>
                    <Input
                      value={newProfile.manual_guidelines.target_audience}
                      onChange={(e) => setNewProfile({
                        ...newProfile,
                        manual_guidelines: {
                          ...newProfile.manual_guidelines,
                          target_audience: e.target.value
                        }
                      })}
                      placeholder="e.g., Content creators, marketers"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Brand Personality</label>
                    <Input
                      value={newProfile.manual_guidelines.brand_personality}
                      onChange={(e) => setNewProfile({
                        ...newProfile,
                        manual_guidelines: {
                          ...newProfile.manual_guidelines,
                          brand_personality: e.target.value
                        }
                      })}
                      placeholder="e.g., Innovative, empowering, bold"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>
                </div>

                {/* Do's */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Do's (What TO include)</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={doInput}
                      onChange={(e) => setDoInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('dos', doInput, doInput, setDoInput)}
                      placeholder="e.g., Use action verbs"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <Button
                      onClick={() => addToList('dos', doInput, doInput, setDoInput)}
                      size="sm"
                      className="bg-green-500 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newProfile.manual_guidelines.dos.map((d, idx) => (
                      <Badge key={idx} className="bg-green-500/20 text-green-400">
                        ✓ {d}
                        <button onClick={() => removeFromList('dos', idx)} className="ml-2">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Don'ts */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Don'ts (What to AVOID)</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={dontInput}
                      onChange={(e) => setDontInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('donts', dontInput, dontInput, setDontInput)}
                      placeholder="e.g., Avoid jargon"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <Button
                      onClick={() => addToList('donts', dontInput, dontInput, setDontInput)}
                      size="sm"
                      className="bg-red-500 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newProfile.manual_guidelines.donts.map((d, idx) => (
                      <Badge key={idx} className="bg-red-500/20 text-red-400">
                        ✗ {d}
                        <button onClick={() => removeFromList('donts', idx)} className="ml-2">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Preferred Phrases */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Preferred Phrases</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={phraseInput}
                      onChange={(e) => setPhraseInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('preferred_phrases', phraseInput, phraseInput, setPhraseInput)}
                      placeholder="e.g., 'Transform your content'"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <Button
                      onClick={() => addToList('preferred_phrases', phraseInput, phraseInput, setPhraseInput)}
                      size="sm"
                      className="bg-[#FFD700] text-black"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newProfile.manual_guidelines.preferred_phrases.map((p, idx) => (
                      <Badge key={idx} className="bg-[#FFD700]/20 text-[#FFD700]">
                        "{p}"
                        <button onClick={() => removeFromList('preferred_phrases', idx)} className="ml-2">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Avoid Phrases */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Phrases to Avoid</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={avoidInput}
                      onChange={(e) => setAvoidInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('avoid_phrases', avoidInput, avoidInput, setAvoidInput)}
                      placeholder="e.g., 'Game changer'"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                    <Button
                      onClick={() => addToList('avoid_phrases', avoidInput, avoidInput, setAvoidInput)}
                      size="sm"
                      className="bg-red-500 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newProfile.manual_guidelines.avoid_phrases.map((p, idx) => (
                      <Badge key={idx} className="bg-red-500/20 text-red-400">
                        "{p}"
                        <button onClick={() => removeFromList('avoid_phrases', idx)} className="ml-2">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

              </TabsContent>

              <TabsContent value="examples" className="space-y-4 mt-4">
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-400 text-sm">
                    💡 <strong>Tip:</strong> Add 3-10 examples of your best content. The AI will analyze patterns to learn your brand voice.
                  </p>
                </div>

                {/* Add Example Form */}
                <Card className="bg-[#0B0B0C] border-gray-700 rounded-xl">
                  <CardContent className="p-4 space-y-3">
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Content Type</label>
                        <select
                          value={currentExample.content_type}
                          onChange={(e) => setCurrentExample({...currentExample, content_type: e.target.value})}
                          className="w-full bg-[#111317] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="social_post">Social Post</option>
                          <option value="email">Email</option>
                          <option value="blog">Blog Post</option>
                          <option value="script">Video Script</option>
                          <option value="ad_copy">Ad Copy</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Platform</label>
                        <select
                          value={currentExample.platform}
                          onChange={(e) => setCurrentExample({...currentExample, platform: e.target.value})}
                          className="w-full bg-[#111317] border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="tiktok">TikTok</option>
                          <option value="youtube">YouTube</option>
                          <option value="email">Email</option>
                          <option value="blog">Blog</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Content Text *</label>
                      <Textarea
                        value={currentExample.content_text}
                        onChange={(e) => setCurrentExample({...currentExample, content_text: e.target.value})}
                        placeholder="Paste your best-performing content here..."
                        rows={4}
                        className="bg-[#111317] border-gray-700 text-white rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Performance Score (0-100)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={currentExample.performance_score}
                          onChange={(e) => setCurrentExample({...currentExample, performance_score: Number(e.target.value)})}
                          className="bg-[#111317] border-gray-700 text-white rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Why it Worked</label>
                        <Input
                          value={currentExample.reason_for_success}
                          onChange={(e) => setCurrentExample({...currentExample, reason_for_success: e.target.value})}
                          placeholder="e.g., Strong hook"
                          className="bg-[#111317] border-gray-700 text-white rounded-xl"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={addExample}
                      size="sm"
                      className="w-full bg-green-500 text-white rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Example
                    </Button>

                  </CardContent>
                </Card>

                {/* Examples List */}
                {newProfile.example_content.length > 0 && (
                  <div className="space-y-2">
                    {newProfile.example_content.map((example, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2">
                            <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                              {example.content_type}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {example.platform}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              {example.performance_score}/100
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeExample(idx)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </Button>
                        </div>
                        <p className="text-gray-300 text-sm mb-1 line-clamp-2">
                          {example.content_text}
                        </p>
                        {example.reason_for_success && (
                          <p className="text-gray-500 text-xs">
                            💡 {example.reason_for_success}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </TabsContent>
            </Tabs>

            <Button
              onClick={() => createProfileMutation.mutate(newProfile)}
              disabled={!newProfile.profile_name || createProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold rounded-xl h-12"
            >
              {createProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Brand Voice...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Create Voice Profile
                </>
              )}
            </Button>

            <p className="text-gray-500 text-xs text-center">
              ⚡ AI will analyze {newProfile.example_content.length} examples to extract voice patterns
            </p>

          </CardContent>
        )}
      </Card>

    </div>

    {shareTarget && (
      <ShareContentModal
        user={user}
        resourceId={shareTarget.id}
        resourceName={shareTarget.name}
        shareType="brand_voice"
        onClose={() => setShareTarget(null)}
      />
    )}
    </>
  );
}