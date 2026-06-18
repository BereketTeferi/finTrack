"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "fintrack-pwa-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't show if already installed (running as PWA)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Also check iOS Safari's navigator.standalone (older API)
    if ((window.navigator as any).standalone === true) return;

    // Don't show if user dismissed recently
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10);
        if (Date.now() - dismissedAt < DISMISS_DURATION) return;
      }
    } catch {
      // localStorage might not be available
    }

    const handler = (e: Event) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Save the event so we can trigger it later from our custom UI
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show our custom prompt after a short delay (let user see the app first)
      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also listen for successful install — hide the prompt
    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      // User installed — hide the prompt
      setVisible(false);
      setDeferredPrompt(null);
    } else {
      // User dismissed — remember for 7 days
      dismiss();
    }
  };

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  // If the browser doesn't support beforeinstallprompt (iOS Safari),
  // we show a different message with manual instructions
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      // Show iOS prompt after a delay if not dismissed
      try {
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed) {
          const dismissedAt = parseInt(dismissed, 10);
          if (Date.now() - dismissedAt < DISMISS_DURATION) return;
        }
      } catch {
        // ignore
      }
      setTimeout(() => setVisible(true), 4000);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[99] max-w-md w-[calc(100%-2rem)]"
        >
          <div className="glass-strong rounded-2xl p-4 shadow-2xl border border-border">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl gradient-fintech grid place-items-center text-white shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">Install FinTrack</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isIOS ? (
                    <>Tap the Share button <span className="font-medium">􀈂</span> in Safari, then "Add to Home Screen" <span className="font-medium">􀈋</span> to install FinTrack as an app.</>
                  ) : (
                    <>Install FinTrack on your home screen for quick access and a native app experience.</>
                  )}
                </p>
              </div>
              <button
                onClick={dismiss}
                className="size-7 rounded-md grid place-items-center hover:bg-accent shrink-0"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="mt-3 w-full h-10 rounded-lg gradient-fintech text-white text-sm font-medium flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition"
              >
                <Download size={15} />
                Install App
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
