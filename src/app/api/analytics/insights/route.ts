import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

// Smart insights — compares current month vs last month per category
export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const now = new Date();
  const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const curEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [curTxs, prevTxs, budgets, allTxs] = await Promise.all([
    db.transaction.findMany({
      where: { userId, type: "EXPENSE", date: { gte: curStart, lte: curEnd } },
      include: { category: true },
    }),
    db.transaction.findMany({
      where: { userId, type: "EXPENSE", date: { gte: prevStart, lte: prevEnd } },
      include: { category: true },
    }),
    db.budget.findMany({
      where: { userId, year: now.getFullYear() },
      include: { category: true },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: curStart, lte: curEnd } },
    }),
  ]);

  const insights: { type: string; message: string; tone: "positive" | "warning" | "info" | "negative"; }[] = [];

  // 1. Per-category spending changes
  const curByCat = new Map<string, { name: string; color: string; total: number }>();
  const prevByCat = new Map<string, { name: string; color: string; total: number }>();
  for (const t of curTxs) {
    const key = t.categoryId || "uncategorized";
    const name = t.category?.name || "Uncategorized";
    const color = t.category?.color || "gray";
    const existing = curByCat.get(key);
    if (existing) existing.total += t.amount;
    else curByCat.set(key, { name, color, total: t.amount });
  }
  for (const t of prevTxs) {
    const key = t.categoryId || "uncategorized";
    const name = t.category?.name || "Uncategorized";
    const color = t.category?.color || "gray";
    const existing = prevByCat.get(key);
    if (existing) existing.total += t.amount;
    else prevByCat.set(key, { name, color, total: t.amount });
  }

  for (const [key, cur] of curByCat) {
    const prev = prevByCat.get(key);
    if (prev && prev.total > 0) {
      const change = ((cur.total - prev.total) / prev.total) * 100;
      if (Math.abs(change) >= 15) {
        insights.push({
          type: "category_change",
          message:
            change > 0
              ? `You spent ${Math.round(change)}% more on ${cur.name} this month ($${cur.total.toFixed(2)} vs $${prev.total.toFixed(2)}).`
              : `You spent ${Math.abs(Math.round(change))}% less on ${cur.name} this month. Great work!`,
          tone: change > 0 ? "warning" : "positive",
        });
      }
    } else if (!prev && cur.total > 50) {
      insights.push({
        type: "new_category",
        message: `You started spending on ${cur.name} this month — $${cur.total.toFixed(2)} so far.`,
        tone: "info",
      });
    }
  }

  // 2. Budget overruns
  for (const b of budgets) {
    const spent = curTxs
      .filter((t) => (b.categoryId ? t.categoryId === b.categoryId : true))
      .reduce((s, t) => s + t.amount, 0);
    if (b.amount > 0) {
      const pct = (spent / b.amount) * 100;
      const daysLeft = Math.max(1, curEnd.getDate() - now.getDate());
      const dailyRate = spent / Math.max(1, now.getDate() - curStart.getDate() + 1);
      const projected = spent + dailyRate * daysLeft;
      if (pct >= 100) {
        insights.push({
          type: "budget_exceeded",
          message: `You've exceeded your ${b.category?.name || "overall"} budget ($${spent.toFixed(2)} of $${b.amount.toFixed(0)}).`,
          tone: "negative",
        });
      } else if (projected > b.amount && pct < 100) {
        insights.push({
          type: "budget_projected",
          message: `At your current pace, you'll exceed your ${b.category?.name || "overall"} budget (~$${projected.toFixed(0)} projected vs $${b.amount.toFixed(0)} budget).`,
          tone: "warning",
        });
      }
    }
  }

  // 3. Income vs expense
  const income = allTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = allTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  if (income > 0) {
    const savingsRate = ((income - expense) / income) * 100;
    insights.push({
      type: "savings_rate",
      message:
        savingsRate >= 20
          ? `Great job! You've saved ${savingsRate.toFixed(0)}% of your income this month.`
          : `You've saved ${savingsRate.toFixed(0)}% of your income this month. Aim higher!`,
      tone: savingsRate >= 20 ? "positive" : "info",
    });
  }

  // 4. Largest single expense
  if (curTxs.length) {
    const largest = curTxs.reduce((m, t) => (t.amount > m.amount ? t : m), curTxs[0]);
    insights.push({
      type: "largest_expense",
      message: `Your largest expense this month was $${largest.amount.toFixed(2)} on ${largest.description} (${largest.category?.name || "Uncategorized"}).`,
      tone: "info",
    });
  }

  return json({ insights });
}
