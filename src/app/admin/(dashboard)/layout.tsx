import { currentAdmin } from "@/lib/auth";
import AdminNavigation from "@/components/admin-navigation";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function DashboardLayout({children}:{children:React.ReactNode}){if(!await currentAdmin())redirect("/admin/login");return <div className="admin-shell"><AdminNavigation/><main className="admin-content">{children}</main></div>}


