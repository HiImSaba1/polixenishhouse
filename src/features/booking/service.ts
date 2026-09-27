import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { database } from "@/db/client";
import { bookingRequests, calendarEntries, externalCalendarEvents, seasonalRates } from "@/db/schema";
import { quoteStay } from "./domain";
import type { BookingRequestInput, StayRequestInput } from "./validation";

export class UnavailableStayError extends Error {}
export class InvalidStayError extends Error {}

export async function quoteAvailableStay(input: StayRequestInput) {
  const today = new Date().toISOString().slice(0, 10);
  if (input.arrivalDate < today) throw new InvalidStayError("Check-in must be today or later.");
  const db = database();
  const rules = await db.select().from(seasonalRates);
  let quote;
  try {
    quote = quoteStay({ startDate: input.arrivalDate, endDate: input.departureDate, guests: input.guests }, rules);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The selected stay is not supported.";
    if (message.startsWith("No pricing rule")) throw new InvalidStayError("Those dates are outside the published booking season.");
    throw new InvalidStayError(message);
  }
  const [localConflicts, externalConflicts] = await Promise.all([
    db.select({ id: calendarEntries.id }).from(calendarEntries).where(and(
      lt(calendarEntries.startDate, input.departureDate),
      gt(calendarEntries.endDate, input.arrivalDate),
    )).limit(1),
    db.select({ id: externalCalendarEvents.id }).from(externalCalendarEvents).where(and(
      eq(externalCalendarEvents.active, true),
      lt(externalCalendarEvents.startDate, input.departureDate),
      gt(externalCalendarEvents.endDate, input.arrivalDate),
    )).limit(1),
  ]);
  if (localConflicts.length || externalConflicts.length) throw new UnavailableStayError("Those dates are not available.");
  return quote;
}

export async function createBookingRequest(input: BookingRequestInput) {
  const quote = await quoteAvailableStay(input);
  const id = randomUUID();
  await database().insert(bookingRequests).values({
    id,
    status: "pending",
    arrivalDate: input.arrivalDate,
    departureDate: input.departureDate,
    guestCount: input.guests,
    indicativeTotalCents: quote.totalCents,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone || null,
    customerMessage: input.customerMessage || null,
  });
  return { id, ...quote };
}
