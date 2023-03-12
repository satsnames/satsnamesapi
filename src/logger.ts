import pino from "pino";
export let logger: pino.Logger;

if (process.env.NODE_ENV === "development") {
  logger = pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
    level: process.env.LOG_LEVEL || "debug",
  });
} else if (process.env.NODE_ENV === "test") {
  logger = pino({
    level: "silent",
  });
} else {
  logger = pino({
    level: "debug",
  });
}
