import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.recurringTransaction.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Recurring transaction not found");
  const body = await req.json();
  const { amount, description, frequency, nextDate, active, endDate } = body as any;
  const updated = await db.recurringTransaction.update({
    where: { id },
    data: {
      amount: amount != null ? Number(amount) : existing.amount,
      description: description ?? existing.description,
      frequency: frequency ?? existing.frequency,
      nextDate: nextDate ? new Date(nextDate) : existing.nextDate,
      active: active ?? existing.active,
      endDate: endDate ? new Date(endDate) : existing.endDate,
    },
  });
  return json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.recurringTransaction.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Recurring transaction not found");
  await db.recurringTransaction.delete({ where: { id } });
  return json({ ok: true });
}
