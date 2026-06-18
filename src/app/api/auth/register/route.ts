import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@/lib/finance";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    const lowerEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: lowerEmail,
        passwordHash,
        currency: "USD",
      },
    });

    // Create default categories for the user
    await db.category.createMany({
      data: [
        ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
          userId: user.id,
          name: c.name,
          type: "EXPENSE",
          color: c.color,
          icon: c.icon,
          isDefault: true,
        })),
        ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
          userId: user.id,
          name: c.name,
          type: "INCOME",
          color: c.color,
          icon: c.icon,
          isDefault: true,
        })),
      ],
    });

    // Create a default Cash account
    await db.account.create({
      data: {
        userId: user.id,
        name: "Cash Wallet",
        type: "CASH",
        balance: 0,
        currency: "USD",
        color: "emerald",
        icon: "banknote",
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e: any) {
    console.error("register error", e);
    // Provide a helpful error message for the most common deployment issue:
    // missing DATABASE_URL or unreachable database on Vercel/serverless.
    const msg = e?.message || "";
    let userMessage = "Failed to register. Please try again.";
    if (
      msg.includes("DATABASE_URL") ||
      msg.includes("connect") ||
      msg.includes("PrismaClientInitializationError") ||
      msg.includes("Tenant database") ||
      msg.includes("Can't reach database server")
    ) {
      userMessage =
        "Database connection failed. If you're deploying to Vercel, make sure to set the DATABASE_URL environment variable to a PostgreSQL connection string (SQLite doesn't work on Vercel). See the deployment guide.";
    } else if (msg.includes("already exists")) {
      userMessage = "An account with this email already exists. Try signing in instead.";
    }
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
