import { describe, expect, it } from "vitest";
import { bookingRequestSchema, stayRequestSchema } from "./validation";

describe("booking request validation", () => {
  it("accepts a valid stay and coerces the guest count", () => {
    expect(stayRequestSchema.parse({ arrivalDate: "2027-06-10", departureDate: "2027-06-14", guests: "4" })).toEqual({
      arrivalDate: "2027-06-10",
      departureDate: "2027-06-14",
      guests: 4,
    });
  });

  it("rejects excessive guests and malformed dates", () => {
    expect(stayRequestSchema.safeParse({ arrivalDate: "10/06/2027", departureDate: "2027-06-14", guests: 6 }).success).toBe(false);
  });

  it("requires consent and rejects the honeypot", () => {
    const base = { arrivalDate: "2027-06-10", departureDate: "2027-06-14", guests: 2, customerName: "Guest Name", customerEmail: "guest@example.com" };
    expect(bookingRequestSchema.safeParse({ ...base, consent: false, website: "" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...base, consent: true, website: "https://spam.invalid" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...base, consent: true, website: "" }).success).toBe(true);
  });
});
