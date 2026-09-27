# Sprint 14 — Unified booking administration

The private admin now separates and displays:

- reservation requests submitted through this website;
- confirmed website reservations and manual date blocks;
- active occupied ranges synchronized from Booking.com;
- seasonal price rules.

## Booking.com boundary

Synchronization uses the property's private Booking.com iCal export URL from `BOOKING_COM_ICAL_URL`. The URL is a credential-like secret and must remain only in `.env.local` or `.env.production.local`.

The iCal feed provides occupied date ranges and opaque event identifiers. It does not provide complete guest identities, contact details, payment records or message history. The application stores a SHA-256 hash of each external identifier and never displays or stores the private calendar URL.

Synchronization is explicit from `/admin`. Each successful sync updates current events and deactivates events no longer present in the feed. Booking.com ranges participate in public availability checks and prevent conflicting manual blocks or website confirmations.

## Owner-run gates

1. Export the property's calendar link from the Booking.com partner/extranet calendar page.
2. Add it privately to `.env.local`:

   ```dotenv
   BOOKING_COM_ICAL_URL=https://...
   ```

3. Apply and verify the schema:

   ```powershell
   npm run db:migrate
   npm run db:verify
   ```

4. Sign in to `/admin`, select **Sync Booking.com**, and compare the imported occupied ranges with the Booking.com extranet.
5. Run:

   ```powershell
   npm run verify:sprint-14
   ```

Do not paste the private calendar URL into chat, source control or `.env.example`.
