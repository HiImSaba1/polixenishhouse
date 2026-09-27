import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { anton, comfortaa, inter } from "./fonts";
import { FooterCurtain } from "@/components/layout/footer-curtain";
import { LocalizedDocument } from "@/components/layout/localized-document";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { GlobalRevealChoreography } from "@/components/motion/global-reveal-choreography";
import { SiteProviders } from "@/providers/site-providers";

export const metadata: Metadata = {
  title: {
    default: "Polixeni’s House | Άγιος Νικόλαος, Χαλκιδική",
    template: "%s | Polixeni’s House",
  },
  description: "Ιδιωτικό διαμέρισμα 70 τ.μ. με δύο υπνοδωμάτια για έως πέντε επισκέπτες στον Άγιο Νικόλαο Σιθωνίας.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="el"
      className={`${inter.variable} ${anton.variable} ${comfortaa.variable} antialiased`}
    >
      <body>
        <LocalizedDocument />
        <SiteProviders>
          <SiteHeader />
          {children}
          <FooterCurtain><SiteFooter /></FooterCurtain>
          <GlobalRevealChoreography />
        </SiteProviders>
      </body>
    </html>
  );
}
