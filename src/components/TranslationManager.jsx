
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  Copy,
  Search
} from "lucide-react";

export default function TranslationManager({ user }) {
  const [isScanning, setIsScanning] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [extractedKeys, setExtractedKeys] = useState(null);
  const [translationProgress, setTranslationProgress] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract translation keys from existing code
  const extractTranslationKeys = async () => {
    setIsScanning(true);
    try {
      const extraction = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the AI Freedom Studios platform and extract all UI text that should be translated.

REQUIREMENTS:
1. Extract text from navigation items, buttons, labels, headings, messages, placeholders
2. Create logical key names (e.g., "dashboard.title", "button.create", "msg.success")
3. Group by context (nav, actions, messages, pages, etc.)
4. Include only user-facing text (not code comments or logs)
5. Capture dynamic content templates (e.g., "msg.items_count" with {count} variable)

CURRENT PAGES TO SCAN:
- Dashboard (welcome messages, stats, quick actions)
- Video Studio (project creation, rendering, AI features)
- CTV Studio (platform setup, analytics)
- Marketing Suite (offer builder, campaigns, budget)
- AI Copilot (intents, commands, responses)
- Settings (all configuration options)
- Agency Accelerator (pricing, onboarding)

Provide comprehensive extraction with:
1. English (en) - Complete baseline
2. Key categorization (navigation, actions, messages, errors, success, labels, placeholders)
3. Variable placeholders identified (e.g., {name}, {count}, {date})
4. Context notes for translators`,
        response_json_schema: {
          type: "object",
          properties: {
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category_name: { type: "string" },
                  keys: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        en_value: { type: "string" },
                        has_variables: { type: "boolean" },
                        variables: { type: "array", items: { type: "string" } },
                        context: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            total_keys: { type: "number" },
            summary: { type: "string" }
          }
        }
      });

      setExtractedKeys(extraction);

      // Format for download
      const translationDict = {};
      extraction.categories.forEach(cat => {
        cat.keys.forEach(item => {
          translationDict[item.key] = item.en_value;
        });
      });

      alert(`✅ Translation Key Extraction Complete!

📊 RESULTS:
• Total Keys: ${extraction.total_keys}
• Categories: ${extraction.categories.length}
• Has Variables: ${extraction.categories.reduce((sum, cat) => 
    sum + cat.keys.filter(k => k.has_variables).length, 0)}

💾 Keys extracted and ready for translation!

${extraction.summary}

You can now:
1. Review extracted keys below
2. Auto-translate to all languages
3. Download as JSON
4. Import to I18nProvider`);

    } catch (error) {
      alert("Error extracting keys. Please try again.");
      console.error(error);
    }
    setIsScanning(false);
  };

  // Auto-translate all missing keys
  const autoTranslateAll = async () => {
    if (!extractedKeys) {
      alert("Please extract keys first");
      return;
    }

    if (!confirm(`Auto-translate ${extractedKeys.total_keys} keys to Spanish, French, and Portuguese?\n\nThis will use AI to translate all missing keys.\n\nEstimated time: 2-3 minutes`)) {
      return;
    }

    setIsTranslating(true);
    const languages = ['es', 'fr', 'pt'];
    const results = { es: {}, fr: {}, pt: {} };

    try {
      // Build English dictionary
      const enDict = {};
      extractedKeys.categories.forEach(cat => {
        cat.keys.forEach(item => {
          enDict[item.key] = item.en_value;
        });
      });

      // Translate to each language
      for (const lang of languages) {
        setTranslationProgress({
          current_lang: lang,
          progress: languages.indexOf(lang) / languages.length * 100
        });

        const translation = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate all UI strings to ${lang === 'es' ? 'Spanish (Spain)' : lang === 'fr' ? 'French (France)' : 'Portuguese (Brazil)'}:

ENGLISH STRINGS:
${JSON.stringify(enDict, null, 2)}

TRANSLATION GUIDELINES:
1. Maintain tone and brand voice
2. Keep technical terms (AI, CTV, ROAS, NBA) in English when appropriate
3. Preserve variable placeholders exactly: {name}, {count}, {type}, etc.
4. Use formal "you" (usted/vous/você) for professional context
5. Adapt idioms and expressions naturally
6. Keep button text concise (1-3 words when possible)
7. Marketing terms should be compelling in target language

CONTEXT:
- This is a professional AI marketing platform
- Users are creators, agencies, and entrepreneurs
- Tone: Empowering, innovative, results-driven

Return complete translation dictionary with ALL keys translated.`,
          response_json_schema: {
            type: "object",
            properties: {
              translations: {
                type: "object",
                additionalProperties: { type: "string" }
              },
              translator_notes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    key: { type: "string" },
                    note: { type: "string" }
                  }
                }
              }
            }
          }
        });

        results[lang] = translation.translations;

        // Save translations to database
        for (const [key, value] of Object.entries(translation.translations)) {
          await base44.entities.Translation.create({
            key: key,
            language_code: lang,
            translated_text: value,
            context: extractedKeys.categories.find(cat => 
              cat.keys.some(k => k.key === key)
            )?.category_name || "general",
            verified: false
          });
        }
      }

      setTranslationProgress(null);

      // Generate downloadable JSON
      const fullDict = {
        en: enDict,
        ...results
      };

      const blob = new Blob([JSON.stringify(fullDict, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translations-complete.json';
      a.click();

      alert(`✅ Auto-Translation Complete!

🌍 LANGUAGES TRANSLATED:
• Spanish (Español) - ${Object.keys(results.es).length} keys
• French (Français) - ${Object.keys(results.fr).length} keys
• Portuguese (Português) - ${Object.keys(results.pt).length} keys

💾 Translations saved to database and downloaded as JSON

📋 NEXT STEPS:
1. Review translations in tabs below
2. Edit any that need refinement
3. Mark as verified when ready
4. Import to I18nProvider.jsx

File downloaded: translations-complete.json`);

    } catch (error) {
      alert("Error during auto-translation. Please try again.");
      console.error(error);
    }
    setIsTranslating(false);
  };

  // Translate a single missing key
  const translateSingleKey = async (key, enValue, targetLang) => {
    try {
      const translation = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this UI string to ${
          targetLang === 'es' ? 'Spanish (Spain)' : 
          targetLang === 'fr' ? 'French (France)' : 
          'Portuguese (Brazil)'
        }:

ENGLISH: "${enValue}"
KEY: ${key}

Maintain tone, preserve variable placeholders ({name}, {count}, etc.), and adapt naturally to ${targetLang}.`
      });

      await base44.entities.Translation.create({
        key: key,
        language_code: targetLang,
        translated_text: translation,
        verified: false
      });

      return translation;
    } catch (error) {
      console.error("Translation error:", error);
      return null;
    }
  };

  // Export translations as JSON
  const exportTranslations = () => {
    if (!extractedKeys) {
      alert("No translations to export. Extract keys first.");
      return;
    }

    const enDict = {};
    extractedKeys.categories.forEach(cat => {
      cat.keys.forEach(item => {
        enDict[item.key] = item.en_value;
      });
    });

    const exportData = {
      en: enDict,
      metadata: {
        total_keys: extractedKeys.total_keys,
        extracted_at: new Date().toISOString(),
        platform: "AI Freedom Studios"
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations-en.json';
    a.click();

    alert("✅ English translations exported!\n\nFile: translations-en.json");
  };

  // Generate code to update I18nProvider
  const generateProviderCode = () => {
    if (!extractedKeys) {
      alert("Extract keys first");
      return;
    }

    const enDict = {};
    extractedKeys.categories.forEach(cat => {
      cat.keys.forEach(item => {
        enDict[item.key] = item.en_value;
      });
    });

    const code = `// Add these to TRANSLATIONS.en in components/I18nProvider.jsx:

${JSON.stringify(enDict, null, 2)}

// Then run auto-translation to generate es, fr, pt versions`;

    navigator.clipboard.writeText(code);
    alert("✅ Code copied to clipboard!\n\nPaste into I18nProvider.jsx TRANSLATIONS.en object");
  };

  const filteredKeys = extractedKeys?.categories?.map(cat => ({
    ...cat,
    keys: cat.keys.filter(k => 
      !searchQuery || 
      k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.en_value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.keys.length > 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30 border-2 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#FFD700]" />
                Auto-Translation System
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                AI-powered translation management for multilingual platform
              </p>
              {extractedKeys && (
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {extractedKeys.total_keys} keys extracted
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {extractedKeys.categories.length} categories
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={extractTranslationKeys}
                disabled={isScanning}
                variant="outline"
                className="border-[#FFD700] text-[#FFD700]"
              >
                {isScanning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Scan & Extract Keys
              </Button>
              <Button
                onClick={autoTranslateAll}
                disabled={isTranslating || !extractedKeys}
                className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Auto-Translate All
              </Button>
            </div>
          </div>

          {translationProgress && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-400 text-sm">
                  Translating to: <strong>{translationProgress.current_lang.toUpperCase()}</strong>
                </p>
                <span className="text-white font-bold">{Math.round(translationProgress.progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00D4C9] to-[#06D6A0] transition-all"
                  style={{ width: `${translationProgress.progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Bar */}
      {extractedKeys && (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={exportTranslations}
                size="sm"
                variant="outline"
                className="border-gray-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={generateProviderCode}
                size="sm"
                variant="outline"
                className="border-gray-700 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Provider Code
              </Button>
            </div>
            <Input
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs bg-[#0B0B0C] border-gray-700 text-white"
            />
          </CardContent>
        </Card>
      )}

      {/* Extracted Keys Display */}
      {extractedKeys && (
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Extracted Translation Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={filteredKeys?.[0]?.category_name || "navigation"}>
              <TabsList className="bg-[#0B0B0C] flex-wrap">
                {filteredKeys?.map(cat => (
                  <TabsTrigger key={cat.category_name} value={cat.category_name}>
                    {cat.category_name} ({cat.keys.length})
                  </TabsTrigger>
                ))}
              </TabsList>

              {filteredKeys?.map(category => (
                <TabsContent key={category.category_name} value={category.category_name}>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {category.keys.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <code className="text-[#00D4C9] text-xs font-mono">
                              {item.key}
                            </code>
                            {item.has_variables && (
                              <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs">
                                Has vars: {item.variables?.join(', ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-white text-sm mb-1">{item.en_value}</p>
                        {item.context && (
                          <p className="text-gray-500 text-xs">
                            Context: {item.context}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Translation Editor */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Translation Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm mb-4">
            Review and edit AI-generated translations. Mark as verified when accurate.
          </p>
          
          <TranslationReviewer user={user} />
        </CardContent>
      </Card>

      {/* Missing Translations Detector */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Missing Translations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MissingTranslationDetector />
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-white font-bold mb-3">🤖 How Auto-Translation Works</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                <strong>Step 1:</strong> AI scans all pages and components to extract user-facing text
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                <strong>Step 2:</strong> Generates logical translation keys (e.g., "dashboard.welcome")
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                <strong>Step 3:</strong> AI translates to Spanish, French, Portuguese with context awareness
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                <strong>Step 4:</strong> Saves to database and generates importable JSON
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                <strong>Step 5:</strong> You review, refine, verify, and import to production
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-xs">
              💡 <strong>Pro Tip:</strong> The system preserves variable placeholders (e.g., {`{name}, {count}`}) and maintains professional tone automatically. Review technical terms to ensure they're appropriate for each language.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

// Translation Reviewer Component
function TranslationReviewer({ user }) {
  const [selectedLang, setSelectedLang] = useState("es");
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data: translations = [], refetch } = useQuery({
    queryKey: ["translations", selectedLang],
    queryFn: () => base44.entities.Translation.filter({
      language_code: selectedLang
    }),
    enabled: !!selectedLang
  });

  const updateTranslation = async (translation) => {
    try {
      await base44.entities.Translation.update(translation.id, {
        translated_text: editValue,
        verified: true
      });
      setEditingKey(null);
      refetch();
      alert("Translation updated!");
    } catch (error) {
      alert("Error updating translation");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['es', 'fr', 'pt'].map(lang => (
          <Button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            variant={selectedLang === lang ? "default" : "outline"}
            size="sm"
            className={selectedLang === lang 
              ? "bg-[#6F1AB1] text-white"
              : "border-gray-700 text-gray-400"}
          >
            {lang === 'es' ? '🇪🇸 Español' : lang === 'fr' ? '🇫🇷 Français' : '🇧🇷 Português'}
          </Button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {translations.slice(0, 20).map((trans, idx) => (
          <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <code className="text-[#00D4C9] text-xs font-mono">{trans.key}</code>
              <div className="flex gap-1">
                {trans.verified ? (
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    ✓ Verified
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                    Review
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingKey(trans.key);
                    setEditValue(trans.translated_text);
                  }}
                  className="text-gray-400 hover:text-white h-6 px-2"
                >
                  Edit
                </Button>
              </div>
            </div>
            
            {editingKey === trans.key ? (
              <div className="space-y-2">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-[#111317] border-gray-700 text-white h-20"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateTranslation(trans)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingKey(null)}
                    className="border-gray-700 text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-white text-sm">{trans.translated_text}</p>
            )}
          </div>
        ))}

        {translations.length === 0 && (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 text-sm">
              No translations for {selectedLang.toUpperCase()} yet
            </p>
            <p className="text-gray-500 text-xs">
              Run auto-translation to generate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing Translation Detector
function MissingTranslationDetector() {
  const [missing, setMissing] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkMissingTranslations = async () => {
    setIsChecking(true);
    try {
      // Get current I18nProvider translations
      const currentTranslations = window.__AFS_I18N__ ? 
        Object.keys(window.__AFS_I18N__.t) : [];

      // Compare with database
      const allTranslations = await base44.entities.Translation.list();
      
      const missingByLang = {
        es: [],
        fr: [],
        pt: []
      };

      ['es', 'fr', 'pt'].forEach(lang => {
        const existingKeys = allTranslations
          .filter(t => t.language_code === lang)
          .map(t => t.key);
        
        const allKeys = [...new Set(allTranslations.map(t => t.key))];
        missingByLang[lang] = allKeys.filter(k => !existingKeys.includes(k));
      });

      setMissing(missingByLang);

      const totalMissing = Object.values(missingByLang).reduce((sum, arr) => sum + arr.length, 0);

      if (totalMissing === 0) {
        alert("✅ All translations complete!\n\nNo missing keys detected.");
      } else {
        alert(`⚠️ Missing Translations Detected:

🇪🇸 Spanish: ${missingByLang.es.length} keys
🇫🇷 French: ${missingByLang.fr.length} keys
🇧🇷 Portuguese: ${missingByLang.pt.length} keys

Total: ${totalMissing} missing translations

Run auto-translation to fill gaps.`);
      }

    } catch (error) {
      alert("Error checking translations");
      console.error(error);
    }
    setIsChecking(false);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={checkMissingTranslations}
        disabled={isChecking}
        className="bg-yellow-500 hover:bg-yellow-600 text-black"
      >
        {isChecking ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <AlertTriangle className="w-4 h-4 mr-2" />
        )}
        Check for Missing Translations
      </Button>

      {missing && (
        <div className="grid md:grid-cols-3 gap-3">
          {Object.entries(missing).map(([lang, keys]) => (
            <div key={lang} className="p-3 bg-[#0B0B0C] rounded-lg">
              <h5 className="text-white font-semibold mb-2">
                {lang === 'es' ? '🇪🇸 Spanish' : lang === 'fr' ? '🇫🇷 French' : '🇧🇷 Portuguese'}
              </h5>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Missing Keys</span>
                <Badge className={keys.length === 0 
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
                }>
                  {keys.length}
                </Badge>
              </div>
              {keys.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {keys.slice(0, 10).map((key, idx) => (
                    <code key={idx} className="block text-gray-500 text-xs">
                      {key}
                    </code>
                  ))}
                  {keys.length > 10 && (
                    <p className="text-gray-600 text-xs mt-1">
                      ...and {keys.length - 10} more
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
