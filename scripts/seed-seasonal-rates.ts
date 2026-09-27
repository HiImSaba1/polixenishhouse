import { loadEnvConfig } from "@next/env";
import mysql, { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

loadEnvConfig(process.cwd());

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

const rates = [
  { id: "rate-2027-may-15-30", label: "May 15–30", startDate: "2027-05-15", endDate: "2027-05-30", nightlyRateCents: 11_000 },
  { id: "rate-2027-june", label: "June", startDate: "2027-06-01", endDate: "2027-06-30", nightlyRateCents: 13_500 },
  { id: "rate-2027-july", label: "July", startDate: "2027-07-01", endDate: "2027-07-31", nightlyRateCents: 15_500 },
  { id: "rate-2027-august", label: "August", startDate: "2027-08-01", endDate: "2027-08-31", nightlyRateCents: 17_500 },
  { id: "rate-2027-september-01-15", label: "September 1–15", startDate: "2027-09-01", endDate: "2027-09-15", nightlyRateCents: 13_500 },
  { id: "rate-2027-september-16-30", label: "September 16–30", startDate: "2027-09-16", endDate: "2027-09-30", nightlyRateCents: 12_000 },
] as const;

async function main() {
  const connection = await mysql.createConnection(databaseUrl());

  try {
    const [databaseRows] = await connection.query<RowDataPacket[]>("SELECT DATABASE() AS databaseName");
    const databaseName = databaseRows[0]?.databaseName as string | null | undefined;
    if (!databaseName) throw new Error("The connection does not select a database.");

    const [countRows] = await connection.query<RowDataPacket[]>("SELECT COUNT(*) AS rateCount FROM `seasonal_rates`");
    const existingRateCount = Number(countRows[0]?.rateCount ?? 0);
    if (existingRateCount !== 0) {
      throw new Error(`Seed stopped: seasonal_rates already contains ${existingRateCount} record(s).`);
    }

    await connection.beginTransaction();
    try {
      for (const rate of rates) {
        await connection.execute<ResultSetHeader>(
          "INSERT INTO `seasonal_rates` (`id`, `label`, `start_date`, `end_date`, `nightly_rate_cents`, `minimum_stay`, `maximum_guests`) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [rate.id, rate.label, rate.startDate, rate.endDate, rate.nightlyRateCents, 1, 5],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }

    process.stdout.write([
      `Seasonal rates seeded: ${databaseName}`,
      `Season: 2027`,
      `Rates inserted: ${rates.length}`,
      "Minimum stay: 1 night",
      "Maximum guests: 5",
    ].join("\n") + "\n");
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Seasonal-rate seed failed."}\n`);
  process.exitCode = 1;
});
