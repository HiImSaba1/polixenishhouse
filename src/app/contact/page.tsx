import type { Metadata } from "next";
import { ContactContent } from "@/components/pages/contact-content";

export const metadata: Metadata = { title: "Επικοινωνία", description: "Επικοινωνήστε με το Polixeni’s House για τη διαμονή σας στον Άγιο Νικόλαο Χαλκιδικής." };
export default function ContactPage() { return <ContactContent />; }
