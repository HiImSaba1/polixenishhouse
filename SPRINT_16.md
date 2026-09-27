# Sprint 16 — bilingual release and deployment readiness

## Implemented

- Greek is the default public language; English pages live under `/en`.
- The header includes a permanent `GR / ENG` pill immediately left of the menu button.
- The active language uses the dark background and light text treatment.
- Switching language preserves the equivalent current page.
- Shared localized page content lives outside Next.js route modules, keeping route exports valid.
- Header, footer, navigation, forms, booking feedback, privacy copy and testimonials are localized.
- Testimonials show six reviews per page with accessible pagination.
- Production smoke checks now cover the Greek default and English routes.
- Booking.com iCal remains optional in production preflight until the owner enables it.
- Type-checking regenerates production route types and excludes the concurrent development cache, preventing `.next/dev/types` and `.next/types` from conflicting.

## Owner verification

Run:

```powershell
npm run verify:sprint-16
```

Then, while `npm run dev` is running, verify `/`, `/en`, `/the-house`, `/en/the-house`, `/availability`, and `/en/availability` at desktop and mobile widths. Confirm that the language switcher preserves the current page and that testimonial pagination shows six cards on its first page.
