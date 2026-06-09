import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Smartphone,
  Mail,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { showToast } from "./ToastNotification";
import { useAudioFeedback } from "./AudioSystem";

export default function SecuritySettings({ user }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const audio = useAudioFeedback();

  const handleEnable2FA = () => {
    audio.playSuccess();
    setTwoFactorEnabled(true);
    showToast("Two-factor authentication enabled!", "success");
  };

  const handleDisable2FA = () => {
    audio.playClick();
    setTwoFactorEnabled(false);
    showToast("Two-factor authentication disabled", "info");
  };

  const backupCodes = [
    "ABCD-1234-EFGH",
    "IJKL-5678-MNOP",
    "QRST-9012-UVWX",
    "YZAB-3456-CDEF"
  ];

  return (
    <div className="space-y-6">
      
      {/* Two-Factor Authentication */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FFD700]" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">Enable 2FA</p>
              <p className="text-gray-400 text-sm">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={(checked) => {
                if (checked) handleEnable2FA();
                else handleDisable2FA();
              }}
            />
          </div>

          {twoFactorEnabled && (
            <div className="space-y-4 p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
              
              {/* Method Selection */}
              <div>
                <p className="text-white font-semibold mb-3">Choose Method</p>
                <div className="space-y-2">
                  {[
                    { id: "app", label: "Authenticator App", icon: Smartphone, recommended: true },
                    { id: "sms", label: "SMS", icon: Mail },
                    { id: "email", label: "Email", icon: Mail }
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#111317] border border-gray-700 hover:border-[#FFD700]/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-[#00D4C9]" />
                          <span className="text-white">{method.label}</span>
                          {method.recommended && (
                            <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Backup Codes */}
              <div>
                <Button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  variant="outline"
                  className="w-full border-gray-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
                </Button>

                {showBackupCodes && (
                  <div className="mt-4 p-4 bg-[#111317] rounded-lg border border-[#FFD700]/30">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                      <p className="text-xs text-gray-400">
                        Save these backup codes in a safe place. Each code can only be used once.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-[#0B0B0C] rounded font-mono text-sm text-[#FFD700] text-center"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full mt-3 bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                      onClick={() => {
                        audio.playSuccess();
                        showToast("Backup codes copied to clipboard!", "success");
                      }}
                    >
                      Copy All Codes
                    </Button>
                  </div>
                )}
              </div>

            </div>
          )}

        </CardContent>
      </Card>

      {/* Password Management */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#FFD700]" />
            Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Current Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-[#0B0B0C] border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-[#0B0B0C] border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Confirm New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-[#0B0B0C] border-gray-700 text-white"
            />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
            onClick={() => {
              audio.playSuccess();
              showToast("Password updated successfully!", "success");
            }}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-[#111317] border-gray-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-[#FFD700]" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { device: "Chrome on MacOS", location: "San Francisco, CA", current: true },
              { device: "Safari on iPhone", location: "San Francisco, CA", current: false }
            ].map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
              >
                <div>
                  <p className="text-white font-semibold flex items-center gap-2">
                    {session.device}
                    {session.current && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        Current
                      </Badge>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">{session.location}</p>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}