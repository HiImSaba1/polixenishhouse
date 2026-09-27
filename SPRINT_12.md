# Sprint 12 — SMTP and controlled booking delivery

## Implemented

- Direct SMTP transport verification and delivery test through `npm run smtp:test`.
- Full localhost booking-flow test through the real public API.
- The controlled test uses `SMTP_TEST_TO_EMAIL` as the guest address and never prints SMTP credentials.
- The test requires HTTP 201, a persisted request reference, owner-mail acceptance and guest-mail acceptance.
- The generated record is clearly labelled `Polixeni SMTP Test`, remains pending and does not reserve dates.

## Secret boundary

Move real SMTP settings out of `.env.example`. Store them only in the ignored `.env.local` for localhost and `.env.production.local` on Papaki. Do not paste secrets into chat, terminal output, Git, screenshots or verification artifacts.

Required local keys:

```text
SMTP_HOST=
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Polixeni's House
BOOKING_TO_EMAIL=
SMTP_TEST_TO_EMAIL=
```

## Owner-run gates

With the development server running:

1. `npm run smtp:test`
2. Confirm the direct test reaches the intended inbox.
3. `npm run booking:smoke`
4. Confirm both the owner notification and guest acknowledgement arrive.
5. Open `/admin` and cancel the clearly labelled pending test request.
6. `npm run verify:sprint-12`

SMTP acceptance is not inbox placement. Inbox verification remains a separate manual acceptance gate.
