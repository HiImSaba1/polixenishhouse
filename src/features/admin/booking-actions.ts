"use server";

import { randomUUID } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { database } from "@/db/client";
import { bookingRequests, calendarEntries, externalCalendarEvents, seasonalRates } from "@/db/schema";
import { parseDateOnly } from "@/features/booking/domain";
import { requireAdminSession } from "./auth";

const idSchema = z.uuid();
const blockSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(500).optional().default(""),
});

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function finish(message: string, kind: "success" | "error" = "success"): never {
  revalidatePath("/admin");
  redirect(`/admin?${kind}=${encodeURIComponent(message)}`);
}

export async function confirmBookingAction(formData: FormData) {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formString(formData, "requestId"));
  if (!parsedId.success) finish("Invalid reservation request.", "error");

  try {
    await database().transaction(async (tx) => {
      const lockRow = await tx.select({ id: seasonalRates.id }).from(seasonalRates).limit(1).for("update");
      if (!lockRow.length) throw new Error("Seasonal rates must be configured before editing the calendar.");
      const requests = await tx.select().from(bookingRequests).where(eq(bookingRequests.id, parsedId.data)).limit(1).for("update");
      const request = requests[0];
      if (!request || request.status !== "pending") throw new Error("Only pending requests can be confirmed.");
      const conflicts = await tx.select({ id: calendarEntries.id }).from(calendarEntries).where(and(
        lt(calendarEntries.startDate, request.departureDate),
        gt(calendarEntries.endDate, request.arrivalDate),
      )).limit(1).for("update");
      const externalConflicts = await tx.select({ id: externalCalendarEvents.id }).from(externalCalendarEvents).where(and(
        eq(externalCalendarEvents.active, true),
        lt(externalCalendarEvents.startDate, request.departureDate),
        gt(externalCalendarEvents.endDate, request.arrivalDate),
      )).limit(1).for("update");
      if (conflicts.length || externalConflicts.length) throw new Error("Those dates are already reserved or blocked.");
      await tx.insert(calendarEntries).values({ id: randomUUID(), type: "reserved", startDate: request.arrivalDate, endDate: request.departureDate, bookingRequestId: request.id });
      await tx.update(bookingRequests).set({ status: "confirmed" }).where(eq(bookingRequests.id, request.id));
    });
  } catch (error) {
    finish(error instanceof Error ? error.message : "Confirmation failed.", "error");
  }
  finish("Reservation confirmed and dates reserved.");
}

export async function cancelBookingAction(formData: FormData) {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formString(formData, "requestId"));
  if (!parsedId.success) finish("Invalid reservation request.", "error");
  try {
    await database().transaction(async (tx) => {
      const lockRow = await tx.select({ id: seasonalRates.id }).from(seasonalRates).limit(1).for("update");
      if (!lockRow.length) throw new Error("Seasonal rates must be configured before editing the calendar.");
      const requests = await tx.select({ status: bookingRequests.status }).from(bookingRequests).where(eq(bookingRequests.id, parsedId.data)).limit(1).for("update");
      if (!requests[0] || !["pending", "confirmed"].includes(requests[0].status)) throw new Error("Only pending or confirmed requests can be cancelled.");
      await tx.delete(calendarEntries).where(eq(calendarEntries.bookingRequestId, parsedId.data));
      await tx.update(bookingRequests).set({ status: "cancelled" }).where(eq(bookingRequests.id, parsedId.data));
    });
  } catch (error) {
    finish(error instanceof Error ? error.message : "Cancellation failed.", "error");
  }
  finish("Reservation request cancelled and dates released.");
}

export async function completeBookingAction(formData: FormData) {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formString(formData, "requestId"));
  if (!parsedId.success) finish("Invalid reservation request.", "error");
  try {
    await database().transaction(async (tx) => {
      const requests = await tx.select({ status: bookingRequests.status }).from(bookingRequests).where(eq(bookingRequests.id, parsedId.data)).limit(1).for("update");
      if (requests[0]?.status !== "confirmed") throw new Error("Only confirmed reservations can be completed.");
      await tx.update(bookingRequests).set({ status: "completed" }).where(eq(bookingRequests.id, parsedId.data));
    });
  } catch (error) {
    finish(error instanceof Error ? error.message : "Completion failed.", "error");
  }
  finish("Reservation marked completed.");
}

export async function blockDatesAction(formData: FormData) {
  await requireAdminSession();
  const parsed = blockSchema.safeParse({ startDate: formString(formData, "startDate"), endDate: formString(formData, "endDate"), note: formString(formData, "note") });
  if (!parsed.success) finish("Enter valid block dates.", "error");
  try {
    if (parseDateOnly(parsed.data.endDate) <= parseDateOnly(parsed.data.startDate)) throw new Error("Block end must be after its start.");
    await database().transaction(async (tx) => {
      const lockRow = await tx.select({ id: seasonalRates.id }).from(seasonalRates).limit(1).for("update");
      if (!lockRow.length) throw new Error("Seasonal rates must be configured before editing the calendar.");
      const conflicts = await tx.select({ id: calendarEntries.id }).from(calendarEntries).where(and(
        lt(calendarEntries.startDate, parsed.data.endDate),
        gt(calendarEntries.endDate, parsed.data.startDate),
      )).limit(1).for("update");
      const externalConflicts = await tx.select({ id: externalCalendarEvents.id }).from(externalCalendarEvents).where(and(
        eq(externalCalendarEvents.active, true),
        lt(externalCalendarEvents.startDate, parsed.data.endDate),
        gt(externalCalendarEvents.endDate, parsed.data.startDate),
      )).limit(1).for("update");
      if (conflicts.length || externalConflicts.length) throw new Error("That range overlaps an existing reservation or block.");
      await tx.insert(calendarEntries).values({ id: randomUUID(), type: "blocked", startDate: parsed.data.startDate, endDate: parsed.data.endDate, note: parsed.data.note || null });
    });
  } catch (error) {
    finish(error instanceof Error ? error.message : "Date blocking failed.", "error");
  }
  finish("Dates blocked.");
}

export async function unblockDatesAction(formData: FormData) {
  await requireAdminSession();
  const parsedId = idSchema.safeParse(formString(formData, "entryId"));
  if (!parsedId.success) finish("Invalid calendar entry.", "error");
  await database().delete(calendarEntries).where(and(eq(calendarEntries.id, parsedId.data), eq(calendarEntries.type, "blocked")));
  finish("Date block removed.");
}
