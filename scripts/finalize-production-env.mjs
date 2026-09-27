import { randomBytes, scryptSync } from "node:crypto";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const environmentPath = join(process.cwd(), ".env.production.local");
if (!existsSync(environmentPath)) throw new Error(".env.production.local does not exist.");

const databasePassword = process.env.PRODUCTION_DB_PASSWORD;
if (!databasePassword) throw new Error("PRODUCTION_DB_PASSWORD was not supplied to this process.");

let source = readFileSync(environmentPath, "utf8").replace(/^\uFEFF/, "");

function valueOf(name) {
  const match = source.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (!match) return "";
  const value = match[1].trim();
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1);
  }
  return value;
}

function upsert(name, value) {
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  source = pattern.test(source) ? source.replace(pattern, line) : `${source.trimEnd()}\n${line}\n`;
}

const adminPassword = process.env.PRODUCTION_ADMIN_PASSWORD || valueOf("ADMIN_PASSWORD") || "";
if (adminPassword.length < 14) throw new Error("ADMIN_PASSWORD must contain at least 14 characters before finalization.");

const salt = randomBytes(24).toString("base64url");
const digest = scryptSync(adminPassword, salt, 64).toString("base64url");
const databaseUrl = `mysql://next-polixenishouse:${encodeURIComponent(databasePassword)}@localhost:3306/next_polixenishouse`;

upsert("DATABASE_URL", databaseUrl);
upsert("NEXT_PUBLIC_SITE_URL", "https://polixenishouse.gr");
upsert("ADMIN_PASSWORD", "");
upsert("ADMIN_PASSWORD_HASH", `scrypt$${salt}$${digest}`);
if (!source.match(/^BOOKING_COM_ICAL_URL=/m)) upsert("BOOKING_COM_ICAL_URL", "");

writeFileSync(environmentPath, source, { encoding: "utf8", mode: 0o600 });
chmodSync(environmentPath, 0o600);
process.stdout.write("Production environment finalized. Secrets were not printed.\n");
