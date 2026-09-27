"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { property } from "@/data/site-content";

type Quote = { nights: number; totalCents: number };
type Result = { kind: "success" | "error"; message: string };

function localizedError(message: string, english: boolean) {
  if (english) return message;
  if (message.includes("today or later")) return "Η ημερομηνία άφιξης πρέπει να είναι από σήμερα και μετά.";
  if (message.includes("outside") && message.includes("season")) return "Οι ημερομηνίες είναι εκτός της διαθέσιμης περιόδου.";
  if (message.includes("not available") || message.includes("overlap")) return "Οι συγκεκριμένες ημερομηνίες δεν είναι διαθέσιμες.";
  if (message.includes("Maximum guest")) return `Ο μέγιστος αριθμός επισκεπτών είναι ${property.maximumGuests}.`;
  if (message.includes("Minimum stay")) return "Δεν καλύπτεται η ελάχιστη διάρκεια διαμονής για αυτές τις ημερομηνίες.";
  return "Το αίτημα δεν μπόρεσε να ολοκληρωθεί. Παρακαλούμε δοκιμάστε ξανά.";
}

export function AvailabilityCalculator() {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const today = new Date().toISOString().slice(0, 10);
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, setPending] = useState(false);

  function updateStay(update: () => void) {
    update();
    setQuote(null);
    setResult(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setResult(null);
    const form = new FormData(formElement);

    try {
      const body = quote ? {
        arrivalDate,
        departureDate,
        guests: Number(guests),
        customerName: form.get("customerName"),
        customerEmail: form.get("customerEmail"),
        customerPhone: form.get("customerPhone"),
        customerMessage: form.get("customerMessage"),
        consent: form.get("consent") === "on",
        website: form.get("website"),
      } : { arrivalDate, departureDate, guests: Number(guests) };
      const response = await fetch(quote ? "/api/booking-requests" : "/api/availability/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json() as { message?: string; nights?: number; totalCents?: number; requestId?: string };
      if (!response.ok) throw new Error(payload.message || "The request could not be completed.");

      if (!quote && typeof payload.nights === "number" && typeof payload.totalCents === "number") {
        setQuote({ nights: payload.nights, totalCents: payload.totalCents });
        return;
      }

      const reference = payload.requestId ? payload.requestId.slice(0, 8).toUpperCase() : "";
      setResult({
        kind: "success",
        message: english
          ? `Your request has been saved${reference ? ` · Reference ${reference}` : ""}. The dates are not reserved until the host confirms them.`
          : `Το αίτημά σας αποθηκεύτηκε${reference ? ` · Κωδικός ${reference}` : ""}. Οι ημερομηνίες δεσμεύονται μόνο μετά την επιβεβαίωση της οικοδέσποινας.`,
      });
      formElement.reset();
      setArrivalDate("");
      setDepartureDate("");
      setGuests("2");
      setQuote(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The request could not be completed.";
      setResult({ kind: "error", message: localizedError(message, english) });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="availability-card" onSubmit={submit} noValidate>
      <div className="availability-card__fields">
        <label><span>{english ? "Check in" : "Άφιξη"}</span><input name="arrivalDate" type="date" required min={today} value={arrivalDate} onChange={(event) => updateStay(() => setArrivalDate(event.target.value))} /></label>
        <label><span>{english ? "Check out" : "Αναχώρηση"}</span><input name="departureDate" type="date" required value={departureDate} min={arrivalDate || today} onChange={(event) => updateStay(() => setDepartureDate(event.target.value))} /></label>
        <label><span>{english ? "Guests" : "Επισκέπτες"}</span><select name="guests" value={guests} onChange={(event) => updateStay(() => setGuests(event.target.value))}>{Array.from({ length: property.maximumGuests }, (_, index) => index + 1).map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <div className="availability-card__result" aria-live="polite">
        <span>{quote ? `${quote.nights} ${english ? (quote.nights === 1 ? "night" : "nights") : (quote.nights === 1 ? "βράδυ" : "βράδια")} · ${guests} ${english ? "guests" : "επισκέπτες"}` : (english ? "Indicative total" : "Ενδεικτικό σύνολο")}</span>
        <strong>{quote ? new Intl.NumberFormat(english ? "en" : "el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(quote.totalCents / 100) : (english ? "Select your dates" : "Επιλέξτε ημερομηνίες")}</strong>
      </div>
      {quote ? <div className="availability-card__request">
        <label><span>{english ? "Name" : "Ονοματεπώνυμο"}</span><input name="customerName" autoComplete="name" minLength={2} maxLength={160} required /></label>
        <label><span>Email</span><input name="customerEmail" type="email" autoComplete="email" maxLength={254} required /></label>
        <label><span>{english ? "Telephone" : "Τηλέφωνο"}</span><input name="customerPhone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label className="availability-card__message"><span>{english ? "Message" : "Μήνυμα"}</span><textarea name="customerMessage" rows={4} maxLength={2000} /></label>
        <label className="availability-card__consent"><input name="consent" type="checkbox" required /><span>{english ? "I have read the" : "Έχω διαβάσει την"} <Link href={english ? "/en/privacy" : "/privacy"}>{english ? "privacy policy" : "πολιτική απορρήτου"}</Link> {english ? "and agree to send this reservation request." : "και συμφωνώ με την αποστολή του αιτήματος κράτησης."}</span></label>
        <label className="availability-card__honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div> : null}
      <button className="availability-card__submit" type="submit" disabled={pending || !arrivalDate || !departureDate}>{pending ? (english ? "Please wait…" : "Παρακαλώ περιμένετε…") : quote ? (english ? "Send reservation request" : "Αποστολή αιτήματος κράτησης") : (english ? "Check price & availability" : "Έλεγχος τιμής και διαθεσιμότητας")}</button>
      {result ? <p className={`availability-card__status availability-card__status--${result.kind}`} role={result.kind === "error" ? "alert" : "status"}>{result.message}</p> : null}
      <p>{english ? "Indicative price only. Submitting a request does not reserve the dates; the host confirms every stay personally." : "Η τιμή είναι ενδεικτική. Η αποστολή αιτήματος δεν δεσμεύει τις ημερομηνίες· η κράτηση επιβεβαιώνεται προσωπικά από την οικοδέσποινα."}</p>
    </form>
  );
}
