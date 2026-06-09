
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Loader2,
  Copy,
  CheckCircle2,
  Search,
  TrendingUp,
  Globe,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandVoiceChecker from '@/components/BrandVoiceChecker'; // Added import

export default function SEOMetadataGenerator({ user, brandVoiceProfile }) { // Added brandVoiceProfile prop
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    page_url: '',
    page_topic: '',
    content_summary: '',
    focus_keyword: '',
    target_keywords: '',
    competitors: '',
    variants_count: 5
  });
  
  const [generatedSEO, setGeneratedSEO] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showVoiceCheck, setShowVoiceCheck] = useState(false); // Added state
  const [checkingSEO, setCheckingSEO] = useState(null); // Added state

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ${data.variants_count} SEO-optimized title and meta description variations for:

PAGE URL: ${data.page_url}
PAGE TOPIC: ${data.page_topic}
CONTENT SUMMARY: ${data.content_summary}
FOCUS KEYWORD: ${data.focus_keyword}
${data.target_keywords ? `ADDITIONAL KEYWORDS: ${data.target_keywords}` : ''}
${data.competitors ? `COMPETITOR URLS: ${data.competitors}` : ''}

REQUIREMENTS:
- Title: 50-60 characters (Google displays ~60 chars)
- Meta Description: 150-160 characters (Google displays ~160 chars)
- Include focus keyword naturally in both title and description
- Front-load important keywords
- Each variation tests different psychological angle (benefit, question, how-to, statistic, power words)
- Make it click-worthy but not clickbait
- Include numbers/data where relevant
- Use active voice
- Create urgency/curiosity where appropriate
- Analyze search intent (informational, commercial, navigational, transactional)

For each variation provide:
1. SEO Title (with character count)
2. Meta Description (with character count)
3. Focus keyword integration quality (0-100)
4. Additional keywords included
5. Search intent matched
6. Predicted CTR from SERP
7. SEO score (0-100)
8. Improvements needed
9. Snippet preview

