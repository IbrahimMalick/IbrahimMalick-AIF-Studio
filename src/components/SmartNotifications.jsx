import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  TrendingUp,
  Film,
  Target,
  DollarSign,
  X,
  Bell,
  Volume2,
  VolumeX
} from "lucide-react";

export default function SmartNotifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState(null);

  const { data: dbNotifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({
      user_email: user.email,
      is_read: false
    }, "-created_date", 10),
    enabled: !!user,
    refetchInterval: 10000, // Check every 10 seconds
  });

  useEffect(() => {
    if (dbNotifications.length > notifications.length && soundEnabled) {
      play888HzChime();
    }
    setNotifications(dbNotifications);
  }, [dbNotifications]);

  // Generate 888 Hz success chime
  const play888HzChime = () => {
    try {
      const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      // Create 888 Hz tone (sacred frequency)
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 888; // 888 Hz - abundance frequency
      oscillator.type = 'sine';

      // Fade in/out
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (error) {
      console.log("Audio playback not available:", error);
    }
  };

  const getIcon = (type) => {
    const icons = {
      success: CheckCircle2,
      info: Info,
      warning: AlertCircle,
      error: AlertCircle
    };
    return icons[type] || Info;
  };

  const getColor = (type) => {
    const colors = {
      success: "bg-green-500/20 border-green-500/30 text-green-400",
      info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
      warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      error: "bg-red-500/20 border-red-500/30 text-red-400"
    };
    return colors[type] || colors.info;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      render_complete: Film,
      cost_alert: DollarSign,
      limit_reached: AlertCircle,
      collaboration: TrendingUp,
      system: Info
    };
    return icons[category] || Info;
  };

  const dismissNotification = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, {
      is_read: true
    });
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <>
      {/* Notification Bell (Top Bar) */}
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          className="relative"
          onClick={() => {/* Toggle notifications panel */}}
        >
          <Bell className="w-5 h-5 text-gray-400" />
          {notifications.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{notifications.length}</span>
            </div>
          )}
        </Button>
      </div>

      {/* Floating Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-3 max-w-md">
        <AnimatePresence>
          {notifications.slice(0, 3).map((notification) => {
            const NotificationIcon = getIcon(notification.type);
            const CategoryIcon = getCategoryIcon(notification.category);
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 400, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 400, scale: 0.8 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`p-4 rounded-2xl border backdrop-blur-lg ${getColor(notification.type)} shadow-2xl`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-green-500/20' :
                    notification.type === 'warning' ? 'bg-yellow-500/20' :
                    notification.type === 'error' ? 'bg-red-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <NotificationIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <p className="text-gray-200 text-sm mb-2">{notification.message}</p>
                    
                    {notification.action_url && (
                      <Button
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 text-white rounded-lg"
                        onClick={() => window.location.href = notification.action_url}
                      >
                        {notification.action_label || 'View'}
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotification(notification.id)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress Bar for auto-dismiss */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  onAnimationComplete={() => dismissNotification(notification.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Sound Toggle (Bottom Right) */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed bottom-6 right-28 z-40 w-10 h-10 rounded-full bg-[#111317] border border-gray-800"
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4 text-[#FFD700]" />
        ) : (
          <VolumeX className="w-4 h-4 text-gray-500" />
        )}
      </Button>
    </>
  );
}