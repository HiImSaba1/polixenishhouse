import { existsSync } from "node:fs";
import { join } from "node:path";

const environmentFile = join(process.cwd(), ".env.production.local");
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile);

const checks = [];
const add = (name, ok, detail, required = true) => checks.push({ name, ok, detail, required });
const present = (name) => typeof process.env[name] === "string" && process.env[name].trim().length > 0;

const nodeMajor = Number(process.versions.node.split(".")[0]);
add("node_runtime", nodeMajor === 22, `Node ${process.versions.node}; production requires Node.js 22`);

let canonicalSafe = false;
try {
  const canonical = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  canonicalSafe = canonical.protocol === "https:" && canonical.hostname === "polixenishouse.gr";
} catch {}
add("canonical_url", canonicalSafe, canonicalSafe ? "Canonical HTTPS domain is configured" : "NEXT_PUBLIC_SITE_URL must be https://polixenishouse.gr");

let databaseSafe = false;
try {
  const database = new URL(process.env.DATABASE_URL ?? "");
  databaseSafe = database.protocol === "mysql:" && Boolean(database.hostname && database.username) && decodeURIComponent(database.pathname.slice(1)) === "next_polixenishouse";
} catch {}
add("database_configuration", databaseSafe, databaseSafe ? "MySQL URL targets next_polixenishouse" : "DATABASE_URL must be a valid MySQL URL targeting next_polixenishouse");
add("auth_secret", present("AUTH_SECRET") && process.env.AUTH_SECRET.length >= 32, "AUTH_SECRET must contain at least 32 characters");
add("admin_username", present("ADMIN_USERNAME"), "ADMIN_USERNAME must be configured");
add("admin_password", present("ADMIN_PASSWORD_HASH") && process.env.ADMIN_PASSWORD_HASH.startsWith("scrypt$"), "ADMIN_PASSWORD_HASH must be an owner-generated scrypt value");
const smtpPort = Number(process.env.SMTP_PORT || "465");
const smtpSafe = present("SMTP_HOST") && present("SMTP_USER") && present("SMTP_PASSWORD") && present("SMTP_FROM_EMAIL") && present("BOOKING_TO_EMAIL") && Number.isInteger(smtpPort) && smtpPort > 0 && smtpPort <= 65535;
add("booking_smtp", smtpSafe, smtpSafe ? "Booking SMTP configuration is present" : "SMTP host, user, password, sender, recipient and valid port are required");
let bookingCalendarSafe = false;
try {
  const bookingCalendar = new URL(process.env.BOOKING_COM_ICAL_URL ?? "");
  bookingCalendarSafe = bookingCalendar.protocol === "https:" && (bookingCalendar.hostname === "booking.com" || bookingCalendar.hostname.endsWith(".booking.com"));
} catch {}
add("booking_calendar", bookingCalendarSafe, bookingCalendarSafe ? "Booking.com iCal synchronization is configured" : "Optional: add the private Booking.com HTTPS calendar URL when synchronization is enabled", false);

console.log("Polixeni's House production preflight (secret values are never printed)");
for (const check of checks) console.log(`${check.ok ? "PASS" : check.required ? "ATTENTION" : "OPTIONAL"} - ${check.name}: ${check.detail}`);
if (checks.some((check) => check.required && !check.ok)) process.exitCode = 1;
