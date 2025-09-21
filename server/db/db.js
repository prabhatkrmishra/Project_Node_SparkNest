/**
 * Database connection module for PostgreSQL.
 * Responsibilities:
 * * Establish and export the PostgreSQL database connection.
 * * Handle any database-specific initialization.
 */

import pkg from "pg";
const { Client } = pkg;
import config from "../config/config.js";

// Create a new PostgreSQL client using the configuration
const db = new Client({
  user: config.pg.user,
  host: config.pg.host,
  database: config.pg.database,
  password: config.pg.password,
  port: config.pg.port,
});

/**
 * Connect to the database.
 */
export async function connectDB() {
  try {
    await db.connect();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit the process on failure
  }
}

/**
 * Get the database client instance.
 *
 * @returns {Client} - The PostgreSQL client instance.
 */
export function getDBClient() {
  return db;
}

export default db;
