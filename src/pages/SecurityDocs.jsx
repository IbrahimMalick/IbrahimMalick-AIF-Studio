import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  Key,
  Eye,
  FileText,
  Bell,
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function SecurityDocs() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#00D4C9]" />
            Security & Compliance
          </h1>
          <p className="text-gray-400">
            How AI Freedom Studios protects accounts, data, media, and automations
          </p>
        </div>

        {/* What We Protect */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#FFD700]" />
              What We Protect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                'Accounts & roles (Owner/Admin/Manager/Viewer)',
                'API keys & OAuth tokens (Meta, GHL, Email, CTV, LLMs)',
                'User content (videos, avatars/voice, docs, analytics)',
                'Webhooks & automations (publish, DM, payments)',
                'Billing & PII'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Security Controls */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-[#00D4C9]" />
              Security Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: 'RBAC (Role-Based Access Control)',
                  desc: 'Least-privilege roles + route guards',
                  icon: Eye
                },
                {
                  title: 'Token Security',
                  desc: 'Encrypted at rest, 90-day rotation, scoped permissions',
                  icon: Key
                },
                {
                  title: 'Media Access',
                  desc: 'Time-limited signed URLs (≤15 min)',
                  icon: FileText
                },
                {
                  title: 'Inbound Webhooks',
                  desc: 'HMAC verification, replay protection',
                  icon: Bell
                },
                {
                  title: 'Rate Limits',
                  desc: 'Per-IP and per-user on mutating endpoints',
                  icon: AlertTriangle
                },
                {
                  title: 'Audit Trails',
                  desc: 'Append-only logs for auth, settings, publishing, billing',
                  icon: Database
                },
                {
                  title: 'Security Headers',
                  desc: 'CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options',
                  icon: Shield
                }
              ].map((control, idx) => {
                const Icon = control.icon;
                return (
                  <div key={idx} className="p-3 bg-[#0B0B0C] rounded-lg flex items-start gap-3">
                    <Icon className="w-5 h-5 text-[#00D4C9] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold text-sm">{control.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{control.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#FFD700]" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-[#0B0B0C] rounded">
                <span className="text-gray-300 text-sm">Voice uploads</span>
                <Badge className="bg-blue-500/20 text-blue-400">Purged &lt; 72h after model creation</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0B0B0C] rounded">
                <span className="text-gray-300 text-sm">Transient renders</span>
                <Badge className="bg-blue-500/20 text-blue-400">7–30d (configurable)</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0B0B0C] rounded">
                <span className="text-gray-300 text-sm">Audit logs</span>
                <Badge className="bg-blue-500/20 text-blue-400">180d default</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Privacy */}
        <Card className="bg-gradient-to-br from-[#00D4C9]/10 to-[#06D6A0]/10 border-[#00D4C9]/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#00D4C9]" />
              User Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                <strong>No model training</strong> on customer data unless explicitly opted in
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                <strong>Customer-managed</strong> deletion and export
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                <strong>GDPR compliant</strong> data handling and retention
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices for Users */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-semibold text-sm mb-1">✓ DO</p>
                <ul className="space-y-1 ml-4">
                  <li className="text-gray-300 text-xs">• Enable 2FA for your account</li>
                  <li className="text-gray-300 text-xs">• Rotate API keys every 90 days</li>
                  <li className="text-gray-300 text-xs">• Use unique passwords for each service</li>
                  <li className="text-gray-300 text-xs">• Monitor Last Activity regularly</li>
                  <li className="text-gray-300 text-xs">• Review team member permissions quarterly</li>
                </ul>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-semibold text-sm mb-1">✗ DON'T</p>
                <ul className="space-y-1 ml-4">
                  <li className="text-gray-300 text-xs">• Share API keys in public channels</li>
                  <li className="text-gray-300 text-xs">• Grant more permissions than needed</li>
                  <li className="text-gray-300 text-xs">• Ignore security alerts</li>
                  <li className="text-gray-300 text-xs">• Use weak or reused passwords</li>
                  <li className="text-gray-300 text-xs">• Disable webhooks HMAC verification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="text-center space-x-4">
          <a href="/Legal" className="text-[#00D4C9] hover:text-[#FFD700] transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-600">·</span>
          <a href="/Legal" className="text-[#00D4C9] hover:text-[#FFD700] transition-colors">
            Terms of Service
          </a>
          <span className="text-gray-600">·</span>
          <a href="/Legal" className="text-[#00D4C9] hover:text-[#FFD700] transition-colors">
            Content Guidelines
          </a>
        </div>

        {/* Security Contact */}
        <Card className="bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border-[#9D4EDD]/30 rounded-2xl">
          <CardContent className="p-6">
            <h4 className="text-white font-bold mb-2">🛡️ Report Security Issues</h4>
            <p className="text-gray-300 text-sm mb-3">
              If you discover a security vulnerability, please report it to:
            </p>
            <p className="text-[#00D4C9] font-mono text-sm">security@aifreedomstudios.com</p>
            <p className="text-gray-500 text-xs mt-2">
              We take security seriously and respond to all reports within 24 hours.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}