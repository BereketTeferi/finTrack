// run-with-env.mjs — runs a command with env vars from .env taking precedence
// over the parent shell's env vars.
//
// Usage: node scripts/run-with-env.mjs <command> [args...]
// Example: node scripts/run-with-env.mjs prisma db push
//
// Why? Prisma's CLI loads .env, but if DATABASE_URL is already set in the
// parent shell (e.g. by the dev server's auto-restart), the shell value
// takes precedence. This script forces .env values to win.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env and OVERRIDE any existing process.env values
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

// Get the command to run from argv
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/run-with-env.mjs <command> [args...]");
  process.exit(1);
}

const cmd = args[0];
const cmdArgs = args.slice(1);

// Use bun if available (faster), otherwise fall back to npx/path resolution
const child = spawn(cmd, cmdArgs, {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
