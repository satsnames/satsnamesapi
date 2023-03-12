import { PrismaClient } from "@prisma/client";
import { fetchOrdinals, filterInscriptions } from "../src/ordinals-api";
import { saveRegistrations } from "../src/sync/crawler";

const [indexStr] = process.argv.slice(2);

async function run() {
  const index = indexStr ? parseInt(indexStr) : 203000;
  const list = await fetchOrdinals(index - 1);
  const filtered = await filterInscriptions(list);

  const db = new PrismaClient();
  await db.$connect();

  await saveRegistrations(filtered.inscriptions, db);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
