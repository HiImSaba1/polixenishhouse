# Sprint 9 — Linux release and Papaki handoff

## Implemented

- Next.js standalone output with single-CPU build configuration for constrained hosting.
- Standalone asset preparation for `.next/static`, public media and Drizzle migrations.
- Runtime migration entry point that loads only the server-local production environment.
- Plesk startup entry point for Node.js 22.
- Secret-safe production preflight covering canonical URL, MySQL target and admin authentication configuration.
- Liveness and database-readiness health endpoints.
- Production smoke checks for health and principal public routes.
- Manual GitHub Actions workflow that verifies, builds on Ubuntu, creates a Linux `.tar.gz`, generates SHA-256 and uploads both as a short-lived artifact.
- Deployment handoff with backup, extraction, migration, restart and acceptance kept as separate owner-run gates.

The workflow builds an artifact only. It does not connect to Papaki, upload files, migrate production or restart the application.
