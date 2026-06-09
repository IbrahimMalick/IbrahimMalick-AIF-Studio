import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Code,
  Sparkles,
  Video,
  Image as ImageIcon,
  Share2,
  Zap,
  MessageSquare,
  FileText,
  Music,
  Mail,
  TrendingUp,
  Copy,
  CheckCircle2
} from "lucide-react";

export default function CopilotGuide() {
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const copilotPrompts = [
    {
      id: "create_video",
      category: "Video Creation",
      icon: Video,
      color: "bg-[#FFD700]",
      prompts: [
        {
          title: "Create Product Demo Video",
          prompt: "Create a 60-second product demo video about [PRODUCT NAME] that shows [KEY FEATURES]. Make it engaging and professional.",
          example: "Create a 60-second product demo video about our AI Video Editor that shows automatic captioning, voice cloning, and social media optimization. Make it engaging and professional."
        },
        {
          title: "Educational Tutorial",
          prompt: "Generate a tutorial video teaching [TOPIC] in [DURATION] seconds. Include step-by-step instructions and examples.",
          example: "Generate a tutorial video teaching how to use Instagram Reels in 90 seconds. Include step-by-step instructions and examples."
        },
        {
          title: "Social Media Teaser",
          prompt: "Create a 15-second teaser video for [CONTENT] optimized for Instagram Reels and TikTok. Make it viral-worthy with a strong hook.",
          example: "Create a 15-second teaser video for our new course launch optimized for Instagram Reels and TikTok. Make it viral-worthy with a strong hook."
        },
        {
          title: "Explainer Video",
          prompt: "Make an explainer video about [CONCEPT/SERVICE] in [DURATION] seconds. Use simple language and visual metaphors.",
          example: "Make an explainer video about blockchain technology in 120 seconds. Use simple language and visual metaphors."
        }
      ]
    },
    {
      id: "generate_script",
      category: "Script Writing",
      icon: FileText,
      color: "bg-[#9D4EDD]",
      prompts: [
        {
          title: "YouTube Video Script",
          prompt: "Write a YouTube video script about [TOPIC] for [TARGET AUDIENCE]. Include: hook, introduction, 3-5 main points, call-to-action. Duration: [TIME].",
          example: "Write a YouTube video script about passive income strategies for entrepreneurs. Include: hook, introduction, 3-5 main points, call-to-action. Duration: 10 minutes."
        },
        {
          title: "Short-Form Script",
          prompt: "Create a 30-second script for [PLATFORM] about [TOPIC]. Make it punchy with a viral hook.",
          example: "Create a 30-second script for TikTok about AI productivity hacks. Make it punchy with a viral hook."
        },
        {
          title: "Story-Based Script",
          prompt: "Write a story-driven script about [TOPIC/JOURNEY] that resonates emotionally with [AUDIENCE]. Include personal anecdotes.",
          example: "Write a story-driven script about overcoming business failure that resonates emotionally with entrepreneurs. Include personal anecdotes."
        }
      ]
    },
    {
      id: "social_media",
      category: "Social Media",
      icon: Share2,
      color: "bg-[#00D4C9]",
      prompts: [
        {
          title: "Multi-Platform Post",
          prompt: "Create a social media post about [TOPIC] for Instagram, Facebook, and LinkedIn. Optimize each caption for the platform.",
          example: "Create a social media post about our new product launch for Instagram, Facebook, and LinkedIn. Optimize each caption for the platform."
        },
        {
          title: "Viral Content",
          prompt: "Generate a viral social media campaign about [TOPIC]. Include 5 post ideas, hashtag strategy, and best posting times.",
          example: "Generate a viral social media campaign about AI tools for creators. Include 5 post ideas, hashtag strategy, and best posting times."
        },
        {
          title: "Engagement Post",
          prompt: "Write an engaging post that asks [QUESTION] to increase comments and shares. Make it conversation-starting.",
          example: "Write an engaging post that asks 'What's your biggest content creation struggle?' to increase comments and shares. Make it conversation-starting."
        }
      ]
    },
    {
      id: "content_ideas",
      category: "Content Ideas",
      icon: Sparkles,
      color: "bg-[#FF8C00]",
      prompts: [
        {
          title: "Content Calendar",
          prompt: "Create a 30-day content calendar for [NICHE/INDUSTRY] focused on [GOAL]. Include video ideas, post topics, and best platforms.",
          example: "Create a 30-day content calendar for fitness coaching focused on building an online presence. Include video ideas, post topics, and best platforms."
        },
        {
          title: "Trending Topic Content",
          prompt: "Give me 10 content ideas based on current trends in [INDUSTRY]. Include format suggestions (video/image/carousel).",
          example: "Give me 10 content ideas based on current trends in AI and automation. Include format suggestions (video/image/carousel)."
        },
        {
          title: "Series Planning",
          prompt: "Plan a 6-part video series about [TOPIC]. Include episode titles, key points, and progression strategy.",
          example: "Plan a 6-part video series about building a personal brand on social media. Include episode titles, key points, and progression strategy."
        }
      ]
    },
    {
      id: "optimization",
      category: "SEO & Optimization",
      icon: TrendingUp,
      color: "bg-[#06D6A0]",
      prompts: [
        {
          title: "YouTube SEO",
          prompt: "Optimize this video for YouTube SEO: [VIDEO TOPIC]. Provide: title, description, tags, and thumbnail ideas.",
          example: "Optimize this video for YouTube SEO: 'How to Start a Podcast in 2024'. Provide: title, description, tags, and thumbnail ideas."
        },
        {
          title: "Hashtag Strategy",
          prompt: "Create a hashtag strategy for [CONTENT TYPE] about [TOPIC] on [PLATFORM]. Include trending, niche, and branded hashtags.",
          example: "Create a hashtag strategy for Instagram Reels about productivity tips on Instagram. Include trending, niche, and branded hashtags."
        },
        {
          title: "Thumbnail Optimization",
          prompt: "Suggest 5 high-CTR thumbnail concepts for a video about [TOPIC]. Include text overlay ideas and visual elements.",
          example: "Suggest 5 high-CTR thumbnail concepts for a video about making money with AI. Include text overlay ideas and visual elements."
        }
      ]
    },
    {
      id: "advanced",
      category: "Advanced AI Tasks",
      icon: Zap,
      color: "bg-[#FF69B4]",
      prompts: [
        {
          title: "Competitor Analysis",
          prompt: "Analyze [COMPETITOR] content strategy on [PLATFORM]. Identify gaps I can exploit and content formats that work for them.",
          example: "Analyze MrBeast's content strategy on YouTube. Identify gaps I can exploit and content formats that work for them."
        },
        {
          title: "Content Repurposing",
          prompt: "Take this [CONTENT TYPE]: [DESCRIPTION] and repurpose it into 10 different formats for different platforms.",
          example: "Take this blog post about AI trends and repurpose it into 10 different formats for different platforms."
        },
        {
          title: "Audience Analysis",
          prompt: "Analyze my audience data and suggest 5 content topics that will maximize engagement based on [METRICS/DATA].",
          example: "Analyze my audience data and suggest 5 content topics that will maximize engagement based on my most-watched videos and highest-engagement posts."
        }
      ]
    }
  ];

  const metaEndpoints = [
    {
      platform: "Instagram",
      icon: ImageIcon,
      color: "from-[#FF4433] to-[#FF8C00]",
      endpoints: [
        {
          name: "Post Photo",
          method: "POST",
          endpoint: "/{instagram-account-id}/media",
          description: "Create a photo post on Instagram",
          fields: [
            { name: "image_url", type: "string", required: true, description: "URL of image to post" },
            { name: "caption", type: "string", required: false, description: "Post caption (max 2,200 chars)" },
            { name: "location_id", type: "string", required: false, description: "Facebook location ID" },
            { name: "user_tags", type: "array", required: false, description: "Array of {username, x, y}" }
          ],
          twoStep: true,
          publishEndpoint: "/{instagram-account-id}/media_publish",
          publishFields: [
            { name: "creation_id", type: "string", required: true, description: "ID from media creation" }
          ],
          example: `// Step 1: Create media container
const response = await fetch('https://graph.facebook.com/v18.0/{ig-account-id}/media', {
  method: 'POST',
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    caption: 'Check out this amazing content! #ai #automation',
    access_token: '{access-token}'
  })
});
const { id } = await response.json();

// Step 2: Publish
await fetch('https://graph.facebook.com/v18.0/{ig-account-id}/media_publish', {
  method: 'POST',
  body: JSON.stringify({
    creation_id: id,
    access_token: '{access-token}'
  })
});`
        },
        {
          name: "Post Reel",
          method: "POST",
          endpoint: "/{instagram-account-id}/media",
          description: "Create an Instagram Reel",
          fields: [
            { name: "video_url", type: "string", required: true, description: "URL of video (max 90s, vertical)" },
            { name: "caption", type: "string", required: false, description: "Reel caption" },
            { name: "media_type", type: "string", required: true, description: "Must be 'REELS'" },
            { name: "cover_url", type: "string", required: false, description: "Custom cover image URL" },
            { name: "share_to_feed", type: "boolean", required: false, description: "Also post to feed" }
          ],
          twoStep: true,
          example: `const response = await fetch('https://graph.facebook.com/v18.0/{ig-account-id}/media', {
  method: 'POST',
  body: JSON.stringify({
    media_type: 'REELS',
    video_url: 'https://example.com/reel.mp4',
    caption: 'New reel! 🔥 #viral',
    share_to_feed: true,
    access_token: '{access-token}'
  })
});`
        },
        {
          name: "Post Carousel",
          method: "POST",
          endpoint: "/{instagram-account-id}/media",
          description: "Create a carousel post with multiple images/videos",
          fields: [
            { name: "media_type", type: "string", required: true, description: "Must be 'CAROUSEL'" },
            { name: "children", type: "array", required: true, description: "Array of media container IDs" },
            { name: "caption", type: "string", required: false, description: "Carousel caption" }
          ],
          multiStep: true,
          example: `// Step 1: Create media items
const item1 = await createMediaItem(image1_url);
const item2 = await createMediaItem(image2_url);

// Step 2: Create carousel container
const carousel = await fetch('https://graph.facebook.com/v18.0/{ig-account-id}/media', {
  method: 'POST',
  body: JSON.stringify({
    media_type: 'CAROUSEL',
    children: [item1.id, item2.id],
    caption: 'Swipe for more! 👉',
    access_token: '{access-token}'
  })
});

// Step 3: Publish
await publishMedia(carousel.id);`
        }
      ]
    },
    {
      platform: "Facebook Page",
      icon: Share2,
      color: "from-[#1E90FF] to-[#A89C94]",
      endpoints: [
        {
          name: "Post Photo",
          method: "POST",
          endpoint: "/{page-id}/photos",
          description: "Post a photo to Facebook Page",
          fields: [
            { name: "url", type: "string", required: true, description: "Photo URL" },
            { name: "message", type: "string", required: false, description: "Photo caption" },
            { name: "published", type: "boolean", required: false, description: "Publish immediately (default: true)" },
            { name: "scheduled_publish_time", type: "unix_timestamp", required: false, description: "Schedule for later" }
          ],
          example: `await fetch('https://graph.facebook.com/v18.0/{page-id}/photos', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://example.com/image.jpg',
    message: 'Check this out!',
    access_token: '{page-access-token}'
  })
});`
        },
        {
          name: "Post Video",
          method: "POST",
          endpoint: "/{page-id}/videos",
          description: "Post a video to Facebook Page",
          fields: [
            { name: "file_url", type: "string", required: true, description: "Video URL" },
            { name: "title", type: "string", required: false, description: "Video title" },
            { name: "description", type: "string", required: false, description: "Video description" },
            { name: "scheduled_publish_time", type: "unix_timestamp", required: false, description: "Schedule for later" },
            { name: "published", type: "boolean", required: false, description: "Publish now" }
          ],
          example: `await fetch('https://graph.facebook.com/v18.0/{page-id}/videos', {
  method: 'POST',
  body: JSON.stringify({
    file_url: 'https://example.com/video.mp4',
    title: 'Amazing Video!',
    description: 'Watch until the end!',
    access_token: '{page-access-token}'
  })
});`
        },
        {
          name: "Post Link/Text",
          method: "POST",
          endpoint: "/{page-id}/feed",
          description: "Post a text update or link to Facebook Page",
          fields: [
            { name: "message", type: "string", required: true, description: "Post text" },
            { name: "link", type: "string", required: false, description: "URL to share" },
            { name: "published", type: "boolean", required: false, description: "Publish now" },
            { name: "scheduled_publish_time", type: "unix_timestamp", required: false, description: "Schedule for later" }
          ],
          example: `await fetch('https://graph.facebook.com/v18.0/{page-id}/feed', {
  method: 'POST',
  body: JSON.stringify({
    message: 'New blog post is live!',
    link: 'https://yourblog.com/post',
    access_token: '{page-access-token}'
  })
});`
        }
      ]
    }
  ];

  const authFlow = {
    instagram: {
      steps: [
        "Redirect user to: https://api.instagram.com/oauth/authorize?client_id={app-id}&redirect_uri={redirect-uri}&scope=instagram_basic,instagram_content_publish&response_type=code",
        "User authorizes your app",
        "Get authorization code from redirect",
        "Exchange code for access token: POST https://api.instagram.com/oauth/access_token",
        "Get Instagram Business Account ID from user's Facebook Page",
        "Save access token and account ID to SocialMediaAccount entity"
      ],
      scopes: [
        "instagram_basic - Read profile info",
        "instagram_content_publish - Publish posts, stories, reels",
        "instagram_manage_comments - Respond to comments",
        "instagram_manage_insights - View analytics",
        "pages_read_engagement - Required for Instagram API",
        "pages_manage_posts - Required for publishing"
      ]
    },
    facebook: {
      steps: [
        "Redirect user to: https://www.facebook.com/v18.0/dialog/oauth?client_id={app-id}&redirect_uri={redirect-uri}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata",
        "User selects Page and authorizes",
        "Exchange code for user access token",
        "Get Page access token: GET /{user-id}/accounts",
        "Save Page access token (never expires if user is Page admin)",
        "Save to SocialMediaAccount entity"
      ],
      scopes: [
        "pages_show_list - List user's pages",
        "pages_read_engagement - Read post engagement",
        "pages_manage_posts - Publish posts",
        "pages_manage_metadata - Manage page settings",
        "publish_video - Post videos"
      ]
    }
  };

  const importantNotes = [
    {
      title: "Instagram API Limitations",
      points: [
        "Requires Facebook Business Page connected to Instagram Business/Creator Account",
        "Cannot post to personal Instagram accounts via API",
        "Media must be hosted on a public HTTPS URL",
        "Images: Max 8MB, min 320px, JPG/PNG only",
        "Videos (Reels): Max 90 seconds, vertical (9:16), MP4/MOV",
        "Stories: 15 seconds max, vertical",
        "Rate limit: ~25 API calls per user per hour"
      ]
    },
    {
      title: "Facebook Page Posting",
      points: [
        "Need Page access token (more powerful than user token)",
        "Page tokens don't expire if user is Page admin",
        "Can schedule up to 6 months in advance",
        "Use unix timestamp for scheduled_publish_time",
        "Videos must be <1GB for optimal processing",
        "Can post to multiple pages with one app"
      ]
    },
    {
      title: "Best Practices",
      points: [
        "Always validate media URLs before posting (200 status, correct MIME type)",
        "Implement retry logic for failed posts (3 attempts with exponential backoff)",
        "Store post IDs for analytics and management",
        "Refresh tokens before they expire",
        "Handle webhook events for post updates",
        "Test with Graph API Explorer first",
        "Use batch requests for multiple operations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#FFD700]" />
            AI Copilot & API Integration Guide
          </h1>
          <p className="text-gray-400">Ready-to-use prompts and Meta API integration details</p>
        </div>

        <Tabs defaultValue="prompts">
          <TabsList className="bg-[#111317] rounded-xl">
            <TabsTrigger value="prompts">
              <Sparkles className="w-4 h-4 mr-2" />
              Copilot Prompts
            </TabsTrigger>
            <TabsTrigger value="meta_api">
              <Code className="w-4 h-4 mr-2" />
              Meta API Guide
            </TabsTrigger>
            <TabsTrigger value="auth">
              <Share2 className="w-4 h-4 mr-2" />
              OAuth Setup
            </TabsTrigger>
          </TabsList>

          {/* Copilot Prompts Tab */}
          <TabsContent value="prompts">
            <div className="space-y-6">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">How to Use These Prompts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-300 text-sm">
                  <p>1. <strong className="text-white">Copy any prompt below</strong> - Click the copy button next to each prompt</p>
                  <p>2. <strong className="text-white">Replace placeholders</strong> - Customize [TOPIC], [DURATION], etc. with your specifics</p>
                  <p>3. <strong className="text-white">Send to AI Copilot</strong> - Use in the chat widget or any AI assistant page</p>
                  <p>4. <strong className="text-white">Refine as needed</strong> - Follow up with "make it shorter" or "add more details"</p>
                </CardContent>
              </Card>

              {copilotPrompts.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <Card key={category.id} className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                          <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.prompts.map((promptItem, idx) => (
                        <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white font-semibold mb-1">{promptItem.title}</h4>
                              <Badge className="bg-gray-700 text-gray-300 text-xs">Template</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(promptItem.prompt, `${category.id}-${idx}`)}
                              className="border-gray-700 hover:bg-[#111317] rounded-lg"
                            >
                              {copiedPrompt === `${category.id}-${idx}` ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" />
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
                          <div className="space-y-3">
                            <div className="p-3 bg-[#111317] rounded-lg">
                              <p className="text-[#FFD700] text-xs mb-1">PROMPT TEMPLATE:</p>
                              <p className="text-gray-300 text-sm font-mono">{promptItem.prompt}</p>
                            </div>
                            <div className="p-3 bg-[#111317] rounded-lg border-l-2 border-[#00D4C9]">
                              <p className="text-[#00D4C9] text-xs mb-1">EXAMPLE:</p>
                              <p className="text-gray-400 text-sm italic">{promptItem.example}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Meta API Guide Tab */}
          <TabsContent value="meta_api">
            <div className="space-y-6">
              {metaEndpoints.map((platform, idx) => {
                const PlatformIcon = platform.icon;
                return (
                  <Card key={idx} className="bg-[#111317] border-gray-800 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${platform.color} flex items-center justify-center`}>
                          <PlatformIcon className="w-5 h-5 text-white" />
                        </div>
                        {platform.platform} API
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {platform.endpoints.map((endpoint, eIdx) => (
                        <div key={eIdx} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white font-bold mb-1">{endpoint.name}</h4>
                              <p className="text-gray-400 text-sm mb-2">{endpoint.description}</p>
                              <div className="flex gap-2">
                                <Badge className="bg-green-500/20 text-green-400 text-xs">
                                  {endpoint.method}
                                </Badge>
                                <code className="text-[#FFD700] text-xs bg-[#111317] px-2 py-1 rounded">
                                  {endpoint.endpoint}
                                </code>
                                {endpoint.twoStep && (
                                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                                    2-Step Process
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(endpoint.example, `endpoint-${idx}-${eIdx}`)}
                              className="border-gray-700 hover:bg-[#111317] rounded-lg"
                            >
                              {copiedPrompt === `endpoint-${idx}-${eIdx}` ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" />
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

                          {/* Required Fields */}
                          <div className="mb-4">
                            <p className="text-white font-semibold text-sm mb-2">Required Fields:</p>
                            <div className="space-y-2">
                              {endpoint.fields.map((field, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-2 text-sm">
                                  <Badge className={field.required ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-400"} style={{fontSize: "10px", padding: "2px 6px"}}>
                                    {field.required ? "REQUIRED" : "OPTIONAL"}
                                  </Badge>
                                  <div className="flex-1">
                                    <code className="text-[#00D4C9]">{field.name}</code>
                                    <span className="text-gray-500 mx-2">({field.type})</span>
                                    <p className="text-gray-400 mt-1">{field.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Publish Step (for 2-step processes) */}
                          {endpoint.twoStep && (
                            <div className="mb-4">
                              <p className="text-white font-semibold text-sm mb-2">Step 2 - Publish:</p>
                              <code className="text-[#FFD700] text-xs bg-[#111317] px-2 py-1 rounded block mb-2">
                                {endpoint.publishEndpoint}
                              </code>
                              <div className="space-y-2">
                                {endpoint.publishFields?.map((field, fIdx) => (
                                  <div key={fIdx} className="flex items-start gap-2 text-sm">
                                    <Badge className="bg-red-500/20 text-red-400" style={{fontSize: "10px", padding: "2px 6px"}}>
                                      REQUIRED
                                    </Badge>
                                    <div>
                                      <code className="text-[#00D4C9]">{field.name}</code>
                                      <span className="text-gray-500 mx-2">({field.type})</span>
                                      <p className="text-gray-400 mt-1">{field.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Code Example */}
                          <div>
                            <p className="text-white font-semibold text-sm mb-2">Code Example:</p>
                            <div className="p-4 bg-[#111317] rounded-lg overflow-x-auto">
                              <pre className="text-gray-300 text-xs font-mono leading-relaxed">
                                {endpoint.example}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Important Notes */}
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Important Notes & Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {importantNotes.map((note, idx) => (
                    <div key={idx} className="p-4 bg-[#0B0B0C] rounded-xl">
                      <h4 className="text-white font-bold mb-3">{note.title}</h4>
                      <ul className="space-y-2">
                        {note.points.map((point, pIdx) => (
                          <li key={pIdx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* OAuth Setup Tab */}
          <TabsContent value="auth">
            <div className="space-y-6">
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Instagram OAuth Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-[#FF4433]/10 to-[#FF8C00]/10 border border-[#FF8C00]/30 rounded-xl">
                    <h4 className="text-white font-semibold mb-3">Required Scopes:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {authFlow.instagram.scopes.map((scope, idx) => (
                        <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg">
                          <code className="text-[#00D4C9] text-xs">{scope.split(' - ')[0]}</code>
                          <p className="text-gray-400 text-xs mt-1">{scope.split(' - ')[1]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">OAuth Steps:</h4>
                    {authFlow.instagram.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-[#FFD700] text-black font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-300 text-sm">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Facebook Page OAuth Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-[#1E90FF]/10 to-[#A89C94]/10 border border-[#1E90FF]/30 rounded-xl">
                    <h4 className="text-white font-semibold mb-3">Required Scopes:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {authFlow.facebook.scopes.map((scope, idx) => (
                        <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg">
                          <code className="text-[#00D4C9] text-xs">{scope.split(' - ')[0]}</code>
                          <p className="text-gray-400 text-xs mt-1">{scope.split(' - ')[1]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">OAuth Steps:</h4>
                    {authFlow.facebook.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-[#1E90FF] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 p-3 bg-[#0B0B0C] rounded-lg">
                          <p className="text-gray-300 text-sm">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Quick Reference URLs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <a 
                      href="https://developers.facebook.com/docs/instagram-api" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#00D4C9] transition-all"
                    >
                      <p className="text-white font-semibold mb-1">Instagram API Docs</p>
                      <p className="text-gray-400 text-xs">Official Meta documentation</p>
                    </a>
                    <a 
                      href="https://developers.facebook.com/tools/explorer/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#00D4C9] transition-all"
                    >
                      <p className="text-white font-semibold mb-1">Graph API Explorer</p>
                      <p className="text-gray-400 text-xs">Test API calls in browser</p>
                    </a>
                    <a 
                      href="https://developers.facebook.com/apps/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#00D4C9] transition-all"
                    >
                      <p className="text-white font-semibold mb-1">Create Meta App</p>
                      <p className="text-gray-400 text-xs">Set up your application</p>
                    </a>
                    <a 
                      href="https://developers.facebook.com/docs/permissions/reference" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#00D4C9] transition-all"
                    >
                      <p className="text-white font-semibold mb-1">Permissions Reference</p>
                      <p className="text-gray-400 text-xs">All available scopes</p>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}