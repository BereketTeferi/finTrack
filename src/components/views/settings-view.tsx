"use client";

import { useState } from "react";
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
  ShieldCheck, Palette, Globe,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
  { value: "JPY", label: "JPY — Japanese Yen (¥)" },
  { value: "INR", label: "INR — Indian Rupee (₹)" },
  { value: "CNY", label: "CNY — Chinese Yuan (¥)" },
];

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
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Globe size={12} /> Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
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
