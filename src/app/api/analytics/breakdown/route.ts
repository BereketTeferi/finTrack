import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const dateRange = (from && to) ? { gte: new Date(from), lte: new Date(to) } : { gte: start, lte: end };

  const txs = await db.transaction.findMany({
    where: { userId, type: "EXPENSE", date: dateRange },
    include: { category: true },
  });

  const byCat = new Map<string, { name: string; color: string; total: number; count: number }>();
  let total = 0;
  for (const t of txs) {
    total += t.amount;
    const key = t.categoryId || "uncategorized";
    const name = t.category?.name || "Uncategorized";
    const color = t.category?.color || "gray";
    const existing = byCat.get(key);
    if (existing) {
      existing.total += t.amount;
      existing.count += 1;
    } else {
      byCat.set(key, { name, color, total: t.amount, count: 1 });
    }
  }

  const items = Array.from(byCat.values())
    .sort((a, b) => b.total - a.total)
    .map((c) => ({ ...c, percentage: total > 0 ? (c.total / total) * 100 : 0 }));

  return json({ items, total, from: dateRange.gte, to: dateRange.lte });
}
