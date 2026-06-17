import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId");
  const categoryId = url.searchParams.get("categoryId");
  const type = url.searchParams.get("type");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const search = url.searchParams.get("q") || "";
  const tag = url.searchParams.get("tag");
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const where: any = { userId };
  if (accountId) where.accountId = accountId;
  if (categoryId) where.categoryId = categoryId;
  if (type) where.type = type;
  if (tag) where.tags = { contains: `"${tag}"` };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }
  if (search) {
    where.OR = [
      { description: { contains: search } },
      { notes: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
        customFieldValues: { include: { customField: true } },
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    }),
    db.transaction.count({ where }),
  ]);

  return json({ items, total });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const body = await req.json();
  const {
    type, amount, currency, date, description, notes,
    categoryId, accountId, tags, customFields,
  } = body as {
    type: string;
    amount: number;
    currency?: string;
    date: string;
    description: string;
    notes?: string;
    categoryId?: string;
    accountId: string;
    tags?: string[];
    customFields?: { id: string; value: string }[];
  };

  if (!type || !amount || !date || !description || !accountId) {
    return badRequest("Missing required fields");
  }
  if (!["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
    return badRequest("Invalid transaction type");
  }

  const account = await db.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) return badRequest("Invalid account");

  const txDate = new Date(date);
  const tx = await db.transaction.create({
    data: {
      userId,
      accountId,
      categoryId: categoryId || null,
      type,
      amount: Number(amount),
      currency: currency || "USD",
      date: txDate,
      description: description.trim(),
      notes: notes?.trim() || null,
      tags: JSON.stringify(tags || []),
      customFieldValues: customFields?.length
        ? {
            create: customFields
              .filter((cf) => cf.value !== undefined && cf.value !== "")
              .map((cf) => ({
                customFieldId: cf.id,
                value: String(cf.value),
              })),
          }
        : undefined,
    },
    include: {
      account: true,
      category: true,
      customFieldValues: { include: { customField: true } },
    },
  });

  // Update account balance
  const delta = type === "INCOME" ? Number(amount) : type === "EXPENSE" ? -Number(amount) : 0;
  if (delta !== 0) {
    await db.account.update({
      where: { id: accountId },
      data: { balance: { increment: delta } },
    });
  }

  return json(tx, 201);
}
