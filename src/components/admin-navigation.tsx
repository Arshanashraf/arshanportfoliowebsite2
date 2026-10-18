"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const groups = [
  {
    label: "Workspace",
    items: [["/admin", "Overview"]],
  },
  {
    label: "Content",
    items: [
      ["/admin/projects", "Projects"],
      ["/admin/skills", "Skills"],
      ["/admin/experience", "Experience"],
      ["/admin/achievements", "Achievements"],
      ["/admin/blog-posts", "Blog posts"],
    ],
  },
  { label: "Inbox", items: [["/admin/messages", "Messages"]] },
  { label: "Library", items: [["/admin/resume", "Résumé"]] },
  { label: "System", items: [["/admin/settings", "Settings"]] },
] as const;

type AdminNavigationProps = { email?: string; unread?: number };

export default function AdminNavigation({ email, unread = 0 }: AdminNavigationProps) {
  const [error, setError] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Could not end the session. Please try again.");
    }
  }

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/">
        <span className="admin-brand-mark" aria-hidden="true"><i /></span>
        <span>Arshan&nbsp;<b>·</b>&nbsp;Studio</span>
      </Link>
      <nav className="admin-nav" aria-label="Admin navigation">
        {groups.map((group) => (
          <div className="admin-group" key={group.label}>
            <span className="admin-group-label">{group.label}</span>
            {group.items.map(([href, label]) => (
              <Link href={href} key={href} aria-current={isCurrent(href) ? "page" : undefined}>
                {label}
                {href === "/admin/messages" && unread > 0 && (
                  <span className="admin-nav-badge" aria-label={`${unread} unread`}>{unread}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="admin-session">
        {email && <span className="admin-session-email" title={email}>{email}</span>}
        <button className="admin-logout" type="button" onClick={logout}>Sign out ↗</button>
      </div>
      {error && <p role="alert" className="admin-error">{error}</p>}
    </aside>
  );
}
