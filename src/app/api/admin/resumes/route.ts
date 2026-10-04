import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { database, isDatabaseConfigured } from "@/lib/database";
import { removeResume, resumeExists, resumeSizeLimit, safeResumeFileName, saveResume } from "@/lib/resume-storage";
import { sameOrigin } from "@/lib/security";
export const runtime = "nodejs";
function fail(message: string, status: number) { return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } }); }
export async function GET() {
  if (!await currentAdmin()) return fail("Authentication required.", 401);
  if (!isDatabaseConfigured()) return fail("Database is not configured.", 503);
  try {
    const { rows } = await database().query<{ id: string; file_name: string; storage_key: string; version: number; is_active: boolean; uploaded_at: Date; updated_at: Date }>("SELECT id,file_name,storage_key,version,is_active,uploaded_at,updated_at FROM resumes ORDER BY version DESC");
    const items = await Promise.all(rows.map(async ({ storage_key, ...item }) => ({ ...item, file_available: await resumeExists(storage_key) })));
    return NextResponse.json({ items, maxBytes: resumeSizeLimit() }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail("Could not load resume versions.", 503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("This request could not be accepted.", 403);
  if (!await currentAdmin()) return fail("Authentication required.", 401);
  if (!isDatabaseConfigured()) return fail("Database is not configured.", 503);
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > resumeSizeLimit() + 128_000) return fail("Resume must be 8 MB or smaller.", 413);
  let storageKey: string | undefined;
  try {
    const data = await request.formData(); const file = data.get("resume");
    if (!(file instanceof File) || file.size < 8 || file.size > resumeSizeLimit()) return fail("Choose a PDF file no larger than 8 MB.", 400);
    if (!file.name.toLowerCase().endsWith(".pdf") || !["application/pdf", "application/octet-stream", ""].includes(file.type)) return fail("Only PDF resumes are accepted.", 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") return fail("The selected file is not a valid PDF.", 400);
    const fileName = safeResumeFileName(file.name); storageKey = await saveResume(bytes);
    const client = await database().connect(); let item;
    try {
      await client.query("BEGIN"); await client.query("SELECT pg_advisory_xact_lock(hashtext('arshan-portfolio-resume-active'))");
      const { rows } = await client.query("SELECT COALESCE(MAX(version),0)+1 AS version FROM resumes");
      await client.query("UPDATE resumes SET is_active=false,updated_at=now() WHERE is_active=true");
      const result = await client.query("INSERT INTO resumes(file_name,storage_key,version,is_active) VALUES($1,$2,$3,true) RETURNING id,file_name,version,is_active,uploaded_at,updated_at", [fileName, storageKey, rows[0].version]);
      item = result.rows[0]; await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
    return NextResponse.json({ item }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { if (storageKey) await removeResume(storageKey).catch(() => undefined); return fail("Could not store the resume. Check server storage and database access.", 503); }
}
