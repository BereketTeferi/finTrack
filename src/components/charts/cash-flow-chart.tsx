"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/lib/finance";

interface Series { label: string; income: number; expense: number; net: number; }

export function CashFlowChart({ data }: { data: Series[] }) {
  if (!data.length) {
    return (
      <div className="h-64 grid place-items-center text-sm text-muted-foreground">
        No data for this period
      </div>
    );
  }
  return (
    <div className="h-64 -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="g-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--income)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-expense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-net" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompact(Number(v))}
            width={45}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: "12px",
              boxShadow: "0 8px 24px -8px rgba(0,0,0,0.15)",
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(value: any, name: string) => [formatCompact(Number(value)), name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="var(--income)"
            strokeWidth={2}
            fill="url(#g-income)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="var(--expense)"
            strokeWidth={2}
            fill="url(#g-expense)"
          />
          <Area
            type="monotone"
            dataKey="net"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeDasharray="4 3"
            fill="url(#g-net)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
