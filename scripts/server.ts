import { PrismaClient } from "@prisma/client";
import { makeApp } from "../src/app";
import { makeSyncJob } from "../src/sync/crawler";
import { makeOwnerSyncJob } from "../src/sync/owners";
import { logger } from "../src/logger";

async function run() {
  const app = await makeApp();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;
  const address = await app.listen({
    host: "0.0.0.0",
    port,
  });
  logger.info(`Listening at ${address}`);
  if (process.env.RUN_SYNC !== "false") {
    const job = makeSyncJob(app.db);
    app.scheduler.addSimpleIntervalJob(job);
    app.scheduler.addSimpleIntervalJob(makeOwnerSyncJob(app.db));
  }
}

run()
  .catch(console.error)
  .finally(() => {});
