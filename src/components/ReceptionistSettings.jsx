import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Phone,
  Clock,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Save,
  PlayCircle,
  Zap
} from "lucide-react";
import { showToast } from "@/components/ToastNotification";
import NurtureRulesManager from "@/components/NurtureRulesManager";
import NurtureAnalyticsDashboard from "@/components/NurtureAnalyticsDashboard";

export default function ReceptionistSettings({ user }) {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ["receptionistConfig", user?.email],
    queryFn: async () => {
      const configs = await base44.entities.ReceptionistConfig.filter({
        user_email: user.email
      });
      return configs[0] || {
        user_email: user.email,
        brand_name: "AI Freedom Studios",
        greeting_message: "Hi! You're speaking with the AI receptionist. How can I help today?",
        business_hours: {
          timezone: "America/New_York",
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { start: "10:00", end: "14:00", enabled: false },
          sunday: { start: "10:00", end: "14:00", enabled: false }
        },
        is_active: true
      };
    },
    enabled: !!user
  });

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (config) setFormData(config);
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (config?.id) {
        return await base44.entities.ReceptionistConfig.update(config.id, data);
      } else {
        return await base44.entities.ReceptionistConfig.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["receptionistConfig"]);
      showToast("Settings saved! 🎉", "success");
    }
  });

  if (!formData) return null;

  const handleSave = () => saveMutation.mutate(formData);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      
      <Tabs defaultValue="general">
        <TabsList className="bg-[#111317] rounded-xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="escalation">Escalation</TabsTrigger>
          <TabsTrigger value="nurture">
            <Zap className="w-4 h-4 mr-2" />
            Lead Nurture
          </TabsTrigger>
          <TabsTrigger value="faq">FAQ Knowledge</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <Label className="text-gray-300">Brand Name</Label>
                <Input
                  value={formData.brand_name}
                  onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Greeting Message</Label>
                <Textarea
                  value={formData.greeting_message}
                  onChange={(e) => setFormData({...formData, greeting_message: e.target.value})}
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white h-24"
                />
                <p className="text-gray-500 text-xs mt-1">
                  This is the first thing callers hear
                </p>
              </div>

              <div>
                <Label className="text-gray-300">After Hours Message</Label>
                <Textarea
                  value={formData.after_hours_message}
                  onChange={(e) => setFormData({...formData, after_hours_message: e.target.value})}
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white h-24"
                />
              </div>

              <div>
                <Label className="text-gray-300">Recording Disclaimer</Label>
                <Input
                  value={formData.recording_disclaimer}
                  onChange={(e) => setFormData({...formData, recording_disclaimer: e.target.value})}
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Legal disclosure played before recording starts
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0B0B0C] rounded-lg border border-gray-800">
                <div>
                  <Label className="text-gray-300">Receptionist Active</Label>
                  <p className="text-gray-500 text-sm mt-1">Enable AI receptionist</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="hours">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map((day) => {
                const dayConfig = formData.business_hours?.[day] || { start: "09:00", end: "17:00", enabled: true };
                return (
                  <div key={day} className="flex items-center gap-4 p-3 bg-[#0B0B0C] rounded-lg">
                    <Switch
                      checked={dayConfig.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        business_hours: {
                          ...formData.business_hours,
                          [day]: { ...dayConfig, enabled: checked }
                        }
                      })}
                    />
                    <div className="w-24">
                      <p className="text-white font-semibold capitalize">{day}</p>
                    </div>
                    {dayConfig.enabled ? (
                      <>
                        <Input
                          type="time"
                          value={dayConfig.start}
                          onChange={(e) => setFormData({
                            ...formData,
                            business_hours: {
                              ...formData.business_hours,
                              [day]: { ...dayConfig, start: e.target.value }
                            }
                          })}
                          className="w-32 bg-[#111317] border-gray-700 text-white"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={dayConfig.end}
                          onChange={(e) => setFormData({
                            ...formData,
                            business_hours: {
                              ...formData.business_hours,
                              [day]: { ...dayConfig, end: e.target.value }
                            }
                          })}
                          className="w-32 bg-[#111317] border-gray-700 text-white"
                        />
                      </>
                    ) : (
                      <span className="text-gray-500">Closed</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalation Tab */}
        <TabsContent value="escalation">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Escalation Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <Label className="text-gray-300">Low Confidence Threshold</Label>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.escalation_rules?.low_confidence_threshold || 0.55}
                  onChange={(e) => setFormData({
                    ...formData,
                    escalation_rules: {
                      ...formData.escalation_rules,
                      low_confidence_threshold: parseFloat(e.target.value)
                    }
                  })}
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Escalate if AI confidence below this level (0-1)
                </p>
              </div>

              <div>
                <Label className="text-gray-300">Escalation Phone</Label>
                <Input
                  value={formData.escalation_rules?.escalation_phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    escalation_rules: {
                      ...formData.escalation_rules,
                      escalation_phone: e.target.value
                    }
                  })}
                  placeholder="+1 555-123-4567"
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Escalation Email</Label>
                <Input
                  type="email"
                  value={formData.escalation_rules?.escalation_email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    escalation_rules: {
                      ...formData.escalation_rules,
                      escalation_email: e.target.value
                    }
                  })}
                  placeholder="support@yourcompany.com"
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Slack Webhook URL</Label>
                <Input
                  value={formData.escalation_rules?.slack_webhook || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    escalation_rules: {
                      ...formData.escalation_rules,
                      slack_webhook: e.target.value
                    }
                  })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-2 bg-[#0B0B0C] border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Get instant Slack notifications for escalated calls
                </p>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Nurture Tab */}
        <TabsContent value="nurture">
          <div className="space-y-6">
            <NurtureRulesManager user={user} />
            <NurtureAnalyticsDashboard user={user} />
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card className="bg-[#111317] border-gray-800 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                FAQ Knowledge Base
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Train the AI receptionist to answer common questions
              </p>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                <p className="text-yellow-400 text-sm">
                  💡 <strong>Coming Soon:</strong> FAQ editor will let you add Q&A pairs for the AI to reference
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isLoading}
          className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isLoading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      {/* Setup Guide */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Backend Setup Required
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 mb-2 font-semibold">1. Twilio Setup</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Buy phone number at twilio.com</li>
                <li>• Set Voice webhook: <code className="bg-black px-1 rounded">POST /api/telephony/inbound</code></li>
                <li>• Set Status callback: <code className="bg-black px-1 rounded">POST /api/telephony/status</code></li>
              </ul>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 mb-2 font-semibold">2. Backend Routes</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• Add <code className="bg-black px-1 rounded">server/telephony.js</code> router</li>
                <li>• Add <code className="bg-black px-1 rounded">server/receptionist.js</code> brain</li>
                <li>• Add <code className="bg-black px-1 rounded">server/scheduling.js</code> for GHL calendar</li>
              </ul>
            </div>

            <div className="p-3 bg-[#0B0B0C] rounded-lg">
              <p className="text-gray-400 mb-2 font-semibold">3. Env Variables</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• <code className="bg-black px-1 rounded">TWILIO_ACCOUNT_SID</code></li>
                <li>• <code className="bg-black px-1 rounded">TWILIO_AUTH_TOKEN</code></li>

              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}