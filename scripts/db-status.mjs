import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* Fall back to the ambient environment. */ }
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before checking database status.");

/**
 * Reports which database DATABASE_URL actually points at, and what is in it.
 *
 * Worth running before any setup step: the scripts all read DATABASE_URL, and in
 * PowerShell an `$env:` assignment only lasts for that one terminal window. Without this
 * check it is easy to run a step believing it targets a hosted database when it is
 * quietly targeting the local one.
 *
 * Credentials are never printed.
 */

const url = new URL(connectionString);
const target = `${url.hostname}${url.port ? ":" + url.port : ""}/${url.pathname.replace(/^\//, "")}`;
const looksLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);

const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 8_000, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined });

let rows;
try {
  const { rows: counts } = await pool.query(`
    SELECT
      (SELECT count(*) FROM schema_migrations)::int AS migrations,
      (SELECT count(*) FROM projects WHERE status='published')::int AS published_projects,
      (SELECT count(*) FROM projects WHERE status<>'published')::int AS draft_projects,
      (SELECT count(*) FROM skills WHERE is_visible)::int AS visible_skills,
      (SELECT count(*) FROM technologies)::int AS technologies,
      (SELECT count(*) FROM experiences WHERE is_visible)::int AS experiences,
      (SELECT count(*) FROM achievements WHERE is_visible)::int AS achievements,
      (SELECT count(*) FROM blog_posts WHERE status='published')::int AS published_posts,
      (SELECT count(*) FROM portfolio_settings WHERE key='privacy_retention_days')::int AS retention_setting,
      (SELECT count(*) FROM admin_users)::int AS admin_users,
      (SELECT count(*) FROM resumes WHERE is_active)::int AS active_resumes
  `);
  rows = counts[0];
} catch (error) {
  await pool.end();
  if (error.code === "42P01") {
    console.log(`Target: ${target}  (${looksLocal ? "local" : "remote"})`);
    console.log("\nConnected, but the schema has not been created yet. Run: npm run db:migrate");
    process.exit(1);
  }
  throw error;
}
await pool.end();

const label = (value, expected) => `${String(value).padStart(3)}  ${value === expected ? "ok" : "MISSING"}`;

console.log(`Target: ${target}  (${looksLocal ? "local" : "remote"}${process.env.DB_SSL === "true" ? ", ssl" : ""})`);
console.log("");
console.log("migrations applied      " + label(rows.migrations, 3));
console.log("published projects      " + label(rows.published_projects, 4));
console.log("draft projects          " + String(rows.draft_projects).padStart(3));
console.log("visible skills          " + label(rows.visible_skills, 37));
console.log("technologies            " + String(rows.technologies).padStart(3));
console.log("visible experience      " + label(rows.experiences, 1));
console.log("visible achievements    " + String(rows.achievements).padStart(3));
console.log("published posts         " + String(rows.published_posts).padStart(3));
console.log("retention setting       " + label(rows.retention_setting, 1));
console.log("admin accounts          " + label(rows.admin_users, 1));
console.log("active resume           " + label(rows.active_resumes, 1));
console.log("");
console.log(rows.migrations === 3 && rows.published_projects === 4 && rows.visible_skills === 37 && rows.active_resumes === 1 && rows.retention_setting === 1 && rows.admin_users >= 1
  ? "This database is ready to serve the public site."
  : "This database is not fully set up yet. See the MISSING rows above.");
