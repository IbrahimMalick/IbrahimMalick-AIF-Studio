import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  FileCode,
  Zap,
  Copy,
  Download,
  Filter,
  TrendingUp,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Regex patterns for detecting hardcoded strings
const PATTERNS = {
  jsxText: />([^<>{}\n]+)</g,
  jsxAttribute: /(\w+)=["']([^"']+)["']/g,
  stringLiteral: /["']([^"'\n]{3,})["']/g,
  templateLiteral: /`([^`\n]{3,})`/g
};

// Strings to ignore (noise filters)
const IGNORE_PATTERNS = [
  /^[0-9]+$/,                    // Pure numbers
  /^[^a-zA-Z]+$/,                // No letters
  /^(http|https|www)\./,         // URLs
  /^[©®™]/,                      // Copyright symbols
  /^(className|id|key|data-|aria-)/,  // HTML attributes
  /^\{.*\}$/,                    // Variable patterns
  /^(\.\/|\/|@\/)/,              // Import paths
  /^(console|log|error|warn|debug)/i,  // Console calls
  /^(#[0-9A-F]{3,8})$/i,         // Hex colors
  /^(px|em|rem|vh|vw|%|\d+px)$/,  // CSS units
  /^(flex|grid|block|inline)/,    // CSS values
  /^(sm|md|lg|xl|2xl)/,          // Tailwind breakpoints
];

// Known i18n function calls
const I18N_CALLS = ['t(', '__AFS_T__(', '__AFS_T_OVR__(', 't("', 't(\'', 'useI18n'];

function isLikelyEnglish(str) {
  if (!str || str.length < 3) return false;
  if (IGNORE_PATTERNS.some(pattern => pattern.test(str))) return false;
  return /[A-Za-z]/.test(str);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);
}

function detectHardcodedStrings(code, filename) {
  const violations = [];

  // Skip if file already uses i18n
  const usesI18n = I18N_CALLS.some(call => code.includes(call));

  // JSX Text: >text content<
  let match;
  const jsxTextPattern = />([^<>{}\n]+)</g;
  while ((match = jsxTextPattern.exec(code)) !== null) {
    const text = match[1].trim();
    if (isLikelyEnglish(text)) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      violations.push({
        type: 'JSX Text',
        text,
        line: lineNumber,
        severity: 'error',
        suggestedKey: slugify(text),
        fix: `{t('${slugify(text)}')}`,
        context: getLineContext(code, lineNumber)
      });
    }
  }

  // JSX Attributes: attribute="value"
  const jsxAttrPattern = /(\w+)=["']([^"']+)["']/g;
  while ((match = jsxAttrPattern.exec(code)) !== null) {
    const attrName = match[1];
    const attrValue = match[2];
    
    // Skip safe attributes
    if (['className', 'id', 'key', 'style', 'type', 'name', 'value', 'href', 'src'].includes(attrName)) continue;
    if (attrName.startsWith('data-') || attrName.startsWith('aria-')) continue;
    
    if (isLikelyEnglish(attrValue)) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      violations.push({
        type: 'JSX Attribute',
        text: `${attrName}="${attrValue}"`,
        line: lineNumber,
        severity: 'warning',
        suggestedKey: `${attrName}.${slugify(attrValue)}`,
        fix: `${attrName}={t('${attrName}.${slugify(attrValue)}')}`,
        context: getLineContext(code, lineNumber)
      });
    }
  }

  // String Literals: "text" or 'text'
  const stringPattern = /["']([^"'\n]{3,})["']/g;
  while ((match = stringPattern.exec(code)) !== null) {
    const text = match[1];
    
    // Skip if inside t() call or import
    const beforeMatch = code.substring(Math.max(0, match.index - 50), match.index);
    if (I18N_CALLS.some(call => beforeMatch.includes(call))) continue;
    if (beforeMatch.includes('import') || beforeMatch.includes('from')) continue;
    
    if (isLikelyEnglish(text)) {
      const lineNumber = code.substring(0, match.index).split('\n').length;
      violations.push({
        type: 'String Literal',
        text,
        line: lineNumber,
        severity: usesI18n ? 'error' : 'info',
        suggestedKey: slugify(text),
        fix: `t('${slugify(text)}')`,
        context: getLineContext(code, lineNumber)
      });
    }
  }

  return violations;
}

function getLineContext(code, lineNumber) {
  const lines = code.split('\n');
  const targetLine = lines[lineNumber - 1] || '';
  return targetLine.trim().substring(0, 80);
}

export default function I18nLinter() {
  const [scanning, setScanning] = useState(false);
  const [violations, setViolations] = useState([]);
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const scanProject = () => {
    setScanning(true);
    
    // Simulate scanning - in production, you'd fetch actual component source
    const mockCode = {
      'pages/Dashboard.jsx': `import React from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function Dashboard() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('welcome_back')}</h1>
      <p>This is hardcoded text that should use t()</p>
      <button className="btn">Click me</button>
      <span title="Hardcoded tooltip">Hover here</span>
    </div>
  );
}`,
      
      'pages/VideoStudio.jsx': `import React from 'react';

