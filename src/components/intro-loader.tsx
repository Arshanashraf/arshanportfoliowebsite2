"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* Timing knobs live in one place so the React unmount matches the CSS exit. */
const APPEAR_DELAY = 160; // hold off before showing, so fast loads never flash
const HOLD = 1150; // first paint of the session: fully visible
const HOLD_ROUTE = 620; // client-side navigation: a beat, not a wait
const EXIT = 420; // fade-out length, mirrors .intro-loader--leaving

type Phase = "idle" | "visible" | "leaving" | "done";

/**
 * The intro overlay. It runs on every page load, and replays (shorter) on every
 * client-side route change so browsing between pages still feels like a transition —
 * previously it was gated behind sessionStorage, so it only ever appeared once and
 * then never again for the rest of the tab's life.
 */
export default function IntroLoader() {
  const pathname = usePathname();
  // The phase is derived from the current path, so a navigation resets it without a
  // synchronous setState in the effect (which would cascade renders).
  const [run, setRun] = useState<{ path: string; phase: Phase }>({ path: pathname, phase: "idle" });
  const firstPaint = useRef(true);
  const phase: Phase = run.path === pathname ? run.phase : "idle";

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? 60 : firstPaint.current ? HOLD : HOLD_ROUTE;
    const exit = reduced ? 0 : EXIT;
    firstPaint.current = false;

    const timers = [
      window.setTimeout(() => setRun({ path: pathname, phase: "visible" }), APPEAR_DELAY),
      window.setTimeout(() => setRun({ path: pathname, phase: "leaving" }), APPEAR_DELAY + hold),
      window.setTimeout(() => setRun({ path: pathname, phase: "done" }), APPEAR_DELAY + hold + exit),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [pathname]);

  if (phase === "done") return null;

  const className = [
    "intro-loader",
    phase === "visible" || phase === "leaving" ? "intro-loader--in" : "",
    phase === "leaving" ? "intro-loader--leaving" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} role="status" aria-label="Portfolio initializing">
      <div className="intro-loader-grid" />
      <div className="intro-loader-content">
        <span className="loader-mark" aria-hidden="true"><i /><i /><i /><b /></span>
        <span className="section-kicker">ARSHAN ASHRAF / SYSTEMS ATLAS</span>
        <strong>Initializing<span>…</span></strong>
        <div className="loader-track"><i /></div>
        <small>INTERFACE · APPLICATION · INTELLIGENCE</small>
      </div>
    </div>
  );
}
