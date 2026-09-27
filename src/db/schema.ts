import { sql } from "drizzle-orm";
import { boolean, check, date, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const seasonalRates = mysqlTable("seasonal_rates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  label: varchar("label", { length: 120 }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  nightlyRateCents: int("nightly_rate_cents").notNull(),
  minimumStay: int("minimum_stay").notNull().default(1),
  maximumGuests: int("maximum_guests").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("seasonal_rates_date_range_idx").on(table.startDate, table.endDate),
  check("seasonal_rates_valid_dates", sql`${table.endDate} >= ${table.startDate}`),
  check("seasonal_rates_positive_price", sql`${table.nightlyRateCents} > 0`),
  check("seasonal_rates_valid_minimum_stay", sql`${table.minimumStay} > 0`),
  check("seasonal_rates_valid_guest_limit", sql`${table.maximumGuests} > 0`),
]);

export const bookingRequests = mysqlTable("booking_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).notNull().default("pending"),
  arrivalDate: date("arrival_date", { mode: "string" }).notNull(),
  departureDate: date("departure_date", { mode: "string" }).notNull(),
  guestCount: int("guest_count").notNull(),
  indicativeTotalCents: int("indicative_total_cents").notNull(),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  customerEmail: varchar("customer_email", { length: 254 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 40 }),
  customerMessage: text("customer_message"),
  privateNotes: text("private_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("booking_requests_status_dates_idx").on(table.status, table.arrivalDate, table.departureDate),
  check("booking_requests_valid_dates", sql`${table.departureDate} > ${table.arrivalDate}`),
  check("booking_requests_valid_guests", sql`${table.guestCount} > 0`),
  check("booking_requests_nonnegative_total", sql`${table.indicativeTotalCents} >= 0`),
]);

export const calendarEntries = mysqlTable("calendar_entries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: mysqlEnum("type", ["blocked", "reserved"]).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  bookingRequestId: varchar("booking_request_id", { length: 36 }).references(() => bookingRequests.id, { onDelete: "cascade" }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("calendar_entries_booking_request_unique").on(table.bookingRequestId),
  index("calendar_entries_date_range_idx").on(table.startDate, table.endDate, table.type),
  check("calendar_entries_valid_dates", sql`${table.endDate} > ${table.startDate}`),
  check("calendar_entries_reserved_has_booking", sql`${table.type} = 'blocked' OR ${table.bookingRequestId} IS NOT NULL`),
]);

export const externalCalendarEvents = mysqlTable("external_calendar_events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  provider: mysqlEnum("provider", ["booking_com"]).notNull(),
  externalUidHash: varchar("external_uid_hash", { length: 64 }).notNull(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  active: boolean("active").notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("external_calendar_provider_uid_unique").on(table.provider, table.externalUidHash),
  index("external_calendar_active_dates_idx").on(table.active, table.startDate, table.endDate),
  check("external_calendar_valid_dates", sql`${table.endDate} > ${table.startDate}`),
]);

export type SeasonalRate = typeof seasonalRates.$inferSelect;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type CalendarEntry = typeof calendarEntries.$inferSelect;
export type ExternalCalendarEvent = typeof externalCalendarEvents.$inferSelect;
