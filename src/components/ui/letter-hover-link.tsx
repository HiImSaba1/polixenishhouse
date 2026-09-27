"use client";

import type { ComponentProps, ReactNode, RefObject } from "react";
import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/animations/gsap";

type Props = Omit<ComponentProps<typeof Link>, "children"> & { children: string; leadingVisual?: ReactNode; trailingVisual?: ReactNode };

export function useMenuLinkAnimation(ref: RefObject<HTMLAnchorElement | null>, contentKey: string) {
  useGSAP(() => {
    const element = ref.current;
    if (!element) return;
    const base = element.querySelector<HTMLElement>("[data-hover-text-base]");
    const active = element.querySelector<HTMLElement>("[data-hover-text-active]");
    if (!base || !active) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 48.001rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const baseSplit = new SplitText(base, { type: "chars" });
      const activeSplit = new SplitText(active, { type: "chars" });
      gsap.set(baseSplit.chars, { yPercent: 0 });
      gsap.set(activeSplit.chars, { yPercent: 100 });
      const timeline = gsap.timeline({ paused: true, defaults: { duration: .3, ease: "power3.inOut", overwrite: "auto" } })
        .to(baseSplit.chars, { yPercent: -150, stagger: .009 }, 0)
        .to(activeSplit.chars, { yPercent: 0, stagger: .009 }, 0);
      const enter = () => timeline.play();
      const leave = () => timeline.reverse();
      element.addEventListener("mouseenter", enter); element.addEventListener("mouseleave", leave); element.addEventListener("focus", enter); element.addEventListener("blur", leave);
      return () => { element.removeEventListener("mouseenter", enter); element.removeEventListener("mouseleave", leave); element.removeEventListener("focus", enter); element.removeEventListener("blur", leave); timeline.kill(); baseSplit.revert(); activeSplit.revert(); };
    });
    return () => media.revert();
  }, { scope: ref, dependencies: [contentKey] });
}

export function LetterHoverLink({ children, leadingVisual, trailingVisual, ...props }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMenuLinkAnimation(ref, children);
  return <Link ref={ref} {...props} aria-label={props["aria-label"] ?? children}>{leadingVisual}<span className="letter-hover-link__text"><span data-hover-text-base>{children}</span><span data-hover-text-active aria-hidden="true">{children}</span></span>{trailingVisual}</Link>;
}
