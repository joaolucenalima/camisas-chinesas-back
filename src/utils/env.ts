import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.number().min(1).max(65535),
  NETWORK_PATH: z.string(),
  DATABASE_URL: z.string(),
});

export const validatedEnv = envSchema.parse({
  PORT: process.env.PORT,
  NETWORK_PATH: process.env.NETWORK_PATH,
  DATABASE_URL: process.env.DATABASE_URL,
});
