import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticle } from "@/lib/articles";
import MarkdownContent from "@/components/markdown-content";
import Reveal from "@/components/reveal";
type Props = PageProps<"/writing/[slug]">;
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const article = await getPublishedArticle(slug); return article ? { title: article.seo_title || article.title, description: article.seo_description || article.excerpt } : {}; }
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params; const article = await getPublishedArticle(slug); if (!article) notFound();
  const minutes = Math.max(1, Math.ceil(article.body_markdown.trim().split(/\s+/).filter(Boolean).length / 200));
  return <main className="page-main shell article-page"><Link className="back-link" href="/writing">← All writing</Link><header className="article-header"><span className="section-kicker">{article.category || "ARTICLE"} · {new Date(article.published_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })} · {minutes} MIN READ</span><h1>{article.title}</h1><p>{article.excerpt}</p></header><Reveal><MarkdownContent source={article.body_markdown}/></Reveal></main>;
}
