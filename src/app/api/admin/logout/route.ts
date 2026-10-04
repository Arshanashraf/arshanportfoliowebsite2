import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isDatabaseConfigured } from "@/lib/database";
import { revokeAdminSession, SESSION_COOKIE } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "This request could not be accepted." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token && isDatabaseConfigured()) { try { await revokeAdminSession(token); } catch { /* The cookie is still cleared if the database is unavailable. */ } }
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}

