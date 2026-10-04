CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_lower_idx ON admin_users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS admin_owner_only_idx ON admin_users ((true));

CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS request_limits (
  scope text NOT NULL,
  bucket_key text NOT NULL,
  bucket_started_at timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (scope, bucket_key)
);
CREATE INDEX IF NOT EXISTS request_limits_cleanup_idx ON request_limits (bucket_started_at);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL,
  context text NOT NULL DEFAULT '',
  role_scope text NOT NULL DEFAULT '',
  approach text NOT NULL DEFAULT '',
  decisions text NOT NULL DEFAULT '',
  challenges text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  outcome_type text NOT NULL DEFAULT 'unmeasured' CHECK (outcome_type IN ('unmeasured','measured','intended')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  is_sample boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  repo_url text,
  demo_url text,
  seo_title text,
  seo_description text,
  social_image text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_published_order_idx ON projects (status, featured DESC, sort_order, published_at DESC);

CREATE TABLE IF NOT EXISTS technologies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  group_name text NOT NULL DEFAULT 'other',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  context text NOT NULL DEFAULT '',
  PRIMARY KEY (project_id, technology_id)
);
CREATE TABLE IF NOT EXISTS project_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  alt_text text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  group_name text NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('core','working_knowledge','currently_learning','exploring')),
  description text NOT NULL DEFAULT '',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  role text NOT NULL,
  started_on date,
  ended_on date,
  description text NOT NULL DEFAULT '',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ended_on IS NULL OR started_on IS NULL OR ended_on >= started_on)
);
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  achieved_on date,
  description text NOT NULL DEFAULT '',
  evidence_url text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  body_markdown text NOT NULL DEFAULT '',
  cover_image text,
  cover_alt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published_at DESC) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','archived')),
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_inbox_idx ON messages (status, received_at DESC);

CREATE TABLE IF NOT EXISTS portfolio_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- Start sample project records as drafts so nothing is published without owner review.
INSERT INTO projects(title,slug,summary,context,status,is_sample,sort_order)
VALUES
('AIMS','aims','Automated Investment Management System.','Sample content — replace with verified project details.','draft',true,10),
('TrustRAG','trustrag','A retrieval-augmented generation system for ingestion, retrieval, evidence, generation, and traceable citations.','Sample content — replace with verified project details.','draft',true,20),
('ApexBot','apexbot','An AI and chat application using React and Hugging Face technologies.','Sample content — replace with verified project details.','draft',true,30),
('Kafka CRUD','kafka-crud','A Dockerized backend development project using Kafka and event-driven architecture.','Sample content — replace with verified project details.','draft',true,40),
('Personal Blog','personal-blog','A React blog project using Appwrite, Redux, and routing.','Sample content — replace with verified project details.','draft',true,50),
('E-commerce Application','e-commerce','Filtering, search, pagination, cart, Redux, and order functionality.','Sample content — replace with verified project details.','draft',true,60)
ON CONFLICT(slug) DO NOTHING;
INSERT INTO technologies(name,slug,group_name) VALUES
('React','react','frontend'),('Hugging Face','hugging-face','ai'),('Apache Kafka','apache-kafka','distributed'),('Docker','docker','devops'),('Appwrite','appwrite','backend'),('Redux','redux','frontend')
ON CONFLICT(slug) DO NOTHING;
INSERT INTO project_technologies(project_id,technology_id,sort_order)
SELECT p.id,t.id,row_number() OVER (PARTITION BY p.id ORDER BY t.name)
FROM projects p JOIN (VALUES ('apexbot','React'),('apexbot','Hugging Face'),('kafka-crud','Apache Kafka'),('kafka-crud','Docker'),('personal-blog','React'),('personal-blog','Appwrite'),('personal-blog','Redux'),('e-commerce','Redux')) AS mapping(project_slug,technology_name) ON mapping.project_slug=p.slug JOIN technologies t ON t.name=mapping.technology_name
ON CONFLICT(project_id,technology_id) DO NOTHING;

