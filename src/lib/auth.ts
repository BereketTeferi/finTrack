import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[auth] authorize: missing email or password");
            return null;
          }
          const email = credentials.email.toLowerCase().trim();
          const user = await db.user.findUnique({
            where: { email },
          });
          if (!user) {
            console.log(`[auth] authorize: no user found for email "${email}"`);
            return null;
          }
          const ok = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!ok) {
            console.log(`[auth] authorize: bcrypt compare failed for "${email}"`);
            return null;
          }
          console.log(`[auth] authorize: success for "${email}"`);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (e) {
          console.error("[auth] authorize error:", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/" },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-me-in-production-9f3a7c",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};

export async function getCurrentUser(req?: Request): Promise<{ id: string; email: string; name: string } | null> {
  // This is a helper for API routes; with JWT strategy we read the token from the request header
  if (!req) return null;
  const cookie = req.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/next-auth\.session-token=([^;]+)/);
  if (!tokenMatch) return null;
  try {
    const { getSession } = await import("next-auth/react");
    // We'll instead decode JWT server-side using next-auth/jwt
    const { getToken } = await import("next-auth/jwt");
    const token = await getToken({
      req: { headers: { cookie } } as any,
      secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-me-in-production-9f3a7c",
    });
    if (!token || !token.id) return null;
    return { id: token.id as string, email: token.email as string, name: token.name as string };
  } catch {
    return null;
  }
}
