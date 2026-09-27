# Sprint 7 — Live reservation requests

## Implemented

- Database-backed availability and price quotes using the seeded seasonal rules.
- Blocked and reserved date conflict checks using half-open stay ranges.
- Public reservation-request persistence with server-side Zod validation.
- Same-origin submission protection, payload limits, a honeypot field and consent validation.
- Pending requests do not reserve dates; only a later authenticated confirmation action will create a reserved calendar entry.
- The public availability and Contact pages now use the same live request form.
- The protected admin overview reads requests, calendar entries and seasonal rates directly from MySQL.
- Booking validation tests cover coercion, guest limits, consent and bot-field rejection.

## Legacy database discovery

The supplied `wp_polixenishouse.sql` is a full WordPress database dump and contains 47 VikBooking tables, including orders, busy ranges, order-room links, seasons and restrictions. It may permit recovery of historic or current booking data that the XML could not provide.

The dump is explicitly ignored by Git. No customer rows or credentials are printed or imported during this sprint. A separate audit must establish table relationships, statuses, timestamps, duplicates and future-date relevance before any reviewed migration into the new schema.

The completed aggregate audit found three confirmed historical bookings, with stays ranging from August 17, 2025 through August 14, 2026. All busy and room links are intact, and there are no current or future bookings as of September 27, 2026. Historical customer records are therefore not imported into the clean system.

## Verification

```powershell
npm run verify:sprint-07
```
