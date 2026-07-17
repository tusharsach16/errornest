import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
});

// Fail fast at boot if required env vars are missing/malformed, instead of
// discovering it later via a cryptic runtime error.
export const env = envSchema.parse(process.env);
