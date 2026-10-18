import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* Fall back to the ambient environment. */ }
const scrypt = promisify(scryptCallback);

/**
 * Creates the owner account, or resets its password if it already exists.
 *
 * Idempotent, and it works two ways so it can be part of an unattended setup:
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:ensure-admin   (unattended)
 *   npm run db:ensure-admin                                      (interactive prompts)
 *
 * This is what makes a first deploy to a new database a single command rather than
 * "create the account, but only if it does not exist yet". Rotating the password from an
 * interactive terminal also revokes existing sessions, so it doubles as the recovery path.
 */

function hiddenInput(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") throw new Error("This needs an interactive terminal, or set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.");
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    function finish(error) { stdin.setRawMode(false); stdin.pause(); stdin.removeListener("data", onData); stdout.write("\n"); if (error) reject(error); else resolve(value); }
    function onData(chunk) {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") return finish(new Error("Cancelled."));
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1); else value += char;
      }
    }
    stdin.on("data", onData);
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before creating the owner account.");
const target = (() => { try { const u = new URL(connectionString); return `${u.hostname}${u.port ? ":" + u.port : ""}/${u.pathname.replace(/^\//, "")}`; } catch { return "the configured database"; } })();

let email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (!email) {
  const prompt = createInterface({ input: stdin, output: stdout });
  try { email = (await prompt.question("Owner email: ")).trim().toLowerCase(); } finally { prompt.close(); }
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await hiddenInput("Password (at least 14 characters): ");
  const confirm = await hiddenInput("Confirm password: ");
  if (password !== confirm) throw new Error("Passwords do not match.");
}
if (password.length < 14) throw new Error("Use at least 14 characters.");

const salt = randomBytes(16);
const key = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const encoded = `scrypt$32768$8$1$${salt.toString("hex")}$${Buffer.from(key).toString("hex")}`;

const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 5_000, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined });
let account;
try {
  await pool.query("BEGIN");
  const { rows } = await pool.query(
    `INSERT INTO admin_users(email,password_hash) VALUES($1,$2)
     ON CONFLICT (lower(email)) DO UPDATE SET password_hash=EXCLUDED.password_hash,is_active=true,updated_at=now()
     RETURNING id,(xmax=0) AS created`,
    [email, encoded],
  );
  account = rows[0];
  if (!account.created) await pool.query("DELETE FROM admin_sessions WHERE user_id=$1", [account.id]);
  await pool.query("COMMIT");
} catch (error) {
  await pool.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await pool.end();
}

console.log(account.created
  ? `Owner account created in ${target}.`
  : `Owner account ${email} already existed in ${target}. The password was reset and existing sessions were revoked.`);
