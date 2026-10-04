import { NextResponse } from "next/server";
import { database, isDatabaseConfigured } from "@/lib/database";
import { createAdminSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit, ConfigurationError, sameOrigin } from "@/lib/security";

function fail(message: string, status: number) { return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } }); }
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request could not be accepted.", 403);
  if (!isDatabaseConfigured()) return fail("Admin access is not configured yet.", 503);
  const size = Number(request.headers.get("content-length") || 0);
  if (size > 4096) return fail("Invalid sign-in request.", 400);
  let payload: unknown;
  try { const raw = await request.text(); if (Buffer.byteLength(raw) > 4096) return fail("Invalid sign-in request.", 400); payload = JSON.parse(raw); } catch { return fail("Invalid email or password.", 401); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return fail("Invalid email or password.", 401);
  const input = payload as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (email.length > 254 || password.length < 1 || password.length > 1024) return fail("Invalid email or password.", 401);
  try {
    const ipLimit = await checkRateLimit(request,"login-ip","all",30,900); const limit = await checkRateLimit(request, "login", email, 8, 900);
    if (!ipLimit.allowed || !limit.allowed) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter), "Cache-Control": "no-store" } });
    const { rows } = await database().query<{ id: string; password_hash: string; is_active: boolean }>("SELECT id,password_hash,is_active FROM admin_users WHERE lower(email)=lower($1) LIMIT 1", [email]);
    const admin = rows[0];
    const valid = await verifyPassword(password, admin?.password_hash ?? null);
    if (!admin || !admin.is_active || !valid) return fail("Invalid email or password.", 401);
    const token = await createAdminSession(admin.id);
    const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    if (error instanceof ConfigurationError) return fail("Admin access is not configured yet.", 503);
    return fail("Sign-in is temporarily unavailable.", 503);
  }
}
