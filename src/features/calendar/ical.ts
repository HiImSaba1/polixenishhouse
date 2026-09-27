export type CalendarEvent = {
  uid: string;
  startDate: string;
  endDate: string;
};

function unfoldCalendar(value: string) {
  return value.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function dateOnly(value: string | undefined) {
  if (!value) return null;
  const compact = value.trim().slice(0, 8);
  if (!/^\d{8}$/.test(compact)) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

export function parseICalendar(value: string): CalendarEvent[] {
  const lines = unfoldCalendar(value);
  const events: CalendarEvent[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current && current.STATUS !== "CANCELLED") {
        const uid = current.UID?.trim();
        const startDate = dateOnly(current.DTSTART);
        const endDate = dateOnly(current.DTEND);
        if (uid && startDate && endDate && endDate > startDate) events.push({ uid, startDate, endDate });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).split(";", 1)[0];
    current[key] = line.slice(separator + 1);
  }

  return events;
}
