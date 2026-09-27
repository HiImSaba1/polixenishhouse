# Sprint 6 — Argiropoulos interaction system and MySQL foundation

## Implemented

- Ported the Argiropouloslaw fixed header and full-screen navigation structure.
- Ported the page-transition curtain and internal-link navigation behavior.
- Ported the reusable letter-hover animation as `useMenuLinkAnimation`.
- Ported the animated editorial button treatment.
- Ported the measured sticky curtain footer and adapted its content to Polixeni’s House.
- Rebuilt the About and Contact pages from the same editorial structures, using the accommodation content and imagery.
- Added the global GSAP heading and paragraph reveal choreography with reduced-motion support.
- Preserved Anton for English display text, Comfortaa for the future Greek locale, and Inter for body text.
- Replaced the earlier PostgreSQL setup with MySQL/MariaDB-compatible Drizzle schema and connection code.
- Configured Drizzle Kit to load Next.js environment files through `@next/env`.
- Kept local and production credentials outside tracked source through `DATABASE_URL`.

## Database boundary

The application expects one private server-side variable:

```text
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
```

For local development, the owner will create `.env.local` with the localhost database credentials. The same code will use the future Papaki database by changing only that environment value. No browser-facing code exposes the connection string.

The schema defines seasonal rates, reservation requests and calendar entries. Migration generation and application remain separate owner-run gates so the SQL can be reviewed before any database change.

After migration, `npm run db:verify` performs a read-only check for the three application tables, the Drizzle migration ledger and database constraints without printing credentials.

`npm run db:seed:season-2027` inserts the six source-derived 2027 seasonal rates only when `seasonal_rates` is empty. It uses a single transaction and refuses to overwrite existing records.

## Verification gate

After dependency installation completes, run:

```powershell
npm run verify:sprint-06
```

Do not run `db:migrate` until `db:generate` has produced a reviewed MySQL migration.
