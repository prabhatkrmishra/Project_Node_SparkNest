/**
 * Main entry point for the server application.
 */

import app from "./app.js";
import { connectDB } from "./db/db.js";
import config from "./config/config.js";
import cron from "node-cron";
import { updateFeaturedArticles } from "./models/featuredArticlesModel.js";

// Connect to the database
connectDB();

(async () => {
  await updateFeaturedArticles();
})();

cron.schedule("0 0 * * 0", async () => {
  console.log("Updating featured articles...");
  await updateFeaturedArticles();
  console.log("Featured articles updated successfully.");
});

// Start server
app.listen(config.port, config.hostname, () => {
  console.log(`Server running at http://${config.hostname}:${config.port}/`);
});
