"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor: a 6px accent dot that tracks 1:1, a 38px ring that trails on a lerp
 * and snaps magnetically to buttons, plus a small contextual label.
 *
 * Deliberately conservative:
 * - Only activates on `hover:hover` + `pointer:fine`, so touch devices are untouched.
 * - Never activates under `prefers-reduced-motion`.
 * - Text fields opt back out of `cursor:none`, so the native caret stays usable.
 * - The label is a sibling of the ring rather than a child: `mix-blend-mode` on the
 *   ring would otherwise blend the label too, and dark label text on a light
 *   background would come out unreadable.
 * - Driven by one rAF loop writing inline transforms, so React never re-renders.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let snapTarget: HTMLElement | null = null;
    let started = false;
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!started) {
        started = true;
        ringX = pointerX;
        ringY = pointerY;
        root.classList.add("cursor-on");
      }
      dot.style.transform = `translate3d(${pointerX}px,${pointerY}px,0)`;
    };

    const labelFor = (element: HTMLElement) => {
      if (element.dataset.cursor) return element.dataset.cursor;
      if (element.closest(".theme-toggle")) return "Theme";
      if (element.getAttribute("target") === "_blank") return "Open";
      if (element.classList.contains("button--primary")) return "Go";
      return "View";
    };

    const interactive = (node: EventTarget | null) =>
      node instanceof Element ? node.closest<HTMLElement>("a,button,[data-cursor]") : null;

    const onPointerOver = (event: PointerEvent) => {
      const element = interactive(event.target);
      if (!element) return;
      root.classList.add("cursor-act");
      label.textContent = labelFor(element);
      if (element.classList.contains("button") || element.dataset.snap !== undefined) {
        snapTarget = element;
      }
    };

    const onPointerOut = (event: PointerEvent) => {
      if (interactive(event.relatedTarget)) return;
      root.classList.remove("cursor-act");
      snapTarget = null;
    };

    const onPointerDown = () => root.classList.add("cursor-down");
    const onPointerUp = () => root.classList.remove("cursor-down");
    const onLeave = () => root.classList.remove("cursor-on");
    const onEnter = () => root.classList.add("cursor-on");

    const loop = () => {
      const target = snapTarget;
      const toX = target ? target.getBoundingClientRect().left + target.offsetWidth / 2 : pointerX;
      const toY = target ? target.getBoundingClientRect().top + target.offsetHeight / 2 : pointerY;
      const ease = target ? 0.2 : 0.16;
      ringX += (toX - ringX) * ease;
      ringY += (toY - ringY) * ease;
      ring.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      label.style.transform = `translate3d(${ringX}px,${ringY + 34}px,0) translateX(-50%)`;
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      root.classList.remove("has-cursor", "cursor-on", "cursor-act", "cursor-down");
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <span className="cursor-ring" ref={ringRef} />
      <span className="cursor-label" ref={labelRef} />
      <span className="cursor-dot" ref={dotRef} />
    </div>
  );
}
