import React from "react";
import { Shield, ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#00D4FF]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-gray-400 text-sm mt-1">Last updated: January 2025</p>
          </div>
        </div>

        <div className="prose prose-invert prose-lg max-w-none space-y-10 text-gray-300">

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              AI Freedom Studios ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our platform at{" "}
              <a href="https://aifreedomstudios.com" className="text-[#00D4FF] hover:underline">aifreedomstudios.com</a>.
            </p>
            <p className="mt-3">
              By accessing or using AI Freedom Studios, you agree to this Privacy Policy. If you do not agree,
              please discontinue use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-white mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Account registration information (name, email address, password)</li>
              <li>Business information (company name, industry, website)</li>
              <li>Payment information (processed securely via Stripe — we do not store card numbers)</li>
              <li>Content you create using our AI tools (videos, images, scripts, campaigns)</li>
              <li>CRM data (contacts, leads, deals) you import or create</li>
              <li>Communications you send to us (support requests, feedback)</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-2 mt-5">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Usage data (features accessed, actions taken, time spent)</li>
              <li>Device information (browser type, operating system, IP address)</li>
              <li>Log data (access times, pages viewed, errors)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-2 mt-5">2.3 Third-Party Data</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>OAuth data from connected services (Google, social media accounts)</li>
              <li>CRM data synced from GoHighLevel or other integrated platforms</li>
              <li>Analytics data from connected ad platforms (Meta, Google Ads, TikTok)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide, operate, and improve AI Freedom Studios services</li>
              <li>To process transactions and send related information (receipts, invoices)</li>
              <li>To personalize your experience and deliver AI-generated content</li>
              <li>To send administrative information, updates, and security alerts</li>
              <li>To respond to support requests and communicate with you</li>
              <li>To analyze usage patterns and improve platform performance</li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To prevent fraud, abuse, and security incidents</li>
            </ul>
            <p className="mt-4 text-yellow-400 font-medium">
              ⚠️ We do NOT use your content or data to train AI models without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Information Sharing</h2>
            <p>We do not sell your personal information. We share data only in these circumstances:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong className="text-white">Service Providers:</strong> Trusted vendors (Stripe, AWS, Twilio, ElevenLabs, HeyGen) who assist in platform operations under strict data processing agreements.</li>
              <li><strong className="text-white">AI Model Providers:</strong> Prompts and inputs are sent to AI providers (OpenAI, Anthropic, Google) to generate responses. These providers have their own privacy policies.</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, regulation, or valid legal process.</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
              <li><strong className="text-white">Your Authorization:</strong> When you explicitly authorize integration with third-party services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Data Security</h2>
            <p>We implement enterprise-grade security measures including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li>SOC 2 Type II certified infrastructure</li>
              <li>End-to-end encryption for data in transit (TLS 1.2+) and at rest (AES-256)</li>
              <li>Role-based access controls (RBAC) with principle of least privilege</li>
              <li>Two-factor authentication (2FA) support</li>
              <li>Regular security audits and penetration testing</li>
              <li>Comprehensive audit logs for all account activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Account data is retained as long as your account is active</li>
              <li>Upon account deletion, personal data is purged within 30 days</li>
              <li>Backup copies may persist for up to 90 days for disaster recovery</li>
              <li>Audit logs are retained for 1 year for security purposes</li>
              <li>Voice recordings and call transcripts are retained for 90 days by default</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">7. Your Rights (GDPR & CCPA)</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
              <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your personal data</li>
              <li><strong className="text-white">Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong className="text-white">Restriction:</strong> Restrict processing of your data</li>
              <li><strong className="text-white">Objection:</strong> Object to certain types of data processing</li>
              <li><strong className="text-white">Opt-Out:</strong> Opt out of marketing communications at any time</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:privacy@aifreedomstudios.com" className="text-[#00D4FF] hover:underline">privacy@aifreedomstudios.com</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">8. Cookies</h2>
            <p>
              We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage.
              You can control cookie settings through your browser. Note that disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">9. Children's Privacy</h2>
            <p>
              AI Freedom Studios is not directed to individuals under 18 years of age. We do not knowingly collect
              personal information from children. If you believe a child has provided us with information,
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">10. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in the United States and other countries.
              We ensure appropriate safeguards are in place for international transfers, including
              Standard Contractual Clauses for transfers from the EU/EEA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes
              via email or an in-platform notification. Your continued use of the platform after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">12. Contact Us</h2>
            <p>For privacy-related questions or to exercise your rights, contact us:</p>
            <div className="mt-3 p-5 bg-[#0F172A] rounded-xl border border-gray-800 space-y-2">
              <p><strong className="text-white">Company:</strong> AI Freedom Studios</p>
              <p><strong className="text-white">Website:</strong>{" "}
                <a href="https://aifreedomstudios.com" className="text-[#00D4FF] hover:underline">https://aifreedomstudios.com</a>
              </p>
              <p><strong className="text-white">Privacy Email:</strong>{" "}
                <a href="mailto:privacy@aifreedomstudios.com" className="text-[#00D4FF] hover:underline">privacy@aifreedomstudios.com</a>
              </p>
              <p><strong className="text-white">Support Email:</strong>{" "}
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
            <a href="/privacy" className="hover:text-gray-300 transition-colors text-gray-300">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}