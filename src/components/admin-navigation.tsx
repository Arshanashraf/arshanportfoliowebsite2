"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  ["/admin", "Overview"],
  ["/admin/projects", "Projects"],
  ["/admin/skills", "Skills"],
  ["/admin/experience", "Experience"],
  ["/admin/achievements", "Achievements"],
  ["/admin/blog-posts", "Blog posts"],
  ["/admin/messages", "Messages"],
  ["/admin/resume", "Résumé"],
  ["/admin/settings", "Settings"],
];

export default function AdminNavigation() {
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

  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/">Arshan <span>·</span> Studio</Link>
      <nav aria-label="Admin navigation">{items.map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav>
      <button className="admin-logout" type="button" onClick={logout}>Sign out ↗</button>
      {error && <p role="alert" className="admin-error">{error}</p>}
    </aside>
  );
}




