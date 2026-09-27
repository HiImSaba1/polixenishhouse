import type { Metadata } from "next";
import { DestinationContent } from "@/components/pages/destination-content";
export const metadata: Metadata = { title: "Agios Nikolaos", description: "Discover Agios Nikolaos and nearby Sithonia beaches." };
export default function Page() { return <DestinationContent english />; }
