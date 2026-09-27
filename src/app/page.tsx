import type { Metadata } from "next";
import { HomeContent } from "@/components/pages/home-content";

export const metadata: Metadata = {
  title: "Polixeni’s House | Άγιος Νικόλαος, Χαλκιδική",
  description: "Ιδιωτικό διαμέρισμα 70 τ.μ. για έως πέντε επισκέπτες στον Άγιο Νικόλαο Σιθωνίας.",
};

export default function HomePage() {
  return <HomeContent />;
}
