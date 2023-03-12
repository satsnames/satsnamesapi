import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

export const prismaPlugin = fp(async (server) => {
  const db = new PrismaClient();
  await db.$connect();
  server.decorate("db", db);

  server.addHook("onClose", async (server) => {
    await server.db.$disconnect();
  });
});
