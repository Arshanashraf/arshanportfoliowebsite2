import { NextResponse } from "next/server";
import { database, isDatabaseConfigured } from "@/lib/database";
import { checkRateLimit, ConfigurationError, sameOrigin } from "@/lib/security";

function fail(message: string, status: number) { return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } }); }

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request could not be accepted.", 403);
  if (!isDatabaseConfigured()) return fail("The contact inbox is not configured yet.", 503);
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > 10_000) return fail("The message is too long.", 413);
  let body: unknown;
  try { const raw = await request.text(); if (Buffer.byteLength(raw) > 10_000) return fail("The message is too long.", 413); body = JSON.parse(raw); } catch { return fail("Enter a valid message.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Enter a valid message.", 400);
  const form = body as Record<string, unknown>;
  // Quietly discard automated submissions that fill the hidden honeypot.
  if (typeof form.website === "string" && form.website.trim()) return NextResponse.json({ ok: true });
  const name = typeof form.name === "string" ? form.name.trim() : "";
  const email = typeof form.email === "string" ? form.email.trim().toLowerCase() : "";
  const message = typeof form.message === "string" ? form.message.trim() : "";
  if (name.length < 2 || name.length > 100) return fail("Add a name between 2 and 100 characters.", 400);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid reply email.", 400);
  if (message.length < 10 || message.length > 4000) return fail("Write a message between 10 and 4,000 characters.", 400);
  if (form.consent !== true) return fail("Please acknowledge the message privacy note.", 400);
  try {
    const db=database();
    const policy=await db.query<{value:unknown}>("SELECT value FROM portfolio_settings WHERE key='privacy_retention_days' LIMIT 1");
    const retentionDays=Number(policy.rows[0]?.value);
    if(!Number.isInteger(retentionDays)||retentionDays<1||retentionDays>365)return fail("The contact inbox is not ready to accept messages yet.",503);
    await db.query("DELETE FROM messages WHERE received_at < now()-($1::int * interval '1 day')",[retentionDays]);
    const ipLimit=await checkRateLimit(request,"contact-ip","all",12,3600);
    const emailLimit=await checkRateLimit(request,"contact-email",email,5,3600);
    const limit=!ipLimit.allowed?ipLimit:emailLimit;
    if (!ipLimit.allowed||!emailLimit.allowed) return NextResponse.json({ error: "Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter), "Cache-Control": "no-store" } });
    await db.query("INSERT INTO messages(sender_name,sender_email,body) VALUES($1,$2,$3)", [name, email, message]);
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ConfigurationError) return fail("The contact inbox is not configured yet.", 503);
    return fail("The message could not be saved. Please try again later.", 503);
  }
}
