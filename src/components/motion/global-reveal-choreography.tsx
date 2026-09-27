"use client";

import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { gsap, SplitText } from "@/lib/animations/gsap";
import { usePageTransition } from "@/providers/page-transition-provider";

const excludedMotionOwner = ".home-hero, .home-testimonials, .site-menu, .site-footer, [data-no-global-reveal]";

function isRevealElement(element: Element): element is HTMLElement {
  return element instanceof HTMLElement && !element.closest(excludedMotionOwner);
}

export function GlobalRevealChoreography() {
  const pathname = usePathname();
  const { isPageReady } = usePageTransition();

  useGSAP(() => {
    if (!isPageReady || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    const splits: SplitText[] = [];
    const timelines: gsap.core.Timeline[] = [];

    const setup = () => {
      if (cancelled) return;
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"))
        .filter((section) => !section.matches(excludedMotionOwner));

      sections.forEach((section) => {
        const headings = Array.from(section.querySelectorAll("h1, h2, h3")).filter(isRevealElement);
        const paragraphs = Array.from(section.querySelectorAll("p:not(.eyebrow)")).filter(isRevealElement);
        if (!headings.length && !paragraphs.length) return;

        const headingWords = headings.flatMap((heading) => {
          const split = SplitText.create(heading, { type: "words", mask: "words", aria: "auto" });
          splits.push(split);
          return split.words;
        });
        const contentLines = paragraphs.flatMap((paragraph) => {
          const split = SplitText.create(paragraph, { type: "lines", mask: "lines", autoSplit: true, aria: "auto" });
          splits.push(split);
          return split.lines;
        });

        if (headingWords.length) gsap.set(headingWords, { yPercent: 112, autoAlpha: 0, rotate: 0.001, willChange: "transform" });
        if (contentLines.length) gsap.set(contentLines, { yPercent: 108, autoAlpha: 0, rotate: 0.001, willChange: "transform" });

        const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 86%", once: true } });
        if (headingWords.length) timeline.to(headingWords, { yPercent: 0, autoAlpha: 1, duration: 0.85, stagger: 0.035, ease: "power4.out", clearProps: "transform,opacity,visibility,willChange" });
        if (contentLines.length) timeline.to(contentLines, { yPercent: 0, autoAlpha: 1, duration: 0.78, stagger: 0.055, ease: "power3.out", clearProps: "transform,opacity,visibility,willChange" }, headingWords.length ? "-=.42" : 0);
        timelines.push(timeline);
      });
    };

    if (document.fonts.status === "loaded") setup();
    else void document.fonts.ready.then(setup);

    return () => {
      cancelled = true;
      timelines.forEach((timeline) => timeline.kill());
      splits.forEach((split) => split.revert());
    };
  }, { dependencies: [pathname, isPageReady], revertOnUpdate: true });

  return null;
}
