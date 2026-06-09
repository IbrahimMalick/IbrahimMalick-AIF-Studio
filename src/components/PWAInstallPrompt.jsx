import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      setTimeout(() => {
        const hasInstalled = localStorage.getItem('pwa-installed');
        const hasDismissed = localStorage.getItem('pwa-dismissed');
        
        if (!hasInstalled && !hasDismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      localStorage.setItem('pwa-installed', 'true');
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <Card className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border-[#FFD700]/30 backdrop-blur-xl">
          <CardContent className="p-6 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#00D4C9] flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-black" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">Install AIFreedomDuane</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Install our app for faster access and offline support
                </p>

                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <span>✓</span> Works offline
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <span>✓</span> Instant loading
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <span>✓</span> Home screen access
                  </p>
                </div>

                <Button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}