import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* Fall back to the ambient environment. */ }
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before running migrations.");

/**
 * Applies every unapplied file in database/migrations, in filename order.
 *
 * Each migration runs in its own transaction holding a transaction-scoped advisory lock,
 * so two deploys starting at once cannot apply the same file twice. A transaction-scoped
 * lock is deliberate: a session-scoped `pg_advisory_lock` can be acquired on one backend
 * of a connection pooler and then unlocked on another, leaving the lock held forever and
 * hanging every later run. That makes this safe with a pooled connection string, which is
 * the only kind a hosted provider injects by default.
 *
 * `001_initial` is always re-applied rather than skipped because it is written entirely
 * with IF NOT EXISTS / ON CONFLICT DO NOTHING guards, and it is what creates the
 * `schema_migrations` table this script reads.
 */

const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 5_000, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined });
try {
  const client = await pool.connect();
  try {
    const files = (await readdir(resolve("database/migrations"))).filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name)).sort();
    for (const file of files) {
      const version = file.replace(/\.sql$/i, "");
      const sql = await readFile(resolve("database/migrations", file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query("SELECT pg_advisory_xact_lock(hashtext('arshan-portfolio-migrations'))");
        if (version !== "001_initial") {
          const existing = await client.query("SELECT 1 FROM schema_migrations WHERE version=$1", [version]);
          if (existing.rowCount) { await client.query("COMMIT"); console.log(`Skipped ${version} (already applied).`); continue; }
        }
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations(version) VALUES ($1) ON CONFLICT (version) DO NOTHING", [version]);
        await client.query("COMMIT");
        console.log(`Applied ${version}.`);
      } catch (error) { await client.query("ROLLBACK"); throw error; }
    }
  } finally { client.release(); }
} finally { await pool.end(); }
