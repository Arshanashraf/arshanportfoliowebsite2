"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
type Props = { children: ReactNode; className?: string; id?: string; as?: "div" | "section" | "article" };
export default function Reveal({ children, className = "", id, as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { const frame = window.requestAnimationFrame(() => setShown(true)); return () => window.cancelAnimationFrame(frame); }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShown(true); observer.disconnect(); } }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const Tag = as;
  return <Tag ref={ref as never} id={id} className={`scroll-reveal${shown ? " scroll-reveal--shown" : ""} ${className}`}>{children}</Tag>;
}




