import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, ExternalLink, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";

const platforms = [
  {
    id: "meta",
    name: "Meta (Facebook & Instagram)",
    color: "from-[#1877F2] to-[#E1306C]",
    emoji: "🔵",
    verificationSteps: [
      {
        title: "1. Meta Business Verification",
        description: "Go to Meta Business Suite → Settings → Business Info → Start Verification",
        link: "https://business.facebook.com/settings/info",
        linkText: "Open Meta Business Suite"
      },
      {
        title: "2. Domain Verification",
        description: "Add this meta tag to your website's <head> section to verify domain ownership:",
        metaTag: '<meta name="facebook-domain-verification" content="YOUR_VERIFICATION_CODE" />',
        note: "Replace YOUR_VERIFICATION_CODE with the code from Meta Business Manager → Brand Safety → Domains"
      },
      {
        title: "3. App Review",
        description: "Submit your app for Meta App Review to access publishing APIs (instagram_basic, pages_manage_posts, etc.)",
        link: "https://developers.facebook.com/apps/",
        linkText: "Open Meta for Developers"
      }
    ],
    apiDocs: "https://developers.facebook.com/docs/graph-api",
    requiredScopes: ["instagram_basic", "instagram_content_publish", "pages_manage_posts", "pages_read_engagement"],
    oauthEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
    status: "manual"
  },
  {
    id: "tiktok",
    name: "TikTok for Business",
    color: "from-[#FF0050] to-[#00F2EA]",
    emoji: "🎵",
    verificationSteps: [
      {
        title: "1. Create TikTok Developer Account",
        description: "Register at TikTok for Developers and create an app to get Client Key & Secret",
        link: "https://developers.tiktok.com/",
        linkText: "TikTok Developer Portal"
      },
      {
        title: "2. Website Verification",
        description: "Add this meta tag to your website <head> to verify domain ownership for TikTok Pixel:",
        metaTag: '<meta name="tiktok-domain-verification" content="YOUR_TIKTOK_CODE" />',
        note: "Get the code from TikTok Ads Manager → Assets → Events → Web Events"
      },
      {
        title: "3. App Submission",
        description: "Submit your TikTok app for approval. Required for Content Posting API access (post videos on behalf of users).",
        link: "https://developers.tiktok.com/apps/",
        linkText: "TikTok Apps Dashboard"
      }
    ],
    apiDocs: "https://developers.tiktok.com/doc/overview",
    requiredScopes: ["user.info.basic", "video.publish", "video.upload"],
    oauthEndpoint: "https://www.tiktok.com/v2/auth/authorize/",
    status: "manual"
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    color: "from-[#000000] to-[#1DA1F2]",
    emoji: "𝕏",
    verificationSteps: [
      {
        title: "1. Apply for Developer Account",
        description: "Sign up at the X Developer Portal. You'll need to describe your use case to get approved.",
        link: "https://developer.twitter.com/en/portal/petition/essential/basic-info",
        linkText: "X Developer Portal"
      },
      {
        title: "2. Create a Project & App",
        description: "Create a Project → App in the portal. Set OAuth 2.0 redirect URI to your app's callback URL.",
        link: "https://developer.x.com/en/portal/dashboard",
        linkText: "X Developer Dashboard"
      },
      {
        title: "3. Request Elevated Access",
        description: "Basic tier (free) allows read. For posting (tweet.write), apply for Basic paid tier ($100/month) or Elevated access.",
        link: "https://developer.twitter.com/en/portal/products",
        linkText: "X API Products"
      }
    ],
    apiDocs: "https://developer.twitter.com/en/docs/twitter-api",
    requiredScopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    oauthEndpoint: "https://twitter.com/i/oauth2/authorize",
    status: "manual"
  },
  {
    id: "youtube",
    name: "YouTube (Google)",
    color: "from-[#FF0000] to-[#CC0000]",
    emoji: "▶️",
    verificationSteps: [
      {
        title: "1. Google Cloud Console Project",
        description: "Create a project in Google Cloud Console, enable YouTube Data API v3",
        link: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
        linkText: "Enable YouTube API"
      },
      {
        title: "2. OAuth 2.0 Credentials",
        description: "In GCP → APIs & Services → Credentials, create OAuth 2.0 Client ID. Set redirect URIs.",
        link: "https://console.cloud.google.com/apis/credentials",
        linkText: "GCP Credentials"
      },
      {
        title: "3. Google Search Console Verification",
        description: "Add this meta tag for domain verification (also needed for YouTube brand account linking):",
        metaTag: '<meta name="google-site-verification" content="YOUR_GSC_CODE" />',
        note: "Get code from Google Search Console → Settings → Ownership Verification"
      }
    ],
    apiDocs: "https://developers.google.com/youtube/v3",
    requiredScopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"],
    oauthEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    status: "manual"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "from-[#0077B5] to-[#00A0DC]",
    emoji: "💼",
    verificationSteps: [
      {
        title: "1. Create LinkedIn App",
        description: "Go to LinkedIn Developer Portal, create an app associated with a LinkedIn Company Page",
        link: "https://www.linkedin.com/developers/apps/new",
        linkText: "LinkedIn Developer Portal"
      },
      {
        title: "2. Request Products",
        description: "In your app settings, request 'Share on LinkedIn' and 'Sign In with LinkedIn using OpenID Connect' products",
        link: "https://www.linkedin.com/developers/apps",
        linkText: "LinkedIn Apps"
      },
      {
        title: "3. Domain Verification",
        description: "Add your domain in the Auth tab of your LinkedIn App. OAuth 2.0 redirect URLs must exactly match.",
        note: "LinkedIn doesn't use a meta-tag for domain verification — instead, add your domain to the app's authorized redirect URIs and OAuth 2.0 settings."
      }
    ],
    apiDocs: "https://learn.microsoft.com/en-us/linkedin/marketing/",
    requiredScopes: ["openid", "profile", "email", "w_member_social"],
    oauthEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
    status: "manual"
  }
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-gray-700 transition-colors"
      title="Copy"
    >
      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
    </button>
  );
}

