"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type TransitionEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

type TransitionPhase = "idle" | "covering" | "covered" | "revealing";
type TransitionContextValue = { isPageReady: boolean; isTransitioning: () => boolean; navigateTo: (href: string) => void };
const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition() {
  const value = useContext(TransitionContext);
  if (!value) throw new Error("usePageTransition must be used inside PageTransitionProvider.");
  return value;
}

function skipsEditorialTransition(pathname: string) {
  return ["/admin", "/api"].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [isPageReady, setIsPageReady] = useState(true);
  const destination = useRef<string | null>(null);
  const destinationPath = useRef<string | null>(null);

  const reveal = useCallback(() => {
    setIsPageReady(true);
    document.documentElement.dataset.routeReady = "true";
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase("revealing")));
  }, []);

  useEffect(() => {
    if (phase === "covered" && destinationPath.current === pathname) reveal();
  }, [pathname, phase, reveal]);

  const navigateTo = useCallback((href: string) => {
    const next = new URL(href, window.location.href);
    const target = `${next.pathname}${next.search}${next.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (phase !== "idle" || target === current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || skipsEditorialTransition(pathname) || skipsEditorialTransition(next.pathname)) {
      router.push(target);
      return;
    }
    destination.current = target;
    destinationPath.current = next.pathname;
    setIsPageReady(false);
    document.documentElement.dataset.routeReady = "false";
    setPhase("covering");
  }, [pathname, phase, router]);

  function finishCurtain(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (phase === "covering" && destination.current) {
      const samePath = destinationPath.current === pathname;
      setPhase("covered");
      router.push(destination.current, { scroll: false });
      if (samePath) requestAnimationFrame(reveal);
      return;
    }
    if (phase === "revealing") {
      destination.current = null;
      destinationPath.current = null;
      setPhase("idle");
    }
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || anchor.target === "_blank" || anchor.hasAttribute("data-no-page-transition")) return;
      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin || (next.hash && next.pathname === pathname && next.search === window.location.search)) return;
      event.preventDefault();
      navigateTo(`${next.pathname}${next.search}${next.hash}`);
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [navigateTo, pathname]);

  const covered = phase === "covering" || phase === "covered";
  return <TransitionContext.Provider value={{ isPageReady, isTransitioning: () => phase !== "idle", navigateTo }}>
    {children}
    <div aria-hidden="true" data-testid="page-transition" data-transition-state={phase} className="page-transition-curtain" onTransitionEnd={finishCurtain} style={{ transform: covered ? "translateY(0)" : phase === "revealing" ? "translateY(-100%)" : "translateY(100%)", visibility: phase === "idle" ? "hidden" : "visible", transition: phase === "idle" ? "none" : "transform 850ms cubic-bezier(.77,0,.18,1)" }} />
  </TransitionContext.Provider>;
}
