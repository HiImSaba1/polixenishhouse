import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { database } from "@/db/client";
import { bookingRequests, calendarEntries, externalCalendarEvents, seasonalRates } from "@/db/schema";
import { logoutAction } from "@/features/admin/actions";
import { requireAdminSession } from "@/features/admin/auth";
import { blockDatesAction, cancelBookingAction, completeBookingAction, confirmBookingAction, unblockDatesAction } from "@/features/admin/booking-actions";
import { syncBookingCalendarAction } from "@/features/admin/external-calendar-actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdminSession();
  const query = await searchParams;
  const notice = typeof query.success === "string" ? { kind: "success", message: query.success } : typeof query.error === "string" ? { kind: "error", message: query.error } : null;
  const db = database();
  const [requests, entries, externalEntries, rates] = await Promise.all([
    db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt)),
    db.select().from(calendarEntries).orderBy(calendarEntries.startDate),
    db.select().from(externalCalendarEvents).where(eq(externalCalendarEvents.active, true)).orderBy(externalCalendarEvents.startDate),
    db.select().from(seasonalRates).orderBy(seasonalRates.startDate),
  ]);
  const money = new Intl.NumberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  return <main className="admin-shell"><header><div><span className="eyebrow">Private administration</span><h1>Booking overview</h1></div><form action={logoutAction}><button type="submit">Sign out</button></form></header>
    {notice ? <p className={`admin-notice admin-notice--${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>{notice.message}</p> : null}
    <section className="admin-summary" aria-label="Booking summary"><article><span>Website requests</span><strong>{requests.length}</strong></article><article><span>Local reserved / blocked</span><strong>{entries.length}</strong></article><article><span>Booking.com dates</span><strong>{externalEntries.length}</strong></article><article><span>Seasonal rates</span><strong>{rates.length}</strong></article></section>
    <section className="admin-panel"><header><div><span className="eyebrow">External calendar</span><h2>Booking.com reservations</h2></div><form action={syncBookingCalendarAction}><button type="submit" disabled={!process.env.BOOKING_COM_ICAL_URL}>Sync Booking.com</button></form></header>{process.env.BOOKING_COM_ICAL_URL ? <p className="admin-panel__hint">The private iCal feed supplies occupied date ranges. Booking.com guest identities and payment details are not included in this feed.</p> : <p className="admin-notice admin-notice--error">Add BOOKING_COM_ICAL_URL to the private environment file to enable synchronization.</p>}{externalEntries.length ? <div className="admin-calendar-list">{externalEntries.map((entry) => <article key={entry.id}><div><span className="admin-status admin-status--reserved">Booking.com</span><strong>{entry.startDate} → {entry.endDate}</strong><small>Reference {entry.externalUidHash.slice(0, 10).toUpperCase()} · synced {entry.lastSyncedAt.toLocaleString("en-GB")}</small></div></article>)}</div> : <p className="admin-panel__empty">No active Booking.com reservations have been synchronized.</p>}</section>
    <section className="admin-panel"><header><span className="eyebrow">Calendar</span><h2>Block unavailable dates</h2></header><form className="admin-block-form" action={blockDatesAction}><label><span>From</span><input name="startDate" type="date" required /></label><label><span>Until</span><input name="endDate" type="date" required /></label><label><span>Private note</span><input name="note" maxLength={500} /></label><button type="submit">Block dates</button></form>{entries.length ? <div className="admin-calendar-list">{entries.map((entry) => <article key={entry.id}><div><span className={`admin-status admin-status--${entry.type}`}>{entry.type}</span><strong>{entry.startDate} → {entry.endDate}</strong>{entry.note ? <small>{entry.note}</small> : null}</div>{entry.type === "blocked" ? <form action={unblockDatesAction}><input type="hidden" name="entryId" value={entry.id} /><button type="submit">Remove block</button></form> : null}</article>)}</div> : <p className="admin-panel__empty">No reservations or blocked dates.</p>}</section>
    <section className="admin-panel"><header><span className="eyebrow">Reservation requests</span><h2>Latest enquiries</h2></header>{requests.length ? <div className="admin-table-wrap"><table><thead><tr><th>Guest</th><th>Stay</th><th>Status</th><th>Total</th><th>Actions</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><strong>{request.customerName}</strong><small>{request.customerEmail}</small></td><td>{request.arrivalDate} → {request.departureDate}<small>{request.guestCount} guests</small></td><td><span className={`admin-status admin-status--${request.status}`}>{request.status}</span></td><td>{money.format(request.indicativeTotalCents / 100)}</td><td><div className="admin-actions">{request.status === "pending" ? <><form action={confirmBookingAction}><input type="hidden" name="requestId" value={request.id} /><button type="submit">Confirm</button></form><form action={cancelBookingAction}><input type="hidden" name="requestId" value={request.id} /><button type="submit">Cancel</button></form></> : null}{request.status === "confirmed" ? <><form action={completeBookingAction}><input type="hidden" name="requestId" value={request.id} /><button type="submit">Complete</button></form><form action={cancelBookingAction}><input type="hidden" name="requestId" value={request.id} /><button type="submit">Cancel</button></form></> : null}</div></td></tr>)}</tbody></table></div> : <p className="admin-panel__empty">No reservation requests yet.</p>}</section>
    <section className="admin-panel"><header><span className="eyebrow">Pricing</span><h2>2027 season</h2></header><div className="admin-rate-grid">{rates.map((rate) => <article key={rate.id}><span>{rate.label}</span><strong>{money.format(rate.nightlyRateCents / 100)}</strong><small>{rate.startDate} → {rate.endDate} · Min {rate.minimumStay} night</small></article>)}</div></section>
  </main>;
}
