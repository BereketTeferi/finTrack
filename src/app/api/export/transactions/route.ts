import { db, getUserId, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "csv";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: any = { userId };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const txs = await db.transaction.findMany({
    where,
    include: { account: true, category: true },
    orderBy: { date: "desc" },
  });

  const rows = txs.map((t) => ({
    Date: t.date.toISOString().slice(0, 10),
    Type: t.type,
    Amount: t.amount.toFixed(2),
    Currency: t.currency,
    Description: t.description,
    Category: t.category?.name || "",
    Account: t.account?.name || "",
    Notes: t.notes || "",
    Tags: t.tags,
  }));

  if (format === "json") {
    return new Response(JSON.stringify(rows, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=transactions.json" },
    });
  }

  // CSV
  const headers = ["Date", "Type", "Amount", "Currency", "Description", "Category", "Account", "Notes", "Tags"];
  const escape = (v: any) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=transactions.csv`,
    },
  });
}
