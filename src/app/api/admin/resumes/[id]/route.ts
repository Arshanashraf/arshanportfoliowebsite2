import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import { removeResume } from "@/lib/resume-storage";
import { sameOrigin } from "@/lib/security";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
function fail(message: string, status: number) { return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } }); }
function validId(id: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id); }
export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return fail("This request could not be accepted.", 403);
  if (!await currentAdmin()) return fail("Authentication required.", 401);
  const { id } = await context.params; if (!validId(id)) return fail("Resume not found.", 404);
  let action: "activate" | "deactivate";
  try { const payload = await request.json() as { activate?: unknown; deactivate?: unknown }; if (payload.activate === true && payload.deactivate !== true) action = "activate"; else if (payload.deactivate === true && payload.activate !== true) action = "deactivate"; else return fail("Choose activation or deactivation.", 400); }
  catch { return fail("Choose activation or deactivation.", 400); }
  try {
    const client = await database().connect();
    try {
      await client.query("BEGIN"); await client.query("SELECT pg_advisory_xact_lock(hashtext('arshan-portfolio-resume-active'))");
      if (action === "activate") await client.query("UPDATE resumes SET is_active=false,updated_at=now() WHERE is_active=true");
      const result = await client.query("UPDATE resumes SET is_active=$2,updated_at=now() WHERE id=$1 RETURNING id,file_name,version,is_active,uploaded_at,updated_at", [id, action === "activate"]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return fail("Resume not found.", 404); }
      await client.query("COMMIT"); return NextResponse.json({ item: result.rows[0] }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  } catch { return fail(`Could not ${action} this resume.`, 503); }
}
export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return fail("This request could not be accepted.", 403);
  if (!await currentAdmin()) return fail("Authentication required.", 401);
  const { id } = await context.params; if (!validId(id)) return fail("Resume not found.", 404);
  try { const body = await request.json() as { confirm?: unknown }; if (body.confirm !== true) return fail("Explicit confirmation is required.", 400); }
  catch { return fail("Explicit confirmation is required.", 400); }
  try {
    const result = await database().query<{ storage_key: string }>("DELETE FROM resumes WHERE id=$1 RETURNING storage_key", [id]);
    if (!result.rows[0]) return fail("Resume not found.", 404);
    await removeResume(result.rows[0].storage_key);
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch { return fail("Could not delete this resume version.", 503); }
}


