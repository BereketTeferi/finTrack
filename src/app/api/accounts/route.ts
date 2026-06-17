import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const accounts = await db.account.findMany({
    where: { userId },
    include: {
      _count: { select: { transactions: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return json({ items: accounts });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { name, type, balance, currency, color, icon } = body as any;
  if (!name || !type) return badRequest("Name and type required");
  const account = await db.account.create({
    data: {
      userId,
      name: name.trim(),
      type,
      balance: Number(balance || 0),
      currency: currency || "USD",
      color: color || "blue",
      icon: icon || "wallet",
    },
  });
  return json(account, 201);
}
