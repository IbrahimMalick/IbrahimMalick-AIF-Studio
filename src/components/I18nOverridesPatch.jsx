import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// I18n Overrides Patch
// Extends I18nProvider by layering per-language overrides from localStorage
// Key: afs_i18n_overrides => { en: {...}, es: {...}, ... }

const OVERRIDE_KEY = 'afs_i18n_overrides';

export default function I18nOverridesPatch() {
  useEffect(() => {
    // Create global helper to resolve with overrides first
    if (typeof window !== 'undefined') {
      window.__AFS_T_OVR__ = function(key, vars) {
        try {
          const lang = localStorage.getItem('afs_lang') || 'en';
          const overrides = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}');
          
          // Try override first
          let txt = overrides?.[lang]?.[key];
          
          // Fallback to main translation
          if (!txt && window.__AFS_I18N__?.t) {
            txt = window.__AFS_I18N__.t(key, vars);
          }
          
          // Final fallback
          if (!txt) {
            txt = key;
          }
          
          // Replace variables
          if (vars) {
            for (const k in vars) {
              txt = txt.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
            }
          }
          
          return txt;
        } catch (e) {
          console.warn('I18n override error:', e);
          return key;
        }
      };

      // Event listener for override updates
      const handleOverridesUpdated = () => {
        console.debug('[AFS] i18n overrides updated');
        // Force re-render by dispatching i18n:update event
        window.dispatchEvent(new CustomEvent('afs:i18n:update'));
      };

      window.addEventListener('afs:i18n:overrides:updated', handleOverridesUpdated);
      
      return () => {
        window.removeEventListener('afs:i18n:overrides:updated', handleOverridesUpdated);
      };
    }
  }, []);

  return null; // Headless component
}

// Helper functions for managing overrides
export function getOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function setOverrides(overrides) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent('afs:i18n:overrides:updated'));
}

export function clearOverrides() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OVERRIDE_KEY);
  window.dispatchEvent(new CustomEvent('afs:i18n:overrides:updated'));
}

export function mergeOverrides(newOverrides, mode = 'merge') {
  const existing = getOverrides();
  const next = mode === 'replace' ? {} : { ...existing };
  
  // Handle both shapes: { en: {...}, es: {...} } or { dict: { en: {...}, es: {...} } }
  const src = newOverrides.dict || newOverrides;
  
  Object.keys(src).forEach(lang => {
    if (!next[lang] || mode === 'replace') {
      next[lang] = {};
    }
    next[lang] = { ...(next[lang] || {}), ...(src[lang] || {}) };
  });
  
  setOverrides(next);
  return next;
}

// Version tracking helpers
export async function saveOverrideVersion(userEmail, overrides, comment = '', versionName = '', tags = []) {
  if (typeof window === 'undefined') return;
  
  try {
    // Get current version number
    const history = await base44.entities.TranslationOverrideHistory.filter(
      { user_email: userEmail },
      '-version_number',
      1
    );
    
    const latestVersion = history[0];
    const newVersionNumber = (latestVersion?.version_number || 0) + 1;
    
    // Calculate changes
    const prevData = latestVersion ? JSON.parse(latestVersion.override_data) : {};
    const changes = calculateChanges(prevData, overrides);
    
    // Save version
    await base44.entities.TranslationOverrideHistory.create({
      user_email: userEmail,
      version_number: newVersionNumber,
      version_name: versionName || `Version ${newVersionNumber}`,
      override_data: JSON.stringify(overrides),
      changes_summary: comment || changes.summary,
      languages_affected: Object.keys(overrides),
      keys_added: changes.added,
      keys_modified: changes.modified,
      keys_deleted: changes.deleted,
      comment: comment,
      tags: tags,
      source: 'manual_import',
      file_size_kb: JSON.stringify(overrides).length / 1024,
      total_keys: Object.values(overrides).reduce((sum, lang) => sum + Object.keys(lang).length, 0),
      is_active: true
    });
    
    // Mark previous version as inactive
    if (latestVersion) {
      await base44.entities.TranslationOverrideHistory.update(latestVersion.id, {
        is_active: false
      });
    }
    
    return newVersionNumber;
  } catch (e) {
    console.error('Failed to save override version:', e);
    return null;
  }
}

function calculateChanges(oldData, newData) {
  const added = [];
  const modified = [];
  const deleted = [];
  
  // Find added and modified keys
  Object.keys(newData).forEach(lang => {
    Object.keys(newData[lang] || {}).forEach(key => {
      if (!oldData[lang]?.[key]) {
        added.push(`${lang}.${key}`);
      } else if (oldData[lang][key] !== newData[lang][key]) {
        modified.push(`${lang}.${key}`);
      }
    });
  });
  
  // Find deleted keys
  Object.keys(oldData).forEach(lang => {
    Object.keys(oldData[lang] || {}).forEach(key => {
      if (!newData[lang]?.[key]) {
        deleted.push(`${lang}.${key}`);
      }
    });
  });
  
  const summary = [
    added.length > 0 ? `+${added.length} added` : '',
    modified.length > 0 ? `~${modified.length} modified` : '',
    deleted.length > 0 ? `-${deleted.length} deleted` : ''
  ].filter(Boolean).join(', ') || 'No changes';
  
  return { added, modified, deleted, summary };
}

export async function restoreOverrideVersion(versionId) {
  if (typeof window === 'undefined') return false;
  
  try {
    const versions = await base44.entities.TranslationOverrideHistory.filter({ id: versionId });
    const version = versions[0];
    
    if (!version) {
      throw new Error('Version not found');
    }
    
    const overrides = JSON.parse(version.override_data);
    setOverrides(overrides);
    
    // Mark all versions as inactive
    const allVersions = await base44.entities.TranslationOverrideHistory.filter({
      user_email: version.user_email
    });
    
    for (const v of allVersions) {
      await base44.entities.TranslationOverrideHistory.update(v.id, { is_active: false });
    }
    
    // Create new version as restoration
    await saveOverrideVersion(
      version.user_email,
      overrides,
      `Restored from v${version.version_number}`,
      `Restored: ${version.version_name}`,
      ['restored', ...(version.tags || [])]
    );
    
    return true;
  } catch (e) {
    console.error('Failed to restore version:', e);
    return false;
  }
}