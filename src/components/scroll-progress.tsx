"use client";

import { useEffect, useRef } from "react";

/**
 * One scroll-linked custom property drives both the top progress bar and anything
 * else that wants page progress (`var(--scroll)`), so a single scroll handler feeds
 * the whole page instead of one listener per effect.
 *
 * The document height is measured on resize (and whenever the body actually changes
 * size) rather than inside the scroll handler — reading `scrollHeight` on every scroll
 * frame forces a synchronous layout, which shows up as scroll stutter.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    let max = 0;

    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };
    const update = () => {
      frame = 0;
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      const value = progress.toFixed(4);
      bar.style.transform = `scaleX(${value})`;
      document.documentElement.style.setProperty("--scroll", value);
    };
    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      request();
    };

    measure();
    update();
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", remeasure);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty("--scroll");
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <i ref={barRef} />
    </div>
  );
}
