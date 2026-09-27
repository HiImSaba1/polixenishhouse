"use client";

import { usePathname } from "next/navigation";
import { LetterHoverLink } from "@/components/ui/letter-hover-link";
import { Wordmark } from "@/components/ui/wordmark";
import { localizedPath } from "@/lib/i18n";

export function SiteFooter() {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const path = (value: string) => localizedPath(value, english ? "en" : "el");
  return <footer className="site-footer"><div className="site-footer__brand"><Wordmark /><p>{english ? "A generous village home for unhurried stays and easy days across Sithonia." : "Ένα άνετο σπίτι στο χωριό για ήρεμες διακοπές και όμορφες μέρες στη Σιθωνία."}</p></div><div className="site-footer__columns"><nav aria-label={english ? "Footer navigation" : "Πλοήγηση υποσέλιδου"}><h2>{english ? "Quick links" : "Σύνδεσμοι"}</h2><LetterHoverLink href={path("/the-house")}>{english ? "The House" : "Το Σπίτι"}</LetterHoverLink><LetterHoverLink href={path("/availability")}>{english ? "Availability" : "Διαθεσιμότητα"}</LetterHoverLink><LetterHoverLink href={path("/about")}>{english ? "About" : "Σχετικά"}</LetterHoverLink><LetterHoverLink href={path("/contact")}>{english ? "Contact" : "Επικοινωνία"}</LetterHoverLink></nav><address><h2>{english ? "Contact" : "Επικοινωνία"}</h2><p>Άγιος Νικόλαος<br />Σιθωνία, Χαλκιδική</p><div className="site-footer__contact"><LetterHoverLink href="mailto:info@polixenishouse.gr">info@polixenishouse.gr</LetterHoverLink><LetterHoverLink href={path("/privacy")}>{english ? "Privacy policy" : "Πολιτική απορρήτου"}</LetterHoverLink></div></address></div><div className="site-footer__bottom"><p>© {new Date().getFullYear()} Polixeni’s House</p><LetterHoverLink className="site-footer__credit" href="https://www.sabaweb.gr" target="_blank" rel="noreferrer">By Saba Web Solutions</LetterHoverLink></div></footer>;
}
