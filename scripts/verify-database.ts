import { loadEnvConfig } from "@next/env";
import mysql, { type RowDataPacket } from "mysql2/promise";

loadEnvConfig(process.cwd());

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is not configured.");
  return value;
}

const expectedTables = [
  "__drizzle_migrations",
  "booking_requests",
  "calendar_entries",
  "external_calendar_events",
  "seasonal_rates",
] as const;

async function main() {
  const connection = await mysql.createConnection(databaseUrl());

  try {
    const [databaseRows] = await connection.query<RowDataPacket[]>("SELECT DATABASE() AS databaseName");
    const databaseName = databaseRows[0]?.databaseName as string | null | undefined;
    if (!databaseName) throw new Error("The connection does not select a database.");

    const [tableRows] = await connection.execute<RowDataPacket[]>(
      "SELECT TABLE_NAME AS tableName FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
      [databaseName],
    );
    const tables = new Set(tableRows.map((row) => String(row.tableName)));
    const missing = expectedTables.filter((table) => !tables.has(table));
    if (missing.length) throw new Error(`Missing database tables: ${missing.join(", ")}`);

    const [migrationRows] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS migrationCount FROM `__drizzle_migrations`",
    );
    const migrationCount = Number(migrationRows[0]?.migrationCount ?? 0);
    if (migrationCount < 4) throw new Error(`Expected at least 4 applied migrations, found ${migrationCount}.`);

  const expectedIndexes = [
    "booking_requests_status_dates_idx",
    "calendar_entries_date_range_idx",
    "external_calendar_active_dates_idx",
    "seasonal_rates_date_range_idx",
  ];
  const [indexRows] = await connection.execute<RowDataPacket[]>(
    "SELECT DISTINCT INDEX_NAME AS indexName FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND INDEX_NAME IN (?, ?, ?, ?)",
    [databaseName, ...expectedIndexes],
  );
  const indexes = new Set(indexRows.map((row) => String(row.indexName)));
  const missingIndexes = expectedIndexes.filter((indexName) => !indexes.has(indexName));
  if (missingIndexes.length) throw new Error(`Missing database indexes: ${missingIndexes.join(", ")}`);

    const [constraintRows] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS constraintCount FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME IN ('booking_requests', 'calendar_entries', 'external_calendar_events', 'seasonal_rates')",
      [databaseName],
    );

    const [rateRows] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS incorrectGuestLimits FROM `seasonal_rates` WHERE `maximum_guests` <> 5",
    );
    const incorrectGuestLimits = Number(rateRows[0]?.incorrectGuestLimits ?? 0);
    if (incorrectGuestLimits) throw new Error(`${incorrectGuestLimits} seasonal rate(s) do not use the verified five-guest capacity.`);

    process.stdout.write([
      `Database schema verified: ${databaseName}`,
      `Application tables: ${expectedTables.length - 1}`,
      `Applied migrations: ${migrationCount}`,
      `Required indexes: ${indexes.size}`,
      "Maximum guests: 5",
      `Table constraints: ${Number(constraintRows[0]?.constraintCount ?? 0)}`,
    ].join("\n") + "\n");
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Database verification failed."}\n`);
  process.exitCode = 1;
});
