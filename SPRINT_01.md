# Sprint 01 — foundation and WordPress extraction

## Included

- Correct runtime and verification dependency declarations.
- Targeted Nodemailer 10 security override, including NextAuth's transitive copy; the unrelated Drizzle Kit development advisory is not force-fixed because npm proposes a breaking downgrade to `0.18.1`.
- Deterministic WXR extraction for pages, clean text, VikBooking shortcode evidence, seasonal prices, and media metadata.
- Repeatable extraction preserves approvals only when both the WordPress record ID and source URL still match the reviewed manifest.
- Review-first media manifest; every candidate starts unapproved.
- Bounded downloader that accepts only HTTPS assets from `polixenishouse.gr`, rejects destinations outside `public/images`, validates images with Sharp, and reports content hashes and duplicates.
- Canonical gallery manifest containing 30 unique property images. WordPress records `5834` and `5835` duplicate records `5827` and `5828` byte-for-byte and are excluded from the local gallery.
- Typed, presentation-independent property facts and seasonal pricing.
- Local Comfortaa + Inter wiring and the approved base colour tokens.
- Sprint verification scripts and extraction tests.

## Explicit boundary

The WordPress export contains VikBooking shortcodes, not VikBooking database tables. Sprint 01 does not infer or manufacture reservations, unavailable dates, or booking history.

## Owner-run gates

Run each gate separately and inspect its output before continuing.

1. Restore the two approved local font files from the Argiropouloslaw project.
2. Reconcile dependencies and regenerate `package-lock.json`.
3. Generate and inspect `artifacts/wordpress/media-manifest.json`.
4. Change `approved` to `true` only for confirmed genuine property photographs.
5. Download approved media with `npm run wordpress:media:download:approved`, then inspect `download-report.json` for duplicates, dimensions, formats, and hashes. The shorter `wordpress:media:download` command intentionally remains guarded and cannot perform network writes.
6. Run the Sprint 01 verifier.

The exact PowerShell commands are provided in the Sprint handoff response; they are intentionally not executed by the implementation agent.
