import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.budget.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Budget not found");
  const body = await req.json();
  const { amount } = body as any;
  const updated = await db.budget.update({
    where: { id },
    data: { amount: amount != null ? Number(amount) : existing.amount },
  });
  return json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.budget.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Budget not found");
  await db.budget.delete({ where: { id } });
  return json({ ok: true });
}
