import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, currency: true, avatarColor: true, createdAt: true },
  });
  if (!user) return unauthorized();
  return json({ user });
}

export async function PATCH(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { name, currency, avatarColor } = body as any;
  const updated = await db.user.update({
    where: { id: userId },
    data: {
      name: name ?? undefined,
      currency: currency ?? undefined,
      avatarColor: avatarColor ?? undefined,
    },
    select: { id: true, email: true, name: true, currency: true, avatarColor: true },
  });
  return json(updated);
}
