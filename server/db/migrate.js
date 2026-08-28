/**
 * Flyway migration runner.
 * - In Docker Compose: flyway runs as init container, so this is a no-op.
 * - Locally: tries Docker flyway image; falls back to direct SQL via pg Pool.
 *
 * CLI:
 *   node db/migrate.js              -> migrate
 *   node db/migrate.js --validate   -> validate
 *   node db/migrate.js --info       -> info
 *   node db/migrate.js --clean      -> clean (dev only)
 *   node db/migrate.js --baseline   -> baseline existing DB at V1
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import config from "../config/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getFlywayCredentials() {
  if (config.databaseUrl) {
    const u = new URL(config.databaseUrl);
    const jdbcUrl = `jdbc:postgresql://${u.host}${u.pathname}${u.search}`;
    return {
      url: jdbcUrl,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
    };
  }
  return {
    url: `jdbc:postgresql://${config.pg.host}:${config.pg.port || 5432}/${config.pg.database}`,
    user: config.pg.user || "",
    password: config.pg.password || "",
  };
}

function dockerFlywayCommand(flywayCmd) {
  const projectRoot = path.resolve(__dirname, "../..");
  const { url, user, password } = getFlywayCredentials();
  const cmd = [
    "docker run --rm",
    "--network host",
    `-v "${projectRoot}:/flyway/project"`,
    "flyway/flyway:10.20",
    `-url=${url}`,
    `-user=${user}`,
    `-password=${password}`,
    "-configFiles=/flyway/project/flyway.conf",
    flywayCmd,
  ].join(" ");
  execSync(cmd, { stdio: "inherit" });
  return true;
}

function tryDockerFlyway(flywayCmd = "migrate") {
  dockerFlywayCommand(flywayCmd);
  console.log(`Flyway ${flywayCmd} via Docker done.`);
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

  const applied = await pool.query("SELECT version FROM flyway_schema_history ORDER BY installed_rank");
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

async function fallbackValidate() {
  const pool = (await import("./db.js")).default;
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const applied = await pool.query("SELECT version FROM flyway_schema_history ORDER BY installed_rank");
  const appliedVersions = new Set(applied.rows.map((r) => r.version));
  let ok = true;
  for (const file of files) {
    const match = file.match(/^V(\d+)__.*\.sql$/);
    if (!match) continue;
    const version = match[1];
    if (!appliedVersions.has(version)) {
      console.error(`Missing migration: ${file} (V${version})`);
      ok = false;
    }
  }
  if (ok) console.log("Validate: all migrations applied.");
  else throw new Error("Validate failed: missing migrations");
}

async function fallbackInfo() {
  const pool = (await import("./db.js")).default;
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const applied = await pool.query(
    "SELECT version, description, success, installed_on FROM flyway_schema_history ORDER BY installed_rank"
  );
  console.log("Applied migrations:");
  for (const row of applied.rows) {
    console.log(`  V${row.version} - ${row.description} - ${row.success ? "Success" : "Failed"} - ${row.installed_on}`);
  }
  console.log("\nAvailable files:");
  for (const file of files) {
    console.log(`  ${file}`);
  }
}

async function fallbackClean() {
  const pool = (await import("./db.js")).default;
  console.warn("Cleaning DB: dropping all tables...");
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  console.log("DB cleaned.");
}

async function fallbackBaseline() {
  const pool = (await import("./db.js")).default;
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
  const exists = await pool.query("SELECT 1 FROM flyway_schema_history WHERE version='1'");
  if (exists.rows.length === 0) {
    await pool.query(
      "INSERT INTO flyway_schema_history (installed_rank, version, description, type, script, installed_by, execution_time, success) VALUES (1,'1','baseline','SQL','V1__baseline.sql','baseline',0,true)"
    );
    console.log("Baselined at V1.");
  } else {
    console.log("Already baselined.");
  }
}

export async function runMigrations() {
  if (process.env.NODE_ENV === "test") {
    console.log("Skipping migrations in test env");
    return;
  }
  if (!config.databaseUrl && (!config.pg.database || !config.pg.host)) {
    console.log("DB not configured, skipping migrations");
    return;
  }

  try {
    execSync("docker --version", { stdio: "ignore" });
    tryDockerFlyway("migrate");
    return;
  } catch (e) {
    if (e.message && e.message.includes("flyway")) {
      console.warn("Flyway Docker failed, trying fallback:", e.message);
    }
  }

  await fallbackDirectMigrate();
}

export async function runValidate() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    dockerFlywayCommand("validate");
    return;
  } catch (_e) {
    // Docker not available, use fallback
  }
  await fallbackValidate();
}

export async function runInfo() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    dockerFlywayCommand("info");
    return;
  } catch (_e) {
    // Docker not available, use fallback
  }
  await fallbackInfo();
}

export async function runClean() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    dockerFlywayCommand("clean");
    return;
  } catch (_e) {
    // Docker not available, use fallback
  }
  await fallbackClean();
}

export async function runBaseline() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    dockerFlywayCommand("baseline -baselineVersion=1 -baselineDescription=\"legacy tables.sql\"");
    return;
  } catch (_e) {
    // Docker not available, use fallback
  }
  await fallbackBaseline();
}

// CLI
const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const arg = process.argv[2];
  let promise;
  if (arg === "--validate") promise = runValidate();
  else if (arg === "--info") promise = runInfo();
  else if (arg === "--clean") promise = runClean();
  else if (arg === "--baseline") promise = runBaseline();
  else promise = runMigrations();

  promise
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
