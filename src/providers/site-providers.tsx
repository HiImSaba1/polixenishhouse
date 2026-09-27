"use client";

import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { PageTransitionProvider } from "./page-transition-provider";

export function SiteProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    lenisRef.current = lenis;
    const updateScrollTriggers = () => ScrollTrigger.update();
    lenis.on("scroll", updateScrollTriggers);
    let frame = 0;
    const animate = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
      lenis.off("scroll", updateScrollTriggers);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(0, { immediate: true, force: true });
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return <PageTransitionProvider>{children}</PageTransitionProvider>;
}
