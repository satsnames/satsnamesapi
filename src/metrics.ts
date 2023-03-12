import type { LabelValues } from "prom-client";
import { Gauge, Counter, Summary } from "prom-client";
import "fastify-metrics";
import type { FastifyPluginAsync, FastifyPlugin } from "./types";
import fp from "fastify-plugin";
import type { FastifyRequest } from "fastify";
import { SYNC_VERSION } from "./sync";

type RequestMetrics = {
  summaryRolling: (
    labels?: LabelValues<"route" | "method" | "status_code">
  ) => void;
};

export const serverMetricsPlugin: FastifyPluginAsync = fp(
  async (server, _options) => {
    const requestCount = new Counter({
      name: "http_request_count",
      help: "Total number of requests made",
      labelNames: ["route", "method", "status_code"] as const,
    });

    const db = server.db;
    new Gauge({
      help: "Total number of names",
      name: "sats_names_total",
      async collect() {
        db.name.count().then((c) => this.set(c));
      },
    });

    new Gauge({
      help: "Total number of inscriptions",
      name: "sats_inscriptions_total",
      async collect() {
        db.registration.count().then((c) => this.set(c));
      },
    });

    new Gauge({
      help: "Current sync height",
      name: "sats_sync_height",
      async collect() {
        db.syncs
          .findFirst({
            where: {
              version: SYNC_VERSION,
            },
            orderBy: {
              timestamp: "desc",
            },
          })
          .then((sync) => {
            if (sync !== null) {
              this.set(sync.inscriptionIndex);
            }
          });
      },
    });

    const reqSummaryRolling = new Summary({
      name: "request_summary_seconds_rolling",
      help: "Rolling metric for request time",
      labelNames: ["route", "method", "status_code"] as const,
      maxAgeSeconds: 600,
      ageBuckets: 5,
    });

    const metricsStorage = new WeakMap<FastifyRequest, RequestMetrics>();

    server.addHook("onRequest", (request, _, done) => {
      if (request.routeConfig.disableMetrics === true) {
        return done();
      }
      metricsStorage.set(request, {
        summaryRolling: reqSummaryRolling.startTimer(),
      });
      done();
    });

    server.addHook("onResponse", (request, reply, done) => {
      if (request.routeConfig.disableMetrics === true) {
        return done();
      }

      const stored = metricsStorage.get(request);

      const method = request.routerMethod ?? request.method;

      const route = request.routeConfig.statsId ?? request.routerPath;
      const statusCode = reply.statusCode;

      const labels = {
        route,
        method,
        status_code: statusCode,
      };

      stored?.summaryRolling(labels);

      requestCount.labels(labels).inc();
    });
    return await Promise.resolve();
  }
);
