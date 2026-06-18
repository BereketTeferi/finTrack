"use client";

import { useEffect, useState } from "react";

/**
 * Registers the service worker for PWA offline support.
 * Also exposes hooks for "install app" / "update available" UI if needed.
 */
export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Only register in production to avoid HMR conflicts in dev
    // (also Vercel dev server doesn't serve /sw.js cleanly)
    if (process.env.NODE_ENV !== "production") {
      // Still try to register in dev, but don't fail silently
      // Some users want to test PWA behavior in dev
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        setRegistration(reg);

        // Listen for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New update available
              setUpdateAvailable(true);
            }
          });
        });

        // Check for updates every 60 minutes
        setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);
      } catch (err) {
        // Silently fail — SW is a progressive enhancement
        console.warn("[SW] registration failed:", err);
      }
    };

    register();

    // Listen for controller change (new SW took over)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // Reload the page to ensure fresh app shell
      window.location.reload();
    });
  }, []);

  // Show "Update available" banner
  if (updateAvailable && registration) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)]">
        <div className="glass-strong rounded-xl p-3 shadow-2xl border border-border flex items-center gap-3">
          <div className="size-9 rounded-lg gradient-fintech grid place-items-center text-white shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              <polyline points="21 4 21 10 15 10" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Update available</div>
            <div className="text-[11px] text-muted-foreground">A new version of FinTrack is ready.</div>
          </div>
          <button
            onClick={() => {
              if (registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              }
            }}
            className="px-3 h-8 rounded-lg gradient-fintech text-white text-xs font-medium shrink-0"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  return null;
}
