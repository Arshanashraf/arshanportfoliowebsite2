import Link from "next/link";
import type { Metadata } from "next";
import { currentAdmin } from "@/lib/auth";
import LoginForm from "@/components/login-form";
import { redirect } from "next/navigation";
export const metadata:Metadata={title:"Admin sign in",robots:{index:false,follow:false}};
export default async function AdminLoginPage(){if(await currentAdmin())redirect("/admin");const configured=Boolean(process.env.DATABASE_URL);return <main className="admin-login-page"><div className="admin-login-card"><Link className="admin-brand" href="/">Arshan <span>·</span> Studio</Link><span className="section-kicker">OWNER ACCESS</span><h1>Welcome back.</h1><p>Sign in to manage portfolio content.</p>{configured?<LoginForm/>:<div className="admin-setup-note"><b>Admin access is not configured yet.</b><p>Connect a PostgreSQL database, run the migration, then create the owner account with the local CLI. Public sign-up is disabled.</p><a href="https://github.com/Arshanashraf" target="_blank" rel="noreferrer">Owner profile ↗</a></div>}<Link className="back-link" href="/">← Back to portfolio</Link></div></main>}

