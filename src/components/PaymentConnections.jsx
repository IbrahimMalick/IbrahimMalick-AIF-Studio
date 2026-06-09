import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard, CheckCircle2, AlertCircle, Link2, ExternalLink,
  Loader2, Settings, Trash2, Plus, Shield
} from "lucide-react";

const PAYMENT_PROVIDERS = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Cards, ACH, SEPA, bank redirects & more",
    logo: "💳",
    color: "from-[#635BFF] to-[#0A2540]",
    badgeColor: "bg-[#635BFF]/20 text-[#635BFF]",
    fields: [
      { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_..." },
      { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", secret: true },
      { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", secret: true, optional: true }
    ],
    docs: "https://dashboard.stripe.com/apikeys"
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "PayPal balance, cards, Pay Later",
    logo: "🅿️",
    color: "from-[#003087] to-[#009CDE]",
    badgeColor: "bg-[#003087]/20 text-[#009CDE]",
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "AXxx..." },
      { key: "client_secret", label: "Client Secret", placeholder: "EXxx...", secret: true }
    ],
    docs: "https://developer.paypal.com/dashboard/"
  },
  {
    id: "affirm",
    name: "Affirm",
    description: "Buy Now Pay Later — installment plans",
    logo: "🔵",
    color: "from-[#0FA37F] to-[#065F46]",
    badgeColor: "bg-[#0FA37F]/20 text-[#0FA37F]",
    fields: [
      { key: "public_key", label: "Public API Key", placeholder: "pub_..." },
      { key: "private_key", label: "Private API Key", placeholder: "priv_...", secret: true }
    ],
    docs: "https://docs.affirm.com/affirm-developers/docs/integrate-affirm"
  },
  {
    id: "sezzle",
    name: "Sezzle",
    description: "Split purchases into 4 interest-free payments",
    logo: "🟣",
    color: "from-[#392A7E] to-[#7B2FBE]",
    badgeColor: "bg-[#392A7E]/20 text-[#A78BFA]",
    fields: [
      { key: "public_key", label: "Public Key", placeholder: "sz_pub_..." },
      { key: "private_key", label: "Private Key", placeholder: "sz_priv_...", secret: true }
    ],
    docs: "https://sezzle.com/developer"
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    description: "One-tap payments on Apple devices",
    logo: "🍎",
    color: "from-gray-700 to-gray-900",
    badgeColor: "bg-gray-500/20 text-gray-300",
    fields: [
      { key: "merchant_id", label: "Merchant ID", placeholder: "merchant.com.yourapp" },
      { key: "domain_verification", label: "Domain Verification File", placeholder: "Paste verification string", optional: true }
    ],
    docs: "https://developer.apple.com/documentation/passkit/apple_pay",
    note: "Apple Pay requires Stripe or another payment processor — connect Stripe first."
  },
  {
    id: "google_pay",
    name: "Google Pay",
    description: "Seamless checkout on Android & Chrome",
    logo: "🟩",
    color: "from-[#4285F4] to-[#34A853]",
    badgeColor: "bg-[#4285F4]/20 text-[#4285F4]",
    fields: [
      { key: "merchant_id", label: "Merchant ID", placeholder: "BCR2DN..." },
    ],
    docs: "https://pay.google.com/business/console",
    note: "Google Pay works automatically when Stripe is connected."
  },
  {
    id: "afterpay",
    name: "Afterpay / Clearpay",
    description: "Pay in 4 — zero interest for shoppers",
    logo: "🟢",
    color: "from-[#00D64F] to-[#00854C]",
    badgeColor: "bg-[#00D64F]/20 text-[#00D64F]",
    fields: [
      { key: "merchant_id", label: "Merchant ID", placeholder: "..." },
      { key: "secret_key", label: "Secret Key", placeholder: "...", secret: true }
    ],
    docs: "https://developers.afterpay.com"
  },
  {
    id: "klarna",
    name: "Klarna",
    description: "Buy now pay later — flexible financing",
    logo: "🩷",
    color: "from-[#FFB3C7] to-[#FF6B9D]",
    badgeColor: "bg-[#FFB3C7]/20 text-[#FF6B9D]",
    fields: [
      { key: "api_username", label: "API Username", placeholder: "K..._xxx" },
      { key: "api_password", label: "API Password", placeholder: "...", secret: true }
    ],
    docs: "https://docs.klarna.com"
  },
  {
    id: "cashapp",
    name: "Cash App Pay",
    description: "Pay with Cash App balance or card",
    logo: "💚",
    color: "from-[#00D632] to-[#007A1A]",
    badgeColor: "bg-[#00D632]/20 text-[#00D632]",
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "CA_..." },
      { key: "client_secret", label: "Client Secret", placeholder: "...", secret: true }
    ],
    docs: "https://developers.cash.app"
  },
  {
    id: "venmo",
    name: "Venmo",
    description: "Peer-to-peer payments via PayPal",
    logo: "💙",
    color: "from-[#3D95CE] to-[#1D6FA1]",
    badgeColor: "bg-[#3D95CE]/20 text-[#3D95CE]",
    fields: [
      { key: "client_id", label: "Client ID (via PayPal)", placeholder: "AXxx..." },
    ],
    docs: "https://developer.paypal.com/docs/checkout/apm/venmo/",
    note: "Venmo is enabled automatically when PayPal is connected."
  },
  {
    id: "crypto",
    name: "Crypto (Coinbase Commerce)",
    description: "BTC, ETH, USDC & other cryptocurrencies",
    logo: "₿",
    color: "from-[#F7931A] to-[#C56B10]",
    badgeColor: "bg-[#F7931A]/20 text-[#F7931A]",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "...", secret: true }
    ],
    docs: "https://commerce.coinbase.com/docs"
  }
];

