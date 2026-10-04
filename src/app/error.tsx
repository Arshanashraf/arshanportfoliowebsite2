"use client";
import { useEffect } from "react";
import Link from "next/link";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Portfolio route failed", error.digest); }, [error]);
  return <main className="page-main shell error-state"><span className="section-kicker">SYSTEM / TEMPORARILY UNAVAILABLE</span><h1>This page didn’t<br/><span>initialize.</span></h1><p>The content service may be unavailable for a moment. Please try again.</p><div><button className="button button--primary" onClick={() => reset()}>Try again ↻</button><Link className="text-link" href="/">Return home</Link></div></main>;
}
