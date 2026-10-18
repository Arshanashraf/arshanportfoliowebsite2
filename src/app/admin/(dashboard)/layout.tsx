import { currentAdmin } from "@/lib/auth";
import { database } from "@/lib/database";
import AdminNavigation from "@/components/admin-navigation";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  let unread = 0;
  try {
    const { rows } = await database().query<{ count: number }>("SELECT count(*)::int AS count FROM messages WHERE status = 'unread'");
    unread = rows[0]?.count ?? 0;
  } catch {
    unread = 0;
  }
  return <div className="admin-shell"><AdminNavigation email={admin.email} unread={unread} /><main className="admin-content">{children}</main></div>;
}
