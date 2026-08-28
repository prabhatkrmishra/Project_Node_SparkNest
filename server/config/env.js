import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  SERVER_HOSTNAME: z.string().default("localhost"),
  SERVER_PORT: z.coerce.number().default(3000),
  PG_USER: z.string().optional().default(""),
  PG_HOST: z.string().optional().default("localhost"),
  PG_DATABASE: z.string().optional().default(""),
  PG_PASSWORD: z.string().optional().default(""),
  PG_PORT: z.coerce.number().default(5432),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be >=32 chars").default("test-secret-32-chars-minimum-for-tests"),
  SECURE_COOKIE: z.enum(["true", "false"]).default("false"),
  HTTP_ONLY: z.enum(["true", "false"]).default("true"),
  SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  FRONTEND_ADDRESS: z.string().optional().default("http://localhost:5143"),
  BACKEND_ADDRESS: z.string().optional().default("http://localhost:3000"),
  PASSWORD_SALTROUNDS: z.coerce.number().min(4).max(15).default(10),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  SERVICE_EMAIL_USER: z.string().optional(),
  SERVICE_EMAIL_PASS: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATA_ROOT: z.string().optional().default("./data"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid env:", parsed.error.flatten().fieldErrors);
  // In test, don't exit — allow fallback defaults
  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
