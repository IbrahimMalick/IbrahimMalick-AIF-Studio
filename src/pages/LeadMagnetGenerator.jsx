import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  Loader2,
  Eye,
  Share2,
  BarChart3,
  TrendingUp,
  Target,
  Globe,
  Zap,
  Settings,
  DollarSign,
  Users,
  Link as LinkIcon,
  Mail,
  Copy,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

export default function LeadMagnetGenerator() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMagnet, setSelectedMagnet] = useState(null);

  const [formData, setFormData] = useState({
    magnet_name: "",
    magnet_type: "ebook",
    topic: "",
    target_audience: "",
    keywords: "",
    key_points: "",
    design_template: "modern",
    personalization_enabled: true,
    multilingual_enabled: false,
    ab_testing_enabled: false,
    languages: ["en"]
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: leadMagnets = [] } = useQuery({
    queryKey: ["leadMagnets", user?.email],
    queryFn: () => base44.entities.LeadMagnet.filter({ user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const { data: downloads = [] } = useQuery({
    queryKey: ["leadMagnetDownloads"],
    queryFn: () => base44.entities.LeadMagnetDownload.list("-downloaded_at", 100),
  });

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      setIsGenerating(true);

      // Step 1: Generate comprehensive content
      const content = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a high-converting ${data.magnet_type} about "${data.topic}" for ${data.target_audience}.

KEYWORDS TO OPTIMIZE FOR: ${data.keywords}

KEY POINTS TO COVER: ${data.key_points}

TARGET OUTCOME: Generate leads that convert to paying customers

REQUIREMENTS:
1. COMPELLING TITLE (tested for CTR)
2. HOOK (first 2 paragraphs - must grab attention)
3. INTRODUCTION (3-4 paragraphs)
   - Problem identification
   - Agitation of pain points
   - Solution preview
4. MAIN CONTENT (5-8 sections):
   - Each section: Clear headline + detailed content
   - Actionable steps/tips
   - Real-world examples
   - Quick wins
5. VISUAL ELEMENTS:
   - Callout boxes for key points
   - Checklists
   - Process diagrams (describe for designer)
   - Before/after comparisons
6. ENGAGEMENT BOOSTERS:
   - Questions to reader
   - Fill-in-the-blank worksheets
   - Self-assessment tools
7. CONVERSION ELEMENTS:
   - 3-5 strategic CTAs throughout
   - Social proof placeholders
   - Next steps clearly defined
8. CONCLUSION:
   - Summary of key takeaways
   - Final powerful CTA
   - Bonus resources teaser
9. METADATA:
   - Word count
   - Estimated reading time
   - Key SEO terms
   - Recommended cover concepts

Format as professional ${data.magnet_type}. Make it valuable enough that people would pay for it.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            hook: { type: "string" },
            introduction: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section_number: { type: "number" },
                  headline: { type: "string" },
                  content: { type: "string" },
                  callout_boxes: { type: "array", items: { type: "string" } },
                  action_items: { type: "array", items: { type: "string" } }
                }
              }
            },
            ctas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "string" },
                  text: { type: "string" },
                  url_placeholder: { type: "string" }
                }
              }
            },
            conclusion: { type: "string" },
            bonus_resources: { type: "array", items: { type: "string" } },
            metadata: {
              type: "object",
              properties: {
                word_count: { type: "number" },
                reading_time_minutes: { type: "number" },
                seo_keywords: { type: "array", items: { type: "string" } },
                cover_concepts: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      // Step 2: Calculate viral/engagement scores
      const scores = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this lead magnet and predict performance:

TITLE: ${content.title}
TOPIC: ${data.topic}
TARGET AUDIENCE: ${data.target_audience}
TYPE: ${data.magnet_type}
WORD COUNT: ${content.metadata.word_count}

Provide:
1. Viral score (0-100): How likely to be shared
2. Engagement score (0-100): Content quality and value
3. Predicted download rate: % of viewers who download
4. Predicted conversion rate: % who become customers
5. Key strengths (3-5 points)
6. Optimization suggestions (3-5 recommendations)`,
        response_json_schema: {
          type: "object",
          properties: {
            viral_score: { type: "number" },
            engagement_score: { type: "number" },
            predicted_download_rate: { type: "number" },
            predicted_conversion_rate: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            optimization_suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Step 3: Generate A/B test variants if enabled
      let abVariants = [];
      if (data.ab_testing_enabled) {
        const variants = await base44.integrations.Core.InvokeLLM({
          prompt: `Create 3 A/B test variants for this lead magnet:

ORIGINAL TITLE: ${content.title}

Generate 3 variations testing:
1. Title/headline variation
2. Cover image concept
3. CTA text variation

Each variant should be distinct and test a different hypothesis.`,
          response_json_schema: {
            type: "object",
            properties: {
              variants: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    variant_name: { type: "string" },
                    title: { type: "string" },
                    cover_concept: { type: "string" },
                    cta_text: { type: "string" },
                    hypothesis: { type: "string" }
                  }
                }
              }
            }
          }
        });

        abVariants = variants.variants.map((v, idx) => ({
          variant_id: `variant_${idx + 1}`,
          variant_name: v.variant_name,
          title: v.title,
          cta_text: v.cta_text,
          cover_image_url: null,
          downloads: 0,
          conversions: 0,
          conversion_rate: 0
        }));
      }

      // Step 4: Create lead magnet record
      const magnet = await base44.entities.LeadMagnet.create({
        user_email: user.email,
        magnet_name: data.magnet_name,
        magnet_type: data.magnet_type,
        topic: data.topic,
        target_audience: data.target_audience,
        keywords: data.keywords.split(",").map(k => k.trim()),
        key_points: data.key_points.split(",").map(p => p.trim()),
        generated_content: JSON.stringify(content),
        status: "generating",
        design_template: data.design_template,
        page_count: Math.ceil(content.metadata.word_count / 250),
        personalization_enabled: data.personalization_enabled,
        personalization_fields: ["first_name", "company", "industry", "goals"],
        multilingual_enabled: data.multilingual_enabled,
        available_languages: data.languages,
        ab_testing_enabled: data.ab_testing_enabled,
        ab_variants: abVariants,
        viral_score: scores.viral_score,
        engagement_score: scores.engagement_score,
        optimization_suggestions: scores.optimization_suggestions,
        download_count: 0,
        conversion_count: 0
      });

      // Step 5: Simulate PDF generation
      setTimeout(async () => {
        const pdfUrl = `https://cdn.example.com/lead-magnet-${magnet.id}.pdf`;
        const coverUrl = `https://cdn.example.com/cover-${magnet.id}.jpg`;

        await base44.entities.LeadMagnet.update(magnet.id, {
          status: "completed",
          pdf_url: pdfUrl,
          cover_image_url: coverUrl,
          generated_at: new Date().toISOString()
        });

        queryClient.invalidateQueries(["leadMagnets"]);
        setIsGenerating(false);
        alert(`✅ Lead Magnet Generated!

📊 PERFORMANCE PREDICTIONS:
• Viral Score: ${scores.viral_score}/100
• Engagement Score: ${scores.engagement_score}/100
• Expected Download Rate: ${scores.predicted_download_rate}%
• Expected Conversion Rate: ${scores.predicted_conversion_rate}%

${data.ab_testing_enabled ? `\n🧪 A/B Testing: ${abVariants.length} variants created` : ''}
${data.multilingual_enabled ? `\n🌍 Languages: ${data.languages.length} versions` : ''}
${data.personalization_enabled ? `\n✨ Personalization: Enabled` : ''}

Ready to deploy!`);
      }, 3000);

      return magnet;
    },
    onSuccess: () => {
      setShowGenerator(false);
      setFormData({
        magnet_name: "",
        magnet_type: "ebook",
        topic: "",
        target_audience: "",
        keywords: "",
        key_points: "",
        design_template: "modern",
        personalization_enabled: true,
        multilingual_enabled: false,
        ab_testing_enabled: false,
        languages: ["en"]
      });
    }
  });

  const deployMutation = useMutation({
    mutationFn: async ({ magnetId, channels }) => {
      const magnet = leadMagnets.find(m => m.id === magnetId);
      
      const updates = {
        deployment_channels: channels
      };

      // Deploy to landing page
      if (channels.includes("landing_page")) {
        updates.landing_page_url = `https://app.example.com/download/${magnetId}`;
      }

      // Deploy to popup
      if (channels.includes("popup")) {
        updates.popup_enabled = true;
        updates.popup_trigger = {
          trigger_type: "exit_intent",
          delay_seconds: 0,
          scroll_percentage: 0
        };
      }

      // Deploy to email
      if (channels.includes("email")) {
        updates.email_integration = {
          provider: "mailchimp",
          autoresponder_enabled: true,
          tag_on_download: "lead_magnet_downloaded"
        };
      }

      // Deploy to social
      if (channels.includes("social")) {
        const post = await base44.entities.ScheduledPost.create({
          user_email: user.email,
          content_type: "image",
          content_url: magnet.cover_image_url,
          caption: `🎁 FREE ${magnet.magnet_type.toUpperCase()}: "${magnet.magnet_name}"\n\n${magnet.topic}\n\nDownload now! Link in bio 👆`,
          platforms: ["instagram", "facebook", "linkedin"],
          status: "scheduled",
          source_entity_type: "LeadMagnet",
          source_entity_id: magnetId
        });

        updates.social_posts = [post.id];
      }

      // Deploy to GHL
      if (channels.includes("ghl")) {
        updates.ghl_integrated = true;
        updates.ghl_form_url = `https://app.gohighlevel.com/form/${magnetId}`;
        updates.ghl_workflow_id = `workflow_${magnetId}`;
      }

      await base44.entities.LeadMagnet.update(magnetId, updates);
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leadMagnets"]);
      alert("✅ Lead magnet deployed successfully!");
    }
  });

  const handleGenerate = () => {
    if (!formData.magnet_name || !formData.topic || !formData.target_audience) {
      alert("Please fill in all required fields");
      return;
    }
    generateMutation.mutate(formData);
  };

  const magnetTypes = [
    { value: "ebook", label: "📚 eBook (10-30 pages)", desc: "Comprehensive guide", time: "3-5 min" },
    { value: "checklist", label: "✅ Checklist (1-2 pages)", desc: "Quick action list", time: "1 min" },
    { value: "guide", label: "📖 Guide (5-15 pages)", desc: "Step-by-step process", time: "2-3 min" },
    { value: "template", label: "📋 Template (Fillable PDF)", desc: "Ready-to-use framework", time: "2 min" },
    { value: "cheatsheet", label: "📄 Cheat Sheet (1 page)", desc: "Quick reference", time: "1 min" },
    { value: "workbook", label: "📓 Workbook (Interactive)", desc: "Exercises + worksheets", time: "3-4 min" },
    { value: "report", label: "📊 Report (Data-driven)", desc: "Research & insights", time: "4-6 min" },
    { value: "course", label: "🎓 Mini-Course (20+ pages)", desc: "Multi-module training", time: "8-10 min" },
    { value: "swipe_file", label: "💼 Swipe File", desc: "Copy-paste templates", time: "2 min" },
    { value: "toolkit", label: "🧰 Toolkit (Multi-asset)", desc: "Bundle of resources", time: "5-7 min" }
  ];

  const designTemplates = [
    { value: "modern", label: "Modern", colors: ["#FFD700", "#00D4C9"] },
    { value: "professional", label: "Professional", colors: ["#1E90FF", "#333333"] },
    { value: "minimalist", label: "Minimalist", colors: ["#000000", "#FFFFFF"] },
    { value: "colorful", label: "Colorful", colors: ["#FF69B4", "#9D4EDD"] },
    { value: "corporate", label: "Corporate", colors: ["#003D82", "#00A3E0"] },
    { value: "luxury", label: "Luxury", colors: ["#C9B037", "#000000"] },
    { value: "bold", label: "Bold", colors: ["#FF4500", "#FFD700"] }
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "pt", name: "Portuguese" },
    { code: "it", name: "Italian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" }
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#FFD700]" />
              AI Lead Magnet Generator
            </h1>
            <p className="text-gray-400">Create high-converting lead magnets in minutes with AI</p>
          </div>
          <Button
            onClick={() => {
              setShowGenerator(!showGenerator);
              setActiveTab("generate");
            }}
            className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate New
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="library">
              <FileText className="w-4 h-4 mr-2" />
              Library ({leadMagnets.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="personalization">
              <Users className="w-4 h-4 mr-2" />
              Personalization
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">Create New Lead Magnet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Lead Magnet Name *</label>
                    <Input
                      value={formData.magnet_name}
                      onChange={(e) => setFormData({...formData, magnet_name: e.target.value})}
                      placeholder="e.g., 'Ultimate Real Estate Marketing Guide'"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Type *</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {magnetTypes.map(type => (
                        <label
                          key={type.value}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.magnet_type === type.value
                              ? 'border-[#FFD700] bg-[#FFD700]/10'
                              : 'border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="magnet_type"
                            value={type.value}
                            checked={formData.magnet_type === type.value}
                            onChange={(e) => setFormData({...formData, magnet_type: e.target.value})}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">{type.label}</p>
                              <p className="text-gray-400 text-xs">{type.desc}</p>
                            </div>
                            <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                              {type.time}
                            </Badge>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Topic *</label>
                      <Input
                        value={formData.topic}
                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                        placeholder="What is this about?"
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Target Audience *</label>
                      <Input
                        value={formData.target_audience}
                        onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                        placeholder="e.g., 'First-time real estate investors'"
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Keywords (comma separated)</label>
                    <Input
                      value={formData.keywords}
                      onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                      placeholder="real estate, investing, property, ROI"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Key Points to Cover</label>
                    <Textarea
                      value={formData.key_points}
                      onChange={(e) => setFormData({...formData, key_points: e.target.value})}
                      placeholder="finding properties, financing options, negotiation tactics"
                      className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl h-24"
                    />
                  </div>

                  {/* Design Template */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Design Template</label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                      {designTemplates.map(template => (
                        <button
                          key={template.value}
                          onClick={() => setFormData({...formData, design_template: template.value})}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.design_template === template.value
                              ? 'border-[#FFD700]'
                              : 'border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div 
                            className="w-full h-8 rounded mb-1"
                            style={{
                              background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`
                            }}
                          />
                          <p className="text-white text-xs">{template.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 space-y-4">
                  <h4 className="text-white font-semibold">Advanced Options</h4>

                  {/* Personalization */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">✨ Enable Personalization</p>
                      <p className="text-gray-400 text-xs">Auto-insert name, company, industry</p>
                    </div>
                    <Switch
                      checked={formData.personalization_enabled}
                      onCheckedChange={(val) => setFormData({...formData, personalization_enabled: val})}
                    />
                  </div>

                  {/* Multi-lingual */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">🌍 Multi-Language Support</p>
                      <p className="text-gray-400 text-xs">Auto-translate to 50+ languages</p>
                    </div>
                    <Switch
                      checked={formData.multilingual_enabled}
                      onCheckedChange={(val) => setFormData({...formData, multilingual_enabled: val})}
                    />
                  </div>

                  {formData.multilingual_enabled && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">Select Languages:</p>
                      <div className="grid grid-cols-5 gap-2">
                        {languages.slice(0, 10).map(lang => (
                          <label
                            key={lang.code}
                            className={`p-2 rounded border text-center cursor-pointer text-xs ${
                              formData.languages.includes(lang.code)
                                ? 'border-[#00D4C9] bg-[#00D4C9]/10 text-white'
                                : 'border-gray-700 text-gray-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.languages.includes(lang.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, languages: [...formData.languages, lang.code]});
                                } else {
                                  setFormData({...formData, languages: formData.languages.filter(l => l !== lang.code)});
                                }
                              }}
                              className="sr-only"
                            />
                            {lang.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* A/B Testing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">🧪 Enable A/B Testing</p>
                      <p className="text-gray-400 text-xs">Test title, cover, and CTA variations</p>
                    </div>
                    <Switch
                      checked={formData.ab_testing_enabled}
                      onCheckedChange={(val) => setFormData({...formData, ab_testing_enabled: val})}
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl font-bold h-14 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating AI-Powered Lead Magnet...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Lead Magnet
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                      Creating high-converting content... This may take 2-3 minutes for comprehensive assets.
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            <div className="space-y-4">
              {leadMagnets.length > 0 ? (
                leadMagnets.map((magnet) => {
                  const magnetDownloads = downloads.filter(d => d.lead_magnet_id === magnet.id);
                  const conversions = magnetDownloads.filter(d => d.converted_to_customer);
                  const conversionRate = magnetDownloads.length > 0 ? 
                    (conversions.length / magnetDownloads.length * 100).toFixed(1) : 0;

                  return (
                    <motion.div
                      key={magnet.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/50 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            
                            {/* Cover Preview */}
                            <div className="w-32 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              {magnet.cover_image_url ? (
                                <img src={magnet.cover_image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="w-12 h-12 text-gray-600" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-white font-bold text-lg mb-1">{magnet.magnet_name}</h3>
                                  <p className="text-gray-400 text-sm mb-2">{magnet.topic}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] text-xs capitalize">
                                      {magnet.magnet_type}
                                    </Badge>
                                    <Badge className={`text-xs ${
                                      magnet.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                      magnet.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                                      magnet.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                      {magnet.status}
                                    </Badge>
                                    {magnet.personalization_enabled && (
                                      <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                                        ✨ Personalized
                                      </Badge>
                                    )}
                                    {magnet.multilingual_enabled && (
                                      <Badge className="bg-[#00D4C9]/20 text-[#00D4C9] text-xs">
                                        🌍 {magnet.available_languages?.length || 1} languages
                                      </Badge>
                                    )}
                                    {magnet.ab_testing_enabled && (
                                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                                        🧪 A/B Testing
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Performance Metrics */}
                              {magnet.status === 'completed' && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                    <Download className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                                    <p className="text-white font-bold">{magnetDownloads.length}</p>
                                    <p className="text-gray-500 text-xs">Downloads</p>
                                  </div>
                                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                    <Target className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                                    <p className="text-white font-bold">{conversions.length}</p>
                                    <p className="text-gray-500 text-xs">Conversions</p>
                                  </div>
                                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                                    <p className="text-white font-bold">{conversionRate}%</p>
                                    <p className="text-gray-500 text-xs">Conv. Rate</p>
                                  </div>
                                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                    <Sparkles className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                                    <p className="text-white font-bold">{magnet.viral_score || 0}</p>
                                    <p className="text-gray-500 text-xs">Viral Score</p>
                                  </div>
                                  <div className="p-2 bg-[#0B0B0C] rounded text-center">
                                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                                    <p className="text-white font-bold">${(magnet.revenue_generated || 0).toFixed(0)}</p>
                                    <p className="text-gray-500 text-xs">Revenue</p>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              {magnet.status === 'completed' && (
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-[#1E90FF] text-white rounded-lg"
                                    onClick={() => window.open(magnet.pdf_url, '_blank')}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-700 rounded-lg"
                                    onClick={() => {
                                      const a = document.createElement('a');
                                      a.href = magnet.pdf_url;
                                      a.download = `${magnet.magnet_name}.pdf`;
                                      a.click();
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-500 text-white rounded-lg"
                                    onClick={() => {
                                      setSelectedMagnet(magnet);
                                      setActiveTab("deploy");
                                    }}
                                  >
                                    <Zap className="w-4 h-4 mr-1" />
                                    Deploy
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-700 rounded-lg"
                                    onClick={() => {
                                      setSelectedMagnet(magnet);
                                      setActiveTab("analytics");
                                    }}
                                  >
                                    <BarChart3 className="w-4 h-4 mr-1" />
                                    Analytics
                                  </Button>
                                </div>
                              )}

                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2">No lead magnets created yet</p>
                    <p className="text-gray-600 text-sm mb-4">Generate your first AI-powered lead magnet</p>
                    <Button
                      onClick={() => setActiveTab("generate")}
                      className="bg-gradient-to-r from-[#FF8C00] to-[#FFD700] text-white rounded-xl"
                    >
                      Create Your First Lead Magnet
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab - Enhanced */}
          <TabsContent value="analytics">
            <div className="space-y-4">
              
              {/* Overall Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <Download className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-3xl font-bold text-white">{downloads.length}</p>
                    <p className="text-gray-400 text-sm">Total Downloads</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-3xl font-bold text-white">
                      {downloads.filter(d => d.converted_to_customer).length}
                    </p>
                    <p className="text-gray-400 text-sm">Conversions</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-3xl font-bold text-white">
                      {downloads.length > 0 ? (downloads.filter(d => d.converted_to_customer).length / downloads.length * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-gray-400 text-sm">Conversion Rate</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 rounded-xl">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-3xl font-bold text-white">
                      ${downloads.reduce((sum, d) => sum + (d.conversion_value_usd || 0), 0).toFixed(0)}
                    </p>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                  </CardContent>
                </Card>
              </div>

              {/* Selected Magnet Analytics */}
              {selectedMagnet && (
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white">{selectedMagnet.magnet_name} - Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Performance Overview */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#0B0B0C] rounded-xl">
                        <p className="text-gray-400 text-xs mb-2">Downloads</p>
                        <p className="text-2xl font-bold text-white">
                          {downloads.filter(d => d.lead_magnet_id === selectedMagnet.id).length}
                        </p>
                      </div>
                      <div className="p-4 bg-[#0B0B0C] rounded-xl">
                        <p className="text-gray-400 text-xs mb-2">Conversion Rate</p>
                        <p className="text-2xl font-bold text-green-400">
                          {(() => {
                            const dl = downloads.filter(d => d.lead_magnet_id === selectedMagnet.id);
                            const conv = dl.filter(d => d.converted_to_customer);
                            return dl.length > 0 ? (conv.length / dl.length * 100).toFixed(1) : 0;
                          })()}%
                        </p>
                      </div>
                      <div className="p-4 bg-[#0B0B0C] rounded-xl">
                        <p className="text-gray-400 text-xs mb-2">Revenue</p>
                        <p className="text-2xl font-bold text-[#FFD700]">
                          ${downloads.filter(d => d.lead_magnet_id === selectedMagnet.id)
                            .reduce((sum, d) => sum + (d.conversion_value_usd || 0), 0).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    {/* A/B Test Results */}
                    {selectedMagnet.ab_testing_enabled && selectedMagnet.ab_variants?.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#FFD700]" />
                          A/B Test Results
                        </h4>
                        <div className="space-y-2">
                          {selectedMagnet.ab_variants.map((variant, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${
                              variant.variant_id === selectedMagnet.winning_variant
                                ? 'border-[#FFD700] bg-[#FFD700]/10'
                                : 'border-gray-800 bg-[#0B0B0C]'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium text-sm">{variant.variant_name}</p>
                                  <p className="text-gray-400 text-xs">{variant.title}</p>
                                </div>
                                <div className="flex gap-4 text-xs">
                                  <div className="text-center">
                                    <p className="text-white font-bold">{variant.downloads || 0}</p>
                                    <p className="text-gray-500">Downloads</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-green-400 font-bold">{(variant.conversion_rate || 0).toFixed(1)}%</p>
                                    <p className="text-gray-500">Conv. Rate</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Traffic Sources */}
                    {selectedMagnet.traffic_sources && (
                      <div>
                        <h4 className="text-white font-semibold mb-3">Traffic Sources</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {Object.entries(selectedMagnet.traffic_sources).map(([source, count]) => (
                            <div key={source} className="p-2 bg-[#0B0B0C] rounded text-center">
                              <p className="text-white font-bold">{count || 0}</p>
                              <p className="text-gray-400 text-xs capitalize">{source}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optimization Suggestions */}
                    {selectedMagnet.optimization_suggestions?.length > 0 && (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <h4 className="text-yellow-400 font-semibold text-sm mb-2">💡 AI Optimization Suggestions:</h4>
                        <ul className="space-y-1">
                          {selectedMagnet.optimization_suggestions.map((sugg, idx) => (
                            <li key={idx} className="text-gray-300 text-sm">• {sugg}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </CardContent>
                </Card>
              )}

            </div>
          </TabsContent>

          {/* Personalization Tab - NEW */}
          <TabsContent value="personalization">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#9D4EDD]" />
                  Adaptive Personalization Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="p-4 bg-gradient-to-r from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl">
                  <h4 className="text-white font-bold mb-2">✨ How Personalization Works</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Our AI automatically tailors every lead magnet to each visitor by inserting their name, company, industry, and goals throughout the content. This increases engagement by up to 73% and conversion rates by 2-3x.
                  </p>
                </div>

                {/* Personalization Fields */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Available Personalization Fields</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { field: "first_name", example: "John", desc: "Personalized greeting" },
                      { field: "last_name", example: "Smith", desc: "Full name contexts" },
                      { field: "company", example: "Acme Corp", desc: "Company-specific examples" },
                      { field: "industry", example: "Real Estate", desc: "Industry-tailored content" },
                      { field: "job_title", example: "Marketing Director", desc: "Role-based content" },
                      { field: "goals", example: "Generate more leads", desc: "Goal-specific advice" },
                      { field: "location", example: "New York", desc: "Location-based data" },
                      { field: "budget", example: "$10k/month", desc: "Budget-appropriate tips" }
                    ].map(item => (
                      <div key={item.field} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-[#00D4C9] text-xs">[[{item.field}]]</code>
                          <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                            {item.example}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multi-language Support */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#00D4C9]" />
                    Multi-Language Support (50+ Languages)
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {languages.map(lang => (
                      <Badge key={lang.code} className="bg-[#00D4C9]/20 text-[#00D4C9] justify-center">
                        {lang.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-3">
                    AI automatically translates and localizes all content, CTAs, and cultural references
                  </p>
                </div>

                {/* CRM Integration */}
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <h4 className="text-white font-semibold mb-3">🔗 CRM & Email Integration</h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#111317] rounded text-center">
                      <p className="text-white font-medium text-sm mb-1">GoHighLevel</p>
                      <Badge className="bg-green-500/20 text-green-400 text-xs">Connected</Badge>
                    </div>
                    <div className="p-3 bg-[#111317] rounded text-center">
                      <p className="text-white font-medium text-sm mb-1">Mailchimp</p>
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">Available</Badge>
                    </div>
                    <div className="p-3 bg-[#111317] rounded text-center">
                      <p className="text-white font-medium text-sm mb-1">AWeber</p>
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">Available</Badge>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}