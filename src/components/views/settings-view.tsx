"use client";

import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useMe, useSeedDemo, useAccounts, useTransactions } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Mail, CalendarDays, Database, Download, LogOut, Save, Trash2,
  ShieldCheck, Palette, Globe, Search,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CURRENCIES } from "@/lib/currencies";
import { colorClasses, formatCurrency } from "@/lib/finance";

const AVATAR_COLORS = ["violet", "blue", "emerald", "amber", "rose", "cyan", "pink", "indigo"];

export function SettingsView() {
  const { data: session } = useSession();
  const { data: meData } = useMe();
  const { data: accData } = useAccounts();
  const { data: txData } = useTransactions({ limit: 1 });
  const seedMut = useSeedDemo();
  const qc = useQueryClient();

  const user = meData?.user;
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "USD");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "violet");

  const accounts = accData?.items || [];
  const txCount = txData?.total || 0;

  const save = async () => {
    const r = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currency, avatarColor }),
    });
    if (r.ok) {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["me"] });
    } else {
      toast.error("Failed to save");
    }
  };

  const seed = async () => {
    await seedMut.mutateAsync();
    qc.invalidateQueries();
  };

  const wipe = async () => {
    if (!confirm("Wipe ALL transactions? This cannot be undone.")) return;
    // Wipe via individual delete would be too slow; we'll just delete via the API by issuing fetches
    const all = await fetch("/api/transactions?limit=10000").then(r => r.json());
    for (const t of all.items || []) {
      await fetch(`/api/transactions/${t.id}`, { method: "DELETE" });
    }
    toast.success("All transactions deleted");
    qc.invalidateQueries();
  };

  const initials = (user?.name || session?.user?.name || "U").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Profile card */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-primary/10 grid place-items-center text-primary">
            <User size={14} />
          </div>
          <h3 className="font-semibold text-sm">Profile</h3>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <Avatar className="size-16 rounded-2xl gradient-fintech">
            <AvatarFallback className="rounded-2xl text-white text-xl font-semibold bg-transparent">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-base font-semibold">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <CalendarDays size={11} />
              Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="flex items-center gap-1.5"><Globe size={12} /> Currency</Label>
              <CurrencyPicker value={currency} onChange={setCurrency} />
              <p className="text-[11px] text-muted-foreground">
                {CURRENCIES.length}+ currencies available · Sample: {formatCurrency(1234.56, currency)}
              </p>
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label className="flex items-center gap-1.5"><Palette size={12} /> Avatar Color</Label>
              <div className="flex flex-wrap gap-2 h-11 items-center">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    className={`size-7 rounded-full transition ${avatarColor === c ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-110" : ""}`}
                    style={{ background: `var(--${c === "violet" ? "primary" : c === "blue" ? "savings" : c === "emerald" ? "income" : c === "rose" ? "expense" : c === "amber" ? "chart-5" : c === "cyan" ? "chart-2" : "primary"})` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <Button onClick={save} className="gradient-fintech text-white border-0">
            <Save size={14} className="mr-1.5" /> Save Changes
          </Button>
        </div>
      </Card>

      {/* Data management */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-primary/10 grid place-items-center text-primary">
            <Database size={14} />
          </div>
          <h3 className="font-semibold text-sm">Data Management</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <div className="text-2xl font-bold tabular-nums">{accounts.length}</div>
            <div className="text-[11px] text-muted-foreground">Accounts</div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <div className="text-2xl font-bold tabular-nums">{txCount}</div>
            <div className="text-[11px] text-muted-foreground">Transactions</div>
          </div>
          <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <div className="text-2xl font-bold tabular-nums">{(user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0)}</div>
            <div className="text-[11px] text-muted-foreground">Days active</div>
          </div>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={seed}
            disabled={seedMut.isPending || txCount > 0}
            className="w-full justify-start"
          >
            <Database size={14} className="mr-2" />
            {txCount > 0 ? "Demo data already loaded" : "Load demo data (4 months of transactions)"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("/api/export/transactions?format=csv", "_blank")}
            className="w-full justify-start"
          >
            <Download size={14} className="mr-2" />
            Export all transactions (CSV)
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                <Trash2 size={14} className="mr-2" />
                Wipe all transactions
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wipe all transactions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {txCount} transactions across all your accounts. Accounts and categories will be preserved, but balances will be reset to their initial values. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={wipe}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Wipe everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      {/* Security & session */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-income/10 grid place-items-center text-income">
            <ShieldCheck size={14} />
          </div>
          <h3 className="font-semibold text-sm">Security & Session</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <div className="text-sm font-medium">Authentication</div>
              <div className="text-[11px] text-muted-foreground">JWT-based · password hashed with bcrypt</div>
            </div>
            <ShieldCheck size={16} className="text-income" />
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut size={14} className="mr-2" />
            Sign out of FinTrack
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Searchable currency picker with grouped dropdown.
 * Renders all 60+ currencies with their symbol, code, and name.
 * Filters as you type.
 */
function CurrencyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [search]);

  const selected = CURRENCIES.find((c) => c.code === value) || CURRENCIES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-11 px-3 rounded-lg border border-input bg-card text-sm flex items-center justify-between hover:bg-accent transition"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="font-semibold text-base w-8 text-center tabular-nums">{selected.symbol}</span>
          <span className="truncate">
            <span className="font-medium">{selected.code}</span>
            <span className="text-muted-foreground ml-1.5">— {selected.name}</span>
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency..."
                  className="w-full h-9 pl-8 pr-3 rounded-md bg-background text-sm border border-input outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            {/* Currency list */}
            <div className="max-h-72 overflow-y-auto no-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No currencies found</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-accent transition text-left ${
                      c.code === value ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="font-semibold text-base w-10 text-center tabular-nums shrink-0">{c.symbol}</span>
                    <span className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{c.code}</span>
                      <span className="text-xs text-muted-foreground block truncate">{c.name}</span>
                    </span>
                    {c.code === value && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
