ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS currently_building boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS projects_single_currently_building_idx
  ON projects (currently_building) WHERE currently_building = true;

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  storage_key text NOT NULL UNIQUE,
  version integer NOT NULL UNIQUE CHECK (version > 0),
  is_active boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS resumes_one_active_idx
  ON resumes (is_active) WHERE is_active = true;
