import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import { readResume } from "@/lib/resume-storage";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return new NextResponse("Authentication required.", { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Not found.", { status: 404 });
  try {
    const { rows } = await database().query<{ file_name: string; storage_key: string }>("SELECT file_name,storage_key FROM resumes WHERE id=$1", [id]);
    if (!rows[0]) return new NextResponse("Not found.", { status: 404 });
    const bytes = await readResume(rows[0].storage_key);
    return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${rows[0].file_name.replace(/["\\\r\n]/g, "_")}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" } });
  } catch { return new NextResponse("Resume unavailable.", { status: 404 }); }
}
