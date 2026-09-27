import { z } from "zod";
import { property } from "../../data/site-content";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.");

export const stayRequestSchema = z.object({
  arrivalDate: dateOnly,
  departureDate: dateOnly,
  guests: z.coerce.number().int().min(1).max(property.maximumGuests),
});

export const bookingRequestSchema = stayRequestSchema.extend({
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.email().max(254),
  customerPhone: z.string().trim().max(40).optional().default(""),
  customerMessage: z.string().trim().max(2_000).optional().default(""),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

export type StayRequestInput = z.infer<typeof stayRequestSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
