import { PrismaClient, Registration } from "@prisma/client";
import PQueue from "p-queue";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import { logger } from "../logger";
import {
  OrdinalBlockTransfers,
  hiroStatusClient,
  inscriptionsClient,
} from "../ordinals-api";

export const OWNERS_SYNC_ID = 999999;

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

  async startSync() {
    const maxSync = await this.db.syncs.findFirst({
      orderBy: {
        inscriptionIndex: "desc",
      },
      where: {
        version: OWNERS_SYNC_ID,
      },
    });

    let startHeight = maxSync?.inscriptionIndex;
    if (typeof startHeight === "undefined") {
      startHeight = 777735;
    }

    startHeight = startHeight + 1;

    const hiroStatus = await hiroStatusClient.getApiStatus();
    const maxHeight = hiroStatus.block_height ?? startHeight + 1;

    log.info(
      {
        height: startHeight,
        maxHeight,
      },
      "Starting block sync"
    );

    if (startHeight === maxHeight) {
      return true;
    }

    await this.syncBlock({
      height: startHeight,
    });

    await this.db.syncs.create({
      data: {
        version: OWNERS_SYNC_ID,
        inscriptionIndex: startHeight,
        timestamp: new Date().getTime(),
      },
    });

    return false;
  }

  async syncBlock({
    height,
    // maxHeight,
    offset = 0,
  }: {
    height: number;
    // maxHeight: number;
    offset?: number;
  }): Promise<boolean> {
    const limit = 60;
    log.debug(
      {
        height,
        offset,
      },
      "Syncing owners for block"
    );
    const transfers = await inscriptionsClient.getTransfersPerBlock({
      limit,
      block: String(height),
      offset,
    });

    if (transfers.results.length === 0) {
      return true;
    }

    const ids = transfers.results.map((t) => t.id);

    const regs = await this.db.registration.findMany({
      where: {
        inscriptionId: {
          in: ids,
        },
      },
    });

    log.debug(
      {
        height,
        registrations: regs.length,
      },
      `Updating owners for ${regs.length} registrations`
    );

    await Promise.all(
      regs.map(async (r) => {
        await syncQueue.add(() => {
          return this.updateWithTransfer(r, transfers.results);
        });
      })
    );

    if (offset + limit > transfers.total) {
      return true;
    }
    return this.syncBlock({
      height,
      offset: offset ?? 0 + limit,
    });
  }

  async updateWithTransfer(
    registration: Registration,
    transfers: OrdinalBlockTransfers
  ) {
    const transfer = transfers.find((t) => t.id === registration.inscriptionId);
    const newOwner = transfer?.to.address;
    if (!transfer || !newOwner) return;
    await this.db.registration.update({
      where: {
        inscriptionId: registration.inscriptionId,
      },
      data: {
        inscriptionOwner: newOwner,
        location: transfer.to.location,
        outputValue: transfer.to.value
          ? BigInt(transfer.to.value)
          : registration.outputValue,
      },
    });
  }
}

async function syncOwners(db: PrismaClient) {
  const syncer = new OwnerSync(db);
  const done = await syncer.startSync();
  if (done) {
    log.info("Owner sync done!");
  } else {
    await syncOwners(db);
  }
}

let running = false;

export function makeOwnerSyncJob(db: PrismaClient) {
  const task = new AsyncTask(
    "sync-owners",
    async () => {
      if (running) return;

      running = true;
      return syncOwners(db)
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

  return new SimpleIntervalJob({ minutes: 10, runImmediately: true }, task, {
    preventOverrun: true,
  });
}
