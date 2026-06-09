import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Video,
  FileText,
  CheckCircle2,
  ArrowRight,
  Rocket,
  Target,
  Zap,
  Users,
  DollarSign,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    daily_budget_usd: 10,
    monthly_budget_usd: 100,
    email_notifications: true,
    default_video_resolution: "1920x1080",
    default_art_style: "digital_art",
    goals: [],
    use_case: "",
    team_size: "solo"
  });

  const savePreferences = useMutation({
    mutationFn: async () => {
      await base44.entities.UserPreferences.create({
        user_email: user.email,
        ...preferences,
        onboarding_completed: true
      });
      
      // Create welcome notification
      await base44.entities.Notification.create({
        user_email: user.email,
        title: "🎉 Welcome to AIFreedomDuane Studio!",
        message: "You're all set! Start creating amazing content. Check out the Quick Start guide in the Dashboard.",
        type: "success",
        category: "system",
        action_url: "/Dashboard",
        action_label: "Go to Dashboard"
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "login",
        entity_type: "User",
        entity_name: "Onboarding completed"
      });
    },
    onSuccess: () => {
      onComplete();
    },
  });

  const steps = [
    {
      number: 1,
      title: "Welcome to Creative Freedom",
      description: "Your journey to content mastery begins here",
      icon: Rocket,
      color: "from-[#FF4433] to-[#FF8C00]"
    },
    {
      number: 2,
      title: "What Brings You Here?",
      description: "Tell us your goals so we can personalize your experience",
      icon: Target,
      color: "from-[#FF8C00] to-[#A89C94]"
    },
    {
      number: 3,
      title: "Set Your Limits",
      description: "Smart budget controls to keep AI costs in check",
      icon: DollarSign,
      color: "from-[#A89C94] to-[#1E90FF]"
    },
    {
      number: 4,
      title: "Customize Your Defaults",
      description: "Set preferences for faster content creation",
      icon: Sparkles,
      color: "from-[#1E90FF] to-[#FF4433]"
    },
    {
      number: 5,
      title: "Ready to Create!",
      description: "Everything is set. Let's build something amazing.",
      icon: Trophy,
      color: "from-[#FF4433] to-[#1E90FF]"
    }
  ];

  const currentStep = steps[step - 1];

  const goals = [
    { id: "video_creation", label: "Create Professional Videos", icon: Video },
    { id: "ai_art", label: "Generate AI Art", icon: Sparkles },
    { id: "research", label: "Analyze Documents", icon: FileText },
    { id: "automation", label: "Automate Workflows", icon: Zap },
    { id: "team_collab", label: "Team Collaboration", icon: Users },
  ];

  const useCases = [
    { id: "content_creator", label: "Content Creator", desc: "YouTube, TikTok, Instagram" },
    { id: "agency", label: "Marketing Agency", desc: "Client work & campaigns" },
    { id: "coach", label: "Coach/Educator", desc: "Courses & training materials" },
    { id: "entrepreneur", label: "Entrepreneur", desc: "Business & product videos" },
    { id: "other", label: "Other", desc: "Custom use case" }
  ];

  const toggleGoal = (goalId) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">Step {step} of {steps.length}</p>
              <p className="text-gray-400 text-sm">{Math.round((step / steps.length) * 100)}% Complete</p>
            </div>
            <div className="w-full h-2 bg-[#0B0B0C] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF4433] to-[#1E90FF]"
                initial={{ width: 0 }}
                animate={{ width: `${(step / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s.number
                      ? `bg-gradient-to-r ${s.color} text-white`
                      : 'bg-[#0B0B0C] text-gray-600'
                  }`}
                >
                  {step > s.number ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="font-bold text-sm">{s.number}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s.number ? 'bg-gradient-to-r from-[#FF4433] to-[#1E90FF]' : 'bg-[#0B0B0C]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Welcome */}
              {step === 1 && (
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center mb-6 brand-glow`}>
                    <currentStep.icon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-3">
                    {currentStep.title}
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    {currentStep.description}
                  </p>
                  
                  <div className="bg-[#0B0B0C] rounded-xl p-6 mb-8">
                    <h3 className="text-white font-bold mb-4 text-lg">The AIFreedomDuane Promise</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-[#FF4433] to-[#FF8C00] flex items-center justify-center mb-2">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white font-semibold text-sm mb-1">Mentorship</p>
                        <p className="text-gray-500 text-xs">Learn from the best</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-[#A89C94] to-[#1E90FF] flex items-center justify-center mb-2">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white font-semibold text-sm mb-1">Systems</p>
                        <p className="text-gray-500 text-xs">Build once, scale forever</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-[#1E90FF] to-[#FF4433] flex items-center justify-center mb-2">
                          <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white font-semibold text-sm mb-1">Freedom</p>
                        <p className="text-gray-500 text-xs">Create on your terms</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FF4433] transition-all">
                      <Video className="w-8 h-8 text-[#FF4433] mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">Video Studio</p>
                      <p className="text-gray-500 text-xs mt-1">JSON to video in minutes</p>
                    </div>
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#FF8C00] transition-all">
                      <Sparkles className="w-8 h-8 text-[#FF8C00] mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">AI Art Lab</p>
                      <p className="text-gray-500 text-xs mt-1">8 artistic styles</p>
                    </div>
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800 hover:border-[#1E90FF] transition-all">
                      <FileText className="w-8 h-8 text-[#1E90FF] mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">Research Hub</p>
                      <p className="text-gray-500 text-xs mt-1">AI-powered analysis</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Goals */}
              {step === 2 && (
                <div>
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center mb-6`}>
                    <currentStep.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    {currentStep.title}
                  </h2>
                  <p className="text-gray-400 mb-8 text-center">
                    {currentStep.description}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-white font-semibold mb-3 block">What do you want to achieve? (Select all that apply)</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {goals.map((goal) => {
                          const GoalIcon = goal.icon;
                          return (
                            <label
                              key={goal.id}
                              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                preferences.goals.includes(goal.id)
                                  ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={preferences.goals.includes(goal.id)}
                                onChange={() => toggleGoal(goal.id)}
                                className="w-5 h-5"
                              />
                              <GoalIcon className="w-5 h-5 text-[#FF8C00]" />
                              <span className="text-white font-medium">{goal.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white font-semibold mb-3 block">What best describes you?</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {useCases.map((useCase) => (
                          <label
                            key={useCase.id}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              preferences.use_case === useCase.id
                                ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="use_case"
                              value={useCase.id}
                              checked={preferences.use_case === useCase.id}
                              onChange={(e) => setPreferences({...preferences, use_case: e.target.value})}
                              className="hidden"
                            />
                            <p className="text-white font-medium mb-1">{useCase.label}</p>
                            <p className="text-gray-500 text-xs">{useCase.desc}</p>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white font-semibold mb-3 block">Team Size</label>
                      <Select
                        value={preferences.team_size}
                        onValueChange={(value) => setPreferences({...preferences, team_size: value})}
                      >
                        <SelectTrigger className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solo">Just me (Solo)</SelectItem>
                          <SelectItem value="small">2-5 people (Small team)</SelectItem>
                          <SelectItem value="medium">6-20 people (Medium team)</SelectItem>
                          <SelectItem value="large">20+ people (Large team)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Budget */}
              {step === 3 && (
                <div>
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center mb-6`}>
                    <currentStep.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    {currentStep.title}
                  </h2>
                  <p className="text-gray-400 mb-8 text-center">
                    {currentStep.description}
                  </p>

                  <div className="bg-[#0B0B0C] rounded-xl p-6 mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#FF8C00]" />
                      Why Budget Controls Matter
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Prevent unexpected AI costs from spiraling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Get alerts before you hit your limits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Smart caching saves you up to 40% on costs</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block flex items-center justify-between">
                        <span>Daily Budget (USD)</span>
                        <Badge className="bg-[#FF8C00]/20 text-[#FF8C00]">Recommended: $10-20</Badge>
                      </label>
                      <Input
                        type="number"
                        value={preferences.daily_budget_usd}
                        onChange={(e) => setPreferences({...preferences, daily_budget_usd: parseFloat(e.target.value)})}
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl text-lg h-12"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-600">
                          ~{Math.round(preferences.daily_budget_usd / 0.02)} AI generations/day
                        </p>
                        <p className="text-xs text-gray-600">
                          ${(preferences.daily_budget_usd * 30).toFixed(0)}/month estimate
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block flex items-center justify-between">
                        <span>Monthly Budget (USD)</span>
                        <Badge className="bg-[#1E90FF]/20 text-[#1E90FF]">Hard Limit</Badge>
                      </label>
                      <Input
                        type="number"
                        value={preferences.monthly_budget_usd}
                        onChange={(e) => setPreferences({...preferences, monthly_budget_usd: parseFloat(e.target.value)})}
                        className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl text-lg h-12"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        System will pause AI operations when this limit is reached
                      </p>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <p className="text-blue-400 text-sm">
                        💡 <strong>Pro Tip:</strong> Start conservative. You can always increase limits later. Our smart caching typically reduces costs by 30-40%.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Preferences */}
              {step === 4 && (
                <div>
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center mb-6`}>
                    <currentStep.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    {currentStep.title}
                  </h2>
                  <p className="text-gray-400 mb-8 text-center">
                    {currentStep.description}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Default Video Resolution</label>
                      <select
                        value={preferences.default_video_resolution}
                        onChange={(e) => setPreferences({...preferences, default_video_resolution: e.target.value})}
                        className="w-full bg-[#0B0B0C] border border-gray-700 text-white rounded-xl p-3"
                      >
                        <option value="1920x1080">1920x1080 (Full HD) - Best for YouTube</option>
                        <option value="1280x720">1280x720 (HD) - Faster renders</option>
                        <option value="1080x1920">1080x1920 (Vertical) - TikTok/Reels</option>
                        <option value="1080x1080">1080x1080 (Square) - Instagram</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Default AI Art Style</label>
                      <select
                        value={preferences.default_art_style}
                        onChange={(e) => setPreferences({...preferences, default_art_style: e.target.value})}
                        className="w-full bg-[#0B0B0C] border border-gray-700 text-white rounded-xl p-3"
                      >
                        <option value="photorealistic">Photorealistic - Like real photos</option>
                        <option value="digital_art">Digital Art - Modern & clean</option>
                        <option value="oil_painting">Oil Painting - Classic art</option>
                        <option value="anime">Anime - Japanese style</option>
                        <option value="3d_render">3D Render - CGI look</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <input
                        type="checkbox"
                        checked={preferences.email_notifications}
                        onChange={(e) => setPreferences({...preferences, email_notifications: e.target.checked})}
                        className="w-5 h-5"
                        id="email-notif"
                      />
                      <label htmlFor="email-notif" className="flex-1">
                        <p className="text-white font-medium text-sm">Email Notifications</p>
                        <p className="text-gray-500 text-xs mt-0.5">Get notified about renders, cost alerts, and updates</p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {step === 5 && (
                <div className="text-center">
                  <motion.div
                    className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center mb-6 brand-glow`}
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <currentStep.icon className="w-12 h-12 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {currentStep.title}
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    {currentStep.description}
                  </p>

                  <div className="bg-[#0B0B0C] rounded-xl p-6 mb-8">
                    <h3 className="text-white font-bold mb-4 text-lg">Your Setup Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Goals</p>
                        <p className="text-white text-sm">{preferences.goals.length} selected</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Use Case</p>
                        <p className="text-white text-sm capitalize">{preferences.use_case.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Daily Budget</p>
                        <p className="text-white text-sm">${preferences.daily_budget_usd}/day</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Monthly Budget</p>
                        <p className="text-white text-sm">${preferences.monthly_budget_usd}/month</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-2 text-sm">📚 Quick Start Guide</h4>
                      <p className="text-gray-500 text-xs">Follow interactive tutorials</p>
                    </div>
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-2 text-sm">🎓 Video Tutorials</h4>
                      <p className="text-gray-500 text-xs">Watch step-by-step guides</p>
                    </div>
                    <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                      <h4 className="text-white font-semibold mb-2 text-sm">💬 Community Support</h4>
                      <p className="text-gray-500 text-xs">Get help from our community</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-[#FF4433]/10 to-[#1E90FF]/10 border border-[#FF8C00]/30 rounded-xl">
                    <h3 className="text-white font-bold mb-2">🚀 Special Welcome Offer</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Get <strong>$10 free AI credits</strong> to explore all features!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Automatically applied to your account</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="border-gray-700 hover:bg-[#0B0B0C] rounded-xl"
                  disabled={step === 1}
                >
                  Back
                </Button>
                {step < 5 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl px-6"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => savePreferences.mutate()}
                    className="bg-gradient-to-r from-[#FF4433] to-[#1E90FF] text-white rounded-xl px-6"
                    disabled={savePreferences.isLoading}
                  >
                    {savePreferences.isLoading ? 'Setting up...' : 'Start Creating'}
                    <Rocket className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// Import Select component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";