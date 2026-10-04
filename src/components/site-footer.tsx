import Link from "next/link";
import { getPublicSettings } from "@/lib/profile";

export default async function SiteFooter() {
  const settings = await getPublicSettings(["github_url", "linkedin_url"]);
  const github = typeof settings.github_url === "string" ? settings.github_url : "https://github.com/Arshanashraf";
  const linkedin = typeof settings.linkedin_url === "string" ? settings.linkedin_url : "https://linkedin.com/in/arshan-ashraf-650124288/";

  return (
    <footer className="site-footer" data-motion-reveal="footer">
      <div className="shell footer-inner">
        <Link className="footer-brand" href="/">Arshan Ashraf<span>.</span></Link>
        <p>Building modern web applications across frontend, backend, and AI-enabled experiences.</p>
        <div className="footer-links"><a href={github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></div>
        <span className="footer-copy">© {new Date().getFullYear()} Arshan Ashraf</span>
      </div>
    </footer>
  );
}
