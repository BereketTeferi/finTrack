"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: "income" | "expense" | "savings" | "investment" | "primary";
  change?: number; // percentage change, +/-
  changeLabel?: string;
  delay?: number;
  subtitle?: string;
}

const accentClasses: Record<StatCardProps["accent"], { bg: string; text: string; ring: string; soft: string; chart: string }> = {
  income:     { bg: "bg-income",    text: "text-income",    ring: "ring-income/30",    soft: "bg-income/10 text-income",    chart: "var(--income)" },
  expense:    { bg: "bg-expense",   text: "text-expense",   ring: "ring-expense/30",   soft: "bg-expense/10 text-expense",   chart: "var(--expense)" },
  savings:    { bg: "bg-savings",   text: "text-savings",   ring: "ring-savings/30",   soft: "bg-savings/10 text-savings",   chart: "var(--savings)" },
  investment: { bg: "bg-investment",text: "text-investment",ring: "ring-investment/30",soft: "bg-investment/10 text-investment",chart: "var(--investment)" },
  primary:    { bg: "bg-primary",   text: "text-primary",   ring: "ring-primary/30",   soft: "bg-primary/10 text-primary",   chart: "var(--primary)" },
};

export function StatCard({ label, value, icon: Icon, accent, change, changeLabel, delay = 0, subtitle }: StatCardProps) {
  const c = accentClasses[accent];
  const positive = (change ?? 0) >= 0;
  const showChange = change !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="relative overflow-hidden p-5 hover:shadow-soft transition-all group">
        <div className="absolute inset-0 gradient-card-glow opacity-0 group-hover:opacity-100 transition" />
        <div className="relative flex items-start justify-between mb-3">
          <div className={cn("size-10 rounded-xl grid place-items-center", c.soft)}>
            <Icon size={18} />
          </div>
          {showChange && (
            <div className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold",
              positive ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
            )}>
              {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {Math.abs(change!).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="relative">
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
          <div className="text-2xl font-semibold tracking-tight mt-1 tabular-nums">{value}</div>
          {(subtitle || changeLabel) && (
            <div className="text-[11px] text-muted-foreground mt-1.5">{subtitle || changeLabel}</div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
