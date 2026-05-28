/// <reference types="vite/client" />
import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

const envToParse = typeof import.meta !== "undefined" && import.meta.env 
  ? import.meta.env 
  : process.env;

export const clientEnv = clientEnvSchema.safeParse(envToParse);

if (!clientEnv.success) {
  console.error(
    "Invalid client environment variables:",
    clientEnv.error.flatten().fieldErrors
  );

  throw new Error("Invalid client environment variables");
}

export const env = clientEnv.data;