import { describe, expect, it } from "vitest";
import { quoteStay, rangesOverlap } from "./domain";
import type { PricingRule } from "./types";

const rules: PricingRule[] = [
  { id: "june", label: "June", startDate: "2027-06-01", endDate: "2027-06-30", nightlyRateCents: 13500, minimumStay: 2, maximumGuests: 5 },
  { id: "july", label: "July", startDate: "2027-07-01", endDate: "2027-07-31", nightlyRateCents: 15500, minimumStay: 3, maximumGuests: 5 },
];

describe("booking domain", () => {
  it("treats departure as an exclusive boundary", () => {
    expect(rangesOverlap({ startDate: "2027-06-01", endDate: "2027-06-05" }, { startDate: "2027-06-05", endDate: "2027-06-08" })).toBe(false);
    expect(rangesOverlap({ startDate: "2027-06-01", endDate: "2027-06-06" }, { startDate: "2027-06-05", endDate: "2027-06-08" })).toBe(true);
  });

  it("prices every occupied night across seasonal boundaries", () => {
    expect(quoteStay({ startDate: "2027-06-29", endDate: "2027-07-03", guests: 4 }, rules)).toMatchObject({ nights: 4, totalCents: 58000 });
  });

  it("rejects missing prices, excessive guests and minimum-stay violations", () => {
    expect(() => quoteStay({ startDate: "2027-05-29", endDate: "2027-06-02", guests: 2 }, rules)).toThrow("No pricing rule");
    expect(() => quoteStay({ startDate: "2027-06-10", endDate: "2027-06-12", guests: 6 }, rules)).toThrow("Maximum guest count");
    expect(() => quoteStay({ startDate: "2027-07-10", endDate: "2027-07-12", guests: 2 }, rules)).toThrow("Minimum stay is 3 nights");
  });
});
