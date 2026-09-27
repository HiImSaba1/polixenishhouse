"use server";

import { createHash, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { database } from "@/db/client";
import { externalCalendarEvents, seasonalRates } from "@/db/schema";
import { parseICalendar } from "@/features/calendar/ical";
import { requireAdminSession } from "./auth";

function finish(message: string, kind: "success" | "error" = "success"): never {
  revalidatePath("/admin");
  redirect(`/admin?${kind}=${encodeURIComponent(message)}`);
}

function calendarUrl() {
  const value = process.env.BOOKING_COM_ICAL_URL;
  if (!value) throw new Error("BOOKING_COM_ICAL_URL is not configured.");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("The Booking.com calendar URL must use HTTPS.");
  if (url.hostname !== "booking.com" && !url.hostname.endsWith(".booking.com")) throw new Error("The calendar URL must be hosted by Booking.com.");
  return url;
}

export async function syncBookingCalendarAction() {
  await requireAdminSession();
  let activeEventCount = 0;
  try {
    const response = await fetch(calendarUrl(), { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Booking.com calendar returned HTTP ${response.status}.`);
    const calendarText = await response.text();
    if (!calendarText.includes("BEGIN:VCALENDAR")) throw new Error("Booking.com did not return a valid iCalendar feed.");
    const events = parseICalendar(calendarText);
    activeEventCount = events.length;
    const syncedAt = new Date();

    await database().transaction(async (tx) => {
      const lockRow = await tx.select({ id: seasonalRates.id }).from(seasonalRates).limit(1).for("update");
      if (!lockRow.length) throw new Error("Seasonal rates must be configured before synchronizing calendars.");
      await tx.update(externalCalendarEvents).set({ active: false, lastSyncedAt: syncedAt }).where(eq(externalCalendarEvents.provider, "booking_com"));
      for (const event of events) {
        const externalUidHash = createHash("sha256").update(event.uid).digest("hex");
        await tx.insert(externalCalendarEvents).values({
          id: randomUUID(),
          provider: "booking_com",
          externalUidHash,
          startDate: event.startDate,
          endDate: event.endDate,
          active: true,
          lastSyncedAt: syncedAt,
        }).onDuplicateKeyUpdate({ set: {
          startDate: event.startDate,
          endDate: event.endDate,
          active: true,
          lastSyncedAt: syncedAt,
        } });
      }
    });
  } catch (error) {
    finish(error instanceof Error ? error.message : "Booking.com calendar synchronization failed.", "error");
  }
  finish(`Booking.com calendar synchronized: ${activeEventCount} active event(s).`);
}
