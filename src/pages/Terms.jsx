import React from "react";
import { FileText, ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans">

      {/* Header */}
      <header className="border-b border-gray-800 bg-[#030712]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#A855F7] flex items-center justify-center font-bold text-lg">
              AF
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">AI Freedom Studios</div>
              <div className="text-xs text-gray-400">AI-Powered Business Platform</div>
            </div>
          </a>
          <a href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-[#A855F7]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-gray-400 text-sm mt-1">Last updated: January 2025</p>
          </div>
        </div>

        <div className="prose prose-invert prose-lg max-w-none space-y-10 text-gray-300">

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AI Freedom Studios ("the Platform") at{" "}
              <a href="https://aifreedomstudios.com" className="text-[#00D4FF] hover:underline">aifreedomstudios.com</a>,
              you agree to be bound by these Terms of Service and our{" "}
              <a href="/privacy" className="text-[#00D4FF] hover:underline">Privacy Policy</a>.
              If you do not agree, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              AI Freedom Studios is an AI-powered business automation platform providing:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>AI content creation (videos, images, scripts, voice)</li>
              <li>Marketing automation (email, SMS, multi-channel campaigns)</li>
              <li>CRM and lead management tools</li>
              <li>Ad management (Meta, Google, TikTok, CTV platforms)</li>
              <li>AI receptionist and workflow automation</li>
              <li>Analytics, reporting, and AI insights</li>
              <li>Agency white-labeling and client management tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Account Registration</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You must be at least 18 years old to use the Platform</li>
              <li>You must provide accurate, current, and complete registration information</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized account access</li>
              <li>We reserve the right to terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Acceptable Use</h2>
            <p>You agree NOT to use AI Freedom Studios to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>Generate or distribute illegal, harmful, or abusive content</li>
              <li>Create deepfakes or deceptive media without proper disclosure</li>
              <li>Spam, harass, or send unsolicited communications</li>
              <li>Violate any applicable laws or regulations (including CAN-SPAM, GDPR, TCPA)</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Attempt to access other users' accounts or data</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Use the platform to develop competing products</li>
              <li>Exceed rate limits or use automated scraping tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Subscription & Payment</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Subscriptions are billed monthly or annually as selected at sign-up</li>
              <li>Payments are processed securely via Stripe</li>
              <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
              <li>We offer a pro-rated refund for annual plans cancelled within 30 days</li>
              <li>Monthly plans may be cancelled at any time; access continues until the period end</li>
              <li>Prices may change with 30 days' notice to existing subscribers</li>
              <li>Agency plans include usage-based fees (15% of ad spend managed)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">6. Content & Intellectual Property</h2>
            <h3 className="text-lg font-semibold text-white mb-2">6.1 Your Content</h3>
            <p>
              You retain ownership of content you create using our platform. By using AI Freedom Studios,
              you grant us a limited license to process and store your content solely to provide our services.
            </p>

            <h3 className="text-lg font-semibold text-white mb-2 mt-4">6.2 AI-Generated Content</h3>
            <p>
              Content generated by AI tools is provided "as-is." You are responsible for reviewing AI outputs
              before use. We do not guarantee accuracy, originality, or fitness for any particular purpose
              of AI-generated content.
            </p>

            <h3 className="text-lg font-semibold text-white mb-2 mt-4">6.3 Platform IP</h3>
            <p>
              AI Freedom Studios, its features, design, and underlying technology are our intellectual property.
              These terms grant you a limited, non-exclusive, non-transferable license to use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">7. Third-Party Integrations</h2>
            <p>
              The platform integrates with third-party services (GoHighLevel, Stripe, Twilio, OpenAI, Meta, Google, etc.).
              Use of these services is subject to their own terms of service and privacy policies.
              We are not responsible for third-party service availability, performance, or changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">8. AI Services Disclaimer</h2>
            <p>AI-generated outputs may:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Contain inaccuracies or errors ("hallucinations")</li>
              <li>Not always be suitable for professional use without review</li>
              <li>Be similar to content generated for other users</li>
            </ul>
            <p className="mt-3">
              Always review AI-generated content before publishing or using commercially.
              You are responsible for compliance with advertising regulations and platform policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">9. Disclaimer of Warranties</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED, ERROR-FREE, OR SECURE OPERATION.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AI FREEDOM STUDIOS SHALL NOT BE LIABLE FOR
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY
              SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless AI Freedom Studios from any claims, damages,
              or expenses arising from your use of the platform, violation of these terms,
              or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">12. Termination</h2>
            <p>
              Either party may terminate the agreement at any time. We may suspend or terminate
              your account immediately for violations of these terms. Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Your access to the platform will cease</li>
              <li>You may export your data within 30 days of termination</li>
              <li>We will delete your data per our retention policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">13. Governing Law</h2>
            <p>
              These terms are governed by the laws of the United States. Any disputes shall be
              resolved through binding arbitration, except for injunctive relief claims which
              may be brought in any court of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">14. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Material changes will be communicated
              via email or in-platform notification with 30 days' notice. Continued use
              after the effective date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">15. Contact</h2>
            <div className="p-5 bg-[#0F172A] rounded-xl border border-gray-800 space-y-2">
              <p><strong className="text-white">Company:</strong> AI Freedom Studios</p>
              <p><strong className="text-white">Website:</strong>{" "}
                <a href="https://aifreedomstudios.com" className="text-[#00D4FF] hover:underline">https://aifreedomstudios.com</a>
              </p>
              <p><strong className="text-white">Legal Email:</strong>{" "}
                <a href="mailto:legal@aifreedomstudios.com" className="text-[#00D4FF] hover:underline">legal@aifreedomstudios.com</a>
              </p>
              <p><strong className="text-white">Support:</strong>{" "}
                <a href="mailto:support@aifreedomstudios.com" className="text-[#00D4FF] hover:underline">support@aifreedomstudios.com</a>
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 mt-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} AI Freedom Studios. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="/" className="hover:text-gray-300 transition-colors">Home</a>
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-300 transition-colors text-gray-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}