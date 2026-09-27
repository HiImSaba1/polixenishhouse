import { describe, expect, it } from "vitest";
import { parseICalendar } from "./ical";

describe("iCalendar parser", () => {
  it("extracts all-day Booking.com date ranges", () => {
    const calendar = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:booking-123@example.invalid",
      "DTSTART;VALUE=DATE:20270710",
      "DTEND;VALUE=DATE:20270714",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    expect(parseICalendar(calendar)).toEqual([{
      uid: "booking-123@example.invalid",
      startDate: "2027-07-10",
      endDate: "2027-07-14",
    }]);
  });

  it("ignores cancelled and malformed events", () => {
    const calendar = [
      "BEGIN:VEVENT",
      "UID:cancelled",
      "DTSTART:20270710",
      "DTEND:20270712",
      "STATUS:CANCELLED",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:missing-end",
      "DTSTART:20270720",
      "END:VEVENT",
    ].join("\n");

    expect(parseICalendar(calendar)).toEqual([]);
  });
});
