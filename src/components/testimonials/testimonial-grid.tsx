"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { guestTestimonials, property } from "@/data/site-content";

const pageSize = 6;

export function TestimonialGrid() {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(guestTestimonials.length / pageSize);
  const testimonials = guestTestimonials.slice(page * pageSize, (page + 1) * pageSize);
  const changePage = (nextPage: number) => {
    setPage(nextPage);
    document.querySelector("#reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return <section className="section testimonials" id="reviews" aria-labelledby="testimonials-title">
    <header className="testimonials__header"><div><span className="eyebrow">{english ? "Guest reviews" : "Κριτικές επισκεπτών"}</span><h2 id="testimonials-title">{english ? <>Words from<br />our guests.</> : <>Τα λόγια των<br />επισκεπτών μας.</>}</h2></div><div className="testimonials__score"><strong>{property.guestRatings.overall}</strong><span>/ 10</span><small>{property.guestRatings.reviewCount} {english ? "verified Booking.com reviews" : "επαληθευμένες κριτικές στη Booking.com"}</small></div></header>
    <div className="testimonials__grid">{testimonials.map((testimonial) => <figure key={`${testimonial.name}-${testimonial.country}`}><blockquote>“{english ? testimonial.text : testimonial.textEl}”</blockquote><figcaption><strong>{testimonial.name}</strong><span>{english ? testimonial.country : testimonial.countryEl}</span></figcaption></figure>)}</div>
    <nav className="testimonials__pagination" aria-label={english ? "Testimonials pages" : "Σελίδες κριτικών"}><button type="button" onClick={() => changePage(page - 1)} disabled={page === 0}>{english ? "Previous" : "Προηγούμενη"}</button><div>{Array.from({ length: pageCount }, (_, index) => <button type="button" key={index} aria-current={index === page ? "page" : undefined} aria-label={`${english ? "Page" : "Σελίδα"} ${index + 1}`} onClick={() => changePage(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div><button type="button" onClick={() => changePage(page + 1)} disabled={page === pageCount - 1}>{english ? "Next" : "Επόμενη"}</button></nav>
    <p className="testimonials__source">{english ? "Reviews are faithfully paraphrased from the property’s verified Booking.com guest feedback." : "Οι κριτικές αποδίδονται πιστά με παράφραση από τα επαληθευμένα σχόλια επισκεπτών στη Booking.com."}</p>
  </section>;
}
