import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Loader2,
  Share2,
  Mail,
  FileText,
  Video
} from 'lucide-react';

export default function QuickAddContent({ user, currentDate }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    event_type: 'social_post',
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '12:00',
    platforms: ['instagram']
  });

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      const scheduledDateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}:00`);
      
      return await base44.entities.ContentCalendarEvent.create({
        user_email: user.email,
        event_type: data.event_type,
        title: data.title,
        description: data.description,
        scheduled_date: scheduledDateTime.toISOString(),
        platforms: data.platforms,
        status: 'draft',
        color: 
          data.event_type === 'social_post' ? '#00D4C9' :
          data.event_type === 'email_campaign' ? '#3B82F6' :
          data.event_type === 'blog_post' ? '#A855F7' :
          '#FFD700'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contentCalendarEvents']);
      setShowForm(false);
      setFormData({
        event_type: 'social_post',
        title: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '12:00',
        platforms: ['instagram']
      });
    }
  });

  const eventTypes = [
    { value: 'social_post', label: 'Social Post', icon: Share2 },
    { value: 'email_campaign', label: 'Email', icon: Mail },
    { value: 'blog_post', label: 'Blog Post', icon: FileText },
    { value: 'video_publish', label: 'Video', icon: Video }
  ];

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">Quick Add</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="bg-[#FFD700] text-black h-7"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      {showForm && (
        <CardContent className="space-y-3">
          
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Type</label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData({...formData, event_type: value})}
            >
              <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Content title..."
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg h-9 text-sm"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description..."
              rows={2}
              className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Date</label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Time</label>
              <Input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-700 text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createEventMutation.mutate(formData)}
              disabled={!formData.title || !formData.scheduled_date || createEventMutation.isPending}
              size="sm"
              className="flex-1 bg-[#00D4C9] text-black text-xs h-9"
            >
              {createEventMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Add to Calendar'
              )}
            </Button>
          </div>

        </CardContent>
      )}
    </Card>
  );
}