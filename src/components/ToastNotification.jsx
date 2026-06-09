import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useAudioFeedback } from './AudioSystem';
import LottieIcon from './LottieIcon';

// Premium toast notifications with audio
export default function ToastNotification({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const audio = useAudioFeedback();

  useEffect(() => {
    // Play sound based on type
    switch (type) {
      case 'success':
        audio.playSuccess();
        break;
      case 'error':
        audio.playError();
        break;
      case 'info':
      case 'warning':
        audio.playNotification();
        break;
    }

    // Auto-dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [type, duration, audio, onClose]);

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'from-[#00FF88] to-[#00CC6A]',
    error: 'from-[#FF4433] to-[#CC0000]',
    warning: 'from-[#FFD700] to-[#FFA500]',
    info: 'from-[#00D4C9] to-[#1E90FF]'
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 right-4 z-[9999] max-w-md"
        >
          <div className={`bg-[#151515] border border-gray-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl`}>
            <div className={`h-1 bg-gradient-to-r ${colors[type]} rounded-t-2xl absolute top-0 left-0 right-0`} />
            <div className="flex items-start gap-3 mt-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[type]} flex items-center justify-center flex-shrink-0`}>
                {type === 'success' ? (
                  <LottieIcon animation="success" size={24} />
                ) : (
                  <Icon className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{message}</p>
              </div>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose && onClose(), 300);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast manager
let toastId = 0;
const toasts = new Map();

export const showToast = (message, type = 'success', duration = 3000) => {
  const id = toastId++;
  const toast = { id, message, type, duration };
  toasts.set(id, toast);
  
  // Trigger re-render in toast container
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('showToast', { detail: toast }));
  }
  
  return id;
};

export const ToastContainer = () => {
  const [activeToasts, setActiveToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (e) => {
      setActiveToasts(prev => [...prev, e.detail]);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  const removeToast = (id) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
    toasts.delete(id);
  };

  return (
    <div className="fixed top-0 right-0 z-[9999] p-4 space-y-3 pointer-events-none">
      {activeToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastNotification
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};