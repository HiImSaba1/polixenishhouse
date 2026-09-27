import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const environmentPath = join(process.cwd(), ".env.local");
const existing = existsSync(environmentPath) ? readFileSync(environmentPath, "utf8") : "";

function upsert(source, name, value, { overwrite = true } = {}) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  if (pattern.test(source)) return overwrite ? source.replace(pattern, `${name}=${value}`) : source;
  const separator = source.length && !source.endsWith("\n") ? "\n" : "";
  return `${source}${separator}${name}=${value}\n`;
}

let next = upsert(existing, "AUTH_SECRET", randomBytes(48).toString("base64url"));
next = upsert(next, "ADMIN_USERNAME", "", { overwrite: false });
next = upsert(next, "ADMIN_PASSWORD", "", { overwrite: false });

writeFileSync(environmentPath, next, { encoding: "utf8", mode: 0o600 });
process.stdout.write("Local authentication configuration updated. AUTH_SECRET was generated and was not printed.\n");
