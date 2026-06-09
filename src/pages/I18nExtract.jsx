import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  RefreshCw,
  Save,
  Search,
  FileJson,
  Sparkles,
  Copy,
  CheckCircle2,
  Globe,
  Trash2
} from 'lucide-react';

export default function I18nExtract() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState('');

  function load() {
    const map = JSON.parse(localStorage.getItem('afs_i18n_collected') || '{}');
    const arr = Object.entries(map).map(([en, v]) => ({
      en,
      key: v.key || '',
      editableKey: v.key || ''
    }));
    setRows(arr.sort((a, b) => a.key.localeCompare(b.key)));
  }

  useEffect(() => {
    load();
  }, []);

  function saveLocal() {
    // Write back key edits
    const map = JSON.parse(localStorage.getItem('afs_i18n_collected') || '{}');
    rows.forEach(r => {
      if (map[r.en]) map[r.en].key = r.editableKey || r.key;
    });
    localStorage.setItem('afs_i18n_collected', JSON.stringify(map));
    
    setNotice('✅ Keys saved to localStorage');
    setTimeout(() => setNotice(''), 3000);
  }

  function exportJSON() {
    // Produce { en: { key: en, ... } } structure for I18nProvider
    const out = { en: {} };
    rows.forEach(r => {
      const finalKey = r.editableKey || r.key || r.en;
      out.en[finalKey] = r.en;
    });

    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AFS_i18n_seed.json';
    a.click();
    URL.revokeObjectURL(url);

    setNotice('✅ JSON exported! Check your downloads');
    setTimeout(() => setNotice(''), 3000);
  }

  function copyToClipboard() {
    const out = { en: {} };
    rows.forEach(r => {
      const finalKey = r.editableKey || r.key || r.en;
      out.en[finalKey] = r.en;
    });

    navigator.clipboard.writeText(JSON.stringify(out.en, null, 2));
    
    setNotice('✅ Copied to clipboard! Paste into I18nProvider.jsx');
    setTimeout(() => setNotice(''), 3000);
  }

  function clearAll() {
    if (confirm(`Clear all ${rows.length} collected strings?\n\nThis will reset the collection. You can re-collect by navigating through the app.`)) {
      localStorage.removeItem('afs_i18n_collected');
      setRows([]);
      setNotice('✅ Collection cleared');
      setTimeout(() => setNotice(''), 3000);
    }
  }

  const filtered = useMemo(
    () => rows.filter(r =>
      !filter ||
      r.en.toLowerCase().includes(filter.toLowerCase()) ||
      (r.editableKey || '').toLowerCase().includes(filter.toLowerCase())
    ),
    [rows, filter]
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#FFD700]" />
            Translation Extractor
          </h1>
          <p className="text-gray-400">
            Auto-collect visible UI text from your app and export for translation
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

        {/* Stats & Actions */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-white font-bold text-xl mb-2">
                  Collection Status
                </h3>
                <div className="flex gap-3">
                  <Badge className="bg-green-500/20 text-green-400 text-sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {rows.length} strings collected
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-collecting
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={load}
                  variant="outline"
                  className="border-gray-700 text-white"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload
                </Button>
                <Button
                  onClick={saveLocal}
                  variant="outline"
                  className="border-gray-700 text-white"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Keys
                </Button>
                <Button
                  onClick={copyToClipboard}
                  className="bg-[#00D4C9] hover:bg-[#00D4C9]/80 text-black font-semibold"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button
                  onClick={exportJSON}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter by text or key..."
                className="bg-[#0B0B0C] border-gray-700 text-white"
              />
              {filter && (
                <Button
                  onClick={() => setFilter('')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Translation Table */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileJson className="w-5 h-5 text-[#00D4C9]" />
              Collected Strings ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-800 mb-4">
              <div className="col-span-7 text-xs font-medium text-gray-400 uppercase">
                English Text (Detected)
              </div>
              <div className="col-span-5 text-xs font-medium text-gray-400 uppercase">
                Translation Key (Editable)
              </div>
            </div>

            {/* Table Body */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filtered.map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-4 p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors"
                >
                  <div className="col-span-7 flex items-center">
                    <p className="text-white text-sm line-clamp-2">{r.en}</p>
                  </div>
                  <div className="col-span-5">
                    <Input
                      value={r.editableKey}
                      onChange={e => {
                        const v = e.target.value;
                        setRows(prev =>
                          prev.map((x, idx) =>
                            idx === i ? { ...x, editableKey: v } : x
                          )
                        );
                      }}
                      className="bg-[#111317] border-gray-700 text-white text-sm font-mono"
                      placeholder="translation.key"
                    />
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-2">
                    {rows.length === 0 
                      ? 'No strings collected yet'
                      : 'No results match your filter'
                    }
                  </p>
                  <p className="text-gray-500 text-sm">
                    {rows.length === 0
                      ? 'Navigate through your app pages, then click Reload'
                      : 'Try a different search term'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Tips */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">💡 How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#FFD700]">
                  1
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Navigate Your App</p>
                  <p className="text-gray-400 text-xs">
                    Visit all pages in your app. The collector automatically extracts visible UI text as you browse.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00D4C9]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#00D4C9]">
                  2
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Return & Reload</p>
                  <p className="text-gray-400 text-xs">
                    Come back to this page and click "Reload" to see all collected strings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#9D4EDD]">
                  3
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Edit Keys (Optional)</p>
                  <p className="text-gray-400 text-xs">
                    Refine translation keys to be more meaningful (e.g., "dashboard_welcome" instead of "welcome_back_creator").
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-green-400">
                  4
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Export & Import</p>
                  <p className="text-gray-400 text-xs">
                    Click "Copy to Clipboard" and paste into <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">TRANSLATIONS.en</code> in I18nProvider.jsx.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-semibold text-sm mb-2">Advanced Features</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>
                  <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">data-i18n-key="your_key"</code> - 
                  Set custom key on HTML elements
                </li>
                <li>
                  <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">data-i18n-ignore</code> - 
                  Skip element and its children
                </li>
                <li>
                  <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">window.AFS_I18N_PUSH('key', 'text')</code> - 
                  Manually add translation key
                </li>
              </ul>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="text-yellow-400 font-semibold text-sm mb-2">⚠️ What Gets Collected</h4>
              <p className="text-gray-300 text-xs mb-2">
                The collector extracts:
              </p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• Button text, headings, labels, paragraphs</li>
                <li>• Navigation items, badges, tooltips</li>
                <li>• Messages, notifications, alerts</li>
                <li>• Placeholder text (limited)</li>
              </ul>
              <p className="text-gray-300 text-xs mt-2">
                <strong>Automatically skips:</strong> Inputs, code blocks, scripts, styles, SVGs, very short text (&lt;3 chars)
              </p>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">📋 Next Steps After Export</h4>
              <ol className="space-y-1 text-xs text-gray-300">
                <li>1. Open <code className="bg-black/40 px-1 rounded text-[#00D4C9]">components/I18nProvider.jsx</code></li>
                <li>2. Find the <code className="bg-black/40 px-1 rounded text-[#00D4C9]">TRANSLATIONS.en</code> object</li>
                <li>3. Paste the copied/exported JSON into it</li>
                <li>4. Go to Language Settings → Translation Management (Admin)</li>
                <li>5. Click "Auto-Translate All" to generate es, fr, pt versions</li>
                <li>6. Review translations and mark as verified</li>
                <li>7. Your app is now multilingual! 🌍</li>
              </ol>
            </div>

          </CardContent>
        </Card>

        {/* Stats */}
        {rows.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-[#111317] border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Total Strings</p>
                <p className="text-3xl font-bold text-white">{rows.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Filtered</p>
                <p className="text-3xl font-bold text-[#00D4C9]">{filtered.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Unique Keys</p>
                <p className="text-3xl font-bold text-[#FFD700]">
                  {new Set(rows.map(r => r.editableKey || r.key)).size}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#111317] border-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Avg Length</p>
                <p className="text-3xl font-bold text-[#9D4EDD]">
                  {Math.round(rows.reduce((sum, r) => sum + r.en.length, 0) / rows.length) || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}