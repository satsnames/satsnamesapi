import { PrismaClient } from "@prisma/client";
import { inscriptionsClient } from "../src/ordinals-api";
import { OwnerSync } from "../src/sync/owners";

const [id] = process.argv.slice(2);

async function run() {
  const db = new PrismaClient();
  await db.$connect();

  const reg = await db.registration.findFirst({
    where: {
      inscriptionId: id,
    },
  });

  const data = await inscriptionsClient.getOrdinalsV1Inscriptions1({
    id,
  });

  const syncer = new OwnerSync(db);

  await syncer.updateInscription(reg!);

  console.log(data.address);
  console.log(reg?.inscriptionOwner);
  console.log(reg?.minter);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
