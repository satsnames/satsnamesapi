import { PrismaClient, Registration } from "@prisma/client";
import PQueue from "p-queue";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { logger } from "../logger";
import { inscriptionsClient } from "../ordinals-api";

export const OWNERS_SYNC_ID = 2;

const syncQueue = new PQueue({
  concurrency: 9,
});

const log = logger.child({
  topic: "sync-owners",
});

export class OwnerSync {
  readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async syncFromIndex(registration?: {
    inscriptionId: string;
    inscriptionIndex: number;
    inscriptionOwner: string;
  }): Promise<true> {
    let id = registration?.inscriptionId;
    const isFirst = typeof id === "undefined";

    if (isFirst) {
      log.info("Starting owner sync");
    } else {
      log.info(`Continuing owner sync from ${registration!.inscriptionIndex}`);
    }

    const inscriptions = await this.db.registration.findMany({
      orderBy: {
        inscriptionIndex: "asc",
      },
      select: {
        inscriptionId: true,
        inscriptionIndex: true,
        inscriptionOwner: true,
      },
      skip: isFirst ? 0 : 1,
      cursor: isFirst
        ? undefined
        : {
            inscriptionId: id,
          },
      take: 150,
    });

    await Promise.all(inscriptions.map((i) => this.updateInscription(i)));

    const len = inscriptions.length;

    if (len === 0) {
      log.info("Owner sync done!");
      return true;
    } else {
      const last = inscriptions[len - 1];
      return this.syncFromIndex(last);
    }
  }

  async updateInscription(i: {
    inscriptionId: string;
    inscriptionOwner: string;
    inscriptionIndex: number;
  }) {
    const data = await syncQueue.add(() =>
      inscriptionsClient.getOrdinalsV1Inscriptions1({
        id: i.inscriptionId,
      })
    );
    if (!data) return;

    const owner = data.address;
    if (owner !== i.inscriptionOwner) {
      log.info(
        {
          index: i.inscriptionIndex,
          old: i.inscriptionOwner,
          new: owner,
        },
        "New owner!"
      );
      await this.db.registration.update({
        where: {
          inscriptionId: i.inscriptionId,
        },
        data: {
          inscriptionOwner: owner,
          location: data.location,
        },
      });
    }
  }
}

let running = false;

export function makeOwnerSyncJob(db: PrismaClient) {
  const task = new AsyncTask(
    "sync-owners",
    async () => {
      if (running) return;

      running = true;
      return new OwnerSync(db)
        .syncFromIndex()
        .catch((e) => {
          console.error(e);
          logger.error({ error: e }, "Exception when syncing owner");
        })
        .finally(() => {
          running = false;
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

  return new SimpleIntervalJob({ hours: 1, runImmediately: true }, task, {
    preventOverrun: true,
  });
}
