# Sprint 11 — Availability runtime verification

## Implemented

- Added a non-destructive localhost smoke test for the live availability endpoint.
- Confirms the seeded June 2027 rate calculation: four nights at €135 equals €540.
- Confirms a past arrival is rejected with HTTP 422 and a clear message.
- Confirms dates outside the published season are rejected with HTTP 422 rather than being logged as an infrastructure failure.
- The smoke test only requests quotes. It does not create customers, reservation requests, blocks or calendar entries.

## Owner-run gate

Keep the verified development server running, then use a second PowerShell window:

```powershell
npm run availability:smoke
```

After the runtime smoke passes, run the complete sprint gate:

```powershell
npm run verify:sprint-11
```
