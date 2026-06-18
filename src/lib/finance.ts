// Shared types & helpers for the app

import { getCurrency } from "@/lib/currencies";

export type TxType = "INCOME" | "EXPENSE" | "TRANSFER";
export type AccountType = "CASH" | "BANK" | "SAVINGS" | "CREDIT_CARD" | "MOBILE_WALLET";
export type FieldType = "TEXT" | "NUMBER" | "DATE" | "DROPDOWN" | "CHECKBOX";
export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type BudgetPeriod = "MONTHLY" | "WEEKLY" | "YEARLY";
export type NotificationType =
  | "BUDGET_LIMIT"
  | "UPCOMING_BILL"
  | "LOW_BALANCE"
  | "RECURRING"
  | "INSIGHT"
  | "GENERAL";

export const CATEGORY_PALETTE = [
  "violet", "blue", "emerald", "amber", "rose",
  "cyan", "orange", "pink", "indigo", "teal",
  "lime", "fuchsia", "sky", "red", "green",
] as const;

export const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: "CASH", label: "Cash", icon: "banknote" },
  { value: "BANK", label: "Bank", icon: "landmark" },
  { value: "SAVINGS", label: "Savings", icon: "piggy-bank" },
  { value: "CREDIT_CARD", label: "Credit Card", icon: "credit-card" },
  { value: "MOBILE_WALLET", label: "Mobile Wallet", icon: "smartphone" },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food", icon: "utensils", color: "orange" },
  { name: "Transport", icon: "car", color: "blue" },
  { name: "Shopping", icon: "shopping-bag", color: "pink" },
  { name: "Entertainment", icon: "film", color: "violet" },
  { name: "Bills", icon: "receipt", color: "red" },
  { name: "Education", icon: "graduation-cap", color: "indigo" },
  { name: "Health", icon: "heart-pulse", color: "emerald" },
  { name: "Rent", icon: "home", color: "amber" },
  { name: "Travel", icon: "plane", color: "cyan" },
  { name: "Other", icon: "more-horizontal", color: "gray" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", icon: "wallet", color: "emerald" },
  { name: "Business", icon: "briefcase", color: "blue" },
  { name: "Freelance", icon: "laptop", color: "violet" },
  { name: "Investment", icon: "trending-up", color: "teal" },
  { name: "Bonus", icon: "gift", color: "amber" },
  { name: "Other", icon: "more-horizontal", color: "gray" },
];

// Color class mapping — kept centralized so client + server agree.
export function colorClasses(color: string): {
  bg: string;
  text: string;
  ring: string;
  dot: string;
  soft: string;
} {
  const map: Record<string, { bg: string; text: string; ring: string; dot: string; soft: string }> = {
    violet: { bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/30", dot: "bg-violet-500", soft: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    blue:   { bg: "bg-blue-500",   text: "text-blue-600 dark:text-blue-400",   ring: "ring-blue-500/30",   dot: "bg-blue-500",   soft: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    emerald:{ bg: "bg-emerald-500",text: "text-emerald-600 dark:text-emerald-400",ring: "ring-emerald-500/30",dot: "bg-emerald-500",soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    amber:  { bg: "bg-amber-500",  text: "text-amber-600 dark:text-amber-400",  ring: "ring-amber-500/30",  dot: "bg-amber-500",  soft: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    rose:   { bg: "bg-rose-500",   text: "text-rose-600 dark:text-rose-400",    ring: "ring-rose-500/30",   dot: "bg-rose-500",   soft: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    cyan:   { bg: "bg-cyan-500",   text: "text-cyan-600 dark:text-cyan-400",    ring: "ring-cyan-500/30",   dot: "bg-cyan-500",   soft: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
    orange: { bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400",ring: "ring-orange-500/30", dot: "bg-orange-500", soft: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    pink:   { bg: "bg-pink-500",   text: "text-pink-600 dark:text-pink-400",    ring: "ring-pink-500/30",   dot: "bg-pink-500",   soft: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    indigo: { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400",ring: "ring-indigo-500/30", dot: "bg-indigo-500", soft: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    teal:   { bg: "bg-teal-500",   text: "text-teal-600 dark:text-teal-400",    ring: "ring-teal-500/30",   dot: "bg-teal-500",   soft: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
    lime:   { bg: "bg-lime-500",   text: "text-lime-600 dark:text-lime-400",    ring: "ring-lime-500/30",   dot: "bg-lime-500",   soft: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
    fuchsia:{ bg: "bg-fuchsia-500",text: "text-fuchsia-600 dark:text-fuchsia-400",ring: "ring-fuchsia-500/30",dot: "bg-fuchsia-500",soft: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400" },
    sky:    { bg: "bg-sky-500",    text: "text-sky-600 dark:text-sky-400",      ring: "ring-sky-500/30",    dot: "bg-sky-500",    soft: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    red:    { bg: "bg-red-500",    text: "text-red-600 dark:text-red-400",      ring: "ring-red-500/30",    dot: "bg-red-500",    soft: "bg-red-500/10 text-red-600 dark:text-red-400" },
    green:  { bg: "bg-green-500",  text: "text-green-600 dark:text-green-400",  ring: "ring-green-500/30",  dot: "bg-green-500",  soft: "bg-green-500/10 text-green-600 dark:text-green-400" },
    gray:   { bg: "bg-gray-500",   text: "text-gray-600 dark:text-gray-400",    ring: "ring-gray-500/30",   dot: "bg-gray-500",   soft: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
  };
  return map[color] || map.gray;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    const cur = getCurrency(currency);
    return new Intl.NumberFormat(cur.locale, {
      style: "currency",
      currency: cur.code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatCompact(amount: number, currency = "USD"): string {
  try {
    const cur = getCurrency(currency);
    return new Intl.NumberFormat(cur.locale, {
      style: "currency",
      currency: cur.code,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}
