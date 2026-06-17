import { db, getUserId, json, unauthorized, badRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const url = new URL(req.url);
  const accountId = url.searchParams.get("accountId");
  const where: any = { userId };
  if (accountId) {
    where.OR = [{ accountId }, { accountId: null }];
  }
  const fields = await db.customField.findMany({
    where,
    include: { account: true },
    orderBy: { createdAt: "asc" },
  });
  return json({ items: fields });
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json();
  const { name, type, options, accountId, required } = body as {
    name: string;
    type: string;
    options?: string[];
    accountId?: string;
    required?: boolean;
  };
  if (!name || !type) return badRequest("Name and type required");
  if (!["TEXT", "NUMBER", "DATE", "DROPDOWN", "CHECKBOX"].includes(type)) {
    return badRequest("Invalid field type");
  }
  const field = await db.customField.create({
    data: {
      userId,
      accountId: accountId || null,
      name: name.trim(),
      type,
      options: JSON.stringify(options || []),
      required: !!required,
    },
    include: { account: true },
  });
  return json(field, 201);
}
