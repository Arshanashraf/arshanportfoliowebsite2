-- Resume PDFs move from the local filesystem into Postgres.
--
-- The local-disk adapter cannot work on a serverless host: the filesystem is read-only
-- outside /tmp, and /tmp is per-instance and discarded between requests. Keeping the bytes
-- in the same database as the metadata means an upload survives a redeploy and stays
-- readable, so résumé uploads keep working in production.
--
-- The table is keyed by storage_key so the existing adapter functions
-- (saveResume / readResume / resumeExists / removeResume) keep their signatures and every
-- caller — the public /api/resume route and the admin routes — stays unchanged.
--
-- Rows are removed alongside the metadata they belong to: a deleted resume_files row is
-- harmless on its own, but resumeExists() treats it as the source of truth for whether a
-- document can actually be served.

CREATE TABLE IF NOT EXISTS resume_files (
  storage_key text PRIMARY KEY,
  bytes bytea NOT NULL,
  byte_size integer NOT NULL CHECK (byte_size > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
