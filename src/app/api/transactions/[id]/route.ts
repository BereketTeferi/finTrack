import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;

  const existing = await db.transaction.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Transaction not found");

  const body = await req.json();
  const {
    type, amount, currency, date, description, notes,
    categoryId, accountId, tags, customFields,
  } = body as any;

  // Reverse previous balance effect
  const prevDelta =
    existing.type === "INCOME" ? -existing.amount : existing.type === "EXPENSE" ? existing.amount : 0;
  if (prevDelta !== 0) {
    await db.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: prevDelta } },
    });
  }

  const newAccountId = accountId || existing.accountId;
  const txDate = date ? new Date(date) : existing.date;
  const newAmount = Number(amount ?? existing.amount);
  const newType = type || existing.type;

  if (customFields) {
    await db.customFieldValue.deleteMany({ where: { transactionId: id } });
    if (customFields.length) {
      await db.customFieldValue.createMany({
        data: customFields
          .filter((cf: any) => cf.value !== undefined && cf.value !== "")
          .map((cf: any) => ({
            transactionId: id,
            customFieldId: cf.id,
            value: String(cf.value),
          })),
      });
    }
  }

  const updated = await db.transaction.update({
    where: { id },
    data: {
      type: newType,
      amount: newAmount,
      currency: currency || existing.currency,
      date: txDate,
      description: description ?? existing.description,
      notes: notes ?? existing.notes,
      categoryId: categoryId ?? existing.categoryId,
      accountId: newAccountId,
      tags: tags ? JSON.stringify(tags) : existing.tags,
    },
    include: {
      account: true,
      category: true,
      customFieldValues: { include: { customField: true } },
    },
  });

  const newDelta = newType === "INCOME" ? newAmount : newType === "EXPENSE" ? -newAmount : 0;
  if (newDelta !== 0) {
    await db.account.update({
      where: { id: newAccountId },
      data: { balance: { increment: newDelta } },
    });
  }

  return json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;

  const existing = await db.transaction.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Transaction not found");

  const prevDelta =
    existing.type === "INCOME" ? -existing.amount : existing.type === "EXPENSE" ? existing.amount : 0;
  if (prevDelta !== 0) {
    await db.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: prevDelta } },
    });
  }

  await db.transaction.delete({ where: { id } });
  return json({ ok: true });
}
