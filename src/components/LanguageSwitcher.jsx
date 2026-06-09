import React from 'react';
import { useI18n } from './I18nProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' }
];

export default function LanguageSwitcher({ variant = "default" }) {
  const { lang, setLang, t } = useI18n();

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-400" />
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-32 h-8 text-xs bg-[#0B0B0C] border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(language => (
              <SelectItem key={language.code} value={language.code}>
                {language.flag} {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-2">
      <label className="text-gray-300 text-sm block">
        {t('language')}
      </label>
      <Select value={lang} onValueChange={setLang}>
        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map(language => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}