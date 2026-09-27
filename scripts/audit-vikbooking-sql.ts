import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { auditVikBookingSql } from "../src/features/wordpress/vikbooking-sql-audit";

async function main() {
  const source = resolve("wp_polixenishouse.sql");
  const output = resolve("artifacts/wordpress/vikbooking-audit.json");
  const report = auditVikBookingSql(await readFile(source, "utf8"));
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write([
    `VikBooking orders: ${report.orders.total}`,
    `Future/current at audit: ${report.orders.futureOrCurrentAtAudit}`,
    `Order-busy link issues: ${report.linkage.orphanOrderBusyLinks}`,
    `Order-room link issues: ${report.linkage.orphanOrderRoomLinks}`,
    `Privacy-safe report: ${output}`,
  ].join("\n") + "\n");
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "VikBooking audit failed."}\n`);
  process.exitCode = 1;
});
