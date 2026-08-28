/**
 * Flyway migration runner.
 * - In Docker Compose: flyway runs as init container, so this is a no-op.
 * - Locally: tries Docker flyway image; falls back to direct SQL via pg Pool.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import config from "../config/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function tryDockerFlyway() {
  const projectRoot = path.resolve(__dirname, "../..");
  const url = `jdbc:postgresql://${config.pg.host}:${config.pg.port || 5432}/${config.pg.database}`;
  const user = config.pg.user || "";
  const password = config.pg.password || "";
  // Use host network so localhost DB is reachable
  const cmd = [
    "docker run --rm",
    "--network host",
    `-v "${projectRoot}:/flyway/project"`,
    "flyway/flyway:10.20",
    `-url=${url}`,
    `-user=${user}`,
    `-password=${password}`,
    "-configFiles=/flyway/project/flyway.conf",
    "migrate",
  ].join(" ");

  execSync(cmd, { stdio: "inherit" });
  console.log("Flyway migrations applied via Docker.");
  return true;
}

async function fallbackDirectMigrate() {
  console.log("Docker Flyway not available, falling back to direct SQL migration...");
  const pool = (await import("./db.js")).default;
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Ensure flyway_schema_history exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS flyway_schema_history (
      installed_rank INT PRIMARY KEY,
      version VARCHAR(50),
      description VARCHAR(200),
      type VARCHAR(20),
      script VARCHAR(1000),
      checksum INT,
      installed_by VARCHAR(100),
      installed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      execution_time INT,
      success BOOLEAN
    )
  `);

  const applied = await pool.query(
    "SELECT version FROM flyway_schema_history ORDER BY installed_rank"
  );
  const appliedVersions = new Set(applied.rows.map((r) => r.version));

  let rank = applied.rows.length + 1;
  for (const file of files) {
    const match = file.match(/^V(\d+)__.*\.sql$/);
    if (!match) continue;
    const version = match[1];
    if (appliedVersions.has(version)) {
      console.log(`Skipping already applied: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    console.log(`Applying ${file}...`);
    const start = Date.now();
    try {
      await pool.query(sql);
      const elapsed = Date.now() - start;
      await pool.query(
        "INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, installed_by, execution_time, success) VALUES ($1,$2,$3,'SQL',$4,'direct',$5,true)",
        [rank, version, file, file, elapsed]
      );
      console.log(`Applied ${file} in ${elapsed}ms`);
      rank++;
    } catch (err) {
      console.error(`Failed to apply ${file}:`, err.message);
      throw err;
    }
  }
  console.log("Direct SQL migrations complete.");
}

export async function runMigrations() {
  if (process.env.NODE_ENV === "test") {
    console.log("Skipping migrations in test env");
    return;
  }
  // If DB not configured, skip (e.g., CI without DB)
  if (!config.pg.database || !config.pg.host) {
    console.log("DB not configured, skipping migrations");
    return;
  }

  // Try Docker first if available
  try {
    // Quick check: is docker available?
    execSync("docker --version", { stdio: "ignore" });
    tryDockerFlyway();
    return;
  } catch (e) {
    // Docker not available or flyway failed — try fallback
    if (e.message && e.message.includes("flyway")) {
      console.warn("Flyway Docker failed, trying fallback:", e.message);
    }
  }

  await fallbackDirectMigrate();
}

// CLI: node server/db/migrate.js
const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
