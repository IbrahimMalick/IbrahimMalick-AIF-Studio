import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Download,
  Upload,
  Plus,
  TrendingUp,
  Star,
  Copy,
  CheckCircle2
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

// Pre-built templates to import
const STARTER_TEMPLATES = [
  {
    name: "SaaS Rocket Launch",
    category: "saas",
    type: "full_campaign",
    base_prompt: `Create a cinematic campaign for a SaaS product that:
- Opens with the problem (frustrated user struggling with current solution)
- Reveals the transformation (discovering the SaaS solution)
- Shows the outcome (business thriving with new efficiency)
- Includes social proof (logos of known companies)
- Ends with clear CTA (free trial or demo)

Style: Modern, clean, tech-forward with subtle animations
Music: Uplifting electronic/corporate
Duration: 30-60 seconds per ad`,
    performance_metrics: {
      avg_ctr: 3.2,
      avg_conversion: 12,
      best_for: "Series A-C SaaS companies",
      typical_satisfaction: 9
    }
  },
  {
    name: "Commerce Catalyst",
    category: "ecommerce",
    type: "full_campaign",
    base_prompt: `Design a product-focused campaign that:
- Hero shot of product in lifestyle setting
- Quick feature callouts with motion graphics
- User testimonial or unboxing moment
- Multiple product variants showcase
- Urgency element (limited time/stock)

Style: Vibrant, dynamic, mobile-optimized
Music: Trendy, upbeat, platform-appropriate
Duration: 15-30 seconds for social, 30-60 for YouTube`,
    performance_metrics: {
      avg_roas: 4.2,
      avg_engagement: 8,
      best_for: "$1M-$50M revenue e-commerce brands",
      typical_satisfaction: 8.5
    }
  },
  {
    name: "Authority Builder",
    category: "services",
    type: "full_campaign",
    base_prompt: `Develop an authority-positioning campaign that:
- Establishes credibility (years of experience/credentials)
- Shows transformation stories (before/after client results)
- Demonstrates expertise (process visualization)
- Builds trust (testimonials/case studies)
- Clear next step (consultation/assessment)

Style: Professional, trustworthy, premium feel
Music: Confident, sophisticated orchestral/ambient
Duration: 60-90 seconds for main, 30 second cuts`,
    performance_metrics: {
      avg_lead_quality: 8,
      avg_booking_rate: 18,
      best_for: "Consultants, agencies, B2B services",
      typical_satisfaction: 9.5
    }
  },
  {
    name: "Wellness Journey",
    category: "healthcare",
    type: "full_campaign",
    base_prompt: `Create an empathetic campaign that:
- Acknowledges the pain/struggle (with sensitivity)
- Introduces the solution naturally
- Shows the journey (not just before/after)
- Includes professional credibility
- Provides hope and clear action

Style: Warm, authentic, documentary-feel
Music: Emotional, hopeful progression
Duration: 45-90 seconds`,
    performance_metrics: {
      avg_engagement_time: 78,
      avg_inquiry_rate: 22,
      best_for: "Clinics, wellness brands, health tech",
      compliance: "Healthcare advertising approved"
    }
  },
  {
    name: "Dream Property",
    category: "general",
    type: "full_campaign",
    base_prompt: `Craft a lifestyle-focused campaign that:
- Aerial establishing shot of property/area
- Walk-through highlighting key features
- Lifestyle moments (morning coffee, entertaining)
- Neighborhood amenities showcase
- Agent credibility moment
- Strong CTA (schedule viewing/download guide)

Style: Cinematic, aspirational, golden hour lighting
Music: Luxurious, sophisticated
Duration: 60-90 seconds main, 30-second social cuts`,
    performance_metrics: {
      avg_showing_requests: 15,
      avg_price_point: "$750K+",
      best_for: "Luxury real estate, developments",
      typical_satisfaction: 9
    }
  },
  {
    name: "Knowledge Accelerator",
    category: "general",
    type: "full_campaign",
    base_prompt: `Design a value-focused campaign that:
- Identifies the skill gap or career goal
- Shows instructor credibility
- Previews course content dynamically
- Features student success stories
- Creates urgency (enrollment deadline/bonus)

Style: Engaging, professional, screencasts + talking head
Music: Motivational, building energy
Duration: 45-60 seconds`,
    performance_metrics: {
      avg_enrollment_rate: 7,
      avg_completion: 68,
      best_for: "Online courses, coaching programs",
      typical_satisfaction: 8
    }
  },
  {
    name: "Brand Genesis",
    category: "general",
    type: "full_campaign",
    base_prompt: `Tell a brand story campaign that:
- Founder moment (why this exists)
- Problem they're solving differently
- Product creation/quality process
- Community/movement aspect
- Invitation to join the brand

Style: Authentic, raw, behind-the-scenes feel
Music: Indie, authentic, matches brand personality
Duration: 60-90 seconds hero, 15-30 social cuts`,
    performance_metrics: {
      avg_brand_lift: 34,
      avg_repeat_purchase: 42,
      best_for: "DTC brands, mission-driven companies",
      typical_satisfaction: 9.5
    }
  },
  {
    name: "Enterprise Transformer",
    category: "finance",
    type: "full_campaign",
    base_prompt: `Create an ROI-focused campaign that:
- Opens with industry challenge/statistic
- Visualizes the solution architecture
- Shows integration with existing tools
- Features recognizable client logos
- Includes ROI calculator/metrics
- Ends with demo/whitepaper CTA

Style: Corporate premium, data visualization, clean
Music: Corporate technology, confident
Duration: 60-90 seconds`,
    performance_metrics: {
      avg_mql_rate: 12,
      avg_deal_size: "$50K+",
      best_for: "Enterprise software, B2B platforms",
      typical_satisfaction: 8.5
    }
  }
];

