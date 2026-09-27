"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function LocalizedDocument() {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");

  useEffect(() => {
    document.documentElement.lang = english ? "en" : "el";
  }, [english]);

  return <a className="skip-link" href="#main-content">{english ? "Skip to main content" : "Μετάβαση στο κύριο περιεχόμενο"}</a>;
}
