import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Download,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Globe,
  Trash2,
  RefreshCw,
  Copy,
  History,
  RotateCcw,
  MessageSquare,
  Search,
  Filter,
  Tag,
  Calendar,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOverrides, mergeOverrides, clearOverrides, saveOverrideVersion, restoreOverrideVersion } from '@/components/I18nOverridesPatch';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function I18nImport() {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState(null);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');
  const [current, setCurrent] = useState({});
  const [user, setUser] = useState(null);
  
  // Version management state
  const [saveComment, setSaveComment] = useState('');
  const [saveName, setSaveName] = useState('');
  const [saveTags, setSaveTags] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const queryClient = useQueryClient();

  useEffect(() => {
    loadCurrent();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (e) {
      console.error('Failed to load user:', e);
    }
  };

  const loadCurrent = () => {
    setCurrent(getOverrides());
  };

  // Query version history
  const { data: versionHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['override-history', user?.email],
    queryFn: () => user ? base44.entities.TranslationOverrideHistory.filter(
      { user_email: user.email },
      '-created_date',
      50
    ) : [],
    enabled: !!user,
    initialData: []
  });

  // Save version mutation
  const saveVersionMutation = useMutation({
    mutationFn: async ({ overrides, comment, name, tags }) => {
      return await saveOverrideVersion(
        user.email,
        overrides,
        comment,
        name,
        tags.split(',').map(t => t.trim()).filter(Boolean)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['override-history'] });
      showNotice('✅ Version saved successfully!', 'success');
      setShowSaveDialog(false);
      setSaveComment('');
      setSaveName('');
      setSaveTags('');
    },
    onError: (error) => {
      showNotice('❌ Failed to save version: ' + error.message, 'error');
    }
  });

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId) => {
      return await restoreOverrideVersion(versionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['override-history'] });
      loadCurrent();
      showNotice('✅ Version restored successfully!', 'success');
    },
    onError: (error) => {
      showNotice('❌ Failed to restore version: ' + error.message, 'error');
    }
  });

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setRaw(text);
      
      // Auto-parse on file load
      try {
        const json = JSON.parse(text);
        setParsed(json);
        showNotice('File loaded and parsed successfully!', 'success');
      } catch (e) {
        showNotice('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const parseNow = () => {
    try {
      const json = JSON.parse(raw);
      setParsed(json);
      showNotice('✅ JSON parsed successfully!', 'success');
    } catch (e) {
      showNotice('❌ Invalid JSON format', 'error');
    }
  };

  const merge = (mode = 'merge') => {
    if (!parsed) {
      showNotice('Please parse JSON first', 'error');
      return;
    }

    try {
      const result = mergeOverrides(parsed, mode);
      setCurrent(result);
      
      const totalKeys = Object.values(result).reduce((sum, lang) => sum + Object.keys(lang).length, 0);
      showNotice(`✅ ${mode === 'merge' ? 'Merged' : 'Replaced'} translations! ${totalKeys} total keys loaded.`, 'success');
      
      // Show save dialog
      setShowSaveDialog(true);
      setSaveName(mode === 'merge' ? 'Merged update' : 'Full replacement');
      
      // Clear parsed state
      setParsed(null);
      setRaw('');
    } catch (e) {
      showNotice('❌ Import failed: ' + e.message, 'error');
    }
  };

  const saveCurrentVersion = () => {
    if (!user) {
      showNotice('Please log in to save versions', 'error');
      return;
    }

    saveVersionMutation.mutate({
      overrides: current,
      comment: saveComment,
      name: saveName || `Version ${(versionHistory[0]?.version_number || 0) + 1}`,
      tags: saveTags
    });
  };

  const restoreVersion = (versionId) => {
    if (confirm('Restore this version?\n\nThis will replace your current overrides and create a new version.')) {
      restoreVersionMutation.mutate(versionId);
    }
  };

  const clearAll = () => {
    if (confirm('Clear all translation overrides?\n\nThis will remove all imported translations from localStorage. Your app will fall back to built-in translations.')) {
      clearOverrides();
      setCurrent({});
      showNotice('✅ All overrides cleared', 'success');
    }
  };

  const downloadCurrent = () => {
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AFS_i18n_overrides.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotice('✅ Overrides downloaded', 'success');
  };

  const downloadVersion = (version) => {
    const overrides = JSON.parse(version.override_data);
    const blob = new Blob([JSON.stringify(overrides, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AFS_i18n_v${version.version_number}_${version.version_name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(current, null, 2));
    showNotice('✅ Copied to clipboard', 'success');
  };

  const showNotice = (msg, type = 'success') => {
    setNotice(msg);
    setNoticeType(type);
    setTimeout(() => setNotice(''), 3000);
  };

  const toggleKey = (key) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const langs = useMemo(() => Object.keys(current || {}), [current]);
  const totalKeys = useMemo(() => 
    Object.values(current).reduce((sum, lang) => sum + Object.keys(lang).length, 0),
    [current]
  );

  // Filtered overrides
  const filteredOverrides = useMemo(() => {
    if (!searchQuery && languageFilter === 'all') return current;
    
    const filtered = {};
    Object.keys(current).forEach(lang => {
      if (languageFilter !== 'all' && lang !== languageFilter) return;
      
      const langData = {};
      Object.keys(current[lang]).forEach(key => {
        const value = current[lang][key];
        const matchesSearch = !searchQuery || 
          key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          value.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (matchesSearch) {
          langData[key] = value;
        }
      });
      
      if (Object.keys(langData).length > 0) {
        filtered[lang] = langData;
      }
    });
    
    return filtered;
  }, [current, searchQuery, languageFilter]);

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#FFD700]" />
            Import Translations
          </h1>
          <p className="text-gray-400">
            Upload JSON from Translation Extractor to apply runtime translation overrides
          </p>
        </div>

        {/* Success/Error Notice */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className={`${
                noticeType === 'success' 
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                  : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30'
              }`}>
                <CardContent className="p-4 flex items-center gap-3">
                  {noticeType === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className="text-white font-semibold">{notice}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="import">
          <TabsList className="bg-[#111317] border border-gray-800">
            <TabsTrigger value="import">Import & Manage</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Version History ({versionHistory.length})
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search & Filter
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6 mt-6">
            
            {/* Save Version Dialog */}
            {showSaveDialog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#00D4C9]/10 border-[#FFD700]/30 border-2 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Save className="w-5 h-5 text-[#FFD700]" />
                      Save Version
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Version Name</label>
                      <Input
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="e.g., Spanish translations v2, Client feedback round 1"
                        className="bg-[#0B0B0C] border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Comment (Optional)</label>
                      <Textarea
                        value={saveComment}
                        onChange={(e) => setSaveComment(e.target.value)}
                        placeholder="Describe what changed in this version..."
                        rows={3}
                        className="bg-[#0B0B0C] border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Tags (comma-separated)</label>
                      <Input
                        value={saveTags}
                        onChange={(e) => setSaveTags(e.target.value)}
                        placeholder="e.g., production, client_review, testing"
                        className="bg-[#0B0B0C] border-gray-700 text-white"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={saveCurrentVersion}
                        disabled={saveVersionMutation.isPending}
                        className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saveVersionMutation.isPending ? 'Saving...' : 'Save Version'}
                      </Button>
                      <Button
                        onClick={() => setShowSaveDialog(false)}
                        variant="outline"
                        className="border-gray-700 text-white"
                      >
                        Skip
                      </Button>
                    </div>
                    
                    <p className="text-gray-500 text-xs">
                      💡 Saving versions allows you to track changes and revert if needed
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Import Section */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#FFD700]" />
                  Import Translation File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* File Upload */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">
                    Upload JSON File
                  </label>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={onFile}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700] file:text-black hover:file:bg-[#FFC700] cursor-pointer"
                  />
                </div>

                {/* Or Paste JSON */}
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">
                    Or Paste JSON
                  </label>
                  <Textarea
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    rows={8}
                    className="bg-[#0B0B0C] border-gray-700 text-white font-mono text-xs"
                    placeholder={`Paste your JSON here...

Example:
{
  "en": {
    "hero_title": "Why AI Freedom Studios Wins",
    "dashboard": "Dashboard"
  },
  "es": {
    "hero_title": "Por qué gana AI Freedom Studios",
    "dashboard": "Panel"
  }
}`}
                  />
                </div>

                {/* Parsed Preview */}
                {parsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <p className="text-green-400 font-semibold text-sm">JSON Valid - Ready to Import</p>
                      </div>
                      <div className="space-y-1 text-xs text-gray-300">
                        {Object.keys(parsed.dict || parsed).map(lang => (
                          <div key={lang} className="flex items-center justify-between">
                            <span>• {lang.toUpperCase()}</span>
                            <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                              {Object.keys((parsed.dict || parsed)[lang]).length} keys
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={parseNow}
                    variant="outline"
                    className="border-gray-700 text-white"
                    disabled={!raw}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Parse JSON
                  </Button>
                  <Button
                    onClick={() => merge('merge')}
                    disabled={!parsed}
                    className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import (Merge)
                  </Button>
                  <Button
                    onClick={() => merge('replace')}
                    disabled={!parsed}
                    variant="outline"
                    className="border-[#FFD700]/30 text-[#FFD700]"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Import (Replace)
                  </Button>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="ml-auto border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Overrides
                  </Button>
                </div>

                {/* Info */}
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-semibold text-sm mb-2">Import Modes</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• <strong>Merge:</strong> Adds new keys, keeps existing ones</li>
                    <li>• <strong>Replace:</strong> Replaces entire language dictionaries with imported data</li>
                  </ul>
                </div>

              </CardContent>
            </Card>

            {/* Current Overrides */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-[#00D4C9]" />
                    Current Overrides
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={loadCurrent}
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reload
                    </Button>
                    {user && langs.length > 0 && (
                      <Button
                        onClick={() => setShowSaveDialog(true)}
                        size="sm"
                        className="bg-[#9D4EDD] hover:bg-[#9D4EDD]/80 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Version
                      </Button>
                    )}
                    {langs.length > 0 && (
                      <>
                        <Button
                          onClick={copyToClipboard}
                          size="sm"
                          variant="outline"
                          className="border-gray-700 text-white"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          onClick={downloadCurrent}
                          size="sm"
                          className="bg-[#00D4C9] hover:bg-[#00D4C9]/80 text-black"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                
                {langs.length === 0 && (
                  <div className="text-center py-12">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No overrides loaded yet</p>
                    <p className="text-gray-500 text-sm">
                      Import a translation JSON file to get started
                    </p>
                  </div>
                )}

                {langs.length > 0 && (
                  <div className="space-y-4">
                    
                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-3">
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Languages</p>
                        <p className="text-2xl font-bold text-white">{langs.length}</p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Total Keys</p>
                        <p className="text-2xl font-bold text-[#FFD700]">{totalKeys}</p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Avg Keys/Lang</p>
                        <p className="text-2xl font-bold text-[#00D4C9]">
                          {Math.round(totalKeys / langs.length)}
                        </p>
                      </div>
                      <div className="p-3 bg-[#0B0B0C] rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Storage</p>
                        <p className="text-2xl font-bold text-[#9D4EDD]">
                          {(JSON.stringify(current).length / 1024).toFixed(1)}kb
                        </p>
                      </div>
                    </div>

                    {/* Language Breakdown */}
                    <div>
                      <h3 className="text-white font-semibold mb-3 text-sm">Languages & Keys</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {langs.map(lang => {
                          const keyCount = Object.keys(current[lang] || {}).length;
                          const langNames = {
                            en: '🇺🇸 English',
                            es: '🇪🇸 Spanish',
                            fr: '🇫🇷 French',
                            pt: '🇧🇷 Portuguese',
                            de: '🇩🇪 German',
                            it: '🇮🇹 Italian',
                            ar: '🇸🇦 Arabic',
                            ja: '🇯🇵 Japanese',
                            zh: '🇨🇳 Chinese'
                          };

                          return (
                            <div key={lang} className="p-3 bg-[#0B0B0C] rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-white font-semibold">
                                  {langNames[lang] || `${lang.toUpperCase()}`}
                                </p>
                                <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                                  {keyCount} keys
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 space-y-0.5">
                                {Object.keys(current[lang] || {}).slice(0, 3).map((key, idx) => (
                                  <div key={idx} className="flex items-start justify-between gap-2">
                                    <code className="text-[#00D4C9]">{key}</code>
                                    <span className="text-gray-400 truncate max-w-[120px]">
                                      {current[lang][key]}
                                    </span>
                                  </div>
                                ))}
                                {keyCount > 3 && (
                                  <p className="text-gray-600">...and {keyCount - 3} more</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Full Preview (Collapsible) */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm text-gray-400 hover:text-white p-3 bg-[#0B0B0C] rounded-lg border border-gray-800 group-open:border-[#FFD700]/30">
                        View Full JSON
                      </summary>
                      <pre className="text-xs bg-black/40 border border-gray-800 rounded-lg p-4 overflow-x-auto mt-2 text-gray-300 font-mono">
                        {JSON.stringify(current, null, 2)}
                      </pre>
                    </details>

                  </div>
                )}

              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-sm">💡 How Translation Overrides Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#FFD700]">
                      1
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">Resolution Priority</p>
                      <p className="text-gray-400 text-xs">
                        When resolving a translation key, the system checks:
                      </p>
                      <ul className="text-gray-500 text-xs space-y-0.5 mt-1 ml-4">
                        <li>1. <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">overrides[lang][key]</code> (localStorage) ← <strong>First priority</strong></li>
                        <li>2. <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">TRANSLATIONS[lang][key]</code> (I18nProvider.jsx)</li>
                        <li>3. Auto-translation cache (if enabled)</li>
                        <li>4. English fallback</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00D4C9]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#00D4C9]">
                      2
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">Version Control</p>
                      <p className="text-gray-400 text-xs">
                        Every import can be saved as a version with comments and tags. View history, compare versions, and restore previous states anytime.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#9D4EDD]">
                      3
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">Instant Updates</p>
                      <p className="text-gray-400 text-xs">
                        After importing, the UI updates immediately without page reload. 
                        All components using <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">useI18n()</code> hook automatically re-render.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold text-sm mb-2">⚠️ Important Notes</h4>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• Overrides are <strong>per-browser</strong> (not synced across devices)</li>
                    <li>• Version history is stored in database (synced across devices)</li>
                    <li>• For production deployments, add translations to I18nProvider.jsx instead</li>
                    <li>• This is ideal for testing translations before code deployment</li>
                    <li>• Variable placeholders must match: <code className="bg-[#0B0B0C] px-1 rounded">{`{name}, {count}, {type}`}</code></li>
                  </ul>
                </div>

              </CardContent>
            </Card>

          </TabsContent>

          {/* Version History Tab */}
          <TabsContent value="history" className="space-y-6 mt-6">
            
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-[#9D4EDD]" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                
                {!user && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">Please log in to view version history</p>
                  </div>
                )}

                {user && loadingHistory && (
                  <div className="text-center py-12">
                    <RefreshCw className="w-16 h-16 mx-auto mb-4 text-gray-600 animate-spin" />
                    <p className="text-gray-400">Loading history...</p>
                  </div>
                )}

                {user && !loadingHistory && versionHistory.length === 0 && (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No version history yet</p>
                    <p className="text-gray-500 text-sm">
                      Import translations and save as a version to start tracking changes
                    </p>
                  </div>
                )}

                {user && !loadingHistory && versionHistory.length > 0 && (
                  <div className="space-y-3">
                    {versionHistory.map((version, idx) => {
                      const isExpanded = expandedKeys.has(version.id);
                      
                      return (
                        <motion.div
                          key={version.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-4 rounded-xl border ${
                            version.is_active 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : 'bg-[#0B0B0C] border-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-bold text-sm">
                                  {version.version_name}
                                </h4>
                                {version.is_active && (
                                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                                    Active
                                  </Badge>
                                )}
                                <Badge className="bg-gray-700 text-gray-300 text-xs">
                                  v{version.version_number}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(version.created_date), 'MMM d, yyyy HH:mm')}
                                </span>
                                <span>{version.total_keys} keys</span>
                                <span>{version.file_size_kb?.toFixed(1)} KB</span>
                              </div>
                              
                              {version.tags && version.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {version.tags.map((tag, i) => (
                                    <Badge key={i} className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleKey(version.id)}
                                className="border-gray-700 text-white"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadVersion(version)}
                                className="border-gray-700 text-white"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {!version.is_active && (
                                <Button
                                  size="sm"
                                  onClick={() => restoreVersion(version.id)}
                                  disabled={restoreVersionMutation.isPending}
                                  className="bg-[#00D4C9] hover:bg-[#00D4C9]/80 text-black"
                                >
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Restore
                                </Button>
                              )}
                            </div>
                          </div>

                          {version.comment && (
                            <div className="mb-3 p-2 bg-[#111317] rounded-lg flex gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-300 text-xs italic">{version.comment}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs">
                            {version.changes_summary && (
                              <span className="text-gray-400">{version.changes_summary}</span>
                            )}
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-3 space-y-2"
                            >
                              {version.keys_added && version.keys_added.length > 0 && (
                                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
                                  <p className="text-green-400 text-xs font-semibold mb-1">
                                    ➕ Added ({version.keys_added.length})
                                  </p>
                                  <div className="space-y-0.5">
                                    {version.keys_added.slice(0, 5).map((key, i) => (
                                      <code key={i} className="block text-xs text-green-300">{key}</code>
                                    ))}
                                    {version.keys_added.length > 5 && (
                                      <p className="text-xs text-gray-500">...and {version.keys_added.length - 5} more</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {version.keys_modified && version.keys_modified.length > 0 && (
                                <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                  <p className="text-yellow-400 text-xs font-semibold mb-1">
                                    ~ Modified ({version.keys_modified.length})
                                  </p>
                                  <div className="space-y-0.5">
                                    {version.keys_modified.slice(0, 5).map((key, i) => (
                                      <code key={i} className="block text-xs text-yellow-300">{key}</code>
                                    ))}
                                    {version.keys_modified.length > 5 && (
                                      <p className="text-xs text-gray-500">...and {version.keys_modified.length - 5} more</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {version.keys_deleted && version.keys_deleted.length > 0 && (
                                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                                  <p className="text-red-400 text-xs font-semibold mb-1">
                                    ➖ Deleted ({version.keys_deleted.length})
                                  </p>
                                  <div className="space-y-0.5">
                                    {version.keys_deleted.slice(0, 5).map((key, i) => (
                                      <code key={i} className="block text-xs text-red-300">{key}</code>
                                    ))}
                                    {version.keys_deleted.length > 5 && (
                                      <p className="text-xs text-gray-500">...and {version.keys_deleted.length - 5} more</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <details className="group/nested">
                                <summary className="cursor-pointer text-xs text-gray-500 hover:text-white p-2 bg-black/20 rounded">
                                  View Full Data
                                </summary>
                                <pre className="text-xs bg-black/40 border border-gray-800 rounded p-2 overflow-x-auto mt-1 text-gray-300 font-mono">
                                  {version.override_data}
                                </pre>
                              </details>
                            </motion.div>
                          )}

                        </motion.div>
                      );
                    })}
                  </div>
                )}

              </CardContent>
            </Card>

          </TabsContent>

          {/* Search & Filter Tab */}
          <TabsContent value="search" className="space-y-6 mt-6">
            
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#FFD700]" />
                  Search & Filter Overrides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Search & Filters */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Search Keys or Values</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search translation keys or text..."
                        className="bg-[#0B0B0C] border-gray-700 text-white pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Filter by Language</label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="w-full bg-[#0B0B0C] border border-gray-700 text-white rounded-lg px-10 py-2 text-sm"
                      >
                        <option value="all">All Languages</option>
                        {langs.map(lang => (
                          <option key={lang} value={lang}>
                            {lang.toUpperCase()} ({Object.keys(current[lang] || {}).length} keys)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results */}
                {langs.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No overrides to search</p>
                    <p className="text-gray-500 text-sm">
                      Import translations first to enable search
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.keys(filteredOverrides).length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                        <p className="text-gray-400 text-sm">No results found</p>
                        <p className="text-gray-500 text-xs">
                          Try different search terms or filters
                        </p>
                      </div>
                    ) : (
                      Object.entries(filteredOverrides).map(([lang, translations]) => {
                        const langNames = {
                          en: '🇺🇸 English',
                          es: '🇪🇸 Spanish',
                          fr: '🇫🇷 French',
                          pt: '🇧🇷 Portuguese',
                          de: '🇩🇪 German',
                          it: '🇮🇹 Italian',
                          ar: '🇸🇦 Arabic',
                          ja: '🇯🇵 Japanese',
                          zh: '🇨🇳 Chinese'
                        };

                        return (
                          <div key={lang} className="p-4 bg-[#0B0B0C] rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-bold">
                                {langNames[lang] || lang.toUpperCase()}
                              </h4>
                              <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                {Object.keys(translations).length} keys
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {Object.entries(translations).map(([key, value]) => (
                                <div key={key} className="p-2 bg-[#111317] rounded border border-gray-800">
                                  <div className="flex items-start justify-between gap-2">
                                    <code className="text-[#00D4C9] text-xs font-mono flex-shrink-0">
                                      {key}
                                    </code>
                                    <span className="text-gray-300 text-xs text-right">
                                      {value}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        Showing {Object.values(filteredOverrides).reduce((sum, lang) => sum + Object.keys(lang).length, 0)} of {totalKeys} total keys
                      </p>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}