export default function VideoStudio() {
  return (
    <div>
      <h1>Video Studio</h1>
      <p>Create amazing videos</p>
      <button>New Project</button>
    </div>
  );
}`,
      
      'components/Header.jsx': `import React from 'react';

export default function Header() {
  return (
    <header>
      <h2>Welcome to AI Freedom Studios</h2>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/projects">My Projects</a>
      </nav>
    </header>
  );
}`
    };

    const allViolations = [];
    
    Object.entries(mockCode).forEach(([filename, code]) => {
      const fileViolations = detectHardcodedStrings(code, filename);
      fileViolations.forEach(v => {
        allViolations.push({ ...v, file: filename });
      });
    });

    setTimeout(() => {
      setViolations(allViolations);
      setScanning(false);
    }, 1500);
  };

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const matchesSearch = !filter || 
        v.text.toLowerCase().includes(filter.toLowerCase()) ||
        v.file.toLowerCase().includes(filter.toLowerCase()) ||
        v.suggestedKey.toLowerCase().includes(filter.toLowerCase());
      
      const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      
      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [violations, filter, severityFilter, typeFilter]);

  const stats = useMemo(() => {
    const fileCount = new Set(violations.map(v => v.file)).size;
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    const infoCount = violations.filter(v => v.severity === 'info').length;

    return { fileCount, errorCount, warningCount, infoCount };
  }, [violations]);

  const violationsByFile = useMemo(() => {
    const grouped = {};
    filteredViolations.forEach(v => {
      if (!grouped[v.file]) grouped[v.file] = [];
      grouped[v.file].push(v);
    });
    return grouped;
  }, [filteredViolations]);

  const exportReport = () => {
    const report = {
      scan_date: new Date().toISOString(),
      total_violations: violations.length,
      files_scanned: stats.fileCount,
      breakdown: {
        errors: stats.errorCount,
        warnings: stats.warningCount,
        info: stats.infoCount
      },
      violations: violations.map(v => ({
        file: v.file,
        line: v.line,
        type: v.type,
        severity: v.severity,
        text: v.text,
        suggested_key: v.suggestedKey,
        suggested_fix: v.fix
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'i18n-lint-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAllKeys = () => {
    const keys = {};
    violations.forEach(v => {
      keys[v.suggestedKey] = v.text;
    });

    navigator.clipboard.writeText(JSON.stringify({ en: keys }, null, 2));
    alert('✅ All suggested keys copied to clipboard!\n\nPaste into I18nProvider.jsx → TRANSLATIONS.en');
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-[#FFD700]" />
              i18n Linter
            </h1>
            <p className="text-gray-400">
              Detect hardcoded strings that should use translation keys
            </p>
          </div>
          <Button
            onClick={scanProject}
            disabled={scanning}
            className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold rounded-xl"
          >
            {scanning ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Scan Project
              </>
            )}
          </Button>
        </div>

        {/* Stats Dashboard */}
        {violations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-300 text-sm">Errors</p>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-3xl font-bold text-red-400">{stats.errorCount}</p>
                  <p className="text-gray-500 text-xs mt-1">Must fix</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-300 text-sm">Warnings</p>
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{stats.warningCount}</p>
                  <p className="text-gray-500 text-xs mt-1">Should fix</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-300 text-sm">Info</p>
                    <AlertTriangle className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-blue-400">{stats.infoCount}</p>
                  <p className="text-gray-500 text-xs mt-1">Optional</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-300 text-sm">Files</p>
                    <FileCode className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-400">{stats.fileCount}</p>
                  <p className="text-gray-500 text-xs mt-1">Scanned</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Actions Bar */}
        {violations.length > 0 && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={exportReport}
                    size="sm"
                    variant="outline"
                    className="border-gray-700 text-white rounded-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button
                    onClick={copyAllKeys}
                    size="sm"
                    className="bg-[#00D4C9] hover:bg-[#00D4C9]/80 text-black rounded-lg"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Keys
                  </Button>
                </div>

                <div className="flex gap-2 items-center">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-[#0B0B0C] border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="all">All Severity</option>
                    <option value="error">Errors</option>
                    <option value="warning">Warnings</option>
                    <option value="info">Info</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-[#0B0B0C] border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="JSX Text">JSX Text</option>
                    <option value="JSX Attribute">JSX Attribute</option>
                    <option value="String Literal">String Literal</option>
                  </select>

                  <Input
                    placeholder="Search violations..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg max-w-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Violations Display */}
        {violations.length > 0 ? (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-[#FFD700]" />
                Violations ({filteredViolations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(violationsByFile)[0] || 'all'}>
                <TabsList className="bg-[#0B0B0C] flex-wrap mb-4">
                  <TabsTrigger value="all">
                    All Files ({filteredViolations.length})
                  </TabsTrigger>
                  {Object.keys(violationsByFile).map(file => (
                    <TabsTrigger key={file} value={file}>
                      {file.split('/').pop()} ({violationsByFile[file].length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {Object.entries(violationsByFile).map(([file, fileViolations]) => (
                    <div key={file} className="space-y-2">
                      <div className="flex items-center gap-2 sticky top-0 bg-[#111317] py-2 z-10">
                        <FileCode className="w-4 h-4 text-[#00D4C9]" />
                        <h4 className="text-white font-semibold">{file}</h4>
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          {fileViolations.length} issues
                        </Badge>
                      </div>
                      {fileViolations.map((v, idx) => (
                        <ViolationCard key={idx} violation={v} />
                      ))}
                    </div>
                  ))}
                </TabsContent>

                {Object.entries(violationsByFile).map(([file, fileViolations]) => (
                  <TabsContent key={file} value={file} className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {fileViolations.map((v, idx) => (
                      <ViolationCard key={idx} violation={v} />
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-12 text-center">
              {scanning ? (
                <div>
                  <Zap className="w-16 h-16 mx-auto mb-4 text-[#FFD700] animate-pulse" />
                  <p className="text-white font-semibold mb-2">Scanning components...</p>
                  <p className="text-gray-400 text-sm">Analyzing React code for hardcoded strings</p>
                </div>
              ) : (
                <div>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">No scan results yet</p>
                  <Button
                    onClick={scanProject}
                    className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold rounded-xl"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Start Scan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-sm">🔍 How the Linter Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-400">
                  1
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Pattern Detection</p>
                  <p className="text-gray-400 text-xs">
                    Scans for JSX text, attributes, and string literals that contain English text
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-yellow-400">
                  2
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Smart Filtering</p>
                  <p className="text-gray-400 text-xs">
                    Ignores: imports, console logs, CSS classes, hex colors, URLs, numbers, technical tokens
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400">
                  3
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Context Awareness</p>
                  <p className="text-gray-400 text-xs">
                    Detects if file already uses <code className="bg-[#0B0B0C] px-1 rounded text-[#00D4C9]">useI18n()</code> and increases severity
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-green-400">
                  4
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Auto-Suggestions</p>
                  <p className="text-gray-400 text-xs">
                    Generates suggested translation keys and provides copy-paste fixes
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="text-yellow-400 font-semibold text-sm mb-2">⚠️ Limitations</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Regex-based (not AST) - may have false positives/negatives</li>
                <li>• Cannot analyze minified/bundled code</li>
                <li>• Best for development, not production build validation</li>
                <li>• Complements (doesn't replace) CLI tools like Babel linter</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-semibold text-sm mb-2">💡 Best Practices</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Run linter before deploying new features</li>
                <li>• Fix errors first (files using i18n but have hardcoded text)</li>
                <li>• Add <code className="bg-[#0B0B0C] px-1 rounded">data-i18n-ignore</code> to technical content</li>
                <li>• Use suggested keys or create semantic ones</li>
                <li>• Export report for team review</li>
              </ul>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// Violation Card Component
function ViolationCard({ violation }) {
  const [copied, setCopied] = useState(false);

  const copySuggestion = () => {
    navigator.clipboard.writeText(violation.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityConfig = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      badge: 'bg-red-500/20 text-red-400',
      icon: AlertTriangle,
      iconColor: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      badge: 'bg-yellow-500/20 text-yellow-400',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/20 text-blue-400',
      icon: TrendingUp,
      iconColor: 'text-blue-400'
    }
  };

  const config = severityConfig[violation.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl ${config.bg} border ${config.border}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2">
          <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${config.badge} text-xs`}>
                {violation.type}
              </Badge>
              <span className="text-gray-500 text-xs font-mono">
                Line {violation.line}
              </span>
            </div>
            <p className="text-white text-sm font-medium mb-1">
              "{violation.text}"
            </p>
            <code className="text-gray-500 text-xs block mb-2">
              {violation.context}
            </code>
          </div>
        </div>
      </div>

      <div className="ml-6 space-y-2">
        <div className="p-2 bg-[#0B0B0C] rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Suggested Translation Key:</p>
          <code className="text-[#00D4C9] text-sm font-mono">
            {violation.suggestedKey}
          </code>
        </div>

        <div className="p-2 bg-[#0B0B0C] rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-400 text-xs">Suggested Fix:</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={copySuggestion}
              className="h-6 px-2 text-xs text-gray-400 hover:text-white"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <code className="text-[#FFD700] text-sm font-mono block">
            {violation.fix}
          </code>
        </div>

        <div className="flex gap-2 text-xs">
          <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD]">
            Add to TRANSLATIONS.en
          </Badge>
          <span className="text-gray-500">→</span>
          <code className="text-gray-400">
            "{violation.suggestedKey}": "{violation.text}"
          </code>
        </div>
      </div>
    </div>
  );
}