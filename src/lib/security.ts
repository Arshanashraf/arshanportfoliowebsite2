import "server-only";
import { createHmac } from "node:crypto";
import { database } from "@/lib/database";

export class ConfigurationError extends Error { constructor() { super("Server configuration is incomplete."); this.name = "ConfigurationError"; } }

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

export async function checkRateLimit(request: Request, scope: string, identity: string, maximum: number, windowSeconds: number) {
  const secret = process.env.APP_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new ConfigurationError();
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded?.split(",").at(-1)?.trim() || "unknown";
  const key = createHmac("sha256", secret).update(`${clientIp}\n${identity}`).digest("hex");
  const window = windowSeconds * 1000;
  const started = new Date(Math.floor(Date.now() / window) * window);
  const pool=database();
  await pool.query("DELETE FROM request_limits WHERE bucket_started_at < now()-interval '2 days'");
  const { rows } = await pool.query<{ request_count: number }>(
    `INSERT INTO request_limits (scope,bucket_key,bucket_started_at,request_count) VALUES ($1,$2,$3,1) ON CONFLICT (scope,bucket_key) DO UPDATE SET request_count=CASE WHEN request_limits.bucket_started_at < EXCLUDED.bucket_started_at THEN 1 ELSE request_limits.request_count+1 END,bucket_started_at=EXCLUDED.bucket_started_at RETURNING request_count`,
    [scope, key, started],
  );
  return { allowed: rows[0].request_count <= maximum, retryAfter: Math.ceil((started.getTime() + window - Date.now()) / 1000) };
}
