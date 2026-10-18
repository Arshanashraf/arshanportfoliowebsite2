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
    // Measured on resize only: reading offsetHeight inside the scroll handler forces a
    // synchronous layout every frame, which is what makes the page stutter while scrolling.
    let heroDistance = 1;
    let compact = false;
    const measureHero = () => {
      if (!hero) return;
      compact = window.innerWidth <= 760;
      heroDistance = Math.max(hero.offsetHeight * 0.72, 1);
    };
    const updateHeroProgress = () => {
      frame = 0;
      if (!hero) return;
      const progress = Math.min(Math.max(window.scrollY / heroDistance, 0), 1);
      hero.style.setProperty("--hero-progress", progress.toFixed(3));
      hero.style.setProperty("--hero-shift", `${(compact ? -10 : -22) * progress}px`);
      hero.style.setProperty("--hero-opacity", `${1 - (compact ? 0.32 : 0.48) * progress}`);
      hero.style.setProperty("--visual-shift", `${(compact ? -16 : -38) * progress}px`);
      hero.style.setProperty("--visual-scale", `${compact ? 1 : 1 - 0.035 * progress}`);
    };
    const requestProgressUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeroProgress);
    };
    const remeasureHero = () => {
      measureHero();
      requestProgressUpdate();
    };
    measureHero();
    updateHeroProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", remeasureHero);
    const heroObserver = hero ? new ResizeObserver(remeasureHero) : null;
    if (hero) heroObserver?.observe(hero);

    // Hero spotlight: the accent glow follows the pointer across the application map.
    const visual = root.querySelector<HTMLElement>(".hero-visual");
    const spotlight = visual?.querySelector<HTMLElement>(".visual-spot");
    let spotFrame = 0;
    let spotX = 0;
    let spotY = 0;
    const applySpotlight = () => {
      spotFrame = 0;
      if (!visual || !spotlight) return;
      const rect = visual.getBoundingClientRect();
      spotlight.style.setProperty("--mx", `${((spotX - rect.left) / rect.width) * 100}%`);
      spotlight.style.setProperty("--my", `${((spotY - rect.top) / rect.height) * 100}%`);
    };
    const trackPointer = (event: PointerEvent) => {
      spotX = event.clientX;
      spotY = event.clientY;
      if (!spotFrame) spotFrame = window.requestAnimationFrame(applySpotlight);
    };
    visual?.addEventListener("pointermove", trackPointer, { passive: true });

    // The map runs 15 SMIL animations (10 travelling dots + 5 arrowheads). Park them while
    // the panel is off-screen so scrolling further down the page is not competing with a
    // continuously repainting SVG.
    const mapSvg = visual?.querySelector<SVGSVGElement>(".system-map");
    let mapObserver: IntersectionObserver | null = null;
    if (mapSvg && typeof mapSvg.pauseAnimations === "function") {
      mapObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) mapSvg.unpauseAnimations(); else mapSvg.pauseAnimations(); });
      }, { rootMargin: "150px" });
      mapObserver.observe(mapSvg);
    }

    return () => {
      observer.disconnect();
      heroObserver?.disconnect();
      mapObserver?.disconnect();
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", remeasureHero);
      visual?.removeEventListener("pointermove", trackPointer);
      if (frame) window.cancelAnimationFrame(frame);
      if (spotFrame) window.cancelAnimationFrame(spotFrame);
      motionRoot.classList.remove("motion-ready");
      revealElements.forEach((element) => element.classList.remove("motion-visible"));
    };
  }, []);

  return null;
}
