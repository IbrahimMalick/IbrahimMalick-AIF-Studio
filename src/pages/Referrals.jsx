import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Copy,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Mail,
  MessageCircle
} from "lucide-react";

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Create referral code if doesn't exist
      const existing = await base44.entities.Referral.filter({
        referrer_email: currentUser.email
      });
      
      if (existing.length === 0) {
        const code = `${currentUser.email.split('@')[0]}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
        await base44.entities.Referral.create({
          referrer_email: currentUser.email,
          referral_code: code,
          status: 'pending'
        });
      }
    };
    loadUser();
  }, []);

  const { data: myReferrals = [] } = useQuery({
    queryKey: ["myReferrals"],
    queryFn: () => base44.entities.Referral.filter({
      referrer_email: user.email
    }),
    enabled: !!user,
  });

  const myCode = myReferrals[0]?.referral_code || 'LOADING...';
  const referralUrl = `${window.location.origin}?ref=${myCode}`;

  const signedUp = myReferrals.filter(r => r.status !== 'pending').length;
  const converted = myReferrals.filter(r => r.status === 'converted' || r.status === 'rewarded').length;
  const totalRewards = myReferrals
    .filter(r => r.status === 'rewarded')
    .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = "Check out AIFreedomDuane Studio!";
    const body = `I've been using AIFreedomDuane Studio for AI content creation and it's amazing!\n\nCreate videos, AI art, and analyze documents all in one place.\n\nTry it free: ${referralUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaTwitter = () => {
    const text = `Just discovered @AIFreedomDuane - an all-in-one AI content creation platform. Create videos, AI art, and analyze docs in seconds! 🚀\n\nTry it free:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  const stats = [
    {
      label: "Total Referrals",
      value: myReferrals.length,
      icon: Users,
      color: "from-[#FF4433] to-[#FF8C00]"
    },
    {
      label: "Signed Up",
      value: signedUp,
      icon: TrendingUp,
      color: "from-[#FF8C00] to-[#A89C94]"
    },
    {
      label: "Converted",
      value: converted,
      icon: DollarSign,
      color: "from-[#A89C94] to-[#1E90FF]"
    },
    {
      label: "Rewards Earned",
      value: `$${totalRewards}`,
      icon: Gift,
      color: "from-[#1E90FF] to-[#FF4433]"
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-gray-400">Invite friends, earn rewards. Get $20 for each friend who upgrades!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Referral Link */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#FF8C00]" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralUrl}
                readOnly
                className="flex-1 bg-[#0B0B0C] border-gray-700 text-white rounded-xl font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-[#FF4433] to-[#FF8C00] text-white rounded-xl"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-[#1a1a1f] rounded-xl"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={shareViaTwitter}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-[#1a1a1f] rounded-xl"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-[#FF4433] to-[#FF8C00] flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Share Your Link</h3>
                <p className="text-gray-400 text-sm">Send your unique referral link to friends and colleagues</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-[#FF8C00] to-[#A89C94] flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-white font-semibold mb-2">They Sign Up</h3>
                <p className="text-gray-400 text-sm">Your friend creates a free account and tries the platform</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-[#A89C94] to-[#1E90FF] flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Earn Rewards</h3>
                <p className="text-gray-400 text-sm">Get $20 credit when they upgrade to a paid plan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {myReferrals.length > 0 ? (
              <div className="space-y-3">
                {myReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="p-4 rounded-xl bg-[#0B0B0C] border border-gray-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {referral.referee_email || 'Pending signup'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(referral.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${
                        referral.status === 'rewarded' ? 'bg-green-500/20 text-green-400' :
                        referral.status === 'converted' ? 'bg-blue-500/20 text-blue-400' :
                        referral.status === 'signed_up' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {referral.status}
                      </Badge>
                      {referral.status === 'rewarded' && (
                        <span className="text-green-400 font-semibold">+${referral.reward_amount}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Gift className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No referrals yet. Start sharing your link!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}