import fp from "fastify-plugin";
import { z } from "zod";
import { FastifyPluginAsync } from "~/types";
import { logger } from "../logger";
import { SYNC_VERSION } from "../sync";

export const statusRouter = fp(async (server) => {
  server.route({
    method: "GET",
    url: "/status",
    schema: {
      tags: ["info"],
      response: {
        200: z.object({
          syncHeight: z.number(),
          lastSync: z.string(),
          message: z.string(),
          totalNames: z.number(),
        }),
      },
    },
    async handler(req, res) {
      const db = req.server.db;
      const lastSync = await db.syncs.findFirst({
        orderBy: {
          inscriptionIndex: "desc",
        },
        where: {
          version: SYNC_VERSION,
        },
      });
      if (lastSync === null) {
        return res.status(500).send({ error: "No syncs found" });
      }

      const nameCount = await db.name.count();

      const time = new Date(Number(lastSync.timestamp));
      const ago = new Date().getTime() - time.getTime();

      const minutes = (ago / 1000 / 60).toFixed(3);

      // logger.info(lastSync);

      return res.status(200).send({
        syncHeight: lastSync.inscriptionIndex,
        lastSync: time.toUTCString(),
        message: `Last sync finished ${minutes} minutes ago.`,
        totalNames: nameCount,
      });
    },
  });
});
