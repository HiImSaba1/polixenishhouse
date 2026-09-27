export const siteConfig = {
  name: "Polixeni’s House",
  location: "Agios Nikolaos, Halkidiki",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/the-house", label: "The House" },
    { href: "/availability", label: "Availability" },
    { href: "/agios-nikolaos", label: "Agios Nikolaos" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export const greekNavigation = [
  { href: "/", label: "Αρχική" },
  { href: "/the-house", label: "Το Σπίτι" },
  { href: "/availability", label: "Διαθεσιμότητα" },
  { href: "/agios-nikolaos", label: "Άγιος Νικόλαος" },
  { href: "/about", label: "Σχετικά" },
  { href: "/contact", label: "Επικοινωνία" },
] as const;
