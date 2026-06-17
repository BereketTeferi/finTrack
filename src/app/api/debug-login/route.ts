import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string };
    if (!email || !password) {
      return Response.json({ error: "email and password required" }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user) {
      return Response.json({
        ok: false,
        step: "lookup",
        message: `No user found with email "${lowerEmail}"`,
        suggestion: "Try registering first, or check the email spelling",
      });
    }

    // Test bcrypt
    let bcryptOk = false;
    let bcryptErr = null;
    try {
      bcryptOk = await bcrypt.compare(password, user.passwordHash);
    } catch (e: any) {
      bcryptErr = e?.message || String(e);
    }

    // Also test a fresh hash to confirm bcrypt works
    const testHash = await bcrypt.hash("test", 10);
    const testVerify = await bcrypt.compare("test", testHash);

    return Response.json({
      ok: bcryptOk,
      step: bcryptOk ? "success" : "bcrypt",
      user: { id: user.id, email: user.email, name: user.name },
      hashPrefix: user.passwordHash.slice(0, 7),
      hashLength: user.passwordHash.length,
      bcryptOk,
      bcryptErr,
      bcryptSelfTest: testVerify,
      passwordLength: password.length,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || String(e), stack: e?.stack }, { status: 500 });
  }
}
