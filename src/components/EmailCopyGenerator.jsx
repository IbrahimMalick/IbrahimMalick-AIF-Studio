
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
  Mail,
  Send,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandVoiceChecker from '@/components/BrandVoiceChecker';

export default function EmailCopyGenerator({ user, brandVoiceProfile }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    campaign_type: 'newsletter',
    topic: '',
    product_name: '',
    offer_details: '',
    target_audience: 'subscribers',
    tone: 'professional',
    cta_text: '',
    cta_url: '',
    personalization: true,
    variants_count: 3
  });
  
  const [generatedEmails, setGeneratedEmails] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [showVoiceCheck, setShowVoiceCheck] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ${data.variants_count} email marketing copy variations for:

CAMPAIGN TYPE: ${data.campaign_type}
TOPIC: ${data.topic}
${data.product_name ? `PRODUCT: ${data.product_name}` : ''}
${data.offer_details ? `OFFER DETAILS: ${data.offer_details}` : ''}

TARGET AUDIENCE: ${data.target_audience}
TONE: ${data.tone}
CTA: ${data.cta_text || 'Learn More'}
${data.personalization ? 'USE PERSONALIZATION: Include {{first_name}}, {{company}}, {{industry}} tags' : ''}

REQUIREMENTS:
- Create ${data.variants_count} distinct subject line + body variations
- Subject lines: 40-60 characters, high open rate triggers
- Preview text: 100 characters, complements subject
- Email body: Scannable, benefit-focused, clear hierarchy
- Each variation tests different psychological trigger (curiosity, urgency, social proof, benefit, question)
- Include HTML-formatted version and plain text version
- Mobile-optimized layout
- Strong opening hook in first 2 lines
- Clear CTA above and below fold
- ${data.campaign_type === 'promotion' ? 'Emphasize value, scarcity, urgency' : ''}
- ${data.campaign_type === 'newsletter' ? 'Focus on value delivery, education, updates' : ''}
- ${data.campaign_type === 'welcome' ? 'Warm welcome, set expectations, quick win' : ''}
- ${data.campaign_type === 'abandoned_cart' ? 'Remind, handle objections, create urgency' : ''}

