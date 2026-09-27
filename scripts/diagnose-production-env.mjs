import { readFileSync } from "node:fs";
import { join } from "node:path";

const environmentPath = join(process.cwd(), ".env.production.local");
const source = readFileSync(environmentPath, "utf8").replace(/^\uFEFF/, "");
const definitions = source.split(/\r?\n/).filter((line) => line.startsWith("DATABASE_URL="));

function unquote(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function inspect(value) {
  const result = {
    present: value.length > 0,
    startsWithMysql: value.startsWith("mysql://"),
    containsLiteralHash: value.includes("#"),
    containsWhitespace: /\s/.test(value),
  };
  try {
    const url = new URL(value);
    return {
      ...result,
      parsed: true,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      usernamePresent: Boolean(url.username),
      database: decodeURIComponent(url.pathname.slice(1)),
    };
  } catch {
    return { ...result, parsed: false };
  }
}

const fileValue = unquote((definitions[0] ?? "").slice("DATABASE_URL=".length));
const inheritedValue = process.env.DATABASE_URL;

console.log({
  definitionCount: definitions.length,
  inheritedShellOverride: typeof inheritedValue === "string" && inheritedValue.length > 0,
  file: inspect(fileValue),
  inherited: inspect(inheritedValue ?? ""),
});
