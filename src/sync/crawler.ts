import { PrismaClient, Prisma } from "@prisma/client";
import {
  fetchOrdinals,
  filterInscriptions,
  InscriptionWithContent,
} from "../ordinals-api";
import { logger } from "../logger";
import { SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { SYNC_VERSION } from "./index";
import PQueue from "p-queue";

const log = logger.child({
  topic: "sync",
});

export async function syncViaCrawl(db: PrismaClient) {
  const maxSync = await db.syncs.findFirst({
    orderBy: {
      inscriptionIndex: "desc",
    },
    where: {
      version: SYNC_VERSION,
    },
  });

  const height = maxSync?.inscriptionIndex ?? 159000;

  log.info(
    {
      height,
    },
    `Starting sync from height ${height}`
  );

  const allResults = await fetchOrdinals(height);

  const { inscriptions, maxId } = await filterInscriptions(allResults);

  await saveRegistrations(inscriptions, db);

  if (typeof maxId === "number") {
    log.info(
      {
        index: maxId,
      },
      `Saving new sync height`
    );
    await db.syncs.create({
      data: {
        timestamp: new Date().getTime(),
        inscriptionIndex: maxId,
        version: SYNC_VERSION,
      },
    });
    return false;
  } else {
    return true;
  }
}

const writeQueue = new PQueue({
  concurrency: 10,
});

export async function saveRegistrations(
  inscriptions: InscriptionWithContent[],
  db: PrismaClient
) {
  await Promise.all(
    inscriptions.map(async (i) => {
      await writeQueue.add(async () => {
        const name = i.op.name.toLowerCase().trim();
        const nameExist = await db.name.findFirst({
          where: {
            name,
          },
        });
        if (nameExist) {
          log.debug(
            {
              name,
            },
            `Existing name! ${name}`
          );
        } else {
          log.debug(
            {
              name,
            },
            `Brand new name! ${name}`
          );
        }
        const data: Prisma.RegistrationCreateInput = {
          inscriptionId: i.id,
          inscriptionContent: i.textContent,
          inscriptionContentType: i["content_type"],
          inscriptionJSON:
            i.op as Prisma.RegistrationCreateInput["inscriptionJSON"],
          inscriptionIndex: i.number,
          inscriptionOwner: i.address,
          minter: i.address,
          sat: i.sat_ordinal,
          location: i.location,
          timestamp: BigInt(new Date(i.timestamp).getTime()),
          genesisHeight: i.genesis_block_height,
          genesisTransaction: i.genesis_tx_id,
          outputValue: BigInt(i.value),
          name: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        };
        try {
          const upserted = await db.registration.upsert({
            where: {
              inscriptionId: i.id,
            },
            create: data,
            update: data,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          logger.error(
            {
              name,
              id: i.id,
              error,
              message,
            },
            "Unable to update isncription"
          );
        }
      });
    })
  );
}

export async function sync(db: PrismaClient) {
  const done = await syncViaCrawl(db);
  if (!done) {
    await sync(db);
  } else {
    log.info("Done sync!");
  }
}

let running = false;

export function makeSyncJob(db: PrismaClient) {
  const syncTask = new AsyncTask(
    "sync-task",
    function jobHandler(): Promise<void> {
      if (running) return Promise.resolve();
      running = true;
      return sync(db)
        .then(() => {
          running = false;
        })
        .catch((error) => {
          running = false;
          logger.error(error);
          log.error({ error }, "Sync task error");
          throw error;
        });
    },
    (err) => {
      log.error(
        {
          error: err,
        },
        `Error in sync task`
      );
    }
  );

  const job = new SimpleIntervalJob(
    { minutes: 5, runImmediately: true },
    syncTask,
    {
      preventOverrun: true,
    }
  );

  return job;
}
