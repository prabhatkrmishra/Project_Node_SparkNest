/**
 * Configuration file for setting up environment variables and other settings.
 * Responsibilities:
 * * Load environment variables.
 * * Set up database configurations.
 * * Configure CORS options.
 * * Define session settings.
 */

import dotenv from "dotenv";

dotenv.config();

const config = {
  hostname: process.env.SERVER_HOSTNAME || "localhost",
  port: process.env.SERVER_PORT || 3000,
  pg: {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  },
  session: {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  nodemailer: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  allowedOrigins: process.env.FRONTEND_ADDRESS,
  backendAddress: process.env.BACKEND_ADDRESS,
  saltRounds: parseInt(process.env.PASSWORD_SALTROUNDS) || 10
};

export default config;