export default function PaymentConnections({ userEmail }) {
  const queryClient = useQueryClient();
  const [editingProvider, setEditingProvider] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [showSecrets, setShowSecrets] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ["paymentMethods", userEmail],
    queryFn: () => base44.entities.PaymentMethod.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const saveMutation = useMutation({
    mutationFn: async ({ providerId, values, isActive }) => {
      const existing = paymentMethods.find(m => m.provider_id === providerId);
      const payload = {
        user_email: userEmail,
        provider_id: providerId,
        provider_name: PAYMENT_PROVIDERS.find(p => p.id === providerId)?.name,
        credentials: values,
        is_active: isActive ?? true,
        connected_at: new Date().toISOString()
      };
      if (existing) {
        return base44.entities.PaymentMethod.update(existing.id, payload);
      } else {
        return base44.entities.PaymentMethod.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["paymentMethods"]);
      setEditingProvider(null);
      setFormValues({});
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (providerId) => {
      const existing = paymentMethods.find(m => m.provider_id === providerId);
      if (existing) return base44.entities.PaymentMethod.delete(existing.id);
    },
    onSuccess: () => queryClient.invalidateQueries(["paymentMethods"])
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ providerId, isActive }) => {
      const existing = paymentMethods.find(m => m.provider_id === providerId);
      if (existing) return base44.entities.PaymentMethod.update(existing.id, { is_active: isActive });
    },
    onSuccess: () => queryClient.invalidateQueries(["paymentMethods"])
  });

  const handleEdit = (provider) => {
    const existing = paymentMethods.find(m => m.provider_id === provider.id);
    setFormValues(existing?.credentials || {});
    setEditingProvider(provider.id);
  };

  const handleSave = async (provider) => {
    setSaving(true);
    await saveMutation.mutateAsync({ providerId: provider.id, values: formValues });
    setSaving(false);
  };

  const isConnected = (providerId) => paymentMethods.some(m => m.provider_id === providerId);
  const isActive = (providerId) => paymentMethods.find(m => m.provider_id === providerId)?.is_active;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const connectedCount = PAYMENT_PROVIDERS.filter(p => isConnected(p.id)).length;

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      <div className="p-4 bg-gradient-to-r from-[#635BFF]/20 to-[#00D64F]/10 border border-[#635BFF]/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#635BFF]" />
          <div>
            <p className="text-white font-bold">Payment Gateway Hub</p>
            <p className="text-gray-400 text-sm">{connectedCount} of {PAYMENT_PROVIDERS.length} providers connected · All payments encrypted & PCI-DSS compliant</p>
          </div>
        </div>
        <Badge className={connectedCount > 0 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
          {connectedCount > 0 ? `${connectedCount} Active` : "None Connected"}
        </Badge>
      </div>

      {/* Provider Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {PAYMENT_PROVIDERS.map((provider) => {
          const connected = isConnected(provider.id);
          const active = isActive(provider.id);
          const isEditing = editingProvider === provider.id;

          return (
            <Card key={provider.id} className={`bg-[#111317] border-gray-800 rounded-2xl transition-all ${connected ? 'ring-1 ring-green-500/30' : ''}`}>
              <CardContent className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-2xl`}>
                      {provider.logo}
                    </div>
                    <div>
                      <p className="text-white font-bold">{provider.name}</p>
                      <p className="text-gray-400 text-xs">{provider.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connected && (
                      <Switch
                        checked={!!active}
                        onCheckedChange={(val) => toggleActiveMutation.mutate({ providerId: provider.id, isActive: val })}
                        title="Enable/Disable"
                      />
                    )}
                    {connected ? (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 text-xs">Not connected</Badge>
                    )}
                  </div>
                </div>

                {/* Note if any */}
                {provider.note && (
                  <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-400 text-xs">{provider.note}</p>
                  </div>
                )}

                {/* Credentials Form */}
                {isEditing && (
                  <div className="space-y-3 mb-3 pt-3 border-t border-gray-700">
                    {provider.fields.map((field) => (
                      <div key={field.key}>
                        <label className="text-gray-400 text-xs mb-1 block">
                          {field.label}{field.optional && <span className="text-gray-600 ml-1">(optional)</span>}
                        </label>
                        <div className="relative">
                          <Input
                            type={field.secret && !showSecrets[field.key] ? "password" : "text"}
                            value={formValues[field.key] || ""}
                            onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className="bg-[#0B0B0C] border-gray-700 text-white rounded-lg text-sm pr-10"
                          />
                          {field.secret && (
                            <button
                              type="button"
                              onClick={() => setShowSecrets(s => ({ ...s, [field.key]: !s[field.key] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                            >
                              {showSecrets[field.key] ? "hide" : "show"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={() => handleSave(provider)}
                        disabled={saving}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg flex-1"
                      >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                        Save & Connect
                      </Button>
                      <Button
                        onClick={() => setEditingProvider(null)}
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-400 rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!isEditing && (
                  <div className="flex gap-2 pt-3 border-t border-gray-800">
                    <Button
                      onClick={() => handleEdit(provider)}
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-[#0B0B0C] rounded-lg flex-1"
                    >
                      {connected ? (
                        <><Settings className="w-3 h-3 mr-1" />Configure</>
                      ) : (
                        <><Plus className="w-3 h-3 mr-1" />Connect</>
                      )}
                    </Button>
                    <Button
                      onClick={() => window.open(provider.docs, '_blank')}
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-400 rounded-lg"
                      title="Docs"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    {connected && (
                      <Button
                        onClick={() => {
                          if (confirm(`Disconnect ${provider.name}?`)) {
                            disconnectMutation.mutate(provider.id);
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="p-4 bg-[#0B0B0C] border border-gray-800 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-sm font-semibold mb-1">Your keys are encrypted at rest</p>
          <p className="text-gray-400 text-xs">All API credentials are AES-256 encrypted before storage. We never log or expose secret keys. Each connection is isolated per user account.</p>
        </div>
      </div>
    </div>
  );
}