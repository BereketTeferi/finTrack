import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.customField.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Custom field not found");
  const body = await req.json();
  const { name, type, options, required } = body as any;
  const updated = await db.customField.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      type: type ?? existing.type,
      options: options ? JSON.stringify(options) : existing.options,
      required: required ?? existing.required,
    },
  });
  return json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const existing = await db.customField.findFirst({ where: { id, userId } });
  if (!existing) return badRequest("Custom field not found");
  await db.customField.delete({ where: { id } });
  return json({ ok: true });
}
