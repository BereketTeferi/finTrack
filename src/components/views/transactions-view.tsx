"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import {
  useTransactions, useAccounts, useCategories, useDeleteTransaction,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, Download, Filter, X,
  ArrowDownUp,
} from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { colorClasses, formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function TransactionsView() {
  const { setAddTransactionOpen, setEditingTransaction } = useApp();
  const [filters, setFilters] = useState({
    q: "", type: "", accountId: "", categoryId: "",
    from: "", to: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: txData, isLoading } = useTransactions({
    q: appliedFilters.q || undefined,
    type: appliedFilters.type || undefined,
    accountId: appliedFilters.accountId || undefined,
    categoryId: appliedFilters.categoryId || undefined,
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
    limit: 500,
  });
  const { data: accountsData } = useAccounts();
  const { data: incomeCats } = useCategories("INCOME");
  const { data: expenseCats } = useCategories("EXPENSE");
  const deleteMut = useDeleteTransaction();

  const accounts = accountsData?.items || [];
  const categories = [...(incomeCats?.items || []), ...(expenseCats?.items || [])];

  const sortedTx = useMemo(() => {
    if (!txData?.items) return [];
    const items = [...txData.items];
    items.sort((a, b) => {
      let r = 0;
      if (sortKey === "date") r = new Date(a.date).getTime() - new Date(b.date).getTime();
      else r = a.amount - b.amount;
      return sortDir === "asc" ? r : -r;
    });
    return items;
  }, [txData, sortKey, sortDir]);

  const totalIncome = sortedTx.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = sortedTx.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const applyFilters = () => setAppliedFilters(filters);
  const clearFilters = () => {
    const empty = { q: "", type: "", accountId: "", categoryId: "", from: "", to: "" };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(v => v);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Income</div>
          <div className="text-lg font-semibold text-income tabular-nums mt-0.5">{formatCurrency(totalIncome)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Expense</div>
          <div className="text-lg font-semibold text-expense tabular-nums mt-0.5">{formatCurrency(totalExpense)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">Net</div>
          <div className="text-lg font-semibold tabular-nums mt-0.5">{formatCurrency(totalIncome - totalExpense)}</div>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search description, notes..."
              className="pl-9 h-10"
            />
          </div>
          <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[130px] h-10"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.accountId} onValueChange={(v) => setFilters({ ...filters, accountId: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[150px] h-10"><SelectValue placeholder="Account" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.categoryId} onValueChange={(v) => setFilters({ ...filters, categoryId: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[150px] h-10"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="w-[140px] h-10" />
          <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="w-[140px] h-10" />
          <Button onClick={applyFilters} size="sm" className="h-10">
            <Filter size={14} className="mr-1" /> Apply
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="ghost" size="sm" className="h-10">
              <X size={14} className="mr-1" /> Clear
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            onClick={() => window.open(`/api/export/transactions?format=csv${appliedFilters.from ? `&from=${appliedFilters.from}` : ""}${appliedFilters.to ? `&to=${appliedFilters.to}` : ""}`, "_blank")}
          >
            <Download size={14} className="mr-1" /> CSV
          </Button>
          <Button
            size="sm"
            className="h-10 gradient-fintech text-white border-0 shadow-glow"
            onClick={() => setAddTransactionOpen(true)}
          >
            <Plus size={14} className="mr-1" /> Add
          </Button>
        </div>
      </Card>

      {/* Transactions table */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {sortedTx.length} transaction{sortedTx.length !== 1 ? "s" : ""}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                <ArrowDownUp size={12} className="mr-1" /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSortKey("date"); setSortDir("desc"); }}>Newest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortKey("date"); setSortDir("asc"); }}>Oldest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortKey("amount"); setSortDir("desc"); }}>Highest amount</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortKey("amount"); setSortDir("asc"); }}>Lowest amount</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
          ) : sortedTx.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-sm text-muted-foreground mb-3">No transactions found</div>
              <Button size="sm" onClick={() => setAddTransactionOpen(true)} className="gradient-fintech text-white border-0">
                <Plus size={14} className="mr-1" /> Add your first transaction
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedTx.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40 transition group">
                  <div className={cn(
                    "size-9 rounded-lg grid place-items-center shrink-0",
                    colorClasses(t.category?.color || "gray").soft
                  )}>
                    <CategoryIcon name={t.category?.icon || "tag"} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.description}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                      <span>{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>·</span>
                      <span>{t.category?.name || "Uncategorized"}</span>
                      <span>·</span>
                      <span>{t.account?.name}</span>
                      {t.tags && t.tags !== "[]" && (() => {
                        const tags = JSON.parse(t.tags);
                        return tags.length ? (<><span>·</span><span className="text-primary">{tags.join(", ")}</span></>) : null;
                      })()}
                    </div>
                  </div>
                  <div className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    t.type === "INCOME" ? "text-income" : t.type === "EXPENSE" ? "text-expense" : "text-muted-foreground"
                  )}>
                    {t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "−" : ""}{formatCurrency(t.amount)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition">
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTransaction(t.id)}>
                        <Pencil size={13} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(t.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 size={13} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The transaction will be permanently removed and the account balance will be adjusted.
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
