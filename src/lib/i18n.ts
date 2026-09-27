export type Locale = "el" | "en";

export function localizedPath(pathname: string, locale: Locale) {
  const withoutEnglish = pathname === "/en" ? "/" : pathname.replace(/^\/en(?=\/)/, "");
  return locale === "en" ? (withoutEnglish === "/" ? "/en" : `/en${withoutEnglish}`) : withoutEnglish;
}
