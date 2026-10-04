import "server-only";
import { Pool } from "pg";

type DatabaseGlobal = typeof globalThis & { __arshanPool?: Pool };
const globalDatabase = globalThis as DatabaseGlobal;

export function isDatabaseConfigured() { return Boolean(process.env.DATABASE_URL); }

export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!globalDatabase.__arshanPool) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 5_000, ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" } : undefined });
    pool.on("error", () => console.error("An idle database connection failed."));
    globalDatabase.__arshanPool = pool;
  }
  return globalDatabase.__arshanPool;
}
