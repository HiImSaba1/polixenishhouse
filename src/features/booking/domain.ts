import type { DateRange, PriceQuote, PricingRule } from "./types";

const DAY_MS = 86_400_000;

export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Dates must use YYYY-MM-DD.");
  const milliseconds = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  return milliseconds;
}

export function rangesOverlap(left: DateRange, right: DateRange) {
  const leftStart = parseDateOnly(left.startDate);
  const leftEnd = parseDateOnly(left.endDate);
  const rightStart = parseDateOnly(right.startDate);
  const rightEnd = parseDateOnly(right.endDate);
  return leftStart < rightEnd && rightStart < leftEnd;
}

export function quoteStay(input: DateRange & { guests: number }, rules: PricingRule[]): PriceQuote {
  const start = parseDateOnly(input.startDate);
  const end = parseDateOnly(input.endDate);
  if (end <= start) throw new Error("Departure must be after arrival.");
  if (!Number.isInteger(input.guests) || input.guests < 1) throw new Error("Guest count must be a positive whole number.");
  const nights = (end - start) / DAY_MS;
  if (!Number.isInteger(nights) || nights > 60) throw new Error("Stay length is not supported.");

  const nightlyBreakdown: PriceQuote["nightlyBreakdown"] = [];
  for (let time = start; time < end; time += DAY_MS) {
    const date = new Date(time).toISOString().slice(0, 10);
    const matches = rules.filter((rule) => date >= rule.startDate && date <= rule.endDate);
    if (matches.length !== 1) throw new Error(matches.length ? `Overlapping pricing rules for ${date}.` : `No pricing rule for ${date}.`);
    const rule = matches[0];
    if (input.guests > rule.maximumGuests) throw new Error(`Maximum guest count is ${rule.maximumGuests}.`);
    nightlyBreakdown.push({ date, rateCents: rule.nightlyRateCents, ruleId: rule.id });
  }

  const minimumStay = Math.max(...new Set(nightlyBreakdown.map((night) => rules.find((rule) => rule.id === night.ruleId)!.minimumStay)));
  if (nights < minimumStay) throw new Error(`Minimum stay is ${minimumStay} nights.`);
  return { nights, totalCents: nightlyBreakdown.reduce((total, night) => total + night.rateCents, 0), nightlyBreakdown };
}
