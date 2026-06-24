import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import type { StringValue } from "ms";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const msString = z.string().refine((val): val is StringValue => true);

const serverEnvSchema = z.object({
  PORT: z.coerce.number().default(8080),

  NODE_ENV: z.enum([
    "development",
    "production",
    "test",
  ]),

  LOG_LEVEL: z
    .enum([
      "fatal",
      "error",
      "warn",
      "info",
      "debug",
      "trace",
    ])
    .default("info"),

  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().default("dev-secret"),
  JWT_EXPIRY: msString.default("7d"),
  REFRESH_TOKEN_EXPIRY: msString.default("15d"),
  OPENROUTER_API_KEY: z.string().default(""),
});

export type ServerEnv = z.infer<
  typeof serverEnvSchema
>;

export const serverEnv =
  serverEnvSchema.safeParse(process.env);

if (!serverEnv.success) {
  console.error(
    "Invalid server environment variables:",
    serverEnv.error.flatten().fieldErrors
  );

  throw new Error(
    "Invalid server environment variables"
  );
}

export const env = serverEnv.data;
