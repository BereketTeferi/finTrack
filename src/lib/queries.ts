"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ============ Accounts ============
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const r = await fetch("/api/accounts");
      if (!r.ok) throw new Error("Failed to load accounts");
      return r.json();
    },
  });
}

// ============ Categories ============
export function useCategories(type?: "INCOME" | "EXPENSE") {
  return useQuery({
    queryKey: ["categories", type || "all"],
    queryFn: async () => {
      const url = type ? `/api/categories?type=${type}` : "/api/categories";
      const r = await fetch(url);
      if (!r.ok) throw new Error("Failed to load categories");
      return r.json();
    },
  });
}

// ============ Transactions ============
export function useTransactions(params?: {
  accountId?: string;
  categoryId?: string;
  type?: string;
  from?: string;
  to?: string;
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}) {
  const queryKey = ["transactions", params];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL("/api/transactions", window.location.origin);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) url.searchParams.set(k, String(v));
        });
      }
      const r = await fetch(url.toString());
      if (!r.ok) throw new Error("Failed to load transactions");
      return r.json();
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const r = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to create transaction");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["cash-flow"] });
      qc.invalidateQueries({ queryKey: ["breakdown"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.invalidateQueries({ queryKey: ["health"] });
      toast.success("Transaction added");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const r = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to update transaction");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["cash-flow"] });
      qc.invalidateQueries({ queryKey: ["breakdown"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.invalidateQueries({ queryKey: ["health"] });
      toast.success("Transaction updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to delete transaction");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      qc.invalidateQueries({ queryKey: ["cash-flow"] });
      qc.invalidateQueries({ queryKey: ["breakdown"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.invalidateQueries({ queryKey: ["health"] });
      toast.success("Transaction deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ============ Analytics ============
export function useSummary(period: string = "month") {
  return useQuery({
    queryKey: ["summary", period],
    queryFn: async () => {
      const r = await fetch(`/api/analytics/summary?period=${period}`);
      if (!r.ok) throw new Error("Failed to load summary");
      return r.json();
    },
  });
}

export function useCashFlow(period: string = "monthly") {
  return useQuery({
    queryKey: ["cash-flow", period],
    queryFn: async () => {
      const r = await fetch(`/api/analytics/cash-flow?period=${period}`);
      if (!r.ok) throw new Error("Failed to load cash flow");
      return r.json();
    },
  });
}

export function useBreakdown(from?: string, to?: string) {
  return useQuery({
    queryKey: ["breakdown", from, to],
    queryFn: async () => {
      const url = new URL("/api/analytics/breakdown", window.location.origin);
      if (from) url.searchParams.set("from", from);
      if (to) url.searchParams.set("to", to);
      const r = await fetch(url.toString());
      if (!r.ok) throw new Error("Failed to load breakdown");
      return r.json();
    },
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/insights");
      if (!r.ok) throw new Error("Failed to load insights");
      return r.json();
    },
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const r = await fetch("/api/analytics/health");
      if (!r.ok) throw new Error("Failed to load health score");
      return r.json();
    },
  });
}

// ============ Budgets ============
export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const r = await fetch("/api/budgets");
      if (!r.ok) throw new Error("Failed to load budgets");
      return r.json();
    },
  });
}

export function useSaveBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const url = id ? `/api/budgets/${id}` : "/api/budgets";
      const method = id ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to save budget");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete budget");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
    },
  });
}

// ============ Recurring ============
export function useRecurring() {
  return useQuery({
    queryKey: ["recurring"],
    queryFn: async () => {
      const r = await fetch("/api/recurring");
      if (!r.ok) throw new Error("Failed to load recurring transactions");
      return r.json();
    },
  });
}

export function useSaveRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const url = id ? `/api/recurring/${id}` : "/api/recurring";
      const method = id ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to save");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recurring"] });
      toast.success("Deleted");
    },
  });
}

// ============ Custom Fields ============
export function useCustomFields(accountId?: string) {
  return useQuery({
    queryKey: ["custom-fields", accountId || "all"],
    queryFn: async () => {
      const url = accountId
        ? `/api/custom-fields?accountId=${accountId}`
        : "/api/custom-fields";
      const r = await fetch(url);
      if (!r.ok) throw new Error("Failed to load custom fields");
      return r.json();
    },
  });
}

export function useSaveCustomField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const url = id ? `/api/custom-fields/${id}` : "/api/custom-fields";
      const method = id ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to save");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-fields"] });
      toast.success("Field saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteCustomField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/custom-fields/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-fields"] });
      toast.success("Field deleted");
    },
  });
}

// ============ Accounts mutations ============
export function useSaveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const url = id ? `/api/accounts/${id}` : "/api/accounts";
      const method = id ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to save account");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Account saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete account");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Account deleted");
    },
  });
}

export function useTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const r = await fetch("/api/accounts/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to transfer");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Transfer complete");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ============ Categories mutations ============
export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const url = id ? `/api/categories/${id}` : "/api/categories";
      const method = id ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to save category");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete category");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
  });
}

// ============ Notifications ============
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await fetch("/api/notifications");
      if (!r.ok) throw new Error("Failed to load notifications");
      return r.json();
    },
  });
}

export function useMarkNotifRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, read }: { id: string; read?: boolean }) => {
      const r = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: read ?? true }),
      });
      if (!r.ok) throw new Error("Failed to update");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotif() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ============ Current user ============
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const r = await fetch("/api/me");
      if (!r.ok) throw new Error("Failed to load user");
      return r.json();
    },
  });
}

export function useSeedDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/seed", { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to seed");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Demo data loaded!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
