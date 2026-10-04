import "server-only";
import { database, isDatabaseConfigured } from "@/lib/database";
import { resumeExists } from "@/lib/resume-storage";
export type ActiveResume = { id: string; file_name: string; version: number; uploaded_at: Date };
export async function getActiveResume(): Promise<ActiveResume | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const { rows } = await database().query<ActiveResume & { storage_key: string }>("SELECT id,file_name,version,uploaded_at,storage_key FROM resumes WHERE is_active=true LIMIT 1");
    const row = rows[0];
    if (!row || !(await resumeExists(row.storage_key))) return null;
    return { id: row.id, file_name: row.file_name, version: row.version, uploaded_at: row.uploaded_at };
  } catch { return null; }
}
