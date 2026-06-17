"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Wallet, PieChart, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to register");
      }
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) throw new Error("Invalid email or password");
      toast.success(mode === "register" ? "Welcome to FinTrack!" : "Welcome back!");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden gradient-fintech text-white p-12 flex-col justify-between">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 size-72 rounded-full bg-white/5 blur-3xl animate-float" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/15 backdrop-blur-sm grid place-items-center">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">FinTrack</div>
            <div className="text-xs text-white/70 mt-0.5">Smart Money OS</div>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight"
          >
            Master your money, one transaction at a time.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/80 text-lg"
          >
            Premium personal finance platform with smart insights, beautiful analytics, and
            effortless tracking across all your accounts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 gap-3 pt-2"
          >
            {[
              { icon: Wallet, label: "Multi-account", desc: "Cash, Bank, Cards" },
              { icon: PieChart, label: "Smart Analytics", desc: "Real-time insights" },
              { icon: TrendingUp, label: "Cash Flow", desc: "Track every dollar" },
              { icon: Sparkles, label: "AI Insights", desc: "Smart recommendations" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <Icon size={18} className="mb-2" />
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-[11px] text-white/60">{f.desc}</div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} FinTrack. Your financial data, encrypted and private.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl gradient-fintech grid place-items-center text-white">
              <Sparkles size={18} />
            </div>
            <div className="text-xl font-semibold">FinTrack</div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {mode === "login"
              ? "Sign in to access your financial dashboard"
              : "Start tracking your finances in seconds"}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="Alex Morgan"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 px-3.5 rounded-lg border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder="••••••••"
              />
              {mode === "register" && (
                <p className="text-[11px] text-muted-foreground">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg gradient-fintech text-white font-medium text-sm flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border text-[11px] text-muted-foreground text-center">
            Demo: register a new account or{" "}
            <button
              type="button"
              onClick={() => {
                setForm({ name: "Demo User", email: "demo@fintrack.app", password: "demo123" });
                setMode("register");
              }}
              className="text-primary font-medium hover:underline"
            >
              fill demo credentials
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
