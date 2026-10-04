import "server-only";
import { database,isDatabaseConfigured } from "@/lib/database";
export type Article={title:string;slug:string;excerpt:string;body_markdown:string;category:string;published_at:Date|string;seo_title:string|null;seo_description:string|null};
export async function getPublishedArticles(){if(!isDatabaseConfigured())return [];const {rows}=await database().query<Article>("SELECT title,slug,excerpt,body_markdown,category,published_at,seo_title,seo_description FROM blog_posts WHERE status='published' AND published_at<=now() ORDER BY published_at DESC LIMIT 100");return rows;}
export async function getPublishedArticle(slug:string){if(!isDatabaseConfigured())return undefined;const {rows}=await database().query<Article>("SELECT title,slug,excerpt,body_markdown,category,published_at,seo_title,seo_description FROM blog_posts WHERE status='published' AND published_at<=now() AND slug=$1 LIMIT 1",[slug]);return rows[0];}
