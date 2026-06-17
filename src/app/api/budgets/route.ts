import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()));
  const budgets = await db.budget.findMany({
    where: { userId, year },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  // Compute spent per budget
  const result = await Promise.all(
    budgets.map(async (b) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const spent = await db.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          categoryId: b.categoryId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      });
      return { ...b, spent: spent._sum.amount || 0 };
    })
  );
  return json({ items: result });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { categoryId, amount, period, month, year } = body as any;
  if (!amount || !period || !year) return badRequest("Missing required fields");
  const budget = await db.budget.create({
    data: {
      userId,
      categoryId: categoryId || null,
      amount: Number(amount),
      period,
      month: month || null,
      year: Number(year),
    },
    include: { category: true },
  });
  return json(budget, 201);
}
