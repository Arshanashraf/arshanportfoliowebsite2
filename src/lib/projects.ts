import "server-only";
import { projects as samples, type Project } from "@/data/projects";
import { database, isDatabaseConfigured } from "@/lib/database";
type ProjectRow = Omit<Project, "placeholder" | "details" | "sections" | "technologies" | "repoUrl" | "demoUrl" | "currentlyBuilding"> & { technologies: string[]; context: string; role_scope: string; approach: string; decisions: string; challenges: string; outcome: string; is_sample: boolean; repo_url: string | null; demo_url: string | null; currently_building: boolean };
const projectSelect = `SELECT p.slug,p.title,p.summary,p.context,p.role_scope,p.approach,p.decisions,p.challenges,p.outcome,p.outcome_type,p.is_sample,p.repo_url,p.demo_url,p.currently_building,p.created_at,p.published_at,COALESCE(json_agg(t.name ORDER BY pt.sort_order) FILTER (WHERE t.name IS NOT NULL),'[]'::json) AS technologies FROM projects p LEFT JOIN project_technologies pt ON pt.project_id=p.id LEFT JOIN technologies t ON t.id=pt.technology_id`;
export async function getPublicProjects(): Promise<Project[]> {
  if (!isDatabaseConfigured()) return process.env.NODE_ENV === "production" ? [] : samples;
  const { rows } = await database().query<ProjectRow>(`${projectSelect} WHERE p.status='published' GROUP BY p.id ORDER BY p.featured DESC,p.sort_order ASC,p.published_at DESC`);
  return rows.map(mapProject);
}
export async function getPublicProject(slug: string): Promise<Project | undefined> {
  if (!isDatabaseConfigured()) return process.env.NODE_ENV === "production" ? undefined : samples.find((project) => project.slug === slug);
  const { rows } = await database().query<ProjectRow>(`${projectSelect} WHERE p.status='published' AND p.slug=$1 GROUP BY p.id LIMIT 1`, [slug]);
  return rows[0] ? mapProject(rows[0]) : undefined;
}
function mapProject(row: ProjectRow): Project {
  const sections = [{ label: "Context", content: row.context }, { label: "Role and scope", content: row.role_scope }, { label: "Approach", content: row.approach }, { label: "Key decisions", content: row.decisions }, { label: "Challenges", content: row.challenges }, { label: "Outcome", content: row.outcome }].filter((section) => Boolean(section.content));
  return { slug: row.slug, title: row.title, category: "Project", summary: row.summary, details: sections.map((section) => section.content), sections, technologies: row.technologies, placeholder: row.is_sample, repoUrl: row.repo_url, demoUrl: row.demo_url, currentlyBuilding: row.currently_building };
}


