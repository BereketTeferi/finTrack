# Deploying FinTrack to Vercel

This guide walks you through deploying FinTrack to Vercel. The app uses **PostgreSQL** (not SQLite, because SQLite doesn't work on Vercel's serverless functions).

---

## Why PostgreSQL?

Vercel serverless functions have a **read-only filesystem**. SQLite writes to a local file, so it fails on Vercel with errors like:

```
POST /api/auth/register 500 (Internal Server Error)
PrismaClientInitializationError: Can't reach database server
```

**Solution:** Use a hosted PostgreSQL database. The schema in `prisma/schema.prisma` is already configured for `postgresql`.

---

## Step 1: Create a Free PostgreSQL Database

### Option A: Neon (recommended — best for Vercel)

1. Go to https://neon.tech and sign up (free, no credit card)
2. Click **New Project** → name it `fintrack`
3. Pick a region close to your Vercel region (usually `us-east-1`)
4. Copy the **connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/fintrack?sslmode=require
   ```

### Option B: Supabase

1. Go to https://supabase.com and create a new project
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy the connection string

### Option C: Vercel Postgres

1. In your Vercel dashboard, go to **Storage → Create Database → Postgres**
2. Connect it to your project (Vercel auto-injects the `DATABASE_URL` env var)

---

## Step 2: Push the Schema to Your Database

From your local terminal:

```bash
# 1. Set your DATABASE_URL locally (temporarily) to the production database
# On macOS/Linux:
export DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# On Windows PowerShell:
$env:DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# 2. Install Prisma CLI if not already installed
bun install

# 3. Generate the Prisma client (uses postgresql provider now)
bun run db:generate

# 4. Push the schema to your database (creates all tables)
bun run db:push
```

You should see: `🚀  Your database is now in sync with your Prisma schema.`

---

## Step 3: Set Environment Variables on Vercel

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add the following:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://user:password@host/dbname?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | (run `openssl rand -base64 32` to generate) | Production, Preview, Development |

> **Note:** You do NOT need to set `NEXTAUTH_URL` — NextAuth v4 auto-detects the URL from Vercel's `VERCEL_URL` env var.

3. Click **Save** for each variable
4. **Redeploy** your project (Deployments → click the latest → Redeploy) so the new env vars take effect

---

## Step 4: Verify the Deployment

1. Visit your Vercel URL (e.g. `https://fin-track-xxx.vercel.app`)
2. Click **Sign up** and register a new account
3. You should land on the Dashboard
4. Click **Load Demo Data** to seed 4 months of transactions

If registration still fails with 500, check the **Vercel function logs**:
- Vercel Dashboard → your project → **Logs** tab
- Look for `register error` followed by the actual error message

Common issues:
- `PrismaClientInitializationError` → `DATABASE_URL` is missing or wrong format
- `Can't reach database server` → database URL is wrong, or DB is paused (Neon free tier auto-pauses after inactivity)
- `relation "User" does not exist` → you forgot to run `bun run db:push`

---

## Local Development

For local dev, you have two options:

### Option A: Use the same PostgreSQL database (simplest)

Just set `DATABASE_URL` in your local `.env` to the same Neon/Supabase connection string. Local and prod share the same data.

### Option B: Use a local PostgreSQL

1. Install PostgreSQL locally (or use Docker: `docker run -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16`)
2. Set `DATABASE_URL="postgresql://postgres:secret@localhost:5432/fintrack"` in `.env`
3. Run `bun run db:push`

---

## Troubleshooting

### "Database connection failed" error on registration

Your `DATABASE_URL` env var is either missing or wrong on Vercel. Verify it in **Settings → Environment Variables** and **redeploy** after changing.

### "relation 'User' does not exist"

You haven't pushed the schema to your database. Run `bun run db:push` locally with `DATABASE_URL` set to your production database.

### Login works locally but not on Vercel

Make sure `NEXTAUTH_SECRET` is set on Vercel. If it's different from your local secret, sessions created locally won't work on Vercel (and vice versa) — that's expected.

### "PrismaClientInitializationError" in Vercel logs

The Prisma client wasn't generated with the `postgresql` provider. Make sure `prisma/schema.prisma` has `provider = "postgresql"` (it does in the latest code), then redeploy.

### Neon database auto-paused

Neon's free tier pauses databases after ~5 days of inactivity. Either:
- Upgrade to a paid Neon plan, or
- Use Supabase (doesn't auto-pause), or
- Visit your Neon dashboard to wake the database before using the app

---

## Quick Reference: Required Vercel Env Vars

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random 32+ chars>
```

That's it. Everything else is optional.
