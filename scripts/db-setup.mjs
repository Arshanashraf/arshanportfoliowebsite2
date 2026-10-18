import { spawnSync } from "node:child_process";

/**
 * Brings a database fully up to date in one command: schema, content, CV, owner account.
 *
 * Every step is idempotent, so this is safe to run again after a failure, against a
 * database that is already set up, or against a brand new hosted one. That is the point:
 * a first deployment should not depend on getting four commands and their order right.
 *
 * Steps run as child processes so they share this terminal, which keeps the interactive
 * password prompt in `ensure-admin` working when ADMIN_EMAIL/ADMIN_PASSWORD are not set.
 */

const steps = [
  ["schema migrations", "scripts/migrate.mjs"],
  ["site content and skills", "scripts/seed-content.mjs"],
  ["resume document", "scripts/install-resume.mjs"],
  ["owner account", "scripts/ensure-admin.mjs"],
];

for (const [label, script] of steps) {
  console.log(`\n--- ${label} ---`);
  const result = spawnSync(process.execPath, [script], { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\nStopped during "${label}". Fix the error above and run \`npm run db:setup\` again — every step is safe to repeat.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nDatabase setup complete. Run `npm run db:status` to confirm.");
