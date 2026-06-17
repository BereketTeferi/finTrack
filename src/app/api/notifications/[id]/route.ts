import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.notification.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Notification not found");
  const body = await req.json();
  const updated = await db.notification.update({
    where: { id },
    data: { read: body.read ?? !existing.read },
  });
  return json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  await db.notification.deleteMany({ where: { id, userId } });
  return json({ ok: true });
}
