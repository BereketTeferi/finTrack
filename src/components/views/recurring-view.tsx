"use client";

import { useState } from "react";
import {
  useRecurring, useSaveRecurring, useDeleteRecurring, useAccounts, useCategories,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Plus, Repeat, Pencil, Trash2, Calendar, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { formatCurrency, colorClasses } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export function RecurringView() {
  const { data, isLoading } = useRecurring();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMut = useDeleteRecurring();

  const items = data?.items || [];
  const totalIncome = items.filter(i => i.type === "INCOME" && i.active).reduce((s, i) => s + i.amount, 0);
  const totalExpense = items.filter(i => i.type === "EXPENSE" && i.active).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Recurring Income / period</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-income">{formatCurrency(totalIncome)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Recurring Expenses / period</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-expense">{formatCurrency(totalExpense)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Net recurring</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{formatCurrency(totalIncome - totalExpense)}</div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          className="gradient-fintech text-white border-0 shadow-glow"
          onClick={() => { setEditing(null); setOpen(true); }}
        >
          <Plus size={14} className="mr-1.5" /> New Recurring
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Repeat size={32} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground mb-3">No recurring transactions yet</div>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gradient-fintech text-white border-0">
            <Plus size={14} className="mr-1" /> Set up a recurring transaction
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((r: any, i: number) => {
            const isIncome = r.type === "INCOME";
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-4 group hover:shadow-soft transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "size-9 rounded-lg grid place-items-center",
                      isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                    )}>
                      {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditing(r); setOpen(true); }}>
                        <Pencil size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => setDeleteId(r.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium truncate">{r.description}</div>
                  <div className={cn(
                    "text-xl font-semibold tabular-nums mt-1",
                    isIncome ? "text-income" : "text-expense"
                  )}>
                    {isIncome ? "+" : "−"}{formatCurrency(r.amount)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                    <Calendar size={11} />
                    <span>{r.frequency.toLowerCase()}</span>
                    <span>·</span>
                    <span>Next: {new Date(r.nextDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-[10px]">{r.account?.name}</Badge>
                    {!r.active && <Badge variant="secondary" className="text-[10px]">Paused</Badge>}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <RecurringFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recurring transaction?</AlertDialogTitle>
            <AlertDialogDescription>This will stop future automatic transactions.</AlertDialogDescription>
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

function RecurringFormDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (b: boolean) => void; editing: any | null }) {
  const saveMut = useSaveRecurring();
  const { data: accData } = useAccounts();
  const { data: incomeCats } = useCategories("INCOME");
  const { data: expenseCats } = useCategories("EXPENSE");
  const formKey = editing?.id || "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={formKey}>
        <DialogHeader>
          <DialogTitle>{editing?.id ? "Edit Recurring Transaction" : "New Recurring Transaction"}</DialogTitle>
        </DialogHeader>
        <RecurringFormBody
          key={formKey}
          editing={editing}
          accounts={accData?.items || []}
          incomeCats={incomeCats?.items || []}
          expenseCats={expenseCats?.items || []}
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

function RecurringFormBody({ editing, accounts, incomeCats, expenseCats, onSubmit, onCancel, saving }: any) {
  const [form, setForm] = useState({
    type: editing?.type || "EXPENSE",
    amount: editing ? String(editing.amount) : "",
    description: editing?.description || "",
    accountId: editing?.accountId || "",
    categoryId: editing?.categoryId || "",
    frequency: editing?.frequency || "MONTHLY",
    interval: editing ? String(editing.interval) : "1",
    nextDate: editing ? new Date(editing.nextDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    active: editing?.active ?? true,
  });

  const cats = form.type === "INCOME" ? incomeCats : expenseCats;

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, categoryId: "" })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="h-11"
            placeholder="e.g. Monthly Rent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Account</Label>
            <Select value={form.accountId} onValueChange={(v) => setForm({ ...form, accountId: v })}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {accounts.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {cats.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label>Frequency</Label>
            <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Every</Label>
            <Input
              type="number" min="1"
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
              className="h-11"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Next Date</Label>
          <Input
            type="date"
            value={form.nextDate}
            onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
            className="h-11"
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div>
            <div className="text-sm font-medium">Active</div>
            <div className="text-[11px] text-muted-foreground">Generate transactions automatically</div>
          </div>
          <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSubmit({
            ...form,
            amount: Number(form.amount),
            interval: Number(form.interval),
            categoryId: form.categoryId || null,
          })}
          disabled={saving || !form.amount || !form.description || !form.accountId}
          className="gradient-fintech text-white border-0"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}
