import { existsSync } from "node:fs";
import { join } from "node:path";

const environmentFile = join(process.cwd(), ".env.local");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

const origin = new URL(process.env.LOCAL_SITE_URL ?? "http://localhost:3000");
const testEmail = process.env.SMTP_TEST_TO_EMAIL;
if (!testEmail) throw new Error("SMTP_TEST_TO_EMAIL is required for the controlled booking test.");

const response = await fetch(new URL("/api/booking-requests", origin), {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: origin.origin },
  body: JSON.stringify({
    arrivalDate: "2027-05-20",
    departureDate: "2027-05-22",
    guests: 2,
    customerName: "Polixeni SMTP Test",
    customerEmail: testEmail,
    customerPhone: "",
    customerMessage: "Controlled Sprint 12 reservation and email delivery test. This pending request may be cancelled from the admin area after verification.",
    consent: true,
    website: "",
  }),
  signal: AbortSignal.timeout(45_000),
});

const body = await response.json();
const notificationsPassed = body.notification?.configured === true && body.notification?.ownerSent === true && body.notification?.guestSent === true;
if (response.status !== 201 || !body.requestId || !notificationsPassed) {
  process.stderr.write(`Booking flow failed: HTTP ${response.status}; saved=${Boolean(body.requestId)}; ownerMail=${Boolean(body.notification?.ownerSent)}; guestMail=${Boolean(body.notification?.guestSent)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write([
    "Controlled reservation request saved.",
    `Reference: ${String(body.requestId).slice(0, 8).toUpperCase()}`,
    `Nights: ${body.nights}`,
    `Indicative total: €${Number(body.totalCents) / 100}`,
    "Owner notification: accepted",
    "Guest acknowledgement: accepted",
    "Next: confirm inbox placement, then cancel the labelled pending request in /admin.",
  ].join("\n") + "\n");
}
