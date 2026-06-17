// Quick script to list all users in the DB
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, passwordHash: true, createdAt: true },
  });
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log(`  - ${u.email} | name: ${u.name} | hash: ${u.passwordHash.slice(0, 10)}... | created: ${u.createdAt.toISOString()}`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
