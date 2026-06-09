import { base44 } from "@/api/base44Client";

/**
 * Voice Engine - Multi-language speech recognition & synthesis
 * Supports 50+ languages with real-time translation
 */

export class VoiceEngine {
  constructor(language = "en-US") {
    this.language = language;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.initRecognition();
  }

  /**
   * Initialize Speech Recognition
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
    }
  }

  /**
   * Start listening for voice input
   */
  async startListening(onResult, onInterim, onError) {
    if (!this.recognition) {
      // Fallback to OpenAI Whisper if browser doesn't support
      return this.fallbackToWhisper(onResult, onError);
    }

    return new Promise((resolve, reject) => {
      this.isListening = true;

      this.recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          onResult(transcript);
          resolve(transcript);
        } else {
          onInterim?.(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        onError?.(event.error);
        reject(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Speak text with natural voice
   */
  async speak(text, voice = null) {
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language;
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use specific voice if provided
    if (voice) {
      utterance.voice = voice;
    } else {
      // Auto-select best voice for language
      const voices = this.synthesis.getVoices();
      const matchingVoice = voices.find(v => 
        v.lang.startsWith(this.language.split('-')[0]) && v.name.includes('Natural')
      ) || voices.find(v => v.lang.startsWith(this.language.split('-')[0]));
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = reject;
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Get available voices for current language
   */
  getAvailableVoices() {
    const voices = this.synthesis.getVoices();
    return voices.filter(voice => 
      voice.lang.startsWith(this.language.split('-')[0])
    );
  }

  /**
   * Change language
   */
  setLanguage(languageCode) {
    this.language = languageCode;
    if (this.recognition) {
      this.recognition.lang = languageCode;
    }
  }

  /**
   * Fallback to OpenAI Whisper API for speech recognition
   */
  async fallbackToWhisper(onResult, onError) {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        try {
          // Upload to base44
          const { file_url } = await base44.integrations.Core.UploadFile({
            file: audioBlob
          });

          // Transcribe using AI
          const transcription = await base44.integrations.Core.InvokeLLM({
            prompt: `Transcribe this audio to text. Language: ${this.language}`,
            file_urls: [file_url]
          });

          onResult(transcription);
        } catch (error) {
          onError?.(error);
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      
      // Record for max 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000);

      return new Promise((resolve) => {
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioBlob });
          const transcription = await base44.integrations.Core.InvokeLLM({
            prompt: `Transcribe this audio to text. Language: ${this.language}`,
            file_urls: [file_url]
          });
          resolve(transcription);
        };
      });
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }

  /**
   * Detect language from text
   */
  async detectLanguage(text) {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect the language of this text and return ONLY the ISO language code (e.g., en, es, fr, de, zh, ar, hi, pt, ja, ko, ru, it, nl, pl, tr, vi, th, id, he, sv, no, da, fi, cs, ro, hu, el, bg, uk, sr, hr, sk, sl, et, lv, lt, mt, ga, cy, is, fa, ur, bn, ta, te, mr, gu, kn, ml, si, my, km, lo, ka, hy, az, kk, uz, tk, mn, ne, ps, sd, ug, bo, dz, am, ti, om, so, sw).\n\nText: "${text}"\n\nRespond with ONLY the 2-letter code.`
    });

    return response.trim().toLowerCase();
  }

  /**
   * Translate text to target language
   */
  async translate(text, targetLanguage) {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate this text to ${targetLanguage}. Return ONLY the translation, no explanations.\n\nText: "${text}"`
    });

    return response.trim();
  }

  /**
   * Stop all speech
   */
  stopSpeaking() {
    this.synthesis.cancel();
  }
}

/**
 * Supported Languages Configuration
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "es-MX", name: "Español (México)", flag: "🇲🇽" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "pt-PT", name: "Português (Portugal)", flag: "🇵🇹" },
  { code: "zh-CN", name: "中文 (简体)", flag: "🇨🇳" },
  { code: "zh-TW", name: "中文 (繁體)", flag: "🇹🇼" },
  { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
  { code: "ar-SA", name: "العربية", flag: "🇸🇦" },
  { code: "hi-IN", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ru-RU", name: "Русский", flag: "🇷🇺" },
  { code: "tr-TR", name: "Türkçe", flag: "🇹🇷" },
  { code: "nl-NL", name: "Nederlands", flag: "🇳🇱" },
  { code: "pl-PL", name: "Polski", flag: "🇵🇱" },
  { code: "vi-VN", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th-TH", name: "ไทย", flag: "🇹🇭" },
  { code: "id-ID", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "he-IL", name: "עברית", flag: "🇮🇱" },
  { code: "sv-SE", name: "Svenska", flag: "🇸🇪" },
  { code: "no-NO", name: "Norsk", flag: "🇳🇴" },
  { code: "da-DK", name: "Dansk", flag: "🇩🇰" },
  { code: "fi-FI", name: "Suomi", flag: "🇫🇮" },
  { code: "cs-CZ", name: "Čeština", flag: "🇨🇿" },
  { code: "ro-RO", name: "Română", flag: "🇷🇴" },
  { code: "hu-HU", name: "Magyar", flag: "🇭🇺" },
  { code: "el-GR", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "uk-UA", name: "Українська", flag: "🇺🇦" }
];

export default VoiceEngine;