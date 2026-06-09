import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Mail,
  FileText,
  Video,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  ExternalLink,
  Calendar as CalendarIcon
} from 'lucide-react';

export default function CalendarView({ events, currentDate, view, user, onEventUpdate }) {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, newDate, isScheduledPost }) => {
      if (isScheduledPost) {
        return base44.entities.ScheduledPost.update(eventId, {
          schedule_time: newDate.toISOString()
        });
      }
      return base44.entities.ContentCalendarEvent.update(eventId, {
        scheduled_date: newDate.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentCalendarEvents']);
      queryClient.invalidateQueries(['scheduledPosts']);
      if (onEventUpdate) onEventUpdate();
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId) => base44.entities.ContentCalendarEvent.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries(['contentCalendarEvents']);
      setSelectedEvent(null);
    }
  });

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.scheduled_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    
    if (draggedEvent && targetDate) {
      const newDateTime = new Date(targetDate);
      const originalTime = new Date(draggedEvent.scheduled_date);
      newDateTime.setHours(originalTime.getHours(), originalTime.getMinutes());

      const isScheduledPost = String(draggedEvent.id).startsWith('sp_');
      const realId = isScheduledPost
        ? draggedEvent.source_entity_id
        : draggedEvent.id;

      updateEventMutation.mutate({
        eventId: realId,
        newDate: newDateTime,
        isScheduledPost
      });
    }
    
    setDraggedEvent(null);
  };

  const eventTypeIcons = {
    social_post: Share2,
    email_campaign: Mail,
    blog_post: FileText,
    video_publish: Video,
    ad_campaign: TrendingUp
  };

  if (view === 'month') {
    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center p-2">
              <p className="text-gray-400 text-xs font-semibold">{day}</p>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            const dayEvents = date ? getEventsForDate(date) : [];
            const isToday = date && 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, date)}
                className={`min-h-[120px] p-2 rounded-lg border transition-all ${
                  date
                    ? isToday
                      ? 'bg-[#FFD700]/10 border-[#FFD700]'
                      : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-700'
                    : 'bg-transparent border-transparent'
                }`}
              >
                {date && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-semibold ${
                        isToday ? 'text-[#FFD700]' : 'text-white'
                      }`}>
                        {date.getDate()}
                      </p>
                      {dayEvents.length > 0 && (
                        <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs h-5 px-1">
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, eventIdx) => {
                        const Icon = eventTypeIcons[event.event_type] || Share2;
                        return (
                          <motion.div
                            key={event.id || eventIdx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, event)}
                            onClick={() => setSelectedEvent(event)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-1.5 rounded cursor-move hover:scale-105 transition-all text-xs truncate ${
                              event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                              event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <p className="text-gray-500 text-xs text-center">
                          +{dayEvents.length - 3} more
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#111317] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={
                          selectedEvent.status === 'published' ? 'bg-green-500/20 text-green-400' :
                          selectedEvent.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>
                          {selectedEvent.status}
                        </Badge>
                        <Badge className={eventTypeIcons[selectedEvent.event_type] ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-gray-700 text-gray-300'}>
                          {selectedEvent.event_type?.replace('_', ' ')}
                        </Badge>
                        {selectedEvent.ai_generated && (
                          <Badge className="bg-purple-500/20 text-purple-400">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedEvent(null)}
                      variant="ghost"
                      size="sm"
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Scheduled For</p>
                      <p className="text-white font-semibold">
                        {new Date(selectedEvent.scheduled_date).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {selectedEvent.scheduled_time_optimal && (
                        <Badge className="bg-green-500/20 text-green-400 mt-1 text-xs">
                          ⭐ AI Optimal Time
                        </Badge>
                      )}
                    </div>

                    {selectedEvent.platforms && selectedEvent.platforms.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Platforms</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedEvent.platforms.map((platform, idx) => (
                            <Badge key={idx} className="bg-[#00D4C9]/20 text-[#00D4C9] capitalize text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEvent.content_preview && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Content Preview</p>
                        <div className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                          <p className="text-gray-300 text-sm whitespace-pre-wrap">
                            {selectedEvent.content_preview}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEvent.engagement_prediction && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-xs font-semibold mb-2">📊 Performance Prediction</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-gray-400 text-xs">Est. Reach</p>
                            <p className="text-white font-bold">
                              {selectedEvent.engagement_prediction.estimated_reach?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Est. Engagement</p>
                            <p className="text-white font-bold">
                              {(selectedEvent.engagement_prediction.estimated_engagement_rate * 100)?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-gray-800">
                      <Button
                        onClick={() => {
                          if (selectedEvent.source_entity_type === 'ScheduledPost') {
                            window.location.href = '/SocialMedia';
                          }
                        }}
                        variant="outline"
                        className="flex-1 border-gray-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {selectedEvent.id && !selectedEvent.id.startsWith('sp_') && (
                        <Button
                          onClick={() => {
                            if (confirm('Delete this calendar event?')) {
                              deleteEventMutation.mutate(selectedEvent.id);
                            }
                          }}
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // List view
  if (view === 'list') {
    return (
      <div className="space-y-2">
        {events.map((event, idx) => {
          const Icon = eventTypeIcons[event.event_type] || Share2;
          return (
            <motion.div
              key={event.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FFD700] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{event.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      {new Date(event.scheduled_date).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {event.content_preview && (
                      <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                        {event.content_preview}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      <Badge className={
                        event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {event.status}
                      </Badge>
                      {event.platforms?.map((platform, pIdx) => (
                        <Badge key={pIdx} className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs capitalize">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedEvent(event)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}

        {events.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">No events scheduled</p>
            <p className="text-gray-500 text-sm">
              Start adding content to your calendar
            </p>
          </div>
        )}
      </div>
    );
  }

  // Week view
  if (view === 'week') {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={i} className="text-center p-2">
                <p className="text-gray-500 text-xs">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</p>
                <p className={`text-sm font-bold mt-0.5 ${isToday ? 'text-[#FFD700]' : 'text-white'}`}>
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={`min-h-[200px] p-2 rounded-lg border transition-all ${
                  isToday ? 'bg-[#FFD700]/10 border-[#FFD700]' : 'bg-[#0B0B0C] border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="space-y-1">
                  {dayEvents.map((event, eventIdx) => {
                    const Icon = eventTypeIcons[event.event_type] || Share2;
                    return (
                      <motion.div
                        key={event.id || eventIdx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={() => setSelectedEvent(event)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-1.5 rounded cursor-move text-xs ${
                          event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                          event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {new Date(event.scheduled_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {event.platforms?.slice(0,2).map((p, pi) => (
                          <span key={pi} className="text-[10px] text-cyan-400 capitalize block truncate">{p}</span>
                        ))}
                      </motion.div>
                    );
                  })}
                  {dayEvents.length === 0 && (
                    <p className="text-gray-700 text-xs text-center pt-8">Drop here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}