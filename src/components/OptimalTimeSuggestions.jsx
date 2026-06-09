import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Sparkles,
  Loader2,
  TrendingUp,
  Sun,
  Moon,
  Sunrise
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function OptimalTimeSuggestions({ user, currentDate }) {
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate optimal posting time suggestions for the next 7 days.

USER: ${user.email}
CURRENT DATE: ${currentDate.toISOString().split('T')[0]}

Analyze and suggest:

1. BEST TIMES for each platform:
   - Instagram (3 time slots per day)
   - Facebook (3 time slots per day)
   - Twitter (4 time slots per day)
   - LinkedIn (3 time slots per day)
   - TikTok (3 time slots per day)
   - Email (2 time slots per day)

2. For each time slot provide:
   - Day of week
   - Exact time (24h format)
   - Platform
   - Expected reach multiplier (1.0 = normal, 1.5 = 50% better)
   - Reason why this time is optimal
   - Competition level (low/medium/high)
   - Content type recommendation

3. DAILY RECOMMENDATIONS:
   - Best time to post each day
   - Platform priority
   - Content type priority

4. STRATEGIC INSIGHTS:
   - Audience activity patterns
   - Best days for engagement
   - Worst times to avoid

Format as structured JSON for next 7 days.`,
        response_json_schema: {
          type: "object",
          properties: {
            daily_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  day_of_week: { type: "string" },
                  best_time: { type: "string" },
                  platform: { type: "string" },
                  content_type: { type: "string" },
                  reach_multiplier: { type: "number" },
                  reason: { type: "string" },
                  competition: { type: "string" }
                }
              }
            },
            platform_best_times: {
              type: "object",
              properties: {
                instagram: { type: "array", items: { type: "string" } },
                facebook: { type: "array", items: { type: "string" } },
                twitter: { type: "array", items: { type: "string" } },
                linkedin: { type: "array", items: { type: "string" } },
                tiktok: { type: "array", items: { type: "string" } },
                email: { type: "array", items: { type: "string" } }
              }
            },
            strategic_insights: {
              type: "object",
              properties: {
                best_days: { type: "array", items: { type: "string" } },
                worst_times: { type: "array", items: { type: "string" } },
                audience_peak_hours: { type: "array", items: { type: "string" } },
                content_frequency_recommendation: { type: "string" }
              }
            }
          }
        }
      });

      return result;
    },
    onSuccess: (result) => {
      setSuggestions(result);
    }
  });

  const timeOfDayIcon = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return Sunrise;
    if (hour >= 12 && hour < 18) return Sun;
    return Moon;
  };

  if (!suggestions && !generateSuggestionsMutation.isPending) {
    return (
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 text-sm mb-3">Get AI-powered posting time suggestions</p>
          <Button
            onClick={() => generateSuggestionsMutation.mutate()}
            size="sm"
            className="bg-[#FFD700] text-black"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get Optimal Times
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (generateSuggestionsMutation.isPending) {
    return (
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-[#FFD700] animate-spin" />
          <p className="text-gray-400 text-sm">Analyzing optimal times...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-[#FFD700]" />
          Optimal Posting Times
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {/* Today's Best Time */}
        {suggestions.daily_suggestions && suggestions.daily_suggestions[0] && (
          <div className="p-3 bg-[#0B0B0C] rounded-lg border-2 border-[#FFD700]">
            <p className="text-gray-400 text-xs mb-1">🔥 Best Time Today</p>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-bold text-lg">{suggestions.daily_suggestions[0].best_time}</p>
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                {suggestions.daily_suggestions[0].reach_multiplier}x reach
              </Badge>
            </div>
            <p className="text-gray-300 text-xs mb-1 capitalize">
              {suggestions.daily_suggestions[0].platform} • {suggestions.daily_suggestions[0].content_type?.replace('_', ' ')}
            </p>
            <p className="text-gray-500 text-xs">{suggestions.daily_suggestions[0].reason}</p>
          </div>
        )}

        {/* Next 7 Days */}
        <div>
          <p className="text-gray-400 text-xs mb-2">Next 7 Days</p>
          <div className="space-y-1">
            {suggestions.daily_suggestions?.slice(1, 8).map((day, idx) => {
              const TimeIcon = timeOfDayIcon(day.best_time);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-2 bg-[#0B0B0C] rounded border border-gray-800 hover:border-[#FFD700] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TimeIcon className="w-3 h-3 text-[#FFD700]" />
                      <div>
                        <p className="text-white text-xs font-medium">{day.day_of_week}</p>
                        <p className="text-gray-500 text-xs">{day.best_time}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs capitalize">
                      {day.platform}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Strategic Insights */}
        {suggestions.strategic_insights && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 font-semibold text-xs mb-2">💡 Insights</p>
            <div className="space-y-1 text-xs">
              {suggestions.strategic_insights.best_days && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Best days:</span> {suggestions.strategic_insights.best_days.join(', ')}
                </p>
              )}
              {suggestions.strategic_insights.audience_peak_hours && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Peak hours:</span> {suggestions.strategic_insights.audience_peak_hours.slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={() => generateSuggestionsMutation.mutate()}
          size="sm"
          variant="outline"
          className="w-full border-gray-700 text-xs"
        >
          Refresh Suggestions
        </Button>

      </CardContent>
    </Card>
  );
}