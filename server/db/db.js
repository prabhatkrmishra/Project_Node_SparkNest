/**
 * Database connection module for PostgreSQL — Pool-based.
 */

import pkg from "pg";
const { Pool } = pkg;
import config from "../config/config.js";

const pool = new Pool({
  user: config.pg.user,
  host: config.pg.host,
  database: config.pg.database,
  password: config.pg.password,
  port: config.pg.port ? Number(config.pg.port) : 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("PG Pool error:", err);
});

/**
 * Verify pool connectivity.
 */
export async function connectDB() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("Database pool connected successfully.");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

/**
 * Get the pool instance (pool.query works like client.query).
 * For transactions, use: const client = await pool.connect()
 */
export function getDBClient() {
  return pool;
}

export default pool;
