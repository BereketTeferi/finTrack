"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, colorClasses } from "@/lib/finance";

const COLOR_HEX: Record<string, string> = {
  violet: "#8b5cf6", blue: "#3b82f6", emerald: "#10b981", amber: "#f59e0b",
  rose: "#f43f5e", cyan: "#06b6d4", orange: "#f97316", pink: "#ec4899",
  indigo: "#6366f1", teal: "#14b8a6", lime: "#84cc16", fuchsia: "#d946ef",
  sky: "#0ea5e9", red: "#ef4444", green: "#22c55e", gray: "#6b7280",
};

interface Item { name: string; color: string; total: number; percentage: number; }

export function BreakdownPie({ data, total }: { data: Item[]; total: number }) {
  if (!data.length) {
    return (
      <div className="h-64 grid place-items-center text-sm text-muted-foreground">
        No expense data this month
      </div>
    );
  }
  const top = data.slice(0, 6);
  const otherTotal = data.slice(6).reduce((s, d) => s + d.total, 0);
  const chartData = otherTotal > 0
    ? [...top, { name: "Other", color: "gray", total: otherTotal, percentage: (otherTotal / total) * 100 }]
    : top;

  return (
    <div className="space-y-3">
      <div className="h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="name"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={COLOR_HEX[entry.color] || COLOR_HEX.gray} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
              formatter={(value: any, name: string) => [formatCurrency(Number(value)), name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground">Total</div>
            <div className="text-base font-semibold tabular-nums">{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
        {chartData.map((c) => (
          <div key={c.name} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-sm" style={{ background: COLOR_HEX[c.color] || COLOR_HEX.gray }} />
            <span className="flex-1 truncate">{c.name}</span>
            <span className="tabular-nums font-medium">{formatCurrency(c.total)}</span>
            <span className="text-muted-foreground tabular-nums w-10 text-right">{c.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
