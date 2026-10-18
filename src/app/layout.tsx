import type {Metadata} from "next";
import {Geist,Geist_Mono} from "next/font/google";
import {database,isDatabaseConfigured} from "@/lib/database";
import {getPublicSettings} from "@/lib/profile";
import {siteOrigin} from "@/lib/site-url";
import "./globals.css";
const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export async function generateMetadata():Promise<Metadata>{const settings=await getPublicSettings(["seo_title","seo_description"]);const origin=siteOrigin();return {metadataBase:origin?new URL(origin):undefined,title:{default:typeof settings.seo_title==="string"&&settings.seo_title?settings.seo_title:"Arshan Ashraf — Full-Stack Developer",template:"%s · Arshan Ashraf"},description:typeof settings.seo_description==="string"&&settings.seo_description?settings.seo_description:"I build modern web applications across frontend, backend, and AI-enabled experiences."}}
async function getDefaultTheme(){if(!isDatabaseConfigured())return "dark";try{const {rows}=await database().query<{value:unknown}>("SELECT value FROM portfolio_settings WHERE key='theme_default' LIMIT 1");const value=rows[0]?.value;return value==="light"?"light":"dark"}catch{return "dark"}}
export default async function RootLayout({children}:LayoutProps<"/">){const defaultTheme=JSON.stringify(await getDefaultTheme());const themeScript="(()=>{try{const saved=localStorage.getItem('theme');const fallback="+defaultTheme+";document.documentElement.dataset.theme=saved||fallback||'dark'}catch{document.documentElement.dataset.theme='dark'}})()";return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}><head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body>{children}</body></html>}
