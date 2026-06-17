"use client";

import { useState } from "react";
import {
  useBudgets, useSaveBudget, useDeleteBudget, useCategories,
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
import { Plus, Target, Pencil, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency, colorClasses } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BudgetsView() {
  const { data, isLoading } = useBudgets();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMut = useDeleteBudget();

  const budgets = data?.items || [];
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Total Budget</div>
          <div className="text-2xl font-semibold tabular-nums mt-1">{formatCurrency(totalBudget)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Total Spent</div>
          <div className="text-2xl font-semibold tabular-nums mt-1 text-expense">{formatCurrency(totalSpent)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Remaining</div>
          <div className={cn("text-2xl font-semibold tabular-nums mt-1", totalBudget - totalSpent < 0 ? "text-expense" : "text-income")}>
            {formatCurrency(totalBudget - totalSpent)}
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          className="gradient-fintech text-white border-0 shadow-glow"
          onClick={() => { setEditing(null); setOpen(true); }}
        >
          <Plus size={14} className="mr-1.5" /> New Budget
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
      ) : budgets.length === 0 ? (
        <Card className="p-12 text-center">
          <Target size={32} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground mb-3">No budgets yet</div>
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gradient-fintech text-white border-0">
            <Plus size={14} className="mr-1" /> Create your first budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {budgets.map((b: any, i: number) => {
            const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
            const over = pct > 100;
            const remaining = b.amount - b.spent;
            const c = colorClasses(b.category?.color || "blue");
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 group hover:shadow-soft transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-9 rounded-lg grid place-items-center", c.soft)}>
                        <Target size={15} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{b.category?.name || "Overall"}</div>
                        <div className="text-[11px] text-muted-foreground">{b.period.toLowerCase()} · {b.year}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(b); setOpen(true); }}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => setDeleteId(b.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{formatCurrency(b.spent)} of {formatCurrency(b.amount)}</span>
                    <span className={cn("text-sm font-semibold", over ? "text-expense" : pct >= 80 ? "text-amber-500" : "text-income")}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        over ? "bg-expense" : pct >= 80 ? "bg-amber-500" : "bg-income"
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={cn("font-medium", remaining < 0 ? "text-expense" : "text-income")}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                  <div className={cn(
                    "mt-2 flex items-center gap-1.5 text-[11px]",
                    over ? "text-expense" : remaining < b.amount * 0.2 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {over ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                    {over
                      ? `Over budget by ${formatCurrency(b.spent - b.amount)}`
                      : remaining < b.amount * 0.2
                      ? `Getting close to limit`
                      : `On track`}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <BudgetFormDialog open={open} onOpenChange={setOpen} editing={editing} />
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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

function BudgetFormDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (b: boolean) => void; editing: any | null }) {
  const saveMut = useSaveBudget();
  const { data: catData } = useCategories("EXPENSE");
  const categories = catData?.items || [];
  const formKey = editing?.id || "new";
  const [form, setForm] = useState({
    categoryId: "", amount: "", period: "MONTHLY", year: new Date().getFullYear(),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={formKey}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Budget" : "New Budget"}</DialogTitle>
        </DialogHeader>
        <BudgetFormBody
          key={formKey}
          editing={editing}
          categories={categories}
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

function BudgetFormBody({ editing, categories, onSubmit, onCancel, saving }: any) {
  const [form, setForm] = useState({
    categoryId: editing?.categoryId || "",
    amount: editing ? String(editing.amount) : "",
    period: editing?.period || "MONTHLY",
    year: editing?.year || new Date().getFullYear(),
  });

  return (
    <>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Select category (or overall)" /></SelectTrigger>
            <SelectContent>
              {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
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
            <Label>Period</Label>
            <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="YEARLY">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSubmit({ ...form, amount: Number(form.amount), categoryId: form.categoryId || null })}
          disabled={saving || !form.amount}
          className="gradient-fintech text-white border-0"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}
