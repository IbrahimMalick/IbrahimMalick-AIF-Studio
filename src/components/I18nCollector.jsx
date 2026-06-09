import React, { useEffect } from 'react';

// Heuristic text collector: watches DOM for visible text, stores unique EN strings
function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 64) || ('k_' + Math.random().toString(36).slice(2, 8));
}

function extractTextFromNode(node) {
  if (!node) return;

  // Handle text nodes
  if (node.nodeType === Node.TEXT_NODE) {
    const txt = (node.nodeValue || '').replace(/\s+/g, ' ').trim();
    if (!txt) return;
    
    // Ignore trivial or noisy strings
    if (txt.length < 3) return;
    if (/^©|^\*|\{|\}|^http|^\/|^\d+$|^•|^-|^\+/i.test(txt)) return;
    
    // Store
    const existing = JSON.parse(localStorage.getItem('afs_i18n_collected') || '{}');
    if (!existing[txt]) {
      const key = slugify(txt);
      existing[txt] = { key, en: txt };
      localStorage.setItem('afs_i18n_collected', JSON.stringify(existing));
    }
    return;
  }

  // Handle element nodes
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  
  const el = node;
  const tag = el.tagName?.toLowerCase?.();
  if (!tag) return;

  // Skip non-text elements
  const skipTags = ['script', 'style', 'noscript', 'svg', 'path', 'meta', 'link', 'img', 'video', 'audio', 'canvas', 'input', 'textarea', 'code', 'pre'];
  if (skipTags.includes(tag)) return;
  
  // Respect opt-out
  if (el.hasAttribute('data-i18n-ignore')) return;

  // Extract direct text content
  const keyAttr = el.getAttribute('data-i18n-key');
  const directText = [...(el.childNodes || [])]
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.nodeValue)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (directText && directText.length >= 3) {
    const existing = JSON.parse(localStorage.getItem('afs_i18n_collected') || '{}');
    if (!existing[directText]) {
      const key = keyAttr || slugify(directText);
      existing[directText] = { key, en: directText };
      localStorage.setItem('afs_i18n_collected', JSON.stringify(existing));
    }
  }

  // Recurse into children
  if (el.childNodes) {
    [...el.childNodes].forEach(n => extractTextFromNode(n));
  }
}

export default function I18nCollector() {
  useEffect(() => {
    // Initial crawl
    try {
      extractTextFromNode(document.body);
    } catch (e) {
      console.warn('I18n collector initial crawl error:', e);
    }

    // Observe future changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          if (mutation.addedNodes) {
            [...mutation.addedNodes].forEach(node => {
              try {
                extractTextFromNode(node);
              } catch (e) {
                // Silently ignore extraction errors
              }
            });
          }
        } else if (mutation.type === 'characterData') {
          try {
            extractTextFromNode(mutation.target);
          } catch (e) {
            // Silently ignore
          }
        }
      }
    });

    try {
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true
      });
    } catch (e) {
      console.warn('I18n collector observer error:', e);
    }

    // Global helper for manual pushes
    window.AFS_I18N_PUSH = (key, en) => {
      const existing = JSON.parse(localStorage.getItem('afs_i18n_collected') || '{}');
      const finalKey = key || slugify(en);
      existing[en] = { key: finalKey, en };
      localStorage.setItem('afs_i18n_collected', JSON.stringify(existing));
      console.log(`✅ Added to i18n collection: ${finalKey} => "${en}"`);
    };

    // Cleanup
    return () => {
      try {
        observer.disconnect();
      } catch (e) {
        // Ignore
      }
    };
  }, []);

  return null; // Headless component
}

// Export helper function for use in other components
export function pushTranslationKey(key, enValue) {
  if (typeof window !== 'undefined' && window.AFS_I18N_PUSH) {
    window.AFS_I18N_PUSH(key, enValue);
  }
}