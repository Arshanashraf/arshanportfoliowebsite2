import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import IntroLoader from "@/components/intro-loader";
import { getPublicSettings } from "@/lib/profile";
import { getActiveResume } from "@/lib/resumes";
export const dynamic = "force-dynamic";
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, resume] = await Promise.all([getPublicSettings(["github_url"]), getActiveResume()]);
  const githubUrl = typeof settings.github_url === "string" ? settings.github_url : "https://github.com/Arshanashraf";
  return <><a className="skip-link" href="#public-content">Skip to content</a><IntroLoader/><SiteHeader githubUrl={githubUrl} resumeAvailable={Boolean(resume)}/><div id="public-content" tabIndex={-1}>{children}</div><SiteFooter/></>;
}



