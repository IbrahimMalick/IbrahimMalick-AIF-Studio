import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NotificationBell({ userEmail }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userEmail],
    queryFn: () => base44.entities.Notification.filter(
      { user_email: userEmail },
      "-created_date",
      20
    ),
    enabled: !!userEmail,
  });

  const markAsRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const notificationColors = {
    info: "border-blue-500/30 bg-blue-500/10",
    success: "border-green-500/30 bg-green-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/10",
    error: "border-red-500/30 bg-red-500/10",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="w-5 h-5 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4433] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-[#111317] border-gray-800 rounded-xl p-0">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-[#FF4433] text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-[#0B0B0C] transition-colors ${
                    !notification.is_read ? notificationColors[notification.type] : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm mb-1">
                        {notification.title}
                      </p>
                      <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">
                          {new Date(notification.created_date).toLocaleString()}
                        </span>
                        {notification.action_url && (
                          <Link to={notification.action_url}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs border-gray-700 hover:bg-[#1a1a1f] rounded-lg"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {notification.action_label || 'View'}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.is_read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => markAsRead.mutate(notification.id)}
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => deleteNotification.mutate(notification.id)}
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No notifications yet</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}