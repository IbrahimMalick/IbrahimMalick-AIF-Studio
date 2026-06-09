import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrandVoiceChecker({ 
  content, 
  contentType, 
  brandVoiceProfile, 
  user,
  onRewriteAccepted 
}) {
  const [checkResult, setCheckResult] = useState(null);

  const checkVoiceMutation = useMutation({
    mutationFn: async (contentText) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this ${contentType} content for brand voice consistency:

CONTENT TO CHECK:
${contentText}

BRAND VOICE PROFILE:
Name: ${brandVoiceProfile.profile_name}

MANUAL GUIDELINES:
• Tone: ${brandVoiceProfile.manual_guidelines?.tone?.join(', ') || 'Not specified'}
• Attributes: ${brandVoiceProfile.manual_guidelines?.voice_attributes?.join(', ') || 'Not specified'}
• Target Audience: ${brandVoiceProfile.manual_guidelines?.target_audience || 'Not specified'}
• Personality: ${brandVoiceProfile.manual_guidelines?.brand_personality || 'Not specified'}

DO's:
${brandVoiceProfile.manual_guidelines?.dos?.map(d => `• ${d}`).join('\n') || 'None'}

DON'Ts:
${brandVoiceProfile.manual_guidelines?.donts?.map(d => `• ${d}`).join('\n') || 'None'}

PREFERRED PHRASES:
${brandVoiceProfile.manual_guidelines?.preferred_phrases?.join(', ') || 'None'}

AVOID PHRASES:
${brandVoiceProfile.manual_guidelines?.avoid_phrases?.join(', ') || 'None'}

${brandVoiceProfile.ai_analyzed_voice ? `
AI-ANALYZED VOICE PATTERNS:
• Avg Sentence Length: ${brandVoiceProfile.ai_analyzed_voice.linguistic_patterns?.avg_sentence_length} words
• Formality Score: ${brandVoiceProfile.ai_analyzed_voice.linguistic_patterns?.formality_score}/100
• Readability Grade: ${brandVoiceProfile.ai_analyzed_voice.linguistic_patterns?.readability_grade}
• Active Voice: ${brandVoiceProfile.ai_analyzed_voice.linguistic_patterns?.active_voice_percentage}%
• Common Phrases: ${brandVoiceProfile.ai_analyzed_voice.common_phrases?.slice(0, 10).join(', ')}
• Emoji Frequency: ${brandVoiceProfile.ai_analyzed_voice.emoji_usage?.frequency}%
` : ''}

ANALYZE AND PROVIDE:

1. CONSISTENCY SCORE (0-100) - Overall alignment with brand voice

2. SCORE BREAKDOWN:
   - Tone Match (0-100)
   - Vocabulary Match (0-100)
   - Structure Match (0-100)
   - Style Match (0-100)
   - Emotional Match (0-100)
   - Guideline Adherence (0-100)

3. VIOLATIONS (if any):
   For each violation:
   - Severity (critical/major/minor/suggestion)
   - Category
   - Specific issue
   - Location in content
   - Current text (exact quote)
   - Suggested fix
   - Explanation

4. STRENGTHS:
   What the content does well with brand voice

5. TOP 5 IMPROVEMENT SUGGESTIONS:
   Ranked by priority with before/after examples

6. REWRITTEN VERSION:
   Rewrite the content to perfectly match brand voice while maintaining the core message

7. COMPARISON:
   How this compares to best examples in the profile`,
        response_json_schema: {
          type: "object",
          properties: {
            consistency_score: { type: "number" },
            score_breakdown: {
              type: "object",
              properties: {
                tone_match: { type: "number" },
                vocabulary_match: { type: "number" },
                structure_match: { type: "number" },
                style_match: { type: "number" },
                emotional_match: { type: "number" },
                guideline_adherence: { type: "number" }
              }
            },
            violations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string" },
                  category: { type: "string" },
                  issue: { type: "string" },
                  location: { type: "string" },
                  current_text: { type: "string" },
                  suggested_fix: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            },
            strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  aspect: { type: "string" },
                  example: { type: "string" },
                  why_it_works: { type: "string" }
                }
              }
            },
            improvement_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  suggestion: { type: "string" },
                  impact: { type: "string" },
                  before: { type: "string" },
                  after: { type: "string" }
                }
              }
            },
            rewritten_content: { type: "string" },
            rewritten_score: { type: "number" },
            comparison: {
              type: "object",
              properties: {
                similarity_to_best: { type: "number" },
                voice_drift: { type: "number" },
                recommendation: { type: "string" }
              }
            }
          }
        }
      });

      // Save the check
      const check = await base44.entities.BrandVoiceCheck.create({
        user_email: user.email,
        brand_voice_profile_id: brandVoiceProfile.id,
        content_type: contentType,
        content_text: contentText,
        consistency_score: result.consistency_score,
        score_breakdown: result.score_breakdown,
        violations: result.violations,
        strengths: result.strengths,
        improvement_suggestions: result.improvement_suggestions,
        rewritten_content: result.rewritten_content,
        rewritten_score: result.rewritten_score,
        comparison: result.comparison,
        auto_approved: result.consistency_score >= (brandVoiceProfile.consistency_thresholds?.minimum_score || 75)
      });

      // Update profile stats
      await base44.entities.BrandVoiceProfile.update(brandVoiceProfile.id, {
        analysis_count: (brandVoiceProfile.analysis_count || 0) + 1,
        last_analyzed: new Date().toISOString()
      });

      return { result, check };
    },
    onSuccess: ({ result }) => {
      setCheckResult(result);
    }
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 65) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 65) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="space-y-4">
      
      {!checkResult ? (
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 mx-auto mb-3 text-[#FFD700]" />
            <h4 className="text-white font-bold mb-2">Check Brand Voice Consistency</h4>
            <p className="text-gray-400 text-sm mb-4">
              Analyze this content against "{brandVoiceProfile.profile_name}" voice profile
            </p>
            <Button
              onClick={() => checkVoiceMutation.mutate(content)}
              disabled={checkVoiceMutation.isPending}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
            >
              {checkVoiceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Check Brand Voice
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          
          {/* Overall Score */}
          <Card className={`border-2 rounded-2xl ${
            checkResult.consistency_score >= 80 ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' :
            checkResult.consistency_score >= 65 ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
            'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Brand Voice Consistency</CardTitle>
                <div className="text-right">
                  <p className={`text-5xl font-bold ${getScoreColor(checkResult.consistency_score)}`}>
                    {checkResult.consistency_score}
                  </p>
                  <p className="text-gray-400 text-sm">out of 100</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(checkResult.score_breakdown || {}).map(([key, score]) => (
                  <div key={key} className="p-2 bg-[#0B0B0C] rounded-lg">
                    <p className="text-gray-400 text-xs capitalize mb-1">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className={`font-bold text-sm ${getScoreColor(score)}`}>{score}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Violations */}
          {checkResult.violations && checkResult.violations.length > 0 && (
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Issues Found ({checkResult.violations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {checkResult.violations.map((violation, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-l-4 ${
                      violation.severity === 'critical' ? 'bg-red-500/10 border-red-500' :
                      violation.severity === 'major' ? 'bg-orange-500/10 border-orange-500' :
                      violation.severity === 'minor' ? 'bg-yellow-500/10 border-yellow-500' :
                      'bg-blue-500/10 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className={
                          violation.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          violation.severity === 'major' ? 'bg-orange-500/20 text-orange-400' :
                          violation.severity === 'minor' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {violation.severity}
                        </Badge>
                        <Badge className="ml-2 bg-gray-700 text-gray-300">
                          {violation.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm mb-1">{violation.issue}</p>
                    <p className="text-gray-400 text-xs mb-2">{violation.explanation}</p>
                    
                    {violation.current_text && (
                      <div className="mt-3 space-y-2">
                        <div className="p-2 bg-red-500/10 rounded">
                          <p className="text-gray-500 text-xs mb-1">Current:</p>
                          <p className="text-gray-300 text-sm">"{violation.current_text}"</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 mx-auto" />
                        <div className="p-2 bg-green-500/10 rounded">
                          <p className="text-gray-500 text-xs mb-1">Suggested:</p>
                          <p className="text-green-400 text-sm">"{violation.suggested_fix}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {checkResult.strengths && checkResult.strengths.length > 0 && (
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  What Works Well
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {checkResult.strengths.map((strength, idx) => (
                  <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
                    <h5 className="text-green-400 font-semibold text-sm mb-1">{strength.aspect}</h5>
                    <p className="text-gray-300 text-sm mb-1">"{strength.example}"</p>
                    <p className="text-gray-500 text-xs">{strength.why_it_works}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Improvement Suggestions */}
          {checkResult.improvement_suggestions && checkResult.improvement_suggestions.length > 0 && (
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00D4C9]" />
                  Top Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {checkResult.improvement_suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                        <span className="text-black font-bold text-xs">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm mb-1">{suggestion.suggestion}</p>
                        <p className="text-gray-500 text-xs mb-2">Impact: {suggestion.impact}</p>
                        
                        {suggestion.before && suggestion.after && (
                          <div className="mt-2 space-y-1">
                            <div className="p-2 bg-red-500/10 rounded text-xs">
                              <p className="text-gray-500 mb-1">Before:</p>
                              <p className="text-gray-300">{suggestion.before}</p>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded text-xs">
                              <p className="text-gray-500 mb-1">After:</p>
                              <p className="text-green-400">{suggestion.after}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Rewritten Version */}
          {checkResult.rewritten_content && (
            <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 border-2 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[#9D4EDD]" />
                    AI-Rewritten Version
                  </CardTitle>
                  <Badge className="bg-green-500/20 text-green-400 text-sm">
                    Expected Score: {checkResult.rewritten_score}/100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-[#0B0B0C] rounded-xl mb-4">
                  <p className="text-white leading-relaxed whitespace-pre-wrap">
                    {checkResult.rewritten_content}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(checkResult.rewritten_content);
                      alert('Copied to clipboard!');
                    }}
                    variant="outline"
                    className="border-gray-700"
                  >
                    Copy Rewrite
                  </Button>
                  <Button
                    onClick={() => {
                      if (onRewriteAccepted) {
                        onRewriteAccepted(checkResult.rewritten_content);
                      }
                      // Save that user used the rewrite
                      base44.entities.BrandVoiceCheck.update(checkResult.check?.id, {
                        user_used_rewrite: true,
                        user_accepted: true
                      });
                    }}
                    className="bg-gradient-to-r from-[#9D4EDD] to-[#FF69B4] text-white font-bold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Use This Version
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recheck Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setCheckResult(null)}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400"
            >
              Run New Check
            </Button>
          </div>

        </motion.div>
      )}

    </div>
  );
}