function PlatformVerificationCard({ platform }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-lg`}>
              {platform.emoji}
            </div>
            <div>
              <CardTitle className="text-white text-base">{platform.name}</CardTitle>
              <p className="text-gray-500 text-xs mt-0.5">Manual developer setup required</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Setup Required
            </Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-gray-800 transition-colors"
            >
              {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* OAuth Info */}
          <div className="p-3 bg-[#0B0B0C] rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">OAuth Endpoint</span>
            </div>
            <div className="flex items-center">
              <code className="text-gray-300 text-xs break-all">{platform.oauthEndpoint}</code>
              <CopyButton text={platform.oauthEndpoint} />
            </div>
          </div>

          {/* Required Scopes */}
          <div>
            <p className="text-gray-400 text-xs mb-2 font-medium">Required OAuth Scopes:</p>
            <div className="flex flex-wrap gap-2">
              {platform.requiredScopes.map(scope => (
                <div key={scope} className="flex items-center gap-1 px-2 py-1 bg-[#0B0B0C] rounded-lg border border-gray-700">
                  <code className="text-holographic-cyan text-xs">{scope}</code>
                  <CopyButton text={scope} />
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {platform.verificationSteps.map((step, i) => (
              <div key={i} className="p-3 bg-[#0B0B0C] rounded-xl border border-gray-800">
                <p className="text-white text-sm font-semibold mb-1">{step.title}</p>
                <p className="text-gray-400 text-xs mb-2">{step.description}</p>
                {step.metaTag && (
                  <div className="flex items-start gap-2 p-2 bg-gray-900 rounded-lg mb-2">
                    <code className="text-green-400 text-xs break-all flex-1">{step.metaTag}</code>
                    <CopyButton text={step.metaTag} />
                  </div>
                )}
                {step.note && (
                  <p className="text-yellow-400/80 text-xs italic">{step.note}</p>
                )}
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {step.linkText}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* API Docs link */}
          <a
            href={platform.apiDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Official API Documentation
          </a>
        </CardContent>
      )}
    </Card>
  );
}

export default function SocialPlatformVerification() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-semibold text-sm">Developer Setup Required</p>
            <p className="text-yellow-400/70 text-xs mt-1">
              Each platform requires you to create a developer app, get OAuth credentials, and complete platform-specific verification. 
              Expand each platform below for step-by-step instructions, required scopes, and meta tags for domain verification.
            </p>
          </div>
        </div>
      </div>

      {platforms.map(platform => (
        <PlatformVerificationCard key={platform.id} platform={platform} />
      ))}

      {/* index.html Meta Tags Reference */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-base">📄 Domain Verification Meta Tags (index.html)</CardTitle>
          <p className="text-gray-400 text-xs">Add these to your site's &lt;head&gt; for platform domain verification</p>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 font-mono text-xs space-y-1">
            <div className="flex items-center gap-2">
              <code className="text-gray-400 flex-1">{'<!-- Meta / Facebook Domain Verification -->'}</code>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-green-400 flex-1">{'<meta name="facebook-domain-verification" content="YOUR_META_CODE" />'}</code>
              <CopyButton text='<meta name="facebook-domain-verification" content="YOUR_META_CODE" />' />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-gray-400 flex-1">{'<!-- TikTok Pixel Domain Verification -->'}</code>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-green-400 flex-1">{'<meta name="tiktok-domain-verification" content="YOUR_TIKTOK_CODE" />'}</code>
              <CopyButton text='<meta name="tiktok-domain-verification" content="YOUR_TIKTOK_CODE" />' />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-gray-400 flex-1">{'<!-- Google / YouTube Verification -->'}</code>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-green-400 flex-1">{'<meta name="google-site-verification" content="YOUR_GSC_CODE" />'}</code>
              <CopyButton text='<meta name="google-site-verification" content="YOUR_GSC_CODE" />' />
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            💡 To add these to your live site, go to your app's <strong className="text-gray-300">index.html</strong> file and paste them inside the &lt;head&gt; tag, replacing the placeholder codes with your actual verification codes from each platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}