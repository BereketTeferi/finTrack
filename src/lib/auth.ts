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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
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
