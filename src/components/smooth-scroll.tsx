"use client";

import { useEffect } from "react";

/**
 * Lenis-style inertial scrolling, implemented inline rather than as a dependency so
 * the project keeps its current package set.
 *
 * Guard rails, because taking over the wheel is a real trade-off:
 * - Fine pointers only, above 760px, and never under `prefers-reduced-motion`.
 * - Ctrl+wheel (browser zoom) and scrollable form controls are left to the browser.
 * - `deltaMode` line/page deltas are normalised, so Firefox and mouse wheels behave
 *   like trackpads instead of crawling.
 * - Any scroll the browser performs itself (keyboard, anchors, scrollbar) re-syncs the
 *   target, so the two never fight.
 *
 * Two things matter for how it actually feels:
 * - The page height is measured on resize instead of every frame. Reading `scrollHeight`
 *   inside the loop forces a synchronous layout each frame, which is the classic reason
 *   a JS scroller stutters against a long page.
 * - Every position update is written with `behavior: "instant"`. The stylesheet sets
 *   `scroll-behavior: smooth` on `<html>` for anchor links, and without this the browser
 *   would start its own smooth animation from each frame's scrollTo — two easing curves
 *   fighting, which reads as lag and jitter.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth <= 760) return;

    let target = window.scrollY;
    let current = window.scrollY;
    let frame = 0;
    let maxScroll = 0;

    const measure = () => {
      maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    };
    const clamp = (value: number) => Math.max(0, Math.min(value, maxScroll));

    const position = (value: number) => {
      window.scrollTo({ top: value, left: 0, behavior: "instant" as ScrollBehavior });
    };

    const tick = () => {
      current += (target - current) * 0.115;
      if (Math.abs(target - current) < 0.4) {
        current = target;
        frame = 0;
        position(current);
        return;
      }
      position(current);
      frame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY === 0) return;
      if (event.target instanceof Element && event.target.closest("textarea,select,[data-native-scroll]")) return;
      if (maxScroll <= 0) return;
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      target = clamp(target + event.deltaY * scale);
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    // The browser scrolled on its own; adopt its position instead of overriding it.
    const onScroll = () => {
      if (frame) return;
      target = window.scrollY;
      current = window.scrollY;
    };

    // The page grew or shrank (route change, fonts, images): re-measure, and hand the
    // scroll back to the browser so a pending glide cannot drag the new page.
    const onResize = () => {
      measure();
      stop();
      target = window.scrollY;
      current = window.scrollY;
    };

    measure();
    const observer = new ResizeObserver(onResize);
    observer.observe(document.body);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      stop();
    };
  }, []);

  return null;
}
