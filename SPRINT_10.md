# Sprint 10 — Availability repair and SMTP notifications

## Implemented

- Unsupported seasons and past arrivals now return clear 422 validation responses instead of false server failures.
- Public date inputs prevent selecting arrivals before the current date.
- The legacy `ParallaxImage` effect now delegates to the stable shared `ParallaxMedia` implementation, removing the duplicated GSAP/ScrollTrigger lifecycle that caused browser errors.
- Reservation requests remain database-first: a successfully stored request is never lost because SMTP delivery fails.
- Owner notification and guest acknowledgement emails are attempted independently.
- Email content uses fixed subjects, sanitised header values, escaped HTML, and Nodemailer file/URL access restrictions.
- Added an owner-run SMTP verification and delivery-test command.
- Production preflight now requires complete SMTP settings.

## Verification gates

Run the static/build gate first:

```powershell
npm run verify:sprint-10
```

After adding real SMTP settings only to the untracked `.env.local`, run:

```powershell
npm run smtp:test
```

SMTP acceptance is not inbox placement. Confirm the test message arrives in the intended mailbox before testing a controlled reservation request.
