import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

const PLATFORM_SETUP = {
  instagram: {
    name: "Instagram",
    steps: [
      "Create a Meta Developer App at developers.facebook.com",
      "Add Instagram Basic Display or Instagram Graph API product",
      "Submit app for Meta App Review with required permissions",
      "Implement OAuth 2.0 flow using your Client ID & Secret",
      "Redirect users to: https://www.facebook.com/v18.0/dialog/oauth"
    ],
    docsUrl: "https://developers.facebook.com/docs/instagram-api",
    note: "Requires a connected Facebook Page and Meta Business Verification"
  },
  facebook_page: {
    name: "Facebook Page",
    steps: [
      "Create a Meta Developer App at developers.facebook.com",
      "Add Facebook Login product to your app",
      "Request pages_manage_posts and pages_read_engagement permissions",
      "Submit for App Review",
      "Redirect users to: https://www.facebook.com/v18.0/dialog/oauth"
    ],
    docsUrl: "https://developers.facebook.com/docs/graph-api/reference/page",
    note: "User must be a Page admin to connect their Page"
  },
  twitter: {
    name: "X (Twitter)",
    steps: [
      "Apply for X Developer Account at developer.twitter.com",
      "Create a Project and App in the Developer Portal",
      "Enable OAuth 2.0 and set redirect URIs",
      "Request tweet.write scope (requires Basic paid tier at $100/mo)",
      "Redirect users to: https://twitter.com/i/oauth2/authorize"
    ],
    docsUrl: "https://developer.twitter.com/en/docs/twitter-api/oauth2",
    note: "Free tier is read-only. Posting requires Basic ($100/mo) or higher plan."
  },
  linkedin: {
    name: "LinkedIn",
    steps: [
      "Create an app at linkedin.com/developers/apps",
      "Associate the app with a LinkedIn Company Page",
      "Request 'Share on LinkedIn' and 'Sign In with LinkedIn using OpenID' products",
      "Wait for product approval (can take a few days)",
      "Redirect users to: https://www.linkedin.com/oauth/v2/authorization"
    ],
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/",
    note: "LinkedIn requires manual product approval for marketing APIs"
  },
  tiktok: {
    name: "TikTok",
    steps: [
      "Register at developers.tiktok.com",
      "Create an app and request Content Posting API access",
      "Submit your app for TikTok review",
      "After approval, use Client Key & Secret for OAuth",
      "Redirect users to: https://www.tiktok.com/v2/auth/authorize/"
    ],
    docsUrl: "https://developers.tiktok.com/doc/content-posting-api-get-started",
    note: "TikTok Content Posting API requires app review and approval"
  },
  youtube: {
    name: "YouTube",
    steps: [
      "Create a project in Google Cloud Console",
      "Enable YouTube Data API v3 in the API Library",
      "Create OAuth 2.0 Client ID credentials",
      "Set authorized redirect URIs for your app",
      "Redirect users to: https://accounts.google.com/o/oauth2/v2/auth"
    ],
    docsUrl: "https://developers.google.com/youtube/v3/getting-started",
    note: "YouTube uses Google OAuth — same credentials as Google Cloud project"
  }
};

export default function SocialConnectModal({ platform, onClose }) {
  const setup = PLATFORM_SETUP[platform?.id];
  if (!platform || !setup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative bg-[#111317] border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
              <platform.icon className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-white">Connect {setup.name}</CardTitle>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-400/90 text-xs">{setup.note}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-300 text-sm font-semibold mb-3">Setup Steps:</p>
            <div className="space-y-2">
              {setup.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-holographic-cyan/20 text-holographic-cyan text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    {i + 1}
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-green-400/90 text-xs">
              Once your OAuth app is approved and configured, the "Connect" button will initiate the real OAuth flow using your credentials.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={setup.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View API Docs
            </a>
            <Button
              onClick={onClose}
              className={`flex-1 bg-gradient-to-r ${platform.color} text-white rounded-xl text-sm`}
            >
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}