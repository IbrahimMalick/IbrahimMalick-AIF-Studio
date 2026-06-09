import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { showToast } from "./ToastNotification";
import { useAudioFeedback } from "./AudioSystem";

export default function PaymentManagement({ user }) {
  const audio = useAudioFeedback();
  const [paymentMethods] = useState([
    {
      id: "pm_1",
      type: "card",
      brand: "visa",
      last4: "4242",
      exp_month: 12,
      exp_year: 2025,
      is_default: true
    },
    {
      id: "pm_2",
      type: "card",
      brand: "mastercard",
      last4: "5555",
      exp_month: 6,
      exp_year: 2024,
      is_default: false
    }
  ]);

  const handleAddPaymentMethod = () => {
    audio.playClick();
    showToast("Opening payment method form...", "info");
  };

  const handleRemovePaymentMethod = (id) => {
    audio.playError();
    showToast("Payment method removed", "success");
  };

  const handleSetDefault = (id) => {
    audio.playSuccess();
    showToast("Default payment method updated!", "success");
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FFD700]" />
            Payment Methods
          </CardTitle>
          <Button
            onClick={handleAddPaymentMethod}
            className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 rounded-xl bg-[#0B0B0C] border border-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 rounded bg-gradient-to-r from-[#FFD700] to-[#00D4C9] flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-white font-semibold capitalize flex items-center gap-2">
                    {method.brand} •••• {method.last4}
                    {method.is_default && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        Default
                      </Badge>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Expires {method.exp_month}/{method.exp_year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <Button
                    onClick={() => handleSetDefault(method.id)}
                    variant="outline"
                    size="sm"
                    className="border-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Set Default
                  </Button>
                )}
                <Button
                  onClick={() => handleRemovePaymentMethod(method.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}