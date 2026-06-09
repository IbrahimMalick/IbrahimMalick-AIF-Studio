import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAudioFeedback } from './AudioSystem';
import { motion } from 'framer-motion';

export default function AnimatedButton({ 
  children, 
  onClick, 
  variant = "default",
  size = "default",
  className = "",
  soundEffect = "click",
  haptic = true,
  disabled = false,
  icon: Icon,
  prosperity = false,
  ...props 
}) {
  const audio = useAudioFeedback();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;

    if (prosperity) {
      audio.playProsperityChime();
    } else {
      switch (soundEffect) {
        case 'success':
          audio.playSuccess();
          break;
        case 'error':
          audio.playError();
          break;
        case 'whoosh':
          audio.playWhoosh();
          break;
        case 'level-up':
          audio.playLevelUp();
          break;
        case 'click':
        default:
          audio.playClick();
          break;
      }
    }

    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick) onClick(e);
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="inline-block"
    >
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        className={`${className} ${isPressed ? 'opacity-80' : ''} transition-all duration-150 ${
          prosperity ? 'relative overflow-hidden' : ''
        }`}
        disabled={disabled}
        {...props}
      >
        {prosperity && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#FFD700] via-[#00D4C9] to-[#FFD700]"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 100%',
              opacity: 0.1,
            }}
          />
        )}
        {Icon && (
          <motion.div
            animate={{ rotate: isPressed ? 360 : 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block mr-2"
          >
            <Icon className="w-4 h-4" />
          </motion.div>
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
}

export const SuccessButton = ({ children, ...props }) => (
  <AnimatedButton soundEffect="success" {...props}>
    {children}
  </AnimatedButton>
);

export const ActionButton = ({ children, ...props }) => (
  <AnimatedButton soundEffect="whoosh" {...props}>
    {children}
  </AnimatedButton>
);

export const ProsperityButton = ({ children, ...props }) => (
  <AnimatedButton prosperity={true} {...props}>
    {children}
  </AnimatedButton>
);