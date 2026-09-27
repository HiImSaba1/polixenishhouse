import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 14) {
  process.stderr.write("Pass a password of at least 14 characters as the only argument.\n");
  process.exitCode = 1;
} else {
  const salt = randomBytes(24).toString("base64url");
  const digest = scryptSync(password, salt, 64).toString("base64url");
  process.stdout.write(`scrypt$${salt}$${digest}\n`);
}
