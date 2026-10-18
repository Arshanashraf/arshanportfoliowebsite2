import "server-only";
import { randomUUID } from "node:crypto";
import { database } from "@/lib/database";

/**
 * Résumé document storage.
 *
 * The bytes live in Postgres (`resume_files`, migration 003) rather than on disk. A
 * serverless host gives the application a read-only filesystem apart from `/tmp`, which is
 * per-instance and thrown away, so a locally written PDF disappears and the public
 * `/api/resume` route starts returning 404. Keeping the bytes next to the metadata means
 * uploads survive a deploy and the admin can replace the document in production.
 *
 * The four functions below are the whole storage surface. Callers treat them as opaque:
 * they hand over bytes and get back an opaque key, which is what keeps this swap from
 * touching the public route or the admin upload/activate/delete routes.
 */

const MAX_RESUME_BYTES = 8 * 1024 * 1024;
const KEY_PATTERN = /^[0-9a-f-]{36}\.pdf$/i;

export function resumeSizeLimit() { return MAX_RESUME_BYTES; }

export function safeResumeFileName(name: string) {
  const leaf = name.replace(/\\/g, "/").split("/").pop() || "resume.pdf";
  const clean = leaf.normalize("NFKC").replace(/[^\p{L}\p{N}._ -]/gu, "").replace(/[. ]+$/g, "").trim().slice(0, 120);
  return clean.toLowerCase().endsWith(".pdf") ? clean : `${clean.replace(/\.[^.]*$/, "") || "resume"}.pdf`;
}

function assertKey(storageKey: string) {
  if (!KEY_PATTERN.test(storageKey)) throw new Error("Invalid resume storage key.");
}

export async function saveResume(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_RESUME_BYTES) throw new Error("Resume exceeds the 8 MB limit.");
  const storageKey = `${randomUUID()}.pdf`;
  await database().query("INSERT INTO resume_files(storage_key,bytes,byte_size) VALUES($1,$2,$3)", [storageKey, Buffer.from(bytes), bytes.byteLength]);
  return storageKey;
}

export async function readResume(storageKey: string) {
  assertKey(storageKey);
  const { rows } = await database().query<{ bytes: Buffer }>("SELECT bytes FROM resume_files WHERE storage_key=$1 LIMIT 1", [storageKey]);
  if (!rows[0]) throw new Error("Resume file not found.");
  return rows[0].bytes;
}

export async function resumeExists(storageKey: string) {
  try {
    assertKey(storageKey);
    const { rowCount } = await database().query("SELECT 1 FROM resume_files WHERE storage_key=$1", [storageKey]);
    return Boolean(rowCount);
  } catch {
    return false;
  }
}

export async function removeResume(storageKey: string) {
  assertKey(storageKey);
  await database().query("DELETE FROM resume_files WHERE storage_key=$1", [storageKey]);
}
