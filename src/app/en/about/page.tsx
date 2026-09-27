import type { Metadata } from "next";
import { AboutContent } from "@/components/pages/about-content";
export const metadata: Metadata = { title: "About", description: "The personal hospitality behind Polixeni’s House." };
export default function Page() { return <AboutContent english />; }
