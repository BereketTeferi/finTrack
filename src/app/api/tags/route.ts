import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const tags = await db.tag.findMany({ where: { userId }, orderBy: { name: "asc" } });
  return json({ items: tags });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { name, color } = body as any;
  if (!name) return Response.json({ error: "name required" }, { status: 400 });
  try {
    const tag = await db.tag.create({
      data: { userId, name: name.trim(), color: color || "gray" },
    });
    return json(tag, 201);
  } catch {
    return Response.json({ error: "Tag already exists" }, { status: 409 });
  }
}
