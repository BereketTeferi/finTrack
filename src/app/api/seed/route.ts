import { db, getUserId, json, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/seed — populate demo data for the current user
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return unauthorized();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return unauthorized();

  // Check existing transactions
  const existing = await db.transaction.count({ where: { userId } });
  if (existing > 0) {
    return json({ ok: false, message: "Already has transactions" });
  }

  // Ensure categories exist
  const expenseCats = await db.category.findMany({ where: { userId, type: "EXPENSE" } });
  const incomeCats = await db.category.findMany({ where: { userId, type: "INCOME" } });
  if (!expenseCats.length || !incomeCats.length) {
    return json({ ok: false, message: "Categories missing" }, { status: 400 });
  }

  // Create demo accounts
  const [bank, savings, credit] = await Promise.all([
    db.account.create({ data: { userId, name: "Checking Account", type: "BANK", balance: 5400, color: "blue", icon: "landmark" } }),
    db.account.create({ data: { userId, name: "Savings", type: "SAVINGS", balance: 12500, color: "violet", icon: "piggy-bank" } }),
    db.account.create({ data: { userId, name: "Credit Card", type: "CREDIT_CARD", balance: -820, color: "rose", icon: "credit-card" } }),
  ]);

  const findCat = (cats: typeof expenseCats, name: string) => cats.find((c) => c.name === name)?.id;

  const now = new Date();
  const months = 4; // last 4 months

  const txData: any[] = [];

  for (let m = 0; m < months; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    // Salary at start of month
    txData.push({
      userId,
      accountId: bank.id,
      categoryId: findCat(incomeCats, "Salary"),
      type: "INCOME",
      amount: 4500 + Math.random() * 200,
      currency: "USD",
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
      description: "Monthly Salary",
      notes: "",
      tags: "[]",
    });

    // Freelance income
    if (Math.random() > 0.4) {
      txData.push({
        userId,
        accountId: bank.id,
        categoryId: findCat(incomeCats, "Freelance"),
        type: "INCOME",
        amount: 300 + Math.random() * 800,
        currency: "USD",
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15),
        description: "Freelance Project",
        tags: "[]",
      });
    }

    // Investment income occasionally
    if (Math.random() > 0.6) {
      txData.push({
        userId,
        accountId: savings.id,
        categoryId: findCat(incomeCats, "Investment"),
        type: "INCOME",
        amount: 100 + Math.random() * 250,
        currency: "USD",
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20),
        description: "Dividend Payment",
        tags: "[]",
      });
    }

    // Recurring expenses
    txData.push({
      userId, accountId: bank.id, categoryId: findCat(expenseCats, "Rent"),
      type: "EXPENSE", amount: 1500, currency: "USD",
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
      description: "Monthly Rent", tags: "[]",
    });
    txData.push({
      userId, accountId: credit.id, categoryId: findCat(expenseCats, "Bills"),
      type: "EXPENSE", amount: 85 + Math.random() * 30, currency: "USD",
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5),
      description: "Internet & Phone Bill", tags: "[]",
    });
    txData.push({
      userId, accountId: credit.id, categoryId: findCat(expenseCats, "Bills"),
      type: "EXPENSE", amount: 45 + Math.random() * 20, currency: "USD",
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10),
      description: "Streaming Subscriptions", tags: "[]",
    });

    // Random daily expenses for the month (10-20 txns)
    const numExpenses = 12 + Math.floor(Math.random() * 8);
    const expenseCatsPool = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Travel"];
    for (let i = 0; i < numExpenses; i++) {
      const day = 1 + Math.floor(Math.random() * 27);
      const catName = expenseCatsPool[Math.floor(Math.random() * expenseCatsPool.length)];
      const cat = expenseCats.find((c) => c.name === catName);
      if (!cat) continue;
      const amountMap: Record<string, [number, number]> = {
        Food: [8, 60],
        Transport: [5, 50],
        Shopping: [20, 200],
        Entertainment: [10, 80],
        Health: [15, 120],
        Education: [30, 150],
        Travel: [50, 400],
      };
      const [min, max] = amountMap[catName] || [10, 100];
      const amount = min + Math.random() * (max - min);
      const descMap: Record<string, string[]> = {
        Food: ["Grocery Shopping", "Restaurant Lunch", "Coffee Run", "Dinner Out", "Snacks"],
        Transport: ["Gas Fill-up", "Uber Ride", "Bus Pass", "Taxi", "Parking Fee"],
        Shopping: ["Online Purchase", "Clothing", "Electronics", "Home Goods", "Books"],
        Entertainment: ["Movie Night", "Concert Ticket", "Video Game", "Streaming", "Event"],
        Health: ["Pharmacy", "Gym Membership", "Doctor Visit", "Supplements", "Dental"],
        Education: ["Online Course", "Books", "Workshop", "Certification", "Conference"],
        Travel: ["Flight Ticket", "Hotel Booking", "Travel Insurance", "Baggage Fee", "Car Rental"],
      };
      const desc = (descMap[catName] || ["Expense"])[Math.floor(Math.random() * 5)];
      txData.push({
        userId,
        accountId: Math.random() > 0.5 ? credit.id : bank.id,
        categoryId: cat.id,
        type: "EXPENSE",
        amount,
        currency: "USD",
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
        description: desc,
        tags: "[]",
      });
    }
  }

  // Use createMany to insert all transactions
  await db.transaction.createMany({ data: txData });

  // Recalculate account balances based on transactions (since we set initial balances)
  const allTxs = await db.transaction.findMany({ where: { userId } });
  const balanceMap = new Map<string, number>();
  for (const t of allTxs) {
    const cur = balanceMap.get(t.accountId) || 0;
    balanceMap.set(t.accountId, cur + (t.type === "INCOME" ? t.amount : t.type === "EXPENSE" ? -t.amount : 0));
  }
  // Add the seed starting balances
  const seedBalances: Record<string, number> = {
    [bank.id]: 5400,
    [savings.id]: 12500,
    [credit.id]: -820,
  };
  for (const [accId, bal] of balanceMap.entries()) {
    await db.account.update({
      where: { id: accId },
      data: { balance: bal + (seedBalances[accId] || 0) },
    });
  }

  // Create a budget
  const foodCat = expenseCats.find((c) => c.name === "Food");
  const transportCat = expenseCats.find((c) => c.name === "Transport");
  if (foodCat) {
    await db.budget.create({
      data: { userId, categoryId: foodCat.id, amount: 400, period: "MONTHLY", year: now.getFullYear() },
    });
  }
  if (transportCat) {
    await db.budget.create({
      data: { userId, categoryId: transportCat.id, amount: 150, period: "MONTHLY", year: now.getFullYear() },
    });
  }

  return json({ ok: true, count: txData.length });
}
