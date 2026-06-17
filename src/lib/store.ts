"use client";

import { create } from "zustand";

export type View =
  | "dashboard"
  | "transactions"
  | "accounts"
  | "budgets"
  | "analytics"
  | "categories"
  | "recurring"
  | "custom-fields"
  | "notifications"
  | "settings";

interface AppState {
  activeView: View;
  setActiveView: (v: View) => void;
  commandOpen: boolean;
  setCommandOpen: (b: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  addTransactionOpen: boolean;
  setAddTransactionOpen: (b: boolean) => void;
  editingTransactionId: string | null;
  setEditingTransaction: (id: string | null) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (b: boolean) => void;
}

export const useApp = create<AppState>((set) => ({
  activeView: "dashboard",
  setActiveView: (v) => set({ activeView: v }),
  commandOpen: false,
  setCommandOpen: (b) => set({ commandOpen: b }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  addTransactionOpen: false,
  setAddTransactionOpen: (b) => set({ addTransactionOpen: b }),
  editingTransactionId: null,
  setEditingTransaction: (id) => set({ editingTransactionId: id }),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (b) => set({ mobileSidebarOpen: b }),
}));
