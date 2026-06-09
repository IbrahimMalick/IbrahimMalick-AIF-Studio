import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle2, Sparkles, Zap, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { clearTranslationCache } from '@/components/I18nAutoFill';

export default function I18nAutoSettings() {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [targets, setTargets] = useState(['es', 'fr', 'pt']);
  const [notice, setNotice] = useState('');
  const [cacheStats, setCacheStats] = useState({});

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('afs_i18n_auto') || '{}');
    if (s.enabled != null) setEnabled(!!s.enabled);
    if (s.provider) setProvider(s.provider);
    if (Array.isArray(s.targets)) setTargets(s.targets);

    // Load cache stats
    loadCacheStats();
  }, []);

  const loadCacheStats = () => {
    const stats = {};
    ['es', 'fr', 'pt', 'de', 'it', 'ar', 'ja', 'zh'].forEach(lang => {
      const cacheKey = `afs_i18n_cache_${lang}`;
      const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      stats[lang] = Object.keys(cache).length;
    });
    setCacheStats(stats);
  };

  function toggle(code) {
    setTargets(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);
  }

  function save() {
    const s = { enabled, provider, targets };
    localStorage.setItem('afs_i18n_auto', JSON.stringify(s));
    setNotice('✅ Auto-translation settings saved!');
    setTimeout(() => setNotice(''), 3000);
  }

  const clearCache = (lang = null) => {
    if (lang) {
      if (confirm(`Clear ${lang.toUpperCase()} translation cache? This will remove ${cacheStats[lang]} cached translations.`)) {
        clearTranslationCache(lang);
        loadCacheStats();
        setNotice(`✅ ${lang.toUpperCase()} cache cleared`);
        setTimeout(() => setNotice(''), 3000);
      }
    } else {
      if (confirm('Clear ALL translation caches? This will remove all auto-generated translations.')) {
        clearTranslationCache();
        loadCacheStats();
        setNotice('✅ All caches cleared');
        setTimeout(() => setNotice(''), 3000);
      }
    }
  };

  const allLanguages = [
    { code: 'es', label: 'Español', flag: '🇪🇸', name: 'Spanish' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', name: 'French' },
    { code: 'pt', label: 'Português', flag: '🇧🇷', name: 'Portuguese' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', name: 'German' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹', name: 'Italian' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦', name: 'Arabic' },
    { code: 'ja', label: '日本語', flag: '🇯🇵', name: 'Japanese' },
    { code: 'zh', label: '中文', flag: '🇨🇳', name: 'Chinese' }
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#FFD700]" />
            Auto-Translation Automation
          </h1>
          <p className="text-gray-400">
            Automatically translate missing UI text into viewer's language using AI
          </p>
        </div>

        {/* Success Notice */}
        {notice && (
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-white font-semibold">{notice}</p>
            </CardContent>
          </Card>
        )}

        {/* Configuration */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              Auto-Translation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Enable/Disable */}
            <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-1">Enable Auto-Translation</h3>
                  <p className="text-gray-400 text-sm">
                    Automatically translate missing UI strings when users switch languages
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="text-white font-semibold mb-2 block">Translation Provider</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setProvider('openai')}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    provider === 'openai'
                      ? 'bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] border-2 border-[#A64EE7]'
                      : 'bg-[#0B0B0C] border-2 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">OpenAI GPT</h4>
                    {provider === 'openai' && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                  <p className="text-gray-400 text-xs">
                    Context-aware translations with GPT-4o-mini
                  </p>
                  <Badge className="bg-green-500/20 text-green-400 mt-2 text-xs">
                    Recommended
                  </Badge>
                </div>

                <div
                  onClick={() => setProvider('deepl')}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    provider === 'deepl'
                      ? 'bg-gradient-to-r from-[#6F1AB1] to-[#A64EE7] border-2 border-[#A64EE7]'
                      : 'bg-[#0B0B0C] border-2 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">DeepL</h4>
                    {provider === 'deepl' && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </div>
                  <p className="text-gray-400 text-xs">
                    Fast, accurate translations
                  </p>
                  <Badge className="bg-blue-500/20 text-blue-400 mt-2 text-xs">
                    Alternative
                  </Badge>
                </div>
              </div>
            </div>

            {/* Target Languages */}
            <div>
              <label className="text-white font-semibold mb-3 block">Target Languages</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allLanguages.map(lang => {
                  const isSelected = targets.includes(lang.code);
                  return (
                    <div
                      key={lang.code}
                      onClick={() => toggle(lang.code)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#6F1AB1] border-2 border-[#A64EE7]'
                          : 'bg-[#0B0B0C] border-2 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl">{lang.flag}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <p className="text-white text-sm font-semibold">{lang.label}</p>
                      <p className="text-gray-400 text-xs">{lang.name}</p>
                      {cacheStats[lang.code] > 0 && (
                        <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs mt-1">
                          {cacheStats[lang.code]} cached
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={save}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold h-12 text-lg rounded-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Save Configuration
            </Button>

          </CardContent>
        </Card>

        {/* Cache Management */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#00D4C9]" />
              Translation Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <p className="text-gray-400 text-sm">
              Auto-translated strings are cached locally for instant access. Clear cache to re-translate or update translations.
            </p>

            <div className="grid md:grid-cols-4 gap-3">
              {allLanguages.map(lang => (
                <div key={lang.code} className="p-3 bg-[#0B0B0C] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-white text-sm font-semibold">{lang.code.toUpperCase()}</span>
                    </div>
                    {cacheStats[lang.code] > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => clearCache(lang.code)}
                        className="text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Badge className={cacheStats[lang.code] > 0 
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-700 text-gray-400"
                  }>
                    {cacheStats[lang.code] || 0} strings
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => loadCacheStats()}
                variant="outline"
                className="border-gray-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Stats
              </Button>
              <Button
                onClick={() => clearCache()}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Caches
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">🤖 How Auto-Translation Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FFD700] font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Detection</p>
                  <p className="text-gray-400 text-xs">
                    When a user switches to a language and a translation is missing, the system emits an <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">afs:i18n:need</code> event
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00D4C9]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00D4C9] font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">AI Translation</p>
                  <p className="text-gray-400 text-xs">
                    AI (OpenAI or DeepL) translates the English string while preserving tone, technical terms, and variable placeholders
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#9D4EDD] font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Caching</p>
                  <p className="text-gray-400 text-xs">
                    Translation is cached in localStorage for instant future access and saved to database for other users
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold">4</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">UI Update</p>
                  <p className="text-gray-400 text-xs">
                    The interface automatically updates with the translated text - no page reload needed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-semibold text-sm mb-2">💡 Translation Quality</h4>
              <p className="text-gray-300 text-xs mb-2">
                AI maintains professional tone, preserves technical terms (AI, CTV, ROAS, NBA), and keeps variable placeholders ({`{name}, {count}, {type}`}) intact.
              </p>
              <p className="text-gray-400 text-xs">
                All auto-translations are marked as "unverified" in the database. Admins can review and verify them in Translation Management.
              </p>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="text-yellow-400 font-semibold text-sm mb-2">⚠️ Performance Note</h4>
              <p className="text-gray-300 text-xs mb-2">
                First-time translations may take 1-3 seconds. Cached translations load instantly.
              </p>
              <p className="text-gray-400 text-xs">
                To pre-translate all UI text, use the Translation Manager (Language Settings → Translation Management).
              </p>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">📊 Cache Statistics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Cached:</span>
                  <span className="text-white font-bold">
                    {Object.values(cacheStats).reduce((sum, count) => sum + count, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Languages:</span>
                  <span className="text-white font-bold">
                    {Object.values(cacheStats).filter(count => count > 0).length}
                  </span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">For Developers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h4 className="text-[#00D4C9] font-semibold text-sm mb-2 font-mono">Request Translation</h4>
              <pre className="text-xs bg-black/40 border border-gray-800 rounded p-2 text-gray-300 font-mono overflow-x-auto">
{`window.dispatchEvent(new CustomEvent('afs:i18n:need', {
  detail: { 
    key: 'hero_title', 
    en: 'Why AI Freedom Studios Wins' 
  }
}));`}
              </pre>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h4 className="text-[#00D4C9] font-semibold text-sm mb-2 font-mono">Listen for Updates</h4>
              <pre className="text-xs bg-black/40 border border-gray-800 rounded p-2 text-gray-300 font-mono overflow-x-auto">
{`window.addEventListener('afs:i18n:update', (e) => {
  const { key, lang, text } = e.detail;
  console.log(\`\${key} translated to \${lang}: \${text}\`);
  // Re-render component with new translation
});`}
              </pre>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h4 className="text-[#00D4C9] font-semibold text-sm mb-2 font-mono">Get Cached Translation</h4>
              <pre className="text-xs bg-black/40 border border-gray-800 rounded p-2 text-gray-300 font-mono overflow-x-auto">
{`import { getCachedTranslation } from '@/components/I18nAutoFill';

const translation = getCachedTranslation('hero_title', 'es');
// Returns: "Por qué gana AI Freedom Studios" or null`}
              </pre>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}