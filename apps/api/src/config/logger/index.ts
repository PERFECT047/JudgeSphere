import "dotenv/config";

import pino from "pino";

import { env } from "@repo/env/server";

const isProduction =
  env.NODE_ENV === "production";

export const logger = pino({
  level: env.LOG_LEVEL,

  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",

        options: {
          colorize: true,

          translateTime:
            "yyyy-mm-dd HH:MM:ss",

          ignore: "pid,hostname",
        },
      },
});