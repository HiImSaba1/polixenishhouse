import type { Metadata } from "next";
import { PrivacyContent } from "@/components/pages/privacy-content";
export const metadata: Metadata = { title: "Privacy", description: "Privacy information for Polixeni’s House." };
export default function Page() { return <PrivacyContent english />; }