For each variation provide:
1. Subject line
2. Preview text
3. Opening hook
4. Body copy (HTML formatted)
5. Plain text version
6. CTA button text and placement
7. Predicted open rate
8. Predicted click rate
9. Psychological trigger used`,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  subject_line: { type: "string" },
                  preview_text: { type: "string" },
                  opening_hook: { type: "string" },
                  body_html: { type: "string" },
                  body_text: { type: "string" },
                  cta_text: { type: "string" },
                  cta_placement: { type: "string" },
                  predicted_open_rate: { type: "number" },
                  predicted_click_rate: { type: "number" },
                  psychological_trigger: { type: "string" },
                  personalization_tags: { type: "array", items: { type: "string" } }
                }
              }
            },
            best_variation_index: { type: "number" },
            overall_quality_score: { type: "number" },
            engagement_prediction: {
              type: "object",
              properties: {
                estimated_open_rate: { type: "number" },
                estimated_click_rate: { type: "number" },
                estimated_conversion_rate: { type: "number" }
              }
            },
            a_b_test_recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Save generation
      const generation = await base44.entities.AIContentGeneration.create({
        user_email: user.email,
        generation_type: 'email_copy',
        input_type: data.campaign_type === 'promotion' ? 'promotion' : 'manual_prompt',
        input_data: {
          topic: data.topic,
          product_name: data.product_name,
          target_audience: data.target_audience,
          tone: data.tone,
          campaign_type: data.campaign_type
        },
        generated_content: {
          email_variations: result.variations
        },
        tone: data.tone,
        quality_score: result.overall_quality_score,
        engagement_prediction: {
          estimated_reach: 1000,
          estimated_engagement_rate: result.engagement_prediction.estimated_open_rate,
          viral_probability: result.engagement_prediction.estimated_click_rate
        },
        status: 'draft',
        variants_count: data.variants_count
      });

      return { result, generation };
    },
    onSuccess: ({ result }) => {
      setGeneratedEmails(result);
      queryClient.invalidateQueries(['aiContentGenerations']);
    }
  });

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const campaignTypeLabels = {
    newsletter: '📰 Newsletter',
    promotion: '🎁 Promotional',
    welcome: '👋 Welcome Series',
    abandoned_cart: '🛒 Cart Recovery',
    product_update: '🚀 Product Update',
    event_invitation: '🎟️ Event Invite',
    re_engagement: '🔄 Re-engagement',
    survey: '📊 Survey Request'
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
                  Email copy will be analyzed for brand consistency
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
            <Mail className="w-5 h-5 text-blue-400" />
            Generate Email Marketing Copy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Campaign Type *</label>
            <Select
              value={formData.campaign_type}
              onValueChange={(value) => setFormData({...formData, campaign_type: value})}
            >
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(campaignTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Topic / Subject *</label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                placeholder="e.g., Summer Sale, New Feature Launch, Weekly Update"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Product/Service Name</label>
              <Input
                value={formData.product_name}
                onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                placeholder="e.g., Premium Plan, AI Video Tool"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Offer Details / Key Message</label>
            <Textarea
              value={formData.offer_details}
              onChange={(e) => setFormData({...formData, offer_details: e.target.value})}
              placeholder="e.g., 50% off all plans, New AI-powered features, Exclusive early access"
              rows={3}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">CTA Text</label>
              <Input
                value={formData.cta_text}
                onChange={(e) => setFormData({...formData, cta_text: e.target.value})}
                placeholder="e.g., Get Started, Claim Offer, Learn More"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">CTA URL</label>
              <Input
                value={formData.cta_url}
                onChange={(e) => setFormData({...formData, cta_url: e.target.value})}
                placeholder="https://yoursite.com/offer"
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Target Audience</label>
              <Input
                value={formData.target_audience}
                onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                placeholder="e.g., Existing customers, Free trial users"
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
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.personalization}
                onChange={(e) => setFormData({...formData, personalization: e.target.checked})}
                className="w-4 h-4"
              />
              Enable Personalization Tags
            </label>
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
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => generateMutation.mutate(formData)}
            disabled={!formData.topic || generateMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl h-12"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Email Copy...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Email Variations
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Generated Emails */}
      <AnimatePresence>
        {generatedEmails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {generatedEmails.variations.map((email, idx) => (
              <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-700 text-gray-300 text-xs">
                        Variation {idx + 1}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                        {email.psychological_trigger}
                      </Badge>
                      {idx === generatedEmails.best_variation_index && (
                        <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                          ⭐ Best Performer
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewEmail(email)}
                        className="text-gray-400 hover:text-white h-7"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(email.body_text, idx)}
                        className="text-gray-400 hover:text-white h-7"
                      >
                        {copiedIndex === idx ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {brandVoiceProfile && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCheckingEmail({ email, idx });
                            setShowVoiceCheck(true);
                          }}
                          className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10 h-7"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Check Voice
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  
                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <p className="text-gray-500 text-xs mb-1">Subject Line</p>
                    <p className="text-white font-semibold">{email.subject_line}</p>
                  </div>

                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <p className="text-gray-500 text-xs mb-1">Preview Text</p>
                    <p className="text-gray-300 text-sm">{email.preview_text}</p>
                  </div>

                  <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                    <p className="text-gray-500 text-xs mb-2">Email Body (Plain Text)</p>
                    <div className="text-gray-300 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {email.body_text}
                    </div>
                  </div>

                  {/* Brand Voice Check Result */}
                  {showVoiceCheck && checkingEmail?.idx === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <BrandVoiceChecker
                        content={`Subject: ${email.subject_line}\n\n${email.body_text}`}
                        contentType="email_copy"
                        brandVoiceProfile={brandVoiceProfile}
                        user={user}
                        onRewriteAccepted={(rewrittenContent) => {
                          const lines = rewrittenContent.split('\n\n');
                          const subjectLine = lines[0].replace('Subject: ', '');
                          const bodyText = lines.slice(1).join('\n\n');
                          
                          email.subject_line = subjectLine;
                          email.body_text = bodyText;
                          
                          setShowVoiceCheck(false);
                          setCheckingEmail(null);
                          alert('✅ Email updated with brand-aligned version!');
                        }}
                      />
                    </div>
                  )}

                  {email.personalization_tags && email.personalization_tags.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs mb-2">Personalization Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {email.personalization_tags.map((tag, tagIdx) => (
                          <Badge key={tagIdx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                    <div className="text-center p-2 bg-[#0B0B0C] rounded">
                      <p className="text-green-400 font-bold text-lg">
                        {(email.predicted_open_rate * 100).toFixed(1)}%
                      </p>
                      <p className="text-gray-500 text-xs">Predicted Open</p>
                    </div>
                    <div className="text-center p-2 bg-[#0B0B0C] rounded">
                      <p className="text-blue-400 font-bold text-lg">
                        {(email.predicted_click_rate * 100).toFixed(1)}%
                      </p>
                      <p className="text-gray-500 text-xs">Predicted CTR</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      // Save to email campaign
                      alert('✅ Email saved! Create campaign in Email Marketing to deploy.');
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Save to Campaign
                  </Button>

                </CardContent>
              </Card>
            ))}

            {/* A/B Test Recommendations */}
            {generatedEmails.a_b_test_recommendations && (
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 rounded-2xl">
                <CardContent className="p-6">
                  <h4 className="text-blue-400 font-bold mb-3">💡 A/B Testing Recommendations</h4>
                  <ul className="space-y-2">
                    {generatedEmails.a_b_test_recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewEmail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Email Preview</h3>
                  <Button
                    onClick={() => setPreviewEmail(null)}
                    variant="ghost"
                    size="sm"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 text-xs mb-1">Subject:</p>
                  <p className="text-gray-900 font-semibold">{previewEmail.subject_line}</p>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-xs mb-1">Preview Text:</p>
                  <p className="text-gray-700 text-sm">{previewEmail.preview_text}</p>
                </div>

                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewEmail.body_html }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
