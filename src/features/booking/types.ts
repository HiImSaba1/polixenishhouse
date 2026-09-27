export type DateRange = { startDate: string; endDate: string };
export type PricingRule = DateRange & {
  id: string;
  label: string;
  nightlyRateCents: number;
  minimumStay: number;
  maximumGuests: number;
};

export type PriceQuote = {
  nights: number;
  totalCents: number;
  nightlyBreakdown: Array<{ date: string; rateCents: number; ruleId: string }>;
};
