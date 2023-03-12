import { PrismaClient } from "@prisma/client";
import { sync } from "../src/sync/crawler";

const db = new PrismaClient();

async function run() {
  await db.$connect();
  await sync(db);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
