import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const where: any = { userId };
  if (type) where.type = type;
  const categories = await db.category.findMany({
    where,
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return json({ items: categories });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { name, type, color, icon } = body as any;
  if (!name || !type) return badRequest("Name and type required");
  if (!["INCOME", "EXPENSE"].includes(type)) return badRequest("Invalid type");
  try {
    const cat = await db.category.create({
      data: {
        userId,
        name: name.trim(),
        type,
        color: color || "blue",
        icon: icon || "tag",
      },
    });
    return json(cat, 201);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return badRequest("Category with this name already exists");
    }
    throw e;
  }
}
