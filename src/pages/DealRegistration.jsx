import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Users
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";

export default function DealRegistration() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: partner } = useQuery({
    queryKey: ["partner", user?.email],
    queryFn: async () => {
      const partners = await base44.entities.PartnerAffiliate.filter({
        user_email: user.email
      });
      return partners[0] || null;
    },
    enabled: !!user
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["dealRegistrations", partner?.id],
    queryFn: () => base44.entities.DealRegistration.filter({
      partner_id: partner.id
    }, "-created_date"),
    enabled: !!partner
  });

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    estimated_value_usd: 0,
    estimated_users: 0,
    expected_close_date: "",
    industry: "",
    use_case: "",
    notes: ""
  });

  const registerDealMutation = useMutation({
    mutationFn: (data) => base44.entities.DealRegistration.create({
      ...data,
      partner_id: partner.id,
      status: "active",
      protection_window_days: 60,
      stage: "discovery",
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["dealRegistrations"]);
      setShowForm(false);
      setFormData({
        company_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        estimated_value_usd: 0,
        estimated_users: 0,
        expected_close_date: "",
        industry: "",
        use_case: "",
        notes: ""
      });
      showToast("Deal registered successfully! 🎯", "success");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.contact_email) {
      showToast("Please fill required fields", "error");
      return;
    }
    registerDealMutation.mutate(formData);
  };

  if (!partner || partner.partner_type === 'affiliate') {
    return (
      <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <p className="text-white font-semibold mb-2">Deal Registration Not Available</p>
              <p className="text-gray-400 text-sm">
                Deal registration is only available for Reseller and Strategic partners.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeDeals = deals.filter(d => d.status === 'active');
  const wonDeals = deals.filter(d => d.status === 'won');

  return (
    <div className="min-h-screen bg-[#0C0C0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-[#FFD700]" />
              Deal Registration
            </h1>
            <p className="text-gray-400">
              Protect your enterprise opportunities with 60-90 day exclusivity
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
          >
            {showForm ? 'Cancel' : 'Register New Deal'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 mb-3 text-blue-400" />
              <p className="text-gray-400 text-sm mb-1">Active Deals</p>
              <p className="text-3xl font-bold text-white">{activeDeals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <CheckCircle2 className="w-8 h-8 mb-3 text-green-400" />
              <p className="text-gray-400 text-sm mb-1">Won Deals</p>
              <p className="text-3xl font-bold text-white">{wonDeals.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 mb-3 text-[#FFD700]" />
              <p className="text-gray-400 text-sm mb-1">Pipeline Value</p>
              <p className="text-3xl font-bold text-white">
                ${activeDeals.reduce((sum, d) => sum + (d.estimated_value_usd || 0), 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form */}
        {showForm && (
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">Register New Deal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Company Name *</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Acme Corp"
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Industry</Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="SaaS, E-commerce, etc."
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Contact Name *</Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="John Smith"
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Contact Email *</Label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="john@acme.com"
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Contact Phone</Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Expected Users</Label>
                    <Input
                      type="number"
                      value={formData.estimated_users}
                      onChange={(e) => setFormData({...formData, estimated_users: parseInt(e.target.value) || 0})}
                      placeholder="10"
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Estimated Deal Value (USD)</Label>
                    <Input
                      type="number"
                      value={formData.estimated_value_usd}
                      onChange={(e) => setFormData({...formData, estimated_value_usd: parseInt(e.target.value) || 0})}
                      placeholder="10000"
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Expected Close Date</Label>
                    <Input
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                      className="bg-[#0B0B0C] border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Use Case</Label>
                  <Input
                    value={formData.use_case}
                    onChange={(e) => setFormData({...formData, use_case: e.target.value})}
                    placeholder="What they'll use the platform for"
                    className="bg-[#0B0B0C] border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Additional Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional context about this opportunity..."
                    className="bg-[#0B0B0C] border-gray-700 text-white h-24"
                  />
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <h4 className="text-blue-400 font-semibold text-sm mb-2">Protection Terms</h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>• 60-day exclusivity window (extendable to 90)</li>
                    <li>• Earliest valid registration wins if duplicate</li>
                    <li>• Co-sell encouraged for late-stage deals</li>
                    <li>• Must update deal status within 14 days</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={registerDealMutation.isLoading}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold py-6 text-lg"
                >
                  {registerDealMutation.isLoading ? 'Registering...' : 'Register Deal'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Deal List */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Your Registered Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length > 0 ? (
              <div className="space-y-3">
                {deals.map((deal) => {
                  const daysRemaining = deal.expires_at 
                    ? Math.max(0, Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
                    : 0;

                  return (
                    <div key={deal.id} className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="w-4 h-4 text-gray-400" />
                            <h4 className="text-white font-bold">{deal.company_name}</h4>
                            <Badge className={`text-xs ${
                              deal.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                              deal.status === 'won' ? 'bg-green-500/20 text-green-400' :
                              deal.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {deal.status}
                            </Badge>
                            <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs capitalize">
                              {deal.stage}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            {deal.contact_name} • {deal.contact_email}
                          </p>
                          {deal.use_case && (
                            <p className="text-gray-500 text-xs">
                              Use Case: {deal.use_case}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">
                            ${deal.estimated_value_usd.toLocaleString()}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {deal.estimated_users} users
                          </p>
                          {deal.status === 'active' && (
                            <p className="text-blue-400 text-xs mt-1">
                              {daysRemaining} days protected
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs">
                        <div className="flex-1 p-2 bg-[#111317] rounded text-center">
                          <p className="text-gray-500">Registered</p>
                          <p className="text-white font-semibold">
                            {new Date(deal.registered_at || deal.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        {deal.expected_close_date && (
                          <div className="flex-1 p-2 bg-[#111317] rounded text-center">
                            <p className="text-gray-500">Expected Close</p>
                            <p className="text-white font-semibold">
                              {new Date(deal.expected_close_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {deal.last_activity && (
                          <div className="flex-1 p-2 bg-[#111317] rounded text-center">
                            <p className="text-gray-500">Last Update</p>
                            <p className="text-white font-semibold">
                              {new Date(deal.last_activity).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 mb-2">No registered deals yet</p>
                <p className="text-gray-500 text-sm mb-4">
                  Register your first enterprise deal to protect your commission
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
                >
                  Register First Deal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Program Info */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Deal Registration Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "60-90 Day Protection",
                  desc: "Exclusive rights to work the deal during protection window",
                  icon: Clock
                },
                {
                  title: "First-to-File Priority",
                  desc: "Earliest valid registration wins if multiple partners claim",
                  icon: Target
                },
                {
                  title: "Co-Sell Support",
                  desc: "We join late-stage calls to help close enterprise deals",
                  icon: Users
                },
                {
                  title: "Higher Revenue Share",
                  desc: "Premier tier partners get 35% revenue share on registered deals",
                  icon: TrendingUp
                }
              ].map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{benefit.title}</h4>
                      <p className="text-gray-400 text-xs">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}