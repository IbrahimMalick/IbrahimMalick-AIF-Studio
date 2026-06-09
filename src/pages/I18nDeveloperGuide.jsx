
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code,
  Terminal,
  FileCode,
  Zap,
  CheckCircle2,
  Copy,
  Book,
  Workflow,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function I18nDeveloperGuide() {
  const [copiedCode, setCopiedCode] = useState('');

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const codeBlocks = {
    quickSetup: `# 1. Install dependencies
npm install -D @babel/parser @babel/traverse @babel/generator glob chalk yargs

# 2. Add package.json scripts
{
  "scripts": {
    "i18n:lint": "node scripts/afs-i18n-lint.js \\"src/**/*.{js,jsx,ts,tsx}\\"",
    "i18n:codemod:dry": "node scripts/afs-i18n-codemod.js --dry \\"src/**/*.{js,jsx,ts,tsx}\\"",
    "i18n:codemod:write": "node scripts/afs-i18n-codemod.js --write --keyPrefix ui_ \\"src/**/*.{js,jsx,ts,tsx}\\""
  }
}

# 3. Run linter → find issues
npm run i18n:lint

# 4. Preview auto-fixes
npm run i18n:codemod:dry

# 5. Apply auto-fixes
npm run i18n:codemod:write

# 6. Done! Refresh Base44 to see translations`,

    githubAction: `name: i18n Check
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run i18n linter
        run: npm run i18n:lint
      
      - name: Check for hardcoded strings
        run: |
          if npm run i18n:lint | grep -q "Found.*violations"; then
            echo "❌ Hardcoded strings detected!"
            echo "Run 'npm run i18n:codemod:dry' locally to preview fixes"
            exit 1
          else
            echo "✅ No i18n violations found!"
          fi`,

    agencyExtension: `// 1. Duplicate translation file for client
cp locales/en.json locales/client_acme.json

// 2. Client edits their translations via I18nImport page
// Upload client_acme.json → Test → Download → Save

// 3. Add client language to I18nProvider.jsx
const TRANSLATIONS = {
  en: { ... },
  es: { ... },
  client_acme: {
    "app_title": "ACME Marketing Hub",
    "hero_title": "ACME Powers Your Growth",
    // ... client-specific translations
  }
};

// 4. Client's white-label app auto-uses their language
const clientLang = user.white_label_config?.language || 'en';
setLang(clientLang);`,

    install: `# Install CLI tools dependencies
npm install -D @babel/parser @babel/traverse @babel/generator glob chalk yargs`,

    linterUsage: `# Lint your codebase (dry-run)
node scripts/afs-i18n-lint.js "src/**/*.{js,jsx,ts,tsx}"

# Lint specific files
node scripts/afs-i18n-lint.js "src/pages/*.jsx" "src/components/*.jsx"

# Output
Found 42 violations in 8 files
  - Errors: 15 (files using i18n with hardcoded strings)
  - Warnings: 12 (JSX attributes)
  - Info: 15 (files without i18n)`,

    codemodDryRun: `# Auto-fix (dry-run first!)
node scripts/afs-i18n-codemod.js --dry "src/**/*.{js,jsx,ts,tsx}"

# Output shows what WOULD change
→ Would update: pages/Dashboard.jsx (5 changes)
→ Would update: components/Header.jsx (3 changes)
Files that would change: 12
Strings replaced: 47`,

    codemodWrite: `# Apply fixes (modifies files in-place!)
node scripts/afs-i18n-codemod.js --write --keyPrefix ui_ "src/**/*.{js,jsx,ts,tsx}"

# With custom settings
node scripts/afs-i18n-codemod.js \\
  --write \\
  --keyPrefix afs_ \\
  --minLen 4 \\
  --out i18n_keys_generated.json \\
  "src/pages/*.jsx"

# Output
✓ Modified files: 12
Strings replaced: 47
i18n seed written → i18n_keys_generated.json`,

    beforeAfter: {
      jsx: {
        before: `<h2>Create your first campaign</h2>
<button title="Start now">Launch</button>`,
        after: `<h2>{t('ui_create_your_first_campaign')}</h2>
<button title={t('ui_start_now')}>Launch</button>`
      },
      string: {
        before: `const empty = "No data available";
const msg = \`Welcome back\`;`,
        after: `const empty = t('ui_no_data_available');
const msg = t('ui_welcome_back');`
      },
      ignore: {
        before: `<div data-i18n-ignore>
  <p>Technical debug info</p>
  <code>Error code: 500</code>
</div>`,
        after: `// Codemod skips this entire div
<div data-i18n-ignore>
  <p>Technical debug info</p>
  <code>Error code: 500</code>
</div>`
      }
    },

    manualPush: `// Manually add translation key
window.AFS_I18N_PUSH('custom.key', 'Custom English text');

// With semantic key
window.AFS_I18N_PUSH('dashboard.welcome_creator', 'Welcome back, Creator!');`,

    reactUsage: `import { useI18n } from '@/components/I18nProvider';

export default function MyComponent() {
  const { t, lang, setLang } = useI18n();
  
  return (
    <div>
      <h1>{t('hero_title')}</h1>
      <p>{t('msg.create_first', { type: 'campaign' })}</p>
      <span>Current language: {lang}</span>
      <button onClick={() => setLang('es')}>Español</button>
    </div>
  );
}`,

    legacyGlobal: `// Legacy global helper (works anywhere)
const text = window.__AFS_I18N__.t('hero_title');

// With variables
const msg = window.__AFS_I18N__.t('msg.create_first', { type: 'campaign' });

// Get/set language
const currentLang = window.__AFS_I18N__.getLang(); // 'en'
window.__AFS_I18N__.setLang('es'); // Reloads page`,

    overrideUsage: `// With overrides (checks localStorage first)
const text = window.__AFS_T_OVR__('hero_title');
const msg = window.__AFS_T_OVR__('msg.create_first', { type: 'video' });`,

    i18nProvider: `const TRANSLATIONS = {
  en: {
    // Paste generated keys here
    "ui_create_your_first_campaign": "Create your first campaign",
    "ui_start_now": "Start now",
    "ui_no_data_available": "No data available",
    "ui_welcome_back": "Welcome back",
    // ... rest of keys
  },
  es: {
    // Auto-translated versions
    "ui_create_your_first_campaign": "Crea tu primera campaña",
    "ui_start_now": "Empieza ahora",
    "ui_no_data_available": "No hay datos disponibles",
    "ui_welcome_back": "Bienvenido de nuevo"
  }
};`
  };

  const workflow = [
    {
      step: 1,
      title: 'Run CLI Linter',
      description: 'Detect hardcoded strings',
      command: 'node scripts/afs-i18n-lint.js "src/**/*.{js,jsx}"',
      output: 'Finds 47 violations across 12 files',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      step: 2,
      title: 'Auto-Fix with Codemod',
      description: 'Replace strings with t() calls',
      command: 'node scripts/afs-i18n-codemod.js --write --keyPrefix ui_',
      output: 'Generates i18n_seed_en.json with 47 keys',
      icon: Zap,
      color: 'yellow'
    },
    {
      step: 3,
      title: 'Navigate App (Browser)',
      description: 'Collect runtime strings',
      command: 'Browse all pages → I18nExtract → Export',
      output: 'Collects 150+ additional UI strings',
      icon: Globe,
      color: 'blue'
    },
    {
      step: 4,
      title: 'Merge & Import',
      description: 'Combine codemod + collector outputs',
      command: 'Paste into I18nProvider.jsx → TRANSLATIONS.en',
      output: 'Complete English dictionary (~200 keys)',
      icon: FileCode,
      color: 'purple'
    },
    {
      step: 5,
      title: 'Auto-Translate',
      description: 'Generate es, fr, pt versions',
      command: 'Language Settings → Translation Management → Auto-Translate All',
      output: 'AI translates to 8 languages in 2-3 minutes',
      icon: Workflow,
      color: 'cyan'
    },
    {
      step: 6,
      title: 'Test & Deploy',
      description: 'Import overrides → Test → Deploy',
      command: 'I18nImport → Test in browser → Copy to code',
      output: 'App is multilingual! 🌍',
      icon: CheckCircle2,
      color: 'green'
    }
  ];

  const colorClasses = {
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    green: 'bg-green-500/20 text-green-400'
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Book className="w-9 h-9 text-[#FFD700]" />
            i18n Developer Guide
          </h1>
          <p className="text-gray-400 text-lg">
            Complete guide to internationalization workflows, CLI tools, and best practices
          </p>
        </div>

        {/* Quick Start - 5 Minutes */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 border-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-400" />
              🚀 Setup in 5 Minutes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              {[
                { icon: CheckCircle2, text: 'Clone project', color: 'green' },
                { icon: CheckCircle2, text: 'Run npm install', color: 'green' },
                { icon: CheckCircle2, text: 'Add package.json scripts (see below)', color: 'green' },
                { icon: CheckCircle2, text: 'Run npm run i18n:lint → find issues', color: 'green' },
                { icon: CheckCircle2, text: 'Run npm run i18n:codemod:dry → preview fixes', color: 'green' },
                { icon: CheckCircle2, text: 'Run npm run i18n:codemod:write → apply fixes', color: 'green' },
                { icon: CheckCircle2, text: 'Refresh Base44 → see translations in action!', color: 'green' }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-[#0B0B0C] rounded-lg">
                    <Icon className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">{step.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-xs overflow-x-auto">
                {codeBlocks.quickSetup}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyCode(codeBlocks.quickSetup, 'quicksetup')}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                {copiedCode === 'quicksetup' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm font-semibold mb-1">
                ✅ Zero-Config Path
              </p>
              <p className="text-gray-300 text-xs">
                Follow these steps and you'll have a fully internationalized app in under 5 minutes. 
                No configuration files, no complex setup - just run the commands and go!
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Architecture Map */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-[#00D4C9]" />
              🧠 Architecture Map
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <p className="text-gray-300 text-sm mb-4">
              Complete i18n system architecture showing how CLI tools, browser runtime, and storage layers work together:
            </p>

            <div className="p-4 bg-[#0B0B0C] rounded-xl font-mono text-xs overflow-x-auto">
              <pre className="text-gray-300">
{`                ┌──────────────────────────────┐
                │         Developer             │
                │    (Local Machine / Git)      │
                └────────────┬─────────────────┘
                             │
                             │ 1️⃣ Run CLI Tools
                             ▼
        ┌──────────────────────────────┐
        │ CLI Layer (Local Dev Tools)  │
        │ ───────────────────────────  │
        │ • afs-i18n-lint.js          │
        │ • afs-i18n-codemod.js       │
        │ • afs-i18n-refactor.js      │
        │ • Generates locale keys     │
        └────────────┬─────────────────┘
                     │
                     │ 2️⃣ Output JSON → /locales/
                     ▼
        ┌──────────────────────────────┐
        │ Translation Data Store        │
        │ ───────────────────────────   │
        │ /locales/en.json              │
        │ /locales/es.json              │
        │ /locales/fr.json              │
        │ /locales/... (custom)         │
        └────────────┬─────────────────┘
                     │
                     │ 3️⃣ Load into Base44 Runtime
                     ▼
        ┌──────────────────────────────┐
        │ Browser Layer (Base44 App)   │
        │ ───────────────────────────   │
        │ I18nCollector → tracks text  │
        │ I18nLinter → detects issues  │
        │ TranslationManager → fills AI│
        │ I18nProvider → renders text  │
        └────────────┬─────────────────┘
                     │
                     │ 4️⃣ Optional: Auto AI Translation
                     ▼
        ┌──────────────────────────────┐
        │  AI Translator API            │
        │ ───────────────────────────   │
        │  DeepL / OpenAI GPT-4 Turbo   │
        │  Translates missing keys      │
        │  Pushes back to /locales/     │
        └────────────┬─────────────────┘
                     │
                     │ 5️⃣ User Interaction
                     ▼
        ┌──────────────────────────────┐
        │  End-User Experience          │
        │ ───────────────────────────   │
        │  Language Switcher UI Tab     │
        │  "View app in your language"  │
        │  Auto-detects browser locale  │
        │  Caches last selection        │
        └──────────────────────────────┘`}
              </pre>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  <h5 className="text-purple-400 font-semibold text-sm">CLI Layer</h5>
                </div>
                <p className="text-gray-400 text-xs mb-2">
                  Local development tools for linting and auto-fixing code
                </p>
                <ul className="text-gray-500 text-xs space-y-1">
                  <li>• Runs on developer machine</li>
                  <li>• AST-based transformations</li>
                  <li>• Generates JSON seed files</li>
                  <li>• Pre-commit enforcement</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h5 className="text-blue-400 font-semibold text-sm">Browser Layer</h5>
                </div>
                <p className="text-gray-400 text-xs mb-2">
                  Runtime collection, translation, and testing tools
                </p>
                <ul className="text-gray-500 text-xs space-y-1">
                  <li>• Runs in user's browser</li>
                  <li>• Real-time text collection</li>
                  <li>• AI auto-translation</li>
                  <li>• Override testing</li>
                </ul>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="w-5 h-5 text-green-400" />
                  <h5 className="text-green-400 font-semibold text-sm">Storage Layer</h5>
                </div>
                <p className="text-gray-400 text-xs mb-2">
                  Translations stored in code + localStorage
                </p>
                <ul className="text-gray-500 text-xs space-y-1">
                  <li>• I18nProvider.jsx (code)</li>
                  <li>• localStorage overrides</li>
                  <li>• Auto-translation cache</li>
                  <li>• Entity database backup</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
              <h5 className="text-[#FFD700] font-semibold text-sm mb-2">🔄 Complete Flow Example</h5>
              <div className="space-y-2 text-xs text-gray-300">
                <div><strong className="text-white">Step 1:</strong> Developer runs <code className="bg-[#0B0B0C] px-1 rounded">npm run i18n:codemod:write</code></div>
                <div><strong className="text-white">Step 2:</strong> Codemod transforms code → Generates <code className="bg-[#0B0B0C] px-1 rounded">i18n_seed_en.json</code></div>
                <div><strong className="text-white">Step 3:</strong> Developer pastes keys into <code className="bg-[#0B0B0C] px-1 rounded">I18nProvider.jsx → TRANSLATIONS.en</code></div>
                <div><strong className="text-white">Step 4:</strong> User visits Language Settings → Auto-Translate All</div>
                <div><strong className="text-white">Step 5:</strong> AI translates to es, fr, pt → Saves to localStorage cache</div>
                <div><strong className="text-white">Step 6:</strong> User switches language → <code className="bg-[#0B0B0C] px-1 rounded">t('key')</code> returns translated text</div>
                <div><strong className="text-white">Step 7:</strong> Missing key detected → I18nAutoFill translates on-the-fly</div>
                <div><strong className="text-white">Step 8:</strong> User sees app in their language! 🌍</div>
              </div>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h5 className="text-cyan-400 font-semibold text-sm mb-2">🎯 Data Flow</h5>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-white text-xs font-semibold mb-1">Development → Production</p>
                  <code className="block bg-[#0B0B0C] px-2 py-1 rounded text-xs text-gray-400">
                    Code → Codemod → JSON → I18nProvider<br/>
                    → User sees translation
                  </code>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold mb-1">Runtime Collection → Export</p>
                  <code className="block bg-[#0B0B0C] px-2 py-1 rounded text-xs text-gray-400">
                    Browser → Collector → localStorage<br/>
                    → Extract → JSON Export
                  </code>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#00D4C9]/10 border-[#FFD700]/30 border-2 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-white font-bold mb-4">🚀 Quick Navigation</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Workflow className="w-4 h-4 mr-2" />
                Complete Workflow
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('cli-tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Terminal className="w-4 h-4 mr-2" />
                CLI Tools
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('browser-tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Globe className="w-4 h-4 mr-2" />
                Browser Tools
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('code-examples')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Code className="w-4 h-4 mr-2" />
                Code Examples
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('cicd')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Terminal className="w-4 h-4 mr-2" />
                CI/CD Integration
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('agency')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Globe className="w-4 h-4 mr-2" />
                Agency Extension
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('best-practices')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Best Practices
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 text-white justify-start"
                onClick={() => document.getElementById('troubleshooting')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Troubleshooting
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complete Workflow */}
        <div id="workflow">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Workflow className="w-6 h-6 text-[#FFD700]" />
                Complete i18n Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl ${colorClasses[item.color]} flex items-center justify-center font-bold text-lg`}>
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${colorClasses[item.color].split(' ')[1]}`} />
                          <h4 className="text-white font-bold">{item.title}</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                        <div className="p-2 bg-[#0B0B0C] rounded-lg">
                          <code className="text-[#00D4C9] text-xs font-mono">{item.command}</code>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">→ {item.output}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CLI Tools */}
        <div id="cli-tools">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-[#00D4C9]" />
                CLI Tools (Node.js)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="install">
                <TabsList className="bg-[#0B0B0C] mb-4">
                  <TabsTrigger value="install">Installation</TabsTrigger>
                  <TabsTrigger value="linter">Linter</TabsTrigger>
                  <TabsTrigger value="codemod">Codemod</TabsTrigger>
                  <TabsTrigger value="scripts">Scripts</TabsTrigger>
                </TabsList>

                <TabsContent value="install" className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Install Dependencies</h4>
                    <div className="relative">
                      <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                        {codeBlocks.install}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(codeBlocks.install, 'install')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'install' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h5 className="text-blue-400 font-semibold text-sm mb-2">📦 Required Packages</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <code className="bg-[#0B0B0C] px-1 rounded">@babel/parser</code> - Parse JSX/TypeScript</li>
                      <li>• <code className="bg-[#0B0B0C] px-1 rounded">@babel/traverse</code> - Walk AST nodes</li>
                      <li>• <code className="bg-[#0B0B0C] px-1 rounded">@babel/generator</code> - Output modified code</li>
                      <li>• <code className="bg-[#0B0B0C] px-1 rounded">glob</code> - File pattern matching</li>
                      <li>• <code className="bg-[#0B0B0C] px-1 rounded">chalk</code> - Colored terminal output</li>
                      <li>• <code className="bg-[#0B0B0C] px-1 rounded">yargs</code> - Command-line arguments</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="linter" className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Usage</h4>
                    <div className="relative">
                      <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                        {codeBlocks.linterUsage}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(codeBlocks.linterUsage, 'linter')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'linter' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h5 className="text-yellow-400 font-semibold text-sm mb-2">🔍 What the Linter Detects</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>JSX Text:</strong> <code className="bg-[#0B0B0C] px-1 rounded">&lt;div&gt;Hardcoded text&lt;/div&gt;</code></li>
                      <li>• <strong>JSX Attributes:</strong> <code className="bg-[#0B0B0C] px-1 rounded">title="Click me"</code></li>
                      <li>• <strong>String Literals:</strong> <code className="bg-[#0B0B0C] px-1 rounded">const msg = "Hello"</code></li>
                      <li>• <strong>Template Literals:</strong> <code className="bg-[#0B0B0C] px-1 rounded">`Welcome back`</code></li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-lg">
                    <h5 className="text-white font-semibold text-sm mb-2">Auto-Ignored</h5>
                    <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>• Import/export paths</div>
                      <div>• Console logs</div>
                      <div>• className, id, key</div>
                      <div>• data-*, aria-*</div>
                      <div>• Hex colors (#FFD700)</div>
                      <div>• CSS units (px, rem)</div>
                      <div>• URLs (http://)</div>
                      <div>• Pure numbers</div>
                      <div>• Strings in t() calls</div>
                      <div>• Short text (&lt;3 chars)</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="codemod" className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Dry Run (Safe)</h4>
                    <div className="relative">
                      <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                        {codeBlocks.codemodDryRun}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(codeBlocks.codemodDryRun, 'dry')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'dry' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Apply Changes (Modifies Files!)</h4>
                    <div className="relative">
                      <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                        {codeBlocks.codemodWrite}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(codeBlocks.codemodWrite, 'write')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'write' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h5 className="text-red-400 font-semibold text-sm mb-2">⚠️ IMPORTANT: Safety First!</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• <strong>ALWAYS</strong> run <code className="bg-[#0B0B0C] px-1 rounded">--dry</code> first</li>
                      <li>• Commit code to git before running <code className="bg-[#0B0B0C] px-1 rounded">--write</code></li>
                      <li>• Review changes with <code className="bg-[#0B0B0C] px-1 rounded">git diff</code></li>
                      <li>• Test app after codemod to ensure nothing broke</li>
                      <li>• Codemod can miss edge cases - manual review needed</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-lg">
                    <h5 className="text-white font-semibold text-sm mb-2">Options</h5>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <code className="bg-black/40 px-2 py-0.5 rounded text-[#FFD700]">--dry</code>
                        <span>Preview changes without modifying files (default)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="bg-black/40 px-2 py-0.5 rounded text-[#FFD700]">--write</code>
                        <span>Apply changes to files in-place</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="bg-black/40 px-2 py-0.5 rounded text-[#FFD700]">--keyPrefix</code>
                        <span>Prefix for generated keys (default: i18n_)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="bg-black/40 px-2 py-0.5 rounded text-[#FFD700]">--minLen</code>
                        <span>Minimum text length to replace (default: 3)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="bg-black/40 px-2 py-0.5 rounded text-[#FFD700]">--out</code>
                        <span>Output file for seed JSON (default: i18n_seed_en.json)</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scripts" className="space-y-4">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h5 className="text-yellow-400 font-semibold mb-2">📥 Get the Scripts</h5>
                    <p className="text-gray-300 text-sm mb-3">
                      The CLI scripts (<code>afs-i18n-lint.js</code> and <code>afs-i18n-codemod.js</code>) were provided in the chat. 
                      Copy them to your local project's <code>scripts/</code> directory.
                    </p>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div>1. Create <code className="bg-[#0B0B0C] px-1 rounded">scripts/</code> folder in project root</div>
                      <div>2. Save <code className="bg-[#0B0B0C] px-1 rounded">afs-i18n-lint.js</code> from chat</div>
                      <div>3. Save <code className="bg-[#0B0B0C] px-1 rounded">afs-i18n-codemod.js</code> from chat</div>
                      <div>4. Make executable: <code className="bg-[#0B0B0C] px-1 rounded">chmod +x scripts/*.js</code></div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0B0B0C] rounded-lg">
                    <h5 className="text-white font-semibold text-sm mb-3">Package.json Scripts</h5>
                    <div className="relative">
                      <pre className="bg-black/40 border border-gray-800 rounded p-3 text-gray-300 font-mono text-xs overflow-x-auto">
{`{
  "scripts": {
    "i18n:lint": "node scripts/afs-i18n-lint.js \\"src/**/*.{js,jsx}\\"",
    "i18n:fix": "node scripts/afs-i18n-codemod.js --write --keyPrefix ui_",
    "i18n:dry": "node scripts/afs-i18n-codemod.js --dry",
    "precommit": "npm run i18n:lint"
  }
}`}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(`"i18n:lint": "node scripts/afs-i18n-lint.js \\"src/**/*.{js,jsx}\\"",\n"i18n:fix": "node scripts/afs-i18n-codemod.js --write --keyPrefix ui_",\n"i18n:dry": "node scripts/afs-i18n-codemod.js --dry"`, 'scripts')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'scripts' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Browser Tools */}
        <div id="browser-tools">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#9D4EDD]" />
                Browser-Based Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="text-white font-bold">I18nCollector</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Auto-collects visible UI text as you navigate the app
                  </p>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">Runtime</Badge>
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Best for:</strong> Runtime text that CLI misses (dynamic content, conditionals)
                  </div>
                </div>

                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <FileCode className="w-4 h-4 text-yellow-400" />
                    </div>
                    <h4 className="text-white font-bold">I18nLinter</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Browser-based linter with regex pattern matching
                  </p>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Dev Tool</Badge>
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Best for:</strong> Quick checks without Node.js setup
                  </div>
                </div>

                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Code className="w-4 h-4 text-purple-400" />
                    </div>
                    <h4 className="text-white font-bold">TranslationManager</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    AI bulk translation to 8 languages
                  </p>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">Admin</Badge>
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Best for:</strong> Generating es, fr, pt, de, it, ar, ja, zh versions
                  </div>
                </div>

                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h4 className="text-white font-bold">I18nAutoFill</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    Auto-translates missing strings on-the-fly
                  </p>
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Production</Badge>
                  <div className="mt-3 text-xs text-gray-500">
                    <strong>Best for:</strong> Zero-friction feature development
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Examples */}
        <div id="code-examples">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-6 h-6 text-[#FFD700]" />
                Code Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="react">
                <TabsList className="bg-[#0B0B0C] mb-4">
                  <TabsTrigger value="react">React Hook</TabsTrigger>
                  <TabsTrigger value="global">Global Helper</TabsTrigger>
                  <TabsTrigger value="overrides">With Overrides</TabsTrigger>
                  <TabsTrigger value="beforeafter">Before/After</TabsTrigger>
                  <TabsTrigger value="manual">Manual Push</TabsTrigger>
                </TabsList>

                <TabsContent value="react">
                  <div className="relative">
                    <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                      {codeBlocks.reactUsage}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(codeBlocks.reactUsage, 'react')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'react' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                      ✅ <strong>Recommended:</strong> Use this method in all React components
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="global">
                  <div className="relative">
                    <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                      {codeBlocks.legacyGlobal}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(codeBlocks.legacyGlobal, 'global')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'global' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Use for non-React code or quick scripts only
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="overrides">
                  <div className="relative">
                    <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                      {codeBlocks.overrideUsage}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(codeBlocks.overrideUsage, 'override')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'override' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-400 text-sm">
                      💡 Checks localStorage overrides first (from I18nImport page)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="beforeafter">
                  <div className="space-y-4">
                    {Object.entries(codeBlocks.beforeAfter).map(([type, { before, after }]) => (
                      <div key={type}>
                        <h5 className="text-white font-semibold mb-2 capitalize">{type.replace('_', ' ')}</h5>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">❌ Before</p>
                            <pre className="bg-red-500/10 border border-red-500/30 rounded p-3 text-gray-300 font-mono text-xs overflow-x-auto">
                              {before}
                            </pre>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">✅ After</p>
                            <pre className="bg-green-500/10 border border-green-500/30 rounded p-3 text-gray-300 font-mono text-xs overflow-x-auto">
                              {after}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="manual">
                  <div className="relative">
                    <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-x-auto">
                      {codeBlocks.manualPush}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(codeBlocks.manualPush, 'manual')}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      {copiedCode === 'manual' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 Use in browser console or components to manually add keys to collection
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* CI/CD Integration */}
        <div id="cicd">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-[#FFD700]" />
                🧩 CI/CD Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <p className="text-gray-300 text-sm">
                Ensure no hardcoded strings ever slip into production by running the linter in your CI/CD pipeline.
              </p>

              <div>
                <h4 className="text-white font-semibold mb-3">GitHub Actions Example</h4>
                <div className="relative">
                  <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-xs overflow-x-auto">
                    {codeBlocks.githubAction}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCode(codeBlocks.githubAction, 'gh-action')}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    {copiedCode === 'gh-action' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h5 className="text-blue-400 font-semibold text-sm mb-2">💡 How It Works</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Runs on every push and pull request</li>
                  <li>• Fails build if hardcoded strings are detected</li>
                  <li>• Provides clear error message with fix instructions</li>
                  <li>• Prevents untranslatable code from merging</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-white font-semibold text-sm mb-2">GitLab CI</h5>
                  <pre className="bg-black/40 px-2 py-1 rounded text-xs text-gray-400">
{`i18n-lint:
  stage: test
  script:
    - npm ci
    - npm run i18n:lint`}
                  </pre>
                </div>

                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-white font-semibold text-sm mb-2">CircleCI</h5>
                  <pre className="bg-black/40 px-2 py-1 rounded text-xs text-gray-400">
{`- run:
    name: i18n Linter
    command: npm run i18n:lint`}
                  </pre>
                </div>

                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-white font-semibold text-sm mb-2">Jenkins</h5>
                  <pre className="bg-black/40 px-2 py-1 rounded text-xs text-gray-400">
{`stage('i18n Check') {
  steps {
    sh 'npm run i18n:lint'
  }
}`}
                  </pre>
                </div>

                <div className="p-3 bg-[#0B0B0C] rounded-lg">
                  <h5 className="text-white font-semibold text-sm mb-2">Pre-commit Hook</h5>
                  <pre className="bg-black/40 px-2 py-1 rounded text-xs text-gray-400">
{`# .husky/pre-commit
npm run i18n:lint`}
                  </pre>
                </div>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h5 className="text-yellow-400 font-semibold text-sm mb-2">⚠️ Enforcement Best Practices</h5>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Run linter on pre-commit hook for instant feedback</li>
                  <li>• Block PR merges if linter fails in CI</li>
                  <li>• Set up Slack/Discord notifications for failures</li>
                  <li>• Schedule weekly reports of i18n coverage</li>
                  <li>• Make i18n checks mandatory in code review checklist</li>
                </ul>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Agency/White-Label Extension */}
        <div id="agency">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#9D4EDD]" />
                🧩 Extending for Agencies & White-Label
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <p className="text-gray-300 text-sm">
                If you're offering AI Freedom Studios as a white-label solution to clients, 
                you can easily extend i18n to support client-specific translations.
              </p>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h5 className="text-purple-400 font-semibold mb-2">💡 Use Case</h5>
                <p className="text-gray-300 text-sm">
                  Your client "ACME Corp" wants the platform in their brand voice with custom terminology:
                  "Marketing Hub" instead of "Dashboard", "Growth Center" instead of "Analytics", etc.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#FFD700]">
                    1
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Create Client Language File</p>
                    <p className="text-gray-400 text-xs mb-2">
                      Duplicate the English translations as a starting point:
                    </p>
                    <code className="block bg-[#0B0B0C] px-2 py-1 rounded text-xs text-[#00D4C9]">
                      cp locales/en.json locales/client_acme.json
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00D4C9]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#00D4C9]">
                    2
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Client Customizes via I18nImport</p>
                    <p className="text-gray-400 text-xs">
                      Client edits their translations in the I18nImport page → Tests → Downloads final version
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#9D4EDD]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#9D4EDD]">
                    3
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Add to I18nProvider</p>
                    <p className="text-gray-400 text-xs mb-2">
                      Add client language to TRANSLATIONS object:
                    </p>
                    <div className="relative">
                      <pre className="bg-black/40 border border-gray-800 rounded p-2 text-xs text-gray-300 font-mono overflow-x-auto">
                        {codeBlocks.agencyExtension}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(codeBlocks.agencyExtension, 'agency')}
                        className="absolute top-1 right-1 text-gray-400 hover:text-white"
                      >
                        {copiedCode === 'agency' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-green-400">
                    4
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Auto-Apply Client Language</p>
                    <p className="text-gray-400 text-xs">
                      Client's white-label app automatically uses their custom translations based on their configuration
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <h5 className="text-[#FFD700] font-semibold mb-3 text-sm">Benefits for Agencies</h5>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Each client gets their own branded terminology</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Clients can self-manage translations via UI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>No code changes needed per client</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Instant updates without redeployment</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-[#0B0B0C] rounded-xl">
                  <h5 className="text-[#00D4C9] font-semibold mb-3 text-sm">Example Use Cases</h5>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-start gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400 text-xs">Real Estate</Badge>
                      <span>"Listings" → "Properties"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">Fitness</Badge>
                      <span>"Projects" → "Workouts"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-green-500/20 text-green-400 text-xs">Education</Badge>
                      <span>"Videos" → "Lessons"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Coaching</Badge>
                      <span>"Campaigns" → "Programs"</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h5 className="text-cyan-400 font-semibold text-sm mb-2">🔄 Client Self-Service Workflow</h5>
                <ol className="text-gray-300 text-xs space-y-1">
                  <li>1. Client logs into their white-label portal</li>
                  <li>2. Navigate to <strong>Language Settings → Import Translations</strong></li>
                  <li>3. Upload their customized translation JSON</li>
                  <li>4. Test changes immediately in browser</li>
                  <li>5. Download final version when satisfied</li>
                  <li>6. Agency pushes to client's I18nProvider.jsx</li>
                  <li>7. Client's app now uses their custom terminology! 🎉</li>
                </ol>
              </div>

              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <h5 className="text-white font-semibold text-sm mb-2">Multi-Tenant Architecture</h5>
                <p className="text-gray-400 text-xs mb-3">
                  For SaaS agencies managing multiple clients, you can dynamically load client-specific translations:
                </p>
                <pre className="bg-black/40 border border-gray-800 rounded p-2 text-xs text-gray-300 font-mono">
{`// In I18nProvider.jsx
const TRANSLATIONS = {
  en: { ... },
  es: { ... },
  
  // Client-specific overrides
  ...(user.white_label_config?.custom_translations || {})
};

// Auto-select client language
useEffect(() => {
  const clientLang = user.white_label_config?.language || 'en';
  if (clientLang !== lang) setLang(clientLang);
}, [user]);`}
                </pre>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Best Practices */}
        <div id="best-practices">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-[#FFD700]" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h5 className="text-green-400 font-semibold mb-2">✅ Do's</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Use semantic keys: <code className="bg-[#0B0B0C] px-1 rounded">dashboard.welcome</code> not <code className="bg-[#0B0B0C] px-1 rounded">text_123</code></li>
                  <li>• Group by feature: <code className="bg-[#0B0B0C] px-1 rounded">video.create_button</code>, <code className="bg-[#0B0B0C] px-1 rounded">video.delete_confirm</code></li>
                  <li>• Use variables for dynamic content: <code className="bg-[#0B0B0C] px-1 rounded">{`{name}`}</code>, <code className="bg-[#0B0B0C] px-1 rounded">{`{count}`}</code></li>
                  <li>• Add <code className="bg-[#0B0B0C] px-1 rounded">data-i18n-ignore</code> to technical/debug content</li>
                  <li>• Run linter before committing new features</li>
                  <li>• Test with multiple languages before deploying</li>
                  <li>• Keep English as source of truth</li>
                </ul>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h5 className="text-red-400 font-semibold mb-2">❌ Don'ts</h5>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Don't hardcode strings in new code</li>
                  <li>• Don't use auto-generated keys in production (refine them!)</li>
                  <li>• Don't skip testing non-English languages</li>
                  <li>• Don't forget variable placeholders: <code className="bg-[#0B0B0C] px-1 rounded text-red-400">❌ "Created by John"</code> → <code className="bg-[#0B0B0C] px-1 rounded text-green-400">✅ "Created by {`{name}`}"</code></li>
                  <li>• Don't run codemod without git backup</li>
                  <li>• Don't edit generated translation files directly (use UI tools)</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h5 className="text-blue-400 font-semibold mb-2">🎯 Key Organization</h5>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>
                    <strong>By Feature:</strong>
                    <code className="block bg-[#0B0B0C] px-2 py-1 rounded mt-1 text-xs">
                      video.create, video.edit, video.delete<br/>
                      offer.title, offer.score, offer.optimize<br/>
                      funnel.launch, funnel.pause, funnel.analytics
                    </code>
                  </div>
                  <div>
                    <strong>By UI Element:</strong>
                    <code className="block bg-[#0B0B0C] px-2 py-1 rounded mt-1 text-xs">
                      nav.dashboard, nav.settings<br/>
                      btn.create, btn.cancel, btn.save<br/>
                      msg.success, msg.error, msg.loading
                    </code>
                  </div>
                  <div>
                    <strong>By Page:</strong>
                    <code className="block bg-[#0B0B0C] px-2 py-1 rounded mt-1 text-xs">
                      dashboard.hero_title, dashboard.stats<br/>
                      settings.profile, settings.billing
                    </code>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting */}
        <div id="troubleshooting">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wrench className="w-6 h-6 text-[#00D4C9]" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-red-400 font-semibold mb-2">❌ "Module not found: @babel/parser"</h5>
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Solution:</strong> Install dependencies
                </p>
                <code className="block bg-black/40 px-3 py-2 rounded text-xs text-[#00D4C9]">
                  npm install -D @babel/parser @babel/traverse @babel/generator glob chalk yargs
                </code>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-red-400 font-semibold mb-2">❌ Codemod broke my code</h5>
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Solution:</strong> Revert with git
                </p>
                <code className="block bg-black/40 px-3 py-2 rounded text-xs text-[#00D4C9]">
                  git checkout -- src/
                </code>
                <p className="text-gray-500 text-xs mt-2">
                  Always commit before running --write!
                </p>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-red-400 font-semibold mb-2">❌ Missing translation for key "xyz"</h5>
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Solutions:</strong>
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>1. Check if key exists in TRANSLATIONS.en</li>
                  <li>2. Enable auto-translation (I18nAutoSettings)</li>
                  <li>3. Add manually to I18nProvider.jsx</li>
                  <li>4. Import overrides via I18nImport page</li>
                </ul>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-red-400 font-semibold mb-2">❌ Variables not rendering {`({name}, {count})`}</h5>
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Cause:</strong> Missing variable in translation
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-red-400 mb-1">❌ Wrong:</p>
                    <code className="block bg-red-500/10 px-2 py-1 rounded">
                      "greeting": "Welcome back!"
                    </code>
                  </div>
                  <div>
                    <p className="text-green-400 mb-1">✅ Correct:</p>
                    <code className="block bg-green-500/10 px-2 py-1 rounded">
                      "greeting": "Welcome back, {`{name}`}!"
                    </code>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0C] rounded-xl">
                <h5 className="text-red-400 font-semibold mb-2">❌ Translations not updating after import</h5>
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Solution:</strong> Force reload
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>1. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+F5)</li>
                  <li>2. Check localStorage has overrides: <code className="bg-black/40 px-1 rounded text-xs">afs_i18n_overrides</code></li>
                  <li>3. Verify language is set correctly in topbar switcher</li>
                  <li>4. Check browser console for errors</li>
                </ul>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Translation Keys Reference */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileCode className="w-6 h-6 text-[#9D4EDD]" />
              Adding Keys to I18nProvider.jsx
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                After generating keys with codemod or collector, add them to the TRANSLATIONS object:
              </p>

              <div className="relative">
                <pre className="bg-black/40 border border-gray-800 rounded-lg p-4 text-gray-300 font-mono text-xs overflow-x-auto">
                  {codeBlocks.i18nProvider}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode(codeBlocks.i18nProvider, 'provider')}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  {copiedCode === 'provider' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h5 className="text-cyan-400 font-semibold text-sm mb-2">🔄 Workflow</h5>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. Run codemod → generates <code className="bg-[#0B0B0C] px-1 rounded text-xs">i18n_seed_en.json</code></li>
                  <li>2. Open <code className="bg-[#0B0B0C] px-1 rounded text-xs">components/I18nProvider.jsx</code></li>
                  <li>3. Paste generated keys into <code className="bg-[#0B0B0C] px-1 rounded text-xs">TRANSLATIONS.en</code></li>
                  <li>4. Go to Translation Management → Auto-Translate All</li>
                  <li>5. Download translated JSON</li>
                  <li>6. Paste es, fr, pt into TRANSLATIONS object</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Matrix */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Tool Comparison Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-400 font-semibold">Tool</th>
                    <th className="text-left p-3 text-gray-400 font-semibold">Purpose</th>
                    <th className="text-left p-3 text-gray-400 font-semibold">Environment</th>
                    <th className="text-left p-3 text-gray-400 font-semibold">When to Use</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-white font-mono text-xs">afs-i18n-lint.js</td>
                    <td className="p-3 text-gray-300">Detect hardcoded strings</td>
                    <td className="p-3"><Badge className="bg-purple-500/20 text-purple-400 text-xs">CLI</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">Pre-commit, CI/CD</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-white font-mono text-xs">afs-i18n-codemod.js</td>
                    <td className="p-3 text-gray-300">Auto-fix hardcoded strings</td>
                    <td className="p-3"><Badge className="bg-purple-500/20 text-purple-400 text-xs">CLI</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">One-time migration</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-white font-mono text-xs">I18nCollector</td>
                    <td className="p-3 text-gray-300">Collect runtime text</td>
                    <td className="p-3"><Badge className="bg-blue-500/20 text-blue-400 text-xs">Browser</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">Always running</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-white font-mono text-xs">I18nLinter</td>
                    <td className="p-3 text-gray-300">Browser-based detection</td>
                    <td className="p-3"><Badge className="bg-blue-500/20 text-blue-400 text-xs">Browser</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">Quick checks</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-white font-mono text-xs">I18nExtract</td>
                    <td className="p-3 text-gray-300">Export collected keys</td>
                    <td className="p-3"><Badge className="bg-blue-500/20 text-blue-400 text-xs">Browser</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">After navigation</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-white font-mono text-xs">TranslationManager</td>
                    <td className="p-3 text-gray-300">AI bulk translation</td>
                    <td className="p-3"><Badge className="bg-blue-500/20 text-blue-400 text-xs">Browser</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">After key export</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="p-3 text-white font-mono text-xs">I18nImport</td>
                    <td className="p-3 text-gray-300">Test translations</td>
                    <td className="p-3"><Badge className="bg-blue-500/20 text-blue-400 text-xs">Browser</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">Before code deploy</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-white font-mono text-xs">I18nAutoFill</td>
                    <td className="p-3 text-gray-300">Runtime auto-translate</td>
                    <td className="p-3"><Badge className="bg-blue-500/20 text-blue-400 text-xs">Browser</Badge></td>
                    <td className="p-3 text-gray-400 text-xs">Production</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Topics */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Advanced Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <details className="group">
              <summary className="cursor-pointer p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors">
                <span className="text-white font-semibold">Custom Key Extraction Patterns</span>
              </summary>
              <div className="mt-3 p-4 bg-black/20 border border-gray-800 rounded-lg">
                <p className="text-gray-300 text-sm mb-3">
                  Tag elements with custom keys before running codemod:
                </p>
                <pre className="bg-black/40 px-3 py-2 rounded text-gray-300 font-mono text-xs">
{`<h1 data-i18n-key="dashboard.hero_title">
  Why AI Freedom Studios Wins
</h1>
<!-- Codemod uses "dashboard.hero_title" instead of auto-generated key -->`}
                </pre>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors">
                <span className="text-white font-semibold">Ignoring Content from Tools</span>
              </summary>
              <div className="mt-3 p-4 bg-black/20 border border-gray-800 rounded-lg">
                <p className="text-gray-300 text-sm mb-3">
                  Prevent collection/linting of technical content:
                </p>
                <pre className="bg-black/40 px-3 py-2 rounded text-gray-300 font-mono text-xs">
{`<div data-i18n-ignore>
  <pre><code>
    {/* Code samples, error messages, debug info */}
    Error: 500 Internal Server Error
    Stack trace: ...
  </code></pre>
</div>

{/* Works for: I18nCollector, I18nLinter, Codemod */}`}
                </pre>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors">
                <span className="text-white font-semibold">Variable Placeholders</span>
              </summary>
              <div className="mt-3 p-4 bg-black/20 border border-gray-800 rounded-lg">
                <p className="text-gray-300 text-sm mb-3">
                  Use curly braces for dynamic content:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-red-400 text-xs mb-1">❌ Wrong</p>
                    <pre className="bg-red-500/10 border border-red-500/30 rounded p-2 text-xs">
{`t('greeting')
// "Welcome, John"`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-green-400 text-xs mb-1">✅ Correct</p>
                    <pre className="bg-green-500/10 border border-green-500/30 rounded p-2 text-xs">
{`t('greeting', { name: user.name })
// "Welcome, {name}"
// → "Welcome, John"`}
                    </pre>
                  </div>
                </div>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors">
                <span className="text-white font-semibold">Pluralization</span>
              </summary>
              <div className="mt-3 p-4 bg-black/20 border border-gray-800 rounded-lg">
                <p className="text-gray-300 text-sm mb-3">
                  Handle singular/plural forms:
                </p>
                <pre className="bg-black/40 px-3 py-2 rounded text-gray-300 font-mono text-xs">
{`// Simple approach (works for English)
const msg = count === 1 
  ? t('msg.one_item', { count }) 
  : t('msg.many_items', { count });

// TRANSLATIONS.en
{
  "msg.one_item": "{count} item",
  "msg.many_items": "{count} items"
}

// For complex pluralization, use dedicated library
// (not currently installed in Base44)`}
                </pre>
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors">
                <span className="text-white font-semibold">RTL Support (Arabic, Hebrew)</span>
              </summary>
              <div className="mt-3 p-4 bg-black/20 border border-gray-800 rounded-lg">
                <p className="text-gray-300 text-sm mb-3">
                  I18nProvider sets <code className="bg-[#0B0B0C] px-1 rounded">document.documentElement.lang</code> automatically.
                  For RTL languages, add this to your layout:
                </p>
                <pre className="bg-black/40 px-3 py-2 rounded text-gray-300 font-mono text-xs">
{`const { lang } = useI18n();
const isRTL = ['ar', 'he'].includes(lang);

<div dir={isRTL ? 'rtl' : 'ltr'}>
  {children}
</div>`}
                </pre>
              </div>
            </details>

          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">📚 Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            
            <div className="grid md:grid-cols-2 gap-3">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors block"
              >
                <h5 className="text-white font-semibold text-sm mb-1">MDN: Intl API</h5>
                <p className="text-gray-400 text-xs">Native browser i18n APIs</p>
              </a>

              <a
                href="https://www.w3.org/International/questions/qa-i18n"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors block"
              >
                <h5 className="text-white font-semibold text-sm mb-1">W3C: i18n Best Practices</h5>
                <p className="text-gray-400 text-xs">Internationalization guidelines</p>
              </a>

              <a
                href="https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors block"
              >
                <h5 className="text-white font-semibold text-sm mb-1">ISO 639-1 Language Codes</h5>
                <p className="text-gray-400 text-xs">Standard language codes reference</p>
              </a>

              <a
                href="https://github.com/base44/i18n-examples"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors block"
              >
                <h5 className="text-white font-semibold text-sm mb-1">Base44 i18n Examples</h5>
                <p className="text-gray-400 text-xs">Sample implementations</p>
              </a>

              <a
                href="https://www.i18next.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#0B0B0C] rounded-lg hover:bg-[#1a1a1f] transition-colors block"
              >
                <h5 className="text-white font-semibold text-sm mb-1">i18next Documentation</h5>
                <p className="text-gray-400 text-xs">Popular i18n framework</p>
              </a>
            </div>

          </CardContent>
        </Card>

        {/* Quick Reference Card */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#9D4EDD]/10 border-[#FFD700]/30 border-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">⚡ Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              
              <div>
                <h5 className="text-[#FFD700] font-semibold mb-2 text-sm">CLI Commands</h5>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">$</span>
                    <code className="text-gray-300">npm run i18n:lint</code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">$</span>
                    <code className="text-gray-300">npm run i18n:dry</code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500">$</span>
                    <code className="text-gray-300">npm run i18n:fix</code>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-[#00D4C9] font-semibold mb-2 text-sm">Browser Pages</h5>
                <div className="space-y-1 text-xs">
                  <div className="text-gray-300">• Language Settings → Admin tools</div>
                  <div className="text-gray-300">• Translation Extract → Export keys</div>
                  <div className="text-gray-300">• i18n Linter → Scan violations</div>
                  <div className="text-gray-300">• Import Translations → Test</div>
                  <div className="text-gray-300">• Language Auto → Enable auto-fill</div>
                </div>
              </div>

              <div>
                <h5 className="text-[#9D4EDD] font-semibold mb-2 text-sm">React Usage</h5>
                <code className="block bg-black/40 px-2 py-1 rounded text-xs text-gray-300">
                  const {`{ t }`} = useI18n();<br/>
                  {`{t('key')}`}
                </code>
              </div>

              <div>
                <h5 className="text-green-400 font-semibold mb-2 text-sm">Manual Add</h5>
                <code className="block bg-black/40 px-2 py-1 rounded text-xs text-gray-300">
                  window.AFS_I18N_PUSH(<br/>
                  &nbsp;&nbsp;'key', 'text'<br/>
                  )
                </code>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
