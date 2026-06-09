import React, { useEffect, useRef } from 'react';

// Lottie animation component (using inline JSON animations)
export default function LottieIcon({ animation, loop = false, autoplay = true, className = "", size = 24 }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Simple frame-based animation system
    let frame = 0;
    let animationFrame;
    const totalFrames = 60;

    const animate = () => {
      if (!containerRef.current) return;
      
      frame++;
      if (frame >= totalFrames) {
        if (loop) {
          frame = 0;
        } else {
          return;
        }
      }

      // Update animation based on type
      const progress = frame / totalFrames;
      
      if (animation === 'success') {
        // Checkmark draw animation
        const svg = containerRef.current.querySelector('svg');
        if (svg) {
          const path = svg.querySelector('path');
          if (path) {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length * (1 - progress);
          }
        }
      } else if (animation === 'loading') {
        // Spinner rotation
        const element = containerRef.current.querySelector('.lottie-element');
        if (element) {
          element.style.transform = `rotate(${progress * 360}deg)`;
        }
      } else if (animation === 'pulse') {
        // Scale pulse
        const element = containerRef.current.querySelector('.lottie-element');
        if (element) {
          const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
          element.style.transform = `scale(${scale})`;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    if (autoplay) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animation, loop, autoplay]);

  // Render different animation types
  const renderAnimation = () => {
    switch (animation) {
      case 'success':
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
          >
            <circle cx="12" cy="12" r="10" stroke="#00FF88" strokeWidth="2" fill="none" />
            <path
              d="M7 12l3 3 7-7"
              stroke="#00FF88"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        );
      
      case 'loading':
        return (
          <div className={`lottie-element ${className}`} style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="60 40"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#00D4C9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`lottie-element ${className}`} style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="8" fill="url(#pulseGradient)" opacity="0.8" />
              <defs>
                <radialGradient id="pulseGradient">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#00D4C9" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        );
      
      case 'sparkle':
        return (
          <div className={`lottie-element ${className}`} style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                fill="url(#sparkleGradient)"
              />
              <path
                d="M19 5L19.5 7L21.5 7.5L19.5 8L19 10L18.5 8L16.5 7.5L18.5 7L19 5Z"
                fill="url(#sparkleGradient)"
                opacity="0.7"
              />
              <defs>
                <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );
      
      case 'rocket':
        return (
          <div className={`lottie-element ${className}`} style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C12 2 20 6 20 12C20 18 16 22 12 22C8 22 4 18 4 12C4 6 12 2 12 2Z"
                fill="url(#rocketGradient)"
              />
              <circle cx="12" cy="10" r="2" fill="#FFD700" />
              <path
                d="M8 22C8 22 7 20 7 18M16 22C16 22 17 20 17 18M12 22V24"
                stroke="#FF4433"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="rocketGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#00D4C9" />
                  <stop offset="100%" stopColor="#1E90FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="lottie-container inline-block">
      {renderAnimation()}
    </div>
  );
}

// Pre-built animation components for common use cases
export const SuccessAnimation = ({ size = 48, className = "" }) => (
  <LottieIcon animation="success" size={size} className={className} autoplay loop={false} />
);

export const LoadingAnimation = ({ size = 32, className = "" }) => (
  <LottieIcon animation="loading" size={size} className={className} autoplay loop />
);

export const PulseAnimation = ({ size = 24, className = "" }) => (
  <LottieIcon animation="pulse" size={size} className={className} autoplay loop />
);

export const SparkleAnimation = ({ size = 24, className = "" }) => (
  <LottieIcon animation="sparkle" size={size} className={className} autoplay loop />
);

export const RocketAnimation = ({ size = 32, className = "" }) => (
  <LottieIcon animation="rocket" size={size} className={className} autoplay loop={false} />
);