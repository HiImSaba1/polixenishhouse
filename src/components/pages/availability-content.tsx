import { AvailabilityCalculator } from "@/components/availability/availability-calculator";
import { InnerPageHero } from "@/components/pages/inner-page-hero";
import { seasonalPrices } from "@/data/site-content";

export function AvailabilityContent({ english = false }: { english?: boolean }) {
  const steps = english ? [["01", "Choose dates", "Select arrival, departure and guests for an indicative total."], ["02", "Send a request", "Share your contact details and any questions for the host."], ["03", "Personal confirmation", "The host checks the calendar and confirms your reservation directly."]] : [["01", "Επιλέξτε ημερομηνίες", "Δηλώστε άφιξη, αναχώρηση και επισκέπτες για να δείτε το ενδεικτικό σύνολο."], ["02", "Στείλτε αίτημα", "Μοιραστείτε τα στοιχεία επικοινωνίας σας και όποια ερώτηση έχετε."], ["03", "Προσωπική επιβεβαίωση", "Η οικοδέσποινα ελέγχει το ημερολόγιο και επιβεβαιώνει απευθείας την κράτηση."]];
  return <main id="main-content" tabIndex={-1}><InnerPageHero eyebrow={english ? "Availability" : "Διαθεσιμότητα"} title={english ? "Choose your dates. We’ll confirm the rest." : "Επιλέξτε ημερομηνίες. Τα υπόλοιπα τα αναλαμβάνουμε εμείς."} image="/images/property/polixenis-house-picture-22.jpg" alt="Balcony at Polixeni’s House" intro={english ? "This first launch accepts reservation requests rather than instant payment. Your dates become reserved only after the host confirms them." : "Η ιστοσελίδα δέχεται αιτήματα κράτησης χωρίς άμεση πληρωμή. Οι ημερομηνίες δεσμεύονται μόνο μετά την επιβεβαίωση της οικοδέσποινας."} />
    <section className="section calculator-page"><div><span className="eyebrow">{english ? "Indicative quote" : "Ενδεικτική προσφορά"}</span><h2>{english ? "When would you like to stay?" : "Πότε θα θέλατε να μείνετε;"}</h2></div><AvailabilityCalculator /></section>
    <section className="section pricing-section"><div><span className="eyebrow">{english ? "Published season" : "Δημοσιευμένη περίοδος"}</span><h2>{english ? "Nightly rates." : "Τιμές ανά διανυκτέρευση."}</h2></div><div className="price-list">{seasonalPrices.map((season) => <div key={season.label}><span>{season.label}</span><strong>€{season.nightlyRate}</strong><small>{english ? "/ night" : "/ βράδυ"}</small></div>)}</div></section>
    <section className="section process-grid"><span className="eyebrow">{english ? "How it works" : "Πώς λειτουργεί"}</span><div>{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  </main>;
}

