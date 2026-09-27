import type { Metadata } from "next";
import { HouseContent } from "@/components/pages/house-content";

export const metadata: Metadata = { title: "Το Σπίτι", description: "Δείτε τους χώρους, τις παροχές και τη συλλογή φωτογραφιών του Polixeni’s House." };
export default function HousePage() { return <HouseContent />; }
