import fastify from "fastify";
import { logger } from "./logger";
import { fastifySchedule } from "@fastify/schedule";
import { prismaPlugin } from "./prisma-plugin";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { namesRouter } from "./router";
import { statusRouter } from "./router/status";
import cors from "@fastify/cors";
import fastifyMetrics from "fastify-metrics";
import fastifySwagger from "@fastify/swagger";
import SwaggerUi from "@fastify/swagger-ui";
import { serverMetricsPlugin } from "./metrics";
import RateLimiter from "@fastify/rate-limit";

export async function makeApp() {
  const app = fastify({ logger }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(RateLimiter, {
    max: 50,
    // timeWindow: "1 minute",
  });

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: ".sats API",
        description: "API for .sats",
        version: "v0.0.1",
      },
    },
    hideUntagged: true,
    transform: jsonSchemaTransform,
  });
  await app.register(SwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      requestSnippets: {
        generators: {
          curl_bash: {
            title: "cURL",
            syntax: "bash",
          },
        },
        defaultExpanded: true,
        // lang
      },
    },
  });

  await app.register(prismaPlugin);
  await app.register(cors);

  await app.register(fastifyMetrics);
  await app.register(serverMetricsPlugin);

  app.get("/", (req, res) => {
    return res.status(200).send({
      ready: true,
    });
  });

  app.setErrorHandler(function (error, request, reply) {
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: "Too many requests",
        message: "Rate limit exceeded, retry in 1 minute",
      });
    }
    const message =
      error instanceof Error ? error.message : "Internal server error";
    logger.error(
      {
        path: request.url,
        message,
        error,
      },
      "Server error"
    );
    return reply.status(500).send({ error: "Internal server error" });
  });

  await app.register(namesRouter);

  await app.register(statusRouter);

  await app.register(fastifySchedule);

  return app;
}
