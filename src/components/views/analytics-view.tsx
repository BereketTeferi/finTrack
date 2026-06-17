"use client";

import { useState } from "react";
import {
  useCashFlow, useBreakdown, useHealth, useInsights, useTransactions, useCategories,
} from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { BreakdownPie } from "@/components/charts/breakdown-pie";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Sparkles, Heart, TrendingUp, TrendingDown, Lightbulb, CheckCircle2,
  AlertTriangle, Info, XCircle, Activity, Target, Gauge,
} from "lucide-react";
import { formatCurrency, colorClasses, formatCompact } from "@/lib/finance";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const COLOR_HEX: Record<string, string> = {
  violet: "#8b5cf6", blue: "#3b82f6", emerald: "#10b981", amber: "#f59e0b",
  rose: "#f43f5e", cyan: "#06b6d4", orange: "#f97316", pink: "#ec4899",
  indigo: "#6366f1", teal: "#14b8a6", lime: "#84cc16", fuchsia: "#d946ef",
  sky: "#0ea5e9", red: "#ef4444", green: "#22c55e", gray: "#6b7280",
};

export function AnalyticsView() {
  const [period, setPeriod] = useState("monthly");
  const { data: cashFlow } = useCashFlow(period);
  const { data: breakdown } = useBreakdown();
  const { data: health } = useHealth();
  const { data: insights } = useInsights();
  const { data: txData } = useTransactions({ limit: 500 });
  const { data: incomeCats } = useCategories("INCOME");

  // Top expenses (single largest transactions)
  const topExpenses = (txData?.items || [])
    .filter((t: any) => t.type === "EXPENSE")
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5);

  // Income source breakdown
  const incomeByCat = new Map<string, { name: string; color: string; total: number }>();
  for (const t of (txData?.items || []).filter((t: any) => t.type === "INCOME")) {
    const key = t.categoryId || "uncategorized";
    const name = t.category?.name || "Uncategorized";
    const color = t.category?.color || "gray";
    const ex = incomeByCat.get(key);
    if (ex) ex.total += t.amount;
    else incomeByCat.set(key, { name, color, total: t.amount });
  }
  const incomeSources = Array.from(incomeByCat.values()).sort((a, b) => b.total - a.total);

  const scoreColor = (health?.score || 0) >= 80
    ? "text-income" : (health?.score || 0) >= 60 ? "text-amber-500" : "text-expense";
  const scoreStroke = (health?.score || 0) >= 80
    ? "var(--income)" : (health?.score || 0) >= 60 ? "#f59e0b" : "var(--expense)";

  return (
    <div className="space-y-5">
      {/* Top: Health score + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Financial Health Score */}
        <Card className="p-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-2 mb-4">
            <div className="size-7 rounded-lg bg-primary/10 grid place-items-center text-primary">
              <Gauge size={14} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Financial Health Score</h3>
              <p className="text-[11px] text-muted-foreground">3-month rolling</p>
            </div>
          </div>
          {health ? (
            <>
              <div className="relative h-32 grid place-items-center">
                <svg className="size-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--muted)" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={scoreStroke}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - (health.score || 0) / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute text-center">
                  <div className={cn("text-3xl font-bold tabular-nums", scoreColor)}>{health.score}</div>
                  <div className="text-[10px] text-muted-foreground">/ 100</div>
                </div>
              </div>
              <div className="text-center mt-1">
                <div className={cn("text-sm font-semibold", scoreColor)}>{health.rating}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Savings rate {health.savingsRate}% · Expense ratio {health.expenseRatio}%
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 grid place-items-center text-sm text-muted-foreground">Loading...</div>
          )}
        </Card>

        {/* Score components */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Score Components</h3>
            <p className="text-[11px] text-muted-foreground">What's driving your score</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Savings Rate", value: health?.components.savings, weight: "35%", icon: PiggyBankIcon, color: "income" },
              { label: "Income Consistency", value: health?.components.consistency, weight: "20%", icon: ActivityIcon, color: "savings" },
              { label: "Expense Ratio", value: health?.components.expense, weight: "25%", icon: TrendingDownIcon, color: "expense" },
              { label: "Budget Adherence", value: health?.components.budget, weight: "20%", icon: TargetIcon, color: "investment" },
            ].map((c) => (
              <div key={c.label} className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{c.label}</span>
                  <span className="text-[10px] text-muted-foreground">weight {c.weight}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-xl font-semibold tabular-nums">{c.value ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.value || 0}%`,
                      background: c.color === "income" ? "var(--income)" : c.color === "expense" ? "var(--expense)" : c.color === "savings" ? "var(--savings)" : "var(--investment)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {health?.recommendations?.length ? (
            <div className="mt-4 pt-4 border-t border-border space-y-1.5">
              {health.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Lightbulb size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </div>

      {/* Cash flow */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold tracking-tight">Cash Flow Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Income vs expense trends</p>
          </div>
          <Tabs value={period} onValueChange={setPeriod}>
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

      {/* Spending + Income analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Top Spending Categories</h3>
            <p className="text-[11px] text-muted-foreground">This month</p>
          </div>
          {(breakdown?.items || []).length === 0 ? (
            <div className="h-48 grid place-items-center text-sm text-muted-foreground">No expense data</div>
          ) : (
            <div className="h-56 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(breakdown?.items || []).slice(0, 6).map((c: any) => ({ name: c.name, value: c.total, color: c.color }))} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(Number(v))} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem", fontSize: "12px" }}
                    formatter={(v: any) => formatCurrency(Number(v))}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                    {(breakdown?.items || []).slice(0, 6).map((c: any, i: number) => (
                      <Cell key={i} fill={COLOR_HEX[c.color] || COLOR_HEX.gray} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Income Sources</h3>
            <p className="text-[11px] text-muted-foreground">By category, last 12 months</p>
          </div>
          {incomeSources.length === 0 ? (
            <div className="h-48 grid place-items-center text-sm text-muted-foreground">No income data</div>
          ) : (
            <div className="space-y-3">
              {incomeSources.map((src, i) => {
                const max = incomeSources[0].total;
                const pct = (src.total / max) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{src.name}</span>
                      <span className="tabular-nums text-muted-foreground">{formatCurrency(src.total)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: COLOR_HEX[src.color] || COLOR_HEX.gray }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Largest expenses + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Largest Expenses</h3>
            <p className="text-[11px] text-muted-foreground">Top 5 single transactions</p>
          </div>
          {topExpenses.length === 0 ? (
            <div className="h-32 grid place-items-center text-sm text-muted-foreground">No expense data</div>
          ) : (
            <div className="space-y-2">
              {topExpenses.map((t: any, i: number) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/40">
                  <span className="size-6 rounded-md bg-muted grid place-items-center text-[11px] font-bold text-muted-foreground shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{t.description}</div>
                    <div className="text-[11px] text-muted-foreground">{t.category?.name || "Uncategorized"}</div>
                  </div>
                  <div className="text-sm font-semibold text-expense tabular-nums">{formatCurrency(t.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-7 rounded-lg bg-investment/10 grid place-items-center text-investment">
              <Sparkles size={14} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Smart Insights</h3>
              <p className="text-[11px] text-muted-foreground">Auto-generated financial signals</p>
            </div>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {insights?.insights?.length ? (
              insights.insights.map((ins: any, i: number) => {
                const toneMap: any = {
                  positive: { icon: CheckCircle2, color: "text-income", bg: "bg-income/10" },
                  warning:  { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
                  info:     { icon: Info, color: "text-savings", bg: "bg-savings/10" },
                  negative: { icon: XCircle, color: "text-expense", bg: "bg-expense/10" },
                };
                const tone = toneMap[ins.tone] || toneMap.info;
                const Icon = tone.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-accent/40">
                    <div className={cn("size-7 rounded-md grid place-items-center shrink-0", tone.bg)}>
                      <Icon size={13} className={tone.color} />
                    </div>
                    <p className="text-xs leading-relaxed flex-1 pt-0.5">{ins.message}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground py-6 text-center">No insights yet</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper icons (avoid unused imports)
function PiggyBankIcon(props: any) { return <TrendingUp {...props} />; }
function ActivityIcon(props: any) { return <Activity {...props} />; }
function TrendingDownIcon(props: any) { return <TrendingDown {...props} />; }
function TargetIcon(props: any) { return <Target {...props} />; }
