# Papaki/Plesk deployment handoff

This project uses a Linux-built standalone Next.js archive. Keep the existing WordPress files and database available as rollback until the new site passes acceptance.

## Secrets

Create `.env.production.local` directly in the extracted application directory. Never commit or include it in an archive. It must contain:

```text
NEXT_PUBLIC_SITE_URL=https://polixenishouse.gr
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/next_polixenishouse
AUTH_SECRET=OWNER_GENERATED_VALUE_OF_AT_LEAST_32_CHARACTERS
ADMIN_PASSWORD_HASH=scrypt$OWNER_GENERATED_HASH
SMTP_HOST=OWNER_SMTP_HOST
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=OWNER_SMTP_USER
SMTP_PASSWORD=OWNER_SMTP_PASSWORD
SMTP_FROM_EMAIL=OWNER_VERIFIED_SENDER
SMTP_FROM_NAME=Polixeni's House
BOOKING_TO_EMAIL=OWNER_RESERVATION_INBOX
```

URL-encode reserved characters in database usernames and passwords.

## Owner-run gates

1. Create and verify recoverable backups of the current document root and production database.
2. Download the GitHub Actions artifact and verify its SHA-256 checksum.
3. Upload the `.tar.gz` over SSH into a new, separate application directory.
4. Validate the resolved extraction directory, then extract the archive there. Do not overwrite the WordPress rollback directory.
5. Create the untracked `.env.production.local` on the server with restrictive permissions.
6. Configure Plesk for Node.js 22, production mode and startup file `start.js`.
7. Run `node scripts/production-preflight.mjs` and stop if any check reports `ATTENTION`.
8. Confirm the production database is empty or has a reviewed restore point, then run `node .next/standalone/migrate-production.mjs` once.
9. Restart the Node application once.
10. Send one controlled SMTP test and confirm inbox delivery; provider acceptance alone is not proof of inbox placement.
11. Verify `/api/health/live` and `/api/health/ready` before testing public pages.
12. Run `node scripts/check-production-site.mjs` after the production hostname reaches this application.
13. Test one controlled reservation request, both notification emails and its admin confirmation before accepting launch.

The migration runner uses Drizzle’s migration ledger and is safe to rerun; already applied migrations are skipped. Do not import `wp_polixenishouse.sql` into the new database.

## Exact owner-run release sequence

The repository currently has no configured Git remote. From the local project directory, run the following only after `npm run verify:sprint-16` succeeds:

```powershell
git remote add origin https://github.com/HiImSaba1/polixenishhouse.git
git add .
git commit -m "Complete bilingual booking site and Papaki release"
git branch -M main
git push -u origin main
```

If `origin` already exists by then, replace the first command with:

```powershell
git remote set-url origin https://github.com/HiImSaba1/polixenishhouse.git
```

In GitHub, open **Actions → Build Papaki Linux release → Run workflow** on `main`. Download the `polixenishouse-papaki-linux-release` artifact and extract the downloaded GitHub ZIP locally. It contains the Linux-built tar archive and checksum.

Set these PowerShell values to the Plesk system user and the folder containing the extracted artifact:

```powershell
$SshUser = "PLESK_SYSTEM_USER"
$SshHost = "linux169.papaki.gr"
$ArtifactFolder = "C:\PATH\TO\EXTRACTED\polixenishouse-papaki-linux-release"

Get-FileHash "$ArtifactFolder\polixenishouse-papaki-next-build.tar.gz" -Algorithm SHA256
Get-Content "$ArtifactFolder\polixenishouse-papaki-next-build.tar.gz.sha256"

ssh "$SshUser@$SshHost" "mkdir -p /var/www/vhosts/polixenishouse.gr/nodeapp/incoming"
scp "$ArtifactFolder\polixenishouse-papaki-next-build.tar.gz" "$SshUser@${SshHost}:/var/www/vhosts/polixenishouse.gr/nodeapp/incoming/"
scp "$ArtifactFolder\polixenishouse-papaki-next-build.tar.gz.sha256" "$SshUser@${SshHost}:/var/www/vhosts/polixenishouse.gr/nodeapp/incoming/"
ssh "$SshUser@$SshHost"
```

After SSH connects, run the server-side gates one block at a time. The timestamp creates a new release directory instead of overwriting an existing deployment:

```bash
set -e
DOMAIN_ROOT=/var/www/vhosts/polixenishouse.gr
INCOMING="$DOMAIN_ROOT/nodeapp/incoming"
RELEASE_ID="$(date -u +%Y%m%d-%H%M%S)"
RELEASE_DIR="$DOMAIN_ROOT/nodeapp/releases/$RELEASE_ID"

cd "$INCOMING"
sha256sum -c polixenishouse-papaki-next-build.tar.gz.sha256
mkdir -p "$RELEASE_DIR"
tar -xzf polixenishouse-papaki-next-build.tar.gz -C "$RELEASE_DIR"
test -f "$RELEASE_DIR/start.js"
test -f "$RELEASE_DIR/.next/standalone/server.js"
echo "$RELEASE_DIR"
```

Create the production environment file inside the exact `RELEASE_DIR` printed above. Do not paste its values into chat or Git:

```bash
cd "$RELEASE_DIR"
nano .env.production.local
chmod 600 .env.production.local
node scripts/production-preflight.mjs
```

`booking_calendar` may show `OPTIONAL` while Booking.com iCal synchronization is intentionally disabled. Every required item must show `PASS`.

Apply the reviewed database migrations:

```bash
cd "$RELEASE_DIR"
node .next/standalone/migrate-production.mjs
```

In Plesk, configure the domain’s Node.js application with:

- Node.js version: **22**
- Application mode: **production**
- Application root: the exact release directory printed above
- Startup file: **start.js**

Restart the application once from Plesk. Then verify from the SSH session:

```bash
curl --fail --silent --show-error https://polixenishouse.gr/api/health/live
curl --fail --silent --show-error https://polixenishouse.gr/api/health/ready
cd "$RELEASE_DIR"
node scripts/check-production-site.mjs
```

Only after both health endpoints and the production smoke test pass should DNS or the public domain be treated as live. Keep the previous release directory and database backup until the reservation form, SMTP delivery, admin login, and one controlled confirmation have all been accepted.
