import type { Metadata } from "next";
import { PrivacyContent } from "@/components/pages/privacy-content";

export const metadata: Metadata = { title: "Πολιτική απορρήτου", description: "Πληροφορίες απορρήτου για το Polixeni’s House." };
export default function PrivacyPage() { return <PrivacyContent />; }
