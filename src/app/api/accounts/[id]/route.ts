import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.account.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Account not found");
  const body = await req.json();
  const { name, type, currency, color, icon } = body as any;
  const updated = await db.account.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      type: type ?? existing.type,
      currency: currency ?? existing.currency,
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
  const existing = await db.account.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Account not found");
  await db.account.delete({ where: { id } });
  return json({ ok: true });
}
