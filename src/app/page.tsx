"use client";

import { useSession } from "next-auth/react";
import { AuthScreen } from "@/components/auth-screen";
import { AppShell } from "@/components/app-shell";
import { Sparkles } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-2xl gradient-fintech grid place-items-center text-white animate-pulse-glow">
            <Sparkles size={22} />
          </div>
          <div className="text-sm text-muted-foreground">Loading FinTrack...</div>
        </div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  return <AppShell />;
}
