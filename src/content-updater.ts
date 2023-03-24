import { PrismaClient } from "@prisma/client";
import PQueue from "p-queue";
import { logger } from "./logger";
import { fetchOrdinalContent } from "./ordinals-api";
import { validateSnsInscription } from "./validator";

let lastIndex = 0;

type Inscription = {
  inscriptionIndex: number;
  inscriptionContent: string;
  inscriptionId: string;
};

const queue = new PQueue({
  concurrency: 8,
});

export class ContentUpdater {
  db: PrismaClient;
  lastIndex: number;
  updated: string[];

  constructor(db: PrismaClient, lastIndex: number) {
    this.db = db;
    this.lastIndex = lastIndex;
    this.updated = [];
  }

  static async create() {
    const db = new PrismaClient();
    await db.$connect();

    const firstIndex = await db.registration.findFirst({
      orderBy: {
        inscriptionIndex: "asc",
      },
      select: {
        inscriptionContent: true,
        inscriptionIndex: true,
        inscriptionId: true,
      },
    });

    const last = firstIndex ? firstIndex.inscriptionIndex - 1 : 100000000;

    return new ContentUpdater(db, last);
  }

  async process() {
    const regs = await this.db.registration.findMany({
      orderBy: {
        inscriptionIndex: "asc",
      },
      take: 100,
      where: {
        inscriptionIndex: {
          gt: this.lastIndex,
        },
      },
    });

    await Promise.all(
      regs.map(async (i) => {
        await queue.add(() => this.processInscription(i));
      })
    );

    return regs.at(-1)?.inscriptionIndex ?? null;
  }

  async processInscription(reg: Inscription) {
    const content = await fetchOrdinalContent(reg.inscriptionId);
    if (content !== reg.inscriptionContent) {
      logger.info(
        {
          id: reg.inscriptionId,
        },
        "Updating content"
      );
      this.updated.push(reg.inscriptionId);
      await this.db.registration.update({
        where: {
          inscriptionId: reg.inscriptionId,
        },
        data: {
          inscriptionContent: content,
        },
      });
    }
  }

  async run() {
    logger.info({ last: this.lastIndex }, `Syncing from ${this.lastIndex}`);
    const lastIndex = await this.process();
    if (lastIndex === null) {
      logger.info("Invalid remover finished.");
      return;
    }
    this.lastIndex = lastIndex;
    await this.run();
  }
}
