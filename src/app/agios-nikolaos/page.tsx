import type { Metadata } from "next";
import { DestinationContent } from "@/components/pages/destination-content";

export const metadata: Metadata = { title: "Άγιος Νικόλαος", description: "Ανακαλύψτε τον Άγιο Νικόλαο και τις κοντινές παραλίες της Σιθωνίας." };
export default function DestinationPage() { return <DestinationContent />; }
