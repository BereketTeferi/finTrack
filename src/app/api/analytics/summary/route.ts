import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const period = url.searchParams.get("period") || "month"; // daily | weekly | monthly | yearly
  const now = new Date();
  let start: Date, prevStart: Date, prevEnd: Date;

  if (period === "daily") {
    start = new Date(now); start.setHours(0, 0, 0, 0);
    prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 1);
    prevEnd = new Date(start); prevEnd.setMilliseconds(-1);
  } else if (period === "weekly") {
    start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0);
    prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 7);
    prevEnd = new Date(start); prevEnd.setMilliseconds(-1);
  } else if (period === "yearly") {
    start = new Date(now.getFullYear(), 0, 1);
    prevStart = new Date(now.getFullYear() - 1, 0, 1);
    prevEnd = new Date(now.getFullYear(), 0, 0, 23, 59, 59);
  } else {
    // monthly
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  }

  const [curIncome, curExpense, prevIncome, prevExpense, accounts, totalIncome, totalExpense] =
    await Promise.all([
      db.transaction.aggregate({
        where: { userId, type: "INCOME", date: { gte: start, lte: now } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: start, lte: now } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { userId, type: "INCOME", date: { gte: prevStart, lte: prevEnd } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: prevStart, lte: prevEnd } },
        _sum: { amount: true },
      }),
      db.account.findMany({ where: { userId } }),
      db.transaction.aggregate({ where: { userId, type: "INCOME" }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { userId, type: "EXPENSE" }, _sum: { amount: true } }),
    ]);

  const income = curIncome._sum.amount || 0;
  const expense = curExpense._sum.amount || 0;
  const prevInc = prevIncome._sum.amount || 0;
  const prevExp = prevExpense._sum.amount || 0;
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalInc = totalIncome._sum.amount || 0;
  const totalExp = totalExpense._sum.amount || 0;
  const netProfit = income - expense;
  const savingsRate = income > 0 ? (netProfit / income) * 100 : 0;

  const incomeChange = prevInc > 0 ? ((income - prevInc) / prevInc) * 100 : income > 0 ? 100 : 0;
  const expenseChange = prevExp > 0 ? ((expense - prevExp) / prevExp) * 100 : expense > 0 ? 100 : 0;
  const prevNet = prevInc - prevExp;
  const netChange = prevNet !== 0 ? ((netProfit - prevNet) / Math.abs(prevNet)) * 100 : netProfit !== 0 ? 100 : 0;
  const prevSavings = prevInc > 0 ? (prevNet / prevInc) * 100 : 0;
  const savingsChange = savingsRate - prevSavings;

  return json({
    period,
    totalBalance,
    totalIncome: totalInc,
    totalExpense: totalExp,
    income,
    expense,
    netProfit,
    savingsRate,
    incomeChange,
    expenseChange,
    netChange,
    savingsChange,
    accounts,
  });
}
