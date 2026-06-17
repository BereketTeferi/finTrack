"use client";

import { useApp } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { CommandPalette } from "@/components/command-palette";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { DashboardView } from "@/components/views/dashboard-view";
import { TransactionsView } from "@/components/views/transactions-view";
import { AccountsView } from "@/components/views/accounts-view";
import { BudgetsView } from "@/components/views/budgets-view";
import { AnalyticsView } from "@/components/views/analytics-view";
import { CategoriesView } from "@/components/views/categories-view";
import { RecurringView } from "@/components/views/recurring-view";
import { CustomFieldsView } from "@/components/views/custom-fields-view";
import { NotificationsView } from "@/components/views/notifications-view";
import { SettingsView } from "@/components/views/settings-view";
import { AnimatePresence, motion } from "framer-motion";

export function AppShell() {
  const { activeView } = useApp();

  const views: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    transactions: <TransactionsView />,
    accounts: <AccountsView />,
    budgets: <BudgetsView />,
    analytics: <AnalyticsView />,
    categories: <CategoriesView />,
    recurring: <RecurringView />,
    "custom-fields": <CustomFieldsView />,
    notifications: <NotificationsView />,
    settings: <SettingsView />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {views[activeView] || views.dashboard}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
      <TransactionFormDialog />
    </div>
  );
}
