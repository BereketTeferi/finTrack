import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getUserId(_req?: Request): Promise<string | null> {
  try {
    const session: any = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
    return null;
  } catch (e) {
    console.error("getUserId error", e);
    return null;
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export { db };
