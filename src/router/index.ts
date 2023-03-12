import {
  FastifyPluginAsync,
  namesResultSchema,
  NamesResult,
  nameDetailsSchema,
  registrationOpSchema,
} from "../types";
import fp from "fastify-plugin";
import { z } from "zod";
import { fetchAllNamesCache, fetchName, fetchNames } from "../names";

export const namesRouter: FastifyPluginAsync = fp(async (server) => {
  server.route({
    method: "GET",
    url: "/names",
    schema: {
      summary: "Fetch recent names",
      description: `
Fetch all registered .sats names in reverse chronological order.

To paginate, use the \`cursor\` param, which represents a specific inscription index.

For example, if the last result's \`inscriptionIndex\` was 179000, then adding
\`?cursor=179000\` will return paginate to names before 179000.
      `,
      tags: ["names"],
      querystring: z.object({
        cursor: z
          .optional(z.string())
          .describe(
            'An optional pagination query. Fetch only names registered before a specific inscription index. Example: "180000"'
          ),
      }),
      response: {
        200: namesResultSchema,
      },
    },
    async handler(req, res) {
      const cursor = req.query.cursor;
      const db = req.server.db;

      const names = await fetchNames(
        db,
        cursor ? parseInt(cursor, 10) : undefined
      );

      return res.status(200).send({
        names,
      });
    },
  });

  server.route({
    method: "GET",
    url: "/names/:name",
    schema: {
      tags: ["names"],
      summary: "Fetch name details",
      description: `
Fetch details for a specific name. Enter the full and lowercase name, like \`satoshi.sats\`.

If multiple inscriptions tried to register the same name, this endpoint only returns the earliest
inscription, sorted by inscription number.
      `,
      params: z.object({
        name: z.string().describe("A full name, like `satoshi.sats`"),
      }),
      response: {
        200: nameDetailsSchema,
        404: z.object({
          error: z.string(),
        }),
      },
    },
    async handler(req, res) {
      const name = req.params.name.toLowerCase();
      const details = await fetchName(name, req.server.db);

      if (details === null) {
        return res.status(404).send({
          error: `${name} not found`,
        });
      }

      return res.status(200).send(details);
    },
  });

  server.route({
    method: "GET",
    url: "/names-csv",
    async handler(req, res) {
      const db = req.server.db;

      const data = await fetchAllNamesCache(db);

      res.status(200).send(data);
    },
  });
});
