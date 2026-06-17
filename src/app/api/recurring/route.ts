import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const items = await db.recurringTransaction.findMany({
    where: { userId },
    include: { account: true, category: true },
    orderBy: { nextDate: "asc" },
  });
  return json({ items });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { accountId, categoryId, type, amount, description, frequency, interval, nextDate, endDate } = body as any;
  if (!accountId || !type || !amount || !description || !frequency || !nextDate) {
    return badRequest("Missing required fields");
  }
  const r = await db.recurringTransaction.create({
    data: {
      userId,
      accountId,
      categoryId: categoryId || null,
      type,
      amount: Number(amount),
      description: description.trim(),
      frequency,
      interval: Number(interval || 1),
      nextDate: new Date(nextDate),
      endDate: endDate ? new Date(endDate) : null,
    },
    include: { account: true, category: true },
  });
  return json(r, 201);
}
