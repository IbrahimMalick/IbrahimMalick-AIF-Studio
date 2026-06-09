import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar as CalendarIcon,
  Grid3x3,
  List,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Mail,
  Share2,
  FileText,
  Video,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarView from '@/components/CalendarView';
import ContentGapAnalysis from '@/components/ContentGapAnalysis';
import OptimalTimeSuggestions from '@/components/OptimalTimeSuggestions';
import QuickAddContent from '@/components/QuickAddContent';

export default function UnifiedContentCalendar() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilters, setSelectedFilters] = useState({
    types: [],
    platforms: [],
    status: []
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['contentCalendarEvents', user?.email],
    queryFn: () => base44.entities.ContentCalendarEvent.filter(
      { user_email: user.email },
      'scheduled_date',
      200
    ),
    enabled: !!user
  });

  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ['scheduledPosts', user?.email],
    queryFn: () => base44.entities.ScheduledPost.filter(
      { user_email: user.email },
      'schedule_time',
      100
    ),
    enabled: !!user
  });

  // Combine all content sources into calendar
  const allEvents = React.useMemo(() => {
    const events = [...calendarEvents];

    // Add scheduled posts that aren't already in calendar
    scheduledPosts.forEach(post => {
      if (post.schedule_time && !events.find(e => e.source_entity_id === post.id)) {
        events.push({
          id: `sp_${post.id}`,
          user_email: post.user_email,
          event_type: 'social_post',
          title: post.title || post.caption?.substring(0, 50) + '...',
          scheduled_date: post.schedule_time,
          platforms: post.platforms,
          content_preview: post.caption,
          content_url: post.content_url,
          thumbnail_url: post.thumbnail_url,
          status: post.status === 'published' ? 'published' : 'scheduled',
          source_entity_type: 'ScheduledPost',
          source_entity_id: post.id,
          color: '#00D4C9'
        });
      }
    });

    return events.sort((a, b) => 
      new Date(a.scheduled_date) - new Date(b.scheduled_date)
    );
  }, [calendarEvents, scheduledPosts]);

  const stats = {
    total: allEvents.length,
    scheduled: allEvents.filter(e => e.status === 'scheduled').length,
    published: allEvents.filter(e => e.status === 'published').length,
    draft: allEvents.filter(e => e.status === 'draft').length,
    social: allEvents.filter(e => e.event_type === 'social_post').length,
    email: allEvents.filter(e => e.event_type === 'email_campaign').length,
    blog: allEvents.filter(e => e.event_type === 'blog_post').length
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const eventTypeIcons = {
    social_post: Share2,
    email_campaign: Mail,
    blog_post: FileText,
    video_publish: Video,
    ad_campaign: TrendingUp
  };

  const eventTypeColors = {
    social_post: 'bg-[#00D4C9]/20 text-[#00D4C9]',
    email_campaign: 'bg-blue-500/20 text-blue-400',
    blog_post: 'bg-purple-500/20 text-purple-400',
    video_publish: 'bg-[#FFD700]/20 text-[#FFD700]',
    ad_campaign: 'bg-green-500/20 text-green-400'
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-[#FFD700]" />
            Unified Content Calendar
          </h1>
          <p className="text-gray-400">
            Visualize, schedule, and optimize all your content in one place
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {[
            { label: 'Total Events', value: stats.total, icon: CalendarIcon, color: 'text-[#FFD700]' },
            { label: 'Scheduled', value: stats.scheduled, icon: CalendarIcon, color: 'text-blue-400' },
            { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Draft', value: stats.draft, icon: AlertCircle, color: 'text-gray-400' },
            { label: 'Social', value: stats.social, icon: Share2, color: 'text-[#00D4C9]' },
            { label: 'Email', value: stats.email, icon: Mail, color: 'text-blue-400' },
            { label: 'Blog', value: stats.blog, icon: FileText, color: 'text-purple-400' }
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

        {/* Main Calendar */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Calendar Display */}
          <div className="lg:col-span-2 space-y-4">
            
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigateMonth(-1)}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <h3 className="text-white font-bold text-lg">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigateMonth(1)}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                      variant="outline"
                      className="border-gray-700 text-sm"
                    >
                      Today
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#0B0B0C] rounded-lg p-1">
                      {['month', 'week', 'list'].map(v => (
                        <Button
                          key={v}
                          size="sm"
                          onClick={() => setView(v)}
                          variant={view === v ? 'default' : 'ghost'}
                          className={`${view === v ? 'bg-[#FFD700] text-black' : 'text-gray-400'} capitalize`}
                        >
                          {v === 'month' && <Grid3x3 className="w-4 h-4" />}
                          {v === 'week' && <CalendarIcon className="w-4 h-4" />}
                          {v === 'list' && <List className="w-4 h-4" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarView
                  events={allEvents}
                  currentDate={currentDate}
                  view={view}
                  user={user}
                  onEventUpdate={(event) => {
                    queryClient.invalidateQueries(['contentCalendarEvents']);
                    queryClient.invalidateQueries(['scheduledPosts']);
                  }}
                />
              </CardContent>
            </Card>

          </div>

          {/* Sidebar - AI Insights & Quick Actions */}
          <div className="space-y-4">
            
            {/* Quick Add */}
            <QuickAddContent user={user} currentDate={currentDate} />

            {/* AI Optimal Times */}
            <OptimalTimeSuggestions user={user} currentDate={currentDate} />

            {/* Content Gap Analysis */}
            <ContentGapAnalysis user={user} events={allEvents} currentDate={currentDate} />

            {/* Filters */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                <div>
                  <p className="text-gray-400 text-xs mb-2">Content Type</p>
                  <div className="flex flex-wrap gap-1">
                    {['social_post', 'email_campaign', 'blog_post', 'video_publish'].map(type => {
                      const Icon = eventTypeIcons[type];
                      return (
                        <Badge
                          key={type}
                          className={`cursor-pointer ${eventTypeColors[type]}`}
                          onClick={() => {
                            // Toggle filter
                            setSelectedFilters(prev => ({
                              ...prev,
                              types: prev.types.includes(type)
                                ? prev.types.filter(t => t !== type)
                                : [...prev.types, type]
                            }));
                          }}
                        >
                          {Icon && <Icon className="w-3 h-3 mr-1" />}
                          {type.replace('_', ' ')}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs mb-2">Status</p>
                  <div className="flex flex-wrap gap-1">
                    {['draft', 'scheduled', 'published'].map(status => (
                      <Badge
                        key={status}
                        className={`cursor-pointer ${
                          status === 'published' ? 'bg-green-500/20 text-green-400' :
                          status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}
                        onClick={() => {
                          setSelectedFilters(prev => ({
                            ...prev,
                            status: prev.status.includes(status)
                              ? prev.status.filter(s => s !== status)
                              : [...prev.status, status]
                          }));
                        }}
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Upcoming Events Quick View */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-sm">Next 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allEvents
                    .filter(e => {
                      const eventDate = new Date(e.scheduled_date);
                      const today = new Date();
                      const weekFromNow = new Date();
                      weekFromNow.setDate(weekFromNow.getDate() + 7);
                      return eventDate >= today && eventDate <= weekFromNow;
                    })
                    .slice(0, 5)
                    .map((event, idx) => {
                      const Icon = eventTypeIcons[event.event_type] || CalendarIcon;
                      return (
                        <div
                          key={event.id || idx}
                          className="p-2 bg-[#0B0B0C] rounded-lg border border-gray-800 hover:border-[#FFD700] transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-2">
                            <Icon className="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-medium truncate">
                                {event.title}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {new Date(event.scheduled_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <Badge className={eventTypeColors[event.event_type] || 'bg-gray-500/20 text-gray-400'}>
                              {event.status === 'scheduled' && <CheckCircle2 className="w-3 h-3" />}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  
                  {allEvents.filter(e => {
                    const eventDate = new Date(e.scheduled_date);
                    const today = new Date();
                    const weekFromNow = new Date();
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return eventDate >= today && eventDate <= weekFromNow;
                  }).length === 0 && (
                    <p className="text-gray-500 text-xs text-center py-4">
                      No upcoming events
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </div>
  );
}