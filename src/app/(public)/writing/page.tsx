import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import Reveal from "@/components/reveal";
export const metadata: Metadata = { title: "Writing", description: "Notes and articles by Arshan Ashraf." };
export default async function WritingPage() {
  const articles = await getPublishedArticles();
  return <main className="page-main shell"><div className="page-intro"><span className="section-kicker">WRITING / NOTES &amp; IDEAS</span><h1>Thinking out loud<span className="accent-dot">.</span></h1><p>Notes on building applications, connecting systems, and learning by doing.</p></div>{articles.length ? <div className="article-list">{articles.map((article, index) => <Reveal as="article" className="article-card" key={article.slug}><Link href={`/writing/${article.slug}`}><span className="section-kicker">{String(index + 1).padStart(2, "0")} / {article.category || "ARTICLE"} · {new Date(article.published_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</span><h2>{article.title}</h2><p>{article.excerpt}</p><span className="article-more">Read article ↗</span></Link></Reveal>)}</div> : <section className="empty-state"><span className="empty-state-icon" aria-hidden="true">⌁</span><h2>First article in progress.</h2><p>There are no published articles yet. Drafts stay private until reviewed and published.</p></section>}<Link className="back-link" href="/">← Back home</Link></main>;
}
