import { loadEnvConfig } from "@next/env";
import { smtpConfiguration, smtpTransport } from "../src/lib/email/smtp";

loadEnvConfig(process.cwd());

async function main() {
  const configuration = smtpConfiguration();
  if (!configuration) throw new Error("SMTP configuration is incomplete.");
  const recipient = process.env.SMTP_TEST_TO_EMAIL || configuration.bookingToEmail;
  const transport = smtpTransport(configuration);
  await transport.verify();
  const result = await transport.sendMail({
    from: { name: configuration.fromName, address: configuration.fromEmail },
    to: recipient,
    subject: "Polixeni's House SMTP test",
    text: "SMTP transport verification succeeded. This is an owner-requested delivery test from Polixeni's House.",
  });
  process.stdout.write(`SMTP accepted test message: ${result.messageId}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "SMTP test failed."}\n`);
  process.exitCode = 1;
});
