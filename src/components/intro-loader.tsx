"use client";
import { useEffect, useState } from "react";
export default function IntroLoader() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let timer = 0;
    const frame = window.requestAnimationFrame(() => {
      try { if (sessionStorage.getItem("systems-atlas-intro") === "seen") return; sessionStorage.setItem("systems-atlas-intro", "seen"); }
      catch { return; }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setVisible(true);
      timer = window.setTimeout(() => setVisible(false), reduced ? 80 : 820);
    });
    return () => { window.cancelAnimationFrame(frame); if (timer) window.clearTimeout(timer); };
  }, []);
  if (!visible) return null;
  return <div className="intro-loader" role="status" aria-label="Portfolio initializing"><div className="intro-loader-grid"/><div className="intro-loader-content"><span className="loader-mark" aria-hidden="true"><i/><i/><i/><b/></span><span className="section-kicker">ARSHAN ASHRAF / SYSTEMS ATLAS</span><strong>Initializing<span>…</span></strong><div className="loader-track"><i/></div><small>INTERFACE · APPLICATION · INTELLIGENCE</small></div></div>;
}
