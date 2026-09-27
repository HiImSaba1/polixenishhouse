import type { Metadata } from "next";
import { AvailabilityContent } from "@/components/pages/availability-content";
export const metadata: Metadata = { title: "Availability", description: "Check seasonal prices and request dates at Polixeni’s House." };
export default function Page() { return <AvailabilityContent english />; }
