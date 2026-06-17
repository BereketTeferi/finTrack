import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { fromAccountId, toAccountId, amount, date, notes } = body as {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    notes?: string;
  };
  if (!fromAccountId || !toAccountId || !amount) {
    return badRequest("fromAccountId, toAccountId and amount are required");
  }
  if (fromAccountId === toAccountId) {
    return badRequest("Source and destination accounts must differ");
  }
  const fromAcc = await db.account.findFirst({ where: { id: fromAccountId, userId } });
  const toAcc = await db.account.findFirst({ where: { id: toAccountId, userId } });
  if (!fromAcc || !toAcc) return badRequest("Invalid account(s)");

  const transferDate = date ? new Date(date) : new Date();
  const amt = Number(amount);

  await db.$transaction([
    db.account.update({ where: { id: fromAccountId }, data: { balance: { decrement: amt } } }),
    db.account.update({ where: { id: toAccountId }, data: { balance: { increment: amt } } }),
    db.transfer.create({
      data: { userId, fromAccountId, toAccountId, amount: amt, date: transferDate, notes: notes || null },
    }),
    db.transaction.create({
      data: {
        userId,
        accountId: fromAccountId,
        type: "TRANSFER",
        amount: amt,
        currency: fromAcc.currency,
        date: transferDate,
        description: `Transfer to ${toAcc.name}`,
        notes: notes || null,
      },
    }),
    db.transaction.create({
      data: {
        userId,
        accountId: toAccountId,
        type: "TRANSFER",
        amount: amt,
        currency: toAcc.currency,
        date: transferDate,
        description: `Transfer from ${fromAcc.name}`,
        notes: notes || null,
      },
    }),
  ]);

  return json({ ok: true }, 201);
}
