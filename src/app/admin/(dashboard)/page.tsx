import Link from "next/link";
import { database } from "@/lib/database";

const sections = [
  { key: "projects", label: "Projects", href: "/admin/projects", hint: "Case studies and system write-ups" },
  { key: "skills", label: "Skills", href: "/admin/skills", hint: "Capabilities with confidence labels" },
  { key: "experiences", label: "Experience", href: "/admin/experience", hint: "Roles and timeline entries" },
  { key: "achievements", label: "Achievements", href: "/admin/achievements", hint: "Milestones and supporting evidence" },
  { key: "blog_posts", label: "Blog posts", href: "/admin/blog-posts", hint: "Articles and notes" },
  { key: "messages", label: "Messages", href: "/admin/messages", hint: "Inbound contact messages" },
  { key: "resumes", label: "Résumé versions", href: "/admin/resume", hint: "Uploaded PDF versions" },
] as const;

const quickActions = [
  { href: "/admin/projects", label: "New project", hint: "Start a case study" },
  { href: "/admin/blog-posts", label: "New post", hint: "Write an article" },
  { href: "/admin/resume", label: "Upload résumé", hint: "Publish a new PDF" },
  { href: "/admin/messages", label: "Open inbox", hint: "Read inbound messages" },
] as const;

const METRICS_SQL = `SELECT
    (SELECT count(*) FROM projects)::int AS projects,
    (SELECT count(*) FROM skills)::int AS skills,
    (SELECT count(*) FROM experiences)::int AS experiences,
    (SELECT count(*) FROM achievements)::int AS achievements,
    (SELECT count(*) FROM blog_posts)::int AS blog_posts,
    (SELECT count(*) FROM messages)::int AS messages,
    (SELECT count(*) FROM resumes)::int AS resumes,
    (SELECT count(*) FROM messages WHERE status = 'unread')::int AS unread_messages,
    (SELECT count(*) FROM projects WHERE status = 'draft')::int AS draft_projects,
    (SELECT count(*) FROM blog_posts WHERE status = 'draft')::int AS draft_posts,
    (SELECT count(*) FROM projects WHERE is_sample)::int AS sample_projects,
    (SELECT count(*) FROM projects WHERE coalesce(role_scope, '') = '' OR coalesce(outcome, '') = '')::int AS thin_projects,
    (SELECT count(*) FROM resumes WHERE is_active)::int AS active_resumes`;

const RECENT_SQL = `SELECT kind,label,updated_at FROM (SELECT 'Project' AS kind,title AS label,updated_at FROM projects UNION ALL SELECT 'Skill',name,updated_at FROM skills UNION ALL SELECT 'Experience',role || ' · ' || organization,updated_at FROM experiences UNION ALL SELECT 'Achievement',title,updated_at FROM achievements UNION ALL SELECT 'Article',title,updated_at FROM blog_posts UNION ALL SELECT 'Résumé',file_name,uploaded_at FROM resumes) AS recent_content ORDER BY updated_at DESC LIMIT 5`;

type Metrics = {
  projects: number;
  skills: number;
  experiences: number;
  achievements: number;
  blog_posts: number;
  messages: number;
  resumes: number;
  unread_messages: number;
  draft_projects: number;
  draft_posts: number;
  sample_projects: number;
  thin_projects: number;
  active_resumes: number;
};

