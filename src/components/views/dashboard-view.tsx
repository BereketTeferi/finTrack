"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import {
  useSummary, useCashFlow, useBreakdown, useTransactions, useSeedDemo, useInsights,
} from "@/lib/queries";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Sparkles,
  ArrowUpRight, ArrowDownRight, Plus, Database, Lightbulb, CheckCircle2,
  AlertTriangle, Info, XCircle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { BreakdownPie } from "@/components/charts/breakdown-pie";
import { motion } from "framer-motion";
import { formatCurrency, colorClasses } from "@/lib/finance";
import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";

const PERIODS: { value: string; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function DashboardView() {
  const [period, setPeriod] = useState("month");
  const [chartPeriod, setChartPeriod] = useState("monthly");
  const { setAddTransactionOpen, setActiveView } = useApp();
  const { data: summary, isLoading: sumLoading } = useSummary(period);
  const { data: cashFlow } = useCashFlow(chartPeriod);
  const { data: breakdown } = useBreakdown();
  const { data: txData } = useTransactions({ limit: 6 });
  const { data: insights } = useInsights();
  const seedMut = useSeedDemo();

  // Show seed prompt when there are no transactions
  const hasData = (summary?.totalIncome || 0) > 0 || (summary?.totalExpense || 0) > 0;

  return (
    <div className="space-y-5">
      {/* Period filter row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="text-xs">{p.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          {!hasData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => seedMut.mutate()}
              disabled={seedMut.isPending}
              className="rounded-lg"
            >
              <Database size={14} className="mr-1.5" />
              {seedMut.isPending ? "Loading..." : "Load Demo Data"}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setAddTransactionOpen(true)}
            className="rounded-lg gradient-fintech text-white border-0 shadow-glow"
          >
            <Plus size={14} className="mr-1.5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="Total Balance"
          value={formatCurrency(summary?.totalBalance || 0)}
          icon={Wallet}
          accent="primary"
          delay={0}
          subtitle="Across all accounts"
        />
        <StatCard
          label="Income"
          value={formatCurrency(summary?.income || 0)}
          icon={TrendingUp}
          accent="income"
          change={summary?.incomeChange}
          delay={0.05}
          subtitle={`Total: ${formatCurrency(summary?.totalIncome || 0)}`}
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(summary?.expense || 0)}
          icon={TrendingDown}
          accent="expense"
          change={summary?.expenseChange}
          delay={0.1}
          subtitle={`Total: ${formatCurrency(summary?.totalExpense || 0)}`}
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(summary?.netProfit || 0)}
          icon={PiggyBank}
          accent={summary && summary.netProfit >= 0 ? "savings" : "expense"}
          change={summary?.netChange}
          delay={0.15}
          subtitle={`Savings rate: ${(summary?.savingsRate || 0).toFixed(1)}%`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cash flow chart — takes 2 cols */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Cash Flow</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Income vs expense over time</p>
            </div>
            <Tabs value={chartPeriod} onValueChange={setChartPeriod}>
              <TabsList className="h-8">
                <TabsTrigger value="daily" className="text-xs px-2.5 h-6">D</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs px-2.5 h-6">W</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs px-2.5 h-6">M</TabsTrigger>
                <TabsTrigger value="yearly" className="text-xs px-2.5 h-6">Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CashFlowChart data={cashFlow?.series || []} />
        </Card>

        {/* Breakdown pie */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold tracking-tight">Expense Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">This month by category</p>
          </div>
          <BreakdownPie data={breakdown?.items || []} total={breakdown?.total || 0} />
        </Card>
      </div>

      {/* Insights + Recent transactions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Smart insights */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-7 rounded-lg bg-investment/10 grid place-items-center text-investment">
              <Sparkles size={14} />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-sm">Smart Insights</h3>
              <p className="text-[11px] text-muted-foreground">AI-ready financial signals</p>
            </div>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar">
            {insights?.insights?.length ? (
              insights.insights.map((ins: any, i: number) => (
                <InsightCard key={i} insight={ins} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Add transactions to see insights
              </div>
            )}
          </div>
        </Card>

        {/* Recent transactions */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight text-sm">Recent Transactions</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Last 6 entries</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveView("transactions")} className="text-xs">
              View all
            </Button>
          </div>
          <div className="space-y-1">
            {txData?.items?.length ? (
              txData.items.map((t: any) => (
                <TransactionRow key={t.id} tx={t} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-10 text-center">
                No transactions yet. Click "Add Transaction" to get started.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: any }) {
  const toneMap = {
    positive: { icon: CheckCircle2, color: "text-income", bg: "bg-income/10" },
    warning:  { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
    info:     { icon: Info, color: "text-savings", bg: "bg-savings/10" },
    negative: { icon: XCircle, color: "text-expense", bg: "bg-expense/10" },
  };
  const tone = toneMap[insight.tone as keyof typeof toneMap] || toneMap.info;
  const Icon = tone.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-accent/50 transition"
    >
      <div className={cn("size-7 rounded-md grid place-items-center shrink-0", tone.bg)}>
        <Icon size={13} className={tone.color} />
      </div>
      <p className="text-xs leading-relaxed flex-1 pt-0.5">{insight.message}</p>
    </motion.div>
  );
}

function TransactionRow({ tx }: { tx: any }) {
  const { setEditingTransaction } = useApp();
  const isIncome = tx.type === "INCOME";
  return (
    <button
      onClick={() => setEditingTransaction(tx.id)}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition text-left"
    >
      <div className={cn(
        "size-9 rounded-lg grid place-items-center shrink-0",
        colorClasses(tx.category?.color || "gray").soft
      )}>
        <CategoryIcon name={tx.category?.icon || "tag"} size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{tx.description}</div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <span>{tx.category?.name || "Uncategorized"}</span>
          <span>·</span>
          <span>{tx.account?.name}</span>
          <span>·</span>
          <span>{new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
      </div>
      <div className={cn(
        "text-sm font-semibold tabular-nums shrink-0",
        isIncome ? "text-income" : "text-expense"
      )}>
        {isIncome ? "+" : "−"}{formatCurrency(tx.amount)}
      </div>
    </button>
  );
}
