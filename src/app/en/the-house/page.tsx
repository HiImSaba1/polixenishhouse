import type { Metadata } from "next";
import { HouseContent } from "@/components/pages/house-content";
export const metadata: Metadata = { title: "The House", description: "Explore the rooms, amenities and full gallery of Polixeni’s House." };
export default function Page() { return <HouseContent english />; }
