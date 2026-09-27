"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function FooterCurtain({ children }: { children: ReactNode }) {
  const curtainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const curtain = curtainRef.current; const content = contentRef.current; if (!curtain || !content) return; const update = () => curtain.style.setProperty("--footer-curtain-height", `${content.scrollHeight}px`); update(); const observer = new ResizeObserver(update); observer.observe(content); window.addEventListener("load", update); return () => { observer.disconnect(); window.removeEventListener("load", update); }; }, []);
  return <div className="footer-curtain" ref={curtainRef}><div className="footer-curtain__track"><div className="footer-curtain__sticky" ref={contentRef}>{children}</div></div></div>;
}
