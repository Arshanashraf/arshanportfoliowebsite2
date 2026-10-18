import { spawnSync } from "node:child_process";

try { process.loadEnvFile(".env.local"); } catch { /* Fall back to the ambient environment. */ }

/**
 * Applies migrations as part of a Vercel build, before `next build`.
 *
 * This is invoked by the `buildCommand` in vercel.json, so a deployment can never run
 * code against a schema that is behind it.
 *
 * A failure is reported but not fatal. When a query fails the public site already degrades
 * to empty sections rather than erroring, so shipping a working-but-empty deployment and
 * flagging the problem is better than failing the build outright because a database was
 * briefly asleep or unreachable. A provider with scale-to-zero is the common case: the
 * first connection of the day can be slow, and that should not block a deploy.
 */

if (!process.env.DATABASE_URL) {
  console.log("Skipping migrations: DATABASE_URL is not configured.");
  process.exit(0);
}

const result = spawnSync(process.execPath, ["scripts/migrate.mjs"], { stdio: "inherit" });
if (result.status !== 0) {
  console.warn("\nMigrations did not complete. The build will continue; run `npm run db:migrate` against the same database to retry.");
}
