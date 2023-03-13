import { PrismaClient } from "@prisma/client";
import { fetchAndFilterInscriptions } from "../src/ordinals-api";
import { saveRegistrations } from "../src/sync/crawler";

const [indexStr] = process.argv.slice(2);

async function run() {
  const index = indexStr ? parseInt(indexStr) : 203000;
  const filtered = await fetchAndFilterInscriptions(index - 1);

  const db = new PrismaClient();
  await db.$connect();

  await saveRegistrations(filtered.inscriptions, db);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
