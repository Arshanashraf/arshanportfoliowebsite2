import type { Metadata } from "next";
import Link from "next/link";
import { getActiveResume } from "@/lib/resumes";
export const metadata: Metadata = { title: "Résumé", robots: { index: false, follow: false } };
export default async function ResumePage() {
  const resume = await getActiveResume();
  return <main className="page-main shell resume-unavailable-page"><div className="page-intro"><span className="section-kicker">ARSHAN ASHRAF / RÉSUMÉ</span><h1>Résumé<span className="accent-dot">.</span></h1><p>{resume ? "The current résumé is ready to view or download." : "The résumé is currently unavailable. Get in touch to ask for a copy."}</p></div><div className="resume-public-actions">{resume ? <><a className="button button--primary" href="/api/resume?download=1" download>Download résumé ↓</a><a className="button button--quiet" href="/api/resume" target="_blank" rel="noreferrer">Open PDF ↗</a></> : <Link className="button button--primary" href="/contact">Contact Arshan ↗</Link>}</div>{resume && <p className="editorial-note">Current version {resume.version} · updated {new Date(resume.uploaded_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</p>}<Link className="back-link" href="/">← Back home</Link></main>;
}
