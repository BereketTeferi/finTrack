"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Wallet, PieChart, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleReset = async () => {
    if (!resetEmail || !resetPassword) {
      toast.error("Email and new password are required");
      return;
    }
    if (resetPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setResetLoading(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword: resetPassword }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to reset password");
      toast.success("Password reset! You can now sign in with your new password.");
      // Pre-fill the login form with the reset credentials so the user just clicks Sign In
      setForm({ name: "", email: resetEmail, password: resetPassword });
      setMode("login");
      setResetOpen(false);
      setResetEmail("");
      setResetPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Trim email to avoid leading/trailing whitespace issues
      const cleanEmail = form.email.trim();

      if (mode === "register") {
        const r = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: cleanEmail,
            password: form.password,
          }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to register");
      }

      const res = await signIn("credentials", {
        email: cleanEmail,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        // Distinguish between "no account" and "wrong password" using our debug endpoint
        // for a friendlier error message (sacrifices strict security for UX in a personal app)
        let message = "Invalid email or password";
        try {
          const probe = await fetch("/api/debug-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password: form.password }),
          });
          const probeData = await probe.json();
          if (probeData.step === "lookup") {
            message = mode === "register"
              ? "Account creation failed silently. Please try again."
              : `No account found for "${cleanEmail}". Try signing up instead.`;
          } else if (probeData.step === "bcrypt") {
            message = "Wrong password. Please double-check your password and try again.";
          }
        } catch {
          // fall back to generic message
        }
        throw new Error(message);
      }

      if (res?.ok) {
        toast.success(mode === "register" ? "Welcome to FinTrack!" : "Welcome back!");
        // Hard navigation — forces useSession to re-read the cookie on the new page load
        // router.refresh() alone doesn't reliably update client-side session state
        window.location.href = "/";
        return;
      }

      throw new Error("Login failed. Please try again.");
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setResetOpen(true)}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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

      {/* Reset password dialog */}
      {resetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setResetOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Reset Password</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Enter your account email and a new password. We'll update it immediately so you can sign back in.
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setResetOpen(false)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium hover:bg-accent transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetLoading}
                className="flex-1 h-10 rounded-lg gradient-fintech text-white text-sm font-medium flex items-center justify-center gap-1.5 shadow-glow hover:opacity-95 transition disabled:opacity-60"
              >
                {resetLoading && <Loader2 size={14} className="animate-spin" />}
                Reset Password
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
