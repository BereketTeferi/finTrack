import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

// Financial Health Score: weighted 0-100 based on
// 1. Savings rate (35%)
// 2. Income consistency (20%)
// 3. Expense ratio (25%)
// 4. Budget adherence (20%)

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const now = new Date();
  // Last 3 months of data
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const txs = await db.transaction.findMany({
    where: { userId, date: { gte: threeMonthsAgo, lte: now } },
    include: { category: true },
  });

  // Group by month
  const monthly: { [k: string]: { income: number; expense: number } } = {};
  for (const tx of txs) {
    const key = `${tx.date.getFullYear()}-${tx.date.getMonth()}`;
    if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
    if (tx.type === "INCOME") monthly[key].income += tx.amount;
    else if (tx.type === "EXPENSE") monthly[key].expense += tx.amount;
  }
  const months = Object.values(monthly);
  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);
  const totalNet = totalIncome - totalExpense;

  // 1. Savings rate score (0-100)
  const savingsRate = totalIncome > 0 ? totalNet / totalIncome : 0;
  const savingsScore = Math.max(0, Math.min(100, savingsRate * 200)); // 50% savings => 100

  // 2. Income consistency (std dev)
  const avgIncome = totalIncome / Math.max(1, months.length);
  const variance = months.length > 1
    ? months.reduce((s, m) => s + Math.pow(m.income - avgIncome, 2), 0) / months.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const cv = avgIncome > 0 ? stdDev / avgIncome : 1; // lower is better
  const consistencyScore = Math.max(0, Math.min(100, 100 - cv * 100));

  // 3. Expense ratio score (lower expense ratio is better)
  const expenseRatio = totalIncome > 0 ? totalExpense / totalIncome : 1;
  const expenseScore = Math.max(0, Math.min(100, (1 - expenseRatio) * 200));

  // 4. Budget adherence — fetch budgets and compare
  const budgets = await db.budget.findMany({
    where: { userId, year: now.getFullYear() },
  });
  let budgetScore = 100;
  if (budgets.length) {
    let overBudget = 0;
    for (const b of budgets) {
      const spent = txs
        .filter((t) => t.type === "EXPENSE" && (b.categoryId ? t.categoryId === b.categoryId : true) && t.date.getMonth() === now.getMonth())
        .reduce((s, t) => s + t.amount, 0);
      if (b.amount > 0 && spent > b.amount) overBudget += (spent - b.amount) / b.amount;
    }
    budgetScore = Math.max(0, 100 - (overBudget / budgets.length) * 100);
  }

  const score = Math.round(
    savingsScore * 0.35 + consistencyScore * 0.2 + expenseScore * 0.25 + budgetScore * 0.2
  );

  // Recommendations
  const recommendations: string[] = [];
  if (savingsRate < 0.1) recommendations.push("Increase your savings rate — aim to save at least 10% of income.");
  if (expenseRatio > 0.9) recommendations.push("Your expenses are nearly equal to your income. Look for discretionary categories to cut.");
  if (cv > 0.4 && avgIncome > 0) recommendations.push("Your income varies a lot month to month. Build an emergency buffer of 3-6 months of expenses.");
  if (budgetScore < 70) recommendations.push("You're exceeding your budgets. Review and adjust budget targets or cut spending.");
  if (recommendations.length === 0) recommendations.push("Great financial discipline! Keep up the consistent savings habit.");

  const rating = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Attention";

  return json({
    score,
    rating,
    components: {
      savings: Math.round(savingsScore),
      consistency: Math.round(consistencyScore),
      expense: Math.round(expenseScore),
      budget: Math.round(budgetScore),
    },
    savingsRate: Math.round(savingsRate * 100),
    expenseRatio: Math.round(expenseRatio * 100),
    recommendations,
  });
}
