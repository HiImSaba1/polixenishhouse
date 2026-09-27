import Image from "next/image";
import { AvailabilityCalculator } from "@/components/availability/availability-calculator";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { EditorialLink } from "@/components/ui/editorial-link";
import { TestimonialGrid } from "@/components/testimonials/testimonial-grid";
import { homeGallery } from "@/data/gallery";
import { property, seasonalPrices } from "@/data/site-content";

export function HomeContent({ english = false }: { english?: boolean }) {
  const path = (value: string) => english ? `/en${value === "/" ? "" : value}` : value;
  return <main id="main-content" tabIndex={-1}>
    <section className="home-hero">
      <Image src="/images/property/polixenis-house-picture-6.jpg" alt="Polixeni’s House in Agios Nikolaos" fill priority sizes="100vw" />
      <div className="home-hero__shade" />
      <div className="home-hero__copy"><span>Άγιος Νικόλαος · Χαλκιδική</span><h1>{english ? <>A home for all<br /><em>summer</em> days.</> : <>Ένα σπίτι για<br /><em>όλο</em> το καλοκαίρι.</>}</h1><EditorialLink href={path("/availability")} tone="light">{english ? "Check availability" : "Έλεγχος διαθεσιμότητας"}</EditorialLink></div>
      <div className="home-hero__facts"><span>{property.sizeSquareMetres} m²</span><span>{property.bedrooms} {english ? "bedrooms" : "υπνοδωμάτια"}</span><span>{english ? "Up to" : "Έως"} {property.maximumGuests} {english ? "guests" : "επισκέπτες"}</span></div>
    </section>

    <section className="section intro-section"><span className="eyebrow">{english ? "The house" : "Το σπίτι"}</span><div><h2>{english ? <>Space to gather.<br />Room to unwind.</> : <>Χώρος για παρέα.<br />Χρόνος για ξεκούραση.</>}</h2><p>{english ? `${property.name} is a private 70 m² apartment in a quiet traditional neighbourhood of Agios Nikolaos. Two bedrooms, a fully equipped kitchen, a spacious living room and a private terrace make it a comfortable base for exploring Sithonia.` : "Το Polixeni’s House είναι ένα ιδιωτικό διαμέρισμα 70 τ.μ. σε μια ήσυχη, παραδοσιακή γειτονιά του Αγίου Νικολάου. Διαθέτει δύο υπνοδωμάτια, πλήρως εξοπλισμένη κουζίνα, άνετο καθιστικό και ιδιωτική βεράντα."}</p><EditorialLink href={path("/the-house")}>{english ? "Explore the house" : "Δείτε το σπίτι"}</EditorialLink></div></section>
    <section className="wide-image"><ParallaxImage src="/images/property/polixenis-house-picture-25.jpg" alt="Bright interior at Polixeni’s House" sizes="100vw" /></section>

    <section className="section availability-section"><div><span className="eyebrow ">{english ? "Plan your stay" : "Οργανώστε τη διαμονή σας"}</span><h2>{english ? "Find your summer dates." : "Βρείτε τις καλοκαιρινές ημερομηνίες σας."}</h2></div><AvailabilityCalculator /></section>

    <section className="section amenities-section"><span className="eyebrow">{english ? "At a glance" : "Με μια ματιά"}</span><div className="amenities-grid">{property.amenities.map((amenity, index) => <div key={amenity}><span>0{index + 1}</span><h3>{english ? amenity : ["Πλήρως εξοπλισμένη κουζίνα", "Ιδιωτική βεράντα", "Ιδιωτικό πάρκινγκ", "Δωρεάν Wi-Fi", "Κλιματισμός", "Πλυντήριο ρούχων"][index]}</h3></div>)}</div></section>

    <section className="gallery-section"><div className="section-heading"><span className="eyebrow">{english ? "Inside & outside" : "Μέσα και έξω"}</span><h2>{english ? <>Made for living,<br />not just sleeping.</> : <>Για να το ζεις,<br />όχι μόνο να κοιμάσαι.</>}</h2></div><GalleryGrid images={homeGallery} /><EditorialLink href={path("/the-house")}>{english ? "View the full gallery" : "Δείτε όλη τη συλλογή"}</EditorialLink></section>

    <section className="section pricing-section"><div><span className="eyebrow">{english ? "Seasonal rates" : "Εποχικές τιμές"}</span><h2>{english ? "Clear, simple pricing." : "Καθαρές, απλές τιμές."}</h2><p>{english ? "Nightly prices are indicative and confirmed with your availability request." : "Οι τιμές ανά διανυκτέρευση είναι ενδεικτικές και επιβεβαιώνονται μαζί με το αίτημα διαθεσιμότητας."}</p></div><div className="price-list">{seasonalPrices.map((season) => <div key={season.label}><span>{season.label}</span><strong>€{season.nightlyRate}</strong><small>{english ? "/ night" : "/ βράδυ"}</small></div>)}</div></section>

    <section className="destination-teaser"><ParallaxImage src="/images/property/polixenis-house-picture-19.jpg" alt="Mediterranean setting near Polixeni’s House" sizes="100vw" /><div><span className="eyebrow">Άγιος Νικόλαος</span><h2>{english ? <>Village calm,<br />Sithonia close.</> : <>Ηρεμία στο χωριό,<br />η Σιθωνία δίπλα.</>}</h2><EditorialLink href={path("/agios-nikolaos")} tone="light">{english ? "Discover the area" : "Ανακαλύψτε την περιοχή"}</EditorialLink></div></section>

    <TestimonialGrid />
  </main>;
}

