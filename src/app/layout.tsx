import type {Metadata} from "next";
import {Geist,Geist_Mono} from "next/font/google";
import {database,isDatabaseConfigured} from "@/lib/database";
import {getPublicSettings} from "@/lib/profile";
import "./globals.css";
const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export async function generateMetadata():Promise<Metadata>{const settings=await getPublicSettings(["seo_title","seo_description"]);return {metadataBase:process.env.NEXT_PUBLIC_SITE_URL?new URL(process.env.NEXT_PUBLIC_SITE_URL):undefined,title:{default:typeof settings.seo_title==="string"&&settings.seo_title?settings.seo_title:"Arshan Ashraf — Full-Stack Developer",template:"%s · Arshan Ashraf"},description:typeof settings.seo_description==="string"&&settings.seo_description?settings.seo_description:"I build modern web applications across frontend, backend, and AI-enabled experiences."}}
async function getDefaultTheme(){if(!isDatabaseConfigured())return "system";try{const {rows}=await database().query<{value:unknown}>("SELECT value FROM portfolio_settings WHERE key='theme_default' LIMIT 1");const value=rows[0]?.value;return value==="light"||value==="dark"?value:"system"}catch{return "system"}}
export default async function RootLayout({children}:LayoutProps<"/">){const defaultTheme=JSON.stringify(await getDefaultTheme());const themeScript="(()=>{try{const saved=localStorage.getItem('theme');const system=matchMedia('(prefers-color-scheme: dark)').matches;const fallback="+defaultTheme+";document.documentElement.dataset.theme=saved||(fallback==='system'?(system?'dark':'light'):fallback)}catch{document.documentElement.dataset.theme='light'}})()";return <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}><head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body>{children}</body></html>}
