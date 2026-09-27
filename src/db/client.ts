import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let pool: mysql.Pool | undefined;

export function database() {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not configured.");
  pool ??= mysql.createPool({ uri, connectionLimit: 5, enableKeepAlive: true });
  return drizzle({ client: pool, schema, mode: "default" });
}