export default function TemplateLibrary() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["campaignTemplates"],
    queryFn: () => base44.entities.CampaignTemplate.list(),
    initialData: []
  });

  const bulkImportMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      for (const template of STARTER_TEMPLATES) {
        try {
          const created = await base44.entities.CampaignTemplate.create(template);
          results.push(created);
        } catch (error) {
          console.error(`Failed to import ${template.name}:`, error);
        }
      }
      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["campaignTemplates"]);
      showToast(`Imported ${data.length} templates successfully!`, "success");
    }
  });

  const copyPromptMutation = useMutation({
    mutationFn: async (template) => {
      await navigator.clipboard.writeText(template.base_prompt);
      return template;
    },
    onSuccess: (template) => {
      showToast(`Copied ${template.name} prompt!`, "success");
    }
  });

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryColors = {
    saas: "from-blue-500 to-cyan-500",
    ecommerce: "from-purple-500 to-pink-500",
    services: "from-green-500 to-emerald-500",
    healthcare: "from-red-500 to-orange-500",
    finance: "from-yellow-500 to-amber-500",
    general: "from-gray-500 to-slate-500"
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-[#FFD700]" />
              Campaign Template Library
            </h1>
            <p className="text-gray-400">
              Industry-proven templates to accelerate campaign creation
            </p>
          </div>

          {templates.length === 0 && (
            <Button
              onClick={() => bulkImportMutation.mutate()}
              disabled={bulkImportMutation.isLoading}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
            >
              <Upload className="w-5 h-5 mr-2" />
              {bulkImportMutation.isLoading ? "Importing..." : "Import Starter Templates"}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <Sparkles className="w-8 h-8 text-[#FFD700] mb-2" />
              <p className="text-3xl font-bold text-white">{templates.length}</p>
              <p className="text-sm text-gray-400">Total Templates</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-[#06D6A0] mb-2" />
              <p className="text-3xl font-bold text-white">
                {templates.reduce((sum, t) => sum + (t.times_used || 0), 0)}
              </p>
              <p className="text-sm text-gray-400">Times Used</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <Star className="w-8 h-8 text-[#FFD700] mb-2" />
              <p className="text-3xl font-bold text-white">
                {templates.length > 0 
                  ? (templates.reduce((sum, t) => sum + (t.avg_satisfaction || 0), 0) / templates.length).toFixed(1)
                  : "0"}
              </p>
              <p className="text-sm text-gray-400">Avg Satisfaction</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-6">
              <CheckCircle2 className="w-8 h-8 text-[#00D4C9] mb-2" />
              <p className="text-3xl font-bold text-white">
                {templates.filter(t => t.ab_test_winner).length}
              </p>
              <p className="text-sm text-gray-400">A/B Winners</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#111317] border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 bg-[#0B0B0C] border-gray-700 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-[#111317] border-gray-800 hover:border-[#FFD700] transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">
                      {template.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`bg-gradient-to-r ${categoryColors[template.category]} text-white`}>
                        {template.category}
                      </Badge>
                      <Badge className="bg-gray-700 text-gray-300">
                        {template.type}
                      </Badge>
                      {template.ab_test_winner && (
                        <Badge className="bg-[#FFD700] text-black">
                          🏆 Winner
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="bg-[#0B0B0C] p-3 rounded-lg border border-gray-800">
                    <p className="text-gray-300 text-sm line-clamp-4">
                      {template.base_prompt}
                    </p>
                  </div>

                  {template.performance_metrics && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-semibold">Performance:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(template.performance_metrics).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="bg-[#0B0B0C] p-2 rounded">
                            <p className="text-gray-500">{key.replace(/_/g, ' ')}</p>
                            <p className="text-white font-semibold">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Used {template.times_used || 0} times</span>
                    {template.avg_satisfaction && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-white font-semibold">
                          {template.avg_satisfaction}/10
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyPromptMutation.mutate(template)}
                      variant="outline"
                      className="flex-1 border-gray-700 text-white hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700]"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card className="bg-[#111317] border-gray-800">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Templates Yet</h3>
              <p className="text-gray-400 mb-6">
                {templates.length === 0 
                  ? "Import the starter templates to get started!"
                  : "No templates match your search criteria"
                }
              </p>
              {templates.length === 0 && (
                <Button
                  onClick={() => bulkImportMutation.mutate()}
                  disabled={bulkImportMutation.isLoading}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Import Starter Templates
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* How to Use */}
        <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border-[#FFD700]/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              💡 How to Use Templates
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[#FFD700] font-semibold mb-2">1. Client Onboarding</p>
                <p className="text-gray-300">
                  System auto-selects matching template based on client industry
                </p>
              </div>
              <div>
                <p className="text-[#FFD700] font-semibold mb-2">2. Customize</p>
                <p className="text-gray-300">
                  Add client brand details and specific requirements
                </p>
              </div>
              <div>
                <p className="text-[#FFD700] font-semibold mb-2">3. Process</p>
                <p className="text-gray-300">
                  LLM uses template as base for campaign generation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}