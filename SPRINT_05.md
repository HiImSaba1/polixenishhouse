# Sprint 05 — secure booking foundation

## Implemented

- MySQL/MariaDB Drizzle schema for seasonal rates, reservation requests, and blocked/reserved calendar ranges, matching local phpMyAdmin and Papaki/Plesk.
- Database constraints for valid dates, positive prices, guest limits, and reserved-entry ownership.
- Pure shared pricing and overlap domain with exclusive departure boundaries and cross-season calculation tests.
- Protected `/admin` session using an HTTP-only, SameSite strict, signed, eight-hour cookie.
- Scrypt password verification with constant-time comparison; no plaintext password storage.
- Server Actions for login and logout. No public administrator API exists.
- Owner-run password-hash, migration, and verification scripts.

## Deliberate gate

The public calculator remains indicative and does not claim database availability. The administration dashboard does not read or mutate database records until the owner has generated, reviewed, and applied the migration to a named database. Migration, seed, and live request wiring remain separate gates.
