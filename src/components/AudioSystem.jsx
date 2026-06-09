import { useEffect, useRef } from 'react';

// Audio feedback system tuned to 888 Hz - frequency of abundance and prosperity
export const useAudio = () => {
  const audioContextRef = useRef(null);
  
  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Base frequency: 888 Hz (abundance, prosperity, manifestation)
  const BASE_FREQUENCY = 888;
  
  // Harmonic ratios based on 888 Hz
  const HARMONICS = {
    root: 888,           // Root frequency - abundance
    fifth: 1332,         // Perfect fifth (1.5x) - elevation
    octave: 1776,        // Perfect octave (2x) - completion
    third: 1110,         // Major third (1.25x) - joy
    fourth: 1184,        // Perfect fourth (1.333x) - stability
    lowFifth: 592,       // Lower fifth (0.666x) - grounding
    subRoot: 444,        // Sub-root (0.5x) - foundation
    harmonic: 2664       // Second harmonic (3x) - transcendence
  };

  // Create frequency-based sound with 888 Hz harmonics
  const playTone = (frequency, duration, volume = 0.1, type = 'sine') => {
    if (!audioContextRef.current) return;
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Envelope for smooth sound with abundance resonance
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  };

  // Play chord with multiple harmonics
  const playChord = (frequencies, duration, volume = 0.08) => {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, duration, volume * (1 - index * 0.1));
      }, index * 30);
    });
  };

  // Success sound (888 Hz abundance chord)
  const playSuccess = () => {
    // Ascending prosperity chord based on 888 Hz
    playChord([
      HARMONICS.subRoot,  // 444 Hz - foundation
      HARMONICS.lowFifth, // 592 Hz - grounding
      HARMONICS.root,     // 888 Hz - abundance
      HARMONICS.third     // 1110 Hz - joy
    ], 0.2, 0.09);
  };

  // Error sound (gentle 888 Hz descending for correction)
  const playError = () => {
    playTone(HARMONICS.third, 0.1, 0.06);      // 1110 Hz
    setTimeout(() => playTone(HARMONICS.root, 0.15, 0.06), 100); // 888 Hz
  };

  // Notification sound (888 Hz ping with harmonic)
  const playNotification = () => {
    playTone(HARMONICS.root, 0.08, 0.05);      // 888 Hz
    setTimeout(() => playTone(HARMONICS.third, 0.12, 0.05), 60); // 1110 Hz
  };

  // Click sound (888 Hz tap)
  const playClick = () => {
    playTone(HARMONICS.root, 0.03, 0.03, 'square');
  };

  // Whoosh sound (888 Hz sweep for transitions)
  const playWhoosh = () => {
    if (!audioContextRef.current) return;
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const filter = context.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sawtooth';
    // Sweep from octave down to root 888 Hz
    oscillator.frequency.setValueAtTime(HARMONICS.octave, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(HARMONICS.root, context.currentTime + 0.3);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(HARMONICS.octave, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(HARMONICS.root, context.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.04, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  };

  // Level up sound (888 Hz ascending manifestation chord)
  const playLevelUp = () => {
    const ascendingHarmonics = [
      HARMONICS.subRoot,   // 444 Hz
      HARMONICS.lowFifth,  // 592 Hz
      HARMONICS.root,      // 888 Hz
      HARMONICS.third,     // 1110 Hz
      HARMONICS.fifth      // 1332 Hz
    ];
    
    ascendingHarmonics.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 0.07), i * 80);
    });
  };

  // Processing sound (888 Hz pulse)
  const playProcessing = () => {
    playTone(HARMONICS.root, 0.1, 0.04);       // 888 Hz
    setTimeout(() => playTone(HARMONICS.third, 0.1, 0.04), 200); // 1110 Hz
  };

  // Ambient background tone (optional - for meditation/focus mode)
  const playAmbient888 = () => {
    if (!audioContextRef.current) return;
    
    const context = audioContextRef.current;
    
    // Create three oscillators for rich ambient sound
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const osc3 = context.createOscillator();
    
    const gain1 = context.createGain();
    const gain2 = context.createGain();
    const gain3 = context.createGain();
    
    const masterGain = context.createGain();
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);
    
    masterGain.connect(context.destination);
    
    // 888 Hz trinity
    osc1.frequency.value = HARMONICS.subRoot; // 444 Hz (sub-harmonic)
    osc2.frequency.value = HARMONICS.root;    // 888 Hz (root)
    osc3.frequency.value = HARMONICS.octave;  // 1776 Hz (octave)
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'triangle';
    
    // Very subtle ambient volumes
    gain1.gain.value = 0.01;
    gain2.gain.value = 0.015;
    gain3.gain.value = 0.008;
    
    masterGain.gain.setValueAtTime(0, context.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.02, context.currentTime + 2);
    
    osc1.start(context.currentTime);
    osc2.start(context.currentTime);
    osc3.start(context.currentTime);
    
    // Play for 30 seconds then fade
    masterGain.gain.setValueAtTime(0.02, context.currentTime + 28);
    masterGain.gain.linearRampToValueAtTime(0, context.currentTime + 30);
    
    osc1.stop(context.currentTime + 30);
    osc2.stop(context.currentTime + 30);
    osc3.stop(context.currentTime + 30);
    
    return () => {
      // Cleanup function
      osc1.stop();
      osc2.stop();
      osc3.stop();
    };
  };

  // Prosperity chime (full 888 Hz harmony)
  const playProsperityChime = () => {
    // Play all harmonics simultaneously for manifestation moment
    [
      HARMONICS.subRoot,
      HARMONICS.root,
      HARMONICS.third,
      HARMONICS.fifth
    ].forEach((freq, i) => {
      playTone(freq, 0.5, 0.06 * (1 - i * 0.15), 'sine');
    });
  };

  return {
    playSuccess,
    playError,
    playNotification,
    playClick,
    playWhoosh,
    playLevelUp,
    playProcessing,
    playAmbient888,
    playProsperityChime,
    HARMONICS, // Export harmonics for custom use
  };
};

// Context provider for audio across app
import React, { createContext, useContext } from 'react';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const audio = useAudio();
  
  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioFeedback = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioFeedback must be used within AudioProvider');
  }
  return context;
};