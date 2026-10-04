import { NextResponse } from "next/server";
import { database, isDatabaseConfigured } from "@/lib/database";
import { readResume } from "@/lib/resume-storage";
export const runtime = "nodejs";
function unavailable() { return new NextResponse("Resume currently unavailable.", { status: 404, headers: { "Cache-Control": "no-store" } }); }
export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return unavailable();
  try {
    const { rows } = await database().query<{ storage_key: string; file_name: string }>("SELECT storage_key,file_name FROM resumes WHERE is_active=true LIMIT 1");
    if (!rows[0]) return unavailable();
    const bytes = await readResume(rows[0].storage_key);
    const disposition = new URL(request.url).searchParams.has("download") ? "attachment" : "inline";
    const filename = rows[0].file_name;
    const asciiFilename = filename.replace(/[^\x20-\x7E]|["\\\r\n]/g, "_");
    return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": "application/pdf", "Content-Length": String(bytes.byteLength), "Content-Disposition": `${disposition}; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return unavailable(); }
}
