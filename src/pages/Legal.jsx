import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Cookie, Eye } from "lucide-react";

export default function Legal() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 heading-font">Legal</h1>
          <p className="text-gray-400">Terms, Privacy, and Policies</p>
        </div>

        <Tabs defaultValue="terms" className="space-y-6">
          <TabsList className="bg-[#111317] border border-gray-800 grid grid-cols-4">
            <TabsTrigger value="terms">
              <FileText className="w-4 h-4 mr-2" />
              Terms
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="cookies">
              <Cookie className="w-4 h-4 mr-2" />
              Cookies
            </TabsTrigger>
            <TabsTrigger value="gdpr">
              <Eye className="w-4 h-4 mr-2" />
              GDPR
            </TabsTrigger>
          </TabsList>

          {/* Terms of Service */}
          <TabsContent value="terms">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-8 prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-4">Terms of Service</h2>
                <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-gray-300">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                    <p>
                      By accessing and using AIFreedomDuane Studio, you accept and agree to be bound by the terms and provisions of this agreement.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">2. Use License</h3>
                    <p>
                      Permission is granted to temporarily use AIFreedomDuane Studio for personal or commercial purposes. This is the grant of a license, not a transfer of title.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Create and publish content using our platform</li>
                      <li>Access all features according to your subscription plan</li>
                      <li>Export your data at any time</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">3. Content Ownership</h3>
                    <p>
                      You retain full ownership of all content you create using our platform. AIFreedomDuane Studio claims no ownership rights over your content.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">4. Acceptable Use</h3>
                    <p>You agree not to use the platform to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Generate illegal, harmful, or abusive content</li>
                      <li>Violate any laws or regulations</li>
                      <li>Infringe on intellectual property rights</li>
                      <li>Distribute malware or viruses</li>
                      <li>Attempt to gain unauthorized access</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">5. Subscription & Billing</h3>
                    <p>
                      Subscriptions are billed monthly or annually. You can cancel anytime. Refunds are provided on a case-by-case basis within 30 days of purchase.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">6. Termination</h3>
                    <p>
                      We reserve the right to terminate or suspend your account if you violate these terms. Upon termination, you will lose access to the platform but can export your data.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">7. Limitation of Liability</h3>
                    <p>
                      AIFreedomDuane Studio shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">8. Changes to Terms</h3>
                    <p>
                      We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use constitutes acceptance.
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Policy */}
          <TabsContent value="privacy">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-8 prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-4">Privacy Policy</h2>
                <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-gray-300">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Information We Collect</h3>
                    <p>We collect information you provide directly:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Name and email address</li>
                      <li>Payment information (processed securely by Stripe)</li>
                      <li>Content you create (videos, posts, documents)</li>
                      <li>Usage data and analytics</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">How We Use Your Information</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Provide and improve our services</li>
                      <li>Process payments and send receipts</li>
                      <li>Send important service updates</li>
                      <li>Respond to support requests</li>
                      <li>Analyze platform usage for improvements</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Data Security</h3>
                    <p>
                      We implement industry-standard security measures including encryption, secure servers, and regular security audits.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Data Sharing</h3>
                    <p>We never sell your personal data. We only share data with:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Service providers (Stripe for payments, AWS for hosting)</li>
                      <li>When required by law</li>
                      <li>With your explicit consent</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Your Rights</h3>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Access your personal data</li>
                      <li>Correct inaccurate data</li>
                      <li>Request deletion of your data</li>
                      <li>Export your data</li>
                      <li>Opt-out of marketing emails</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Contact Us</h3>
                    <p>
                      For privacy concerns, contact us at: privacy@aifreedomduane.com
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cookie Policy */}
          <TabsContent value="cookies">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-8 prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-4">Cookie Policy</h2>
                
                <div className="space-y-6 text-gray-300">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">What Are Cookies?</h3>
                    <p>
                      Cookies are small text files stored on your device that help us provide a better experience.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Cookies We Use</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-white">Essential Cookies</h4>
                        <p className="text-sm">Required for the platform to function (login, security)</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Analytics Cookies</h4>
                        <p className="text-sm">Help us understand how you use the platform</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Preference Cookies</h4>
                        <p className="text-sm">Remember your settings (theme, language)</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Managing Cookies</h3>
                    <p>
                      You can control cookies through your browser settings. Blocking essential cookies may impact functionality.
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GDPR */}
          <TabsContent value="gdpr">
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-8 prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-4">GDPR Compliance</h2>
                
                <div className="space-y-6 text-gray-300">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Your Data Rights</h3>
                    <p>Under GDPR, you have the following rights:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li><strong>Right to Access:</strong> Request a copy of your data</li>
                      <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
                      <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                      <li><strong>Right to Portability:</strong> Export your data</li>
                      <li><strong>Right to Object:</strong> Opt-out of certain processing</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Data Processing</h3>
                    <p>We process your data based on:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Your consent</li>
                      <li>Contract fulfillment (providing services)</li>
                      <li>Legitimate interests (platform improvement)</li>
                      <li>Legal obligations</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Data Retention</h3>
                    <p>
                      We retain your data as long as your account is active. Upon deletion request, we remove all personal data within 30 days, except where legally required to retain.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-2">Exercise Your Rights</h3>
                    <p>
                      To exercise any GDPR rights, contact us at: gdpr@aifreedomduane.com or use the data export tool in your account settings.
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}