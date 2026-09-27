# Sprint 15 — Property sections, testimonials and local admin setup

## Public property content

The House page now provides the complete visitor-facing section structure:

- Overview
- Apartment details and availability link
- Facilities
- Full gallery
- Guest reviews
- House rules
- Important information and licence
- Location link

Ten verified Booking.com reviews are represented as faithful paraphrases with their public reviewer name and country. Booking.com wording is not reproduced verbatim.

## Local admin authentication

Local development accepts:

```dotenv
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

Production continues to require `ADMIN_PASSWORD_HASH`; plaintext password fallback is deliberately disabled when `NODE_ENV=production`.

Run the safe local configurator once:

```powershell
npm run admin:configure-local
```

It replaces `AUTH_SECRET` with a cryptographically random value without printing it and adds missing blank admin fields without overwriting existing admin values. Then enter the desired local username and password directly in `.env.local` and restart the development server.

Verification:

```powershell
npm run verify:sprint-15
```
