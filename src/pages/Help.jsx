import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Video, 
  Sparkles, 
  Calendar, 
  Zap,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      color: "from-[#FFD700] to-[#FFA500]",
      articles: [
        { title: "Complete Setup Wizard", description: "Step-by-step first-time setup", url: "/Dashboard" },
        { title: "Connect Your Accounts", description: "Link social media & integrations", url: "/Integrations" },
        { title: "Create Your First Video", description: "Quick start guide", url: "/VideoStudio" },
        { title: "Understanding Your Dashboard", description: "Navigate the platform", url: "/Dashboard" }
      ]
    },
    {
      title: "Video Creation",
      icon: Video,
      color: "from-[#FF4433] to-[#FF8C00]",
      articles: [
        { title: "Video Templates Guide", description: "Use pre-built templates", url: "/Templates" },
        { title: "AI Script Generation", description: "Let AI write your scripts", url: "/VideoStudio" },
        { title: "Adding Voice & Music", description: "Audio enhancement tips", url: "/VideoStudio" },
        { title: "Rendering & Exporting", description: "Export in different formats", url: "/VideoStudio" }
      ]
    },
    {
      title: "AI Features",
      icon: Sparkles,
      color: "from-[#00D4C9] to-[#1E90FF]",
      articles: [
        { title: "AI Copilot Commands", description: "What you can ask AI to do", url: "/Dashboard" },
        { title: "Content Recommendations", description: "Get AI-powered insights", url: "/AIInsights" },
        { title: "Auto-Generation Features", description: "Automate content creation", url: "/Automation" },
        { title: "Training Your Creator DNA", description: "Personalize AI outputs", url: "/Personalization" }
      ]
    },
    {
      title: "Social Media",
      icon: Calendar,
      color: "from-[#FF6B9D] to-[#C44569]",
      articles: [
        { title: "Scheduling Posts", description: "Plan your content calendar", url: "/SocialMedia" },
        { title: "Multi-Platform Publishing", description: "Post to all platforms at once", url: "/SocialMedia" },
        { title: "Best Posting Times", description: "When your audience is active", url: "/AIInsights" },
        { title: "Hashtag Strategies", description: "Optimize for discovery", url: "/YouTubeSEO" }
      ]
    },
    {
      title: "Automation",
      icon: Zap,
      color: "from-[#FFD700] to-[#00D4C9]",
      articles: [
        { title: "Creating Automation Rules", description: "Set up triggers & actions", url: "/Automation" },
        { title: "Webhook Integration", description: "Connect external tools", url: "/Webhooks" },
        { title: "Email Sequences", description: "Automate email marketing", url: "/Integrations" },
        { title: "Workflow Templates", description: "Pre-built automation flows", url: "/Marketplace" }
      ]
    },
    {
      title: "Analytics & Optimization",
      icon: HelpCircle,
      color: "from-[#00FF88] to-[#00CC6A]",
      articles: [
        { title: "Understanding Analytics", description: "Read your performance data", url: "/Analytics" },
        { title: "A/B Testing Content", description: "Test what works best", url: "/AdvancedAnalytics" },
        { title: "SEO Optimization", description: "Rank higher on platforms", url: "/YouTubeSEO" },
        { title: "Revenue Tracking", description: "Monitor your earnings", url: "/RevenueHub" }
      ]
    }
  ];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.articles.length > 0);

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mx-auto"
          >
            <HelpCircle className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white heading-font">How Can We Help?</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Search our knowledge base or browse categories below
          </p>
        </div>

        {/* Search */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="pl-12 bg-[#0B0B0C] border-gray-700 text-white h-14 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/30 transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[#00D4C9]" />
              <h3 className="text-white font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-400 text-sm">Chat with AI support</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/30 transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="w-12 h-12 mx-auto mb-3 text-[#FFD700]" />
              <h3 className="text-white font-semibold mb-2">Email Support</h3>
              <p className="text-gray-400 text-sm">support@aifreedomduane.com</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/30 transition-all cursor-pointer">
            <CardContent className="p-6 text-center">
              <ExternalLink className="w-12 h-12 mx-auto mb-3 text-[#00FF88]" />
              <h3 className="text-white font-semibold mb-2">Video Tutorials</h3>
              <p className="text-gray-400 text-sm">Watch step-by-step guides</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {(searchQuery ? filteredCategories : categories).map((category, idx) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white">{category.title}</span>
                      <Badge className="ml-auto bg-gray-700 text-gray-300">
                        {category.articles.length} articles
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {category.articles.map((article, articleIdx) => (
                        <Link key={articleIdx} to={createPageUrl(article.url.replace("/", ""))}>
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="p-4 rounded-xl bg-[#0B0B0C] hover:bg-[#151515] transition-all cursor-pointer group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-[#FFD700] transition-colors">
                                  {article.title}
                                </h4>
                                <p className="text-gray-400 text-xs">
                                  {article.description}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FFD700] transition-colors flex-shrink-0" />
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Still Need Help? */}
        <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#00D4C9]/10 border-[#FFD700]/30 rounded-2xl">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Still Need Help?</h3>
            <p className="text-gray-300 mb-6">
              Our support team is here to help you succeed
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl("Dashboard")}>
                <button className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity">
                  <MessageCircle className="w-5 h-5 inline mr-2" />
                  Start Live Chat
                </button>
              </Link>
              <a href="mailto:support@aifreedomduane.com">
                <button className="px-6 py-3 border border-gray-700 text-white font-semibold rounded-xl hover:bg-[#111317] transition-colors">
                  <Mail className="w-5 h-5 inline mr-2" />
                  Email Us
                </button>
              </a>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}