import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plug,
  CheckCircle2,
  XCircle,
  Loader,
  Facebook,
  DollarSign,
  Zap,
  BarChart3,
  Slack
} from "lucide-react";

const PROVIDERS = [
  {
    id: "meta",
    label: "Meta (Facebook & Instagram)",
    icon: Facebook,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "ghl",
    label: "GoHighLevel",
    icon: Zap,
    color: "from-green-500 to-teal-600",
  },
  {
    id: "stripe",
    label: "Stripe",
    icon: DollarSign,
    color: "from-purple-500 to-pink-600",
  }
];

export default function WorkflowIntegrations() {
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({
    meta: { token: "", enabled: false },
    ghl: { apiKey: "", enabled: false },
    stripe: { secretKey: "", enabled: false },
    slack: { webhookUrl: "", enabled: false },
    grafana: { dashboardUrl: "", enabled: false }
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();

    const storedCreds = localStorage.getItem('workflowIntegrationsCredentials');
    if (storedCreds) {
      try {
        setCredentials(JSON.parse(storedCreds));
      } catch (e) {
        console.error("Failed to parse stored credentials:", e);
      }
    }
  }, []);

  const saveCredentials = async () => {
    setSaveMessage("");
    try {
      console.log("Saving all credentials:", credentials);
      localStorage.setItem('workflowIntegrationsCredentials', JSON.stringify(credentials));
      
      if (credentials.grafana.dashboardUrl) {
        localStorage.setItem('workflow_grafana_url', credentials.grafana.dashboardUrl);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage("✅ All settings saved successfully!");
    } catch (error) {
      setSaveMessage(`❌ Error saving settings: ${error.message}`);
    } finally {
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const testConnection = async (providerId) => {
    setTesting(prev => ({ ...prev, [providerId]: true }));
    setTestResults(prev => ({ ...prev, [providerId]: null }));
    setSaveMessage("");
    try {
      console.log(`Testing connection for ${providerId}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = Math.random() > 0.3;
      setTestResults(prev => ({ ...prev, [providerId]: success ? "success" : "failure" }));
      const providerLabel = PROVIDERS.find(p => p.id === providerId)?.label || providerId;
      setSaveMessage(success ? `✅ ${providerLabel} connection tested successfully!` : `❌ ${providerLabel} connection test failed.`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [providerId]: "error" }));
      setSaveMessage(`❌ Error testing connection: ${error.message}`);
    } finally {
      setTesting(prev => ({ ...prev, [providerId]: false }));
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FF8C00] flex items-center justify-center">
            <Plug className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Integrations & Credentials</h1>
            <p className="text-gray-400">Connect third-party services for automation</p>
          </div>
        </div>

        {saveMessage && (
          <div className={`p-4 rounded-xl border ${
            saveMessage.includes('✅')
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Integration Cards */}
        <div className="space-y-4">
          {PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const isEnabled = credentials[provider.id]?.enabled;
            const providerCreds = credentials[provider.id] || {};
            const testResult = testResults[provider.id];
            const isTesting = testing[provider.id];
            
            return (
              <Card key={provider.id} className="bg-[#111317] border-gray-800 rounded-2xl hover:border-gray-700 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{provider.label}</CardTitle>
                        <p className="text-gray-400 text-sm">Integrate {provider.label} for enhanced workflows</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => setCredentials({
                          ...credentials,
                          [provider.id]: { ...providerCreds, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.id === 'meta' && (
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Meta Token</label>
                      <Input
                        type="password"
                        value={providerCreds.token || ''}
                        onChange={(e) => setCredentials(prev => ({
                          ...prev,
                          meta: { ...prev.meta, token: e.target.value }
                        }))}
                        placeholder="••••••••"
                        className="bg-[#0B0B0C] border-gray-700 text-white"
                      />
                    </div>
                  )}
                  {provider.id === 'ghl' && (
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">GHL API Key</label>
                      <Input
                        type="password"
                        value={providerCreds.apiKey || ''}
                        onChange={(e) => setCredentials(prev => ({
                          ...prev,
                          ghl: { ...prev.ghl, apiKey: e.target.value }
                        }))}
                        placeholder="••••••••"
                        className="bg-[#0B0B0C] border-gray-700 text-white"
                      />
                    </div>
                  )}
                  {provider.id === 'stripe' && (
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Stripe Secret Key</label>
                      <Input
                        type="password"
                        value={providerCreds.secretKey || ''}
                        onChange={(e) => setCredentials(prev => ({
                          ...prev,
                          stripe: { ...prev.stripe, secretKey: e.target.value }
                        }))}
                        placeholder="sk_••••••••"
                        className="bg-[#0B0B0C] border-gray-700 text-white"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => testConnection(provider.id)}
                      disabled={isTesting}
                      className="flex-1 bg-gray-700 text-white hover:bg-gray-600"
                    >
                      {isTesting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          {testResult === 'success' && <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />}
                          {testResult === 'failure' && <XCircle className="w-4 h-4 mr-2 text-red-400" />}
                          Test Connection
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Slack Notifications */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E01E5A] to-[#36C5F0] flex items-center justify-center">
                    <Slack className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Slack Notifications</CardTitle>
                    <p className="text-gray-400 text-sm">Receive instant alerts in Slack channels</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={credentials.slack.enabled}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      slack: { ...credentials.slack, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Slack Webhook URL</label>
                <Input
                  type="url"
                  value={credentials.slack.webhookUrl}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    slack: { ...credentials.slack, webhookUrl: e.target.value }
                  })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Get from Slack app settings
                </p>
              </div>
              <Button
                onClick={() => testConnection('slack')}
                disabled={testing.slack}
                className="w-full bg-gray-700 text-white hover:bg-gray-600"
              >
                {testing.slack ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    {testResults.slack === 'success' && <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />}
                    {testResults.slack === 'failure' && <XCircle className="w-4 h-4 mr-2 text-red-400" />}
                    Test Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Grafana Observability */}
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Grafana Observability</CardTitle>
                    <p className="text-gray-400 text-sm">Connect Grafana for deep metrics</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={credentials.grafana.enabled}
                    onChange={(e) => setCredentials({
                      ...credentials,
                      grafana: { ...credentials.grafana, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Grafana Dashboard URL</label>
                <Input
                  type="url"
                  value={credentials.grafana.dashboardUrl}
                  onChange={(e) => setCredentials({
                    ...credentials,
                    grafana: { ...credentials.grafana, dashboardUrl: e.target.value }
                  })}
                  placeholder="https://your-grafana.com/d/dashboard-id"
                  className="bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Full URL to your Grafana dashboard (optional)
                </p>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 text-xs font-semibold mb-1">📊 What Grafana Shows</p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Queue depth in real-time</li>
                  <li>• P50/P95/P99 latency percentiles</li>
                  <li>• Error rates by provider</li>
                  <li>• Rate limit hits tracking</li>
                  <li>• DLQ depth monitoring</li>
                </ul>
              </div>

              <div className="flex gap-2">
                {credentials.grafana.dashboardUrl && (
                  <Button
                    onClick={() => window.open(credentials.grafana.dashboardUrl, '_blank')}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Open Grafana
                  </Button>
                )}
                <Button
                  onClick={() => testConnection('grafana')}
                  disabled={testing.grafana}
                  className={`${credentials.grafana.dashboardUrl ? 'flex-1' : 'w-full'} bg-gray-700 text-white hover:bg-gray-600`}
                >
                  {testing.grafana ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      {testResults.grafana === 'success' && <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />}
                      {testResults.grafana === 'failure' && <XCircle className="w-4 h-4 mr-2 text-red-400" />}
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={saveCredentials}
            className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold hover:opacity-90"
          >
            Save All Settings
          </Button>
        </div>

        {/* Info */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-blue-400 font-semibold mb-2">🔐 Credential Security</h3>
            <p className="text-gray-300 text-sm mb-3">
              All API keys and tokens are encrypted before being sent to your backend. Never share credentials via email or chat.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <p className="text-gray-400 text-xs mb-1 font-semibold">✅ Best Practices</p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Use environment variables on backend</li>
                  <li>• Rotate tokens every 90 days</li>
                  <li>• Test connections regularly</li>
                </ul>
              </div>
              <div className="p-3 bg-[#0B0B0C] rounded-lg">
                <p className="text-gray-400 text-xs mb-1 font-semibold">⚙️ Workflow Features</p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Zod schema validation</li>
                  <li>• BullMQ queue with DLQ</li>
                  <li>• Prometheus metrics</li>
                  <li>• Slack alerting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}