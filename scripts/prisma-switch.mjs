// prisma-switch.mjs — auto-switches Prisma datasource provider based on DATABASE_URL
//
// Usage:
//   node scripts/prisma-switch.mjs          # auto-detect from DATABASE_URL
//   node scripts/prisma-switch.mjs sqlite   # force SQLite
//   node scripts/prisma-switch.mjs postgres # force PostgreSQL
//
// Why? Vercel serverless has a read-only filesystem, so SQLite doesn't work
// in production. But SQLite is convenient for local dev. This script reads
// the DATABASE_URL env var and updates prisma/schema.prisma to use the right
// provider, then regenerates the Prisma client.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

// Load .env manually (so this works without dotenv)
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const arg = process.argv[2];
let provider = arg;
if (!provider) {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    provider = "postgresql";
  } else if (url.startsWith("file:")) {
    provider = "sqlite";
  } else if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    // Default to PostgreSQL on Vercel/production even if DATABASE_URL is not
    // yet set during install (it will be set when functions run).
    console.log("DATABASE_URL not set — defaulting to postgresql (production/Vercel environment).");
    provider = "postgresql";
  } else {
    console.log("DATABASE_URL not set — defaulting to sqlite (local dev).");
    provider = "sqlite";
  }
}

if (!["sqlite", "postgresql"].includes(provider)) {
  console.error(`Unknown provider: ${provider}. Use 'sqlite' or 'postgresql'.`);
  process.exit(1);
}

console.log(`Switching Prisma provider to: ${provider}`);

let schema = fs.readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /provider = "(sqlite|postgresql)"/,
  `provider = "${provider}"`
);
fs.writeFileSync(schemaPath, schema);
console.log(`Updated ${schemaPath}`);

// Regenerate the Prisma client
try {
  console.log("Running prisma generate...");
  execSync("bun run db:generate", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("Done.");
} catch (e) {
  console.error("prisma generate failed:", e.message);
  process.exit(1);
}
