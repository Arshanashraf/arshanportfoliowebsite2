import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { database, isDatabaseConfigured } from "@/lib/database";

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || (process.env.NODE_ENV === "production" ? "__Host-arshan_session" : "arshan_session");
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;
export type AdminUser = { id: string; email: string };
function digest(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await database().query("INSERT INTO admin_sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')", [userId, digest(token)]);
  return token;
}

export async function getAdminForToken(token: string | undefined): Promise<AdminUser | null> {
  if (!token || !isDatabaseConfigured()) return null;
  const { rows } = await database().query<AdminUser>("SELECT u.id,u.email FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.is_active=true LIMIT 1", [digest(token)]);
  return rows[0] ?? null;
}

export async function currentAdmin() {
  const cookieStore = await cookies();
  return getAdminForToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function revokeAdminSession(token: string | undefined) {
  if (token && isDatabaseConfigured()) await database().query("DELETE FROM admin_sessions WHERE token_hash=$1", [digest(token)]);
}

export const sessionCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: SESSION_AGE_SECONDS };
