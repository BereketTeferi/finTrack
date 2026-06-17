import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/auth/reset-password
// For a personal finance app demo, we allow direct password reset by email
// (no email verification required). This is for convenience.
export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json() as {
      email?: string;
      newPassword?: string;
    };
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required" },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    const lowerEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email: lowerEmail } });
    if (!user) {
      return NextResponse.json(
        { error: `No account found for "${lowerEmail}". Please register first.` },
        { status: 404 }
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true, message: "Password reset successfully" });
  } catch (e) {
    console.error("reset-password error", e);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
