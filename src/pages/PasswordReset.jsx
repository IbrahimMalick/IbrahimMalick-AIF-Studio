import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "@/components/ToastNotification";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("request"); // request | sent | reset | success

  const requestResetMutation = useMutation({
    mutationFn: async (email) => {
      // Create reset token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      await base44.entities.PasswordReset.create({
        user_email: email,
        token,
        expires_at: expiresAt,
        ip_address: "unknown",
        user_agent: navigator.userAgent
      });

      // Send email
      const resetUrl = `${window.location.origin}/PasswordReset?token=${token}`;
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: "Reset Your AIFreedomDuane Studio Password",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FFD700;">Reset Your Password</h2>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #FFD700, #00D4C9); color: black; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      });

      return { success: true };
    },
    onSuccess: () => {
      setStep("sent");
      showToast("Reset link sent! Check your email 📧", "success");
    },
    onError: () => {
      showToast("Failed to send reset link", "error");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] to-[#1a1a1f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-[#111317] border-gray-800 rounded-2xl">
          <CardHeader>
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-2xl text-white">
                {step === "request" && "Reset Password"}
                {step === "sent" && "Check Your Email"}
                {step === "success" && "Password Reset!"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "request" && (
              <>
                <p className="text-gray-400 text-center text-sm">
                  Enter your email and we'll send you a link to reset your password
                </p>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#0B0B0C] border-gray-700 text-white h-12 text-lg"
                  />
                  <Button
                    onClick={() => requestResetMutation.mutate(email)}
                    disabled={!email || requestResetMutation.isPending}
                    className="w-full h-12 bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold text-lg"
                  >
                    {requestResetMutation.isPending ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              </>
            )}

            {step === "sent" && (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-400" />
                <p className="text-white font-semibold">Reset link sent!</p>
                <p className="text-gray-400 text-sm">
                  Check your email for a link to reset your password. The link expires in 1 hour.
                </p>
                <Button
                  onClick={() => setStep("request")}
                  variant="outline"
                  className="border-gray-700 text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}