type RecentItem = { kind: string; label: string; updated_at: Date };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic, locale-independent date so the server output never shifts. */
function formatDate(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default async function AdminOverview() {
  const pool = database();
  const [metricsResult, recentResult] = await Promise.all([
    pool.query<Metrics>(METRICS_SQL),
    pool.query<RecentItem>(RECENT_SQL),
  ]);
  const metrics = metricsResult.rows[0];
  const recent = recentResult.rows;
  const value = (key: keyof Metrics) => Number(metrics?.[key] ?? 0);

  const cards = sections.map((section) => {
    const total = value(section.key);
    let badge: string | undefined;
    if (section.key === "messages" && value("unread_messages") > 0) badge = `${value("unread_messages")} unread`;
    else if (section.key === "projects" && value("draft_projects") > 0) badge = `${value("draft_projects")} draft`;
    else if (section.key === "blog_posts" && value("draft_posts") > 0) badge = `${value("draft_posts")} draft`;
    else if (section.key === "resumes" && value("active_resumes") === 0) badge = "none active";
    return { ...section, total, badge };
  });

  const attention = [
    { count: value("unread_messages"), title: "Unread messages", detail: "Waiting for a reply", href: "/admin/messages", link: "Open inbox" },
    { count: value("draft_projects"), title: "Draft projects", detail: "Saved privately, not visible publicly", href: "/admin/projects", link: "Review drafts" },
    { count: value("draft_posts"), title: "Draft articles", detail: "Saved privately, not visible publicly", href: "/admin/blog-posts", link: "Review drafts" },
    { count: value("sample_projects"), title: "Sample projects", detail: "Placeholder content to replace", href: "/admin/projects", link: "Replace content" },
    { count: value("thin_projects"), title: "Projects missing facts", detail: "No role scope or outcome recorded", href: "/admin/projects", link: "Add details" },
  ].filter((item) => item.count > 0);

  const unread = value("unread_messages");
  const resumeReady = value("active_resumes") > 0;

  return (
    <div className="dashboard-overview">
      <div className="manager-title">
        <div>
          <span className="section-kicker">PRIVATE WORKSPACE</span>
          <h1>Overview</h1>
        </div>
        <div className="manager-actions">
          <Link className="button button--quiet" href="/admin/messages">Inbox{unread > 0 ? ` · ${unread}` : ""}</Link>
          <Link className="button button--quiet" href="/">View public site ↗</Link>
        </div>
      </div>
      <p className="admin-note">Everything stays private until you review and publish it. This page shows the current state of the workspace.</p>

      <section className="admin-guide">
        <div className="admin-panel-head">
          <div>
            <span className="section-kicker">STATUS</span>
            <h2>Needs attention</h2>
          </div>
          <span className={`admin-status${attention.length ? "" : " admin-status--active"}`}>
            {attention.length ? `${attention.length} item${attention.length === 1 ? "" : "s"}` : "All clear"}
          </span>
        </div>
        {attention.length ? (
          <ul className="attention-list">
            {attention.map((item) => (
              <li className="attention-item" key={item.title}>
                <span className="attention-dot" aria-hidden="true" />
                <span className="attention-copy">
                  <b>{item.title}</b>
                  <span>{item.detail}</span>
                </span>
                <span className="attention-meta">
                  <span className="attention-count">{item.count}</span>
                  <Link href={item.href}>{item.link} ↗</Link>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="attention-clear"><i aria-hidden="true" />Nothing needs attention. Drafts, samples and the inbox are all clear.</p>
        )}
      </section>

      <div className="overview-cards">
        {cards.map((card) => (
          <Link className="overview-card" href={card.href} key={card.key}>
            <span className="overview-card-top">
              <span className="section-kicker">{card.label}</span>
              {card.badge && <span className="overview-card-badge">{card.badge}</span>}
            </span>
            <strong>{card.total}</strong>
            <span className="overview-card-hint">{card.hint}</span>
            <span className="overview-card-go">Manage {card.label.toLowerCase()} <i aria-hidden="true">↗</i></span>
          </Link>
        ))}
      </div>

      <section className="admin-guide">
        <div className="admin-panel-head">
          <div>
            <span className="section-kicker">SHORTCUTS</span>
            <h2>Quick actions</h2>
          </div>
        </div>
        <div className="quick-actions">
          {quickActions.map((action) => (
            <Link className="quick-action" href={action.href} key={action.href}>
              <b>{action.label}</b>
              <span>{action.hint}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-guide">
        <div className="admin-panel-head">
          <div>
            <span className="section-kicker">RECENTLY UPDATED</span>
            <h2>Latest content changes</h2>
          </div>
        </div>
        {recent.length ? (
          <ul className="admin-recent-list">
            {recent.map((item, index) => (
              <li key={`${item.kind}-${item.label}-${index}`}>
                <span className="admin-kind">{item.kind}</span>
                <b>{item.label}</b>
                <time dateTime={new Date(item.updated_at).toISOString()}>{formatDate(item.updated_at)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-muted">New updates will appear here as you add portfolio content.</p>
        )}
      </section>

      <section className="admin-guide">
        <div className="admin-panel-head">
          <div>
            <span className="section-kicker">BEFORE PUBLISHING</span>
            <h2>Review the facts first.</h2>
          </div>
          <span className={`admin-status${resumeReady ? " admin-status--active" : ""}`}>
            {resumeReady ? "Résumé active" : "No active résumé"}
          </span>
        </div>
        <p>Replace sample project details with your verified role, decisions, timeline, outcomes, and project links. Add a confidence label to each skill yourself.</p>
      </section>
    </div>
  );
}
