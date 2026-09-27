import type { Metadata } from "next";
import { ContactContent } from "@/components/pages/contact-content";
export const metadata: Metadata = { title: "Contact", description: "Contact Polixeni’s House about a stay in Agios Nikolaos, Halkidiki." };
export default function Page() { return <ContactContent english />; }
