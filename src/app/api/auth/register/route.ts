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
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json(
      { error: "Failed to register. Please try again." },
      { status: 500 }
    );
  }
}
