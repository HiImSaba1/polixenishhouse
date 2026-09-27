"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/animations/gsap";

export function ParallaxMedia({ children, className = "", gentle = false }: { children: ReactNode; className?: string; gentle?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const container = root.current;
    const image = container?.querySelector("img");
    if (!container || !image) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(container, { clipPath: "inset(0% 0% 0% 0%)" }); return; }
    const ownsReveal = Boolean(container.closest(".home-hero"));
    const reveal = ownsReveal ? null : gsap.fromTo(container, { clipPath: "inset(0% 0% 100% 0%)", willChange: "clip-path" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "power4.inOut", clearProps: "clipPath,willChange", scrollTrigger: { trigger: container, start: "top 90%", once: true } });
    const intensity = 1.5;
    gsap.set(image, { scale: gentle ? 1.035 : 1.12, yPercent: (gentle ? -.5 : -2) * intensity });
    const parallax = gsap.to(image, { yPercent: (gentle ? 1.5 : 6) * intensity, ease: "none", scrollTrigger: { trigger: container, start: "top bottom", end: "bottom top", scrub: true } });
    return () => { reveal?.kill(); parallax.kill(); };
  }, { scope: root, dependencies: [gentle] });
  return <div ref={root} className={className}>{children}</div>;
}
