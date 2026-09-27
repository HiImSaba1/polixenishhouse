import type { Metadata } from "next";
import { HomeContent } from "@/components/pages/home-content";

export const metadata: Metadata = { title: "Polixeni’s House | Agios Nikolaos, Halkidiki", description: "A private 70 m² holiday apartment for up to five guests in Agios Nikolaos, Sithonia." };
export default function EnglishHomePage() { return <HomeContent english />; }
