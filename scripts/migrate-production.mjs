import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const runtimeRoot = fileURLToPath(new URL(".", import.meta.url));
const releaseRoot = join(runtimeRoot, "..", "..");
const environmentFile = join(releaseRoot, ".env.production.local");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

const pool = mysql.createPool({ uri: databaseUrl, connectionLimit: 2, enableKeepAlive: true });
try {
  const migrationsRoot = join(runtimeRoot, "drizzle");
  const journal = JSON.parse(readFileSync(join(migrationsRoot, "meta", "_journal.json"), "utf8"));
  await pool.query("CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (`id` serial PRIMARY KEY, `hash` text NOT NULL, `created_at` bigint)");
  const [latestRows] = await pool.query("SELECT `created_at` FROM `__drizzle_migrations` ORDER BY `created_at` DESC LIMIT 1");
  const latest = Number(latestRows[0]?.created_at ?? 0);
  let applied = 0;
  for (const entry of journal.entries.sort((left, right) => left.when - right.when)) {
    if (entry.when <= latest) continue;
    const sqlText = readFileSync(join(migrationsRoot, `${entry.tag}.sql`), "utf8");
    const hash = createHash("sha256").update(sqlText).digest("hex");
    for (const statement of sqlText.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
      await pool.query(statement);
    }
    await pool.query("INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)", [hash, entry.when]);
    applied += 1;
  }
  process.stdout.write(`Production database migrations complete. Applied: ${applied}.\n`);
} finally {
  await pool.end();
}
