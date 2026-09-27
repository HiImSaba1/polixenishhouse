type SqlScalar = string | number | null;
type SqlRow = Record<string, SqlScalar>;

const auditedSuffixes = [
  "vikbooking_orders",
  "vikbooking_busy",
  "vikbooking_ordersbusy",
  "vikbooking_ordersrooms",
  "vikbooking_rooms",
  "vikbooking_seasons",
  "vikbooking_restrictions",
] as const;

function parseScalar(raw: string): SqlScalar {
  const value = raw.trim();
  if (/^null$/i.test(value)) return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'").replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  }
  return value;
}

function parseTuples(values: string) {
  const rows: SqlScalar[][] = [];
  let row: SqlScalar[] | null = null;
  let token = "";
  let quoted = false;
  let escaped = false;
  let depth = 0;

  for (const character of values) {
    if (escaped) {
      token += character;
      escaped = false;
      continue;
    }
    if (quoted && character === "\\") {
      token += character;
      escaped = true;
      continue;
    }
    if (character === "'") {
      quoted = !quoted;
      token += character;
      continue;
    }
    if (quoted) {
      token += character;
      continue;
    }
    if (character === "(") {
      depth += 1;
      if (depth === 1) {
        row = [];
        token = "";
        continue;
      }
    }
    if (character === ")") {
      if (depth === 1 && row) {
        row.push(parseScalar(token));
        rows.push(row);
        row = null;
        token = "";
        depth = 0;
        continue;
      }
      depth -= 1;
    }
    if (character === "," && depth === 1 && row) {
      row.push(parseScalar(token));
      token = "";
      continue;
    }
    if (depth >= 1) token += character;
  }
  return rows;
}

function findStatementEnd(sql: string, start: number) {
  let quoted = false;
  let escaped = false;
  for (let index = start; index < sql.length; index += 1) {
    const character = sql[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quoted && character === "\\") {
      escaped = true;
      continue;
    }
    if (character === "'") quoted = !quoted;
    if (!quoted && character === ";") return index;
  }
  return -1;
}

function rowsForTable(sql: string, tableSuffix: string): SqlRow[] {
  const rows: SqlRow[] = [];
  const pattern = new RegExp("INSERT INTO `([^`]*" + tableSuffix + ")`\\s*\\(([^)]*)\\)\\s*VALUES", "g");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sql))) {
    const columns = Array.from(match[2].matchAll(/`([^`]+)`/g), (column) => column[1]);
    const end = findStatementEnd(sql, pattern.lastIndex);
    if (end < 0) throw new Error(`Unterminated INSERT statement for ${tableSuffix}.`);
    for (const values of parseTuples(sql.slice(pattern.lastIndex, end))) {
      if (values.length !== columns.length) throw new Error(`Column mismatch while reading ${tableSuffix}.`);
      rows.push(Object.fromEntries(columns.map((column, index) => [column, values[index]])));
    }
    pattern.lastIndex = end + 1;
  }
  return rows;
}

function unixDate(value: SqlScalar) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString().slice(0, 10);
}

export function auditVikBookingSql(sql: string, nowUnix = Math.floor(Date.now() / 1000)) {
  const data = Object.fromEntries(auditedSuffixes.map((suffix) => [suffix, rowsForTable(sql, suffix)])) as Record<(typeof auditedSuffixes)[number], SqlRow[]>;
  const orders = data.vikbooking_orders;
  const busy = data.vikbooking_busy;
  const orderBusy = data.vikbooking_ordersbusy;
  const orderRooms = data.vikbooking_ordersrooms;
  const statuses = orders.reduce<Record<string, number>>((counts, row) => {
    const status = typeof row.status === "string" && row.status ? row.status : "unknown";
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {});
  const futureOrders = orders.filter((row) => typeof row.checkout === "number" && row.checkout >= nowUnix).length;
  const orderIds = new Set(orders.map((row) => row.id).filter((id): id is number => typeof id === "number"));
  const busyIds = new Set(busy.map((row) => row.id).filter((id): id is number => typeof id === "number"));
  const orphanOrderBusyLinks = orderBusy.filter((row) => !orderIds.has(Number(row.idorder)) || !busyIds.has(Number(row.idbusy))).length;
  const orphanOrderRoomLinks = orderRooms.filter((row) => !orderIds.has(Number(row.idorder))).length;
  const checkins = orders.map((row) => unixDate(row.checkin)).filter((date): date is string => Boolean(date)).sort();
  const checkouts = orders.map((row) => unixDate(row.checkout)).filter((date): date is string => Boolean(date)).sort();

  return {
    generatedAt: new Date(nowUnix * 1000).toISOString(),
    privacy: "Aggregate metadata only; customer and payment fields are excluded.",
    tables: Object.fromEntries(auditedSuffixes.map((suffix) => [suffix, data[suffix].length])),
    orders: {
      total: orders.length,
      statuses,
      futureOrCurrentAtAudit: futureOrders,
      earliestCheckin: checkins.at(0) ?? null,
      latestCheckout: checkouts.at(-1) ?? null,
    },
    linkage: { orphanOrderBusyLinks, orphanOrderRoomLinks },
  };
}
