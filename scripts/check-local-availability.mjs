const origin = new URL(process.env.LOCAL_SITE_URL ?? "http://localhost:3000");

const cases = [
  {
    name: "valid seeded stay",
    input: { arrivalDate: "2027-06-10", departureDate: "2027-06-14", guests: 2 },
    status: 200,
    verify: (body) => body.nights === 4 && body.totalCents === 54_000,
  },
  {
    name: "past arrival rejected",
    input: { arrivalDate: "2026-09-01", departureDate: "2026-09-04", guests: 2 },
    status: 422,
    verify: (body) => typeof body.message === "string" && body.message.toLowerCase().includes("today or later"),
  },
  {
    name: "out-of-season stay rejected",
    input: { arrivalDate: "2027-10-02", departureDate: "2027-10-05", guests: 2 },
    status: 422,
    verify: (body) => typeof body.message === "string" && body.message.toLowerCase().includes("published booking season"),
  },
];

let failed = false;
for (const testCase of cases) {
  try {
    const response = await fetch(new URL("/api/availability/quote", origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testCase.input),
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.json();
    const passed = response.status === testCase.status && testCase.verify(body);
    console.log(`${passed ? "PASS" : "FAIL"} - ${testCase.name}: HTTP ${response.status}`);
    if (!passed) failed = true;
  } catch (error) {
    failed = true;
    console.log(`FAIL - ${testCase.name}: ${error instanceof Error ? error.message : "request failed"}`);
  }
}

if (failed) process.exitCode = 1;
