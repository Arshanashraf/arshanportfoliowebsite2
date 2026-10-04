"use client";

import { useEffect } from "react";

/** Small, page-scoped motion controller: no animation runtime or per-frame React renders. */
export default function MotionDirector() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("#public-content");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const motionRoot = document.documentElement;
    motionRoot.classList.add("motion-ready");
    const revealElements = [
      ...root.querySelectorAll<HTMLElement>("[data-motion-reveal]"),
      ...document.querySelectorAll<HTMLElement>("footer[data-motion-reveal]"),
    ];
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -7% 0px" });
    revealElements.forEach((element) => observer.observe(element));

    const hero = root.querySelector<HTMLElement>(".hero");
    let frame = 0;
    const updateHeroProgress = () => {
      frame = 0;
      if (!hero) return;
      const distance = Math.max(hero.offsetHeight * 0.72, 1);
      const progress = Math.min(Math.max(window.scrollY / distance, 0), 1);
      hero.style.setProperty("--hero-progress", progress.toFixed(3));
      const compact = window.innerWidth <= 760;
      hero.style.setProperty("--hero-shift", `${(compact ? -10 : -22) * progress}px`);
      hero.style.setProperty("--hero-opacity", `${1 - (compact ? 0.32 : 0.48) * progress}`);
      hero.style.setProperty("--visual-shift", `${(compact ? -16 : -38) * progress}px`);
      hero.style.setProperty("--visual-scale", `${compact ? 1 : 1 - 0.035 * progress}`);
      hero.style.setProperty("--hero-wash", `${0.28 * progress}`);
    };
    const requestProgressUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeroProgress);
    };
    updateHeroProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      motionRoot.classList.remove("motion-ready");
      revealElements.forEach((element) => element.classList.remove("motion-visible"));
    };
  }, []);

  return null;
}
