"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LetterHoverLink } from "@/components/ui/letter-hover-link";
import { Wordmark } from "@/components/ui/wordmark";
import { greekNavigation, siteConfig } from "@/lib/site-config";
import { localizedPath } from "@/lib/i18n";

export function SiteHeader() {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const navigation = english ? siteConfig.navigation.map((item) => ({ ...item, href: localizedPath(item.href, "en") })) : greekNavigation;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => { const update = () => setScrolled(window.scrollY >= 150); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  useEffect(() => { document.documentElement.style.overflow = open ? "hidden" : ""; const timer = open ? window.setTimeout(() => menu.current?.querySelector<HTMLAnchorElement>("nav a")?.focus(), 50) : undefined; return () => { document.documentElement.style.overflow = ""; if (timer) window.clearTimeout(timer); }; }, [open]);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => { if (event.key !== "Escape") return; event.preventDefault(); setOpen(false); menuButton.current?.focus(); }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [open]);
  return <header className="site-header" data-open={open ? "true" : undefined} data-scrolled={scrolled ? "true" : undefined}>
    <div className="site-header__logo" onClick={() => setOpen(false)}><Wordmark light={!open} /></div>
    <div className="site-header__actions"><nav className="site-header__languages" aria-label={english ? "Language" : "Γλώσσα"}><Link href={localizedPath(pathname, "el")} hrefLang="el" aria-current={!english ? "page" : undefined}>GR</Link><Link href={localizedPath(pathname, "en")} hrefLang="en" aria-current={english ? "page" : undefined}>ENG</Link></nav><button ref={menuButton} className="site-header__menu-button" type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}><span>{open ? (english ? "Close" : "Κλείσιμο") : (english ? "Menu" : "Μενού")}</span><span aria-hidden="true">{open ? <X /> : <Menu />}</span></button></div>
    <div ref={menu} id="site-menu" className="site-menu" aria-hidden={!open}><nav aria-label={english ? "Primary navigation" : "Κύρια πλοήγηση"}>{navigation.map((item, index) => <LetterHoverLink key={item.href} href={item.href} leadingVisual={<span>0{index + 1}</span>} tabIndex={open ? undefined : -1} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</LetterHoverLink>)}</nav><div className="site-menu__foot"><p>Άγιος Νικόλαος<br />Σιθωνία, Χαλκιδική</p><p><a href="mailto:info@polixenishouse.gr">info@polixenishouse.gr</a><br />{english ? "Reservation requests only" : "Αιτήματα κράτησης"}</p></div></div>
  </header>;
}
