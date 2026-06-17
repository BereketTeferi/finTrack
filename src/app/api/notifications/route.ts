import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const items = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = await db.notification.count({ where: { userId, read: false } });
  return json({ items, unread });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { type, title, message } = body as any;
  if (!title || !message) return Response.json({ error: "title and message required" }, { status: 400 });
  const n = await db.notification.create({
    data: { userId, type: type || "GENERAL", title, message },
  });
  return json(n, 201);
}
