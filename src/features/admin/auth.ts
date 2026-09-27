import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "polixeni_admin";
const SESSION_SECONDS = 60 * 60 * 8;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeTextMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function verifyAdminCredentials(username: string, password: string) {
  const configuredUsername = process.env.ADMIN_USERNAME;
  if (!configuredUsername) throw new Error("ADMIN_USERNAME is not configured.");
  if (!safeTextMatch(username, configuredUsername)) return false;

  const configured = process.env.ADMIN_PASSWORD_HASH;
  if (!configured) {
    const localPassword = process.env.ADMIN_PASSWORD;
    if (process.env.NODE_ENV === "production" || !localPassword) throw new Error("ADMIN_PASSWORD_HASH is not configured.");
    return safeTextMatch(password, localPassword);
  }
  const [scheme, salt, expected] = configured.split("$");
  if (scheme !== "scrypt" || !salt || !expected) throw new Error("ADMIN_PASSWORD_HASH has an invalid format.");
  const actualBuffer = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "base64url");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `admin.${expires}`;
  const value = `${payload}.${signature(payload)}`;
  (await cookies()).set(COOKIE_NAME, value, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: SESSION_SECONDS });
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function hasAdminSession() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expires = Number(parts[1]);
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  const actual = Buffer.from(parts[2]);
  const expected = Buffer.from(signature(payload));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) redirect("/admin/login");
}
