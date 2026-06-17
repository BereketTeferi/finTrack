import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const period = url.searchParams.get("period") || "monthly"; // daily|weekly|monthly|yearly
  const now = new Date();

  // Build a list of buckets depending on the period
  let buckets: { label: string; start: Date; end: Date }[] = [];
  if (period === "daily") {
    // last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const e = new Date(d); e.setHours(23, 59, 59, 999);
      buckets.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), start: d, end: e });
    }
  } else if (period === "weekly") {
    // last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now); end.setDate(end.getDate() - i * 7); end.setHours(23, 59, 59, 999);
      const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
      buckets.push({ label: `Wk ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, start, end });
    }
  } else if (period === "yearly") {
    // last 5 years
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      buckets.push({ label: String(year), start, end });
    }
  } else {
    // monthly — last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      buckets.push({ label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), start: d, end: e });
    }
  }

  // Query transactions for the whole range
  const startRange = buckets[0].start;
  const endRange = buckets[buckets.length - 1].end;
  const txs = await db.transaction.findMany({
    where: { userId, date: { gte: startRange, lte: endRange } },
    select: { type: true, amount: true, date: true },
  });

  const series = buckets.map((b) => {
    let income = 0, expense = 0;
    for (const tx of txs) {
      if (tx.date >= b.start && tx.date <= b.end) {
        if (tx.type === "INCOME") income += tx.amount;
        else if (tx.type === "EXPENSE") expense += tx.amount;
      }
    }
    return {
      label: b.label,
      income,
      expense,
      net: income - expense,
    };
  });

  return json({ period, series });
}
