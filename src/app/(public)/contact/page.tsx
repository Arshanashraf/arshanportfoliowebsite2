import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import { getContactRetentionDays, getPublicSettings } from "@/lib/profile";
export const metadata: Metadata = { title: "Contact", description: "Contact Arshan Ashraf about software projects and collaborations." };
export default async function ContactPage() {
  const [retentionDays, settings] = await Promise.all([getContactRetentionDays(), getPublicSettings(["github_url", "linkedin_url"])]);
  const github = typeof settings.github_url === "string" ? settings.github_url : "https://github.com/Arshanashraf";
  const linkedin = typeof settings.linkedin_url === "string" ? settings.linkedin_url : "https://linkedin.com/in/arshan-ashraf-650124288/";
  return <main className="page-main shell contact-page"><div className="page-intro"><span className="section-kicker">CONTACT / START HERE</span><h1>Start with a<br/><span>conversation.</span></h1><p>If you have a project, a question, or a useful thing to build together, send a note or find me through either profile.</p></div><div className="contact-form-grid">{retentionDays ? <section><ContactForm/><p className="privacy-note">Messages and reply email are stored in a private inbox and deleted after {retentionDays} days. This site does not send email.</p></section> : <section className="empty-state contact-unavailable"><h2>The contact form is being configured.</h2><p>Use one of the professional links while the private inbox and message-retention setting are being set up.</p></section>}<aside className="contact-aside"><span className="section-kicker">ELSEWHERE</span><div className="profile-links contact-profiles"><a href={linkedin} target="_blank" rel="noreferrer"><span>LinkedIn</span><span>Arshan Ashraf ↗</span></a><a href={github} target="_blank" rel="noreferrer"><span>GitHub</span><span>Arshanashraf ↗</span></a></div><p className="editorial-note">Messages are saved to a private inbox. No email is sent.</p></aside></div></main>;
}
