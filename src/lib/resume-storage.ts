import "server-only";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const MAX_RESUME_BYTES = 8 * 1024 * 1024;
const storageDirectory = resolve(/* turbopackIgnore: true */ process.env.RESUME_STORAGE_DIR || join(process.cwd(), "data", "resumes"));

export function resumeSizeLimit() { return MAX_RESUME_BYTES; }
export function safeResumeFileName(name: string) {
  const leaf = name.replace(/\\/g, "/").split("/").pop() || "resume.pdf";
  const clean = leaf.normalize("NFKC").replace(/[^\p{L}\p{N}._ -]/gu, "").replace(/[. ]+$/g, "").trim().slice(0, 120);
  return clean.toLowerCase().endsWith(".pdf") ? clean : `${clean.replace(/\.[^.]*$/, "") || "resume"}.pdf`;
}
function filePath(storageKey: string) {
  if (!/^[0-9a-f-]{36}\.pdf$/i.test(storageKey)) throw new Error("Invalid resume storage key.");
  return join(/* turbopackIgnore: true */ storageDirectory, storageKey);
}
export async function saveResume(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_RESUME_BYTES) throw new Error("Resume exceeds the 8 MB limit.");
  const storageKey = `${randomUUID()}.pdf`;
  await mkdir(storageDirectory, { recursive: true });
  await writeFile(/* turbopackIgnore: true */ filePath(storageKey), bytes, { flag: "wx", mode: 0o600 });
  return storageKey;
}
export async function readResume(storageKey: string) { return readFile(/* turbopackIgnore: true */ filePath(storageKey)); }
export async function resumeExists(storageKey: string) { try { const info = await stat(/* turbopackIgnore: true */ filePath(storageKey)); return info.isFile(); } catch { return false; } }
export async function removeResume(storageKey: string) {
  try { await unlink(/* turbopackIgnore: true */ filePath(storageKey)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}



