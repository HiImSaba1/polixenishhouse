import type { Metadata } from "next";
import { AvailabilityContent } from "@/components/pages/availability-content";

export const metadata: Metadata = { title: "Διαθεσιμότητα", description: "Δείτε ενδεικτικές τιμές και στείλτε αίτημα κράτησης στο Polixeni’s House." };
export default function AvailabilityPage() { return <AvailabilityContent />; }
