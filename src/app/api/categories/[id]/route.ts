import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.category.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Category not found");
  const body = await req.json();
  const { name, color, icon } = body as any;
  const updated = await db.category.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      color: color ?? existing.color,
      icon: icon ?? existing.icon,
    },
  });
  return json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.category.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Category not found");
  // Null-out category on transactions
  await db.transaction.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });
  await db.budget.deleteMany({ where: { categoryId: id } });
  await db.recurringTransaction.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });
  await db.category.delete({ where: { id } });
  return json({ ok: true });
}
