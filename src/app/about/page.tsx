import type { Metadata } from "next";
import { AboutContent } from "@/components/pages/about-content";

export const metadata: Metadata = { title: "Σχετικά", description: "Η προσωπική φιλοξενία πίσω από το Polixeni’s House." };
export default function AboutPage() { return <AboutContent />; }
