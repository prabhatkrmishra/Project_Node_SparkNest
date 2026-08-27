/**
 * Configuration — re-exports validated env for backward compatibility.
 * New code should import { env } from "./env.js" directly.
 */
import { env } from "./env.js";

const config = {
  hostname: env.SERVER_HOSTNAME,
  port: env.SERVER_PORT,
  pg: {
    user: env.PG_USER,
    host: env.PG_HOST,
    database: env.PG_DATABASE,
    password: env.PG_PASSWORD,
    port: env.PG_PORT,
  },
  session: {
    secret: env.SESSION_SECRET,
    cookie: {
      secure: env.SECURE_COOKIE,
      httpOnly: env.HTTP_ONLY,
      sameSite: env.SAME_SITE,
    },
  },
  serviceEmail: env.SERVICE_EMAIL_USER,
  servicePass: env.SERVICE_EMAIL_PASS,
  allowedOrigins: env.FRONTEND_ADDRESS,
  backendAddress: env.BACKEND_ADDRESS,
  saltRounds: env.PASSWORD_SALTROUNDS,
  dataRoot: env.DATA_ROOT,
  nodeEnv: env.NODE_ENV,
};

export default config;
export { env };
