import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Auto-translation hook - fills missing translations on-the-fly
export default function I18nAutoFill() {
  useEffect(() => {
    const state = JSON.parse(localStorage.getItem('afs_i18n_auto') || '{}');
    const enabled = !!state.enabled;
    const provider = state.provider || 'openai';
    const targets = Array.isArray(state.targets) ? state.targets : ['es', 'fr', 'pt'];

    async function translateMissing(enKey, enValue) {
      try {
        const lang = localStorage.getItem('afs_lang') || 'en';
        if (lang === 'en' || !enabled) return;

        // Cache per-lang map of translated strings
        const cacheKey = `afs_i18n_cache_${lang}`;
        const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        
        if (cache[enKey]) return; // Already translated

        // Use AI to translate
        const translation = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate this UI string from English to ${
            lang === 'es' ? 'Spanish (Spain)' : 
            lang === 'fr' ? 'French (France)' : 
            lang === 'pt' ? 'Portuguese (Brazil)' :
            lang === 'de' ? 'German (Germany)' :
            lang === 'it' ? 'Italian (Italy)' :
            lang === 'ar' ? 'Arabic' :
            lang === 'ja' ? 'Japanese' :
            lang === 'zh' ? 'Chinese (Simplified)' :
            lang
          }:

ENGLISH: "${enValue}"
KEY: ${enKey}

Guidelines:
- Maintain professional tone
- Keep technical terms (AI, CTV, ROAS) in English when appropriate
- Preserve any variable placeholders like {name}, {count}, {type}
- Keep it concise and natural

Return ONLY the translated text, nothing else.`
        });

        if (translation) {
          cache[enKey] = translation;
          localStorage.setItem(cacheKey, JSON.stringify(cache));

          // Save to database for future use
          try {
            await base44.entities.Translation.create({
              key: enKey,
              language_code: lang,
              translated_text: translation,
              context: "auto_generated",
              verified: false
            });
          } catch (dbError) {
            // Ignore DB errors, cache is enough
            console.log('Translation cached locally');
          }

          // Notify listeners to update UI
          window.dispatchEvent(new CustomEvent('afs:i18n:update', {
            detail: { key: enKey, lang, text: translation }
          }));
        }
      } catch (e) {
        console.warn('i18n auto-translate error:', e);
      }
    }

    function onNeed(ev) {
      const { key, en } = ev.detail || {};
      if (!key || !en) return;
      translateMissing(key, en);
    }

    window.addEventListener('afs:i18n:need', onNeed);
    return () => window.removeEventListener('afs:i18n:need', onNeed);
  }, []);

  return null; // Headless component
}

// Helper: Request translation for a key
export function requestTranslation(key, enValue) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('afs:i18n:need', {
      detail: { key, en: enValue }
    }));
  }
}

// Helper: Get cached translation
export function getCachedTranslation(key, lang) {
  if (typeof window === 'undefined') return null;
  
  const cacheKey = `afs_i18n_cache_${lang}`;
  const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
  return cache[key] || null;
}

// Helper: Clear translation cache
export function clearTranslationCache(lang = null) {
  if (typeof window === 'undefined') return;
  
  if (lang) {
    localStorage.removeItem(`afs_i18n_cache_${lang}`);
  } else {
    // Clear all language caches
    ['es', 'fr', 'pt', 'de', 'it', 'ar', 'ja', 'zh'].forEach(l => {
      localStorage.removeItem(`afs_i18n_cache_${l}`);
    });
  }
}