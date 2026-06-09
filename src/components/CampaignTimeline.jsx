import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Share2,
  Mail,
  FileText,
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CampaignTimeline({ campaign }) {
  const schedule = campaign.orchestration_schedule || [];
  
  // Group by day
  const scheduleByDay = schedule.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  const channelIcons = {
    social: Share2,
    email: Mail,
    blog: FileText,
    ads: Target
  };

  const channelColors = {
    social: 'bg-[#00D4C9]/20 text-[#00D4C9]',
    email: 'bg-blue-500/20 text-blue-400',
    blog: 'bg-purple-500/20 text-purple-400',
    ads: 'bg-green-500/20 text-green-400'
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#FFD700]" />
          Campaign Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {Object.entries(scheduleByDay)
            .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
            .map(([day, items]) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-2 border-[#FFD700] pl-4 relative"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#FFD700] border-4 border-[#0C0C0C]" />
                
                <div className="mb-3">
                  <p className="text-white font-bold">Day {day}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(new Date(campaign.start_date).getTime() + day * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const Icon = channelIcons[item.channel];
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={channelColors[item.channel]}>
                                {item.channel}
                              </Badge>
                              <Badge className="bg-gray-700 text-gray-300 text-xs capitalize">
                                {item.platform || item.content_type}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.scheduled_time}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs">{item.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}