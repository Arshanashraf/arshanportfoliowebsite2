import type {MetadataRoute} from "next";
import {getPublicProjects} from "@/lib/projects";
import {getPublishedArticles} from "@/lib/articles";
export const dynamic = "force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const origin=process.env.NEXT_PUBLIC_SITE_URL;if(!origin)return[];const [projects,articles]=await Promise.all([getPublicProjects(),getPublishedArticles()]);return [{url:origin,lastModified:new Date(),changeFrequency:"monthly",priority:1},{url:origin+"/projects",changeFrequency:"monthly",priority:.8},{url:origin+"/about",changeFrequency:"yearly",priority:.6},{url:origin+"/writing",changeFrequency:"weekly",priority:.6},{url:origin+"/contact",changeFrequency:"yearly",priority:.4},...projects.filter((project)=>!project.placeholder).map((project)=>({url:origin+"/projects/"+project.slug,lastModified:new Date(),changeFrequency:"monthly" as const,priority:.7})),...articles.map((article)=>({url:origin+"/writing/"+article.slug,lastModified:new Date(article.published_at),changeFrequency:"monthly" as const,priority:.6}))]}