Also provide:
- Best variation recommendation
- Keyword density analysis
- Semantic keyword suggestions
- Schema markup recommendations`,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  title_char_count: { type: "number" },
                  meta_description: { type: "string" },
                  description_char_count: { type: "number" },
                  focus_keyword: { type: "string" },
                  additional_keywords: { type: "array", items: { type: "string" } },
                  search_intent: { type: "string" },
                  predicted_ctr: { type: "number" },
                  seo_score: { type: "number" },
                  improvements: { type: "array", items: { type: "string" } },
                  psychological_angle: { type: "string" }
                }
              }
            },
            best_variation_index: { type: "number" },
            keyword_analysis: {
              type: "object",
              properties: {
                primary_keyword_density: { type: "number" },
                keyword_prominence: { type: "string" },
                semantic_keywords: { type: "array", items: { type: "string" } },
                lsi_keywords: { type: "array", items: { type: "string" } }
              }
            },
            schema_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  schema_type: { type: "string" },
                  recommended_properties: { type: "array", items: { type: "string" } },
                  priority: { type: "string" }
                }
              }
            },
            serp_preview: {
              type: "object",
              properties: {
                estimated_position: { type: "number" },
                click_probability: { type: "number" },
                competing_pages: { type: "number" }
              }
            }
          }
        }
      });

      // Save generation
      const generation = await base44.entities.AIContentGeneration.create({
        user_email: user.email,
        generation_type: 'seo_metadata',
        input_type: 'manual_prompt',
        input_data: {
          topic: data.page_topic,
          url: data.page_url,
          focus_keyword: data.focus_keyword,
          target_audience: data.target_keywords
        },
        generated_content: {
          seo_variations: result.variations
        },
        quality_score: result.variations[result.best_variation_index]?.seo_score || 0,
        status: 'draft',
        variants_count: data.variants_count
      });

      return { result, generation };
    },
    onSuccess: ({ result }) => {
      setGeneratedSEO(result);
      queryClient.invalidateQueries(['aiContentGenerations']);
    }
  });

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const applySEO = async (seo) => {
    await base44.entities.SEOMetadata.create({
      page_path: formData.page_url,
      title: seo.title,
      description: seo.meta_description,
      keywords: [seo.focus_keyword, ...seo.additional_keywords],
      og_title: seo.title,
      og_description: seo.meta_description
    });

    queryClient.invalidateQueries(['seoMetadata']);
    alert('✅ SEO metadata saved!');
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
                  SEO metadata will be checked for brand alignment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Form */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-400" />
            Generate SEO Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Page URL / Path *</label>
              <Input
                value={formData.page_url}
                onChange={(e) => setFormData({...formData, page_url: e.target.value})}
                placeholder="/blog/ai-video-creation-guide"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Page Topic *</label>
              <Input
                value={formData.page_topic}
                onChange={(e) => setFormData({...formData, page_topic: e.target.value})}
                placeholder="e.g., AI Video Creation Guide"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Content Summary</label>
            <Textarea
              value={formData.content_summary}
              onChange={(e) => setFormData({...formData, content_summary: e.target.value})}
              placeholder="Brief summary of page content..."
              rows={3}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Focus Keyword *</label>
              <Input
                value={formData.focus_keyword}
                onChange={(e) => setFormData({...formData, focus_keyword: e.target.value})}
                placeholder="e.g., AI video creator"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Additional Keywords (comma separated)</label>
              <Input
                value={formData.target_keywords}
                onChange={(e) => setFormData({...formData, target_keywords: e.target.value})}
                placeholder="video editor, content creation, ai tools"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Competitor URLs (optional)</label>
            <Input
              value={formData.competitors}
              onChange={(e) => setFormData({...formData, competitors: e.target.value})}
              placeholder="https://competitor.com/similar-page"
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Variations:</label>
              <Select
                value={String(formData.variants_count)}
                onValueChange={(value) => setFormData({...formData, variants_count: Number(value)})}
              >
                <SelectTrigger className="w-20 bg-[#0B0B0C] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateMutation.mutate(formData)}
            disabled={!formData.page_topic || !formData.focus_keyword || generateMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl h-12"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating SEO Metadata...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate SEO Variations
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Generated SEO */}
      <AnimatePresence>
        {generatedSEO && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {generatedSEO.variations.map((seo, idx) => (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                        Variation {idx + 1}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {seo.psychological_angle}
                      </Badge>
                      {idx === generatedSEO.best_variation_index && (
                        <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                          ⭐ Recommended
                        </Badge>
                      )}
                      <Badge className={`text-xs ${
                        seo.seo_score >= 80 ? 'bg-green-500/20 text-green-400' :
                        seo.seo_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        Score: {seo.seo_score}/100
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`Title: ${seo.title}\n\nMeta Description: ${seo.meta_description}`, idx)}
                        className="text-gray-400 hover:text-white h-7"
                      >
                        {copiedIndex === idx ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => applySEO(seo)}
                        className="bg-green-500 hover:bg-green-600 text-white h-7 px-2"
                      >
                        Apply
                      </Button>
                      
                      {brandVoiceProfile && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCheckingSEO({ seo, idx });
                            setShowVoiceCheck(true);
                          }}
                          className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 h-7"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Check
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* SERP Preview */}
                  <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                    <div className="flex items-start gap-2 mb-1">
                      <Globe className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                          {seo.title}
                        </p>
                        <p className="text-green-700 text-xs mb-1">
                          {formData.page_url || 'https://yoursite.com/page'}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {seo.meta_description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Character Counts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Title Length</p>
                      <p className={`font-bold ${
                        seo.title_char_count <= 60 ? 'text-green-400' :
                        seo.title_char_count <= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {seo.title_char_count} chars
                      </p>
                    </div>
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Description Length</p>
                      <p className={`font-bold ${
                        seo.description_char_count <= 160 ? 'text-green-400' :
                        seo.description_char_count <= 170 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {seo.description_char_count} chars
                      </p>
                    </div>
                  </div>

                  {/* Keywords */}
                  {seo.additional_keywords && seo.additional_keywords.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs mb-2">Keywords Included:</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          🎯 {seo.focus_keyword}
                        </Badge>
                        {seo.additional_keywords.map((keyword, kidx) => (
                          <Badge key={kidx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Prediction */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                    <div className="text-center p-2 bg-[#0B0B0C] rounded">
                      <p className="text-green-400 font-bold text-lg">
                        {(seo.predicted_ctr * 100).toFixed(1)}%
                      </p>
                      <p className="text-gray-500 text-xs">Predicted CTR</p>
                    </div>
                    <div className="text-center p-2 bg-[#0B0B0C] rounded">
                      <p className="text-purple-400 font-bold text-lg capitalize">
                        {seo.search_intent}
                      </p>
                      <p className="text-gray-500 text-xs">Search Intent</p>
                    </div>
                  </div>

                  {/* Improvements */}
                  {seo.improvements && seo.improvements.length > 0 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 font-semibold text-xs mb-2">💡 Improvements:</p>
                      <ul className="space-y-1">
                        {seo.improvements.map((imp, impIdx) => (
                          <li key={impIdx} className="text-gray-300 text-xs">
                            • {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Brand Voice Check Result */}
                  {showVoiceCheck && checkingSEO?.idx === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <BrandVoiceChecker
                        content={`Title: ${seo.title}\n\nMeta Description: ${seo.meta_description}`}
                        contentType="seo_metadata"
                        brandVoiceProfile={brandVoiceProfile}
                        user={user}
                        onRewriteAccepted={(rewrittenContent) => {
                          const lines = rewrittenContent.split('\n\n');
                          const newTitle = lines[0].replace('Title: ', '');
                          const newDescription = lines[1].replace('Meta Description: ', '');
                          
                          const updatedVariations = generatedSEO.variations.map((item, index) => {
                            if (index === checkingSEO.idx) {
                              return {
                                ...item,
                                title: newTitle,
                                meta_description: newDescription,
                                title_char_count: newTitle.length,
                                description_char_count: newDescription.length,
                              };
                            }
                            return item;
                          });

                          setGeneratedSEO({
                            ...generatedSEO,
                            variations: updatedVariations,
                          });
                          
                          setShowVoiceCheck(false);
                          setCheckingSEO(null);
                          alert('✅ SEO metadata updated with brand-aligned version!');
                        }}
                      />
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}

            {/* Keyword Analysis */}
            {generatedSEO.keyword_analysis && (
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Keyword Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Keyword Density</p>
                      <p className="text-white font-bold text-xl">
                        {(generatedSEO.keyword_analysis.primary_keyword_density * 100).toFixed(1)}%
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {generatedSEO.keyword_analysis.keyword_prominence}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-[#0B0B0C] rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Search Position Est.</p>
                      <p className="text-white font-bold text-xl">
                        #{generatedSEO.serp_preview?.estimated_position || 'N/A'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {(generatedSEO.serp_preview?.click_probability * 100)?.toFixed(0) || 0}% click probability
                      </p>
                    </div>
                  </div>

                  {generatedSEO.keyword_analysis.semantic_keywords && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">Semantic Keywords to Include:</p>
                      <div className="flex flex-wrap gap-1">
                        {generatedSEO.keyword_analysis.semantic_keywords.map((kw, idx) => (
                          <Badge key={idx} className="bg-purple-500/20 text-purple-400 text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedSEO.keyword_analysis.lsi_keywords && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">LSI Keywords (Natural Language):</p>
                      <div className="flex flex-wrap gap-1">
                        {generatedSEO.keyword_analysis.lsi_keywords.map((kw, idx) => (
                          <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            {/* Schema Recommendations */}
            {generatedSEO.schema_recommendations && generatedSEO.schema_recommendations.length > 0 && (
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#00D4C9]" />
                    Schema Markup Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedSEO.schema_recommendations.map((schema, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold text-sm">{schema.schema_type}</p>
                          <Badge className={
                            schema.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            schema.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }>
                            {schema.priority} priority
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs">
                          Recommended properties: {schema.recommended_properties?.join(', ')}
                        </p>
                      </div>
                    ))}
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
