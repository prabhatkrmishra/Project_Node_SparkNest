/**
 * Main entry point for the server application.
 */

import app from "./app.js";
import { connectDB } from "./db/db.js";
import { runMigrations } from "./db/migrate.js";
import config from "./config/config.js";
import cron from "node-cron";
import pool from "./db/db.js";
import { updateFeaturedArticles } from "./models/featuredArticlesModel.js";

async function start() {
  await runMigrations();
  await connectDB();

  try {
    await updateFeaturedArticles();
  } catch (err) {
    console.warn("updateFeaturedArticles failed on boot (DB may be empty):", err.message);
  }

  cron.schedule("0 0 * * 0", async () => {
    console.log("Updating featured articles...");
    await updateFeaturedArticles();
    console.log("Featured articles updated successfully.");
  });

  const server = app.listen(config.port, config.hostname, () => {
    console.log(`Server running at http://${config.hostname}:${config.port}/`);
  });

  const shutdown = async () => {
    console.log("Shutting down...");
    server.close(async () => {
      try {
        await pool.end();
      } catch (err) {
        console.error("Pool close error:", err);
      }
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
