
import React, { useState, useEffect } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle2, Sparkles, BarChart3, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
// Assuming TranslationManager component is located here. Adjust path if necessary.
import TranslationManager from '@/components/TranslationManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TranslationCoverageMeter from "@/components/TranslationCoverageMeter";

const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
    coverage: 100,
    status: 'complete'
  },
  {
    code: 'es',
    label: 'Spanish',
    flag: '🇪🇸',
    nativeName: 'Español',
    coverage: 95,
    status: 'complete'
  },
  {
    code: 'fr',
    label: 'French',
    flag: '🇫🇷',
    nativeName: 'Français',
    coverage: 95,
    status: 'complete'
  },
  {
    code: 'pt',
    label: 'Portuguese',
    flag: '🇧🇷',
    nativeName: 'Português',
    coverage: 95,
    status: 'complete'
  }
];

export default function LanguageSettings() {
  const { lang, setLang, t } = useI18n();
  const [showSaved, setShowSaved] = useState(false);

  // In a real application, 'user' would typically be fetched from an authentication context or props.
  // For this example, a dummy user object is provided to satisfy the prop requirement for TranslationManager.
  const user = {
    id: 'current-user-id',
    name: 'Current User',
    // Add other user properties that TranslationManager might expect, e.g., role, permissions
    role: 'admin'
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const currentLanguage = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Calculate coverage for each language
  const calculateCoverage = (langCode) => {
    const overrides = JSON.parse(localStorage.getItem('afs_i18n_overrides') || '{}');
    const cache = JSON.parse(localStorage.getItem(`afs_i18n_cache_${langCode}`) || '{}');
    const langOverrides = overrides[langCode] || {};

    const totalEnglishKeys = Object.keys(window.__AFS_I18N__?.t ?
      JSON.parse(localStorage.getItem('afs_i18n_collected') || '{}') : {}
    ).length || 100; // Fallback to 100 if no keys collected

    const translatedKeys = Object.keys({ ...langOverrides, ...cache }).length;
    const coverage = (translatedKeys / Math.max(totalEnglishKeys, 1)) * 100;

    return {
      total: totalEnglishKeys,
      translated: translatedKeys,
      coverage: parseFloat(coverage.toFixed(2)), // Format to 2 decimal places
      missing: [] // Could calculate missing keys
    };
  };

  const languagesForCoverage = ['es', 'fr', 'pt', 'de', 'it', 'ar', 'ja', 'zh'];
  const coverageData = languagesForCoverage.map(langCode => ({
    lang: langCode,
    ...calculateCoverage(langCode)
  }));


  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#FFD700]" />
            {t('language_settings')}
          </h1>
          <p className="text-gray-400">{t('select_language_for_app')}</p>
        </div>

        <Tabs defaultValue="switcher" className="w-full">
          <TabsList className="bg-[#111317] rounded-xl flex h-auto p-1 overflow-x-auto">
            <TabsTrigger value="switcher" className="flex-shrink-0">
              <Globe className="w-4 h-4 mr-2" />
              Language Switcher
            </TabsTrigger>
            <TabsTrigger value="coverage" className="flex-shrink-0">
              <BarChart3 className="w-4 h-4 mr-2" />
              Translation Coverage
            </TabsTrigger>
            <TabsTrigger value="auto" className="flex-shrink-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-Translation
            </TabsTrigger>
            <TabsTrigger value="overrides" className="flex-shrink-0">
              <Edit3 className="w-4 h-4 mr-2" />
              Manage Overrides
            </TabsTrigger>
          </TabsList>

          <TabsContent value="switcher" className="space-y-6 mt-6">
            {/* Success Message */}
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <p className="text-white font-semibold">{t('saved')}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Current Language */}
            <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center text-4xl">
                    {currentLanguage.flag}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">
                      {currentLanguage.nativeName}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Current interface language
                    </p>
                    <Badge className="bg-green-500/20 text-green-400 mt-2">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Languages */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Available Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {LANGUAGES.map((language) => {
                    const isActive = lang === language.code;

                    return (
                      <motion.div
                        key={language.code}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => handleLanguageChange(language.code)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] border-2 border-[#A64EE7]'
                              : 'bg-[#0B0B0C] border-2 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl">{language.flag}</span>
                              <div>
                                <h4 className="text-white font-bold">
                                  {language.nativeName}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  {language.label}
                                </p>
                              </div>
                            </div>
                            {isActive && (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex-1 mr-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-400">Translation Coverage</span>
                                <span className="text-white font-bold">{language.coverage}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#111317] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#00D4C9] to-[#06D6A0]"
                                  style={{ width: `${language.coverage}%` }}
                                />
                              </div>
                            </div>
                            <Badge className={`text-xs ${
                              language.status === 'complete'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {language.status}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Coverage Tab */}
          <TabsContent value="coverage" className="space-y-6 mt-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#00D4C9]" />
                  Translation Coverage by Language
                </CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Monitor translation completeness across all supported languages
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coverageData.map((data) => (
                    <TranslationCoverageMeter
                      key={data.lang}
                      lang={data.lang}
                      coverage={data.coverage}
                      totalKeys={data.total}
                      translatedKeys={data.translated}
                      missing={data.missing}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overall Stats */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-blue-400 font-semibold mb-4">Overall Translation Health</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white mb-1">
                      {Math.round(coverageData.reduce((sum, d) => sum + d.coverage, 0) / Math.max(coverageData.length, 1))}%
                    </p>
                    <p className="text-gray-400 text-xs">Average Coverage</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400 mb-1">
                      {coverageData.filter(d => d.coverage >= 95).length}
                    </p>
                    <p className="text-gray-400 text-xs">Complete Languages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-400 mb-1">
                      {coverageData.filter(d => d.coverage >= 75 && d.coverage < 95).length}
                    </p>
                    <p className="text-gray-400 text-xs">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-400 mb-1">
                      {coverageData.filter(d => d.coverage < 75).length}
                    </p>
                    <p className="text-gray-400 text-xs">Need Attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auto" className="space-y-6 mt-6">
            {/* Translation Manager */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFD700]" />
                  Translation Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  Manage translations, extract new keys, and auto-translate to all languages
                </p>
                <TranslationManager user={user} />
              </CardContent>
            </Card>

            {/* Translation Preview */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFD700]" />
                  Translation Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'hero_title',
                    'hero_sub',
                    'marketing_suite',
                    'ask_copilot',
                    'intent.offer.score',
                    'msg.campaign_launched'
                  ].map((key) => (
                    <div key={key} className="p-3 bg-[#0B0B0C] rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs mb-1 font-mono">{key}</p>
                          <p className="text-white text-sm">{t(key)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overrides" className="space-y-6 mt-6">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#FFD700]" />
                  Manage Overrides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  This section will allow you to manually review and edit specific translation key overrides. Coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Coming Soon Languages */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { code: 'hi', label: 'Hindi', flag: '🇮🇳', name: 'हिन्दी' },
                { code: 'ru', label: 'Russian', flag: '🇷🇺', name: 'Русский' },
                { code: 'ko', label: 'Korean', flag: '🇰🇷', name: '한국어' }
              ].map((lang) => (
                <div
                  key={lang.code}
                  className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 text-center opacity-50"
                >
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <p className="text-white text-xs font-semibold">{lang.name}</p>
                  <p className="text-gray-500 text-xs">{lang.label}</p>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs mt-2">
                    Q1 2025
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-white font-bold mb-2">🌍 Multilingual AI Platform</h3>
            <p className="text-gray-300 text-sm mb-3">
              AI Freedom Studios supports multiple languages with AI-powered translations.
              All core features, copilot commands, and content generation work in your preferred language.
            </p>
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Interface fully translated</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Copilot understands your language</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">AI content generation in your language</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">Automatic language detection for content</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
