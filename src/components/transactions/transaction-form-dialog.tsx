"use client";

import { useApp } from "@/lib/store";
import {
  useAccounts, useCategories, useCustomFields,
  useCreateTransaction, useUpdateTransaction, useTransactions,
} from "@/lib/queries";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Tag as TagIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { colorClasses, type FieldType } from "@/lib/finance";
import { cn } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

export function TransactionFormDialog() {
  const {
    addTransactionOpen, setAddTransactionOpen,
    editingTransactionId, setEditingTransaction,
  } = useApp();

  const { data: accountsData } = useAccounts();
  const { data: incomeCats } = useCategories("INCOME");
  const { data: expenseCats } = useCategories("EXPENSE");

  const accounts = accountsData?.items || [];

  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(nowTime());
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const createMut = useCreateTransaction();
  const updateMut = useUpdateTransaction();

  // Load the editing transaction
  const { data: editingTx } = useTransactions(
    editingTransactionId ? { limit: 1000 } : undefined
  );

  // Custom fields scoped to selected account (or global)
  const { data: customFieldsData } = useCustomFields(accountId || undefined);
  const customFields = useMemo(() => {
    const items = customFieldsData?.items || [];
    // Show fields scoped to this account + global fields
    return items.filter((f: any) => !f.accountId || f.accountId === accountId);
  }, [customFieldsData, accountId]);

  const categories = type === "INCOME" ? incomeCats?.items || [] : expenseCats?.items || [];

  // Reset or load when opening
  useEffect(() => {
    if (!addTransactionOpen && !editingTransactionId) return;
    if (editingTransactionId && editingTx?.items) {
      const t = editingTx.items.find((x: any) => x.id === editingTransactionId);
      if (t) {
        setType(t.type === "INCOME" ? "INCOME" : "EXPENSE");
        setAmount(String(t.amount));
        setDate(new Date(t.date).toISOString().slice(0, 10));
        setTime(new Date(t.date).toTimeString().slice(0, 5));
        setDescription(t.description);
        setNotes(t.notes || "");
        setAccountId(t.accountId);
        setCategoryId(t.categoryId || "");
        setTags(JSON.parse(t.tags || "[]"));
        const cfMap: Record<string, string> = {};
        for (const cfv of t.customFieldValues || []) {
          cfMap[cfv.customFieldId] = cfv.value;
        }
        setCustomValues(cfMap);
        return;
      }
    }
    // Reset for new
    if (addTransactionOpen) {
      setType("EXPENSE");
      setAmount("");
      setDate(today());
      setTime(nowTime());
      setDescription("");
      setNotes("");
      setCategoryId("");
      setTags([]);
      setCustomValues({});
      if (accounts[0] && !accountId) setAccountId(accounts[0].id);
    }
  }, [addTransactionOpen, editingTransactionId, editingTx, accounts]);

  const close = () => {
    setAddTransactionOpen(false);
    setEditingTransaction(null);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const submit = async () => {
    if (!amount || !description || !accountId) {
      toast.error("Please fill amount, description, and account");
      return;
    }
    const payload = {
      type,
      amount: Number(amount),
      currency: "USD",
      date: new Date(`${date}T${time}:00`).toISOString(),
      description,
      notes,
      accountId,
      categoryId: categoryId || undefined,
      tags,
      customFields: Object.entries(customValues).map(([id, value]) => ({ id, value })),
    };
    if (editingTransactionId) {
      await updateMut.mutateAsync({ id: editingTransactionId, ...payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    close();
  };

  const loading = createMut.isPending || updateMut.isPending;

  return (
    <Dialog
      open={addTransactionOpen || !!editingTransactionId}
      onOpenChange={(o) => !o && close()}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTransactionId ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Tabs value={type} onValueChange={(v) => setType(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="EXPENSE" className="data-[state=active]:bg-expense data-[state=active]:text-white">
                Expense
              </TabsTrigger>
              <TabsTrigger value="INCOME" className="data-[state=active]:bg-income data-[state=active]:text-white">
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 h-11 text-lg font-semibold tabular-nums"
                />
              </div>
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Currency</Label>
              <Select value="USD" disabled>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery shopping at Whole Foods"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", colorClasses(a.color).bg)} />
                        {a.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", colorClasses(c.color).bg)} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
                  <TagIcon size={10} />
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-destructive">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag(); }
                }}
                placeholder="Add tag and press Enter"
                className="h-10"
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this transaction..."
              rows={2}
            />
          </div>

          {customFields.length > 0 && (
            <div className="space-y-3 p-3 rounded-lg border border-dashed border-border bg-muted/30">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Custom Fields
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customFields.map((f: any) => (
                  <CustomFieldInput
                    key={f.id}
                    field={f}
                    value={customValues[f.id] || ""}
                    onChange={(v) => setCustomValues({ ...customValues, [f.id]: v })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={loading}
            className="gradient-fintech text-white border-0 shadow-glow"
          >
            {loading && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            {editingTransactionId ? "Update" : "Add"} Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomFieldInput({
  field,
  value,
  onChange,
}: {
  field: { id: string; name: string; type: FieldType; options?: string; required?: boolean };
  value: string;
  onChange: (v: string) => void;
}) {
  const options: string[] = field.options ? JSON.parse(field.options) : [];
  if (field.type === "DROPDOWN") {
    return (
      <div className="space-y-1.5">
        <Label>{field.name}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === "CHECKBOX") {
    return (
      <div className="space-y-1.5">
        <Label>{field.name}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
        <div className="flex items-center gap-2 h-10">
          <Switch checked={value === "true"} onCheckedChange={(c) => onChange(c ? "true" : "false")} />
          <span className="text-sm text-muted-foreground">{value === "true" ? "Yes" : "No"}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label>{field.name}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <Input
        type={field.type === "NUMBER" ? "number" : field.type === "DATE" ? "date" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
      />
    </div>
  );
}
