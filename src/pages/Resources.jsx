import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Download,
  Mail,
  CheckCircle2,
  Rocket,
  Sparkles,
  Video,
  Users,
  Zap,
  Heart,
  Target
} from "lucide-react";

export default function Resources() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendGuidesToEmail = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setSending(true);

    try {
      // Send Manifesto
      await base44.integrations.Core.SendEmail({
        from_name: "AIFreedomDuane Studio",
        to: email,
        subject: "📜 The AIFreedomDuane Manifesto - Your Path to Creative Freedom",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #FF4433 0%, #FF8C00 40%, #A89C94 70%, #1E90FF 100%); border-radius: 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
              <h1 style="color: #FF4433; font-size: 32px; margin-bottom: 10px;">🚀 The AIFreedomDuane Manifesto</h1>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">A Declaration of Creative Independence</p>
              
              <div style="background: linear-gradient(135deg, #FF4433, #1E90FF); height: 4px; border-radius: 2px; margin-bottom: 30px;"></div>
              
              <h2 style="color: #1E90FF; font-size: 24px; margin-top: 30px;">WE BELIEVE IN FREEDOM.</h2>
              <p style="color: #333; line-height: 1.8; font-size: 16px;">
                <strong>Freedom to create.</strong><br>
                <strong>Freedom to build.</strong><br>
                <strong>Freedom to dream without limits.</strong>
              </p>

              <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #FF8C00;">
                <h3 style="color: #FF4433; margin-top: 0;">OUR 10 PRINCIPLES:</h3>
                <ol style="color: #333; line-height: 2;">
                  <li><strong>All-In-One Is The Only Way</strong> - One platform. One login. One vision.</li>
                  <li><strong>AI Should Serve You, Not Replace You</strong> - AI is your co-pilot, not your replacement.</li>
                  <li><strong>Expensive ≠ Better</strong> - Smart pricing. Fair pricing. Transparent pricing.</li>
                  <li><strong>Complexity Is The Enemy Of Creation</strong> - Simplicity is sophistication.</li>
                  <li><strong>Your Data, Your Empire</strong> - Your content is yours. Your data is yours.</li>
                  <li><strong>Mentorship. Systems. Freedom.</strong> - Learn, build, create on your terms.</li>
                  <li><strong>Collaboration > Competition</strong> - Rising tides lift all boats.</li>
                  <li><strong>Speed Is A Feature</strong> - Your ideas deserve velocity.</li>
                  <li><strong>Optimization Is Obsession</strong> - Efficiency = freedom.</li>
                  <li><strong>Build In Public. Grow Together.</strong> - Success is a direction, not a destination.</li>
                </ol>
              </div>

              <h3 style="color: #FF4433; font-size: 20px; margin-top: 30px;">🎯 THE PROMISE:</h3>
              <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p style="color: #2e7d32; margin: 0; line-height: 1.8;"><strong>We will ALWAYS:</strong></p>
                <ul style="color: #2e7d32; line-height: 1.8;">
                  <li>✅ Put creators first</li>
                  <li>✅ Price fairly and transparently</li>
                  <li>✅ Ship updates constantly</li>
                  <li>✅ Listen to feedback</li>
                  <li>✅ Help you win</li>
                </ul>
              </div>

              <h3 style="color: #1E90FF; font-size: 20px; margin-top: 30px;">🌍 OUR VISION:</h3>
              <p style="color: #333; line-height: 1.8;">
                A world where every creator has the tools, knowledge, and freedom to build the life they want. 
                Where AI amplifies human potential instead of replacing it. Where content creation isn't limited 
                by budget, technical skills, or time.
              </p>

              <div style="background: linear-gradient(135deg, #FF4433, #1E90FF); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                <h3 style="color: white; margin: 0 0 10px 0; font-size: 24px;">Ready to Begin?</h3>
                <p style="color: white; margin: 0 0 20px 0;">Join thousands of creators who've chosen freedom.</p>
                <a href="https://yourapp.com/dashboard" style="display: inline-block; background: white; color: #FF4433; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Start Creating Now →
                </a>
              </div>

              <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Mentorship • Systems • Freedom<br>
                  Made with ❤️ by AIFreedomDuane Studio
                </p>
              </div>
            </div>
          </div>
        `
      });

      // Send Quick Start Guide
      await base44.integrations.Core.SendEmail({
        from_name: "AIFreedomDuane Studio",
        to: email,
        subject: "📚 Your Complete Quick Start Guide - Master the Platform in 30 Minutes",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0B0B0C;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
              <h1 style="color: #FF4433; font-size: 32px; margin-bottom: 10px;">📚 Quick Start Guide</h1>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Master AIFreedomDuane Studio in 30 Minutes</p>
              
              <div style="background: linear-gradient(135deg, #FF4433, #1E90FF); height: 4px; border-radius: 2px; margin-bottom: 30px;"></div>

              <h2 style="color: #FF4433; font-size: 24px; margin-top: 30px;">🎬 STEP 1: Create Your First Video (5 min)</h2>
              <div style="background: #fff5f5; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #FF4433;">
                <p style="color: #333; line-height: 1.8; margin: 0 0 15px 0;"><strong>What You'll Learn:</strong> Transform JSON scripts into professional videos</p>
                <ol style="color: #333; line-height: 1.8; padding-left: 20px;">
                  <li>Navigate to <strong>Video Studio</strong></li>
                  <li>Choose a template or start from scratch</li>
                  <li>Write your JSON script (scenes, text, voiceover)</li>
                  <li>Click "Render Video"</li>
                  <li>Download your MP4 in minutes</li>
                </ol>
                <p style="color: #FF4433; margin: 15px 0 0 0;"><strong>💡 Pro Tip:</strong> Use templates for faster results. Customize later!</p>
              </div>

              <h2 style="color: #FF8C00; font-size: 24px; margin-top: 30px;">🎨 STEP 2: Generate AI Art (2 min)</h2>
              <div style="background: #fff8f0; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #FF8C00;">
                <p style="color: #333; line-height: 1.8; margin: 0 0 15px 0;"><strong>What You'll Learn:</strong> Create stunning visuals with text prompts</p>
                <ol style="color: #333; line-height: 1.8; padding-left: 20px;">
                  <li>Go to <strong>AI Art Lab</strong></li>
                  <li>Enter your prompt: "futuristic cityscape at sunset"</li>
                  <li>Choose style: Photorealistic, Digital Art, Anime, etc.</li>
                  <li>Select dimensions: Square, Portrait, Landscape</li>
                  <li>Click "Generate" and watch the magic happen</li>
                </ol>
                <p style="color: #FF8C00; margin: 15px 0 0 0;"><strong>💡 Pro Tip:</strong> Be specific! "Red sports car in Tokyo at night, neon lights" > "car"</p>
              </div>

              <h2 style="color: #1E90FF; font-size: 24px; margin-top: 30px;">📄 STEP 3: Analyze Documents (3 min)</h2>
              <div style="background: #f0f8ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #1E90FF;">
                <p style="color: #333; line-height: 1.8; margin: 0 0 15px 0;"><strong>What You'll Learn:</strong> Extract insights from PDFs with AI</p>
                <ol style="color: #333; line-height: 1.8; padding-left: 20px;">
                  <li>Open <strong>Research Hub</strong></li>
                  <li>Upload any PDF (research paper, report, ebook)</li>
                  <li>AI generates summary + key points automatically</li>
                  <li>Ask questions: "What are the main findings?"</li>
                  <li>Get instant AI-powered answers</li>
                </ol>
                <p style="color: #1E90FF; margin: 15px 0 0 0;"><strong>💡 Pro Tip:</strong> Great for research, competitor analysis, or learning!</p>
              </div>

              <h2 style="color: #9C27B0; font-size: 24px; margin-top: 30px;">📱 STEP 4: Connect Social Media (5 min)</h2>
              <div style="background: #f3e5f5; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #9C27B0;">
                <p style="color: #333; line-height: 1.8; margin: 0 0 15px 0;"><strong>What You'll Learn:</strong> Auto-post to Instagram, Facebook, YouTube & more</p>
                <ol style="color: #333; line-height: 1.8; padding-left: 20px;">
                  <li>Visit <strong>Social Media Hub</strong></li>
                  <li>Click "Connect" on Instagram, Facebook, YouTube, etc.</li>
                  <li>Authorize each platform (OAuth)</li>
                  <li>Create a post with media + caption</li>
                  <li>Select platforms & click "Post Now" or schedule</li>
                </ol>
                <p style="color: #9C27B0; margin: 15px 0 0 0;"><strong>💡 Pro Tip:</strong> Post to all platforms at once to save time!</p>
              </div>

              <h2 style="color: #4CAF50; font-size: 24px; margin-top: 30px;">⚡ STEP 5: Set Up Automation (10 min)</h2>
              <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                <p style="color: #333; line-height: 1.8; margin: 0 0 15px 0;"><strong>What You'll Learn:</strong> Automate your entire content workflow</p>
                <ol style="color: #333; line-height: 1.8; padding-left: 20px;">
                  <li>Go to <strong>Automation</strong> page</li>
                  <li>Click "Create Rule"</li>
                  <li>Set trigger: "When video completes rendering"</li>
                  <li>Add action: "Post to Instagram + Facebook"</li>
                  <li>Save and activate</li>
                </ol>
                <p style="color: #4CAF50; margin: 15px 0 0 0;"><strong>💡 Pro Tip:</strong> Chain multiple actions! Video done → Post to social → Send webhook → Email team</p>
              </div>

              <div style="background: linear-gradient(135deg, #FF4433, #1E90FF); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
                <h3 style="color: white; margin: 0 0 10px 0; font-size: 24px;">🏆 Congratulations!</h3>
                <p style="color: white; margin: 0 0 20px 0; line-height: 1.6;">
                  You've mastered the platform! You can now:<br>
                  ✅ Create professional videos<br>
                  ✅ Generate AI art<br>
                  ✅ Analyze documents<br>
                  ✅ Auto-post to social media<br>
                  ✅ Automate workflows
                </p>
                <a href="https://yourapp.com/dashboard" style="display: inline-block; background: white; color: #FF4433; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Start Creating →
                </a>
              </div>

              <h2 style="color: #333; font-size: 20px; margin-top: 40px; text-align: center;">📖 Additional Resources</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
                  <strong style="color: #FF4433;">📹 Video Tutorials</strong>
                  <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Watch step-by-step guides</p>
                </div>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
                  <strong style="color: #FF8C00;">💬 Community</strong>
                  <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Ask questions, get help</p>
                </div>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
                  <strong style="color: #1E90FF;">📚 Templates</strong>
                  <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Pre-made video scripts</p>
                </div>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center;">
                  <strong style="color: #9C27B0;">🔧 API Docs</strong>
                  <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">For developers</p>
                </div>
              </div>

              <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Need help? Reply to this email anytime!<br>
                  Mentorship • Systems • Freedom<br>
                  Made with ❤️ by AIFreedomDuane Studio
                </p>
              </div>
            </div>
          </div>
        `
      });

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmail("");
      }, 5000);
    } catch (error) {
      alert("Error sending emails. Please try again.");
      console.error(error);
    }

    setSending(false);
  };

  const resources = [
    {
      title: "The Manifesto",
      description: "A declaration of creative independence. Our 10 principles for content freedom.",
      icon: Heart,
      color: "from-[#FF4433] to-[#FF8C00]",
      type: "manifesto",
      pages: 4,
      readTime: "5 min"
    },
    {
      title: "Quick Start Guide",
      description: "Master the platform in 30 minutes. Step-by-step tutorials for every feature.",
      icon: Rocket,
      color: "from-[#FF8C00] to-[#1E90FF]",
      type: "guide",
      pages: 12,
      readTime: "30 min"
    },
    {
      title: "Video Studio Tutorial",
      description: "Learn how to create professional videos from JSON scripts.",
      icon: Video,
      color: "from-[#1E90FF] to-[#9C27B0]",
      type: "tutorial",
      pages: 8,
      readTime: "15 min"
    },
    {
      title: "AI Art Masterclass",
      description: "Become an expert at generating stunning AI artwork.",
      icon: Sparkles,
      color: "from-[#9C27B0] to-[#FF4433]",
      type: "masterclass",
      pages: 10,
      readTime: "20 min"
    },
    {
      title: "Automation Playbook",
      description: "Build powerful workflows that run on autopilot.",
      icon: Zap,
      color: "from-[#4CAF50] to-[#1E90FF]",
      type: "playbook",
      pages: 15,
      readTime: "25 min"
    },
    {
      title: "Team Collaboration Guide",
      description: "Work with your team efficiently. Permissions, workspaces, and more.",
      icon: Users,
      color: "from-[#FF8C00] to-[#A89C94]",
      type: "guide",
      pages: 6,
      readTime: "10 min"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">📚 Resources & Guides</h1>
          <p className="text-gray-400 text-lg mb-8">
            Everything you need to master the platform. Guides, tutorials, and our manifesto.
          </p>

          {/* Email Form */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Mail className="w-8 h-8 text-[#FF8C00]" />
                <h2 className="text-2xl font-bold text-white">Get Complete PDF Pack</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Enter your email to receive the <strong className="text-white">Manifesto</strong> and{" "}
                <strong className="text-white">Quick Start Guide</strong> as beautifully formatted PDFs
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-[#0B0B0C] border-gray-700 text-white rounded-xl"
                  disabled={sending || sent}
                />
                <Button
                  onClick={sendGuidesToEmail}
                  disabled={sending || sent}
                  className={`${
                    sent
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gradient-to-r from-[#FF4433] to-[#1E90FF]"
                  } text-white rounded-xl px-6`}
                >
                  {sending ? (
                    "Sending..."
                  ) : sent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send PDFs
                    </>
                  )}
                </Button>
              </div>
              {sent && (
                <p className="text-green-400 text-sm mt-4">
                  ✅ Check your inbox! PDFs sent to {email}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card
              key={resource.title}
              className="bg-[#111317] border-gray-800 rounded-2xl hover:border-gray-700 transition-all group"
            >
              <div className={`h-2 bg-gradient-to-r ${resource.color}`} />
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-[#0B0B0C] text-gray-400 text-xs">
                    {resource.readTime}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">{resource.pages} pages</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Section */}
        <Card className="bg-gradient-to-r from-[#FF4433]/10 to-[#1E90FF]/10 border-[#FF8C00]/30 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-[#FF8C00]" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Master the Platform in 30 Minutes
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Follow our step-by-step Quick Start Guide and learn to create videos, generate AI art,
              analyze documents, and automate your entire workflow.
            </p>
            <Button
              onClick={() => {
                const userEmail = prompt("Enter your email to receive the guide:");
                if (userEmail) {
                  setEmail(userEmail);
                  sendGuidesToEmail();
                }
              }}
              className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl px-8"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Me the Guide
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Documentation</h3>
              <p className="text-gray-500 text-sm mb-3">
                Detailed docs for every feature
              </p>
              <Button variant="outline" size="sm" className="border-gray-700 rounded-lg">
                Browse Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Video Tutorials</h3>
              <p className="text-gray-500 text-sm mb-3">
                Watch step-by-step walkthroughs
              </p>
              <Button variant="outline" size="sm" className="border-gray-700 rounded-lg">
                Watch Videos
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Community</h3>
              <p className="text-gray-500 text-sm mb-3">
                Get help from other creators
              </p>
              <Button variant="outline" size="sm" className="border-gray-700 rounded-lg">
                Join Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}