import { env } from "@repo/env/server";

export const appConfig = {
  port: env.PORT,
  apiPrefix: "/api/v1",
};