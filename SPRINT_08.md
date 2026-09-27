# Sprint 8 — Admin calendar operations

## Implemented

- Authenticated confirmation of pending reservation requests.
- Atomic creation of the matching reserved calendar entry when a request is confirmed.
- Conflict checks before confirmations and manual date blocks.
- Transactional cancellation that releases dates and updates request status together.
- Confirmed-to-completed status transition while retaining the historical reserved range.
- Manual blocked-date creation and removal with optional private notes.
- Admin notices, calendar listing, request actions and responsive management layouts.
- Database indexes for rate, request and calendar date-range lookups.

## Concurrency boundary

Calendar writes lock the first seasonal-rate row inside the same MySQL transaction. This provides one shared, transaction-scoped serialization point for confirmation, cancellation and manual blocking. A competing admin write waits until the first transaction commits, then rechecks overlap before writing.

Pending public requests never block dates. Only authenticated confirmation creates a `reserved` calendar entry.

## Migration gate

The new indexes require a generated migration. Generate and review it before applying:

```powershell
npm run db:generate
```

After the reviewed migration is applied, verify with:

```powershell
npm run verify:sprint-08
```
