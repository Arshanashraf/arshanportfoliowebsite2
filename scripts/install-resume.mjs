import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* Fall back to the ambient environment. */ }
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before installing a resume.");

/**
 * Installs a PDF as the active résumé, doing exactly what the admin upload does:
 * store the bytes, deactivate the previous version, and record the new one as active.
 *
 * Useful for the first install, and for a fresh database where there is no admin session
 * to log in with yet. Routine replacements can be done from /admin/resume once a database
 * is configured.
 *
 * Usage: npm run db:install-resume -- [path/to/file.pdf]
 */

const MAX_RESUME_BYTES = 8 * 1024 * 1024;
const defaultPath = "docs/cv/Muhammad-Arshan-Ashraf-Siddiqui-Full-Stack-Developer.pdf";
const sourcePath = resolve(process.argv[2] ?? defaultPath);

const bytes = await readFile(sourcePath).catch(() => {
  throw new Error(`Could not read ${sourcePath}. Generate the PDF first, or pass a path.`);
});
if (bytes.byteLength < 8 || bytes.byteLength > MAX_RESUME_BYTES) throw new Error("Resume must be between 8 bytes and 8 MB.");
if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error(`${basename(sourcePath)} is not a valid PDF.`);

const fileName = basename(sourcePath);
const storageKey = `${randomUUID()}.pdf`;

const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 8_000, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined });
const client = await pool.connect();
let version;
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('arshan-portfolio-resume-active'))");

  const existing = await client.query("SELECT id,version FROM resumes WHERE file_name=$1 AND is_active=true LIMIT 1", [fileName]);
  if (existing.rowCount) {
    await client.query("ROLLBACK");
    console.log(`"${fileName}" is already the active résumé (version ${existing.rows[0].version}). Nothing to do.`);
    client.release();
    await pool.end();
    process.exit(0);
  }

  await client.query("INSERT INTO resume_files(storage_key,bytes,byte_size) VALUES($1,$2,$3)", [storageKey, bytes, bytes.byteLength]);
  const { rows } = await client.query("SELECT COALESCE(MAX(version),0)+1 AS version FROM resumes");
  version = rows[0].version;
  await client.query("UPDATE resumes SET is_active=false,updated_at=now() WHERE is_active=true");
  await client.query("INSERT INTO resumes(file_name,storage_key,version,is_active) VALUES($1,$2,$3,true)", [fileName, storageKey, version]);
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}

console.log(`Installed "${fileName}" as the active résumé (version ${version}, ${(bytes.byteLength / 1024).toFixed(0)} KB).`);
