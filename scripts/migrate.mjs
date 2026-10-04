import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";
process.loadEnvFile(".env.local");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before running migrations.");
const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 5_000 });
try {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(hashtext('arshan-portfolio-migrations'))");
    const files = (await readdir(resolve("database/migrations"))).filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name)).sort();
    for (const file of files) {
      const version = file.replace(/\.sql$/i, "");
      if (version !== "001_initial") {
        const existing = await client.query("SELECT 1 FROM schema_migrations WHERE version=$1", [version]);
        if (existing.rowCount) { console.log(`Skipped ${version} (already applied).`); continue; }
      }
      const sql = await readFile(resolve("database/migrations", file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations(version) VALUES ($1) ON CONFLICT (version) DO NOTHING", [version]);
        await client.query("COMMIT");
        console.log(`Applied ${version}.`);
      } catch (error) { await client.query("ROLLBACK"); throw error; }
    }
    await client.query("SELECT pg_advisory_unlock(hashtext('arshan-portfolio-migrations'))");
  } finally { client.release(); }
} finally { await pool.end(); }
