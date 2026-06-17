"use client";

import { useState } from "react";
import {
  useAccounts, useSaveAccount, useDeleteAccount, useTransfer,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Wallet, ArrowRightLeft, Pencil, Trash2, Banknote, Landmark,
  PiggyBank, CreditCard, Smartphone, TrendingUp, TrendingDown,
} from "lucide-react";
import { ACCOUNT_TYPES, colorClasses, formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ICONS: Record<string, any> = {
  banknote: Banknote, landmark: Landmark, "piggy-bank": PiggyBank,
  "credit-card": CreditCard, smartphone: Smartphone, wallet: Wallet,
};

const COLORS = ["blue", "violet", "emerald", "amber", "rose", "cyan", "orange", "pink", "indigo", "teal"];

export function AccountsView() {
  const { data, isLoading } = useAccounts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const deleteMut = useDeleteAccount();

  const accounts = data?.items || [];
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const positiveAccounts = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const negativeAccounts = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Total Balance</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{formatCurrency(totalBalance)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Assets</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-income">{formatCurrency(positiveAccounts)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Liabilities</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-expense">{formatCurrency(negativeAccounts)}</div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
          <ArrowRightLeft size={14} className="mr-1.5" /> Transfer
        </Button>
        <Button
          size="sm"
          className="gradient-fintech text-white border-0 shadow-glow"
          onClick={() => { setEditing(null); setOpen(true); }}
        >
          <Plus size={14} className="mr-1.5" /> New Account
        </Button>
      </div>

      {/* Account grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <Wallet size={32} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground mb-3">No accounts yet</div>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gradient-fintech text-white border-0">
            <Plus size={14} className="mr-1" /> Add your first account
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((acc: any, idx: number) => {
            const c = colorClasses(acc.color);
            const Icon = ICONS[acc.icon] || Wallet;
            return (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="relative overflow-hidden p-5 group hover:shadow-soft transition">
                  <div className={cn("absolute -top-12 -right-12 size-32 rounded-full opacity-10 blur-2xl", c.bg)} />
                  <div className="relative flex items-start justify-between mb-4">
                    <div className={cn("size-10 rounded-xl grid place-items-center", c.soft)}>
                      <Icon size={18} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <Button
                        variant="ghost" size="icon" className="size-8"
                        onClick={() => { setEditing(acc); setOpen(true); }}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="size-8 text-destructive"
                        onClick={() => setDeleteId(acc.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{acc.type.replace("_", " ")}</div>
                    <div className="text-base font-semibold mt-0.5">{acc.name}</div>
                    <div className={cn(
                      "text-2xl font-bold tabular-nums mt-2",
                      acc.balance < 0 ? "text-expense" : ""
                    )}>
                      {formatCurrency(acc.balance, acc.currency)}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1.5">
                      {acc._count?.transactions || 0} transactions
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AccountFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} accounts={accounts} />
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account and all its transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) await deleteMut.mutateAsync(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AccountFormDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (b: boolean) => void; editing: any | null }) {
  const saveMut = useSaveAccount();
  const [form, setForm] = useState({
    name: "", type: "CASH", balance: "0", color: "blue", icon: "wallet",
  });

  // Sync form with editing target
  useState(() => {
    if (editing) {
      setForm({
        name: editing.name, type: editing.type,
        balance: String(editing.balance), color: editing.color, icon: editing.icon,
      });
    }
  });

  // Use effect-like pattern via key prop on dialog
  const formKey = editing?.id || "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={formKey}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Account" : "New Account"}</DialogTitle>
        </DialogHeader>
        <AccountFormBody
          key={formKey}
          editing={editing}
          onSubmit={async (data) => {
            await saveMut.mutateAsync({ id: editing?.id, ...data });
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          saving={saveMut.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

function AccountFormBody({ editing, onSubmit, onCancel, saving }: {
  editing: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    name: editing?.name || "",
    type: editing?.type || "CASH",
    balance: editing ? String(editing.balance) : "0",
    color: editing?.color || "blue",
    icon: editing?.icon || "wallet",
  });

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Account Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Chase Checking"
            className="h-11"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => {
              const acc = ACCOUNT_TYPES.find(a => a.value === v);
              setForm({ ...form, type: v, icon: acc?.icon || "wallet" });
            }}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Initial Balance</Label>
            <Input
              type="number" step="0.01"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              disabled={!!editing}
              className="h-11 tabular-nums"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className={cn(
                  "size-7 rounded-full transition ring-offset-2 ring-offset-background",
                  colorClasses(color).bg,
                  form.color === color && "ring-2 ring-ring scale-110"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSubmit({ ...form, balance: Number(form.balance) })}
          disabled={saving || !form.name}
          className="gradient-fintech text-white border-0"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}

function TransferDialog({ open, onOpenChange, accounts }: { open: boolean; onOpenChange: (b: boolean) => void; accounts: any[] }) {
  const transferMut = useTransfer();
  const [form, setForm] = useState({ fromAccountId: "", toAccountId: "", amount: "", notes: "", date: new Date().toISOString().slice(0, 10) });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>From</Label>
              <Select value={form.fromAccountId} onValueChange={(v) => setForm({ ...form, fromAccountId: v })}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Select value={form.toAccountId} onValueChange={(v) => setForm({ ...form, toAccountId: v })}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input
                type="number" step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="h-11 tabular-nums"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="h-11"
              placeholder="e.g. Monthly savings transfer"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!form.fromAccountId || !form.toAccountId || !form.amount) {
                toast.error("Fill all required fields");
                return;
              }
              await transferMut.mutateAsync(form);
              setForm({ fromAccountId: "", toAccountId: "", amount: "", notes: "", date: new Date().toISOString().slice(0, 10) });
              onOpenChange(false);
            }}
            disabled={transferMut.isPending}
            className="gradient-fintech text-white border-0"
          >
            {transferMut.isPending ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
